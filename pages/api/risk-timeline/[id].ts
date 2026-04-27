import type { NextApiRequest, NextApiResponse } from "next";
import { kvGet } from "@/lib/kv";
import { readCache } from "@/lib/disruption-state";
import type { DisruptionState, RiskTimelineEntry } from "@/lib/types";

function backfillTimeline(state: DisruptionState): RiskTimelineEntry[] {
  const entries: RiskTimelineEntry[] = [];
  const fallbackState = state === "unknown" ? "clean" : state;
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    entries.push({
      date: date.toISOString().slice(0, 10),
      state: fallbackState,
    });
  }

  return entries;
}

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
    if (timeline && timeline.length > 0) {
      return res.status(200).json(timeline);
    }

    const cache = await readCache();
    const currentState = cache.chokepoints[id]?.state ?? "clean";
    return res.status(200).json(backfillTimeline(currentState));
  } catch {
    return res.status(200).json(backfillTimeline("clean"));
  }
}
