import type { NextApiRequest, NextApiResponse } from "next";
import _ from "lodash";
import { setupData, SELECTABLE } from "../../lib/data";
import type { ProcessedDataItem, GeoDataItem } from "../../lib/data";

interface MarkerData {
  city: string;
  state: string;
  longitude: number;
  latitude: number;
  count: number;
}

interface GeoResponse {
  markers: MarkerData[];
  totalLocations: number;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GeoResponse | ErrorResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { data, geoData, fuse } = await setupData();

  // Parse query params (same as /api/cases)
  const q = req.query.q as string | undefined;
  const year = req.query.year as string | undefined;
  const state = req.query.state as string | undefined;
  const place = req.query.place as string | undefined;
  const weapon = req.query.weapon as string | undefined;
  const age = req.query.age as string | undefined;
  const tags = req.query.tags ? (req.query.tags as string).split(",") : [];

  // Start with all data or search results
  let resultList: ProcessedDataItem[];

  if (q && q.length > 2) {
    const searchResults = fuse.search("'" + q);
    resultList = searchResults.map(({ item }) => item);
  } else {
    resultList = [...data];
  }

  // Apply filters
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

  // Count cases per location
  const locationCounts = _.countBy(resultList, (x) => x.place + x.state);

  // Build marker data
  const markers: MarkerData[] = geoData
    .filter(
      (x): x is GeoDataItem & { city: string; state: string; latitude: number; longitude: number } =>
        x.city !== null &&
        x.state !== null &&
        x.latitude !== null &&
        x.longitude !== null &&
        locationCounts.hasOwnProperty(x.city + x.state)
    )
    .map((x) => ({
      city: x.city,
      state: x.state,
      longitude: x.longitude,
      latitude: x.latitude,
      count: locationCounts[x.city + x.state],
    }));

  return res.status(200).json({
    markers,
    totalLocations: geoData.length,
  });
}
