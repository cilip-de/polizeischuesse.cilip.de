import type { NextApiRequest, NextApiResponse } from "next";
import _ from "lodash";
import { setupData, PAGE_SIZE, setupOptions, SELECTABLE } from "../../lib/data";
import type { ProcessedDataItem, SetupOptions } from "../../lib/data";

interface CasesResponse {
  cases: ProcessedDataItem[];
  total: number;
  page: number;
  totalPages: number;
  filters: SetupOptions;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CasesResponse | ErrorResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { data, geoData, options, fuse } = await setupData();

  // Parse query params
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || PAGE_SIZE));
  const q = req.query.q as string | undefined;
  const year = req.query.year as string | undefined;
  const state = req.query.state as string | undefined;
  const place = req.query.place as string | undefined;
  const weapon = req.query.weapon as string | undefined;
  const age = req.query.age as string | undefined;
  const tags = req.query.tags ? (req.query.tags as string).split(",") : [];
  const sort = req.query.sort as "relevance" | "date" | undefined;

  // Start with all data or search results
  let resultList: ProcessedDataItem[];

  if (q && q.length > 2) {
    // Search using Fuse.js - just extract items, don't include matches
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

  // Filter by weapon (partial match)
  if (weapon) {
    resultList = resultList.filter((x) => x.weapon.includes(weapon));
  }

  // Filter by tags
  for (const tag of tags) {
    if (!tag) continue;
    resultList = resultList.filter((x) =>
      tag.startsWith("no__") ? !x[tag.replace("no__", "")] : x[tag]
    );
  }

  // Sort results: "date" = chronological, "relevance" = Fuse.js order (when searching)
  if (sort === "date") {
    resultList = _.orderBy(resultList, (x) => x.Datum, "desc");
  }
  // When sort === "relevance" or unset, keep current order (Fuse.js relevance or original)

  // Calculate totals and pagination
  const total = resultList.length;
  const totalPages = Math.ceil(total / limit);

  // Paginate
  const startIndex = (page - 1) * limit;
  const paginatedCases = resultList.slice(startIndex, startIndex + limit);

  // Recalculate filter options based on current results
  const filters = setupOptions(resultList);

  return res.status(200).json({
    cases: paginatedCases,
    total,
    page,
    totalPages,
    filters,
  });
}
