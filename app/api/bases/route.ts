import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listBases } from "@/lib/features/bases/repo";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const bases = await listBases({
    query: sp.get("query") ?? undefined,
    tag: sp.get("tag") ?? undefined,
    skill: sp.get("skill") ?? undefined,
    province: sp.get("province") ?? undefined,
  });
  return NextResponse.json({ bases });
}
