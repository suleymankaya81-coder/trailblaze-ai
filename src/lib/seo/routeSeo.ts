// Search-phrase titles/descriptions for road-trip loop and gateway corridor pages.
// Keywords chosen from Semrush US data (Oct 2026); each page targets a distinct phrase to avoid overlap.

export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 160;
const BRAND = " — MiniaLife";

export const LOOP_KEYWORDS: Record<string, string> = {
  "utah-mighty-5-loop": "Utah Mighty 5 Road Trip",
  "grand-canyon-northern-arizona-loop": "Grand Canyon Road Trip",
  "california-sierra-parks-loop": "Yosemite Road Trip",
  "yellowstone-grand-teton-loop": "Yellowstone Road Trip",
  "colorado-rockies-loop": "Colorado Road Trip",
  "black-hills-badlands-loop": "Black Hills Road Trip",
  "pacific-northwest-parks-loop": "Pacific Northwest Road Trip",
  "north-cascades-loop": "North Cascades Road Trip",
  "oregon-cascades-loop": "Oregon Road Trip",
  "california-coast-loop": "Big Sur Road Trip",
  "southern-california-desert-loop": "Joshua Tree Road Trip",
  "eastern-sierra-loop": "Eastern Sierra Road Trip",
  "las-vegas-desert-parks-loop": "Las Vegas Road Trip",
  "southern-utah-scenic-byway-loop": "Utah Highway 12 Road Trip",
  "arizona-red-rock-loop": "Arizona Red Rock Road Trip",
  "new-mexico-enchantment-loop": "New Mexico Road Trip",
  "southern-new-mexico-loop": "Southern New Mexico Road Trip",
  "big-bend-loop": "Big Bend Road Trip",
  "texas-hill-country-loop": "Texas Hill Country Road Trip",
  "great-smoky-blue-ridge-loop": "Smoky Mountains Road Trip",
  "shenandoah-loop": "Shenandoah Road Trip",
  "new-england-mountains-loop": "New England Road Trip",
  "maine-coast-loop": "Maine Road Trip",
  "upper-peninsula-loop": "Upper Peninsula Road Trip",
  "florida-keys-everglades-loop": "Florida Keys Road Trip",
  "glacier-flathead-loop": "Glacier National Park Road Trip",
  "idaho-sawtooth-loop": "Idaho Road Trip",
  "alaska-kenai-denali-loop": "Alaska Road Trip",
  "hawaii-big-island-loop": "Big Island Road Trip",
  "ozarks-loop": "Ozarks Road Trip",
};

export const CORRIDOR_KEYWORDS: Record<string, string> = {
  "grand-circle-from-las-vegas": "Grand Circle Road Trip from Las Vegas",
  "california-icons-from-san-francisco": "San Francisco to Yosemite Road Trip",
  "florida-keys-loop-from-miami": "Miami to Key West Road Trip",
  "pacific-northwest-from-seattle": "Olympic & Rainier Road Trip from Seattle",
  "colorado-rockies-from-denver": "Colorado National Parks Road Trip",
  "arizona-red-rocks-from-phoenix": "Arizona Road Trip from Phoenix",
  "pacific-coast-highway-from-los-angeles": "Pacific Coast Highway Road Trip",
  "southern-california-desert-from-los-angeles": "Southern California Road Trip",
  "oregon-wonders-from-portland": "Oregon Coast Road Trip from Portland",
  "utah-mighty-5-from-salt-lake-city": "Utah Mighty 5 Road Trip from Salt Lake City",
  "southern-arizona-from-phoenix": "Southern Arizona Road Trip from Phoenix",
  "new-mexico-from-albuquerque": "New Mexico Road Trip from Albuquerque",
  "greater-yellowstone-from-bozeman": "Bozeman to Yellowstone Road Trip",
  "southern-colorado-from-denver": "Southern Colorado Road Trip from Denver",
  "black-hills-badlands-from-rapid-city": "Black Hills & Badlands Road Trip",
  "smokies-blue-ridge-from-atlanta": "Atlanta to Smoky Mountains Road Trip",
  "florida-springs-gulf-from-orlando": "Florida Road Trip from Orlando",
  "deep-south-from-new-orleans": "New Orleans Road Trip: Deep South Loop",
  "new-england-acadia-from-boston": "New England Fall Foliage Road Trip",
  "cape-cod-coast-from-boston": "Cape Cod Road Trip from Boston",
  "shenandoah-history-from-washington-dc": "Shenandoah Road Trip from Washington, DC",
  "lake-michigan-circle-from-chicago": "Lake Michigan Road Trip from Chicago",
  "texas-hill-country-big-bend-from-austin": "Austin to Big Bend Road Trip",
  "alaska-glaciers-denali-from-anchorage": "Anchorage to Denali Road Trip",
};

/** First candidate that fits the limit; falls back to a word-trimmed version. */
export function fitText(candidates: string[], max: number): string {
  for (const c of candidates) if (c.length <= max) return c;
  const last = candidates[candidates.length - 1] ?? "";
  const cut = last.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,:;·—&-]+$/, "").trim()}…`;
}

function listNames(names: string[], max: number): string {
  const picked = names.slice(0, max);
  if (picked.length <= 1) return picked.join("");
  return `${picked.slice(0, -1).join(", ")} & ${picked.at(-1)}`;
}

const shortDays = (d: string) => d.replace(/\s*days?$/i, "").replace(/–/g, "-");

export function loopSearchTitle(slug: string, fallback: string, stopCount: number): string {
  const kw = LOOP_KEYWORDS[slug] ?? fallback;
  return fitText([`${kw}: ${stopCount}-Stop Itinerary & Map${BRAND}`, `${kw}: ${stopCount}-Stop Itinerary${BRAND}`, `${kw} Itinerary${BRAND}`, `${kw}${BRAND}`, kw], TITLE_MAX);
}

export function loopSearchDescription(slug: string, fallback: string, stopNames: string[]): string {
  const kw = LOOP_KEYWORDS[slug] ?? fallback;
  const n = stopNames.length;
  return fitText(
    [3, 2, 1].map((k) => `Plan a ${n}-stop ${kw.toLowerCase()} via ${listNames(stopNames, k)}: days per stop, drive distances, route map and car or RV rental tips.`),
    DESCRIPTION_MAX,
  );
}

export function corridorKeyword(slug: string, fallback: string): string {
  return CORRIDOR_KEYWORDS[slug] ?? fallback;
}

export function corridorTitle(slug: string, fallback: string, idealDays: string): string {
  const kw = corridorKeyword(slug, fallback);
  const d = shortDays(idealDays);
  return fitText([`${kw}: ${d} Day Itinerary${BRAND}`, `${kw}: ${d} Days${BRAND}`, `${kw}${BRAND}`, kw], TITLE_MAX);
}

export function corridorDescription(slug: string, fallback: string, idealDays: string, code: string, stopNames: string[]): string {
  const kw = corridorKeyword(slug, fallback);
  const d = shortDays(idealDays);
  const via = stopNames.slice(1);
  return fitText(
    [3, 2, 1].map((k) => `${kw}: a ${d} day loop from ${code} via ${listNames(via, k)}, back to the same airport. Stops, drive times, map and rental tips.`),
    DESCRIPTION_MAX,
  );
}
