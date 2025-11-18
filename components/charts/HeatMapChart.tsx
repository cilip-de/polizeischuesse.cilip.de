import { Center, Text, useMantineTheme } from "@mantine/core";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import _ from "lodash";
import { useState, useEffect, useRef } from "react";
import { ProcessedDataItem } from "../../lib/data";
import { ChartTooltip } from "./ChartTooltip";

interface HeatMapChartProps {
  data: ProcessedDataItem[];
  mobile?: boolean;
}

interface HeatMapCellData {
  x: string;
  y: number;
}

interface HeatMapSerieData {
  id: string;
  data: HeatMapCellData[];
}

const HeatMapChart = ({ data, mobile = false }: HeatMapChartProps) => {
  const [activeCell, setActiveCell] = useState<{ serieId: string; x: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveCell(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobile]);
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

  const boolData = (data: ProcessedDataItem[]) =>
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
          (data.filter((d) => (d[x] as string).includes("Ja")).length / data.length) * 100,
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
      ...Object.assign({}, ...boolData(state)),
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

  const ansFixed: HeatMapSerieData[] = ans.map((x) => {
    return {
      id: x.state,
      data: keys.map((key) => ({ x: key, y: (x as Record<string, number>)[key] || 0 })),
    };
  });

  // console.log(ansFixed);

  return (
    <div
      ref={containerRef}
      style={{ height: mobile ? "600px" : "800px", position: "relative" }}
      className={mobile ? "only-mobile" : "only-non-mobile"}
      role="img"
      aria-label="Heatmap-Diagramm zeigt prozentuale Verteilung von Merkmalen polizeilicher Todesschüsse nach Bundesland"
      onClick={mobile ? () => setActiveCell(null) : undefined}
    >
      {mobile && activeCell && (
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
          <div><strong>{activeCell.serieId}</strong></div>
          <div>{activeCell.x}</div>
          <div>
            {(() => {
              const cellData = ansFixed.find(serie => serie.id === activeCell.serieId)
                ?.data.find(d => d.x === activeCell.x);
              const count = perStateCounts[activeCell.serieId.replace("Mecklenburg-Vorp.", "Mecklenburg-Vorpommern")];
              return cellData ? (
                <>
                  <strong>{cellData.y}%</strong> der {count} {count === 1 ? 'Fälle' : 'Fälle'}
                </>
              ) : '';
            })()}
          </div>
        </div>
      )}
      <ResponsiveHeatMap
        data={ansFixed}
        margin={{
          top: mobile ? 280 : 250,
          right: 0,
          bottom: 30,
          left: mobile ? 120 : 60,
        }}
        forceSquare={true}
        colors={{
          type: "quantize",
          colors: theme.colors.indigo as any,
          minValue: 0,
          maxValue: 100,
        } as any}
        axisTop={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: mobile ? -90 : -45,
          legend: "",
        }}
        axisRight={null}
        axisBottom={null}
        opacity={1}
        inactiveOpacity={0.5}
        labelTextColor={(x) => {
          // console.log(x);
          return (x.value ?? 0) > 50 ? "whitesmoke" : "black";
        }}
        animate={true}
        motionConfig="gentle"
        hoverTarget="cell"
        isInteractive={true}
        onClick={mobile ? (cell, event) => {
          event.stopPropagation();
          if (activeCell?.serieId === cell.serieId && activeCell?.x === cell.data.x) {
            setActiveCell(null);
          } else {
            setActiveCell({ serieId: cell.serieId, x: cell.data.x });
          }
        } : undefined}
        borderWidth={mobile ? 3 : 0}
        borderColor={mobile ? "#000" : "transparent"}
        tooltip={mobile ? () => null : (data) => {
          const count = perStateCounts[data.cell.serieId.replace("Mecklenburg-Vorp.", "Mecklenburg-Vorpommern")];
          return (
            <ChartTooltip
              primaryLabel="Land"
              primaryValue={data.cell.serieId}
              secondaryLabel={data.cell.data.x}
              secondaryValue={data.cell.value ?? 0}
              valueFormatter={(val) => `${val}% der ${count}`}
              singularUnit="Fälle"
              pluralUnit="Fälle"
            />
          );
        }}
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
