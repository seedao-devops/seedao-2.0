"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ApiError, apiPost } from "@/lib/api-client";
import { DID_STATUS_LABELS } from "@/lib/features/_shared/enums";
import type { Application } from "@/lib/features/_shared/fake-db";

type Row = Application & { contact: string };

export function DidsTable({ dids }: { dids: Row[] }) {
  const router = useRouter();
  const [active, setActive] = useState<Row | null>(null);
  const [didInfo, setDidInfo] = useState("");
  const [busy, setBusy] = useState(false);

  function open(row: Row) {
    setActive(row);
    setDidInfo(row.didInfo ?? "");
  }

  async function assign() {
    if (!active) return;
    if (didInfo.trim().length < 4) {
      toast.error("DID 至少 4 个字符");
      return;
    }
    setBusy(true);
    try {
      try {
        await apiPost(`/api/admin/dids/${active.id}/assign`, { didInfo });
        toast.success("DID 已分配");
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
              <TableHead>通过时间</TableHead>
              <TableHead>DID 状态</TableHead>
              <TableHead>DID 信息</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dids.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-body text-muted-foreground py-12">
                  暂无任务
                </TableCell>
              </TableRow>
            ) : null}
            {dids.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.nickname}</TableCell>
                <TableCell className="text-muted-foreground">{d.contact}</TableCell>
                <TableCell className="text-muted-foreground">
                  {d.reviewedAt ? new Date(d.reviewedAt).toLocaleString("zh-CN") : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {d.didStatus ? DID_STATUS_LABELS[d.didStatus] : "—"}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-caption text-muted-foreground max-w-sm truncate">
                  {d.didInfo ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => open(d)}>
                    {d.didStatus === "ASSIGNED" ? "更新" : "分配"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>分配 DID — {active?.nickname}</DialogTitle>
          </DialogHeader>
          <Input
            value={didInfo}
            onChange={(e) => setDidInfo(e.target.value)}
            placeholder="例如：did:eth:0xabc..."
            className="font-mono"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setActive(null)}>取消</Button>
            <Button onClick={assign} disabled={busy}>{busy ? "保存中..." : "保存"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
