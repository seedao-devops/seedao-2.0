import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { store, generateId } from "@/lib/fake-data/db";
import { normalizePhone, isValidPhone } from "@/lib/utils/phone";
import { hashPassword, isValidPassword, isValidEmail, createToken } from "@/lib/utils/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const registerSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  phone: z.string().min(1, "手机号不能为空"),
  password: z.string().min(8, "密码至少8位"),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = checkRateLimit(`register:${ip}`, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: "TOO_MANY_REQUESTS", message: "请求过于频繁，请15分钟后再试" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", message: "请求体格式错误" },
      { status: 400 }
    );
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { email, phone, password } = parsed.data;

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "邮箱格式不正确" },
      { status: 422 }
    );
  }

  if (!isValidPassword(password)) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "密码需至少8位，包含字母和数字" },
      { status: 422 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = normalizePhone(phone);

  if (!isValidPhone(normalizedPhone)) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "手机号格式不正确" },
      { status: 422 }
    );
  }

  const emailExists = store.users.some(
    (u) => u.email.toLowerCase() === normalizedEmail
  );
  if (emailExists) {
    return NextResponse.json(
      { error: "EMAIL_EXISTS", message: "该邮箱已被注册" },
      { status: 409 }
    );
  }

  const phoneExists = store.users.some((u) => u.phone === normalizedPhone);
  if (phoneExists) {
    return NextResponse.json(
      { error: "PHONE_EXISTS", message: "该手机号已被注册" },
      { status: 409 }
    );
  }

  const userId = generateId("user");
  const user = {
    id: userId,
    email: normalizedEmail,
    phone: normalizedPhone,
    password_hash: hashPassword(password),
    email_verified: false,
    phone_verified: false,
    status: "PENDING_VERIFICATION" as const,
    scope: "user:read",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.users.push(user);

  const emailToken = {
    id: generateId("vt"),
    user_id: userId,
    type: "EMAIL" as const,
    code: Math.random().toString(36).slice(2, 10),
    expires_at: new Date(Date.now() + 3600000).toISOString(),
    used: false,
  };

  const phoneToken = {
    id: generateId("vt"),
    user_id: userId,
    type: "PHONE" as const,
    code: String(Math.floor(100000 + Math.random() * 900000)),
    expires_at: new Date(Date.now() + 600000).toISOString(),
    used: false,
  };

  store.verification_tokens.push(emailToken, phoneToken);

  const token = createToken({
    user_id: userId,
    email: normalizedEmail,
    scope: "user:read",
  });

  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400 * 7,
    path: "/",
  });

  return NextResponse.json(
    {
      user: { id: userId, email: normalizedEmail, phone: normalizedPhone, status: user.status },
      verification: {
        email_code: emailToken.code,
        phone_code: phoneToken.code,
      },
    },
    { status: 201 }
  );
}
