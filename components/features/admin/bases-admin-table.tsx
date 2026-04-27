"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiError, apiDelete } from "@/lib/api-client";
import type { Base } from "@/lib/features/_shared/fake-db";

export function BasesAdminTable({ bases }: { bases: Base[] }) {
  const router = useRouter();

  async function remove(id: string, name: string) {
    if (!confirm(`确定删除基地「${name}」吗？此操作不可撤销。`)) return;
    try {
      await apiDelete(`/api/admin/bases/${id}`);
      toast.success("已删除");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) toast.error("删除失败");
      else throw err;
    }
  }

  return (
    <div className="rounded-xl border bg-background overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>位置</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>项目数</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-12">
                暂无基地
              </TableCell>
            </TableRow>
          ) : null}
          {bases.map((b) => (
            <TableRow key={b.id}>
              <TableCell className="font-medium">
                <span className="mr-1.5">{b.emoji}</span>
                {b.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {b.province} · {b.city}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {b.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px] py-0 px-1.5">
                      {t}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {b.localProjects.length}
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button asChild size="icon" variant="ghost">
                  <Link href={`/admin/bases/${b.id}`}>
                    <Pencil className="size-4" />
                  </Link>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => remove(b.id, b.name)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
