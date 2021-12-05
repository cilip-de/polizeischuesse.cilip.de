import { Center, Text, useMantineTheme } from "@mantine/core";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import _ from "lodash";
import React from "react";

const HeatMapChart = ({ data, leftLabels }) => {
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
    "Hinweise auf Alkohol- und/ oder Drogenkonsum",
    "Schussort Innenraum",
    "Schussort Außen",
  ];

  const boolData = (data) =>
    boolAtr
      .map((x) => ({
        [x]: _.round(
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
      state: id,
      ...Object.assign(...boolData(state)),
    }))
    .orderBy("state")
    .value();

  const theme = useMantineTheme();

  return (
    <div style={{ height: "800px" }}>
      <ResponsiveHeatMap
        data={ans}
        keys={boolAtr.concat("unbewaffnet")}
        indexBy="state"
        margin={{ top: 250, right: 60, bottom: 30, left: 60 }}
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
          Alle Angaben sind in Prozent. Die Werte sind mir Vorsicht zu genießen,
          da es in einigen Ländern nur wenige Fälle gibt. So z. B. in Saarland
          (4), Mecklenburg-Vorpommern (5) und Bremen (5).
        </Text>
      </Center>
    </div>
  );
};

export default HeatMapChart;
