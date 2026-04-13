import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { store, generateId } from "@/lib/fake-data/db";
import {
  parseToken,
  isValidNickname,
  verifyPassword,
  hashPassword,
  isValidPassword,
} from "@/lib/utils/auth";

const updateSchema = z.object({
  nickname: z.string().min(3).max(30).optional(),
  banner_url: z.string().optional(),
  current_password: z.string().optional(),
  new_password: z.string().optional(),
  regenerate_avatar: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const session = token ? parseToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const profile = store.profiles.find((p) => p.user_id === session.user_id);
  if (!profile) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const user = store.users.find((u) => u.id === session.user_id);

  return NextResponse.json({
    ...profile,
    email: user?.email,
    phone: user?.phone,
  });
}

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const session = token ? parseToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const profile = store.profiles.find((p) => p.user_id === session.user_id);
  if (!profile) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;

  if (data.nickname && data.nickname !== profile.nickname) {
    if (!isValidNickname(data.nickname)) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "昵称只能包含字母、数字、下划线、连字符和句点，长度3-30",
        },
        { status: 422 }
      );
    }

    const taken = store.profiles.some(
      (p) =>
        p.user_id !== session.user_id &&
        p.nickname.toLowerCase() === data.nickname!.toLowerCase()
    );
    if (taken) {
      return NextResponse.json(
        { error: "NICKNAME_TAKEN", message: "该昵称已被使用" },
        { status: 409 }
      );
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const recentChanges = store.nickname_histories.filter(
      (h) => h.user_id === session.user_id && h.changed_at > thirtyDaysAgo
    );
    if (recentChanges.length >= 3) {
      return NextResponse.json(
        { error: "TOO_MANY_REQUESTS", message: "昵称每30天最多修改3次" },
        { status: 429 }
      );
    }

    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString();
    const reused = store.nickname_histories.some(
      (h) =>
        h.new_nickname.toLowerCase() === data.nickname!.toLowerCase() &&
        h.changed_at > ninetyDaysAgo
    );
    if (reused) {
      return NextResponse.json(
        { error: "NICKNAME_TAKEN", message: "该昵称在90天内被使用过，暂不可用" },
        { status: 409 }
      );
    }

    store.nickname_histories.push({
      id: generateId("nh"),
      user_id: session.user_id,
      old_nickname: profile.nickname,
      new_nickname: data.nickname,
      changed_at: new Date().toISOString(),
    });

    profile.nickname = data.nickname;
  }

  if (data.banner_url !== undefined) {
    profile.banner_url = data.banner_url;
  }

  if (data.regenerate_avatar) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const recentRegens = store.avatar_regen_logs.filter(
      (l) => l.user_id === session.user_id && l.regenerated_at > thirtyDaysAgo
    );
    if (recentRegens.length >= 3) {
      return NextResponse.json(
        { error: "TOO_MANY_REQUESTS", message: "头像每30天最多重新生成3次" },
        { status: 429 }
      );
    }

    const seed = Math.random().toString(36).slice(2, 10);
    profile.avatar_url = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;

    store.avatar_regen_logs.push({
      id: generateId("ar"),
      user_id: session.user_id,
      regenerated_at: new Date().toISOString(),
    });
  }

  if (data.new_password) {
    if (!data.current_password) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "请输入当前密码" },
        { status: 422 }
      );
    }

    const user = store.users.find((u) => u.id === session.user_id);
    if (!user || !verifyPassword(data.current_password, user.password_hash)) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "当前密码不正确" },
        { status: 422 }
      );
    }

    if (!isValidPassword(data.new_password)) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "新密码需至少8位，包含字母和数字" },
        { status: 422 }
      );
    }

    user.password_hash = hashPassword(data.new_password);
    user.updated_at = new Date().toISOString();
  }

  profile.updated_at = new Date().toISOString();

  return NextResponse.json(profile);
}
