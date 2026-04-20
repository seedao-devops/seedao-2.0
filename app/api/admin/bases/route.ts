import { NextResponse } from "next/server";
import { createBase, listBases } from "@/lib/features/bases/repo";
import { baseUpsertSchema } from "@/lib/features/bases/schema";

export async function GET() {
  const bases = await listBases();
  return NextResponse.json({ bases });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = baseUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", issues: parsed.error.issues }, { status: 400 });
  }
  const created = await createBase(parsed.data);
  return NextResponse.json({ base: created }, { status: 201 });
}
