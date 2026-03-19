import { useQuery } from "@tanstack/react-query";
import type { GeoFilters, GeoResponse } from "../api/geo";

async function fetchGeoData(filters: GeoFilters): Promise<GeoResponse> {
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

  const response = await fetch(`/api/geo?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch geo data");
  }

  return response.json();
}

export function useGeoData(filters: GeoFilters = {}, options?: { initialData?: GeoResponse }) {
  return useQuery({
    queryKey: ["geo", filters],
    queryFn: () => fetchGeoData(filters),
    placeholderData: (prev) => prev ?? options?.initialData,
    staleTime: 0,
  });
}

export type { GeoFilters, GeoResponse, MarkerData } from "../api/geo";
