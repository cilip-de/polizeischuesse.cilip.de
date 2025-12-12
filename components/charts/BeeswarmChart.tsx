import { useMantineTheme, Badge } from "@mantine/core";
import * as d3Scale from "d3-scale";
import * as d3Force from "d3-force";
import { useMemo, useState, useRef, useEffect } from "react";
import type { ProcessedDataItem } from "../../lib/data";
import Link from "next/link";

interface BeeswarmChartProps {
  data: ProcessedDataItem[];
  mobile?: boolean;
}

// Data item with Date field for beeswarm chart (separate from ProcessedDataItem's index signature)
interface BeeswarmDataItem {
  datum: Date;
  dayOfYear: number;
  Name: string;
  Fall: string;
  datePrint: string;
  year: number;
  Ort: string;
  Bundesland: string;
  Szenarium: string;
  age: number | string;
  sex: string;
  schusswechsel: boolean;
  sek: boolean;
  vgbeamte: boolean;
  vbaktion: boolean;
  psych: boolean;
  alkdrog: boolean;
  famgew: boolean;
  unschuss: boolean;
  indoor: boolean;
  men: boolean;
}

interface BeeswarmNode extends d3Force.SimulationNodeDatum, BeeswarmDataItem {}

interface TooltipState {
  show: boolean;
  x: number;
  y: number;
  data: {
    datePrint: string;
    Name: string;
    Fall: string;
    Ort: string;
    Bundesland: string;
    Szenarium: string;
    age: number | string;
    sex: string;
    tags: { label: string; color: string }[];
  } | null;
}

// Calculate day of year (1-365)
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Tag configuration matching Case.tsx
const TAG_CONFIG: { [key: string]: { label: string; color: string } } = {
  schusswechsel: { label: "Schusswechsel", color: "pink" },
  sek: { label: "SEK-Beteiligung", color: "grape" },
  vgbeamte: { label: "Verletzte/getötete Beamte", color: "violet" },
  vbaktion: { label: "Vorbereitete Polizeiaktion", color: "indigo" },
  psych: { label: "Mutm. psych. Ausnahmesituation", color: "blue" },
  alkdrog: { label: "Mutm. Alkohol- o. Drogenkonsum", color: "cyan" },
  famgew: { label: "Mutm. famil. oder häusl. Gewalt", color: "teal" },
  unschuss: { label: "Unbeabsichtigte Schussabgabe", color: "green" },
  indoor: { label: "Innenraum", color: "lime" },
};

const BeeswarmChart: React.FC<BeeswarmChartProps> = ({ data, mobile = false }) => {
  const theme = useMantineTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    x: 0,
    y: 0,
    data: null,
  });
  const [isPinned, setIsPinned] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Process data: group by year
  const groupedData = useMemo(() => {
    const parsed: BeeswarmDataItem[] = data.map((item) => {
      const datum = new Date(item.Datum);
      return {
        datum,
        dayOfYear: getDayOfYear(datum),
        Name: item.Name,
        Fall: item.Fall,
        datePrint: item.datePrint,
        year: item.year,
        Ort: item.Ort,
        Bundesland: item.Bundesland,
        Szenarium: item.Szenarium,
        age: item.age,
        sex: item.sex,
        schusswechsel: item.schusswechsel,
        sek: item.sek,
        vgbeamte: item.vgbeamte,
        vbaktion: item.vbaktion,
        psych: item.psych,
        alkdrog: item.alkdrog,
        famgew: item.famgew,
        unschuss: item.unschuss,
        indoor: item.indoor,
        men: item.men,
      };
    });

    // Group by year
    const groups: { [key: number]: BeeswarmDataItem[] } = {};
    parsed.forEach((d) => {
      if (!groups[d.year]) groups[d.year] = [];
      groups[d.year].push(d);
    });

    return groups;
  }, [data]);

  const allYears = useMemo(
    () => Object.keys(groupedData).sort((a, b) => Number(b) - Number(a)),
    [groupedData]
  );

  const displayedYears = useMemo(
    () => showAll ? allYears : allYears.slice(0, 10),
    [allYears, showAll]
  );

  // Chart dimensions
  const width = mobile ? 350 : 750;
  const margin = { top: 4, right: 10, bottom: 8, left: mobile ? 38 : 42 };
  const radius = mobile ? 4 : 5.5;

  // Month labels
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const monthDays = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

  // Handle click outside to close tooltip
  useEffect(() => {
    if (tooltip.show && (mobile || isPinned)) {
      const handleClick = (e: MouseEvent) => {
        if (svgRef.current && !svgRef.current.contains(e.target as Node)) {
          setTooltip({ show: false, x: 0, y: 0, data: null });
          setIsPinned(false);
        }
      };
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [mobile, tooltip.show, isPinned]);

  const handleToggleShowAll = () => {
    const newShowAll = !showAll;
    setShowAll(newShowAll);

    // Scroll to top of chart when collapsing
    if (!newShowAll && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div ref={containerRef} className={mobile ? "only-mobile" : "only-non-mobile"} style={{ paddingTop: mobile ? "0.5rem" : "0.75rem", paddingBottom: mobile ? "1.5rem" : "2rem" }}>
      {/* Month header */}
      <div
        style={{
          position: "relative",
          height: mobile ? "12px" : "16px",
          marginBottom: "4px",
          marginLeft: margin.left,
          width: width - margin.left - margin.right,
        }}
      >
        {months.map((m, i) => (
          <span
            key={m + i}
            style={{
              position: "absolute",
              left: `${(monthDays[i] / 365) * 100}%`,
              fontSize: mobile ? "10px" : "12px",
              color: "#adb5bd",
            }}
          >
            {m}
          </span>
        ))}
      </div>

      {/* Beeswarm rows */}
      <div>
        {displayedYears.map((year) => {
          const yearData = groupedData[Number(year)];
          const rowHeight = mobile ? 36 : 50;

          return (
            <BeeswarmRow
              key={year}
              year={Number(year)}
              data={yearData}
              width={width}
              height={rowHeight}
              margin={margin}
              radius={radius}
              theme={theme}
              mobile={mobile}
              tooltip={tooltip}
              setTooltip={setTooltip}
              svgRef={svgRef}
              isPinned={isPinned}
              setIsPinned={setIsPinned}
            />
          );
        })}
      </div>

      {/* Expand/collapse button */}
      {allYears.length > 10 && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            onClick={handleToggleShowAll}
            style={{
              padding: mobile ? "0.5rem 1rem" : "0.6rem 1.2rem",
              fontSize: mobile ? "0.85rem" : "0.9rem",
              background: "white",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              color: theme.colors.blue[6],
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {showAll ? "Weniger anzeigen" : `Alle ${allYears.length} Jahre anzeigen`}
          </button>
        </div>
      )}

      {/* Tooltip */}
      {tooltip.show && tooltip.data && (
        <div
          style={{
            position: "fixed",
            ...(mobile
              ? {
                  bottom: "20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 1000,
                }
              : {
                  left: tooltip.x + 10,
                  top: tooltip.y - 10,
                  pointerEvents: isPinned ? "auto" : "none",
                  zIndex: 1000,
                }),
            background: "white",
            padding: "0.5rem 0.65rem",
            opacity: 0.95,
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            fontSize: "0.85rem",
            maxWidth: mobile ? "320px" : "350px",
            lineHeight: "1.5",
          }}
        >
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.5rem" }}>
            {/* Left column: Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, marginBottom: "0.35rem", fontSize: "0.9rem" }}>
                {tooltip.data.Name && tooltip.data.Name !== "N.N." ? tooltip.data.Name : "N.N."}
              </div>
              <div style={{ fontSize: "0.8rem", color: theme.colors.gray[7], marginBottom: "0.15rem" }}>
                {(tooltip.data.age && tooltip.data.age !== "N.N." && `${tooltip.data.age} Jahre`) || ""}
                {tooltip.data.age && tooltip.data.age !== "N.N." && tooltip.data.sex && tooltip.data.sex !== "N.N." && ", "}
                {(tooltip.data.sex && tooltip.data.sex !== "N.N." && tooltip.data.sex) || ""}
              </div>
              <div style={{ fontSize: "0.8rem", color: theme.colors.gray[6], marginBottom: "0.15rem" }}>
                {tooltip.data.datePrint}
              </div>
              {tooltip.data.Ort && (
                <div style={{ fontSize: "0.8rem", color: theme.colors.gray[6] }}>
                  {tooltip.data.Ort}
                  {tooltip.data.Bundesland && tooltip.data.Bundesland !== tooltip.data.Ort && `, ${tooltip.data.Bundesland}`}
                </div>
              )}
            </div>

            {/* Right column: Tags */}
            {tooltip.data.tags && tooltip.data.tags.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "flex-end" }}>
                {tooltip.data.tags.map((tag, i) => (
                  <Badge key={i} size="xs" color={tag.color} variant="light">
                    {tag.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          {tooltip.data.Szenarium && tooltip.data.Szenarium.trim() && (
            <div
              style={{
                marginTop: "0.5rem",
                paddingTop: "0.5rem",
                borderTop: `1px solid ${theme.colors.gray[3]}`,
                fontSize: "0.85rem",
                color: theme.colors.dark[9],
                lineHeight: "1.5",
              }}
            >
              {tooltip.data.Szenarium.length > 150
                ? tooltip.data.Szenarium.substring(0, 150) + "..."
                : tooltip.data.Szenarium}
            </div>
          )}
          <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: `1px solid ${theme.colors.gray[3]}` }}>
            <Link
              href={`/fall/${tooltip.data.Fall}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: theme.colors.blue[6],
                textDecoration: "none",
                fontSize: "0.85rem",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              → Weitere Details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

interface BeeswarmRowProps {
  year: number;
  data: BeeswarmDataItem[];
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  radius: number;
  theme: any;
  mobile: boolean;
  tooltip: TooltipState;
  setTooltip: (state: TooltipState) => void;
  svgRef: React.RefObject<SVGSVGElement>;
  isPinned: boolean;
  setIsPinned: (pinned: boolean) => void;
}

const BeeswarmRow: React.FC<BeeswarmRowProps> = ({
  year,
  data,
  width,
  height,
  margin,
  radius,
  theme,
  mobile,
  tooltip,
  setTooltip,
  svgRef,
  isPinned,
  setIsPinned,
}) => {
  const xScale = useMemo(
    () =>
      d3Scale
        .scaleLinear()
        .domain([1, 365])
        .range([margin.left, width - margin.right]),
    [margin.left, margin.right, width]
  );

  const nodes = useMemo(() => {
    const centerY = height / 2;

    const nodeData: BeeswarmNode[] = data.map((d) => ({
      datum: d.datum,
      Name: d.Name,
      Fall: d.Fall,
      datePrint: d.datePrint,
      dayOfYear: d.dayOfYear,
      year: d.year,
      Ort: d.Ort,
      Bundesland: d.Bundesland,
      Szenarium: d.Szenarium,
      age: d.age,
      sex: d.sex,
      schusswechsel: d.schusswechsel,
      sek: d.sek,
      vgbeamte: d.vgbeamte,
      vbaktion: d.vbaktion,
      psych: d.psych,
      alkdrog: d.alkdrog,
      famgew: d.famgew,
      unschuss: d.unschuss,
      indoor: d.indoor,
      men: d.men,
      x: xScale(d.dayOfYear),
      y: centerY,
    }));

    const simulation = d3Force
      .forceSimulation(nodeData)
      .force("x", d3Force.forceX((d: any) => xScale(d.dayOfYear)).strength(1))
      .force("y", d3Force.forceY(centerY).strength(0.3))
      .force("collide", d3Force.forceCollide(radius + 0.5))
      .stop();

    for (let i = 0; i < 100; i++) simulation.tick();

    return simulation.nodes() as BeeswarmNode[];
  }, [data, xScale, height, radius]);

  const getTooltipData = (d: BeeswarmNode) => {
    // Extract active tags with colors
    const activeTags: { label: string; color: string }[] = [];
    const tagKeys = ["schusswechsel", "sek", "vgbeamte", "vbaktion", "psych", "alkdrog", "famgew", "unschuss", "indoor"];
    tagKeys.forEach((key) => {
      if (d[key as keyof BeeswarmNode]) {
        activeTags.push(TAG_CONFIG[key]);
      }
    });

    return {
      datePrint: d.datePrint,
      Name: d.Name,
      Fall: d.Fall,
      Ort: d.Ort,
      Bundesland: d.Bundesland,
      Szenarium: d.Szenarium,
      age: d.age,
      sex: d.sex,
      tags: activeTags,
    };
  };

  const handleClick = (
    event: React.MouseEvent<SVGCircleElement>,
    d: BeeswarmNode
  ) => {
    event.stopPropagation();
    const rect = (event.target as SVGCircleElement).getBoundingClientRect();

    if (mobile) {
      // Mobile: click to show
      setTooltip({
        show: true,
        x: 0,
        y: 0,
        data: getTooltipData(d),
      });
    } else {
      // Desktop: click to pin/unpin
      setIsPinned(!isPinned);
      setTooltip({
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.top,
        data: getTooltipData(d),
      });
    }
  };

  const handleMouseEnter = (
    event: React.MouseEvent<SVGCircleElement>,
    d: BeeswarmNode
  ) => {
    if (!mobile && !isPinned) {
      const rect = (event.target as SVGCircleElement).getBoundingClientRect();
      setTooltip({
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.top,
        data: getTooltipData(d),
      });
    }
  };

  const handleMouseLeave = () => {
    if (!mobile && !isPinned) {
      setTooltip({ show: false, x: 0, y: 0, data: null });
    }
  };

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ display: "block" }}
      role="img"
      aria-label={`Fälle im Jahr ${year}: ${data.length} Fälle`}
    >
      {/* Year label */}
      <text
        x={margin.left - 4}
        y={height / 2}
        textAnchor="end"
        dominantBaseline="middle"
        fontSize={mobile ? "9" : "10"}
        fontWeight="500"
        fill="#64748b"
      >
        {year}
      </text>

      {/* Baseline */}
      <line
        x1={margin.left}
        x2={width - margin.right}
        y1={height / 2}
        y2={height / 2}
        stroke="#f1f5f9"
        strokeWidth="1"
      />

      {/* Data points */}
      {nodes.map((d, i) => {
        const yPos = Math.min(
          Math.max(d.y || 0, margin.top + radius),
          height - margin.bottom - radius
        );
        return (
          <circle
            key={i}
            cx={d.x}
            cy={yPos}
            r={radius}
            fill={theme.colors.indigo[2]}
            fillOpacity={0.8}
            stroke="#fff"
            strokeWidth={0.5}
            style={{ cursor: "pointer" }}
            onMouseEnter={(e) => handleMouseEnter(e, d)}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => handleClick(e, d)}
          />
        );
      })}
    </svg>
  );
};

export default BeeswarmChart;
