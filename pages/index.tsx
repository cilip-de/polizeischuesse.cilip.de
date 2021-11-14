import {
  Button,
  Center,
  Col,
  Container,
  Grid,
  Group,
  Space,
  Text,
  Title,
} from "@mantine/core";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import CaseList from "../components/CaseList";
import { DowChart } from "../components/charts";
import { setupData } from "../lib/data";

const Home: NextPage = ({
  data,
  geoData,
  initialSearchedData,
  selection,
  options,
  maxCases,
  afterReuni,
  beforeReuni,
}) => {
  return (
    <div>
      <Head>
        <title>Polizeiliche Todesschüsse</title>
        <meta name="description" content="Polizeiliche Todesschüsse" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Container>
          <Space h="xl" />
          <div>
            <Group position="right">
              <Button compact color="gray" variant="outline">
                <Link href="/visualisierungen" passHref>
                  Visualisierungen
                </Link>
              </Button>
              <Button compact color="gray" variant="outline">
                <Link href="/methodik" passHref>
                  Methodik
                </Link>
              </Button>

              <Button compact color="gray" variant="outline">
                <Link href="/statistiken" passHref>
                  Offizielle Statistiken
                </Link>
              </Button>

              <Button compact color="gray" variant="outline">
                <Link href="/taser" passHref>
                  Tod durch Taser
                </Link>
              </Button>
            </Group>
          </div>
          <Grid>
            <Col span={12} sm={4} style={{ padding: "3rem" }}>
              <img style={{ width: "100%" }} src="/cover_7.jpg" />{" "}
            </Col>
            <Col span={12} sm={8}>
              <div>
                <Space h="xl" />
                <Title order={1}>Polizeiliche Todesschüsse</Title>
                {/* <Space h="sm" /> */}
                <Title order={2}>In Deutschland</Title>
                <Space h="xl" />
                <Title order={3}>
                  Seit der Wiedervereinigung wurden {afterReuni} Personen durch
                  Kugeln der deutschen Polizei getötet.
                </Title>
                <Space h="xl" />
                <Title order={4}>
                  Wir zählen von 1976 bis 1990 außerdem {beforeReuni} tödliche
                  Schüsse allein in Westdeutschland.
                </Title>
              </div>
            </Col>
          </Grid>

          <Space h="xl" />
          <Grid>
            <Col span={12} sm={8}>
              <Text>
                Jedes Jahr veröffentlicht die Konferenz der Innenminister*innen
                der Bundesländer eine neue{" "}
                <b>Statistik zum polizeilichen Schusswaffengebrauch</b> des
                Vorjahres. Neben Warnschüssen oder Schüssen auf Tiere und Sachen
                werden auch Polizeikugeln auf Personen und daraus resultierende
                Todesfälle gezählt.
              </Text>
              <Space h="xl" />
              <Text>
                Die ab 1984 von den <b>Behörden geführte Aufstellung</b> ist
                jedoch <b>anonym</b>, es wird nicht auf die einzelnen Taten
                eingegangen. Die Statistik gibt auch keine Auskunft über die
                Opfer.{" "}
                <b>
                  Seit 1976 dokumentiert die Zeitschrift Bürgerrechte &
                  Polizei/CILIP
                </b>
                . deshalb die Hintergründe zu den durch die Polizei verursachten
                Todesfällen. Dabei sammeln wir Informationen zur Beteiligung von
                Sondereinheiten, der Zahl jeweils abgegebener Schüsse und der
                Situation in der sich die Schussabgabe zutrug.
              </Text>
              <Space h="xl" />
              <Text>
                So ist etwa von Bedeutung, ob die Getöteten selbst bewaffnet
                waren, sich womöglich in einer psychischen Ausnahmesituation
                befanden oder, wie es häufig geschieht, in ihrer eigenen Wohnung
                erschossen wurden.
              </Text>
            </Col>
            <Col span={12} sm={4}>
              <Space h="xl" />
              <Title order={5} align="right">
                Todesschüsse pro Wochentag
              </Title>
              <DowChart data={data} />
              <Group position="right">
                <div>
                  <Button variant="outline" color="gray" compact>
                    <Link href="/visualisierungen" passHref>
                      Mehr Visualisierungen
                    </Link>
                  </Button>
                </div>
                <div>
                  <Space h="xl" />
                  <img src="/cilip-logo-outline.svg" height="50" />
                </div>
                {/* <Space h="lg" />
                <img src="/cilip_heft.png" />
                <Text>
                  <a href="https://www.cilip.de/zeitschrift-bestellen/">
                    Heft bestellen
                  </a>
                </Text> */}
              </Group>
              {/* <VisualizationCard data={options.year} />
               */}
              {/* <div style={{ padding: "1rem" }}></div> */}
            </Col>
          </Grid>
          <Space />
          <CaseList
            initialSearchedData={initialSearchedData}
            data={data}
            geoData={geoData}
            selection={selection}
            options={options}
            maxCases={maxCases}
          />
        </Container>
        <Center>
          <Text size="sm">
            <Link href="/kontakt" passHref>
              Kontakt, Impressum, Datenschutz
            </Link>
          </Text>
        </Center>
        <div style={{ height: "2rem" }}></div>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const selection = { q: "", p: "1", ...context.query };

  const { q } = selection;
  const { data, geoData, options, fuse, beforeReuni, afterReuni } =
    await setupData();

  if (selection.p !== null) selection.p = parseInt(selection.p);
  if (selection.tags && selection.tags !== null)
    selection.tags = selection.tags.split(",");
  else selection.tags = [];

  let initialSearchedData = null;
  if (q && q.length > 2) {
    // use only excact matches with Fuse advanced search options
    initialSearchedData = fuse
      .search("'" + q)
      .map(({ item, matches }) => ({ ...item, matches: matches }));
  }

  return {
    props: {
      data,
      geoData,
      initialSearchedData,
      options,
      selection,
      maxCases: data.length,
      beforeReuni,
      afterReuni,
    },
  };
};

export default Home;
