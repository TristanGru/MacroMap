# API Provider Inventory

Working notes for Macro Map data sources. Do not store API keys here; keep secrets in Vercel environment variables and local `.env.local`.

## Active Providers

| Provider | Used for | Auth | Env var |
| --- | --- | --- | --- |
| IMF PortWatch | AIS-based chokepoint transit counts, observed flow drops, rerouting signals | None | None |
| GDELT Doc API | Chokepoint and macro news monitoring | None | `NEXT_PUBLIC_USE_GDELT_FIXTURES` only controls fixture mode |
| Google News RSS | Fallback macro/chokepoint headlines when GDELT is sparse | None | None |
| ACLED | Conflict events near chokepoints | Account credentials | `ACLED_EMAIL`, `ACLED_PASSWORD` |
| USGS Earthquake GeoJSON | Recent earthquake events | None | None |
| GDACS | Global disaster alerts | None | None |
| NASA FIRMS | Wildfire detections | Free map key | `FIRMS_MAP_KEY` |
| EIA v2 | Brent/WTI and energy reference data | Free API key | `EIA_API_KEY` |
| Yahoo Finance chart API | Commodity futures fallback/live visible prices | None | None |
| Oil Price API | Supplemental Brent, WTI, gas, wheat, copper prices | API key | `OIL_PRICE_API_KEY` |
| FRED | Macro indicators | Free API key | `FRED_API_KEY` |
| USDA NASS QuickStats | Crop/agriculture signals | Free API key | `USDA_NASS_API_KEY` |
| UN Comtrade | Country trade products and partners in country profiles | Free Basic Individual API key | `UN_COMTRADE_API_KEY` |
| Trading Economics | Baltic Dry Index fallback/reference | Optional free tier | currently not in Vercel list unless re-enabled |
| Upstash Redis / Vercel KV | Server cache for prices, disruptions, events, PortWatch snapshots | Vercel integration | `KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc. |

## Candidate Providers Mentioned

| Provider | Possible use | Auth / cost notes | URL |
| --- | --- | --- | --- |
| VesselAPI | Live AIS positions, area queries, port events, arrivals/departures | Free tier advertised; likely API key | https://vesselapi.com/ |
| aisstream.io | Real-time AIS websocket for custom chokepoint geofence counts | Free API key; needs listener/aggregator | https://aisstream.io/ |
| AISHub | Real-time AIS sharing network/API | Usually registration/participation required | https://www.aishub.net/ |
| MarineTraffic | AIS, vessel positions, port congestion | Commercial; useful reference | https://www.marinetraffic.com/ |
| Baltic Exchange | Official Baltic Dry Index reference | Mostly commercial/reference | https://www.balticexchange.com/ |
| UNCTADstat | Maritime transport and trade context | Mostly public datasets | https://unctadstat.unctad.org/ |
| UN Comtrade | Commodity trade flows | Public/free with limits | https://comtradeplus.un.org/ |
| World Bank WITS | Trade flow cross-checks | Public | https://wits.worldbank.org/ |
| Observatory of Economic Complexity | Country/product trade profiles, top partners, export/import composition | Many historical endpoints available without auth; latest/pro features require subscription | https://oec.world/en/resources/api |
| IEA Critical Minerals Data Explorer | Critical mineral production/refining/trade context | Public | https://www.iea.org/data-and-statistics/data-tools/critical-minerals-data-explorer |
| USGS Mineral Commodity Summaries | Minerals supply context | Public | https://www.usgs.gov/science/science-explorer/minerals/mineral-commodities |

## Useful PortWatch Endpoints

- Catalog: `https://portwatch.imf.org/api/search/v1/collections`
- Daily chokepoint CSV: `https://portwatch.imf.org/api/download/v1/items/42132aa4e2fc4d41bdaf9a445f688931/csv?layers=0`
- Chokepoint metadata service: `https://services9.arcgis.com/weJ1QsnbMYJlCHdG/arcgis/rest/services/PortWatch_chokepoints_database/FeatureServer`
- Disruptions service: `https://services9.arcgis.com/weJ1QsnbMYJlCHdG/arcgis/rest/services/portwatch_disruptions_database/FeatureServer`

## PortWatch Next Additions

PortWatch is already used in the app for observed chokepoint transit counts and inferred rerouting signals. That is different from ingesting PortWatch's official disruption-event records.

High-quality next additions:

- Official PortWatch disruption events: ingest the PortWatch disruptions service and add records to the feed/sidebar as official observed disruption evidence. This should help distinguish real operational disruptions from generic negative news.
- Port-level disruption indicators: search the PortWatch catalog for port-specific congestion, downtime, or disruption layers that can support port status instead of marking ports disrupted from weak article sentiment.
- Middle East chokepoint cross-checks: use the IEA Middle East Maritime Chokepoints Monitor as a secondary reference for Hormuz, Bab-el-Mandeb, Red Sea/Suez, and regional diversion context.

Implementation note: prefer PortWatch official events over text-only GDELT evidence when both are available. Use news as supporting context, not the sole reason to mark a chokepoint or port disrupted.

## Trade Data Next Addition

Best near-term fit: Observatory of Economic Complexity API.

- Why: country/product trade profiles map cleanly to the new country panels: top exports, imports, destinations, origins, and product composition.
- Cost/auth: OEC documents unauthenticated access for many basic/historical trade-flow and metadata queries. Latest data and advanced/subnational endpoints move to Pro/Premium.
- Product fit: use it to replace curated country exports/imports/trade partners with server-fetched baseline data, cached in KV, while keeping our curated macro interpretation layer.
- Suggested env var if we later need authenticated calls: `OEC_API_TOKEN`.

Secondary option: UN Comtrade API.

- Why: official source for detailed merchandise trade by reporter, partner, product, and flow.
- Cost/auth: free API product exists after developer registration; third-party wrapper docs describe 500 calls/day and up to 100,000 records/call with a valid token.
- Tradeoff: more official and granular, but more awkward to integrate for a polished UX than OEC country/profile-style endpoints.
- Suggested env var: `UN_COMTRADE_API_KEY`.

WITS remains useful for country-level trade-stat cross-checks and tariff/NTM context, but its API docs emphasize aggregate trade/tariff indicators more than the country-profile UX we want first.

## Notes

- PortWatch is currently the best free source for observed maritime flow. It is used for chokepoint state, confidence, and rerouting detection.
- GDELT and Google News are text evidence. PortWatch is observed activity evidence. The app should prefer observed flow for state confidence when available.
- GitHub does not need provider secrets unless a GitHub Action directly calls production refresh endpoints. Vercel needs the runtime provider keys.
