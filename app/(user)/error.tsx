"use client";

import { ErrorFallback } from "@/components/layout/error-fallback";

export default function UserSegmentError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return <ErrorFallback error={error} retry={unstable_retry} homeHref="/" />;
}
