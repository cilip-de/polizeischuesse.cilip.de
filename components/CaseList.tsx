import {
  Center,
  Col,
  Grid,
  Pagination,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Case from "./Case";

const PAGE_SIZE = 20;

const constructUrl = (year, place, state, q, p = null) => {
  const params = {};
  if (year) params["year"] = year;
  if (place) params["place"] = place;
  if (state) params["state"] = state;
  if (q) params["q"] = q;
  if (p) params["p"] = p;

  const paramsString = Object.entries(params).map((x) => `${x[0]}=${x[1]}`);

  if (paramsString.length === 0) return "/";

  return `/?${paramsString.join("&")}`;
};

function paginate(array, page_size, page_number) {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}

const CaseList = ({
  data,
  initialSearchedData,
  year,
  place,
  state,
  q,
  p,
  options,
  maxCases,
}) => {
  const { years, states, places } = options;
  const router = useRouter();

  const [searchedData, setSearchedData] = useState(null);
  const [searchedQ, setSearchedQ] = useState(null);
  const [firstRender, setFirstRender] = useState(true);

  useEffect(() => {
    setSearchedData(initialSearchedData);
    setFirstRender(false);
  }, []);

  q = searchedQ ?? q;

  let resultList =
    firstRender && initialSearchedData != null
      ? initialSearchedData
      : searchedData || data;

  if (year) resultList = resultList.filter((x) => year == x.year); // do not use ===
  if (state) resultList = resultList.filter((x) => state === x.Bundesland);
  if (place) resultList = resultList.filter((x) => place === x.Ort);

  if (!p) p = 1;

  const enoughChars = !q || q.length > 2;
  const numHits = resultList.length;
  const hasNextPage = enoughChars && resultList.length > p * PAGE_SIZE;
  const hasPrevPage = enoughChars && p > 1;

  const totalPages = Math.ceil(resultList.length / PAGE_SIZE);

  resultList = paginate(resultList, PAGE_SIZE, p);

  return (
    <div style={{ paddingBottom: "2rem" }}>
      <Grid
        id="select-grid"
        style={{ marginBottom: "2rem", marginTop: "1rem" }}
      >
        <Col span={4}>
          <Select
            value={year || ""}
            onChange={(x) => router.push(constructUrl(x, place, state, q))}
            label="Jahr"
            placeholder="auswählen"
            searchable
            clearable
            nothingFound="keine Ergebnis"
            data={years}
          />
        </Col>
        <Col span={4}>
          <Select
            value={state || ""}
            onChange={(x) => router.push(constructUrl(year, place, x, q))}
            label="Land"
            placeholder="auswählen"
            searchable
            clearable
            nothingFound="keine Ergebnis"
            data={states}
          />
        </Col>
        <Col span={4}>
          <Select
            value={place || ""}
            onChange={(x) => router.push(constructUrl(year, x, state, q))}
            label="Ort"
            placeholder="auswählen"
            searchable
            clearable
            nothingFound="keine Ergebnis"
            data={places}
          />
        </Col>
      </Grid>
      <TextInput
        value={q}
        id="search-input"
        style={{ marginBottom: "2rem" }}
        label="Suche"
        placeholder="z. B. Wohnung oder Kopf"
        onChange={async (event) => {
          router.replace(
            constructUrl(year, place, state, event.currentTarget.value),
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
                router.push("/");
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
              router.push(constructUrl(year, place, state, q, newPage))
            }
          />
        </Center>
      </div>
    </div>
  );
};

export default CaseList;
