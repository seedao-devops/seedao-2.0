"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TagPicker } from "@/components/ui/tag-picker";
import { BASE_TAGS, SKILL_TAGS } from "@/lib/features/_shared/enums";
import type { Base } from "@/lib/features/_shared/fake-db";
import { BasesMap } from "./bases-map";

export function BasesExplorer({ initialBases }: { initialBases: Base[] }) {
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialBases.filter((b) => {
      if (q) {
        const hay = [b.name, b.description, b.city, b.province].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (tags.length && !tags.some((t) => b.tags.includes(t as Base["tags"][number]))) return false;
      if (
        skills.length &&
        !skills.some(
          (s) =>
            b.skillsOffered.includes(s as Base["skillsOffered"][number]) ||
            b.skillsNeeded.includes(s as Base["skillsNeeded"][number]),
        )
      ) {
        return false;
      }
      return true;
    });
  }, [initialBases, query, tags, skills]);

  return (
    <div className="space-y-4">
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur -mx-5 px-5 pb-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索基地名、城市、关键词…"
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
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
          >
            筛选 {tags.length + skills.length ? `(${tags.length + skills.length})` : ""}
          </Button>
          <span className="text-xs text-muted-foreground">{filtered.length} 个基地</span>
        </div>
        {showFilters ? (
          <div className="space-y-3 pb-1">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">基地类型</p>
              <TagPicker
                options={BASE_TAGS}
                value={tags as readonly string[] as string[]}
                onChange={(v) => setTags(v as string[])}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">技能</p>
              <TagPicker
                options={SKILL_TAGS}
                value={skills as readonly string[] as string[]}
                onChange={(v) => setSkills(v as string[])}
              />
            </div>
          </div>
        ) : null}
      </div>

      <BasesMap bases={filtered} />

      <ul className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            没有符合条件的基地
          </Card>
        ) : null}
        {filtered.map((b) => (
          <li key={b.id}>
            <Link href={`/bases/${b.id}`}>
              <Card className="p-4 hover:border-primary/50 transition-colors">
                <div className="flex gap-3">
                  <div className="size-12 grid place-items-center text-2xl rounded-full bg-secondary shrink-0">
                    {b.emoji}
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-semibold">{b.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {b.province} · {b.city}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{b.description}</p>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {b.tags.slice(0, 4).map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px] py-0 px-1.5">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
