import type { MacroSignal } from "@/lib/types";

interface USDMRecord {
  MapDate: string; // "20240104"
  None: number;
  D0: number;
  D1: number;
  D2: number;
  D3: number;
  D4: number;
  DSCI: number; // Drought Severity and Coverage Index 0–500
}

/**
 * Fetches US national drought conditions from the US Drought Monitor.
 * No API key required. Published weekly on Thursdays.
 * DSCI = Drought Severity and Coverage Index (0 = no drought, 500 = all D4).
 */
export async function fetchDroughtSignal(): Promise<MacroSignal | null> {
  try {
    // Request last 14 days to ensure we catch the latest weekly release
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 14);

    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const url =
      `https://usdmdataservices.unl.edu/api/USStatistics/GetDroughtSeverityStatisticsByArea` +
      `?aoi=conus&startdate=${fmt(start)}&enddate=${fmt(end)}&statisticsType=1`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as USDMRecord[];
    if (!Array.isArray(data) || data.length === 0) return null;

    // Latest entry (array is ascending by date)
    const latest = data[data.length - 1];
    const prev = data.length >= 2 ? data[data.length - 2] : null;

    const severePct = parseFloat((latest.D2 + latest.D3 + latest.D4).toFixed(1));
    const prevSeverePct = prev
      ? parseFloat((prev.D2 + prev.D3 + prev.D4).toFixed(1))
      : severePct;

    const delta = parseFloat((severePct - prevSeverePct).toFixed(1));
    const direction: MacroSignal["direction"] =
      delta > 0.5 ? "up" : delta < -0.5 ? "down" : "flat";

    // Parse date: "20240104" → "2024-01-04"
    const d = String(latest.MapDate);
    const date = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;

    return {
      id: "usdm-drought",
      label: "US Drought (D2+)",
      value: severePct,
      delta,
      unit: "%",
      direction,
      date,
      isAlert: severePct > 30, // >30% of CONUS in severe drought = alert
      category: "agriculture",
    };
  } catch (err) {
    console.warn("[drought] Fetch error:", err);
    return null;
  }
}
