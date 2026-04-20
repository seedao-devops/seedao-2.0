import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { getSession } from "@/lib/features/auth/session";
import { findUserById } from "@/lib/features/auth/repo";

export default async function AdminAuthedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");
  const user = await findUserById(session.sub);
  return <AdminShell email={user?.email ?? ""}>{children}</AdminShell>;
}
