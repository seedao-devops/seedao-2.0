import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { store, findById } from "@/lib/fake-data/db";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const activity = findById(store.activities, id);

  if (!activity) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  activity.status = "ARCHIVED";
  activity.updated_at = new Date().toISOString();

  return NextResponse.json(activity);
}
