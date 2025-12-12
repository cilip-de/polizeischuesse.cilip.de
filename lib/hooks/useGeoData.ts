import { useQuery } from "@tanstack/react-query";

export interface GeoFilters {
  q?: string;
  year?: string;
  state?: string;
  place?: string;
  weapon?: string;
  age?: string;
  tags?: string[];
}

export interface MarkerData {
  city: string;
  state: string;
  longitude: number;
  latitude: number;
  count: number;
}

export interface GeoResponse {
  markers: MarkerData[];
  totalLocations: number;
}

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

export function useGeoData(filters: GeoFilters = {}) {
  return useQuery({
    queryKey: ["geo", filters],
    queryFn: () => fetchGeoData(filters),
  });
}
