import { redirect } from "next/navigation";
import { UserShell } from "@/components/layout/user-shell";
import { getSession } from "@/lib/features/auth/session";
import { getApplicationByUser } from "@/lib/features/applications/repo";

export default async function UserLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session) redirect("/login");

  // Member-only sections (journey + account) require an approved application.
  // Logged-in users still under review get bounced to /register, where the
  // ApplicationStatus view renders their progress timeline. Admins skip this
  // check since they have no application of their own.
  if (session.role === "user") {
    const application = await getApplicationByUser(session.sub);
    if (!application || application.reviewStatus !== "APPROVED") {
      redirect("/register");
    }
  }
  return <UserShell>{children}</UserShell>;
}
