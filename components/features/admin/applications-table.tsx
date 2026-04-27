"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiPost } from "@/lib/api-client";
import {
  PAYMENT_STATUS_LABELS,
  REVIEW_STATUS_LABELS,
} from "@/lib/features/_shared/enums";
import type { Application } from "@/lib/features/_shared/fake-db";

type Row = Application & { contact: string };

export function ApplicationsTable({ applications }: { applications: Row[] }) {
  const router = useRouter();
  const [active, setActive] = useState<Row | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  function open(row: Row) {
    setActive(row);
    setReason("");
  }

  async function approve() {
    if (!active) return;
    setBusy(true);
    try {
      try {
        await apiPost(`/api/admin/applications/${active.id}/approve`);
        toast.success("已通过，DID 分配任务已生成");
        setActive(null);
        router.refresh();
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(err.code === "NOT_PAID" ? "用户尚未付款，无法通过" : "操作失败");
        } else {
          throw err;
        }
      }
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    if (!active) return;
    if (reason.trim().length < 10) {
      toast.error("拒绝理由至少 10 字");
      return;
    }
    setBusy(true);
    try {
      try {
        await apiPost(`/api/admin/applications/${active.id}/reject`, { reason });
        toast.success("已拒绝，退款任务已生成");
        setActive(null);
        router.refresh();
      } catch (err) {
        if (err instanceof ApiError) toast.error("操作失败");
        else throw err;
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="rounded-xl border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>昵称</TableHead>
              <TableHead>联系方式</TableHead>
              <TableHead>提交时间</TableHead>
              <TableHead>付款状态</TableHead>
              <TableHead>审核状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-12">
                  暂无申请
                </TableCell>
              </TableRow>
            ) : null}
            {applications.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.nickname}</TableCell>
                <TableCell className="text-muted-foreground">{a.contact}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(a.submittedAt).toLocaleString("zh-CN")}
                </TableCell>
                <TableCell><Badge variant="secondary">{PAYMENT_STATUS_LABELS[a.paymentStatus]}</Badge></TableCell>
                <TableCell><Badge variant="secondary">{REVIEW_STATUS_LABELS[a.reviewStatus]}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => open(a)}>
                    查看
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={Boolean(active)} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          {active ? (
            <>
              <SheetHeader>
                <SheetTitle>申请详情 — {active.nickname}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-5 text-sm">
                <Field label="联系方式" value={active.contact} />
                <Field label="提交时间" value={new Date(active.submittedAt).toLocaleString("zh-CN")} />
                <Field label="付款状态" value={PAYMENT_STATUS_LABELS[active.paymentStatus]} />
                <Field label="审核状态" value={REVIEW_STATUS_LABELS[active.reviewStatus]} />
                <Field label="自我介绍" value={active.selfIntro} multiline />
                <Field label="兴趣标签" value={active.interestTags.join("、")} />
                {active.portfolio ? <Field label="作品/项目" value={active.portfolio} multiline /> : null}
                {active.rejectReason ? <Field label="拒绝理由" value={active.rejectReason} multiline /> : null}

                {active.reviewStatus === "PENDING" ? (
                  <>
                    <div className="space-y-2 pt-3 border-t">
                      <p className="text-xs font-medium text-muted-foreground">拒绝理由</p>
                      <Textarea
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="若拒绝，请填写理由（10-500 字）"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button onClick={approve} disabled={busy} className="flex-1">
                        <Check className="size-4" />
                        通过
                      </Button>
                      <Button variant="destructive" onClick={reject} disabled={busy} className="flex-1">
                        <X className="size-4" />
                        拒绝
                      </Button>
                    </div>
                  </>
                ) : null}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Field({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={multiline ? "whitespace-pre-line" : ""}>{value}</p>
    </div>
  );
}
