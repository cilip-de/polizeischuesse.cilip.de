import { Col, Grid, Space, Title } from "@mantine/core";
import _ from "lodash";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import Layout from "../components/Layout";

const Statistiken: NextPage = ({ data }) => {
  return (
    <Layout
      metaImg="statistik_cover.jpg"
      metaPath="statistik"
      title="Offizielle Statistik zu Polizeischüssen"
      description="1974 hat die Ständige Konferenz der Innenminister*innen und -senator*innen der Länder (IMK) die Deutsche Hochschule der Polizei (die damals noch Polizei-Führungsakademie hieß) mit der Erstellung einer jährlichen Schusswaffengebrauchsstatistik beauftragt."
      cover={
        <div>
          <img src="/statistik_cover.jpg" style={{ width: "100%" }} />
        </div>
      }
    >
      <div>
        Sie wird im Frühjahr oder spätestens im Sommer des Folgejahres
        abgeschlossen und enthält Zahlen zu sämtlichen, durch deutsche
        Polizist*innen abgegebenen Schüsse. Neben Warnschüssen unterscheidet die
        Übersicht zwischen dem Schusswaffengebrauch gegen Tiere, Sachen und
        gegen Personen. Eine weitere Kategorie ist der unzulässige
        Schusswaffengebrauch, darunter auch gegen Unbeteiligte. Gezählt werden
        schließlich auch Verletzte und Tote.
        <br />
        <br />
        Erst ab 1984 wird diese jährliche Übersicht auch herausgegeben,
        allerdings nur auf Nachfrage bei der IMK. Nach{" "}
        <a href="https://fragdenstaat.de/anfrage/falle-von-polizeilichem-schusswaffengebrauch-fur-die-jahre-2011-bis-2013/">
          nach mehreren Anfragen nach dem Informationsfreiheitsgesetz
        </a>{" "}
        veröffentlichen wir die Schusswaffengebrauchsstatistik erstmals
        komplett.
      </div>
      <Space h="xl" />
      <Title order={3}>Fälle von polizeilichem Schusswaffengebrauch</Title>
      <Space h="xl" />
      <Grid>
        {_.orderBy(data.documents, "title", "desc").map((x) => (
          <Col span={4} md={2} lg={1} key={x.title}>
            <a target="_blank" href={x.site_url} rel="noreferrer">
              {x.title.replace(/[^0-9]/g, "")}
            </a>
          </Col>
        ))}
      </Grid>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  let data = [];
  const res = await fetch(
    "https://fragdenstaat.de/api/v1/documentcollection/82/"
  );
  if (res.ok) {
    data = await res.json();
  }

  return {
    props: {
      data,
    },
  };
};

export default Statistiken;
