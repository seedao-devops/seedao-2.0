import { NextResponse } from "next/server";
import { getSession } from "@/lib/features/auth/session";
import {
  getApplicationByUser,
  patchApplication,
} from "@/lib/features/applications/repo";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const app = await getApplicationByUser(session.sub);
  if (!app) return NextResponse.json({ error: "NO_APPLICATION" }, { status: 404 });
  if (app.paymentStatus !== "UNPAID") {
    return NextResponse.json({ application: app });
  }
  const updated = await patchApplication(app.id, { paymentStatus: "PAID" });
  return NextResponse.json({ application: updated });
}
