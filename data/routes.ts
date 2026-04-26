import type { ShippingRoute } from "@/lib/types";

/**
 * Major global shipping routes.
 * Waypoints are [lon, lat] coordinate pairs tracing the route path.
 * First and last waypoints match exact port coordinates from ports.ts.
 * Chokepoint waypoints match exact chokepoint coordinates from chokepoints.ts.
 * flowMbpd defaults to 10 for non-oil routes (container/grain/copper/coal
 * don't have standard Mbpd equivalents — 10 is a normalized default).
 */
export const ROUTES: ShippingRoute[] = [
  // ── OIL ROUTES ──────────────────────────────────────────────────────────
  {
    id: "persian-gulf-europe-oil",
    name: "Persian Gulf → Europe (Oil)",
    resourceType: "oil",
    flowMbpd: 21,
    chokepointIds: ["strait-hormuz", "bab-el-mandeb", "suez-canal", "strait-dover"],
    waypoints: [
      [49.71, 26.71],   // Ras Tanura
      [56.45, 26.57],   // Strait of Hormuz
      [57.5, 23.0],     // Gulf of Oman
      [60.0, 18.0],     // Arabian Sea NW
      [51.0, 12.5],     // Gulf of Aden
      [43.45, 12.6],    // Bab-el-Mandeb
      [42.0, 15.0],     // Red Sea S
      [36.0, 22.0],     // Red Sea N
      [32.35, 30.45],   // Suez Canal
      [32.0, 32.0],     // Med entry
      [25.0, 33.5],     // Eastern Med
      [14.0, 37.0],     // Central Med
      [5.0, 36.5],      // Western Med
      [-5.0, 36.0],     // Gibraltar
      [-9.5, 38.7],     // Atlantic off Lisbon
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "persian-gulf-europe-cape",
    name: "Persian Gulf → Europe (Cape diversion)",
    resourceType: "oil",
    routeStatus: "diversion",
    flowMbpd: 5,
    chokepointIds: ["strait-hormuz", "cape-good-hope", "strait-dover"],
    waypoints: [
      [50.32, 29.25],   // Kharg Island
      [56.45, 26.57],   // Strait of Hormuz
      [60.0, 18.0],     // Arabian Sea
      [65.0, 10.0],     // Indian Ocean W
      [55.0, -5.0],     // Indian Ocean Central
      [40.0, -20.0],    // S Indian Ocean
      [25.0, -30.0],    // Approaching Cape
      [18.47, -34.36],  // Cape of Good Hope
      [5.0, -35.0],     // S Atlantic
      [-5.0, -15.0],    // S Atlantic N
      [-10.0, 0.0],     // Equator Atlantic
      [-12.0, 15.0],    // N Atlantic
      [-10.0, 30.0],    // Atlantic N
      [-9.5, 38.7],     // Off Lisbon
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "persian-gulf-asia-oil",
    name: "Persian Gulf → Asia (Oil)",
    resourceType: "oil",
    flowMbpd: 16,
    chokepointIds: ["strait-hormuz", "strait-malacca"],
    waypoints: [
      [49.71, 26.71],   // Ras Tanura
      [56.45, 26.57],   // Strait of Hormuz
      [62.0, 20.0],     // Arabian Sea E
      [72.0, 12.0],     // Indian Ocean N
      [80.0, 7.0],      // Indian Ocean NE
      [90.0, 5.0],      // Bay of Bengal
      [98.0, 3.0],      // Andaman Sea
      [103.85, 1.25],   // Strait of Malacca
      [108.0, 5.0],     // S China Sea S
      [114.0, 15.0],    // S China Sea
      [120.0, 22.0],    // Taiwan Strait
      [121.88, 29.87],  // Ningbo-Zhoushan
    ],
  },
  {
    id: "persian-gulf-india-oil",
    name: "Persian Gulf → India (Oil)",
    resourceType: "oil",
    flowMbpd: 4,
    chokepointIds: ["strait-hormuz"],
    waypoints: [
      [49.71, 26.71],   // Ras Tanura
      [56.45, 26.57],   // Strait of Hormuz
      [60.0, 22.0],     // Arabian Sea
      [68.0, 20.0],     // Arabian Sea N
      [72.82, 18.96],   // Mumbai / JNPT
    ],
  },
  {
    id: "persian-gulf-korea-oil",
    name: "Persian Gulf → Korea (Oil)",
    resourceType: "oil",
    flowMbpd: 6,
    chokepointIds: ["strait-hormuz", "strait-malacca"],
    waypoints: [
      [49.71, 26.71],   // Ras Tanura
      [56.45, 26.57],   // Strait of Hormuz
      [62.0, 20.0],     // Arabian Sea E
      [72.0, 12.0],     // Indian Ocean N
      [80.0, 7.0],      // Bay of Bengal W
      [90.0, 5.0],      // Bay of Bengal E
      [98.0, 3.0],      // Andaman Sea
      [103.85, 1.25],   // Strait of Malacca
      [108.0, 5.0],     // S China Sea
      [114.0, 15.0],    // S China Sea N
      [120.0, 25.0],    // E China Sea
      [125.0, 30.0],    // E China Sea N
      [129.31, 35.54],  // Ulsan
    ],
  },
  {
    id: "gulf-yokohama-oil",
    name: "Persian Gulf → Japan (Oil)",
    resourceType: "oil",
    flowMbpd: 5,
    chokepointIds: ["strait-hormuz", "strait-malacca"],
    waypoints: [
      [49.71, 26.71],   // Ras Tanura
      [56.45, 26.57],   // Strait of Hormuz
      [62.0, 20.0],     // Arabian Sea E
      [72.0, 12.0],     // Indian Ocean N
      [80.0, 7.0],      // Bay of Bengal W
      [90.0, 5.0],      // Bay of Bengal E
      [98.0, 3.0],      // Andaman Sea
      [103.85, 1.25],   // Strait of Malacca
      [108.0, 5.0],     // S China Sea
      [114.0, 15.0],    // S China Sea N
      [120.0, 25.0],    // E China Sea
      [125.0, 30.0],    // E China Sea N
      [132.0, 33.0],    // Pacific approach
      [136.0, 35.0],    // Japan approach
      [139.64, 35.44],  // Yokohama / Tokyo
    ],
  },
  {
    id: "gulf-tianjin-oil",
    name: "Persian Gulf → Tianjin (Oil)",
    resourceType: "oil",
    flowMbpd: 5,
    chokepointIds: ["strait-hormuz", "strait-malacca"],
    waypoints: [
      [49.71, 26.71],   // Ras Tanura
      [56.45, 26.57],   // Strait of Hormuz
      [72.0, 12.0],     // Indian Ocean
      [90.0, 5.0],      // Bay of Bengal
      [103.85, 1.25],   // Strait of Malacca
      [114.0, 15.0],    // S China Sea
      [120.0, 25.0],    // E China Sea
      [121.0, 32.0],    // Yellow Sea approach
      [117.7, 38.97],   // Tianjin
    ],
  },
  {
    id: "gulf-singapore-oil",
    name: "Persian Gulf → Singapore (Oil)",
    resourceType: "oil",
    flowMbpd: 8,
    chokepointIds: ["strait-hormuz", "strait-malacca"],
    waypoints: [
      [49.71, 26.71],   // Ras Tanura
      [56.45, 26.57],   // Strait of Hormuz
      [62.0, 20.0],     // Arabian Sea
      [72.0, 12.0],     // Indian Ocean N
      [80.0, 7.0],      // Bay of Bengal
      [90.0, 5.0],      // Bay of Bengal E
      [98.0, 3.0],      // Andaman Sea
      [103.85, 1.25],   // Strait of Malacca
      [103.82, 1.27],   // Singapore
    ],
  },
  {
    id: "basra-asia-oil",
    name: "Basra → Asia (Oil)",
    resourceType: "oil",
    flowMbpd: 4,
    chokepointIds: ["strait-hormuz", "strait-malacca"],
    waypoints: [
      [48.82, 29.68],   // Basra Oil Terminal
      [56.45, 26.57],   // Strait of Hormuz
      [62.0, 20.0],     // Arabian Sea E
      [72.0, 12.0],     // Indian Ocean N
      [80.0, 7.0],      // Bay of Bengal W
      [90.0, 5.0],      // Bay of Bengal
      [98.0, 3.0],      // Andaman Sea
      [103.85, 1.25],   // Strait of Malacca
      [108.0, 5.0],     // S China Sea
      [114.0, 15.0],    // S China Sea N
      [121.88, 29.87],  // Ningbo-Zhoushan
    ],
  },
  {
    id: "russia-black-sea-europe-oil",
    name: "Russia Black Sea → Europe (Oil)",
    resourceType: "oil",
    routeStatus: "historical",
    flowMbpd: 1.5,
    chokepointIds: ["turkish-straits", "strait-dover"],
    waypoints: [
      [37.77, 44.72],   // Novorossiysk
      [31.0, 43.0],     // Black Sea W
      [29.02, 41.13],   // Turkish Straits
      [26.0, 37.0],     // Aegean
      [22.0, 35.0],     // E Med
      [14.0, 37.0],     // Central Med
      [5.0, 36.5],      // W Med
      [-5.0, 36.0],     // Gibraltar
      [-9.5, 38.7],     // Atlantic
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "aktau-oil-europe",
    name: "Kazakhstan → Europe (Alternative via Caspian/BTC)",
    resourceType: "oil",
    routeStatus: "diversion",
    transportMode: "multimodal",
    routeAccuracy: "observed",
    flowMbpd: 1.5,
    chokepointIds: ["strait-dover"],
    waypoints: [
      [51.2, 43.65],    // Aktau
      [49.9, 40.4],     // Caspian → Baku area
      [45.0, 41.7],     // Georgia corridor
      [41.0, 40.8],     // Eastern Turkey
      [36.0, 38.0],     // Central Turkey
      [35.9, 36.8],     // Ceyhan
      [25.0, 34.0],     // Eastern Med
      [14.0, 37.0],     // Central Med
      [-5.0, 36.0],     // Gibraltar
      [-9.5, 38.7],     // Atlantic off Lisbon
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "ust-luga-oil-europe",
    name: "Russia Baltic → Europe (Oil)",
    resourceType: "oil",
    routeStatus: "historical",
    flowMbpd: 2,
    chokepointIds: ["danish-straits"],
    waypoints: [
      [28.35, 59.68],   // Ust-Luga
      [22.0, 58.0],     // Baltic E
      [15.0, 55.5],     // Baltic S
      [10.5, 57.5],     // Danish Straits
      [5.0, 55.0],      // North Sea
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "us-gulf-europe-oil",
    name: "US Gulf Coast → Europe (Oil)",
    resourceType: "oil",
    flowMbpd: 4,
    chokepointIds: ["strait-dover"],
    waypoints: [
      [-95.37, 29.76],  // Houston Ship Channel
      [-88.0, 26.0],    // Gulf of Mexico
      [-80.0, 25.0],    // Florida Straits
      [-65.0, 30.0],    // Bermuda
      [-40.0, 38.0],    // Mid-Atlantic
      [-20.0, 47.0],    // N Atlantic
      [-10.0, 50.0],    // W of Ireland
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "corpus-christi-asia-oil",
    name: "Corpus Christi → Asia (Oil via Cape)",
    resourceType: "oil",
    flowMbpd: 2,
    chokepointIds: ["cape-good-hope", "strait-malacca"],
    waypoints: [
      [-97.39, 27.8],   // Corpus Christi
      [-88.0, 24.0],    // Gulf of Mexico
      [-80.0, 25.0],    // Florida Straits
      [-55.0, 10.0],    // Atlantic W
      [-30.0, -10.0],   // South Atlantic
      [-10.0, -30.0],   // South Atlantic E
      [18.47, -34.36],  // Cape of Good Hope
      [25.0, -38.0],    // South of Africa
      [45.0, -35.0],    // Indian Ocean
      [70.0, -20.0],    // Indian Ocean C
      [88.0, -8.0],     // Indian Ocean E
      [96.0, 5.0],      // Andaman Sea approach
      [103.85, 1.25],   // Strait of Malacca
      [114.0, 15.0],    // South China Sea
      [123.0, 28.0],    // East China Sea
      [121.5, 31.2],    // Shanghai
    ],
  },
  {
    id: "brazil-europe-oil",
    name: "Brazil → Europe (Oil)",
    resourceType: "oil",
    flowMbpd: 3,
    chokepointIds: ["strait-dover"],
    waypoints: [
      [-44.3, -23.0],   // Santos / Angra dos Reis
      [-35.0, -22.0],   // S Atlantic
      [-25.0, -15.0],   // Central Atlantic
      [-20.0, -5.0],    // Equatorial Atlantic
      [-18.0, 10.0],    // N Atlantic S
      [-15.0, 25.0],    // N Atlantic
      [-10.0, 38.0],    // Off Portugal
      [-9.5, 38.7],     // Atlantic off Lisbon
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "brazil-china-oil",
    name: "Brazil → China (Oil)",
    resourceType: "oil",
    flowMbpd: 2,
    chokepointIds: ["cape-good-hope", "strait-malacca"],
    waypoints: [
      [-44.3, -23.0],   // Santos / Angra dos Reis
      [-35.0, -28.0],   // S Atlantic
      [-10.0, -35.0],   // S Atlantic E
      [5.0, -35.0],     // Cape approach
      [18.47, -34.36],  // Cape of Good Hope
      [40.0, -22.0],    // Indian Ocean W
      [65.0, -12.0],    // Indian Ocean C
      [90.0, 0.0],      // Indian Ocean E
      [103.85, 1.25],   // Strait of Malacca
      [114.0, 15.0],    // S China Sea
      [121.88, 29.87],  // Ningbo-Zhoushan
    ],
  },
  {
    id: "nigeria-europe-oil",
    name: "Nigeria → Europe (Oil)",
    resourceType: "oil",
    flowMbpd: 2,
    chokepointIds: ["strait-dover"],
    waypoints: [
      [7.15, 4.43],     // Bonny Island / Lagos
      [3.0, 0.0],       // Gulf of Guinea
      [-5.0, 2.0],      // Gulf of Guinea W
      [-15.0, 5.0],     // W Atlantic
      [-20.0, 15.0],    // N Atlantic S
      [-15.0, 28.0],    // N Atlantic
      [-10.0, 38.0],    // Off Portugal
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "nigeria-asia-oil",
    name: "Nigeria → Asia (Oil via Cape)",
    resourceType: "oil",
    flowMbpd: 1.5,
    chokepointIds: ["cape-good-hope", "strait-malacca"],
    waypoints: [
      [7.15, 4.43],     // Bonny Island / Lagos
      [5.0, -2.0],      // Gulf of Guinea
      [8.0, -10.0],     // S Atlantic W
      [10.0, -20.0],    // S Atlantic
      [12.0, -30.0],    // Approaching Cape
      [18.47, -34.36],  // Cape of Good Hope
      [35.0, -25.0],    // Indian Ocean
      [55.0, -15.0],    // Indian Ocean C
      [75.0, -5.0],     // Indian Ocean E
      [90.0, 0.0],      // Indian Ocean NE
      [103.85, 1.25],   // Strait of Malacca
      [114.0, 15.0],    // S China Sea
      [121.5, 31.2],    // Shanghai
    ],
  },
  {
    id: "luanda-europe-oil",
    name: "Angola → Europe (Oil)",
    resourceType: "oil",
    flowMbpd: 1.5,
    chokepointIds: ["strait-dover"],
    waypoints: [
      [13.23, -8.83],   // Luanda
      [8.0, -5.0],      // Gulf of Guinea E
      [3.0, 0.0],       // Gulf of Guinea
      [-3.0, 5.0],      // Gulf of Guinea N
      [-12.0, 15.0],    // N Atlantic S
      [-15.0, 28.0],    // N Atlantic
      [-10.0, 38.0],    // Off Portugal
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "luanda-china-oil",
    name: "Angola → China (Oil via Cape)",
    resourceType: "oil",
    flowMbpd: 1.5,
    chokepointIds: ["cape-good-hope", "strait-malacca"],
    waypoints: [
      [13.23, -8.83],   // Luanda
      [12.0, -15.0],    // S Atlantic
      [14.0, -28.0],    // Approaching Cape
      [18.47, -34.36],  // Cape of Good Hope
      [35.0, -25.0],    // Indian Ocean
      [60.0, -15.0],    // Indian Ocean C
      [80.0, -5.0],     // Indian Ocean N
      [90.0, 0.0],      // Indian Ocean NE
      [103.85, 1.25],   // Strait of Malacca
      [114.0, 15.0],    // S China Sea
      [121.5, 31.2],    // Shanghai
    ],
  },

  // ── LNG ROUTES ─────────────────────────────────────────────────────────
  {
    id: "qatar-europe-lng",
    name: "Qatar LNG → Europe (Suez, pre-Red Sea crisis)",
    resourceType: "lng",
    routeStatus: "historical",
    routeAccuracy: "observed",
    flowMbpd: 4,
    chokepointIds: ["strait-hormuz", "bab-el-mandeb", "suez-canal", "strait-dover"],
    waypoints: [
      [51.55, 25.9],    // Ras Laffan
      [56.45, 26.57],   // Strait of Hormuz
      [58.0, 22.0],     // Gulf of Oman
      [51.0, 12.5],     // Gulf of Aden
      [43.45, 12.6],    // Bab-el-Mandeb
      [36.0, 22.0],     // Red Sea N
      [32.35, 30.45],   // Suez Canal
      [14.0, 37.0],     // Central Med
      [-5.0, 36.0],     // Gibraltar
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "ras-laffan-asia-lng",
    name: "Qatar LNG → Japan",
    resourceType: "lng",
    flowMbpd: 6,
    chokepointIds: ["strait-hormuz", "strait-malacca"],
    waypoints: [
      [51.55, 25.9],    // Ras Laffan
      [56.45, 26.57],   // Strait of Hormuz
      [62.0, 20.0],     // Arabian Sea E
      [72.0, 12.0],     // Indian Ocean N
      [80.0, 7.0],      // Bay of Bengal W
      [90.0, 5.0],      // Bay of Bengal E
      [98.0, 3.0],      // Andaman Sea
      [103.85, 1.25],   // Strait of Malacca
      [108.0, 5.0],     // S China Sea
      [114.0, 15.0],    // S China Sea N
      [120.0, 22.0],    // Taiwan Strait
      [125.0, 30.0],    // E China Sea N
      [132.0, 33.0],    // Pacific approach
      [136.0, 35.0],    // Japan approach
      [139.64, 35.44],  // Yokohama / Tokyo
    ],
  },
  {
    id: "qatar-ulsan-lng",
    name: "Qatar LNG → Korea",
    resourceType: "lng",
    flowMbpd: 4,
    chokepointIds: ["strait-hormuz", "strait-malacca"],
    waypoints: [
      [51.55, 25.9],    // Ras Laffan
      [56.45, 26.57],   // Strait of Hormuz
      [62.0, 20.0],     // Arabian Sea
      [80.0, 7.0],      // Bay of Bengal W
      [90.0, 5.0],      // Bay of Bengal E
      [103.85, 1.25],   // Strait of Malacca
      [108.0, 5.0],     // S China Sea
      [114.0, 15.0],    // S China Sea N
      [120.0, 22.0],    // Taiwan Strait S
      [125.0, 30.0],    // E China Sea
      [129.31, 35.54],  // Ulsan
    ],
  },
  {
    id: "qatar-busan-lng",
    name: "Qatar LNG → Korea",
    resourceType: "lng",
    routeAccuracy: "observed",
    flowMbpd: 3,
    chokepointIds: ["strait-hormuz", "strait-malacca"],
    waypoints: [
      [51.55, 25.9],    // Ras Laffan
      [56.45, 26.57],   // Strait of Hormuz
      [62.0, 20.0],     // Arabian Sea
      [80.0, 7.0],      // Bay of Bengal W
      [90.0, 5.0],      // Bay of Bengal E
      [103.85, 1.25],   // Strait of Malacca
      [108.0, 5.0],     // S China Sea
      [114.0, 15.0],    // S China Sea N
      [120.0, 22.0],    // Taiwan Strait S
      [125.0, 30.0],    // E China Sea
      [128.0, 33.0],    // Korea approach
      [129.07, 35.1],   // Busan
    ],
  },
  {
    id: "qatar-mumbai-lng",
    name: "Qatar LNG → India",
    resourceType: "lng",
    flowMbpd: 3,
    chokepointIds: ["strait-hormuz"],
    waypoints: [
      [51.55, 25.9],    // Ras Laffan
      [56.45, 26.57],   // Strait of Hormuz
      [60.0, 22.0],     // Arabian Sea W
      [66.0, 20.0],     // Arabian Sea
      [72.3, 20.9],     // Dahej / west India LNG
    ],
  },
  {
    id: "qatar-singapore-lng",
    name: "Qatar LNG → Singapore",
    resourceType: "lng",
    flowMbpd: 3,
    chokepointIds: ["strait-hormuz", "strait-malacca"],
    waypoints: [
      [51.55, 25.9],    // Ras Laffan
      [56.45, 26.57],   // Strait of Hormuz
      [62.0, 18.0],     // Arabian Sea
      [72.0, 12.0],     // Indian Ocean N
      [80.0, 7.0],      // Bay of Bengal W
      [90.0, 3.0],      // Bay of Bengal S
      [98.0, 2.0],      // Andaman Sea S
      [103.85, 1.25],   // Strait of Malacca
      [103.82, 1.27],   // Singapore
    ],
  },
  {
    id: "us-gulf-europe-lng",
    name: "US Gulf Coast LNG → Europe",
    resourceType: "lng",
    flowMbpd: 3,
    chokepointIds: ["strait-dover"],
    waypoints: [
      [-93.87, 29.73],  // Sabine Pass LNG
      [-80.0, 26.0],    // Florida
      [-65.0, 32.0],    // Bermuda
      [-40.0, 40.0],    // Mid-Atlantic
      [-20.0, 48.0],    // N Atlantic
      [-10.0, 50.0],    // W of Ireland
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "corpus-christi-europe-lng",
    name: "Corpus Christi LNG → Europe",
    resourceType: "lng",
    flowMbpd: 2,
    chokepointIds: ["strait-dover"],
    waypoints: [
      [-97.39, 27.8],   // Corpus Christi
      [-88.0, 24.0],    // Gulf of Mexico
      [-80.0, 26.0],    // Florida
      [-65.0, 32.0],    // Bermuda
      [-40.0, 40.0],    // Mid-Atlantic
      [-20.0, 48.0],    // N Atlantic
      [-10.0, 50.0],    // W of Ireland
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "gladstone-lng-japan",
    name: "Australia LNG → Japan",
    resourceType: "lng",
    flowMbpd: 5,
    chokepointIds: [],
    waypoints: [
      [151.35, -23.85], // Gladstone
      [155.0, -20.0],   // Coral Sea
      [158.0, -12.0],   // Coral Sea N
      [155.0, -5.0],    // Solomon Sea
      [150.0, 5.0],     // Pacific W
      [145.0, 15.0],    // W Pacific
      [140.0, 25.0],    // Japan approach S
      [139.64, 35.44],  // Yokohama / Tokyo
    ],
  },
  {
    id: "nigeria-europe-lng",
    name: "Nigeria LNG → Europe",
    resourceType: "lng",
    flowMbpd: 2,
    chokepointIds: ["strait-dover"],
    waypoints: [
      [7.15, 4.43],     // Bonny Island / Lagos
      [3.0, 0.0],       // Gulf of Guinea
      [-5.0, 2.0],      // Gulf of Guinea W
      [-15.0, 5.0],     // W Atlantic
      [-20.0, 15.0],    // N Atlantic S
      [-15.0, 28.0],    // N Atlantic
      [-10.0, 38.0],    // Off Portugal
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },

  // ── CONTAINER ROUTES ────────────────────────────────────────────────────
  {
    id: "asia-europe-container",
    name: "Asia → Europe (Containers via Suez, normal baseline)",
    resourceType: "container",
    routeStatus: "historical",
    routeAccuracy: "observed",
    flowMbpd: 12,
    chokepointIds: ["strait-malacca", "bab-el-mandeb", "suez-canal", "strait-dover"],
    waypoints: [
      [121.5, 31.2],    // Shanghai
      [120.0, 22.0],    // Taiwan Strait
      [114.0, 15.0],    // S China Sea
      [108.0, 5.0],     // S China Sea S
      [103.85, 1.25],   // Strait of Malacca
      [95.0, 5.0],      // Andaman Sea
      [80.0, 7.0],      // Bay of Bengal W
      [72.0, 12.0],     // Indian Ocean N
      [60.0, 12.0],     // Arabian Sea W
      [51.0, 12.5],     // Gulf of Aden
      [43.45, 12.6],    // Bab-el-Mandeb
      [36.0, 22.0],     // Red Sea N
      [32.35, 30.45],   // Suez Canal
      [14.0, 37.0],     // Central Med
      [5.0, 36.5],      // Western Med
      [-5.0, 36.0],     // Gibraltar
      [-9.5, 38.7],     // Atlantic off Lisbon
      [-9.0, 43.0],     // Bay of Biscay approach
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "asia-europe-container-cape",
    name: "Asia → Europe (Cape of Good Hope reroute)",
    resourceType: "container",
    routeAccuracy: "observed",
    flowMbpd: 6,
    chokepointIds: ["strait-malacca", "cape-good-hope", "strait-dover"],
    waypoints: [
      [121.5, 31.2],    // Shanghai
      [114.0, 15.0],    // S China Sea
      [103.85, 1.25],   // Strait of Malacca
      [90.0, -5.0],     // Indian Ocean
      [70.0, -15.0],    // Indian Ocean S
      [50.0, -25.0],    // Indian Ocean SW
      [30.0, -32.0],    // Approaching Cape
      [18.47, -34.36],  // Cape of Good Hope
      [0.0, -35.0],     // S Atlantic
      [-10.0, -15.0],   // S Atlantic N
      [-12.0, 5.0],     // Atlantic
      [-10.0, 30.0],    // N Atlantic
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "asia-antwerp-container",
    name: "Asia → Antwerp (Containers)",
    resourceType: "container",
    flowMbpd: 6,
    chokepointIds: ["strait-malacca", "bab-el-mandeb", "suez-canal", "strait-dover"],
    waypoints: [
      [121.5, 31.2],    // Shanghai
      [114.0, 15.0],    // S China Sea
      [103.85, 1.25],   // Strait of Malacca
      [80.0, 7.0],      // Indian Ocean
      [60.0, 12.0],     // Arabian Sea
      [43.45, 12.6],    // Bab-el-Mandeb
      [36.0, 22.0],     // Red Sea N
      [32.35, 30.45],   // Suez Canal
      [14.0, 37.0],     // Med
      [-5.0, 36.0],     // Gibraltar
      [-9.5, 38.7],     // Atlantic off Lisbon
      [-9.0, 43.0],     // Bay of Biscay approach
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.4, 51.23],     // Antwerp
    ],
  },
  {
    id: "americas-asia-container",
    name: "US East Coast → Asia (Panama backhaul)",
    resourceType: "container",
    routeAccuracy: "approximate",
    flowMbpd: 8,
    chokepointIds: ["panama-canal"],
    waypoints: [
      [-74.0, 40.7],    // New York / New Jersey
      [-75.0, 35.0],    // US East Coast S
      [-80.0, 27.0],    // Florida
      [-82.0, 23.0],    // Caribbean
      [-79.92, 9.08],   // Panama Canal
      [-90.0, 8.0],     // Pacific off C. America
      [-100.0, 15.0],   // E Pacific
      [-120.0, 20.0],   // Pacific Central
      [-140.0, 25.0],   // Pacific W
      [-160.0, 30.0],   // Pacific NW
      [140.0, 35.0],    // Japan approach
      [121.5, 31.2],    // Shanghai
    ],
  },
  {
    id: "americas-asia-container-horn",
    name: "US East Coast → Asia (extreme Cape Horn diversion)",
    resourceType: "container",
    routeStatus: "diversion",
    routeAccuracy: "approximate",
    flowMbpd: 3,
    chokepointIds: ["cape-horn"],
    waypoints: [
      [-74.0, 40.7],    // New York / New Jersey
      [-72.0, 36.0],    // US East Coast offshore
      [-66.0, 25.0],    // W Atlantic / Bahamas offshore
      [-42.0, 8.0],     // Central Atlantic
      [-25.0, -15.0],   // Equatorial Atlantic offshore
      [-42.0, -35.0],   // S Atlantic off Brazil
      [-52.0, -50.0],   // Patagonia offshore
      [-60.0, -56.0],   // Drake Passage E
      [-64.0, -57.0],   // Drake Passage approach
      [-67.28, -55.98], // Cape Horn
      [-75.0, -56.0],   // S Pacific
      [-85.0, -45.0],   // SE Pacific
      [-90.0, -30.0],   // Pacific
      [-100.0, -15.0],  // Pacific N
      [-120.0, -5.0],   // Pacific Equator
      [-130.0, 10.0],   // Pacific N
      [-140.0, 25.0],   // Pacific NW
      [139.64, 35.44],  // Yokohama / Tokyo
    ],
  },
  {
    id: "asia-la-container",
    name: "Asia → Los Angeles (Trans-Pacific Containers)",
    resourceType: "container",
    flowMbpd: 10,
    chokepointIds: [],
    waypoints: [
      [121.5, 31.2],    // Shanghai
      [132.0, 35.0],    // E China Sea / Japan approach
      [145.0, 40.0],    // Pacific (east of Japan)
      [165.0, 45.0],    // N Pacific
      [180.0, 47.0],    // Dateline
      [-170.0, 47.0],   // N Pacific E
      [-155.0, 43.0],   // Pacific NE
      [-138.0, 38.0],   // Pacific E
      [-125.0, 35.0],   // Off California
      [-118.17, 33.75], // Los Angeles / Long Beach
    ],
  },
  {
    id: "gulf-busan-container",
    name: "China → Busan (Containers)",
    resourceType: "container",
    flowMbpd: 7,
    chokepointIds: [],
    waypoints: [
      [121.5, 31.2],    // Shanghai
      [122.0, 32.5],    // Yellow Sea
      [124.0, 34.0],    // Korea Strait approach
      [129.07, 35.1],   // Busan
    ],
  },
  {
    id: "europe-tianjin-container",
    name: "Europe → Tianjin (Containers)",
    resourceType: "container",
    flowMbpd: 5,
    chokepointIds: ["strait-dover", "suez-canal", "bab-el-mandeb", "strait-malacca"],
    waypoints: [
      [4.14, 51.97],    // Rotterdam
      [1.5, 51.12],     // Strait of Dover
      [-5.0, 48.5],     // Bay of Biscay
      [-5.0, 36.0],     // Gibraltar
      [14.0, 37.0],     // Central Med
      [32.35, 30.45],   // Suez Canal
      [36.0, 22.0],     // Red Sea
      [43.45, 12.6],    // Bab-el-Mandeb
      [60.0, 12.0],     // Arabian Sea
      [80.0, 7.0],      // Indian Ocean N
      [90.0, 5.0],      // Bay of Bengal
      [103.85, 1.25],   // Malacca
      [114.0, 15.0],    // S China Sea
      [120.0, 25.0],    // E China Sea
      [121.0, 32.0],    // Yellow Sea approach
      [117.7, 38.97],   // Tianjin
    ],
  },
  {
    id: "asia-singapore-container",
    name: "Asia → Singapore (Container Transshipment)",
    resourceType: "container",
    flowMbpd: 8,
    chokepointIds: ["strait-malacca"],
    waypoints: [
      [121.5, 31.2],    // Shanghai
      [114.0, 15.0],    // S China Sea
      [108.0, 5.0],     // S China Sea S
      [103.85, 1.25],   // Strait of Malacca
      [103.82, 1.27],   // Singapore
    ],
  },
  {
    id: "asia-mumbai-container",
    name: "Asia → Mumbai (Containers)",
    resourceType: "container",
    flowMbpd: 5,
    chokepointIds: ["strait-malacca"],
    waypoints: [
      [121.5, 31.2],    // Shanghai
      [123.0, 28.0],    // East China Sea offshore
      [124.0, 22.0],    // East of Taiwan
      [118.0, 18.0],    // Luzon Strait / S China Sea
      [114.0, 15.0],    // S China Sea
      [103.85, 1.25],   // Malacca
      [96.0, 5.0],      // Andaman Sea
      [88.0, 5.0],      // Bay of Bengal
      [82.0, 2.0],      // South of Sri Lanka
      [75.0, 5.0],      // Arabian Sea
      [72.0, 12.0],     // Arabian Sea
      [72.82, 18.96],   // Mumbai / JNPT
    ],
  },
  {
    id: "asia-dar-container",
    name: "Asia → Dar es Salaam (Containers)",
    resourceType: "container",
    flowMbpd: 4,
    chokepointIds: ["strait-malacca"],
    waypoints: [
      [121.5, 31.2],    // Shanghai
      [114.0, 15.0],    // S China Sea
      [103.85, 1.25],   // Malacca
      [80.0, 5.0],      // Indian Ocean N
      [60.0, -10.0],    // Indian Ocean C
      [45.0, -15.0],    // Indian Ocean W
      [39.29, -6.82],   // Dar es Salaam
    ],
  },
  {
    id: "asia-durban-container",
    name: "Asia → Durban (Containers)",
    resourceType: "container",
    flowMbpd: 5,
    chokepointIds: ["strait-malacca"],
    waypoints: [
      [121.5, 31.2],    // Shanghai
      [114.0, 15.0],    // S China Sea
      [103.85, 1.25],   // Malacca
      [80.0, 5.0],      // Indian Ocean N
      [60.0, -10.0],    // Indian Ocean C
      [40.0, -20.0],    // Indian Ocean W
      [31.03, -29.88],  // Durban
    ],
  },

  // ── GRAIN ROUTES ─────────────────────────────────────────────────────────
  {
    id: "black-sea-europe-grain",
    name: "Ukraine Black Sea → Europe Grain Corridor",
    resourceType: "grain",
    routeAccuracy: "observed",
    flowMbpd: 5,
    chokepointIds: ["turkish-straits", "strait-dover"],
    waypoints: [
      [30.73, 46.49],   // Odesa
      [29.02, 41.13],   // Turkish Straits (Bosphorus)
      [26.0, 39.0],     // Aegean Sea
      [22.0, 35.0],     // Eastern Med
      [14.0, 37.0],     // Central Med
      [5.0, 36.5],      // Western Med
      [-5.0, 36.0],     // Gibraltar
      [-10.0, 40.0],    // Atlantic
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "black-sea-asia-grain",
    name: "Black Sea → Asia (Grain via Suez)",
    resourceType: "grain",
    flowMbpd: 3,
    chokepointIds: ["turkish-straits", "suez-canal", "bab-el-mandeb"],
    waypoints: [
      [30.73, 46.49],   // Odesa
      [29.02, 41.13],   // Turkish Straits
      [26.0, 36.0],     // E Med
      [32.35, 30.45],   // Suez Canal
      [36.0, 22.0],     // Red Sea
      [43.45, 12.6],    // Bab-el-Mandeb
      [60.0, 12.0],     // Arabian Sea
      [80.0, 15.0],     // Indian Ocean N
      [103.85, 1.25],   // Malacca
      [121.5, 31.2],    // Shanghai
    ],
  },
  {
    id: "novorossiysk-grain-europe",
    name: "Russia Black Sea → Europe (Grain, historical)",
    resourceType: "grain",
    routeStatus: "historical",
    routeAccuracy: "approximate",
    flowMbpd: 4,
    chokepointIds: ["turkish-straits", "strait-dover"],
    waypoints: [
      [37.77, 44.72],   // Novorossiysk
      [31.0, 43.0],     // Black Sea W
      [29.02, 41.13],   // Turkish Straits
      [26.0, 37.0],     // Aegean
      [22.0, 35.0],     // E Med
      [14.0, 37.0],     // Central Med
      [5.0, 36.5],      // Western Med
      [-5.0, 36.0],     // Gibraltar
      [-9.5, 38.7],     // Atlantic
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "paranagua-grain-china",
    name: "Brazil → China (Grain via Cape)",
    resourceType: "grain",
    flowMbpd: 5,
    chokepointIds: ["cape-good-hope", "strait-malacca"],
    waypoints: [
      [-48.51, -25.52], // Paranaguá
      [-40.0, -28.0],   // S Atlantic
      [-25.0, -30.0],   // S Atlantic E
      [-5.0, -35.0],    // Cape approach
      [5.0, -35.0],     // S Atlantic E
      [18.47, -34.36],  // Cape of Good Hope
      [40.0, -25.0],    // Indian Ocean
      [65.0, -15.0],    // Indian Ocean C
      [90.0, 0.0],      // Indian Ocean E
      [103.85, 1.25],   // Malacca
      [114.0, 15.0],    // S China Sea
      [121.5, 31.2],    // Shanghai
    ],
  },
  {
    id: "paranagua-grain-europe",
    name: "Brazil → Europe (Grain)",
    resourceType: "grain",
    flowMbpd: 4,
    chokepointIds: ["strait-dover"],
    waypoints: [
      [-48.51, -25.52], // Paranaguá
      [-40.0, -20.0],   // S Atlantic
      [-30.0, -10.0],   // Central Atlantic
      [-20.0, 0.0],     // Equatorial Atlantic
      [-20.0, 15.0],    // N Atlantic S
      [-15.0, 30.0],    // N Atlantic
      [-10.0, 40.0],    // N Atlantic N
      [-9.5, 38.7],     // Off Lisbon
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },

  // ── COAL ROUTES ──────────────────────────────────────────────────────────
  {
    id: "australia-asia-coal",
    name: "Australia → China (Coal)",
    resourceType: "coal",
    flowMbpd: 8,
    chokepointIds: [],
    waypoints: [
      [151.35, -23.85], // Gladstone
      [155.0, -18.0],   // Coral Sea
      [155.0, -5.0],    // Western Pacific
      [150.0, 8.0],     // Philippine Sea
      [140.0, 20.0],    // Philippine Sea N
      [128.0, 28.0],    // East China Sea
      [121.5, 31.2],    // Shanghai
    ],
  },
  {
    id: "newcastle-coal-japan",
    name: "Newcastle → Japan (Coal)",
    resourceType: "coal",
    flowMbpd: 6,
    chokepointIds: [],
    waypoints: [
      [151.78, -32.92], // Newcastle
      [155.0, -28.0],   // Tasman Sea
      [158.0, -20.0],   // Coral Sea S
      [155.0, -10.0],   // Coral Sea N
      [150.0, 0.0],     // Pacific W
      [145.0, 10.0],    // W Pacific
      [140.0, 20.0],    // Japan approach S
      [139.64, 35.44],  // Yokohama / Tokyo
    ],
  },
  {
    id: "newcastle-coal-korea",
    name: "Newcastle → Korea (Coal)",
    resourceType: "coal",
    flowMbpd: 5,
    chokepointIds: [],
    waypoints: [
      [151.78, -32.92], // Newcastle
      [155.0, -28.0],   // Tasman Sea
      [158.0, -18.0],   // Coral Sea
      [155.0, -5.0],    // Coral Sea N
      [150.0, 5.0],     // Pacific W
      [145.0, 15.0],    // W Pacific
      [137.0, 30.0],    // Korea approach
      [129.07, 35.1],   // Busan
    ],
  },
  {
    id: "newcastle-coal-ningbo",
    name: "Newcastle → Ningbo (Coal)",
    resourceType: "coal",
    flowMbpd: 5,
    chokepointIds: [],
    waypoints: [
      [151.78, -32.92], // Newcastle
      [155.0, -28.0],   // Tasman Sea
      [158.0, -18.0],   // Coral Sea
      [155.0, -5.0],    // Western Pacific
      [150.0, 8.0],     // Philippine Sea
      [140.0, 22.0],    // Philippine Sea N
      [128.0, 28.0],    // East China Sea
      [121.88, 29.87],  // Ningbo-Zhoushan
    ],
  },
  {
    id: "newcastle-coal-tianjin",
    name: "Newcastle → Tianjin (Coal)",
    resourceType: "coal",
    flowMbpd: 4,
    chokepointIds: [],
    waypoints: [
      [151.78, -32.92], // Newcastle
      [155.0, -28.0],   // Tasman Sea
      [158.0, -18.0],   // Coral Sea
      [155.0, -5.0],    // Western Pacific
      [150.0, 8.0],     // Philippine Sea
      [140.0, 22.0],    // Philippine Sea N
      [125.0, 32.0],    // Yellow Sea approach
      [117.7, 38.97],   // Tianjin
    ],
  },
  {
    id: "newcastle-coal-rotterdam",
    name: "Newcastle → Rotterdam (Coal via Cape)",
    resourceType: "coal",
    routeStatus: "diversion",
    routeAccuracy: "approximate",
    flowMbpd: 4,
    chokepointIds: ["cape-good-hope", "strait-dover"],
    waypoints: [
      [151.78, -32.92], // Newcastle
      [145.0, -35.0],   // E Tasmania
      [130.0, -35.0],   // Great Australian Bight
      [115.0, -35.0],   // SW Australia
      [100.0, -37.0],   // Indian Ocean
      [80.0, -38.0],    // Indian Ocean
      [60.0, -40.0],    // Indian Ocean SW
      [40.0, -40.0],    // Indian Ocean SW
      [20.0, -38.0],    // Approaching Cape
      [18.47, -34.36],  // Cape of Good Hope
      [5.0, -30.0],     // S Atlantic
      [-5.0, -10.0],    // Equatorial Atlantic
      [-10.0, 10.0],    // N Atlantic S
      [-10.0, 30.0],    // N Atlantic
      [-9.5, 38.7],     // Off Lisbon
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "australia-singapore-coal",
    name: "Australia → Singapore/SE Asia Coal Transshipment",
    resourceType: "coal",
    routeStatus: "diversion",
    routeAccuracy: "approximate",
    flowMbpd: 3,
    chokepointIds: [],
    waypoints: [
      [151.35, -23.85], // Gladstone
      [145.0, -15.0],   // N Queensland
      [138.0, -10.0],   // Arafura Sea
      [128.0, -8.0],    // Banda Sea
      [118.0, -8.0],    // Flores Sea
      [110.0, -5.0],    // Java Sea
      [104.0, 0.0],     // Singapore approach
      [103.82, 1.27],   // Singapore
    ],
  },
  {
    id: "beira-coal-asia",
    name: "Mozambique → Asia (Coal via Indian Ocean)",
    resourceType: "coal",
    flowMbpd: 3,
    chokepointIds: ["strait-malacca"],
    waypoints: [
      [34.84, -19.84],  // Beira / Nacala
      [38.0, -22.0],    // Mozambique Channel
      [50.0, -30.0],    // South of Madagascar
      [70.0, -20.0],    // Indian Ocean C
      [88.0, -8.0],     // Indian Ocean E
      [96.0, 5.0],      // Andaman Sea approach
      [103.85, 1.25],   // Malacca
      [114.0, 15.0],    // S China Sea
      [123.0, 28.0],    // East China Sea
      [121.5, 31.2],    // Shanghai
    ],
  },
  {
    id: "durban-coal-asia",
    name: "Richards Bay → Asia (Coal via Indian Ocean)",
    resourceType: "coal",
    routeAccuracy: "observed",
    flowMbpd: 3,
    chokepointIds: ["strait-malacca"],
    waypoints: [
      [32.06, -28.8],   // Richards Bay
      [36.0, -25.0],    // Indian Ocean NW
      [50.0, -20.0],    // Indian Ocean
      [70.0, -12.0],    // Indian Ocean C
      [88.0, -2.0],     // Indian Ocean E
      [103.85, 1.25],   // Malacca
      [108.0, 5.0],     // S China Sea
      [114.0, 22.0],    // S China Sea N
      [121.5, 31.2],    // Shanghai
    ],
  },

  // ── COPPER ROUTES ────────────────────────────────────────────────────────
  {
    id: "chile-asia-copper",
    name: "Chile → Asia (Copper via Pacific)",
    resourceType: "copper",
    flowMbpd: 3,
    chokepointIds: [],
    waypoints: [
      [-70.4, -23.65],  // Antofagasta
      [-80.0, -20.0],   // Southeast Pacific
      [-100.0, -12.0],  // South Pacific
      [-125.0, -2.0],   // Central Pacific
      [-155.0, 12.0],   // Central Pacific N
      [175.0, 25.0],    // Western Pacific
      [145.0, 32.0],    // Japan approach
      [121.5, 31.2],    // Shanghai
    ],
  },
  {
    id: "callao-copper-china",
    name: "Peru → China (Copper via Pacific)",
    resourceType: "copper",
    flowMbpd: 2,
    chokepointIds: [],
    waypoints: [
      [-77.14, -12.07], // Callao
      [-95.0, -8.0],    // Eastern Pacific
      [-120.0, 0.0],    // Central Pacific
      [-150.0, 12.0],   // Central Pacific N
      [175.0, 28.0],    // Western Pacific
      [145.0, 34.0],    // Japan approach
      [121.5, 31.2],    // Shanghai
    ],
  },
  {
    id: "chile-copper-europe-panama",
    name: "Chile Copper → Europe (via Panama)",
    resourceType: "copper",
    routeAccuracy: "observed",
    flowMbpd: 2,
    chokepointIds: ["panama-canal", "strait-dover"],
    waypoints: [
      [-70.4, -23.65],  // Antofagasta
      [-76.0, -18.0],   // Southeast Pacific
      [-81.0, -6.0],    // Peru coast offshore
      [-84.0, 4.0],     // Panama approach
      [-79.92, 9.08],   // Panama Canal
      [-75.0, 15.0],    // Caribbean
      [-55.0, 25.0],    // North Atlantic W
      [-25.0, 38.0],    // North Atlantic
      [-8.0, 45.0],     // Bay of Biscay approach
      [1.5, 51.12],     // Strait of Dover
      [4.4, 51.23],     // Antwerp
    ],
  },
  {
    id: "peru-copper-europe-panama",
    name: "Peru Copper → Europe (via Panama)",
    resourceType: "copper",
    routeAccuracy: "observed",
    flowMbpd: 2,
    chokepointIds: ["panama-canal", "strait-dover"],
    waypoints: [
      [-77.14, -12.07], // Callao
      [-81.0, -6.0],    // Peru coast offshore
      [-84.0, 4.0],     // Panama approach
      [-79.92, 9.08],   // Panama Canal
      [-75.0, 15.0],    // Caribbean
      [-55.0, 25.0],    // North Atlantic W
      [-25.0, 38.0],    // North Atlantic
      [-8.0, 45.0],     // Bay of Biscay approach
      [1.5, 51.12],     // Strait of Dover
      [4.4, 51.23],     // Antwerp
    ],
  },
  {
    id: "drc-asia-copper",
    name: "Copperbelt → Asia (Copper via Indian Ocean)",
    resourceType: "copper",
    transportMode: "multimodal",
    routeAccuracy: "approximate",
    flowMbpd: 2,
    chokepointIds: ["strait-malacca"],
    waypoints: [
      [27.8, -12.8],    // Zambia / DRC Copperbelt
      [30.2, -13.1],    // Zambia corridor
      [34.84, -19.84],  // Beira / Nacala
      [40.0, -24.0],    // Mozambique Channel
      [50.0, -30.0],    // South of Madagascar
      [70.0, -20.0],    // Indian Ocean Central
      [88.0, -8.0],     // Indian Ocean E
      [96.0, 5.0],      // Andaman Sea approach
      [103.85, 1.25],   // Strait of Malacca
      [114.0, 15.0],    // S China Sea
      [123.0, 28.0],    // East China Sea
      [121.5, 31.2],    // Shanghai
    ],
  },
  {
    id: "drc-dar-copper",
    name: "Copperbelt → Dar es Salaam Corridor",
    resourceType: "copper",
    transportMode: "multimodal",
    flowMbpd: 2,
    chokepointIds: [],
    waypoints: [
      [27.8, -12.8],    // Zambia / DRC Copperbelt
      [30.2, -13.1],    // Zambia corridor
      [33.6, -8.9],     // TAZARA corridor
      [36.7, -6.2],     // Tanzania
      [39.29, -6.82],   // Dar es Salaam
    ],
  },
  {
    id: "drc-copper-europe",
    name: "Copperbelt → Europe via Beira/Nacala",
    resourceType: "copper",
    transportMode: "multimodal",
    routeAccuracy: "approximate",
    flowMbpd: 2,
    chokepointIds: ["cape-good-hope", "strait-dover"],
    waypoints: [
      [27.8, -12.8],    // Zambia / DRC Copperbelt
      [30.2, -13.1],    // Zambia corridor
      [34.84, -19.84],  // Beira / Nacala
      [38.0, -24.0],    // Mozambique Channel S
      [40.0, -29.0],    // Indian Ocean (E of SA)
      [38.0, -34.0],    // Indian Ocean (off Port Elizabeth)
      [28.0, -38.0],    // Agulhas Bank
      [20.0, -37.0],    // SW approach to Cape
      [18.47, -34.36],  // Cape of Good Hope
      [5.0, -30.0],     // S Atlantic
      [-5.0, -15.0],    // S Atlantic N
      [-10.0, 0.0],     // Equatorial Atlantic
      [-12.0, 15.0],    // N Atlantic S
      [-10.0, 30.0],    // N Atlantic
      [-9.5, 38.7],     // Off Lisbon
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.4, 51.23],     // Antwerp
    ],
  },

  // ── LITHIUM ROUTES ───────────────────────────────────────────────────────
  {
    id: "drc-copper-lobito-europe",
    name: "DRC Copper → Europe via Lobito Corridor (emerging)",
    resourceType: "copper",
    transportMode: "multimodal",
    routeAccuracy: "observed",
    flowMbpd: 2,
    chokepointIds: ["strait-dover"],
    waypoints: [
      [25.7, -11.7],    // DRC Copperbelt / Kolwezi
      [21.8, -12.8],    // Angola interior
      [17.0, -12.4],    // Huambo
      [13.5, -12.35],   // Lobito
      [8.0, -5.0],      // Gulf of Guinea offshore
      [-5.0, 5.0],      // West Africa offshore
      [-16.0, 20.0],    // North Atlantic S
      [-12.0, 38.0],    // Off Portugal
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "lithium-triangle-china",
    name: "Lithium Triangle → China via Pacific",
    resourceType: "lithium",
    flowMbpd: 4,
    chokepointIds: [],
    waypoints: [
      [-70.4, -23.65],  // Antofagasta
      [-85.0, -18.0],   // Southeast Pacific
      [-110.0, -8.0],   // South Pacific
      [-140.0, 8.0],    // Central Pacific
      [175.0, 26.0],    // Western Pacific
      [145.0, 34.0],    // Japan approach
      [121.5, 31.2],    // Shanghai
    ],
  },
  {
    id: "australia-lithium-china",
    name: "Australia Lithium → China",
    resourceType: "lithium",
    routeAccuracy: "approximate",
    flowMbpd: 5,
    chokepointIds: [],
    waypoints: [
      [118.58, -20.31], // Port Hedland
      [115.0, -10.0],   // Timor Sea
      [116.0, -8.0],    // Lombok Strait
      [114.0, -6.0],    // Java Sea E
      [110.0, -5.0],    // Java Sea
      [109.0, -2.0],    // Karimata Strait
      [108.0, 5.0],     // S China Sea S
      [114.0, 15.0],    // S China Sea N
      [114.0, 22.0],    // HK area
      [121.5, 31.2],    // Shanghai
    ],
  },

  // ── RARE EARTH ROUTES ────────────────────────────────────────────────────
  {
    id: "china-rare-earth-global",
    name: "China Rare Earths → Europe (Suez baseline)",
    resourceType: "rare-earth",
    routeStatus: "historical",
    routeAccuracy: "approximate",
    flowMbpd: 3,
    chokepointIds: ["strait-malacca", "bab-el-mandeb", "suez-canal", "strait-dover"],
    waypoints: [
      [121.5, 31.2],    // Shanghai
      [114.0, 15.0],    // S China Sea
      [103.85, 1.25],   // Malacca
      [80.0, 7.0],      // Indian Ocean
      [60.0, 12.0],     // Arabian Sea
      [43.45, 12.6],    // Bab-el-Mandeb
      [32.35, 30.45],   // Suez Canal
      [14.0, 37.0],     // Med
      [-5.0, 36.0],     // Gibraltar
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },

  // ── IRON ORE ROUTES ──────────────────────────────────────────────────────
  {
    id: "australia-ironore-china",
    name: "Australia Iron Ore → China",
    resourceType: "iron-ore",
    flowMbpd: 10,
    chokepointIds: [],
    waypoints: [
      [118.58, -20.31], // Port Hedland
      [115.0, -10.0],   // Timor Sea
      [116.0, -8.0],    // Lombok Strait
      [114.0, -6.0],    // Java Sea E
      [110.0, -5.0],    // Java Sea
      [109.0, -2.0],    // Karimata Strait
      [108.0, 3.0],     // S China Sea entry
      [114.0, 15.0],    // S China Sea N
      [114.0, 22.0],    // HK/Guangzhou
      [121.88, 29.87],  // Ningbo-Zhoushan
    ],
  },
  {
    id: "australia-tianjin-ironore",
    name: "Australia Iron Ore → Tianjin",
    resourceType: "iron-ore",
    flowMbpd: 4,
    chokepointIds: [],
    waypoints: [
      [118.58, -20.31], // Port Hedland
      [115.0, -10.0],   // Timor Sea
      [116.0, -8.0],    // Lombok Strait
      [114.0, -6.0],    // Java Sea E
      [110.0, -5.0],    // Java Sea
      [109.0, -2.0],    // Karimata Strait
      [108.0, 5.0],     // S China Sea
      [112.0, 15.0],    // S China Sea N
      [117.0, 22.0],    // Guangzhou area
      [119.0, 30.0],    // E China Sea
      [120.0, 35.0],    // Yellow Sea S
      [117.7, 38.97],   // Tianjin
    ],
  },
  {
    id: "brazil-ironore-china",
    name: "Brazil Iron Ore → China",
    resourceType: "iron-ore",
    flowMbpd: 8,
    chokepointIds: ["cape-good-hope", "strait-malacca"],
    waypoints: [
      [-40.29, -20.29], // Tubarão (Vale)
      [-30.0, -25.0],   // S Atlantic
      [-10.0, -32.0],   // S Atlantic
      [5.0, -35.0],     // Cape approach
      [18.47, -34.36],  // Cape of Good Hope
      [40.0, -20.0],    // Indian Ocean W
      [70.0, -10.0],    // Indian Ocean C
      [90.0, 0.0],      // Indian Ocean E
      [103.85, 1.25],   // Malacca
      [114.0, 22.0],    // S China Sea
      [121.88, 29.87],  // Ningbo-Zhoushan
    ],
  },

  // ── URANIUM ROUTES ───────────────────────────────────────────────────────
  {
    id: "kazakhstan-uranium-global",
    name: "Kazakhstan Uranium → Europe via Trans-Caspian",
    resourceType: "uranium",
    transportMode: "multimodal",
    routeAccuracy: "approximate",
    flowMbpd: 2,
    chokepointIds: ["turkish-straits"],
    waypoints: [
      [51.2, 43.65],    // Aktau (Caspian)
      [49.9, 40.4],     // Baku (Caspian W)
      [41.7, 41.7],     // Georgian Black Sea coast
      [33.0, 41.0],     // Black Sea W
      [29.02, 41.13],   // Turkish Straits
      [26.0, 37.0],     // Aegean
      [14.0, 37.0],     // Med
      [4.14, 51.97],    // Rotterdam
    ],
  },

  // ── FERTILIZER ROUTES ────────────────────────────────────────────────────
  {
    id: "russia-fertilizer-global",
    name: "Russia Fertilizer → US Gulf",
    resourceType: "fertilizer",
    routeAccuracy: "approximate",
    flowMbpd: 5,
    chokepointIds: ["danish-straits", "strait-dover"],
    waypoints: [
      [28.35, 59.68],   // Ust-Luga
      [20.0, 57.0],     // Baltic
      [10.5, 57.5],     // Danish Straits
      [5.0, 55.0],      // North Sea
      [-5.0, 48.0],     // Bay of Biscay
      [-25.0, 20.0],    // N Atlantic
      [-60.0, 10.0],    // Caribbean
      [-80.0, 27.0],    // Florida
      [-95.37, 29.76],  // Houston Ship Channel
    ],
  },
  {
    id: "morocco-phosphate-americas",
    name: "Morocco Fertilizer/Phosphates → Americas",
    resourceType: "fertilizer",
    routeAccuracy: "approximate",
    flowMbpd: 3,
    chokepointIds: [],
    waypoints: [
      [-8.63, 33.12],   // Jorf Lasfar
      [-10.0, 30.0],    // Atlantic S
      [-20.0, 22.0],    // Atlantic
      [-35.0, 18.0],    // Central Atlantic
      [-50.0, 15.0],    // Atlantic W
      [-65.0, 20.0],    // Caribbean approach
      [-75.0, 25.0],    // Florida
      [-88.0, 24.0],    // Gulf of Mexico
      [-95.37, 29.76],  // Houston Ship Channel
    ],
  },
  {
    id: "morocco-phosphate-europe",
    name: "Morocco Fertilizer/Phosphates → Europe",
    resourceType: "fertilizer",
    routeAccuracy: "approximate",
    flowMbpd: 3,
    chokepointIds: ["strait-dover"],
    waypoints: [
      [-8.63, 33.12],   // Jorf Lasfar
      [-5.0, 36.0],     // Gibraltar
      [-8.0, 42.0],     // Atlantic
      [-5.0, 48.0],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.4, 51.23],     // Antwerp
    ],
  },
  // ── GAS PIPELINE ROUTES ─────────────────────────────────────────────────
  {
    id: "russia-europe-brotherhood",
    name: "Russia → Central Europe (Brotherhood Pipeline)",
    resourceType: "gas",
    routeStatus: "historical",
    transportMode: "pipeline",
    routeAccuracy: "observed",
    flowMbpd: 10,
    chokepointIds: [],
    waypoints: [
      [73.4, 66.1],   // West Siberia (Urengoy fields)
      [60.0, 62.0],   // Urals crossing
      [49.0, 57.0],   // Volga region
      [37.6, 55.8],   // Moscow hub
      [32.0, 52.0],   // Belarus/Ukraine border
      [30.5, 50.5],   // Kyiv corridor
      [24.0, 49.8],   // Western Ukraine
      [17.0, 48.2],   // Slovakia entry
      [16.4, 48.2],   // Vienna
      [13.4, 52.5],   // Berlin
    ],
  },
  {
    id: "russia-europe-nordstream",
    name: "Russia → Germany (Nord Stream, Baltic Sea)",
    resourceType: "gas",
    routeStatus: "historical",
    transportMode: "pipeline",
    routeAccuracy: "observed",
    flowMbpd: 10,
    chokepointIds: [],
    waypoints: [
      [29.0, 59.9],   // Vyborg (Russia Baltic coast)
      [25.0, 59.5],   // Gulf of Finland
      [22.0, 58.5],   // Baltic Sea
      [17.0, 57.5],   // Central Baltic
      [14.5, 55.5],   // Southern Baltic
      [13.4, 54.5],   // German coast entry
      [12.0, 54.2],   // Lubmin (Germany)
    ],
  },
  {
    id: "russia-turkey-turkstream",
    name: "Russia → SE Europe via Turkey (TurkStream)",
    resourceType: "gas",
    transportMode: "pipeline",
    routeAccuracy: "observed",
    flowMbpd: 10,
    chokepointIds: [],
    waypoints: [
      [37.3, 44.9],   // Anapa (Russia, Black Sea coast)
      [34.0, 43.0],   // Black Sea crossing
      [30.5, 41.8],   // Black Sea mid
      [28.1, 41.6],   // Kiyikoy landfall
      [27.4, 41.4],   // Luleburgaz corridor
      [26.6, 41.7],   // Turkey-Bulgaria border
    ],
  },
  {
    id: "central-asia-china",
    name: "Central Asia → China (CAGP)",
    resourceType: "gas",
    transportMode: "pipeline",
    routeAccuracy: "approximate",
    flowMbpd: 10,
    chokepointIds: [],
    waypoints: [
      [58.5, 38.0],   // Turkmenistan (Galkynysh field)
      [63.5, 39.5],   // Uzbekistan
      [64.4, 39.8],   // Bukhara / Olot corridor
      [69.2, 41.3],   // Tashkent
      [69.6, 42.3],   // Shymkent
      [76.9, 43.2],   // Almaty corridor
      [80.3, 44.1],   // Khorgos / Alatau Pass
      [87.6, 43.8],   // Ürümqi
      [91.0, 43.0],   // Xinjiang interior
      [102.0, 36.0],  // Gansu
      [108.0, 34.3],  // Shaanxi
      [113.0, 31.0],  // Hubei
      [121.5, 31.2],  // Shanghai
    ],
  },
  {
    id: "norway-europe-north-sea",
    name: "Norway → Europe (North Sea Pipelines)",
    resourceType: "gas",
    transportMode: "pipeline",
    routeAccuracy: "approximate",
    flowMbpd: 10,
    chokepointIds: [],
    waypoints: [
      [7.5, 62.5],    // Åsgard / Norwegian shelf
      [5.5, 59.0],    // Kårstø processing terminal
      [4.0, 57.5],    // North Sea
      [2.5, 55.5],    // Central North Sea
      [1.5, 53.5],    // Southern North Sea
      [3.2, 51.38],   // Zeebrugge
    ],
  },
  {
    id: "algeria-europe-transmed",
    name: "Algeria → Europe (Trans-Mediterranean)",
    resourceType: "gas",
    transportMode: "pipeline",
    routeAccuracy: "observed",
    flowMbpd: 10,
    chokepointIds: [],
    waypoints: [
      [3.3, 32.5],    // Hassi R'Mel (Algeria)
      [5.5, 35.0],    // Northern Algeria
      [8.5, 37.3],    // Tunisia crossing
      [11.0, 37.5],   // Sicilian Channel
      [13.5, 38.0],   // Sicily
      [14.0, 40.6],   // Naples
      [12.5, 44.0],   // Northern Italy
      [11.5, 44.6],    // Minerbio / northern Italy gas hub
    ],
  },
  {
    id: "azerbaijan-europe-tap",
    name: "Azerbaijan → Italy/Europe (Southern Gas Corridor)",
    resourceType: "gas",
    transportMode: "pipeline",
    routeAccuracy: "observed",
    flowMbpd: 10,
    chokepointIds: [],
    waypoints: [
      [49.9, 40.4],   // Baku (Shah Deniz field)
      [45.0, 41.7],   // Georgia (Tbilisi corridor)
      [41.0, 41.5],   // Eastern Turkey entry
      [36.0, 39.0],   // Central Anatolia
      [28.0, 38.5],   // Western Turkey
      [24.5, 40.7],   // Greece (Kipoi)
      [22.0, 40.5],   // Northern Greece
      [20.0, 40.8],   // Albania
      [18.5, 40.6],   // Puglia, Italy (TAP terminus)
    ],
  },

  // ── CHOKEPOINT COVERAGE: GAS ─────────────────────────────────────────────
  // strait-hormuz + gas: Iran–Oman pipeline crosses the Gulf of Oman near Hormuz
  {
    id: "iran-oman-gas-pipeline",
    name: "Iran → Oman Gas Pipeline (proposed)",
    resourceType: "gas",
    routeStatus: "planned",
    transportMode: "pipeline",
    routeAccuracy: "approximate",
    flowMbpd: 10,
    chokepointIds: [],
    waypoints: [
      [57.2, 26.7],    // Kuhmobarak / Rudan area
      [57.5, 25.2],    // Gulf of Oman crossing
      [57.9, 24.0],    // Oman coast approach
      [56.75, 24.35],  // Sohar
    ],
  },
  // danish-straits + gas: Norwegian Tyra-area gas to Denmark via Kattegat
  {
    id: "norway-denmark-gas",
    name: "Norway → Poland Gas (Baltic Pipe)",
    resourceType: "gas",
    transportMode: "pipeline",
    routeAccuracy: "approximate",
    flowMbpd: 10,
    chokepointIds: [],
    waypoints: [
      [5.5, 59.0],     // Kårstø (Norway)
      [7.0, 57.5],     // North Sea
      [8.5, 56.5],     // Denmark landfall
      [10.0, 55.5],    // Denmark corridor
      [13.5, 55.2],    // Baltic Sea
      [15.6, 54.2],    // Poland landfall
    ],
  },
  // strait-dover + gas: IUK Interconnector (UK–Belgium undersea gas pipeline)
  {
    id: "uk-europe-gas-interconnector",
    name: "Bacton ↔ Zeebrugge Gas Interconnector",
    resourceType: "gas",
    transportMode: "pipeline",
    routeAccuracy: "observed",
    flowMbpd: 10,
    chokepointIds: [],
    waypoints: [
      [-1.5, 52.8],    // Bacton (Norfolk, UK)
      [0.5, 52.0],     // North Sea approach
      [3.2, 51.38],    // Zeebrugge (Belgium)
    ],
  },

  // ── CHOKEPOINT COVERAGE: FERTILIZER ──────────────────────────────────────
  // bab-el-mandeb + fertilizer: Saudi Arabia fertilizer → Europe via Red Sea
  {
    id: "saudi-fertilizer-europe",
    name: "Saudi Fertilizer → Europe (via Red Sea)",
    resourceType: "fertilizer",
    flowMbpd: 3,
    chokepointIds: ["strait-hormuz", "bab-el-mandeb", "suez-canal", "strait-dover"],
    waypoints: [
      [50.1, 26.32],   // Jubail (Saudi Arabia)
      [56.45, 26.57],  // Strait of Hormuz
      [57.5, 22.0],    // Gulf of Oman
      [52.0, 13.5],    // Gulf of Aden
      [43.45, 12.6],   // Bab-el-Mandeb
      [38.0, 20.0],    // Red Sea
      [32.35, 30.45],  // Suez Canal
      [25.0, 33.5],    // Eastern Med
      [14.0, 37.0],    // Central Med
      [5.0, 36.5],     // Western Med
      [-5.0, 36.0],    // Gibraltar
      [-5.0, 48.5],    // Bay of Biscay
      [1.5, 51.12],    // Strait of Dover
      [4.14, 51.97],   // Rotterdam
    ],
  },
  // turkish-straits + fertilizer: Black Sea fertilizer → Europe
  {
    id: "black-sea-fertilizer-europe",
    name: "Black Sea Fertilizer → Europe (via Turkish Straits)",
    resourceType: "fertilizer",
    flowMbpd: 4,
    chokepointIds: ["turkish-straits", "strait-dover"],
    waypoints: [
      [37.77, 44.72],  // Novorossiysk
      [31.0, 43.0],    // Black Sea W
      [29.02, 41.13],  // Turkish Straits
      [26.0, 37.0],    // Aegean
      [22.0, 35.0],    // E Med
      [14.0, 37.0],    // Central Med
      [5.0, 36.5],     // Western Med
      [-5.0, 36.0],    // Gibraltar
      [-9.5, 38.7],    // Atlantic
      [-5.0, 48.5],    // Bay of Biscay
      [1.5, 51.12],    // Strait of Dover
      [4.14, 51.97],   // Rotterdam
    ],
  },

  // ── CHOKEPOINT COVERAGE: PANAMA CANAL ───────────────────────────────────
  // panama-canal + lng: US Gulf LNG → Japan via Panama (major real route)
  {
    id: "us-gulf-asia-lng-panama",
    name: "US Gulf LNG → Japan (via Panama)",
    resourceType: "lng",
    flowMbpd: 4,
    chokepointIds: ["panama-canal"],
    waypoints: [
      [-93.87, 29.73],  // Sabine Pass LNG
      [-88.0, 26.0],    // Gulf of Mexico
      [-84.0, 22.0],    // Caribbean
      [-79.92, 9.08],   // Panama Canal
      [-90.0, 5.0],     // Pacific off C. America
      [-110.0, 15.0],   // E Pacific
      [-130.0, 22.0],   // Pacific Central
      [-155.0, 35.0],   // N Pacific
      [-175.0, 40.0],   // N Pacific mid
      [160.0, 38.0],    // W Pacific
      [140.0, 35.0],    // Japan approach
      [139.64, 35.44],  // Yokohama / Tokyo
    ],
  },
  // panama-canal + grain: US Gulf grain → Asia via Panama (major real route)
  {
    id: "us-gulf-asia-grain-panama",
    name: "US Gulf Grain → Asia (via Panama)",
    resourceType: "grain",
    flowMbpd: 5,
    chokepointIds: ["panama-canal"],
    waypoints: [
      [-91.24, 29.95],  // New Orleans (Mississippi)
      [-88.0, 26.0],    // Gulf of Mexico
      [-84.0, 22.0],    // Caribbean
      [-79.92, 9.08],   // Panama Canal
      [-90.0, 5.0],     // Pacific off C. America
      [-105.0, 15.0],   // E Pacific
      [-125.0, 22.0],   // Pacific Central
      [-150.0, 30.0],   // Pacific mid
      [-175.0, 35.0],   // N Pacific
      [160.0, 35.0],    // W Pacific
      [140.0, 35.0],    // Japan approach
      [121.5, 31.2],    // Shanghai
    ],
  },
  // cape-good-hope + coal: Colombia coal → Asia via Cape
  {
    id: "colombia-asia-coal-panama",
    name: "Colombia Coal → Asia (via Cape)",
    resourceType: "coal",
    routeAccuracy: "observed",
    flowMbpd: 3,
    chokepointIds: ["cape-good-hope"],
    waypoints: [
      [-73.2, 11.8],    // Puerto Bolívar (Colombia)
      [-65.0, 15.0],    // Caribbean exit
      [-40.0, 5.0],     // South Atlantic
      [-20.0, -15.0],   // Mid Atlantic
      [5.0, -35.0],     // South Atlantic approach
      [18.47, -34.36],  // Cape of Good Hope
      [45.0, -35.0],    // Southern Indian Ocean
      [80.0, -30.0],    // Indian Ocean
      [110.0, -20.0],   // Toward Australia
      [135.0, 0.0],     // Western Pacific approach
      [145.0, 20.0],    // W Pacific
      [139.64, 35.44],  // Yokohama / Tokyo
    ],
  },

  // ── CHOKEPOINT COVERAGE: CAPE OF GOOD HOPE ──────────────────────────────
  // cape-good-hope + lng: Australia LNG → Europe via Cape
  {
    id: "australia-europe-lng-cape",
    name: "Australia LNG → Europe (rare Cape diversion)",
    resourceType: "lng",
    routeStatus: "diversion",
    routeAccuracy: "approximate",
    flowMbpd: 3,
    chokepointIds: ["cape-good-hope", "strait-dover"],
    waypoints: [
      [151.35, -23.85], // Gladstone
      [154.0, -28.0],   // Offshore Queensland
      [153.0, -35.0],   // Tasman Sea
      [146.0, -43.5],   // South of Tasmania
      [130.0, -38.0],   // Southern Ocean / Great Australian Bight
      [110.0, -38.0],   // Indian Ocean SW
      [80.0, -38.0],    // Indian Ocean W
      [50.0, -38.0],    // Indian Ocean SW
      [25.0, -36.0],    // Approaching Cape
      [18.47, -34.36],  // Cape of Good Hope
      [5.0, -30.0],     // S Atlantic
      [-5.0, -10.0],    // Atlantic
      [-10.0, 10.0],    // N Atlantic S
      [-10.0, 30.0],    // N Atlantic
      [-9.5, 38.7],     // Off Lisbon
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },

  // ── CHOKEPOINT COVERAGE: STRAIT OF DOVER ────────────────────────────────
  // strait-dover + iron-ore: Brazil iron ore → European steel mills via Cape
  {
    id: "brazil-ironore-europe",
    name: "Brazil Iron Ore → Europe",
    resourceType: "iron-ore",
    flowMbpd: 4,
    chokepointIds: ["strait-dover"],
    waypoints: [
      [-40.29, -20.29], // Tubarão (Vale)
      [-35.0, -15.0],   // South Atlantic
      [-30.0, 0.0],     // Equatorial Atlantic
      [-24.0, 20.0],    // North Atlantic S
      [-14.0, 38.0],    // Off Portugal
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  // strait-dover + lithium: Lithium Triangle → European battery makers via Cape Horn
  {
    id: "lithium-triangle-europe",
    name: "Lithium Triangle → Europe (via Cape Horn)",
    resourceType: "lithium",
    routeStatus: "diversion",
    flowMbpd: 2,
    chokepointIds: ["cape-horn", "strait-dover"],
    waypoints: [
      [-70.4, -23.65],  // Antofagasta
      [-71.0, -32.0],   // Pacific coast S
      [-72.5, -42.0],   // S Chile
      [-68.0, -52.0],   // Approaching Cape Horn
      [-67.28, -55.98], // Cape Horn
      [-55.0, -52.0],   // S Atlantic
      [-40.0, -42.0],   // S Atlantic
      [-25.0, -30.0],   // S Atlantic N
      [-20.0, -15.0],   // Atlantic
      [-18.0, 5.0],     // N Atlantic S
      [-15.0, 25.0],    // N Atlantic
      [-10.0, 38.0],    // Off Portugal
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },

  // ── CHOKEPOINT COVERAGE: CAPE HORN ──────────────────────────────────────
  // cape-horn + grain: Argentina grain → Asia via Cape Horn (Pacific crossing)
  {
    id: "argentina-grain-asia-horn",
    name: "Argentina Grain → Asia (via Cape Horn)",
    resourceType: "grain",
    flowMbpd: 3,
    chokepointIds: ["cape-horn"],
    waypoints: [
      [-57.64, -38.0],  // Bahía Blanca (Argentina)
      [-62.0, -42.0],   // S Atlantic
      [-64.0, -50.0],   // Approaching Horn
      [-67.28, -55.98], // Cape Horn
      [-80.0, -52.0],   // S Pacific
      [-90.0, -38.0],   // Pacific
      [-105.0, -25.0],  // Pacific
      [-120.0, -10.0],  // Central Pacific
      [-150.0, 0.0],    // Pacific Equator
      [-170.0, 10.0],   // Pacific W
      [170.0, 20.0],    // W Pacific
      [145.0, 28.0],    // Japan/China approach
      [130.0, 30.0],    // E China Sea
      [121.5, 31.2],    // Shanghai
    ],
  },
  // cape-horn + copper: Chile copper → Europe via Cape Horn (Panama backup)
  {
    id: "chile-copper-europe-horn",
    name: "Chile Copper → Europe (via Cape Horn)",
    resourceType: "copper",
    routeStatus: "diversion",
    flowMbpd: 2,
    chokepointIds: ["cape-horn", "strait-dover"],
    waypoints: [
      [-70.4, -23.65],  // Antofagasta
      [-71.0, -32.0],   // Pacific coast S
      [-72.5, -42.0],   // S Chile
      [-68.0, -52.0],   // Approaching Cape Horn
      [-67.28, -55.98], // Cape Horn
      [-55.0, -52.0],   // S Atlantic
      [-40.0, -42.0],   // S Atlantic
      [-25.0, -30.0],   // S Atlantic N
      [-20.0, -15.0],   // Atlantic
      [-18.0, 5.0],     // N Atlantic S
      [-15.0, 25.0],    // N Atlantic
      [-10.0, 38.0],    // Off Portugal
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.4, 51.23],     // Antwerp
    ],
  },

  // ── CHOKEPOINT COVERAGE: DANISH STRAITS ─────────────────────────────────
  // danish-straits + coal: Russia/Baltic coal → NW Europe
  {
    id: "russia-coal-europe-baltic",
    name: "Russia Arctic Coal → NW Europe",
    resourceType: "coal",
    routeStatus: "historical",
    routeAccuracy: "observed",
    flowMbpd: 4,
    chokepointIds: ["strait-dover"],
    waypoints: [
      [33.1, 68.97],   // Murmansk
      [20.0, 69.0],    // Norwegian Sea E
      [10.0, 62.0],    // Norwegian Sea
      [5.0, 60.0],     // North Sea N
      [4.0, 53.5],     // Southern North Sea
      [1.5, 51.12],    // Strait of Dover
      [4.14, 51.97],   // Rotterdam
    ],
  },

  // ── ADDITIONAL MACRO ROUTES ───────────────────────────────────────────────
  {
    id: "europe-us-east-container",
    name: "Europe → US East Coast (Transatlantic Containers)",
    resourceType: "container",
    flowMbpd: 7,
    chokepointIds: ["strait-dover"],
    waypoints: [
      [4.14, 51.97],    // Rotterdam
      [1.5, 51.12],     // Strait of Dover
      [-5.0, 49.5],     // English Channel W
      [-20.0, 48.0],    // N Atlantic E
      [-45.0, 43.0],    // N Atlantic
      [-65.0, 40.5],    // US East Coast approach
      [-74.0, 40.7],    // New York / New Jersey
    ],
  },
  {
    id: "indonesia-china-coal",
    name: "Indonesia → China (Coal)",
    resourceType: "coal",
    flowMbpd: 6,
    chokepointIds: ["strait-malacca"],
    waypoints: [
      [116.8, -1.3],    // East Kalimantan coal terminals
      [119.0, 1.0],     // Makassar Strait
      [122.0, 5.0],     // Celebes Sea
      [116.0, 15.0],    // South China Sea
      [121.0, 22.0],    // Taiwan Strait W
      [123.0, 28.0],    // East China Sea
      [122.2, 29.8],    // Ningbo-Zhoushan offshore
    ],
  },
  {
    id: "indonesia-india-coal",
    name: "Indonesia → West India (Coal)",
    resourceType: "coal",
    routeAccuracy: "approximate",
    flowMbpd: 5,
    chokepointIds: ["strait-malacca"],
    waypoints: [
      [117.5, -1.0],    // East Kalimantan coal terminals offshore
      [118.5, -4.0],    // Makassar Strait
      [112.0, -4.0],    // Java Sea
      [106.0, -2.0],    // Singapore approach
      [103.85, 1.25],   // Strait of Malacca
      [95.0, 6.0],      // Andaman Sea
      [85.0, 2.0],      // South of Sri Lanka
      [75.0, 5.0],      // Indian Ocean S of India
      [70.0, 15.0],     // Arabian Sea
      [72.2, 18.8],     // Mumbai offshore
    ],
  },
  {
    id: "canada-brazil-potash",
    name: "Canada → Brazil (Potash via Panama)",
    resourceType: "fertilizer",
    flowMbpd: 4,
    chokepointIds: ["panama-canal"],
    waypoints: [
      [-123.1, 49.3],   // Vancouver
      [-124.8, 48.4],   // Strait of Juan de Fuca
      [-130.0, 42.0],   // Pacific coast offshore
      [-118.0, 25.0],   // E Pacific
      [-100.0, 15.0],   // Central America offshore
      [-86.0, 7.0],     // Panama approach
      [-79.92, 9.08],   // Panama Canal
      [-75.0, 15.0],    // Caribbean
      [-60.0, 15.0],    // Atlantic NE South America
      [-40.0, 5.0],     // Equatorial Atlantic
      [-25.0, -15.0],   // S Atlantic
      [-35.0, -25.0],   // Brazil coast offshore
      [-48.51, -25.52], // Paranaguá
    ],
  },
  {
    id: "baltic-fertilizer-brazil",
    name: "Baltic Fertilizer → Brazil",
    resourceType: "fertilizer",
    flowMbpd: 4,
    chokepointIds: ["danish-straits", "strait-dover"],
    waypoints: [
      [28.35, 59.68],   // Ust-Luga / Baltic fertilizer export
      [25.0, 59.8],     // Gulf of Finland
      [21.0, 58.5],     // Baltic Sea E
      [17.0, 56.5],     // Baltic Sea
      [13.0, 55.0],     // South Baltic
      [10.5, 57.5],     // Danish Straits
      [8.0, 57.0],      // Skagerrak
      [4.0, 54.0],      // North Sea
      [1.5, 51.12],     // Strait of Dover
      [-5.0, 49.5],     // English Channel W
      [-8.0, 48.0],     // Bay of Biscay
      [-20.0, 35.0],    // N Atlantic
      [-25.0, 15.0],    // Atlantic W Africa offshore
      [-30.0, -5.0],    // Equatorial Atlantic
      [-35.0, -20.0],   // S Atlantic
      [-48.51, -25.52], // Paranaguá
    ],
  },
  {
    id: "us-gulf-china-soy-grain-panama",
    name: "US Gulf → China (Soy/Grain via Panama)",
    resourceType: "grain",
    flowMbpd: 6,
    chokepointIds: ["panama-canal"],
    waypoints: [
      [-91.24, 29.95],  // New Orleans / Mississippi River
      [-88.0, 26.0],    // Gulf of Mexico
      [-84.0, 22.0],    // Caribbean approach
      [-79.92, 9.08],   // Panama Canal
      [-86.0, 7.0],     // Pacific off Panama
      [-100.0, 10.0],   // Pacific off Central America
      [-115.0, 18.0],   // E Pacific
      [-140.0, 28.0],   // N Pacific
      [175.0, 36.0],    // W Pacific
      [145.0, 34.0],    // Japan approach
      [121.5, 31.2],    // Shanghai
    ],
  },
  {
    id: "black-sea-egypt-grain",
    name: "Black Sea → Egypt (Wheat)",
    resourceType: "grain",
    flowMbpd: 4,
    chokepointIds: ["turkish-straits"],
    waypoints: [
      [30.73, 46.49],   // Odesa
      [29.02, 41.13],   // Turkish Straits
      [26.0, 37.0],     // Aegean
      [24.0, 33.5],     // Eastern Med
      [29.5, 31.8],     // Egypt coast offshore
      [31.2, 31.3],     // Alexandria / Damietta
    ],
  },
  {
    id: "qatar-china-lng",
    name: "Qatar LNG → China",
    resourceType: "lng",
    flowMbpd: 6,
    chokepointIds: ["strait-hormuz", "strait-malacca"],
    waypoints: [
      [51.55, 25.9],    // Ras Laffan
      [56.45, 26.57],   // Strait of Hormuz
      [62.0, 20.0],     // Arabian Sea
      [72.0, 12.0],     // Indian Ocean N
      [80.0, 7.0],      // Bay of Bengal
      [90.0, 5.0],      // Bay of Bengal E
      [96.0, 5.0],      // Andaman Sea
      [103.85, 1.25],   // Strait of Malacca
      [112.0, 12.0],    // South China Sea
      [121.0, 22.0],    // Taiwan Strait W
      [123.0, 28.0],    // East China Sea
      [122.2, 29.8],    // Ningbo-Zhoushan offshore
    ],
  },
  {
    id: "australia-china-lng",
    name: "Australia LNG → China",
    resourceType: "lng",
    flowMbpd: 6,
    chokepointIds: [],
    waypoints: [
      [151.35, -23.85], // Gladstone
      [155.0, -15.0],   // Coral Sea
      [150.0, -5.0],    // Pacific W
      [140.0, 5.0],     // Philippine Sea S
      [130.0, 15.0],    // Philippine Sea
      [124.0, 24.0],    // Taiwan approach
      [121.88, 29.87],  // Ningbo-Zhoushan
    ],
  },
  {
    id: "australia-korea-lng",
    name: "Australia LNG → Korea",
    resourceType: "lng",
    routeAccuracy: "observed",
    flowMbpd: 5,
    chokepointIds: [],
    waypoints: [
      [151.35, -23.85], // Gladstone
      [155.0, -15.0],   // Coral Sea
      [150.0, -5.0],    // Pacific W
      [142.0, 8.0],     // Philippine Sea S
      [135.0, 22.0],    // Philippine Sea N
      [132.0, 30.0],    // Japan Sea approach
      [128.0, 34.0],    // Korea Strait approach
      [129.31, 35.54],  // Ulsan
    ],
  },
  {
    id: "russia-pacific-northeast-asia-oil",
    name: "Russia Pacific → Northeast Asia (Oil)",
    resourceType: "oil",
    flowMbpd: 3,
    chokepointIds: [],
    waypoints: [
      [133.05, 42.7],   // Kozmino / Nakhodka
      [136.0, 40.0],    // Sea of Japan
      [132.0, 34.0],    // Korea Strait
      [126.0, 34.0],    // Yellow Sea
      [123.0, 39.0],    // Bohai approach
      [121.65, 38.9],   // Dalian
    ],
  },
  {
    id: "canada-uranium-europe",
    name: "Canada Uranium → Europe",
    resourceType: "uranium",
    flowMbpd: 2,
    chokepointIds: ["strait-dover"],
    waypoints: [
      [-63.57, 44.65],  // Halifax
      [-50.0, 45.0],    // N Atlantic W
      [-25.0, 48.0],    // N Atlantic
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "namibia-uranium-china",
    name: "Namibia Uranium → China",
    resourceType: "uranium",
    flowMbpd: 2,
    chokepointIds: ["cape-good-hope", "strait-malacca"],
    waypoints: [
      [14.5, -22.95],   // Walvis Bay
      [10.0, -30.0],    // S Atlantic
      [18.47, -34.36],  // Cape of Good Hope
      [25.0, -38.0],    // South of Africa
      [45.0, -35.0],    // Indian Ocean W
      [65.0, -25.0],    // Indian Ocean C
      [88.0, -8.0],     // Indian Ocean E
      [96.0, -2.0],     // Sunda approach offshore
      [103.85, 1.25],   // Strait of Malacca
      [114.0, 15.0],    // South China Sea
      [123.0, 28.0],    // East China Sea
      [121.5, 31.2],    // Shanghai
    ],
  },
  {
    id: "australia-uranium-japan-korea",
    name: "Australia Uranium → Korea",
    resourceType: "uranium",
    routeAccuracy: "approximate",
    flowMbpd: 2,
    chokepointIds: [],
    waypoints: [
      [138.5, -34.78],  // Port Adelaide
      [148.0, -25.0],   // Tasman approach
      [155.0, -12.0],   // Pacific W
      [160.0, 0.0],     // Pacific W
      [155.0, 10.0],    // Pacific W
      [150.0, 22.0],    // Pacific W
      [145.0, 28.0],    // Japan approach
      [140.0, 30.0],    // Japan approach
      [132.0, 34.0],    // Korea Strait approach
      [129.07, 35.1],   // Busan
    ],
  },
  {
    id: "australia-ironore-japan-korea",
    name: "Australia Iron Ore → Korea",
    resourceType: "iron-ore",
    routeAccuracy: "approximate",
    flowMbpd: 5,
    chokepointIds: [],
    waypoints: [
      [118.58, -20.31], // Port Hedland
      [116.0, -18.0],   // Western Australia offshore
      [113.0, -12.0],   // Indian Ocean / Timor approach
      [118.0, -7.0],    // Timor Sea
      [130.0, -5.0],    // Arafura Sea
      [145.0, 0.0],     // W Pacific
      [160.0, -5.0],    // W Pacific
      [155.0, 10.0],    // Pacific W
      [145.0, 20.0],    // Japan approach S
      [140.0, 30.0],    // Japan approach
      [132.0, 34.0],    // Korea Strait approach
      [127.75, 34.9],   // Gwangyang
    ],
  },
  {
    id: "brazil-north-soy-china",
    name: "Brazil North Arc → China (Soy/Grain)",
    resourceType: "grain",
    flowMbpd: 5,
    chokepointIds: ["cape-good-hope", "strait-malacca"],
    waypoints: [
      [-44.3, -2.5],    // Itaqui / São Luís
      [-40.0, 0.0],     // Brazil north coast offshore
      [-30.0, -10.0],   // S Atlantic
      [-15.0, -28.0],   // South Atlantic
      [5.0, -35.0],     // Cape approach
      [18.47, -34.36],  // Cape of Good Hope
      [25.0, -38.0],    // South of Africa
      [45.0, -35.0],    // Indian Ocean W
      [65.0, -25.0],    // Indian Ocean C
      [88.0, -8.0],     // Indian Ocean E
      [96.0, -2.0],     // Sunda approach offshore
      [103.85, 1.25],   // Strait of Malacca
      [114.0, 15.0],    // South China Sea
      [123.0, 28.0],    // East China Sea
      [121.5, 31.2],    // Shanghai
    ],
  },
  {
    id: "argentina-grain-europe",
    name: "Argentina Grain → Europe",
    resourceType: "grain",
    flowMbpd: 3,
    chokepointIds: ["strait-dover"],
    waypoints: [
      [-57.64, -38.0],  // Bahía Blanca
      [-50.0, -35.0],   // S Atlantic offshore
      [-35.0, -20.0],   // S Atlantic
      [-25.0, 0.0],     // Equatorial Atlantic
      [-20.0, 20.0],    // N Atlantic
      [-14.0, 38.0],    // Off Portugal
      [-12.0, 43.0],    // Bay of Biscay approach
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "morocco-phosphate-india",
    name: "Morocco Fertilizer/Phosphates → India",
    resourceType: "fertilizer",
    routeAccuracy: "approximate",
    flowMbpd: 3,
    chokepointIds: ["suez-canal", "bab-el-mandeb"],
    waypoints: [
      [-8.63, 33.12],   // Jorf Lasfar
      [-5.5, 35.8],     // Gibraltar
      [0.0, 37.5],      // Western Med
      [8.0, 38.0],      // Central Med W
      [16.0, 36.5],     // Central Med
      [25.0, 34.0],     // Eastern Med
      [32.35, 30.45],   // Suez Canal
      [33.0, 29.5],     // Red Sea entry
      [35.0, 25.0],     // Red Sea N
      [38.0, 20.0],     // Red Sea
      [43.45, 12.6],    // Bab-el-Mandeb
      [60.0, 12.0],     // Arabian Sea
      [72.82, 18.96],   // Mumbai / west India
    ],
  },
  {
    id: "morocco-phosphate-brazil",
    name: "Morocco Fertilizer/Phosphates → Brazil",
    resourceType: "fertilizer",
    routeAccuracy: "approximate",
    flowMbpd: 3,
    chokepointIds: [],
    waypoints: [
      [-8.63, 33.12],   // Jorf Lasfar
      [-18.0, 25.0],    // Atlantic
      [-25.0, 10.0],    // Equatorial Atlantic N
      [-30.0, -5.0],    // Equatorial Atlantic
      [-35.0, -20.0],   // S Atlantic
      [-48.51, -25.52], // Paranaguá
    ],
  },
  {
    id: "middle-east-urea-india",
    name: "Middle East Urea → India",
    resourceType: "fertilizer",
    flowMbpd: 4,
    chokepointIds: ["strait-hormuz"],
    waypoints: [
      [50.1, 26.32],    // Jubail / Gulf fertilizer export
      [56.45, 26.57],   // Strait of Hormuz
      [60.0, 22.0],     // Arabian Sea
      [66.0, 20.0],     // Arabian Sea E
      [72.82, 18.96],   // Mumbai / west India
    ],
  },
  {
    id: "australia-lithium-europe",
    name: "Australia Lithium → Europe Supply Chain (emerging)",
    resourceType: "lithium",
    routeStatus: "planned",
    routeAccuracy: "approximate",
    flowMbpd: 3,
    chokepointIds: ["cape-good-hope", "strait-dover"],
    waypoints: [
      [118.58, -20.31], // Port Hedland
      [117.0, -20.8],   // Western Australia offshore
      [112.0, -24.0],   // Indian Ocean E
      [100.0, -30.0],   // Indian Ocean E
      [80.0, -35.0],    // Indian Ocean S
      [50.0, -38.0],    // Indian Ocean SW
      [25.0, -36.0],    // Cape approach
      [18.47, -34.36],  // Cape of Good Hope
      [5.0, -30.0],     // S Atlantic
      [-25.0, 0.0],     // Equatorial Atlantic
      [-30.0, 20.0],    // N Atlantic S
      [-20.0, 35.0],    // N Atlantic
      [-9.5, 43.0],     // Bay of Biscay approach
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "australia-rare-earth-malaysia",
    name: "Australia Rare Earths → Malaysia",
    resourceType: "rare-earth",
    flowMbpd: 2,
    chokepointIds: [],
    waypoints: [
      [115.75, -32.05], // Fremantle / Western Australia
      [100.0, -20.0],   // Indian Ocean
      [94.0, -5.0],     // Indian Ocean NE
      [96.0, 5.0],      // Andaman Sea
      [103.85, 1.25],   // Strait of Malacca
      [106.0, 4.0],     // South China Sea
      [103.3, 3.8],     // Kuantan / Malaysia processing
    ],
  },
  {
    id: "drc-cobalt-dar-china",
    name: "DRC Cobalt → China via Dar es Salaam",
    resourceType: "cobalt",
    transportMode: "multimodal",
    flowMbpd: 3,
    chokepointIds: ["strait-malacca"],
    waypoints: [
      [27.8, -12.8],    // Zambia / DRC Copperbelt
      [30.2, -13.1],    // Zambia corridor
      [33.6, -8.9],     // TAZARA corridor
      [39.29, -6.82],   // Dar es Salaam
      [48.0, -8.0],     // Indian Ocean W
      [70.0, -5.0],     // Indian Ocean C
      [90.0, 0.0],      // Indian Ocean E
      [103.85, 1.25],   // Strait of Malacca
      [114.0, 15.0],    // South China Sea
      [121.5, 31.2],    // Shanghai
    ],
  },
  {
    id: "drc-cobalt-southern-africa",
    name: "DRC Cobalt → Southern Africa via North-South Corridor",
    resourceType: "cobalt",
    transportMode: "multimodal",
    routeAccuracy: "approximate",
    flowMbpd: 2,
    chokepointIds: [],
    waypoints: [
      [25.7, -11.7],    // DRC Copperbelt
      [27.8, -12.8],    // Zambia / DRC Copperbelt
      [28.3, -15.4],    // Lusaka corridor
      [29.9, -22.2],    // Beitbridge corridor
      [29.8, -26.2],    // South Africa inland corridor
      [31.03, -29.88],  // Durban
    ],
  },
  {
    id: "drc-cobalt-lobito-europe",
    name: "DRC Cobalt → Europe via Lobito Corridor (emerging)",
    resourceType: "cobalt",
    transportMode: "multimodal",
    routeAccuracy: "observed",
    flowMbpd: 2,
    chokepointIds: ["strait-dover"],
    waypoints: [
      [27.8, -12.8],    // Zambia / DRC Copperbelt
      [25.7, -11.7],    // DRC Copperbelt
      [21.8, -12.8],    // Angola interior
      [17.0, -12.4],    // Huambo
      [13.5, -12.35],   // Lobito
      [8.0, -5.0],      // Gulf of Guinea offshore
      [-5.0, 5.0],      // West Africa offshore
      [-16.0, 20.0],    // North Atlantic S
      [-12.0, 38.0],    // Off Portugal
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "myanmar-rare-earth-china",
    name: "Myanmar Rare Earths → China",
    resourceType: "rare-earth",
    transportMode: "road",
    flowMbpd: 2,
    chokepointIds: [],
    waypoints: [
      [97.85, 25.0],    // Myanmar rare earth belt
      [100.2, 24.2],    // Yunnan border corridor
      [102.8, 24.9],    // Kunming
      [109.0, 23.5],    // Guangxi corridor
      [113.3, 23.1],    // Guangzhou / PRD
    ],
  },
  {
    id: "china-rare-earth-japan-korea",
    name: "China Rare Earths → Korea",
    resourceType: "rare-earth",
    flowMbpd: 2,
    chokepointIds: [],
    waypoints: [
      [121.5, 31.2],    // Shanghai
      [124.0, 30.0],    // East China Sea
      [128.0, 34.0],    // Korea Strait
      [129.07, 35.1],   // Busan
    ],
  },
  {
    id: "china-rare-earth-japan",
    name: "China Rare Earths → Japan",
    resourceType: "rare-earth",
    flowMbpd: 2,
    chokepointIds: [],
    waypoints: [
      [121.5, 31.2],    // Shanghai
      [124.0, 30.0],    // East China Sea
      [132.0, 32.0],    // Japan approach
      [139.64, 35.44],  // Yokohama / Tokyo
    ],
  },
  {
    id: "china-rare-earth-us-west",
    name: "China Rare Earths → US West Coast",
    resourceType: "rare-earth",
    routeAccuracy: "approximate",
    flowMbpd: 2,
    chokepointIds: [],
    waypoints: [
      [121.5, 31.2],    // Shanghai
      [123.0, 30.0],    // East China Sea
      [130.0, 32.0],    // East China Sea / Japan approach
      [145.0, 35.0],    // Japan approach
      [170.0, 35.0],    // North Pacific W
      [-165.0, 35.0],   // North Pacific C
      [-140.0, 34.0],   // North Pacific E
      [-118.17, 33.75], // Los Angeles / Long Beach
    ],
  },
  {
    id: "china-rare-earth-us-east-panama",
    name: "China Rare Earths → US East Coast via Panama",
    resourceType: "rare-earth",
    routeAccuracy: "approximate",
    flowMbpd: 2,
    chokepointIds: ["panama-canal"],
    waypoints: [
      [121.5, 31.2],    // Shanghai
      [145.0, 34.0],    // Japan approach
      [170.0, 35.0],    // North Pacific W
      [-165.0, 35.0],   // North Pacific C
      [-140.0, 28.0],   // North Pacific E
      [-115.0, 18.0],   // E Pacific
      [-95.0, 10.0],    // Central America approach
      [-79.92, 9.08],   // Panama Canal
      [-75.0, 15.0],    // Caribbean
      [-65.0, 28.0],    // Atlantic approach
      [-74.0, 40.7],    // New York / New Jersey
    ],
  },
  {
    id: "china-rare-earth-us-east",
    name: "China Rare Earths → US East Coast via Cape",
    resourceType: "rare-earth",
    routeStatus: "diversion",
    routeAccuracy: "approximate",
    flowMbpd: 2,
    chokepointIds: ["strait-malacca", "cape-good-hope"],
    waypoints: [
      [121.5, 31.2],    // Shanghai
      [123.0, 28.5],    // East China Sea offshore
      [124.0, 24.0],    // East of Taiwan
      [121.0, 20.0],    // Luzon Strait approach
      [114.0, 15.0],    // South China Sea
      [103.85, 1.25],   // Strait of Malacca
      [101.0, 2.8],     // Malacca northwest
      [98.0, 5.8],      // Andaman Sea
      [90.0, 2.0],      // Indian Ocean E
      [80.0, -10.0],    // Indian Ocean
      [60.0, -25.0],    // Indian Ocean SW
      [35.0, -35.0],    // Cape approach
      [18.47, -34.36],  // Cape of Good Hope
      [5.0, -30.0],     // South Atlantic
      [-15.0, -15.0],   // South Atlantic N
      [-30.0, 5.0],     // Equatorial Atlantic
      [-45.0, 20.0],    // North Atlantic S
      [-60.0, 30.0],    // Western Atlantic
      [-70.0, 36.0],    // US East Coast offshore
      [-74.0, 40.7],    // New York / New Jersey
    ],
  },
  {
    id: "us-rare-earth-asia",
    name: "US Rare Earth Concentrate → China (historical)",
    resourceType: "rare-earth",
    routeStatus: "historical",
    transportMode: "multimodal",
    routeAccuracy: "observed",
    flowMbpd: 2,
    chokepointIds: [],
    waypoints: [
      [-115.55, 35.47], // Mountain Pass
      [-118.17, 33.75], // Los Angeles / Long Beach
      [-135.0, 30.0],   // North Pacific E
      [-160.0, 32.0],   // North Pacific C
      [170.0, 34.0],    // North Pacific W
      [145.0, 35.0],    // Japan approach
      [121.5, 31.2],    // Shanghai
    ],
  },
  {
    id: "china-strategic-metals-taiwan-korea",
    name: "China Strategic Metals → Taiwan",
    resourceType: "strategic-metals",
    routeAccuracy: "approximate",
    flowMbpd: 2,
    chokepointIds: [],
    waypoints: [
      [121.5, 31.2],    // Shanghai
      [123.0, 28.5],    // East China Sea offshore
      [120.0, 25.5],    // Taiwan Strait north
      [119.2, 23.2],    // Taiwan Strait west
      [120.3, 22.6],    // Kaohsiung
    ],
  },
  {
    id: "china-strategic-metals-korea",
    name: "China Strategic Metals → Korea",
    resourceType: "strategic-metals",
    flowMbpd: 2,
    chokepointIds: [],
    waypoints: [
      [121.5, 31.2],    // Shanghai
      [123.0, 28.5],    // East China Sea offshore
      [126.0, 31.0],    // East China Sea north
      [128.0, 34.0],    // Korea Strait
      [129.07, 35.1],   // Busan
    ],
  },
  {
    id: "china-strategic-metals-europe",
    name: "China Strategic Metals → Europe (Suez baseline)",
    resourceType: "strategic-metals",
    routeStatus: "historical",
    routeAccuracy: "approximate",
    flowMbpd: 2,
    chokepointIds: ["strait-malacca", "bab-el-mandeb", "suez-canal", "strait-dover"],
    waypoints: [
      [121.5, 31.2],    // Shanghai
      [123.0, 28.5],    // East China Sea offshore
      [120.0, 25.5],    // Taiwan Strait north
      [119.2, 22.0],    // Taiwan Strait west
      [114.0, 15.0],    // South China Sea
      [103.85, 1.25],   // Strait of Malacca
      [98.0, 6.0],      // Andaman Sea
      [90.0, 4.0],      // Bay of Bengal
      [82.0, 2.0],      // South of Sri Lanka
      [70.0, 8.0],      // Arabian Sea
      [60.0, 12.0],     // Arabian Sea
      [43.45, 12.6],    // Bab-el-Mandeb
      [41.7, 15.0],     // Red Sea south
      [39.5, 18.5],     // Red Sea
      [37.6, 22.5],     // Red Sea
      [34.8, 27.5],     // Red Sea north
      [33.0, 29.5],     // Suez approach
      [32.35, 30.45],   // Suez Canal
      [14.0, 37.0],     // Mediterranean
      [10.0, 38.2],     // Central Mediterranean
      [5.0, 38.5],      // Western Mediterranean
      [0.0, 37.5],      // Alboran Sea
      [-5.5, 35.8],     // Gibraltar
      [-10.0, 37.0],    // Atlantic off Portugal
      [-12.0, 43.0],    // Bay of Biscay approach
      [-5.0, 48.5],     // Bay of Biscay
      [1.5, 51.12],     // Strait of Dover
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "china-strategic-metals-us-west",
    name: "China Strategic Metals → US West Coast",
    resourceType: "strategic-metals",
    flowMbpd: 2,
    chokepointIds: [],
    waypoints: [
      [121.5, 31.2],    // Shanghai
      [123.0, 30.0],    // East China Sea
      [130.0, 32.0],    // East China Sea / Japan approach
      [145.0, 35.0],    // Japan approach
      [170.0, 35.0],    // North Pacific W
      [-165.0, 35.0],   // North Pacific C
      [-140.0, 34.0],   // North Pacific E
      [-118.17, 33.75], // Los Angeles / Long Beach
    ],
  },
  {
    id: "vietnam-strategic-metals-korea-japan",
    name: "Vietnam Strategic Metals → Korea",
    resourceType: "strategic-metals",
    transportMode: "multimodal",
    flowMbpd: 1.5,
    chokepointIds: [],
    waypoints: [
      [105.85, 21.6],   // Thai Nguyen / Nui Phao
      [106.68, 20.86],  // Hai Phong
      [113.0, 20.0],    // South China Sea
      [122.0, 26.0],    // East China Sea
      [128.0, 34.0],    // Korea Strait
      [129.07, 35.1],   // Busan
    ],
  },

  // ── LAND AND MULTIMODAL MACRO ROUTES ──────────────────────────────────────
  {
    id: "saudi-east-west-oil-pipeline",
    name: "Saudi East-West Oil Pipeline",
    resourceType: "oil",
    transportMode: "pipeline",
    flowMbpd: 5,
    chokepointIds: [],
    waypoints: [
      [49.68, 25.94],   // Abqaiq / Eastern Province
      [47.5, 25.0],     // Riyadh corridor
      [44.0, 24.0],     // Central Saudi Arabia
      [40.0, 24.0],     // Western Saudi Arabia
      [39.2, 22.3],     // Yanbu / Red Sea terminal
    ],
  },
  {
    id: "uae-habshan-fujairah-oil-pipeline",
    name: "UAE Habshan → Fujairah Oil Pipeline",
    resourceType: "oil",
    transportMode: "pipeline",
    flowMbpd: 2,
    chokepointIds: [],
    waypoints: [
      [54.6, 23.7],     // Habshan
      [55.2, 24.0],     // UAE interior
      [56.0, 24.7],     // Hajar Mountains
      [56.35, 25.12],   // Fujairah terminal
    ],
  },
  {
    id: "sumed-oil-pipeline",
    name: "SUMED Oil Pipeline",
    resourceType: "oil",
    transportMode: "pipeline",
    flowMbpd: 2.5,
    chokepointIds: [],
    waypoints: [
      [32.36, 29.6],    // Ain Sukhna / Red Sea
      [31.5, 30.0],     // Egypt desert
      [30.8, 30.5],     // Nile Delta
      [29.65, 31.05],   // Sidi Kerir / Mediterranean
    ],
  },
  {
    id: "btc-oil-pipeline",
    name: "Baku-Tbilisi-Ceyhan Oil Pipeline",
    resourceType: "oil",
    transportMode: "pipeline",
    flowMbpd: 1,
    chokepointIds: [],
    waypoints: [
      [49.9, 40.4],     // Baku
      [45.0, 41.7],     // Georgia corridor
      [41.7, 41.7],     // Tbilisi / Georgia
      [38.0, 39.5],     // Eastern Turkey
      [35.5, 37.0],     // Central Turkey
      [35.9, 36.8],     // Ceyhan
    ],
  },
  {
    id: "druzhba-oil-pipeline",
    name: "Druzhba Southern Oil Pipeline",
    resourceType: "oil",
    transportMode: "pipeline",
    flowMbpd: 1.5,
    chokepointIds: [],
    waypoints: [
      [49.1, 53.2],     // Volga / Samara region
      [39.7, 51.7],     // Western Russia
      [31.0, 52.0],     // Belarus / Mozyr area
      [29.0, 50.5],     // Ukraine corridor
      [24.0, 49.8],     // Western Ukraine
      [21.0, 48.7],     // Slovakia / Hungary branch
      [16.4, 48.2],     // Central Europe
    ],
  },
  {
    id: "power-of-siberia-gas",
    name: "Russia → China (Power of Siberia Gas)",
    resourceType: "gas",
    transportMode: "pipeline",
    flowMbpd: 10,
    chokepointIds: [],
    waypoints: [
      [112.5, 62.0],    // Yakutia fields
      [121.6, 58.4],    // Siberia corridor
      [127.5, 53.0],    // Amur region
      [127.6, 50.3],    // Blagoveshchensk
      [126.6, 45.8],    // Harbin
      [116.4, 39.9],    // Beijing demand hub
      [121.5, 31.2],    // Shanghai
    ],
  },
  {
    id: "china-europe-northern-rail",
    name: "China → Europe Northern Rail Corridor",
    resourceType: "container",
    transportMode: "rail",
    flowMbpd: 4,
    chokepointIds: [],
    waypoints: [
      [108.9, 34.3],    // Xi'an
      [87.6, 43.8],     // Urumqi
      [68.8, 43.3],     // Kazakhstan rail hub
      [51.2, 51.2],     // Western Kazakhstan
      [37.6, 55.8],     // Moscow
      [23.7, 52.1],     // Belarus / Brest
      [14.5, 52.5],     // Poland / Germany
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "china-europe-middle-corridor",
    name: "China → Europe Middle Corridor",
    resourceType: "container",
    routeStatus: "diversion",
    transportMode: "multimodal",
    routeAccuracy: "approximate",
    flowMbpd: 3,
    chokepointIds: [],
    waypoints: [
      [108.9, 34.3],    // Xi'an
      [87.6, 43.8],     // Urumqi
      [76.9, 43.2],     // Almaty
      [51.2, 43.65],    // Aktau / Caspian port
      [49.9, 40.4],     // Baku
      [41.7, 41.7],     // Georgia
      [40.6, 40.6],     // Kars / Turkey
      [29.0, 41.0],     // Istanbul
      [16.4, 48.2],     // Central Europe
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "instc-russia-india-corridor",
    name: "Russia → India INSTC Corridor",
    resourceType: "container",
    transportMode: "multimodal",
    routeAccuracy: "approximate",
    flowMbpd: 3,
    chokepointIds: [],
    waypoints: [
      [37.6, 55.8],     // Moscow
      [49.1, 55.8],     // Volga / Kazan corridor
      [47.5, 46.4],     // Astrakhan
      [49.5, 37.5],     // Caspian / Anzali-Rasht corridor
      [51.4, 35.7],     // Tehran
      [56.3, 27.2],     // Bandar Abbas
      [67.0, 18.0],     // Arabian Sea
      [72.82, 18.96],   // Mumbai
    ],
  },
  {
    id: "imEC-india-europe-corridor",
    name: "India → Europe IMEC Corridor",
    resourceType: "container",
    routeStatus: "planned",
    transportMode: "multimodal",
    flowMbpd: 3,
    chokepointIds: [],
    waypoints: [
      [72.82, 18.96],   // Mumbai
      [57.5, 23.0],     // Gulf of Oman
      [54.4, 24.5],     // UAE
      [47.5, 25.0],     // Saudi rail corridor
      [39.2, 22.3],     // Red Sea / Yanbu
      [35.0, 31.5],     // Jordan / Israel corridor
      [34.8, 32.0],     // Haifa
      [16.0, 38.0],     // Central Med
      [4.14, 51.97],    // Rotterdam
    ],
  },
  {
    id: "mexico-us-laredo-auto-road",
    name: "Mexico → US Auto/Manufacturing Corridor",
    resourceType: "container",
    transportMode: "road",
    flowMbpd: 5,
    chokepointIds: [],
    waypoints: [
      [-100.3, 25.7],   // Monterrey
      [-99.5, 27.5],    // Nuevo Laredo
      [-99.5, 27.5],    // Laredo border crossing
      [-97.7, 30.3],    // Austin / I-35
      [-97.3, 32.8],    // Dallas-Fort Worth
      [-94.6, 39.1],    // Kansas City
      [-87.6, 41.9],    // Chicago
    ],
  },
  {
    id: "cpkc-north-america-rail",
    name: "Canada-US-Mexico CPKC Rail Corridor",
    resourceType: "container",
    transportMode: "rail",
    flowMbpd: 4,
    chokepointIds: [],
    waypoints: [
      [-114.1, 51.0],   // Calgary
      [-106.7, 52.1],   // Saskatoon
      [-97.1, 49.9],    // Winnipeg
      [-94.6, 39.1],    // Kansas City
      [-99.5, 27.5],    // Laredo / Nuevo Laredo
      [-100.3, 25.7],   // Monterrey
      [-99.1, 19.4],    // Mexico City
    ],
  },
  {
    id: "la-chicago-intermodal-rail",
    name: "Los Angeles → Chicago Intermodal Rail (BNSF Southern Transcon)",
    resourceType: "container",
    transportMode: "rail",
    flowMbpd: 5,
    chokepointIds: [],
    waypoints: [
      [-118.17, 33.75], // Los Angeles / Long Beach
      [-117.0, 34.9],   // Barstow
      [-106.65, 35.08], // Albuquerque / Belen
      [-101.83, 35.22], // Amarillo
      [-94.6, 39.1],    // Kansas City
      [-87.6, 41.9],    // Chicago
    ],
  },
  {
    id: "lobito-copper-rail",
    name: "DRC Copperbelt → Lobito Rail Corridor",
    resourceType: "copper",
    transportMode: "rail",
    routeAccuracy: "observed",
    flowMbpd: 2,
    chokepointIds: [],
    waypoints: [
      [25.7, -11.7],    // DRC Copperbelt
      [21.8, -12.8],    // Angola interior
      [17.0, -12.4],    // Huambo
      [13.5, -12.35],   // Lobito
    ],
  },
  {
    id: "copperbelt-dar-rail-road",
    name: "Copperbelt → Dar es Salaam Corridor",
    resourceType: "copper",
    transportMode: "multimodal",
    flowMbpd: 2,
    chokepointIds: [],
    waypoints: [
      [27.8, -12.8],    // Zambia Copperbelt
      [30.2, -13.1],    // Zambia corridor
      [33.6, -8.9],     // TAZARA corridor
      [36.7, -6.2],     // Tanzania
      [39.29, -6.82],   // Dar es Salaam
    ],
  },
  {
    id: "mombasa-great-lakes-northern-corridor",
    name: "Mombasa → Great Lakes Northern Corridor",
    resourceType: "container",
    transportMode: "multimodal",
    flowMbpd: 3,
    chokepointIds: [],
    waypoints: [
      [39.65, -4.04],   // Mombasa
      [36.82, -1.29],   // Nairobi
      [34.75, 0.52],    // Eldoret / Malaba approach
      [32.58, 0.35],    // Kampala
      [30.06, -1.95],   // Kigali
    ],
  },
  {
    id: "durban-copperbelt-north-south-corridor",
    name: "Copperbelt → Durban North-South Corridor",
    resourceType: "copper",
    routeStatus: "diversion",
    transportMode: "multimodal",
    routeAccuracy: "approximate",
    flowMbpd: 2,
    chokepointIds: [],
    waypoints: [
      [27.8, -12.8],    // Zambia Copperbelt
      [28.28, -15.42],  // Lusaka
      [28.28, -25.75],  // Pretoria / Gauteng corridor
      [30.4, -29.6],    // KwaZulu-Natal approach
      [31.03, -29.88],  // Durban
    ],
  },
  {
    id: "kunming-laem-chabang-asean-rail",
    name: "Kunming → Laem Chabang China-Laos-Thailand Intermodal Corridor",
    resourceType: "container",
    transportMode: "multimodal",
    routeAccuracy: "observed",
    flowMbpd: 3,
    chokepointIds: [],
    waypoints: [
      [102.8, 24.9],    // Kunming
      [101.15, 21.48],  // Boten / Mohan border
      [102.63, 17.98],  // Vientiane
      [100.5, 13.75],   // Bangkok
      [100.88, 13.08],  // Laem Chabang
    ],
  },
  {
    id: "rotterdam-genoa-rhine-alpine-rail",
    name: "Rotterdam → Genoa Rhine-Alpine Rail Corridor",
    resourceType: "container",
    transportMode: "rail",
    flowMbpd: 4,
    chokepointIds: [],
    waypoints: [
      [4.14, 51.97],    // Rotterdam
      [6.96, 50.94],    // Cologne
      [8.68, 50.11],    // Frankfurt / Rhine-Main
      [8.55, 47.37],    // Zurich / Alpine approach
      [9.19, 45.46],    // Milan
      [8.93, 44.4],     // Genoa
    ],
  },
  {
    id: "kashgar-gwadar-cpec-road",
    name: "Kashgar → Gwadar CPEC Corridor (planned/aspirational)",
    resourceType: "container",
    routeStatus: "planned",
    transportMode: "road",
    routeAccuracy: "approximate",
    flowMbpd: 2,
    chokepointIds: [],
    waypoints: [
      [75.99, 39.47],   // Kashgar
      [74.62, 36.31],   // Gilgit / Karakoram Highway
      [73.05, 33.68],   // Islamabad
      [67.01, 24.86],   // Karachi corridor
      [62.32, 25.12],   // Gwadar
    ],
  },
  {
    id: "canada-us-crude-pipeline",
    name: "Canada → US Midwest/Gulf Crude Pipeline",
    resourceType: "oil",
    transportMode: "pipeline",
    flowMbpd: 4,
    chokepointIds: [],
    waypoints: [
      [-111.4, 57.0],   // Alberta oil sands
      [-104.6, 50.4],   // Saskatchewan
      [-97.1, 49.9],    // Manitoba / US border
      [-93.1, 44.9],    // Minnesota
      [-87.6, 41.9],    // Chicago / Midwest hub
      [-95.37, 29.76],  // Houston / Gulf Coast
    ],
  },
];

export const ROUTE_MAP: Record<string, ShippingRoute> = Object.fromEntries(
  ROUTES.map((r) => [r.id, r])
);
