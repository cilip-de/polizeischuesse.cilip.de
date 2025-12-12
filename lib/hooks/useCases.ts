import { useQuery } from "@tanstack/react-query";
import type { ProcessedDataItem, SetupOptions } from "../data";

export interface CasesFilters {
  page?: number;
  limit?: number;
  q?: string;
  year?: string;
  state?: string;
  place?: string;
  weapon?: string;
  age?: string;
  tags?: string[];
}

export interface CasesResponse {
  cases: ProcessedDataItem[];
  total: number;
  page: number;
  totalPages: number;
  filters: SetupOptions;
}

async function fetchCases(filters: CasesFilters): Promise<CasesResponse> {
  const params = new URLSearchParams();

  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.q) params.set("q", filters.q);
  if (filters.year) params.set("year", filters.year);
  if (filters.state) params.set("state", filters.state);
  if (filters.place) params.set("place", filters.place);
  if (filters.weapon) params.set("weapon", filters.weapon);
  if (filters.age) params.set("age", filters.age);
  if (filters.tags && filters.tags.length > 0) {
    params.set("tags", filters.tags.join(","));
  }

  const response = await fetch(`/api/cases?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch cases");
  }

  return response.json();
}

export function useCases(filters: CasesFilters = {}) {
  return useQuery({
    queryKey: ["cases", filters],
    queryFn: () => fetchCases(filters),
  });
}
