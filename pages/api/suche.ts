import type { NextApiRequest, NextApiResponse } from "next";
import { setupData } from "../../lib/data";
import type { ProcessedDataItem } from "../../lib/data";
import type { FuseResultMatch } from "fuse.js";

type SearchResult = ProcessedDataItem & {
  matches?: FuseResultMatch[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResult[] | { error: string }>
) {
  const { data, options, fuse } = await setupData();

  const { q } = req.query;

  if (typeof q !== "string" || q.length <= 2) {
    return res.status(400).json({ error: "Query must be a string with more than 2 characters" });
  }

  const searchedData = fuse
    .search("'" + q)
    .map(({ item, matches }) => ({ ...item, matches: matches ? [...matches] : undefined })) as SearchResult[];

  return res.status(200).json(searchedData);
}
