import { Text, useMantineTheme } from "@mantine/core";
import { ResponsiveBar } from "@nivo/bar";
import React from "react";

const commonProps = {
  margin: { top: 10, right: 10, bottom: 20, left: 10 },
  indexBy: "value",
  keys: ["count"],
  padding: 0.2,
};

const TimeChart = ({ data }) => {
  const theme = useMantineTheme();

  return (
    <div style={{ height: 150 }}>
      <ResponsiveBar
        axisLeft={null}
        colors={theme.colors.indigo[2]}
        axisBottom={{
          tickValues: [
            data[0].value,
            data[Math.round(-1 + data.length / 2)].value,
            data.reverse()[0].value,
          ],
        }}
        data={data}
        {...commonProps}
        tooltip={({ value, data }) => (
          <div>
            <Text
              size="sm"
              style={{ background: "white", padding: "0 0.1rem", opacity: 0.8 }}
            >
              {data.value}: {value}
            </Text>
          </div>
        )}
      />
    </div>
  );
};

export default TimeChart;
