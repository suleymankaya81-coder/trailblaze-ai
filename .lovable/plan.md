## Minialife V2 — Outdoor Travel Discovery Platform

A premium destination-first travel platform (Airbnb × Hipcamp × Roadtrippers feel) covering camping, glamping, RV/campervan, tiny houses, cabins, road trips and national parks. AI works invisibly in the background to enrich a destination template — the user just types a place or trip idea and gets a complete, beautiful guide.

---

### Scope of this build (V1 of V2)

This first pass ships the **two flagship surfaces** end-to-end with real content and a complete design system. Deeper functionality (real bookings, auth, saved trips, affiliate tracking) is intentionally deferred.

**In scope now:**
1. Full design system overhaul (sage/forest/sand/beige earth tones, luxury travel feel)
2. Homepage with all 9 sections
3. Destination output page with all 9 sections, populated from a destination template + AI enrichment
4. Curated destination dataset (Yellowstone, Yosemite, Grand Canyon, Lake Tahoe, Moab, Glacier, plus trip-style entries like "Glamping Weekend", "RV Adventure")
5. Real Unsplash cinematic photography throughout
6. Search → instant results (no onboarding flow)
7. AI enhancement via Lovable AI Gateway (Gemini Flash) for the destination summary, insights, packing checklist and budget — runs server-side, results cached per destination

**Deferred (future passes):**
- Real booking integrations (CTAs link out / show "Book" placeholder)
- User accounts, saved trips, sharing backend
- Affiliate product catalog beyond the 5 curated essentials
- Admin tools for editing destination templates

---

### Design system

CSS tokens in `src/styles.css` using `oklch`:
- `--sage`, `--sage-deep` (forest), `--sand`, `--beige`, `--off-white`, `--ink` (deep warm charcoal)
- Mapped to `--background` (off-white), `--foreground` (ink), `--primary` (forest green), `--secondary` (warm sand), `--muted` (beige), `--accent` (sage)
- Soft shadows, large radii (rounded-2xl/3xl), generous whitespace
- Typography: serif display (e.g. Fraunces) for headlines + clean sans (Inter) for body, loaded via `<link>` in `__root.tsx`
- Custom Button variants: `hero` (forest), `ghost-warm`, `outline-sand`
- No bright blue, no neon, no dark dashboard — calm luxury

### Photography

Real Unsplash photos referenced by stable `images.unsplash.com` URLs (parks, RVs, glamping tents, cabins, lakes, mountains, scenic roads). No AI-generated images. Hero uses a cinematic full-bleed mountain/lake shot.

### Routes (TanStack Start)

```
src/routes/
  __root.tsx              header/footer shell + fonts + meta
  index.tsx               homepage (9 sections)
  destinations.$slug.tsx  output page (9 sections)
  search.tsx              thin redirect: ?q=... → best matching destination slug
```

### Data + AI

- `src/data/destinations.ts` — curated template (slug, name, region, hero image, gallery, stays, rentals, activities, similar, base stats)
- `src/lib/ai/enrich.functions.ts` — `createServerFn` that takes a destination slug and returns AI-enriched fields (summary, insights, packing checklist, budget breakdown). Uses Lovable AI Gateway + `google/gemini-3-flash-preview` with structured output. In-memory cache per slug for the session.
- The output page loader hydrates the template synchronously and the component calls the server fn via `useQuery` for the enriched bits (skeletons while loading) — no blocking SSR on AI.

### Homepage sections

1. Hero — full-bleed photo, headline "Plan Your Next Outdoor Escape", large search, popular search chips, Start Planning CTA
2. How It Works — 3 cards (Choose → Personalize → Go)
3. Popular Destinations — image grid (6 parks)
4. What Your Plan Includes — 6-tile visual preview (Stays, Rentals, Experiences, Packing, Budget, Local Tips)
5. Stay Types — 6 category cards
6. Rentals — 5 large rental cards
7. Trending Trips — destination cards
8. Community Favorites — most-viewed strip
9. Final CTA — cinematic full-bleed "Ready For Your Next Adventure?"

### Output page sections

1. Hero with destination photo, AI summary, quick stats chips (Season / Scenic / Camping / Budget / Duration)
2. Top Stays — tabbed by category, cards with image / why-we-recommend / Book
3. Rent Before You Go — RV / Campervan / Bike / Kayak / Gear
4. Things To Do — tours, activities, experiences
5. AI Destination Insights — Best Time, Weather, Crowds, Wildlife, Cell, Safety, Family, Pet
6. Packing Checklist — grouped, downloadable (client-side .txt download)
7. Trip Budget — estimator with sliders for days/party size, breakdown bars
8. Essentials — 5 curated products
9. Similar Destinations — internal links

### Search behavior

Single input on homepage. On submit, fuzzy-match against destination slugs/aliases (Yellowstone, Yosemite, "RV Adventure" → curated trip template). If no match, fall back to the closest curated destination + show a soft note. No multi-step onboarding.

### SEO

- Per-route `head()` with unique title/description/og
- Output page sets `og:image` to the destination hero photo
- Semantic H1 per page, alt text on every image

---

### Technical notes

- TanStack Start + Tailwind v4, tokens in `src/styles.css` under `@theme inline`
- Fonts loaded via `<link>` in `__root.tsx` head (not `@import` in CSS)
- AI server fn lives at `src/lib/ai/enrich.functions.ts` (client-safe path), uses the shared `createLovableAiGatewayProvider` helper in `src/lib/ai-gateway.server.ts`
- `LOVABLE_API_KEY` provisioned via `ai_gateway--create` if missing
- Destination template is the source of truth; AI only enriches, never invents core facts
- All booking buttons are non-functional in this pass (styled CTAs only) — clearly safe placeholders

---

Ready to build on approval. I'll start with the design system + homepage, then the destination output page + AI enrichment, then wire search.