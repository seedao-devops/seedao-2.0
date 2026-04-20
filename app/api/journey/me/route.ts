import { NextResponse } from "next/server";
import { getSession } from "@/lib/features/auth/session";
import {
  getJourneyByUser,
  upsertJourney,
  defaultJourneyFor,
} from "@/lib/features/journey/repo";
import { journeyUpsertSchema } from "@/lib/features/journey/schema";
import { getApplicationByUser } from "@/lib/features/applications/repo";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  let journey = await getJourneyByUser(session.sub);
  if (!journey) {
    const app = await getApplicationByUser(session.sub);
    journey = defaultJourneyFor(session.sub, app?.nickname ?? session.sub);
  }
  return NextResponse.json({ journey });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const parsed = journeyUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_INPUT", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const journey = await upsertJourney(session.sub, parsed.data);
  return NextResponse.json({ journey });
}
