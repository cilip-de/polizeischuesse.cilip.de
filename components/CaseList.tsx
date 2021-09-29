import {
  Badge,
  Card,
  Col,
  Grid,
  Group,
  Select,
  Text,
  useMantineTheme,
} from "@mantine/core";
import React, { useState } from "react";

import dayjs from "dayjs";

const Case = ({ item }) => {
  return (
    <Card shadow="sm" padding="lg" style={{ marginBottom: "2rem" }}>
      <Grid id="my-grid">
        <Col span={12} md={6} lg={6}>
          <Group position="apart">
            <Text weight={500}>{item.Name}</Text>
            <Badge color="pink" variant="light">
              Eine Kategorie
            </Badge>
          </Group>
          <Text size="sm" style={{ lineHeight: 1.5 }}>
            {item.date.format("DD.MM.YYYY")}
          </Text>
          <Text size="sm" style={{ lineHeight: 1.5 }}>
            {item.Age}
          </Text>
          <Text size="sm" style={{ lineHeight: 1.5 }}>
            {item.Place}, {item.State}
          </Text>
        </Col>
        <Col span={12} md={6} lg={6}>
          {" "}
          <Text size="sm" style={{ lineHeight: 1.5 }}>
            {item["Summary of events"]}
          </Text>
        </Col>
      </Grid>
    </Card>
  );
};

const countItems = (arr) => {
  const counts = {};
  for (const y of arr) {
    counts[y] = counts[y] ? counts[y] + 1 : 1;
  }

  return Object.entries(counts).map((x) => ({
    value: x[0],
    label: x[0] + " (" + x[1] + ")",
  }));
};

const CaseList = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");

  data.forEach((x, i) => {
    x.date = dayjs(x["Date(YYYY-MM-TT)"]);
    x.year = x.date.get("year");
    x.key = i;
  });

  const years = countItems(data.map((x) => x.date.get("year")));
  const states = countItems(data.map((x) => x.State));
  const places = countItems(data.map((x) => x.Place));

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
      {data
        .filter((x) => !selectedYear || selectedYear == x.year)
        .filter((x) => !selectedState || selectedState == x.State)
        .filter((x) => !selectedPlace || selectedPlace == x.Place)
        .map((x) => (
          <Case item={x} key={x.key} />
        ))}
    </div>
  );
};

export default CaseList;
