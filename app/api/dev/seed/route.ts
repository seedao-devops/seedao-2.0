/**
 * Demo seed endpoint.
 *   GET /api/dev/seed              -> reports current state
 *   GET /api/dev/seed?reset=1      -> wipes and reseeds all tables
 *
 * Access:
 *   - Dev (NODE_ENV !== "production"): always allowed.
 *   - Production:
 *       - If DEMO_PUBLIC=1 → always allowed (open-demo mode).
 *       - Otherwise requires a matching DEMO_RESET_TOKEN, supplied either as
 *         `?token=...` or `Authorization: Bearer ...`. If neither knob is
 *         configured, the endpoint stays disabled in production.
 */
import { NextResponse } from "next/server";
import { DEMO_ACCOUNTS, isSeeded, seedAll } from "@/lib/features/_shared/seed";

export const runtime = "nodejs";

function isAuthorized(req: Request): boolean {
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
  return fromQuery === expected || fromHeader === expected;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "DISABLED" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const reset = searchParams.get("reset") === "1";

  if (reset) {
    await seedAll();
  }

  return NextResponse.json({
    seeded: await isSeeded(),
    reset,
    accounts: DEMO_ACCOUNTS,
    hint: "POST /api/dev/login-as { key: 'admin' | 'alice' | 'bob' } to log in.",
  });
}
