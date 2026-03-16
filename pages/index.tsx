import { Button } from "@/components/ui/button";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import CaseList from "../components/CaseList";
import { parseSelectionFromQuery, selectionToFilters } from "../components/CaseList";
import { setupData } from "../lib/data";
import { getCases } from "../lib/api/cases";
import type { CasesResponse } from "../lib/api/cases";
import { getStats } from "../lib/api/stats";
import type { StatsResponse } from "../lib/api/stats";
import { getGeo } from "../lib/api/geo";
import type { GeoResponse } from "../lib/api/geo";

import cover from "../public/cover_12.jpg";
import cilipLogo from "../public/images/cilip_new.svg";
import goa2025 from "../public/images/grimme-online-2025.jpg";

interface HomeProps {
  maxCases: number;
  afterReuni: number;
  beforeReuni: number;
  initialCases: CasesResponse;
  initialStats: StatsResponse;
  initialGeo: GeoResponse;
}

const Home = ({
  maxCases,
  afterReuni,
  beforeReuni,
  initialCases,
  initialStats,
  initialGeo,
}: HomeProps) => {
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
        <meta
          property="og:description"
          content={`Seit der Wiedervereinigung wurden mindestens ${afterReuni} Personen durch Kugeln der deutschen Polizei getötet. Wir zählen von 1976 bis 1990 außerdem ${beforeReuni} tödliche Schüsse allein in Westdeutschland.`}
        />
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
        <div className="flex items-center justify-center gap-2 hidden md:block">
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
        </div>
        <div className="flex items-center justify-center gap-2 md:hidden">
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
        </div>
        <div className="mx-auto w-full max-w-[1140px] px-4">
          <div className="h-6" />
          <nav
            aria-label="Hauptnavigation"
            className="md:hidden"
            style={{ marginBottom: "2rem" }}
          >
            <div className="flex items-center justify-center gap-2">
              <div style={{ width: "47%" }}>
                <Button variant="outline" className="w-full text-gray-800" asChild>
                  <Link href="/visualisierungen">Visualisierungen</Link>
                </Button>
              </div>
              <div style={{ width: "47%" }}>
                <Button variant="outline" className="w-full text-gray-800" asChild>
                  <Link href="/methodik">Methodik</Link>
                </Button>
              </div>
              <div style={{ width: "47%" }}>
                <Button variant="outline" className="w-full text-gray-800" asChild>
                  <Link href="/statistik">Offizielle Statistik</Link>
                </Button>
              </div>
              <div style={{ width: "47%" }}>
                <Button variant="outline" className="w-full text-gray-800" asChild>
                  <Link href="/taser">Tod mit Taser</Link>
                </Button>
              </div>
            </div>
          </nav>

          <div className="grid grid-cols-12 gap-4">
            <div
              className="col-span-12 md:col-span-4"
              style={{ padding: "1rem", paddingTop: "0" }}
            >
              <Image
                style={{ width: "100%", height: "auto" }}
                src={cover}
                alt="Cover image"
              />
            </div>
            <div className="col-span-12 md:col-span-8">
              <div>
                <div className="h-3" />
                <h1 className="text-3xl font-bold tracking-tight">Polizeiliche Todesschüsse</h1>
                {/* <div className="h-3" /> */}
                <div className="h-3" />
                <h2 className="text-xl font-semibold">
                  Seit der Wiedervereinigung wurden mindestens {afterReuni}{" "}
                  Personen durch Kugeln der deutschen Polizei getötet.
                </h2>
                <div className="h-3" />
                <p className="text-lg">
                  Wir zählen von 1976 bis 1990 außerdem {beforeReuni} tödliche
                  Schüsse allein in Westdeutschland.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4 order-2 hidden md:block">
              <div className="h-6" />
              <div className="flex items-center justify-end gap-2">
                <div>
                  <a href="https://cilip.de">
                    <Image
                      src={cilipLogo}
                      alt="CILIP logo"
                      style={{ height: "80px", width: "auto" }}
                    />
                  </a>
                </div>
              </div>
              <div className="h-6" />
              <div className="h-6" />
              <nav aria-label="Hauptnavigation">
                <div className="flex items-end justify-end gap-2" style={{ flexDirection: "column" }}>
                  <div>
                    <Button variant="outline" className="w-52 text-gray-800" asChild>
                      <Link href="/visualisierungen">Visualisierungen</Link>
                    </Button>
                  </div>
                  <div>
                    <Button variant="outline" className="w-52 text-gray-800" asChild>
                      <Link href="/methodik">Methodik</Link>
                    </Button>
                  </div>
                  <div>
                    <Button variant="outline" className="w-52 text-gray-800" asChild>
                      <Link href="/statistik">Offizielle Statistik</Link>
                    </Button>
                  </div>
                  <div>
                    <Button variant="outline" className="w-52 text-gray-800" asChild>
                      <Link href="/taser">Tod mit Taser</Link>
                    </Button>
                  </div>
                </div>
              </nav>
            </div>
            <div className="col-span-12 md:col-span-8 order-1">
              <div className="h-5" />
              <p>
                Jedes Jahr veröffentlicht die Konferenz der Innenminister*innen
                der Bundesländer eine neue{" "}
                <b>Statistik zum polizeilichen Schusswaffengebrauch</b> des
                Vorjahres. Neben Warnschüssen oder Schüssen auf Tiere und Sachen
                werden auch Polizeikugeln auf Personen und daraus resultierende
                Todesfälle gezählt.
              </p>
              <div className="md:hidden">
                <div className="h-5" />
                <div className="flex items-center justify-center gap-2">
                  <a href="https://cilip.de">
                    <Image
                      src={cilipLogo}
                      alt="CILIP"
                      style={{ maxWidth: "100%" }}
                    />
                  </a>
                </div>
                <div className="h-3" />
              </div>
              <div className="h-3" />
              <p>
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
              </p>
              <div className="h-3" />
              <p>
                So ist etwa von Bedeutung, ob die Getöteten selbst bewaffnet
                waren, sich womöglich in einer psychischen Ausnahmesituation
                befanden oder, wie es häufig geschieht, in ihrer eigenen Wohnung
                erschossen wurden.
              </p>
              <div className="h-3" />
            </div>
          </div>
          <div className="h-6" />
          <div className="h-6" />
          <CaseList
            maxCases={maxCases}
            initialCases={initialCases}
            initialStats={initialStats}
            initialGeo={initialGeo}
          />
        </div>
        <div className="h-6" />
        <div className="flex items-center justify-center">
          <p className="text-lg">
            <Link href="/kontakt">Kontakt, Impressum und Datenschutz</Link>
          </p>
        </div>
        <div className="h-6" />
        <div className="h-6" />
        <div className="flex items-center justify-center">
          <p className="text-center" style={{ maxWidth: "25rem", padding: "0.5rem" }}>
            Die Zeitschrift Bürgerrechte & Polizei/CILIP liefert seit 1978
            kritische Analysen zur Politik und Praxis Innerer Sicherheit in
            Deutschland und Europa.
            <br />
            <a href="https://www.cilip.de/zeitschrift-bestellen/abonnement/">
              Jetzt ein Abo abschließen!
            </a>
          </p>
        </div>
        <div className="h-6" />
        <div className="h-6" />
        <div className="flex items-center justify-center">
          <p
            className="text-sm text-gray-500 text-center"
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
            &quot;Bürgerrechte & Polizei/CILIP&quot; angeben und auf
            polizeischuesse.cilip.de verlinken.
          </p>
        </div>
        <div className="h-6" />
        <div className="flex items-center justify-center">
          <p
            className="text-sm text-gray-500 text-center"
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
          </p>
        </div>
        <div className="h-6" />
        <div style={{ height: "2rem" }}></div>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query, res }) => {
  // Cache for 60s, serve stale for 1h
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=3600');

  const { data, beforeReuni, afterReuni } = await setupData();

  // Parse URL query params into filters
  const selection = parseSelectionFromQuery(query);
  const filters = selectionToFilters(selection, null);

  // Build stats/geo filters (same as cases but without pagination)
  const { page, limit, ...statsGeoFilters } = filters;

  // Fetch all data in parallel
  const [initialCases, initialStats, initialGeo] = await Promise.all([
    getCases(filters),
    getStats(statsGeoFilters),
    getGeo(statsGeoFilters),
  ]);

  return {
    props: {
      maxCases: data.length,
      beforeReuni,
      afterReuni,
      initialCases,
      initialStats,
      initialGeo,
    },
  };
};

export default Home;
