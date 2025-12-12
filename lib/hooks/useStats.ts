import { useQuery } from "@tanstack/react-query";

export interface StatsFilters {
  q?: string;
  year?: string;
  state?: string;
  place?: string;
  weapon?: string;
  age?: string;
  tags?: string[];
}

export interface YearCount {
  year: number;
  total: number;
  hits: number;
}

export interface StatsResponse {
  yearCounts: YearCount[];
  totalCases: number;
  totalHits: number;
}

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

export function useStats(filters: StatsFilters = {}) {
  return useQuery({
    queryKey: ["stats", filters],
    queryFn: () => fetchStats(filters),
  });
}
