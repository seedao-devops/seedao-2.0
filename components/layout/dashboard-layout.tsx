"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardCheck, GraduationCap, BookOpen, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const dashboardTabs = [
  { href: "/dashboard/audit", label: "审核", icon: ClipboardCheck },
  { href: "/dashboard/co-learning", label: "共学", icon: GraduationCap },
  { href: "/dashboard/handbook", label: "手册", icon: BookOpen },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <h1 className="text-lg font-semibold">管理后台</h1>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        <div className="mx-auto max-w-4xl">
          <nav className="flex border-t">
            {dashboardTabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium",
                  pathname.startsWith(tab.href)
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 p-4">{children}</main>
    </div>
  );
}
