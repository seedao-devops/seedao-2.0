import { getAllApplications } from "@/lib/features/applications/repo";
import { getTable } from "@/lib/features/_shared/fake-db";
import { ApplicationsTable } from "@/components/features/admin/applications-table";

export default async function AdminApplicationsPage() {
  const [applications, users] = await Promise.all([
    getAllApplications(),
    getTable("users"),
  ]);
  const enriched = applications.map((a) => ({
    ...a,
    contact: users.find((u) => u.id === a.userId)?.email
      ?? users.find((u) => u.id === a.userId)?.phone
      ?? "—",
  }));
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1>申请审核</h1>
        <p className="text-body text-muted-foreground">
          审核新加入 SeeDAO 的成员申请。通过后会自动出现在「DID 分配」页；
          拒绝后会自动出现在「退款」页。
        </p>
      </div>
      <ApplicationsTable applications={enriched} />
    </div>
  );
}
