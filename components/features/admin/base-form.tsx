"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  baseUpsertSchema,
  type BaseUpsertInput,
} from "@/lib/features/bases/schema";
import {
  BASE_TAGS,
  CN_PROVINCES,
  PROJECT_STATUS,
  PROJECT_STATUS_LABELS,
  SKILL_TAGS,
} from "@/lib/features/_shared/enums";
import type { Base } from "@/lib/features/_shared/fake-db";
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
import { TagPicker } from "@/components/ui/tag-picker";
import { ApiError, apiDelete, apiPost, apiPut } from "@/lib/api-client";

const EMPTY: BaseUpsertInput = {
  emoji: "🏡",
  name: "",
  province: "云南",
  city: "",
  description: "",
  tags: [],
  localLife: { accommodations: [], coworking: [], tourism: [] },
  applyUrl: "https://",
  skillsOffered: [],
  skillsNeeded: [],
  localProjects: [],
  timeline: [],
};

export function BaseForm({
  mode,
  baseId,
  initial,
}: {
  mode: "create" | "edit";
  baseId?: string;
  initial?: Base;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const form = useForm<BaseUpsertInput>({
    resolver: zodResolver(baseUpsertSchema),
    defaultValues: initial
      ? {
          emoji: initial.emoji,
          name: initial.name,
          province: initial.province,
          city: initial.city,
          description: initial.description,
          tags: initial.tags,
          localLife: initial.localLife,
          applyUrl: initial.applyUrl,
          skillsOffered: initial.skillsOffered,
          skillsNeeded: initial.skillsNeeded,
          localProjects: initial.localProjects,
          timeline: initial.timeline,
          lat: initial.lat,
          lng: initial.lng,
        }
      : EMPTY,
  });

  const accommodations = useFieldArray({ control: form.control, name: "localLife.accommodations" });
  const coworking = useFieldArray({ control: form.control, name: "localLife.coworking" });
  const tourism = useFieldArray({ control: form.control, name: "localLife.tourism" });
  const projects = useFieldArray({ control: form.control, name: "localProjects" });
  const timeline = useFieldArray({ control: form.control, name: "timeline" });

  async function onSubmit(values: BaseUpsertInput) {
    setBusy(true);
    try {
      try {
        if (mode === "create") {
          await apiPost("/api/admin/bases", values);
        } else {
          await apiPut(`/api/admin/bases/${baseId}`, values);
        }
        toast.success("已保存");
        router.push("/admin/bases");
        router.refresh();
      } catch (err) {
        if (err instanceof ApiError) toast.error("保存失败");
        else throw err;
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!baseId) return;
    if (!confirm("确定删除该基地？")) return;
    try {
      await apiDelete(`/api/admin/bases/${baseId}`);
      toast.success("已删除");
      router.push("/admin/bases");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) toast.error("删除失败");
      else throw err;
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <Section title="基本信息">
          <div className="grid grid-cols-[80px_1fr] gap-3">
            <FormField
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emoji</FormLabel>
                  <FormControl><Input className="text-2xl text-center" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名称</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>省份</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {CN_PROVINCES.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>城市/地点</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>简介</FormLabel>
                <FormControl><Textarea rows={4} {...field} /></FormControl>
                <FormDescription>最多 1000 字</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>类型</FormLabel>
                <TagPicker options={BASE_TAGS} value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="applyUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>申请入住链接</FormLabel>
                <FormControl><Input type="url" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        {/* Local life */}
        <Section title="在地生活">
          <ArrayBlock title="住宿" onAdd={() => accommodations.append({ name: "", price: "" })}>
            {accommodations.fields.map((f, i) => (
              <ArrayRow key={f.id} onRemove={() => accommodations.remove(i)}>
                <FormField control={form.control} name={`localLife.accommodations.${i}.name`} render={({ field }) => (
                  <FormItem className="flex-1"><FormLabel>名称</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name={`localLife.accommodations.${i}.price`} render={({ field }) => (
                  <FormItem className="w-32"><FormLabel>价格</FormLabel><FormControl><Input placeholder="¥120/晚" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </ArrayRow>
            ))}
          </ArrayBlock>
          <ArrayBlock title="共享工位" onAdd={() => coworking.append({ name: "" })}>
            {coworking.fields.map((f, i) => (
              <ArrayRow key={f.id} onRemove={() => coworking.remove(i)}>
                <FormField control={form.control} name={`localLife.coworking.${i}.name`} render={({ field }) => (
                  <FormItem className="flex-1"><FormLabel>名称</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </ArrayRow>
            ))}
          </ArrayBlock>
          <ArrayBlock title="周边" onAdd={() => tourism.append({ name: "", customTags: [] })}>
            {tourism.fields.map((f, i) => (
              <ArrayRow key={f.id} onRemove={() => tourism.remove(i)} stack>
                <FormField control={form.control} name={`localLife.tourism.${i}.name`} render={({ field }) => (
                  <FormItem><FormLabel>名称</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name={`localLife.tourism.${i}.customTags`} render={({ field }) => (
                  <FormItem>
                    <FormLabel>标签</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="逗号分隔，例如：徒步,温泉,寺庙"
                        value={(field.value ?? []).join(",")}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                              .slice(0, 6),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </ArrayRow>
            ))}
          </ArrayBlock>
        </Section>

        {/* Skills */}
        <Section title="技能交换">
          <FormField control={form.control} name="skillsOffered" render={({ field }) => (
            <FormItem><FormLabel>可提供</FormLabel><TagPicker options={SKILL_TAGS} value={field.value} onChange={field.onChange} /><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="skillsNeeded" render={({ field }) => (
            <FormItem><FormLabel>需要</FormLabel><TagPicker options={SKILL_TAGS} value={field.value} onChange={field.onChange} /><FormMessage /></FormItem>
          )} />
        </Section>

        {/* Local projects */}
        <Section title="在地项目">
          <ArrayBlock
            title=""
            onAdd={() =>
              projects.append({
                name: "",
                status: "RECRUITING",
                description: "",
                requiredSkills: [],
                period: { start: "", end: "" },
              })
            }
          >
            {projects.fields.map((f, i) => (
              <Card key={f.id} className="p-4 space-y-3 relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                  onClick={() => projects.remove(i)}
                >
                  <Trash2 className="size-4" />
                </Button>
                <FormField control={form.control} name={`localProjects.${i}.name`} render={({ field }) => (
                  <FormItem><FormLabel>项目名称</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name={`localProjects.${i}.status`} render={({ field }) => (
                  <FormItem>
                    <FormLabel>状态</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {PROJECT_STATUS.map((s) => (
                          <SelectItem key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name={`localProjects.${i}.description`} render={({ field }) => (
                  <FormItem><FormLabel>描述</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name={`localProjects.${i}.requiredSkills`} render={({ field }) => (
                  <FormItem><FormLabel>需要的技能</FormLabel><TagPicker options={SKILL_TAGS} value={field.value} onChange={field.onChange} /><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name={`localProjects.${i}.period.start`} render={({ field }) => (
                    <FormItem><FormLabel>开始</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`localProjects.${i}.period.end`} render={({ field }) => (
                    <FormItem><FormLabel>结束</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </Card>
            ))}
          </ArrayBlock>
        </Section>

        {/* Timeline */}
        <Section title="时间线">
          <ArrayBlock
            title=""
            onAdd={() =>
              timeline.append({ emoji: "✨", date: "", title: "", description: "" })
            }
          >
            {timeline.fields.map((f, i) => (
              <Card key={f.id} className="p-4 space-y-3 relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                  onClick={() => timeline.remove(i)}
                >
                  <Trash2 className="size-4" />
                </Button>
                <div className="grid grid-cols-[60px_140px_1fr] gap-3">
                  <FormField control={form.control} name={`timeline.${i}.emoji`} render={({ field }) => (
                    <FormItem><FormLabel>Emoji</FormLabel><FormControl><Input className="text-center text-xl" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`timeline.${i}.date`} render={({ field }) => (
                    <FormItem><FormLabel>日期</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`timeline.${i}.title`} render={({ field }) => (
                    <FormItem><FormLabel>标题</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name={`timeline.${i}.description`} render={({ field }) => (
                  <FormItem><FormLabel>描述</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </Card>
            ))}
          </ArrayBlock>
        </Section>

        <div className="flex gap-3 sticky bottom-4 bg-background/95 backdrop-blur p-3 rounded-lg border">
          <Button type="submit" disabled={busy} className="flex-1">
            <Save className="size-4" />
            {busy ? "保存中..." : "保存"}
          </Button>
          {mode === "edit" ? (
            <Button type="button" variant="destructive" onClick={remove}>
              <Trash2 className="size-4" />
              删除
            </Button>
          ) : null}
        </div>
      </form>
    </Form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 space-y-4">
      <h3>{title}</h3>
      {children}
    </Card>
  );
}

function ArrayBlock({
  title,
  onAdd,
  children,
}: {
  title: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {title ? <h4 className="text-body font-sans font-medium">{title}</h4> : <span />}
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="size-4" />
          添加
        </Button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ArrayRow({
  children,
  onRemove,
  stack,
}: {
  children: React.ReactNode;
  onRemove: () => void;
  stack?: boolean;
}) {
  return (
    <div className={`flex ${stack ? "flex-col gap-2" : "items-end gap-2"}`}>
      <div className={`flex-1 ${stack ? "" : "flex gap-2"}`}>{children}</div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive shrink-0"
        onClick={onRemove}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
