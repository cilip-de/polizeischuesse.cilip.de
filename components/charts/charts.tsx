import { Text, useMantineTheme } from "@mantine/core";
import { BarDatum, BarTooltipProps, ResponsiveBar } from "@nivo/bar";
import { ticks } from "d3-array";
import dayjs from "dayjs";
import _ from "lodash";
import { countItems } from "../../lib/data";
import { addMissingYears, combineArray } from "../../lib/util";
import { makeDowData } from "../../pages/visualisierungen";

interface DataItem extends BarDatum {
  value: string;
  count: number;
  count2?: number;
  count3?: number;
  tooltipLabel?: {
    count: string;
    count2: string;
    count3: string;
    [key: string]: string;
  };
  [key: string]: any;
}

const selectNiceTicks = (data: DataItem[], numTicks: number): string[] => [
  ...Array.from(
    new Set(
      ticks(0, data.length, numTicks)
        .concat([0, data.length - 1])
        .filter((x) => x < data.length)
        .map((x) => data[x].value)
    )
  ),
];

const tooltip: React.FC<BarTooltipProps<DataItem>> = ({ value, data, id }) => (
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

const tooltipOverview = ({
  value,
  data,
  id,
}: {
  value: number;
  data: DataItem;
  id: string;
}) => (
  <div>
    <Text
      size="sm"
      style={{ background: "white", padding: "0 0.1rem", opacity: 0.8 }}
    >
      {data.value}:{" "}
      {data.tooltipLabel &&
        data.tooltipLabel[id] === "hit" &&
        value !== 1 &&
        `${value} Fälle`}
      {data.tooltipLabel &&
        data.tooltipLabel[id] === "hit" &&
        value === 1 &&
        `1 Fall`}
      {data.tooltipLabel &&
        data.tooltipLabel[id] !== "hit" &&
        `${value} Fälle, auf die die Auswahl nicht zutrifft`}
    </Text>
  </div>
);

const commonProps = {
  indexBy: "value",
  keys: ["count", "count2", "count3"],
  padding: 0.2,
  tooltip,
};

const VerticalBarChart = ({
  data,
  numTicks = 3,
  mobile = false,
  ...rest
}: {
  data: DataItem[];
  numTicks?: number;
  mobile?: boolean;
}) => {
  const theme = useMantineTheme();

  let legend = undefined;

  if (data[0].tooltipLabel) {
    legend = [
      {
        dataFrom: "keys",
        data: [
          {
            id: "count",
            label: data[0].tooltipLabel.count,
            color: theme.colors.indigo[2],
          },
          {
            id: "count2",
            label: data[0].tooltipLabel.count2,
            color: theme.colors.indigo[1],
          },
          {
            id: "count3",
            label: data[0].tooltipLabel.count3,
            color: theme.colors.indigo[3],
          },
        ].filter((x) => x.label),
        anchor: "bottom-right",
        direction: "column",
        justify: false,
        translateX: mobile ? -30 : 120,
        translateY: mobile ? 90 : 0,
        itemsSpacing: 2,
        itemWidth: mobile ? 170 : 100,
        itemHeight: 20,
        itemDirection: "left-to-right",
        itemOpacity: 0.85,
        symbolSize: 20,
        effects: [
          {
            on: "hover",
            style: {
              itemOpacity: 1,
            },
          },
        ],
      },
    ];
  }

  return (
    <div
      className={mobile ? "only-mobile" : "only-non-mobile"}
      style={{
        height: mobile ? 300 : 200,
      }}
    >
      <ResponsiveBar
        theme={{
          fontSize: mobile ? 8 : 12,
        }}
        legends={legend}
        enableGridY={rest.gridYValues != null}
        valueFormat={(x) => (x == 0 ? null : x)}
        margin={{
          top: 10,
          right: mobile ? 0 : 220,
          bottom: mobile && data[0].tooltipLabel ? 100 : 30,
          left: mobile ? 0 : rest.axisLeft ? 50 : 10,
        }}
        axisLeft={null}
        colors={[
          theme.colors.indigo[2],
          theme.colors.indigo[1],
          theme.colors.indigo[3],
        ]}
        axisBottom={{
          tickValues: selectNiceTicks(data, numTicks),
        }}
        data={data}
        {...commonProps}
        {...(mobile ? { padding: 0.1 } : {})}
        {...rest}
      />
    </div>
  );
};

const HorizontalBarChart = ({
  data,
  formatPerc = false,
  mobile = false,
  ...rest
}) => {
  const theme = useMantineTheme();

  let legend = undefined;

  if (data[0].tooltipLabel) {
    legend = [
      {
        data: [
          {
            id: "count",
            label: data[0].tooltipLabel.count,
            color: theme.colors.indigo[2],
          },
          {
            id: "count2",
            label: data[0].tooltipLabel.count2,
            color: theme.colors.indigo[1],
          },
          {
            id: "count3",
            label: data[0].tooltipLabel.count3,
            color: theme.colors.indigo[3],
          },
        ],
        anchor: "bottom-right",
        direction: "column",
        justify: false,
        translateX: mobile ? -30 : 120,
        translateY: mobile ? 80 : 0,
        itemsSpacing: 2,
        itemWidth: mobile ? 170 : 100,
        itemHeight: 20,
        itemDirection: "left-to-right",
        itemOpacity: 0.85,
        symbolSize: 20,
        effects: [
          {
            on: "hover",
            style: {
              itemOpacity: 1,
            },
          },
        ],
      },
    ];
  }

  const margin = {
    top: 10,
    right: mobile ? 0 : data[0].tooltipLabel ? 160 : 120,
    bottom: mobile && data[0].tooltipLabel ? 100 : 30,
    left: mobile ? 140 : 150,
  };
  return (
    <div
      className={mobile ? "only-mobile" : "only-non-mobile"}
      style={{ height: 20 * data.length + margin.top + margin.bottom }}
    >
      <ResponsiveBar
        legends={legend}
        labelSkipWidth={15}
        valueFormat={(x) =>
          formatPerc ? _.round(x * 100, 0) + " %" : x.toString()
        }
        margin={margin}
        layout={"horizontal"}
        axisRight={null}
        enableGridY={false}
        axisBottom={null}
        colors={[theme.colors.indigo[2], theme.colors.indigo[1]]}
        data={data}
        {...commonProps}
        {...rest}
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
    combineArray(
      addMissingYears(data, hitsData, data[data.length - 1].year, data[0].year),
      noHitsData,
      "hit",
      "nohit"
    ),
    "value"
  );

  return (
    <div style={{ height: 120 }}>
      <ResponsiveBar
        animate={false}
        enableGridY={false}
        enableLabel={false}
        // valueFormat={(x) => (x == 0 ? null : x)}
        margin={{ top: 0, right: 1, bottom: 25, left: 1 }}
        axisLeft={null}
        colors={(x) => {
          if (x.indexValue === dayjs().year().toString()) {
            return (
              {
                count: theme.colors.indigo[2],
                count2: theme.colors.indigo[1],
                count3: theme.colors.indigo[1],
              }[x.id] || theme.colors.indigo[2]
            );
          }
          return (
            { count: "#BFBFC1", count2: "#EAEAEC", count3: "#EAEAEC" }[x.id] ||
            "#BFBFC1" // Default color
          );
        }}
        axisBottom={{
          tickValues: selectNiceTicks(procData, 4),
        }}
        data={procData}
        indexBy={"value"}
        keys={["count", "count2", "count3"]}
        // padding={-0.01}
        tooltip={tooltipOverview}
        onClick={onClick}
        onMouseEnter={(_datum, event) => {
          event.currentTarget.style.cursor = "pointer";
        }}
      />
    </div>
  );
};

const DowChart = ({ data }) => {
  const dataDow = makeDowData(data);

  const theme = useMantineTheme();
  const margin = { top: 10, right: 10, bottom: 10, left: 70 };

  return (
    <div style={{ height: 20 * dataDow.length + margin.top + margin.bottom }}>
      <ResponsiveBar
        margin={margin}
        layout={"horizontal"}
        axisRight={null}
        enableGridY={false}
        axisBottom={null}
        colors={[
          theme.colors.indigo[2],
          theme.colors.indigo[1],
          theme.colors.indigo[3],
        ]}
        data={dataDow}
        {...commonProps}
      />
    </div>
  );
};

export {
  DowChart,
  HorizontalBarChart,
  OverviewChart,
  selectNiceTicks,
  VerticalBarChart,
};
