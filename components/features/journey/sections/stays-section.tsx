"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useJourney } from "@/lib/features/journey/hooks";
import { useBases } from "@/lib/features/bases/hooks";
import { dateRangeSchema } from "@/lib/features/_shared/validators";
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

const staysSchema = z.object({
  stays: z
    .array(
      z
        .object({
          baseId: z.string().optional(),
          baseNameFree: z.string().trim().max(50).optional(),
          location: z.string().trim().max(80),
          period: dateRangeSchema,
        })
        .refine((s) => Boolean(s.baseId || s.baseNameFree), {
          message: "请选择基地或填写基地名称",
          path: ["baseNameFree"],
        }),
    )
    .max(50),
});
type StaysInput = z.infer<typeof staysSchema>;

export function StaysSection() {
  const { journey, mutate } = useJourney();
  const { bases } = useBases();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<StaysInput>({
    resolver: zodResolver(staysSchema),
    defaultValues: { stays: journey?.stays ?? [] },
  });
  const stays = useFieldArray({ control: form.control, name: "stays" });

  useEffect(() => {
    if (!open && journey) {
      form.reset({ stays: journey.stays });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey?.stays, open]);

  async function onSubmit(values: StaysInput) {
    setSubmitting(true);
    try {
      const ok = await saveSlice(journey, values, mutate);
      if (ok) setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  const count = journey?.stays.length ?? 0;
  const summary = journey?.stays
    .slice(0, 2)
    .map((s) => {
      const base = bases?.find((b) => b.id === s.baseId);
      return base ? `${base.emoji} ${base.name}` : s.baseNameFree || s.location;
    })
    .filter(Boolean)
    .join("、");

  return (
    <>
      <SectionCard
        title="旅居过的基地"
        count={count > 0 ? `${count} 段` : undefined}
        summary={summary || undefined}
        onEdit={() => setOpen(true)}
      />
      <EditSheet open={open} onOpenChange={setOpen} title="旅居过的基地">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ArraySectionHeader
              title="旅居记录"
              onAdd={() =>
                stays.append({
                  baseId: bases?.[0]?.id ?? "",
                  location: "",
                  period: { start: "", end: "" },
                })
              }
            />
            <div className="space-y-3">
              {stays.fields.length === 0 ? (
                <p className="text-body text-muted-foreground text-center py-6">
                  还没有添加旅居记录
                </p>
              ) : null}
              {stays.fields.map((f, i) => (
                <ArrayCard key={f.id} onRemove={() => stays.remove(i)}>
                  <FormField
                    control={form.control}
                    name={`stays.${i}.baseId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>基地</FormLabel>
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
                                {b.emoji} {b.name}（{b.province}{b.city}）
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
                    name={`stays.${i}.location`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>地点描述</FormLabel>
                        <FormControl>
                          <Input placeholder="例如：云南大理双廊" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DateRangeField
                    form={form}
                    startName={`stays.${i}.period.start`}
                    endName={`stays.${i}.period.end`}
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
