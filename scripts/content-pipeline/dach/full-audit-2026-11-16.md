# DACH completeness audit — 16 November 2026

## Results
- Germany: 168 / 168 published, with German versions.
- Austria: 81 / 81 published, with German versions.
- Switzerland: 67 / 67 published, with German versions.
- 632 English/German pages return HTTP 200 with headings, canonical and description metadata.
- All 316 displayed cover images decode successfully in Chromium. No duplicated stored cover URLs.
- All published records have introductory text, search metadata, licensed cover credit, coordinates, airport, region, currency, visitor note and nonempty daily stops.
- All DACH regions are published.
- 296 application tests and 78 content-pipeline tests pass. Representative desktop and phone pages have no horizontal overflow or observed page errors. German itinerary navigation verified.

## Repairs
- Published Neusiedler See–Leithagebirge Nature Park with a credited Purbach photograph. Its map anchor is **Haus am Kellerplatz**, the named nature park visitor office, not a claimed park centroid.
  - Office identity: https://www.interreg-athu.eu/fileadmin/be_user_uploads/PaNaNetPlus/Druckversion_Leithagebirge.pdf
  - Independently mapped office: https://mapcarta.com/N7695027871 (47.9149, 16.69312).
- Saved 316 offline German page translations with unchanged stop names/identifiers. Fixed shared German visit-duration, tour and visit-highlight headings.
- Refreshed stored geography, airport route and card-photo data for the final destination.

## Scope and limitations
- Zero content-model calls; this does not mean zero Lovable agent/platform credits.
- Offline Argos translations are cached and have not been independently certified for fluent German.
- Completeness, rendered photos and valid structures do not certify every factual claim or every photograph's exact subject. Existing source gaps remain explicitly unknown, rather than being filled with invented permits, timings, parking, fuel, budgets or extra stops.
- Existing itinerary excerpts were not expanded into invented multi-day trips.
- App publication has not been performed.

Machine-readable reports: full-audit-2026-11-16.json, page-check-2026-11-16.json, german-page-check-2026-11-16.json, media-check-2026-11-16.json.