import { Badge, Card, Col, Grid, Group, Space, Text } from "@mantine/core";
import React from "react";
import { SEARCH_KEYES } from "../lib/data";
import { isNumber } from "../lib/util";

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
  for (const term of SEARCH_KEYES) {
    item[term] = constructHighlights(item, term);
  }

  return (
    <Card shadow="sm" padding="lg" style={{ marginBottom: "2rem" }}>
      <Group>
        {item.schusswechsel && (
          <Badge size="xs" color="pink" variant="light">
            Schusswechsel
          </Badge>
        )}
        {item.sek && (
          <Badge size="xs" color="grape" variant="light">
            SEK
          </Badge>
        )}
        {item.vgbeamte && (
          <Badge size="xs" color="violet" variant="light">
            Verletzte/getötete Beamte
          </Badge>
        )}
        {item.vorbaktion && (
          <Badge size="xs" color="indigo" variant="light">
            Vorbereitete Polizeiaktion
          </Badge>
        )}
        {item.famgew && (
          <Badge size="xs" color="blue" variant="light">
            Phsych. Ausnahmesituation / Drogen
          </Badge>
        )}
        {item.famgew && (
          <Badge size="xs" color="teal" variant="light">
            Famil. oder häusl. Gewalt
          </Badge>
        )}
        {item.unschuss && (
          <Badge size="xs" color="cyan" variant="light">
            Unbeabsichtigte Schussabgabe
          </Badge>
        )}
        {item.indoor && (
          <Badge size="xs" color="lime" variant="light">
            Indoor
          </Badge>
        )}
      </Group>
      <Grid>
        <Col span={12} md={4} lg={4}>
          <Text weight={500}>{item["Name"].replace(`, ${item.sex}`, "")}</Text>
          <Text size="sm" style={{ lineHeight: 1.5 }}>
            {isNumber(item.Alter)
              ? `${item.Alter} Jahre`
              : `Alter: ${item.Alter}`}
            {item.sex.length > 0 && `, ${item.sex}`}
          </Text>
          <Space />
          <Text size="sm" style={{ lineHeight: 1.5 }}>
            Erschossen am {item.datePrint}
          </Text>
          <Text size="sm" style={{ lineHeight: 1.5 }}>
            In {item.place}
            {item.state !== item.place && `, ${item.state}`}
          </Text>
          <Text size="sm" style={{ lineHeight: 1.5 }}>
            {item.numShots.length > 0 &&
              item.numShots !== "1" &&
              `Mit ${item.numShots} Schüssen`}
            {item.numShots.length > 0 &&
              item.numShots === "1" &&
              `Mit einem Schuss`}
          </Text>
          <Text size="sm" style={{ lineHeight: 1.5 }}>
            {item.weapon && `Bewaffnet mit ${item.weapon}`}
          </Text>
        </Col>
        <Col span={12} md={8} lg={8}>
          <Text size="sm" style={{ lineHeight: 1.5 }}>
            {item["Szenarium"]}
          </Text>
        </Col>
      </Grid>
    </Card>
  );
};

export default Case;
