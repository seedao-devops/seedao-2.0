/**
 * In-process JSON-file fake database.
 *
 * Tables are typed via the `Schema` map below. Each table is read on demand
 * and written atomically. We use a per-file mutex to avoid concurrent-write
 * corruption during dev with multiple route handler invocations.
 *
 * Production note: this is intentionally minimal; swap in a real DB by
 * implementing the same `getTable / saveTable` interface in feature repos.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  PaymentStatus,
  ReviewStatus,
  DidStatus,
  Role,
  WorkType,
  WishCategory,
  LevelTag,
  ProjectStatus,
  BaseTag,
  SkillTag,
  CnProvince,
  InterestTag,
} from "./enums";

// ---------- Domain types ----------

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

export interface User {
  id: string;
  phone?: string;        // E.164 (+86…)
  email?: string;        // lowercased
  passwordHash: string;
  role: Role;
  createdAt: string;
}

export interface Application {
  id: string;
  userId: string;
  nickname: string;
  selfIntro: string;
  interestTags: InterestTag[];
  portfolio?: string;
  paymentStatus: PaymentStatus;
  reviewStatus: ReviewStatus;
  rejectReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  // DID flow lives here too — created when reviewStatus -> APPROVED.
  didStatus?: DidStatus;
  didInfo?: string;
}

export interface Stay {
  baseId?: string;
  baseNameFree?: string;
  location: string;
  period: DateRange;
}

export interface LearningRecord {
  eventId: string; // FK -> CoLearningEvent
}

export interface TeachingRecord extends LearningRecord {
  studentCount: number;
}

export interface Work {
  id: string;
  title: string;
  type: WorkType;
  baseId: string;
  period: DateRange;
  description: string;
  collaborators?: string;
}

export interface Wish {
  skillName: string;
  category: WishCategory;
}

export interface FieldVisibility {
  avatar: boolean;
  bio: boolean;
  stays: boolean;
  learning: boolean;
  teaching: boolean;
  works: boolean;
  wishToLearn: boolean;
}

export interface Journey {
  userId: string; // PK = userId, 1:1
  avatarUrl: string;
  displayName: string;
  bio: string;
  stays: Stay[];
  learningRecords: LearningRecord[];
  teachingRecords: TeachingRecord[];
  works: Work[];
  wishToLearn: Wish[];
  fieldVisibility: FieldVisibility;
  updatedAt: string;
}

export interface LocalProject {
  id: string;
  name: string;
  status: ProjectStatus;
  description: string;
  requiredSkills: SkillTag[];
  period: DateRange;
}

export interface TimelineEntry {
  id: string;
  emoji: string;
  date: string;
  title: string;
  description: string;
}

export interface Base {
  id: string;
  emoji: string;
  name: string;
  province: CnProvince;
  city: string;
  description: string;
  tags: BaseTag[];
  localLife: {
    accommodations: { name: string; price: string }[];
    coworking: { name: string }[];
    tourism: { name: string; customTags: string[] }[];
  };
  applyUrl: string;
  skillsOffered: SkillTag[];
  skillsNeeded: SkillTag[];
  localProjects: LocalProject[];
  timeline: TimelineEntry[];
  // GPS for the map view; optional but recommended.
  lat?: number;
  lng?: number;
  createdAt: string;
}

export interface CoLearningEvent {
  id: string;
  name: string;
  instructorName: string;
  baseId: string;
  skillTags: SkillTag[];
  level: LevelTag;
  period: DateRange;
}

// ---------- Schema map ----------

export interface Schema {
  users: User[];
  applications: Application[];
  journeys: Journey[];
  bases: Base[];
  coLearningEvents: CoLearningEvent[];
}

const DATA_DIR = path.join(process.cwd(), ".data");

const fileFor = (table: keyof Schema) => path.join(DATA_DIR, `${table}.json`);

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

const locks = new Map<string, Promise<unknown>>();
async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(
    key,
    next.finally(() => {
      if (locks.get(key) === next) locks.delete(key);
    }),
  );
  return next as Promise<T>;
}

export async function getTable<K extends keyof Schema>(table: K): Promise<Schema[K]> {
  await ensureDir();
  try {
    const raw = await fs.readFile(fileFor(table), "utf8");
    return JSON.parse(raw) as Schema[K];
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return [] as unknown as Schema[K];
    }
    throw err;
  }
}

export async function saveTable<K extends keyof Schema>(
  table: K,
  data: Schema[K],
): Promise<void> {
  await ensureDir();
  await withLock(table, async () => {
    const tmp = `${fileFor(table)}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(tmp, fileFor(table));
  });
}

export async function updateTable<K extends keyof Schema>(
  table: K,
  mutate: (rows: Schema[K]) => Schema[K] | Promise<Schema[K]>,
): Promise<Schema[K]> {
  return withLock(table, async () => {
    const rows = await getTable(table);
    const next = await mutate(rows);
    const tmp = `${fileFor(table)}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
    await fs.rename(tmp, fileFor(table));
    return next;
  });
}
