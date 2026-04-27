import { getSession } from "@/lib/features/auth/session";
import { JourneyClient } from "@/components/features/journey/journey-client";

export default async function JourneyPage() {
  const session = await getSession();
  if (!session) return null;
  return <JourneyClient />;
}
