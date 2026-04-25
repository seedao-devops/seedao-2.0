import { NextResponse } from "next/server";
import { getSession } from "@/lib/features/auth/session";
import { changePasswordSchema } from "@/lib/features/auth/schema";
import { updatePassword } from "@/lib/features/auth/repo";

// Mock: in this fake-DB build, code "000000" is always accepted to simulate
// an SMS / email verification flow. Replace with a real channel later.
const MOCK_CODE = "000000";

// bcrypt is a native-ish dependency; pin to nodejs to avoid Edge promotion.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_INPUT", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  if (parsed.data.code !== MOCK_CODE) {
    return NextResponse.json({ error: "INVALID_CODE" }, { status: 400 });
  }
  await updatePassword(session.sub, parsed.data.newPassword);
  return NextResponse.json({ ok: true });
}
