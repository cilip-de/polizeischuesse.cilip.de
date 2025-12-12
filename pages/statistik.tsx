import { Grid, Space } from "@mantine/core";
import { csv } from "d3-fetch";
import _ from "lodash";
import type { NextPage } from "next";
import { GetStaticProps } from "next";
import Image from "next/image";
import AnchorHeading from "../components/AnchorHeading";
import { ShortsPerYear, SimpleChart } from "../components/charts/official";
import Layout from "../components/Layout";
import { combineThree } from "../lib/util";
import staCov from "../public/statistik_cover.jpg";

interface StatistikenProps {
  pdfs: {
    documents: { title: string; site_url: string }[];
  };
  wData: any[];
  s1: any[];
  s2: any[];
  s3: any[];
  s4: any[];
}

const Statistiken: NextPage<StatistikenProps> = ({
  pdfs,
  wData,
  s1,
  s2,
  s3,
  s4,
}) => {
  return (
    <Layout
      metaImg="statistik_cover.jpg"
      metaPath="statistik"
      title="Offizielle Statistik zu Polizeischüssen"
      description="1974 hat die Ständige Konferenz der Innenminister*innen und -senator*innen der Länder (IMK) die Deutsche Hochschule der Polizei (die damals noch Polizei-Führungsakademie hieß) mit der Erstellung einer jährlichen Schusswaffengebrauchsstatistik beauftragt."
      cover={
        <Image
          src={staCov}
          alt="Statistik Cover"
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
      <div>
        Sie wird im Frühjahr oder spätestens im Sommer des Folgejahres
        abgeschlossen und enthält Zahlen zu sämtlichen, durch Polizist*innen der
        Länder und des Bundes abgegebenen Schüssen. Dieser Schusswaffengebrauch
        gegen Personen und ihnen zugeordnete Sachen wird in sechs Kategorien
        dargestellt. Gezählt werden davon Verletzte und Tote sowie Suizide von
        Polizist*innen. Dokumentiert ist außerdem das Töten von Tieren. Eine
        weitere Kategorie ist der unzulässige Schusswaffengebrauch.
        <br />
        <br />
        Erst ab 1984 wird diese jährliche Übersicht auch herausgegeben,
        allerdings nur auf Nachfrage bei der IMK. Nach{" "}
        <a href="https://fragdenstaat.de/anfrage/falle-von-polizeilichem-schusswaffengebrauch-fur-die-jahre-2011-bis-2013/">
          mehreren Anfragen nach dem Informationsfreiheitsgesetz
        </a>{" "}
        veröffentlichen wir die Schusswaffengebrauchsstatistik erstmals
        komplett. Die aus den PDFs extrahierten Daten stehen auch als{" "}
        <a href="/official_statistics.csv" download>
          CSV-Datei zum Download
        </a>{" "}
        zur Verfügung.
      </div>
      <Space h="xl" />
      <AnchorHeading order={3} id="offizielle-statistiken">
        Offizielle Statistiken (PDF-Dokumente)
      </AnchorHeading>
      <Space h="xl" />
      <Grid>
        {_.orderBy(pdfs.documents, "title", "desc").map((x) => (
          <Grid.Col span={{ base: 4, md: 2, lg: 1 }} key={x.title}>
            <a
              target="_blank"
              href={x.site_url}
              rel="noreferrer"
              style={{ fontFamily: "monospace" }}
            >
              {x.title.replace(/[^0-9]/g, "")}
            </a>
          </Grid.Col>
        ))}
      </Grid>
      <Space h="xl" />
      <Space h="xl" />
      <AnchorHeading order={3} id="visualisierungen">
        Visualisierungen der offiziellen Statistiken
      </AnchorHeading>
      <Space h="xl" />
      <div>
        Um die Daten aus den oben verlinkten PDF-Dokumenten zugänglicher und
        verständlicher zu machen, haben wir die statistischen Angaben extrahiert
        und in den folgenden Visualisierungen aufbereitet. Die Diagramme zeigen
        die zeitliche Entwicklung verschiedener Kategorien des polizeilichen
        Schusswaffengebrauchs: Warnschüsse, Schüsse gegen Personen und Sachen,
        Verletzte, Schusswaffengebrauch gegen Tiere sowie Selbsttötungen durch
        Schusswaffengebrauch und unbeabsichtigte Schussauslösungen von
        Polizistinnen und Polizisten.
      </div>
      <Space h="xl" />
      <Space h="xl" />
      <ShortsPerYear wData={wData} />
      <SimpleChart data={s1} title={"Verletzte durch Polizeischüsse"} />
      <SimpleChart data={s2} title={"Schüsse gegen Tiere"} />
      <SimpleChart
        data={s3}
        title={
          "Selbsttötungen und Selbsttötungsversuche durch Schusswaffengebrauch von Polizistinnen und Polizisten"
        }
        style={{ maxWidth: "30rem", margin: "0 auto" }}
      />
      <SimpleChart
        data={s4}
        title={"Unbeabsichtigte Schussauslösung"}
        style={{ maxWidth: "30rem", margin: "0 auto" }}
      />
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  let pdfs = [];
  const res = await fetch(
    "https://fragdenstaat.de/api/v1/documentcollection/82/",
  );
  if (res.ok) {
    pdfs = await res.json();
  }

  const stats = (
    await csv(`${process.env.NEXT_PUBLIC_BASE_URL}/official_statistics.csv`)
  ).filter((x) => x["Jurisdiktion"] === "Bund");

  const wData1 = stats.map((x) => ({
    count: Number(x["Warnschüsse"]),
    value: x["Jahr"],
    label: `${x["Warnschüsse"]}, ${x["Jahr"]}}`,
  }));

  const wData2 = stats.map((x) => ({
    count: Number(x["Schusswaffengebrauch gegen Sachen"]),
    value: x["Jahr"],
    label: `${x["Schusswaffengebrauch gegen Sachen"]}, ${x["Jahr"]}}`,
  }));
  const wData3 = stats.map((x) => ({
    count: Number(x["Schusswaffengebrauch gegen Personen"]),
    value: x["Jahr"],
    label: `${x["Schusswaffengebrauch gegen Personen"]}, ${x["Jahr"]}}`,
  }));

  const s1 = stats.map((x) => ({
    count: Number(x["Verletzte"]),
    value: x["Jahr"],
    label: `${x["Verletzte"]}, ${x["Jahr"]}}`,
  }));

  const s2 = stats.map((x) => ({
    count: Number(x["Schusswaffengebrauch gegen Tiere"]),
    value: x["Jahr"],
    label: `${x["Schusswaffengebrauch gegen Tiere"]}, ${x["Jahr"]}}`,
  }));

  const s3 = stats
    .filter((x) => x["Selbsttötung"] !== "")
    .map((x) => ({
      count: Number(x["Selbsttötung"]),
      value: x["Jahr"],
      label: `${x["Selbsttötung"]}, ${x["Jahr"]}}`,
    }));

  const s4 = stats
    .filter((x) => x["unbeabsichtigte Schussauslösung"] !== "")
    .map((x) => ({
      count: Number(x["unbeabsichtigte Schussauslösung"]),
      value: x["Jahr"],
      label: `${x["unbeabsichtigte Schussauslösung"]}, ${x["Jahr"]}}`,
    }));

  const procData = combineThree(
    wData2,
    wData3,
    wData1,
    "Gegen Sachen",
    "Gegen Personen",
    "Warnschüsse",
  );

  return {
    props: {
      pdfs,
      stats,
      wData: procData,
      s1,
      s2,
      s3,
      s4,
    },
    revalidate: 3600, // Revalidate every hour
  };
};

export default Statistiken;
