import Link from "next/link";
import { getSession } from "@/lib/features/auth/session";
import { findUserById } from "@/lib/features/auth/repo";
import { UserBottomNav } from "./user-bottom-nav";
import { UserHeaderMenu } from "./user-header-menu";

/**
 * Mobile-first shell. Centers a max-w-md column, with a top brand bar and a
 * sticky bottom navigation. Auth-required nav items still render for guests;
 * proxy.ts redirects them to /login on tap.
 */
export async function UserShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session ? await findUserById(session.sub) : null;
  const identity = user?.email ?? user?.phone ?? "";
  return (
    <div className="mx-auto w-full max-w-md min-h-dvh flex flex-col bg-background relative">
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 bg-background/80 backdrop-blur border-b">
        <Link href="/" className="text-lg font-serif font-bold tracking-tight">
          SeeDAO
        </Link>
        {user ? (
          <UserHeaderMenu identity={identity} />
        ) : (
          <Link
            href="/login"
            className="text-sm text-primary font-medium hover:underline"
          >
            登录
          </Link>
        )}
      </header>
      <main className="flex-1 pb-24">{children}</main>
      <UserBottomNav />
    </div>
  );
}
