import { Text } from "@mantine/core";
import React from "react";

interface ChartTooltipProps {
  // Primary label (e.g., "Jahr", "Stadt", "Bundesland")
  primaryLabel?: string;
  primaryValue?: string | number;

  // Secondary label (dynamic, from tooltipLabel or series)
  secondaryLabel: string;
  secondaryValue: number;

  // Optional configurations
  valueFormatter?: (value: number) => string;
  showPercentage?: boolean;
  singularUnit?: string; // e.g., "Fall", "Schuss", "Opfer"
  pluralUnit?: string; // e.g., "Fälle", "Schüsse", "Opfer"
  customContent?: React.ReactNode; // For special cases
  mobileFixed?: boolean; // If true, position fixed at bottom on mobile
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
  valueFormatter,
  showPercentage = false,
  singularUnit = "Fall",
  pluralUnit = "Fälle",
  customContent,
  mobileFixed = false,
}) => {
  const formatValue = (val: number) => {
    if (valueFormatter) return valueFormatter(val);
    if (showPercentage) return `${Math.round(val * 10) / 10}%`;
    return val.toLocaleString("de-DE");
  };

  const getUnit = (val: number) => {
    return val === 1 ? singularUnit : pluralUnit;
  };

  return (
    <div
      style={{
        background: "white",
        padding: "0.3rem 0.5rem",
        opacity: 0.95,
        whiteSpace: "nowrap",
        maxWidth: "300px",
        fontSize: "0.85rem",
        ...(mobileFixed ? {
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        } : {}),
      }}
    >
      {primaryLabel && primaryValue !== undefined && (
        <div>
          <strong>{primaryLabel}:</strong> {primaryValue}
        </div>
      )}
      <div>
        <strong>{secondaryLabel}:</strong> {formatValue(secondaryValue)}{" "}
        {!showPercentage && getUnit(secondaryValue)}
        {customContent}
      </div>
    </div>
  );
};

// Adapter for Bar Charts (Nivo ResponsiveBar)
export const barChartTooltip = ({
  value,
  data,
  id,
  primaryLabelKey = "Jahr",
  singularUnit = "Fall",
  pluralUnit = "Fälle",
}: {
  value: number;
  data: any;
  id: string;
  primaryLabelKey?: string;
  singularUnit?: string;
  pluralUnit?: string;
}) => (
  <ChartTooltip
    primaryLabel={primaryLabelKey}
    primaryValue={data.value}
    secondaryLabel={data.tooltipLabel?.[id] || "Anzahl"}
    secondaryValue={value}
    singularUnit={singularUnit}
    pluralUnit={pluralUnit}
  />
);

// Adapter for Line Charts (Nivo ResponsiveLine)
export const lineChartTooltip = ({
  point,
  primaryLabelKey = "Jahr",
  singularUnit = "Fall",
  pluralUnit = "Fälle",
}: {
  point: any;
  primaryLabelKey?: string;
  singularUnit?: string;
  pluralUnit?: string;
}) => (
  <ChartTooltip
    primaryLabel={primaryLabelKey}
    primaryValue={point.data.x}
    secondaryLabel={point.seriesId.replace(/"/g, "")}
    secondaryValue={point.data.y}
    singularUnit={singularUnit}
    pluralUnit={pluralUnit}
  />
);

// Adapter for HeatMaps (Nivo ResponsiveHeatMap)
export const heatMapTooltip = ({
  data,
  customContent,
}: {
  data: any;
  customContent?: React.ReactNode;
}) => (
  <ChartTooltip
    primaryLabel={data.cell.serieId}
    primaryValue=""
    secondaryLabel={data.cell.data.x}
    secondaryValue={data.cell.value}
    showPercentage={true}
    customContent={customContent}
  />
);

// Adapter for simple bar charts without id parameter
export const simpleBarChartTooltip = ({
  value,
  data,
  primaryLabelKey = "Jahr",
  secondaryLabelKey = "Anzahl",
  singularUnit = "Fall",
  pluralUnit = "Fälle",
}: {
  value: number;
  data: any;
  primaryLabelKey?: string;
  secondaryLabelKey?: string;
  singularUnit?: string;
  pluralUnit?: string;
}) => (
  <ChartTooltip
    primaryLabel={primaryLabelKey}
    primaryValue={data.value}
    secondaryLabel={secondaryLabelKey}
    secondaryValue={value}
    singularUnit={singularUnit}
    pluralUnit={pluralUnit}
  />
);

// Adapter for Percentage Charts
export const percentageTooltip = ({
  value,
  data,
  label = "Anteil",
}: {
  value: number;
  data: any;
  label?: string;
}) => (
  <ChartTooltip
    primaryLabel=""
    primaryValue={data.value}
    secondaryLabel={label}
    secondaryValue={value * 100}
    valueFormatter={(val) => `${Math.round(val * 10) / 10} %`}
    singularUnit="der Fälle"
    pluralUnit="der Fälle"
  />
);
