import { getSession } from "@/lib/features/auth/session";
import { AccountTabs } from "@/components/features/journey/account-tabs";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) return null;
  return (
    <div className="px-5 pt-4 pb-8 space-y-5">
      <h1 className="text-2xl font-serif font-bold">账户管理</h1>
      <AccountTabs userId={session.sub} />
    </div>
  );
}
