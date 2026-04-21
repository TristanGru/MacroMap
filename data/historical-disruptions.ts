import type { HistoricalDisruption } from "@/lib/types";

export const HISTORICAL_DISRUPTIONS: HistoricalDisruption[] = [
  {
    id: "suez-ever-given-2021",
    chokepointId: "suez-canal",
    chokepointName: "Suez Canal",
    title: "Ever Given runs aground — Suez blocked for 6 days",
    dateStart: "2021-03-23",
    dateEnd: "2021-03-29",
    description:
      "The 400m container ship Ever Given became lodged diagonally across the Suez Canal, halting ~12% of global trade. About 369 ships were stuck waiting.",
    oilImpact: "Brent +3–6% intraday spike",
    resourceTypes: ["container", "oil", "gas"],
  },
  {
    id: "red-sea-houthi-2023",
    chokepointId: "bab-el-mandeb",
    chokepointName: "Bab-el-Mandeb",
    title: "Houthi drone/missile attacks force Red Sea rerouting",
    dateStart: "2023-11-19",
    description:
      "Houthi rebels began attacking commercial vessels in the Red Sea, causing major shipping lines (Maersk, MSC, CMA CGM) to reroute around the Cape of Good Hope. Transit fell ~50%.",
    oilImpact: "Brent +4%, shipping rates +200–400%",
    resourceTypes: ["container", "oil", "grain"],
  },
  {
    id: "panama-drought-2023",
    chokepointId: "panama-canal",
    chokepointName: "Panama Canal",
    title: "Extreme drought cuts Panama Canal capacity by 40%",
    dateStart: "2023-10-01",
    dateEnd: "2024-02-15",
    description:
      "Record-low Gatun Lake levels forced the Panama Canal Authority to reduce daily transits from 36–38 to 22 ships. LNG tankers and grain carriers diverted to Suez or Cape Horn.",
    oilImpact: "LNG spot prices +15–20% in Asia",
    resourceTypes: ["container", "lng", "grain"],
  },
  {
    id: "hormuz-iran-tanker-2019",
    chokepointId: "strait-hormuz",
    chokepointName: "Strait of Hormuz",
    title: "Iran seizes UK tanker Stena Impero",
    dateStart: "2019-07-19",
    dateEnd: "2019-09-27",
    description:
      "Iran's Revolutionary Guard seized the British-flagged oil tanker Stena Impero in the Strait of Hormuz, escalating US–Iran tensions. Insurance rates for Gulf shipping spiked.",
    oilImpact: "Brent +2.5% on seizure day; +15% during broader 2019 Gulf tensions",
    resourceTypes: ["oil", "lng"],
  },
  {
    id: "ukraine-war-black-sea-2022",
    chokepointId: "turkish-straits",
    chokepointName: "Turkish Straits",
    title: "Russia invades Ukraine — Black Sea grain exports collapse",
    dateStart: "2022-02-24",
    dateEnd: "2022-11-01",
    description:
      "Russia's invasion of Ukraine blockaded Ukrainian Black Sea ports, cutting off ~12% of global wheat exports and 15% of corn. UN brokered a grain deal in July 2022.",
    oilImpact: "Wheat +40% in 3 weeks, Brent +30% to $127",
    resourceTypes: ["grain", "oil", "fertilizer"],
  },
  {
    id: "malacca-piracy-2005",
    chokepointId: "strait-malacca",
    chokepointName: "Strait of Malacca",
    title: "Malacca piracy peak — IMB declares 'new Somalia'",
    dateStart: "2004-01-01",
    dateEnd: "2005-12-31",
    description:
      "Piracy in the Strait of Malacca peaked at 38 attacks in 2004. Indonesia, Malaysia, and Singapore launched coordinated sea and air patrols; attacks dropped sharply by 2006.",
    resourceTypes: ["container", "oil", "lng"],
  },
  {
    id: "hormuz-iran-sanctions-2018",
    chokepointId: "strait-hormuz",
    chokepointName: "Strait of Hormuz",
    title: "Iran threatens to close Hormuz after US sanctions",
    dateStart: "2018-07-04",
    dateEnd: "2018-08-01",
    description:
      "After the US reimposed sanctions on Iran's oil sector, Iranian officials threatened to block Hormuz. Markets reacted sharply before de-escalation; Brent hit a 4-year high.",
    oilImpact: "Brent +15% to $86 over 3 months",
    resourceTypes: ["oil", "gas", "lng"],
  },
  {
    id: "cape-good-hope-reroute-2024",
    chokepointId: "cape-good-hope",
    chokepointName: "Cape of Good Hope",
    title: "Red Sea crisis forces mass rerouting via Cape",
    dateStart: "2024-01-01",
    description:
      "Continued Houthi attacks drove a sustained rerouting of container and tanker traffic around the Cape of Good Hope, adding 10–14 days and ~$1M in fuel per voyage.",
    oilImpact: "Shipping rates +300%, Brent +3%",
    resourceTypes: ["container", "oil", "grain"],
  },
];

/** Get historical disruptions for a specific chokepoint */
export function getDisruptionsForChokepoint(chokepointId: string): HistoricalDisruption[] {
  return HISTORICAL_DISRUPTIONS.filter((d) => d.chokepointId === chokepointId);
}
