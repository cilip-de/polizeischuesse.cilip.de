import {
  Button,
  Center,
  Container,
  Grid,
  Group,
  Space,
  Text,
  Title,
} from "@mantine/core";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import CaseList from "../components/CaseList";
import { setupData } from "../lib/data";

import cover from "../public/cover_12.jpg";
import cilipLogo from "../public/images/cilip_new.svg";
import goa2025 from "../public/images/grimme-online-2025.jpg";

const Home = ({
  data,
  geoData,
  initialSearchedData,
  selection,
  options,
  maxCases,
  afterReuni,
  beforeReuni,
  averages,
}: any) => {
  console.log("Home component props:", {
    data: data ? `array of ${data.length}` : "undefined",
    geoData: geoData ? `array of ${geoData.length}` : "undefined",
    initialSearchedData: initialSearchedData
      ? `array of ${initialSearchedData.length}`
      : "undefined",
    selection,
    options: options ? Object.keys(options) : "undefined",
    maxCases,
    afterReuni,
    beforeReuni,
  });

  return (
    <div>
      <a href="#main-content" className="skip-link">
        Zum Hauptinhalt springen
      </a>
      <Head>
        <title>Polizeiliche Todesschüsse ab 1976</title>
        <meta
          name="description"
          content={`Seit der Wiedervereinigung wurden mindestens ${afterReuni} Personen durch Kugeln der deutschen Polizei getötet. Wir zählen von 1976 bis 1990 außerdem ${beforeReuni} tödliche Schüsse allein in Westdeutschland.`}
        />
        <meta property="og:title" content="Polizeiliche Todesschüsse ab 1976" />
        <meta property="og:type" content="article" />
        <meta
          property="og:image"
          content="https://polizeischuesse.cilip.de/images/og.jepg"
        />
        <meta property="og:url" content="https://polizeischuesse.cilip.de/" />
        <meta name="twitter:card" content="summary_large_image" />
        <link href="https://@social.tchncs.de/@cilip" rel="me"></link>
      </Head>

      <main id="main-content">
        <Group justify="center" className="only-non-mobile">
          <a href="https://www.grimme-online-award.de/2025/nominierte/nominierte-detail/d/chronik-polizeilicher-todesschuesse-1976-2025">
            <Image
              src={goa2025}
              alt="Nominiert Grimme Online Award 2025"
              style={{
                position: "fixed",
                left: 5,
                top: 5,
                height: "80px",
                width: "auto",
                zIndex: 1000,
                borderRadius: "4px",
              }}
            />
          </a>
        </Group>
        <Group justify="center" className="only-mobile">
          <a href="https://www.grimme-online-award.de/2025/nominierte/nominierte-detail/d/chronik-polizeilicher-todesschuesse-1976-2025">
            <Image
              src={goa2025}
              alt="Nominiert Grimme Online Award 2025"
              style={{
                height: "80px",
                width: "auto",
                zIndex: 1000,
                borderRadius: "4px",
              }}
            />
          </a>
        </Group>
        <Container>
          <Space h="xl" />
          <nav
            aria-label="Hauptnavigation"
            className="only-mobile"
            style={{ marginBottom: "2rem" }}
          >
            <Group justify="center">
              <div style={{ width: "45%" }}>
                <Button
                  component={Link}
                  href="/visualisierungen"
                  c="gray"
                  variant="outline"
                  style={{ width: "100%" }}
                >
                  Visualisierungen
                </Button>
              </div>
              <div style={{ width: "45%" }}>
                <Button
                  component={Link}
                  href="/methodik"
                  c="gray"
                  variant="outline"
                  style={{ width: "100%" }}
                >
                  Methodik
                </Button>
              </div>
              <div style={{ width: "45%" }}>
                <Button
                  component={Link}
                  href="/statistik"
                  c="gray"
                  variant="outline"
                  style={{ width: "100%" }}
                >
                  Offizielle Statistik
                </Button>
              </div>
              <div style={{ width: "45%" }}>
                <Button
                  component={Link}
                  href="/taser"
                  c="gray"
                  variant="outline"
                  style={{ width: "100%" }}
                >
                  Tod mit Taser
                </Button>
              </div>
            </Group>
          </nav>

          <Grid>
            <Grid.Col
              span={{ base: 12, sm: 4 }}
              style={{ padding: "1rem", paddingTop: "0" }}
            >
              <Image
                style={{ width: "100%", height: "auto" }}
                src={cover}
                alt="Cover image"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 8 }}>
              <div>
                <Space h="sm" />
                <Title order={1}>Polizeiliche Todesschüsse</Title>
                {/* <Space h="sm" /> */}
                <Space h="sm" />
                <Title order={2} size="h3">
                  Seit der Wiedervereinigung wurden mindestens {afterReuni}{" "}
                  Personen durch Kugeln der deutschen Polizei getötet.
                </Title>
                <Space h="sm" />
                <Text size="lg">
                  Wir zählen von 1976 bis 1990 außerdem {beforeReuni} tödliche
                  Schüsse allein in Westdeutschland.
                </Text>
              </div>
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }} order={{ base: 2, sm: 2 }} className="only-non-mobile">
              <Space h="xl" />
              <Group justify="flex-end">
                <div>
                  <a href="https://cilip.de">
                    <Image
                      src={cilipLogo}
                      alt="CILIP logo"
                      style={{ height: "80px", width: "auto" }}
                    />
                  </a>
                </div>
              </Group>
              <Space h="xl" />
              <Space h="xl" />
              <nav aria-label="Hauptnavigation">
                <Group justify="flex-end" align="flex-end" style={{ flexDirection: "column" }}>
                  <div>
                    <Button
                      component={Link}
                      href="/visualisierungen"
                      c="dark"
                      variant="outline"
                      style={{ width: "13rem" }}
                    >
                      Visualisierungen
                    </Button>
                  </div>
                  <div>
                    <Button
                      component={Link}
                      href="/methodik"
                      c="dark"
                      variant="outline"
                      style={{ width: "13rem" }}
                    >
                      Methodik
                    </Button>
                  </div>
                  <div>
                    <Button
                      component={Link}
                      href="/statistik"
                      c="dark"
                      variant="outline"
                      style={{ width: "13rem" }}
                    >
                      Offizielle Statistik
                    </Button>
                  </div>
                  <div>
                    <Button
                      component={Link}
                      href="/taser"
                      c="dark"
                      variant="outline"
                      style={{ width: "13rem" }}
                    >
                      Tod mit Taser
                    </Button>
                  </div>
                </Group>
              </nav>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 8 }} order={{ base: 1, sm: 1 }}>
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
                <Group justify="center">
                  <a href="https://cilip.de">
                    <Image
                      src={cilipLogo}
                      alt="CILIP"
                      style={{ maxWidth: "100%" }}
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
              <Space h="sm" />
            </Grid.Col>
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
          <Text style={{ maxWidth: "25rem", padding: "0.5rem" }} ta="center">
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
          <Text
            size="sm"
            c="gray"
            ta="center"
            style={{ maxWidth: "25rem", padding: "0.5rem" }}
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
        <Space h="xl" />
        <Center>
          <Text
            size="sm"
            c="gray"
            ta="center"
            style={{ maxWidth: "25rem", padding: "0.5rem" }}
          >
            Umgesetzt von <a href="//johannesfilter.com">Johannes Filter</a> und{" "}
            <a href="//digit.so36.net/">Matthias Monroy</a>
            <br />
            basierend auf{" "}
            <a href="https://www.cilip.de/category/polizeiliche-todesschuesse/">
              jahrzehntelangen Recherchen
            </a>{" "}
            von
            <br /> Otto Diederichs und der{" "}
            <a href="//cilip.de">Bürgerrechte & Polizei/CILIP-Redaktion</a>.
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
  const { data, geoData, options, fuse, beforeReuni, afterReuni, averages } =
    await setupData();

  console.log("getServerSideProps - setupData returned:", {
    dataLength: data?.length,
    geoDataLength: geoData?.length,
    optionsKeys: options ? Object.keys(options) : undefined,
    fuseExists: !!fuse,
    beforeReuni,
    afterReuni,
  });

  if (selection.p !== null) selection.p = parseInt(selection.p);
  if (selection.tags && selection.tags !== null)
    selection.tags = selection.tags.split(",");
  else selection.tags = [];

  let initialSearchedData = null;
  if (q && q.length > 2) {
    console.log("Searching with fuse for:", q);
    // use only excact matches with Fuse advanced search options
    const searchResults = fuse?.search("'" + q);
    console.log(
      "Fuse search results:",
      searchResults ? `array of ${searchResults.length}` : "undefined",
    );
    initialSearchedData =
      searchResults?.map(({ item, matches }) => ({
        ...item,
        matches: matches,
      })) || null;
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
      averages,
    },
  };
};

export default Home;
