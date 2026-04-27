import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getJourneyByUser } from "@/lib/features/journey/repo";
import { getTable } from "@/lib/features/_shared/fake-db";
import { JourneyView } from "@/components/features/journey/journey-view";
import { Button } from "@/components/ui/button";

export default async function ShareProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const journey = await getJourneyByUser(id);
  if (!journey) notFound();

  const v = journey.fieldVisibility;
  const visible = {
    avatarUrl: v.avatar ? journey.avatarUrl : "",
    displayName: journey.displayName,
    bio: v.bio ? journey.bio : "",
    stays: v.stays ? journey.stays : [],
    learningRecords: v.learning ? journey.learningRecords : [],
    teachingRecords: v.teaching ? journey.teachingRecords : [],
    works: v.works ? journey.works : [],
    wishToLearn: v.wishToLearn ? journey.wishToLearn : [],
  };

  const [bases, events] = await Promise.all([
    getTable("bases"),
    getTable("coLearningEvents"),
  ]);

  return (
    <>
      <div className="px-5 pt-4 pb-8 space-y-5">
        <div className="space-y-1">
          <p className="text-overline uppercase text-muted-foreground">SeeDAO 成员</p>
          <h1>{visible.displayName} 的旅程</h1>
        </div>
        <JourneyView
          journey={visible}
          bases={bases}
          events={events}
          hideAvatar={!v.avatar}
        />
      </div>
      <div className="fixed bottom-0 inset-x-0 z-40 mx-auto w-full max-w-md border-t bg-background/95 backdrop-blur safe-area-bottom">
        <div className="flex items-center justify-between gap-3 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <p className="text-caption text-muted-foreground leading-tight">
            想拥有自己的
            <br />
            数字游民旅程？
          </p>
          <Button asChild size="lg">
            <Link href="/">
              加入 SeeDAO
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
