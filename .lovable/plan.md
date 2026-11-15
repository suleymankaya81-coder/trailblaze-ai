# Canada launch plan (150 places from kanada.txt)

## Cleaning the list first
- Remove duplicates: Wood Buffalo (Alberta + NWT) becomes one page in Alberta; Cypress Hills (Alberta + Saskatchewan) becomes one "interprovincial" page; the BC note "Banff? No" is not a place.
- Merge overlaps: Lake Louise and Maligne Lake can become their own pages or day stops inside Banff/Jasper; Emerald Lake (Yukon) gets a clear name so it is not confused with Emerald Lake in Yoho.
- Result: about 145 unique places, each tagged with its official status (Parks Canada national park, provincial park, Sépaq Quebec park, scenic area/town).

## Waves (same quality checks as US places)
- Wave 1 (about 20): Banff, Jasper, Lake Louise, Yoho, Kootenay, Glacier, Mount Revelstoke, Pacific Rim, Waterton Lakes, Sea-to-Sky, Joffre Lakes, Garibaldi, Kananaskis, Bruce Peninsula, Algonquin, Niagara Falls, Cape Breton Highlands, Gros Morne, Fundy, PEI National Park.
- Wave 2 (about 50): the rest of BC, Alberta, Ontario, Quebec, Atlantic Canada that can be reached by car.
- Wave 3 (about 75): Prairies, Yukon, plus remote places.
- Remote fly-in parks (Torngat, Ivvavik, Vuntut, Aulavik, Tuktut Nogait, Quttinirpaaq, Sirmilik, Ukkusiksalik, Qausuittuq, Sable Island, Wapusk, Gwaii Haanas, Nahanni) get a simpler "expedition" page with no road-trip day plan or rental cards, because you cannot drive to them.

## What each Canada page gets
- Exact-place licensed photos with credits, location, nearest Canadian airport with flights, drive route.
- Daily plan with Google Maps buttons, reservation/pass note linked to the official source (Parks Canada Discovery Pass, BC Parks day passes, Sépaq access fees, and so on).
- Partners: Motorhome Republic Canada (prices in CAD), Airport Rentals, Viator only if real local listings are found. US-only offers (Black Friday Cruise America, RoverPass, Harvest Hosts, Campspot) are hidden unless they confirm Canada coverage.
- Addresses: /destinations/ca/{province}/{place}, plus Canada and province index pages; German pages are added after English pages go live.

## Official sources
The 15 sources from your file (Parks Canada, BC Parks, Alberta Parks, Sépaq, and the others) become the only allowed links for status, fees and reservation rules.

## Technical details
- Add 13 provinces/territories to `regions` (country_code 'ca').
- prepare-wave.py: search Canadian airports (not US-only); new Wikipedia anchors for areas and towns; save the status label.
- Add fields to destinations: `park_authority`, `access_type` (road / fly-in).
- travel content + permit notes generation for each wave, with saved results and pause/resume; publish-wave.py runs the existing completeness checks; fly-in pages use a smaller set of checks.
- After each wave: refresh destination-geo.json, run translate-content.py --locale de, Canada sitemap and hreflang, and connect world-national-parks.net Canada addresses with 301 redirects (Banff, Jasper, Yoho…).
- Tests: Canada addresses, CAD partner selection, hiding US-only partners, no fly-in rental cards.

## Order
1. Clean list and database groundwork (no visible change).
2. Wave 1 facts, review, then publish.
3. Waves 2 and 3, German versions, authority redirects.
