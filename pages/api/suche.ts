import type { NextApiRequest, NextApiResponse } from "next";
import { setupData } from "../../lib/data";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { data, options, fuse } = await setupData();

  const { q } = req.query;

  let searchedData = null;
  if (q && q.length > 2) {
    searchedData = fuse
      .search("'" + q)
      .map(({ item, matches }) => ({ ...item, matches: matches }));

    res.status(200).json(searchedData);
  }

  res.status(200).json({ name: "John Doe" });
}
