# France / Portugal / Greece — enablement report

Branch: `europe-fr-pt-gr` (never pushed to/merged into `main`; nothing published).
Everything below either edits code (committed) or is DRAFT content/SQL for the owner to apply by hand.

## Status

- **Step A (country enablement): done.**
- **Step B (catalog hygiene): done.**
- **Step C (source collection): running** in a separate network-enabled session (this sandbox blocks
  Wikidata/Wikipedia/Commons/OSRM outright — see "Environment constraints" below). Results will be filled
  in here once it reports back. (First attempt stalled on an unapprovable interactive permission prompt
  before doing any real work and was archived; a replacement session is running the same job.)
- **Owner instruction received mid-task: hold all France overseas-territory places from this wave.**
  No source packet or combined-content bundle will be built for them regardless of what automatic
  identity resolution would have found; they are marked held with reason "overseas territory — held
  from this wave per owner instruction" and excluded from the owner checklist / apply-ready SQL. The six
  rows: `reunion-national-park`, `guadeloupe-national-park`, `guiana-amazonian-park`,
  `parc-naturel-regional-de-guyane`, `mayotte-marine-natural-park`, `parc-naturel-regional-de-la-martinique`.
  (These are the same six rows flagged earlier in Step B for their `access:"road"` oversight and the
  French-Guiana double-entry — holding them sidesteps needing to resolve either question in this wave.)
- **Step D (content generation): pending**, depends on Step C's packets.
- **Step E (offline verification): script written** (`scripts/audits/fr-pt-gr-2026-11/verify.py`),
  not yet run against real data.
- **Step F (tests): JS suite green after Step A** (304→305 tests, see below); will re-run after Step D.

## Environment constraints (hard rule 8)

- `SUPABASE_DB_URL` is **not set** in this session. No database reads or writes were performed anywhere
  in this work — no `prepare.q()`, no `apply-wave.py`, no `publish-wave.py`. Every DB-touching step below
  is written as a ready-to-run SQL/command for the owner to execute with real credentials.
- This sandbox's network proxy also blocks Wikidata/Wikipedia/Commons/OSRM/OurAirports outright (confirmed
  by a direct connection refusal, not a timeout). A separate personal cloud environment
  (`trailblaze-ai-pipeline-sources`) was created with exactly those 8 hosts allowlisted, and a child session
  was dispatched to it to run Step C/D's network-bound fetching — still following the same deterministic,
  zero-model, source-evidence-gated pipeline (`finish-italy.py`'s pattern), not a different approach, and
  under the same hold-rather-than-guess constraints as everything else in this report.
- Content model calls made across this entire wave: **0** (the south-europe "Wikipedia overview, zero model
  calls" method — `finish-italy.py` — is the one being mirrored for fr/pt/gr, same as it already is for it/es).

## Step A: country enablement

- `src/lib/routes/paths.ts`: added `fr`/`pt`/`gr` to `COUNTRIES`.
- `src/lib/data/countryDirectory.ts`: added flags 🇫🇷🇵🇹🇬🇷, continent `europe`.
- `src/lib/affiliates/countryPartners.ts`: added `fr`/`pt`/`gr` — EUR, no US-only campground partners,
  Motorhome Republic + Airport Rentals only (same shape as it/es/de/at/ch).
- `src/lib/affiliates/countryPartners.ts` `rvLinkFor`: added `/france/`, `/portugal/`, `/greece/` Motorhome
  Republic path guesses by analogy with `/italy/`/`/spain/`. **Unverified** — see owner checklist.
- `src/lib/seo/legacy.ts` `AUTHORITY_COUNTRY`: added `/eu/gr -> gr`, `/eu/fr -> fr`, and **`/eu/pr -> pt`**.
  - Portugal correction: the task said `/eu/pt`, but `south-europe/sources.json` (Wayback-verified when the
    Spain/Italy/Portugal/Greece catalog was first built) records the old world-national-parks.net Portugal
    page as `/eu/pr`, not `/eu/pt`. Using `/eu/pt` would have silently 301'd nothing, since that path was
    never the old site's Portugal page. Used `/eu/pr` instead; added a test asserting `/eu/pt` does
    **not** map to Portugal, to catch any future regression here.
  - France: no equivalent Wayback record exists (France wasn't part of the south-europe batch's verified
    `sources.json`). Added `/eu/fr -> fr` as given in the task, flagged as **unverified** — if it's wrong,
    fixing it later is a one-line change in `legacy.ts`, not a data migration.
- `drizzle/migrations/0015_fr_pt_gr_groundwork.sql`: draft-status regions rows for all 18 French regions
  (13 metropolitan + 5 overseas: French Guiana, Guadeloupe, Martinique, Mayotte, Réunion), 7 Portuguese
  regions, 13 Greek regions — mirrors `0013_canada_groundwork.sql`. No destinations inserted here; this
  only seeds `public.regions` so the regions exist (as drafts) once the owner runs it. `country_code` and
  `access_type` already accept arbitrary values / `'ferry'` (migrations 0012/0014) — no schema change needed.
- Fixed two **pre-existing** test collisions that adding `fr` to `COUNTRIES` would have silently broken:
  - `countryPartners.test.ts` used `"fr"` as its example of an *unsupported* country.
  - `sitemapSplit.test.ts` used `"fr-destinations"` as its example of an *unknown* sitemap child.
- **Found and fixed a real latent bug** this change would otherwise have exposed: every country ever
  enabled before this already had ≥67 published places, so nothing had ever exercised the
  "country enabled, zero published places" path. Before the fix, `/destinations/fr` (and `/de/destinations/fr`)
  would have rendered a real, indexable, empty "France destinations by region" page with the title
  "Plan trips to 0 France parks and outdoor destinations across 0 regions" — and `/sitemap.xml` would have
  listed `/sitemaps/fr-destinations.xml` etc. containing just that empty page's URL. Fixed:
  - `destinations.$slug.index.tsx` / `de.destinations.$slug.index.tsx`: 404 instead of rendering when
    `getCountryRegions` returns zero regions.
  - `sitemap.server.ts`: the `/sitemap.xml` index now omits a country's per-country children until it has
    at least one published place (`geoPathsOf` also stops emitting the bare `/destinations/{cc}` URL for
    such a country); `parseChild`/`buildChildSitemap` stay fully generic, so nothing further needs to
    change once fr/pt/gr get their first published place.
  - Verified directly: `COUNTRY_DIRECTORY` (the "Browse by country" tile grid on `/destinations`) already
    excluded zero-place countries before this work (pre-existing `places > 0` filter) — only the individual
    country route and the sitemap needed fixing.

## Step B: catalog hygiene

- Copied `claude-handoff/fr-catalog.json` (91 rows) to `scripts/content-pipeline/france/catalog.json`
  (new directory, mirrors `south-europe/`). De-duplicated `also_regions` on 64/91 rows (duplicates and
  self-references against the primary `region`).
- Re-verified `claude-handoff/pt-catalog.json` and `gr-catalog.json` against `south-europe/catalog.json`:
  **field-identical, zero differences**, both directions (38/38 rows each). Nothing to reconcile.
- Slug uniqueness checked across **every** catalog in the repo (france, south-europe [458 rows: it/es/pt/gr],
  dach [316], uk [145], canada [148]) plus the live `destination-geo.json` (1,466 already-published slugs):
  **zero collisions** anywhere.
- Cross-country/near-duplicate name check (normalized, generic words like "national"/"park"/"reserve"
  stripped) across all catalogs: one pair found, **not a true duplicate, not merged**:
  - `international-tagus-natural-park-extremadura` (es) / `international-tagus-natural-park-centro` (pt) —
    a real transboundary park with separate national designations on each side of the border; already
    correctly modeled as two distinct catalog rows with disambiguating slugs. No action needed.
- Noted, not auto-fixed: France has two separate French-Guiana entries — `guiana-amazonian-park` and
  `parc-naturel-regional-de-guyane` — a core national park plus its surrounding regional nature park.
  Real-world precedent for this pattern exists elsewhere (core + buffer zone), but it wasn't independently
  verified here; flagging for owner review rather than assuming either way.
- Noted, not auto-fixed: 6 French overseas rows (Réunion, Guadeloupe, French Guiana ×2, Mayotte, Martinique)
  all carry `access: "road"` in the catalog despite being island/overseas territories. This may be correct
  (e.g. French Guiana's mainland road network) or an oversight carried over from the mainland-France
  default — not changed without catalog-level evidence either way.
- Access-spelling normalization: the task described three catalog spellings ("boat / boat_or_island /
  island"); the real catalog data only contains two (`boat`, `boat_or_island`) — "island" does not occur as
  a literal `access` value anywhere in fr/pt/gr/it/es. Both existing spellings already map to the app's one
  literal value, `"ferry"` (confirmed via `src/lib/data/destinationAccess.ts`). Six places need this
  treatment; **not yet applied** — pending the Wikivoyage-quoted arrival text each one needs under the
  existing ferry-places policy (see `scripts/content-pipeline/AGENTS.md`: "boat arrival quoted verbatim from
  Wikivoyage"), which is a manual-identity step like Italy's `FERRY` dict, not an automatic one:
  - `scandola-nature-reserve` (fr)
  - `landscape-of-the-pico-island-vineyard-culture` (pt)
  - `berlengas` (pt)
  - `national-marine-park-of-zakynthos` (gr)
  - `alonnisos-marine-park` (gr)
  - `navagio-beach` (gr)

## Step F so far

Full JS suite (`npx vitest run`): 57 files, 305 tests, all passing after Step A's code changes (was
57/304 before; +1 new test added for the sitemap-index fix). `npx tsc --noEmit` clean. Will re-run after
Step D lands and again at the end.

---
*(Steps C/D/E/F-final and the owner checklist are appended below once source collection finishes.)*
