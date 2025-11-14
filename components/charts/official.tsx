import { Space, Text } from "@mantine/core";
import _ from "lodash";
import AnchorHeading from "../AnchorHeading";
import { VerticalBarChart } from "./charts";

const ShortsPerYear = ({ wData }) => {
  const sums = wData.map((x) => x.count + x.count2 + x.count3);

  const maxValues = Math.max(...sums);

  const realMax = Math.ceil(maxValues / 100) * 100;

  const tickValues = [0, realMax / 2, realMax];

  return (
    <div>
      <AnchorHeading order={3} align="center" id="polizeischuesse-gesamt">
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
        tooltip={({ value, data, id }) => (
          <div>
            <Text
              size="sm"
              style={{
                background: "white",
                padding: "0.3rem 0.5rem",
                opacity: 0.95,
              }}
            >
              <strong>Jahr:</strong> {data.value}
              <br />
              <strong>
                {data.tooltipLabel ? data.tooltipLabel[id] : "Anzahl"}:
              </strong>{" "}
              {value} {value === 1 ? "Schuss" : "Schüsse"}
            </Text>
          </div>
        )}
      />
      <VerticalBarChart
        data={_.orderBy(wData, "value")}
        labelSkipWidth={20}
        labelSkipHeight={20}
        numTicks={5}
        mobile
        tooltip={({ value, data, id }) => (
          <div>
            <Text
              size="sm"
              style={{
                background: "white",
                padding: "0.3rem 0.5rem",
                opacity: 0.95,
              }}
            >
              <strong>Jahr:</strong> {data.value}
              <br />
              <strong>
                {data.tooltipLabel ? data.tooltipLabel[id] : "Anzahl"}:
              </strong>{" "}
              {value} {value === 1 ? "Schuss" : "Schüsse"}
            </Text>
          </div>
        )}
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
  data: any[];
  title: string;
  style?: React.CSSProperties;
}) => {
  const sums = data.map((x) => x.count);
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
      <AnchorHeading order={3} align="center" id={id}>
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
        tooltip={({ value, data }) => (
          <div>
            <Text
              size="sm"
              style={{
                background: "white",
                padding: "0.3rem 0.5rem",
                opacity: 0.95,
              }}
            >
              <strong>Jahr:</strong> {data.value}
              <br />
              <strong>Anzahl:</strong> {value.toLocaleString("de-DE")}{" "}
              {value === 1 ? "Fall" : "Fälle"}
            </Text>
          </div>
        )}
      />
      <VerticalBarChart
        data={_.orderBy(data, "value")}
        labelSkipWidth={20}
        labelSkipHeight={20}
        numTicks={5}
        mobile
        tooltip={({ value, data }) => (
          <div>
            <Text
              size="sm"
              style={{
                background: "white",
                padding: "0.3rem 0.5rem",
                opacity: 0.95,
              }}
            >
              <strong>Jahr:</strong> {data.value}
              <br />
              <strong>Anzahl:</strong> {value.toLocaleString("de-DE")}{" "}
              {value === 1 ? "Fall" : "Fälle"}
            </Text>
          </div>
        )}
      />
      <Space h="lg" />
      <Space h="lg" />
    </div>
  );
};

export { ShortsPerYear, SimpleChart };
