"use client";

import * as React from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError, apiPut } from "@/lib/api-client";
import type {
  CoLearningEvent,
  Journey,
} from "@/lib/features/_shared/fake-db";
import type { JourneyUpsertInput } from "@/lib/features/journey/schema";

/**
 * Picks the Journey-shaped fields a section can change. Each section's
 * `slice` form value is merged into the cached journey before being PUT
 * to `/api/journey/me`, so the schema and API contract stay unchanged.
 */
export type JourneySlice = Partial<JourneyUpsertInput>;

/** Build the full upsert payload for `/api/journey/me` from a slice. */
export function buildPayload(
  journey: Journey,
  slice: JourneySlice,
): JourneyUpsertInput {
  return {
    avatarUrl: journey.avatarUrl,
    displayName: journey.displayName,
    bio: journey.bio,
    stays: journey.stays,
    learningRecords: journey.learningRecords,
    teachingRecords: journey.teachingRecords,
    works: journey.works,
    wishToLearn: journey.wishToLearn,
    fieldVisibility: journey.fieldVisibility,
    ...slice,
  };
}

/**
 * Persist a section slice. Returns true on success, false otherwise.
 * Toasts both the success and any unexpected error so callers can stay slim.
 */
export async function saveSlice(
  journey: Journey | undefined,
  slice: JourneySlice,
  mutate: () => Promise<unknown>,
): Promise<boolean> {
  if (!journey) {
    toast.error("数据未就绪，请稍后重试");
    return false;
  }
  try {
    await apiPut("/api/journey/me", buildPayload(journey, slice));
    toast.success("已保存");
    await mutate();
    return true;
  } catch (err) {
    if (err instanceof ApiError) {
      toast.error("保存失败");
      return false;
    }
    throw err;
  }
}

/**
 * Bottom-drawer shell every section uses for its editor. `open` is controlled
 * by the parent so the Card's "编辑" button can drive it.
 *
 * Mobile-first: the sheet slides up from the bottom with a drag-handle hint
 * and rounded top corners, scrolls inside while the title stays sticky, and
 * respects iOS `safe-area-inset-bottom`. Centered with a max width on desktop
 * so it doesn't span the full viewport.
 */
export function EditSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="gap-0">
        <div
          aria-hidden
          className="sticky top-0 z-10 flex justify-center bg-background pt-2.5 pb-1"
        >
          <div className="h-1 w-10 rounded-full bg-muted-foreground/40" />
        </div>
        <SheetHeader className="sticky top-[18px] z-10 border-b bg-background px-5 pt-2 pb-3 text-left">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className={description ? undefined : "sr-only"}>
            {description ?? `编辑${title}`}
          </SheetDescription>
        </SheetHeader>
        <div className="px-5 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Card shell with a header row and an "编辑" button on the right. */
export function SectionCard({
  title,
  summary,
  count,
  onEdit,
}: {
  title: string;
  summary?: string;
  count?: string;
  onEdit: () => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4>{title}</h4>
            {count ? (
              <span className="text-caption text-muted-foreground rounded-full bg-muted px-2 py-0.5">
                {count}
              </span>
            ) : null}
          </div>
          {summary ? (
            <p className="text-body text-muted-foreground line-clamp-2 whitespace-pre-line">
              {summary}
            </p>
          ) : (
            <p className="text-body text-muted-foreground">未填写</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          编辑
        </Button>
      </div>
    </Card>
  );
}

/** Reusable section header used inside sheets when adding array items. */
export function ArraySectionHeader({
  title,
  onAdd,
}: {
  title: string;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-medium">{title}</h4>
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        <Plus className="size-4" />
        添加
      </Button>
    </div>
  );
}

/** Card wrapping a single array entry inside an editor. */
export function ArrayCard({
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

/** Submit button used at the bottom of every editor. */
export function SaveButton({
  submitting,
  className,
}: {
  submitting: boolean;
  className?: string;
}) {
  return (
    <Button
      type="submit"
      disabled={submitting}
      className={className ?? "w-full"}
    >
      <Save className="size-4" />
      {submitting ? "保存中..." : "保存"}
    </Button>
  );
}

/** Generic 2-column date range field. */
export function DateRangeField<TForm extends FieldValues>({
  form,
  startName,
  endName,
}: {
  form: UseFormReturn<TForm>;
  startName: import("react-hook-form").FieldPath<TForm>;
  endName: import("react-hook-form").FieldPath<TForm>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField
        control={form.control}
        name={startName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>开始</FormLabel>
            <FormControl>
              <Input type="date" {...field} value={(field.value as string) ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={endName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>结束</FormLabel>
            <FormControl>
              <Input type="date" {...field} value={(field.value as string) ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

/** Common picker for co-learning events. */
export function EventPickerField<TForm extends FieldValues>({
  form,
  name,
  events,
}: {
  form: UseFormReturn<TForm>;
  name: import("react-hook-form").FieldPath<TForm>;
  events: CoLearningEvent[];
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>共学活动</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={(field.value as string) || ""}
          >
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
