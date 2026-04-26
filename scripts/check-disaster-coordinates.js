/* eslint-disable no-console */
function inLatRange(value) {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function inLngRange(value) {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

function normalize(event) {
  const lat = Number(event.lat);
  const lng = Number(event.lng);
  if (inLatRange(lat) && inLngRange(lng)) return { ...event, lat, lng };
  if (inLatRange(lng) && inLngRange(lat)) return { ...event, lat: lng, lng: lat };
  return null;
}

const samples = [
  {
    name: "USGS Aleutians earthquake",
    input: { lat: 52.1, lng: -174.2 },
    expected: { lat: 52.1, lng: -174.2 },
  },
  {
    name: "NASA FIRMS Brazil wildfire",
    input: { lat: -12.4, lng: -55.8 },
    expected: { lat: -12.4, lng: -55.8 },
  },
  {
    name: "swapped wildfire row",
    input: { lat: 145.2, lng: -37.8 },
    expected: { lat: -37.8, lng: 145.2 },
  },
  {
    name: "invalid row",
    input: { lat: 300, lng: 220 },
    expected: null,
  },
];

let failures = 0;
for (const sample of samples) {
  const actual = normalize(sample.input);
  const pass =
    sample.expected === null
      ? actual === null
      : actual &&
        actual.lat === sample.expected.lat &&
        actual.lng === sample.expected.lng;

  if (!pass) {
    failures += 1;
    console.error(
      `${sample.name}: expected ${JSON.stringify(sample.expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

if (failures > 0) process.exit(1);
console.log("Disaster coordinate checks passed");
