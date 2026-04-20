import { redirect } from "next/navigation";
import { getSession } from "@/lib/features/auth/session";
import { getApplicationByUser } from "@/lib/features/applications/repo";
import { RegisterWizard } from "@/components/features/applications/register-wizard";
import { ApplicationStatus } from "@/components/features/applications/application-status";

export default async function RegisterPage() {
  const session = await getSession();

  if (session) {
    // Logged-in user: show their application progress instead of the form.
    const app = await getApplicationByUser(session.sub);
    if (!app) {
      // Shouldn't normally happen since register creates an application; fall
      // through to wizard so they can create one.
      return <RegisterWizard />;
    }
    if (app.reviewStatus === "APPROVED") redirect("/journey");
    return <ApplicationStatus application={app} />;
  }

  return <RegisterWizard />;
}
