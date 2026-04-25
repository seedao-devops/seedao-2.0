/**
 * Demo one-click login.
 *   GET  /api/dev/login-as            -> list demo accounts (auto-seeds if empty)
 *   POST /api/dev/login-as { key }    -> set the session cookie for that demo user
 *
 * Access:
 *   - Dev (NODE_ENV !== "production"): always allowed.
 *   - Production:
 *       - If DEMO_PUBLIC=1 → always allowed (open-demo mode).
 *       - Otherwise requires DEMO_RESET_TOKEN via `?token=...` (GET) or
 *         `Authorization: Bearer ...` / `{ token }` body field (POST).
 */
import { NextResponse } from "next/server";
import {
  DEMO_ACCOUNTS,
  type DemoAccountKey,
  seedIfEmpty,
} from "@/lib/features/_shared/seed";
import { setSessionCookie } from "@/lib/features/auth/session";

export const runtime = "nodejs";

function isAuthorized(req: Request, bodyToken?: string): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  if (process.env.DEMO_PUBLIC === "1") return true;
  const expected = process.env.DEMO_RESET_TOKEN;
  if (!expected) return false;
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("token");
  const auth = req.headers.get("authorization") ?? "";
  const fromHeader = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : null;
  return (
    fromQuery === expected ||
    fromHeader === expected ||
    bodyToken === expected
  );
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
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
  const body = (await req.json().catch(() => ({}))) as {
    key?: string;
    token?: string;
  };
  if (!isAuthorized(req, body.token)) {
    return NextResponse.json({ error: "DISABLED" }, { status: 403 });
  }
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
