import { Title } from "@mantine/core";
import _ from "lodash";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import React from "react";
import { HorizontalBarChart, VerticalBarChart } from "../components/charts";
import Layout from "../components/Layout";
import { countItems, setupData } from "../lib/data";
import { isNumber } from "../lib/util";

// https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Bevoelkerungsstand/Tabellen/bevoelkerung-nichtdeutsch-laender.html
// Stand 21. Juni 2021
const inhab = `
Baden-Württemberg 11103043
Bayern 13140183
Berlin 3664088
Brandenburg 2531071
Bremen 680130
Hamburg 1852478
Hessen 6293154
Mecklenburg-Vorpommern 1610774
Niedersachsen 8003421
Nordrhein-Westfalen 17925570
Rheinland-Pfalz 4098391
Saarland 983991
Sachsen 4056941
Sachsen-Anhalt 2180684
Schleswig-Holstein 2910875
Thüringen 2120237
`
  .trim()
  .split("\n");

const landInhab = {};
for (const x of inhab) {
  landInhab[x.split(" ")[0]] = parseInt(x.split(" ")[1]) / 1000000;
}
console.log(landInhab);

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

  // const stateDate = _.orderBy(options.state, "count");
  const perInhab = _.cloneDeep(options.state);
  perInhab.forEach((x) => {
    x.count = _.round(x.count / landInhab[x.value], 2);
  });

  const perInhabSorted = _.orderBy(perInhab, "count");

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
        <Title order={3}>Fälle pro Bundesland, je 1.000.000 Einwohner</Title>
        <HorizontalBarChart data={perInhabSorted} />
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
