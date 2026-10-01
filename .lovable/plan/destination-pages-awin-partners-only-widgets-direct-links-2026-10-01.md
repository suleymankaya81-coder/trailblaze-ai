# Destination pages: Awin partners only (widgets + direct links)

API connections stay for later. Destination (plan) pages will show only brands that are on Awin, using the two methods from your chat:
- **Method 3: direct partner links.** A button sends the visitor to the brand's own page for that destination, and the Awin tracking link records the click.
- **Method 2: ready-made widgets.** A box supplied by the brand that shows live tours and prices on our page.

Brands not on Awin (Hipcamp, Glamping Hub, RVshare, REI, Booking.com and others) are hidden from destination pages. Their records stay saved, so you can bring them back later.

## Which Awin brand goes where

| Page section | Awin brand (ID) | Method |
|---|---|---|
| Stays / "Campgrounds sold out?" box | Campspot (22326), RoverPass (32065) | Link to the destination's search page |
| RV / vanlife stays | Harvest Hosts (111454) | Link |
| RV & car rentals | RentCars (18808), Europcar US, Discover Car Hire | Link with the nearest airport filled in |
| Tours & activities | Viator (11018), GetYourGuide (18925) | Widget for the destination, plus a link if the widget can't load |
| Before you hit the road: insurance | Generali Travel Insurance US (49127) | Link |
| Before you hit the road: eSIM | BNESIM / KnowRoaming US / Strong eSIM | Link |
| Before you hit the road: offline maps | Outdooractive | Link |
| Before you hit the road: car rental | RentCars / Europcar | Link |
| Before you hit the road: travel card, park pass | None on Awin | Travel card card hidden. Park pass keeps the free official NPS link without a partner label |
| Gear (3 items) | Jackery (power stations) | Link. US availability still needs to be confirmed |
| Getting there | Kiwi.com (flights to the nearest airport) | Link |

## How it works for visitors
- Every partner button and widget keeps its "Partner link" label, along with sponsored link marking and bot-filtered click tracking.
- Until Awin approves a brand, its button still works and goes straight to the brand's site, but we earn no commission yet. Commission starts on approval, and no page changes are needed.
- The Viator and GetYourGuide widgets appear only after you paste in the partner/widget ID each brand gives you on approval. Until then, the tours section shows link cards.

## Things you need to do
- Apply on Awin to: Campspot, RoverPass, Harvest Hosts, Viator, GetYourGuide, RentCars, Europcar, Generali, one eSIM brand, Outdooractive, Kiwi.com and Jackery.
- When each brand approves you, send me its widget code or partner ID if it has one.

## Technical details
- New `awin` affiliate adapter: `https://www.awin1.com/cread.php?awinmid={mid}&awinaffid=3100034&clickref={sessionId}&ued={encodedDeepLink}`. The `awinmid` value is stored per offer.
- Migration: add `network` (text, e.g. `awin`) and `network_mid` (int) to `offers`. Insert Awin offers for the 20 published destinations, with deep-link URL templates built from the destination name and airport code, plus global services (`destination_id` null).
- `getDestinationPageData` returns only offers where `network = 'awin'`, plus the NPS park-pass info link, which is non-commissionable.
- Add the new brands to the `PARTNER_LABELS` map in `compliance.ts`.
- New `src/components/destination/PartnerWidget.tsx`: loads the vendor script on the client inside `ClientOnly`, lazy-loads it when it scrolls into view, and falls back to link cards when no widget ID is configured. Widget IDs are kept in public config because they are not secret.
- Record in AGENTS.md: "Destination pages show only Awin-network offers; other networks are stored but filtered out."
