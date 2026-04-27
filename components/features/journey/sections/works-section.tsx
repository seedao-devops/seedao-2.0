"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useJourney } from "@/lib/features/journey/hooks";
import { useBases } from "@/lib/features/bases/hooks";
import {
  WORK_TYPES,
  WORK_TYPE_LABELS,
} from "@/lib/features/_shared/enums";
import { dateRangeSchema } from "@/lib/features/_shared/validators";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrayCard,
  ArraySectionHeader,
  DateRangeField,
  EditSheet,
  SaveButton,
  SectionCard,
  saveSlice,
} from "./_shared";

const worksSchema = z.object({
  works: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().trim().min(1).max(80),
        type: z.enum(WORK_TYPES),
        baseId: z.string().min(1),
        period: dateRangeSchema,
        description: z.string().trim().max(1000),
        collaborators: z.string().trim().max(200).optional(),
      }),
    )
    .max(100),
});
type WorksInput = z.infer<typeof worksSchema>;

export function WorksSection() {
  const { journey, mutate } = useJourney();
  const { bases } = useBases();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<WorksInput>({
    resolver: zodResolver(worksSchema),
    defaultValues: { works: journey?.works ?? [] },
  });
  const works = useFieldArray({ control: form.control, name: "works" });

  useEffect(() => {
    if (!open && journey) {
      form.reset({ works: journey.works });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey?.works, open]);

  async function onSubmit(values: WorksInput) {
    setSubmitting(true);
    try {
      const ok = await saveSlice(journey, values, mutate);
      if (ok) setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  const count = journey?.works.length ?? 0;
  const summary = journey?.works
    .slice(0, 2)
    .map((w) => w.title)
    .filter(Boolean)
    .join("、");

  return (
    <>
      <SectionCard
        title="作品集"
        count={count > 0 ? `${count} 件` : undefined}
        summary={summary || undefined}
        onEdit={() => setOpen(true)}
      />
      <EditSheet open={open} onOpenChange={setOpen} title="作品集">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ArraySectionHeader
              title="作品"
              onAdd={() =>
                works.append({
                  title: "",
                  type: "ARTICLE",
                  baseId: bases?.[0]?.id ?? "",
                  period: { start: "", end: "" },
                  description: "",
                  collaborators: "",
                })
              }
            />
            <div className="space-y-3">
              {works.fields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  还没有添加作品
                </p>
              ) : null}
              {works.fields.map((f, i) => (
                <ArrayCard key={f.id} onRemove={() => works.remove(i)}>
                  <FormField
                    control={form.control}
                    name={`works.${i}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>作品名称</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`works.${i}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>作品类型</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {WORK_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {WORK_TYPE_LABELS[t]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`works.${i}.baseId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>创作基地</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择基地" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(bases ?? []).map((b) => (
                              <SelectItem key={b.id} value={b.id}>
                                {b.emoji} {b.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DateRangeField
                    form={form}
                    startName={`works.${i}.period.start`}
                    endName={`works.${i}.period.end`}
                  />
                  <FormField
                    control={form.control}
                    name={`works.${i}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>作品描述</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`works.${i}.collaborators`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>合作者</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="名称之间用、分隔"
                            {...field}
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
