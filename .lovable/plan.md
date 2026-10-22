# Gear Shop: real ROCKBROS product pages for every category

## What changes
- Each category card under "Shop by Category" (Camping, Hiking, Cycling, Lights & Power, Apparel, Eyewear & Gloves, Travel & Moto Bags) opens its own page: `/gear/category/camping`, `/gear/category/cycling`, and so on. "Coming soon" disappears from these cards. Optics & Night Vision keeps the WILDGUARDER section.
- Each category page shows real ROCKBROS product cards from the stored ROCKBROS product list: product photo, name, current price (and a "was" price when it is on sale), and an in-stock label. Clicking a card opens that exact product on the ROCKBROS store through our tracked link, in a new tab.
- Page layout follows the Gear Shop look: off-white background, white cards, dark-green buttons, colored category badge. Short intro, sort options (Featured, Price low to high, Price high to low), a grid of 24 products with a "Show more" button, links to the matching buying guides, and the affiliate notice with the price-check date.
- Phones: 2 cards per row; desktop: 4 per row.
- The item counts on the cards match the number of products actually shown in each category.

## Honesty rules
- Only products that are in stock, have a photo and a price. No ratings, reviews or "tested" claims.
- Prices say "Price as of {date}, may change".
- Product pages are not shopping-cart pages; each card clearly goes to ROCKBROS.

## Technical details
- Extend `scripts/content-pipeline/import-rockbros-feed.py` (or a small companion script) to write one compact file per category, e.g. `src/data/gear-categories/{key}.json`, with model id, name, image, price, list price and the variant `awin_link`. Classification uses the same keyword rules that produced the current counts, so each product appears in one category. The full 6 MB catalog stays out of the app.
- Product images: use the feed's image URLs directly (ROCKBROS CDN), lazy-loaded, with fixed aspect ratio; drop products whose image is missing.
- New route `src/routes/gear.category.$key.tsx`: loader imports the category JSON; unknown key throws notFound. Own head() with title, description, canonical, og tags; ItemList JSON-LD with product names and URLs only (no price/availability claims beyond the visible ones).
- Links: keep the feed's Awin link (advertiser 58007, publisher 3115962); if the stored link is not already in the buildAwinLink format, build it with `buildAwinLink` and add a per-category clickref. `rel="sponsored nofollow noopener"`.
- `gearCategories.ts`: set `href` to the new pages and derive `items` from the generated files.
- Add the category pages to the pages child sitemap.
- Tests: category files contain only in-stock items with image + price; every link uses publisher 3115962 and advertiser 58007; unknown category returns 404.
- Check desktop and mobile with Playwright.
