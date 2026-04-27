import type { MacroSignal } from "@/lib/types";

interface USDMRecord {
  MapDate?: string;
  mapDate?: string;
  None?: number | string;
  none?: number | string;
  D0?: number | string;
  d0?: number | string;
  D1?: number | string;
  d1?: number | string;
  D2?: number | string;
  d2?: number | string;
  D3?: number | string;
  d3?: number | string;
  D4?: number | string;
  d4?: number | string;
}

function numberValue(value: number | string | undefined): number {
  if (typeof value === "number") return value;
  return Number(String(value ?? "0").replace(/,/g, ""));
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function parseUsdmPayload(raw: string): USDMRecord[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('"')) {
    return parseUsdmPayload(JSON.parse(trimmed) as string);
  }

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [];
  }

  const lines = trimmed.split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index]])) as unknown as USDMRecord;
  });
}

function severeDroughtPct(record: USDMRecord): number {
  const none = numberValue(record.None ?? record.none);
  const d0 = numberValue(record.D0 ?? record.d0);
  const d1 = numberValue(record.D1 ?? record.d1);
  const d2 = numberValue(record.D2 ?? record.d2);
  const d3 = numberValue(record.D3 ?? record.d3);
  const d4 = numberValue(record.D4 ?? record.d4);
  const total = none + d0 + d1 + d2 + d3 + d4;
  if (total <= 0) return 0;
  return Number((((d2 + d3 + d4) / total) * 100).toFixed(1));
}

/**
 * Fetches US national drought conditions from the US Drought Monitor.
 * No API key required. Published weekly.
 */
export async function fetchDroughtSignal(): Promise<MacroSignal | null> {
  try {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 21);

    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const url =
      "https://usdmdataservices.unl.edu/api/USStatistics/GetDroughtSeverityStatisticsByArea" +
      `?aoi=conus&startdate=${fmt(start)}&enddate=${fmt(end)}&statisticsType=1`;

    const res = await fetch(url, {
      headers: { Accept: "application/json,text/csv" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;

    const data = parseUsdmPayload(await res.text());
    if (data.length === 0) return null;

    const sorted = data.sort((a, b) =>
      String(b.MapDate ?? b.mapDate).localeCompare(String(a.MapDate ?? a.mapDate))
    );
    const latest = sorted[0];
    const prev = sorted[1] ?? null;

    const severePct = severeDroughtPct(latest);
    const prevSeverePct = prev ? severeDroughtPct(prev) : severePct;
    const delta = Number((severePct - prevSeverePct).toFixed(1));
    const direction: MacroSignal["direction"] =
      delta > 0.5 ? "up" : delta < -0.5 ? "down" : "flat";

    const rawDate = String(latest.MapDate ?? latest.mapDate);
    const date = rawDate.includes("T")
      ? rawDate.slice(0, 10)
      : `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;

    return {
      id: "usdm-drought",
      label: "US Drought (D2+)",
      value: severePct,
      delta,
      unit: "%",
      direction,
      date,
      isAlert: severePct > 30,
      category: "agriculture",
    };
  } catch (err) {
    console.warn("[drought] Fetch error:", err);
    return null;
  }
}
