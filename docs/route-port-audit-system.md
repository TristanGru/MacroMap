# Route And Port Audit System

Last updated: 2026-04-26

This is the repeatable audit system for Macro Map route and port data. Use it whenever adding, editing, or reviewing entries in:

- `data/routes.ts`
- `data/ports.ts`
- `data/chokepoints.ts`
- `lib/types.ts`
- `scripts/audit-routes.js`

Current inventory, measured on 2026-04-26:

- 153 routes
- 118 ports and hubs
- Modes: 110 sea, 18 multimodal, 17 pipeline, 5 rail, 3 road
- Resource coverage: oil, LNG, gas, container, grain, coal, copper, lithium, cobalt, rare earths, strategic metals, iron ore, uranium, fertilizer

## Audit Goals

Every route should pass five checks:

1. It starts and ends at a plausible origin, destination, hub, terminal, field, mine, or inland logistics node.
2. Its waypoints connect into a believable physical corridor for the declared `transportMode`.
3. Its chokepoint list matches the actual route geometry and omits chokepoints that the route bypasses.
4. Its `resourceType`, `flowMbpd`, `routeStatus`, and `routeAccuracy` are honest enough for a user to trust the visualization.
5. Its port, chokepoint, and route claims are backed by recent primary or high-quality public sources.

## Source Ladder

Prefer these source types in order. Record the exact URL and access date in the route audit note when a claim is not obvious.

1. Government, intergovernmental, or authority sources
   - EIA World Oil Transit Chokepoints: https://www.eia.gov/international/content/analysis/special_topics/World_Oil_Transit_Chokepoints/
   - UNCTAD Review of Maritime Transport: https://unctad.org/publication/review-maritime-transport-2024
   - National Geospatial-Intelligence Agency World Port Index, usually linked through MARAD: https://www.maritime.dot.gov/data-reports/ports/list
   - Canal or port authority pages, such as Suez Canal Authority, Panama Canal Authority, Port of Rotterdam, Port of Singapore, etc.
   - National energy, mining, rail, port, pipeline, customs, or transport ministries.
2. Company or operator sources
   - Terminal operators, pipeline operators, mining companies, rail operators, shipping alliances, port annual reports.
3. Reputable data or trade sources
   - IEA, IRENA, USDA, USGS, World Bank, UN Comtrade, BIMCO, Clarksons summaries, Lloyd's List, Platts/S&P Global, Reuters.
4. News sources
   - Use news for live disruptions, recent reroutes, and announced projects. Do not use news as the only source for fixed geography when an official source exists.
5. Maps and geospatial checks
   - Google Maps, OpenStreetMap, MarineTraffic, AIS maps, and satellite imagery can validate geometry, but they should support, not replace, authoritative trade or infrastructure sources.

## Required Commands

Run from this `macro-map/` directory.

```powershell
npm run audit:routes
npm run lint
```

For a single route:

```powershell
$env:ROUTE_AUDIT_ROUTE='route-id-here'; npm run audit:routes
```

To include approximate and diversion warnings:

```powershell
$env:ROUTE_AUDIT_SHOW_WARNINGS='1'; npm run audit:routes
```

To audit non-sea physical corridors with the same land-crossing sampler:

```powershell
$env:ROUTE_AUDIT_MODES='sea,multimodal,pipeline,rail,road'; npm run audit:routes
```

Expected baseline on 2026-04-26:

```text
Route land-crossing audit: 0 critical segments, 1 approximate/diversion warnings
```

If this changes, inspect the new finding before accepting the data change.

## Audit Workflow

### 1. Inventory The Candidate

For each route, capture:

- `id`
- `name`
- `resourceType`
- `transportMode` or inferred default
- `routeStatus` or `primary`
- `routeAccuracy` or `approximate`
- `flowMbpd`
- origin waypoint and label
- destination waypoint and label
- `chokepointIds`
- all ports/hubs touched by exact coordinate match or clear comment label

Acceptance criteria:

- `id` is stable, lowercase, hyphenated, and specific.
- `name` says origin, destination, resource, and special status when relevant.
- `transportMode` is explicit for anything other than a normal sea route.
- Historical, planned, and diversion routes are marked with `routeStatus`.
- `routeAccuracy: "observed"` is used only when a route is known from a source, not when it is merely plausible.

### 2. Validate Endpoints Against Ports

Check the first and last waypoint against `data/ports.ts`.

Acceptance criteria:

- Maritime routes should begin/end at a port, terminal, offshore approach marker, or documented loading area.
- Pipeline, rail, road, and multimodal routes may begin/end at fields, mines, refineries, inland hubs, or border crossings, but those points must be represented in `PORTS` if users can focus or reason about them.
- Endpoint coordinates should match the relevant `PORTS` coordinate when that place exists in `ports.ts`.
- The endpoint port should include the route `resourceType` in `resourceTypes`.
- A generic demand hub is acceptable only when a precise terminal would be misleading or unavailable.

When adding a new endpoint, add or update a `PORTS` entry with:

- stable `id`
- clear `name`
- `[lon, lat]` coordinates
- `portType`
- all relevant `resourceTypes`
- one sentence explaining why it matters

### 3. Validate Waypoint Geometry

Inspect the route as a physical path, not just as a line on the globe.

Acceptance criteria by mode:

- Sea: waypoints stay over water except canal transits and offshore/port-adjacent tolerances.
- Pipeline: waypoints follow plausible land corridors and avoid impossible sea gaps unless the real pipeline is offshore or subsea.
- Rail: waypoints follow known rail corridors, break at ferry or sea legs if multimodal.
- Road: waypoints follow known highways or border crossings.
- Multimodal: every mode transition is plausible and labelled by a waypoint comment.

Use `npm run audit:routes` to catch long accidental land crossings. It samples sea segments against land polygons and excludes known canal touches and near-endpoint coastal contact.

Manual geometry checks:

- zoom each route in the app or a map tool
- verify no great-circle shortcut crosses a continent
- add intermediate waypoints around coastlines, capes, island chains, canals, and straits
- avoid waypoint gaps so large that the globe arc implies a different route
- for trans-Pacific routes, confirm antimeridian handling by checking longitudes around `180/-180`

### 4. Validate Chokepoint Connectivity

For every listed chokepoint:

- Confirm a waypoint exists at or near the chokepoint coordinate in `data/chokepoints.ts`.
- Confirm the route physically passes through the chokepoint.
- Confirm the chokepoint is relevant for the route's `resourceType`.

For every route geometry:

- Check whether it passes any chokepoint that is missing from `chokepointIds`.
- Check whether a diversion route deliberately avoids the chokepoint it is replacing.
- Check canals separately from straits: Suez, Panama, Turkish Straits, and SUMED-like pipeline bypasses need different treatment.

Known chokepoint reference values from EIA's March 3, 2026 chokepoint report:

- Strait of Malacca: 23.2 million b/d oil flows in 1H25
- Strait of Hormuz: 20.9 million b/d oil flows in 1H25
- Suez Canal and SUMED Pipeline: 4.9 million b/d oil flows in 1H25
- Bab el-Mandeb: 4.2 million b/d oil flows in 1H25
- Danish Straits: 4.9 million b/d oil flows in 1H25
- Turkish Straits: 3.7 million b/d oil flows in 1H25
- Panama Canal: 2.3 million b/d oil flows in FY2025
- Cape of Good Hope: 9.1 million b/d oil flows in 1H25

Use those as sanity checks for chokepoint scale, not as automatic route-level volumes.

### 5. Validate Resource And Flow Claims

`flowMbpd` is a normalized visualization weight for non-oil routes, but users will read it as magnitude. Be precise in comments or documentation when a value is normalized.

Acceptance criteria:

- Oil and liquids routes should be comparable to EIA, national export data, tanker tracking summaries, or operator capacity.
- LNG routes should be checked against liquefaction/import capacity and major trade direction, not oil Mbpd equivalence unless the app has a conversion note.
- Gas pipeline routes should use pipeline capacity or flow direction from operator/government sources.
- Container corridors should use TEU, port throughput, rail service scale, or trade-lane evidence, then map to a normalized `flowMbpd`.
- Grain, coal, iron ore, copper, lithium, uranium, fertilizer, rare earths, cobalt, and strategic metals should use tons/year, mine/export concentration, or strategic dependency evidence, then map to a normalized `flowMbpd`.
- If a route is aspirational or politically announced but not operational, mark `routeStatus: "planned"` and usually `routeAccuracy: "approximate"`.

### 6. Internet Research Protocol

Use web search during every substantive audit, especially if the route, volume, operator, status, or disruption could have changed.

Recommended search patterns:

```text
"<route origin>" "<route destination>" <resource> shipping route official
"<port name>" <resource> export terminal annual report
"<corridor name>" rail road port official map
"<chokepoint>" oil flows EIA <current year>
"<commodity>" exports "<country>" port <current year>
"<pipeline name>" capacity operator route map
site:eia.gov "<chokepoint or commodity>"
site:unctad.org maritime transport chokepoint "<route or commodity>"
site:maritime.dot.gov "World Port Index" "<port name>"
```

Research rules:

- Use the newest source when the fact is time-sensitive.
- Use exact dates in notes for disruption-driven route status.
- Cross-check major claims with two independent sources when feasible.
- Prefer official source data over secondary summaries.
- If sources conflict, mark the route approximate and add a note describing the conflict.
- Do not silently upgrade an approximate route to observed without source support.

### 7. Data Integrity Checks

Before accepting changes, check:

- all route IDs are unique
- all port IDs are unique
- all coordinates are `[lon, lat]`, not `[lat, lon]`
- longitude is between -180 and 180
- latitude is between -90 and 90
- route has at least two waypoints
- no adjacent duplicate waypoint unless intentionally marking a border or terminal overlap
- every `resourceType` is allowed by `ResourceType`
- every `transportMode`, `routeStatus`, and `routeAccuracy` matches `lib/types.ts`
- every `chokepointId` exists in `CHOKEPOINTS`
- every route endpoint has a nearby or exact port/hub unless it is intentionally offshore
- every port has at least one `resourceType`

### 8. Visual QA

Run the app and inspect routes after any material route edit.

```powershell
npm run dev -- --port 3000
```

Visual acceptance criteria:

- route arcs are visible and directionally sensible
- no route dives through a continent due to missing intermediate points
- chokepoints sit on the route where expected
- focus/search can find the edited route or port
- sidebar/resource filters still show the route under the right resource type
- overlapping routes remain readable enough to inspect

### 9. Audit Record Template

Use this template in PR notes, issue comments, or a local audit log.

```md
## Route Audit: <route-id>

Date:
Auditor:

### Data
- Name:
- Resource:
- Mode:
- Status:
- Accuracy:
- Flow:
- Origin:
- Destination:
- Chokepoints:

### Automated Checks
- `npm run audit:routes`:
- `npm run lint`:
- Single-route audit command:

### Connectivity
- Endpoint match:
- Port resource compatibility:
- Waypoint geometry:
- Chokepoint coverage:
- Missing/extra chokepoints:

### Research
- Source 1:
- Source 2:
- Source 3:
- Currentness notes:

### Decision
- Pass / Pass with warnings / Fail:
- Required fixes:
- Follow-up:
```

## Pass / Warning / Fail Rules

Pass:

- automated audit is clean
- route geometry is plausible
- endpoints and chokepoints are connected
- source support exists for material claims
- status and accuracy are honest

Pass with warnings:

- route is approximate but clearly useful
- route is planned, historical, or diversion-only
- flow value is normalized
- exact terminal is not known but the hub is directionally correct

Fail:

- route crosses land incorrectly
- endpoint is missing or wrong
- chokepoint list contradicts the geometry
- resource type is incompatible with the route/port
- planned or speculative route is presented as primary/observed
- important claim cannot be sourced

## Maintenance

Update this system when:

- `ShippingRoute`, `Port`, or `Chokepoint` types change
- new transport modes or resource types are added
- the automated checker gains new rules
- source standards change
- a route audit finds a repeatable failure mode worth codifying

After updates, run:

```powershell
npm run audit:routes
npm run lint
```

