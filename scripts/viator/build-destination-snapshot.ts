/**
 * One-time snapshot of Viator's official destination taxonomy (cities, towns,
 * villages, islands, national parks) with centre coordinates. Re-run when new
 * countries go live:  bun scripts/viator/build-destination-snapshot.ts
 * Uses VIATOR_API_KEY; never runs per visit.
 */
import { writeFileSync } from "node:fs";
import { COUNTRIES } from "../../src/lib/routes/paths";

type D = { destinationId: number; name: string; type: string; parentDestinationId?: number; center?: { latitude: number; longitude: number } };
const KEEP = new Set(["CITY", "TOWN", "VILLAGE", "NATIONAL_PARK", "ISLAND", "PENINSULA", "AREA"]);
const EXTRA: Record<string, string> = { usa: "us", "united states": "us", "northern ireland": "gb", england: "gb", scotland: "gb", wales: "gb", "czech republic": "cz" };

const key = process.env["VIATOR_API_KEY"];
if (!key) throw new Error("VIATOR_API_KEY missing");
const res = await fetch("https://api.viator.com/partner/destinations", { headers: { "exp-api-key": key, Accept: "application/json;version=2.0", "Accept-Language": "en-US" } });
if (!res.ok) throw new Error(`Viator ${res.status}`);
const all = ((await res.json()) as { destinations: D[] }).destinations;
const byId = new Map(all.map((d) => [d.destinationId, d]));
const byName = new Map<string, string>(Object.entries(EXTRA));
for (const [code, c] of Object.entries(COUNTRIES)) byName.set(c.name.toLowerCase(), code);

function countryOf(d: D): string {
  for (let cur: D | undefined = d, i = 0; cur && i < 10; cur = byId.get(cur.parentDestinationId ?? -1), i++) {
    const code = byName.get(cur.name.toLowerCase());
    if (code && (cur.type === "COUNTRY" || EXTRA[cur.name.toLowerCase()])) return code;
  }
  return "";
}
const rows = all.filter((d) => KEEP.has(d.type) && d.center).map((d) => [d.destinationId, d.name, +d.center!.latitude.toFixed(4), +d.center!.longitude.toFixed(4), countryOf(d)] as const).filter((r) => r[4]);
writeFileSync("src/lib/affiliates/data/viatorDestinations.json", JSON.stringify(rows));
console.log(`saved ${rows.length} of ${all.length}`);
