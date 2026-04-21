import type { NextApiRequest, NextApiResponse } from "next";
import { kvGet } from "@/lib/kv";
import type { ConflictEventsCache } from "@/lib/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let cache: ConflictEventsCache;
  try {
    const raw = await kvGet<ConflictEventsCache>("conflict-events");
    cache = raw ?? { events: [], fetchedAt: new Date().toISOString() };
  } catch (err) {
    console.error("[conflict-events] KV read error:", err);
    cache = { events: [], fetchedAt: new Date().toISOString() };
  }

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  return res.status(200).json(cache);
}
