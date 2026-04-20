import { getAllApplications } from "@/lib/features/applications/repo";
import { getTable } from "@/lib/features/_shared/fake-db";
import { RefundsTable } from "@/components/features/admin/refunds-table";

export default async function AdminRefundsPage() {
  const [apps, users] = await Promise.all([
    getAllApplications(),
    getTable("users"),
  ]);
  const refunds = apps
    .filter(
      (a) =>
        a.reviewStatus === "REJECTED_AWAITING_REFUND" ||
        a.reviewStatus === "REJECTED_REFUNDED",
    )
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
        <h1 className="text-2xl font-serif font-bold">退款管理</h1>
        <p className="text-sm text-muted-foreground">
          审核被拒后产生的退款任务。完成线下退款后点击「标记已退款」。
        </p>
      </div>
      <RefundsTable refunds={refunds} />
    </div>
  );
}
