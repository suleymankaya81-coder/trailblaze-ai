# Remaining DACH destinations — completion plan (in chunks)

## Current state
- Catalog: 316 places; 17 published.
- 299 waiting: 298 have no approved official source text, 1 (Berchtesgadener Land) has no suitable photo.
- The last run was blocked because the Wikidata lookup hit a rate limit (HTTP 429), so no sources were found.

## Approach
Work in chunks of ~40 places, one country/type at a time. Each chunk = one script run, no content-model calls, no subagents, no browser tests. After each chunk I report: published count, held list with reason, credit balance.

### Step 1 — Fix source collection (no AI)
- Stop relying on Wikidata only. Use known official domains per type instead:
  - Germany Naturparks: naturparke.de member pages + each park's own site.
  - Austria Naturparks: naturparke.at.
  - Swiss regional parks: parks.swiss (English pages exist for all parks).
  - National parks/biosphere: official park sites + nationale-naturlandschaften.de.
  - Lakes/mountains/waterfalls/caves: official regional tourism sites (e.g. germany.travel, austria.info, myswitzerland.com) which have English text.
- Slow, polite fetching (1 request/second, stop on 403/429), results cached to disk so nothing is fetched twice.

### Step 2 — Allow German-language sources
- If no English text exists, accept the official German text as evidence; the page quotes are shown in German on German pages and a short, plain English summary is built from fixed templates (name, type, region, access, season) — no invented facts.

### Step 3 — Chunks
1. Swiss regional parks + remaining Swiss places (parks.swiss / myswitzerland) — ~67
2. Austria Naturparks + Austrian places — ~65
3. German national parks/biosphere still held (Black Forest, Wadden Sea, Rhön…) — ~26
4. German Naturparks — 3 chunks of ~40
5. German lakes, mountains, waterfalls, caves, coasts — 2 chunks
6. Final: Berchtesgadener Land photo, sitemap/geo refresh, one quick page check per chunk (HTTP + title, no screenshots).

### Rules kept
- A place without verified source + photo stays unpublished (no empty pages).
- Prices shown with local currency labels (EUR/CHF), "typical" labelling as now.

## Technical details
- Extend `collect-dach-sources.py` with per-type domain lists and a disk cache; add `--chunk` (country/type filter, limit) to `finish-dach-free.py`.
- Add German-quote support in the quoted-visit builder, storing German text in `content_translations`.
- Run existing DACH Python tests after the code change only, not per chunk.
