import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { store, findAll } from "@/lib/fake-data/db";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "10"), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");
  const search = url.searchParams.get("search");

  const filters: Record<string, unknown> = { status: "PUBLISHED" };
  if (search) filters.search = search;

  const result = findAll(
    store.handbooks,
    filters,
    { limit, offset },
    { sort_by: "published_at", sort_order: "desc" }
  );

  const listing = result.data.map((h) => ({
    title: h.title,
    slug: h.slug,
    excerpt: h.excerpt,
    cover_thumbnail_url: h.cover_thumbnail_url,
    published_at: h.published_at,
  }));

  const response = NextResponse.json(listing);
  response.headers.set("X-Total-Count", String(result.total));
  return response;
}
