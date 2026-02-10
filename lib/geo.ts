import _ from "lodash";

interface LocationQuery {
  city: string;
  state: string;
  county: string | null;
  country: string;
}

interface LocationInput {
  query: LocationQuery;
}

interface GeoResponseLocation {
  city: string | null;
  state: string | null;
  county: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface GeoResponse {
  locations: GeoResponseLocation[];
}

const atob = (data: string): string => Buffer.from(data).toString("base64");

interface LocationData {
  place: string;
  state: string;
}

interface GeoRequestBody {
  provider: string;
  locations: LocationInput[];
}

interface GeoResponseJson {
  locations: (GeoResponseLocation & { query: LocationQuery })[];
}

const getGeo = async (data: LocationData[]): Promise<GeoResponseLocation[]> => {
  const locationsInput: LocationInput[] = data.map((x) => {
    return {
      query: {
        city: x.place,
        state: x.state,
        county: null,
        country: "Deutschland",
      },
    };
  });

  const body: GeoRequestBody = {
    provider: "here",
    locations: _.uniqBy(
      locationsInput.filter((x) => x.query.city != "Unbekannt"),
      (x) => [x.query.city, x.query.state].join()
    ),
  };

  // Return empty array if GEO_HOST is not configured or if it's a test environment
  if (!process.env.GEO_HOST || process.env.CI === 'true') {
    console.log("Skipping geo API call - no GEO_HOST configured or running in CI");
    return data.map(x => ({
      city: x.place,
      state: x.state,
      latitude: null,
      longitude: null,
      county: null,
    }));
  }

  try {
    const resp = await fetch(process.env.GEO_HOST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + atob(process.env.GEO_USER + ":" + process.env.GEO_PW),
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.log(errText);
    }

    const resp_json: GeoResponseJson = await resp.json();

    for (const x of resp_json.locations) {
      if (x.city && x.state) continue;

      if (!x.city && x.latitude && x.county) x.city = x.county;
      else console.log(x);
    }

    // the API modified the city / state so keep the old ones
    const result = _.uniq(
      resp_json.locations.map((x) => ({
        city: x.query.city,
        state: x.query.state,
        latitude: x.latitude,
        longitude: x.longitude,
        county: x.county,
      }))
    );

    return _.uniqBy(result, (x) => x.city + x.state);
  } catch (error) {
    console.error("Failed to fetch geo data:", error);
    // Return fallback data without coordinates
    return data.map(x => ({
      city: x.place,
      state: x.state,
      latitude: null,
      longitude: null,
      county: null,
    }));
  }
};

export { getGeo };
export type { GeoResponseLocation };
