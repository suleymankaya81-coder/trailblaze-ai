# International Viator repair — 2026-11-21

## Changes
- Shared country names for all 40 countries in API queries and manually tracked search links; no raw ISO suffix.
- Strip administrative designations, retain geographic nouns and require contiguous place names rather than scattered words. Explicit Alto Garda → Lake Garda area mapping is labelled Nearby, not an in-park listing.
- Expire caches predating the matching revision on next visit, including empty results, without deleting rows. Preserve full provider descriptions for revalidation instead of using truncated display summaries. Never persist failed/malformed provider responses.
- Accept destination slugs up to the existing 100-character destination limit.
- Reject verified false positives for Black Forest/Mauritius, Swiss National Park/general Swiss tours, Archipelago National Park/Stockholm, Calanques/Esterel, and Labrador/Ontario fallback.

## Evidence and limits
- 76 tests pass across six affiliate test files; preview build OK.
- Browser-loaded one published destination frame per country (40/40 HTTP 200). Initial sample yielded cards on 21 places; three false-positive samples subsequently corrected and rechecked as empty. Some other samples have no matching listing. A successful frame status does not imply a tour exists.
- Real provider cards, loaded photographs and approved API-issued links verified on Alto Garda EN/DE, Calanques and Abel Tasman destination pages. German Abel Tasman checked at 390px without horizontal overflow; no page runtime errors.
- Five additional frames: Alto Garda, Lake Garda, Black Forest, Loch Ness and Dolomites show real results. Black Forest no longer displays Mauritius/Quebec tours; Calanques no longer displays Esterel tours.
- A real View on Viator click opened www.viator.com with pid=P00327298, mcid=42383, medium=api, api_version=2.0 intact. The external site presents its access protection to automated browsers; booking completion/partner-dashboard click credit is NOT verified.
- Shared guide/home/road-trip/RV/no-reservation consumers traced to the same repaired function. Attempted Lake Garda things-to-do guide did not expose a frame; no claim of complete end-to-end guide verification or every destination verified.
- Published domain has not been redeployed in this turn; owner publication is required. Old-cache rows are invalidated lazily rather than initiating thousands of provider calls.

## Viator documentation
Current v2 reference: https://docs.viator.com/partner-api/technical/
- Basic affiliate access includes /search/freetext, /products/search and /products/{product-code}; bulk/modified-since ingestion is restricted to higher tiers. Search works through the existing production integration; this is not evidence of full-access account entitlements. Earlier claim of full global API access was too broad.
- API-issued productUrl attribution remains untouched. Search links use the confirmed manual-link account.
- Unique content must not be indexed. Existing client-loaded, noindexed experience frames are preserved, separate from original destination guidance; no Offer/availability guarantee introduced.
- /destinations provides parent identifiers for provider-geography resolution. This implementation still uses conservative provider-text matching, not a complete provider geography hierarchy; future aliases require specific review rather than automatically accepting broad regions.

No unrelated partners, security findings, destination content or database schema changed.

## Follow-up implementation and checks — 11:35 UTC
- Existing international identity/query/cache fixes were already present at the start of this follow-up. A fresh browser check confirms the **published** Alto Garda experience document now displays three real provider products with the approved API attribution. The dashboard screenshot alone does not establish API access tier or why only two referrals were recorded.
- `src/lib/affiliates/viatorPlace.functions.ts`: every known-place response now includes the shared, country-aware, tracked search URL, including fresh empty caches and handled provider failures. No cache rows were deleted and no destination rows were modified.
- `src/routes/experiences.place.$slug.tsx`: empty results retain a Search on Viator handoff without inventing a tour; the frame reports its real fallback height and answers same-origin parent measurement requests.
- `src/components/destination/ViatorPlaceBlock.tsx`: removed iframe-body polling, which could preserve a large blank viewport and miss the empty state; parent/child measurement handshake now uses actual content height, while origin/source/status checks remain intact.
- Browser verification: 16 EN/DE destination pages across Italy, Germany, France, UK, New Zealand, Australia, Switzerland and USA return 200 and retain approved tracked booking links. Six country samples have real products; Abercrombie River and Swiss National Park have search-only handoffs, not claimed inventory.
- Real Fly & Drive and no-reservation guides for Alto Garda show three product links each. Swiss National Park's no-reservation guide retains a Switzerland-specific search link and a compact measured frame (48–150px), with the correct empty-state message. German Alto Garda checked at 390px without horizontal overflow; no page runtime errors.
- Actual View on Viator click opens `www.viator.com` with `pid=P00327298`, `mcid=42383`, `medium=api`, `api_version=2.0`. No purchase or dashboard commission/referral recording was verified.
- The 76 existing affiliate regression tests pass. This is representative end-to-end verification, **not** verification of all 3,231 destinations or every SEO guide. These follow-up changes require publication; previously deployed matching fixes are live.