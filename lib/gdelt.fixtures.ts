import type { NewsArticle } from "@/lib/types";

/**
 * Static fixture data for local development.
 * Enabled when NEXT_PUBLIC_USE_GDELT_FIXTURES=true
 */
export interface GdeltFixture {
  articleCount: number;
  articles: NewsArticle[];
}

export const GDELT_FIXTURES: Record<string, GdeltFixture> = {
  "strait-hormuz": {
    articleCount: 14,
    articles: [
      {
        title: "Iran raises alert in Strait of Hormuz after US carrier deployment",
        url: "https://www.reuters.com/world/middle-east/iran-raises-alert-hormuz-2026-04-01/",
        source: "Reuters",
        publishedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        relevanceScore: 0.95,
        thumbnailUrl: undefined,
      },
      {
        title: "Tanker traffic through Hormuz down 8% as tensions mount",
        url: "https://www.bloomberg.com/energy/hormuz-tanker-traffic-2026-04-01/",
        source: "Bloomberg",
        publishedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        relevanceScore: 0.9,
        thumbnailUrl: undefined,
      },
      {
        title: "Saudi Arabia reroutes oil shipments amid Hormuz uncertainty",
        url: "https://www.ft.com/content/hormuz-reroute-2026",
        source: "Financial Times",
        publishedAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
        relevanceScore: 0.85,
        thumbnailUrl: undefined,
      },
      {
        title: "Brent crude spikes 4% on Hormuz closure fears",
        url: "https://www.wsj.com/articles/brent-crude-spikes-hormuz-2026",
        source: "Wall Street Journal",
        publishedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        relevanceScore: 0.82,
        thumbnailUrl: undefined,
      },
      {
        title: "IRGC patrol boats shadow US destroyer in Strait of Hormuz",
        url: "https://www.bbc.com/news/world-middle-east-hormuz-2026",
        source: "BBC News",
        publishedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        relevanceScore: 0.8,
        thumbnailUrl: undefined,
      },
    ],
  },
  "suez-canal": {
    articleCount: 5,
    articles: [
      {
        title: "Houthi drone attacks near Bab el-Mandeb force Suez Canal traffic delays",
        url: "https://www.reuters.com/world/middle-east/houthi-drones-suez-delay-2026/",
        source: "Reuters",
        publishedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        relevanceScore: 0.88,
        thumbnailUrl: undefined,
      },
      {
        title: "Suez Canal weekly transits fall 15% amid Red Sea security concerns",
        url: "https://www.ft.com/content/suez-transits-decline-2026",
        source: "Financial Times",
        publishedAt: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
        relevanceScore: 0.82,
        thumbnailUrl: undefined,
      },
      {
        title: "Shipping companies reassess Red Sea routes as Houthi threats continue",
        url: "https://www.bloomberg.com/shipping/red-sea-routes-2026",
        source: "Bloomberg",
        publishedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        relevanceScore: 0.77,
        thumbnailUrl: undefined,
      },
    ],
  },
  "strait-malacca": {
    articleCount: 1,
    articles: [
      {
        title: "Strait of Malacca handles record container traffic in Q1 2026",
        url: "https://www.lloydslist.com/malacca-record-traffic-2026",
        source: "Lloyd's List",
        publishedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        relevanceScore: 0.6,
        thumbnailUrl: undefined,
      },
    ],
  },
  // All other chokepoints return clean (0 or 1 article)
  "bab-el-mandeb": {
    articleCount: 7,
    articles: [
      {
        title: "Houthi anti-ship missile targets tanker near Bab-el-Mandeb",
        url: "https://www.reuters.com/world/bab-el-mandeb-attack-2026/",
        source: "Reuters",
        publishedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        relevanceScore: 0.92,
        thumbnailUrl: undefined,
      },
      {
        title: "Commercial vessels avoid Bab-el-Mandeb corridor, insurers warn",
        url: "https://www.bloomberg.com/shipping/bab-el-mandeb-insurance-2026",
        source: "Bloomberg",
        publishedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        relevanceScore: 0.86,
        thumbnailUrl: undefined,
      },
    ],
  },
  "turkish-straits": { articleCount: 2, articles: [] },
  "danish-straits": { articleCount: 0, articles: [] },
  "cape-horn": { articleCount: 1, articles: [] },
  "cape-good-hope": { articleCount: 0, articles: [] },
  "strait-dover": { articleCount: 1, articles: [] },
  "panama-canal": { articleCount: 2, articles: [] },
};
