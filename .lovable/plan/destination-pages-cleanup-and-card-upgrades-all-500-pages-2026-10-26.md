# Destination pages — cleanup and card upgrades (all 500 pages)

All changes are made in the shared destination template, so Acadia and every other destination page get them at once.

## 1. Destination names (search-matched)
- Audit all 500 destinations: compare the Google title, page heading and on-page name against the search-phrase rule set yesterday ("{name} travel guide / plan a trip to {name}", most-searched form of the name, e.g. "Acadia National Park" not "Acadia").
- Produce a list of pages where the name or title did not change, then fix each: correct the stored name where the popular search form differs, and make the page heading and Google title use the same form.
- Re-run the length/uniqueness checks (title max 60, description max 160) on all 500.

## 2. "A little structure. Plenty of freedom."
- Remove the three notes below the day plan: "Your first two hours", "The right vehicle", "Chase the light". Day plan and local notes stay.
- Also drop them from the "copy plan" text so they never appear.

## 3. Remove the FAQ sections
- Remove "Quick answers about {name}" from every destination page, and remove its matching Google FAQ data so data and page stay in sync.
- The reviewed "A few things worth knowing" panel stays (it is official-source access info, not an FAQ). Search pages are unaffected unless you say otherwise.

## 4. Step 2 — RVs, campervans & cars
- Use two RV photos: one motorhome (Class A/C) and one travel trailer, licensed and credited, from the shared service-photo set (download from Wikimedia if missing).
- Show "Est. from $X/night · typical" on both RV cards, using the existing typical-price anchors.
- Move "Getting there & getting around" partner cards into the same row as the Step 2 cards (one row, swipe on phones), instead of a separate block.

## 5. Step 3 — Where you'll want to sleep
- Remove the three text options (Stay in or by the park / Nearby town cabin / RV & camping).
- Put the Vrbo and Expedia cards in the same row as the other stay cards.
- Remove the separate Harvest Hosts banner; add the offer to the existing Harvest Hosts stay card: "MiniaLife readers get 20% off the first year", copyable code MINIALIFE20, button "Get 20% off". Same tracked link.

## 6. Step 4 — The moments you came for
- Show exactly 3 Viator activities; skip any without a photo (take the next one with a photo). Stars/reviews stay Viator-only.
- Move "More tours & ticket partners" cards into this same row next to the Viator cards.
- Fill missing card text (short description per partner) and add a price line: Viator uses its real "from" price; other partners show a labelled typical "Est. from" price.

## 7. Curated Trip Essentials
- Five cards instead of four: the fifth is always a WILDGUARDER binocular (one of the three approved models, chosen per destination).
- Stop showing the same set everywhere: each activity profile gets a larger pool, and the four picks are chosen deterministically per destination (same page always shows the same picks, neighbouring pages differ). Still only approved partners, no AI.
- Layout: 5 columns on desktop, swipe row on phones; heading becomes "Five picks for {name}".

## Technical details
- Files: `src/routes/destinations.$slug.tsx` (remove FAQ block and StayChooser, regroup stay/RV rows, drop FAQ from JSON-LD call), `src/components/destination/TravelFlow.tsx`, `TravelpayoutsCards.tsx` (export groups so they render inside steps 2 and 4), `HarvestHostsCard.tsx` (merge into stay card), `ViatorPlaceBlock.tsx` / Viator frame (limit 3, require image), `TripEssentials.tsx` + `src/lib/data/tripEssentials.ts` (pools, slug hash rotation, WILDGUARDER slot from `gearCategories.ts`), `src/lib/data/servicePhotos.ts` (motorhome + trailer subjects).
- Name audit: script against `destinations` table plus `routeSeo.ts`; fixes via migration/data update.
- Tests: update `tripEssentials.test.ts` (5 products, includes WILDGUARDER, different picks across slugs), `destinationFaqs`/JSON-LD tests (no FAQPage on destination pages), Viator display limit test.
- Verify Acadia + 2 other destinations on desktop and phone with screenshots.
