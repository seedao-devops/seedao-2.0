"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useJourney } from "@/lib/features/journey/hooks";
import { useBases } from "@/lib/features/bases/hooks";
import { useCoLearningEvents } from "@/lib/features/co-learning/hooks";
import { JourneyView } from "./journey-view";
import { JourneySkeleton } from "./journey-skeleton";

export function JourneyClient() {
  const { journey, isLoading: journeyLoading } = useJourney();
  const { bases } = useBases();
  const { events } = useCoLearningEvents();

  return (
    <div className="px-5 pt-4 pb-8 space-y-5">
      <div className="flex items-center justify-between">
        <h1>我的旅程</h1>
        <Button asChild size="sm" variant="outline">
          <Link href="/account">编辑</Link>
        </Button>
      </div>
      {journeyLoading || !journey ? (
        <JourneySkeleton />
      ) : (
        <JourneyView
          journey={journey}
          bases={bases ?? []}
          events={events ?? []}
        />
      )}
    </div>
  );
}
