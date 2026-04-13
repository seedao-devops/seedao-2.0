import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { store, findById, generateId } from "@/lib/fake-data/db";
import { parseToken } from "@/lib/utils/auth";
import type { GrowthStats } from "@/lib/types";

const createLogSchema = z.object({
  date: z.string(),
  hours_spent: z.number().int().min(1),
  place: z.string().min(1),
  notes: z.string().optional(),
  evidence_url: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const token = request.cookies.get("auth_token")?.value;
  const session = token ? parseToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const skill = findById(store.skills, id);
  if (!skill || skill.user_id !== session.user_id) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const logs = store.growth_logs
    .filter((l) => l.skill_id === id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalHours = logs.reduce((sum, l) => sum + l.hours_spent, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const checkDate = new Date(today);
  while (true) {
    const dateStr = checkDate.toISOString().slice(0, 10);
    const hasLog = logs.some((l) => l.date.slice(0, 10) === dateStr);
    if (!hasLog) break;
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  const weeklyHours: number[] = [];
  for (let w = 0; w < 4; w++) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - (w + 1) * 7);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() - w * 7);

    const hours = logs
      .filter((l) => {
        const d = new Date(l.date);
        return d >= weekStart && d < weekEnd;
      })
      .reduce((sum, l) => sum + l.hours_spent, 0);

    weeklyHours.unshift(hours);
  }

  const stats: GrowthStats = {
    total_hours: totalHours,
    streak_days: streak,
    weekly_hours: weeklyHours,
  };

  return NextResponse.json({ stats, logs });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const token = request.cookies.get("auth_token")?.value;
  const session = token ? parseToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const skill = findById(store.skills, id);
  if (!skill || skill.user_id !== session.user_id) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = createLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const log = {
    id: generateId("growth"),
    skill_id: id,
    user_id: session.user_id,
    date: data.date,
    hours_spent: data.hours_spent,
    place: data.place,
    notes: data.notes,
    evidence_url: data.evidence_url,
    created_at: new Date().toISOString(),
  };

  store.growth_logs.push(log);

  skill.total_hours += data.hours_spent;
  skill.updated_at = new Date().toISOString();

  return NextResponse.json(
    { log, skill: { total_hours: skill.total_hours } },
    { status: 201 }
  );
}
