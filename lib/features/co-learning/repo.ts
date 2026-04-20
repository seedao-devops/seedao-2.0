import { nanoid } from "nanoid";
import {
  getTable,
  updateTable,
  type CoLearningEvent,
} from "@/lib/features/_shared/fake-db";
import type { CoLearningUpsertInput } from "./schema";

export async function listEvents(opts?: {
  query?: string;
  skill?: string;
  level?: string;
}): Promise<CoLearningEvent[]> {
  const rows = await getTable("coLearningEvents");
  return rows
    .filter((e) => {
      if (opts?.query) {
        const q = opts.query.toLowerCase();
        const hay = [e.name, e.instructorName].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (opts?.skill && !e.skillTags.includes(opts.skill as CoLearningEvent["skillTags"][number]))
        return false;
      if (opts?.level && e.level !== opts.level) return false;
      return true;
    })
    .sort((a, b) => b.period.start.localeCompare(a.period.start));
}

export async function createEvent(input: CoLearningUpsertInput): Promise<CoLearningEvent> {
  const created: CoLearningEvent = { id: nanoid(10), ...input };
  await updateTable("coLearningEvents", (rows) => [...rows, created]);
  return created;
}

export async function updateEvent(id: string, input: CoLearningUpsertInput) {
  let updated: CoLearningEvent | undefined;
  await updateTable("coLearningEvents", (rows) =>
    rows.map((e) => {
      if (e.id !== id) return e;
      updated = { ...e, ...input };
      return updated;
    }),
  );
  return updated;
}

export async function deleteEvent(id: string): Promise<void> {
  await updateTable("coLearningEvents", (rows) => rows.filter((e) => e.id !== id));
}
