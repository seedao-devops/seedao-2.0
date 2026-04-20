"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Account = { key: string; label: string; role: "admin" | "user" };

const ACCOUNTS: Account[] = [
  { key: "admin", label: "Admin", role: "admin" },
  { key: "alice", label: "Alice (已通过)", role: "user" },
  { key: "bob", label: "Bob (审核中)", role: "user" },
];

/**
 * Dev-only quick-login panel. Renders nothing in production builds.
 * Click any account → sets the session cookie via /api/_dev/login-as
 * (auto-seeding the fake DB if it's empty), then redirects appropriately.
 */
export function DevQuickLogin({
  filter = "all",
  redirect,
}: {
  filter?: "all" | "user" | "admin";
  redirect?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  if (process.env.NODE_ENV === "production") return null;

  const accounts =
    filter === "all" ? ACCOUNTS : ACCOUNTS.filter((a) => a.role === filter);

  async function loginAs(account: Account) {
    setBusy(account.key);
    try {
      const res = await fetch("/api/dev/login-as", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: account.key }),
      });
      if (!res.ok) {
        toast.error("一键登录失败");
        return;
      }
      toast.success(`已登录：${account.label}`);
      const target =
        redirect ?? (account.role === "admin" ? "/admin" : "/journey");
      router.push(target);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-amber-400/60 bg-amber-50/60 p-3 space-y-2 text-amber-900 dark:bg-amber-900/10 dark:text-amber-200">
      <div className="flex items-center gap-1.5 text-xs font-medium">
        <Sparkles className="size-3.5" />
        开发环境一键登录
      </div>
      <div className="flex flex-wrap gap-2">
        {accounts.map((a) => (
          <Button
            key={a.key}
            type="button"
            variant="outline"
            size="sm"
            disabled={busy !== null}
            onClick={() => loginAs(a)}
            className="bg-background/70"
          >
            {busy === a.key ? "登录中..." : a.label}
          </Button>
        ))}
      </div>
      <p className="text-[11px] opacity-70">
        首次点击会自动填充示例数据（基地、活动、申请、旅程）。
      </p>
    </div>
  );
}
