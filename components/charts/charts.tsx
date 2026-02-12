import { useMantineTheme } from "@mantine/core";
import { BarDatum, BarTooltipProps, BarLegendProps, ResponsiveBar } from "@nivo/bar";
import { ticks } from "d3-array";
import dayjs from "dayjs";
import _ from "lodash";
import React, { useState, useEffect, useRef } from "react";
import { countItems, ProcessedDataItem } from "../../lib/data";
import { addMissingYears, combineArray } from "../../lib/util";
import { makeDowData } from "../../pages/visualisierungen";
import { ChartTooltip } from "./ChartTooltip";


interface TooltipLabelConfig {
  count: string;
  count2: string;
  count3: string;
  [key: string]: string;
}

// ChartDataItem must be compatible with BarDatum which is Record<string, string | number>
// We use type intersection to add optional properties without breaking the index signature
type ChartDataItem = {
  value: string;
  count: number;
} & Record<string, string | number>;

// For data with tooltip labels, we extend with additional properties
type ChartDataItemWithTooltip = ChartDataItem & {
  tooltipLabel?: TooltipLabelConfig;
};

const selectNiceTicks = (
  data: ChartDataItem[],
  numTicks: number,
  startOffset = 0,
  endOffset = 0
): string[] => {
  const lastIndex = data.length - 1 - endOffset;
  return [
    ...Array.from(
      new Set(
        ticks(startOffset, lastIndex, numTicks)
          .concat([startOffset, lastIndex])
          .filter((x) => x >= 0 && x < data.length && x <= lastIndex)
          .map((x) => data[x].value)
      )
    ),
  ];
};

const tooltip: React.FC<BarTooltipProps<ChartDataItem>> = ({ value, data, id }) => {
  const dataWithTooltip = data as unknown as ChartDataItemWithTooltip;
  const label = dataWithTooltip.tooltipLabel?.[String(id)] || "Anzahl";
  return (
    <ChartTooltip
      primaryLabel="Jahr"
      primaryValue={data.value}
      secondaryLabel={label}
      secondaryValue={value}
      singularUnit="Fall"
      pluralUnit="Fälle"
    />
  );
};

const tooltipOverview: React.FC<BarTooltipProps<ChartDataItem>> = ({
  value,
  data,
  id,
}) => {
  const dataWithTooltip = data as unknown as ChartDataItemWithTooltip;
  const isHit = dataWithTooltip.tooltipLabel && dataWithTooltip.tooltipLabel[String(id)] === "hit";
  const customContent = !isHit ? ", auf die die Auswahl nicht zutrifft" : undefined;

  return (
    <ChartTooltip
      primaryLabel="Jahr"
      primaryValue={data.value}
      secondaryLabel="Anzahl"
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

interface VerticalBarChartProps {
  data: ChartDataItem[];
  numTicks?: number;
  mobile?: boolean;
  tooltip?: React.FC<BarTooltipProps<ChartDataItem>>;
  gridYValues?: number[];
  axisLeft?: {
    tickValues?: number[];
  };
  labelSkipWidth?: number;
  labelSkipHeight?: number;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  padding?: number;
}

const VerticalBarChart = ({
  data,
  numTicks = 3,
  mobile = false,
  tooltip: customTooltip,
  ...rest
}: VerticalBarChartProps) => {
  const theme = useMantineTheme();
  const [hoveredBar, setHoveredBar] = useState<{ indexValue: string; id: string } | null>(null);
  const [activeBar, setActiveBar] = useState<{ indexValue: string; id: string; value: number; data: ChartDataItem } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveBar(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobile]);

  let legend = undefined;
  const firstDataWithTooltip = data as unknown as ChartDataItemWithTooltip[];

  if (data && data.length > 0 && firstDataWithTooltip[0].tooltipLabel) {
    legend = [
      {
        dataFrom: "keys" as const,
        data: [
          {
            id: "count",
            label: firstDataWithTooltip[0].tooltipLabel.count,
            color: theme.colors.indigo[2],
          },
          {
            id: "count2",
            label: firstDataWithTooltip[0].tooltipLabel.count2,
            color: theme.colors.indigo[1],
          },
          {
            id: "count3",
            label: firstDataWithTooltip[0].tooltipLabel.count3,
            color: theme.colors.indigo[3],
          },
        ].filter((x) => x.label),
        anchor: "bottom-right" as const,
        direction: "column" as const,
        justify: false,
        translateX: mobile ? -30 : 120,
        translateY: mobile ? 90 : 0,
        itemsSpacing: 2,
        itemWidth: mobile ? 170 : 100,
        itemHeight: 20,
        itemDirection: "left-to-right" as const,
        itemOpacity: 0.85,
        symbolSize: 20,
        effects: [
          {
            on: "hover" as const,
            style: {
              itemOpacity: 1,
            },
          },
        ],
      },
    ] as BarLegendProps[];
  }

  // Get the visible tick values from the x-axis
  const visibleTicks = new Set(selectNiceTicks(data, numTicks));

  // Custom label function: only show labels where x-axis label is also shown
  const labelFormatter = (d: { value: number | null; indexValue: string | number }): string => {
    const value = d.value;
    // Don't show label for zero values
    if (value == 0 || value == null) return "";

    // Only show label if this bar's x-axis label is visible
    if (visibleTicks.has(String(d.indexValue))) {
      return String(value);
    }
    return "";
  };

  return (
    <div
      ref={containerRef}
      className={mobile ? "only-mobile" : "only-non-mobile"}
      style={{
        height: mobile ? 300 : 200,
        position: "relative",
      }}
      role="img"
      aria-label="Balkendiagramm der Datenverteilung"
      onClick={mobile ? () => setActiveBar(null) : undefined}
    >
      {mobile && activeBar && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            padding: "0.5rem 0.75rem",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            zIndex: 1000,
            fontSize: "0.85rem",
            maxWidth: "90%",
            textAlign: "center",
          }}
        >
          {customTooltip ? (
            React.createElement(customTooltip as React.FC<BarTooltipProps<ChartDataItem>>, {
              value: activeBar.value,
              data: activeBar.data,
              id: String(activeBar.id),
              color: '',
              label: '',
              formattedValue: String(activeBar.value),
              hidden: false,
              index: 0,
              indexValue: activeBar.indexValue,
            })
          ) : (
            <>
              <div><strong>{activeBar.indexValue}</strong></div>
              <div>
                {firstDataWithTooltip[0]?.tooltipLabel?.[activeBar.id] || "Anzahl"}: {activeBar.value}{" "}
                {activeBar.value === 1 ? "Fall" : "Fälle"}
              </div>
            </>
          )}
        </div>
      )}
      <ResponsiveBar
        theme={{
          text: {
            fontSize: mobile ? 8 : 12,
          },
        }}
        legends={legend}
        enableGridY={rest.gridYValues != null}
        label={labelFormatter}
        margin={{
          top: 10,
          right: mobile ? 15 : 220,
          bottom: mobile && data && data.length > 0 && firstDataWithTooltip[0].tooltipLabel ? 100 : 30,
          left: mobile ? 15 : rest.axisLeft ? 50 : 10,
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
        onClick={mobile ? (datum, event) => {
          event.stopPropagation();
          if (activeBar?.indexValue === datum.indexValue && activeBar?.id === datum.id) {
            setActiveBar(null);
          } else {
            setActiveBar({
              indexValue: String(datum.indexValue),
              id: String(datum.id),
              value: typeof datum.value === 'number' ? datum.value : 0,
              data: datum.data as ChartDataItem
            });
          }
        } : undefined}
        axisBottom={{
          tickValues: selectNiceTicks(data, numTicks),
        }}
        data={data}
        {...commonProps}
        {...rest}
        {...(customTooltip && !mobile ? { tooltip: customTooltip } : {})}
        {...(mobile ? { padding: 0.1, tooltip: () => null } : {})}
      />
    </div>
  );
};

interface HorizontalBarChartProps {
  data: ChartDataItem[];
  formatPerc?: boolean;
  mobile?: boolean;
  tooltip?: React.FC<BarTooltipProps<ChartDataItem>>;
  maxValue?: number;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

const HorizontalBarChart = ({
  data,
  formatPerc = false,
  mobile = false,
  maxValue,
  margin: customMargin,
  ...rest
}: HorizontalBarChartProps) => {
  const theme = useMantineTheme();
  const [hoveredBar, setHoveredBar] = useState<{ indexValue: string; id: string } | null>(null);
  const [activeBar, setActiveBar] = useState<{ indexValue: string; id: string; value: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveBar(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobile]);

  let legend = undefined;
  const dataWithTooltip = data as unknown as ChartDataItemWithTooltip[];

  if (data && data.length > 0 && dataWithTooltip[0].tooltipLabel) {
    legend = [
      {
        dataFrom: "keys" as const,
        data: [
          {
            id: "count",
            label: dataWithTooltip[0].tooltipLabel.count,
            color: theme.colors.indigo[2],
          },
          {
            id: "count2",
            label: dataWithTooltip[0].tooltipLabel.count2,
            color: theme.colors.indigo[1],
          },
          {
            id: "count3",
            label: dataWithTooltip[0].tooltipLabel.count3,
            color: theme.colors.indigo[3],
          },
        ].filter((x) => x.label),

        anchor: "bottom-right" as const,
        direction: "column" as const,
        justify: false,
        translateX: mobile ? -30 : 120,
        translateY: mobile ? 80 : 0,
        itemsSpacing: 2,
        itemWidth: mobile ? 170 : 100,
        itemHeight: 20,
        itemDirection: "left-to-right" as const,
        itemOpacity: 0.85,
        symbolSize: 20,
        effects: [
          {
            on: "hover" as const,
            style: {
              itemOpacity: 1,
            },
          },
        ],
      },
    ] as BarLegendProps[];
  }

  // Smart label filtering: show ~50% of labels for charts with many bars
  const labelFormatter = (d: { value: number | null; indexValue: string | number }) => {
    const value = d.value;
    const dataLength = data.length;
    const index = data.findIndex((item: ChartDataItem) => item.value === d.indexValue);

    // Don't show label for zero values
    if (value == 0 || value == null) return "";

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

  const margin = customMargin || {
    top: 10,
    right: mobile ? 10 : (data && data.length > 0 && dataWithTooltip[0].tooltipLabel ? 160 : 120),
    bottom: mobile && data && data.length > 0 && dataWithTooltip[0].tooltipLabel ? 100 : 30,
    left: mobile ? 130 : 150,
  };
  return (
    <div
      ref={containerRef}
      className={mobile ? "only-mobile" : "only-non-mobile"}
      style={{ height: 20 * data.length + (margin.top || 0) + (margin.bottom || 0), position: "relative" }}
      role="img"
      aria-label="Horizontales Balkendiagramm der Datenverteilung"
      onClick={mobile ? () => setActiveBar(null) : undefined}
    >
      {mobile && activeBar && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            padding: "0.5rem 0.75rem",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            zIndex: 1000,
            fontSize: "0.85rem",
            maxWidth: "90%",
            textAlign: "center",
          }}
        >
          <div><strong>{activeBar.indexValue}</strong></div>
          <div>
            {dataWithTooltip[0]?.tooltipLabel?.[activeBar.id] || "Anzahl"}: {formatPerc ? `${Math.round(activeBar.value * 100)}%` : activeBar.value}
            {!formatPerc && ` ${activeBar.value === 1 ? "Fall" : "Fälle"}`}
          </div>
        </div>
      )}
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
        onClick={mobile ? (datum, event) => {
          event.stopPropagation();
          if (activeBar?.indexValue === datum.indexValue && activeBar?.id === datum.id) {
            setActiveBar(null);
          } else {
            setActiveBar({
              indexValue: String(datum.indexValue),
              id: String(datum.id),
              value: typeof datum.value === 'number' ? datum.value : 0
            });
          }
        } : undefined}
        data={data}
        {...commonProps}
        {...rest}
        {...(mobile ? { tooltip: () => null } : {})}
        {...(maxValue !== undefined ? { maxValue } : {})}
      />
    </div>
  );
};

interface OverviewChartProps {
  data: ProcessedDataItem[];
  hits: ProcessedDataItem[];
  onClick: (datum: { indexValue: string | number; id: string | number }) => void;
}

const OverviewChart = ({ data, hits, onClick }: OverviewChartProps) => {
  const theme = useMantineTheme();
  const [hoveredBar, setHoveredBar] = useState<{ indexValue: string; id: string } | null>(null);

  if (!hits || !data) {
    return null;
  }

  if (!Array.isArray(hits) || !Array.isArray(data)) {
    console.error('OverviewChart: hits or data is not an array', { hits, data });
    return null;
  }

  const hitsId = new Set(hits.map(({ key }) => key));

  const hitsData = countItems(hits.map(({ year }) => year.toString()));
  const noHitsData = countItems(
    data.filter(({ key }) => !hitsId.has(key)).map(({ year }) => year.toString())
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
            const colorMap: Record<string, string> = {
              count: isHovered ? theme.colors.indigo[4] : theme.colors.indigo[2],
              count2: isHovered ? theme.colors.indigo[3] : theme.colors.indigo[1],
              count3: isHovered ? theme.colors.indigo[3] : theme.colors.indigo[1],
            };
            return colorMap[x.id as string] || theme.colors.indigo[2];
          }

          const colorMap: Record<string, string> = {
            count: isHovered ? "#9FA0A2" : "#BFBFC1",
            count2: isHovered ? "#D0D0D2" : "#EAEAEC",
            count3: isHovered ? "#D0D0D2" : "#EAEAEC",
          };
          return colorMap[x.id as string] || "#BFBFC1";
        }}
        axisBottom={{
          tickValues: selectNiceTicks(procData as ChartDataItem[], 5, 1, 1),
        }}
        data={procData as ChartDataItem[]}
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

interface DowChartProps {
  data: ProcessedDataItem[];
}

const DowChart = ({ data }: DowChartProps) => {
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
        data={dataDow as ChartDataItem[]}
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

export type { ChartDataItem };
