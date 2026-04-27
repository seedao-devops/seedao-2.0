"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Shared fallback used by every `error.tsx` boundary. Logs the digest so
 * future Sentry/observability hooks have a single integration point.
 */
export function ErrorFallback({
  error,
  retry,
  homeHref = "/",
}: {
  error: Error & { digest?: string };
  retry: () => void;
  homeHref?: string;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[error-boundary]", error);
    }
  }, [error]);

  return (
    <div className="px-5 py-12 grid place-items-center">
      <Card className="w-full max-w-sm p-7 space-y-5 text-center">
        <div className="size-12 rounded-full bg-destructive/10 text-destructive grid place-items-center mx-auto">
          <AlertTriangle className="size-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-serif text-xl font-bold">出错了</h2>
          <p className="text-sm text-muted-foreground">
            页面遇到了一个未知问题，你可以尝试重新加载。
          </p>
        </div>
        {error.digest ? (
          <p className="text-[11px] font-mono text-muted-foreground break-all">
            错误编号：{error.digest}
          </p>
        ) : null}
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={retry}>
            重试
          </Button>
          <Button asChild>
            <Link href={homeHref}>回首页</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
