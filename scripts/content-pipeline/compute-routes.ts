// One-off: computes airport → destination driving routes with the free OSRM
// demo server and prints SQL UPDATEs. Visitors never hit a routing API —
// results are stored on the destination row (see AGENTS.md).
// Usage: bun scripts/content-pipeline/compute-routes.ts > /tmp/routes.sql

type Row = [slug: string, permit: "high" | "moderate" | "none", code: string, airport: string, aLat: number, aLng: number, lat: number, lng: number];

export const ROWS: Row[] = [
  ["acadia", "moderate", "BHB", "Hancock County–Bar Harbor Airport", 44.4497, -68.3616, 44.3386, -68.2733],
  ["asheville", "none", "AVL", "Asheville Regional Airport", 35.4362, -82.5418, 35.5951, -82.5515],
  ["big-sur", "moderate", "MRY", "Monterey Regional Airport", 36.587, -121.8429, 36.2704, -121.8081],
  ["bryce-canyon", "none", "CDC", "Cedar City Regional Airport", 37.7010, -113.0988, 37.6283, -112.1677],
  ["glacier", "high", "FCA", "Glacier Park International Airport", 48.3105, -114.2560, 48.5287, -113.9900],
  ["grand-canyon", "moderate", "FLG", "Flagstaff Pulliam Airport", 35.1385, -111.6712, 36.0544, -112.1401],
  ["grand-teton", "moderate", "JAC", "Jackson Hole Airport", 43.6073, -110.7377, 43.7904, -110.6818],
  ["great-smoky-mountains", "moderate", "TYS", "McGhee Tyson Airport (Knoxville)", 35.8110, -83.9940, 35.6532, -83.5070],
  ["joshua-tree", "none", "PSP", "Palm Springs International Airport", 33.8297, -116.5067, 34.0736, -116.3897],
  ["lake-tahoe", "none", "RNO", "Reno-Tahoe International Airport", 39.4991, -119.7681, 38.9399, -119.9772],
  ["moab", "high", "CNY", "Canyonlands Regional Airport", 38.7550, -109.7548, 38.7331, -109.5925],
  ["mount-rainier", "high", "SEA", "Seattle-Tacoma International Airport", 47.4502, -122.3088, 46.7867, -121.7357],
  ["olympic", "moderate", "SEA", "Seattle-Tacoma International Airport", 47.4502, -122.3088, 48.1000, -123.4300],
  ["outer-banks", "none", "ORF", "Norfolk International Airport", 36.8946, -76.2012, 35.9582, -75.6241],
  ["rocky-mountain", "high", "DEN", "Denver International Airport", 39.8561, -104.6737, 40.3772, -105.5217],
  ["sedona", "none", "FLG", "Flagstaff Pulliam Airport", 35.1385, -111.6712, 34.8697, -111.7610],
  ["shenandoah", "moderate", "CHO", "Charlottesville–Albemarle Airport", 38.1386, -78.4529, 38.5300, -78.3500],
  ["yellowstone", "moderate", "BZN", "Bozeman Yellowstone International Airport", 45.7775, -111.1530, 44.6600, -111.1000],
  ["yosemite", "high", "FAT", "Fresno Yosemite International Airport", 36.7762, -119.7181, 37.7456, -119.5936],
  ["zion", "high", "SGU", "St. George Regional Airport", 37.0364, -113.5103, 37.2002, -112.9870],
];

function simplify(coords: [number, number][], max = 40): [number, number][] {
  if (coords.length <= max) return coords;
  const step = Math.ceil(coords.length / max);
  const out = coords.filter((_, i) => i % step === 0);
  out.push(coords[coords.length - 1]);
  return out.map(([x, y]) => [Number(x.toFixed(5)), Number(y.toFixed(5))]);
}

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;

for (const [slug, permit, code, airport, aLat, aLng, lat, lng] of ROWS) {
  let route = "NULL", mins = "NULL", miles = "NULL";
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${aLng},${aLat};${lng},${lat}?overview=full&geometries=geojson`,
      { headers: { "User-Agent": "minialife-route-precompute/1.0 (minialife.com)" } },
    );
    const j = await res.json();
    const r = j.routes?.[0];
    if (r) {
      mins = String(Math.round(r.duration / 60));
      miles = String(Math.round((r.distance / 1609.34) * 10) / 10);
      route = q(JSON.stringify({ type: "LineString", coordinates: simplify(r.geometry.coordinates) })) + "::jsonb";
    }
  } catch (e) {
    console.error(slug, e);
  }
  console.log(
    `UPDATE public.destinations SET permit_level=${q(permit)}, nearest_airport_code=${q(code)}, nearest_airport_name=${q(airport)}, airport_lat=${aLat}, airport_lng=${aLng}, lat=${lat}, lng=${lng}, drive_minutes=${mins}, drive_miles=${miles}, route_geojson=${route} WHERE slug=${q(slug)};`,
  );
  await new Promise((r) => setTimeout(r, 1100));
}
