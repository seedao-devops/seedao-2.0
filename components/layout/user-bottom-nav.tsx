"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, GraduationCap, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/bases", label: "探索基地", icon: Compass },
  { href: "/co-learning", label: "共学", icon: GraduationCap },
  { href: "/journey", label: "我的旅程", icon: Sprout },
] as const;

export function UserBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 mx-auto w-full max-w-md border-t bg-background/95 backdrop-blur safe-area-bottom">
      <ul className="grid grid-cols-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-xs",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
