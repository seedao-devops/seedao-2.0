import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { store, findById } from "@/lib/fake-data/db";
import { parseToken } from "@/lib/utils/auth";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const token = request.cookies.get("auth_token")?.value;
  const session = token ? parseToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const item = findById(store.wishlist_items, id);
  if (!item || item.user_id !== session.user_id) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  let body: { public: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  item.public = body.public;
  item.updated_at = new Date().toISOString();

  return NextResponse.json(item);
}
