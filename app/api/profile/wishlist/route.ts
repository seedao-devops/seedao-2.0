import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { store, generateId } from "@/lib/fake-data/db";
import { parseToken } from "@/lib/utils/auth";

const createSchema = z.object({
  skill_name: z.string().min(1),
  target_level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
});

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const session = token ? parseToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const items = store.wishlist_items.filter(
    (w) => w.user_id === session.user_id
  );
  return NextResponse.json(items);
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

  const item = {
    id: generateId("wish"),
    user_id: session.user_id,
    skill_name: data.skill_name,
    target_level: data.target_level,
    priority: data.priority,
    public: false,
    created_at: now,
    updated_at: now,
  };

  store.wishlist_items.push(item);

  return NextResponse.json(item, { status: 201 });
}
