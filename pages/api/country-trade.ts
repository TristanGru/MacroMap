import type { NextApiRequest, NextApiResponse } from "next";
import { fetchCountryTradeData } from "@/lib/comtrade";
import { kvGet, kvSet } from "@/lib/kv";
import type { CountryTradeData } from "@/lib/types";

const CACHE_TTL_SEC = 60 * 60 * 24 * 30;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const iso3 = String(req.query.iso3 ?? "").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(iso3)) {
    return res.status(400).json({ error: "iso3 must be a 3-letter country code" });
  }

  const cacheKey = `macro-map:country-trade:${iso3}`;

  try {
    const cached = await kvGet<CountryTradeData>(cacheKey);
    if (cached) {
      res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
      return res.status(200).json(cached);
    }

    const data = await fetchCountryTradeData(iso3);
    if (!data) {
      return res.status(200).json(null);
    }

    await kvSet(cacheKey, data, { ex: CACHE_TTL_SEC });
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json(data);
  } catch (err) {
    console.error("[country-trade] Error:", err);
    return res.status(200).json(null);
  }
}
