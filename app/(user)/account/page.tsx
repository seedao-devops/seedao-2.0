import { getSession } from "@/lib/features/auth/session";
import { getJourneyByUser, defaultJourneyFor } from "@/lib/features/journey/repo";
import { getApplicationByUser } from "@/lib/features/applications/repo";
import { findUserById } from "@/lib/features/auth/repo";
import { getTable } from "@/lib/features/_shared/fake-db";
import { AccountTabs } from "@/components/features/journey/account-tabs";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) return null;
  const [user, app, bases, events] = await Promise.all([
    findUserById(session.sub),
    getApplicationByUser(session.sub),
    getTable("bases"),
    getTable("coLearningEvents"),
  ]);
  let journey = await getJourneyByUser(session.sub);
  if (!journey) journey = defaultJourneyFor(session.sub, app?.nickname ?? "新成员");

  return (
    <div className="px-5 pt-4 pb-8 space-y-5">
      <h1 className="text-2xl font-serif font-bold">账户管理</h1>
      <AccountTabs
        userId={session.sub}
        contact={{ phone: user?.phone, email: user?.email }}
        journey={journey}
        bases={bases}
        events={events}
      />
    </div>
  );
}
