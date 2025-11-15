import { useMantineTheme } from "@mantine/core";
import { BarDatum, BarTooltipProps, ResponsiveBar } from "@nivo/bar";
import { ticks } from "d3-array";
import dayjs from "dayjs";
import _ from "lodash";
import { useState } from "react";
import { countItems } from "../../lib/data";
import { addMissingYears, combineArray } from "../../lib/util";
import { makeDowData } from "../../pages/visualisierungen";
import { ChartTooltip } from "./ChartTooltip";


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

const selectNiceTicks = (
  data: DataItem[],
  numTicks: number,
  startOffset = 0,
  endOffset = 0
): string[] => [
  ...Array.from(
    new Set(
      ticks(startOffset, data.length, numTicks - endOffset)
        .concat([startOffset, data.length - 1 - endOffset])
        .filter((x) => x < data.length)
        .map((x) => data[x].value)
    )
  ),
];

const tooltip: React.FC<BarTooltipProps<DataItem>> = ({ value, data, id }) => {
  const label = data.tooltipLabel?.[id] || "Anzahl";
  return (
    <ChartTooltip
      secondaryLabel={`${data.value}${data.tooltipLabel != null ? `, ${label}` : ""}`}
      secondaryValue={value}
      singularUnit=""
      pluralUnit=""
      valueFormatter={(val) => val.toString()}
    />
  );
};

const tooltipOverview = ({
  value,
  data,
  id,
}: {
  value: number;
  data: DataItem;
  id: string;
}) => {
  const isHit = data.tooltipLabel && data.tooltipLabel[id] === "hit";
  const customContent = !isHit ? ", auf die die Auswahl nicht zutrifft" : undefined;

  return (
    <ChartTooltip
      secondaryLabel={data.value}
      secondaryValue={value}
      singularUnit="Fall"
      pluralUnit="Fälle"
      customContent={customContent}
    />
  );
};

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
  tooltip?: any;
  [key: string]: any;
}) => {
  const theme = useMantineTheme();
  const [hoveredBar, setHoveredBar] = useState<{ indexValue: string; id: string } | null>(null);

  let legend = undefined;

  if (data && data.length > 0 && data[0].tooltipLabel) {
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

  // Get the visible tick values from the x-axis
  const visibleTicks = new Set(selectNiceTicks(data, numTicks));

  // Custom label function: only show labels where x-axis label is also shown
  const labelFormatter = (d: any) => {
    const value = d.value;
    // Don't show label for zero values
    if (value == 0) return "";

    // Only show label if this bar's x-axis label is visible
    if (visibleTicks.has(d.indexValue)) {
      return value;
    }
    return "";
  };

  return (
    <div
      className={mobile ? "only-mobile" : "only-non-mobile"}
      style={{
        height: mobile ? 300 : 200,
      }}
      role="img"
      aria-label="Balkendiagramm der Datenverteilung"
    >
      <ResponsiveBar
        theme={{
          fontSize: mobile ? 8 : 12,
        }}
        legends={legend}
        enableGridY={rest.gridYValues != null}
        label={labelFormatter}
        margin={{
          top: 10,
          right: mobile ? 0 : 220,
          bottom: mobile && data && data.length > 0 && data[0].tooltipLabel ? 100 : 30,
          left: mobile ? 0 : rest.axisLeft ? 50 : 10,
        }}
        axisLeft={null}
        colors={(bar) => {
          const isHovered =
            hoveredBar?.indexValue === bar.indexValue &&
            hoveredBar?.id === bar.id;
          const colorMap = {
            count: isHovered ? theme.colors.indigo[4] : theme.colors.indigo[2],
            count2: isHovered ? theme.colors.indigo[3] : theme.colors.indigo[1],
            count3: isHovered ? theme.colors.indigo[5] : theme.colors.indigo[3],
          };
          return colorMap[bar.id as keyof typeof colorMap] || theme.colors.indigo[2];
        }}
        onMouseEnter={(datum) => setHoveredBar({ indexValue: datum.indexValue as string, id: datum.id as string })}
        onMouseLeave={() => setHoveredBar(null)}
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
  const [hoveredBar, setHoveredBar] = useState<{ indexValue: string; id: string } | null>(null);

  let legend = undefined;

  if (data && data.length > 0 && data[0].tooltipLabel) {
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
        ].filter((x) => x.label),

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

  // Smart label filtering: show ~50% of labels for charts with many bars
  const labelFormatter = (d: any) => {
    const value = d.value;
    const dataLength = data.length;
    const index = data.findIndex((item) => item.value === d.indexValue);

    // Don't show label for zero values
    if (value == 0) return "";

    // Always show first and last labels
    if (index === 0 || index === dataLength - 1) {
      return formatPerc ? _.round(value * 100, 0) + " %" : value.toString();
    }

    // For charts with many items, show every 2nd or 3rd label
    if (dataLength > 15) {
      const step = dataLength > 20 ? 3 : 2;
      if (index % step === 0) {
        return formatPerc ? _.round(value * 100, 0) + " %" : value.toString();
      }
      return "";
    }

    // For charts with fewer items, show all labels
    return formatPerc ? _.round(value * 100, 0) + " %" : value.toString();
  };

  const margin = {
    top: 10,
    right: mobile ? 0 : (data && data.length > 0 && data[0].tooltipLabel ? 160 : 120),
    bottom: mobile && data && data.length > 0 && data[0].tooltipLabel ? 100 : 30,
    left: mobile ? 140 : 150,
  };
  return (
    <div
      className={mobile ? "only-mobile" : "only-non-mobile"}
      style={{ height: 20 * data.length + margin.top + margin.bottom }}
      role="img"
      aria-label="Horizontales Balkendiagramm der Datenverteilung"
    >
      <ResponsiveBar
        legends={legend}
        labelSkipWidth={15}
        label={labelFormatter}
        margin={margin}
        layout={"horizontal"}
        axisRight={null}
        enableGridY={false}
        axisBottom={null}
        colors={(bar) => {
          const isHovered =
            hoveredBar?.indexValue === bar.indexValue &&
            hoveredBar?.id === bar.id;
          const colorMap = {
            count: isHovered ? theme.colors.indigo[4] : theme.colors.indigo[2],
            count2: isHovered ? theme.colors.indigo[3] : theme.colors.indigo[1],
            count3: isHovered ? theme.colors.indigo[5] : theme.colors.indigo[3],
          };
          return colorMap[bar.id as keyof typeof colorMap] || theme.colors.indigo[2];
        }}
        onMouseEnter={(datum) => setHoveredBar({ indexValue: datum.indexValue as string, id: datum.id as string })}
        onMouseLeave={() => setHoveredBar(null)}
        data={data}
        {...commonProps}
        {...rest}
      />
    </div>
  );
};

const OverviewChart = ({ data, hits, onClick }) => {
  const theme = useMantineTheme();
  const [hoveredBar, setHoveredBar] = useState<{ indexValue: string; id: string } | null>(null);

  console.log('OverviewChart rendering:', {
    data: data ? `array of ${data.length}` : 'undefined',
    hits: hits ? `array of ${hits.length}` : 'undefined',
    theme: !!theme,
    themeColors: theme?.colors ? Object.keys(theme.colors) : 'undefined',
  });

  if (!hits || !data) {
    console.log('OverviewChart: hits or data is null, returning null');
    return null;
  }

  if (!Array.isArray(hits) || !Array.isArray(data)) {
    console.error('OverviewChart: hits or data is not an array', { hits, data });
    return null;
  }

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
    <div
      style={{ height: 120 }}
      role="img"
      aria-label="Übersichtsdiagramm mit jährlicher Verteilung der Fälle. Klicken Sie auf einen Balken um nach Jahr zu filtern."
    >
      <ResponsiveBar
        animate={false}
        enableGridY={false}
        enableLabel={false}
        // valueFormat={(x) => (x == 0 ? null : x)}
        margin={{ top: 0, right: 0, bottom: 25, left: 0 }}
        axisLeft={null}
        colors={(x) => {
          const isHovered =
            hoveredBar?.indexValue === x.indexValue &&
            hoveredBar?.id === x.id;

          if (x.indexValue === dayjs().year().toString()) {
            const colorMap = {
              count: isHovered ? theme.colors.indigo[4] : theme.colors.indigo[2],
              count2: isHovered ? theme.colors.indigo[3] : theme.colors.indigo[1],
              count3: isHovered ? theme.colors.indigo[3] : theme.colors.indigo[1],
            };
            return colorMap[x.id] || theme.colors.indigo[2];
          }

          const colorMap = {
            count: isHovered ? "#9FA0A2" : "#BFBFC1",
            count2: isHovered ? "#D0D0D2" : "#EAEAEC",
            count3: isHovered ? "#D0D0D2" : "#EAEAEC",
          };
          return colorMap[x.id] || "#BFBFC1";
        }}
        axisBottom={{
          tickValues: selectNiceTicks(procData, 5, 1, 1),
        }}
        data={procData}
        indexBy={"value"}
        keys={["count", "count2", "count3"]}
        // padding={-0.01}
        tooltip={tooltipOverview}
        onClick={onClick}
        onMouseEnter={(datum, event) => {
          event.currentTarget.style.cursor = "pointer";
          setHoveredBar({ indexValue: datum.indexValue as string, id: datum.id as string });
        }}
        onMouseLeave={() => setHoveredBar(null)}
      />
    </div>
  );
};

const DowChart = ({ data }) => {
  const dataDow = makeDowData(data);

  const theme = useMantineTheme();
  const [hoveredBar, setHoveredBar] = useState<{ indexValue: string; id: string } | null>(null);
  const margin = { top: 10, right: 10, bottom: 10, left: 70 };

  return (
    <div
      style={{ height: 20 * dataDow.length + margin.top + margin.bottom }}
      role="img"
      aria-label="Balkendiagramm der Verteilung nach Wochentag"
    >
      <ResponsiveBar
        margin={margin}
        layout={"horizontal"}
        axisRight={null}
        enableGridY={false}
        axisBottom={null}
        colors={(bar) => {
          const isHovered =
            hoveredBar?.indexValue === bar.indexValue &&
            hoveredBar?.id === bar.id;
          const colorMap = {
            count: isHovered ? theme.colors.indigo[4] : theme.colors.indigo[2],
            count2: isHovered ? theme.colors.indigo[3] : theme.colors.indigo[1],
            count3: isHovered ? theme.colors.indigo[5] : theme.colors.indigo[3],
          };
          return colorMap[bar.id as keyof typeof colorMap] || theme.colors.indigo[2];
        }}
        onMouseEnter={(datum) => setHoveredBar({ indexValue: datum.indexValue as string, id: datum.id as string })}
        onMouseLeave={() => setHoveredBar(null)}
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
