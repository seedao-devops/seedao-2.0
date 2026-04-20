import Link from "next/link";
import { Plus } from "lucide-react";
import { listBases } from "@/lib/features/bases/repo";
import { Button } from "@/components/ui/button";
import { BasesAdminTable } from "@/components/features/admin/bases-admin-table";

export default async function AdminBasesPage() {
  const bases = await listBases();
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-bold">基地管理</h1>
          <p className="text-sm text-muted-foreground">
            维护基地的基本信息、在地生活、技能、项目、时间线等。
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/bases/new">
            <Plus className="size-4" />
            新建基地
          </Link>
        </Button>
      </div>
      <BasesAdminTable bases={bases} />
    </div>
  );
}
