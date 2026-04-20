import { nanoid } from "nanoid";
import {
  getTable,
  updateTable,
  type Journey,
} from "@/lib/features/_shared/fake-db";
import type { JourneyUpsertInput } from "./schema";

export function defaultJourneyFor(userId: string, displayName: string): Journey {
  return {
    userId,
    avatarUrl: `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(userId)}`,
    displayName,
    bio: "",
    stays: [],
    learningRecords: [],
    teachingRecords: [],
    works: [],
    wishToLearn: [],
    fieldVisibility: {
      avatar: true,
      bio: true,
      stays: true,
      learning: true,
      teaching: true,
      works: true,
      wishToLearn: true,
    },
    updatedAt: new Date().toISOString(),
  };
}

export async function getJourneyByUser(userId: string): Promise<Journey | undefined> {
  const rows = await getTable("journeys");
  return rows.find((j) => j.userId === userId);
}

export async function upsertJourney(
  userId: string,
  input: JourneyUpsertInput,
): Promise<Journey> {
  const now = new Date().toISOString();
  let saved!: Journey;
  await updateTable("journeys", (rows) => {
    const idx = rows.findIndex((j) => j.userId === userId);
    saved = {
      ...input,
      userId,
      // Each work must have an id; assign nanoid for new ones.
      works: input.works.map((w) => ({ ...w, id: w.id ?? nanoid(10) })),
      updatedAt: now,
    };
    if (idx === -1) return [...rows, saved];
    const next = rows.slice();
    next[idx] = saved;
    return next;
  });
  return saved;
}
