import { colors } from "../../lib/colors";
import { ResponsiveBar } from "@nivo/bar";
import dayjs from "dayjs";
import { useState } from "react";
import type { YearCount } from "../../lib/hooks/useStats";
import { ChartTooltip } from "./ChartTooltip";
import { useIsMobile } from "../../lib/hooks/useIsMobile";

type ChartDataItem = {
  value: string;
  count: number;
  count2: number;
} & Record<string, string | number>;

interface OverviewChartFromStatsProps {
  yearCounts: YearCount[];
  onClick: (year: number) => void;
}

const selectEvenTicks = (
  data: ChartDataItem[],
  numTicks: number,
  startOffset = 0,
  endOffset = 0
): Set<string> => {
  const first = startOffset;
  const last = data.length - 1 - endOffset;
  if (numTicks <= 1 || last <= first) return new Set([data[first].value, data[last].value]);
  const indices = [first];
  for (let i = 1; i < numTicks; i++) {
    indices.push(Math.round(first + (i * (last - first)) / numTicks));
  }
  indices.push(last);
  return new Set(indices.map((i) => data[i].value));
};

export const OverviewChartFromStats = ({ yearCounts, onClick }: OverviewChartFromStatsProps) => {
  const [hoveredBar, setHoveredBar] = useState<{ indexValue: string; id: string } | null>(null);
  const isMobile = useIsMobile();

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

  const visibleTicks = selectEvenTicks(chartData, isMobile ? 2 : 4, 1, 1);

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
              count: isHovered ? colors.indigo[4] : colors.indigo[2],
              count2: isHovered ? colors.indigo[3] : colors.indigo[1],
            };
            return colorMap[x.id as string] || colors.indigo[2];
          }

          const colorMap: Record<string, string> = {
            count: isHovered ? "#9FA0A2" : "#BFBFC1",
            count2: isHovered ? "#D0D0D2" : "#EAEAEC",
          };
          return colorMap[x.id as string] || "#BFBFC1";
        }}
        axisBottom={{
          renderTick: (tick) => {
            if (!visibleTicks.has(tick.value as string)) return <g />;
            return (
              <g transform={`translate(${tick.x},${tick.y})`}>
                <line y2={6} stroke="#ccc" />
                <text
                  y={16}
                  textAnchor="middle"
                  style={{ fontSize: 11, fill: "#333" }}
                >
                  {tick.value}
                </text>
              </g>
            );
          },
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
