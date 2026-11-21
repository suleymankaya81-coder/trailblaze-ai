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