import type { NextApiRequest, NextApiResponse } from "next";
import { kvSet } from "@/lib/kv";
import { fetchAcledEvents } from "@/lib/acled";
import type { ConflictEventsCache } from "@/lib/types";

const TTL_SECONDS = 3600; // 1 hour

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // CRON_SECRET auth
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization;
  if (!secret || auth !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const start = Date.now();
  try {
    const events = await fetchAcledEvents();
    const cache: ConflictEventsCache = {
      events,
      fetchedAt: new Date().toISOString(),
    };
    await kvSet("conflict-events", cache, { ex: TTL_SECONDS });
    const durationMs = Date.now() - start;
    console.log(JSON.stringify({ route: "refresh-acled", status: 200, count: events.length, durationMs }));
    return res.status(200).json({ ok: true, count: events.length });
  } catch (err) {
    const durationMs = Date.now() - start;
    const error = err instanceof Error ? err.message : String(err);
    console.error(JSON.stringify({ route: "refresh-acled", status: 500, error, durationMs }));
    return res.status(500).json({ error });
  }
}
