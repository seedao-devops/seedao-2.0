"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiPost } from "@/lib/api-client";

export function AdminHeader({ email }: { email: string }) {
  const router = useRouter();
  async function logout() {
    await apiPost("/api/auth/logout").catch(() => {});
    toast.success("已退出登录");
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-6">
      <div className="md:hidden font-serif font-bold">SeeDAO 控制台</div>
      <div className="flex items-center gap-3 ml-auto">
        <span className="text-body text-muted-foreground">{email}</span>
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="size-4" />
          退出
        </Button>
      </div>
    </header>
  );
}
