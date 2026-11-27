# seo-structure-1: structural fixes and data-sufficiency audit

**Branch:** `seo-structure-1` (from `seo-fixes-1`).

**Constraints followed.** The live database was not touched and nothing was published. No AI model ran at runtime or in tests, and no other sessions were spawned.

**Data sources.** Part 2 uses only repository files: `src/data/*.json`, the `scripts/content-pipeline` completion and combined-content bundles, `source-packets/`, `multiday/`, and the catalogs. It also uses the live sitemaps that the earlier read-only audit (`scripts/audits/seo-structure/`) saved on 2026-11.

**Reproduce:**

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/audits/seo-structure-1/data_audit.py
```

This writes `data_audit.json`, which holds per-place rows.

**Checks:**

| Check | Result |
|---|---|
| `tsc --noEmit` | pass |
| vitest | 83 files, 527 tests pass |
| Python pipeline tests | 129 pass |
| `vite build` | pass |

## Part 1: site-wide fixes (counts)

### 1. Season text

- One rule, `isSeasonText`/`genuineSeason` in `src/lib/seo/season.ts`, now covers every listed surface. Where there is no genuine season, the field, box or sentence is omitted.
- Stored `best_season` values in Europe/AU/NZ repo bundles (2,587 places):

| Stored value | Places |
|---|---|
| "No verified visitor-season recommendation…" | 1,720 |
| "Check official seasonal information" | 629 |
| "Check official seasonal access…" | 9 |
| Empty | 113 |
| **Genuine season** | **101** |

- The leak test is `src/lib/seo/seasonLeak.test.ts`. It runs real stored en/de/fr strings through:
  - the answer, meta/og/twitter, TripSnapshot, BeforeYouLand and permit fallback;
  - guide FAQs and FAQPage markup;
  - pin copy, landing FAQs, DecisionBlocks and home badges;
  - `translateDest`.
- It also scans the source and fails on any unfiltered `bestSeason` read.

### 2. "Reviewed sources do not establish…" boilerplate (non-US place pages)

The measurement used the real `knownFactsOnly` filter over paragraphs from the 100 saved live pages. "Words" are median words per page.

| Page type | Pages | All paragraph words, before → after | Unique prose words, before → after | Boilerplate paragraphs removed (median) | Boilerplate left |
|---|---|---|---|---|---|
| Destination US | 12 | 563 → 563 | 399 → 399 | 0 | 0 |
| Destination Europe | 12 | 502 → 280 | 116 → 143 | 9 | 0 |
| Destination AU/NZ | 6 | 481 → 281 | 61 → 95 | 8 | 0 |
| Translated place (de/fr) | 9 | 574 → 549 | 523 → 483 | 0 | 0 |
| Hub detail (no-reservation/rv) | 5 | 347 → 179 | 101 → 79 | 0 | 0 |
| US guides (4 types) | 40 | unchanged | unchanged | 0 | 0 |

- Unique prose rises on EU/AU/NZ pages because the repeated template sentences no longer dilute them.
- Travel-plan fields that only stated unknowns are emptied but keep their array length, so de/fr overlays still align.

### 3. Nearby places

- `src/data/nearby.json` is built by `build-nearby.py` from stored coordinates. It covers **3,231 / 3,231** places:

| Nearby places listed | Places |
|---|---|
| 6 | 3,222 |
| 5 | 6 |
| 2 | 3 |

- 6 places include a cross-border neighbour within 150 km.
- Nearby places are shown on place pages and on every place guide. Guides also link to the place, its region hub ("All places in …") and the other guides of the place (PlanDeeper).

### 4. Hubs and list pages

- Before this change, country hubs, region hubs and list pages had **0** words of lead prose, and /rv-camping had no H2.
- Each of these pages now has one `<main>`, one H1 and an answer-first lead. The lead comes from `regions.intro` or from stored facts: count, typical stay, airports, median drive, access and notable places.
- Directories add an "At a glance" H2. Guide-family hubs add a server-rendered A–Z list of every guide.
- All of this is in en/de/fr.
- Live word counts per hub need a deployed build and were not measured.

### 5. Page families: indexable rules (kept unchanged) and what they exclude

| Family | URLs in live sitemap (2026-11) | Rule that excludes pages | Excluded |
|---|---|---|---|
| fly-and-drive | 3,156 | Airport code, airport name and drive minutes are required, otherwise 404 | not countable from repo |
| no-reservation | 2,606 | permit_level is high or moderate, and a stored note exists | see note below |
| rv-camping | 490 | Road access, camping score ≥ 7, airport and drive are required | not countable from repo |
| road-trips | 31 | Reviewed loops.json; 30 loops | 0 |
| corridors | in pages.xml | `pilot: true` gives noindex | 0 of 7 are pilots |
| trip-builder | not listed | Always noindex (personal tool) | all |

**No-reservation note.**

- 2,191 of the 2,606 URLs are non-US. Only **11** of those have a reservation note that says anything beyond "not established / check official".
- I kept the existing rule: a stored note still qualifies, and the boilerplate is not shown. So about 2,180 pages now show only the booking-demand level and the generic reservation panel, with no FAQ.
- **Decision 1** below covers this.
- Titles now come from stored facts (≤ 60 characters, tested in `familyPages.test.ts` and `titlesAndLastmod.test.ts`):
  - fly-and-drive: "Closest Airport to X: CODE, drive Drive";
  - rv-camping: pickup airport and drive time;
  - loops: stops and days.
- Each family has an answer block built from stored facts. FAQPage markup is emitted only from visible FAQs, including corridors.

### 6–7. Titles and lastmod

- Destination main-page titles are "X Travel Guide" in en, de and fr, with no "Road Trip/Itinerary".
- Sitemap `lastmod` is dropped for any date shared by more than 20 URLs in one file, because such dates are bulk timestamps.

### 8. Client JavaScript (local build)

| Chunk | Before (raw / gzip) | After (raw / gzip) |
|---|---|---|
| DestinationPageView | 2,739,549 / 1,021,878 | **50,501 / 15,710** |
| index (entry) | 2,782,173 / 715,147 | 2,782,748 / 715,426 |
| All JS assets | 7,294,513 / 2,257,321 | **4,606,040 / 1,251,484** |

- `routes.json` and `nearby.json` are now imported only by server functions, and a source-scan test enforces it.
- Travelpayouts loads when an outbound link nears the viewport, or on the first scroll or tap.
- The Viator frame is lazy. GetYourGuide was already lazy, and Vrbo uses plain links with no script.
- Follow-up: the entry chunk still carries `daily-route-points.json` (440 KB) and `phrases.de.generated.json`.

## Part 2: data sufficiency, Europe and AU/NZ (read-only)

### a. Stored facts per country

**Column definitions:**

- **Airport/drive in repo** is the airport code and drive minutes found in repo files. IT/ES/DE/AT/CH/GB keep these only in the database. Every stored route line starts at the arrival airport, so the gates treat a route as "airport + drive known".
- **Packet** is an approved source packet, as a file or inline.
- **Overview** is Wikipedia-source words in the packet: the median, and the number of places with ≥ 300 words.
- **Stay** is a stay offer. The non-US publish scripts write none.

| Country | Places | Coords | Tagline | Genuine season | Permit level | Real permit note | Airport/drive in repo | Route | Packet | Overview median (words) | Overview ≥ 300 | Stay | Best-time gate | Itinerary gate | Glamping gate | Best-time: main gap | Itinerary: main gap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| it | 198 | 198 | 198 | 0 | 198 | 0 | 0 / 0 | 198 | 198 | 201 | 88 | 0 | 0 | 177 | 0 | season | plan>=2d|4stops |
| nl | 168 | 168 | 168 | 0 | 168 | 0 | 168 / 168 | 168 | 168 | 186 | 14 | 0 | 0 | 34 | 0 | season | plan>=2d|4stops |
| de | 168 | 168 | 136 | 8 | 136 | 0 | 0 / 0 | 168 | 144 | 249 | 79 | 0 | 3 | 141 | 0 | season | packet |
| es | 164 | 164 | 164 | 0 | 164 | 0 | 0 / 0 | 164 | 164 | 202 | 43 | 0 | 0 | 156 | 0 | season | plan>=2d|4stops |
| au | 162 | 162 | 162 | 0 | 162 | 0 | 162 / 162 | 162 | 162 | 193 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| gb | 144 | 144 | 130 | 92 | 130 | 108 | 0 / 0 | 144 | 144 | 0 | 14 | 0 | 0 | 15 | 0 | overview>=300w | plan>=2d|4stops |
| no | 140 | 140 | 140 | 0 | 140 | 0 | 140 / 140 | 140 | 140 | 198 | 34 | 0 | 0 | 75 | 0 | season | plan>=2d|4stops |
| ie | 133 | 133 | 133 | 0 | 133 | 0 | 133 / 128 | 133 | 133 | 199 | 25 | 0 | 0 | 46 | 0 | season | plan>=2d|4stops |
| is | 127 | 127 | 127 | 0 | 127 | 0 | 127 / 127 | 127 | 127 | 199 | 41 | 0 | 0 | 79 | 0 | season | plan>=2d|4stops |
| fr | 123 | 123 | 123 | 0 | 123 | 0 | 123 / 123 | 123 | 123 | 194 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| fi | 94 | 94 | 94 | 0 | 94 | 0 | 94 / 94 | 94 | 94 | 142 | 5 | 0 | 0 | 20 | 0 | season | plan>=2d|4stops |
| se | 82 | 82 | 82 | 0 | 82 | 0 | 82 / 82 | 82 | 82 | 196 | 18 | 0 | 0 | 38 | 0 | season | plan>=2d|4stops |
| at | 81 | 81 | 68 | 1 | 68 | 0 | 0 / 0 | 81 | 76 | 177 | 35 | 0 | 1 | 74 | 0 | season | packet |
| ch | 67 | 67 | 56 | 0 | 56 | 0 | 0 / 0 | 67 | 63 | 0 | 18 | 0 | 0 | 62 | 0 | season | packet |
| pl | 65 | 65 | 65 | 0 | 65 | 0 | 65 / 65 | 65 | 65 | 196 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| nz | 55 | 55 | 12 | 0 | 12 | 0 | 12 / 12 | 12 | 12 | 0 | 0 | 0 | 0 | 0 | 0 | packet | packet |
| sk | 52 | 52 | 52 | 0 | 52 | 0 | 52 / 52 | 52 | 52 | 190 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| dk | 48 | 48 | 48 | 0 | 48 | 0 | 48 / 48 | 48 | 48 | 201 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| ee | 41 | 41 | 41 | 0 | 41 | 0 | 41 / 41 | 41 | 41 | 132 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| gr | 38 | 38 | 38 | 0 | 38 | 0 | 38 / 38 | 38 | 38 | 195 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| pt | 38 | 38 | 38 | 0 | 38 | 0 | 38 / 38 | 38 | 38 | 188 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| be | 38 | 38 | 38 | 0 | 38 | 0 | 38 / 38 | 38 | 38 | 191 | 3 | 0 | 0 | 16 | 0 | season | plan>=2d|4stops |
| ba | 35 | 35 | 35 | 0 | 35 | 0 | 35 / 35 | 35 | 35 | 195 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| ro | 33 | 33 | 33 | 0 | 33 | 0 | 33 / 33 | 33 | 33 | 187 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| hr | 32 | 32 | 32 | 0 | 32 | 0 | 32 / 32 | 32 | 32 | 200 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| mk | 32 | 32 | 32 | 0 | 32 | 0 | 32 / 32 | 32 | 32 | 190 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| bg | 31 | 31 | 31 | 0 | 31 | 0 | 31 / 31 | 31 | 31 | 199 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| si | 31 | 31 | 31 | 0 | 31 | 0 | 31 / 31 | 31 | 31 | 203 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| cz | 30 | 30 | 30 | 0 | 30 | 0 | 30 / 30 | 30 | 30 | 200 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| hu | 29 | 29 | 29 | 0 | 29 | 0 | 29 / 29 | 29 | 29 | 190 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| al | 25 | 25 | 25 | 0 | 25 | 0 | 25 / 25 | 25 | 25 | 194 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| rs | 22 | 22 | 22 | 0 | 22 | 0 | 22 / 22 | 22 | 22 | 194 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| lt | 16 | 16 | 16 | 0 | 16 | 0 | 16 / 16 | 16 | 16 | 141 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| me | 15 | 15 | 15 | 0 | 15 | 0 | 15 / 15 | 15 | 15 | 199 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| lv | 15 | 15 | 15 | 0 | 15 | 0 | 15 / 15 | 15 | 15 | 199 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| mt | 6 | 6 | 6 | 0 | 6 | 0 | 6 / 6 | 6 | 6 | 199 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| lu | 6 | 6 | 6 | 0 | 6 | 0 | 6 / 6 | 6 | 6 | 194 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |
| cy | 3 | 3 | 3 | 0 | 3 | 0 | 3 / 3 | 3 | 3 | 205 | 0 | 0 | 0 | 0 | 0 | season | plan>=2d|4stops |

**Totals:**

| | Places | Genuine season | Real permit note | Packet | Best-time pass | Itinerary pass | Glamping pass |
|---|---|---|---|---|---|---|---|
| Europe | 2,370 | 101 | 108 | 2,337 | **4** | **933** | **0** |
| AU/NZ | 217 | 0 | 0 | 174 | **0** | **0** | **0** |

**Coverage gaps:**

- 43 NZ places and 70 European places (DE 32, AT 13, CH 11, GB 14) have no tagline or bundle in the repo.
- 33 European places have no approved packet.

### b. Guide gate (transparent, stored facts only)

All guide types also need the existing insert-time rules:

- **≥ 600 words.** Otherwise the page is noindex as "thin".
- **Near-duplicate check:** 5-word shingle Jaccard > 0.2 against the same guide type is noindex.
- **Glamping** needs a stay offer (`category='stay'`, network `awin`/`info`).

| Guide | Inputs required (the US generator's inputs, restricted to verifiable stored facts) | Europe pass | AU/NZ pass | Main reason for failing |
|---|---|---|---|---|
| Best time | Approved packet, genuine season, permit level or real note, ≥ 300 words of overview | 4 | 0 | No genuine season (Europe 2,236; AU/NZ 174) |
| Itinerary | Approved packet, airport, drive and route, and a plan with ≥ 2 days or ≥ 4 sourced stops | 933 | 0 | Plan too short (Europe 1,404; AU/NZ 174) |
| Glamping | Approved packet, stay offer, coordinates | 0 | 0 | No stay offer anywhere outside the US (2,511) |

### c. Best-time guide: what stored facts can fill

The US best-time page has an intro and five sections: season by season, crowds, weather, reservations timing, and practical tips.

| Section | Fillable from stored facts? | Source |
|---|---|---|
| Intro answer | Only for the 101 genuine seasons | `best_season` |
| Reservations timing | Level for 2,474 places; note for 108 | `permit_level`, `permit_note` |
| Getting there / when roads are usable | Partly: airport, drive and route; no seasonal closures | routes, airport |
| What you can see (by stop) | Yes | travel-plan stops, packet excerpts |
| Daylight by month | Yes: computed from coordinates with a solar formula, no external data | coordinates |
| Weather by month (temperature, rain, snow) | **No: new data needed** | climate normals |
| Crowds by month | **No: new data needed.** No per-place visitor counts are stored; national statistics are not per place | none |
| Seasonal closures | **No** | official sources, per place |

**Candidate open sources for monthly climate normals by coordinates.**

- All five candidates are global and cover every place.
- The official licence and attribution pages could not be read: this session's network policy blocks the five hosts (DNS refusal).
- Licence and attribution terms are therefore **not verified** and are deliberately not quoted here.

| Source | Product | Official terms page to confirm |
|---|---|---|
| NASA POWER | Climatology API, monthly normals at any latitude/longitude | https://power.larc.nasa.gov/docs/referencing/ |
| WorldClim 2.1 | Monthly normals 1970–2000 (gridded) | https://www.worldclim.org/data/worldclim21.html |
| Open-Meteo | Historical and climate API | https://open-meteo.com/en/licence |
| Meteostat | Station normals | https://dev.meteostat.net/terms.html |
| Copernicus ERA5 (CDS) | Reanalysis monthly means | https://cds.climate.copernicus.eu/licences |

### d. Pages that are currently noindex

- The repo cannot attribute the Search Console figure of 1,015 to rules, because that needs the GSC export.
- The saved live sitemaps list **3,230 / 3,231** published places. The remaining one is a slug/country-code name collision, not a missing page. So **no place page** is currently noindexed by the place-page rule, which noindexes pages with no tagline or no hero.
- Rules that emit noindex on crawlable URLs:

| Page type | Rule | Crawlable URLs (upper bound) | Linked from |
|---|---|---|---|
| `/trip-builder/<slug>` and `/de/trip-builder/<slug>` | Always `noindex, follow` | ~3,204 en plus German counterparts | "Customize" button on every road place with a plan |
| `/experiences/place/<slug>`, `/experiences/home`, `/experiences/<corridor>` | `noindex, nofollow` frames | one per place, plus 8 | iframes on place and guide pages |
| `/destinations?country=…&q=…&page>1` (en/fr) | Filtered lists are noindex | open-ended | filters and pagination |
| `/search` | noindex | open-ended | search box |
| Guides with `indexable=false` | thin, near-duplicate, or no glamping stay | DB only (0 visible: no non-US guides exist) | not linked |
| Legacy 410 pages (`legacy.ts`) | 410 with meta noindex | about 95k old URLs | old backlinks |

- **Most likely source** of the 1,015: trip-builder URLs plus the experience frames.
- Per country, the upper bound for trip-builder equals the route count in table (a).

## Decisions needed

1. **No-reservation pages with only boilerplate notes (about 2,180 non-US).** Choose one:
   - (a) keep them as now;
   - (b) noindex them until a real note exists;
   - (c) return 404 and drop them from the sitemap.
   - Recommendation: (b).
2. **Trip-builder and experience frames.**
   - Add `rel="nofollow"` to the "Customize" link, or disallow `/trip-builder/` and `/experiences/` in robots.txt, to stop noindex URLs being crawled.
   - Please share the GSC "Excluded by noindex" export so the 1,015 can be split by rule.
3. **Climate data for best-time guides.**
   - Choose a source after confirming its licence; allow the host or check the page yourself.
   - Then decide whether the best-time gate may use computed daylight plus climate normals in place of a stored season. Today only 4 places in Europe and 0 in AU/NZ pass.
4. **Itinerary guides.** 933 European places pass with ≥ 2 days or ≥ 4 sourced stops. Choose one:
   - approve a pilot (for example NL/NO/IS/IT/ES first);
   - or raise the bar to ≥ 2 days only.
5. **Glamping outside the US.** No stay partner writes stay offers for Europe or AU/NZ, so 0 places pass. Choose one:
   - approve a stay partner per country;
   - or keep glamping guides US-only.
6. **NZ data.** 43 of 55 NZ places have no bundle or packet in the repo. Complete them before any NZ guide work.
7. **Follow-up performance work.** Approve moving `daily-route-points.json` and `phrases.de.generated` out of the entry chunk (about 0.5 MB raw).
