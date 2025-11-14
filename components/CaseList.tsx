import { Center, Col, Grid, Pagination, Text } from "@mantine/core";
import _ from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { PAGE_SIZE, SELECTABLE, setupOptions } from "../lib/data";
import { constructUrl, constructUrlWithQ, paginate } from "../lib/util";
import AnchorHeading from "./AnchorHeading";
import Case from "./Case";
import CategoryInput from "./CategoryInput";
import { OverviewChart } from "./charts/charts";
import Map from "./Map";
import SearchInput from "./SearchInput";
import SelectInput from "./SelectInput";

type Selection = {
  year: string;
  place: string;
  state: string;
  q: string;
  p: number;
  tags: string[];
  weapon: string;
  age: string;
};

const CaseList = ({
  data,
  geoData,
  initialSearchedData,
  selection,
  options,
  maxCases,
}: {
  data: any[];
  geoData: any[];
  initialSearchedData: any[];
  selection: Selection;
  options: any;
  maxCases: number;
}) => {
  const router = useRouter();

  const [searchedData, setSearchedData] = useState(null);
  const [searchedQ, setSearchedQ] = useState<null | string>(null);
  const [firstRender, setFirstRender] = useState(true);

  useEffect(() => {
    setSearchedData(initialSearchedData);
    setFirstRender(false);
  }, []);

  let { q, p } = selection;

  q = searchedQ ?? q;
  const enoughChars = !q || q.length > 2;

  let resultList =
    firstRender && initialSearchedData != null
      ? initialSearchedData
      : searchedData || data;

  for (const [k, v] of Object.entries(selection)) {
    if (!v || !SELECTABLE.includes(k)) continue;
    resultList = resultList.filter((x) => x[k] == v);
  }

  for (const tag of selection.tags || []) {
    resultList = resultList.filter((x) =>
      tag.startsWith("no__") ? !x[tag.replace("no__", "")] : x[tag]
    );
  }

  if (selection.weapon)
    resultList = resultList.filter((x) => x.weapon.includes(selection.weapon));

  const numHits = resultList.length;
  const totalPages = Math.ceil(resultList.length / PAGE_SIZE);

  const displayLocations = _.countBy(
    resultList,
    (x) => x["place"] + x["state"]
  );

  const displayMarkers = geoData.filter((x) =>
    displayLocations.hasOwnProperty(x.city + x.state)
  );

  displayMarkers.forEach((x) => {
    x.count = displayLocations[x.city + x.state];
  });

  const overChart = (
    <OverviewChart
      data={data}
      hits={resultList}
      onClick={(x) =>
        router.push(
          constructUrl({ ...selection, year: x.indexValue, p: 1 }),
          undefined,
          {
            scroll: false,
          }
        )
      }
    />
  );

  // for (const x of displayMarkers) {
  //   if (x["city"] == "Frankfurt am Main") console.log(x);
  // }

  // console.log(displayLocations);
  // console.log(displayMarkers);

  options = setupOptions(resultList);
  resultList = paginate(resultList, PAGE_SIZE, p);

  return (
    <div style={{ paddingBottom: "2rem" }}>
      <Grid>
        <Col span={2} className="only-mobile"></Col>
        <Col span={12} xs={8} className="only-mobile">
          <Map
            makersData={displayMarkers}
            setInputPlace={(x) =>
              router.push(
                constructUrl({ ...selection, place: x, p: 1 }),
                undefined,
                {
                  scroll: false,
                }
              )
            }
          />{" "}
        </Col>
        <Col span={2} className="only-mobile"></Col>
        <Col span={12} sm={8}>
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
              <Col span={4} key={key}>
                <SelectInput
                  skey={key}
                  label={label}
                  selection={selection}
                  data={options[key]}
                />
              </Col>
            ))}
          </Grid>
          <Grid style={{ marginBottom: "1rem" }}>
            <Col span={8}>
              <SearchInput
                q={q}
                selection={selection}
                setSearchedData={setSearchedData}
                setSearchedQ={setSearchedQ}
              />
            </Col>
            <Col span={4}>
              <SelectInput
                skey={"weapon"}
                label={"Bewaffnung"}
                selection={selection}
                data={options.weapon}
              />
            </Col>
          </Grid>
          <Grid style={{ marginBottom: "1rem" }}>
            <Col span={8}>
              <CategoryInput q={q} selection={selection} />
            </Col>
            <Col span={4}>
              <SelectInput
                skey={"age"}
                label={"Alter"}
                selection={selection}
                data={options.age}
              />
            </Col>
          </Grid>
          {overChart}
          </div>
        </Col>
        <Col span={4} className="only-non-mobile">
          <Map
            makersData={displayMarkers}
            setInputPlace={(x) =>
              router.push(
                constructUrl({ ...selection, place: x, p: 1 }),
                undefined,
                {
                  scroll: false,
                }
              )
            }
          />
        </Col>
      </Grid>

      <div style={{ minHeight: "100rem" }}>
        <div
          className="only-mobile"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <Center style={{ marginBottom: "1rem", marginTop: "1rem" }}>
            {enoughChars && numHits > 1 && numHits !== maxCases && (
              <Text>
                zeige {numHits} von {maxCases} polizeilichen Todesschüsse
              </Text>
            )}
            {enoughChars && numHits > 1 && numHits === maxCases && (
              <Text>{numHits} polizeiliche Todesschüsse</Text>
            )}
            {enoughChars && numHits === 1 && (
              <Text>ein polizeilicher Todesschuss</Text>
            )}
            {enoughChars && numHits === 0 && (
              <Text>
                kein polizeilicher Todesschuss entfällt auf die Auswahl
              </Text>
            )}
            {!enoughChars && (
              <Text>Bitte mehr Zeichen für die Suche eingeben</Text>
            )}
          </Center>
        </div>
        <Grid className="only-non-mobile">
          <Col span={8}>
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
              {enoughChars && numHits > 1 && numHits !== maxCases && (
                <Text color="gray">
                  zeige {numHits} von {maxCases} polizeilichen Todesschüsse
                </Text>
              )}
              {enoughChars && numHits > 1 && numHits === maxCases && (
                <Text color="gray">{numHits} polizeiliche Todesschüsse</Text>
              )}
              {enoughChars && numHits === 1 && (
                <Text color="gray">ein polizeilicher Todesschuss</Text>
              )}
              {enoughChars && numHits === 0 && (
                <Text color="gray">
                  kein polizeilicher Todesschuss entfält auf die Auswahl
                </Text>
              )}
              {!enoughChars && (
                <Text color="gray">
                  Bitte mehr Zeichen für die Suche eingeben
                </Text>
              )}
            </Center>
          </Col>
          <Col span={4}>
            <div style={{ marginBottom: "2rem", marginTop: "0rem" }}>
              <Text align="center" color="gray">
                {displayMarkers.length !== geoData.length &&
                  displayMarkers.length > 1 &&
                  `an ${displayMarkers.length} von ${geoData.length} Orten`}
                {displayMarkers.length === geoData.length &&
                  `an ${geoData.length} Orten`}
                {displayMarkers.length === 1 && `an einem Ort`}
              </Text>
            </div>
          </Col>
        </Grid>
        {enoughChars && maxCases !== numHits && (
          <Center style={{ marginBottom: "2rem" }}>
            <button
              onClick={() => {
                router.push("/#chronik", undefined, { scroll: false });
                setSearchedData(null);
                setSearchedQ("");
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

        {enoughChars && resultList.map((x) => <Case item={x} key={x.key} />)}
        {enoughChars && numHits > PAGE_SIZE && (
          <Center>
            <Pagination
              className="only-non-mobile"
              total={totalPages}
              page={p}
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
            />
            <Pagination
              className="only-mobile"
              size={"sm"}
              total={totalPages}
              page={p}
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
            />
          </Center>
        )}
      </div>
    </div>
  );
};

export default CaseList;
