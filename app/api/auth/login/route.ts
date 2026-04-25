import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/features/auth/schema";
import { findUserByIdentifier, verifyPassword } from "@/lib/features/auth/repo";
import { setSessionCookie } from "@/lib/features/auth/session";

// bcrypt is a native-ish dependency; pin to nodejs to avoid Edge promotion.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_INPUT", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { phone, email, password } = parsed.data;
  const user = await findUserByIdentifier({
    phone: phone || undefined,
    email: email || undefined,
  });
  if (!user || !(await verifyPassword(user, password))) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
  }
  await setSessionCookie(user.id, user.role);
  return NextResponse.json({ ok: true, role: user.role });
}
