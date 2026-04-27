import type { NextApiRequest, NextApiResponse } from "next";
import { kvGet, kvSet } from "@/lib/kv";
import { fetchConflictNewsEvents } from "@/lib/conflict-news";
import type { ConflictEventsCache } from "@/lib/types";

const CACHE_KEY = "conflict-events";
const CACHE_TTL_SEC = 30 * 60;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let cache: ConflictEventsCache;
  try {
    const raw = await kvGet<ConflictEventsCache>(CACHE_KEY);
    cache = raw ?? { events: [], fetchedAt: new Date().toISOString() };
  } catch (err) {
    console.error("[conflict-events] KV read error:", err);
    cache = { events: [], fetchedAt: new Date().toISOString() };
  }

  if (cache.events.length === 0) {
    try {
      const fallbackEvents = await fetchConflictNewsEvents();
      if (fallbackEvents.length > 0) {
        cache = { events: fallbackEvents, fetchedAt: new Date().toISOString() };
        await kvSet(CACHE_KEY, cache, { ex: CACHE_TTL_SEC });
      }
    } catch (err) {
      console.error("[conflict-events] Fallback fetch error:", err);
    }
  }

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  return res.status(200).json(cache);
}
