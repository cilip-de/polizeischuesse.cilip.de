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
    locations: _.uniqBy(
      locationsInput.filter((x) => x.query.city != "Unbekannt"),
      (x) => [x.query.city, x.query.state].join()
    ),
  };

  // console.log(body.locations.length);

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

  for (const x of resp_json.locations) {
    console.log(resp_json.query);
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
    }))
  );

  // there are duplicates, need to investigate, FIXME

  // const duplicated = _(result)
  //   .groupBy((x) => x.state + x.city)
  //   .pickBy((x) => x.length > 1)
  //   .keys()
  //   .value();

  // for (const x of duplicated) {
  //   console.log(result.filter((y) => y.state + y.city === x));
  // }

  return _.uniqBy(result, (x) => x.city + x.state);
};

export { getGeo };
