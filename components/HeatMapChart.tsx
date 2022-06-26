import { Center, Text, useMantineTheme } from "@mantine/core";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import _ from "lodash";

const HeatMapChart = ({ data, mobile = false }) => {
  const procData = [];

  // const x = leftLabels.map(label => {
  //   data.filter(x => x.states == label)
  // })

  const boolAtr = [
    "Schusswechsel",
    "Sondereinsatzbeamte",
    "Verletzte/getötete Beamte",
    "Vorbereitete Polizeiaktion",
    "Opfer mit Schusswaffe",
    "Unbeabsichtigte Schussabgabe",
    "Hinweise auf familiäre oder häusliche Gewalt",
    "Hinweise auf psychische Ausnahmesituation",
    // "Hinweise auf Alkohol- und/ oder Drogenkonsum",
    "Schussort Innenraum",
    "Schussort Außen",
  ];

  const boolData = (data) =>
    boolAtr
      .map((x) => ({
        [x
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
          )]: _.round(
          (data.filter((d) => d[x].includes("Ja")).length / data.length) * 100,
          0
        ),
      }))
      .concat([
        {
          unbewaffnet: _.round(
            (data.filter((x) => x.weapon == "").length / data.length) * 100
          ),
        },
      ]);
  const ans = _(data)
    .groupBy("state")
    .map((state, id) => ({
      state: id.replace("Mecklenburg-Vorpommern", "Mecklenburg-Vorp."),
      ...Object.assign(...boolData(state)),
    }))
    .orderBy("state")
    .value();

  const theme = useMantineTheme();

  return (
    <div
      style={{ height: mobile ? "600px" : "800px" }}
      className={mobile ? "only-mobile" : "only-non-mobile"}
    >
      <ResponsiveHeatMap
        data={ans}
        keys={boolAtr
          .map((x) =>
            x
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
              )
          )
          .concat("unbewaffnet")}
        indexBy="state"
        margin={{
          top: mobile ? 150 : 250,
          right: 0,
          bottom: 30,
          left: mobile ? 120 : 60,
        }}
        forceSquare={true}
        colors={theme.colors.indigo}
        maxValue={100}
        axisTop={{
          orient: "top",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -90,
          legend: "",
          legendOffset: 36,
        }}
        axisRight={null}
        axisBottom={null}
        cellOpacity={1}
        cellBorderColor={{ from: "color", modifiers: [["darker", 0.4]] }}
        labelTextColor={{ from: "color", modifiers: [["darker", 1.8]] }}
        defs={[
          {
            id: "lines",
            type: "patternLines",
            background: "inherit",
            color: "rgba(0, 0, 0, 0.1)",
            rotation: -45,
            lineWidth: 4,
            spacing: 7,
          },
        ]}
        fill={[{ id: "lines" }]}
        animate={true}
        motionConfig="wobbly"
        motionStiffness={80}
        motionDamping={9}
        hoverTarget="cell"
        cellHoverOthersOpacity={0.25}
      />
      <Center>
        <Text>
          Die Werte sind mit Vorsicht zu genießen, da es in einigen Ländern nur
          wenige Fälle gibt. So z. B. in Saarland (4), Mecklenburg-Vorpommern
          (5) und Bremen (5).
        </Text>
      </Center>
    </div>
  );
};

export default HeatMapChart;
