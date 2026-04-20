/**
 * Dev-only seed endpoint.
 *   GET /api/dev/seed              -> reports current state
 *   GET /api/dev/seed?reset=1      -> wipes and reseeds all tables
 *
 * Disabled in production.
 */
import { NextResponse } from "next/server";
import { DEMO_ACCOUNTS, isSeeded, seedAll } from "@/lib/features/_shared/seed";

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
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
