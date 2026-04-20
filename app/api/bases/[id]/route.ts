import { NextResponse } from "next/server";
import { getBaseById, getProducedWorks } from "@/lib/features/bases/repo";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const base = await getBaseById(id);
  if (!base) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const producedWorks = await getProducedWorks(id);
  return NextResponse.json({ base, producedWorks });
}
