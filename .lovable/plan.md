# Day route links, GPX download and a lightweight Trip Builder

No accounts. No paid map or routing services. Everything runs from data already stored for each place.

## Step 1 — "Open in Google Maps" + "Download GPX" per day

What visitors see: under each itinerary day (destination pages, road-trip loops, airport road trips), two small buttons: **Open day in Google Maps** and **Download GPX**. One more pair at the top of the itinerary for the whole trip.

How it works
- Google Maps uses the free public link format (`google.com/maps/dir/?api=1&origin=…&destination=…&waypoints=…&travelmode=driving`). No API key, no cost.
- Day start = the day's `start`, then its 2-3 stops. Each stop is sent as coordinates when we have them (from the plan's verified map markers), otherwise as "Stop name, Place, State" text.
- GPX is generated in the browser from the same coordinates (waypoints + the precomputed route line we already ship for the map). No server work, nothing stored.
- Road-trip loops use stop destinations' coordinates in order, including the airport return.

Problems anticipated and how we handle them
- **Stops have no coordinates of their own** (only names; coordinates live in separate markers). We match stop names to markers with a normalized name match; unmatched stops fall back to text with place + state so Google does not jump to a same-named place in another state.
- **GPX needs real coordinates**: the GPX button only appears when every stop of that day has coordinates; never invent points. A test enforces this.
- **Google limit**: max ~9 waypoints. Days have ≤4 points; whole-trip link is capped, longer loops split into "Part 1 / Part 2".
- **Mobile**: the link opens the Google Maps app automatically on phones; GPX downloads as a file (iOS opens it in Files/compatible apps).
- **German pages**: button text via the existing translation phrases; links stay the same.
- **Search engines**: links are `rel="nofollow"` and open in a new tab; GPX is a client action, not a crawlable URL, so no new thin pages.
- **Old/incomplete plans** without days: buttons simply don't render.

## Step 2 — Trip Builder (browser only)

What visitors see: a "Customize this trip" button on each itinerary opens a panel where they can:
- drag stops into a new order or move a stop to another day, remove stops, add stops from this place's verified marker list,
- change trip length (3-4 days),
- see the booking panel update live: vehicle (Motorhome Republic / Airport Rentals), campsites near the current night's stop (Campspot, RoverPass, Harvest Hosts), tours (Viator) — all via existing tracked partner links,
- get updated Google Maps / GPX links for their edited version,
- share their version by copying a link.

How it works
- New page `/trip-builder/$slug` (noindex, excluded from sitemaps) plus German `/de/trip-builder/$slug`.
- State lives in the address (compact encoded stop list) + saved in the browser so a refresh keeps edits. No database, no login.
- Campsite links are built from the overnight stop's coordinates/name using existing shared affiliate builders (`buildAwinLink` for Campspot/RoverPass/Harvest Hosts), so attribution stays correct.
- Drag-and-drop with a small accessible library (keyboard + touch support), with up/down buttons as fallback.

Problems anticipated
- **Hydration errors**: browser-saved edits are read only after the page loads, never during server render.
- **Broken/tampered shared links**: decoded state is validated; unknown stops are dropped and we fall back to the original plan.
- **Duplicate content**: builder pages are noindex and point canonical to the destination page.
- **Distances/times**: we do not calculate live driving times (that would need paid routing). We show the stored driving notes and a straight-line estimate clearly labelled "approx.".
- **Partner prices**: no invented prices; only the existing "typical from" labels.
- **Performance**: builder code loads only on the builder page, not on every destination page.

## Account / membership
Deferred, as agreed.

## Tests
- Google Maps link: correct order, encoding, waypoint cap/split.
- GPX: valid file, only real coordinates, button hidden when any coordinate is missing.
- Stop-to-marker matching, including same-name places in different states.
- Builder: shared-link decoding rejects invalid data; Campspot/RoverPass links carry publisher 3115962.

## Technical details
- New shared module `src/lib/routes/dayRoute.ts` (resolve day points, build Maps URL, build GPX string) used by TravelFlow, loop and corridor pages.
- New `DayRouteActions` component in the ui-kit, reused everywhere.
- Builder: `src/routes/trip-builder.$slug.tsx`, `src/routes/de.trip-builder.$slug.tsx`, components in `src/components/trip-builder/`; loader reuses existing destination page data.
- Add AGENTS.md rule: route exports are built client-side from stored coordinates only; builder state is URL/browser-only and noindex.

Order: Step 1 first (ship + check on Yellowstone EN/DE, phone and desktop), then Step 2.
