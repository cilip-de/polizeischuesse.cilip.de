// install (please make sure versions match peerDependencies)
// yarn add @nivo/core @nivo/heatmap
import { ResponsiveHeatMap } from "@nivo/heatmap";

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const MyResponsiveHeatMap = ({ data /* see data tab */ }) => (
  <ResponsiveHeatMap
    data={data}
    keys={[
      "hot dog",
      "burger",
      "sandwich",
      "kebab",
      "fries",
      "donut",
      "junk",
      "sushi",
      "ramen",
      "curry",
      "udon",
    ]}
    indexBy="country"
    margin={{ top: 100, right: 60, bottom: 60, left: 60 }}
    forceSquare={true}
    axisTop={{
      orient: "top",
      tickSize: 5,
      tickPadding: 5,
      tickRotation: -90,
      legend: "",
      legendOffset: 36,
    }}
    axisRight={null}
    axisBottom={null}
    axisLeft={{
      orient: "left",
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "country",
      legendPosition: "middle",
      legendOffset: -40,
    }}
    cellOpacity={1}
    cellBorderColor={{ from: "color", modifiers: [["darker", 0.4]] }}
    labelTextColor={{ from: "color", modifiers: [["darker", 1.8]] }}
    defs={[
      {
        id: "lines",
        type: "patternLines",
        background: "inherit",
        color: "rgba(0, 0, 0, 0.1)",
        rotation: -45,
        lineWidth: 4,
        spacing: 7,
      },
    ]}
    fill={[{ id: "lines" }]}
    animate={true}
    motionConfig="wobbly"
    motionStiffness={80}
    motionDamping={9}
    hoverTarget="cell"
    cellHoverOthersOpacity={0.25}
  />
);
