"use client";

import useSWR from "swr";

export type Me = {
  id: string;
  phone: string | null;
  email: string | null;
  role: "admin" | "user";
};

const KEY = "/api/auth/me";

export function useMe() {
  const { data, error, isLoading, mutate } = useSWR<{ user: Me | null }>(KEY);
  return {
    user: data?.user ?? null,
    error,
    isLoading,
    mutate,
  };
}

useMe.key = KEY;
