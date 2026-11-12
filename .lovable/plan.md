# Motorhome Republic Black Friday 2026 on the site

## What the campaign is (from Tim's email + the spreadsheet)
- Sale live now until 2 Dec 2026, 11:59pm NZDT (= 2 Dec, 10:59 UTC). Lead message: "Save up to 35% off motorhome rentals" (Cruise America US, Cruise Canada).
- Each deal has its own page; we add our affiliate tag to it. Confirmed example: Cruise America Black Friday page.
- US/Canada deals worth naming (only these, all "selected dates, T&Cs apply"):
  - Cruise America / Cruise Canada: 35% off, travel to Oct 2028
  - Mighty Campers, Road Bear, El Monte RV (US): 30% off for trips until 25 Mar 2027, 20% off Apr 2027 onwards (from 16 Nov)
  - Native Campervans: 20–30% off (7–21 day minimum)
  - CanaDream: 20% off (from 16 Nov); Fraserway & Four Seasons: $200 grocery voucher (2027 trips)
- Car rental (Airport Rentals) deals: not yet — start next Wednesday; left out until Tim sends them.

## Where it appears
1. Homepage rentals band (as planned): a campaign card using the 1200x800 creative, "Up to 35% off motorhome rentals — ends 2 Dec", a "See Black Friday RV deals" button to the Cruise America deal page, plus a short line of the other US/Canada deals.
2. Destination pages (top vehicle cards): small "Black Friday: up to 35% off" tag on the RV / motorhome option, linking to the deal page.
3. RV & camping guides, airport road-trip booking cards and Trip Builder RV links: the same small tag; links switch to the deal page during the sale.
4. German pages get the same, with German wording.
- Everything disappears automatically after 2 Dec 10:59 UTC and links go back to the normal Motorhome Republic pages — no manual removal needed.
- Small print shown once next to the main card: "Selected travel dates, providers and T&Cs apply. Deals range from 5–35% off."
- Button stays dark green (site colours); the orange belongs only to Motorhome Republic's own image.

## Extra (outside the site)
- The 1080x1080 and 1080x1920 images saved for Pinterest/social use; optional Pinterest pin pointing to the homepage campaign card.

## Technical details
- One campaign config (start/end UTC, headline, deal URLs, creative asset) next to the Webjet link builder; all deal links built via the existing Webjet helper so the `affiliate=minialife` tag is always added.
- A shared `isCampaignLive(now)` check plus a small shared badge component used by RentalsFeature, TopShowcase, CorridorBookings, rv-camping cards and TripBuilder.
- Creatives uploaded as hosted assets (not copied into the code).
- Canada deal page URL: use Cruise Canada's Black Friday page if found live on Motorhome Republic; otherwise the Canada listing page with our tag.
- Tests: link carries the affiliate tag; campaign shows on 12 Nov and is hidden after 2 Dec 10:59 UTC.
- Update the saved campaign note with the dates, lead message and that car rental deals start next Wednesday.
