import type { NextApiRequest, NextApiResponse } from "next";
import _ from "lodash";
import { setupData, SELECTABLE } from "../../lib/data";
import type { ProcessedDataItem } from "../../lib/data";

interface YearCount {
  year: number;
  total: number;
  hits: number;
}

interface StatsResponse {
  yearCounts: YearCount[];
  totalCases: number;
  totalHits: number;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatsResponse | ErrorResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { data, fuse } = await setupData();

  // Parse query params (same as /api/cases)
  const q = req.query.q as string | undefined;
  const year = req.query.year as string | undefined;
  const state = req.query.state as string | undefined;
  const place = req.query.place as string | undefined;
  const weapon = req.query.weapon as string | undefined;
  const age = req.query.age as string | undefined;
  const tags = req.query.tags ? (req.query.tags as string).split(",") : [];

  // Start with all data
  const allData = [...data];

  // Get filtered results (hits)
  let hits: ProcessedDataItem[];

  if (q && q.length > 2) {
    const searchResults = fuse.search("'" + q);
    hits = searchResults.map(({ item }) => item);
  } else {
    hits = [...data];
  }

  // Apply filters to hits
  const selection: Record<string, string | undefined> = { year, state, place, age };
  for (const [k, v] of Object.entries(selection)) {
    if (!v || !SELECTABLE.includes(k)) continue;
    hits = hits.filter((x) => String(x[k]) === v);
  }

  if (weapon) {
    hits = hits.filter((x) => x.weapon.includes(weapon));
  }

  for (const tag of tags) {
    if (!tag) continue;
    hits = hits.filter((x) =>
      tag.startsWith("no__") ? !x[tag.replace("no__", "")] : x[tag]
    );
  }

  // Create a set of hit keys for fast lookup
  const hitKeys = new Set(hits.map((x) => x.key));

  // Calculate year-based counts
  const allYears = _.uniq(allData.map((x) => x.year)).sort();
  const totalByYear = _.countBy(allData, (x) => x.year);
  const hitsByYear = _.countBy(hits, (x) => x.year);

  const yearCounts: YearCount[] = allYears.map((yr) => ({
    year: yr,
    total: totalByYear[yr] || 0,
    hits: hitsByYear[yr] || 0,
  }));

  return res.status(200).json({
    yearCounts,
    totalCases: allData.length,
    totalHits: hits.length,
  });
}
