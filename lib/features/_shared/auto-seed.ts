/**
 * One-shot, per-process demo seed.
 *
 * `getTable` (in fake-db.ts) calls `ensureSeeded()` when AUTO_SEED=1 and the
 * table is one of users/bases/coLearningEvents. The first caller drives the
 * seed; subsequent callers reuse the same in-flight promise.
 *
 * `seedIfEmpty` is itself idempotent (no-op if users table is non-empty), so
 * cold serverless instances on a populated DB are basically free.
 */

import { seedIfEmpty } from "./seed";

let promise: Promise<unknown> | null = null;

export function ensureSeeded(): Promise<unknown> {
  if (!promise) {
    promise = seedIfEmpty().catch((err) => {
      // Reset so the next request gets a chance to retry instead of being
      // stuck behind a permanently-rejected promise.
      promise = null;
      throw err;
    });
  }
  return promise;
}
