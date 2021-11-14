import { Text, useMantineTheme } from "@mantine/core";
import { ResponsiveBar } from "@nivo/bar";
import { ticks } from "d3-array";
import _ from "lodash";
import React from "react";
import { countItems } from "../lib/data";
import { addMissingYears, combineArray } from "../lib/util";

const selectNiceTicks = (data, numTicks) => [
  ...new Set(
    ticks(0, data.length, numTicks)
      .concat([0, data.length - 1])
      .filter((x) => x < data.length)
      .map((x) => data[x].value)
  ),
];

const tooltip = ({ value, data, id }) => (
  <div>
    <Text
      size="sm"
      style={{ background: "white", padding: "0 0.1rem", opacity: 0.8 }}
    >
      {data.value}: {value}
      {data.tooltipLabel != null && `, ${data.tooltipLabel[id]}`}
    </Text>
  </div>
);
const tooltipOverview = ({ value, data, id }) => (
  <div>
    <Text
      size="sm"
      style={{ background: "white", padding: "0 0.1rem", opacity: 0.8 }}
    >
      {data.value}:{" "}
      {data.tooltipLabel[id] === "hit" && value !== 1 && `${value} Fälle`}
      {data.tooltipLabel[id] === "hit" && value === 1 && `1 Fall`}
      {data.tooltipLabel[id] !== "hit" &&
        `${value} Fälle, auf die die Auswahl nicht zutrifft`}
    </Text>
  </div>
);

const commonProps = {
  indexBy: "value",
  keys: ["count", "count2"],
  padding: 0.2,
  tooltip,
};

const VerticalBarChart = ({ data, numTicks = 3 }) => {
  const theme = useMantineTheme();

  return (
    <div style={{ height: 200 }}>
      <ResponsiveBar
        valueFormat={(x) => (x == 0 ? null : x)}
        margin={{ top: 10, right: 10, bottom: 30, left: 10 }}
        axisLeft={null}
        colors={[theme.colors.indigo[2], theme.colors.indigo[1]]}
        axisBottom={{
          tickValues: selectNiceTicks(data, numTicks),
        }}
        data={data}
        {...commonProps}
      />
    </div>
  );
};

const HorizontalBarChart = ({ data, formatPerc = false }) => {
  const theme = useMantineTheme();

  const margin = { top: 10, right: 10, bottom: 30, left: 200 };

  return (
    <div style={{ height: 20 * data.length + margin.top + margin.bottom }}>
      <ResponsiveBar
        valueFormat={(x) => (formatPerc ? _.round(x * 100, 0) + " %" : x)}
        margin={margin}
        layout={"horizontal"}
        axisRight={null}
        enableGridY={false}
        axisBottom={null}
        colors={[theme.colors.indigo[2], theme.colors.indigo[1]]}
        data={data}
        {...commonProps}
      />
    </div>
  );
};

const OverviewChart = ({ data, hits, onClick }) => {
  const theme = useMantineTheme();

  const hitsId = new Set(hits.map(({ key }) => key));

  const hitsData = countItems(hits.map(({ year }) => year));
  const noHitsData = countItems(
    data.filter(({ key }) => !hitsId.has(key)).map(({ year }) => year)
  );

  const procData = _.orderBy(
    combineArray(addMissingYears(data, hitsData), noHitsData, "hit", "nohit"),
    "value"
  );

  return (
    <div style={{ height: 100 }}>
      <ResponsiveBar
        animate={false}
        enableGridY={false}
        enableLabel={false}
        valueFormat={(x) => (x == 0 ? null : x)}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        axisLeft={null}
        colors={["#BFBFC1", "#EAEAEC"]}
        axisBottom={{
          tickValues: selectNiceTicks(data, 3),
        }}
        data={procData}
        indexBy={"value"}
        keys={["count", "count2"]}
        padding={0}
        tooltip={tooltipOverview}
        onClick={onClick}
        style={{
          cursor: "pointer",
        }}
      />
    </div>
  );
};

export { VerticalBarChart, HorizontalBarChart, OverviewChart };
