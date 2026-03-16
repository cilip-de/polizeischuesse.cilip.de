import type { NextApiRequest, NextApiResponse } from "next";
import { getStats } from "../../lib/api/stats";
import type { StatsResponse } from "../../lib/api/stats";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatsResponse | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const result = await getStats({
    q: req.query.q as string | undefined,
    year: req.query.year as string | undefined,
    state: req.query.state as string | undefined,
    place: req.query.place as string | undefined,
    weapon: req.query.weapon as string | undefined,
    age: req.query.age as string | undefined,
    tags: req.query.tags ? (req.query.tags as string).split(",") : undefined,
  });

  return res.status(200).json(result);
}
