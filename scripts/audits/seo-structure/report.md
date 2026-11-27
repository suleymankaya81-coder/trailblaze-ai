# SEO structure audit: wildparkroutes.com (2026-11-27)

**Audit only. No code or data was changed.**

- Branch `seo-structure-audit`, from `main` at `631b62a2`.
- **Live sample:** 100 URLs fetched on 2026-11-27 with plain HTTP, without JavaScript (the server-rendered HTML a crawler receives). All 100 returned HTTP 200.
- **Code:** the repository only; the live database was not used.

**Evidence files** (in `evidence/`):

| File | Contents |
|---|---|
| `sample.tsv` | The 100 URLs and their template group (seeded random choice from the live sitemaps) |
| `analyze.py`, `body_partner.py` | The parsers |
| `metrics.json` | Raw metrics per URL |
| `prose.json` | Prose counts per URL |
| `body_partner.json` | Partner elements before the first prose paragraph |
| `guide-gaps.json`, `probe-results.txt` | Guide coverage and the 144-URL probe |

**Sample composition.** The requested groups add up to 90 URLs, so 10 more were added and are reported separately (home page + 9 German/French place pages):

| Group | n |
|---|---|
| Destination main pages | 30: US 12, Europe 12 (one each from 12 countries), Australia 4, New Zealand 2 |
| Best time / itinerary / glamping / things to do | 10 each (US only: no other country has guides) |
| Hub/list pages | 10: the 5 list pages `/road-trips`, `/corridors`, `/rv-camping`, `/no-reservation`, `/fly-and-drive` + one detail page of each |
| Country / region hubs | 10: countries us, it, au, no, gb; regions in us, de, nz, es, is |
| Extra | Home page + 9 German/French place pages |

## How the measures are defined

- **Unique prose words:** words in `<p>`/`<dd>` paragraphs of at least 12 words inside `<main>`. Excluded:
  - text inside links, buttons, nav, aside, figure, header, footer or forms (cards and widgets);
  - "unknown fact" boilerplate ("The reviewed sources do not establish…", "Check the official visitor information…", "No verified visitor-season…");
  - any paragraph whose wording (names and numbers masked) appears on 5 or more sampled pages, such as product-card blurbs and Viator/tour text.
- **All `<p>` words:** the same without the last two exclusions.
- **Partner blocks before the first prose paragraph:**
  - Partner element: an iframe, a sponsored or partner-domain link, or a partner CTA button.
  - Block: the section that holds it.
  - Counted in body order before the first prose paragraph. The site-wide announcement bar in the header is excluded; it is reported separately below.
- **Internal links:** unique same-site paths outside the header and footer. Categories:
  - hub: home, `/destinations/{country}` and `/destinations/{country}/{region}`, and the list pages;
  - place: another place page;
  - guide: guide pages of this place or another one;
  - route: `/road-trips/…` and `/corridors/…`.
- **Map:** the server HTML contains the map container (the map itself loads in the browser).
- **Images:**
  - Wikimedia-hosted: the `src` is on wikimedia.org.
  - Uploaded asset: `/__l5e/` storage.
  - Site asset: bundled `/assets/` thumbnails.
  - The photo source is read from the credit links.

## 1. Measurements per template

Medians with (min–max).

| Template | n | Unique prose words | All `<p>` words | H2 | Partner blocks before 1st prose | Internal links (excl. header/footer) | of which hubs / places / guides / routes (median) |
|---|---|---|---|---|---|---|---|
| destination-US | 12 | 399 (356–448) | 563.5 (508–621) | 12 (12–12) | 0 (0–0) | 16 (12–18) | 4 / 3 / 6 / 0 |
| destination-EU | 12 | **116 (32–247)** | 502.5 (466–596) | 12 (12–12) | 0 (0–0) | 10 (8–10) | 4 / 2 / 2 / 0 |
| destination-AUNZ | 6 | **61 (33–93)** | 481 (381–532) | 12 (12–12) | 0 (0–0) | 9 (7–10) | 4 / 2 / 1 / 0 |
| translated-place (de/fr) | 9 | 523 (437–825)¹ | 574 (488–825) | 12 (12–12) | 0 (0–0) | 14 (8–16) | 4 / 3 / 5 / 0 |
| best-time | 10 | 837.5 (662–966) | 989.5 (752–1094) | 10 (10–10) | 0 (0–0) | 12 (10–13) | 4 / **0** / 6 / 0 |
| itinerary | 10 | 931 (642–1097) | 1039.5 (763–1228) | 9 (9–9) | 0 (0–0) | 12 (10–13) | 4 / **0** / 6 / 0 |
| glamping | 10 | 946.5 (473–1065) | 1071.5 (766–1200) | 9 (9–9) | 0 (0–0) | 11.5 (10–15) | 4 / **0** / 6 / 0 |
| things-to-do | 10 | 843.5 (543–991) | 970 (768–1107) | 9 (9–9) | 0 (0–0) | 12 (11–13) | 4 / **0** / 6.5 / 0 |
| hub-list | 5 | **0 (0–12)** | 0 (0–12) | 0 (0–6) | 0 (0–0) | 26 (26–33) | 2 / 0 / 24 / 0 |
| hub-detail | 5 | 101 (38–361) | 347 (179–462) | 7 (6–9) | 0 (0–0) | 13 (7–22) | 4 / 4 / 1 / 1 |
| country-hub | 5 | **0 (0–0)** | 0 (0–0) | 2 (2–2) | 0 (0–0) | 172 (150–553) | 18 / 162 / 0 / 0 |
| region-hub | 5 | **0 (0–0)** | 0 (0–0) | 1 (1–1) | 0 (0–0) | 10 (4–16) | 3 / 7 / 0 / 0 |
| home | 1 | 108 | 177 | 9 | 0 | 23 | 19 / 0 / 0 / 4 |

¹ The boilerplate filter only knows the English phrases, so German and French boilerplate is still counted. Most of the 9 translated pages are US places.

| Template | Title ≠ H1 | Map in page | Images/page: Wikimedia-hosted / uploaded asset / site asset / other | Commons credit links/page | Scripts in HTML (3rd-party) | Iframes/page | noindex | HTML KB (median) |
|---|---|---|---|---|---|---|---|---|
| destination-US | 12/12 | 12/12 | 4.0 / 14.1 / 23.0 / 0.0 | 13.0 | 2 (0) | 2.0 | 0/12 | 169 |
| destination-EU | 11/12 | 12/12 | 0.3 / 11.6 / 19.1 / 0.0 | 9.3 | 2 (0) | 2.0 | 0/12 | 146 |
| destination-AUNZ | 6/6 | 6/6 | 0.0 / 12.0 / 18.3 / 0.0 | 9.0 | 2 (0) | 2.0 | 0/6 | 144 |
| translated-place | 9/9 | 9/9 | 2.4 / 13.0 / 21.2 / 0.0 | 11.6 | 2 (0) | 2.0 | 0/9 | 175 |
| best-time | 8/10 | 0/10 | 1.0 / 10.0 / 23.0 / 0.0 | 4.0 | 2 (0) | 1.0 | 0/10 | 126 |
| itinerary | 10/10 | 0/10 | 1.0 / 12.0 / 16.7 / 0.0 | 3.0 | 2 (0) | 1.0 | 0/10 | 122 |
| glamping | 10/10 | 0/10 | 1.0 / 10.0 / 20.0 / 0.0 | 3.0 | 2 (0) | 1.0 | 0/10 | 120 |
| things-to-do | 6/10 | 0/10 | 1.0 / 7.0 / 23.0 / 0.0 | 2.9 | 2 (0) | 1.0 | 0/10 | 120 |
| hub-list | 5/5 | 0/5 | 19.0 / 6.8 / 0.4 / **0.4 (minialife.com)** | 0.0 | 2 (0) | 0.0 | 0/5 | 203 |
| hub-detail | 4/5 | 2/5 | 3.8 / 11.2 / 14.0 / 0.0 | 5.4 | 2 (0) | 1.0 | 0/5 | 109 |
| country-hub | 5/5 | 5/5 | 15.4 / 5.2 / 0.0 / 0.0 | 0.0 | 2 (0) | 0.0 | 0/5 | 276 |
| region-hub | 5/5 | 0/5 | 6.6 / 1.4 / 0.0 / 0.0 | 0.0 | 2 (0) | 0.0 | 0/5 | 45 |
| home | 1/1 | 0/1 | 9.0 / 13.0 / 17.0 / 0.0 | 3.0 | 2 (0) | 1.0 | 0/1 | 104 |

### What the numbers show

1. **Guides are the strongest pages** (best time, itinerary, glamping, things to do): 840–950 unique words, 9–10 topical H2s, and the answer comes first. But they link to **no other place** (0 place links on all 40). Their only internal links are the place's own guide set and the hubs in the breadcrumb.
2. **Non-US place pages are thin.**
   - Europe has a median of 116 unique words and Australia/New Zealand 61.
   - About **55%** of their paragraph words are the "unknown fact" boilerplate (e.g. "The reviewed sources do not establish current parking conditions for Geuldal. Check the official visitor information before departure.").
   - US place pages have 399 unique words and 0% boilerplate.
3. **Broken short answer on non-US places (introduced by PR #13, fix 4).** 14 of 18 European and Australia/NZ pages print the stored placeholder season sentence inside the answer template, for example:

   > "The Berowra Valley National Park is a protected national park in northern Sydney, New South Wales, Australia. The best time to visit is No verified visitor-season recommendation is available for Berowra Valley National Park; consult the park authority for your travel dates., and this guide suggests 3 days."

   Cause: `destinationShortAnswer()` in `src/lib/seo/destinationAnswer.ts` treats any non-empty `best_season` as a season. This text is now the first sentence on the page and the start of the `<main>` content.
4. **"No related destinations yet" on every non-US place:** 18/18 Europe and Australia/NZ pages, and 4/9 translated pages (the non-US ones). It appears on no US page (see §3).
5. **Hubs have no prose.**
   - Country and region hubs have 0 paragraphs of 12 or more words; their only intro is a one-sentence template in the hero.
   - Region hubs have 1 H2, and 4–16 internal links.
   - The list pages `/rv-camping`, `/no-reservation`, `/fly-and-drive` and `/corridors` have no intro paragraph; `/rv-camping` has no H2.
6. **No partner block comes before the first prose paragraph on any template** (all 0). The answer-first layout holds.
   - Exception: the site-wide **Black Friday announcement bar** (header, `src/components/site/AnnouncementBar.tsx`) sits above the H1 on **100/100** pages. It is a sponsored Motorhome Republic link.
   - Destination pages carry a median of 8 partner blocks in total. All of them come after the answer.
7. **H2 structure is identical.** Every destination page has the same 12 H2 slots, several generic ("Plan deeper", "More destinations you'll love", "Ready to build your trip?", "Five picks for X"). Guides have 9–10 H2s, specific to each page.
8. **Titles and descriptions:**
   - Duplicates in the sample: **0** titles and **0** descriptions.
   - Templated: 29 titles share the "X — WildParkRoutes" shape, and 5 destination descriptions use one template ("X travel guide: when to go, a day-by-day plan, stays, X rentals and the road trip map.").
   - Title equals H1 (ignoring letter case) on 4/10 things-to-do and 2/10 best-time pages. Destination titles add "Travel Guide" to the place name.
9. **Maps:**
   - A map loads in the browser on all destination and country-hub pages and on 2/5 hub detail pages.
   - Guides have **no map**, although the place's stored route exists.
   - Region hubs have no map.
10. **Images and credits:**
    - **No original photography** anywhere. Every credited photo is from Wikimedia Commons, including the 53 service photos in `src/data/servicePhotos.json`.
    - "Uploaded asset" images are stored copies of Commons/partner photos.
    - "Site asset" images are bundled thumbnails and icons (17–23 per page).
    - **Legacy-domain images:**
      - `/road-trips` and `/corridors` load covers from `https://minialife.com/__l5e/…` (2 in the sample).
      - The live sitemaps list **53** `<image:loc>` URLs on `minialife.com`: us-destinations, the four US guide sitemaps, fly-and-drive, no-reservation and rv-camping.
      - These most likely come from stored `hero_image` values with an absolute legacy URL. That is a database value; I did not query it.
11. **robots:**
    - No sampled page carries `noindex` or an `X-Robots-Tag`.
    - Guide 404 pages carry `noindex` with HTTP 404 (§2).

### Third-party scripts and page weight

**Server HTML:**
- **0** third-party `<script src>` on all 100 pages.
- Each page has 2 first-party scripts (`/assets/index-*.js` and `/__l5e/events.*.js`) plus 5–8 module preloads.

**Added in the browser** (from the code; their sizes could not be measured because those hosts are not reachable from this environment):

| Script | Where | Source |
|---|---|---|
| Travelpayouts `tp-em.com/NTgyMTU3.js` | every page, after hydration | `src/routes/__root.tsx:138` |
| Google tag `googletagmanager.com/gtag/js` | every page, when `GOOGLE_ANALYTICS_MEASUREMENT_ID` is set | `src/lib/analytics.ts:65` |
| GetYourGuide widget `widget.getyourguide.com/dist/pa.umd.production.min.js` | destination pages, when the widget scrolls into view | `src/components/destination/PartnerWidget.tsx` |
| OpenFreeMap tiles (OpenStreetMap fallback) | pages with a map | `src/components/destination/mapRecovery.ts` |
| Google Fonts CSS | every page | `__root.tsx` |
| Viator listings | inside the site's own iframe `/experiences/place/{slug}`: 2 per destination page, 1 per guide | |

**First-party JavaScript (measured):**

| File | Compressed | Raw |
|---|---|---|
| `/assets/index-BJgIaHmb.js` (every page) | 706 KB | 2.75 MB |
| `/assets/DestinationPageView-CbE2l-Ga.js` (destination pages) | **1.02 MB** | 2.74 MB |
| Destination page total | **≈ 1.73 MB** | |
| Guide and hub page total | ≈ 710 KB | |

- **Cause of the destination chunk's size:** `src/components/destination/DestinationPageView.tsx:60` imports all of `src/data/routes.json`. That is 2.69 MB holding about 128,000 coordinate pairs for every place's route, sent to the browser on every destination page, although the page needs one route.

## 2. Guide pages and `indexable=false` (from the code)

**Rules.** `scripts/content-pipeline/insert-landing-pages.py` sets `indexable = not reason`, with three possible reasons:

1. `thin: N words`: intro plus sections under `MIN_WORDS` (600).
2. `near-duplicate of {slug}`: Jaccard shingle overlap above 0.2 with an earlier page of the same type.
3. `no glamping stays to show yet`: glamping pages for places without an Awin/info stay offer.

The table default is `indexable boolean NOT NULL DEFAULT false` (migration `20261001213147`). Non-indexable guides get `noindex, follow` (`destinations.$slug.$region.$place.$guide.tsx:121`) and are left out of the sitemaps and of the internal guide links (`getLandingLinksForDestination` filters `indexable = true`).

**How many.** The code cannot count database rows, so this is derived from the live sitemaps (which list only indexable guides) plus a probe:

- **464 US places** have all four guide types indexable: 464 × 4 = **1,856 indexable guides**. No US place has only some types, so no published guide of a published place shows as `indexable=false`.
- **36 US places** have no guide in any sitemap (e.g. amarillo, annapolis, bisbee, borrego-springs, calistoga). All 144 of their guide URLs return **HTTP 404**, not a noindex page: these guides were never generated or published (`evidence/probe-results.txt`).
- **No non-US place has guides.** All 156 non-US guide sitemaps (39 countries × 4 types) are empty, by design: AGENTS.md says search guides are not generated for new places.
- **Not visible from here:** rows with `indexable=false` for unpublished destinations, or draft rows. A database query (`select noindex_reason, count(*) from seo_landing_pages where not indexable group by 1`) would settle it.

## 3. How nearby/related-destination links are built

| Block | Where | Source | Result |
|---|---|---|---|
| "More destinations you'll love" (`SimilarDestinations`, `DestinationPageView.tsx:966`) | destination pages | `destinations.similar_slugs`, a stored list loaded in `getDestinationPageData` (`destinations.functions.ts:166`); up to 4 | **Empty for every non-US place**: the combined-content pipeline sets `similar_slugs: []` by rule (`combined_content.py:96`), and 1,019/1,019 bundles in `scripts/content-pipeline/combined-content/` have it empty. Only the older US waves (`apply-wave.py:122`) filled it, so those pages show "No related destinations yet." |
| "Plan deeper" (`PlanDeeper.tsx`) | destination, guide, pSEO and route pages | this place's own guides (indexable landing pages), fly-and-drive, no-reservation, rv-camping, plus loops and corridors that contain this place | Links within one place, not to other places |
| "More road trips" (`MoreRoutes.tsx`) | loop and corridor pages | loops and corridors sharing a stop, then the rest, up to 6 | |
| Stop links in travel plans | destination pages | optional `travel_plan.days[].stops[].placePath` | |
| Breadcrumbs | all pages | `breadcrumbs.ts` | Up to region and country hubs |

- **No geographic nearby links:** nothing uses `lat`/`lng`, although every published place has coordinates (`destination-geo.json` and the `lat`, `lng`, `region_slug` columns).
- **Guides link to no other place.** Their "nearby" set is empty by construction.

## 4. Hub/list routes linked from header, footer and home (live HTML + code)

| Route | Header | Footer | Home body |
|---|---|---|---|
| `/destinations` | ✅ | ✅ | ✅ |
| `/road-trips` | ✅ | ✅ | ✅ |
| `/trip-guides` | ✅ | ✅ | ✅ |
| `/gear` | ✅ | ✅ | ✅ |
| `/corridors` | — | ✅ | ✅ |
| `/rv-camping` | — | ✅ | ✅ |
| `/no-reservation` | — | ✅ | ✅ |
| `/fly-and-drive` | — | ✅ | ✅ |
| `/destinations/{country}` (40 countries) | menu | ✅ | ✅ (country tiles) |
| Region hubs `/destinations/{country}/{region}` | — | — | — (only from country hubs and breadcrumbs) |

- Header: `src/components/site/Header.tsx` (NAV plus the country menu). Footer: `Footer.tsx`. Home: `src/routes/index.tsx` and `src/components/home/*`.
- Region hubs are reachable only through country hubs (150–553 links each) and breadcrumbs.

## 5. Data that could feed unique, non-AI content

From `src/integrations/supabase/types.ts`, `src/lib/data/travelPlan.ts` and `src/data/*`:

| Topic | Fields available | Not available |
|---|---|---|
| Monthly visitation | — | **No field.** No visitor counts anywhere in the schema or the repo data. |
| Climate | `best_season` (text), `best_seasons[]` (labels), `travel_plan.goldenHour` (text) | **No temperature, rainfall or snow data.** Climate figures appear only incidentally in cached Wikipedia text under `scripts/content-pipeline/europe-prepare-cache/`, which is not structured. |
| Permits and access | `permit_level` (enum), `permit_headline`, `permit_note`, `permit_source_url`, `park_authority`, `access_type` (road/ferry/fly-in), `travel_plan.intel[]` (kinds: parking, signal, fuel, timing, access), `src/lib/data/destinationAnswers.ts` (reviewed pilot answers with dates) | — |
| Drive times and arrival | `drive_minutes`, `drive_miles`, `nearest_airport_code/name`, `airport_lat/lng`, `lat`/`lng`, `travel_plan.days[].driving`, `src/data/routes.json` (stored route lines), `src/data/daily-route-points.json`, `travel_plan.markers[]`, `flight_price_cache` (Aviasales fare per airport, 24 h) | — |
| Trip shape | `trip_duration_days`, `recommended_duration`, `travel_plan.days[]` (stops with sourced details), `gateway_cities[]`, `experience_tags[]`, `trip_tags[]`, `avg_daily_budget` (US), `scenic_score`, `camping_score`, offers (category, partner, estimated price anchors), `viator_place_cache` | — |
| Hubs | `regions.intro` (text column) | **Not used:** region hubs show a fixed template sentence (`destinations.$slug.$region.index.tsx:52`) |

Without any AI, these support:
- distance-sorted "nearby places" lists,
- airport and drive-time tables per region,
- permit-level summaries per region,
- route and airport facts on guides,
- best-season groupings on hubs.

Monthly crowds and climate tables would need a new source loaded once (for example climate normals per coordinate). There is no such data today.

## 6. Top structural gaps, ranked (not implemented)

Ordered by effort, then expected value.

| # | Gap | Evidence | Effort | Expected value |
|---|---|---|---|---|
| 1 | **Broken short answer on non-US places:** the placeholder season sentence is printed inside the answer template | 14/18 EU and AU/NZ pages, first sentence of `<main>` (§1.3) | Small: skip the season clause when `best_season` is a "No verified…" sentence; add a test | High: currently the first thing readers and answer engines see |
| 2 | **Images on the legacy domain** (`https://minialife.com/__l5e/…`) | 53 sitemap image URLs; `/road-trips` and `/corridors` covers | Small: rewrite to relative or `wildparkroutes.com` (data fix, or normalise at render time) | Medium: image indexing and a cross-domain dependency |
| 3 | **Intro and H2 on list pages** (`/rv-camping`, `/no-reservation`, `/fly-and-drive`, `/corridors`) | 0–12 prose words; `/rv-camping` has no H2 | Small: 2–3 fixed sentences each, plus section H2s | Medium |
| 4 | **Guides link to other places and their own region** | 0 place links on 40/40 guides | Small–medium: add "Nearby places" and the region hub inside `<main>` | Medium–high: internal PageRank flow to 1,856 guides and their neighbours |
| 5 | **Geographic nearby links** to replace the empty `similar_slugs` | "No related destinations yet" on 18/18 non-US pages; 1,019 bundles empty | Medium: compute the N nearest published places at build time from `destination-geo.json`/`lat`/`lng`, no AI | High: every non-US place gets related links; fewer orphan-like pages |
| 6 | **Bundle size:** `routes.json` (2.69 MB) is bundled into the destination page | `DestinationPageView` chunk 1.02 MB compressed; ≈ 1.73 MB JS per destination page | Medium: pass the page's route through the loader (or a per-slug file) instead of importing the whole file | High: Core Web Vitals on the most numerous template |
| 7 | **Boilerplate on non-US place pages:** "unknown fact" sentences make up ~55% of paragraph text | EU median 116 unique words, AU/NZ 61 (§1.2) | Medium: hide unknown fields instead of printing that they are unknown; show stored facts as data blocks (airport, drive, permit level, access type, route length) | High: thin-content risk on the largest share of the catalog |
| 8 | **Hubs without prose or data** (country and region) | 0 prose, 1–2 H2s; `regions.intro` unused | Medium: render stored `regions.intro`; add data sections built from stored fields (counts, airports, drive ranges, permit mix, best-season groups) | Medium–high: hubs are the main crawl paths |
| 9 | **Maps and data on guides** | 0/40 guides have a map; route data exists | Medium: reuse the stored route map and facts on itinerary and best-time pages | Medium |
| 10 | **Identical H2 skeleton on destination pages** (12 fixed slots, several generic) | 12/12 on every destination page | Small–medium: drop empty or generic sections and name sections after the place | Low–medium |
| 11 | **Guides missing for 36 US places and all non-US places** | 144 probes return 404; 156 non-US guide sitemaps empty | Large: needs content generation, which AGENTS.md currently excludes for new places | High, but an owner decision |
| 12 | **No climate or visitation data** | §5 | Large: import a reviewed open dataset once (climate normals per coordinate), stored, no AI | Medium–high: unique, citable data per place |

**Smaller items:**
- **Announcement bar:** the sponsored Black Friday link above the H1 on 100/100 pages. It is time-limited (ends 2 Dec); remove it after the sale.
- **Title templates:** 29/100 titles share the "X — WildParkRoutes" shape, and some guides have title = H1. No duplicates were found.
