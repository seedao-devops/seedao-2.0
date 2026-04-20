import { redirect } from "next/navigation";
import { UserShell } from "@/components/layout/user-shell";
import { getSession } from "@/lib/features/auth/session";

export default async function UserLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session) redirect("/login");
  return <UserShell>{children}</UserShell>;
}
