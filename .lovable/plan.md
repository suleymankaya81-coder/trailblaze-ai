# Five new Gateway Road Trips

Add five international gateway loops beside the Grand Circle under Gateway Road Trips (/corridors). Each loop starts and ends at the same airport and uses the existing page design.

## Routes
| Page | Airport | Days | Stops (existing guides) |
|---|---|---|---|
| california-icons-from-san-francisco | SFO | 8–10 | San Francisco → Yosemite → Lake Tahoe → Napa Valley → Monterey/Big Sur → SF |
| florida-keys-loop-from-miami | MIA | 6–8 | Miami → Florida Keys (Key Largo) → Key West → Naples (via Everglades) → Miami |
| pacific-northwest-from-seattle | SEA | 7–10 | Seattle → Mount Rainier → Olympic → Seattle |
| colorado-rockies-from-denver | DEN | 7–9 | Denver → Rocky Mountain → Aspen → Moab/Arches → Denver |
| arizona-red-rocks-from-phoenix | PHX | 6–8 | Phoenix → Sedona → Grand Canyon → Page/Antelope/Horseshoe Bend → Phoenix |

Key Largo and the Everglades have no guide pages of their own. They appear as text notes on the drive between stops (Florida Keys guide and Naples). No new pages will be created for them.

## Content for each page (written and reviewed by hand, no AI cost)
- Introduction, who the route suits, recommended days per stop
- Six practical notes for overseas visitors: ESTA, driving licence, park pass and reservations, season and weather, distances, one local rule (e.g. Yosemite and Rocky Mountain timed entry, Arches timed entry, Keys hurricane season, Arizona time zone)
- Three FAQs (the same text as the page schema)
- Map with route order and a "return the car to the same airport" step

## Booking cards
- Flight to the gateway airport (Aviasales), Motorhome Republic (main RV option, direct link), EconomyBookings car pickup at the airport, Airalo
- Card text uses the correct city and airport instead of the fixed "Las Vegas" text
- Viator experiences: 3 selected products per route from the live search, on the existing separate noindex page. If a search returns nothing, the section is hidden.

## Launch
- All five go live as indexable pages, listed on /corridors and in the Road Trips featured area. They are added to the sitemap automatically.
- Check every page in the browser on desktop and mobile. Then submit the sitemap again.

## Technical details
- `src/lib/seo/corridors.ts`: add 5 entries (`pilot: false`). Add per-corridor `gatewayCity` and `experiences` (Viator search terms + stop label). Move `GRAND_CIRCLE_EXPERIENCES` into the corridor data.
- `CorridorBookings` + `corridorPartners.ts`: take the city and airport as props or data.
- `corridors.$slug.tsx`: replace the fixed "Start in Las Vegas" and Grand Circle iframe text with corridor data.
- `corridorExperiences.functions.ts` and `experiences.$corridor.tsx`: look up the corridor by slug instead of the hardcoded Grand Circle check. Keep the noindex and sitemap exclusion.
- Check that the sitemap corridors child includes every non-pilot corridor.
- Tests: every corridor stop slug resolves to a published destination; the first and last stops match the gateway; partner links use the shared builders.
- No database changes.
