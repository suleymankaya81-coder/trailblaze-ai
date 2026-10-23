# 18 new Gateway Road Trips, all at once

Add all 18 proposed loops beside the existing 6 under Gateway Road Trips (/corridors), for 24 in total. Each loop starts and ends at the same airport and uses the existing page design.

## Routes
| # | Airport | Loop | Days | Stops |
|---|---|---|---|---|
| 1 | LAX | Pacific Coast Highway & Wine | 6–8 | Santa Barbara, Big Sur/Monterey, Paso Robles, Santa Ynez |
| 2 | LAX | Southern California Desert & Oases | 5–7 | Joshua Tree, Palm Springs, Anza-Borrego, San Diego, Laguna Beach |
| 3 | PDX | Oregon Wonders & Coast | 7–9 | Columbia Gorge, Mount Hood, Bend, Crater Lake, Cannon Beach |
| 4 | SLC | Utah Mighty 5 | 7–10 | Moab (Arches/Canyonlands), Capitol Reef, Bryce, Zion |
| 5 | PHX | Southern Arizona Saguaro & Wild West | 5–7 | Tucson/Saguaro, Tombstone, Chiricahua, Bisbee |
| 6 | ABQ | New Mexico Enchantment | 6–8 | Santa Fe, Taos, Bandelier, White Sands |
| 7 | BZN | Greater Yellowstone & Grand Teton | 7–9 | Yellowstone, Grand Teton, Jackson, Gardiner |
| 8 | DEN | Southern Colorado & Sand Dunes | 6–8 | Colorado Springs, Great Sand Dunes, Durango, Mesa Verde, Black Canyon |
| 9 | RAP | Black Hills & Badlands | 5–7 | Mount Rushmore, Custer SP, Badlands, Devils Tower, Spearfish Canyon |
| 10 | ATL | Smokies & Blue Ridge | 6–8 | Blue Ridge GA, Great Smoky Mountains, Asheville, Chattanooga |
| 11 | MCO | Central Florida Springs & Gulf Coast | 5–7 | Crystal River, St. Pete, Sarasota/Siesta Key, Ocala NF |
| 12 | MSY | Deep South & Cajun Bayou | 5–7 | Baton Rouge, Lafayette, Natchez, Biloxi |
| 13 | BOS | New England Foliage & Acadia | 7–10 | White Mountains, Acadia/Bar Harbor, Portland ME, Kennebunkport |
| 14 | BOS | Cape Cod & Historic Coast | 4–6 | Plymouth, Cape Cod, Martha's Vineyard, Newport |
| 15 | IAD | Shenandoah & Historic Capitals | 5–7 | Shenandoah, Charlottesville, Harpers Ferry, Gettysburg |
| 16 | ORD | Lake Michigan Circle | 7–9 | Milwaukee, Door County, Upper Peninsula, Mackinac, Sleeping Bear Dunes |
| 17 | AUS | Texas Hill Country & Big Bend | 7–9 | Fredericksburg, Big Bend, Marfa, San Antonio |
| 18 | ANC | Alaska Glaciers & Denali | 8–10 | Seward/Kenai Fjords, Homer, Talkeetna, Denali, Matanuska Glacier |

## Stops without their own guide
Each stop is first matched to an existing published destination page. Stops that have no page (likely small towns such as Santa Ynez, Tombstone or Kennebunkport) appear as text notes on the drive between stops, like Key Largo on the Miami loop. No new destination pages are created. Each route needs at least 3 linked stops; if one doesn't have them, it stays hidden from Google until those stops are covered, and I'll tell you which ones.

## Content for each page (written by hand, no AI cost)
- Introduction, who the route suits, recommended days per stop, best season
- Six practical notes: ESTA, driving licence, park pass and reservations, season/weather, distances, one local rule (e.g. Arches and Glacier-style timed entry, Alaska road conditions and Denali bus, Big Bend heat and distance, foliage booking dates, ferry booking for Martha's Vineyard/Mackinac)
- Three FAQs (the same text as the page schema)
- Map showing the route order and the step for returning the car to the airport

## Booking cards and tours
- Flight to the arrival airport, Motorhome Republic (main RV option), EconomyBookings car pickup at the airport, Airalo. All are already set up for each city and airport.
- Viator: 3 tours per route from the live search, on the existing hidden page. If a search returns nothing, that tour is dropped.

## Launch
- All 18 are listed on /corridors (grouped by region so 24 cards stay easy to scan), in the Road Trips featured area, the menu and the sitemap.
- Check every page in the browser on desktop and on a phone, then resubmit the sitemap.
- Please read the seasonal and reservation notes before sharing, because these rules change every year.

## Technical details
- `src/lib/seo/corridors.ts`: add 18 entries (`pilot: false`) with gatewayCity, airport, region, stops, essentials, faqs, experiences. Split into regional data files if the file gets too large.
- Precompute map lines for the new loops in `src/data/routes.json` using the existing script, so no routing happens per visit.
- `corridors.index.tsx`: group cards by region. Update the city list on `road-trips.index.tsx`.
- Tests in `corridors.test.ts`: 24 live loops with unique slugs; every stop slug resolves to a published destination; first and last stop match the gateway; 6 essentials, 3 FAQs and 3 experiences each; partner sub_id equals the slug.
- Viator: run each search once and pin product codes where the results are good.
- No database changes.
