import { Text } from "@mantine/core";
import React from "react";

export interface TooltipData {
  value: string | number;
  tooltipLabel?: {
    [key: string]: string;
  };
}

interface PointData {
  x: string | number;
  y: number;
}

interface Point {
  serieId: string;
  data: PointData;
}

interface HeatMapCell {
  serieId: string;
  value?: number;
  data: {
    x: string;
    y: number;
  };
}

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
// This is a factory function that returns a React component
export const barChartTooltip = (options: {
  primaryLabelKey?: string;
  singularUnit?: string;
  pluralUnit?: string;
} = {}) => {
  const {
    primaryLabelKey = "Jahr",
    singularUnit = "Fall",
    pluralUnit = "Fälle",
  } = options;

  const BarChartTooltipComponent = ({ value, data, id }: { value: number; data: TooltipData; id: string | number }) => (
    <ChartTooltip
      primaryLabel={primaryLabelKey}
      primaryValue={data.value}
      secondaryLabel={data.tooltipLabel?.[String(id)] || "Anzahl"}
      secondaryValue={value}
      singularUnit={singularUnit}
      pluralUnit={pluralUnit}
    />
  );
  BarChartTooltipComponent.displayName = 'BarChartTooltipComponent';

  return BarChartTooltipComponent;
};

// Adapter for Line Charts (Nivo ResponsiveLine)
export const lineChartTooltip = ({
  point,
  primaryLabelKey = "Jahr",
  singularUnit = "Fall",
  pluralUnit = "Fälle",
}: {
  point: Point;
  primaryLabelKey?: string;
  singularUnit?: string;
  pluralUnit?: string;
}) => (
  <ChartTooltip
    primaryLabel={primaryLabelKey}
    primaryValue={point.data.x}
    secondaryLabel={point.serieId.replace(/"/g, "")}
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
  data: { cell: HeatMapCell };
  customContent?: React.ReactNode;
}) => (
  <ChartTooltip
    primaryLabel={data.cell.serieId}
    primaryValue=""
    secondaryLabel={data.cell.data.x}
    secondaryValue={data.cell.value || 0}
    showPercentage={true}
    customContent={customContent}
  />
);

// Adapter for simple bar charts without id parameter
// This is a factory function that returns a React component
export const simpleBarChartTooltip = (options: {
  primaryLabelKey?: string;
  secondaryLabelKey?: string;
  singularUnit?: string;
  pluralUnit?: string;
} = {}) => {
  const {
    primaryLabelKey = "Jahr",
    secondaryLabelKey = "Anzahl",
    singularUnit = "Fall",
    pluralUnit = "Fälle",
  } = options;

  const SimpleBarChartTooltipComponent = ({ value, data }: { value: number; data: TooltipData }) => (
    <ChartTooltip
      primaryLabel={primaryLabelKey}
      primaryValue={data.value}
      secondaryLabel={secondaryLabelKey}
      secondaryValue={value}
      singularUnit={singularUnit}
      pluralUnit={pluralUnit}
    />
  );
  SimpleBarChartTooltipComponent.displayName = 'SimpleBarChartTooltipComponent';

  return SimpleBarChartTooltipComponent;
};

// Adapter for Percentage Charts
// This is a factory function that returns a React component
export const percentageTooltip = (options: {
  label?: string;
} = {}) => {
  const { label = "Anteil" } = options;

  const PercentageTooltipComponent = ({ value, data }: { value: number; data: TooltipData }) => (
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
  PercentageTooltipComponent.displayName = 'PercentageTooltipComponent';

  return PercentageTooltipComponent;
};
