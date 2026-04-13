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

  if (activity.status !== "DRAFT") {
    return NextResponse.json(
      { error: "CONFLICT", message: "只有草稿状态的活动可以发布" },
      { status: 409 }
    );
  }

  if (new Date(activity.scheduled_start) < new Date()) {
    return NextResponse.json(
      {
        error: "BAD_REQUEST",
        message: "Cannot publish activity with start date in the past.",
      },
      { status: 400 }
    );
  }

  activity.status = "PUBLISHED";
  activity.updated_at = new Date().toISOString();

  return NextResponse.json(activity);
}
