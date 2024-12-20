import { Col, Grid, Space, Title } from "@mantine/core";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Case from "../components/Case";
import Layout from "../components/Layout";
import { setupTaserData } from "../lib/data";
import taserCover from "../public/taser_cover.jpg";

const Taser: NextPage = ({ data }) => {
  return (
    <Layout
      fullWidth
      metaImg="taser_cover.jpg"
      metaPath="taser"
      title="Tod mit Taser"
      description="Seit 2021 sammeln wir auch Todesfälle nach dem polizeilichen Einsatz von Tasern. Bis vor einigen Jahren waren lediglich Spezialeinheiten damit ausgerüstet. In einigen Bundesländern ist dies bereits auf geschlossene Einheiten der Landespolizei (Bayern) ausgeweitet, in anderen gehören die Geräte zur Grundausstattung mehrerer Polizeipräsidien (Nordrhein-Westfalen, Hessen, Saarland). In Rheinland-Pfalz ist angeblich jeder Streifenwagen mit einem Taser ausgestattet."
      cover={
        <Image
          src={taserCover}
          alt="Taser"
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
      <Grid>
        <Col span={4}></Col>
        <Col span={12} md={8}>
          <div>
            Die Taser-Statistik stellen wir gesondert dar, denn die
            Elektroschocks führen zu deutlich anderen Todesursachen als Munition
            aus Schusswaffen. Die Opfer sterben an Herz- oder
            Kreislaufstillstand, Organversagen oder sie ersticken an
            Erbrochenem. Warum Taser ein riskantes Einsatzmittel sind, zeigt
            Professor Andreas Ruch in{" "}
            <a href="https://verfassungsblog.de/polizei-und-taser/">
              seinem Beitrag im Verfassungsblog
            </a>
            .
            <br />
            <br />
            Unsere Liste zeigt (mit Stand November 2021), dass Menschen
            größtenteils innerhalb von Gebäuden getasert werden. Bei allen
            Getöteten lassen die Presseberichte auf eine psychische
            Ausnahmesituation bzw. Drogenkonsum schließen.
          </div>
        </Col>
      </Grid>
      <Space />
      <Title style={{ marginTop: "1rem" }} order={2} id="chronik">
        Chronik der Tasertoten
      </Title>
      <Space />
      <div>
        {data.map((x) => (
          <Case item={x} key={x.key} isTaser />
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
