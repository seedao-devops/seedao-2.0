import { NextResponse } from "next/server";
import {
  getApplicationById,
  patchApplication,
} from "@/lib/features/applications/repo";
import { assignDidSchema } from "@/lib/features/applications/schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = assignDidSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", issues: parsed.error.issues }, { status: 400 });
  }
  const app = await getApplicationById(id);
  if (!app) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (app.reviewStatus !== "APPROVED") {
    return NextResponse.json({ error: "NOT_APPROVED" }, { status: 409 });
  }
  const updated = await patchApplication(id, {
    didStatus: "ASSIGNED",
    didInfo: parsed.data.didInfo,
  });
  return NextResponse.json({ application: updated });
}
