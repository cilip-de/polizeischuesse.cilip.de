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

const textToLinks = (text) => {
  const links = text
    .trim()
    .split(" ")
    .filter((x) => x !== "");

  if (links.length === 0) return "TBA";

  return links.map((x, i) => (
    <a
      target="_blank"
      rel="noreferrer"
      key={x}
      style={{ color: "inherit", textDecoration: "inherit" }}
      href={x}
    >
      [{i + 1}]
    </a>
  ));
};

const Case = ({ item, hideLink = false }) => {
  for (const term of SEARCH_KEYES) {
    item[term] = constructHighlights(item, term);
  }

  return (
    <Card
      shadow="sm"
      padding="sm"
      style={{ marginBottom: "2rem", position: "relative" }}
    >
      <Group>
        {item.schusswechsel && (
          <Badge size="xs" color="pink" variant="light">
            Schusswechsel
          </Badge>
        )}
        {item.sek && (
          <Badge size="xs" color="grape" variant="light">
            SEK-Beteiligung
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
        {item.psych && (
          <Badge size="xs" color="blue" variant="light">
            Mutm. phsych. Ausnahmesituation
          </Badge>
        )}
        {item.alkdrog && (
          <Badge size="xs" color="blue" variant="light">
            Mutm. Alkohol / Drogen
          </Badge>
        )}
        {item.famgew && (
          <Badge size="xs" color="teal" variant="light">
            Mutm. famil. oder häusl. Gewalt
          </Badge>
        )}
        {item.unschuss && (
          <Badge size="xs" color="cyan" variant="light">
            Unbeabsichtigte Schussabgabe
          </Badge>
        )}
        {item.indoor && (
          <Badge size="xs" color="lime" variant="light">
            Innenraum
          </Badge>
        )}
      </Group>
      <Space />
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
          <Space />
          <Text size="sm">Quellen: {textToLinks(item["Quellen"])}</Text>
          <div></div>
        </Col>
        <Col span={12} md={8} lg={8}>
          <Text style={{ lineHeight: 1.5, marginBottom: "0.5rem" }}>
            {item["Szenarium"]}
          </Text>
          {!hideLink && (
            <div style={{ position: "absolute", bottom: 0, right: 10 }}>
              <Text align="right" color="dimmed">
                <a
                  href={`/fall/${item["Fall"]}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9c-.086 0-.17.01-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z" />
                    <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4.02 4.02 0 0 1-.82 1H12a3 3 0 1 0 0-6H9z" />
                  </svg>
                </a>
              </Text>
            </div>
          )}
        </Col>
      </Grid>
    </Card>
  );
};

export default Case;
