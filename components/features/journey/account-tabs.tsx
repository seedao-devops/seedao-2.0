"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useJourney } from "@/lib/features/journey/hooks";
import { useMe } from "@/lib/features/auth/hooks";
import { ProfileEditor } from "./profile-editor";
import { SecurityPanel } from "./security-panel";
import { SharePanel } from "./share-panel";

export function AccountTabs({ userId }: { userId: string }) {
  const { journey } = useJourney();
  const { user } = useMe();

  return (
    <Tabs defaultValue="profile" className="space-y-4">
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="profile">资料</TabsTrigger>
        <TabsTrigger value="security">安全</TabsTrigger>
        <TabsTrigger value="share">分享</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="space-y-4">
        <ProfileEditor />
      </TabsContent>
      <TabsContent value="security" className="space-y-4">
        <SecurityPanel
          contact={{
            phone: user?.phone ?? undefined,
            email: user?.email ?? undefined,
          }}
        />
      </TabsContent>
      <TabsContent value="share" className="space-y-4">
        {journey ? (
          <SharePanel
            userId={userId}
            initialVisibility={journey.fieldVisibility}
          />
        ) : (
          <Card className="p-6">
            <Skeleton className="h-4 w-1/3" />
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
