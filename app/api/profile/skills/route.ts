import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { store, generateId } from "@/lib/fake-data/db";
import { parseToken } from "@/lib/utils/auth";

const createSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
});

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const session = token ? parseToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const skills = store.skills.filter((s) => s.user_id === session.user_id);
  return NextResponse.json(skills);
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

  const duplicate = store.skills.some(
    (s) =>
      s.user_id === session.user_id &&
      s.name.toLowerCase() === data.name.toLowerCase()
  );
  if (duplicate) {
    return NextResponse.json(
      { error: "CONFLICT", message: "该技能已存在" },
      { status: 409 }
    );
  }

  const now = new Date().toISOString();
  const skill = {
    id: generateId("skill"),
    user_id: session.user_id,
    name: data.name,
    description: data.description,
    level: data.level,
    total_hours: 0,
    created_at: now,
    updated_at: now,
  };

  store.skills.push(skill);

  return NextResponse.json(skill, { status: 201 });
}
