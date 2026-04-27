"use client";

import useSWR from "swr";
import type { CoLearningEvent } from "@/lib/features/_shared/fake-db";

export type CoLearningFilters = {
  query?: string;
  skill?: string;
  level?: string;
};

const URL = "/api/co-learning";

export function useCoLearningEvents(filters: CoLearningFilters = {}) {
  const { data, error, isLoading, mutate } = useSWR<{
    events: CoLearningEvent[];
  }>([URL, filters] as const);
  return {
    events: data?.events,
    error,
    isLoading,
    mutate,
  };
}

useCoLearningEvents.url = URL;
