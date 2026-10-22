# New destinations: Wave 1 (12 places) and full roadmap

## Correction before we start
A check of the site showed 5 of the 12 places I suggested earlier are **already live**: Page, Kanab, Mammoth Lakes, Palm Springs, St. Augustine (and Oahu covers Honolulu's island). They are dropped from the "new" list and replaced with major entry cities that are truly missing.

## Wave 1 — 12 new pages
Big international entry cities, each written as a "gateway" to nearby nature:

| # | Place | Nature it opens to |
|---|---|---|
| 1 | San Francisco | Muir Woods, Point Reyes, Yosemite, Napa |
| 2 | Los Angeles | Malibu, Joshua Tree, Channel Islands, PCH |
| 3 | Miami | Everglades, Biscayne, Florida Keys |
| 4 | Orlando | Kennedy Space Center, springs, airboats |
| 5 | Denver | Rocky Mountain, Estes Park, hot springs |
| 6 | Boston | Cape Cod, White Mountains, Acadia drive |
| 7 | Honolulu | Diamond Head, Pearl Harbor, links to Oahu page |
| 8 | Phoenix | Sedona, Grand Canyon, Sonoran Desert |
| 9 | Tucson | Saguaro, Mount Lemmon, winter desert |
| 10 | Salt Lake City | Utah Mighty 5, Park City, Antelope Island |
| 11 | Portland | Columbia Gorge, Mount Hood, Oregon Coast |
| 12 | Williams (AZ) | Grand Canyon Railway, Route 66 |

Each page gets the same standard as the 440 live ones: credited Commons cover, airport + drive map line, 15+ partner offers, 4 guides (600+ words), reservation note, 3–4 day plan with field intel, activity photos. Viator listings stay in the separate non-indexed experiences area (licence rule). A page is published only if every check passes.

## Total and the following waves
Total target: **60 new destinations + 6 unfinished catalog places = 66**, in 6 parts:

- **Wave 1 (12):** above.
- **Wave 2 — remaining entry cities (12):** New York, Washington DC already live → instead: New York City, Philadelphia, Atlanta, Nashville, Houston, Dallas–Fort Worth, Sacramento, Anchorage-area Seward/Kenai gateway, Fairbanks, Charlotte, Minneapolis, Pittsburgh.
- **Wave 3 — winter/desert season (12):** Palm Desert, Borrego Springs, Organ Pipe, Big Bend gateway (Terlingua), Tombstone/Bisbee, Lake Havasu, Naples/Ten Thousand Islands, Sanibel, Fort Myers, Everglades City, Corpus Christi/Padre, Hot Springs AR area towns.
- **Wave 4 — history on the road (12):** Route 66 towns (Seligman, Tucumcari, Amarillo), Gettysburg, Williamsburg, Natchez, Memphis, Montgomery/Selma, Lexington KY, Plymouth, Salem, Mystic.
- **Wave 5 — summer mountains and wellness (12):** Telluride, Steamboat, Glenwood Springs, Ouray, Sun Valley, Whitefish, Bend, Leavenworth, Stanley, Chico Hot Springs area, Ojai, Calistoga.
- **Wave 6:** finish the 6 catalog places (Badlands, Beartooth Highway, Blue Ridge, Jean Lafitte, Lost Maples, Tallgrass Prairie).

Every wave starts with an existence check so nothing duplicates a live page; the list for waves 2–5 is final only after that check and a Viator activity count.

## Wave 1 steps
1. Add the 12 places as unpublished entries with location, airport, tags, seasons.
2. Collect credited cover, gallery and 3 activity photos (unique per place).
3. Compute drive line airport → city; add to the saved routes.
4. Generate guides, reservation notes, travel plan (no packing / "everything else" content).
5. Attach partner offers (flights, Motorhome Republic, car rental, eSIM, stays, activities).
6. Run the publish check; publish passers, report held ones; refresh sitemap; spot-check pages on desktop and mobile.

## AI budget
About 36 AI calls for Wave 1 (guides + notes + plan per place), within the 200 monthly credits. One wave per month keeps us safe; two waves in a month only if credits allow.

## Technical details
- Insert via data tool into `destinations` (status `catalog`, `destination_type` `gateway_city`), facts JSON in `scripts/content-pipeline/wave3-facts/` pattern.
- Routes: `compute-routes.ts` → `src/data/routes.json`; photos into `destinationCardPhotos.wave.json`.
- Content: `generate-landing-pages.py`, `insert-landing-pages.py`, `generate-permit-notes.py`, leased travel-plan generation; then `publish-wave.py`.
- Add `roadmap.md` tracking the 6 waves.
