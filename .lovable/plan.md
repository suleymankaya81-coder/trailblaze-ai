# Live rental search, tracked partner links and Viator listings site-wide

## What you will see
1. **Homepage "Rental ideas" redesigned** in our beige/white/dark-green style:
   - Two tabs: **RV & Campervan** (Motorhome Republic live search form) and **Car Rental** (Airport Rentals live search form). Visitors pick a pickup city and dates and see real prices/availability on the partner site in a new tab.
   - Below: BikesBooking, EconomyBookings and the gear cards stay, restyled to match.
2. **Motorhome Republic becomes a paid partner everywhere**: every Motorhome Republic button (destinations, RV guides, 24 gateway road trips, homepage) carries `affiliate=minialife`, and the "direct, non-affiliate link" wording becomes a normal commission disclosure.
3. **Airport Rentals added** as a car-rental option next to EconomyBookings on destination pages and gateway road trips (tracked with `affiliate=minialife`).
4. **Live Viator tours on every destination page and guide page**: today live Viator listings only appear on the 24 gateway road trips; destination pages, Fly & Drive, RV/Camping, No-Reservation and the other search pages show none. Each gets a "Tours & experiences" block with real Viator listings (photo, price, rating) for that place, hidden if Viator returns nothing.
5. **Full partner check**: an automated test plus a browser crawl over a sample of every page type confirming each button goes to the right partner with our tracking code (Awin 3115962, Viator P00327298, Travelpayouts, Motorhome Republic/Airport Rentals `minialife`, ROCKBROS/WILDGUARDER) and that live blocks load.

## Limits to know
- Live search forms load only on the homepage, not on all 3,000+ pages, to keep pages fast; other pages use tracked buttons.
- Viator rules forbid Google indexing their listings, so the tour block loads in a separate non-indexed frame (same as the gateway road trips). Your own page text stays indexable.
- Viator results are cached ~24h per place to stay within API limits.

## Technical details
- `src/components/home/RentalSearch.tsx`: tabs; inject each partner `searchform.js` on demand (IntersectionObserver), one container id per tab, CSS overrides scoped. Client-only.
- `src/lib/affiliates/webjet.ts`: `motorhomeRepublicLink(path?)`, `airportRentalsLink()`; replace all hard-coded motorhomerepublic URLs (corridorPartners, offers redirect in track.functions, destination cards); update `offers.external_url` rows via migration; compliance PARTNER_LABELS + disclosure page.
- New `src/lib/affiliates/viatorPlace.functions.ts`: freetext search by destination name, verified URLs via `verifiedViatorProductUrl`, cache table `viator_place_cache` (24h, RLS read-only public).
- New noindex route `src/routes/experiences.place.$slug.tsx` embedded via lazy iframe from a shared `ViatorPlaceBlock` used in destination, `$landing`, fly-and-drive, rv-camping, no-reservation pages. Excluded from sitemap; robots meta noindex.
- Tests: link builders (affiliate params), Viator URL validation; Playwright crawl script over sample URLs per page type reporting link targets and live block status.
- AGENTS.md: Motorhome Republic/Airport Rentals are Webjet affiliate links built by one module; live Viator blocks use per-place cached noindex frames.
