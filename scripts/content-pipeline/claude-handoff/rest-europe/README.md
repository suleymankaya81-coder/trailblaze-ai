# Remaining Europe catalog (19 countries, 819 candidates)
Countries: lu pl cz sk hu si hr me al mk ba rs bg ro ee lv lt mt cy (+ gb already published, not repeated).
Excluded: Ukraine, Russia, Belarus, Moldova, Kosovo, Turkey, Caucasus — see coverage.json.
Sources: Wikidata (national parks, nature/landscape parks, natural UNESCO sites, notable waterfalls/caves/canyons/lakes/mountains with English Wikipedia articles) + authority_parks.py official national-park checklist (authority-audit.json).
Rebuild: `python3 build_catalogs.py && python3 authority_parks.py` (cached in evidence/). Nothing is published.

Authority recovery (2026-11-19): eight historical country identities are attached to their catalog records in `authority-country-links.json`. These are country-menu references, not evidence of historical park pages. Archived country captures returned 404 or connection errors and the CDX index returned 503; exact historical park coverage remains unknown. Montenegro's erroneous national-park list record was removed and existing Lake Skadar now represents the sourced national-park identity without a duplicate destination.
