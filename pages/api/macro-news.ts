import type { NextApiRequest, NextApiResponse } from "next";
import { kvGet, kvSet } from "@/lib/kv";
import { fetchGoogleNews } from "@/lib/google-news";
import type { NewsArticle } from "@/lib/types";

const CACHE_KEY = "macro-map:macro-news";
const CACHE_TTL_SEC = 15 * 60;
const GDELT_BASE = "https://api.gdeltproject.org/api/v2/doc/doc";
const QUERIES = ["oil", "shipping", "natural gas", "wheat", "copper"];
const GOOGLE_QUERIES = [
  '(oil OR Brent OR WTI OR "natural gas" OR wheat OR copper) (price OR supply OR exports OR disruption) when:1d',
  '("shipping" OR "Red Sea" OR "Suez Canal" OR "Strait of Hormuz" OR Panama) (disruption OR freight OR reroute OR port) when:3d',
];

interface GdeltArticle {
  title: string;
  url: string;
  domain: string;
  seendate: string;
}

interface GdeltResponse {
  articles?: GdeltArticle[];
}

function parseGdeltDate(seendate: string): string {
  try {
    return `${seendate.slice(0, 4)}-${seendate.slice(4, 6)}-${seendate.slice(6, 8)}T${seendate.slice(9, 11)}:${seendate.slice(11, 13)}:${seendate.slice(13, 15)}Z`;
  } catch {
    return new Date().toISOString();
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMacroQuery(query: string): Promise<NewsArticle[]> {
  const params = new URLSearchParams({
    query,
    mode: "artlist",
    maxrecords: "8",
    format: "json",
    startdatetime: new Date(Date.now() - 24 * 3600 * 1000)
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14),
    sort: "datedesc",
  });

  const res = await fetch(`${GDELT_BASE}?${params}`, {
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) {
    console.warn(`[macro-news] GDELT ${res.status} for ${query}`);
    return [];
  }

  const json = (await res.json()) as GdeltResponse;
  return (json.articles ?? []).map((article) => ({
    title: article.title || "Untitled",
    url: article.url,
    source: article.domain || "Unknown",
    publishedAt: parseGdeltDate(article.seendate),
    relevanceScore: 0.7,
  }));
}

async function fetchMacroNews(): Promise<NewsArticle[]> {
  const seen = new Set<string>();
  const articles: NewsArticle[] = [];

  for (const query of GOOGLE_QUERIES) {
    const results = await fetchGoogleNews(query, 12);
    for (const article of results) {
      if (seen.has(article.url)) continue;
      seen.add(article.url);
      articles.push({
        ...article,
        relevanceScore: Math.max(article.relevanceScore, 0.75),
      });
    }
  }

  if (articles.length >= 12) {
    return articles
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, 30);
  }

  for (const query of QUERIES) {
    try {
      const results = await fetchMacroQuery(query);
      for (const article of results) {
        if (seen.has(article.url)) continue;
        seen.add(article.url);
        articles.push(article);
      }
    } catch (err) {
      console.warn(`[macro-news] Fetch failed for ${query}:`, err);
    }
    await delay(1200);
  }

  return articles
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 30);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ articles: NewsArticle[]; fetchedAt: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ articles: [], fetchedAt: new Date().toISOString() });
  }

  try {
    const cached = await kvGet<{ articles: NewsArticle[]; fetchedAt: string }>(CACHE_KEY);
    if (cached) {
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=600");
      return res.status(200).json(cached);
    }

    const payload = {
      articles: await fetchMacroNews(),
      fetchedAt: new Date().toISOString(),
    };
    if (payload.articles.length > 0) {
      await kvSet(CACHE_KEY, payload, { ex: CACHE_TTL_SEC });
    }

    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=600");
    return res.status(200).json(payload);
  } catch (err) {
    console.error("[macro-news] Error:", err);
    return res.status(200).json({ articles: [], fetchedAt: new Date().toISOString() });
  }
}
