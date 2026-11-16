# Make WildParkRoutes look like an international travel site

## Goal
Visitors should see on the first screen that the site covers several countries (USA, Canada, Germany, Austria, Switzerland, Italy, Spain, more coming) and can browse by continent, country and region everywhere.

## 1. New homepage opening ("World map" hero)
- Headline: "National parks and scenic road trips around the world".
- Subline with live counts from the database: "1,100+ places in 7 countries".
- Search box stays (same search page), placeholder becomes multi-country: "Try 'Dolomites', 'Yellowstone' or 'Picos de Europa'".
- Under the search: a row of **country chips with flags and place counts** (USA 500, Italy 198, Spain 164, Germany, Austria, Switzerland, Canada). Each opens that country page.
- Right side: keep the three-photo collage, but photos come from three different continents/countries (e.g. Dolomites, Yosemite, Picos de Europa), each caption naming the country.
- Stat row: "Countries", "Places mapped", "Day-by-day plans" (real numbers, never invented).

## 2. New homepage section: "Explore by country"
Directly after the opening, replacing "Free U.S. road trip plans":
- Continent tabs: North America / Europe (only continents with published places).
- Large country cards: cover photo from that country, flag, place count, top 3 regions as links, "Explore Italy".
- "Coming soon" countries (Portugal, Greece, France...) shown as small muted tiles, not clickable, only if the user approves showing them.

## 3. Rest of homepage made country-neutral
- "Where travelers are headed": mix places from several countries, country flag + name on each card.
- "Top bucket-list experiences": wording "the world's icons" instead of "America's icons"; include European places once Viator results exist.
- Rentals: wording "worldwide pickup" instead of "across the USA"; prices shown with country currency where partner data supports it.
- Road trips block: country label on each loop (current loops are US; label honestly).

## 4. Destinations directory (/destinations)
- New top: continent → country selector (flag cards with counts) above the list.
- Filters: Country first, then Region (regions change per country; replaces the US-only state list), season, trip type.
- Each place card shows "Region, Country" with flag.
- Default list mixes countries instead of US-only ordering.

## 5. Country and region pages (/destinations/{country}, /{region})
- Country hero: country photo, flag, place count, currency, driving side, short "Driving in Italy" facts from stored data only.
- Region grid with photos and counts; "Top places in Italy" row.
- Cross-links to neighbouring countries.

## 6. Category pages (Trip guides, Road trips, RV & camping, Fly & drive, No-reservation)
- Add a country filter bar (chips) at the top of each directory.
- Replace "USA" / "U.S." wording in titles, intros and search descriptions with worldwide wording; where a guide family exists only for the US, say "Currently in the USA — Europe coming" instead of pretending.
- Group lists by country, then region.

## 7. Menu and footer
- "Destinations" menu opens a panel: continents → countries with flags → "All destinations".
- Footer: "Countries" column listing every published country.
- Language switcher stays; country is separate from language.

## 8. German versions
All new texts translated in the existing German phrase files; German pages use the same layout.

## Technical details
- New `src/lib/data/countryDirectory.ts` (server function): published counts per country/region, top regions, one credited cover per country; cached in loader, no per-visit AI.
- Country registry (flags, names, continent, currency) extended in `countryPartners.ts`/`site.ts`; flags rendered as emoji or small SVG, no new external assets.
- HomeHero rewritten; StartHere replaced by new `HomeCountries` component; `FilterPanel` gets country→region dependent options instead of `US_REGIONS`.
- `hubSeo.ts` / `routeSeo.ts` / `guidesSeo.ts` titles rewritten for worldwide keywords within the 60/160 limits; SEO tests updated.
- Reuse ui-kit cards (PlaceCard, CategoryTile, SwipeRow); semantic colour tokens only.
- Verify: Playwright screenshots of homepage, /destinations, one country, one region and each category page in EN/DE, phone and desktop; run existing tests.

## Open question for you
Show not-yet-published countries as "Coming soon" tiles, or hide them until live?
