import { csv } from "d3-fetch";
import dayjs from "dayjs";
import "dayjs/locale/de";
import localeData from "dayjs/plugin/localeData";
import Fuse from "fuse.js";
import _ from "lodash";

dayjs.locale("de");
dayjs.extend(localeData);

const PAGE_SIZE = 20;
const SELECTABLE = ["year", "state", "place"];

const TAGS = [
  ["schusswechsel", "Schusswechsel"],
  ["sek", "Sondereinsatzbeamte"],
  ["vgbeamte", "Verletzte/getötete Beamte"],
  ["vbaktion", "Vorbereitete Polizeiaktion"],
];

const countItems = (arr, sort = false) => {
  const counts = {};
  for (const y of arr) {
    counts[y] = counts[y] ? counts[y] + 1 : 1;
  }

  let countsEntries = Object.entries(counts);

  if (sort) countsEntries = _.orderBy(countsEntries, (x) => x[1], "desc");

  return countsEntries.map((x) => ({
    value: x[0],
    label: x[0] + " (" + x[1] + ")",
    count: x[1],
  }));
};

let fuse = null;
let setupProps = null;

const setupData = async () => {
  if (setupProps !== null) return setupProps;

  let url = "http://localhost:3000/data.csv";
  if (process.env.NODE_ENV === "production")
    url = "http://cilip.app.vis.one/data.csv";

  let data = await csv(url);
  data = _.orderBy(data, "Datum", "desc");

  data.forEach((x, i) => {
    const date = dayjs(x["Datum"]);
    x.year = date.get("year");
    x.dow = date.day();
    x.dowPrint = dayjs.weekdays()[x.dow];
    x.dom = date.date();
    x.month = date.get("month");
    x.monthPrint = dayjs.months()[x.month];
    x.datePrint = date.format("DD.MM.YYYY");
    x.key = i;
    x.state = x["Bundesland"];
    x.place = x["Ort"];
    x.weapon = x["Opfer mit Schusswaffe"];

    for (const [t, label] of TAGS) {
      x[t] = x[label].includes("Ja");
    }
  });

  const year = _.orderBy(countItems(data.map((x) => x.year)), "value", "desc");
  const state = countItems(
    data.map((x) => x.Bundesland),
    true
  );
  const place = countItems(
    data.map((x) => x.Ort),
    true
  );

  fuse = new Fuse(data, {
    minMatchCharLength: 3,
    includeMatches: true,
    findAllMatches: false,
    threshold: 0,
    ignoreLocation: true,
    useExtendedSearch: true,
    keys: ["Name", "Szenarium"],
  });

  setupProps = { data, options: { year, state, place }, fuse };
  return setupProps;
};

export { setupData, countItems, SELECTABLE, PAGE_SIZE, TAGS };
