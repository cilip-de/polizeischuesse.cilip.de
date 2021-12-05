import { Center, Col, Grid, Space, Text, Title } from "@mantine/core";
import _ from "lodash";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import Link from "next/link";
import React from "react";
import { HorizontalBarChart, VerticalBarChart } from "../components/charts";
import HeatMapChart from "../components/HeatMapChart";
import Layout from "../components/Layout";
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
    "Alte Bundesländer u. Berlin",
    "Neue Bundesländer ohne Berlin"
  );

  return (
    <div>
      <Title order={3} align="center">
        Todesschüsse {data[data.length - 1].year}–{data[0].year}
      </Title>
      <VerticalBarChart data={_.orderBy(procData, "value")} numTicks={5} />
      <VerticalBarChart
        data={_.orderBy(procData, "value")}
        numTicks={5}
        mobile
      />
      <Space h="lg" />
    </div>
  );
};

const CasesPerYearWeapon = ({ data }) => {
  const schussData = countItems(
    data
      .filter(({ weapon }) => weapon.includes("Schusswaffe"))
      .map(({ year }) => year)
  );
  const stichData = countItems(
    data
      .filter(({ weapon }) => weapon.includes("Stichwaffe"))
      .map(({ year }) => year)
  );

  const procData = combineArray(
    addMissingYears(data, stichData),
    schussData,
    "Stichwaffe",
    "Schusswaffe"
  );

  return (
    <div>
      <Title order={3} align="center">
        Todesschüsse {data[data.length - 1].year}–{data[0].year}, Opfer mit
        Schusswaffe vs Stichwaffe
      </Title>
      <VerticalBarChart data={_.orderBy(procData, "value")} numTicks={5} />
      <VerticalBarChart
        data={_.orderBy(procData, "value")}
        numTicks={5}
        mobile
      />
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

const MiddleContent = ({ children }) => (
  <Grid>
    <Col span={2}></Col>
    <Col span={12} sm={8}>
      {children}
    </Col>
  </Grid>
);

const Auswertung: NextPage = ({ data, options }) => {
  const boolData = boolAtr.map((x) => ({
    count: data.filter((d) => d[x].includes("Ja")).length / data.length,
    value: x
      .replace(
        "Hinweise auf familiäre oder häusliche Gewalt",
        "Mutm. famil. oder häusl. Gewalt"
      )
      .replace(
        "Hinweise auf Alkohol- und/ oder Drogenkonsum",
        "Mutm. Alkohol- o. Drogenkonsum"
      )
      .replace(
        "Hinweise auf psychische Ausnahmesituation",
        "Mutm. phsych. Ausnahmesituation"
      ),
  }));

  const noWeaponSekYes = data.filter((x) => x[boolAtr[1]].includes("Ja"));

  const noWeaponSekNo = data.filter((x) => !x[boolAtr[1]].includes("Ja"));

  const dataSekYes = makeDowData(noWeaponSekYes);
  const dataSekNo = makeDowData(noWeaponSekNo);

  const dataSekNo2 = combineArray(
    dataSekNo,
    dataSekYes,
    "ohne SEK-Beteiligung",
    "mit SEK-Beteiligung"
  );

  const perInhab = _.cloneDeep(options.state);
  perInhab.forEach((x) => {
    x.count = _.round(x.count / landInhab[x.value], 2);
  });

  const perInhabSorted = _.orderBy(perInhab, "count");

  return (
    <Layout
      fullWidth
      cover={
        <div>
          <Center>
            <img
              src="/vis_cover.png"
              style={{
                width: "90%",
                marginTop: "0.5rem",
                marginLeft: "5%",
                marginRight: "5%",
              }}
            />
          </Center>
        </div>
      }
      otherContent={
        <>
          <Space h="xl" />
          <Text>
            Alle Daten stammen aus unserer <Link href="/">Chronik</Link>. In dem{" "}
            <Link href="/">Abschnitt zu Methodik</Link> beschreiben wir die
            Datenerhebung. Wir bieten die{" "}
            <a href="/data.csv" download>
              Rohdaten zum Download
            </a>{" "}
            an für eigene Auswertungen.
          </Text>
        </>
      }
      metaImg="vis_sm_preview.png"
      metaPath="visualisierungen"
      title="Visualisierungen der Todesschüsse"
      description="Wir haben unsere gesammelten Fälle umfangreich analysiert und zeigen u. a. wie sich Todesschüsse auf Wochtentage verteilen und das Opfer häufiger Stichwaffen, früher hingegen Schusswaffen besaßen."
    >
      <Space h="xl" />
      <CasesPerYear data={data} />
      <Space h="xl" />
      <Space h="xl" />
      <CasesPerYearWeapon data={data} />
      <MiddleContent>
        <Text>
          Die Angabe zu der Bewaffnung der Täter:innen beruht oft nur auf den
          Angaben der beteiligten Polizist:innen. Die Aussagen sind manchmal
          umstritten, wie beim Tod von{" "}
          <a href="https://polizeischuesse.cilip.de/fall/cilip-2016-10">
            Hussam Fadl
          </a>{" "}
          in einer Berliner Flüchtlingsunterkuft.
        </Text>
      </MiddleContent>
      {/* <WeaponChart data={data} /> */}
      <Space h="xl" />
      <Space h="xl" />
      <Space h="xl" />
      <div>
        <Title order={3} align="center">
          Todesschüsse {data[data.length - 1].year}–{data[0].year} pro
          Bundesland, je 1.000.000 Einwohner
        </Title>
        <HorizontalBarChart data={perInhabSorted} />
        <HorizontalBarChart data={perInhabSorted} mobile />
        <MiddleContent>
          Es gilt zu beachten, dass in den Stadtstaaten weniger Leute leben als
          sich in ihr Aufhalten. Durch ihre Funktion als Ballungsraum zieht die
          Städte Menschen an, die in der Einwohnerzahl nicht berücksichtigt
          werden. Dadurch ist der relative Anteil in Berlin, Hamburg und Bremen
          erhöht.
        </MiddleContent>
      </div>
      <Space h="xl" />
      <Space h="xl" />
      <Space h="xl" />
      <div>
        <Title order={3} align="center">
          Todesschüsse {data[data.length - 1].year}–{data[0].year} pro Stadt
        </Title>
        <HorizontalBarChart
          data={_.orderBy(options.place, "count", "desc")
            .slice(0, 20)
            .reverse()}
        />
        <HorizontalBarChart
          mobile
          data={_.orderBy(options.place, "count", "desc")
            .slice(0, 20)
            .reverse()}
        />
      </div>
      <Space h="xl" />
      <Space h="xl" />
      <div>
        <Title order={3} align="center">
          Todesschüsse {data[data.length - 1].year}–{data[0].year} pro Monat
        </Title>
        <HorizontalBarChart
          data={countItems(
            _.orderBy(data, "month", "desc").map(({ monthPrint }) => monthPrint)
          )}
        />
        <HorizontalBarChart
          mobile
          data={countItems(
            _.orderBy(data, "month", "desc").map(({ monthPrint }) => monthPrint)
          )}
        />
      </div>
      <Space h="xl" />
      <Space h="xl" />
      <div>
        <MiddleContent>
          <Title order={3} align="center">
            Todesschüsse {data[data.length - 1].year}–{data[0].year} pro
            Wochentag, unterteilt nach SEK-Beteiligung
          </Title>
        </MiddleContent>
        <HorizontalBarChart data={dataSekNo2} />
        <HorizontalBarChart data={dataSekNo2} mobile />
      </div>
      <Space h="xl" />
      <Space h="xl" />
      <div>
        <Title order={3} align="center">
          Todesschüsse {data[data.length - 1].year}–{data[0].year} pro Tag im
          Monat
        </Title>
        <VerticalBarChart data={countItems(data.map(({ dom }) => dom))} />
        <VerticalBarChart
          data={countItems(data.map(({ dom }) => dom))}
          mobile
        />
      </div>
      <Space h="xl" />
      <Space h="xl" />
      <div>
        <Title order={3} align="center">
          Alter der Opfer von Todesschüssen {data[data.length - 1].year}–
          {data[0].year}
        </Title>
        <VerticalBarChart
          data={countItems(data.map(({ Alter }) => Alter).filter(isNumber))}
        />
        <VerticalBarChart
          data={countItems(data.map(({ Alter }) => Alter).filter(isNumber))}
          mobile
        />
      </div>
      <Space h="xl" />
      <Space h="xl" />
      <div>
        <MiddleContent>
          <Title order={3} align="center">
            Weitere Umstände zu Todesschüssen {data[data.length - 1].year}–
            {data[0].year} (sofern bekannt)
          </Title>
        </MiddleContent>
        <HorizontalBarChart
          data={boolData}
          formatPerc
          maxValue={1}
          margin={{ top: 10, right: 10, bottom: 30, left: 300 }}
        />
        <HorizontalBarChart
          mobile
          data={boolData}
          formatPerc
          maxValue={1}
          margin={{ top: 10, right: 0, bottom: 30, left: 200 }}
        />
      </div>
      <Space h="xl" />
      <Space h="xl" />
      <MiddleContent>
        <Title order={3} align="center">
          Verteilung der Umstände von Todesschüssen {data[data.length - 1].year}
          –{data[0].year} auf Bundesländer (Angaben in Prozent)
        </Title>
        <HeatMapChart data={data} />
        <HeatMapChart data={data} mobile />
      </MiddleContent>
      <Space h="xl" />
      <Space h="xl" />
      <Space h="xl" />
      <Space h="xl" />
      <Space h="xl" />
      <Space h="xl" />
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
