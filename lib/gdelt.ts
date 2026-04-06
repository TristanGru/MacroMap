import type { NewsArticle } from "@/lib/types";
import { GDELT_FIXTURES } from "@/lib/gdelt.fixtures";
import { CHOKEPOINT_MAP } from "@/data/chokepoints";

/**
 * GDELT Doc API response shape (subset)
 */
interface GdeltArticle {
  title: string;
  url: string;
  domain: string;
  seendate: string; // "20260401T123000Z" format
  socialimage?: string;
}

interface GdeltResponse {
  articles?: GdeltArticle[];
}

const GDELT_BASE = "https://api.gdeltproject.org/api/v2/doc/doc";
const MAX_RECORDS = 10; // top 10, most recent first

function parseGdeltDate(seendate: string): string {
  // "20260401T123000Z" → ISO 8601
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

/**
 * Query GDELT for a single chokepoint.
 * Returns top 5 articles by recency, most recent first.
 * Respects 1000ms rate spacing (caller must enforce if batching).
 */
export async function queryGdelt(chokepointId: string): Promise<{
  articles: NewsArticle[];
  articleCount: number;
}> {
  // Fixture mode for local development
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

  const params = new URLSearchParams({
    query: cp.gdeltQuery,
    mode: "artlist",
    maxrecords: String(MAX_RECORDS),
    format: "json",
    // Last 24 hours
    startdatetime: (() => {
      const d = new Date(Date.now() - 24 * 3600 * 1000);
      return d.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
    })(),
    sort: "datedesc",
  });

  const url = `${GDELT_BASE}?${params.toString()}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (!res.ok) {
      console.warn(`[gdelt] HTTP ${res.status} for ${chokepointId}`);
      return { articles: [], articleCount: 0 };
    }

    const text = await res.text();
    if (!text || text.trim() === "") {
      // Silent 429 or empty response — treat as 0 articles
      console.warn(`[gdelt] Empty response for ${chokepointId} — possible silent 429`);
      return { articles: [], articleCount: 0 };
    }

    let data: GdeltResponse;
    try {
      data = JSON.parse(text);
    } catch {
      console.warn(`[gdelt] JSON parse error for ${chokepointId}`);
      return { articles: [], articleCount: 0 };
    }

    const raw = data.articles ?? [];
    const articleCount = raw.length;

    const articles: NewsArticle[] = raw.slice(0, 5).map((a) => ({
      title: a.title || "Untitled",
      url: a.url,
      source: a.domain || "Unknown",
      publishedAt: parseGdeltDate(a.seendate),
      relevanceScore: 0.7, // GDELT doesn't return scores in artlist mode
    }));

    return { articles, articleCount };
  } catch (err) {
    console.error(`[gdelt] Fetch error for ${chokepointId}:`, err);
    return { articles: [], articleCount: 0 };
  }
}

/**
 * Query all 10 chokepoints with 1000ms spacing between requests.
 * Returns a map of chokepointId → result.
 */
export async function queryAllChokepoints(): Promise<
  Record<string, { articles: NewsArticle[]; articleCount: number }>
> {
  const { CHOKEPOINTS } = await import("@/data/chokepoints");
  const results: Record<string, { articles: NewsArticle[]; articleCount: number }> = {};

  for (let i = 0; i < CHOKEPOINTS.length; i++) {
    const cp = CHOKEPOINTS[i];
    results[cp.id] = await queryGdelt(cp.id);
    if (i < CHOKEPOINTS.length - 1) {
      await delay(1000); // 1s spacing per GDELT rate limit guidance
    }
  }

  return results;
}
