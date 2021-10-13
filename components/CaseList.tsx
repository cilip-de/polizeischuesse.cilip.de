import {
  Button,
  Center,
  Col,
  Grid,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { useRouter } from "next/router";
import React, { useRef } from "react";
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

const CaseList = ({ data, year, place, state, q, p, options, maxCases }) => {
  const { years, states, places } = options;
  const router = useRouter();
  let resultList = data;

  const searchRef = useRef(null);

  if (year) resultList = resultList.filter((x) => year == x.year); // do not use ===
  if (state) resultList = resultList.filter((x) => state === x.Bundesland);
  if (place) resultList = resultList.filter((x) => place === x.Ort);

  if (!p) p = 1;

  const enoughChars = !q || q.length > 2;
  const numHits = resultList.length;
  const hasNextPage = enoughChars && resultList.length > p * PAGE_SIZE;
  const hasPrevPage = enoughChars && p > 1;

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
            label="Jahr auswählen"
            placeholder="Pick one"
            searchable
            clearable
            nothingFound="No options"
            data={years}
          />
        </Col>
        <Col span={4}>
          <Select
            value={state || ""}
            onChange={(x) => router.push(constructUrl(year, place, x, q))}
            label="Land auswählen"
            placeholder="Pick one"
            searchable
            clearable
            nothingFound="No options"
            data={states}
          />
        </Col>
        <Col span={4}>
          <Select
            value={place || ""}
            onChange={(x) => router.push(constructUrl(year, x, state, q))}
            label="Ort auswählen"
            placeholder="Pick one"
            searchable
            clearable
            nothingFound="No options"
            data={places}
          />
        </Col>
      </Grid>
      <TextInput
        elementRef={searchRef}
        id="search-input"
        style={{ marginBottom: "2rem" }}
        label="Suche"
        onChange={(event) => {
          if (event.currentTarget.value === "") {
            router.push(constructUrl(year, place, state, null));
          } else {
            router.replace(
              constructUrl(year, place, state, event.currentTarget.value)
            );
          }
        }}
      />

      <Center style={{ marginBottom: "1rem" }}>
        {enoughChars && numHits > 1 && numHits !== maxCases && (
          <Text>
            {numHits} von {maxCases} Fälle{" "}
          </Text>
        )}
        {enoughChars && numHits > 1 && numHits === maxCases && (
          <Text>{numHits} Fälle </Text>
        )}
        {enoughChars && numHits === 1 && <Text>ein Fall</Text>}
        {enoughChars && numHits === 0 && <Text>keine Fälle</Text>}
        {!enoughChars && <Text>Bitte mehr Zeichen für die Suche eingeben</Text>}
      </Center>
      {maxCases !== numHits && (
        <Center style={{ marginBottom: "1rem" }}>
          <Text
            onClick={() => {
              router.push("/");
              searchRef.current.value = "";
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
        {hasPrevPage && (
          <Button
            style={{ marginRight: "1rem" }}
            onClick={() =>
              router.push(
                constructUrl(year, place, state, q, Math.max(1, p - 1))
              )
            }
          >
            zurück
          </Button>
        )}
        {hasNextPage && (
          <Button
            onClick={() =>
              router.push(constructUrl(year, place, state, q, p + 1))
            }
          >
            weiter
          </Button>
        )}
      </Center>
    </div>
  );
};

export default CaseList;
