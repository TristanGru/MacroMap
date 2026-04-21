import type { Chokepoint } from "@/lib/types";

export const CHOKEPOINTS: Chokepoint[] = [
  {
    id: "strait-hormuz",
    name: "Strait of Hormuz",
    coordinates: [56.45, 26.57], // [lon, lat]
    resourceTypes: ["oil", "lng", "gas"],
    dailyFlowMbpd: 21,
    strategicImportance: 3,
    gdeltQuery: '"Strait of Hormuz"',
    summary:
      "Carries ~21 Mbpd — roughly 20% of global oil supply — between the Persian Gulf and the Gulf of Oman. Iran has repeatedly threatened closure during tensions with the US and Israel. A sustained closure would spike Brent crude by an estimated $20–40/barrel within days.",
    photoPath: "/chokepoints/strait-hormuz.jpg",
    consumerImpact:
      "If the Strait of Hormuz closes, you'd likely see gas prices at the pump rise 15–25% within 2–3 weeks. Home heating oil and airline tickets would also jump. About 1 in 5 barrels of oil on Earth passes through here.",
  },
  {
    id: "suez-canal",
    name: "Suez Canal",
    coordinates: [32.35, 30.45],
    resourceTypes: ["oil", "container", "lng"],
    dailyFlowMbpd: 6,
    strategicImportance: 3,
    gdeltQuery: '"Suez Canal"',
    summary:
      "The shortest maritime route between Europe and Asia, handling ~12% of global trade. Closure forces ships around the Cape of Good Hope, adding 7–10 days of transit time and significant fuel costs. The 2021 Ever Given blockage cost an estimated $9.6B per day.",
    photoPath: "/chokepoints/suez-canal.jpg",
    consumerImpact:
      "A Suez closure means the goods you buy from Asia — electronics, clothing, furniture — take 7–10 extra days to arrive and cost more to ship. That shows up as higher prices on store shelves 4–8 weeks later.",
  },
  {
    id: "strait-malacca",
    name: "Strait of Malacca",
    coordinates: [103.85, 1.25],
    resourceTypes: ["oil", "container", "lng", "coal", "copper"],
    dailyFlowMbpd: 16,
    strategicImportance: 3,
    gdeltQuery: '"Strait of Malacca"',
    summary:
      "The world's busiest shipping lane by vessel count, carrying ~16 Mbpd of oil and a quarter of global trade between the Indian Ocean and the Pacific. China imports 80% of its oil through Malacca — Beijing calls this dependency the 'Malacca Dilemma.'",
    photoPath: "/chokepoints/strait-malacca.jpg",
    consumerImpact:
      "Malacca disruptions hit the price of almost everything made in Asia — phones, TVs, solar panels. Since China depends on it for most of its oil, a serious closure could trigger a global recession within months.",
  },
  {
    id: "bab-el-mandeb",
    name: "Bab-el-Mandeb",
    coordinates: [43.45, 12.6],
    resourceTypes: ["oil", "container", "lng"],
    dailyFlowMbpd: 6,
    strategicImportance: 2,
    gdeltQuery: '"Bab el-Mandeb" OR "Bab-el-Mandeb" OR "Bab al-Mandeb"',
    summary:
      "The 'Gate of Tears' connects the Red Sea to the Gulf of Aden. Houthi attacks beginning in late 2023 forced major shipping companies to reroute around Africa, adding 10+ days to Europe–Asia voyages. Controls critical flow of oil from the Persian Gulf to the Suez Canal.",
    photoPath: "/chokepoints/bab-el-mandeb.jpg",
    consumerImpact:
      "This is the strait the Houthis have been attacking since 2023. When ships avoid it, Amazon deliveries from Asia slow down and shipping costs spike — which feeds into the prices of goods at stores like Walmart and Target.",
  },
  {
    id: "turkish-straits",
    name: "Turkish Straits",
    coordinates: [29.02, 41.13],
    resourceTypes: ["oil", "grain"],
    dailyFlowMbpd: 3,
    strategicImportance: 2,
    gdeltQuery: '"Turkish Straits" OR "Bosphorus" OR "Dardanelles"',
    summary:
      "Controls oil flow from the Black Sea (Caspian basin, Kazakhstan, Russia) to European markets. Turkey regulates transit under the Montreux Convention. Russian-Ukraine war has disrupted grain exports through these straits, affecting global food prices.",
    photoPath: "/chokepoints/turkish-straits.jpg",
    consumerImpact:
      "Ukraine and Russia together produce about 30% of the world's wheat. When this strait is disrupted, bread, pasta, and cereal prices rise globally. Countries in North Africa and the Middle East that depend on Black Sea grain are hardest hit.",
  },
  {
    id: "danish-straits",
    name: "Danish Straits",
    coordinates: [10.5, 57.5],
    resourceTypes: ["oil", "gas", "coal"],
    dailyFlowMbpd: 3,
    strategicImportance: 2,
    gdeltQuery: '"Danish Straits" OR "Øresund" OR "Great Belt"',
    summary:
      "The only maritime route between the Baltic Sea and the North Sea. Critical for Russian oil and gas exports to Europe (prior to sanctions), Norwegian gas exports, and Nordic country imports. Shallow draft restrictions limit tanker size.",
    photoPath: "/chokepoints/danish-straits.jpg",
    consumerImpact:
      "Disruption here mainly affects European energy bills. Norwegian natural gas that heats homes in Germany and Denmark flows through these straits. Less relevant to the US directly, but European energy shocks ripple into global markets.",
  },
  {
    id: "cape-horn",
    name: "Cape Horn",
    coordinates: [-67.28, -55.98],
    resourceTypes: ["container", "grain", "copper"],
    dailyFlowMbpd: 10,
    strategicImportance: 1,
    gdeltQuery: '"Cape Horn" shipping',
    summary:
      "The southernmost point of South America, a critical alternative route when the Panama Canal is congested or restricted. Notorious for violent weather and unpredictable seas. Chile–Asia copper and grain trade relies on this passage when Panama is unavailable.",
    photoPath: "/chokepoints/cape-horn.jpg",
    consumerImpact:
      "Cape Horn is mostly a backup route — ships only use it when Panama is unavailable. If both fail, copper prices spike (affecting electronics and EV batteries) and grain deliveries slow, pushing up food prices.",
  },
  {
    id: "cape-good-hope",
    name: "Cape of Good Hope",
    coordinates: [18.47, -34.36],
    resourceTypes: ["oil", "container", "lng", "grain"],
    dailyFlowMbpd: 10,
    strategicImportance: 1,
    gdeltQuery: '"Cape of Good Hope" shipping',
    summary:
      "The primary alternative to the Suez Canal for Europe–Asia trade. Saw a major traffic surge during the 2021 Suez blockage and again in 2024 when Houthi attacks in the Red Sea forced rerouting. Adds significant cost and transit time versus the Suez route.",
    photoPath: "/chokepoints/cape-good-hope.jpg",
    consumerImpact:
      "When the Suez Canal is blocked, ships reroute around the Cape of Good Hope — adding 10–14 days and thousands of dollars in fuel costs per voyage. Those costs eventually show up as higher prices on imported goods.",
  },
  {
    id: "strait-dover",
    name: "Strait of Dover",
    coordinates: [1.5, 51.12],
    resourceTypes: ["container", "gas", "oil"],
    dailyFlowMbpd: 10,
    strategicImportance: 2,
    gdeltQuery: '"Strait of Dover" OR "English Channel" shipping',
    summary:
      "The world's busiest shipping lane by traffic density — over 500 vessels per day. Gateway for North Sea oil and gas exports to continental Europe, and container trade between Northern European ports and the wider Atlantic. Critical for UK–EU post-Brexit trade flows.",
    photoPath: "/chokepoints/strait-dover.jpg",
    consumerImpact:
      "The English Channel connects America's biggest trading partner (the EU) with the Atlantic. A closure would delay North Sea energy to Europe and slow transatlantic container trade, affecting car parts, pharmaceuticals, and food exports.",
  },
  {
    id: "panama-canal",
    name: "Panama Canal",
    coordinates: [-79.92, 9.08],
    resourceTypes: ["container", "lng", "grain", "coal", "copper"],
    dailyFlowMbpd: 10,
    strategicImportance: 2,
    gdeltQuery: '"Panama Canal"',
    summary:
      "Connects the Atlantic and Pacific oceans, eliminating ~15,000km from US east coast to Asia voyages. A 2023–2024 drought reduced the canal's water levels, forcing draft restrictions that cut daily transits by 30% and created a global shipping bottleneck. Critical for US LNG exports to Asia.",
    photoPath: "/chokepoints/panama-canal.jpg",
    consumerImpact:
      "Panama is the most US-relevant chokepoint. US grain exports to Asia and LNG exports to Europe pass through here. When drought restricted it in 2023, US farmers couldn't ship corn and soybeans as fast, and Asian LNG buyers paid more for energy.",
  },
];

export const CHOKEPOINT_MAP: Record<string, Chokepoint> = Object.fromEntries(
  CHOKEPOINTS.map((cp) => [cp.id, cp])
);
