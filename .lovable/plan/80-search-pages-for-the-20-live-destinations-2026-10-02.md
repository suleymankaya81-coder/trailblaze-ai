# 80 search pages for the 20 live destinations

## What you will get
For each of the 20 published destinations, 4 new pages at their own web address:

| Page | Address example |
|---|---|
| Best time to visit | /yosemite-best-time-to-visit |
| Things to do | /yosemite-things-to-do |
| Itinerary | /yosemite-itinerary |
| Glamping | /yosemite-glamping |

Each page has a title, a short intro, 4–6 sections written specifically for that place, partner cards that fit the topic (tours for "things to do", Campspot/RoverPass stays for "glamping", rentals + stays for "itinerary"), a link back to the main destination page, and links to the other 3 pages for the same place. The main destination page also gets a small "Plan deeper" link block pointing to its 4 pages.

## How the content is written
- Written once with AI (the same Gemini setup already used), based only on the destination's saved facts (seasons, activities, region, airport, permit level, tags). Saved in the database, not regenerated on each visit.
- Same rules as today: no price guarantees, no "best deal", no safety/medical promises; prices described as estimates.
- Each page is checked automatically for length and duplication. Pages that are too thin or too similar stay hidden from Google (noindex) until reviewed.
- Glamping pages: if a place has no fitting stays to show, the page is still published but marked noindex so Google does not see an empty page.

## Google and the site map
- Each page gets its own title, description, canonical address and share preview.
- Indexable pages are added to the site map automatically; hidden or draft pages are not.
- Unknown addresses (for example /yosemite-xyz) still show the normal not-found page.

## Technical details
- Routing: new root route `src/routes/$landing.tsx`. TanStack ranks static routes (/about, /search, /destinations/...) above a dynamic segment, so no collision; the existing reserved-path trigger still blocks bad paths. Loader calls `getPublicLandingPageByPath`; null throws `notFound()`; `head()` emits `robots: noindex` when `indexable=false`. Update the AGENTS.md rule ("resolver not routed") to the new decision.
- Data: page types use existing enums `best_time`, `things_to_do`, `trip_planner` (itinerary), `glamping`. `target_keyword` + Semrush volume/difficulty filled where known (Yellowstone, Yosemite, Grand Canyon, Zion); others left empty.
- Generation: one-off script `scripts/content-pipeline/generate-landing-pages.ts` calls the AI gateway per destination × type, validates JSON with zod, inserts rows via data insert (not a migration) with `status='published'`, `content_status='ready'`, `indexable` set by the quality checks.
- Rendering: new `src/components/landing/*` sections reuse destination-page card styles; offers loaded through existing `getDestinationPageData` (Awin + info only) filtered by `inventory_filter` category.
- Sitemap: `sitemap.server.ts` adds published + indexable landing pages with `updated_at`.
- JSON-LD: Article + BreadcrumbList per page.
- Verify: typecheck, 200 on sample pages, 404 on unknown/draft, sitemap count, screenshot of 2 pages.
