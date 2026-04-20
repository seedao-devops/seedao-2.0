import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listEvents } from "@/lib/features/co-learning/repo";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const events = await listEvents({
    query: sp.get("query") ?? undefined,
    skill: sp.get("skill") ?? undefined,
    level: sp.get("level") ?? undefined,
  });
  return NextResponse.json({ events });
}
