import _ from "lodash";
import { setupData, SELECTABLE } from "../data";
import type { ProcessedDataItem, GeoDataItem } from "../data";

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

export async function getGeo(filters: GeoFilters = {}): Promise<GeoResponse> {
  const { data, geoData, fuse } = await setupData();
  const { q, year, state, place, weapon, age, tags = [] } = filters;

  let resultList: ProcessedDataItem[];

  if (q && q.length > 2) {
    const searchResults = fuse.search("'" + q);
    resultList = searchResults.map(({ item }) => item);
  } else {
    resultList = [...data];
  }

  const selection: Record<string, string | undefined> = { year, state, place, age };
  for (const [k, v] of Object.entries(selection)) {
    if (!v || !SELECTABLE.includes(k)) continue;
    resultList = resultList.filter((x) => String(x[k]) === v);
  }

  if (weapon) {
    resultList = resultList.filter((x) => x.weapon.includes(weapon));
  }

  for (const tag of tags) {
    if (!tag) continue;
    resultList = resultList.filter((x) =>
      tag.startsWith("no__") ? !x[tag.replace("no__", "")] : x[tag]
    );
  }

  const locationCounts = _.countBy(resultList, (x) => x.place + x.state);

  const markers: MarkerData[] = geoData
    .filter(
      (x): x is GeoDataItem & { city: string; state: string; latitude: number; longitude: number } =>
        x.city != null &&
        x.state != null &&
        typeof x.latitude === "number" && !isNaN(x.latitude) &&
        typeof x.longitude === "number" && !isNaN(x.longitude) &&
        locationCounts.hasOwnProperty(x.city + x.state)
    )
    .map((x) => ({
      city: x.city,
      state: x.state,
      longitude: x.longitude,
      latitude: x.latitude,
      count: locationCounts[x.city + x.state],
    }));

  return {
    markers,
    totalLocations: geoData.length,
  };
}
