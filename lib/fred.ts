import type { MacroSignal } from "@/lib/types";

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

interface SeriesDef {
  id: string;
  label: string;
  unit: string;
  /** % change that triggers isAlert = true */
  alertThreshold: number;
  category?: "macro" | "agriculture" | "energy";
}

const SERIES: SeriesDef[] = [
  { id: "CPIAUCSL",    label: "US CPI",              unit: "idx",      alertThreshold: 0.5, category: "macro"        },
  { id: "PFOODINDEXM", label: "Food Index",           unit: "idx",      alertThreshold: 3,   category: "macro"        },
  { id: "PPIACO",      label: "PPI",                  unit: "idx",      alertThreshold: 1,   category: "macro"        },
  { id: "GSCPI",       label: "Supply Chain Pressure", unit: "σ",       alertThreshold: 1,   category: "macro"        },
  { id: "DHHNGSP",     label: "Henry Hub Gas",        unit: "$/MMBtu",  alertThreshold: 10,  category: "energy"       },
  { id: "PNRGINDEXM",  label: "Energy Index",         unit: "idx",      alertThreshold: 5,   category: "energy"       },
  { id: "PWHEAMTUSDM", label: "Wheat",                unit: "$/t",      alertThreshold: 5,   category: "agriculture"  },
  { id: "PCOPPUSDM",   label: "Copper",               unit: "$/t",      alertThreshold: 5,   category: "energy"       },
  { id: "PMAIZMTUSDM", label: "Corn",                 unit: "$/t",      alertThreshold: 8,   category: "agriculture"  },
  { id: "PSOYBUSDM",   label: "Soybeans",             unit: "$/t",      alertThreshold: 8,   category: "agriculture"  },
];

interface FREDObservation {
  date: string;   // YYYY-MM-DD
  value: string;  // numeric or "."
}

interface FREDResponse {
  observations: FREDObservation[];
}

async function fetchSeries(
  seriesId: string,
  apiKey: string
): Promise<FREDObservation[]> {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: "json",
    limit: "5",
    sort_order: "desc",
  });
  const res = await fetch(`${FRED_BASE}?${params}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as FREDResponse;
  return data.observations ?? [];
}

/**
 * Fetches macro economic signals from the FRED API (Federal Reserve).
 * Returns [] if FRED_API_KEY is not set.
 * Free tier: https://fred.stlouisfed.org/docs/api/api_key.html
 */
export async function fetchMacroSignals(): Promise<MacroSignal[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    console.warn("[fred] FRED_API_KEY not set — returning empty signals");
    return [];
  }

  const results = await Promise.allSettled(
    SERIES.map((s) => fetchSeries(s.id, apiKey))
  );

  const signals: MacroSignal[] = [];

  for (let i = 0; i < SERIES.length; i++) {
    const s = SERIES[i];
    const result = results[i];
    if (result.status !== "fulfilled") continue;

    const obs = result.value.filter((o) => o.value !== ".");
    if (obs.length < 1) continue;

    const current = parseFloat(obs[0].value);
    if (isNaN(current)) continue;

    const prev = obs.length >= 2 ? parseFloat(obs[1].value) : NaN;
    const deltaPct = (!isNaN(prev) && prev !== 0)
      ? ((current - prev) / Math.abs(prev)) * 100
      : null;
    const direction: MacroSignal["direction"] =
      deltaPct == null ? "flat" : deltaPct > 0.1 ? "up" : deltaPct < -0.1 ? "down" : "flat";

    signals.push({
      id: s.id,
      label: s.label,
      value: current,
      delta: deltaPct,
      unit: s.unit,
      direction,
      date: obs[0].date,
      isAlert: deltaPct != null && Math.abs(deltaPct) >= s.alertThreshold,
      category: s.category ?? "macro",
    });
  }

  return signals;
}
