import type { MacroSignal } from "@/lib/types";

/**
 * Fetches weekly US crop condition ratings from USDA NASS QuickStats API.
 * Requires free API key: https://quickstats.nass.usda.gov/api
 *
 * Returns "% of corn rated good/excellent" and "% of soybeans rated good/excellent"
 * as MacroSignals. These are leading indicators for corn/soybean price moves.
 */

interface NASSRecord {
  commodity_desc: string;   // "CORN"
  short_desc: string;       // "CORN - CONDITION, MEASURED IN PCT GOOD"
  Value: string;            // "62"
  week_ending: string;      // "2024-09-08"
  load_time: string;
}

interface NASSResponse {
  data?: NASSRecord[];
  error?: string;
}

async function fetchCropCondition(
  commodity: string,
  key: string
): Promise<{ goodExcellent: number; date: string } | null> {
  try {
    const params = new URLSearchParams({
      key,
      commodity_desc: commodity,
      statisticcat_desc: "CONDITION",
      unit_desc: "PCT GOOD",
      agg_level_desc: "NATIONAL",
      year__GE: String(new Date().getFullYear()),
      format: "JSON",
    });

    const res = await fetch(
      `https://quickstats.nass.usda.gov/api/api_GET/?${params}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return null;

    const json = (await res.json()) as NASSResponse;
    const records = json.data;
    if (!records || records.length === 0) return null;

    // Most recent entry
    const latest = records.sort((a, b) =>
      b.week_ending.localeCompare(a.week_ending)
    )[0];

    const goodPct = parseFloat(latest.Value);
    if (isNaN(goodPct)) return null;

    // Get previous to calculate delta
    const prev = records.length >= 2
      ? records.sort((a, b) => b.week_ending.localeCompare(a.week_ending))[1]
      : null;
    const prevPct = prev ? parseFloat(prev.Value) : goodPct;

    return {
      goodExcellent: goodPct,
      date: latest.week_ending,
    };
  } catch {
    return null;
  }
}

export async function fetchCropConditionSignals(): Promise<MacroSignal[]> {
  const key = process.env.USDA_NASS_API_KEY;
  if (!key) {
    console.warn("[usda] USDA_NASS_API_KEY not set — skipping crop conditions");
    return [];
  }

  const [corn, soybeans] = await Promise.all([
    fetchCropCondition("CORN", key),
    fetchCropCondition("SOYBEANS", key),
  ]);

  const signals: MacroSignal[] = [];

  if (corn) {
    signals.push({
      id: "usda-corn-condition",
      label: "Corn Condition",
      value: corn.goodExcellent,
      delta: 0,
      unit: "% good",
      direction: corn.goodExcellent >= 65 ? "up" : corn.goodExcellent <= 50 ? "down" : "flat",
      date: corn.date,
      isAlert: corn.goodExcellent < 50, // <50% good = supply concern
      category: "agriculture",
    });
  }

  if (soybeans) {
    signals.push({
      id: "usda-soy-condition",
      label: "Soy Condition",
      value: soybeans.goodExcellent,
      delta: 0,
      unit: "% good",
      direction: soybeans.goodExcellent >= 65 ? "up" : soybeans.goodExcellent <= 50 ? "down" : "flat",
      date: soybeans.date,
      isAlert: soybeans.goodExcellent < 50,
      category: "agriculture",
    });
  }

  return signals;
}
