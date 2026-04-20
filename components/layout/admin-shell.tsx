import Link from "next/link";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";

/**
 * Desktop-first admin shell. Sidebar on the left, content area on the right.
 * Hidden from public navigation; reachable only via /admin URL.
 */
export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  return (
    <div className="min-h-dvh flex bg-muted/30">
      <aside className="hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="px-5 py-4 border-b">
          <Link href="/admin/applications" className="font-serif font-bold text-lg">
            SeeDAO 控制台
          </Link>
        </div>
        <AdminSidebar />
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader email={email} />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[96rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}
