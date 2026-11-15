# Canada review — 15 November 2026

## Completed
- 148 destination identities and photo assignments screened; this is not full visual or claim-by-claim certification.
- 54 records received targeted sourced corrections, stored in `scripts/content-pipeline/canada/review.json` for regeneration safety.
- Saskatchewan Landing passed publishing checks. 144 Canadian destinations are published; four are withheld for photography.
- Clear Lake: wrong Houston photos replaced, Wasagaming coordinates and saved airport route corrected, unrelated Lake Tahoe Viator listing rejected.
- Wrong New Zealand, Michigan, California, Texas and unrelated historical scan assignments removed from affected places. Unsupported photo attribution replaced with known credited selections.
- Remote parks use expedition planning stages, not a fabricated three-day circuit. Road-rental and daily driving controls are suppressed; structured data and downloaded text match the stages.
- Official link corrections, Sirmilik Pond Inlet gateway, Banff winter-tire wording, Torngat bear-guard wording, Alice Lake pass wording, documented Quebec trails, Riding Mountain closure and Jasper 2026 closure notes corrected.
- Canadian averages shown in USD: car C$52 → US$36/day; SUV C$72 → US$51/day; campervan C$231 → US$162/day; motorhome C$232 → US$163/day; hotel C$243 → US$170/night. Exchange basis C$1.4257/US$1, 13 November 2026. These are market benchmarks, not provider quotes; no unsupported cabin average.
- 285 JavaScript tests and 13 Python tests pass. Latest preview check reports build OK.
- Desktop/mobile checks: Banff, Clear Lake, Saskatchewan Landing, Auyuittuq, Sirmilik and Great Bear Lake render; withheld Tuktut Nogait returns 404; no tested horizontal overflow. Banff daily Maps URLs preserve stops and split safely. Native phone-app navigation is not testable here.
- Stable schema script IDs eliminated the observed hydration mismatch on a fresh Clear Lake visit; the unrelated tour was absent.

## Photographs needed from the owner
Please supply the source URL and reuse permission/license, not only an image copied from search.
1. **Alice Lake Provincial Park, Squamish, British Columbia:** exact-park landscape cover and supporting photos. Wells Gray namesake images rejected.
2. **Dollar Lake Provincial Park, Nova Scotia:** supporting landscape/activity photos. An exact-place cover candidate exists, but the full photo set is inadequate.
3. **Murray Beach Provincial Park, New Brunswick:** cover and supporting photos. Australian namesake images rejected.
4. **Tuktut Nogait National Park:** in-park landscape cover and supporting photos. Texas archive photographs and gateway-airport pictures cannot represent the park itself.

## Not certified / remaining limitations
- Every generated sentence, retained marker, current operational closure, flight connection and rental pickup availability has not been independently verified.
- Some Wikimedia delivery is intermittently blocked; lazy, unrequested images are not failures, and neutral SafeImage fallbacks do not prove a cover loaded. Exact accessible copies were used where available; no unrelated replacement was introduced.
- A 200 page response does not prove correct scenery, factual accuracy or partner availability. Six representative destination pages were browser-tested, not all 144.
- Full independent photo licensing/location verification and current-source verification remain open. German Canadian translations and old-authority-domain URL mappings were not included.
- No publishing action was performed. Database corrections are shared with the published site, while frontend changes require publishing.
## Claim-by-claim verification — batch 1 (20 Wave 1 places)
- All 20 Wave 1 destinations checked against Parks Canada, provincial and official tourism sources; 97 sourced corrections applied to the database and persisted in `canada/review.json`.
- Main fixes: 2026 free-admission periods (Jan 1–15, Jun 19–Sep 7), Kananaskis pass scope and road-closure dates, Cape Breton coyote trail closures and Skyline reservations, Fundy bridge/trail/road closures, Bruce Peninsula parking reservations and tower closure, Gros Morne boat-tour details.
- Unverifiable claims (exact drive times, crowd levels, wildlife sightings) were left as advice, not certified facts.
- Remaining: 124 published Canadian places (Waves 2–3).
