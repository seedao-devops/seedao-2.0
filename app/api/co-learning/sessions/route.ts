import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { store, generateId } from "@/lib/fake-data/db";
import { parseToken } from "@/lib/utils/auth";

const sessionSchema = z.object({
  teacher_id: z.string(),
  student_id: z.string(),
  skill_id: z.string(),
  duration_minutes: z.number().int().min(1),
  feedback_rating: z.number().min(1).max(5),
});

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

  const parsed = sessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;

  if (data.teacher_id === data.student_id) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "不能与自己建立教学关系" },
      { status: 422 }
    );
  }

  const now = new Date().toISOString();

  const teachingSession = {
    id: generateId("ts"),
    teacher_id: data.teacher_id,
    student_id: data.student_id,
    skill_id: data.skill_id,
    duration_minutes: data.duration_minutes,
    feedback_rating: data.feedback_rating,
    completed: true,
    created_at: now,
  };

  store.teaching_sessions.push(teachingSession);

  const existingRel = store.relationships.find(
    (r) =>
      ((r.user_a_id === data.teacher_id && r.user_b_id === data.student_id) ||
        (r.user_a_id === data.student_id && r.user_b_id === data.teacher_id)) &&
      r.skill_id === data.skill_id
  );

  if (existingRel) {
    existingRel.last_interaction = now;
  } else {
    store.relationships.push({
      id: generateId("rel"),
      user_a_id: data.teacher_id,
      user_b_id: data.student_id,
      type: "TEACHER_STUDENT",
      skill_id: data.skill_id,
      last_interaction: now,
      created_at: now,
    });
  }

  return NextResponse.json({ session: teachingSession }, { status: 201 });
}
