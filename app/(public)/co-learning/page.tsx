import { listEvents } from "@/lib/features/co-learning/repo";
import { getTable } from "@/lib/features/_shared/fake-db";
import { CoLearningExplorer } from "@/components/features/co-learning/co-learning-explorer";

export default async function CoLearningPage() {
  const [events, bases] = await Promise.all([listEvents(), getTable("bases")]);
  return (
    <div className="px-5 pt-4 pb-8 space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-serif font-bold">共学活动</h1>
        <p className="text-sm text-muted-foreground">
          来自社区成员的工作坊、系列课与师徒制
        </p>
      </div>
      <CoLearningExplorer initialEvents={events} bases={bases} />
    </div>
  );
}
