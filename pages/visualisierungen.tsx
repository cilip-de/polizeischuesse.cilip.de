import { Center, Col, Grid, Space, Text, Title } from "@mantine/core";
import _ from "lodash";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import Link from "next/link";
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
Mecklenburg-Vorp. 1610774
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

// 1990: https://en.wikipedia.org/wiki/Demographics_of_Hamburg
// 1989: https://de.wikipedia.org/wiki/West-Berlin
// 1990: https://de.wikipedia.org/wiki/Baden-W%C3%BCrttemberg
// 1987: https://de.wikipedia.org/wiki/Bayern
// 1990: https://de.wikipedia.org/wiki/Einwohnerentwicklung_von_Bremen
// 1990: https://de.wikipedia.org/wiki/Hessen#Einwohnerentwicklung
// 1987: https://de.wikipedia.org/wiki/Niedersachsen#Bev%C3%B6lkerungsentwicklung
// 1990: https://de.wikipedia.org/wiki/Nordrhein-Westfalen#Bev%C3%B6lkerung
// 1990: https://de.wikipedia.org/wiki/Rheinland-Pfalz#Bev%C3%B6lkerung
// 1990: https://de.wikipedia.org/wiki/Saarland#Bev%C3%B6lkerung
// 1990: https://en.wikipedia.org/wiki/Schleswig-Holstein#Demographics
const inhabWest1990 = `
Baden-Württemberg 9822027
Bayern 10902643
Berlin 2130525
Bremen 551219
Hamburg 1652363
Hessen 5763310
Niedersachsen 7163602
Nordrhein-Westfalen 17349651
Rheinland-Pfalz 3763510
Saarland 1072963
Schleswig-Holstein 2626127
`
  .trim()
  .split("\n");

const landInhab = {};
for (const x of inhab) {
  landInhab[x.split(" ")[0]] = parseInt(x.split(" ")[1]) / 1000000;
}

const landInhabWest = {};
for (const x of inhabWest1990) {
  landInhabWest[x.split(" ")[0]] = parseInt(x.split(" ")[1]) / 1000000;
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
        "Mutm. psych. Ausnahmesituation"
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

  const inhabDataWest = countItems(
    data
      .filter((x) => x.beforeReunification && !x.east)
      .map((x) => x.Bundesland),
    true
  );

  inhabDataWest.forEach((x) => {
    x.count = _.round(x.count / landInhabWest[x.value], 2);
  });

  const perInhabWestSorted = _.orderBy(inhabDataWest, "count");

  const inhabDataAfter = countItems(
    data
      .filter((x) => !x.beforeReunification)
      .map((x) =>
        x.Bundesland.replace("Mecklenburg-Vorpommern", "Mecklenburg-Vorp.")
      ),
    true
  );

  inhabDataAfter.forEach((x) => {
    x.count = _.round(x.count / landInhab[x.value], 2);
  });

  const inhabDataAfterSorted = _.orderBy(inhabDataAfter, "count");

  const cityWest = countItems(
    data.filter((x) => x.beforeReunification && !x.east).map((x) => x.place),
    true
  );

  const cityDataWest = _.orderBy(cityWest, "count", "desc")
    .slice(0, 20)
    .reverse();

  const cityAfter = countItems(
    data.filter((x) => !x.beforeReunification).map((x) => x.place),
    true
  );

  const cityDataAfter = _.orderBy(cityAfter, "count", "desc")
    .slice(0, 20)
    .reverse();

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
            <Link href="/methodik">Abschnitt zu Methodik</Link> beschreiben wir
            die Datenerhebung. Wir bieten die{" "}
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
      description="Wir haben unsere gesammelten Polizeischüsse umfangreich analysiert und zeigen u. a. wie sich polizeiliche Todesschüsse auf Wochtentage verteilen und das Opfer häufiger Stichwaffen, früher hingegen Schusswaffen besaßen."
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
          <a
            href="https://polizeischuesse.cilip.de/fall/cilip-2016-10"
            target="_blank"
            rel="nofollow noreferrer"
          >
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
          Todesschüsse pro Bundesland, je eine Mio. Einwohner
        </Title>
        <Space h="xl" />
        <Grid>
          <Col span={12} md={6}>
            <Title order={4} align="center">
              Westdeutschland 1976–1990
            </Title>
            <HorizontalBarChart data={perInhabWestSorted} />
            <HorizontalBarChart data={perInhabWestSorted} mobile />
          </Col>
          <Col span={12} md={6}>
            <Title order={4} align="center">
              Bundesrepublik 1990–2021
            </Title>
            <HorizontalBarChart data={inhabDataAfterSorted} />
            <HorizontalBarChart data={inhabDataAfterSorted} mobile />
          </Col>
        </Grid>
      </div>
      <Space h="xl" />
      <Space h="xl" />
      <Space h="xl" />
      <div>
        <Title order={3} align="center">
          Todesschüsse pro Stadt
        </Title>
        <Space h="xl" />
        <Grid>
          <Col span={12} md={6}>
            <Title order={4} align="center">
              Westdeutschland 1976–1990
            </Title>
            <HorizontalBarChart data={cityDataWest} />
            <HorizontalBarChart mobile data={cityDataWest} />
          </Col>
          <Col span={12} md={6}>
            <Title order={4} align="center">
              Bundesrepublik 1990–2021
            </Title>
            <HorizontalBarChart data={cityDataAfter} />
            <HorizontalBarChart mobile data={cityDataAfter} />
          </Col>
        </Grid>
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
          data={countItems(data.map(({ age }) => age).filter(isNumber))}
          mobile
          tooltip={({ value, data, id }) => (
            <div>
              <Text
                size="sm"
                style={{
                  background: "white",
                  padding: "0 0.1rem",
                  opacity: 0.8,
                }}
              >
                {data.value}-{parseInt(data.value) + 4} Jahre: {value}
                {data.tooltipLabel != null && `, ${data.tooltipLabel[id]}`}
              </Text>
            </div>
          )}
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
