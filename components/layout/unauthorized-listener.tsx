"use client";

import { useEffect } from "react";
import { UNAUTHORIZED_EVENT } from "@/lib/api-client";

/**
 * Listens for the global `seedao:unauthorized` event dispatched by
 * `lib/api-client.ts` whenever any request gets a 401. Routes to the
 * appropriate login page based on the current path.
 *
 * Mounted once in the root layout — runs on the client only.
 */
export function UnauthorizedListener() {
  useEffect(() => {
    function handler() {
      const path = window.location.pathname + window.location.search;
      if (path.startsWith("/login") || path.startsWith("/admin/login")) return;
      const target = path.startsWith("/admin")
        ? "/admin/login"
        : `/login?redirect=${encodeURIComponent(path)}`;
      window.location.assign(target);
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handler);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
  }, []);
  return null;
}
