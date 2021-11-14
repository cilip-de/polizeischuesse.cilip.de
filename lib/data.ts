import { csv } from "d3-fetch";
import dayjs from "dayjs";
import "dayjs/locale/de";
import localeData from "dayjs/plugin/localeData";
import Fuse from "fuse.js";
import _ from "lodash";
import { getGeo } from "./geo";
import { isNumber } from "./util";

dayjs.locale("de");
dayjs.extend(localeData);

const PAGE_SIZE = 20;
const SELECTABLE = ["year", "state", "place", "age"];

let HOST = "http://localhost:3000";
if (process.env.NODE_ENV === "production") HOST = "http://cilip.app.vis.one";

// value, column, positive label, negative label
const TAGS = [
  ["schusswechsel", "Schusswechsel", "Schusswechsel", "Kein Schusswechsel"],
  ["sek", "Sondereinsatzbeamte", "SEK-Beteiligung", "Ohne SEK-Beteiligung"],
  [
    "vgbeamte",
    "Verletzte/getötete Beamte",
    "Verletzte/getötete Beamte",
    "Keine verletzten/getöteten Beamten",
  ],
  [
    "vbaktion",
    "Vorbereitete Polizeiaktion",
    "Vorbereitete Polizeiaktion",
    "Unvorbereitete Polizeiaktion",
  ],
  [
    "psych",
    "Hinweise auf psychische Ausnahmesituation",
    "Hinweise auf psychische Ausnahmesituation",
    "Keine Hinweise auf psychische Ausnahmesituation",
  ],
  [
    "alkdrog",
    "Hinweise auf Alkohol- und/ oder Drogenkonsum",
    "Hinweise auf Alkohol- und/ oder Drogenkonsum",
    "Keine Hinweise auf Alkohol- und/ oder Drogenkonsum",
  ],
  [
    "famgew",
    "Hinweise auf familiäre oder häusliche Gewalt",
    "Hinweise auf familiäre oder häusliche Gewalt",
    "Keine Hinweise auf familiäre oder häusliche Gewalt",
  ],

  [
    "unschuss",
    "Unbeabsichtigte Schussabgabe",
    "Unbeabsichtigte Schussabgabe",
    "Beabsichtigte Schussabgabe",
  ],
  [
    "indoor",
    "Schussort Innenraum",
    "Schussort Innenraum",
    "Schussort nicht Innenraum",
  ],
  ["men", "männlich", "Männlich", "Nicht männlich"],
];

const SEARCH_KEYES = ["Name", "Szenarium"];

const countItems = (arr, sort = false) => {
  const counts = {};
  for (const y of arr) {
    counts[y] = counts[y] ? counts[y] + 1 : 1;
  }

  let countsEntries = Object.entries(counts);

  if (sort)
    countsEntries = _.orderBy(
      countsEntries,
      [(x) => x[1], (x) => x[0]],
      ["desc", "asc"]
    );

  return countsEntries.map((x) => ({
    value: x[0],
    label: x[0] + " (" + x[1] + ")",
    count: x[1],
  }));
};

// excluding Berlin
const eastStates =
  `Brandenburg Mecklenburg-Vorpommern Sachsen Sachsen-Anhalt Thüringen`.split(
    " "
  );

const preprocessData = (data) => {
  data = _.orderBy(data, "Datum", "desc");

  const dateReunification = dayjs("1990-10-3");

  data.forEach((x, i) => {
    const date = dayjs(x["Datum"]);
    x.key = i;
    x.year = date.get("year");
    x.dow = date.day();
    x.dowPrint = dayjs.weekdays()[x.dow];
    x.dom = date.date();
    x.month = date.get("month");
    x.monthPrint = dayjs.months()[x.month];
    x.datePrint = date.format("DD.MM.YYYY");
    x.beforeReunification = date.isBefore(dateReunification);
    x.state = x["Bundesland"];
    x.east = eastStates.includes(x.state);
    x.place = x["Ort"];
    x.weapon = x["Waffen"];
    x.sex = x["Geschlecht"];
    x.numShots = x["Anzahl im Einsatz abgegebener polizeilicher Schüsse"];
    x["Schussort Innenraum"] = x["Schussort"] === "Drin" ? "Ja" : "";
    x["Schussort Außen"] = x["Schussort"] === "Draußen" ? "Ja" : "";
    x["weiblich"] = x.sex == "weiblich" ? "Ja" : "";
    x["männlich"] = x.sex == "männlich" ? "Ja" : "";

    if (isNumber(x["Alter"])) {
      x.age = Math.floor(x["Alter"] / 5) * 5;
    } else {
      x.age = "Unbekannt";
    }

    for (const [t, label] of TAGS) {
      x[t] = x[label].includes("Ja");
    }
  });

  return data;
};

let fuse = null;
let setupProps = null;

const setupData = async () => {
  if (setupProps !== null) return setupProps;

  let data = await csv(`${HOST}/data.csv`);

  const geoData = await getGeo(data);

  data = preprocessData(data);

  const [beforeReuni, afterReuni] = _.map(
    _.partition(data, "beforeReunification"),
    "length"
  );

  const year = _.orderBy(countItems(data.map((x) => x.year)), "value", "desc");
  const state = countItems(
    data.map((x) => x.Bundesland),
    true
  );
  const place = countItems(
    data.map((x) => x.Ort),
    true
  );

  const weapons = [];
  data.forEach((x) => weapons.push(...x.weapon.split(", ")));
  const weapon = countItems(
    weapons.filter((x) => x.length),
    true
  );

  const age = countItems(
    data.map((x) => x.age),
    false
  );

  age.forEach((x, i) => {
    if (i < age.length - 1)
      x.label =
        x.label.slice(0, 2) + `-${parseInt(x.value) + 4} ` + x.label.slice(3);
  });

  fuse = new Fuse(data, {
    minMatchCharLength: 3,
    includeMatches: true,
    findAllMatches: false,
    threshold: 0,
    ignoreLocation: true,
    useExtendedSearch: true,
    keys: SEARCH_KEYES,
  });

  setupProps = {
    data,
    geoData,
    options: { year, state, place, weapon, age },
    fuse,
    beforeReuni,
    afterReuni,
  };
  return setupProps;
};

const setupTaserData = async () => {
  let data = await csv(`${HOST}/taser.csv`);
  return preprocessData(data);
};

export {
  setupData,
  countItems,
  setupTaserData,
  SELECTABLE,
  PAGE_SIZE,
  TAGS,
  SEARCH_KEYES,
};
