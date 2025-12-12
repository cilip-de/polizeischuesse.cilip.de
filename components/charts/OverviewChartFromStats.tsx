import { useMantineTheme } from "@mantine/core";
import { ResponsiveBar } from "@nivo/bar";
import dayjs from "dayjs";
import { useState } from "react";
import { ticks } from "d3-array";
import type { YearCount } from "../../lib/hooks/useStats";
import { ChartTooltip } from "./ChartTooltip";

type ChartDataItem = {
  value: string;
  count: number;
  count2: number;
} & Record<string, string | number>;

interface OverviewChartFromStatsProps {
  yearCounts: YearCount[];
  onClick: (year: number) => void;
}

const selectNiceTicks = (
  data: ChartDataItem[],
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

export const OverviewChartFromStats = ({ yearCounts, onClick }: OverviewChartFromStatsProps) => {
  const theme = useMantineTheme();
  const [hoveredBar, setHoveredBar] = useState<{ indexValue: string; id: string } | null>(null);

  if (!yearCounts || yearCounts.length === 0) {
    return null;
  }

  // Transform yearCounts into chart data
  // count = hits (matching filter)
  // count2 = non-hits (total - hits)
  const chartData: ChartDataItem[] = yearCounts
    .map((yc) => ({
      value: String(yc.year),
      count: yc.hits,
      count2: yc.total - yc.hits,
    }))
    .sort((a, b) => parseInt(a.value) - parseInt(b.value));

  const tooltipOverview = ({
    value,
    data,
    id,
  }: {
    value: number;
    data: ChartDataItem;
    id: string | number;
  }) => {
    const isHit = String(id) === "count";
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
            };
            return colorMap[x.id as string] || theme.colors.indigo[2];
          }

          const colorMap: Record<string, string> = {
            count: isHovered ? "#9FA0A2" : "#BFBFC1",
            count2: isHovered ? "#D0D0D2" : "#EAEAEC",
          };
          return colorMap[x.id as string] || "#BFBFC1";
        }}
        axisBottom={{
          tickValues: selectNiceTicks(chartData, 5, 1, 1),
        }}
        data={chartData}
        indexBy="value"
        keys={["count", "count2"]}
        tooltip={tooltipOverview}
        onClick={(datum) => onClick(parseInt(datum.indexValue as string))}
        onMouseEnter={(datum, event) => {
          event.currentTarget.style.cursor = "pointer";
          setHoveredBar({ indexValue: datum.indexValue as string, id: datum.id as string });
        }}
        onMouseLeave={() => setHoveredBar(null)}
      />
    </div>
  );
};
