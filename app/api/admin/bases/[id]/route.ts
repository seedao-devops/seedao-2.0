import { NextResponse } from "next/server";
import {
  deleteBase,
  getBaseById,
  updateBase,
} from "@/lib/features/bases/repo";
import { baseUpsertSchema } from "@/lib/features/bases/schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const base = await getBaseById(id);
  if (!base) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ base });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = baseUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", issues: parsed.error.issues }, { status: 400 });
  }
  const updated = await updateBase(id, parsed.data);
  if (!updated) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ base: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await deleteBase(id);
  return NextResponse.json({ ok: true });
}
