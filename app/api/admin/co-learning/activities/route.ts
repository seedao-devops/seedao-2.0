import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { store, findAll, generateId } from "@/lib/fake-data/db";
import { parseToken } from "@/lib/utils/auth";
import { sanitizeText } from "@/lib/utils/sanitize";

const createSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  skill_category: z.string().min(1),
  facilitator_name: z.string().min(1),
  max_participants: z.number().int().min(1),
  scheduled_start: z.string().datetime(),
  duration_minutes: z.number().int().min(1),
});

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");
  const status = url.searchParams.get("status");

  const filters: Record<string, unknown> = {};
  if (status) filters.status = status;

  const result = findAll(
    store.activities,
    filters,
    { limit, offset },
    { sort_by: "created_at", sort_order: "desc" }
  );

  const response = NextResponse.json(result.data);
  response.headers.set("X-Total-Count", String(result.total));
  return response;
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const session = token ? parseToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const now = new Date().toISOString();

  const duplicate = store.activities.find((a) => {
    if (a.title !== data.title) return false;
    const existingStart = new Date(a.scheduled_start).getTime();
    const newStart = new Date(data.scheduled_start).getTime();
    return Math.abs(existingStart - newStart) < 2 * 60 * 60 * 1000;
  });

  const activity = {
    id: generateId("act"),
    title: sanitizeText(data.title),
    description: sanitizeText(data.description),
    skill_category: data.skill_category,
    facilitator_name: sanitizeText(data.facilitator_name),
    max_participants: data.max_participants,
    scheduled_start: data.scheduled_start,
    duration_minutes: data.duration_minutes,
    status: "DRAFT" as const,
    created_by: session.user_id,
    created_at: now,
    updated_at: now,
  };

  store.activities.push(activity);

  const response = NextResponse.json(activity, { status: 201 });
  if (duplicate) {
    response.headers.set("X-Warning", "POSSIBLE_DUPLICATE");
  }
  return response;
}
