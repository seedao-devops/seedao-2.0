"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PAYMENT_STATUS_LABELS,
  REVIEW_STATUS_LABELS,
} from "@/lib/features/_shared/enums";
import { ApiError, apiPost } from "@/lib/api-client";
import type { Application } from "@/lib/features/_shared/fake-db";

type Row = Application & { contact: string };

export function RefundsTable({ refunds }: { refunds: Row[] }) {
  const router = useRouter();

  async function complete(id: string) {
    try {
      await apiPost(`/api/admin/refunds/${id}/complete`);
      toast.success("已标记为已退款");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) toast.error("操作失败");
      else throw err;
    }
  }

  return (
    <div className="rounded-xl border bg-background overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>昵称</TableHead>
            <TableHead>联系方式</TableHead>
            <TableHead>拒绝理由</TableHead>
            <TableHead>付款状态</TableHead>
            <TableHead>审核状态</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {refunds.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-12">
                暂无退款任务
              </TableCell>
            </TableRow>
          ) : null}
          {refunds.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.nickname}</TableCell>
              <TableCell className="text-muted-foreground">{r.contact}</TableCell>
              <TableCell className="max-w-sm truncate text-muted-foreground">
                {r.rejectReason ?? "—"}
              </TableCell>
              <TableCell><Badge variant="secondary">{PAYMENT_STATUS_LABELS[r.paymentStatus]}</Badge></TableCell>
              <TableCell><Badge variant="secondary">{REVIEW_STATUS_LABELS[r.reviewStatus]}</Badge></TableCell>
              <TableCell className="text-right">
                {r.reviewStatus === "REJECTED_AWAITING_REFUND" ? (
                  <Button size="sm" onClick={() => complete(r.id)}>
                    标记已退款
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">已完成</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
