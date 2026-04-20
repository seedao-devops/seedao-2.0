import { nanoid } from "nanoid";
import {
  getTable,
  updateTable,
  type Base,
  type Work,
} from "@/lib/features/_shared/fake-db";
import type { BaseUpsertInput } from "./schema";

export async function listBases(opts?: {
  query?: string;
  tag?: string;
  skill?: string;
  province?: string;
}): Promise<Base[]> {
  const rows = await getTable("bases");
  return rows.filter((b) => {
    if (opts?.query) {
      const q = opts.query.toLowerCase();
      const hay = [b.name, b.description, b.city, b.province].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (opts?.tag && !b.tags.includes(opts.tag as Base["tags"][number])) return false;
    if (
      opts?.skill &&
      !b.skillsOffered.includes(opts.skill as Base["skillsOffered"][number]) &&
      !b.skillsNeeded.includes(opts.skill as Base["skillsNeeded"][number])
    ) return false;
    if (opts?.province && b.province !== opts.province) return false;
    return true;
  });
}

export async function getBaseById(id: string): Promise<Base | undefined> {
  const rows = await getTable("bases");
  return rows.find((b) => b.id === id);
}

/** Joined query: works produced at this base, gathered from journeys table. */
export async function getProducedWorks(baseId: string): Promise<Work[]> {
  const journeys = await getTable("journeys");
  const works: Work[] = [];
  for (const j of journeys) {
    for (const w of j.works) {
      if (w.baseId === baseId) works.push(w);
    }
  }
  return works;
}

export async function createBase(input: BaseUpsertInput): Promise<Base> {
  const now = new Date().toISOString();
  const created: Base = {
    id: nanoid(10),
    createdAt: now,
    ...input,
    localProjects: input.localProjects.map((p) => ({ ...p, id: p.id ?? nanoid(8) })),
    timeline: input.timeline.map((t) => ({ ...t, id: t.id ?? nanoid(8) })),
  };
  await updateTable("bases", (rows) => [...rows, created]);
  return created;
}

export async function updateBase(id: string, input: BaseUpsertInput): Promise<Base | undefined> {
  let updated: Base | undefined;
  await updateTable("bases", (rows) =>
    rows.map((b) => {
      if (b.id !== id) return b;
      updated = {
        ...b,
        ...input,
        localProjects: input.localProjects.map((p) => ({ ...p, id: p.id ?? nanoid(8) })),
        timeline: input.timeline.map((t) => ({ ...t, id: t.id ?? nanoid(8) })),
      };
      return updated;
    }),
  );
  return updated;
}

export async function deleteBase(id: string): Promise<void> {
  await updateTable("bases", (rows) => rows.filter((b) => b.id !== id));
}
