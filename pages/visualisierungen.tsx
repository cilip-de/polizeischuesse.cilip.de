import { Grid, Space, Text, Title } from "@mantine/core";
import _ from "lodash";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import AnchorHeading from "../components/AnchorHeading";
import {
  HorizontalBarChart,
  VerticalBarChart,
} from "../components/charts/charts";
import HeatMapChart from "../components/charts/HeatMapChart";
import Layout from "../components/Layout";
import { countItems, setupData } from "../lib/data";
import { addMissingYears, combineArray, isNumber } from "../lib/util";
import { barChartTooltip, simpleBarChartTooltip, percentageTooltip, ChartTooltip } from "../components/charts/ChartTooltip";

import dayjs from "dayjs";
import visCover from "../public/vis_cover.png";

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

const landInhab: { [key: string]: number } = {};
for (const x of inhab) {
  landInhab[x.split(" ")[0]] = parseInt(x.split(" ")[1]) / 1000000;
}

const landInhabWest: { [key: string]: number } = {};
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

const CasesPerYear = ({ data }: { data: any }) => {
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
      <AnchorHeading order={3} ta="center" id="todesschuesse-pro-jahr">
        Polizeiliche Todesschüsse {data[data.length - 1].year}–{data[0].year}
      </AnchorHeading>
      <VerticalBarChart
        data={_.orderBy(procData, "value")}
        numTicks={5}
        tooltip={({ value, data, id }: { value: number; data: any; id: string }) =>
          barChartTooltip({ value, data, id })
        }
      />
      <VerticalBarChart
        data={_.orderBy(procData, "value")}
        numTicks={5}
        mobile
        tooltip={({ value, data, id }: { value: number; data: any; id: string }) =>
          barChartTooltip({ value, data, id })
        }
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
      <AnchorHeading order={3} ta="center" id="bewaffnung">
        Todesschüsse {data[data.length - 1].year}–{data[0].year}, Opfer mit
        Schusswaffe vs Stichwaffe
      </AnchorHeading>
      <VerticalBarChart
        data={_.orderBy(procData, "value")}
        numTicks={5}
        tooltip={({ value, data, id }: { value: number; data: any; id: string }) =>
          barChartTooltip({ value, data, id })
        }
      />
      <VerticalBarChart
        data={_.orderBy(procData, "value")}
        numTicks={5}
        mobile
        tooltip={({ value, data, id }: { value: number; data: any; id: string }) =>
          barChartTooltip({ value, data, id })
        }
      />
      <Space h="lg" />
    </div>
  );
};

const CasesPerYearPsych = ({ data }) => {
  const noPsychData = countItems(
    data.filter(({ psych }) => !psych).map(({ year }) => year)
  );
  const psychData = countItems(
    data.filter(({ psych }) => psych).map(({ year }) => year)
  );

  const procData = combineArray(
    addMissingYears(data, noPsychData),
    psychData,
    "Keine psych. Ausnahmesituation",
    "Psych. Ausnahmesituation"
  );

  return (
    <div>
      <AnchorHeading order={3} ta="center" id="psychische-ausnahmesituation">
        Todesschüsse {data[data.length - 1].year}–{data[0].year}, Hinweise auf
        psychische Ausnahmesituation
      </AnchorHeading>
      <VerticalBarChart
        data={_.orderBy(procData, "value")}
        numTicks={5}
        tooltip={({ value, data, id }: { value: number; data: any; id: string }) =>
          barChartTooltip({ value, data, id })
        }
      />
      <VerticalBarChart
        data={_.orderBy(procData, "value")}
        numTicks={5}
        mobile
        tooltip={({ value, data, id }: { value: number; data: any; id: string }) =>
          barChartTooltip({ value, data, id })
        }
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
    <Grid.Col span={2}></Grid.Col>
    <Grid.Col span={{ base: 12, sm: 8 }}>
      {children}
    </Grid.Col>
  </Grid>
);

const Visualisierungen: NextPage = ({ data, options, averages }) => {
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
    data.filter((x) => x.beforeReunification && !x.east).map((x) => x.state),
    true
  );

  inhabDataWest.forEach((x) => {
    x.count = _.round(x.count / landInhabWest[x.value], 1);
  });

  const perInhabWestSorted = _.orderBy(inhabDataWest, "count");

  const inhabDataAfter = countItems(
    data
      .filter((x) => !x.beforeReunification)
      .map((x) =>
        x.state.replace("Mecklenburg-Vorpommern", "Mecklenburg-Vorp.")
      ),
    true
  );

  inhabDataAfter.forEach((x) => {
    x.count = _.round(x.count / landInhab[x.value], 1);
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
        <Image
          src={visCover}
          alt="Visualisierungen Cover"
          style={{
            width: "90%",
            height: "auto",
            marginTop: "0.5rem",
            marginLeft: "5%",
            marginRight: "5%",
          }}
        />
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
            an für eigene Auswertungen. Die Daten sind unter der{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/deed.de"
              target="_blank"
              rel="nofollow noreferrer"
            >
              CC BY 4.0
            </a>{" "}
            Lizenz veröffentlicht. Veröffentlichungen müssen als Quelle
            &quot;Bürgerrechte &amp; Polizei/CILIP&quot; angeben und auf
            polizeischuesse.cilip.de verlinken.
          </Text>
        </>
      }
      metaImg="api/og-viz"
      metaPath="visualisierungen"
      title="Visualisierungen der Todesschüsse"
      description="Wir haben unsere gesammelten Polizeischüsse umfangreich analysiert und zeigen u. a. wie sich polizeiliche Todesschüsse auf Wochtentage verteilen und das Opfer häufiger Stichwaffen, früher hingegen Schusswaffen besaßen."
    >
      <Space h="xl" />
      <CasesPerYear data={data} />

      <MiddleContent>
        <Text>
          Seit 1990 erschoss die Polizei im Durchschnitt{" "}
          {_.round(averages[0], 1)} Personen pro Monat. Im Jahr {dayjs().year()}{" "}
          sind es bis jetzt {_.round(averages[2], 1)} Personen, im Jahr zuvor
          waren es {_.round(averages[1], 1)}.
        </Text>
      </MiddleContent>

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
      <CasesPerYearPsych data={data} />
      <MiddleContent>
        <Text>
          In vielen Fällen befanden sich die Getöteten in einer psychischen
          Ausnahmesituation. Die Polizei wird häufig gerufen, wenn Menschen in
          einer Krise sind und professionelle Hilfe benötigen würden. Oft
          eskaliert die Situation tödlich.
        </Text>
      </MiddleContent>
      <Space h="xl" />
      <Space h="xl" />
      <Space h="xl" />
      <div>
        <AnchorHeading order={3} ta="center" id="pro-bundesland">
          Todesschüsse pro Bundesland, je eine Mio. Einwohner
        </AnchorHeading>
        <Space h="xl" />
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Title order={4} ta="center">
              Westdeutschland 1976–1990
            </Title>
            <HorizontalBarChart
              data={perInhabWestSorted}
              tooltip={({ value, data }: { value: number; data: any }) =>
                simpleBarChartTooltip({
                  value,
                  data,
                  primaryLabelKey: "Bundesland",
                  secondaryLabelKey: "Anzahl je Mio. Einw.",
                  singularUnit: "",
                  pluralUnit: "",
                })
              }
            />
            <HorizontalBarChart
              data={perInhabWestSorted}
              mobile
              tooltip={({ value, data }: { value: number; data: any }) =>
                simpleBarChartTooltip({
                  value,
                  data,
                  primaryLabelKey: "Bundesland",
                  secondaryLabelKey: "Anzahl je Mio. Einw.",
                  singularUnit: "",
                  pluralUnit: "",
                })
              }
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Title order={4} ta="center">
              Bundesrepublik 1990–{data[0].year}
            </Title>
            <HorizontalBarChart
              data={inhabDataAfterSorted}
              tooltip={({ value, data }: { value: number; data: any }) =>
                simpleBarChartTooltip({
                  value,
                  data,
                  primaryLabelKey: "Bundesland",
                  secondaryLabelKey: "Anzahl je Mio. Einw.",
                  singularUnit: "",
                  pluralUnit: "",
                })
              }
            />
            <HorizontalBarChart
              data={inhabDataAfterSorted}
              mobile
              tooltip={({ value, data }: { value: number; data: any }) =>
                simpleBarChartTooltip({
                  value,
                  data,
                  primaryLabelKey: "Bundesland",
                  secondaryLabelKey: "Anzahl je Mio. Einw.",
                  singularUnit: "",
                  pluralUnit: "",
                })
              }
            />
          </Grid.Col>
        </Grid>
      </div>
      <Space h="xl" />
      <Space h="xl" />
      <Space h="xl" />
      <div>
        <AnchorHeading order={3} ta="center" id="pro-stadt">
          Todesschüsse pro Stadt
        </AnchorHeading>
        <Space h="xl" />
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Title order={4} ta="center">
              Westdeutschland 1976–1990
            </Title>
            <HorizontalBarChart
              data={cityDataWest}
              tooltip={({ value, data }: { value: number; data: any }) =>
                simpleBarChartTooltip({
                  value,
                  data,
                  primaryLabelKey: "Stadt",
                })
              }
            />
            <HorizontalBarChart
              mobile
              data={cityDataWest}
              tooltip={({ value, data }: { value: number; data: any }) =>
                simpleBarChartTooltip({
                  value,
                  data,
                  primaryLabelKey: "Stadt",
                })
              }
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Title order={4} ta="center">
              Bundesrepublik 1990–{data[0].year}
            </Title>
            <HorizontalBarChart
              data={cityDataAfter}
              tooltip={({ value, data }: { value: number; data: any }) =>
                simpleBarChartTooltip({
                  value,
                  data,
                  primaryLabelKey: "Stadt",
                })
              }
            />
            <HorizontalBarChart
              mobile
              data={cityDataAfter}
              tooltip={({ value, data }: { value: number; data: any }) =>
                simpleBarChartTooltip({
                  value,
                  data,
                  primaryLabelKey: "Stadt",
                })
              }
            />
          </Grid.Col>
        </Grid>
      </div>
      <Space h="xl" />
      <Space h="xl" />
      <div>
        <AnchorHeading order={3} ta="center" id="pro-monat">
          Todesschüsse {data[data.length - 1].year}–{data[0].year} pro Monat
        </AnchorHeading>
        <HorizontalBarChart
          data={countItems(
            _.orderBy(data, "month", "desc").map(({ monthPrint }) => monthPrint)
          )}
          tooltip={({ value, data }: { value: number; data: any }) =>
            simpleBarChartTooltip({
              value,
              data,
              primaryLabelKey: "Monat",
            })
          }
        />
        <HorizontalBarChart
          mobile
          data={countItems(
            _.orderBy(data, "month", "desc").map(({ monthPrint }) => monthPrint)
          )}
          tooltip={({ value, data }: { value: number; data: any }) =>
            simpleBarChartTooltip({
              value,
              data,
              primaryLabelKey: "Monat",
            })
          }
        />
      </div>
      <Space h="xl" />
      <Space h="xl" />
      <div>
        <MiddleContent>
          <AnchorHeading order={3} ta="center" id="pro-wochentag">
            Todesschüsse {data[data.length - 1].year}–{data[0].year} pro
            Wochentag, unterteilt nach SEK-Beteiligung
          </AnchorHeading>
        </MiddleContent>
        <HorizontalBarChart
          data={dataSekNo2}
          tooltip={({ value, data, id }: { value: number; data: any; id: string }) =>
            barChartTooltip({
              value,
              data,
              id,
              primaryLabelKey: "Wochentag",
            })
          }
        />
        <HorizontalBarChart
          data={dataSekNo2}
          mobile
          tooltip={({ value, data, id }: { value: number; data: any; id: string }) =>
            barChartTooltip({
              value,
              data,
              id,
              primaryLabelKey: "Wochentag",
            })
          }
        />
      </div>
      <Space h="xl" />
      <Space h="xl" />
      <div>
        <AnchorHeading order={3} ta="center" id="pro-tag-im-monat">
          Todesschüsse {data[data.length - 1].year}–{data[0].year} pro Tag im
          Monat
        </AnchorHeading>
        <VerticalBarChart
          data={countItems(data.map(({ dom }) => dom))}
          tooltip={({ value, data }: { value: number; data: any }) =>
            simpleBarChartTooltip({
              value,
              data,
              primaryLabelKey: "Tag im Monat",
            })
          }
        />
        <VerticalBarChart
          data={countItems(data.map(({ dom }) => dom))}
          mobile
          tooltip={({ value, data }: { value: number; data: any }) =>
            simpleBarChartTooltip({
              value,
              data,
              primaryLabelKey: "Tag im Monat",
            })
          }
        />
      </div>
      <Space h="xl" />
      <Space h="xl" />
      <div>
        <AnchorHeading order={3} ta="center" id="alter">
          Alter der Opfer von Todesschüssen {data[data.length - 1].year}–
          {data[0].year}
        </AnchorHeading>
        <VerticalBarChart
          data={countItems(data.map(({ Alter }) => Alter).filter(isNumber))}
          tooltip={({ value, data }) => (
            <ChartTooltip
              primaryLabel="Alter"
              primaryValue={`${data.value} Jahre`}
              secondaryLabel="Anzahl"
              secondaryValue={value}
              singularUnit="Opfer"
              pluralUnit="Opfer"
            />
          )}
        />
        <VerticalBarChart
          data={countItems(data.map(({ age }) => age).filter(isNumber))}
          mobile
          tooltip={({ value, data }) => (
            <ChartTooltip
              primaryLabel="Altersgruppe"
              primaryValue={`${data.value}-${parseInt(data.value) + 4} Jahre`}
              secondaryLabel="Anzahl"
              secondaryValue={value}
              singularUnit="Opfer"
              pluralUnit="Opfer"
            />
          )}
        />
      </div>
      <Space h="xl" />
      <Space h="xl" />
      <div>
        <MiddleContent>
          <AnchorHeading order={3} ta="center" id="weitere-umstaende">
            Weitere Umstände zu Todesschüssen {data[data.length - 1].year}–
            {data[0].year} (sofern bekannt)
          </AnchorHeading>
        </MiddleContent>
        <HorizontalBarChart
          data={boolData}
          formatPerc
          maxValue={1}
          margin={{ top: 10, right: 10, bottom: 30, left: 300 }}
          tooltip={({ value, data }: { value: number; data: any }) =>
            percentageTooltip({ value, data })
          }
        />
        <HorizontalBarChart
          mobile
          data={boolData}
          formatPerc
          maxValue={1}
          margin={{ top: 10, right: 10, bottom: 30, left: 190 }}
          tooltip={({ value, data }: { value: number; data: any }) =>
            percentageTooltip({ value, data })
          }
        />
      </div>
      <Space h="xl" />
      <Space h="xl" />
      <MiddleContent>
        <AnchorHeading order={3} ta="center" id="umstaende-bundeslaender">
          Verteilung der Umstände von Todesschüssen {data[data.length - 1].year}
          –{data[0].year} auf Bundesländer (Angaben in Prozent)
        </AnchorHeading>
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
  const { data, options, averages } = await setupData();

  return {
    props: {
      data,
      options,
      averages,
    },
  };
};

export default Visualisierungen;
