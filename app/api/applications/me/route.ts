import { NextResponse } from "next/server";
import { getSession } from "@/lib/features/auth/session";
import { getApplicationByUser } from "@/lib/features/applications/repo";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const app = await getApplicationByUser(session.sub);
  return NextResponse.json({ application: app ?? null });
}
