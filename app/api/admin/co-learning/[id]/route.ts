import { NextResponse } from "next/server";
import { deleteEvent, updateEvent } from "@/lib/features/co-learning/repo";
import { coLearningUpsertSchema } from "@/lib/features/co-learning/schema";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = coLearningUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", issues: parsed.error.issues }, { status: 400 });
  }
  const updated = await updateEvent(id, parsed.data);
  if (!updated) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ event: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await deleteEvent(id);
  return NextResponse.json({ ok: true });
}
