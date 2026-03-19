import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useMemo, useState, useCallback } from "react";
import { PAGE_SIZE } from "../lib/data";
import { constructUrl, constructUrlWithQ, type Selection } from "../lib/util";
import type { CasesResponse } from "../lib/api/cases";
import type { CasesFilters } from "../lib/api/cases";
import type { StatsResponse } from "../lib/api/stats";
import type { GeoResponse } from "../lib/api/geo";
import { useSearch } from "../lib/hooks/useSearch";
import AnchorHeading from "./AnchorHeading";
import Case from "./Case";
import CategoryInput from "./CategoryInput";
import SearchInput from "./SearchInput";
import SelectInput from "./SelectInput";
import SortToggle from "./SortToggle";

const OverviewChartFromStats = dynamic(
  () => import("./charts/OverviewChartFromStats").then((mod) => mod.OverviewChartFromStats),
  { ssr: false, loading: () => <Skeleton className="h-[120px]" /> }
);

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => <Skeleton className="h-[200px]" />,
});

interface CaseListProps {
  maxCases: number;
  initialCases?: CasesResponse;
  initialStats?: StatsResponse;
  initialGeo?: GeoResponse;
}

export function parseSelectionFromQuery(query: Record<string, string | string[] | undefined>): Required<Selection> {
  return {
    q: (query.q as string) || "",
    p: parseInt(query.p as string) || 1,
    year: (query.year as string) || "",
    state: (query.state as string) || "",
    place: (query.place as string) || "",
    weapon: (query.weapon as string) || "",
    age: (query.age as string) || "",
    tags: query.tags ? (query.tags as string).split(",") : [],
    sort: (query.sort as "relevance" | "date") || undefined,
  };
}

export function selectionToFilters(selection: Required<Selection>, searchQ: string | null): CasesFilters {
  const q = searchQ ?? selection.q;
  return {
    page: selection.p,
    limit: PAGE_SIZE,
    q: q || undefined,
    year: selection.year || undefined,
    state: selection.state || undefined,
    place: selection.place || undefined,
    weapon: selection.weapon || undefined,
    age: selection.age || undefined,
    tags: selection.tags.length > 0 ? selection.tags : undefined,
    sort: q ? (selection.sort || "relevance") : undefined,
  };
}

const StatusText = ({
  isLoading,
  enoughChars,
  total,
  maxCases,
  displayMarkers,
  totalLocations,
  showLocations,
}: {
  isLoading: boolean;
  enoughChars: boolean;
  total: number;
  maxCases: number;
  displayMarkers: any[];
  totalLocations: number;
  showLocations: boolean;
}) => {
  if (isLoading) {
    return <Skeleton className="h-4 w-[250px]" />;
  }
  return (
    <>
      {enoughChars && total > 1 && total !== maxCases && (
        <span>zeige {total} von {maxCases} polizeilichen Todesschüssen</span>
      )}
      {enoughChars && total > 1 && total === maxCases && (
        <span>{total} polizeiliche Todesschüsse</span>
      )}
      {enoughChars && total === 1 && (
        <span>ein polizeilicher Todesschuss</span>
      )}
      {enoughChars && total === 0 && (
        <span>kein polizeilicher Todesschuss entfällt auf die Auswahl</span>
      )}
      {!enoughChars && (
        <span>Bitte mehr Zeichen für die Suche eingeben</span>
      )}
      {showLocations && (
        <span>
          {displayMarkers.length !== totalLocations &&
            displayMarkers.length > 1 &&
            `· an ${displayMarkers.length} von ${totalLocations} Orten`}
          {displayMarkers.length === totalLocations &&
            `· an ${totalLocations} Orten`}
          {displayMarkers.length === 1 && `· an einem Ort`}
        </span>
      )}
    </>
  );
};

const CaseList = ({ maxCases, initialCases, initialStats, initialGeo }: CaseListProps) => {
  const router = useRouter();

  // Parse selection from URL query params
  const selection = useMemo(() => parseSelectionFromQuery(router.query), [router.query]);

  // Local state for search input (for debounced search)
  const [searchQ, setSearchQ] = useState<string | null>(null);

  // Build filters for API calls
  const filters = useMemo(() => selectionToFilters(selection, searchQ), [selection, searchQ]);

  // Fetch cases, stats, and geo in a single request
  const { casesData, statsData, geoData, isLoading } = useSearch(filters, {
    initialData: { cases: initialCases, stats: initialStats, geo: initialGeo },
  });

  const casesLoading = isLoading;
  const geoLoading = isLoading;
  const statsLoading = isLoading;

  const q = searchQ ?? selection.q;
  const enoughChars = !q || q.length > 2;

  // Get data from API response
  const cases = casesData?.cases || [];
  const total = casesData?.total || 0;
  const totalPages = casesData?.totalPages || 0;
  const options = casesData?.filters || { year: [], state: [], place: [], weapon: [], age: [] };

  // Marker data from geo API
  const displayMarkers = geoData?.markers || [];
  const totalLocations = geoData?.totalLocations || 0;

  const handleSearchQ = useCallback((newQ: string) => {
    setSearchQ(newQ === "" ? null : newQ);
  }, []);

  const isFiltered = selection.year || selection.state || selection.place ||
                     selection.weapon || selection.age || selection.tags.length > 0 || q;

  function renderPagination(className: string) {
    const currentPage = selection.p;
    const goToPage = (page: number) =>
      router.push(
        constructUrlWithQ(q, { ...selection, p: page }),
        undefined,
        { scroll: false }
      );

    // Generate page numbers with ellipsis
    const getPages = () => {
      const pages: (number | "ellipsis")[] = [];
      const delta = 1;
      const left = Math.max(2, currentPage - delta);
      const right = Math.min(totalPages - 1, currentPage + delta);

      pages.push(1);
      if (left > 2) pages.push("ellipsis");
      for (let i = left; i <= right; i++) pages.push(i);
      if (right < totalPages - 1) pages.push("ellipsis");
      if (totalPages > 1) pages.push(totalPages);

      return pages;
    };

    return (
      <Pagination className={className}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
              aria-label="Vorherige Seite"
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          {getPages().map((page, i) =>
            page === "ellipsis" ? (
              <PaginationItem key={`e${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => goToPage(page)}
                  aria-label={`Seite ${page}`}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
              aria-label="Nächste Seite"
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  }

  return (
    <div className="pb-8">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-2 md:hidden"></div>
        <div className="col-span-12 sm:col-span-8 md:hidden">
          {geoLoading ? (
            <Skeleton className="h-[200px]" />
          ) : (
            <Map
              makersData={displayMarkers}
              setInputPlace={(x: string) =>
                router.push(
                  constructUrl({ ...selection, place: x, p: 1 }),
                  undefined,
                  { scroll: false }
                )
              }
            />
          )}
        </div>
        <div className="col-span-2 md:hidden"></div>
        <div className="col-span-12 md:col-span-8">
          <AnchorHeading order={2} id="chronik">
            Chronik
          </AnchorHeading>
          <div role="search" aria-label="Suche und Filter für polizeiliche Todesschüsse">
            <div className="grid grid-cols-12 gap-4 mb-4 mt-2">
              {[
                ["year", "Jahr"],
                ["state", "Bundesland"],
                ["place", "Ort"],
              ].map(([key, label]) => (
                <div className="col-span-4" key={key}>
                  <SelectInput
                    skey={key}
                    label={label}
                    selection={selection}
                    data={options[key as keyof typeof options] || []}
                    onChange={(x) => router.push(constructUrl({ ...selection, [key]: x, p: 1 }), undefined, { scroll: false })}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-8">
                <SearchInput
                  q={q}
                  selection={selection}
                  setSearchedQ={handleSearchQ}
                />
              </div>
              <div className="col-span-4">
                <SelectInput
                  skey={"weapon"}
                  label={"Bewaffnung"}
                  selection={selection}
                  data={options.weapon || []}
                  onChange={(x) => router.push(constructUrl({ ...selection, weapon: x ?? "", p: 1 }), undefined, { scroll: false })}
                />
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-12 md:col-span-8">
                <CategoryInput selection={selection} onChange={(tags) => router.replace(constructUrlWithQ(q, { ...selection, tags, p: 1 }), undefined, { scroll: false })} />
              </div>
              <div className="col-span-12 md:col-span-4">
                <SelectInput
                  skey={"age"}
                  label={"Alter"}
                  selection={selection}
                  data={options.age || []}
                  onChange={(x) => router.push(constructUrl({ ...selection, age: x ?? "", p: 1 }), undefined, { scroll: false })}
                />
              </div>
            </div>
            {statsLoading ? (
              <Skeleton className="h-[120px]" />
            ) : statsData ? (
              <OverviewChartFromStats
                yearCounts={statsData.yearCounts}
                onClick={(year) =>
                  router.push(
                    constructUrl({ ...selection, year: String(year), p: 1 }),
                    undefined,
                    { scroll: false }
                  )
                }
              />
            ) : null}
          </div>
          {/* Desktop status text — inside left column to avoid whitespace gap */}
          <div className="hidden md:flex items-center justify-center gap-2 text-sm text-gray-500 mt-2 mb-2"
            role="status" aria-live="polite" aria-atomic="true"
          >
            <StatusText isLoading={casesLoading} enoughChars={enoughChars} total={total} maxCases={maxCases}
              displayMarkers={displayMarkers} totalLocations={totalLocations} showLocations={!geoLoading && !casesLoading} />
          </div>
        </div>
        <div className="col-span-4 hidden md:block mb-8">
          {geoLoading ? (
            <Skeleton className="h-[300px]" />
          ) : (
            <Map
              makersData={displayMarkers}
              setInputPlace={(x: string) =>
                router.push(
                  constructUrl({ ...selection, place: x, p: 1 }),
                  undefined,
                  { scroll: false }
                )
              }
            />
          )}
        </div>
      </div>

      <div className="min-h-[100rem]">
        <div className="md:hidden" role="status" aria-live="polite" aria-atomic="true">
          <div className="flex items-center justify-center my-4">
            <StatusText isLoading={casesLoading} enoughChars={enoughChars} total={total} maxCases={maxCases}
              displayMarkers={displayMarkers} totalLocations={totalLocations} showLocations={false} />
          </div>
        </div>
        {enoughChars && isFiltered && (
          <>
            {/* Desktop: button centered, toggle absolutely positioned right */}
            <div className="hidden md:block relative mb-8 w-full">
              <div className="flex items-center justify-center">
                <button
                  onClick={() => {
                    router.push("/", undefined, { scroll: false });
                    setSearchQ(null);
                  }}
                  className="bg-transparent border-none px-2 py-1 cursor-pointer underline text-gray-500 text-sm font-inherit"
                  aria-label="Auswahl zurücksetzen und alle Fälle anzeigen"
                >
                  Auswahl zurücksetzen
                </button>
              </div>
              {q && q.length >= 3 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <SortToggle
                    q={q}
                    sort={selection.sort || "relevance"}
                    selection={selection}
                  />
                </div>
              )}
            </div>
            {/* Mobile: button left, toggle right */}
            <div className="md:hidden">
              <div className={`flex ${q && q.length >= 3 ? "justify-between" : "justify-center"} items-center mb-8`}>
                <button
                  onClick={() => {
                    router.push("/", undefined, { scroll: false });
                    setSearchQ(null);
                  }}
                  className="bg-transparent border-none px-2 py-1 cursor-pointer underline text-gray-500 text-sm font-inherit"
                  aria-label="Auswahl zurücksetzen und alle Fälle anzeigen"
                >
                  Auswahl zurücksetzen
                </button>
                {q && q.length >= 3 && (
                  <SortToggle
                    q={q}
                    sort={selection.sort || "relevance"}
                    selection={selection}
                  />
                )}
              </div>
            </div>
          </>
        )}

        {casesLoading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[150px] mb-4" />
          ))
        ) : (
          <>
            {enoughChars && cases.map((x, index) => <Case item={x} key={`${x.key}-${index}`} />)}
          </>
        )}

        {enoughChars && total > PAGE_SIZE && !casesLoading && (
          <div className="flex items-center justify-center">
            {renderPagination("hidden md:block")}
            {renderPagination("md:hidden")}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseList;
