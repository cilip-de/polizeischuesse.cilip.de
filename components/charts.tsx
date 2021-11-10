import { Text, useMantineTheme } from "@mantine/core";
import { ResponsiveBar } from "@nivo/bar";
import { ticks } from "d3-array";
import _ from "lodash";
import React from "react";

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

const commonProps = {
  indexBy: "value",
  keys: ["count"],
  padding: 0.2,
  tooltip,
};

const VerticalBarChart = ({ data, numTicks = 3 }) => {
  const theme = useMantineTheme();

  return (
    <div style={{ height: 150 }}>
      <ResponsiveBar
        margin={{ top: 10, right: 10, bottom: 30, left: 10 }}
        axisLeft={null}
        colors={theme.colors.indigo[2]}
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
        {...{ ...commonProps, keys: ["count", "count2"] }}
      />
    </div>
  );
};

export { VerticalBarChart, HorizontalBarChart };
