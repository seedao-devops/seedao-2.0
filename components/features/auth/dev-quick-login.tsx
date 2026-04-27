"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError, apiPost } from "@/lib/api-client";

type Account = { key: string; label: string; role: "admin" | "user" };

const ACCOUNTS: Account[] = [
  { key: "admin", label: "Admin", role: "admin" },
  { key: "alice", label: "Alice (已通过)", role: "user" },
  { key: "bob", label: "Bob (审核中)", role: "user" },
];

/**
 * Quick-login panel for demo accounts.
 *
 * Visibility:
 *   - Always shown in dev (NODE_ENV !== "production").
 *   - In prod, shown only when NEXT_PUBLIC_DEMO_PUBLIC=1 is baked into the
 *     client bundle at build time. (Server-side counterpart: DEMO_PUBLIC=1 in
 *     /api/dev/login-as. Both must be set for the buttons to work in prod.)
 *
 * Click any account → POST /api/dev/login-as { key } sets the session cookie
 * (auto-seeds the DB if empty), then we redirect.
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

  const isDev = process.env.NODE_ENV !== "production";
  const isPublicDemo = process.env.NEXT_PUBLIC_DEMO_PUBLIC === "1";
  if (!isDev && !isPublicDemo) return null;

  const accounts =
    filter === "all" ? ACCOUNTS : ACCOUNTS.filter((a) => a.role === filter);

  async function loginAs(account: Account) {
    setBusy(account.key);
    try {
      try {
        await apiPost("/api/dev/login-as", { key: account.key });
        toast.success(`已登录：${account.label}`);
        const target =
          redirect ?? (account.role === "admin" ? "/admin" : "/journey");
        router.push(target);
        router.refresh();
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error("一键登录失败");
        } else {
          throw err;
        }
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-amber-400/60 bg-amber-50/60 p-3 space-y-2 text-amber-900 dark:bg-amber-900/10 dark:text-amber-200">
      <div className="flex items-center gap-1.5 text-caption font-medium">
        <Sparkles className="size-3.5" />
        演示账号一键登录
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
