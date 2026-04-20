"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Base, CoLearningEvent, Journey } from "@/lib/features/_shared/fake-db";
import { ProfileEditor } from "./profile-editor";
import { SecurityPanel } from "./security-panel";
import { SharePanel } from "./share-panel";

export function AccountTabs({
  userId,
  contact,
  journey,
  bases,
  events,
}: {
  userId: string;
  contact: { phone?: string; email?: string };
  journey: Journey;
  bases: Base[];
  events: CoLearningEvent[];
}) {
  return (
    <Tabs defaultValue="profile" className="space-y-4">
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="profile">资料</TabsTrigger>
        <TabsTrigger value="security">安全</TabsTrigger>
        <TabsTrigger value="share">分享</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="space-y-4">
        <ProfileEditor journey={journey} bases={bases} events={events} />
      </TabsContent>
      <TabsContent value="security" className="space-y-4">
        <SecurityPanel contact={contact} />
      </TabsContent>
      <TabsContent value="share" className="space-y-4">
        <SharePanel userId={userId} initialVisibility={journey.fieldVisibility} />
      </TabsContent>
    </Tabs>
  );
}
