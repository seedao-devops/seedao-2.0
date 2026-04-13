import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { store, generateId } from "@/lib/fake-data/db";
import { checkRateLimit } from "@/lib/rate-limit";

const verifySchema = z.object({
  user_id: z.string(),
  type: z.enum(["EMAIL", "PHONE"]),
  code: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { user_id, type, code } = parsed.data;

  if (type === "PHONE") {
    const { allowed } = checkRateLimit(`otp-resend:${user_id}`, {
      maxRequests: 3,
      windowMs: 10 * 60 * 1000,
    });
    if (!allowed) {
      return NextResponse.json(
        { error: "TOO_MANY_REQUESTS", message: "验证码请求过于频繁" },
        { status: 429 }
      );
    }
  }

  const token = store.verification_tokens.find(
    (t) =>
      t.user_id === user_id &&
      t.type === type &&
      t.code === code &&
      !t.used
  );

  if (!token) {
    return NextResponse.json(
      { error: "INVALID_CODE", message: "验证码无效或已过期" },
      { status: 400 }
    );
  }

  if (new Date(token.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "CODE_EXPIRED", message: "验证码已过期" },
      { status: 400 }
    );
  }

  token.used = true;

  const user = store.users.find((u) => u.id === user_id);
  if (!user) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  }

  if (type === "EMAIL") user.email_verified = true;
  if (type === "PHONE") user.phone_verified = true;

  if (user.email_verified && user.phone_verified && user.status === "PENDING_VERIFICATION") {
    user.status = "PENDING_AUDIT";
    user.updated_at = new Date().toISOString();

    store.audit_items.push({
      id: generateId("audit"),
      user_id: user.id,
      email: user.email,
      phone: user.phone,
      status: "PENDING",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    verified: true,
    type,
    email_verified: user.email_verified,
    phone_verified: user.phone_verified,
    status: user.status,
  });
}
