import _ from "lodash";
import { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

const geoUrl = "/de_topo.json";

const CENTER_GERMANY = [10.4515, 51.1657];

const Map = ({ makersData, setInputPlace }) => {
  const markers = _.sortBy(
    _.uniqBy(
      makersData.map((x) => ({
        key: x.city + x.state,
        name: x.city,
        coordinates: [x["longitude"], x["latitude"]],
        count: x.count,
      })),
      "key"
    ),
    "count"
  );

  const [showMarker, setShowMarker] = useState([]);
  const debounceClear = _.debounce(() => setShowMarker([]), 10000);

  // only render on client
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) return null;

  return (
    <div
      suppressHydrationWarning
      role="img"
      aria-label={`Karte von Deutschland mit ${markers.length} markierten Orten von polizeilichen Todesschüssen. Klicken Sie auf die Markierungen um nach Ort zu filtern.`}
    >
      <ComposableMap
        projection="geoAzimuthalEqualArea"
        height={1100}
        projectionConfig={{
          rotate: [-10.4, -51.5, 0],
          scale: 7900,
        }}
        aria-hidden="true"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#EAEAEC"
                stroke="#D6D6DA"
              />
            ))
          }
        </Geographies>
        {markers.map(({ name, coordinates, key, count }) => (
          <Marker key={key} coordinates={coordinates}>
            <circle
              r={count > 20 ? 10 + count / 2 : 9 + count}
              fill={showMarker.includes(name) ? "red" : "grey"}
              fillOpacity={count > 20 ? "0.5" : count > 4 ? "0.4" : "0.3"}
              stroke="#fff"
              strokeWidth={count > 20 ? 2 : 1}
              onMouseOver={() => setShowMarker([name])}
              onClick={() => setInputPlace(name)}
              onMouseOut={debounceClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setInputPlace(name);
                }
              }}
              style={{ cursor: "pointer" }}
              tabIndex={0}
              role="button"
              aria-label={`${name}: ${count} ${count === 1 ? 'Fall' : 'Fälle'}`}
            />
          </Marker>
        ))}
        {markers.map(({ name, coordinates, key, count }) => (
          <Marker key={key} coordinates={coordinates}>
            {showMarker.includes(name) && (
              <text
                textAnchor="middle"
                y={coordinates[1] > CENTER_GERMANY[1] ? 30 : -30}
                x={coordinates[0] > CENTER_GERMANY[0] ? -30 : 30}
                style={{
                  fontFamily: "system-ui",
                  fill: "#000",
                  fontSize: "30px",
                  pointerEvents: "none",
                }}
              >
                {name}
              </text>
            )}
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
};

export default Map;
