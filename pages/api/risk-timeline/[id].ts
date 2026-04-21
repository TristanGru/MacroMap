import type { NextApiRequest, NextApiResponse } from "next";
import { kvGet } from "@/lib/kv";
import type { RiskTimelineEntry } from "@/lib/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { id } = req.query;
  if (typeof id !== "string" || !id) {
    return res.status(400).json({ error: "Missing id" });
  }

  try {
    const timeline = await kvGet<RiskTimelineEntry[]>(`risk-timeline:${id}`);
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json(timeline ?? []);
  } catch {
    return res.status(200).json([]);
  }
}
