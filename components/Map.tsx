import _ from "lodash";
import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

const geoUrl = "/de_topo.json";

const Map = ({ makersData }) => {
  const markers = _.uniqBy(
    makersData.map((x) => ({
      key: x.city + x.state,
      name: x.city,
      coordinates: [x["longitude"], x["latitude"]],
    })),
    "key"
  );

  const [showMarker, setShowMarker] = useState([]);

  if (typeof window === "undefined") return null;

  return (
    <div>
      <ComposableMap
        projection="geoAzimuthalEqualArea"
        height={1100}
        projectionConfig={{
          rotate: [-10.0, -51.0, 0],
          scale: 8000,
        }}
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
        {markers.map(({ name, coordinates, key }) => (
          <Marker key={key} coordinates={coordinates}>
            <circle
              r={10}
              fill="grey"
              fillOpacity="0.4"
              stroke="#fff"
              strokeWidth={2}
              onMouseOver={() => setShowMarker([name])}
              // onMouseOut={() => setShowMarker([])}
            />
            {showMarker.includes(name) && (
              <text
                textAnchor="middle"
                y={-20}
                style={{ fontFamily: "system-ui", fill: "#5D5A6D" }}
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