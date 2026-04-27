import type { PortWatchFlowEvidence, PortWatchRerouteSignal } from "@/lib/types";
import { kvGet, kvSet } from "@/lib/kv";

const DAILY_CHOKEPOINTS_CSV_URL =
  "https://portwatch.imf.org/api/download/v1/items/42132aa4e2fc4d41bdaf9a445f688931/csv?layers=0";

const CACHE_KEY = "macro-map:portwatch-flow:v4";
const CACHE_TTL_SEC = 15 * 60;

const APP_TO_PORTWATCH_ID: Record<string, string> = {
  "suez-canal": "chokepoint1",
  "panama-canal": "chokepoint2",
  "turkish-straits": "chokepoint3",
  "bab-el-mandeb": "chokepoint4",
  "strait-malacca": "chokepoint5",
  "strait-hormuz": "chokepoint6",
  "cape-good-hope": "chokepoint7",
  "strait-dover": "chokepoint9",
  "danish-straits": "chokepoint10",
  "cape-horn": "chokepoint21",
};

export const PORTWATCH_ENABLED_CHOKEPOINT_IDS = Object.keys(APP_TO_PORTWATCH_ID);

interface PortWatchRecord {
  date: string;
  portid: string;
  portname: string;
  total: number;
  tankers: number;
}

interface PortWatchSnapshot {
  evidence: Record<string, PortWatchFlowEvidence>;
  reroutes: PortWatchRerouteSignal[];
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function parseNumber(value: string | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parsePortWatchCsv(csv: string): PortWatchRecord[] {
  const lines = csv.trim().split(/\r?\n/);
  const header = lines.shift()?.split(",") ?? [];
  const index = new Map(header.map((name, i) => [name, i]));

  return lines
    .map((line) => {
      const cells = line.split(",");
      const rawDate = cells[index.get("date") ?? -1] ?? "";
      return {
        date: rawDate.slice(0, 10).replace(/\//g, "-"),
        portid: cells[index.get("portid") ?? -1] ?? "",
        portname: cells[index.get("portname") ?? -1] ?? "",
        total: parseNumber(cells[index.get("n_total") ?? -1]),
        tankers: parseNumber(cells[index.get("n_tanker") ?? -1]),
      };
    })
    .filter((record) => record.date && record.portid);
}

async function fetchPortWatchRecords(): Promise<PortWatchRecord[]> {
  const response = await fetch(DAILY_CHOKEPOINTS_CSV_URL, {
    headers: { Accept: "text/csv,*/*" },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    throw new Error(`PortWatch CSV ${response.status}`);
  }

  return parsePortWatchCsv(await response.text());
}

function recordsByPort(records: PortWatchRecord[]): Map<string, PortWatchRecord[]> {
  const byPort = new Map<string, PortWatchRecord[]>();
  for (const record of records) {
    const current = byPort.get(record.portid) ?? [];
    current.push(record);
    byPort.set(record.portid, current);
  }
  return byPort;
}

function buildEvidence(
  appChokepointId: string,
  byPort: Map<string, PortWatchRecord[]>
): PortWatchFlowEvidence | null {
  const portWatchId = APP_TO_PORTWATCH_ID[appChokepointId];
  if (!portWatchId) return null;

  const records = (byPort.get(portWatchId) ?? []).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const latest = records[0];
  const baseline = records.filter((record) => record.date < "2023-01-01");
  if (!latest || baseline.length === 0) return null;

  const baselineTotal = mean(baseline.map((record) => record.total));
  const baselineTankers = mean(baseline.map((record) => record.tankers));
  if (baselineTotal <= 0) return null;

  const ratio = latest.total / baselineTotal;
  const nearZeroAgainstMaterialBaseline = baselineTotal >= 15 && latest.total <= 5;
  const state =
    nearZeroAgainstMaterialBaseline || ratio <= 0.25
      ? "disrupted"
      : ratio <= 0.75
        ? "stressed"
        : "clean";

  return {
    source: "IMF PortWatch",
    portWatchId,
    portWatchName: latest.portname,
    state,
    latestDate: latest.date,
    latestTotal: latest.total,
    latestTankers: latest.tankers,
    baselineTotal: Math.round(baselineTotal),
    baselineTankers: Math.round(baselineTankers),
    ratio: Number(ratio.toFixed(3)),
    summary: `${latest.portname} transits ${latest.total}/day vs normal ${Math.round(
      baselineTotal
    )}/day`,
  };
}

function buildRerouteSignals(
  evidence: Record<string, PortWatchFlowEvidence>
): PortWatchRerouteSignal[] {
  const signals: PortWatchRerouteSignal[] = [];
  const suez = evidence["suez-canal"];
  const bab = evidence["bab-el-mandeb"];
  const cape = evidence["cape-good-hope"];
  const panama = evidence["panama-canal"];
  const capeHorn = evidence["cape-horn"];

  if (
    suez &&
    bab &&
    cape &&
    (suez.ratio <= 0.8 || bab.ratio <= 0.8) &&
    cape.ratio >= 1.25
  ) {
    const state =
      suez.state === "disrupted" || bab.state === "disrupted" ? "disrupted" : "stressed";
    signals.push({
      id: "red-sea-cape-good-hope",
      state,
      title: "Red Sea diversion toward Cape of Good Hope",
      summary: `Suez is at ${Math.round(suez.ratio * 100)}% of normal and Bab-el-Mandeb is at ${Math.round(
        bab.ratio * 100
      )}%, while Cape of Good Hope is at ${Math.round(cape.ratio * 100)}% of normal.`,
      impactedChokepointIds: ["suez-canal", "bab-el-mandeb"],
      diversionChokepointIds: ["cape-good-hope"],
      confidence: state === "disrupted" ? "high" : "medium",
    });
  }

  if (
    panama &&
    capeHorn &&
    panama.ratio <= 0.75 &&
    capeHorn.baselineTotal >= 15 &&
    capeHorn.ratio >= 1.25
  ) {
    signals.push({
      id: "panama-southern-cone-diversion",
      state: panama.state === "disrupted" ? "disrupted" : "stressed",
      title: "Panama diversion toward southern routes",
      summary: `Panama Canal is at ${Math.round(
        panama.ratio * 100
      )}% of normal while southern passage traffic is elevated at ${Math.round(
        capeHorn.ratio * 100
      )}% of normal.`,
      impactedChokepointIds: ["panama-canal"],
      diversionChokepointIds: ["cape-horn"],
      confidence: "medium",
    });
  }

  return signals;
}

async function fetchPortWatchSnapshot(): Promise<PortWatchSnapshot> {
  const records = await fetchPortWatchRecords();
  const byPort = recordsByPort(records);
  const evidence: Record<string, PortWatchFlowEvidence> = {};

  for (const appId of Object.keys(APP_TO_PORTWATCH_ID)) {
    const item = buildEvidence(appId, byPort);
    if (item) evidence[appId] = item;
  }

  return {
    evidence,
    reroutes: buildRerouteSignals(evidence),
  };
}

export async function getPortWatchSnapshot(): Promise<PortWatchSnapshot> {
  let cache: PortWatchSnapshot | null = null;

  try {
    cache = await kvGet<PortWatchSnapshot>(CACHE_KEY);
  } catch (err) {
    console.warn("[portwatch] KV read failed; fetching live:", err);
  }

  try {
    if (!cache) cache = await fetchPortWatchSnapshot();
  } catch (err) {
    console.warn("[portwatch] Failed to fetch flow evidence:", err);
    return { evidence: {}, reroutes: [] };
  }

  try {
    if (cache) {
      await kvSet(CACHE_KEY, cache, { ex: CACHE_TTL_SEC });
    }
  } catch (err) {
    console.warn("[portwatch] KV write failed after live fetch:", err);
  }

  return cache;
}

export async function getPortWatchFlowEvidence(
  chokepointId: string
): Promise<PortWatchFlowEvidence | null> {
  const snapshot = await getPortWatchSnapshot();
  return snapshot.evidence[chokepointId] ?? null;
}
