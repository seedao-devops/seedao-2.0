import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import { getBaseById, getProducedWorks } from "@/lib/features/bases/repo";
import { getTable } from "@/lib/features/_shared/fake-db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  PROJECT_STATUS_LABELS,
  WORK_TYPE_LABELS,
  LEVEL_TAG_LABELS,
} from "@/lib/features/_shared/enums";

export default async function BaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const base = await getBaseById(id);
  if (!base) notFound();
  const [producedWorks, allEvents] = await Promise.all([
    getProducedWorks(id),
    getTable("coLearningEvents"),
  ]);
  const events = allEvents.filter((e) => e.baseId === id);

  return (
    <div className="px-5 pt-3 pb-10 space-y-6">
      <Link
        href="/bases"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回基地列表
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{base.emoji}</span>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-serif font-bold">{base.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="size-3.5" />
              {base.province} · {base.city}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {base.tags.map((t) => (
            <Badge key={t} variant="secondary">{t}</Badge>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
          {base.description}
        </p>
        <Button asChild className="w-full">
          <a href={base.applyUrl} target="_blank" rel="noreferrer">
            申请入住
            <ExternalLink className="size-4" />
          </a>
        </Button>
      </header>

      <Section title="在地生活">
        <div className="grid gap-3">
          {base.localLife.accommodations.length ? (
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">住宿</p>
              <ul className="space-y-1.5 text-sm">
                {base.localLife.accommodations.map((a, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{a.name}</span>
                    <span className="text-muted-foreground">{a.price}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
          {base.localLife.coworking.length ? (
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">共享工位</p>
              <ul className="text-sm space-y-1.5">
                {base.localLife.coworking.map((c, i) => (
                  <li key={i}>· {c.name}</li>
                ))}
              </ul>
            </Card>
          ) : null}
          {base.localLife.tourism.length ? (
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">周边</p>
              <ul className="space-y-2 text-sm">
                {base.localLife.tourism.map((t, i) => (
                  <li key={i} className="space-y-1">
                    <p>{t.name}</p>
                    <div className="flex flex-wrap gap-1">
                      {t.customTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] py-0 px-1.5">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </Section>

      {(base.skillsOffered.length || base.skillsNeeded.length) ? (
        <Section title="技能交换">
          <Card className="p-4 space-y-3 text-sm">
            {base.skillsOffered.length ? (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">可提供</p>
                <div className="flex flex-wrap gap-1.5">
                  {base.skillsOffered.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </div>
            ) : null}
            {base.skillsNeeded.length ? (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">需要</p>
                <div className="flex flex-wrap gap-1.5">
                  {base.skillsNeeded.map((s) => (
                    <Badge key={s} variant="outline">{s}</Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>
        </Section>
      ) : null}

      {base.localProjects.length ? (
        <Section title="在地项目">
          <ul className="space-y-2">
            {base.localProjects.map((p) => (
              <li key={p.id}>
                <Card className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{p.name}</p>
                    <Badge variant={p.status === "RECRUITING" ? "default" : "secondary"}>
                      {PROJECT_STATUS_LABELS[p.status]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {p.period.start} → {p.period.end}
                  </p>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                  {p.requiredSkills.length ? (
                    <div className="flex flex-wrap gap-1">
                      {p.requiredSkills.map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px] py-0 px-1.5">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {events.length ? (
        <Section title="共学活动">
          <ul className="space-y-2">
            {events.map((e) => (
              <li key={e.id}>
                <Card className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{e.name}</p>
                    <Badge variant="secondary">{LEVEL_TAG_LABELS[e.level]}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    讲师：{e.instructorName} · {e.period.start} → {e.period.end}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {base.timeline.length ? (
        <Section title="时间线">
          <ol className="space-y-2 border-l-2 border-primary/30 pl-4">
            {base.timeline.map((t) => (
              <li key={t.id} className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{t.emoji}</span>
                  <span className="text-xs text-muted-foreground">{t.date}</span>
                </div>
                <p className="font-medium text-sm">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {producedWorks.length ? (
        <Section title="产出作品">
          <ul className="space-y-2">
            {producedWorks.map((w) => (
              <li key={w.id}>
                <Card className="p-4 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{w.title}</p>
                    <Badge variant="secondary">{WORK_TYPE_LABELS[w.type]}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {w.period.start} → {w.period.end}
                  </p>
                  {w.description ? (
                    <p className="text-sm text-muted-foreground line-clamp-3">{w.description}</p>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-serif font-semibold">{title}</h2>
      {children}
    </section>
  );
}
