import type { NewsArticle } from "@/lib/types";

const GOOGLE_NEWS_RSS = "https://news.google.com/rss/search";

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function tagValue(item: string, tag: string): string {
  const match = item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

export function parseGoogleNewsRss(xml: string): NewsArticle[] {
  return xml
    .split("<item>")
    .slice(1)
    .map((item) => {
      const title = tagValue(item, "title");
      const url = tagValue(item, "link");
      const source = tagValue(item, "source") || "Google News";
      const pubDate = tagValue(item, "pubDate");
      const publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();
      return {
        title,
        url,
        source,
        publishedAt,
        relevanceScore: 0.65,
      };
    })
    .filter((article) => article.title && article.url);
}

export async function fetchGoogleNews(query: string, limit = 10): Promise<NewsArticle[]> {
  const params = new URLSearchParams({
    q: query,
    hl: "en-US",
    gl: "US",
    ceid: "US:en",
  });

  try {
    const res = await fetch(`${GOOGLE_NEWS_RSS}?${params.toString()}`, {
      headers: {
        Accept: "application/rss+xml,text/xml",
        "User-Agent": "Mozilla/5.0 MacroMap/2.0",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.warn(`[google-news] ${res.status} for ${query}`);
      return [];
    }

    return parseGoogleNewsRss(await res.text()).slice(0, limit);
  } catch (err) {
    console.warn(`[google-news] Fetch failed for ${query}:`, err);
    return [];
  }
}
