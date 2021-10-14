import { Container, Title } from "@mantine/core";
import _ from "lodash";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";
import TimeChart from "../components/TimeChart";
import { countItems, setupData } from "../lib/data";

const Auswertung: NextPage = ({ data, options }) => {
  const boolAtr = [
    "Schusswechsel",
    "Sondereinsatzbeamte",
    "Verletzte/getötete Beamte",
    "Vorbereitete Polizeiaktion",
    "Opfer mit Schusswaffe",
  ];

  const boolData = boolAtr.map((x) => ({
    count: data.filter((d) => d[x].includes("Ja")).length / data.length,
    value: x,
  }));

  const noWeapon = countItems(
    data.filter((x) => !x[boolAtr[4]].includes("Ja")).map(({ dow }) => dow)
  );
  const noWeapon2 = countItems(
    data
      .filter(
        (x) => !x[boolAtr[4]].includes("Ja") && !x[boolAtr[1]].includes("Ja")
      )
      .map(({ dow }) => dow)
  );
  const noWeapon3 = countItems(
    data
      .filter(
        (x) =>
          !x[boolAtr[4]].includes("Ja") &&
          !x[boolAtr[1]].includes("Ja") &&
          !x[boolAtr[3]].includes("Ja")
      )
      .map(({ dow }) => dow)
  );

  return (
    <div>
      <Head>
        <title>Polizeiliche Todesschüsse</title>
        <meta name="description" content="Polizeiliche Todesschüsse" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Container>
          <Title order={1}>Auswertung der Daten</Title>

          <div>
            <TimeChart data={_.orderBy(options.years, "value")} />
          </div>
          <div>
            <TimeChart data={_.orderBy(options.states, "count", "desc")} />
          </div>
          <div>
            <TimeChart
              data={_.orderBy(options.places, "count", "desc").slice(0, 20)}
            />
          </div>
          <div>
            <TimeChart data={countItems(data.map(({ month }) => month))} />
          </div>
          <div>
            <TimeChart data={countItems(data.map(({ dow }) => dow))} />
          </div>
          <div>
            <TimeChart data={countItems(data.map(({ dom }) => dom))} />
          </div>
          <div>
            <TimeChart data={countItems(data.map(({ Alter }) => Alter))} />
          </div>
          <div>
            <TimeChart data={boolData} />
          </div>
          <div>
            <TimeChart data={noWeapon} />
          </div>
          <div>
            <TimeChart data={noWeapon2} />
          </div>
          <div>
            <TimeChart data={noWeapon3} />
          </div>
        </Container>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const { data, options } = await setupData();

  return {
    props: {
      data,
      options,
    },
  };
};

export default Auswertung;
