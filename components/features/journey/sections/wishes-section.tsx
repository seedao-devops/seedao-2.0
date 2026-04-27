"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useJourney } from "@/lib/features/journey/hooks";
import { WISH_CATEGORIES } from "@/lib/features/_shared/enums";
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
  EditSheet,
  SaveButton,
  SectionCard,
  saveSlice,
} from "./_shared";

const wishesSchema = z.object({
  wishToLearn: z
    .array(
      z.object({
        skillName: z.string().trim().min(1).max(30),
        category: z.enum(WISH_CATEGORIES),
      }),
    )
    .max(50),
});
type WishesInput = z.infer<typeof wishesSchema>;

export function WishesSection() {
  const { journey, mutate } = useJourney();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<WishesInput>({
    resolver: zodResolver(wishesSchema),
    defaultValues: { wishToLearn: journey?.wishToLearn ?? [] },
  });
  const wishes = useFieldArray({
    control: form.control,
    name: "wishToLearn",
  });

  useEffect(() => {
    if (!open && journey) {
      form.reset({ wishToLearn: journey.wishToLearn });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey?.wishToLearn, open]);

  async function onSubmit(values: WishesInput) {
    setSubmitting(true);
    try {
      const ok = await saveSlice(journey, values, mutate);
      if (ok) setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  const count = journey?.wishToLearn.length ?? 0;
  const summary = journey?.wishToLearn
    .slice(0, 3)
    .map((w) => w.skillName)
    .filter(Boolean)
    .join("、");

  return (
    <>
      <SectionCard
        title="想学的"
        count={count > 0 ? `${count} 项` : undefined}
        summary={summary || undefined}
        onEdit={() => setOpen(true)}
      />
      <EditSheet open={open} onOpenChange={setOpen} title="想学的">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ArraySectionHeader
              title="想学的技能"
              onAdd={() =>
                wishes.append({ skillName: "", category: "数字" })
              }
            />
            <div className="space-y-3">
              {wishes.fields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  还没有添加想学的技能
                </p>
              ) : null}
              {wishes.fields.map((f, i) => (
                <ArrayCard key={f.id} onRemove={() => wishes.remove(i)}>
                  <FormField
                    control={form.control}
                    name={`wishToLearn.${i}.skillName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>技能名称</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`wishToLearn.${i}.category`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>分类</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {WISH_CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c === "CUSTOM" ? "其他" : c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
