import { Center, Col, Grid, Pagination, Text } from "@mantine/core";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { PAGE_SIZE, SELECTABLE } from "../lib/data";
import { constructUrl, constructUrlWithQ, paginate } from "../lib/util";
import Case from "./Case";
import CategoryInput from "./CategoryInput";
import { OverviewChart } from "./charts";
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

  const displayLocations = new Set(
    resultList.map((x) => x["Ort"] + x["Bundesland"])
  );

  const displayMarkers = geoData.filter((x) =>
    displayLocations.has(x.city + x.state)
  );

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

  resultList = paginate(resultList, PAGE_SIZE, p);

  return (
    <div style={{ paddingBottom: "2rem" }}>
      <Grid>
        <Col span={8}>
          <Grid style={{ marginBottom: "1rem", marginTop: "1rem" }}>
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
        </Col>
        <Col span={4}>
          <Map makersData={displayMarkers} />
        </Col>
      </Grid>

      <div style={{ minHeight: "100rem" }}>
        <Center style={{ marginBottom: "1rem" }}>
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
            <Text>kein polizeilicher Todesschuss</Text>
          )}
          {!enoughChars && (
            <Text>Bitte mehr Zeichen für die Suche eingeben</Text>
          )}
        </Center>
        {enoughChars && maxCases !== numHits && (
          <Center style={{ marginBottom: "1rem" }}>
            <Text
              onClick={() => {
                router.push("/#chronik", undefined, { scroll: false });
                setSearchedData(null);
                setSearchedQ("");
              }}
              size="sm"
              style={{
                paddingLeft: "1rem",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Auswahl zurücksetzen
            </Text>
          </Center>
        )}

        {enoughChars && resultList.map((x) => <Case item={x} key={x.key} />)}
        {enoughChars && (
          <Center>
            <Pagination
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
