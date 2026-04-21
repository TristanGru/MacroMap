import type { NextApiRequest, NextApiResponse } from "next";
import { fetchEarthquakes } from "@/lib/usgs";
import { fetchGDACSEvents } from "@/lib/gdacs";
import { fetchWildfires } from "@/lib/firms";
import { kvSet } from "@/lib/kv";
import type { DisasterEventsCache } from "@/lib/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).end();
  }

  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const startTime = Date.now();

  try {
    // Fetch all three sources in parallel
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

    // TTL: 15 minutes (matches chokepoint cron frequency)
    await kvSet("disaster-events", cache, { ex: 900 });

    const duration = Date.now() - startTime;
    console.log(
      `[refresh-disasters] earthquakes=${earthquakes.length} gdacs=${gdacs.length} wildfires=${wildfires.length} total=${events.length} duration_ms=${duration}`
    );

    return res.status(200).json({ ok: true, count: events.length });
  } catch (err) {
    console.error("[refresh-disasters] Error:", err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
