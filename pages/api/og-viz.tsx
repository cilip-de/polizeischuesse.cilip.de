import { ImageResponse } from "@vercel/og";
import { parse } from "csv-parse/sync";

export const config = {
  runtime: "edge", // Same as og.tsx - works on Dokku
};

// East German states (excluding Berlin)
const eastStates = [
  "Brandenburg",
  "Mecklenburg-Vorpommern",
  "Sachsen",
  "Sachsen-Anhalt",
  "Thüringen",
];

export default async function handler() {
  try {
    // Load font same way as og.tsx
    const fontData = await fetch(
      new URL("./../../public/fonts/Inter_18pt-SemiBold.ttf", import.meta.url)
    ).then((res) => res.arrayBuffer());

    // Fetch CSV directly
    const csvUrl = "https://polizeischuesse.cilip.de/data.csv";
    const response = await fetch(csvUrl);
    const csvText = await response.text();

    // Parse CSV using csv-parse (proper handling of quotes and commas)
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
    });

    // Extract year and east/west classification
    const data = records
      .filter((row: any) => row.Fall && row.Datum && row.Bundesland)
      .map((row: any) => {
        const year = new Date(row.Datum).getFullYear();
        const isEast = eastStates.includes(row.Bundesland);
        return { year, isEast };
      })
      .filter(
        (item: any) =>
          !isNaN(item.year) && item.year > 1900 && item.year <= 2100
      );

    // Count by year and east/west
    const yearCounts: { [year: number]: { west: number; east: number } } = {};

    data.forEach(({ year, isEast }) => {
      if (!yearCounts[year]) {
        yearCounts[year] = { west: 0, east: 0 };
      }
      if (isEast) {
        yearCounts[year].east++;
      } else {
        yearCounts[year].west++;
      }
    });

    // Sort by year and filter for 1990 onwards
    const sortedYears = Object.keys(yearCounts)
      .map((y) => parseInt(y))
      .filter((y) => y >= 1990)
      .sort((a, b) => a - b);

    const chartData = sortedYears.map((year) => ({
      year: year.toString(),
      west: yearCounts[year].west,
      east: yearCounts[year].east,
    }));

    // Find max value for scaling
    const maxValue = Math.max(...chartData.map((d) => d.west + d.east));

    // Colors matching the website theme (Mantine indigo shades)
    const color1 = "#bac8ff"; // indigo[2] for west/old states (darker blue)
    const color2 = "#dbe4ff"; // indigo[1] for east/new states (lighter blue)

    const yearRange = `${chartData[0].year}–${
      chartData[chartData.length - 1].year
    }`;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage:
              // "url('https://polizeischuesse.cilip.de/images/cover_og.jpg')",
              "url('https://polizeischuesse.cilip.de/images/cover_og_logo_only.jpg')",
            padding: 0,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
              borderRadius: 8,
              padding: 30,
            }}
          >
            {/* Title */}
            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: "#1a1a1a",
                marginBottom: 20,
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
              }}
            >
              Polizeiliche Todesschüsse {yearRange}
            </div>

            {/* Legend */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 40,
                marginBottom: 30,
                fontSize: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    backgroundColor: color1,
                    marginRight: 12,
                  }}
                />
                <div>Alte Bundesländer u. Berlin</div>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    backgroundColor: color2,
                    marginRight: 12,
                  }}
                />
                <div>Neue Bundesländer ohne Berlin</div>
              </div>
            </div>

            {/* Chart - using HTML/CSS instead of SVG */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-end",
                justifyContent: "space-around",
                height: 320,
                padding: "0 40px",
                marginBottom: 30,
              }}
            >
              {chartData.map((d, index) => {
                const westPercent = (d.west / maxValue) * 100;
                const eastPercent = (d.east / maxValue) * 100;

                // Show labels for: first year, last year, and every ~7 years in between
                // This gives us roughly: 1990, 1997, 2004, 2011, 2018, 2025
                const showLabel =
                  index === 0 ||
                  index === chartData.length - 1 ||
                  index % 7 === 0;

                return (
                  <div
                    key={d.year}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                      justifyContent: "flex-end",
                      flex: 1,
                    }}
                  >
                    {/* Stacked bar */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column-reverse",
                        width: "85%",
                        marginBottom: 10,
                      }}
                    >
                      {/* West/old states */}
                      <div
                        style={{
                          backgroundColor: color1,
                          height: `${westPercent * 3.2}px`,
                          width: "100%",
                        }}
                      />
                      {/* East/new states */}
                      <div
                        style={{
                          backgroundColor: color2,
                          height: `${eastPercent * 3.2}px`,
                          width: "100%",
                        }}
                      />
                    </div>
                    {/* Year label - only show for selected years */}
                    <div
                      style={{
                        fontSize: 13,
                        color: "#333",
                        fontWeight: 500,
                        minHeight: "20px",
                      }}
                    >
                      {showLabel ? d.year : ""}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div
              style={{
                fontSize: 18,
                color: "#666",
                textAlign: "center",
                marginTop: "auto",
                display: "flex",
                justifyContent: "center",
              }}
            >
              polizeischuesse.cilip.de
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter",
            data: fontData,
            style: "normal",
          },
        ],
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    // Return a fallback error image
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8f9fa",
            fontSize: 32,
            color: "#333",
          }}
        >
          Error generating preview image
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
