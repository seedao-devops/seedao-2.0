"use client";

import useSWR from "swr";
import type { Base } from "@/lib/features/_shared/fake-db";

export type BaseFilters = {
  query?: string;
  tag?: string;
  skill?: string;
  province?: string;
};

const URL = "/api/bases";

export function useBases(filters: BaseFilters = {}) {
  const { data, error, isLoading, mutate } = useSWR<{ bases: Base[] }>([
    URL,
    filters,
  ] as const);
  return {
    bases: data?.bases,
    error,
    isLoading,
    mutate,
  };
}

useBases.url = URL;
