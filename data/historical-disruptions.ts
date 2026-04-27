import type { HistoricalDisruption } from "@/lib/types";

export const HISTORICAL_DISRUPTIONS: HistoricalDisruption[] = [
  {
    id: "suez-ever-given-2021",
    chokepointId: "suez-canal",
    chokepointName: "Suez Canal",
    title: "Ever Given runs aground; Suez blocked for 6 days",
    dateStart: "2021-03-23",
    dateEnd: "2021-03-29",
    description:
      "The 400m container ship Ever Given became lodged diagonally across the Suez Canal, blocking the route from March 23 to March 29. At least 369 vessels were waiting to transit by the time salvage teams refloated the ship.",
    oilImpact: "Brent moved modestly; freight delays were the larger impact",
    resourceTypes: ["container", "oil", "gas"],
  },
  {
    id: "red-sea-houthi-2023",
    chokepointId: "bab-el-mandeb",
    chokepointName: "Bab-el-Mandeb",
    title: "Houthi attacks force Red Sea rerouting",
    dateStart: "2023-11-19",
    description:
      "Houthi forces seized the Galaxy Leader on November 19, 2023, and subsequent missile and drone attacks pushed many commercial vessels away from the Red Sea and Bab-el-Mandeb. EIA later estimated Bab-el-Mandeb oil flows in 2024 and 1H25 were roughly half their 2023 level.",
    oilImpact: "Cape oil flows rose sharply; freight and insurance costs increased",
    resourceTypes: ["container", "oil", "grain"],
  },
  {
    id: "panama-drought-2023",
    chokepointId: "panama-canal",
    chokepointName: "Panama Canal",
    title: "Extreme drought cuts Panama Canal transit slots",
    dateStart: "2023-07-30",
    dateEnd: "2024-09-01",
    description:
      "Low Gatun Lake levels forced the Panama Canal Authority to cut daily transit slots from a normal 36-38 to 32 in July 2023 and then 24 by November. Restrictions eased through 2024 as rainfall improved, with near-normal slots restored around September.",
    oilImpact: "VLGC/LPG freight hit record highs; LNG and HGL cargoes rerouted",
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
      "Iran's Revolutionary Guard seized the British-flagged oil tanker Stena Impero in the Strait of Hormuz on July 19, 2019. The vessel was released on September 27 after more than two months, keeping Gulf shipping and insurance risk elevated.",
    oilImpact: "Crude rose slightly on the seizure; insurance risk increased",
    resourceTypes: ["oil", "lng"],
  },
  {
    id: "ukraine-war-black-sea-2022",
    chokepointId: "turkish-straits",
    chokepointName: "Turkish Straits",
    title: "Russia invades Ukraine; Black Sea grain exports collapse",
    dateStart: "2022-02-24",
    dateEnd: "2022-07-22",
    description:
      "Russia's invasion of Ukraine cut Ukrainian seaports off almost completely from March through July 2022. The UN- and Turkey-brokered Black Sea Grain Initiative, signed on July 22, reopened safe passage from three Ukrainian ports.",
    oilImpact: "International wheat prices spiked; Brent reached about $127 in March 2022",
    resourceTypes: ["grain", "oil", "fertilizer"],
  },
  {
    id: "malacca-piracy-2004",
    chokepointId: "strait-malacca",
    chokepointName: "Strait of Malacca",
    title: "Malacca piracy wave triggers coordinated patrols",
    dateStart: "2004-01-01",
    dateEnd: "2006-12-31",
    description:
      "Piracy and armed robbery around the Strait of Malacca surged in the mid-2000s. Indonesia, Malaysia, and Singapore launched coordinated MALSINDO patrols in July 2004; IMO/BTS data show Malacca incidents fell from 60 in 2004 to 20 in 2005 and 22 in 2006.",
    resourceTypes: ["container", "oil", "lng"],
  },
  {
    id: "hormuz-iran-sanctions-2018",
    chokepointId: "strait-hormuz",
    chokepointName: "Strait of Hormuz",
    title: "Iran threatens Hormuz closure as sanctions return",
    dateStart: "2018-07-04",
    dateEnd: "2018-10-03",
    description:
      "After the US moved to reimpose sanctions on Iran's oil sector, Iranian officials threatened to block Hormuz. Oil markets focused on the November sanctions deadline, and Brent reached a four-year high in early October 2018.",
    oilImpact: "Brent settled above $86 on Oct. 3, 2018",
    resourceTypes: ["oil", "gas", "lng"],
  },
  {
    id: "cape-good-hope-reroute-2024",
    chokepointId: "cape-good-hope",
    chokepointName: "Cape of Good Hope",
    title: "Red Sea crisis forces mass rerouting via Cape",
    dateStart: "2024-01-01",
    description:
      "Continued Houthi attacks drove sustained rerouting of container and tanker traffic around the Cape of Good Hope. EIA estimated Cape oil flows rose to 8.7 Mbpd in the first five months of 2024 from a 5.9 Mbpd 2023 average; the Arabian Sea-to-Europe voyage via the Cape is about 15 days longer than via Bab-el-Mandeb and Suez.",
    oilImpact: "Cape oil flows rose about 50% versus the 2023 average",
    resourceTypes: ["container", "oil", "grain"],
  },
];

/** Get historical disruptions for a specific chokepoint */
export function getDisruptionsForChokepoint(chokepointId: string): HistoricalDisruption[] {
  return HISTORICAL_DISRUPTIONS.filter((d) => d.chokepointId === chokepointId);
}
