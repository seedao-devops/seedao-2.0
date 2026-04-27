import { getAllApplications } from "@/lib/features/applications/repo";
import { getTable } from "@/lib/features/_shared/fake-db";
import { DidsTable } from "@/components/features/admin/dids-table";

export default async function AdminDidsPage() {
  const [apps, users] = await Promise.all([
    getAllApplications(),
    getTable("users"),
  ]);
  const dids = apps
    .filter((a) => a.reviewStatus === "APPROVED")
    .map((a) => ({
      ...a,
      contact:
        users.find((u) => u.id === a.userId)?.email ??
        users.find((u) => u.id === a.userId)?.phone ??
        "—",
    }));

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1>DID 管理</h1>
        <p className="text-body text-muted-foreground">
          为审核通过的成员分配链上身份。分配后用户在「我的旅程」可见。
        </p>
      </div>
      <DidsTable dids={dids} />
    </div>
  );
}
