"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TagPicker } from "@/components/ui/tag-picker";
import {
  LEVEL_TAGS,
  LEVEL_TAG_LABELS,
  SKILL_TAGS,
} from "@/lib/features/_shared/enums";
import type { Base, CoLearningEvent } from "@/lib/features/_shared/fake-db";

export function CoLearningExplorer({
  initialEvents,
  bases,
}: {
  initialEvents: CoLearningEvent[];
  bases: Base[];
}) {
  const [query, setQuery] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const baseName = (id: string) => bases.find((b) => b.id === id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialEvents.filter((e) => {
      if (q) {
        const hay = [e.name, e.instructorName, baseName(e.baseId)?.name ?? ""]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (skills.length && !skills.some((s) => e.skillTags.includes(s as CoLearningEvent["skillTags"][number])))
        return false;
      if (levels.length && !levels.includes(e.level)) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEvents, query, skills, levels, bases]);

  return (
    <div className="space-y-4">
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur -mx-5 px-5 pb-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索活动名、讲师、基地…"
            className="pl-9 pr-10"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="清除"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        <div className="space-y-2">
          <TagPicker
            options={LEVEL_TAGS}
            value={levels}
            onChange={setLevels}
            labelMap={LEVEL_TAG_LABELS}
          />
          <TagPicker options={SKILL_TAGS} value={skills} onChange={setSkills} />
        </div>
      </div>

      <ul className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">没有符合条件的活动</Card>
        ) : null}
        {filtered.map((e) => {
          const base = baseName(e.baseId);
          return (
            <li key={e.id}>
              <Card className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="font-medium">{e.name}</p>
                    <p className="text-xs text-muted-foreground">讲师：{e.instructorName}</p>
                    {base ? (
                      <p className="text-xs text-muted-foreground">
                        基地：{base.emoji} {base.name}
                      </p>
                    ) : null}
                  </div>
                  <Badge variant="secondary">{LEVEL_TAG_LABELS[e.level]}</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {e.skillTags.map((s) => (
                    <Badge key={s} variant="outline" className="text-[10px] py-0 px-1.5">
                      {s}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {e.period.start} → {e.period.end}
                </p>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
