import { nanoid } from "nanoid";
import { store } from "./store";
import { seedStore } from "./seed";

seedStore();

interface PaginationParams {
  limit?: number;
  offset?: number;
}

interface SortParams {
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export function generateId(prefix = ""): string {
  return prefix ? `${prefix}-${nanoid(10)}` : nanoid(10);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function findAll<T>(
  collection: T[],
  filters?: Record<string, unknown>,
  pagination?: PaginationParams,
  sort?: SortParams
): PaginatedResult<T> {
  let result = [...collection];

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null) continue;
      const rec = (item: T) => item as Record<string, unknown>;

      if (key === "start_date") {
        result = result.filter(
          (item) => String(rec(item).created_at ?? "") >= String(value)
        );
        continue;
      }
      if (key === "end_date") {
        result = result.filter(
          (item) => String(rec(item).created_at ?? "") <= String(value)
        );
        continue;
      }
      if (key === "search") {
        const term = String(value).toLowerCase();
        result = result.filter((item) => {
          const r = rec(item);
          const title = String(r.title ?? "").toLowerCase();
          const content = String(r.content ?? "").toLowerCase();
          return title.includes(term) || content.includes(term);
        });
        continue;
      }
      if (Array.isArray(value)) {
        result = result.filter((item) => value.includes(rec(item)[key]));
        continue;
      }
      result = result.filter((item) => rec(item)[key] === value);
    }
  }

  if (sort?.sort_by) {
    const field = sort.sort_by;
    const order = sort.sort_order === "asc" ? 1 : -1;
    result.sort((a, b) => {
      const ra = a as Record<string, unknown>;
      const rb = b as Record<string, unknown>;
      const va = String(ra[field] ?? "");
      const vb = String(rb[field] ?? "");
      return va < vb ? -order : va > vb ? order : 0;
    });
  }

  const total = result.length;
  const limit = Math.min(pagination?.limit ?? 20, 100);
  const offset = pagination?.offset ?? 0;
  result = result.slice(offset, offset + limit);

  return { data: result, total };
}

export function findById<T extends { id: string }>(
  collection: T[],
  id: string
): T | undefined {
  return collection.find((item) => item.id === id);
}

export function findOne<T>(
  collection: T[],
  predicate: (item: T) => boolean
): T | undefined {
  return collection.find(predicate);
}

export function create<T extends { id: string }>(
  collection: T[],
  item: T
): T {
  collection.push(item);
  return item;
}

export function update<T extends { id: string }>(
  collection: T[],
  id: string,
  updates: Partial<T>
): T | undefined {
  const index = collection.findIndex((item) => item.id === id);
  if (index === -1) return undefined;
  collection[index] = { ...collection[index], ...updates };
  return collection[index];
}

export function remove<T extends { id: string }>(
  collection: T[],
  id: string
): boolean {
  const index = collection.findIndex((item) => item.id === id);
  if (index === -1) return false;
  collection.splice(index, 1);
  return true;
}

export { store };
