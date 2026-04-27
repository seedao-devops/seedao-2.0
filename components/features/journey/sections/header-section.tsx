"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RefreshCw } from "lucide-react";
import { nanoid } from "nanoid";
import { useJourney } from "@/lib/features/journey/hooks";
import { nicknameSchema } from "@/lib/features/_shared/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EditSheet } from "@/components/ui/edit-sheet";
import {
  SectionCard,
  SaveButton,
  saveSlice,
} from "./_shared";

const headerSchema = z.object({
  avatarUrl: z.string().trim().max(500),
  displayName: nicknameSchema,
  bio: z.string().trim().max(500),
});
type HeaderInput = z.infer<typeof headerSchema>;

export function HeaderSection() {
  const { journey, mutate } = useJourney();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<HeaderInput>({
    resolver: zodResolver(headerSchema),
    defaultValues: {
      avatarUrl: journey?.avatarUrl ?? "",
      displayName: journey?.displayName ?? "",
      bio: journey?.bio ?? "",
    },
  });

  // Sync form state to incoming journey when sheet is closed (e.g. after save).
  useEffect(() => {
    if (!open && journey) {
      form.reset({
        avatarUrl: journey.avatarUrl,
        displayName: journey.displayName,
        bio: journey.bio,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey?.avatarUrl, journey?.displayName, journey?.bio, open]);

  const avatar = form.watch("avatarUrl");
  function regenAvatar() {
    form.setValue(
      "avatarUrl",
      `https://api.dicebear.com/9.x/lorelei/svg?seed=${nanoid(6)}`,
      { shouldDirty: true },
    );
  }

  async function onSubmit(values: HeaderInput) {
    setSubmitting(true);
    try {
      const ok = await saveSlice(journey, values, mutate);
      if (ok) setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SectionCard
        title={journey?.displayName ?? "我的资料"}
        summary={journey?.bio || undefined}
        onEdit={() => setOpen(true)}
      />
      <EditSheet open={open} onOpenChange={setOpen} title="编辑资料">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-4">
              {avatar ? (
                <Image
                  src={avatar}
                  alt="avatar"
                  width={64}
                  height={64}
                  unoptimized
                  className="size-16 rounded-full border bg-muted"
                />
              ) : null}
              <Button type="button" variant="outline" onClick={regenAvatar}>
                <RefreshCw className="size-4" />
                换一个
              </Button>
            </div>
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户名</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>自我介绍</FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FormDescription>最多 500 字</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SaveButton submitting={submitting} />
          </form>
        </Form>
      </EditSheet>
    </>
  );
}
