"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TagPicker } from "@/components/ui/tag-picker";
import {
  LEVEL_TAGS, LEVEL_TAG_LABELS, SKILL_TAGS,
} from "@/lib/features/_shared/enums";
import {
  coLearningUpsertSchema,
  type CoLearningUpsertInput,
} from "@/lib/features/co-learning/schema";
import type { CoLearningEvent } from "@/lib/features/_shared/fake-db";
import { ApiError, apiDelete, apiPost, apiPut } from "@/lib/api-client";

type BaseRef = { id: string; name: string; emoji: string };

const EMPTY: CoLearningUpsertInput = {
  name: "",
  instructorName: "",
  baseId: "",
  skillTags: [],
  level: "EXPERIENCE",
  period: { start: "", end: "" },
};

export function CoLearningAdminTable({
  events,
  bases,
}: {
  events: CoLearningEvent[];
  bases: BaseRef[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<CoLearningEvent | null>(null);
  const [open, setOpen] = useState(false);

  const baseLookup = useMemo(() => {
    const m = new Map<string, BaseRef>();
    for (const b of bases) m.set(b.id, b);
    return m;
  }, [bases]);

  function openNew() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(e: CoLearningEvent) {
    setEditing(e);
    setOpen(true);
  }

  async function remove(id: string) {
    if (!confirm("确定删除该活动？")) return;
    try {
      await apiDelete(`/api/admin/co-learning/${id}`);
      toast.success("已删除");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) toast.error("删除失败");
      else throw err;
    }
  }

  return (
    <>
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="size-4" />
              新建活动
            </Button>
          </DialogTrigger>
          <EventDialogContent
            key={editing?.id ?? "new"}
            event={editing}
            bases={bases}
            onSaved={() => {
              setOpen(false);
              router.refresh();
            }}
          />
        </Dialog>
      </div>

      <div className="rounded-xl border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>讲师</TableHead>
              <TableHead>基地</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>技能</TableHead>
              <TableHead>时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-12">
                  暂无活动
                </TableCell>
              </TableRow>
            ) : null}
            {events.map((e) => {
              const base = baseLookup.get(e.baseId);
              return (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell className="text-muted-foreground">{e.instructorName}</TableCell>
                  <TableCell>
                    {base ? `${base.emoji} ${base.name}` : <span className="text-muted-foreground">未知</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{LEVEL_TAG_LABELS[e.level]}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {e.skillTags.map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px] py-0 px-1.5">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {e.period.start} → {e.period.end}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(e)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => remove(e.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function EventDialogContent({
  event,
  bases,
  onSaved,
}: {
  event: CoLearningEvent | null;
  bases: BaseRef[];
  onSaved: () => void;
}) {
  const form = useForm<CoLearningUpsertInput>({
    resolver: zodResolver(coLearningUpsertSchema),
    defaultValues: event
      ? {
          name: event.name,
          instructorName: event.instructorName,
          baseId: event.baseId,
          skillTags: event.skillTags,
          level: event.level,
          period: event.period,
        }
      : EMPTY,
  });
  const [busy, setBusy] = useState(false);

  async function onSubmit(values: CoLearningUpsertInput) {
    setBusy(true);
    try {
      try {
        if (event) {
          await apiPut(`/api/admin/co-learning/${event.id}`, values);
        } else {
          await apiPost("/api/admin/co-learning", values);
        }
        toast.success("已保存");
        onSaved();
      } catch (err) {
        if (err instanceof ApiError) toast.error("保存失败");
        else throw err;
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{event ? "编辑活动" : "新建活动"}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>名称</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="instructorName" render={({ field }) => (
              <FormItem><FormLabel>讲师</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="level" render={({ field }) => (
              <FormItem>
                <FormLabel>类型</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {LEVEL_TAGS.map((l) => (
                      <SelectItem key={l} value={l}>{LEVEL_TAG_LABELS[l]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="baseId" render={({ field }) => (
            <FormItem>
              <FormLabel>所在基地</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="选择基地" /></SelectTrigger></FormControl>
                <SelectContent>
                  {bases.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.emoji} {b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="skillTags" render={({ field }) => (
            <FormItem>
              <FormLabel>技能标签</FormLabel>
              <TagPicker options={SKILL_TAGS} value={field.value} onChange={field.onChange} max={10} />
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="period.start" render={({ field }) => (
              <FormItem><FormLabel>开始日期</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="period.end" render={({ field }) => (
              <FormItem><FormLabel>结束日期</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              {busy ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
