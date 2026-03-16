import _ from "lodash";
import { setupData, PAGE_SIZE, setupOptions, SELECTABLE } from "../data";
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
  sort?: "relevance" | "date";
}

export interface CasesResponse {
  cases: ProcessedDataItem[];
  total: number;
  page: number;
  totalPages: number;
  filters: SetupOptions;
}

export async function getCases(filters: CasesFilters = {}): Promise<CasesResponse> {
  const { data, fuse } = await setupData();

  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(100, Math.max(1, filters.limit || PAGE_SIZE));
  const { q, year, state, place, weapon, age, tags = [], sort } = filters;

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

  if (sort === "date") {
    resultList = _.orderBy(resultList, (x) => x.Datum, "desc");
  }

  const total = resultList.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedCases = resultList.slice(startIndex, startIndex + limit);
  const filterOptions = setupOptions(resultList);

  return {
    cases: paginatedCases,
    total,
    page,
    totalPages,
    filters: filterOptions,
  };
}
