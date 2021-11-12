import { Col, Grid, Space, Title } from "@mantine/core";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import React from "react";
import Layout from "../components/Layout";

const Statistiken: NextPage = ({ data }) => {
  return (
    <Layout
      title="Offizielle Statistiken zu Polizeischüssen"
      description="1974 hat die Ständige Konferenz der Innenminister:innen und -senator:innen der Länder (IMK) die Deutsche Hochschule der Polizei (die damals noch Polizei-Führungsakademie hieß) mit der Erstellung einer jährlichen Schusswaffengebrauchsstatistik beauftragt."
    >
      <div>
        Sie wird im Frühjahr oder spätestens im Sommer des Folgejahres
        abgeschlossen und enthält Zahlen zu sämtlichen, durch deutsche
        Polizist:innen abgegebenen Schüsse. Neben Warnschüssen unterscheidet die
        Übersicht zwischen dem Schusswaffengebrauch gegen Sachen und gegen
        Personen. Im Bereich der Schüsse gegen Sachen werden diese überwiegend
        auf gefährliche, kranke oder verletzte Tiere abgegeben. Eine weitere
        Kategorie ist der unzulässige Schusswaffengebrauch, darunter auch gegen
        Unbeteiligte. Gezählt werden schließlich auch Verletzte und Tote.
        <br />
        <br />
        Erst ab 1984 wird diese jährliche Übersicht auch veröffentlicht,
        allerdings nur auf Nachfrage bei der IMK. Nach{" "}
        <a href="https://fragdenstaat.de/anfrage/falle-von-polizeilichem-schusswaffengebrauch-fur-die-jahre-2011-bis-2013/">
          nach mehreren Anfragen nach dem Informationsfreiheitsgesetz
        </a>{" "}
        veröffentlichen wir die Schusswaffengebrauchsstatistik ab 1994 erstmals
        komplett. Für die Jahre davor liegen die Datenblätter nicht mehr
        durchgängig und auch nicht in digitaler Form vor, schreibt uns das
        Ministerium des Inneren, für Digitalisierung und Kommunen
        Baden-Württemberg.
      </div>
      <Space />
      <Title order={3}>Fälle von polizeilichem Schusswaffengebrauch</Title>
      <Space />
      <Grid>
        {data.documents.map((x) => (
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
