import Link from "next/link";
import { getSession } from "@/lib/features/auth/session";
import { findUserById } from "@/lib/features/auth/repo";
import {
  defaultJourneyFor,
  getJourneyByUser,
} from "@/lib/features/journey/repo";
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
  // Pull the user's journey so the header avatar matches what they've set on
  // their profile. Falls back to the same dicebear default the journey repo
  // uses, so guests-just-logged-in still see *something* visibly personal.
  const journey = user ? await getJourneyByUser(user.id) : null;
  const fallback = user ? defaultJourneyFor(user.id, identity) : null;
  const avatarUrl = journey?.avatarUrl ?? fallback?.avatarUrl ?? "";
  const displayName = journey?.displayName ?? identity;
  return (
    <div className="mx-auto w-full max-w-md min-h-dvh flex flex-col bg-background relative">
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 bg-background/80 backdrop-blur border-b">
        <Link href="/" className="text-h4 font-serif font-bold">
          SeeDAO
        </Link>
        {user ? (
          <UserHeaderMenu
            identity={identity}
            avatarUrl={avatarUrl}
            displayName={displayName}
          />
        ) : (
          <Link
            href="/login"
            className="text-body text-primary font-medium hover:underline"
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
