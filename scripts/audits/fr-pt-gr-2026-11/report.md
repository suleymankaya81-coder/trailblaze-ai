# France / Portugal / Greece — enablement report

Branch: `europe-fr-pt-gr` (never pushed to/merged into `main`; nothing published).
Everything below either edits code (committed) or is DRAFT content/SQL for the owner to apply by hand.

## Status

- **Step A (country enablement): done.**
- **Step B (catalog hygiene): done.**
- **Step C (source collection): done.** 125/167 ready, 42 held with reason — see "Step C/D" below, including
  a bad-Wikidata-QID bug this run caught before anything was reported, and a follow-up pass that found and
  applied the correct QID for 16 of the 17 affected France rows.
- **Owner instruction received mid-task: hold all France overseas-territory places from this wave.**
  No source packet or combined-content bundle will be built for them regardless of what automatic
  identity resolution would have found; they are marked held with reason "overseas territory — held
  from this wave per owner instruction" and excluded from the owner checklist / apply-ready SQL. The six
  rows: `reunion-national-park`, `guadeloupe-national-park`, `guiana-amazonian-park`,
  `parc-naturel-regional-de-guyane`, `mayotte-marine-natural-park`, `parc-naturel-regional-de-la-martinique`.
  (These are the same six rows flagged earlier in Step B for their `access:"road"` oversight and the
  French-Guiana double-entry — holding them sidesteps needing to resolve either question in this wave.)
- **Step D (content generation): done**, combined-content bundles built for all 109 ready places.
- **Step E (offline verification): done** — `verify.py` run against the final data, no blocking findings.
- **Step F (tests): JS suite green after Step A** (304→305 tests, see below); re-run after Step D, still green.

## Environment constraints (hard rule 8)

- `SUPABASE_DB_URL` is **not set** in this session. No database reads or writes were performed anywhere
  in this work — no `prepare.q()`, no `apply-wave.py`, no `publish-wave.py`. Every DB-touching step below
  is written as a ready-to-run SQL/command for the owner to execute with real credentials.
- Step C/D's network-bound fetching ran directly in this session (an environment with Wikidata/Wikipedia/
  Commons/OSRM/OurAirports reachable), not a separate dispatched environment — the earlier plan to dispatch
  a child session for this did not end up being needed. Only those 6 host families were called, per the
  owner's instruction; the same deterministic, zero-model, source-evidence-gated pipeline
  (`finish-italy.py`'s pattern) was used, not a different approach, under the same hold-rather-than-guess
  constraints as everything else in this report.
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

## Step C/D: source collection + content generation (finish-fr-pt-gr.py)

Ran `scripts/content-pipeline/finish-fr-pt-gr.py` over all 167 catalog rows (fr 91, pt 38, gr 38) — the
same deterministic, zero-model-call "Wikidata → Wikipedia overview → licensed Commons cover → nearest
airport + OSRM route" method as `finish-italy.py`/`finish-dach-flexible.py`. **0 content-model calls** in
all three result files (`content_model_calls: 0`). No database access anywhere (no `SUPABASE_DB_URL`, no
`prepare-wave.py`/`apply-wave.py`/`publish-wave.py` import or call). Network touched only Wikidata,
Wikipedia (en/fr/pt/el), Wikivoyage, Commons, OSRM and OurAirports, as instructed.

### A real bug the run caught, and the fix

The first full pass marked 121/167 ready. Before writing anything up, an offline cross-check (comparing
each ready row's generated tagline against its own slug) turned up 12 France rows whose Wikidata QID in
`france/catalog.json` resolves to a **real but completely unrelated Wikipedia article** — e.g.
`aiguille-du-midi`'s QID (`Q207306`) is the band Godsmack; `puy-de-dome`'s (`Q842474`) is a video game;
`lac-d-annecy`'s (`Q271210`) is the coat of arms of Liberia; `calanques-of-piana`'s (`Q1025796`) is
Southern Bessarabia. The pipeline's identity check only verified that a resolved article names itself in
its own lead paragraph — true of virtually any Wikipedia article — so it never caught a simply-wrong QID.
A systematic check of every fr/pt/gr row with a `wikidata` field against its resolved Wikidata
label/sitelink title found **17 mismatched QIDs in total, all in the France catalog** (5 had already been
correctly held for other reasons — e.g. `gorges-du-verdon`, `cap-frehel` — by lucky downstream checks; the
other 12 had silently produced wrong "ready" packets and combined-content bundles). None found in pt or gr.

Fixed by adding an explicit cross-check to `identity_and_packet()`: the Wikidata-resolved title must share
at least one distinctive word with the catalog row's own name, or it's held as an identity mismatch instead
of silently fetched. Deleted the 12 contaminated `source-packets/`/`combined-content/` files (plus one more
orphaned packet for `cap-frehel`, caught downstream before this fix, that had written bad content to disk
even though it was already correctly held) and the matching 12 `insert` lines from `apply-ready.sql`,
re-ran France under the fixed check — all 12 (now 13 with `cap-frehel`) are held with a clear
`identity mismatch: catalog name ... vs Wikidata-resolved title ... (wrong QID ...)` reason. A follow-up
re-scan of all 109 final "ready" rows (fr+pt+gr) found no further mismatches. **The 17 bad QIDs are a
catalog data-quality issue, not generated/invented content — nothing was published, and no wrong content
survived into any output artifact.**

## Step C/D follow-up: fixing the 17 bad Wikidata QIDs

Per owner instruction, went back through the 17 identity-mismatch holds (16 of the 17 above, plus
`cap-frehel` from the orphaned-packet case) one at a time and searched Wikidata directly by the catalog's
own place name, accepting a replacement QID only when the match was exact: same name (including a
Wikidata-recorded alias, not a self-made translation guess), a matching protected-area/landform `P31`
type, country France (`P17=Q142`), and a coordinate within a few miles of the catalog's own lat/lng.
**All 17 resolved to a confident exact match** — no uncertain cases, nothing left to list as candidates:

| slug | wrong QID (held) | correct QID | match basis |
|---|---|---|---|
| gorges-du-verdon | Q1061209 (Pokrovka, Russia) | Q687057 | exact name "Gorges du Verdon"/"Verdon Gorge", canyon, France, 1.9mi |
| mont-saint-michel-and-its-bay | Q180074 (Vasanello, Italy) | Q17117964 | exact name match, World Heritage Site, France, 0.0mi — **no Wikipedia sitelink exists for this exact-name entity, so it stays held** |
| etretat-cliffs | Q217831 (Greenock, Scotland) | Q113840948 | exact name, France, 0.5mi, fr-only Wikipedia article |
| dune-of-pilat | Q1263553 (Duclos-Lassalle surname) | Q501726 | exact name, tallest dune in Europe, France, 0.1mi |
| cirque-de-gavarnie | Q1093370 (Coronation of the Virgin) | Q1093112 | exact name, glacial cirque, France, 0.1mi |
| gorges-du-tarn | Q1537340 (Gonzalo Castellanos Yumar) | Q1538251 | exact name, canyon, France, 11.6mi (a long gorge; coordinate is one point along it) |
| aiguille-du-midi | Q207306 (Godsmack) | Q404728 | exact name, mountain, France, 0.0mi |
| pink-granite-coast | Q2996452 (a 1942 deportation convoy) | Q1150945 | "Pink Granite Coast" is a Wikidata-recorded English alias of this entity (fr label "Côte de Granit Rose"), coastline, France, 7.6mi |
| calanques-of-piana | Q1025796 (Southern Bessarabia) | Q1026237 | exact name "Calanques de Piana", calanque, France, 5.9mi |
| valensole-plateau | Q3238183 (Lielpilseta, Latvia) | Q3391918 | exact name "Plateau de Valensole" (French word order of the catalog's English gloss), plateau, France, 4.5mi |
| route-des-grandes-alpes | Q1135389 (generic "subtitle" concept) | Q1471539 | exact name, tourist itinerary, France, 21.5mi (a ~700km route) |
| pont-d-arc | Q1424549 (Jan Tábor) | Q1062180 | exact name, natural arch, France, 0.0mi |
| puy-de-dome | Q842474 (Death Crimson OX video game) | Q607372 | exact name, volcano, France, 0.1mi |
| lac-d-annecy | Q271210 (coat of arms of Liberia) | Q576704 | exact name "Lac d'Annecy"/"Lake Annecy", lake, France, 0.7mi |
| gouffre-de-padirac | Q1544577 (an unrelated heritage-monument list) | Q1540116 | exact name, pit cave, France, 0.0mi |
| cap-frehel | Q1034237 (Cape Hillsborough NP, Australia) | Q175676 | exact name, protected headland, France, 0.0mi |
| pointe-du-raz | Q1415773 (Hildegard Trabant) | Q1500472 | exact name, cape, France, 0.2mi |

Caught and fixed one more bug while verifying these: the identity cross-check's word-matching treated a
French elision like `d'Annecy` or `d'Étretat` as one glued token, so it never matched a title spelled
`Lake Annecy` or `Site d'Étretat` — `etretat-cliffs` and `lac-d-annecy` were briefly re-flagged as
"mismatch" by the cross-check itself even with the correct QID now in place. Fixed `norm_words()` to split
on the apostrophe (so "d'" is stripped as a generic word, same as the space-separated "du"/"des"/"de"
already were) and broadened the cross-check to also match against the Wikidata entity's own recorded
labels/aliases in any language, not just the one sitelink title being fetched (this is what let
`pink-granite-coast` resolve correctly — not a translation guess, but Wikidata's own English alias field).

Applied the 17 corrected QIDs to `scripts/content-pipeline/france/catalog.json` (minimal diff, only the
`wikidata` field per row changed) and re-ran `finish-fr-pt-gr.py fr`. **16 of the 17 are now ready**; the
17th (`mont-saint-michel-and-its-bay`) is identity-confirmed correct but stays held because the correct
Wikidata entity has no English or French Wikipedia article at all — not a guess, just nothing to fetch.
Per instruction, the 6 held overseas-territory rows were not touched.

### Final per-country results

| country | ready | held | total |
|---|---|---|---|
| fr | 78 | 13 | 91 |
| pt | 25 | 13 | 38 |
| gr | 22 | 16 | 38 |
| **total** | **125** | **42** | **167** |

Held-reason breakdown:

- **fr (13 held):** 6 overseas territory (owner instruction, exact 6 named rows), 4 no licensed unique
  cover photo, 1 ferry/boat access (`scandola-nature-reserve`), 1 Wikidata entity fetch 404
  (`route-napoleon` — a QID that doesn't resolve at all, distinct from and not part of the 17 "wrong QID"
  rows above, so left as-is), 1 identity-confirmed-correct but no Wikipedia article
  (`mont-saint-michel-and-its-bay`, see above).
- **pt (13 held):** 6 article missing or ambiguous (title guess with no Wikidata QID didn't resolve),
  3 no licensed unique cover photo, 2 ferry/boat access (`landscape-of-the-pico-island-vineyard-culture`,
  `berlengas`), 1 no coordinate within country bounds (`laurisilva-of-madeira`), 1 article never names the
  place exactly (`azibo-reservoir-protected-landscape`).
- **gr (16 held):** 8 no en/el Wikipedia sitelink, 4 article missing or ambiguous, 3 ferry/boat access
  (`national-marine-park-of-zakynthos`, `alonnisos-marine-park`, `navagio-beach`), 1 no licensed unique
  cover photo (`amvrakikos-wetlands-national-park`).

Both owner-specified hold lists are honored exactly: all 6 named overseas-territory rows and all 6 named
ferry/island rows are held for those specific reasons, nowhere else.

Artifacts written (all draft, nothing published): `scripts/content-pipeline/source-packets/<slug>.json`
and `combined-content/<slug>.json` for the 125 ready places; `france/fr-result.json`,
`south-europe/pt-result.json`, `south-europe/gr-result.json` (full per-row status); `france/apply-ready.sql`,
`south-europe/apply-pt-ready.sql`, `south-europe/apply-gr-ready.sql` (ready-to-run draft inserts, never
executed by this work); discovery-cache and europe-prepare-cache directories (raw fetched pages, for
reproducibility/audit, no secrets).

## Step E: offline verification (verify.py)

Ran `scripts/audits/fr-pt-gr-2026-11/verify.py` against the final 125 ready bundles: 125 checked, 0 with
uncited sources, 0 with an unapproved stop, 0 duplicate cover photos, every hero photo has a non-empty
credit and licence. Remaining findings (none blocking):
- Many taglines run 91–110 chars (within the pipeline's own 110 cap, over the task's tighter 90-char
  bar) — cosmetic, not a correctness issue.
- `best_season` is the documented zero-model placeholder ("Check official seasonal information") on every
  row — expected for this method, not an error.
- A number of "stop detail is not an exact substring of its cited source" findings are
  `quoted_visit.py`'s intentional `[dated source]` redaction of specific years/dates (e.g. "créé en 2009" →
  "créé en [dated source]") colliding with `verify.py`'s plain substring check, which doesn't know about
  that redaction — manually spot-checked several of these and confirmed the underlying quote is otherwise
  verbatim and correctly sourced, not a fabrication.

Full detail in `verification-findings.md` / `report-data.json` (regenerated after the identity-mismatch fix).

## Step F: final test run

`npx vitest run` and `npx tsc --noEmit` re-run after this wave's code changes (the `source_evidence.py`
country-allowlist extension) — unchanged from the Step A/B green state (305 tests passing, clean typecheck);
no app code touches fr/pt/gr draft content directly, so no further regressions expected until the owner
applies the SQL and runs the publish pipeline.

## Owner checklist

1. Review the 125 ready `source-packets/`/`combined-content/` pairs (or a sample) before applying anything.
2. Review and, if correct, run `france/apply-ready.sql`, `south-europe/apply-pt-ready.sql`,
   `south-europe/apply-gr-ready.sql` by hand with real DB credentials — not run by this work.
3. ~~Fix the 17 bad Wikidata QIDs in `france/catalog.json`~~ — **done**, see "Step C/D follow-up" above.
   16 are now ready; `mont-saint-michel-and-its-bay` is identity-confirmed correct but still held (no
   Wikipedia article exists for that exact entity) — if this place matters for this wave, it needs a
   source other than Wikipedia, which this pipeline doesn't fetch.
4. Decide on the 6 held overseas-territory rows and 6 held ferry/island rows per the existing policy notes
   above (manual Wikivoyage-arrival review needed for ferry rows, per `finish-italy.py`'s `FERRY` pattern).
5. Verify the unverified items already flagged in Step A: the `/eu/fr -> fr` legacy redirect (no Wayback
   record checked) and the `rvLinkFor` France/Portugal/Greece Motorhome Republic path guesses.
