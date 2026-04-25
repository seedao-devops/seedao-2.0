import { NextResponse } from "next/server";
import { z } from "zod";
import { registerCredentialsSchema } from "@/lib/features/auth/schema";
import { applicationFormSchema } from "@/lib/features/applications/schema";
import { createUser } from "@/lib/features/auth/repo";
import { createApplication } from "@/lib/features/applications/repo";
import { setSessionCookie } from "@/lib/features/auth/session";

const bodySchema = z.object({
  credentials: registerCredentialsSchema,
  application: applicationFormSchema,
});

// bcrypt is a native-ish dependency; pin to nodejs to avoid Edge promotion.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_INPUT", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { credentials, application } = parsed.data;
  try {
    const user = await createUser({
      phone: credentials.phone || undefined,
      email: credentials.email || undefined,
      password: credentials.password,
    });
    await createApplication(user.id, application);
    await setSessionCookie(user.id, user.role);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const code = (err as Error).message;
    if (code === "PHONE_TAKEN" || code === "EMAIL_TAKEN" || code === "NICKNAME_TAKEN") {
      return NextResponse.json({ error: code }, { status: 409 });
    }
    return NextResponse.json({ error: "INTERNAL" }, { status: 500 });
  }
}
