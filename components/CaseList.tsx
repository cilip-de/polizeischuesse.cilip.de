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
    .filter((x) => !!x[1])
    .map((x) => `${x[0]}=${x[1]}`);

  if (paramsString.length === 0) return "/#chronik";

  return `/?${paramsString.join("&")}#chronik`;
};

const CaseList = ({
  data,
  initialSearchedData,
  selection,
  options,
  maxCases,
}: {
  data: any[];
  initialSearchedData: any[];
  selection: Selection;
  options: any;
  maxCases: number;
}) => {
  const router = useRouter();

  const [searchedData, setSearchedData] = useState(null);
  const [searchedQ, setSearchedQ] = useState(null);
  const [firstRender, setFirstRender] = useState(true);

  useEffect(() => {
    setSearchedData(initialSearchedData);
    setFirstRender(false);
  }, []);

  let { q, p } = selection;

  q = searchedQ ?? q;

  let resultList =
    firstRender && initialSearchedData != null
      ? initialSearchedData
      : searchedData || data;

  for (const [k, v] of Object.entries(selection)) {
    if (!v || !SELECTABLE.includes(k)) continue;
    resultList = resultList.filter((x) => x[k] == v);
  }

  console.log(selection.tags);

  for (const tag of selection.tags || []) {
    resultList = resultList.filter((x) => x[tag]);
  }

  const enoughChars = !q || q.length > 2;
  const numHits = resultList.length;
  const totalPages = Math.ceil(resultList.length / PAGE_SIZE);

  resultList = paginate(resultList, PAGE_SIZE, p);

  return (
    <div style={{ paddingBottom: "2rem" }}>
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
                  constructUrl({ ...selection, [key]: x }),
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
        <Col span={6}>
          <TextInput
            value={q}
            style={{ marginBottom: "2rem" }}
            label="Suche"
            placeholder="z. B. Wohnung oder Kopf"
            onChange={async (event) => {
              router.replace(
                constructUrl({ ...selection, q: event.currentTarget.value }),
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
                      await fetch("/api/suche?q=" + event.currentTarget.value)
                    ).json()
                  );
              }
            }}
          />
        </Col>
        <Col span={6}>
          <MultiSelect
            clearable
            label="Kategorie"
            value={selection.tags}
            data={TAGS.map((x) => ({ label: x[1], value: x[0] }))}
            onChange={(x) =>
              router.replace(
                constructUrl({ ...selection, tags: x }),
                undefined,
                { scroll: false }
              )
            }
          ></MultiSelect>
        </Col>
      </Grid>

      <div style={{ minHeight: "100rem" }}>
        <Center style={{ marginBottom: "1rem" }}>
          {enoughChars && numHits > 1 && numHits !== maxCases && (
            <Text>
              {numHits} von {maxCases} Fälle
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
        {maxCases !== numHits && (
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
        <Center>
          <Pagination
            total={totalPages}
            page={p}
            onChange={(newPage) =>
              router.push(
                constructUrl({
                  ...selection,
                  p: newPage,
                }),
                undefined,
                { scroll: false }
              )
            }
          />
        </Center>
      </div>
    </div>
  );
};

export default CaseList;
