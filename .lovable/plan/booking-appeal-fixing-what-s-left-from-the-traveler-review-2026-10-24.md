# Booking appeal: fixing what's left from the traveler review

## Already live (just confirm it still works)
- American car photos (Malibu sedan, Mazda CX-9 SUV), small © credits, "Est. from" prices, buttons that say what happens next, and the Airport Rentals / Motorhome Republic labels.

## Still to fix
1. **Tour cards (Viator):** add short labels only when Viator itself says they apply to a tour: "Free cancellation" and "Mobile ticket". If Viator doesn't say so, no label.
2. **Lodging decision:** above the stay cards, add one short guide line for each choice: "Stay in the park / Nearby town cabin / RV & camping". Each gets a typical starting price ("Est. from $110/night"), clearly marked as typical.
3. **Harvest Hosts and RV stay cards:** move the dark credit strip off the middle of the photo and use the small © mark in the corner. Show a typical starting price.
4. **Booking order on destination pages:** keep the flow 1 Flight → 2 Car/RV → 3 Stay → 4 Tours. Move the stay section after the car/RV cards, show the flight search as a numbered card instead of a one-line form, and number each section heading.
5. **RV button:** "Find campervans & RVs from $150/day" (uses the typical price, never an exact quote).

## Not included
- Exact live prices for cars and hotels, because the partners don't share that data.
- Labels like "No booking fees" or "Instant confirmation", because we can't confirm them for every partner.

## Check
- Look at Yellowstone, Acadia, California Icons and BHB Fly & Drive on desktop and phone. Add small tests: tour labels appear only when Viator's data says so, and every price shown is marked as typical.

## Technical details
- Viator flags come from `cancellationPolicy` / ticket type in the cached place result (no new API calls).
- Reorder sections in `destinations.$slug.tsx`. Use `PhotoCredit` in HarvestHostsCard and VrboSearchWidget. Prices come from `estimatedFrom`.
