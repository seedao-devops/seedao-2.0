import { NextResponse } from "next/server";
import { createEvent, listEvents } from "@/lib/features/co-learning/repo";
import { coLearningUpsertSchema } from "@/lib/features/co-learning/schema";

export async function GET() {
  const events = await listEvents();
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = coLearningUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", issues: parsed.error.issues }, { status: 400 });
  }
  const created = await createEvent(parsed.data);
  return NextResponse.json({ event: created }, { status: 201 });
}
