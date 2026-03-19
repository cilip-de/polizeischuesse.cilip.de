import { useQuery } from "@tanstack/react-query";
import type { CasesFilters, CasesResponse } from "../api/cases";
import type { StatsResponse } from "../api/stats";
import type { GeoResponse } from "../api/geo";
import type { SearchResponse } from "../../pages/api/search";

interface SearchInitialData {
  cases?: CasesResponse;
  stats?: StatsResponse;
  geo?: GeoResponse;
}

async function fetchSearch(filters: CasesFilters): Promise<SearchResponse> {
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
  if (filters.sort) params.set("sort", filters.sort);

  const response = await fetch(`/api/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch search data");
  }

  return response.json();
}

export function useSearch(
  filters: CasesFilters = {},
  options?: { initialData?: SearchInitialData }
) {
  const initialSearchData: SearchResponse | undefined =
    options?.initialData?.cases &&
    options?.initialData?.stats &&
    options?.initialData?.geo
      ? {
          cases: options.initialData.cases,
          stats: options.initialData.stats,
          geo: options.initialData.geo,
        }
      : undefined;

  const query = useQuery({
    queryKey: ["search", filters],
    queryFn: () => fetchSearch(filters),
    placeholderData: (prev) => prev ?? initialSearchData,
    staleTime: 5 * 60 * 1000,
  });

  return {
    casesData: query.data?.cases,
    statsData: query.data?.stats,
    geoData: query.data?.geo,
    isLoading: query.isLoading,
  };
}

export type { SearchResponse, SearchInitialData };
