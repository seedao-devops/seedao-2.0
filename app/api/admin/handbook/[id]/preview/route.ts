import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { store, findById } from "@/lib/fake-data/db";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const handbook = findById(store.handbooks, id);

  if (!handbook) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json(handbook);
}
