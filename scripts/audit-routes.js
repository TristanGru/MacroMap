/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const booleanPointInPolygon = require("@turf/boolean-point-in-polygon").default;
const { point } = require("@turf/helpers");

const ROOT = path.join(__dirname, "..");
const ROUTES_PATH = path.join(ROOT, "data", "routes.ts");
const PORTS_PATH = path.join(ROOT, "data", "ports.ts");
const LAND_PATH = path.join(
  ROOT,
  "node_modules",
  "globe.gl",
  "example",
  "datasets",
  "ne_110m_admin_0_countries.geojson"
);

function loadRoutes() {
  const source = fs
    .readFileSync(ROUTES_PATH, "utf8")
    .replace(/import type[^\n]+\n/, "")
    .replace(/export const ROUTES: ShippingRoute\[] =/, "const ROUTES =")
    .replace(/export const ROUTE_MAP:[\s\S]*$/, "global.ROUTES = ROUTES;");

  const context = { global: {} };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: ROUTES_PATH });
  return context.global.ROUTES;
}

function loadPorts() {
  const source = fs
    .readFileSync(PORTS_PATH, "utf8")
    .replace(/import type[^\n]+\n/, "")
    .replace(/export const PORTS: Port\[] =/, "const PORTS =");

  const context = { global: {} };
  vm.createContext(context);
  vm.runInContext(`${source}\nglobal.PORTS = PORTS;`, context, { filename: PORTS_PATH });
  return context.global.PORTS;
}

function normalizeLon(lon) {
  return ((lon + 540) % 360) - 180;
}

function interpolateLon(start, end, t) {
  let delta = end - start;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return normalizeLon(start + delta * t);
}

function loadLandFeatures() {
  return JSON.parse(fs.readFileSync(LAND_PATH, "utf8")).features;
}

function distanceKm(a, b) {
  const earthRadiusKm = 6371;
  const lat1 = a[1] * Math.PI / 180;
  const lat2 = b[1] * Math.PI / 180;
  const dLat = lat2 - lat1;
  const dLon = (normalizeLon(b[0] - a[0])) * Math.PI / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

function findLand(lon, lat, landFeatures) {
  const candidate = point([normalizeLon(lon), lat]);
  for (const feature of landFeatures) {
    if (booleanPointInPolygon(candidate, feature)) {
      return feature.properties.ADMIN || feature.properties.NAME || "land";
    }
  }
  return null;
}

function sampleSegment(start, end, landFeatures) {
  const rawLonDelta = Math.abs(end[0] - start[0]);
  const lonDelta = rawLonDelta > 180 ? 360 - rawLonDelta : rawLonDelta;
  const steps = Math.max(30, Math.ceil(Math.hypot(lonDelta, end[1] - start[1]) * 8));
  const hits = [];
  let previousLand = null;
  let currentRun = null;
  const runs = [];

  for (let i = 4; i < steps - 4; i += 1) {
    const t = i / steps;
    const lon = interpolateLon(start[0], end[0], t);
    const lat = start[1] + (end[1] - start[1]) * t;
    const land = findLand(lon, lat, landFeatures);
    if (land) {
      const sample = { land, t, coord: [lon, lat] };
      hits.push(sample);
      if (previousLand === land && currentRun) {
        currentRun.samples.push(sample);
      } else {
        currentRun = { land, samples: [sample] };
        runs.push(currentRun);
      }
    } else {
      currentRun = null;
    }
    previousLand = land;
  }

  return { hits, runs, steps };
}

function loadKnownEndpointKeys(ports) {
  return new Set(ports.map((port) => `${port.coordinates[0].toFixed(2)},${port.coordinates[1].toFixed(2)}`));
}

function isKnownEndpoint(coord, knownEndpointKeys) {
  return knownEndpointKeys.has(`${coord[0].toFixed(2)},${coord[1].toFixed(2)}`);
}

function isCanalLandTouch(route, country) {
  return (
    (route.chokepointIds.includes("suez-canal") && country === "Egypt") ||
    (route.chokepointIds.includes("panama-canal") && country === "Panama") ||
    (route.chokepointIds.includes("turkish-straits") && country === "Turkey")
  );
}

function summarizeRuns(route, start, end, runs, knownEndpointKeys, toleranceKm) {
  return runs
    .map((run) => {
      const samples = run.samples.filter((sample) => {
        if (isCanalLandTouch(route, sample.land)) return false;
        const nearEndpoint =
          distanceKm(sample.coord, start) < toleranceKm ||
          distanceKm(sample.coord, end) < toleranceKm;
        const endpointIsKnown = isKnownEndpoint(start, knownEndpointKeys) || isKnownEndpoint(end, knownEndpointKeys);
        return !(nearEndpoint && endpointIsKnown);
      });

      if (samples.length === 0) return null;
      const first = samples[0].coord;
      const last = samples[samples.length - 1].coord;
      return {
        country: run.land,
        samples,
        distanceKm: Math.max(distanceKm(first, last), samples.length > 1 ? distanceKm(start, end) / samples.length : 0),
      };
    })
    .filter(Boolean);
}

function auditRoutes() {
  const routes = loadRoutes();
  const ports = loadPorts();
  const landFeatures = loadLandFeatures();
  const knownEndpointKeys = loadKnownEndpointKeys(ports);
  const minHits = Number(process.env.ROUTE_AUDIT_MIN_HITS || 12);
  const minRatio = Number(process.env.ROUTE_AUDIT_MIN_RATIO || 0.18);
  const minRunKm = Number(process.env.ROUTE_AUDIT_MIN_RUN_KM || 1500);
  const coastalToleranceKm = Number(process.env.ROUTE_AUDIT_COASTAL_TOLERANCE_KM || 120);
  const limit = Number(process.env.ROUTE_AUDIT_LIMIT || 80);
  const routeFilter = process.env.ROUTE_AUDIT_ROUTE;
  const modes = (process.env.ROUTE_AUDIT_MODES || "sea")
    .split(",")
    .map((mode) => mode.trim())
    .filter(Boolean);
  const findings = [];
  const warnings = [];

  for (const route of routes) {
    const transportMode = route.transportMode || (route.resourceType === "gas" ? "pipeline" : "sea");
    if (!modes.includes(transportMode)) continue;
    if (routeFilter && route.id !== routeFilter) continue;
    for (let i = 0; i < route.waypoints.length - 1; i += 1) {
      const start = route.waypoints[i];
      const end = route.waypoints[i + 1];
      const { hits, runs, steps } = sampleSegment(start, end, landFeatures);
      const actionableRuns = summarizeRuns(route, start, end, runs, knownEndpointKeys, coastalToleranceKm);
      const actionableHits = actionableRuns.reduce((sum, run) => sum + run.samples.length, 0);
      const maxRunKm = Math.max(0, ...actionableRuns.map((run) => run.distanceKm));
      const ratio = actionableHits / steps;
      if (actionableHits >= minHits && ratio >= minRatio && maxRunKm >= minRunKm) {
        const finding = {
          routeId: route.id,
          routeName: route.name,
          resourceType: route.resourceType,
          routeStatus: route.routeStatus || "primary",
          routeAccuracy: route.routeAccuracy || "approximate",
          segmentIndex: i,
          start,
          end,
          hitRatio: ratio,
          maxRunKm,
          countries: [...new Set(actionableRuns.map((run) => run.country))].slice(0, 5),
        };
        if (finding.routeAccuracy === "approximate" || finding.routeStatus === "diversion") {
          warnings.push(finding);
        } else {
          findings.push(finding);
        }
      }
    }
  }

  findings.sort((a, b) => b.hitRatio - a.hitRatio);
  warnings.sort((a, b) => b.hitRatio - a.hitRatio);
  console.log(
    `Route land-crossing audit${routeFilter ? ` for ${routeFilter}` : ""}: ` +
      `${findings.length} critical segments, ${warnings.length} approximate/diversion warnings ` +
      `(modes ${modes.join(",")}, min hits ${minHits}, min ratio ${minRatio}, min run ${minRunKm}km)`
  );

  for (const finding of findings.slice(0, limit)) {
    console.log(
      [
        `${(finding.hitRatio * 100).toFixed(0)}%`,
        finding.routeId,
        `segment ${finding.segmentIndex}`,
        `${finding.maxRunKm.toFixed(0)}km land run`,
        finding.countries.join(", "),
        `${JSON.stringify(finding.start)} -> ${JSON.stringify(finding.end)}`,
      ].join(" | ")
    );
  }

  if (findings.length > limit) {
    console.log(`... ${findings.length - limit} more flagged segments hidden`);
  }

  if (warnings.length > 0) {
    console.log(`Warnings are approximate or diversion corridors; review with ROUTE_AUDIT_SHOW_WARNINGS=1.`);
  }

  if (process.env.ROUTE_AUDIT_SHOW_WARNINGS === "1") {
    for (const finding of warnings.slice(0, limit)) {
      console.log(
        [
          `warning ${(finding.hitRatio * 100).toFixed(0)}%`,
          finding.routeId,
          `segment ${finding.segmentIndex}`,
          `${finding.maxRunKm.toFixed(0)}km land run`,
          finding.countries.join(", "),
          `${JSON.stringify(finding.start)} -> ${JSON.stringify(finding.end)}`,
        ].join(" | ")
      );
    }
  }

  if (findings.length > 0) process.exitCode = 1;
}

auditRoutes();
