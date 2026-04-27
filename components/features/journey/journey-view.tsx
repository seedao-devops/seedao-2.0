import Image from "next/image";
import { CalendarDays, MapPin, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  WORK_TYPE_LABELS,
  LEVEL_TAG_LABELS,
} from "@/lib/features/_shared/enums";
import type {
  Journey,
  Base,
  CoLearningEvent,
} from "@/lib/features/_shared/fake-db";

export function JourneyView({
  journey,
  bases,
  events,
  hideAvatar = false,
}: {
  journey: Pick<
    Journey,
    | "avatarUrl"
    | "displayName"
    | "bio"
    | "stays"
    | "learningRecords"
    | "teachingRecords"
    | "works"
    | "wishToLearn"
  > & { fieldVisibility?: Journey["fieldVisibility"] };
  bases: Base[];
  events: CoLearningEvent[];
  hideAvatar?: boolean;
}) {
  const baseName = (id?: string) => bases.find((b) => b.id === id)?.name ?? "";
  const baseEmoji = (id?: string) => bases.find((b) => b.id === id)?.emoji ?? "📍";
  const event = (id: string) => events.find((e) => e.id === id);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        {!hideAvatar && journey.avatarUrl ? (
          <Image
            src={journey.avatarUrl}
            alt={journey.displayName}
            width={72}
            height={72}
            unoptimized
            className="size-18 rounded-full border bg-muted"
          />
        ) : null}
        <div className="space-y-1">
          <h2>{journey.displayName}</h2>
          {journey.bio ? (
            <p className="text-body text-muted-foreground line-clamp-3">{journey.bio}</p>
          ) : null}
        </div>
      </div>

      {/* Stays */}
      {journey.stays.length ? (
        <Section title="旅居过的基地">
          <ul className="space-y-2">
            {journey.stays.map((s, i) => (
              <li key={i}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {baseEmoji(s.baseId)} {s.baseId ? baseName(s.baseId) : s.baseNameFree}
                      </p>
                      <p className="text-caption text-muted-foreground flex items-center gap-1">
                        <MapPin className="size-3" /> {s.location}
                      </p>
                    </div>
                    <span className="text-caption text-muted-foreground flex items-center gap-1 shrink-0">
                      <CalendarDays className="size-3" />
                      {s.period.start} → {s.period.end}
                    </span>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Learning */}
      {journey.learningRecords.length ? (
        <Section title="学习记录">
          <ul className="space-y-2">
            {journey.learningRecords.map((r, i) => {
              const e = event(r.eventId);
              if (!e) return null;
              return (
                <li key={i}>
                  <EventRow event={e} baseLabel={baseName(e.baseId)} />
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null}

      {/* Teaching */}
      {journey.teachingRecords.length ? (
        <Section title="教学记录">
          <ul className="space-y-2">
            {journey.teachingRecords.map((r, i) => {
              const e = event(r.eventId);
              if (!e) return null;
              return (
                <li key={i}>
                  <EventRow
                    event={e}
                    baseLabel={baseName(e.baseId)}
                    extra={`${r.studentCount} 位学员`}
                  />
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null}

      {/* Works */}
      {journey.works.length ? (
        <Section title="作品集">
          <ul className="grid gap-2">
            {journey.works.map((w) => (
              <li key={w.id}>
                <Card className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{w.title}</p>
                    <Badge variant="secondary">{WORK_TYPE_LABELS[w.type]}</Badge>
                  </div>
                  <p className="text-caption text-muted-foreground">
                    {baseName(w.baseId)} · {w.period.start} → {w.period.end}
                  </p>
                  {w.description ? (
                    <p className="text-body text-muted-foreground line-clamp-3">{w.description}</p>
                  ) : null}
                  {w.collaborators ? (
                    <p className="text-caption text-muted-foreground">合作者：{w.collaborators}</p>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Wishes */}
      {journey.wishToLearn.length ? (
        <Section title="想学的">
          <div className="flex flex-wrap gap-2">
            {journey.wishToLearn.map((w, i) => (
              <Badge key={i} variant="outline" className="gap-1">
                <Sparkles className="size-3" />
                {w.skillName}
                <span className="text-muted-foreground ml-1">{w.category === "CUSTOM" ? "" : w.category}</span>
              </Badge>
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-body font-sans font-medium text-muted-foreground tracking-wide">
        {title}
      </h3>
      {children}
    </section>
  );
}

function EventRow({
  event,
  baseLabel,
  extra,
}: {
  event: CoLearningEvent;
  baseLabel: string;
  extra?: string;
}) {
  return (
    <Card className="p-4 space-y-1">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">{event.name}</p>
        <Badge variant="secondary">{LEVEL_TAG_LABELS[event.level]}</Badge>
      </div>
      <p className="text-caption text-muted-foreground">
        讲师：{event.instructorName} · {baseLabel} · {event.period.start} → {event.period.end}
      </p>
      {extra ? <p className="text-caption text-muted-foreground">{extra}</p> : null}
    </Card>
  );
}
