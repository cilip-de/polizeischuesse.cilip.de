import type { NextApiRequest, NextApiResponse } from "next";
import { getCases } from "../../lib/api/cases";
import type { CasesResponse } from "../../lib/api/cases";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CasesResponse | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const result = await getCases({
    page: parseInt(req.query.page as string) || undefined,
    limit: parseInt(req.query.limit as string) || undefined,
    q: req.query.q as string | undefined,
    year: req.query.year as string | undefined,
    state: req.query.state as string | undefined,
    place: req.query.place as string | undefined,
    weapon: req.query.weapon as string | undefined,
    age: req.query.age as string | undefined,
    tags: req.query.tags ? (req.query.tags as string).split(",") : undefined,
    sort: req.query.sort as "relevance" | "date" | undefined,
  });

  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(result);
}
