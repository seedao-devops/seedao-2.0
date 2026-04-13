import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { store, findAll } from "@/lib/fake-data/db";
import type { AuditStatus } from "@/lib/types";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");
  const sort_by = url.searchParams.get("sort_by") as "created_at" | "status" | null;
  const sort_order = url.searchParams.get("sort_order") as "asc" | "desc" | null;
  const statusParam = url.searchParams.get("status");
  const start_date = url.searchParams.get("start_date");
  const end_date = url.searchParams.get("end_date");

  const filters: Record<string, unknown> = {};
  if (statusParam) {
    filters.status = statusParam.split(",") as AuditStatus[];
  }
  if (start_date) filters.start_date = start_date;
  if (end_date) filters.end_date = end_date;

  const result = findAll(
    store.audit_items,
    filters,
    { limit, offset },
    { sort_by: sort_by ?? "created_at", sort_order: sort_order ?? "desc" }
  );

  const response = NextResponse.json(result.data);
  response.headers.set("X-Total-Count", String(result.total));
  return response;
}
