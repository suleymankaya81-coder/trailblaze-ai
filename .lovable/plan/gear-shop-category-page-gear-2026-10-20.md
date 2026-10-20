# Gear Shop category page (/gear)

Build the page shown in the uploaded mockup, section by section in the same order and layout. Green remains the main color; warm accents (sand/amber, clay, sky blue) break up the page.

## Section order (matches mockup)

1. **Header** – "Gear Shop" menu item added and underlined as active (also in footer).
2. **Hero** (full width photo, dark overlay on left)
   - Eyebrow: OUTDOOR GEAR & ACCESSORIES
   - H1: Gear Shop
   - Sub: The right gear makes every adventure better.
   - Body: From bikepacking essentials to everyday cycling gear, explore our handpicked recommendations from trusted brands like ROCKBROS. Get ready for your next journey.
   - 3 trust items with icons and dividers: Quality Gear / Trusted Brands · Adventure Ready / For Every Terrain · Fast & Easy / Shop Direct Links
   - Handwritten overlay on right: "Better Gear, Bigger Adventures" (handwriting font, desktop only).
3. **Shop by Activity** – eyebrow, H2 "Find the Gear for Your Next Adventure", subline, "View All Gear Categories →" right. 4 photo cards in a row (2×2 on tablet, swipe on mobile): Bikepacking, Cycling Essentials, Repair & Safety, Road Trip Cycling, each with icon, title, one-liner and round arrow button at the bottom over a dark gradient.
4. **Popular Gear Picks** – eyebrow FEATURED PRODUCTS, "View All Products →". 6 white product cards in one row (3 on tablet, swipe on mobile): colored category badge, product photo, name, price, dark-green "View on ROCKBROS →" button.
5. **Why Choose ROCKBROS?** – split block: left photo with handwritten "Right Gear, Better Rides"; right pale panel with text, 4 icon features (Durable & Reliable, Great Value, Worldwide Shipping, Trusted by Cyclists & Adventurers) and "Explore ROCKBROS Gear →" button.
6. **Expert Guides & Buying Advice** – dark-green band, 4 guide cards with small badge (BUYING GUIDE / TRAVEL GUIDE), title, subline and arrow.
7. Short affiliate disclosure line, then **Footer**.

## Color variety (not only green)
- Category badges: Bikepacking = forest green, Cycling Essentials = sky blue, Repair & Safety = clay/terracotta, Road Trip = amber.
- Activity card icons/arrows tinted with the same category colors.
- "Why Choose" panel on warm sand instead of mint; feature icons alternate amber and green.
- Guide badges: Buying Guide amber, Travel Guide sky blue.
- Main buttons stay dark green (no orange buttons, per site rule).

## Honesty adjustments to the mockup
- **No star ratings or review counts** – the ROCKBROS feed has none; inventing them is misleading. Cards show price from the catalog plus "Catalog price, checked Oct 19".
- Products and photos come from the real ROCKBROS catalog; mockup items not in the catalog (e.g. helmet, sunglasses) are swapped for the closest real products.
- "Worldwide Shipping" only kept if the merchant states it; otherwise replaced with "Wide Range".
- Guides: only "7 Bikepacking Essentials" exists today; the other three cards show "Coming soon" (not linked) until those pages are built, or link to existing road-trip guides for the travel card.
- Activity "View all" links go to filtered anchors on the same page until category pages exist.

## Images
- Hero, 4 activity photos, "Why ROCKBROS" photo, 3 guide covers: generated once, labelled illustrative where people/products are implied. Product photos stay merchant images.

## Technical details
- New route `src/routes/gear.index.tsx` with own head() (title, description, og, canonical, ItemList JSON-LD of the 6 products).
- New components in `src/components/gear/`: `GearHero`, `ActivityCards`, `ProductPickCard`, `WhyRockbros`, `GuideCards`; selection data in `src/lib/data/gearShop.ts` reusing `gearProducts`/`gearShopLink` (buildAwinLink, advertiser 58007, publisher 3115962, sponsored nofollow, new tab).
- New tokens in `src/styles.css`: `--sky`, `--clay`, `--amber`, `--sand-warm`; handwriting font via `<link>` in `__root.tsx`.
- Header/Footer gain "Gear Shop" link; add `/gear` to the pages sitemap.
- Verify with Playwright at desktop and mobile widths; add a small test that every pick uses buildAwinLink and the correct IDs.
