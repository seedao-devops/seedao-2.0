"use client";

import { SWRConfig } from "swr";
import { toast } from "sonner";
import { ApiError, swrFetcher } from "@/lib/api-client";

/**
 * Global SWR config. Mounted just inside <body> in the root layout so every
 * client tree inherits the same fetcher and error handling.
 *
 * Notes:
 *   - `fetcher` defers to `lib/api-client` so 401s still trigger the global
 *     unauthorized listener (and we keep one source of truth for headers/
 *     timeouts).
 *   - `onError` skips 401 (handled by the listener) and silences AbortErrors
 *     (component unmount), then surfaces a generic toast for unexpected
 *     failures. Page-level mutations still toast their own success/failure
 *     messages.
 */
export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        onError(err) {
          if (err instanceof ApiError) {
            if (err.status === 401) return;
            if (err.code === "TIMEOUT") {
              toast.error("请求超时，请检查网络");
              return;
            }
            if (err.code === "NETWORK_ERROR") {
              toast.error("网络异常，请稍后重试");
              return;
            }
            toast.error("加载失败，请稍后重试");
            return;
          }
          if (err instanceof Error && err.name === "AbortError") return;
          toast.error("加载失败，请稍后重试");
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
