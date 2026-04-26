import type { ResourceType } from "@/lib/types";

export interface MaterialInfo {
  label: string;
  emoji: string;
  color: string; // matches CSS var
  tagline: string;
  /** 2-3 sentences on geopolitical significance */
  geopolitics: string;
  /** Plain-English consumer impact */
  consumerImpact: string;
  /** Key stats */
  stats: { label: string; value: string }[];
}

export const MATERIAL_INFO: Record<ResourceType, MaterialInfo> = {
  oil: {
    label: "Crude Oil",
    emoji: "🛢️",
    color: "#0ea5e9",
    tagline: "The world's most geopolitically sensitive commodity",
    geopolitics:
      "Oil powers roughly 95% of global transportation and underpins the US dollar's reserve currency status through the 'petrodollar' system. The OPEC+ cartel controls ~40% of global supply, giving a small group of countries enormous leverage over the world economy. Every major war of the last century has had oil somewhere in its background.",
    consumerImpact:
      "Oil price changes show up at your gas pump within 2–4 weeks. A $10/barrel rise adds roughly $0.25/gallon at the pump. It also raises prices on anything that gets shipped, which is almost everything.",
    stats: [
      { label: "Global supply", value: "~100 Mbpd" },
      { label: "% through chokepoints", value: "~60%" },
      { label: "Top producers", value: "US, Saudi, Russia" },
    ],
  },
  gas: {
    label: "Natural Gas",
    emoji: "🔥",
    color: "#67e8f9",
    tagline: "The bridge fuel caught between climate goals and energy security",
    geopolitics:
      "Natural gas is harder to transport than oil — most travels via pipeline, making countries highly dependent on specific suppliers. Russia's gas cutoffs to Europe in 2022 caused an energy crisis and proved how weaponized pipeline dependency can be. LNG (liquefied form) allows sea transport but requires expensive infrastructure.",
    consumerImpact:
      "Natural gas heats about half of US homes. A supply shock raises winter heating bills — in Europe's 2022 crisis, some households saw bills triple. It also raises electricity costs since many power plants run on gas.",
    stats: [
      { label: "Global supply", value: "~400 billion m³/yr" },
      { label: "Pipeline share", value: "~70% of trade" },
      { label: "Top producers", value: "US, Russia, Iran" },
    ],
  },
  lng: {
    label: "Liquefied Natural Gas",
    emoji: "🚢",
    color: "#a78bfa",
    tagline: "Gas in a bottle — enabling global energy trade",
    geopolitics:
      "LNG allows natural gas to be shipped anywhere in the world by cooling it to -162°C and loading it onto specialized tankers. The US became the world's top LNG exporter in 2023, giving it new geopolitical leverage. Qatar and Australia dominate Asian supply. LNG terminals take years to build, creating long-term structural dependencies.",
    consumerImpact:
      "LNG disruptions mostly affect industrial electricity prices and home heating in Asia and Europe. In the US, LNG exports create upward pressure on domestic gas prices — more exports can mean higher bills at home.",
    stats: [
      { label: "Global LNG trade", value: "~400 MT/yr" },
      { label: "Top exporters", value: "US, Australia, Qatar" },
      { label: "Top importers", value: "Japan, China, EU" },
    ],
  },
  container: {
    label: "Container Shipping",
    emoji: "📦",
    color: "#34d399",
    tagline: "The invisible backbone of global retail",
    geopolitics:
      "Containerization transformed global trade — a single container ship carries 20,000+ boxes. 80% of everything you own arrived on one. A handful of companies (Maersk, MSC, COSCO) control most global container capacity. COVID exposed how fragile just-in-time supply chains are: a 3-day Suez blockage caused 6 months of shortages.",
    consumerImpact:
      "Container disruptions cause the 'everything shortage' — electronics, clothing, furniture, toys all slow down. During COVID, shipping costs rose 10x and led directly to the inflation of 2021–2022. You feel this at Walmart, Amazon, and your local store.",
    stats: [
      { label: "Global container trade", value: "~800M TEU/yr" },
      { label: "Top routes", value: "Asia→Europe, Trans-Pacific" },
      { label: "Market leaders", value: "MSC, Maersk, COSCO" },
    ],
  },
  copper: {
    label: "Copper",
    emoji: "🔩",
    color: "#818cf8",
    tagline: "The metal the energy transition runs on",
    geopolitics:
      "Copper is in every wire, motor, and EV battery. The green energy transition requires 2–3x more copper than today's energy system. Chile and Peru together produce ~40% of global supply. China controls most of the refining capacity, giving it strategic leverage over the materials needed for anyone else's energy transition.",
    consumerImpact:
      "Higher copper prices feed into electricity infrastructure costs, EV prices, and electronics. A 20% copper price spike can add $500–$1,000 to the cost of an EV. It also raises the cost of grid upgrades needed for renewable energy.",
    stats: [
      { label: "Global production", value: "~22 MT/yr" },
      { label: "EV copper per car", value: "~80 kg" },
      { label: "Top producers", value: "Chile, Peru, Congo" },
    ],
  },
  grain: {
    label: "Grain",
    emoji: "🌾",
    color: "#a3e635",
    tagline: "Food security is national security",
    geopolitics:
      "Wheat, corn, and soybeans feed billions directly or as animal feed. Russia and Ukraine supply 30% of global wheat and 15% of global corn. When Russia blocked Ukrainian grain exports in 2022, food prices spiked globally and caused political instability across North Africa and the Middle East. The US, Brazil, and Argentina are the other major suppliers.",
    consumerImpact:
      "Grain disruptions raise bread, pasta, cereal, and meat prices (since livestock eat grain). A 50% wheat price spike — like what happened in 2022 — adds roughly $1–2/week to a family's food bill. Countries that import most of their food can face hunger.",
    stats: [
      { label: "Global wheat trade", value: "~200 MT/yr" },
      { label: "Russia+Ukraine share", value: "~30%" },
      { label: "At-risk importers", value: "Egypt, Tunisia, Lebanon" },
    ],
  },
  coal: {
    label: "Thermal Coal",
    emoji: "⚫",
    color: "#9ca3af",
    tagline: "Still powering half the world despite the energy transition",
    geopolitics:
      "Coal generates ~35% of global electricity despite climate pressure to phase it out. Asia (especially India and China) drives demand. Australia and Indonesia are the top exporters. When Russia was sanctioned in 2022, Europe scrambled to replace Russian gas with coal — showing how climate goals can be overridden by energy security emergencies.",
    consumerImpact:
      "In the US, coal mainly affects electricity prices in states that still use coal-fired power. Globally, coal supply shocks raise electricity prices in Asia and put upward pressure on manufacturing costs — which eventually shows up in prices of imported goods.",
    stats: [
      { label: "Global consumption", value: "~8 billion tonnes/yr" },
      { label: "Power generation share", value: "~35%" },
      { label: "Top exporters", value: "Australia, Indonesia, Russia" },
    ],
  },
  lithium: {
    label: "Lithium",
    emoji: "⚡",
    color: "#e879f9",
    tagline: "The oil of the electric age",
    geopolitics:
      "Lithium is the key ingredient in the batteries powering EVs, smartphones, and grid storage. The 'Lithium Triangle' (Chile, Argentina, Bolivia) holds 60% of global reserves. China controls 80% of global lithium refining capacity, giving it enormous leverage over the EV supply chain regardless of where lithium is mined. US and EU are racing to reduce this dependency.",
    consumerImpact:
      "Lithium prices directly affect the cost of EVs and consumer electronics. When lithium spiked 10x in 2021–2022, EV battery costs rose sharply. A stable lithium supply is essential for reaching any country's EV adoption targets.",
    stats: [
      { label: "Global reserves", value: "~88 MT" },
      { label: "Triangle share", value: "~60%" },
      { label: "China refining", value: "~80%" },
    ],
  },
  cobalt: {
    label: "Cobalt",
    emoji: "Co",
    color: "#f472b6",
    tagline: "The battery metal concentrated in one fragile corridor",
    geopolitics:
      "Cobalt is used in high-performance batteries, superalloys, and defense supply chains. The Democratic Republic of Congo dominates mine supply, while China controls much of the refining and battery-material conversion. Any shock in Central Africa, the Lobito corridor, or Chinese processing policy can ripple quickly into EV and electronics supply chains.",
    consumerImpact:
      "Cobalt disruptions mostly show up through battery costs and availability. EV makers can substitute some chemistries, but phones, laptops, aerospace alloys, and premium batteries still depend on reliable cobalt flows.",
    stats: [
      { label: "Top mine source", value: "DRC" },
      { label: "Top refiner", value: "China" },
      { label: "Key uses", value: "Batteries, alloys, defense" },
    ],
  },
  "rare-earth": {
    label: "Rare Earth Metals",
    emoji: "🔬",
    color: "#2dd4bf",
    tagline: "China's strategic trump card in tech competition",
    geopolitics:
      "Rare earths (17 elements including neodymium, dysprosium, cerium) are essential for EV motors, wind turbines, military guidance systems, and smartphones. China controls ~85% of global rare earth mining and ~90% of refining. In 2010, China cut rare earth exports to Japan during a territorial dispute — a preview of how this leverage could be used. The US and EU are scrambling to build alternative supply chains.",
    consumerImpact:
      "Without rare earths, you can't make EV motors, wind turbines, or most advanced military hardware. A Chinese export restriction would immediately threaten EV production worldwide and could delay the energy transition by years. Defense readiness would also be affected.",
    stats: [
      { label: "China mining share", value: "~85%" },
      { label: "China refining share", value: "~90%" },
      { label: "Key uses", value: "EVs, wind, defense" },
    ],
  },
  "strategic-metals": {
    label: "Semiconductor / Strategic Metals",
    emoji: "Si",
    color: "#fb923c",
    tagline: "Tiny volumes, enormous leverage",
    geopolitics:
      "Gallium, germanium, antimony, tungsten, and other strategic inputs move in small volumes but sit inside semiconductors, solar cells, fiber optics, night vision, ammunition, and advanced manufacturing. China is a major producer or processor for several of these materials and has used export controls as a policy tool. These flows are not bulky like iron ore, but they are highly strategic.",
    consumerImpact:
      "A strategic-metals disruption would not look like empty shelves overnight. It would tighten chips, defense electronics, solar components, telecom equipment, and specialized industrial parts, raising costs and delaying production for high-tech goods.",
    stats: [
      { label: "Key materials", value: "Ga, Ge, Sb, W" },
      { label: "Critical users", value: "Chips, solar, defense" },
      { label: "Main leverage", value: "Processing + export controls" },
    ],
  },
  "iron-ore": {
    label: "Iron Ore",
    emoji: "🏗️",
    color: "#78716c",
    tagline: "The raw material behind every skyline",
    geopolitics:
      "Iron ore is the primary input for steel, which goes into buildings, bridges, ships, cars, and infrastructure. Australia and Brazil supply ~75% of seaborne iron ore, mostly to China (which makes ~55% of global steel). Iron ore prices are closely linked to Chinese construction activity — when China's property market slumps, iron ore prices crash globally.",
    consumerImpact:
      "Iron ore disruptions raise steel prices, which increases the cost of construction, cars, and appliances. A 30% iron ore price spike adds thousands to the cost of a new building and hundreds to a new car. Infrastructure projects become more expensive.",
    stats: [
      { label: "Global production", value: "~2.5 billion tonnes/yr" },
      { label: "Australia + Brazil share", value: "~75%" },
      { label: "China steel share", value: "~55%" },
    ],
  },
  uranium: {
    label: "Uranium",
    emoji: "☢️",
    color: "#22d3ee",
    tagline: "The fuel for low-carbon baseload power",
    geopolitics:
      "Uranium fuels nuclear power plants, which generate ~10% of global electricity with near-zero carbon emissions. Kazakhstan is the world's largest producer (~45%). Russia controls much of the enrichment capacity globally. After the Fukushima disaster (2011), many countries shut nuclear plants — now many are restarting them as climate and energy security pressures mount. The US imports ~90% of its uranium.",
    consumerImpact:
      "Uranium supply disruptions affect nuclear electricity generators over a 1–2 year lag (they hold fuel reserves). Long-term disruptions would force nuclear plants to reduce output, raising electricity prices and emissions from replacement fossil fuel power.",
    stats: [
      { label: "Nuclear power share", value: "~10% of global electricity" },
      { label: "Top producer", value: "Kazakhstan (~45%)" },
      { label: "US uranium imports", value: "~90%" },
    ],
  },
  fertilizer: {
    label: "Fertilizers",
    emoji: "🌱",
    color: "#fde047",
    tagline: "The hidden driver behind every food price spike",
    geopolitics:
      "Modern agriculture depends on nitrogen (from natural gas), phosphate (Morocco, China), and potash (Russia, Belarus, Canada) fertilizers. Russia and Belarus together supplied ~40% of global potash before 2022 sanctions. When fertilizer prices doubled in 2021–2022, farmers worldwide cut application — leading to lower crop yields and higher food prices 6–12 months later. This is one of the most direct links between geopolitics and grocery prices.",
    consumerImpact:
      "Fertilizer disruptions take 6–12 months to reach grocery prices (through the growing season). When fertilizer prices doubled in 2022, global food prices rose 30% the following year. Farmers in poor countries who can't afford fertilizer simply grow less food.",
    stats: [
      { label: "Russia + Belarus potash", value: "~40% of global supply" },
      { label: "Natural gas → nitrogen fert.", value: "~80% of cost" },
      { label: "Food system dependence", value: "~50% of humans fed by synthetic fert." },
    ],
  },
};
