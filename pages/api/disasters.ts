import type { NextApiRequest, NextApiResponse } from "next";
import { kvGet, kvSet } from "@/lib/kv";
import { fetchEarthquakes } from "@/lib/usgs";
import { fetchGDACSEvents } from "@/lib/gdacs";
import { fetchWildfires } from "@/lib/firms";
import type { DisasterEventsCache } from "@/lib/types";

const CACHE_KEY = "disaster-events";
const CACHE_TTL_SEC = 900; // 15 min

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Serve from KV if populated
    const cached = await kvGet<DisasterEventsCache>(CACHE_KEY);
    if (cached) {
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
      return res.status(200).json(cached);
    }

    // Cold cache — live fetch (USGS + GDACS need no key; FIRMS degrades gracefully without key)
    console.log("[disasters] cold cache — fetching live");
    const [earthquakes, gdacs, wildfires] = await Promise.all([
      fetchEarthquakes(),
      fetchGDACSEvents(),
      fetchWildfires(),
    ]);

    const events = [...earthquakes, ...gdacs, ...wildfires].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const cache: DisasterEventsCache = {
      events,
      fetchedAt: new Date().toISOString(),
    };

    await kvSet(CACHE_KEY, cache, { ex: CACHE_TTL_SEC });

    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json(cache);
  } catch (err) {
    console.error("[disasters] Error:", err);
    return res.status(200).json({ events: [], fetchedAt: new Date().toISOString() });
  }
}
