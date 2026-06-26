import { orderBy } from "../util";
import { setupData, PAGE_SIZE, setupOptions } from "../data";
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
  // Map from item key to match data for search highlighting
  const matchMap = new Map<string, { key: string; value: string; indices: number[][] }[]>();

  if (q && q.length > 2) {
    const searchResults = fuse.search("'" + q);
    resultList = searchResults.map(({ item, matches }) => {
      if (matches) {
        matchMap.set(String(item.key), matches.map(m => ({
          key: m.key || "",
          value: m.value || "",
          indices: m.indices ? Array.from(m.indices).map(pair => Array.from(pair)) : [],
        })));
      }
      return item;
    });
  } else {
    resultList = [...data];
  }

  // Tags are not dropdown facets but still constrain everything, including which
  // values remain available in the facet dropdowns.
  const baseList = resultList.filter((x) =>
    tags.every((tag) =>
      !tag ? true : tag.startsWith("no__") ? !x[tag.replace("no__", "")] : x[tag]
    )
  );

  // One predicate per dropdown facet. Each passes when the item matches that
  // facet's currently selected value (or when nothing is selected for it).
  const facetFilters: Record<string, (x: ProcessedDataItem) => boolean> = {
    year: (x) => !year || String(x.year) === year,
    state: (x) => !state || String(x.state) === state,
    place: (x) => !place || String(x.place) === place,
    weapon: (x) => !weapon || x.weapon.includes(weapon),
    age: (x) => !age || String(x.age) === age,
  };
  const facetKeys = Object.keys(facetFilters);

  // The result list must satisfy every facet.
  resultList = baseList.filter((x) => facetKeys.every((k) => facetFilters[k](x)));

  if (sort === "date") {
    resultList = orderBy(resultList, (x) => x.Datum, "desc");
  }

  const total = resultList.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedCases = resultList.slice(startIndex, startIndex + limit).map(item => {
    const matches = matchMap.get(String(item.key));
    if (!matches) return item;
    const clone = { ...item };
    (clone as any).matches = matches;
    return clone;
  });

  // Faceted options: every dropdown lists the values still reachable when *its
  // own* selection is ignored but all other active filters apply. Without this,
  // selecting e.g. a year collapses the year dropdown to that single year, so the
  // selection can neither be changed nor cleared from the list.
  const filterOptions: SetupOptions = {
    year: [],
    state: [],
    place: [],
    weapon: [],
    age: [],
  };
  for (const key of facetKeys) {
    const subset = baseList.filter((x) =>
      facetKeys.every((k) => k === key || facetFilters[k](x))
    );
    if (subset.length) filterOptions[key] = setupOptions(subset)[key];
  }

  return {
    cases: paginatedCases,
    total,
    page,
    totalPages,
    filters: filterOptions,
  };
}
