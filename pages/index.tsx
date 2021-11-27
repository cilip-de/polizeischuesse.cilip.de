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
          <div className="only-mobile">
            <Group position="center">
              <Button
                uppercase
                style={{ width: "45%" }}
                color="gray"
                variant="outline"
              >
                <Link href="/visualisierungen" passHref>
                  Visualisierungen
                </Link>
              </Button>
              <Button
                uppercase
                style={{ width: "45%" }}
                color="gray"
                variant="outline"
              >
                <Link href="/methodik" passHref>
                  Methodik
                </Link>
              </Button>

              <Button
                uppercase
                style={{ width: "45%" }}
                color="gray"
                variant="outline"
              >
                <Link href="/statistik" passHref>
                  Offizielle Statistik
                </Link>
              </Button>

              <Button
                uppercase
                style={{ width: "45%" }}
                color="gray"
                variant="outline"
              >
                <Link href="/taser" passHref>
                  Tod durch Taser
                </Link>
              </Button>
            </Group>
          </div>
          <Grid>
            <Col span={12} sm={4} style={{ padding: "1rem", paddingTop: "0" }}>
              <img style={{ width: "100%" }} src="/cover_12.jpg" />{" "}
            </Col>
            <Col span={12} sm={8}>
              <div>
                <Space h="sm" />
                <Title order={1}>Polizeiliche Todesschüsse</Title>
                {/* <Space h="sm" /> */}
                <Space h="sm" />
                <Title order={3}>
                  Seit der Wiedervereinigung wurden {afterReuni} Personen durch
                  Kugeln der deutschen Polizei getötet.
                </Title>
                <Space h="sm" />
                <Text size="lg">
                  Wir zählen von 1976 bis 1990 außerdem {beforeReuni} tödliche
                  Schüsse allein in Westdeutschland.
                </Text>
              </div>
            </Col>
          </Grid>

          <Grid>
            <Col span={12} sm={8}>
              <Space h="lg" />
              <Text>
                Jedes Jahr veröffentlicht die Konferenz der Innenminister*innen
                der Bundesländer eine neue{" "}
                <b>Statistik zum polizeilichen Schusswaffengebrauch</b> des
                Vorjahres. Neben Warnschüssen oder Schüssen auf Tiere und Sachen
                werden auch Polizeikugeln auf Personen und daraus resultierende
                Todesfälle gezählt.
              </Text>
              <div className="only-mobile">
                <Space h="lg" />
                <Group position="center">
                  <a href="https://cilip.de">
                    <img src="/cilip-logo-outline.svg" height="50" />
                  </a>
                </Group>
                <Space h="sm" />
              </div>
              <Space h="sm" />
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
              <Space h="sm" />
              <Text>
                So ist etwa von Bedeutung, ob die Getöteten selbst bewaffnet
                waren, sich womöglich in einer psychischen Ausnahmesituation
                befanden oder, wie es häufig geschieht, in ihrer eigenen Wohnung
                erschossen wurden.
              </Text>
            </Col>
            <Col span={12} sm={4} className="only-non-mobile">
              <Space h="xl" />
              <Group position="right">
                <div>
                  <a href="https://cilip.de">
                    <img
                      src="/cilip-logo-outline.svg"
                      height="50"
                      alt="Bürgerrechte & Polizei"
                    />
                  </a>
                </div>
              </Group>
              <Space h="xl" />
              <Space h="xl" />
              <Group position="right" direction="column">
                <Button
                  uppercase
                  color="gray"
                  variant="outline"
                  style={{ width: "13rem" }}
                >
                  <Link href="/visualisierungen" passHref>
                    Visualisierungen
                  </Link>
                </Button>
                <Button
                  uppercase
                  color="gray"
                  variant="outline"
                  style={{ width: "13rem" }}
                >
                  <Link href="/methodik" passHref>
                    Methodik
                  </Link>
                </Button>

                <Button
                  uppercase
                  color="gray"
                  variant="outline"
                  style={{ width: "13rem", textDecoration: "none" }}
                >
                  <Link href="/statistik" style={{ textDecoration: "none" }}>
                    Offizielle Statistik
                  </Link>
                </Button>

                <Button
                  uppercase
                  color="gray"
                  variant="outline"
                  style={{ width: "13rem" }}
                >
                  <Link href="/taser" passHref>
                    Tod durch Taser
                  </Link>
                </Button>
              </Group>
            </Col>
          </Grid>
          <Space h="xl" />
          <Space h="xl" />
          <CaseList
            initialSearchedData={initialSearchedData}
            data={data}
            geoData={geoData}
            selection={selection}
            options={options}
            maxCases={maxCases}
          />
        </Container>
        <Space h="xl" />
        <Center>
          <Text size="lg">
            <Link href="/kontakt" passHref>
              Kontakt, Impressum und Datenschutz
            </Link>
          </Text>
        </Center>
        <Space h="xl" />
        <Space h="xl" />
        <Center>
          <Text size="sm" color="gray" align="center">
            Umgesetzt von{" "}
            <a
              style={{ textDecoration: "inherit" }}
              href="//johannesfilter.com"
            >
              Johannes Filter
            </a>{" "}
            und{" "}
            <a style={{ textDecoration: "inherit" }} href="//digit.so36.net/">
              Matthias Monroy
            </a>
            <br />
            basierend auf{" "}
            <a
              style={{ textDecoration: "inherit" }}
              href="https://www.cilip.de/category/polizeiliche-todesschuesse/"
            >
              jahrzehntelanger Recherchen
            </a>{" "}
            von Otto Diederichs,
            <br />
            Falco Werkenthin und der{" "}
            <a style={{ textDecoration: "inherit" }} href="//cilip.de">
              Bürgerrechte & Polizei/CILIP-Redaktion
            </a>
            .
          </Text>
        </Center>
        <Space h="xl" />
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
