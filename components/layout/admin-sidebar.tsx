"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Coins,
  Fingerprint,
  Map,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/applications", label: "申请审核", icon: ClipboardList },
  { href: "/admin/refunds", label: "退款", icon: Coins },
  { href: "/admin/dids", label: "DID 分配", icon: Fingerprint },
  { href: "/admin/bases", label: "基地管理", icon: Map },
  { href: "/admin/co-learning", label: "共学活动", icon: GraduationCap },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <nav className="flex-1 px-3 py-4 space-y-1 text-body">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
