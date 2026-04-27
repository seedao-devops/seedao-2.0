"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Last-resort error boundary. Active when the root layout itself crashes
 * (e.g. a layout-level provider throws). Per Next 16 docs, must define its
 * own <html>/<body> because the root layout is replaced.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[global-error]", error);
    }
  }, [error]);

  return (
    <html lang="zh-CN">
      <body
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "1.5rem",
          fontFamily:
            "system-ui, -apple-system, 'Noto Sans SC', 'PingFang SC', sans-serif",
          backgroundColor: "#f7f1e3",
          color: "#1f1d1a",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            出错了
          </h1>
          <p style={{ fontSize: "0.875rem", opacity: 0.7, marginBottom: "1.5rem" }}>
            页面遇到了一个未知问题，你可以尝试重新加载或返回首页。
          </p>
          {error.digest ? (
            <p
              style={{
                fontSize: "0.75rem",
                opacity: 0.5,
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
                marginBottom: "1.5rem",
              }}
            >
              错误编号：{error.digest}
            </p>
          ) : null}
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => unstable_retry()}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid currentColor",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              重试
            </button>
            <Link
              href="/"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                background: "#1f1d1a",
                color: "#f7f1e3",
                textDecoration: "none",
              }}
            >
              回首页
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
