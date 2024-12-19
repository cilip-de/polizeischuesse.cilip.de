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
  ["men", "männlich", "Männlich", "Weiblich"],
];

const SEARCH_KEYES = ["Name", "Szenarium"];

const countItems = (arr: string[], sort = false) => {
  const counts: { [key: string]: number } = {};
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

interface OptionItem {
  value: string;
  label: string;
  count: number;
}

interface SetupOptions {
  year: OptionItem[];
  state: OptionItem[];
  place: OptionItem[];
  weapon: OptionItem[];
  age: OptionItem[];
}

const setupOptions = (data: ProcessedDataItem[]): SetupOptions => {
  const year = _.orderBy(
    countItems(data.map((x) => x.year.toString())),
    "value",
    "desc"
  );
  const state = countItems(
    data.map((x) => x.state),
    true
  );
  const place = countItems(
    data.map((x) => x.place),
    true
  );

  const weapons: string[] = [];
  data.forEach((x) => weapons.push(...x.weapon.split(", ")));
  const weapon = countItems(
    weapons.filter((x) => x.length),
    true
  );

  const age = countItems(
    data.map((x) => x.age.toString()),
    false
  );

  age.forEach((x, i) => {
    if (i < age.length - 1)
      x.label =
        x.label.slice(0, 2) + `-${parseInt(x.value) + 4} ` + x.label.slice(3);
  });
  return { year, state, place, weapon, age };
};

interface RawDataItem {
  Datum: string;
  Bundesland: string;
  Ort: string;
  Waffen: string;
  Geschlecht: string;
  "Anzahl im Einsatz abgegebener polizeilicher Schüsse": string;
  Schussort: string;
  Alter: string;
  [key: string]: any;
}

interface ProcessedDataItem extends RawDataItem {
  key: number;
  year: number;
  dow: number;
  dowPrint: string;
  dom: number;
  month: number;
  monthPrint: string;
  datePrint: string;
  beforeReunification: boolean;
  state: string;
  east: boolean;
  place: string;
  weapon: string;
  sex: string;
  numShots: string;
  "Schussort Innenraum": string;
  "Schussort Außen": string;
  weiblich: string;
  männlich: string;
  age: number | string;
}

const preprocessData = (data: RawDataItem[]): ProcessedDataItem[] => {
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
    x.state = x["Bundesland"].trim();
    x.east = eastStates.includes(x.state);
    x.place = x["Ort"].trim();
    x.weapon = x["Waffen"];
    x.sex = x["Geschlecht"];
    x.numShots = x["Anzahl im Einsatz abgegebener polizeilicher Schüsse"];
    x["Schussort Innenraum"] = x["Schussort"] === "Drin" ? "Ja" : "";
    x["Schussort Außen"] = x["Schussort"] === "Draußen" ? "Ja" : "";
    x["weiblich"] = x.sex == "weiblich" ? "Ja" : "";
    x["männlich"] = x.sex == "männlich" ? "Ja" : "";

    x["Name"].replace(`, ${x.sex}`, "");

    if (isNumber(x["Alter"])) {
      x.age = Math.floor(Number(x["Alter"]) / 5) * 5;
    } else {
      x.age = "Unbekannt";
    }

    for (const [t, label] of TAGS) {
      x[t] = x[label].includes("Ja");
    }
  });

  return data as ProcessedDataItem[];
};

let fuse = null;
interface DataItem {
  Datum: string;
  Bundesland: string;
  Ort: string;
  Waffen: string;
  Geschlecht: string;
  "Anzahl im Einsatz abgegebener polizeilicher Schüsse": string;
  Alter: string;
  [key: string]: any;
}

interface SetupProps {
  data: DataItem[];
  geoData: any;
  options: ReturnType<typeof setupOptions>;
  fuse: Fuse<DataItem>;
  beforeReuni: number;
  afterReuni: number;
}

let setupProps: SetupProps | null = null;

const setupData = async () => {
  if (setupProps !== null) return setupProps;

  let data = (await csv(`${HOST}/data.csv`)).filter(
    (x) => x["Fall"]
  ) as DataItem[];

  const processedData = preprocessData(data as RawDataItem[]);

  const geoData = await getGeo(data);

  const [beforeReuni, afterReuni] = _.map(
    _.partition(data, "beforeReunification"),
    "length"
  );

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
    options: setupOptions(processedData),
    fuse,
    beforeReuni,
    afterReuni,
  };
  return setupProps;
};

const setupTaserData = async () => {
  let data = (await csv(`${HOST}/taser.csv`)).filter((x) => x["Fall"]);
  return preprocessData(data as RawDataItem[]);
};

export {
  countItems,
  PAGE_SIZE,
  SEARCH_KEYES,
  SELECTABLE,
  setupData,
  setupOptions,
  setupTaserData,
  TAGS,
};
