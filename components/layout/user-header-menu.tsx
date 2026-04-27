"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { apiPost } from "@/lib/api-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Header user menu for authenticated users. Provides a single, always-visible
 * place to access account settings and log out from any page.
 *
 * Renders the journey avatar in the trigger so it's instantly obvious who is
 * logged in (or that anyone is logged in at all).
 */
export function UserHeaderMenu({
  identity,
  avatarUrl,
  displayName,
}: {
  identity: string;
  avatarUrl: string;
  displayName: string;
}) {
  const router = useRouter();

  async function logout() {
    await apiPost("/api/auth/logout").catch(() => {});
    toast.success("已退出登录");
    router.push("/");
    router.refresh();
  }

  const fallbackChar =
    (displayName || identity).trim().charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="账户菜单"
          className="rounded-full ring-1 ring-border hover:ring-foreground/30 transition-shadow"
        >
          <Avatar className="size-8">
            <AvatarImage src={avatarUrl} alt={displayName || identity} />
            <AvatarFallback className="text-caption font-medium">
              {fallbackChar}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-52">
        <DropdownMenuLabel className="font-normal text-caption text-muted-foreground truncate">
          {identity}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">账户设置</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/journey">我的旅程</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            logout();
          }}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="size-4 mr-2" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
