import {
  Center,
  Col,
  Grid,
  MultiSelect,
  Pagination,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { PAGE_SIZE, SELECTABLE, TAGS } from "../lib/data";
import { paginate } from "../lib/util";
import Case from "./Case";
import Map from "./Map";

type Selection = {
  year: string;
  place: string;
  state: string;
  q: string;
  p: number;
  tags: string[];
};

const constructUrl = (params: Partial<Selection>) => {
  const paramsString = Object.entries(params)
    .filter((x) => !!x[1] && (!Array.isArray(x[1]) || x[1].length))
    .map((x) => `${x[0]}=${x[1]}`);

  if (paramsString.length === 0) return "/#chronik";

  return `/?${paramsString.join("&")}#chronik`;
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

  const constructUrlWithQ = (params) => {
    if (q !== null) params["q"] = q;
    return constructUrl(params);
  };

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

  const numHits = resultList.length;
  const totalPages = Math.ceil(resultList.length / PAGE_SIZE);

  const displayLocations = new Set(
    resultList.map((x) => x["Ort"] + x["Bundesland"])
  );

  const displayMarkers = geoData.filter((x) =>
    displayLocations.has(x.city + x.state)
  );

  for (const x of displayMarkers) {
    if (x["city"] == "Frankfurt am Main") console.log(x);
  }

  console.log(displayLocations);
  console.log(displayMarkers);

  resultList = paginate(resultList, PAGE_SIZE, p);

  return (
    <div style={{ paddingBottom: "2rem" }}>
      <Grid>
        <Col span={8}>
          <div style={{ height: "100px" }}></div>
          <Grid style={{ marginBottom: "2rem", marginTop: "1rem" }}>
            {[
              ["year", "Jahr"],
              ["state", "Bundesland"],
              ["place", "Ort"],
            ].map(([key, label]) => (
              <Col span={4} key={key}>
                <Select
                  value={selection[key] || ""}
                  onChange={(x) =>
                    router.push(
                      constructUrl({ ...selection, [key]: x, p: 1 }),
                      undefined,
                      {
                        scroll: false,
                      }
                    )
                  }
                  label={label}
                  placeholder="auswählen"
                  searchable
                  clearable
                  nothingFound="keine Ergebnis"
                  data={options[key]}
                />
              </Col>
            ))}
          </Grid>
          <Grid>
            <Col span={4}>
              <TextInput
                value={q}
                style={{ marginBottom: "2rem" }}
                label="Suche"
                placeholder="z. B. Wohnung, Flucht, Rücken, Kopf"
                onChange={async (event) => {
                  if (selection.p > 1) {
                    router.replace(
                      constructUrlWithQ({
                        ...selection,
                        p: 1,
                        q: event.currentTarget.value,
                      })
                    ),
                      undefined,
                      { scroll: false };
                    return;
                  }

                  router.replace(
                    constructUrlWithQ({
                      ...selection,
                      q: event.currentTarget.value,
                    }),
                    undefined,
                    { shallow: true }
                  );
                  setSearchedQ(event.currentTarget.value);
                  if (event.currentTarget.value === "") {
                    setSearchedData(null);
                  } else {
                    if (event.currentTarget.value.length > 2)
                      setSearchedData(
                        await (
                          await fetch(
                            "/api/suche?q=" + event.currentTarget.value
                          )
                        ).json()
                      );
                  }
                }}
              />
            </Col>
            <Col span={8}>
              <MultiSelect
                clearable
                label="Kategorie"
                placeholder="auswählen (mehrfach)"
                value={selection.tags}
                data={TAGS.map((x) => ({
                  label: x[2],
                  value: x[0],
                  group: "trifft zu",
                }))
                  .concat(
                    TAGS.map((x) => ({
                      label: x[3],
                      value: "no__" + x[0],
                      group: "trifft nicht zu",
                    }))
                  )
                  .filter(
                    (x) =>
                      !selection.tags.includes(
                        x.value.startsWith("no__")
                          ? x.value.replace("no__", "")
                          : "no__" + x.value
                      )
                  )}
                onChange={(x) =>
                  router.replace(
                    constructUrlWithQ({ ...selection, tags: x, p: 1 }),
                    undefined,
                    { scroll: false }
                  )
                }
              ></MultiSelect>
            </Col>
          </Grid>
        </Col>
        <Col span={4}>
          <Map makersData={displayMarkers} />
        </Col>
      </Grid>

      <div style={{ minHeight: "100rem" }}>
        <Center style={{ marginBottom: "1rem" }}>
          {enoughChars && numHits > 1 && numHits !== maxCases && (
            <Text>
              {numHits} von {maxCases} Fällen
            </Text>
          )}
          {enoughChars && numHits > 1 && numHits === maxCases && (
            <Text>{numHits} Fälle</Text>
          )}
          {enoughChars && numHits === 1 && <Text>ein Fall</Text>}
          {enoughChars && numHits === 0 && <Text>keine Fälle</Text>}
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
                  constructUrlWithQ({
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
