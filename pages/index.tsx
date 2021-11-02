import {
  Button,
  Col,
  Container,
  Grid,
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
import VisualizationCard from "../components/VisualizationCard";
import { setupData } from "../lib/data";

const Home: NextPage = ({
  data,
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
                  Wir zählen von 1976 bis zur Wiedervereinigung außerdem{" "}
                  {beforeReuni} tödliche Schüsse allein in Westdeutschland.
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
                erschossen wurden. Unsere Jahresberichte basieren vor allem auf
                Recherchen in der lokalen und überregionalen Presse. 2017 haben
                Erik Peter und Svenja Bednarczyk in der taz eigene Recherchen zu
                unserer Sammlung angestellt und diese{" "}
                <a href="https://web.archive.org/web/20210129215547/https://taz.atavist.com/polizeitote">
                  visualisiert
                </a>
                . Auch{" "}
                <a href="http://schusswaffeneinsatz.de/download/toetung-durch-polizeibeamte%20(1).pdf">
                  Clemens Lorei
                </a>{" "}
                dokumentiert den polizeilichen Schusswaffengebrauch in
                Deutschland auf seiner Webseite und beruft sich dabei oft auf
                die CILIP.
              </Text>
            </Col>
            <Col span={12} sm={4}>
              <VisualizationCard data={options.year} />
              <div style={{ padding: "1rem" }}>
                <Link href="/daten">
                  <Button variant="light" fullWidth>
                    Datenbeschreibung
                  </Button>
                </Link>
                <Space />
                <Link href="/statistiken">
                  <Button variant="light" fullWidth>
                    Offizielle Statistiken
                  </Button>
                </Link>
              </div>
            </Col>
          </Grid>

          <Space h="xl" />

          <Title order={2} id="chronik">
            Chronik
          </Title>

          <CaseList
            initialSearchedData={initialSearchedData}
            data={data}
            selection={selection}
            options={options}
            maxCases={maxCases}
          />
        </Container>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const selection = { q: "", p: "1", ...context.query };

  const { q } = selection;
  const { data, options, fuse, beforeReuni, afterReuni } = await setupData();

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
