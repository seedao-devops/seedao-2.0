"use client";

import { useState } from "react";
import Image from "next/image";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import {
  journeyUpsertSchema,
  type JourneyUpsertInput,
} from "@/lib/features/journey/schema";
import {
  WORK_TYPES,
  WORK_TYPE_LABELS,
  WISH_CATEGORIES,
} from "@/lib/features/_shared/enums";
import type { Base, CoLearningEvent, Journey } from "@/lib/features/_shared/fake-db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function ProfileEditor({
  journey,
  bases,
  events,
}: {
  journey: Journey;
  bases: Base[];
  events: CoLearningEvent[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<JourneyUpsertInput>({
    resolver: zodResolver(journeyUpsertSchema),
    defaultValues: {
      avatarUrl: journey.avatarUrl,
      displayName: journey.displayName,
      bio: journey.bio,
      stays: journey.stays,
      learningRecords: journey.learningRecords,
      teachingRecords: journey.teachingRecords,
      works: journey.works,
      wishToLearn: journey.wishToLearn,
      fieldVisibility: journey.fieldVisibility,
    },
  });

  const stays = useFieldArray({ control: form.control, name: "stays" });
  const learning = useFieldArray({ control: form.control, name: "learningRecords" });
  const teaching = useFieldArray({ control: form.control, name: "teachingRecords" });
  const works = useFieldArray({ control: form.control, name: "works" });
  const wishes = useFieldArray({ control: form.control, name: "wishToLearn" });

  const avatar = form.watch("avatarUrl");
  function regenAvatar() {
    form.setValue(
      "avatarUrl",
      `https://api.dicebear.com/9.x/lorelei/svg?seed=${nanoid(6)}`,
      { shouldDirty: true },
    );
  }

  async function onSubmit(values: JourneyUpsertInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/journey/me", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        toast.error("保存失败");
        return;
      }
      toast.success("已保存");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Avatar + name + bio */}
        <Card className="p-5 space-y-4">
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
                  <Textarea rows={4} {...field} />
                </FormControl>
                <FormDescription>最多 500 字</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        {/* Stays */}
        <ArraySection
          title="旅居过的基地"
          onAdd={() =>
            stays.append({
              baseId: bases[0]?.id ?? "",
              location: "",
              period: { start: "", end: "" },
            })
          }
        >
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
                        {bases.map((b) => (
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
              <DateRangeField name={`stays.${i}.period`} form={form} />
            </ArrayCard>
          ))}
        </ArraySection>

        {/* Learning */}
        <ArraySection
          title="学习记录"
          onAdd={() =>
            learning.append({ eventId: events[0]?.id ?? "" })
          }
        >
          {learning.fields.map((f, i) => (
            <ArrayCard key={f.id} onRemove={() => learning.remove(i)}>
              <EventPickerField
                form={form}
                name={`learningRecords.${i}.eventId`}
                events={events}
              />
            </ArrayCard>
          ))}
        </ArraySection>

        {/* Teaching */}
        <ArraySection
          title="教学记录"
          onAdd={() =>
            teaching.append({ eventId: events[0]?.id ?? "", studentCount: 0 })
          }
        >
          {teaching.fields.map((f, i) => (
            <ArrayCard key={f.id} onRemove={() => teaching.remove(i)}>
              <EventPickerField
                form={form}
                name={`teachingRecords.${i}.eventId`}
                events={events}
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
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </ArrayCard>
          ))}
        </ArraySection>

        {/* Works */}
        <ArraySection
          title="作品集"
          onAdd={() =>
            works.append({
              title: "",
              type: "ARTICLE",
              baseId: bases[0]?.id ?? "",
              period: { start: "", end: "" },
              description: "",
              collaborators: "",
            })
          }
        >
          {works.fields.map((f, i) => (
            <ArrayCard key={f.id} onRemove={() => works.remove(i)}>
              <FormField
                control={form.control}
                name={`works.${i}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>作品名称</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
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
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {WORK_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{WORK_TYPE_LABELS[t]}</SelectItem>
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
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="选择基地" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {bases.map((b) => (
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
              <DateRangeField name={`works.${i}.period`} form={form} />
              <FormField
                control={form.control}
                name={`works.${i}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>作品描述</FormLabel>
                    <FormControl><Textarea rows={3} {...field} /></FormControl>
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
                    <FormControl><Input placeholder="名称之间用、分隔" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </ArrayCard>
          ))}
        </ArraySection>

        {/* Wishes */}
        <ArraySection
          title="想学的"
          onAdd={() => wishes.append({ skillName: "", category: "数字" })}
        >
          {wishes.fields.map((f, i) => (
            <ArrayCard key={f.id} onRemove={() => wishes.remove(i)}>
              <FormField
                control={form.control}
                name={`wishToLearn.${i}.skillName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>技能名称</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
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
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {WISH_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c === "CUSTOM" ? "其他" : c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </ArrayCard>
          ))}
        </ArraySection>

        <Button type="submit" disabled={submitting} className="w-full">
          <Save className="size-4" />
          {submitting ? "保存中..." : "保存"}
        </Button>
      </form>
    </Form>
  );
}

// ---------- helpers ----------

function ArraySection({
  title,
  onAdd,
  children,
}: {
  title: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold">{title}</h3>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="size-4" />
          添加
        </Button>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ArrayCard({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <Card className="p-4 space-y-3 relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="size-4" />
      </Button>
      {children}
    </Card>
  );
}

function DateRangeField({
  form,
  name,
}: {
  form: ReturnType<typeof useForm<JourneyUpsertInput>>;
  name: `stays.${number}.period` | `works.${number}.period`;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField
        control={form.control}
        name={`${name}.start` as never}
        render={({ field }) => (
          <FormItem>
            <FormLabel>开始</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${name}.end` as never}
        render={({ field }) => (
          <FormItem>
            <FormLabel>结束</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function EventPickerField({
  form,
  name,
  events,
}: {
  form: ReturnType<typeof useForm<JourneyUpsertInput>>;
  name: `learningRecords.${number}.eventId` | `teachingRecords.${number}.eventId`;
  events: CoLearningEvent[];
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>共学活动</FormLabel>
          <Select onValueChange={field.onChange} value={(field.value as string) || ""}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="选择活动" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}（{e.instructorName}）
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
