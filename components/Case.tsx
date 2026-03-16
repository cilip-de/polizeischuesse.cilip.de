import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ProcessedDataItem } from "../lib/data";
import { SEARCH_KEYES } from "../lib/data";
import { isNumber } from "../lib/util";

const badgeStyles: Record<string, React.CSSProperties> = {
  pink: { backgroundColor: "#fff0f6", color: "#a61e4d" },
  grape: { backgroundColor: "#f8f0fc", color: "#862e9c" },
  violet: { backgroundColor: "#f3f0ff", color: "#5f3dc4" },
  indigo: { backgroundColor: "#edf2ff", color: "#364fc7" },
  blue: { backgroundColor: "#e7f5ff", color: "#1864ab" },
  cyan: { backgroundColor: "#e3fafc", color: "#0b7285" },
  teal: { backgroundColor: "#e6fcf5", color: "#087f5b" },
  green: { backgroundColor: "#ebfbee", color: "#2b8a3e" },
  lime: { backgroundColor: "#f4fce3", color: "#5c940d" },
};

const badgeStyle = (color: string): React.CSSProperties => ({
  fontSize: "0.65rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  ...badgeStyles[color],
});

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
  const highlights: Record<string, React.ReactNode> = {};
  for (const term of SEARCH_KEYES) {
    highlights[term] = constructHighlights(item, term);
  }

  const scenarioText = (item["Szenarium"] as string) || "";
  const isLong = scenarioText.length > 200;

  const detailLink = !hideLink && (
    <a
      href={`/fall/${item["Fall"]}`}
      target="_blank"
      rel="noreferrer"
      aria-label={`Detailseite für Fall ${item["Name"]} öffnen`}
      style={{ fontSize: "0.8rem", color: "#228be6" }}
    >
      → Detailseite
    </a>
  );

  const cardContent = (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        {item.schusswechsel && (
          <Badge className="border-transparent rounded-full" style={badgeStyle("pink")}>
            Schusswechsel
          </Badge>
        )}
        {item.sek && (
          <Badge className="border-transparent rounded-full" style={badgeStyle("grape")}>
            SEK-Beteiligung
          </Badge>
        )}
        {item.vgbeamte && (
          <Badge className="border-transparent rounded-full" style={badgeStyle("violet")}>
            Verletzte/getötete Beamte
          </Badge>
        )}
        {item.vbaktion && (
          <Badge className="border-transparent rounded-full" style={badgeStyle("indigo")}>
            Vorbereitete Polizeiaktion
          </Badge>
        )}
        {item.psych && (
          <Badge className="border-transparent rounded-full" style={badgeStyle("blue")}>
            Mutm. psych. Ausnahmesituation
          </Badge>
        )}
        {item.alkdrog && (
          <Badge className="border-transparent rounded-full" style={badgeStyle("cyan")}>
            Mutm. Alkohol- o. Drogenkonsum
          </Badge>
        )}
        {item.famgew && (
          <Badge className="border-transparent rounded-full" style={badgeStyle("teal")}>
            Mutm. famil. oder häusl. Gewalt
          </Badge>
        )}
        {item.unschuss && (
          <Badge className="border-transparent rounded-full" style={badgeStyle("green")}>
            Unbeabsichtigte Schussabgabe
          </Badge>
        )}
        {item.indoor && (
          <Badge className="border-transparent rounded-full" style={badgeStyle("lime")}>
            Innenraum
          </Badge>
        )}
      </div>
      <div className="h-3" />
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-4">
          <p className="font-medium">{highlights["Name"]}</p>
          <p className="text-sm leading-normal">
            {isNumber(item.Alter) ? `${item.Alter} Jahre` : `Alter: unbekannt`}
            {item.sex.length > 0 && `, ${item.sex}`}
          </p>
          <div className="h-2.5" />
          <p className="text-sm text-gray-500 leading-normal">
            {isTaser ? "Getasert" : "Erschossen"} am {item.datePrint}
          </p>
          <p className="text-sm text-gray-500 leading-normal">
            In {item.place}
            {item.state !== item.place && `, ${item.state}`}
          </p>
          <p className="hidden text-sm text-gray-500 leading-normal">
            {item.numShots.length > 0 &&
              item.numShots !== "0" &&
              item.numShots !== "1" &&
              `Mit ${item.numShots} Schüssen`}
            {item.numShots.length > 0 &&
              item.numShots === "1" &&
              `Mit einem Schuss`}
          </p>
          <p className="text-sm text-gray-500 leading-normal">
            {item.weapon && `Bewaffnet mit ${item.weapon}`}
          </p>
          <div className="h-2.5" />
          <p className="text-sm text-gray-500">
            Quellen: {textToLinks(item["Quellen"])}
          </p>
          {detailLink && (
            <div className="h-2" />
          )}
          {detailLink}
        </div>
        <div className="col-span-12 md:col-span-8">
          <p className="leading-normal mb-2">
            {highlights["Szenarium"]}
          </p>
        </div>
      </div>
    </>
  );

  if (!isLong) {
    return (
      <Card
        className="shadow-sm border-gray-200 p-4 mb-8 relative"
        data-testid="case-card"
      >

        {cardContent}
      </Card>
    );
  }

  // Long cards: use <details> for native expand/collapse (no JS needed)
  return (
    <Card
      className="shadow-sm border-gray-200 p-4 mb-8 relative"
      data-testid="case-card"
    >
      <details>
        <summary
          style={{
            listStyle: "none",
            cursor: "pointer",
          }}
        >
          <div style={{ maxHeight: 240, overflow: "hidden", position: "relative" }}>
            {cardContent}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "4rem",
                background: "linear-gradient(transparent, white)",
                pointerEvents: "none",
              }}
            />
          </div>
          <p style={{ textAlign: "center", color: "#228be6", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
            ▼ Mehr anzeigen
          </p>
        </summary>
        {cardContent}
        <p style={{ textAlign: "center", color: "#228be6", fontSize: "0.875rem", margin: "0.25rem 0 0", cursor: "pointer" }}
           onClick={(e) => {
             const details = (e.target as HTMLElement).closest("details");
             if (details) details.removeAttribute("open");
           }}
        >
          ▲ Weniger anzeigen
        </p>
      </details>
    </Card>
  );
};

export default Case;
