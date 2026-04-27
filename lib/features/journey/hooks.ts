"use client";

import useSWR from "swr";
import type { Journey } from "@/lib/features/_shared/fake-db";

const KEY = "/api/journey/me";

export function useJourney() {
  const { data, error, isLoading, mutate } = useSWR<{ journey: Journey }>(KEY);
  return {
    journey: data?.journey,
    error,
    isLoading,
    mutate,
  };
}

useJourney.key = KEY;
