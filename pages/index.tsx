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
        <title>Polizeiliche Todesschüsse ab 1976</title>
        <meta
          name="description"
          content="Seit der Wiedervereinigung wurden mindestens 307 Personen durch Kugeln der deutschen Polizei getötet. Wir zählen von 1976 bis 1990 außerdem 146 tödliche Schüsse allein in Westdeutschland."
        />
        <meta property="og:title" content="Polizeiliche Todesschüsse ab 1976" />
        <meta property="og:type" content="article" />
        <meta
          property="og:image"
          content="https://polizeischuesse.cilip.de/preview.jpg"
        />
        <meta property="og:url" content="https://polizeischuesse.cilip.de/" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main>
        <a
          style={{ display: "none" }}
          rel="me"
          href="https://@social.tchncs.de/@cilip"
        >
          Mastodon
        </a>
        <Container>
          <Space h="xl" />
          <div className="only-mobile">
            <Group position="center">
              <div style={{ width: "45%" }}>
                <Link href="/visualisierungen" passHref>
                  <Button
                    color="gray"
                    variant="outline"
                    style={{ width: "100%" }}
                  >
                    Visualisierungen
                  </Button>
                </Link>
              </div>
              <div style={{ width: "45%" }}>
                <Link href="/methodik" passHref>
                  <Button
                    color="gray"
                    variant="outline"
                    style={{ width: "100%" }}
                  >
                    Methodik
                  </Button>
                </Link>
              </div>
              <div style={{ width: "45%" }}>
                <Link href="/statistik" passHref>
                  <Button
                    color="gray"
                    variant="outline"
                    style={{ width: "100%" }}
                  >
                    Offizielle Statistik
                  </Button>
                </Link>
              </div>
              <div style={{ width: "45%" }}>
                <Link href="/taser" passHref>
                  <Button
                    color="gray"
                    variant="outline"
                    style={{ width: "100%" }}
                  >
                    Tod mit Taser
                  </Button>
                </Link>
              </div>
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
                  Seit der Wiedervereinigung wurden mindestens {afterReuni}{" "}
                  Personen durch Kugeln der deutschen Polizei getötet.
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
                    <img
                      src="/cilip-logo-outline.svg"
                      height="80"
                      alt="CILIP logo"
                    />
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
                </b>{" "}
                deshalb die Hintergründe zu den durch die Polizei verursachten
                Todesfällen. Dabei sammeln wir Informationen zur Beteiligung von
                Sondereinheiten, der Zahl jeweils abgegebener Schüsse und der
                Situation, in der sich die Schussabgabe zutrug.
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
                      height="80"
                      alt="CILIP logo"
                    />
                  </a>
                </div>
              </Group>
              <Space h="xl" />
              <Space h="xl" />
              <Group position="right" direction="column">
                <div>
                  <Link href="/visualisierungen" passHref>
                    <Button
                      uppercase
                      color="gray"
                      variant="outline"
                      style={{ width: "13rem" }}
                    >
                      Visualisierungen
                    </Button>
                  </Link>
                </div>
                <div>
                  <Link href="/methodik" passHref>
                    <Button
                      uppercase
                      color="gray"
                      variant="outline"
                      style={{ width: "13rem" }}
                    >
                      Methodik
                    </Button>
                  </Link>
                </div>
                <div>
                  <Link href="/statistik" passHref>
                    <Button
                      uppercase
                      color="gray"
                      variant="outline"
                      style={{ width: "13rem" }}
                    >
                      Offizielle Statistik
                    </Button>
                  </Link>
                </div>
                <div>
                  <Link href="/taser" passHref>
                    <Button
                      uppercase
                      color="gray"
                      variant="outline"
                      style={{ width: "13rem" }}
                    >
                      Tod mit Taser
                    </Button>
                  </Link>
                </div>
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
            <Link href="/kontakt">Kontakt, Impressum und Datenschutz</Link>
          </Text>
        </Center>
        <Space h="xl" />
        <Space h="xl" />
        <Center>
          <Text style={{ maxWidth: "25rem" }} align="center">
            Die Zeitschrift Bürgerrechte & Polizei/CILIP liefert seit 1978
            kritische Analysen zur Politik und Praxis Innerer Sicherheit in
            Deutschland und Europa.
            <br />
            <a href="https://www.cilip.de/zeitschrift-bestellen/abonnement/">
              Jetzt ein Abo abschließen!
            </a>
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
              jahrzehntelangen Recherchen
            </a>{" "}
            von
            <br /> Otto Diederichs und der{" "}
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
