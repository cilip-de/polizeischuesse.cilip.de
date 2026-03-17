import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { StatsFilters, StatsResponse } from "../api/stats";

async function fetchStats(filters: StatsFilters): Promise<StatsResponse> {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.year) params.set("year", filters.year);
  if (filters.state) params.set("state", filters.state);
  if (filters.place) params.set("place", filters.place);
  if (filters.weapon) params.set("weapon", filters.weapon);
  if (filters.age) params.set("age", filters.age);
  if (filters.tags && filters.tags.length > 0) {
    params.set("tags", filters.tags.join(","));
  }

  const response = await fetch(`/api/stats?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch stats");
  }

  return response.json();
}

export function useStats(filters: StatsFilters = {}, options?: { initialData?: StatsResponse }) {
  return useQuery({
    queryKey: ["stats", filters],
    queryFn: () => fetchStats(filters),
    placeholderData: options?.initialData ?? keepPreviousData,
    staleTime: 0,
  });
}

export type { StatsFilters, StatsResponse, YearCount } from "../api/stats";
