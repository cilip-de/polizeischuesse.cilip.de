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
import { useRouter } from "next/router";
import { useMemo, useState, useCallback } from "react";
import { PAGE_SIZE, type ProcessedDataItem } from "../lib/data";
import { constructUrl, constructUrlWithQ, type Selection } from "../lib/util";
import { useCases, type CasesFilters } from "../lib/hooks/useCases";
import { useGeoData } from "../lib/hooks/useGeoData";
import { useStats } from "../lib/hooks/useStats";
import AnchorHeading from "./AnchorHeading";
import Case from "./Case";
import CategoryInput from "./CategoryInput";
import { OverviewChartFromStats } from "./charts/OverviewChartFromStats";
import Map from "./Map";
import SearchInput from "./SearchInput";
import SelectInput from "./SelectInput";
import SortToggle from "./SortToggle";

interface CaseListProps {
  maxCases: number;
}

function parseSelectionFromQuery(query: Record<string, string | string[] | undefined>): Required<Selection> {
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

function selectionToFilters(selection: Required<Selection>, searchQ: string | null): CasesFilters {
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

const CaseList = ({ maxCases }: CaseListProps) => {
  const router = useRouter();

  // Parse selection from URL query params
  const selection = useMemo(() => parseSelectionFromQuery(router.query), [router.query]);

  // Local state for search input (for debounced search)
  const [searchQ, setSearchQ] = useState<string | null>(null);

  // Build filters for API calls
  const filters = useMemo(() => selectionToFilters(selection, searchQ), [selection, searchQ]);

  // Stats filters (same as cases but without pagination)
  const statsFilters = useMemo(() => {
    const { page, limit, ...rest } = filters;
    return rest;
  }, [filters]);

  // Fetch cases, geo data, and stats
  const { data: casesData, isLoading: casesLoading } = useCases(filters);
  const { data: geoData, isLoading: geoLoading } = useGeoData(statsFilters);
  const { data: statsData, isLoading: statsLoading } = useStats(statsFilters);

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

  // Handler for search input
  const handleSearchData = useCallback((_data: ProcessedDataItem[] | null) => {
    // With React Query, we don't need to store search results in state
    // The useCases hook handles it. This is kept for compatibility.
  }, []);

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
    <div style={{ paddingBottom: "2rem" }}>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-2 only-mobile"></div>
        <div className="col-span-12 sm:col-span-8 only-mobile">
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
        <div className="col-span-2 only-mobile"></div>
        <div className="col-span-12 md:col-span-8">
          <AnchorHeading order={2} id="chronik">
            Chronik
          </AnchorHeading>
          <div role="search" aria-label="Suche und Filter für polizeiliche Todesschüsse">
            <div className="grid grid-cols-12 gap-4" style={{ marginBottom: "1rem", marginTop: "0.5rem" }}>
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
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-12 gap-4" style={{ marginBottom: "1rem" }}>
              <div className="col-span-8">
                <SearchInput
                  q={q}
                  selection={selection}
                  setSearchedData={handleSearchData}
                  setSearchedQ={handleSearchQ}
                />
              </div>
              <div className="col-span-4">
                <SelectInput
                  skey={"weapon"}
                  label={"Bewaffnung"}
                  selection={selection}
                  data={options.weapon || []}
                />
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4" style={{ marginBottom: "1rem" }}>
              <div className="col-span-12 md:col-span-8">
                <CategoryInput q={q} selection={selection} />
              </div>
              <div className="col-span-12 md:col-span-4">
                <SelectInput
                  skey={"age"}
                  label={"Alter"}
                  selection={selection}
                  data={options.age || []}
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
        </div>
        <div className="col-span-4 only-non-mobile">
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

      <div style={{ minHeight: "100rem" }}>
        <div
          className="only-mobile"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex items-center justify-center" style={{ marginBottom: "1rem", marginTop: "1rem" }}>
            {casesLoading ? (
              <Skeleton className="h-5 w-[200px]" />
            ) : (
              <>
                {enoughChars && total > 1 && total !== maxCases && (
                  <p>
                    zeige {total} von {maxCases} polizeilichen Todesschüsse
                  </p>
                )}
                {enoughChars && total > 1 && total === maxCases && (
                  <p>{total} polizeiliche Todesschüsse</p>
                )}
                {enoughChars && total === 1 && (
                  <p>ein polizeilicher Todesschuss</p>
                )}
                {enoughChars && total === 0 && (
                  <p>
                    kein polizeilicher Todesschuss entfällt auf die Auswahl
                  </p>
                )}
                {!enoughChars && (
                  <p>Bitte mehr Zeichen für die Suche eingeben</p>
                )}
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4 only-non-mobile">
          <div className="col-span-8">
            <div
              className="flex items-center justify-center"
              style={{
                marginLeft: ".5rem",
                marginBottom: "2rem",
                marginTop: "0rem",
              }}
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {casesLoading ? (
                <Skeleton className="h-5 w-[250px]" />
              ) : (
                <>
                  {enoughChars && total > 1 && total !== maxCases && (
                    <p className="text-gray-500">
                      zeige {total} von {maxCases} polizeilichen Todesschüsse
                    </p>
                  )}
                  {enoughChars && total > 1 && total === maxCases && (
                    <p className="text-gray-500">{total} polizeiliche Todesschüsse</p>
                  )}
                  {enoughChars && total === 1 && (
                    <p className="text-gray-500">ein polizeilicher Todesschuss</p>
                  )}
                  {enoughChars && total === 0 && (
                    <p className="text-gray-500">
                      kein polizeilicher Todesschuss entfält auf die Auswahl
                    </p>
                  )}
                  {!enoughChars && (
                    <p className="text-gray-500">
                      Bitte mehr Zeichen für die Suche eingeben
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="col-span-4">
            <div style={{ marginBottom: "2rem", marginTop: "0rem" }}>
              {geoLoading ? (
                <Skeleton className="h-5 w-[150px] mx-auto" />
              ) : (
                <p className="text-center text-gray-500">
                  {displayMarkers.length !== totalLocations &&
                    displayMarkers.length > 1 &&
                    `an ${displayMarkers.length} von ${totalLocations} Orten`}
                  {displayMarkers.length === totalLocations &&
                    `an ${totalLocations} Orten`}
                  {displayMarkers.length === 1 && `an einem Ort`}
                </p>
              )}
            </div>
          </div>
        </div>
        {enoughChars && isFiltered && (
          <>
            {/* Desktop: button centered, toggle absolutely positioned right */}
            <div className="only-non-mobile" style={{ position: "relative", marginBottom: "2rem", width: "100%" }}>
              <div className="flex items-center justify-center">
                <button
                  onClick={() => {
                    router.push("/", undefined, { scroll: false });
                    setSearchQ(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0.25rem 0.5rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                    color: "#868e96",
                    fontSize: "0.875rem",
                    font: "inherit",
                  }}
                  aria-label="Auswahl zurücksetzen und alle Fälle anzeigen"
                >
                  Auswahl zurücksetzen
                </button>
              </div>
              {q && q.length >= 3 && (
                <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}>
                  <SortToggle
                    q={q}
                    sort={selection.sort || "relevance"}
                    selection={selection}
                  />
                </div>
              )}
            </div>
            {/* Mobile: button left, toggle right */}
            <div className="only-mobile">
              <div style={{ display: "flex", justifyContent: q && q.length >= 3 ? "space-between" : "center", alignItems: "center", marginBottom: "2rem" }}>
                <button
                  onClick={() => {
                    router.push("/", undefined, { scroll: false });
                    setSearchQ(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0.25rem 0.5rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                    color: "#868e96",
                    fontSize: "0.875rem",
                    font: "inherit",
                  }}
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
            {renderPagination("only-non-mobile")}
            {renderPagination("only-mobile")}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseList;
