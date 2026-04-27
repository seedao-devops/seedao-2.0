"use client";

import { useRouter } from "next/navigation";
import { Check, Clock, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { ApiError, apiPost } from "@/lib/api-client";
import {
  PAYMENT_STATUS_LABELS,
  REVIEW_STATUS_LABELS,
} from "@/lib/features/_shared/enums";
import type { Application } from "@/lib/features/_shared/fake-db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ApplicationStatus({ application }: { application: Application }) {
  const router = useRouter();

  async function markPaid() {
    try {
      await apiPost("/api/applications/me/mark-paid");
      toast.success("已记录为已付款");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) toast.error("更新失败");
      else throw err;
    }
  }

  async function logout() {
    await apiPost("/api/auth/logout").catch(() => {});
    router.push("/");
    router.refresh();
  }

  const stages = buildStages(application);

  return (
    <div className="space-y-6 pt-2">
      <div className="space-y-2">
        <h1>申请进度</h1>
        <p className="text-body text-muted-foreground">
          昵称：<span className="text-foreground">{application.nickname}</span>
        </p>
      </div>

      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-body text-muted-foreground">付款状态</span>
          <Badge variant="secondary">{PAYMENT_STATUS_LABELS[application.paymentStatus]}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-body text-muted-foreground">审核状态</span>
          <Badge variant="secondary">{REVIEW_STATUS_LABELS[application.reviewStatus]}</Badge>
        </div>
        {application.rejectReason ? (
          <div className="rounded-lg bg-destructive/10 p-3 text-body text-destructive">
            <p className="font-medium mb-1">拒绝理由</p>
            <p>{application.rejectReason}</p>
          </div>
        ) : null}
      </Card>

      <ol className="space-y-3">
        {stages.map((s) => (
          <li key={s.label}>
            <div
              className={cn(
                "flex gap-3 items-start rounded-xl border p-4",
                s.state === "done" && "bg-primary/5",
                s.state === "active" && "border-primary",
              )}
            >
              <span
                className={cn(
                  "size-7 rounded-full grid place-items-center shrink-0 mt-0.5",
                  s.state === "done" && "bg-primary text-primary-foreground",
                  s.state === "active" && "bg-primary/10 text-primary",
                  s.state === "pending" && "bg-muted text-muted-foreground",
                  s.state === "fail" && "bg-destructive text-destructive-foreground",
                )}
              >
                {s.state === "done" ? <Check className="size-4" /> : null}
                {s.state === "active" ? <Clock className="size-4" /> : null}
                {s.state === "pending" ? <Clock className="size-4" /> : null}
                {s.state === "fail" ? <X className="size-4" /> : null}
              </span>
              <div className="space-y-0.5">
                <p className="font-medium">{s.label}</p>
                <p className="text-body text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      {application.paymentStatus === "UNPAID" ? (
        <div className="space-y-2">
          <Button asChild variant="outline" className="w-full">
            <a href="https://example.com/seedao-pay" target="_blank" rel="noreferrer">
              前往付款
              <ExternalLink className="size-4" />
            </a>
          </Button>
          <Button onClick={markPaid} className="w-full">
            我已付款
          </Button>
        </div>
      ) : null}

      <Button variant="ghost" className="w-full" onClick={logout}>
        退出登录
      </Button>
    </div>
  );
}

type Stage = {
  label: string;
  desc: string;
  state: "done" | "active" | "pending" | "fail";
};

function buildStages(a: Application): Stage[] {
  const stages: Stage[] = [];
  stages.push({
    label: "申请提交",
    desc: new Date(a.submittedAt).toLocaleString("zh-CN"),
    state: "done",
  });
  stages.push({
    label: "完成付款",
    desc:
      a.paymentStatus === "PAID" || a.paymentStatus === "REFUND_PENDING" || a.paymentStatus === "REFUNDED"
        ? "已付款"
        : "请前往付款链接，付款后回到此处确认",
    state: a.paymentStatus === "UNPAID" ? "active" : "done",
  });
  if (a.reviewStatus === "PENDING") {
    stages.push({
      label: "管理员审核",
      desc: a.paymentStatus === "PAID" ? "审核中，请耐心等候" : "等待付款后开始审核",
      state: a.paymentStatus === "PAID" ? "active" : "pending",
    });
  } else if (a.reviewStatus === "APPROVED") {
    stages.push({
      label: "审核通过",
      desc: a.reviewedAt ? new Date(a.reviewedAt).toLocaleString("zh-CN") : "已通过",
      state: "done",
    });
    stages.push({
      label: "DID 分配",
      desc:
        a.didStatus === "ASSIGNED"
          ? `已分配：${a.didInfo}`
          : "管理员将很快为你分配 DID",
      state: a.didStatus === "ASSIGNED" ? "done" : "active",
    });
  } else {
    stages.push({
      label: "审核未通过",
      desc: "请查看上方拒绝理由",
      state: "fail",
    });
    stages.push({
      label: "退款处理",
      desc:
        a.reviewStatus === "REJECTED_REFUNDED"
          ? "退款已完成"
          : "我们将很快处理退款",
      state: a.reviewStatus === "REJECTED_REFUNDED" ? "done" : "active",
    });
  }
  return stages;
}
