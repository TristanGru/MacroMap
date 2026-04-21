import type { ShippingRoute } from "@/lib/types";

/**
 * Major global shipping routes.
 * Waypoints are [lon, lat] coordinate pairs tracing the route path.
 * flowMbpd defaults to 10 for non-oil routes (container/grain/copper/coal
 * don't have standard Mbpd equivalents — 10 is a normalized default).
 */
export const ROUTES: ShippingRoute[] = [
  // ── OIL ROUTES ──────────────────────────────────────────────────────
  {
    id: "persian-gulf-europe-oil",
    name: "Persian Gulf → Europe (Oil)",
    resourceType: "oil",
    flowMbpd: 21,
    chokepointIds: ["strait-hormuz", "bab-el-mandeb", "suez-canal"],
    waypoints: [
      [56.45, 26.57],  // Strait of Hormuz
      [57.5, 23.0],    // Gulf of Oman
      [60.0, 18.0],    // Arabian Sea NW
      [51.0, 12.5],    // Gulf of Aden
      [43.45, 12.6],   // Bab-el-Mandeb
      [42.0, 15.0],    // Red Sea S
      [36.0, 22.0],    // Red Sea N
      [32.35, 30.45],  // Suez Canal
      [32.0, 32.0],    // Med entry
      [25.0, 33.5],    // Eastern Med
      [14.0, 37.0],    // Central Med
      [5.0, 36.5],     // Western Med
      [-5.0, 36.0],    // Gibraltar
      [-9.5, 38.7],    // Atlantic off Lisbon
      [-5.0, 48.5],    // Bay of Biscay
      [2.0, 51.5],     // English Channel
      [4.5, 52.5],     // Rotterdam approach
    ],
  },
  {
    id: "persian-gulf-europe-cape",
    name: "Persian Gulf → Europe (via Cape)",
    resourceType: "oil",
    flowMbpd: 5,
    chokepointIds: ["strait-hormuz", "cape-good-hope"],
    waypoints: [
      [56.45, 26.57],  // Strait of Hormuz
      [60.0, 18.0],    // Arabian Sea
      [65.0, 10.0],    // Indian Ocean W
      [55.0, -5.0],    // Indian Ocean Central
      [40.0, -20.0],   // S Indian Ocean
      [25.0, -30.0],   // Approaching Cape
      [18.47, -34.36], // Cape of Good Hope
      [5.0, -35.0],    // S Atlantic
      [-5.0, -15.0],   // S Atlantic N
      [-10.0, 0.0],    // Equator Atlantic
      [-12.0, 15.0],   // N Atlantic
      [-10.0, 30.0],   // Atlantic N
      [-9.5, 38.7],    // Off Lisbon
      [4.5, 52.5],     // Rotterdam
    ],
  },
  {
    id: "persian-gulf-asia-oil",
    name: "Persian Gulf → Asia (Oil)",
    resourceType: "oil",
    flowMbpd: 16,
    chokepointIds: ["strait-hormuz", "strait-malacca"],
    waypoints: [
      [56.45, 26.57],  // Strait of Hormuz
      [62.0, 20.0],    // Arabian Sea E
      [72.0, 12.0],    // Indian Ocean N
      [80.0, 7.0],     // Indian Ocean NE
      [90.0, 5.0],     // Bay of Bengal
      [98.0, 3.0],     // Andaman Sea
      [103.85, 1.25],  // Strait of Malacca
      [108.0, 5.0],    // S China Sea S
      [114.0, 15.0],   // S China Sea
      [120.0, 22.0],   // Taiwan Strait
      [121.5, 25.0],   // N of Taiwan
      [122.0, 31.0],   // E China Sea → Shanghai
    ],
  },
  // ── LNG ROUTES ──────────────────────────────────────────────────────
  {
    id: "qatar-europe-lng",
    name: "Qatar LNG → Europe",
    resourceType: "lng",
    flowMbpd: 4,
    chokepointIds: ["strait-hormuz", "bab-el-mandeb", "suez-canal"],
    waypoints: [
      [51.0, 25.5],    // Qatar
      [56.45, 26.57],  // Strait of Hormuz
      [58.0, 22.0],    // Gulf of Oman
      [51.0, 12.5],    // Gulf of Aden
      [43.45, 12.6],   // Bab-el-Mandeb
      [36.0, 22.0],    // Red Sea N
      [32.35, 30.45],  // Suez Canal
      [14.0, 37.0],    // Central Med
      [-5.0, 36.0],    // Gibraltar
      [4.5, 52.5],     // Rotterdam
    ],
  },
  {
    id: "us-gulf-europe-lng",
    name: "US Gulf Coast LNG → Europe",
    resourceType: "lng",
    flowMbpd: 3,
    chokepointIds: ["strait-dover"],
    waypoints: [
      [-90.0, 29.0],   // US Gulf Coast
      [-80.0, 26.0],   // Florida
      [-65.0, 32.0],   // Bermuda
      [-40.0, 40.0],   // Mid-Atlantic
      [-20.0, 48.0],   // N Atlantic
      [-10.0, 50.0],   // W of Ireland
      [1.5, 51.12],    // Strait of Dover
      [4.5, 52.5],     // Rotterdam
    ],
  },
  // ── CONTAINER ROUTES ────────────────────────────────────────────────
  {
    id: "asia-europe-container",
    name: "Asia → Europe (Containers)",
    resourceType: "container",
    flowMbpd: 12,
    chokepointIds: ["strait-malacca", "bab-el-mandeb", "suez-canal", "strait-dover"],
    waypoints: [
      [121.5, 31.0],   // Shanghai
      [120.0, 22.0],   // Taiwan Strait
      [114.0, 15.0],   // S China Sea
      [108.0, 5.0],    // S China Sea S
      [103.85, 1.25],  // Strait of Malacca
      [95.0, 5.0],     // Andaman Sea
      [80.0, 7.0],     // Bay of Bengal W
      [72.0, 12.0],    // Indian Ocean N
      [60.0, 12.0],    // Arabian Sea W
      [51.0, 12.5],    // Gulf of Aden
      [43.45, 12.6],   // Bab-el-Mandeb
      [36.0, 22.0],    // Red Sea N
      [32.35, 30.45],  // Suez Canal
      [14.0, 37.0],    // Central Med
      [5.0, 36.5],     // Western Med
      [-5.0, 36.0],    // Gibraltar
      [1.5, 51.12],    // Strait of Dover
      [4.5, 52.5],     // Rotterdam
    ],
  },
  {
    id: "asia-europe-container-cape",
    name: "Asia → Europe (via Cape, rerouted)",
    resourceType: "container",
    flowMbpd: 6,
    chokepointIds: ["strait-malacca", "cape-good-hope"],
    waypoints: [
      [121.5, 31.0],   // Shanghai
      [114.0, 15.0],   // S China Sea
      [103.85, 1.25],  // Strait of Malacca
      [90.0, -5.0],    // Indian Ocean
      [70.0, -15.0],   // Indian Ocean S
      [50.0, -25.0],   // Indian Ocean SW
      [30.0, -32.0],   // Approaching Cape
      [18.47, -34.36], // Cape of Good Hope
      [0.0, -35.0],    // S Atlantic
      [-10.0, -15.0],  // S Atlantic N
      [-12.0, 5.0],    // Atlantic
      [-10.0, 30.0],   // N Atlantic
      [-5.0, 48.5],    // Bay of Biscay
      [4.5, 52.5],     // Rotterdam
    ],
  },
  {
    id: "americas-asia-container",
    name: "Americas → Asia (Containers via Panama)",
    resourceType: "container",
    flowMbpd: 8,
    chokepointIds: ["panama-canal"],
    waypoints: [
      [-74.0, 40.7],   // New York
      [-75.0, 35.0],   // US East Coast S
      [-80.0, 27.0],   // Florida
      [-82.0, 23.0],   // Caribbean
      [-79.92, 9.08],  // Panama Canal
      [-90.0, 8.0],    // Pacific off C. America
      [-100.0, 15.0],  // E Pacific
      [-120.0, 20.0],  // Pacific Central
      [-140.0, 25.0],  // Pacific W
      [-160.0, 30.0],  // Pacific NW
      [140.0, 35.0],   // Japan
      [121.5, 31.0],   // Shanghai
    ],
  },
  {
    id: "americas-asia-container-horn",
    name: "Americas → Asia (via Cape Horn)",
    resourceType: "container",
    flowMbpd: 3,
    chokepointIds: ["cape-horn"],
    waypoints: [
      [-74.0, 40.7],   // New York
      [-75.0, 20.0],   // Caribbean
      [-70.0, -10.0],  // S America coast
      [-65.0, -35.0],  // S Atlantic
      [-65.0, -50.0],  // Approaching Horn
      [-67.28, -55.98],// Cape Horn
      [-75.0, -55.0],  // S Pacific
      [-85.0, -45.0],  // SE Pacific
      [-90.0, -30.0],  // Pacific
      [-100.0, -15.0], // Pacific N
      [-120.0, -5.0],  // Pacific Equator
      [-130.0, 10.0],  // Pacific N
      [-140.0, 25.0],  // Pacific NW
      [140.0, 35.0],   // Japan
    ],
  },
  // ── GRAIN ROUTES ─────────────────────────────────────────────────────
  {
    id: "black-sea-europe-grain",
    name: "Black Sea → Global (Grain)",
    resourceType: "grain",
    flowMbpd: 5,
    chokepointIds: ["turkish-straits", "strait-dover"],
    waypoints: [
      [33.0, 46.0],    // Odessa/Black Sea
      [29.02, 41.13],  // Turkish Straits (Bosphorus)
      [26.0, 39.0],    // Aegean Sea
      [22.0, 35.0],    // Eastern Med
      [14.0, 37.0],    // Central Med
      [5.0, 36.5],     // Western Med
      [-5.0, 36.0],    // Gibraltar
      [-10.0, 40.0],   // Atlantic
      [1.5, 51.12],    // Strait of Dover
      [4.5, 52.5],     // Rotterdam
    ],
  },
  {
    id: "black-sea-asia-grain",
    name: "Black Sea → Asia (Grain via Suez)",
    resourceType: "grain",
    flowMbpd: 3,
    chokepointIds: ["turkish-straits", "suez-canal", "bab-el-mandeb"],
    waypoints: [
      [33.0, 46.0],    // Odessa
      [29.02, 41.13],  // Turkish Straits
      [26.0, 36.0],    // E Med
      [32.35, 30.45],  // Suez Canal
      [36.0, 22.0],    // Red Sea
      [43.45, 12.6],   // Bab-el-Mandeb
      [60.0, 12.0],    // Arabian Sea
      [80.0, 15.0],    // Indian Ocean N
      [103.85, 1.25],  // Malacca
      [121.5, 31.0],   // Shanghai
    ],
  },
  // ── COAL ROUTES ──────────────────────────────────────────────────────
  {
    id: "australia-asia-coal",
    name: "Australia → Asia (Coal)",
    resourceType: "coal",
    flowMbpd: 8,
    chokepointIds: ["strait-malacca"],
    waypoints: [
      [150.0, -23.0],  // Queensland coast
      [145.0, -15.0],  // N Queensland
      [130.0, -10.0],  // Arafura Sea
      [118.0, -5.0],   // Java Sea W
      [108.0, 5.0],    // S China Sea S
      [103.85, 1.25],  // Malacca (some routes)
      [108.0, 14.0],   // S China Sea
      [114.0, 22.0],   // S China → HK
      [121.5, 31.0],   // Shanghai
    ],
  },
  // ── COPPER ROUTES ────────────────────────────────────────────────────
  {
    id: "chile-asia-copper",
    name: "Chile → Asia (Copper via Panama)",
    resourceType: "copper",
    flowMbpd: 3,
    chokepointIds: ["panama-canal"],
    waypoints: [
      [-70.0, -23.0],  // Chilean copper ports (Antofagasta)
      [-75.0, -15.0],  // Pacific coast S America
      [-82.0, -5.0],   // Pacific E
      [-79.92, 9.08],  // Panama Canal
      [-85.0, 15.0],   // Pacific approach
      [-100.0, 15.0],  // E Pacific
      [-120.0, 20.0],  // Pacific
      [-140.0, 25.0],  // Pacific W
      [140.0, 35.0],   // Japan
      [121.5, 31.0],   // Shanghai
    ],
  },
  {
    id: "drc-asia-copper",
    name: "DRC → Asia (Copper via Malacca)",
    resourceType: "copper",
    flowMbpd: 2,
    chokepointIds: ["cape-good-hope", "strait-malacca"],
    waypoints: [
      [35.0, -17.0],   // Mozambique/Tanzania ports
      [40.0, -20.0],   // Indian Ocean W
      [30.0, -32.0],   // Approaching Cape
      [18.47, -34.36], // Cape of Good Hope
      [30.0, -30.0],   // S Indian Ocean
      [50.0, -20.0],   // Indian Ocean S
      [70.0, -10.0],   // Indian Ocean Central
      [90.0, 0.0],     // Indian Ocean E
      [103.85, 1.25],  // Strait of Malacca
      [114.0, 22.0],   // S China Sea
      [121.5, 31.0],   // Shanghai
    ],
  },

  // ── LITHIUM ROUTES ──────────────────────────────────────────────────────
  {
    id: "lithium-triangle-china",
    name: "Lithium Triangle → China",
    resourceType: "lithium",
    flowMbpd: 4,
    chokepointIds: ["panama-canal", "strait-malacca"],
    waypoints: [
      [-68.0, -23.0],   // Atacama, Chile
      [-75.0, -10.0],   // Pacific coast
      [-82.0, -2.0],    // Pacific E
      [-79.92, 9.08],   // Panama Canal
      [-100.0, 15.0],   // E Pacific
      [-135.0, 25.0],   // Pacific
      [170.0, 35.0],    // W Pacific
      [140.0, 35.0],    // Japan
      [121.5, 31.0],    // Shanghai
    ],
  },
  {
    id: "australia-lithium-china",
    name: "Australia Lithium → China",
    resourceType: "lithium",
    flowMbpd: 5,
    chokepointIds: ["strait-malacca"],
    waypoints: [
      [117.0, -33.0],   // Western Australia (Pilbara)
      [115.0, -20.0],   // WA coast N
      [118.0, -5.0],    // Java Sea
      [108.0, 5.0],     // S China Sea
      [103.85, 1.25],   // Malacca
      [108.0, 14.0],    // S China Sea N
      [114.0, 22.0],    // HK area
      [121.5, 31.0],    // Shanghai
    ],
  },
  // ── RARE EARTH ROUTES ──────────────────────────────────────────────────
  {
    id: "china-rare-earth-global",
    name: "China Rare Earths → Global",
    resourceType: "rare-earth",
    flowMbpd: 3,
    chokepointIds: ["strait-malacca", "suez-canal"],
    waypoints: [
      [117.0, 40.0],    // Inner Mongolia (Baotou)
      [121.5, 31.0],    // Shanghai
      [114.0, 15.0],    // S China Sea
      [103.85, 1.25],   // Malacca
      [80.0, 7.0],      // Indian Ocean
      [60.0, 12.0],     // Arabian Sea
      [43.45, 12.6],    // Bab-el-Mandeb
      [32.35, 30.45],   // Suez Canal
      [14.0, 37.0],     // Med
      [4.5, 52.5],      // Rotterdam
    ],
  },
  // ── IRON ORE ROUTES ──────────────────────────────────────────────────
  {
    id: "australia-ironore-china",
    name: "Australia Iron Ore → China",
    resourceType: "iron-ore",
    flowMbpd: 10,
    chokepointIds: ["strait-malacca"],
    waypoints: [
      [117.0, -20.0],   // Port Hedland, WA
      [115.0, -10.0],   // WA coast N
      [120.0, -5.0],    // Java Sea W
      [108.0, 5.0],     // S China Sea
      [114.0, 15.0],    // S China Sea N
      [114.0, 22.0],    // HK/Guangzhou
      [121.5, 31.0],    // Shanghai
    ],
  },
  {
    id: "brazil-ironore-china",
    name: "Brazil Iron Ore → China",
    resourceType: "iron-ore",
    flowMbpd: 8,
    chokepointIds: ["cape-good-hope", "strait-malacca"],
    waypoints: [
      [-38.0, -12.0],   // Ponta da Madeira, Brazil
      [-30.0, -20.0],   // S Atlantic
      [-10.0, -30.0],   // S Atlantic
      [5.0, -35.0],     // Cape approach
      [18.47, -34.36],  // Cape of Good Hope
      [40.0, -20.0],    // Indian Ocean W
      [70.0, -10.0],    // Indian Ocean C
      [90.0, 0.0],      // Indian Ocean E
      [103.85, 1.25],   // Malacca
      [114.0, 22.0],    // S China Sea
      [121.5, 31.0],    // Shanghai
    ],
  },
  // ── URANIUM ROUTES ──────────────────────────────────────────────────
  {
    id: "kazakhstan-uranium-global",
    name: "Kazakhstan Uranium → Global",
    resourceType: "uranium",
    flowMbpd: 2,
    chokepointIds: ["turkish-straits"],
    waypoints: [
      [67.0, 48.0],     // Kazakhstan (Astana)
      [55.0, 42.0],     // Caspian
      [50.0, 38.0],     // Georgia/Black Sea
      [33.0, 41.0],     // Black Sea W
      [29.02, 41.13],   // Turkish Straits
      [26.0, 37.0],     // Aegean
      [14.0, 37.0],     // Med
      [4.5, 52.5],      // Rotterdam
    ],
  },
  // ── FERTILIZER ROUTES ──────────────────────────────────────────────
  {
    id: "russia-fertilizer-global",
    name: "Russia Fertilizer → Global",
    resourceType: "fertilizer",
    flowMbpd: 5,
    chokepointIds: ["danish-straits", "turkish-straits"],
    waypoints: [
      [37.0, 60.0],     // Russia (St. Petersburg area)
      [20.0, 57.0],     // Baltic
      [10.5, 57.5],     // Danish Straits
      [5.0, 55.0],      // North Sea
      [-5.0, 48.0],     // Bay of Biscay
      [-25.0, 20.0],    // N Atlantic
      [-60.0, 10.0],    // Caribbean
      [-80.0, 27.0],    // Florida
      [-90.0, 29.0],    // US Gulf (import terminal)
    ],
  },
  {
    id: "morocco-phosphate-global",
    name: "Morocco Phosphate → Global",
    resourceType: "fertilizer",
    flowMbpd: 4,
    chokepointIds: ["strait-dover"],
    waypoints: [
      [-8.0, 33.5],     // Casablanca, Morocco
      [-5.0, 36.0],     // Gibraltar
      [-8.0, 42.0],     // Atlantic
      [1.5, 51.12],     // Dover
      [-20.0, 40.0],    // Atlantic branch
      [-60.0, 10.0],    // Caribbean
      [-90.0, 29.0],    // US Gulf
    ],
  },
];

export const ROUTE_MAP: Record<string, ShippingRoute> = Object.fromEntries(
  ROUTES.map((r) => [r.id, r])
);
