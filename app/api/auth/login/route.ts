import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { store } from "@/lib/fake-data/db";
import { verifyPassword, createToken } from "@/lib/utils/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "请输入邮箱和密码" },
      { status: 422 }
    );
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  const user = store.users.find(
    (u) => u.email.toLowerCase() === normalizedEmail
  );

  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json(
      { error: "INVALID_CREDENTIALS", message: "邮箱或密码错误" },
      { status: 401 }
    );
  }

  if (user.status === "PENDING_VERIFICATION") {
    return NextResponse.json(
      { error: "UNVERIFIED", message: "请先完成邮箱和手机验证" },
      { status: 403 }
    );
  }

  if (user.status === "REJECTED") {
    return NextResponse.json(
      { error: "REJECTED", message: "您的申请已被拒绝" },
      { status: 403 }
    );
  }

  const profile = store.profiles.find((p) => p.user_id === user.id);

  const token = createToken({
    user_id: user.id,
    email: user.email,
    scope: user.scope,
    nickname: profile?.nickname,
  });

  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400 * 7,
    path: "/",
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      status: user.status,
      nickname: profile?.nickname,
    },
  });
}
