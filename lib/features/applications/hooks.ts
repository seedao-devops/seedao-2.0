"use client";

import useSWR from "swr";
import type { Application } from "@/lib/features/_shared/fake-db";

const KEY = "/api/applications/me";

export function useApplication() {
  const { data, error, isLoading, mutate } = useSWR<{
    application: Application | null;
  }>(KEY);
  return {
    application: data?.application ?? null,
    isLoaded: data !== undefined,
    error,
    isLoading,
    mutate,
  };
}

useApplication.key = KEY;
