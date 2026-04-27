"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useJourney } from "@/lib/features/journey/hooks";
import { useCoLearningEvents } from "@/lib/features/co-learning/hooks";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ArrayCard,
  ArraySectionHeader,
  EditSheet,
  EventPickerField,
  SaveButton,
  SectionCard,
  saveSlice,
} from "./_shared";

const teachingSchema = z.object({
  teachingRecords: z
    .array(
      z.object({
        eventId: z.string().min(1),
        studentCount: z.number().int().min(0).max(999),
      }),
    )
    .max(200),
});
type TeachingInput = z.infer<typeof teachingSchema>;

export function TeachingSection() {
  const { journey, mutate } = useJourney();
  const { events } = useCoLearningEvents();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<TeachingInput>({
    resolver: zodResolver(teachingSchema),
    defaultValues: { teachingRecords: journey?.teachingRecords ?? [] },
  });
  const teaching = useFieldArray({
    control: form.control,
    name: "teachingRecords",
  });

  useEffect(() => {
    if (!open && journey) {
      form.reset({ teachingRecords: journey.teachingRecords });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey?.teachingRecords, open]);

  async function onSubmit(values: TeachingInput) {
    setSubmitting(true);
    try {
      const ok = await saveSlice(journey, values, mutate);
      if (ok) setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  const count = journey?.teachingRecords.length ?? 0;
  const summary = journey?.teachingRecords
    .slice(0, 2)
    .map((t) => {
      const event = events?.find((e) => e.id === t.eventId);
      return event ? `${event.name}（${t.studentCount}人）` : null;
    })
    .filter(Boolean)
    .join("、");

  return (
    <>
      <SectionCard
        title="教学记录"
        count={count > 0 ? `${count} 条` : undefined}
        summary={summary || undefined}
        onEdit={() => setOpen(true)}
      />
      <EditSheet open={open} onOpenChange={setOpen} title="教学记录">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ArraySectionHeader
              title="带领的共学活动"
              onAdd={() =>
                teaching.append({
                  eventId: events?.[0]?.id ?? "",
                  studentCount: 0,
                })
              }
            />
            <div className="space-y-3">
              {teaching.fields.length === 0 ? (
                <p className="text-body text-muted-foreground text-center py-6">
                  还没有添加教学记录
                </p>
              ) : null}
              {teaching.fields.map((f, i) => (
                <ArrayCard key={f.id} onRemove={() => teaching.remove(i)}>
                  <EventPickerField
                    form={form}
                    name={`teachingRecords.${i}.eventId`}
                    events={events ?? []}
                  />
                  <FormField
                    control={form.control}
                    name={`teachingRecords.${i}.studentCount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>学员人数</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={999}
                            value={field.value ?? 0}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </ArrayCard>
              ))}
            </div>
            <SaveButton submitting={submitting} />
          </form>
        </Form>
      </EditSheet>
    </>
  );
}
