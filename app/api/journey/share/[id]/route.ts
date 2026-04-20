import { NextResponse } from "next/server";
import { getJourneyByUser } from "@/lib/features/journey/repo";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const journey = await getJourneyByUser(id);
  if (!journey) return NextResponse.json({ journey: null }, { status: 404 });
  // Apply visibility server-side: omit fields whose flag is false.
  const v = journey.fieldVisibility;
  return NextResponse.json({
    journey: {
      userId: journey.userId,
      avatarUrl: v.avatar ? journey.avatarUrl : null,
      displayName: journey.displayName,
      bio: v.bio ? journey.bio : null,
      stays: v.stays ? journey.stays : [],
      learningRecords: v.learning ? journey.learningRecords : [],
      teachingRecords: v.teaching ? journey.teachingRecords : [],
      works: v.works ? journey.works : [],
      wishToLearn: v.wishToLearn ? journey.wishToLearn : [],
    },
  });
}
