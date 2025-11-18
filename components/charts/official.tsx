import { Space } from "@mantine/core";
import _ from "lodash";
import AnchorHeading from "../AnchorHeading";
import { VerticalBarChart, ChartDataItem } from "./charts";
import { barChartTooltip, TooltipData } from "./ChartTooltip";

const ShortsPerYear = ({ wData }: { wData: ChartDataItem[] }) => {
  const sums = wData.map((x: ChartDataItem) => x.count + (typeof x.count2 === 'number' ? x.count2 : 0) + (typeof x.count3 === 'number' ? x.count3 : 0));

  const maxValues = Math.max(...sums);

  const realMax = Math.ceil(maxValues / 100) * 100;

  const tickValues = [0, realMax / 2, realMax];

  return (
    <div>
      <AnchorHeading order={3} ta="center" id="polizeischuesse-gesamt">
        Polizeischüsse {wData[wData.length - 1].value}–{wData[0].value}
      </AnchorHeading>
      <Space h="lg" />

      <VerticalBarChart
        data={_.orderBy(wData, "value")}
        numTicks={5}
        labelSkipWidth={20}
        axisLeft={{
          tickValues: tickValues,
        }}
        gridYValues={tickValues}
        margin={{
          top: 10,
          right: 150,
          bottom: 100,
          left: 50,
        }}
        tooltip={barChartTooltip({
          singularUnit: "Schuss",
          pluralUnit: "Schüsse",
        })}
      />
      <VerticalBarChart
        data={_.orderBy(wData, "value")}
        labelSkipWidth={20}
        labelSkipHeight={20}
        numTicks={5}
        mobile
        tooltip={barChartTooltip({
          singularUnit: "Schuss",
          pluralUnit: "Schüsse",
        })}
      />
      <Space h="lg" />
      <Space h="lg" />
    </div>
  );
};

const SimpleChart = ({
  data,
  title,
  style,
}: {
  data: ChartDataItem[];
  title: string;
  style?: React.CSSProperties;
}) => {
  const sums = data.map((x: ChartDataItem) => x.count);
  const maxValues = Math.max(...sums);

  const digits = maxValues.toString().length;
  const maxValuesRounded = Math.pow(10, digits - 1);

  const realMax = Math.ceil(maxValues / maxValuesRounded) * maxValuesRounded;

  const tickValues = [0, realMax / 2, realMax];

  // Generate ID from title
  const id = title
    .toLowerCase()
    .replace(/[äöü]/g, (m) => ({ ä: "ae", ö: "oe", ü: "ue" }[m] || m))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <div style={style}>
      <AnchorHeading order={3} ta="center" id={id}>
        {title}{" "}
        <span style={{ whiteSpace: "nowrap" }}>
          {data[data.length - 1].value}–{data[0].value}
        </span>
      </AnchorHeading>
      <Space h="lg" />

      <VerticalBarChart
        data={_.orderBy(data, "value")}
        numTicks={5}
        labelSkipWidth={20}
        labelSkipHeight={20}
        axisLeft={{
          tickValues: tickValues,
        }}
        gridYValues={tickValues}
        margin={{
          top: 10,
          right: 150,
          bottom: 100,
          left: 50,
        }}
        tooltip={barChartTooltip()}
      />
      <VerticalBarChart
        data={_.orderBy(data, "value")}
        labelSkipWidth={20}
        labelSkipHeight={20}
        numTicks={5}
        mobile
        tooltip={barChartTooltip()}
      />
      <Space h="lg" />
      <Space h="lg" />
    </div>
  );
};

export { ShortsPerYear, SimpleChart };
