import { NextResponse } from "next/server";
import {
  getApplicationById,
  patchApplication,
} from "@/lib/features/applications/repo";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const app = await getApplicationById(id);
  if (!app) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (app.reviewStatus !== "REJECTED_AWAITING_REFUND") {
    return NextResponse.json({ error: "INVALID_STATE" }, { status: 409 });
  }
  const updated = await patchApplication(id, {
    reviewStatus: "REJECTED_REFUNDED",
    paymentStatus: "REFUNDED",
  });
  return NextResponse.json({ application: updated });
}
