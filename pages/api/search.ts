import type { NextApiRequest, NextApiResponse } from "next";
import { getCases } from "../../lib/api/cases";
import { getStats } from "../../lib/api/stats";
import { getGeo } from "../../lib/api/geo";
import type { CasesResponse } from "../../lib/api/cases";
import type { StatsResponse } from "../../lib/api/stats";
import type { GeoResponse } from "../../lib/api/geo";

export interface SearchResponse {
  cases: CasesResponse;
  stats: StatsResponse;
  geo: GeoResponse;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const q = req.query.q as string | undefined;
  const year = req.query.year as string | undefined;
  const state = req.query.state as string | undefined;
  const place = req.query.place as string | undefined;
  const weapon = req.query.weapon as string | undefined;
  const age = req.query.age as string | undefined;
  const tags = req.query.tags ? (req.query.tags as string).split(",") : undefined;
  const sort = req.query.sort as "relevance" | "date" | undefined;
  const page = parseInt(req.query.page as string) || undefined;
  const limit = parseInt(req.query.limit as string) || undefined;

  const sharedFilters = { q, year, state, place, weapon, age, tags };

  const [casesResult, statsResult, geoResult] = await Promise.all([
    getCases({ ...sharedFilters, page, limit, sort }),
    getStats(sharedFilters),
    getGeo(sharedFilters),
  ]);

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300"
  );

  return res.status(200).json({
    cases: casesResult,
    stats: statsResult,
    geo: geoResult,
  });
}
