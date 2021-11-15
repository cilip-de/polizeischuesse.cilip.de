import { ResponsiveLine } from "@nivo/line";
import _ from "lodash";
import { countItems } from "../lib/data";
import { addMissingYears } from "../lib/util";

const WeaponChart = ({ data }) => {
  const doData = (tag) => {
    const step1 = addMissingYears(
      data,
      countItems(
        data
          .filter(({ weapon }) => weapon.includes(tag))
          .map(({ year }) => year)
      )
    ).map((x) => ({ x: parseInt(x.value), y: x.count }));

    return _.orderBy(step1, "x");
  };

  const schussData = doData("Schusswaffe");
  const stichData = doData("Stichwaffe");
  const gasData = doData("Gas-/ Schreckschusswaffe");

  const procData = [
    { id: "schuss", data: schussData },
    { id: "stich", data: stichData },
    { id: "gas", data: gasData },
  ];

  return (
    <div style={{ height: "300px" }}>
      <ResponsiveLine
        data={procData}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          reverse: false,
        }}
        axisBottom={{
          tickValues: [2000, 2020],
        }}
        gridYValues={[0, 5, 10, 13]}
        yFormat=" >-.2f"
        enableGridX={false}
        // pointSize={10}
        // pointColor={{ theme: "background" }}
        // pointBorderWidth={2}
        // pointBorderColor={{ from: "serieColor" }}
        // pointLabelYOffset={-12}
        // useMesh={true}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: "rgba(0, 0, 0, .5)",
            effects: [
              {
                on: "hover",
                style: {
                  itemBackground: "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </div>
  );
};

export default WeaponChart;
