import { NextResponse } from "next/server";
import { getAllApplications } from "@/lib/features/applications/repo";
import { getTable } from "@/lib/features/_shared/fake-db";

export async function GET() {
  const [applications, users] = await Promise.all([
    getAllApplications(),
    getTable("users"),
  ]);
  const enriched = applications.map((a) => {
    const u = users.find((u) => u.id === a.userId);
    return {
      ...a,
      contact: u?.email ?? u?.phone ?? "—",
    };
  });
  return NextResponse.json({ applications: enriched });
}
