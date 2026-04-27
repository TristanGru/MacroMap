import type { CountryTradeData, CountryTradeItem } from "@/lib/types";

const BASE_URL = "https://comtradeapi.un.org/data/v1/get/C/A/HS";
const DEFAULT_YEARS = ["2024", "2023", "2022"];

const REPORTER_CODES: Record<string, string> = {
  AGO: "24",
  ARE: "784",
  ARG: "32",
  AUS: "36",
  BEL: "56",
  BRA: "76",
  CAN: "124",
  CHL: "152",
  CHN: "156",
  COD: "180",
  DEU: "276",
  EGY: "818",
  GBR: "826",
  IDN: "360",
  IND: "356",
  IRN: "364",
  IRQ: "368",
  ITA: "380",
  JPN: "392",
  KAZ: "398",
  KOR: "410",
  MAR: "504",
  MEX: "484",
  MYS: "458",
  NGA: "566",
  NLD: "528",
  PAK: "586",
  PAN: "591",
  PER: "604",
  QAT: "634",
  RUS: "643",
  SAU: "682",
  SGP: "702",
  THA: "764",
  TUR: "792",
  TWN: "490",
  UKR: "804",
  USA: "842",
  VNM: "704",
  ZAF: "710",
};

interface ComtradeRecord {
  cmdCode?: string;
  cmdDesc?: string;
  partnerCode?: number | string;
  partnerDesc?: string;
  primaryValue?: number;
  netWgt?: number;
  refYear?: number | string;
}

interface ComtradeResponse {
  data?: ComtradeRecord[];
}

function cleanName(name: string | undefined): string {
  return (name ?? "Unknown")
    .replace(/^TOTAL\s*/i, "Total ")
    .replace(/\s+/g, " ")
    .trim();
}

function toItems(records: ComtradeRecord[], kind: "partner" | "product"): CountryTradeItem[] {
  const byName = new Map<string, CountryTradeItem>();

  for (const record of records) {
    const value = Number(record.primaryValue ?? 0);
    if (!Number.isFinite(value) || value <= 0) continue;
    const rawName = kind === "partner" ? record.partnerDesc : record.cmdDesc;
    const name = cleanName(rawName);
    if (!name || name === "World") continue;

    const existing = byName.get(name);
    if (existing) {
      existing.valueUsd += value;
    } else {
      byName.set(name, {
        name,
        valueUsd: value,
        code: kind === "partner" ? String(record.partnerCode ?? "") : record.cmdCode,
      });
    }
  }

  return [...byName.values()]
    .sort((a, b) => b.valueUsd - a.valueUsd)
    .slice(0, 8);
}

async function fetchComtradeRecords(
  reporterCode: string,
  period: string,
  flowCode: "X" | "M",
  mode: "partners" | "products",
  key: string,
): Promise<ComtradeRecord[]> {
  const params = new URLSearchParams({
    reporterCode,
    period,
    flowCode,
    maxRecords: "500",
    format: "json",
    includeDesc: "true",
  });

  if (mode === "partners") {
    params.set("cmdCode", "TOTAL");
  } else {
    params.set("cmdCode", "AG2");
    params.set("partnerCode", "0");
  }

  const url = `${BASE_URL}?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Cache-Control": "no-cache",
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    throw new Error(`UN Comtrade ${res.status} for ${reporterCode}/${period}/${flowCode}/${mode}`);
  }

  const json = (await res.json()) as ComtradeResponse;
  return Array.isArray(json.data) ? json.data : [];
}

async function fetchYear(iso3: string, reporterCode: string, year: string, key: string): Promise<CountryTradeData | null> {
  const [exportPartnersRaw, importPartnersRaw, exportsRaw, importsRaw] = await Promise.all([
    fetchComtradeRecords(reporterCode, year, "X", "partners", key),
    fetchComtradeRecords(reporterCode, year, "M", "partners", key),
    fetchComtradeRecords(reporterCode, year, "X", "products", key),
    fetchComtradeRecords(reporterCode, year, "M", "products", key),
  ]);

  const exportPartners = toItems(exportPartnersRaw, "partner");
  const importPartners = toItems(importPartnersRaw, "partner");
  const exports = toItems(exportsRaw, "product");
  const imports = toItems(importsRaw, "product");

  if (exportPartners.length + importPartners.length + exports.length + imports.length === 0) {
    return null;
  }

  return {
    iso3,
    year,
    source: "UN Comtrade",
    exports,
    imports,
    exportPartners,
    importPartners,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchCountryTradeData(iso3: string): Promise<CountryTradeData | null> {
  const key = process.env.UN_COMTRADE_API_KEY;
  if (!key) {
    console.warn("[comtrade] UN_COMTRADE_API_KEY not set - skipping country trade fetch");
    return null;
  }

  const normalizedIso = iso3.toUpperCase();
  const reporterCode = REPORTER_CODES[normalizedIso];
  if (!reporterCode) return null;

  for (const year of DEFAULT_YEARS) {
    try {
      const data = await fetchYear(normalizedIso, reporterCode, year, key);
      if (data) return data;
    } catch (err) {
      console.warn(`[comtrade] ${normalizedIso} ${year} failed:`, err);
    }
  }

  return null;
}
