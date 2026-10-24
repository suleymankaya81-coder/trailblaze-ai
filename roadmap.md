## October 24 selected homepage collage correction
- [x] Replace the incorrectly applied cinematic opening with the selected left-copy / three-photo staggered collage and working search; retain all lower homepage sections.
- [ ] Verify collage image loading, search navigation and layout at desktop, current preview size and phone size.

## October 24 photo, contact and publishing request
- [x] Replace all eight city covers with exact-place licensed Flickr/Pexels scenery; verify loaded photos/credits on desktop and phone, no overflow/errors. Sources: scripts/audits/city-cover-sources-2026-10-24.json. Rejected Sacramento candidate with conflicting location metadata.
- [x] Replace incorrect public email with info@minialife.com and remove the owner's personal name from public content; repository and all application database text fields checked.
- [x] Validate and verify the current contact form's mail-app handoff at desktop/phone sizes; required fields, limits, safe encoding and explicit not-sent notice; four tests pass.
- [ ] Enable direct contact email delivery; blocker: no email sender domain configured. Owner must complete the email setup dialog; current validated mail-app handoff remains available.
- [x] Security check completed with no critical findings; 150 tests passed; request publication after final photo checks.

## October 24 full implementation audit
- [x] Audit shared templates and all 3,525 sitemap content URLs: all 200, required metadata present; corrected two duplicate-title pairs and read changes back. Fixed destination planning order/tours anchor, inactive save/view-all controls, shared image failure handling, Viator ratings/resize/error states, subject-mismatched Tiqets photo, estimate labels, related cards, mobile footer resize and About/static presentation.
- [x] Verify 15 representative pages at 1280/390px (30 views), destination search→Acadia, real Yellowstone Viator click, all travel-family four-product rows/swipe, successful-empty and simulated frame-error states, section order and 145 tests. No observed overflow/page errors; build OK. Report: scripts/audits/implementation-audit-2026-10-24.md.
- [x] Record remaining external limitations: all eight scenic-city replacement photos remain incomplete (Wikimedia downloads return 403; only five locations had verified candidates). Removed wrong-country/state Branson/Ely gallery photos; retained correct existing covers. Live rental forms and full independent factual/photo-location verification remain unverified; no publication.
- [x] Eight scenic-city replacements completed using verified alternative sources in the photo/contact request above.

## October 24 REI-style visual rebuild (step by step, owner approves each step)
- [x] 0. Shared design system: stone background, #1B4431 green, mustard/terracotta badges, serif headings, card kit, phone swipe rows with progress line, photo thumbnails instead of icons.
- [x] 1. Homepage: hero, What is MiniaLife + 3 steps, 5 photo start squares, 1+4 places, 4 loops, rentals, 3 stay types, 3 green guide cards, 4 trip essentials, Why MiniaLife, collapsible phone footer.
- [x] 2. Destination list, Road Trips, Gateway, Trip Guides and the 3 guide lists use the new photo cards; homepage car cards removed.
- [x] 3. Destination pages: repeated facts removed, large booking buttons, serif card titles, no repeated stay photos, scenic city covers.
- [x] Requested before step 4: merged ticket partners into The moments you came for, removed illustrative Viator activity offers; individually called all 500 place functions. 339 retain provider-text-matched results, 161 have no matching results, zero request errors. Reject unrelated destination results; report in scripts/audits/viator-destinations-2026-10-24.json. This is automated relevance screening, not manual location/meeting-point verification.
- [x] 4. Guide pages (Fly & Drive, RV, No Reservation, loops, gateways, search guides): shared photo snapshots/booking steps, serif heroes, square stop thumbnails, overseas-note photos, collapsed FAQs, mobile swipe/progress and auto-height provider frames. Eight representative pages checked at desktop/phone sizes, no page errors/overflow; actual Viator click and mobile swipe verified, 28 tests pass. Steps 5–6 remain for owner review; no publishing.
- [x] 5. About and static pages: shared unframed reading layout, serif scale, photo thumbnails/three steps; removed obsolete packing and unsupported full-verification claims; updated disclosure partnerships.
- [x] 6. Final desktop/phone checks, all sitemap URLs and 145 tests; limitations recorded in the implementation audit above.

## October 24 REI-inspired site-wide presentation (in order)
- [x] 1. Homepage: explain MiniaLife, add three-step How it works band and five clear discovery entries immediately after the cover.
- [x] 2. Card standards: 4:3 destination/route photos, square gear photos, data-backed facts, honest prices, consistent action hierarchy and compact credits; preserve Gear Shop design.
- [x] 3. Travel pages: shared Trip Snapshot/quick navigation across destination, Fly & Drive, RV, no-reservation, loops, gateways and search guides; flight → vehicle → stay → tours → gear booking sequence, without invented vehicle/permit claims.
- [x] 4. Phone experience: 85%-width swipe rows, 48px touch controls and compact destination/hub filter dialogs.
- [x] 5. Verified seven representative travel families on desktop/phone, all four quick-nav anchors, four loaded gear images and swipe movement, homepage → airport routes navigation and destination search filter; 44 tests passed. Head metadata audited; provider quote forms remain externally blocked as recorded below. No publishing performed.

## October 24 contextual trip essentials
- [x] Select real approved-partner ROCKBROS products and match exactly four distinct items to destination/route context; bike-only repair/mounting equipment is restricted to cycling trips. Prices and stock are recorded feed values, not live guarantees.
- [x] Add page-matched horizontal product cards after planning content on destination, Fly & Drive, RV/camping, no-reservation, loop, gateway and existing search-guide pages; preserve Gear Shop.
- [x] Verify 13 tests, all four photos on 11 representative travel pages, an actual tracked product-store click and phone next-card interaction with no page errors; build OK.

## October 23 positioning-led competitor analysis and SEO
- [x] Verify closest business substitutes and actual search competitors; save a sourced report and keyword-to-existing-page priorities (marketing/minialife-rakip-seo-2026-10-23_v2.md).
- [x] Improve existing homepage and gateway/hub metadata and navigation; add visible-order gateway structured data; no new satellite guides.
- [x] Verify 11 representative pages, 30 tests, homepage-to-SFO navigation and phone search; read GSC through the selected https://minialife.com/ property (6 clicks/29 impressions; four priority routes not indexed). Preview build OK; publishing requires the owner's request.

## October 23 rental partner cleanup
- [x] Isolate conflicting rental widget scripts, strip malformed heading fragments, and show a tracked search button instead of empty fields.
- [ ] Verify provider-hosted live forms with real location/date input: external widget fields do not load in the preview; provider script delivery must be available before this can be verified.
- [x] Remove all homepage cards listed in the attachment.
- [x] Replace other rental providers in shared destination/guide paths with Motorhome Republic and two Airport Rentals car/SUV options; 504 stored car/service offers updated; seven representative page types return 200 with tracked links and loaded car/SUV photos; direct Airport Rentals click verified.

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
- [x] Add a curated public-only llms.txt and explicit OAI-SearchBot/PerplexityBot access while retaining affiliate-tracking exclusions; verify both files return 200. Existing training-bot policy unchanged; llms.txt is not a ranking guarantee.
- [x] Model visible daily plans as ordered TouristTrip structured data with BreadcrumbList; remove inferred inventory availability and emit real JSON-LD scripts. Seven related tests pass.
- [x] Add three sourced direct answers each for Yellowstone, Grand Canyon and Moab plus matching dated reservation overrides; verify all nine answers and trip stop order in SSR HTML, desktop and phone. Correct Arches' 2026 entry rule from NPS. No claim of external AI citations or full-site fact verification.

## Fly & Drive (pSEO)
- [x] Step 1: template + 3 noindex pilots (Yellowstone, Zion, Moab)
- [x] Step 2: open all 440 + sitemap; illustrated booking cards, first-night lodging limited to Expedia and Vrbo.
- [x] Step 3: verified all 440 preview pages' unique titles, metadata, canonical URLs, indexability, structured data and visible FAQs against the sitemap; added destination-guide links and shared reviewed reservation notes. Yellowstone navigation verified; 17 tests passed, build OK.
- [ ] Fly & Drive publish + GSC sitemap resubmit: deferred by owner; wait for explicit publishing request.

## Programmatic SEO Phase B (no-reservation, loops, RV/camping)
- [x] Step 1: noindex pilots (3 per family)
- [x] Step 2: open all eligible pages, internal links, child sitemaps
- [x] Step 3: SEO validation pass (584 pages OK)

## ROCKBROS sample gear guide and site palette
- [x] Build /gear/7-bikepacking-essentials with seven actual catalog products, mobile swipeable recommendations, comparison and FAQs.
- [x] Apply beige backgrounds, white cards and dark-green CTAs site-wide; add header/footer guide links.
- [x] Verify all seven product images, catalog prices, publisher/advertiser IDs, new-tab tracking, desktop/mobile layout, previous/next controls and FAQ interaction; five tests pass, build OK. Publishing remains deferred.

## Direct Viator activity integration
- [x] Record confirmed direct affiliate parameters and review the supplied API licence conditions and sandbox/production status.
- [x] Verify securely saved VIATOR_API_KEY against production search: real products and account-attributed links return 200. Bulk product access returns 403; use the permitted search endpoint.
- [ ] Replace generic destination activity recommendations site-wide; outside the approved Grand Circle pilot scope, awaiting a separate rollout request.

## Grand Circle corridor partnerships
- [x] Add compact flight, Motorhome Republic, EconomyBookings and Airalo booking links below the map.
- [x] Add three production Viator products for Page, Zion and Las Vegas, with provider photos, current starting prices, ratings and API-issued direct tracking.
- [x] Verify three real listings, loaded images, direct booking click, noindex experience document and desktop/mobile layout; nine attribution tests pass, build OK. Pilot remains unpublished and noindex.
## New destinations (66 total, 6 waves) — plan 2026-10-22
- [x] Wave 1: 12 gateway cities published (San Francisco, Los Angeles, Miami, Orlando, Denver, Boston, Honolulu, Phoenix, Tucson, Salt Lake City, Portland, Williams) with 48 guides
- [x] Wave 2: 12 entry cities published (New York City, Philadelphia, Atlanta, Nashville, Houston, Dallas–Fort Worth, Sacramento, Charlotte, Minneapolis, Pittsburgh, San Antonio, St. Louis; Seward/Fairbanks already existed) with 48 guides
- [x] Waves 3–5: 36 places published in one run without search guides (20 planned names already existed and were replaced with new towns); all 36 pages verified
- [ ] Wave 6: finish 6 catalog places (Badlands, Beartooth, Blue Ridge, Jean Lafitte, Lost Maples, Tallgrass Prairie)
