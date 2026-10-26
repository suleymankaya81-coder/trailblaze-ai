# Destination page redesign (REI style) + overlap fix

Applies to all 500 destination pages through the shared template. Acadia is the review example. Content, partners, prices, and omitted sections stay as agreed (no FAQ, no packing, no arrival notes, no text stay options).

## 0. Fix the overlap right away
Cause: "Your trip budget" is a sticky side panel. When you scroll, it stays fixed and slides over "Before you hit the road" in the same column.
Fix: remove the sticky behavior and move both panels out of the side column (see step 4 below). No floating panels inside stacked columns anywhere on the page.

## 1. Page skeleton (desktop and mobile)
```text
Hero photo (full width) + name + 1-line promise + 2 buttons
Trip snapshot bar (best time · airport · days · budget total)
Sticky section menu (Plan · Map · Book · Tours · Essentials)
-- Plan --------------------------------------------------
Why go / highlights (photo cards)
Day-by-day plan (TravelFlow)
Road trip map
-- Book (steps 1-4) --------------------------------------
Step 1-2  Getting there + vehicles   (one card row)
Step 3    Where to stay              (one card row)
          Budget + Before you hit the road (two equal panels, side by side)
Step 4    Tours & tickets            (one card row)
-- Finish ------------------------------------------------
Curated Trip Essentials (5 cards)
Plan deeper links · Similar destinations · Final call-to-action
```
- Single column everywhere. Side columns are removed; this is what prevents mixing on desktop and mobile.
- Content width 1200px max, side spacing 20px on phone, 32px tablet, 40px desktop.
- Space between major sections: 64px on desktop, 48px on phone. Inside a section: header-to-cards 24px.

## 2. Visual rules (from the REI system already approved)
- Background #F7F6F2; cards white with 1px #E6E4DF border, 12px corners, no heavy shadows (light shadow on hover only).
- Buttons: dark green #1B4431, white text, fully rounded, 44px tall desktop / 48px phone. Secondary: white with green border. No orange buttons.
- Highlight labels (e.g. "Best value", "Inside the park"): mustard #F3D053 with dark text. Warnings in terracotta text only.
- Headings in Fraunces serif: page title 56px desktop / 34px phone; section titles 36px / 26px; card titles 18px / 16px. Body text Inter 16px, small labels 13px.
- Step numbers: green circle 32px with white number, left of section title, plus a one-line helper sentence below.
- Small photos instead of icons in lists (40px rounded squares), as already used.

## 3. Card system (one style for every booking card)
- Photo on top, 4:3 ratio, photo credit (©) in the corner.
- Below: small partner label, title (2 lines max), one line "best for", price line ("From $X/day" or "Est. from $X · typical rate"), button pinned to the bottom so all buttons in a row line up.
- Equal card heights in a row.
- Desktop: 4 cards per row (stays/vehicles), 3 Viator + tour partner cards in a 5-slot row, 5 essentials. Tablet: 2–3 per row. Phone: swipe row, each card 85% width with the next one peeking, thin progress line below.

## 4. Section by section
- Hero: photo 520px desktop / 360px phone, dark gradient at bottom for readable text, name + state, short promise, buttons "Plan my trip" (green) and "See the map" (white).
- Trip snapshot: 4 facts in a white bar overlapping the hero bottom by 32px on desktop; on phone 2×2 grid, no overlap.
- Section menu: sticks under the header, horizontal scroll on phone, active section underlined in green.
- Plan + map: existing content restyled with the card rules; map in a white card with 12px corners, 480px tall desktop / 320px phone.
- Step 1-2 row: flight card, airport car card, motorhome card, sleeps-2 campervan card (4 cards).
- Step 3 row: stay cards incl. Harvest Hosts (with 20% offer inside), Vrbo, Expedia.
- Budget + Before you hit the road: two equal white panels side by side on desktop (50/50), stacked on tablet/phone. Budget shows total in large serif, 6 lines with small photos, "See ways to save" button. Preparation panel keeps its rows (insurance, eSIM, luggage, car rental).
- Step 4: 3 Viator tours (photos only) + Klook/Tiqets/Go City cards in the same card style, with prices.
- Trip Essentials: unchanged content (5 cards), restyled to the shared card.
- Similar destinations + final call-to-action: stacked, similar destinations as a photo card row, then a full-width green call-to-action band.

## 5. Checks before showing you
- Screenshots of Acadia and two other pages (one city, one long-name park) at desktop 1280px, tablet 768px and phone 390px.
- Confirm: no overlapping panels while scrolling, no sideways page scroll on phone, buttons aligned in every row, all links/tracking unchanged.
- Existing tests and build pass.

## Technical details
- `src/routes/destinations.$slug.tsx`: remove the two `lg:grid-cols-[minmax(0,1fr)_330px]` wrappers; drop `lg:sticky lg:top-24` from `TripBudget`; new `BudgetAndPrep` wrapper `grid gap-6 md:grid-cols-2`; remove the separate mobile-only budget summary (budget total already appears in snapshot).
- Move restyled sections into `src/components/destination/*` (per project rule) — e.g. `DestinationHero.tsx`, `BookingSection.tsx`, `BudgetPanel.tsx`, `PrepPanel.tsx`; route only composes them.
- Shared booking card from `src/components/ui-kit` (extend `PlaceCard` with price/partner/cta slots) and `SwipeRow` for phone rows; add tokens only in `src/styles.css` (no hard-coded colors).
- Keep `OfferCta`, `useTrackedRedirect`, Awin/Webjet/Travelpayouts link builders untouched.
- Update the AGENTS.md rule for destination layout (single column, no sticky side panels).
