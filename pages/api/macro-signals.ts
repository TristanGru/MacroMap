import type { NextApiRequest, NextApiResponse } from "next";
import { fetchMacroSignals } from "@/lib/fred";
import { fetchDroughtSignal } from "@/lib/drought";
import { fetchCropConditionSignals } from "@/lib/usda";
import { fetchEiaStorageSignals } from "@/lib/eia";
import { kvGet, kvSet } from "@/lib/kv";
import type { MacroSignal } from "@/lib/types";

const CACHE_KEY = "macro-signals";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour (FRED data is daily/monthly)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Serve from KV if fresh
    const cached = await kvGet<{ signals: MacroSignal[]; fetchedAt: string }>(CACHE_KEY);
    if (cached) {
      const age = Date.now() - new Date(cached.fetchedAt).getTime();
      if (age < CACHE_TTL_MS) {
        res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
        return res.status(200).json(cached.signals);
      }
    }

    // Fetch fresh — FRED (keyed) + EIA storage (keyed) + keyless sources
    const [fredSignals, droughtSignal, cropSignals, eiaStorageSignals] = await Promise.all([
      fetchMacroSignals(),
      fetchDroughtSignal(),
      fetchCropConditionSignals(),
      fetchEiaStorageSignals(),
    ]);
    const signals: MacroSignal[] = [
      ...fredSignals,
      ...(droughtSignal ? [droughtSignal] : []),
      ...cropSignals,
      ...eiaStorageSignals,
    ];
    await kvSet(CACHE_KEY, { signals, fetchedAt: new Date().toISOString() });

    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    return res.status(200).json(signals);
  } catch (err) {
    console.error("[macro-signals] Error:", err);
    return res.status(200).json([]);
  }
}
