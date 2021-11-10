import { Title } from "@mantine/core";
import _ from "lodash";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import React from "react";
import { HorizontalBarChart, VerticalBarChart } from "../components/charts";
import Layout from "../components/Layout";
import { countItems, setupData } from "../lib/data";
import { isNumber } from "../lib/util";

const Auswertung: NextPage = ({ data, options }) => {
  const boolAtr = [
    "Schusswechsel",
    "Sondereinsatzbeamte",
    "Verletzte/getötete Beamte",
    "Vorbereitete Polizeiaktion",
    "Opfer mit Schusswaffe",
    "Schussort Innenraum",
    "Schussort Außen",
    "Unbeabsichtigte Schussabgabe",
    "Hinweise auf familiäre oder häusliche Gewalt",
    "Hinweise auf psychische Ausnahmesituation und/ oder Drogenkonsum",
    "weiblich",
    "männlich",
  ];

  const boolData = boolAtr.map((x) => ({
    count: data.filter((d) => d[x].includes("Ja")).length / data.length,
    value: x,
  }));

  const makeDowData = (data) => {
    const dataDow = countItems(
      _.orderBy(data, "dow", "desc").map(({ dowPrint }) => dowPrint)
    );
    // make Sunday last day of week
    dataDow.unshift(dataDow.pop());
    return dataDow;
  };

  const noWeaponSekYes = data.filter(
    (x) => !x[boolAtr[4]].includes("Ja") && x[boolAtr[1]].includes("Ja")
  );

  const noWeaponSekNo = data.filter(
    (x) => !x[boolAtr[4]].includes("Ja") && !x[boolAtr[1]].includes("Ja")
  );

  const dataDow = makeDowData(data);

  const dataSekYes = makeDowData(noWeaponSekYes);
  const dataSekNo = makeDowData(noWeaponSekNo);

  console.log(dataSekYes);
  console.log(dataSekNo);

  for (const x of dataSekNo) {
    const bla = dataSekYes.filter(({ value }) => value === x.value);
    if (bla.length) x.count2 = bla[0].count;
    x.tooltipLabel = { count: "ohne SEK", count2: "mit SEK" };
  }
  console.log(dataSekNo);

  return (
    <Layout
      title="Visuelle Auswertung der Daten"
      description="Eine statische Auswertung der Daten aus der Chronik. Es fehlt noch mehr
    Text für die Beschreibung."
    >
      <div>
        <Title order={3}>Fälle pro Jahr</Title>
        <VerticalBarChart
          data={_.orderBy(options.year, "value")}
          numTicks={5}
        />
      </div>
      <div>
        <Title order={3}>Fälle pro Bundesland</Title>
        <HorizontalBarChart data={_.orderBy(options.state, "count")} />
      </div>
      <div>
        <Title order={3}>Fälle pro Stadt (nur top20)</Title>
        <HorizontalBarChart
          data={_.orderBy(options.place, "count", "desc")
            .slice(0, 20)
            .reverse()}
        />
      </div>
      <div>
        <Title order={3}>Fälle pro Monat</Title>
        <HorizontalBarChart
          data={countItems(
            _.orderBy(data, "month", "desc").map(({ monthPrint }) => monthPrint)
          )}
        />
      </div>
      <div>
        <Title order={3}>Fälle pro Wochentag</Title>
        <HorizontalBarChart data={dataDow} />
      </div>
      <div>
        <Title order={3}>
          Fälle pro Wochentag, Opfer ohne Schusswaffe, unterteilt nach
          SEK-Beteiligung
        </Title>
        <HorizontalBarChart data={dataSekNo} />
      </div>
      <div>
        <Title order={3}>Tag im Monat</Title>
        <VerticalBarChart data={countItems(data.map(({ dom }) => dom))} />
      </div>
      <div>
        <Title order={3}>Alter</Title>
        <VerticalBarChart
          data={countItems(data.map(({ Alter }) => Alter).filter(isNumber))}
        />
      </div>
      <div>
        <Title order={3}>Klassifikation</Title>
        <HorizontalBarChart data={boolData} formatPerc />
      </div>
    </Layout>
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
