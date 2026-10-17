- [x] Provide covers on all 80 published search guides: retain 32 credited dedicated covers and reuse the matching destination's credited hero on the remaining 48.
- [x] Remove misleading duplicated destination-cover images from partner cards on guide and destination pages.
- [x] Verify all 80 guides' metadata, image fallback, and desktop/phone layout; published Lovable badge was confirmed hidden.
- [x] Restore distinct credited illustrative images to stay, rental, activity, gear and information cards on all 20 published destination pages; verify RVshare/REI labels and desktop/mobile rendering. Brand-specific listing photos are not available; these images are illustrative, not actual partner inventory.
## Awin attribution correction
- [x] Correct publisher identity and centralize Harvest Hosts links; 11 affiliate tests passed and the Yellowstone Harvest Hosts link uses the corrected publisher in preview.
## Service card photography
- [x] Consolidate preparation partners into Before you hit the road, replace offline maps with luggage storage and link Car Rental to EconomyBookings; verified all four partner links in the preview.
- [x] Add real credited photos to Travelpayouts cards and BikesBooking/EconomyBookings to homepage rentals.
- [x] Audit shared card photo matching, add 50 licensed Commons choices and reduce repeats across destination/guide/home cards; photos remain illustrative, not verified partner inventory.
- [x] Test image selection and verify desktop/mobile card images and partner links on homepage, Grand Teton, Yosemite, Moab and a search guide.
## Tier 1 rollout (187 places, waves)
- [x] Wave 1: 27 national parks published with 108 guides (sitemap 241)
- [ ] Trip budget panel shows "not available" on destination pages (pre-existing, also on the original 20)
- [x] Remove packing and extra-information panels from all destination plans; stop generating packing text and toolkit photos in future waves.
- [x] Wave 2: 21 places published with 84 guides (sitemap 346)
- [x] Wave 2 held places published via gateway-town anchors (Henderson LA, Red Lodge MT, Blowing Rock NC); sitemap 1026
- [x] Wave 3: collect and cache credited photos, coordinates, nearest-airport drives, and route lines for all 133 new Tier 1 places; verify unique cover photos.
- [x] Wave 3 first release: 5 complete places published (Bozeman, Breckenridge, Broken Bow Lake, Bryce Canyon Region, Buffalo National River), with 20 indexable guides; verify preview pages and sitemap.
- [x] Wave 3 batch 2: 25 places published (incl. Buena Vista), 100 guides, all 600+ words (avg 789), sitemap 496.
- [x] Wave 3 batch 3: 59 places published, 236 guides (min 732, avg 787 words), sitemap 791.
- [x] Wave 3 remaining: 44 places published with Gemini 3 Flash, 176 guides (min 786, avg 931 words), sitemap 1011.
## Tier 2 (200 places, Gemini)
- [x] Tier 2: 191 places published with 764 guides (min 773, avg 944 words)
- [x] 6 held Tier 2 places published with alternative Commons photos (Helen, Allagash, Natchez Trace, Maah Daah Hey, Chequamegon-Nicolet, Blue Ridge Foothills)
- [ ] Lost Maples held: no relevant licensed landscape photos on Commons
- [ ] Jean Lafitte, Tallgrass Prairie held: cover photo already used by another place (not requested)
- [x] Tier 2 SEO: guide titles ≤60 / descriptions ≤160 chars (auto-trimmed on insert); destination descriptions include season + guide topics; sitemap auto-lists published guides
- [x] Tier 3: 39 places + 156 guides published (min 774 words); sitemap 2206
## Approved Pinterest rollout
- [x] Verified official RSS allowance: up to 200/day; implemented account-wide UTC releases with tests and retry-safe scheduling.
- [x] Rendered/uploaded 2,139 branded 1000×1500 JPEG pins; tested 2,200 names, RSS/copy and UTC daily limits; three stored images open publicly. Five satellite-image cards excluded.
- [ ] Remaining 56 cards blocked by unavailable/insufficient-resolution source photographs; see scripts/content-pipeline/pin-photo-blockers.json. Do not publish blurry substitutes.
- [ ] Publish the approved RSS updates: current live feed still returns old items; preview honors releases from October 17 UTC. Publishing requires the owner's request.
## Destination-specific travel content
- [x] Prepare reservation notes and stored daily itineraries/local tips for all 446 destinations, with source links, database lease and credit/policy pause guard; 1,350 daily plans and 2,230 tips.
- [x] Replace generic day flow/field tips with stored local content; add 633 source-coordinate sightseeing markers across 324 destinations without changing airport-drive geometry. No guessed markers for unmatched places.
- [x] Validate all stored structures and sample Yellowstone, Acadia, Adirondacks, Zion and Florida Keys pages; phone layout, downloaded trip and marker popup verified. Future releases require local travel content. Full independent factual review of every generated sentence is not claimed.
## Independent destination content review
- [x] Visit all 440 published destinations: all render 3–4 day plans with no page errors; recheck every map using successful terrain-tile responses after fixing worker loading. Catalog-only pages cannot be visited publicly.
- [x] Read all 446 cached travel texts; apply 148 distinct field corrections across 96 destinations with a dated source ledger. Read back 146 public field changes successfully; two catalog-only Tallgrass Prairie fields checked through the database.
- [x] Screen all 631 public marker records; exclude 14 wrong-identity and 33 unverified-location candidates and correct two official coordinates. Remaining 586 stored markers are not all independently coordinate-verified.
- [ ] Complete claim-by-claim independent verification for every remaining sentence and every retained marker. Evidence gap: external source verification currently covers targeted findings, not every assertion; prose reading, page visits and working maps do not establish factual accuracy.
## AI search readiness
- [ ] Add a public-only llms.txt and explicit search-crawler access without permitting affiliate tracking paths.
- [ ] Model visible daily plans as TouristTrip structured data, without unsupported availability claims.
- [ ] Add sourced direct answers for Yellowstone, Grand Canyon and Moab; verify rendered content and structured data.
