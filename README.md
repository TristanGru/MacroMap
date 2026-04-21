# Macro Map

**Real-time disruption intelligence for global commodity chokepoints.**

Macro Map monitors the world's 10 most critical shipping chokepoints — Strait of Hormuz, Suez Canal, Bab-el-Mandeb, Malacca, and others — and surfaces stress signals before they move markets. It aggregates news volume (GDELT), conflict events (ACLED), disaster data (GDACS/USGS), and live oil prices (EIA) into a single live globe.

Built for anyone curious about how the global economy actually works — from macro investors and commodities traders to students just starting to understand why oil prices move when ships can't get through a strait.

---

## What it tracks

- **Disruption state** — each chokepoint is `clean`, `stressed`, or `disrupted`, updated every 15 minutes
- **News velocity** — GDELT article volume as a leading indicator of developing situations
- **Conflict events** — ACLED armed conflict data overlaid on shipping lanes
- **Natural disasters** — GDACS/USGS events near strategic waterways
- **Oil prices** — Brent & WTI live from EIA, with 30-day chart

## Data sources

| Source | What it provides | Refresh |
|--------|-----------------|---------|
| GDELT | News article volume per chokepoint | 15 min |
| ACLED | Armed conflict events | 15 min |
| GDACS / USGS | Disasters, earthquakes, floods | 15 min |
| EIA v2 | Brent + WTI spot prices | 24h |
| Oil Price API | Supplemental price data | 24h |

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Fixture data is on by default (`NEXT_PUBLIC_USE_GDELT_FIXTURES=true`) so the globe works without API keys.

## Environment variables

See `.env.example` for all required vars. For production you need:

- `EIA_API_KEY` — [eia.gov/opendata](https://eia.gov/opendata)
- `CRON_SECRET` — any UUID, used to authenticate the GitHub Actions cron
- `ACLED_EMAIL` / `ACLED_PASSWORD` — [acleddata.com](https://acleddata.com)
- `FIRMS_MAP_KEY` — NASA FIRMS fire/disaster data
- `FRED_API_KEY` — [fred.stlouisfed.org](https://fred.stlouisfed.org)

## Deploying

```bash
npx vercel --prod
```

Add env vars in Vercel dashboard. Then add `VERCEL_POLL_URL` and `CRON_SECRET` to GitHub Secrets — the Actions cron will poll every 15 minutes automatically.
