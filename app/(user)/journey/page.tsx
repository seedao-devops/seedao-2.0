import Link from "next/link";
import { getSession } from "@/lib/features/auth/session";
import { getJourneyByUser, defaultJourneyFor } from "@/lib/features/journey/repo";
import { getApplicationByUser } from "@/lib/features/applications/repo";
import { getTable } from "@/lib/features/_shared/fake-db";
import { JourneyView } from "@/components/features/journey/journey-view";
import { Button } from "@/components/ui/button";

export default async function JourneyPage() {
  const session = await getSession();
  if (!session) return null;
  const app = await getApplicationByUser(session.sub);
  const journey =
    (await getJourneyByUser(session.sub)) ??
    defaultJourneyFor(session.sub, app?.nickname ?? "新成员");
  const [bases, events] = await Promise.all([
    getTable("bases"),
    getTable("coLearningEvents"),
  ]);
  return (
    <div className="px-5 pt-4 pb-8 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold">我的旅程</h1>
        <Button asChild size="sm" variant="outline">
          <Link href="/account">编辑</Link>
        </Button>
      </div>
      <JourneyView journey={journey} bases={bases} events={events} />
    </div>
  );
}
