import { NextApiRequest, NextApiResponse } from "next";
import { setupData } from "../../lib/data";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const data = (await setupData()).data.slice(0, 20);

  const blogPosts = data.map((caseItem: any) => ({
    title: `Polizeilicher Todesschuss am ${caseItem.datePrint} in ${caseItem.Ort}, ${caseItem.state}`,
    description: caseItem.Szenarium || "Keine Beschreibung verfügbar.",
    link: `https://polizeischuesse.cilip.de/fall/${caseItem.Fall}`,
    pubDate: new Date(caseItem.Datum).toUTCString(),
  }));

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
    <title>Polizeiliche Todesschüsse</title>
    <link>https://polizeischuesse.cilip.de</link>
    <atom:link href="https://polizeischuesse.cilip.de/api/feed" rel="self" type="application/rss+xml" />
    <description>Chronik der polizeilichen Todesschüsse in Deutschland</description>
    <language>de-de</language>
    ${blogPosts
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
