import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { store, findAll } from "@/lib/fake-data/db";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");

  const result = findAll(
    store.activities,
    { status: "PUBLISHED" },
    { limit, offset },
    { sort_by: "scheduled_start", sort_order: "asc" }
  );

  const response = NextResponse.json(result.data);
  response.headers.set("X-Total-Count", String(result.total));
  return response;
}
