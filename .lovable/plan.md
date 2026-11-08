# New destination page layout (English + German, all 500+ places)

Goal: a visitor sees vehicle/RV and tour options within the first screen, while the route guide ("A little structure. Plenty of freedom.", "Know before you go") stays readable and is placed where it helps the decision. One shared template, so Yellowstone, every other destination and every `/de/destinations/...` page change together.

## Rollout order
1. Build the new layout behind a switch, turned on only for Yellowstone (EN + DE).
2. Check Yellowstone on desktop (1280px) and phone (390px) in both languages.
3. Turn it on for all destinations (one line change), spot-check 6 places (Yellowstone, Acadia, Zion, Moab, Anchorage, a city like San Francisco) in EN + DE.

## New page order (top to bottom)

```text
1. HERO (unchanged photo, breadcrumbs, title)        desktop 420px / phone 300px (was taller)
2. TRIP SNAPSHOT (5 facts, compact)                    ~120px desktop, 2x3 grid on phone
3. STICKY BOOKING BAR                                  56px, sticks under header
   Flights | Vehicle & RV | Stays | Tours | Gear  -> jump links to sections below
4. TWO-UP SHOWCASE  (top of fold, ~440px)
   [ Vehicle & RV  (left, 1/2) ]   [ Top tour  (right, 1/2) ]
   airport code + "Est. from" car    first real Viator listing for this place
   / SUV / RV rows (typical label)    (photo, rating, price from provider)
   button: See vehicles & prices      button: Check availability
   phone: stacked, vehicle first, each card ~360px
5. KNOW BEFORE YOU GO + RESERVATION NOTE              3-col cards desktop, swipe row on phone
   (moved up from inside the itinerary; reservation note box sits first)
6. FLIGHT STRIP (Aviasales cached fare to airport)    existing strip, compact, 1 row
7. ITINERARY "A little structure. Plenty of freedom." existing day-by-day TravelFlow
   with one quiet inline link per day:
   Day 1 -> pick up vehicle, Day 2 -> tours for that stop, last night -> stays
8. ROUTE MAP (existing road trip map)                  300px tall
9. STAYS (Vrbo/hotels/Harvest Hosts)                   existing cards
10. MORE TOURS (rest of Viator listings + tickets)     existing block, step 4
11. BUDGET + PREPARATION side by side (stacked phone)  unchanged rule
12. TRIP ESSENTIALS (gear)                             unchanged
13. PLAN DEEPER guides, similar places, final CTA      unchanged, server-rendered links
```

Removed duplication: the old bottom "Rent before you go" vehicle section becomes a short "All vehicle options" list under the showcase (no second copy lower on the page). Destination answers / Trip radar move into section 5 area or below the itinerary so the fold stays clean.

## Rules kept
- Approved partners only (Webjet: Airport Rentals / Motorhome Republic; Viator direct; Vrbo; Travelpayouts; REI direct); Awin links via the shared builder.
- Prices always labelled "typical / Est. from"; no invented tour or vehicle inventory — if Viator has no matching listing for the place, the right card shows a "Tours near {place}" search link instead of another place's tour.
- No new AI calls per visit; no packing/extra-info panels; no sticky side panels.
- Photo credits stay as small © marks, outside clickable cards.
- Viator content stays in the noindex frame.

## German pages
- Same component, so layout is identical automatically.
- All new fixed wording (bar labels, showcase headings, buttons, inline day links) wrapped for translation and added to the German phrase list; stored German itinerary and "Know before you go" text keep coming from the saved translations.
- Booking bar and inline links point to German page sections; partner links stay the same.
- Scan `/de/destinations/yellowstone` for leftover English after the change.

## Checks before finishing
- Build OK, existing tests pass, add a small test: section order (showcase before itinerary) and "no other place's tour" fallback.
- Playwright screenshots at 1280x1800 and 390x844 for EN + DE Yellowstone: showcase fully visible in first screen on desktop, vehicle card visible in first screen on phone.
- No console errors, no layout overlap with sticky bar, sitemap/JSON-LD unchanged.

## Technical details
- New components in `src/components/destination/`: `BookingBar.tsx`, `TopShowcase.tsx` (VehicleShowcase + TourShowcase), `KnowBeforeYouGo.tsx` (split out of TravelFlow), `DayBookingNudge.tsx`.
- `TourShowcase` uses the existing `/experiences/place/$slug` frame with a `?limit=1&compact=1` mode (same 24h cache, same place matching), reporting its own height.
- `DestinationPageView` gets a `layout` flag from a `NEW_LAYOUT_SLUGS` set (Yellowstone first), then default-on; old order removed once rolled out.
- `TripQuickNav` replaced by `BookingBar` anchors: `#trip-vehicles`, `#trip-flights`, `#stays`, `#trip-tours`, `#trip-gear`.
- Hero height reduced via existing CSS classes in `styles.css`; tokens only, no hard-coded colors.
- AGENTS.md rule updated for the destination section order.
