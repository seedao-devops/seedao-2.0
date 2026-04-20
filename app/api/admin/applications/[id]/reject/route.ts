import { NextResponse } from "next/server";
import { getSession } from "@/lib/features/auth/session";
import {
  getApplicationById,
  patchApplication,
} from "@/lib/features/applications/repo";
import { rejectSchema } from "@/lib/features/applications/schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = rejectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", issues: parsed.error.issues }, { status: 400 });
  }
  const session = await getSession();
  const app = await getApplicationById(id);
  if (!app) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  // Reject auto-creates a refund row by setting paymentStatus -> REFUND_PENDING.
  const updated = await patchApplication(id, {
    reviewStatus: "REJECTED_AWAITING_REFUND",
    rejectReason: parsed.data.reason,
    paymentStatus: app.paymentStatus === "PAID" ? "REFUND_PENDING" : app.paymentStatus,
    reviewedAt: new Date().toISOString(),
    reviewerId: session?.sub,
  });
  return NextResponse.json({ application: updated });
}
