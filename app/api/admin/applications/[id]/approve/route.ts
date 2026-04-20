import { NextResponse } from "next/server";
import { getSession } from "@/lib/features/auth/session";
import {
  getApplicationById,
  patchApplication,
} from "@/lib/features/applications/repo";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSession();
  const app = await getApplicationById(id);
  if (!app) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (app.paymentStatus !== "PAID") {
    return NextResponse.json({ error: "NOT_PAID" }, { status: 409 });
  }
  const updated = await patchApplication(id, {
    reviewStatus: "APPROVED",
    reviewedAt: new Date().toISOString(),
    reviewerId: session?.sub,
    didStatus: "PENDING_ASSIGN",
  });
  return NextResponse.json({ application: updated });
}
