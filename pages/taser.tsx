import { Center, Col, Grid, Space, Text, Title } from "@mantine/core";
import { ResponsiveLine } from "@nivo/line";
import { csv } from "d3-fetch";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Case from "../components/Case";
import Layout from "../components/Layout";
import { setupTaserData } from "../lib/data";
import taserCover from "../public/taser_cover.jpg";

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
const MyResponsiveLine = ({ data }) => (
  <ResponsiveLine
    data={data}
    lineWidth={3}
    colors={{ scheme: "set1" }}
    margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
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
    legends={[
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
);

const Taser: NextPage = ({ data, stats }) => {
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
        <Col span={4}></Col>
        <Col span={12} md={8}>
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
        </Col>
      </Grid>
      <Space />
      <Title style={{ marginTop: "1rem" }} order={2} id="statistik">
        Taser-Statistik
      </Title>
      <div style={{ height: "40vh", width: "90%", margin: "0 auto" }}>
        <MyResponsiveLine data={stats} />
      </div>
      <div>
        <Text size="sm" color="gray" align="left">
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
      </div>
      <Space />
      <Title style={{ marginTop: "2rem" }} order={2} id="chronik">
        Chronik der Tasertoten
      </Title>
      <Space />
      <div>
        {data.map((x) => (
          <Case item={x} key={x.key} isTaser />
        ))}
      </div>
      <Title style={{ marginTop: "2rem" }} order={2} id="dokumente">
        Dokumente zur Taser-Statistik
      </Title>
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <Grid>
          {links.map((x) => (
            <Col span={4} key={x[1]}>
              <a
                target="_blank"
                href={x[0]}
                rel="noreferrer"
                style={{ fontFamily: "monospace" }}
              >
                {x[1]}
              </a>
            </Col>
          ))}
        </Grid>
      </div>
      <Space h="xl" />
      <Space h="xl" />

      <Center>
        <Text
          size="sm"
          color="gray"
          align="center"
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
          "Bürgerrechte & Polizei/CILIP" angeben und auf
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
