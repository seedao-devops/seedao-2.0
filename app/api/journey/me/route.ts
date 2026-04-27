import { NextResponse } from "next/server";
import { getSession } from "@/lib/features/auth/session";
import {
  getJourneyByUser,
  upsertJourney,
  defaultJourneyFor,
} from "@/lib/features/journey/repo";
import { journeyUpsertSchema } from "@/lib/features/journey/schema";
import { getApplicationByUser } from "@/lib/features/applications/repo";
import type { Application } from "@/lib/features/_shared/fake-db";
import type { SessionPayload } from "@/lib/features/auth/jwt";

/**
 * Members can only read or write their own journey once their application has
 * been approved. Until then they're blocked here too — not just at the page
 * layer — so a curl-savvy under-review user can't sneak around the redirect.
 *
 * Admins keep access (they have no application of their own, but may need to
 * inspect via this endpoint during dev).
 */
async function requireApprovedMember(): Promise<
  | { ok: true; session: SessionPayload; application: Application | undefined }
  | { ok: false; response: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }),
    };
  }
  if (session.role === "user") {
    const application = await getApplicationByUser(session.sub);
    if (!application || application.reviewStatus !== "APPROVED") {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "APPLICATION_NOT_APPROVED" },
          { status: 403 },
        ),
      };
    }
    return { ok: true, session, application };
  }
  return { ok: true, session, application: undefined };
}

export async function GET() {
  const guard = await requireApprovedMember();
  if (!guard.ok) return guard.response;
  const { session, application } = guard;
  let journey = await getJourneyByUser(session.sub);
  if (!journey) {
    journey = defaultJourneyFor(
      session.sub,
      application?.nickname ?? session.sub,
    );
  }
  return NextResponse.json({ journey });
}

export async function PUT(request: Request) {
  const guard = await requireApprovedMember();
  if (!guard.ok) return guard.response;
  const { session } = guard;
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
