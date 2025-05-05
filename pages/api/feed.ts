import { NextApiRequest, NextApiResponse } from "next";
import { setupData, setupTaserData } from "../../lib/data";

const MAX_ITEMS = 10;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { type } = req.query;

  let data = (await setupData()).data;

  const shootings = data.map((caseItem: any) => ({
    title: `Polizeilicher Todesschuss am ${caseItem.datePrint} in ${caseItem.Ort}, ${caseItem.state}`,
    description: caseItem.Szenarium || "Keine Beschreibung verfügbar.",
    link: `https://polizeischuesse.cilip.de/fall/${caseItem.Fall}`,
    pubDate: new Date(caseItem.Datum).toUTCString(),
  }));

  const taser = await setupTaserData();
  const taserShootings = taser.map((caseItem: any) => ({
    title: `Tod nach Tasereinsatz am ${caseItem.datePrint} in ${caseItem.Ort}, ${caseItem.state}`,
    description: caseItem.Szenarium || "Keine Beschreibung verfügbar.",
    link: `https://polizeischuesse.cilip.de/fall/${caseItem.Fall}`,
    pubDate: new Date(caseItem.Datum).toUTCString(),
  }));

  let items = [];
  let feedTitle = "Polizeiliche Todesschüsse";
  let feedDescription = "Chronik der polizeilichen Todesschüsse in Deutschland";

  if (type === "all") {
    items = [...shootings, ...taserShootings];
    feedTitle = "Polizeiliche Todesschüsse & Todesfälle nach Tasereinsatz";
    feedDescription =
      "Chronik der polizeilichen Todesschüsse und Todesfälle nach Tasereinsatz in Deutschland";
  } else if (type === "shootings") {
    items = shootings;
    feedTitle = "Polizeiliche Todesschüsse";
    feedDescription = "Chronik der polizeilichen Todesschüsse in Deutschland";
  } else if (type === "taser") {
    items = taserShootings;
    feedTitle = "Todesfälle nach Tasereinsatz";
    feedDescription =
      "Chronik der Todesfälle nach polizeilichem Tasereinsatz in Deutschland";
  } else {
    res.status(400).send("Invalid type");
    return;
  }

  // Sort items by pubDate in descending order, then slice
  items.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );
  items = items.slice(0, MAX_ITEMS);

  const escapeXml = (unsafe: string) =>
    unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <link>https://polizeischuesse.cilip.de</link>
    <atom:link href="https://polizeischuesse.cilip.de/api/feed?type=${escapeXml(
      String(type)
    )}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(feedDescription)}</description>
    <language>de-de</language>
    ${items
      .map(
        (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(post.link)}</link>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${post.pubDate}</pubDate>
      <guid>${escapeXml(post.link)}</guid>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  res.setHeader("Content-Type", "application/rss+xml");
  res.status(200).send(feed);
}
