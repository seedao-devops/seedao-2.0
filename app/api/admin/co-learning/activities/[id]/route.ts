import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { store, findById } from "@/lib/fake-data/db";
import { parseToken } from "@/lib/utils/auth";
import { sanitizeText } from "@/lib/utils/sanitize";

const updateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(2000).optional(),
  skill_category: z.string().min(1).optional(),
  facilitator_name: z.string().min(1).optional(),
  max_participants: z.number().int().min(1).optional(),
  scheduled_start: z.string().datetime().optional(),
  duration_minutes: z.number().int().min(1).optional(),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const activity = findById(store.activities, id);
  if (!activity) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json(activity);
}

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

  const activity = findById(store.activities, id);
  if (!activity) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;

  if (data.max_participants !== undefined && activity.status === "PUBLISHED") {
    const currentCount = store.participants.filter(
      (p) => p.activity_id === id
    ).length;
    if (data.max_participants < currentCount) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Cannot reduce capacity below current participant count.",
        },
        { status: 422 }
      );
    }
  }

  if (data.title) activity.title = sanitizeText(data.title);
  if (data.description) activity.description = sanitizeText(data.description);
  if (data.skill_category) activity.skill_category = data.skill_category;
  if (data.facilitator_name) activity.facilitator_name = sanitizeText(data.facilitator_name);
  if (data.max_participants !== undefined) activity.max_participants = data.max_participants;
  if (data.scheduled_start) activity.scheduled_start = data.scheduled_start;
  if (data.duration_minutes !== undefined) activity.duration_minutes = data.duration_minutes;
  activity.updated_at = new Date().toISOString();

  return NextResponse.json(activity);
}

export async function DELETE(
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
      {
        error: "CONFLICT",
        message: "Cannot delete activity with existing participants. Archive instead.",
      },
      { status: 409 }
    );
  }

  const participantCount = store.participants.filter(
    (p) => p.activity_id === id
  ).length;
  if (participantCount > 0) {
    return NextResponse.json(
      {
        error: "CONFLICT",
        message: "Cannot delete activity with existing participants. Archive instead.",
      },
      { status: 409 }
    );
  }

  const index = store.activities.findIndex((a) => a.id === id);
  store.activities.splice(index, 1);

  return NextResponse.json({ success: true });
}
