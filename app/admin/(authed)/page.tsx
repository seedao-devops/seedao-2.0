import Link from "next/link";
import {
  ClipboardList,
  Coins,
  Fingerprint,
  GraduationCap,
  Map,
} from "lucide-react";
import { getAllApplications } from "@/lib/features/applications/repo";
import { listBases } from "@/lib/features/bases/repo";
import { listEvents } from "@/lib/features/co-learning/repo";
import { Card } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [apps, bases, events] = await Promise.all([
    getAllApplications(),
    listBases(),
    listEvents(),
  ]);

  const pending = apps.filter((a) => a.reviewStatus === "PENDING").length;
  const refunds = apps.filter((a) => a.reviewStatus === "REJECTED_AWAITING_REFUND").length;
  const dids = apps.filter(
    (a) => a.reviewStatus === "APPROVED" && a.didStatus === "PENDING_ASSIGN",
  ).length;

  const stats: Array<{
    label: string;
    value: number;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
  }> = [
    { label: "待审核申请", value: pending, href: "/admin/applications", icon: ClipboardList, accent: "text-primary" },
    { label: "待处理退款", value: refunds, href: "/admin/refunds", icon: Coins, accent: "text-amber-600" },
    { label: "待分配 DID", value: dids, href: "/admin/dids", icon: Fingerprint, accent: "text-emerald-600" },
    { label: "已登记基地", value: bases.length, href: "/admin/bases", icon: Map, accent: "text-sky-600" },
    { label: "共学活动", value: events.length, href: "/admin/co-learning", icon: GraduationCap, accent: "text-rose-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-serif font-bold">管理总览</h1>
        <p className="text-sm text-muted-foreground">
          快速查看待办事项与系统当前状态。
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, href, icon: Icon, accent }) => (
          <Link key={href} href={href}>
            <Card className="p-5 hover:shadow-md transition-shadow flex items-center gap-4">
              <div className={`size-12 rounded-full bg-muted flex items-center justify-center ${accent}`}>
                <Icon className="size-6" />
              </div>
              <div>
                <div className="text-2xl font-bold font-serif">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
