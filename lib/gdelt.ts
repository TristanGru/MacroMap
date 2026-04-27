import type { NewsArticle } from "@/lib/types";
import { GDELT_FIXTURES } from "@/lib/gdelt.fixtures";
import { CHOKEPOINT_MAP } from "@/data/chokepoints";
import { fetchGoogleNews } from "@/lib/google-news";

interface GdeltArticle {
  title: string;
  url: string;
  domain: string;
  seendate: string;
  socialimage?: string;
}

interface GdeltResponse {
  articles?: GdeltArticle[];
}

const GDELT_BASE = "https://api.gdeltproject.org/api/v2/doc/doc";
const MAX_RECORDS = 10;
const FETCH_TIMEOUT_MS = 15000;

function parseGdeltDate(seendate: string): string {
  try {
    const y = seendate.slice(0, 4);
    const mo = seendate.slice(4, 6);
    const d = seendate.slice(6, 8);
    const h = seendate.slice(9, 11);
    const mi = seendate.slice(11, 13);
    const s = seendate.slice(13, 15);
    return `${y}-${mo}-${d}T${h}:${mi}:${s}Z`;
  } catch {
    return new Date().toISOString();
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fallbackQuery(name: string): string {
  if (name.startsWith("Strait of ")) return name.replace("Strait of ", "");
  if (name === "Turkish Straits") return "Bosphorus";
  if (name === "Danish Straits") return "Great Belt";
  if (name === "Bab el-Mandeb") return "Bab el Mandeb";
  return name;
}

function newsFallbackQuery(name: string): string {
  const aliases: Record<string, string> = {
    "Strait of Hormuz": '"Strait of Hormuz" OR Hormuz',
    "Bab-el-Mandeb": '"Bab el-Mandeb" OR "Bab-el-Mandeb" OR "Bab al-Mandeb" OR "Red Sea"',
    "Suez Canal": '"Suez Canal" OR Suez',
    "Strait of Malacca": '"Strait of Malacca" OR Malacca',
    "Turkish Straits": '"Turkish Straits" OR Bosphorus OR Dardanelles',
    "Danish Straits": '"Danish Straits" OR Oresund OR "Great Belt"',
    "Cape of Good Hope": '"Cape of Good Hope"',
    "Strait of Dover": '"Strait of Dover" OR "English Channel"',
    "Panama Canal": '"Panama Canal"',
    "Cape Horn": '"Cape Horn"',
  };
  const target = aliases[name] ?? `"${name}"`;
  return `(${target}) (shipping OR tanker OR vessel OR transit OR closed OR closure OR restricted OR reroute OR disruption OR attack) when:14d`;
}

function buildUrl(query: string): string {
  const params = new URLSearchParams({
    query,
    mode: "artlist",
    maxrecords: String(MAX_RECORDS),
    format: "json",
    startdatetime: new Date(Date.now() - 24 * 3600 * 1000)
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14),
    sort: "datedesc",
  });
  return `${GDELT_BASE}?${params.toString()}`;
}

async function fetchGdeltArticles(url: string, chokepointId: string): Promise<GdeltArticle[]> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      if (attempt > 1) await delay(2000);

      const res = await fetch(url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      if (!res.ok) {
        console.warn(`[gdelt] HTTP ${res.status} for ${chokepointId}`);
        if (res.status === 429 && attempt === 1) continue;
        return [];
      }

      const text = await res.text();
      if (!text || text.trim() === "") {
        console.warn(`[gdelt] Empty response for ${chokepointId} - possible silent 429`);
        if (attempt === 1) continue;
        return [];
      }

      let data: GdeltResponse;
      try {
        data = JSON.parse(text);
      } catch {
        console.warn(`[gdelt] JSON parse error for ${chokepointId}`);
        return [];
      }

      return data.articles ?? [];
    } catch (err) {
      console.error(`[gdelt] Fetch error for ${chokepointId} attempt ${attempt}:`, err);
      if (attempt === 2) return [];
    }
  }

  return [];
}

export async function queryGdelt(chokepointId: string): Promise<{
  articles: NewsArticle[];
  articleCount: number;
}> {
  if (process.env.NEXT_PUBLIC_USE_GDELT_FIXTURES === "true") {
    const fixture = GDELT_FIXTURES[chokepointId];
    if (fixture) {
      return {
        articles: fixture.articles.slice(0, 5),
        articleCount: fixture.articleCount,
      };
    }
    return { articles: [], articleCount: 0 };
  }

  const cp = CHOKEPOINT_MAP[chokepointId];
  if (!cp) {
    console.error(`[gdelt] Unknown chokepoint: ${chokepointId}`);
    return { articles: [], articleCount: 0 };
  }

  let raw = await fetchGdeltArticles(buildUrl(cp.gdeltQuery), chokepointId);
  if (raw.length === 0) {
    raw = await fetchGdeltArticles(buildUrl(fallbackQuery(cp.name)), chokepointId);
  }

  let articles: NewsArticle[] = raw.slice(0, 5).map((a) => ({
    title: a.title || "Untitled",
    url: a.url,
    source: a.domain || "Unknown",
    publishedAt: parseGdeltDate(a.seendate),
    relevanceScore: 0.7,
  }));

  if (articles.length === 0) {
    articles = await fetchGoogleNews(newsFallbackQuery(cp.name), 5);
  }

  return { articles, articleCount: Math.max(raw.length, articles.length) };
}

export async function queryAllChokepoints(): Promise<
  Record<string, { articles: NewsArticle[]; articleCount: number }>
> {
  const { CHOKEPOINTS } = await import("@/data/chokepoints");
  const results: Record<string, { articles: NewsArticle[]; articleCount: number }> = {};

  for (let i = 0; i < CHOKEPOINTS.length; i++) {
    const cp = CHOKEPOINTS[i];
    results[cp.id] = await queryGdelt(cp.id);
    if (i < CHOKEPOINTS.length - 1) {
      await delay(1200);
    }
  }

  return results;
}
