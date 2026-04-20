/**
 * Dev-only one-click login.
 *   GET  /api/dev/login-as            -> list demo accounts (auto-seeds if empty)
 *   POST /api/dev/login-as { key }    -> set the session cookie for that demo user
 *
 * Disabled in production.
 */
import { NextResponse } from "next/server";
import {
  DEMO_ACCOUNTS,
  type DemoAccountKey,
  seedIfEmpty,
} from "@/lib/features/_shared/seed";
import { setSessionCookie } from "@/lib/features/auth/session";

function isDevAllowed() {
  return process.env.NODE_ENV !== "production";
}

export async function GET() {
  if (!isDevAllowed()) {
    return NextResponse.json({ error: "DISABLED" }, { status: 403 });
  }
  const seeded = await seedIfEmpty();
  return NextResponse.json({
    seededJustNow: seeded,
    accounts: Object.entries(DEMO_ACCOUNTS).map(([key, a]) => ({
      key,
      label: a.label,
      role: a.role,
    })),
  });
}

export async function POST(req: Request) {
  if (!isDevAllowed()) {
    return NextResponse.json({ error: "DISABLED" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as { key?: string };
  const key = body.key as DemoAccountKey | undefined;
  if (!key || !(key in DEMO_ACCOUNTS)) {
    return NextResponse.json(
      { error: "INVALID_KEY", expected: Object.keys(DEMO_ACCOUNTS) },
      { status: 400 },
    );
  }
  await seedIfEmpty();
  const account = DEMO_ACCOUNTS[key];
  await setSessionCookie(account.id, account.role);
  return NextResponse.json({ ok: true, role: account.role, key });
}
