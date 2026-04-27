"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useJourney } from "@/lib/features/journey/hooks";
import { useCoLearningEvents } from "@/lib/features/co-learning/hooks";
import { Form } from "@/components/ui/form";
import {
  ArrayCard,
  ArraySectionHeader,
  EditSheet,
  EventPickerField,
  SaveButton,
  SectionCard,
  saveSlice,
} from "./_shared";

const learningSchema = z.object({
  learningRecords: z.array(z.object({ eventId: z.string().min(1) })).max(200),
});
type LearningInput = z.infer<typeof learningSchema>;

export function LearningSection() {
  const { journey, mutate } = useJourney();
  const { events } = useCoLearningEvents();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LearningInput>({
    resolver: zodResolver(learningSchema),
    defaultValues: { learningRecords: journey?.learningRecords ?? [] },
  });
  const learning = useFieldArray({
    control: form.control,
    name: "learningRecords",
  });

  useEffect(() => {
    if (!open && journey) {
      form.reset({ learningRecords: journey.learningRecords });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey?.learningRecords, open]);

  async function onSubmit(values: LearningInput) {
    setSubmitting(true);
    try {
      const ok = await saveSlice(journey, values, mutate);
      if (ok) setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  const count = journey?.learningRecords.length ?? 0;
  const summary = journey?.learningRecords
    .slice(0, 2)
    .map((l) => events?.find((e) => e.id === l.eventId)?.name)
    .filter(Boolean)
    .join("、");

  return (
    <>
      <SectionCard
        title="学习记录"
        count={count > 0 ? `${count} 条` : undefined}
        summary={summary || undefined}
        onEdit={() => setOpen(true)}
      />
      <EditSheet open={open} onOpenChange={setOpen} title="学习记录">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ArraySectionHeader
              title="参与的共学活动"
              onAdd={() =>
                learning.append({ eventId: events?.[0]?.id ?? "" })
              }
            />
            <div className="space-y-3">
              {learning.fields.length === 0 ? (
                <p className="text-body text-muted-foreground text-center py-6">
                  还没有添加学习记录
                </p>
              ) : null}
              {learning.fields.map((f, i) => (
                <ArrayCard key={f.id} onRemove={() => learning.remove(i)}>
                  <EventPickerField
                    form={form}
                    name={`learningRecords.${i}.eventId`}
                    events={events ?? []}
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
