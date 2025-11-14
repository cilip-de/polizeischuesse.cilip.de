import { Center, Text, useMantineTheme } from "@mantine/core";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import _ from "lodash";

const HeatMapChart = ({ data, mobile = false }) => {
  const boolAtr = [
    "Schusswechsel",
    "Sondereinsatzbeamte",
    "Verletzte/getötete Beamte",
    "Vorbereitete Polizeiaktion",
    "Opfer mit Schusswaffe",
    "Unbeabsichtigte Schussabgabe",
    "Hinweise auf familiäre oder häusliche Gewalt",
    "Hinweise auf psychische Ausnahmesituation",
    // "Hinweise auf Alkohol- und/ oder Drogenkonsum",
    "Schussort Innenraum",
    "Schussort Außen",
  ];

  const boolData = (data: [any, ...any[]]) =>
    boolAtr
      .map((x) => ({
        [x
          .replace(
            "Hinweise auf familiäre oder häusliche Gewalt",
            "Mutm. famil. oder häusl. Gewalt"
          )
          .replace(
            "Hinweise auf Alkohol- und/ oder Drogenkonsum",
            "Mutm. Alkohol- o. Drogenkonsum"
          )
          .replace(
            "Hinweise auf psychische Ausnahmesituation",
            "Mutm. psych. Ausnahmesituation"
          )]: _.round(
          (data.filter((d) => d[x].includes("Ja")).length / data.length) * 100,
          0
        ),
      }))
      .concat([
        {
          unbewaffnet: _.round(
            (data.filter((x) => x.weapon == "").length / data.length) * 100
          ),
        },
      ]);

  const ans = _(data)
    .groupBy("state")
    .map((state, id) => ({
      state: id.replace("Mecklenburg-Vorpommern", "Mecklenburg-Vorp."),
      ...Object.assign(...boolData(state)),
    }))
    .orderBy("state")
    .value();

  const perStateCounts = _(data).countBy("state").value();

  const theme = useMantineTheme();

  const keys = boolAtr
    .map((x) =>
      x
        .replace(
          "Hinweise auf familiäre oder häusliche Gewalt",
          "Mutm. famil. oder häusl. Gewalt"
        )
        .replace(
          "Hinweise auf Alkohol- und/ oder Drogenkonsum",
          "Mutm. Alkohol- o. Drogenkonsum"
        )
        .replace(
          "Hinweise auf psychische Ausnahmesituation",
          "Mutm. psych. Ausnahmesituation"
        )
    )
    .concat("unbewaffnet");
  // console.log(ans);

  const ansFixed = ans.map((x: any) => {
    return {
      id: x.state,
      data: keys.map((key) => ({ x: key, y: x[key] })),
    };
  });

  // console.log(ansFixed);

  return (
    <div
      style={{ height: mobile ? "600px" : "800px" }}
      className={mobile ? "only-mobile" : "only-non-mobile"}
      role="img"
      aria-label="Heatmap-Diagramm zeigt prozentuale Verteilung von Merkmalen polizeilicher Todesschüsse nach Bundesland"
    >
      <ResponsiveHeatMap
        data={ansFixed}
        margin={{
          top: mobile ? 150 : 250,
          right: 0,
          bottom: 30,
          left: mobile ? 120 : 60,
        }}
        forceSquare={true}
        colors={{
          type: "quantize",
          colors: theme.colors.indigo,
          minValue: 0,
          maxValue: 100,
        }}
        axisTop={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: "",
        }}
        axisRight={null}
        axisBottom={null}
        opacity={1}
        inactiveOpacity={0.5}
        labelTextColor={(x) => {
          // console.log(x);
          return x.value > 50 ? "whitesmoke" : "black";
        }}
        animate={true}
        motionConfig="gentle"
        hoverTarget="cell"
        tooltip={(data) => (
          <div>
            <Text
              size="sm"
              style={{
                background: "white",
                padding: "0.3rem 0.5rem",
                opacity: 0.95,
              }}
            >
              <strong>{data.cell.serieId}</strong>
              <br />
              <strong>{data.cell.data.x}:</strong> {data.cell.value}% der{" "}
              {
                perStateCounts[
                  data.cell.serieId.replace(
                    "Mecklenburg-Vorp.",
                    "Mecklenburg-Vorpommern"
                  )
                ]
              }{" "}
              Fälle
            </Text>
          </div>
        )}
      />
      <Center>
        <Text>
          {`Die Werte sind mit Vorsicht zu genießen, da es in einigen Ländern nur
          wenige Fälle gibt. So z. B. in Saarland (${perStateCounts["Saarland"]}), Mecklenburg-Vorpommern
          (${perStateCounts["Mecklenburg-Vorpommern"]}) und Bremen (${perStateCounts["Bremen"]}).`}
        </Text>
      </Center>
    </div>
  );
};

export default HeatMapChart;
