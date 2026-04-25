/**
 * Tiny table-shaped data store with two interchangeable backends:
 *
 *   1. JSON files under `.data/` (default — used in local dev).
 *   2. Upstash Redis — one key per table, value = the whole array as JSON.
 *      Activated automatically when `UPSTASH_REDIS_REST_URL` is set
 *      (Vercel Marketplace integration injects this and the matching token).
 *
 * The public API (`getTable`, `saveTable`, `updateTable`) is identical for
 * both backends so feature repos don't care which one is live.
 *
 * Production note: this is intentionally minimal. To ship a real DB, swap in
 * implementations of the same three functions in feature repos. See
 * `docs/schema.md` for the proposed SQL schema.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";
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

// ---------- Auto-seed wiring (lazy import to break import cycle) ----------
//
// `getTable` triggers a one-shot demo seed when AUTO_SEED=1 and the table is
// empty. The seed module itself uses `getTableRaw` to read so it never
// re-enters this auto-seed path.
const AUTO_SEED_TABLES = new Set<keyof Schema>([
  "users",
  "bases",
  "coLearningEvents",
]);

let ensureSeededFn: (() => Promise<unknown>) | null = null;
async function maybeAutoSeed(table: keyof Schema): Promise<void> {
  if (process.env.AUTO_SEED !== "1") return;
  if (!AUTO_SEED_TABLES.has(table)) return;
  if (!ensureSeededFn) {
    const mod = await import("./auto-seed");
    ensureSeededFn = mod.ensureSeeded;
  }
  await ensureSeededFn();
}

// ---------- Backend selection ----------

const USE_REDIS = !!process.env.UPSTASH_REDIS_REST_URL;

const REDIS_KEY_PREFIX = "seedao:table:";
const redisKey = (table: keyof Schema) => `${REDIS_KEY_PREFIX}${table}`;

let _redis: Redis | null = null;
function redis(): Redis {
  if (!_redis) {
    _redis = Redis.fromEnv();
  }
  return _redis;
}

// ---------- File backend ----------

const DATA_DIR = path.join(process.cwd(), ".data");
const fileFor = (table: keyof Schema) => path.join(DATA_DIR, `${table}.json`);

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function fileGet<K extends keyof Schema>(table: K): Promise<Schema[K]> {
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

async function fileSet<K extends keyof Schema>(
  table: K,
  data: Schema[K],
): Promise<void> {
  await ensureDir();
  const tmp = `${fileFor(table)}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, fileFor(table));
}

// ---------- Redis backend ----------
//
// Each table is stored as one JSON-serialised array under
// `seedao:table:<name>`. Upstash auto-(de)serialises objects, so reads return
// the parsed array and writes accept the array directly.
//
// `withLock` only serialises writes from a single serverless instance — two
// instances racing on the same table can still drop a write (last-writer-wins).
// Acceptable for low-traffic demo; harden with WATCH/MULTI if needed.

async function redisGet<K extends keyof Schema>(table: K): Promise<Schema[K]> {
  const value = await redis().get<Schema[K]>(redisKey(table));
  return value ?? ([] as unknown as Schema[K]);
}

async function redisSet<K extends keyof Schema>(
  table: K,
  data: Schema[K],
): Promise<void> {
  await redis().set(redisKey(table), data);
}

// ---------- Per-process write mutex ----------

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

// ---------- Public API ----------

/**
 * Read a table without triggering auto-seed. Used by the seed module itself
 * to check whether the DB is already populated.
 */
export async function getTableRaw<K extends keyof Schema>(
  table: K,
): Promise<Schema[K]> {
  return USE_REDIS ? redisGet(table) : fileGet(table);
}

export async function getTable<K extends keyof Schema>(
  table: K,
): Promise<Schema[K]> {
  await maybeAutoSeed(table);
  return getTableRaw(table);
}

export async function saveTable<K extends keyof Schema>(
  table: K,
  data: Schema[K],
): Promise<void> {
  await withLock(table, () => (USE_REDIS ? redisSet(table, data) : fileSet(table, data)));
}

export async function updateTable<K extends keyof Schema>(
  table: K,
  mutate: (rows: Schema[K]) => Schema[K] | Promise<Schema[K]>,
): Promise<Schema[K]> {
  return withLock(table, async () => {
    const rows = USE_REDIS ? await redisGet(table) : await fileGet(table);
    const next = await mutate(rows);
    if (USE_REDIS) {
      await redisSet(table, next);
    } else {
      await fileSet(table, next);
    }
    return next;
  });
}
