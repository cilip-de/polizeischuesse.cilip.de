import { Space, Text, Title } from "@mantine/core";
import _ from "lodash";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import React from "react";
import { HorizontalBarChart, VerticalBarChart } from "../components/charts";
import Layout from "../components/Layout";
import WeaponChart from "../components/WeaponChart";
import { countItems, setupData } from "../lib/data";
import { addMissingYears, combineArray, isNumber } from "../lib/util";

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

const boolAtr = [
  "Schusswechsel",
  "Sondereinsatzbeamte",
  "Verletzte/getötete Beamte",
  "Vorbereitete Polizeiaktion",
  "Opfer mit Schusswaffe",
  "Unbeabsichtigte Schussabgabe",
  "Hinweise auf familiäre oder häusliche Gewalt",
  "Hinweise auf psychische Ausnahmesituation",
  "Hinweise auf Alkohol- und/ oder Drogenkonsum",
  "Schussort Innenraum",
  "Schussort Außen",
  "weiblich",
  "männlich",
];

const CasesPerYear = ({ data }) => {
  const eastData = countItems(
    data.filter(({ east }) => east).map(({ year }) => year)
  );
  const westData = countItems(
    data.filter(({ east }) => !east).map(({ year }) => year)
  );

  const procData = combineArray(
    westData,
    eastData,
    "Westdeutschland",
    "Ostdeutschland"
  );

  return (
    <div>
      <Title order={3} align="center">
        Polizeiliche Todesschüsse von {data[data.length - 1].year}–
        {data[0].year}
      </Title>
      <VerticalBarChart data={_.orderBy(procData, "value")} numTicks={5} />
      <Text>
        Berlin zählt zu Westdeutschland und wird nicht weiter aufgeschlüsselt.
      </Text>
      <Space h="lg" />
    </div>
  );
};

const CasesPerYearWeapon = ({ data }) => {
  const eastData = countItems(
    data
      .filter(({ weapon }) => weapon.includes("Schusswaffe"))
      .map(({ year }) => year)
  );
  const westData = countItems(
    data
      .filter(({ weapon }) => weapon.includes("Stichwaffe"))
      .map(({ year }) => year)
  );

  const procData = combineArray(
    addMissingYears(data, eastData),
    westData,
    "Schusswaffe",
    "Stichwaffe"
  );

  return (
    <div>
      <Title order={3} align="center">
        Polizeiliche Todesschüsse von {data[data.length - 1].year}–
        {data[0].year}, Opfer mit Schusswaffe vs Stichwaffe
      </Title>
      <VerticalBarChart data={_.orderBy(procData, "value")} numTicks={5} />
      <Text>
        Berlin zählt zu Westdeutschland und wird nicht weiter aufgeschlüsselt.
      </Text>
      <Space h="lg" />
    </div>
  );
};

const makeDowData = (data) => {
  const dataDow = countItems(
    _.orderBy(data, "dow", "desc").map(({ dowPrint }) => dowPrint)
  );
  // make Sunday last day of week
  dataDow.unshift(dataDow.pop());
  return dataDow;
};

export { makeDowData };

const Auswertung: NextPage = ({ data, options }) => {
  const boolData = boolAtr.map((x) => ({
    count: data.filter((d) => d[x].includes("Ja")).length / data.length,
    value: x,
  }));

  const noWeaponSekYes = data.filter((x) => x[boolAtr[1]].includes("Ja"));

  const noWeaponSekNo = data.filter((x) => !x[boolAtr[1]].includes("Ja"));

  const dataSekYes = makeDowData(noWeaponSekYes);
  const dataSekNo = makeDowData(noWeaponSekNo);

  const dataSekNo2 = combineArray(dataSekNo, dataSekYes, "ohne SEK", "mit SEK");

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
      <Text>Hier noch eine kurze Erklärung</Text>
      <Space h="lg" />
      <CasesPerYear data={data} />
      <CasesPerYearWeapon data={data} />
      <WeaponChart data={data} />
      <div>
        <Title order={3} align="center">
          Polizeiliche Todesschüsse pro Bundesland, je 1.000.000 Einwohner
        </Title>
        <HorizontalBarChart data={perInhabSorted} />
      </div>
      <div>
        <Title order={3} align="center">
          Polizeiliche Todesschüsse pro Stadt
        </Title>
        <HorizontalBarChart
          data={_.orderBy(options.place, "count", "desc")
            .slice(0, 20)
            .reverse()}
        />
      </div>
      <div>
        <Title order={3} align="center">
          Polizeiliche Todesschüsse pro Monat
        </Title>
        <HorizontalBarChart
          data={countItems(
            _.orderBy(data, "month", "desc").map(({ monthPrint }) => monthPrint)
          )}
        />
      </div>
      <div>
        <Title order={3} align="center">
          Polizeiliche Todesschüsse pro Wochentag, unterteilt nach
          SEK-Beteiligung
        </Title>
        <HorizontalBarChart data={dataSekNo2} />
      </div>
      <div>
        <Title order={3} align="center">
          Polizeiliche Todesschüsse pro Tag im Monat
        </Title>
        <VerticalBarChart data={countItems(data.map(({ dom }) => dom))} />
      </div>
      <div>
        <Title order={3} align="center">
          Alter der Opfer polizeilicher Todesschüsse
        </Title>
        <VerticalBarChart
          data={countItems(data.map(({ Alter }) => Alter).filter(isNumber))}
        />
      </div>
      <div>
        <Title order={3} align="center">
          Kategorien
        </Title>
        <HorizontalBarChart
          data={boolData}
          formatPerc
          maxValue={1}
          margin={{ top: 10, right: 10, bottom: 30, left: 300 }}
        />
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
