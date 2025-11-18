import { Center, Grid, Space, Text, Collapse, Anchor } from "@mantine/core";
import { ResponsiveLine, LineSeries, Point } from "@nivo/line";
import { csv } from "d3-fetch";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import AnchorHeading from "../components/AnchorHeading";
import Case from "../components/Case";
import Layout from "../components/Layout";
import { setupTaserData } from "../lib/data";
import type { ProcessedDataItem } from "../lib/data";
import taserCover from "../public/taser_cover.jpg";
import { lineChartTooltip } from "../components/charts/ChartTooltip";

const links = [
  [
    "https://archiv.cilip.de/Dokumente/2020_Taser_Wirkbetrieb.pdf",
    "2020 Taser Wirkbetrieb",
  ],
  [
    "https://archiv.cilip.de/Dokumente/2020_Taser-Pilotprojekte.pdf",
    "2020 Taser Pilotprojekte",
  ],
  ["https://archiv.cilip.de/Dokumente/2020_Taser_SEK.pdf", "2020 Taser SEK"],
  [
    "https://archiv.cilip.de/Dokumente/2021_Taser_Wirkbetrieb.pdf",
    "2021 Taser Wirkbetrieb",
  ],
  [
    "https://archiv.cilip.de/Dokumente/2021_Taser-Pilotprojekte.pdf",
    "2021 Taser Pilotprojekte",
  ],
  ["https://archiv.cilip.de/Dokumente/2021_Taser_SEK.pdf", "2021 Taser SEK"],
  [
    "https://archiv.cilip.de/Dokumente/2022_Taser_Wirkbetrieb.pdf",
    "2022 Taser Wirkbetrieb",
  ],
  [
    "https://archiv.cilip.de/Dokumente/2022_Taser-Pilotprojekte.pdf",
    "2022 Taser Pilotprojekte",
  ],
  ["https://archiv.cilip.de/Dokumente/2022_Taser_SEK.pdf", "2022 Taser SEK"],
  [
    "https://archiv.cilip.de/Dokumente/2023_Taser_Wirkbetrieb.pdf",
    "2023 Taser Wirkbetrieb",
  ],
  [
    "https://archiv.cilip.de/Dokumente/2023_Taser-Pilotprojekte.pdf",
    "2023 Taser Pilotprojekte",
  ],
  ["https://archiv.cilip.de/Dokumente/2023_Taser_SEK.pdf", "2023 Taser SEK"],
];

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const MyResponsiveLine = ({ data, mobile = false }: { data: LineSeries[]; mobile?: boolean }) => {
  const [activePoint, setActivePoint] = useState<{ seriesId: string | number; x: string | number | Date | null; y: string | number | Date | null } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActivePoint(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobile]);

  return (
    <div
      ref={containerRef}
      style={{ height: "100%", width: "100%", position: "relative" }}
      onClick={mobile ? () => setActivePoint(null) : undefined}
    >
      {mobile && activePoint && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            padding: "0.5rem 0.75rem",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            zIndex: 1000,
            fontSize: "0.85rem",
            maxWidth: "90%",
            textAlign: "center",
          }}
        >
          <div><strong>{String(activePoint.x)}</strong></div>
          <div>
            {activePoint.seriesId}: {String(activePoint.y)} {activePoint.y === 1 ? "Fall" : "Fälle"}
          </div>
        </div>
      )}
      <ResponsiveLine
        data={data}
        lineWidth={3}
        colors={{ scheme: "set1" }}
        margin={mobile ? { top: 20, right: 15, bottom: 50, left: 50 } : { top: 20, right: 20, bottom: 50, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
        }}
        // yFormat=" >-.2f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Jahr",
          legendOffset: 36,
          legendPosition: "middle",
          // truncateTickAt: 0,
        }}
        axisLeft={{
          tickValues: 5,
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Anzahl",
          legendOffset: -40,
          legendPosition: "middle",
          // truncateTickAt: 0,
        }}
        gridXValues={5}
        gridYValues={5}
        pointSize={10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "seriesColor" }}
        pointLabelYOffset={-12}
        useMesh={true}
        onClick={mobile ? (datum, event) => {
          event.stopPropagation();
          // Type guard to check if datum is a Point
          if ('seriesId' in datum && 'data' in datum) {
            const point = datum as Point<LineSeries>;
            if (activePoint?.seriesId === point.seriesId && activePoint?.x === point.data.x) {
              setActivePoint(null);
            } else {
              setActivePoint({ seriesId: point.seriesId, x: point.data.x, y: point.data.y });
            }
          }
        } : undefined}
        tooltip={mobile ? () => null : ({ point }) => lineChartTooltip({ point: { serieId: String(point.seriesId), data: { x: point.data.x as string | number, y: Number(point.data.y) } } })}
        legends={mobile ? [] : [
          {
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            itemBackground: "white",
            // translateX: 100,
            // translateY: 0,
            itemsSpacing: 0,
            itemDirection: "left-to-right",
            itemWidth: 150,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: "rgba(0, 0, 0, .5)",
            effects: [
              {
                on: "hover",
                style: {
                  itemBackground: "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
        role="application"
      />
    </div>
  );
};

interface TaserProps {
  data: ProcessedDataItem[];
  stats: LineSeries[];
}

const Taser: NextPage<TaserProps> = ({ data, stats }) => {
  const [opened, setOpened] = useState(false);

  return (
    <Layout
      fullWidth
      metaImg="taser_cover.jpg"
      metaPath="taser"
      title="Tod mit Taser"
      description='Wir sammeln auch Todesfälle nach dem polizeilichen Einsatz von Tasern (die es nach offizieller Darstellung nicht gibt). Bis vor einigen Jahren waren lediglich Spezialeinheiten mit diesen "Distanz-Elektroimpulsgeräten" ausgerüstet, nach und nach weiten Bundesländer dies auf den Streifendienst aus. Andere erproben den Einsatz an ausgewählten Direktionen in Pilotprojekten.'
      cover={
        <Image
          src={taserCover}
          alt="Taser"
          style={{
            width: "90%",
            height: "auto",
            marginTop: "0.5rem",
            marginLeft: "5%",
            marginRight: "5%",
          }}
        />
      }
    >
      <Grid>
        <Grid.Col span={4}></Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <div>
            Die Taser-Statistik stellen wir gesondert dar, denn die
            Elektroschocks führen zu deutlich anderen Todesursachen als Munition
            aus Schusswaffen. Die Opfer sterben an Herz- oder
            Kreislaufstillstand, Organversagen oder sie ersticken an
            Erbrochenem. Warum Taser ein riskantes Einsatzmittel sind, zeigt
            Professor Andreas Ruch in{" "}
            <a href="https://verfassungsblog.de/polizei-und-taser/">
              seinem Beitrag im Verfassungsblog
            </a>
            . Unsere Liste zeigt, dass viele Getötete innerhalb von Gebäuden
            getasert wurden; die Bericht dazu lassen auch oft auf eine
            psychische Ausnahmesituation bzw. Drogenkonsum schließen.
          </div>
        </Grid.Col>
      </Grid>
      <Space />
      <AnchorHeading style={{ marginTop: "1rem" }} order={2} id="statistik">
        Taser-Statistik
      </AnchorHeading>
      <div className="only-non-mobile" style={{ height: "40vh", width: "90%", margin: "0 auto" }}>
        <MyResponsiveLine data={stats} />
      </div>
      <div className="only-mobile" style={{ width: "100%" }}>
        <div style={{ height: "40vh", width: "100%", margin: "0 auto" }}>
          <MyResponsiveLine data={stats} mobile />
        </div>
        <div style={{ marginTop: "1rem", padding: "0 1rem" }}>
          {stats.map((serie: LineSeries, index: number) => (
            <div key={serie.id} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf", "#999999"][index % 9],
                  marginRight: "0.5rem",
                  flexShrink: 0,
                }}
              />
              <Text size="sm">{serie.id}</Text>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: "1rem", textAlign: "right" }}>
        <Anchor
          component="button"
          type="button"
          onClick={() => setOpened((o) => !o)}
          size="sm"
        >
          {opened ? "▼" : "▶"} Informationen zur Datenquelle
        </Anchor>
        <Collapse in={opened}>
          <Text size="sm" c="gray" ta="left" style={{ marginTop: "0.5rem" }}>
            Seit 2020 führt das Polizeitechnische Institut der Deutschen
            Hochschule der Polizei nach einem Beschluss der IMK Informationen zu
            Taser-Einsätzen aus Ländern und Bund zusammen. Diese konnten wir durch
            eine IFG-Anfrage befreien. Unsere Gesamtzahlen stammen aus
            Einzelangaben zu: <b>Spezialeinheiten</b> (alle Bundesländer,
            Bundespolizei und Zoll), <b>Streifendienst</b> (Stand Mai 2025:
            Bayern, Brandenburg, Bremen, Nordrhein-Westfalen, Rheinland-Pfalz,
            Saarland, Schleswig-Holstein), <b>Pilotprojekte</b> (Stand Mai 2025:
            Berlin, Hamburg, Hessen, Schleswig-Holstein, Bundespolizei).
            Dokumentiert wird darin aber <b>nur das Ziehen der Waffe</b> - die
            Zahl von Androhungen des Tasereinsatzes ohne anschließendes Auslösen
            lag etwa in NRW im Jahr 2023 um den Faktor 3 höher. In den Statistiken
            werden (anders als zum Schusswaffengebrauch) auch Alter, Geschlecht
            und Alkohol- oder Drogenkonsum der betroffenen Person genannt,
            außerdem Verletzungen und eine anschließend notwendige medizinische
            Versorgung. Dass Menschen auch nach PsychKG eingewiesen werden,
            verweist darauf, dass sie nicht zwingend wegen des Taser-Einsatzes
            behandelt werden mussten. Siehe auch die{" "}
            <a href="#dokumente">Dokumente weiter unten</a>.
          </Text>
        </Collapse>
      </div>
      <Space />
      <AnchorHeading style={{ marginTop: "2rem" }} order={2} id="chronik">
        Chronik der Tasertoten
      </AnchorHeading>
      <Space />
      <div>
        {data.map((x: ProcessedDataItem) => (
          <Case item={x} key={x.key} isTaser />
        ))}
      </div>
      <AnchorHeading style={{ marginTop: "2rem" }} order={2} id="dokumente">
        Dokumente zur Taser-Statistik
      </AnchorHeading>
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <Grid>
          {links.map((x) => (
            <Grid.Col span={4} key={x[1]}>
              <a
                target="_blank"
                href={x[0]}
                rel="noreferrer"
                style={{ fontFamily: "monospace" }}
              >
                {x[1]}
              </a>
            </Grid.Col>
          ))}
        </Grid>
      </div>
      <Space h="xl" />
      <Space h="xl" />

      <Center>
        <Text
          size="sm"
          c="gray"
          ta="center"
          style={{ maxWidth: "25rem" }}
        >
          Alle Daten auf dieser Webseite sind unter der{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/deed.de"
            target="_blank"
            rel="nofollow noreferrer"
          >
            CC BY 4.0
          </a>{" "}
          Lizenz veröffentlicht. Veröffentlichungen müssen als Quelle
          &quot;Bürgerrechte & Polizei/CILIP&quot; angeben und auf
          polizeischuesse.cilip.de verlinken.
        </Text>
      </Center>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const data = await setupTaserData();

  const rawStats = await csv(
    `${process.env.NEXT_PUBLIC_BASE_URL}/official_taser_statistics.csv`
  );

  const keys = Object.keys(rawStats[0]);
  // console.log("keys", keys);

  const stats = keys
    .slice(1)
    .reverse()
    .map((key) => {
      const data = rawStats.map((x) => ({
        x: x[keys[0]],
        y: +x[key],
      }));

      return {
        id: key
          .replaceAll("erfolgreich", '"erfolgreich"')
          .replaceAll("ohne Verletzung", '"ohne Verletzung"')
          .replaceAll("unbewaffnet", '"unbewaffnet"'),
        data,
      };
    });

  // console.log("rawStats", rawStats);

  // console.log("stats", JSON.stringify(stats));

  return {
    props: {
      data,
      stats,
    },
  };
};

export default Taser;
