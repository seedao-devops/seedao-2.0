"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { AuditItem, AuditStatus, InternalTier } from "@/lib/types";

const statusLabels: Record<AuditStatus, string> = {
  PENDING: "待审核",
  APPROVED: "已通过",
  REJECTED: "已拒绝",
};

const statusVariant: Record<AuditStatus, "default" | "secondary" | "destructive"> = {
  PENDING: "default",
  APPROVED: "secondary",
  REJECTED: "destructive",
};

export default function AuditPage() {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<AuditStatus | "ALL">("ALL");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const [approveDialog, setApproveDialog] = useState<AuditItem | null>(null);
  const [rejectDialog, setRejectDialog] = useState<AuditItem | null>(null);
  const [approveForm, setApproveForm] = useState({
    internal_tier: "TIER_1" as InternalTier,
    remarks: "",
  });
  const [rejectReason, setRejectReason] = useState("");

  const loadItems = useCallback(async () => {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      sort_by: "created_at",
      sort_order: "desc",
    });
    if (filter !== "ALL") params.set("status", filter);

    try {
      const { data, headers } = await api.get<AuditItem[]>(
        `/api/admin/audit?${params}`
      );
      setItems(data);
      setTotal(parseInt(headers.get("X-Total-Count") ?? "0"));
    } catch {
      toast.error("加载审核列表失败");
    }
  }, [filter, offset]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleApprove = async () => {
    if (!approveDialog) return;
    try {
      await api.post(`/api/admin/audit/${approveDialog.id}/approve`, approveForm);
      toast.success("已通过");
      setApproveDialog(null);
      setApproveForm({ internal_tier: "TIER_1", remarks: "" });
      loadItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失败");
    }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    if (rejectReason.length < 10) {
      toast.error("拒绝原因至少10个字符");
      return;
    }
    try {
      await api.post(`/api/admin/audit/${rejectDialog.id}/reject`, {
        reason: rejectReason,
      });
      toast.success("已拒绝");
      setRejectDialog(null);
      setRejectReason("");
      loadItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失败");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select
          value={filter}
          onValueChange={(v) => {
            setFilter(v as AuditStatus | "ALL");
            setOffset(0);
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">全部</SelectItem>
            <SelectItem value="PENDING">待审核</SelectItem>
            <SelectItem value="APPROVED">已通过</SelectItem>
            <SelectItem value="REJECTED">已拒绝</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">共 {total} 条</span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>邮箱</TableHead>
              <TableHead>手机号</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>提交时间</TableHead>
              <TableHead className="w-24">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-sm">{item.email}</TableCell>
                <TableCell className="text-sm">{item.phone}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[item.status]}>
                    {statusLabels[item.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(item.created_at).toLocaleDateString("zh-CN")}
                </TableCell>
                <TableCell>
                  {item.status === "PENDING" && (
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setApproveDialog(item)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setRejectDialog(item)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {total > limit && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - limit))}
          >
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={offset + limit >= total}
            onClick={() => setOffset(offset + limit)}
          >
            下一页
          </Button>
        </div>
      )}

      <Dialog
        open={!!approveDialog}
        onOpenChange={() => setApproveDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>通过审核</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {approveDialog?.email}
            </p>
            <div className="space-y-2">
              <Label>内部等级（必填）</Label>
              <Select
                value={approveForm.internal_tier}
                onValueChange={(v) =>
                  setApproveForm({
                    ...approveForm,
                    internal_tier: v as InternalTier,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TIER_1">一级</SelectItem>
                  <SelectItem value="TIER_2">二级</SelectItem>
                  <SelectItem value="TIER_3">三级</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>备注（选填）</Label>
              <Input
                value={approveForm.remarks}
                onChange={(e) =>
                  setApproveForm({ ...approveForm, remarks: e.target.value })
                }
                maxLength={500}
              />
            </div>
            <Button onClick={handleApprove} className="w-full">
              确认通过
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!rejectDialog}
        onOpenChange={() => setRejectDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝申请</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {rejectDialog?.email}
            </p>
            <div className="space-y-2">
              <Label>拒绝原因（必填，至少10字）</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="请详细说明拒绝原因..."
              />
              <p className="text-xs text-muted-foreground">
                {rejectReason.length}/10 字符（最少）
              </p>
            </div>
            <Button
              onClick={handleReject}
              variant="destructive"
              className="w-full"
              disabled={rejectReason.length < 10}
            >
              确认拒绝
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
