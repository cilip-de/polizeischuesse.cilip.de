import { Space, Title } from "@mantine/core";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import React from "react";
import Case from "../components/Case";
import Layout from "../components/Layout";
import { setupTaserData } from "../lib/data";

const Taser: NextPage = ({ data }) => {
  return (
    <Layout
      title="Tod durch Taser"
      description="Seit 2021 sammeln wir auch Todesfälle durch den polizeilichen Einsatz
    von Tasern."
    >
      <div>
        Hintergrund ist die zunehmende Einführung dieser „Elektroimpulswaffen“
        auch für den gewöhnlichen Streifendienst in einzelnen Bundesländern. Bis
        vor einigen Jahren waren lediglich Spezialeinheiten damit ausgerüstet.
        {/* <br /> */}
        {/* <br /> */}
        Die Taser-Statistik stellen wir gesondert dar, denn die Elektroschocks
        führen zu deutlich anderen Todesursachen als Munition aus Schusswaffen.
        Die Opfer sterben an Herz- oder Kreislaufstillstand Organversagen oder
        Ersticken an Erbrochenem.
        <br />
        <br />
        Unsere bislang kurze Liste zeigt (mit Stand November 2021), dass
        Menschen größtenteils innerhalb von Gebäuden getasert wurden. Bei allen
        Betroffenen lassen die Presseberichte auf eine psychische
        Ausnahmesituation bzw. Drogenkonsum schließen.
      </div>
      <Space />
      <Title order={2} id="chronik">
        Chronik
      </Title>
      <Space />
      <div>
        {data.map((x) => (
          <Case item={x} key={x.key} />
        ))}
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const data = await setupTaserData();

  return {
    props: {
      data,
    },
  };
};

export default Taser;
