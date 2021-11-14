import _ from "lodash";

const atob = (data) => Buffer.from(data).toString("base64");

const getGeo = async (data) => {
  const locationsInput = data.map((x) => {
    return {
      query: {
        city: x["Ort"],
        state: x["Bundesland"],
        county: null,
        address: null,
        district: null,
        country: "Deutschland",
      },
    };
  });
  const body = {
    provider: "here",
    locations: _.uniqBy(locationsInput, (x) =>
      [x.query.city, x.query.state].join()
    ),
  };

  const resp = await fetch("https://geocode.app.vis.one/", {
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

  const resp_json = await resp.json();

  return resp_json.locations.map((x) =>
    _.pick(x, ["city", "state", "latitude", "longitude"])
  );
};

export { getGeo };
