import {
  Badge,
  Card,
  Col,
  Grid,
  Group,
  Select,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import React, { useMemo, useState } from "react";

import _ from "lodash";
import Fuse from "fuse.js";

import dayjs from "dayjs";

// https://dev.to/noclat/using-fuse-js-with-react-to-build-an-advanced-search-with-highlighting-4b93
const highlight = (value, indices = [], i = 1) => {
  const pair = indices[indices.length - i];
  return !pair ? (
    value
  ) : (
    <>
      {highlight(value.substring(0, pair[0]), indices, i + 1)}
      <mark>{value.substring(pair[0], pair[1] + 1)}</mark>
      {value.substring(pair[1] + 1)}
    </>
  );
};

const constructHighlights = (item, attr) => {
  let text = item[attr];

  const descMatches = (item.matches || []).filter((x) => x.key === attr);
  if (descMatches.length) {
    text = highlight(descMatches[0].value, descMatches[0].indices);
  }
  return text;
};

const Case = ({ item }) => {
  const description = constructHighlights(item, "Szenarium");
  const name = constructHighlights(item, "Name");

  return (
    <Card shadow="sm" padding="lg" style={{ marginBottom: "2rem" }}>
      <Grid id="my-grid">
        <Col span={12} md={6} lg={6}>
          <Group position="apart">
            <Text weight={500}>{name}</Text>
            {item["Schusswechsel"].includes("Ja") && (
              <Badge size="xs" color="pink" variant="light">
                Schusswechsel
              </Badge>
            )}
            {item["Sondereinsatzbeamte"].includes("Ja") && (
              <Badge size="xs" color="grape" variant="light">
                Sondereinsatzbeamte
              </Badge>
            )}
            {item["Verletzte/getötete Beamte"].includes("Ja") && (
              <Badge size="xs" color="violet" variant="light">
                Verletzte/getötete Beamte
              </Badge>
            )}
            {item["Vorbereitete Polizeiaktion"].includes("Ja") && (
              <Badge size="xs" color="indigo" variant="light">
                Vorbereitete Polizeiaktion
              </Badge>
            )}
          </Group>
          <Text size="sm" style={{ lineHeight: 1.5 }}>
            {item.date.format("DD.MM.YYYY")}
          </Text>
          <Text size="sm" style={{ lineHeight: 1.5 }}>
            {item.Alter} Jahre
          </Text>
          <Text size="sm" style={{ lineHeight: 1.5 }}>
            {item.Ort}, {item.Bundesland}
          </Text>
          <Text size="sm" style={{ lineHeight: 1.5 }}>
            Opfer mit Schusswaffe: {item["Opfer mit Schusswaffe"]}
          </Text>
        </Col>
        <Col span={12} md={6} lg={6}>
          {" "}
          <Text size="sm" style={{ lineHeight: 1.5 }}>
            {description}
          </Text>
        </Col>
      </Grid>
    </Card>
  );
};

const countItems = (arr, sort = false) => {
  const counts = {};
  for (const y of arr) {
    counts[y] = counts[y] ? counts[y] + 1 : 1;
  }

  let countsEntries = Object.entries(counts);

  if (sort) countsEntries = _.orderBy(countsEntries, (x) => x[1], "desc");

  return countsEntries.map((x) => ({
    value: x[0],
    label: x[0] + " (" + x[1] + ")",
  }));
};

const CaseList = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [query, setQuery] = useState("");
  const [searchedData, setSearchedData] = useState(null);

  const [orderedData, years, states, places, fuse] = useMemo(() => {
    const orderedData = _.orderBy(data, "Datum", "desc");

    orderedData.forEach((x, i) => {
      x.date = dayjs(x["Datum"]);
      x.year = x.date.get("year");
      x.key = i;
    });

    const years = _.orderBy(
      countItems(data.map((x) => x.date.get("year"))),
      "value",
      "desc"
    );
    const states = countItems(
      data.map((x) => x.Bundesland),
      true
    );
    const places = countItems(
      data.map((x) => x.Ort),
      true
    );

    const fuse = new Fuse(orderedData, {
      minMatchCharLength: 3,
      includeMatches: true,
      findAllMatches: false,
      threshold: 0,
      ignoreLocation: true,
      keys: ["Name", "Szenarium"],
    });

    return [orderedData, years, states, places, fuse];
  }, [data]);

  console.log(searchedData);

  return (
    <div>
      <Grid
        id="select-grid"
        style={{ marginBottom: "2rem", marginTop: "1rem" }}
      >
        <Col span={4}>
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
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
            value={selectedState}
            onChange={setSelectedState}
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
            value={selectedPlace}
            onChange={setSelectedPlace}
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
        style={{ marginBottom: "2rem" }}
        label="Suche"
        // value={query}
        onChange={(event) => {
          if (event.currentTarget.value === "") {
            setSearchedData(null);
          } else {
            setSearchedData(
              fuse
                .search(event.currentTarget.value)
                .map(({ item, matches }) => ({ ...item, matches: matches }))
            );
          }
        }}
      />

      {(searchedData || orderedData)
        .filter((x) => !selectedYear || selectedYear == x.year)
        .filter((x) => !selectedState || selectedState == x.Bundesland)
        .filter((x) => !selectedPlace || selectedPlace == x.Ort)
        .map((x) => (
          <Case item={x} key={x.key} />
        ))}
    </div>
  );
};

export default CaseList;
