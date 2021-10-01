import { Badge, Card, Col, Grid, Group, Text } from "@mantine/core";
import React from "react";

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
            {item.datePrint}
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

export default Case;
