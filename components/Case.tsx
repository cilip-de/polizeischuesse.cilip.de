import React from "react";
import { Badge, Card, Grid, Group, Space, Text } from "@mantine/core";
import type { ProcessedDataItem } from "../lib/data";
import { SEARCH_KEYES } from "../lib/data";
import { isNumber } from "../lib/util";

// https://dev.to/noclat/using-fuse-js-with-react-to-build-an-advanced-search-with-highlighting-4b93
const highlight = (
  value: string,
  indices: number[][] = [],
  i: number = 1
): React.ReactNode => {
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

interface Match {
  key: string;
  value: string;
  indices: number[][];
}

type Item = ProcessedDataItem & {
  matches?: Match[];
}

const constructHighlights = (
  item: Item,
  attr: string
): React.ReactNode => {
  let text: React.ReactNode = item[attr] as string;

  const descMatches: Match[] = (item.matches || []).filter(
    (x) => x.key === attr
  );
  if (descMatches.length) {
    text = highlight(descMatches[0].value, descMatches[0].indices);
  }
  return text;
};

const textToLinks = (text: string): React.ReactNode => {
  const links = text
    .trim()
    .split(" ")
    .filter((x) => x !== "");

  if (links.length === 0) return <span>auf Anfrage</span>;

  return (
    <>
      {links.map((x, i) => (
        <a
          target="_blank"
          rel="noreferrer"
          key={x}
          style={{ color: "inherit", textDecoration: "inherit" }}
          href={x}
        >
          [{i + 1}]
        </a>
      ))}
    </>
  );
};

interface CaseProps {
  item: Item;
  hideLink?: boolean;
  isTaser?: boolean;
}

const Case = ({ item, hideLink = false, isTaser = false }: CaseProps) => {
  // Create highlighted versions without mutating the prop
  // React Compiler will auto-memoize this
  const highlights: Record<string, React.ReactNode> = {};
  for (const term of SEARCH_KEYES) {
    highlights[term] = constructHighlights(item, term);
  }

  return (
    <Card
      shadow="sm"
      padding="sm"
      style={{ marginBottom: "2rem", position: "relative" }}
    >
      <Group style={{ paddingLeft: "-1rem" }}>
        {item.schusswechsel && (
          <Badge size="sm" color="pink" variant="light">
            Schusswechsel
          </Badge>
        )}
        {item.sek && (
          <Badge size="sm" color="grape" variant="light">
            SEK-Beteiligung
          </Badge>
        )}
        {item.vgbeamte && (
          <Badge size="sm" color="violet" variant="light">
            Verletzte/getötete Beamte
          </Badge>
        )}
        {item.vbaktion && (
          <Badge size="sm" color="indigo" variant="light">
            Vorbereitete Polizeiaktion
          </Badge>
        )}
        {item.psych && (
          <Badge size="sm" color="blue" variant="light">
            Mutm. psych. Ausnahmesituation
          </Badge>
        )}
        {item.alkdrog && (
          <Badge size="sm" color="cyan" variant="light">
            Mutm. Alkohol- o. Drogenkonsum
          </Badge>
        )}
        {item.famgew && (
          <Badge size="sm" color="teal" variant="light">
            Mutm. famil. oder häusl. Gewalt
          </Badge>
        )}
        {item.unschuss && (
          <Badge size="sm" color="green" variant="light">
            Unbeabsichtigte Schussabgabe
          </Badge>
        )}
        {item.indoor && (
          <Badge size="sm" color="lime" variant="light">
            Innenraum
          </Badge>
        )}
      </Group>
      <Space h="sm" />
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Text fw={500}>{highlights["Name"]}</Text>
          <Text size="sm" style={{ lineHeight: 1.5 }}>
            {isNumber(item.Alter) ? `${item.Alter} Jahre` : `Alter: unbekannt`}
            {item.sex.length > 0 && `, ${item.sex}`}
          </Text>
          <Space />
          <Text size="sm" c="gray" style={{ lineHeight: 1.5 }}>
            {isTaser ? "Getasert" : "Erschossen"} am {item.datePrint}
          </Text>
          <Text size="sm" c="gray" style={{ lineHeight: 1.5 }}>
            In {item.place}
            {item.state !== item.place && `, ${item.state}`}
          </Text>
          <Text hidden size="sm" c="gray" style={{ lineHeight: 1.5 }}>
            {item.numShots.length > 0 &&
              item.numShots !== "0" &&
              item.numShots !== "1" &&
              `Mit ${item.numShots} Schüssen`}
            {item.numShots.length > 0 &&
              item.numShots === "1" &&
              `Mit einem Schuss`}
          </Text>
          <Text size="sm" c="gray" style={{ lineHeight: 1.5 }}>
            {item.weapon && `Bewaffnet mit ${item.weapon}`}
          </Text>
          <Space />
          <Text size="sm" c="gray">
            Quellen: {textToLinks(item["Quellen"])}
          </Text>
          <div></div>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Text style={{ lineHeight: 1.5, marginBottom: "0.5rem" }}>
            {highlights["Szenarium"]}
          </Text>
          {!hideLink && (
            <div style={{ position: "absolute", bottom: 0, right: 10 }}>
              <Text ta="right" c="dimmed">
                <a
                  href={`/fall/${item["Fall"]}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Detailseite für Fall ${item["Name"]} öffnen`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    role="img"
                  >
                    <title>Link zur Detailseite</title>
                    <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9c-.086 0-.17.01-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z" />
                    <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4.02 4.02 0 0 1-.82 1H12a3 3 0 1 0 0-6H9z" />
                  </svg>
                </a>
              </Text>
            </div>
          )}
        </Grid.Col>
      </Grid>
    </Card>
  );
};

export default Case;
