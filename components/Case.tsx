import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ProcessedDataItem } from "../lib/data";
import { SEARCH_KEYES } from "../lib/data";
import { isNumber } from "../lib/util";

const badgeColors: Record<string, string> = {
  pink: "bg-pink-50 text-pink-700 border-pink-200",
  grape: "bg-purple-50 text-purple-700 border-purple-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
  teal: "bg-teal-50 text-teal-700 border-teal-200",
  green: "bg-green-50 text-green-700 border-green-200",
  lime: "bg-lime-50 text-lime-700 border-lime-200",
};

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
      className="shadow-sm p-3 mb-8 relative"
      data-testid="case-card"
    >
      <div className="flex flex-wrap items-center gap-1" style={{ paddingLeft: "-1rem" }}>
        {item.schusswechsel && (
          <Badge variant="outline" className={`text-xs ${badgeColors.pink}`}>
            Schusswechsel
          </Badge>
        )}
        {item.sek && (
          <Badge variant="outline" className={`text-xs ${badgeColors.grape}`}>
            SEK-Beteiligung
          </Badge>
        )}
        {item.vgbeamte && (
          <Badge variant="outline" className={`text-xs ${badgeColors.violet}`}>
            Verletzte/getötete Beamte
          </Badge>
        )}
        {item.vbaktion && (
          <Badge variant="outline" className={`text-xs ${badgeColors.indigo}`}>
            Vorbereitete Polizeiaktion
          </Badge>
        )}
        {item.psych && (
          <Badge variant="outline" className={`text-xs ${badgeColors.blue}`}>
            Mutm. psych. Ausnahmesituation
          </Badge>
        )}
        {item.alkdrog && (
          <Badge variant="outline" className={`text-xs ${badgeColors.cyan}`}>
            Mutm. Alkohol- o. Drogenkonsum
          </Badge>
        )}
        {item.famgew && (
          <Badge variant="outline" className={`text-xs ${badgeColors.teal}`}>
            Mutm. famil. oder häusl. Gewalt
          </Badge>
        )}
        {item.unschuss && (
          <Badge variant="outline" className={`text-xs ${badgeColors.green}`}>
            Unbeabsichtigte Schussabgabe
          </Badge>
        )}
        {item.indoor && (
          <Badge variant="outline" className={`text-xs ${badgeColors.lime}`}>
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
          <div></div>
        </div>
        <div className="col-span-12 md:col-span-8">
          <p className="leading-normal mb-2">
            {highlights["Szenarium"]}
          </p>
          {!hideLink && (
            <div style={{ position: "absolute", bottom: 0, right: 10 }}>
              <p className="text-right text-gray-400">
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
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Case;
