import type { NextApiRequest, NextApiResponse } from "next";
import { setupData } from "../../lib/data";
import type { ProcessedDataItem } from "../../lib/data";

// Serialized match type (safe for JSON)
interface SerializedMatch {
  indices: [number, number][];
  key: string;
  value: string;
}

type SearchResult = ProcessedDataItem & {
  matches?: SerializedMatch[];
};

// Helper to safely serialize Fuse.js match data (avoids circular refs in m.indices)
function serializeMatches(
  matches: Array<{ indices: readonly (readonly [number, number])[]; key?: string; value?: string }> | undefined
): SerializedMatch[] | undefined {
  if (!matches) return undefined;
  return matches.map((m) => ({
    // Create plain arrays from Fuse.js readonly tuples
    indices: Array.from(m.indices, (pair) => [pair[0], pair[1]] as [number, number]),
    key: m.key || "",
    value: m.value || "",
  }));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResult[] | { error: string }>
) {
  const { fuse } = await setupData();

  const { q } = req.query;

  if (typeof q !== "string" || q.length <= 2) {
    return res.status(400).json({ error: "Query must be a string with more than 2 characters" });
  }

  const searchedData = fuse.search("'" + q).map(({ item, matches }) => ({
    // Copy item properties explicitly to avoid any hidden refs
    key: item.key,
    Fall: item.Fall,
    Name: item.Name,
    Geschlecht: item.Geschlecht,
    Alter: item.Alter,
    Datum: item.Datum,
    Ort: item.Ort,
    Bundesland: item.Bundesland,
    Schussort: item.Schussort,
    Szenarium: item.Szenarium,
    Quellen: item.Quellen,
    "Hinweise auf psychische Ausnahmesituation": item["Hinweise auf psychische Ausnahmesituation"],
    "Hinweise auf Alkohol- und/ oder Drogenkonsum": item["Hinweise auf Alkohol- und/ oder Drogenkonsum"],
    Waffen: item.Waffen,
    "Hinweise auf familiäre oder häusliche Gewalt": item["Hinweise auf familiäre oder häusliche Gewalt"],
    "Unbeabsichtigte Schussabgabe": item["Unbeabsichtigte Schussabgabe"],
    "Anzahl im Einsatz abgegebener polizeilicher Schüsse": item["Anzahl im Einsatz abgegebener polizeilicher Schüsse"],
    "Opfer mit Schusswaffe": item["Opfer mit Schusswaffe"],
    Schusswechsel: item.Schusswechsel,
    Sondereinsatzbeamte: item.Sondereinsatzbeamte,
    "Verletzte/getötete Beamte": item["Verletzte/getötete Beamte"],
    "Vorbereitete Polizeiaktion": item["Vorbereitete Polizeiaktion"],
    year: item.year,
    dow: item.dow,
    dowPrint: item.dowPrint,
    dom: item.dom,
    month: item.month,
    monthPrint: item.monthPrint,
    datePrint: item.datePrint,
    beforeReunification: item.beforeReunification,
    state: item.state,
    east: item.east,
    place: item.place,
    weapon: item.weapon,
    sex: item.sex,
    numShots: item.numShots,
    "Schussort Innenraum": item["Schussort Innenraum"],
    "Schussort Außen": item["Schussort Außen"],
    weiblich: item.weiblich,
    männlich: item.männlich,
    age: item.age,
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
    matches: serializeMatches(matches as any),
  })) as SearchResult[];

  return res.status(200).json(searchedData);
}
