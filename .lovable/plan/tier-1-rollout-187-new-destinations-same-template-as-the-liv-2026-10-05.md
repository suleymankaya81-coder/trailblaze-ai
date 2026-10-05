# Tier 1 rollout: 187 new destinations, same template as the live 20

## Where things stand
- Tier 1 has 207 places. 20 are live. The other 187 are saved but empty: no photo, no map location, no airport, and no partner offers.
- Every one of them needs the same pieces the live 20 have before it can go live.

## What each new destination gets (same as today's 20)
1. A real cover photo from Wikimedia Commons with a photo credit. It can't be used by any other place.
2. A map location, the nearest airport, and drive time and distance, worked out once ahead of time (free map, no paid service).
3. A trip summary: best season, budget per day, trip length, permit level and tagline. AI writes it from the saved facts only.
4. Partner cards: Awin partners (Viator, Campspot, RoverPass, Harvest Hosts, RentCars, Jackery), RVshare and REI as direct links, plus the general services. Each card gets a different photo, using the same rules as today.
5. 4 guide pages: best time to visit, things to do, itinerary and glamping. The same quality checks decide which pages Google can see.
6. "Similar places" links, sitemap entries and share previews.

## Rollout in waves
- Wave 1: about 25 national parks and the best-known places, as a pilot. You review them, then we continue.
- Waves 2 to 7: about 27 places each.
- A place goes live only when every check passes: a unique photo, a location, offers, guides generated, and it fits phone screens. Places that fail stay hidden and go on a short list for you.

## What you'll see after each wave
- How many places went live, which ones were held back and why, and the new sitemap count.

## Technical details
- Reuse the existing scripts: fetch-destination-images.ts, compute-routes.ts (writes routes.json), compute-price-ranges.ts, and generate/insert-landing-pages.py. Each takes a list of places, and running it twice changes nothing.
- Offers are copied per destination from the existing set of offers, with destination-specific search links. Data changes are written straight to the database, not as migrations. Photos go through destinationCardPhotos manifest.json.
- Switch to `status='published'` only after the checks pass, using a new script, scripts/content-pipeline/publish-wave.ts. The rules that enforce one required, unique cover photo still apply.
- Watch size as the place count grows: routes.json may need to be split per destination, and the destinations list already shows a fixed number per page.
- Verification per wave: typecheck, a 200 response on every new page, a phone-width check (audit_all.py), and sitemap counts.
- Record the wave rollout rule in AGENTS.md and keep the waves tracked in roadmap.md.
