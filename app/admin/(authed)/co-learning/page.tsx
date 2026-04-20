import { listBases } from "@/lib/features/bases/repo";
import { listEvents } from "@/lib/features/co-learning/repo";
import { CoLearningAdminTable } from "@/components/features/admin/co-learning-admin-table";

export default async function AdminCoLearningPage() {
  const [events, bases] = await Promise.all([listEvents(), listBases()]);
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-serif font-bold">共学活动管理</h1>
        <p className="text-sm text-muted-foreground">
          维护体验课、系列课和师徒制活动。
        </p>
      </div>
      <CoLearningAdminTable
        events={events}
        bases={bases.map((b) => ({ id: b.id, name: b.name, emoji: b.emoji }))}
      />
    </div>
  );
}
