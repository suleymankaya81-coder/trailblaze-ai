# Programmatic SEO – Phase B: three new guide families

Goal: add three high-intent guide families, built the same way as Fly & Drive: stored data only, no per-page AI, pilot first, then scale, then SEO checks. Every step runs in order and waits for your approval before moving on.

## The three families

1. **No-reservation / permit guides** — `/no-reservation/{destination}`
   For people who missed timed-entry or campground bookings. Content: what needs booking (headline, note and official source we already store), how to get in without a booking (early or late entry windows, shuttles, nearby alternatives without permits, taken from `similar_slugs` plus permit level), a "what to book right now" panel (flights, car, first night), FAQ.
   Only built for destinations where booking is actually needed (permit level not "none"); the rest are skipped so there are no empty pages.

2. **Multi-park loops** — `/road-trips/{loop-slug}` (e.g. `utah-mighty-5-loop`)
   Loops of 3–5 published destinations close to each other (distance from stored coordinates, same or neighboring region). Content: loop map with the parks in order (precomputed into `src/data/loops.json`, no paid routing), suggested days per stop (from `recommended_duration`), shared starting airport, per-park booking note, links to each park guide and Fly & Drive page.
   Generated once by a script into a reviewed file; first version is about 25–40 curated loops, no thin combinations.

3. **RV / camping routes** — `/rv-camping/{destination}`
   Only for destinations with a high camping score (340 qualify today). Content: drive from airport by RV, campground and RV-park booking partners (Campspot, RoverPass, Harvest Hosts, Motorhome Republic fleet rentals – no P2P), RV-length and season notes taken from stored plan data, FAQ.

## Design
Same visual system as Fly & Drive: cover photo with credit, route summary strip, photo booking cards, booking note, FAQ, links back to the main guide. Only that destination's own credited photos; no invented prices or availability.

## Order of work
1. **Pilot (noindex):** 3 pages per family – Yellowstone, Zion, Arches/Moab style picks, plus 3 loops (Utah Mighty 5, Yellowstone–Grand Teton–Glacier, California Sierra). You review the design.
2. **Scale:** open all qualifying pages, add internal links from destination guides and Fly & Drive pages, add one child sitemap per family.
3. **SEO check:** unique titles/descriptions, canonicals, schema (TouristTrip / ItemList for loops, FAQPage), visible FAQ = schema FAQ, Playwright pass on every page, tests.

## Error prevention
- Page returns "not found" if required data is missing (no airport, no permit text, fewer than 3 loop stops).
- Fixed routes, so they never collide with search pages on the single-segment route.
- No booking page claims a park is free of reservations unless the stored permit level says so.
- All Awin links via the shared link builder with publisher 3115962; RV rentals only via Motorhome Republic.
- Slugs and loop membership covered by tests; loop distances checked so no stop is more than about 5 hours from the previous.

## Technical details
- Routes: `src/routes/no-reservation.$slug.tsx`, `road-trips.$slug.tsx`, `rv-camping.$slug.tsx`.
- Pure helpers + tests: `src/lib/seo/{noReservation,loops,rvCamping}.ts`; data via server functions in `*.functions.ts` reading `destinations`.
- Loops: `scripts/content-pipeline/build-loops.py` writes `src/data/loops.json` (members, order, geometry); reviewed before commit.
- Components in `src/components/guides/`, reusing Fly & Drive cards.
- Sitemap: new children in `sitemap.server.ts`; AGENTS.md and roadmap.md updated.
- No database changes and no AI credit use expected.
