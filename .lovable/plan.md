# German site: remaining English text, links, and translating all places

## Scope
- Translate the remaining fixed English wording on German pages: page titles, subheadings, buttons and short template sentences.
- Do NOT translate the saved search guides ("Best time to visit", "Things to do", "Itinerary", "Glamping"). They stay English-only and are not linked from German pages as German pages.
- Fix links on German pages that still lead to English pages.
- Stage 2: one batch run in the terminal translates all 500 published places into German (10 are already done) and saves them.

## Step 1 — Remaining fixed wording (no AI cost)
- One scan script lists every English string still showing on a sample of German pages (homepage, destinations list, one place, one road trip, one corridor, Fly & Drive, No reservation, RV, Trip Guides, Gear, About).
- Add the missing entries in one pass to the German phrase list (exact phrases plus patterns for sentences with names/numbers, e.g. "Fly into {code}: flights, car & first night", "Road trip: {name}").
- Re-run the scan once to confirm what is left. No page-by-page manual editing.

## Step 2 — Links on German pages
- One shared link helper: when the visitor is on a German page, internal links point to the `/de/...` version only if that German page exists (fixed list of German page types + places with a saved German translation).
- Saved search guides and pages with no German version keep their English link.
- Applied in the shared places: header, footer, place cards, PlanDeeper, MoreRoutes, breadcrumbs, guide/route cards.
- Check with one script that collects all internal links on the sampled German pages and reports any English link that has a German version.

## Step 3 — Stage 2: translate all places (one batch run)
- Extend the existing translation script:
  - Selects every published place without a German translation (skips the 10 done).
  - Small batches, cheapest suitable model, results saved after each place so a stop or credit limit never loses work; rerunning continues where it stopped.
  - Translates only the text the German place page shows (intro, plan, local notes, reservation note, card text); skips guides and packing content.
  - Basic checks before saving (all fields present, no empty text); failures are listed, not saved.
- Run it in the background from the terminal, check progress with a database count, not chat turns.
- German places become visible (switcher, links, sitemap) automatically once saved.

## Cost notes
- Steps 1–2: development credits only, kept to a few batched edits.
- Step 3: AI usage for ~490 places in one run; estimated low (short fields, fast model). A rough estimate is printed after the first 10 places so the run can be stopped if higher than expected.

## Verification
- Build OK, existing i18n tests pass, plus one test for the German link rule.
- Spot-check 3 German place pages and one road trip in the browser.

## Not included
- Translating saved search guides (by request).
- French or other languages.
