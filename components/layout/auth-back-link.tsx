"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

/**
 * Leading back arrow shown in the auth layout. The destination depends on
 * the current route:
 *   - `/register`        → `/login`  (so the wizard can fall back to login)
 *   - `/admin/login`     → `/`       (escape the admin shell)
 *   - elsewhere (login)  → `/`
 *
 * Hidden on `/login` so we don't pull users away from the primary auth page.
 */
export function AuthBackLink() {
  const pathname = usePathname();
  if (!pathname || pathname === "/login") return null;

  const href =
    pathname === "/register"
      ? "/login"
      : pathname.startsWith("/admin")
        ? "/"
        : "/";
  const label = pathname === "/register" ? "返回登录" : "返回首页";

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-body text-muted-foreground hover:text-foreground transition-colors"
      aria-label={label}
    >
      <ChevronLeft className="size-4" />
      {label}
    </Link>
  );
}
