import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { store, findById } from "@/lib/fake-data/db";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const handbook = findById(store.handbooks, id);

  if (!handbook) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (handbook.status === "PUBLISHED") {
    return NextResponse.json(handbook);
  }

  if (handbook.status === "DELETED") {
    return NextResponse.json(
      { error: "CONFLICT", message: "已删除的手册无法发布" },
      { status: 409 }
    );
  }

  handbook.status = "PUBLISHED";
  handbook.published_at = new Date().toISOString();
  handbook.updated_at = new Date().toISOString();

  return NextResponse.json(handbook);
}
