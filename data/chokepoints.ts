import type { Chokepoint } from "@/lib/types";

export const CHOKEPOINTS: Chokepoint[] = [
  {
    id: "strait-hormuz",
    name: "Strait of Hormuz",
    coordinates: [56.45, 26.57],
    resourceTypes: ["oil", "lng", "gas"],
    dailyFlowMbpd: 21,
    strategicImportance: 3,
    gdeltQuery:
      '"Strait of Hormuz" (shipping OR tanker OR oil OR LNG OR "naval" OR transit OR closure OR disruption)',
    summary:
      "The narrow exit from the Persian Gulf is the world's most important oil chokepoint. Roughly one-fifth of global petroleum liquids and more than 20% of global LNG trade pass through this waterway, with Hormuz LNG flows coming mostly from Qatar.",
    photoPath: "/chokepoints/strait-hormuz.jpg",
    consumerImpact:
      "A real Hormuz disruption would hit fuel first: crude, diesel, jet fuel, heating oil, and LNG-linked power prices. For a US consumer, the first visible effect is usually gasoline and airfare, followed by higher shipping and input costs if the outage lasts.",
  },
  {
    id: "suez-canal",
    name: "Suez Canal",
    coordinates: [32.35, 30.45],
    resourceTypes: ["oil", "container", "lng", "rare-earth", "strategic-metals"],
    dailyFlowMbpd: 4.9,
    strategicImportance: 3,
    gdeltQuery:
      '"Suez Canal" (shipping OR vessel OR container OR tanker OR transit OR blockage OR disruption)',
    summary:
      "Suez and Egypt's SUMED pipeline are the shortcut between the Red Sea and the Mediterranean. Oil flows through the route fell to about 4.9 Mbpd in 1H25 after Red Sea attacks pushed many ships around the Cape of Good Hope.",
    photoPath: "/chokepoints/suez-canal.jpg",
    consumerImpact:
      "A Suez disruption tends to show up as slower deliveries and higher freight rates before it shows up on store shelves. Electronics, apparel, furniture, auto parts, and energy cargoes are the categories most exposed.",
  },
  {
    id: "strait-malacca",
    name: "Strait of Malacca",
    coordinates: [103.85, 1.25],
    resourceTypes: [
      "oil",
      "container",
      "lng",
      "coal",
      "copper",
      "cobalt",
      "iron-ore",
      "lithium",
      "rare-earth",
      "strategic-metals",
    ],
    dailyFlowMbpd: 23.2,
    strategicImportance: 3,
    gdeltQuery:
      '"Strait of Malacca" (shipping OR vessel OR tanker OR container OR piracy OR congestion OR disruption)',
    summary:
      "Malacca is the main maritime corridor between the Indian Ocean and the South China Sea. EIA estimates about 23.2 Mbpd of oil flows moved through it in 1H25, making it the world's largest oil transit chokepoint by volume.",
    photoPath: "/chokepoints/strait-malacca.jpg",
    consumerImpact:
      "Malacca stress is broad-based: oil, LNG, chips, solar panels, phones, appliances, and battery inputs can all feel it. A serious closure would be less like one item getting expensive and more like Asia-linked supply chains slowing at once.",
  },
  {
    id: "bab-el-mandeb",
    name: "Bab-el-Mandeb",
    coordinates: [43.45, 12.6],
    resourceTypes: ["oil", "container", "lng", "grain", "fertilizer", "rare-earth", "strategic-metals"],
    dailyFlowMbpd: 4.2,
    strategicImportance: 2,
    gdeltQuery:
      '("Bab el-Mandeb" OR "Bab-el-Mandeb" OR "Bab al-Mandeb" OR "Red Sea") (shipping OR vessel OR tanker OR Houthi OR reroute OR attack)',
    summary:
      "Bab-el-Mandeb is the southern gate to the Red Sea and Suez route. Since Houthi attacks began in late 2023, many operators have avoided it; EIA estimates oil flows were about 4.2 Mbpd in 1H25, roughly half the 2023 level.",
    photoPath: "/chokepoints/bab-el-mandeb.jpg",
    consumerImpact:
      "When ships avoid Bab-el-Mandeb, Europe-Asia voyages take the long route around Africa. That raises freight rates and delays imported consumer goods, while also tightening oil, refined fuel, fertilizer, and grain logistics.",
  },
  {
    id: "turkish-straits",
    name: "Turkish Straits",
    coordinates: [29.02, 41.13],
    resourceTypes: ["oil", "grain", "uranium", "fertilizer"],
    dailyFlowMbpd: 3.7,
    strategicImportance: 2,
    gdeltQuery:
      '("Turkish Straits" OR Bosphorus OR Dardanelles) (shipping OR tanker OR grain OR oil OR transit OR disruption)',
    summary:
      "The Bosphorus and Dardanelles connect the Black Sea to the Mediterranean. EIA estimates about 3.7 Mbpd of oil and petroleum products flowed through the Dardanelles in 1H25, mostly tied to Russia, Kazakhstan, Azerbaijan, and Black Sea trade.",
    photoPath: "/chokepoints/turkish-straits.jpg",
    consumerImpact:
      "Trouble here is most likely to move wheat, fertilizer, and regional energy prices. That can feed into bread, pasta, animal feed, and food inflation, especially in countries that rely on Black Sea exports.",
  },
  {
    id: "danish-straits",
    name: "Danish Straits",
    coordinates: [10.5, 57.5],
    resourceTypes: ["oil", "gas", "coal", "fertilizer"],
    dailyFlowMbpd: 4.9,
    strategicImportance: 2,
    gdeltQuery:
      '("Danish Straits" OR Oresund OR "Great Belt" OR Kattegat) (shipping OR tanker OR gas OR Baltic OR disruption)',
    summary:
      "The Danish Straits are the sea gate between the Baltic and the North Sea. EIA estimates about 4.9 Mbpd of oil and petroleum products moved through them in 1H25, with trade patterns reshaped by Russia sanctions and Baltic-to-Asia flows.",
    photoPath: "/chokepoints/danish-straits.jpg",
    consumerImpact:
      "The direct US effect is limited, but European energy and industrial costs can move through this channel. If Baltic flows are restricted, the pressure is more visible in European gas, power, fertilizer, and shipping costs.",
  },
  {
    id: "cape-horn",
    name: "Cape Horn",
    coordinates: [-67.28, -55.98],
    resourceTypes: ["container", "grain", "copper"],
    dailyFlowMbpd: 0,
    strategicImportance: 1,
    gdeltQuery:
      '"Cape Horn" (shipping OR vessel OR storm OR cargo OR copper OR grain OR disruption)',
    summary:
      "Cape Horn is not a normal oil chokepoint; it is the hard southern alternative when Panama is unavailable or unattractive. Its relevance rises when drought, congestion, or restrictions push Americas-Asia cargo onto longer southern routes.",
    photoPath: "/chokepoints/cape-horn.jpg",
    consumerImpact:
      "Cape Horn matters most when Panama is also stressed. Then copper, grain, and container cargoes from the Americas to Asia can face longer voyages, higher fuel costs, and more weather risk.",
  },
  {
    id: "cape-good-hope",
    name: "Cape of Good Hope",
    coordinates: [18.47, -34.36],
    resourceTypes: ["oil", "container", "lng", "grain", "iron-ore", "copper", "cobalt"],
    dailyFlowMbpd: 9.1,
    strategicImportance: 1,
    gdeltQuery:
      '"Cape of Good Hope" (shipping OR vessel OR reroute OR tanker OR container OR disruption)',
    summary:
      "The Cape of Good Hope is the main escape route when Suez or the Red Sea is too risky. EIA estimates about 9.1 Mbpd of oil flows moved around the Cape in 1H25 after Red Sea rerouting raised traffic, fuel burn, and voyage times.",
    photoPath: "/chokepoints/cape-good-hope.jpg",
    consumerImpact:
      "When more ships go around the Cape, the cost is time and fuel. Consumers feel it through higher freight rates, slower deliveries, and occasional price pressure on goods moving between Asia and Europe.",
  },
  {
    id: "strait-dover",
    name: "Strait of Dover",
    coordinates: [1.5, 51.12],
    resourceTypes: [
      "container",
      "gas",
      "oil",
      "lng",
      "grain",
      "fertilizer",
      "rare-earth",
      "strategic-metals",
      "cobalt",
      "iron-ore",
      "copper",
      "lithium",
    ],
    dailyFlowMbpd: 0,
    strategicImportance: 2,
    gdeltQuery:
      '("Strait of Dover" OR "English Channel") (shipping OR vessel OR ferry OR tanker OR congestion OR disruption)',
    summary:
      "The Strait of Dover is one of the world's densest traffic lanes and a key approach to Northern Europe. It is not tracked in EIA's oil-chokepoint table, but it matters operationally for UK-EU ferries, Atlantic access, North Sea energy, and container hubs.",
    photoPath: "/chokepoints/strait-dover.jpg",
    consumerImpact:
      "A Dover or English Channel disruption would be felt first in Europe and the UK through ferry delays, port congestion, energy logistics, and industrial shipments. The US feels it indirectly through transatlantic trade and European price pressure.",
  },
  {
    id: "panama-canal",
    name: "Panama Canal",
    coordinates: [-79.92, 9.08],
    resourceTypes: ["container", "lng", "grain", "coal", "copper", "lithium", "rare-earth", "strategic-metals"],
    dailyFlowMbpd: 2.3,
    strategicImportance: 2,
    gdeltQuery:
      '"Panama Canal" (shipping OR vessel OR drought OR transit OR draft OR queue OR disruption)',
    summary:
      "The Panama Canal is the shortcut between the Atlantic and Pacific. EIA estimates 2.3 Mbpd of petroleum and other liquids moved through it in FY25; its main risk is hydrological, because Gatun Lake levels drive draft limits and daily transit slots.",
    photoPath: "/chokepoints/panama-canal.jpg",
    consumerImpact:
      "Panama is highly relevant for the US. Restrictions can slow US grain and LNG exports, raise freight costs between US coasts and Asia, and push some ships onto much longer routes around South America.",
  },
];

export const CHOKEPOINT_MAP: Record<string, Chokepoint> = Object.fromEntries(
  CHOKEPOINTS.map((cp) => [cp.id, cp])
);
