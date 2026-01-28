import { Center, Grid, Pagination, Skeleton, Text } from "@mantine/core";
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

  return (
    <div style={{ paddingBottom: "2rem" }}>
      <Grid>
        <Grid.Col span={2} className="only-mobile"></Grid.Col>
        <Grid.Col span={{ base: 12, xs: 8 }} className="only-mobile">
          {geoLoading ? (
            <Skeleton height={200} />
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
        </Grid.Col>
        <Grid.Col span={2} className="only-mobile"></Grid.Col>
        <Grid.Col span={{ base: 12, sm: 8 }}>
          <AnchorHeading order={2} id="chronik">
            Chronik
          </AnchorHeading>
          <div role="search" aria-label="Suche und Filter für polizeiliche Todesschüsse">
            <Grid style={{ marginBottom: "1rem", marginTop: "0.5rem" }}>
              {[
                ["year", "Jahr"],
                ["state", "Bundesland"],
                ["place", "Ort"],
              ].map(([key, label]) => (
                <Grid.Col span={4} key={key}>
                  <SelectInput
                    skey={key}
                    label={label}
                    selection={selection}
                    data={options[key as keyof typeof options] || []}
                  />
                </Grid.Col>
              ))}
            </Grid>
            <Grid style={{ marginBottom: "1rem" }}>
              <Grid.Col span={6}>
                <SearchInput
                  q={q}
                  selection={selection}
                  setSearchedData={handleSearchData}
                  setSearchedQ={handleSearchQ}
                />
              </Grid.Col>
              <Grid.Col span={2}>
                <SortToggle
                  q={q}
                  sort={selection.sort || "relevance"}
                  selection={selection}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <SelectInput
                  skey={"weapon"}
                  label={"Bewaffnung"}
                  selection={selection}
                  data={options.weapon || []}
                />
              </Grid.Col>
            </Grid>
            <Grid style={{ marginBottom: "1rem" }}>
              <Grid.Col span={{ base: 12, sm: 8 }}>
                <CategoryInput q={q} selection={selection} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <SelectInput
                  skey={"age"}
                  label={"Alter"}
                  selection={selection}
                  data={options.age || []}
                />
              </Grid.Col>
            </Grid>
            {statsLoading ? (
              <Skeleton height={120} />
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
        </Grid.Col>
        <Grid.Col span={4} className="only-non-mobile">
          {geoLoading ? (
            <Skeleton height={300} />
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
        </Grid.Col>
      </Grid>

      <div style={{ minHeight: "100rem" }}>
        <div
          className="only-mobile"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <Center style={{ marginBottom: "1rem", marginTop: "1rem" }}>
            {casesLoading ? (
              <Skeleton height={20} width={200} />
            ) : (
              <>
                {enoughChars && total > 1 && total !== maxCases && (
                  <Text>
                    zeige {total} von {maxCases} polizeilichen Todesschüsse
                  </Text>
                )}
                {enoughChars && total > 1 && total === maxCases && (
                  <Text>{total} polizeiliche Todesschüsse</Text>
                )}
                {enoughChars && total === 1 && (
                  <Text>ein polizeilicher Todesschuss</Text>
                )}
                {enoughChars && total === 0 && (
                  <Text>
                    kein polizeilicher Todesschuss entfällt auf die Auswahl
                  </Text>
                )}
                {!enoughChars && (
                  <Text>Bitte mehr Zeichen für die Suche eingeben</Text>
                )}
              </>
            )}
          </Center>
        </div>
        <Grid className="only-non-mobile">
          <Grid.Col span={8}>
            <Center
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
                <Skeleton height={20} width={250} />
              ) : (
                <>
                  {enoughChars && total > 1 && total !== maxCases && (
                    <Text c="gray">
                      zeige {total} von {maxCases} polizeilichen Todesschüsse
                    </Text>
                  )}
                  {enoughChars && total > 1 && total === maxCases && (
                    <Text c="gray">{total} polizeiliche Todesschüsse</Text>
                  )}
                  {enoughChars && total === 1 && (
                    <Text c="gray">ein polizeilicher Todesschuss</Text>
                  )}
                  {enoughChars && total === 0 && (
                    <Text c="gray">
                      kein polizeilicher Todesschuss entfält auf die Auswahl
                    </Text>
                  )}
                  {!enoughChars && (
                    <Text c="gray">
                      Bitte mehr Zeichen für die Suche eingeben
                    </Text>
                  )}
                </>
              )}
            </Center>
          </Grid.Col>
          <Grid.Col span={4}>
            <div style={{ marginBottom: "2rem", marginTop: "0rem" }}>
              {geoLoading ? (
                <Skeleton height={20} width={150} style={{ margin: "0 auto" }} />
              ) : (
                <Text ta="center" c="gray">
                  {displayMarkers.length !== totalLocations &&
                    displayMarkers.length > 1 &&
                    `an ${displayMarkers.length} von ${totalLocations} Orten`}
                  {displayMarkers.length === totalLocations &&
                    `an ${totalLocations} Orten`}
                  {displayMarkers.length === 1 && `an einem Ort`}
                </Text>
              )}
            </div>
          </Grid.Col>
        </Grid>
        {enoughChars && isFiltered && (
          <Center style={{ marginBottom: "2rem" }}>
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
          </Center>
        )}

        {casesLoading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={150} mb="md" />
          ))
        ) : (
          <>
            {enoughChars && cases.map((x, index) => <Case item={x} key={`${x.key}-${index}`} />)}
          </>
        )}

        {enoughChars && total > PAGE_SIZE && !casesLoading && (
          <Center>
            <Pagination
              className="only-non-mobile"
              total={totalPages}
              value={selection.p}
              onChange={(newPage) =>
                router.push(
                  constructUrlWithQ(q, {
                    ...selection,
                    p: newPage,
                  }),
                  undefined,
                  { scroll: false }
                )
              }
              getControlProps={(control) => {
                if (control === 'previous') return { 'aria-label': 'Vorherige Seite' };
                if (control === 'next') return { 'aria-label': 'Nächste Seite' };
                if (control === 'first') return { 'aria-label': 'Erste Seite' };
                if (control === 'last') return { 'aria-label': 'Letzte Seite' };
                return {};
              }}
              getItemProps={(page) => ({
                'aria-label': `Seite ${page}`,
              })}
            />
            <Pagination
              className="only-mobile"
              size={"sm"}
              total={totalPages}
              value={selection.p}
              onChange={(newPage) =>
                router.push(
                  constructUrlWithQ(q, {
                    ...selection,
                    p: newPage,
                  }),
                  undefined,
                  { scroll: false }
                )
              }
              getControlProps={(control) => {
                if (control === 'previous') return { 'aria-label': 'Vorherige Seite' };
                if (control === 'next') return { 'aria-label': 'Nächste Seite' };
                if (control === 'first') return { 'aria-label': 'Erste Seite' };
                if (control === 'last') return { 'aria-label': 'Letzte Seite' };
                return {};
              }}
              getItemProps={(page) => ({
                'aria-label': `Seite ${page}`,
              })}
            />
          </Center>
        )}
      </div>
    </div>
  );
};

export default CaseList;
