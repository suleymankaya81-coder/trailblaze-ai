# Remaining Europe catalog (20 countries, 820 candidates)
Countries: lu pl cz sk hu si hr me al mk ba rs bg ro ee lv lt mt cy (+ gb already published, not repeated).
Excluded: Ukraine, Russia, Belarus, Moldova, Kosovo, Turkey, Caucasus — see coverage.json.
Sources: Wikidata (national parks, nature/landscape parks, natural UNESCO sites, notable waterfalls/caves/canyons/lakes/mountains with English Wikipedia articles) + authority_parks.py official national-park checklist (authority-audit.json).
Rebuild: `python3 build_catalogs.py && python3 authority_parks.py` (cached in evidence/). Nothing is published.
