import { countBy } from "../util";
import { setupData, SELECTABLE } from "../data";
import type { ProcessedDataItem } from "../data";

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

export async function getStats(filters: StatsFilters = {}): Promise<StatsResponse> {
  const { data, fuse } = await setupData();
  const { q, year, state, place, weapon, age, tags = [] } = filters;

  const allData = [...data];
  let hits: ProcessedDataItem[];

  if (q && q.length > 2) {
    const searchResults = fuse.search("'" + q);
    hits = searchResults.map(({ item }) => item);
  } else {
    hits = [...data];
  }

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

  const allYears = Array.from(new Set(allData.map((x) => x.year))).sort();
  const totalByYear = countBy(allData, (x) => x.year);
  const hitsByYear = countBy(hits, (x) => x.year);

  const yearCounts: YearCount[] = allYears.map((yr) => ({
    year: yr,
    total: totalByYear[yr] || 0,
    hits: hitsByYear[yr] || 0,
  }));

  return {
    yearCounts,
    totalCases: allData.length,
    totalHits: hits.length,
  };
}
