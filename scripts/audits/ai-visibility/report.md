# AI visibility audit: wildparkroutes.com (2026-11-22)

**Audit only. No code or data was changed.**

- Branch `ai-visibility-audit`, from `main` at `3fa4cadc`.
- **Evidence:** the repository code plus the live site, fetched with `curl` without JavaScript. That is exactly what a crawler that does not run scripts receives.
- **Sample:** 23 URLs fetched on 2026-11-22, listed in `evidence/urls.txt`. 22 returned 200; `/de/…/zion/best-time` returned 404.
- **Parser:** `evidence/analyze.py`. Outputs:
  - `evidence/analysis.json`: JSON-LD types, missing properties, canonical, hreflang, dates and main text per page.
  - `evidence/answer.json`: the first 400 characters for item 3.

## Summary

| # | Check | Result |
|---|---|---|
| 1 | robots.txt | ✅ Every listed agent is allowed. Only outbound or legacy paths are disallowed. |
| 2 | JSON-LD | ⚠️ Present on every page, with gaps (see table). The worst are: Organization has no `sameAs`; Articles have no `author` or `datePublished`; the visible "Quick answers" have no `FAQPage`; de/fr place pages have breadcrumbs only. |
| 3 | Answer-first | ⚠️ Guides: the answer is good, but about 560 characters of booking widgets come before it. Destination pages: `<main>` opens with a promo banner and tours, and there is no direct answer. |
| 4 | About / contact / Organization | ⚠️ The pages exist and are linked in the footer. There is no `sameAs`, no named author or editor, and the logo is 64×64 px. |
| 5 | Last-updated date | ❌ No visible date on any sampled page (exception: the Yellowstone/Grand Canyon answer blocks). `dateModified` exists on guides only and is mostly a bulk timestamp. |
| 6 | IndexNow / Bing | ⚠️ The IndexNow key file is live, but nothing submits URLs. There is no Bing verification tag or file. |
| 7 | Server-side rendering | ✅ Main text and JSON-LD are in the HTML without JavaScript on all 22 pages that returned 200. |
| 8 | hreflang / canonical | ✅ Correct and reciprocal on home, hubs and place pages. Guides are English-only, with no hreflang. |

---

## 1. robots.txt

There is only one source:
- The static file `public/robots.txt`.
- No generated route: `src/server.ts` handles `/sitemap.xml`, `/sitemaps/*` and `/rss*`, but not robots.

The live `https://wildparkroutes.com/robots.txt` (HTTP 200, 1,872 bytes) is byte-identical to the repo file (`diff` gave no output).

| Agent | Group in robots.txt | Allowed |
|---|---|---|
| Googlebot | not named → `User-agent: *` | yes |
| Bingbot | named in the AI group (`GPTBot … Bingbot`) | yes |
| OAI-SearchBot | own group | yes |
| GPTBot | AI group | yes |
| ChatGPT-User | AI group | yes |
| PerplexityBot | own group | yes |
| ClaudeBot | AI group (also Claude-SearchBot, Claude-User) | yes |
| Google-Extended | AI group | yes |

- **Every group disallows the same paths:** `/go/ /out/ /_serverFn/ /plans/ /curated-plans/ /product/ /product-category/ /shop/ /blog/ /wp-`. These are outbound tracking, server functions and legacy paths. **No content path is blocked for any of the eight agents.**
- **Fully blocked:** only `MJ12bot` and `DotBot`.
- **Sitemap:** the file names `https://wildparkroutes.com/sitemap.xml`. It is live: a sitemap index with per-country children and hreflang alternates.
- **llms.txt:** `/llms.txt` returns 200.

## 2. Structured data (JSON-LD)

**Site-wide, from `src/routes/__root.tsx` → `src/lib/seo/siteJsonLd.ts`:**

- **`Organization`:** `name`, `url`, `logo` = `/favicon.png`, `email`.
  - **There is no `sameAs`.** No `sameAs` exists anywhere in `src`.
  - The logo is **64×64 px** (`file public/favicon.png`). Google asks for at least 112×112.
  - `email` is `info@minialife.com`, not a wildparkroutes.com address.
- **`WebSite`:** includes a `SearchAction`.

**Per page type.** "Missing" means: a required or recommended property for the rich result, or an item you asked about that is absent.

| Page (sample URL) | Types found | What is missing or wrong |
|---|---|---|
| Home `/` | Organization, WebSite, SearchAction | Organization `sameAs`; no `WebPage`/`dateModified`; no BreadcrumbList (normal for a home page) |
| Country hub `/destinations/us` | Organization, WebSite, BreadcrumbList | No `CollectionPage`/`ItemList` of the regions or places it lists; no `WebPage` with `dateModified` |
| Destination `/destinations/us/utah/zion` (also acadia, yellowstone, olympic) | TouristDestination (`name`, `description`, `image`, `address`, `geo`), TouristTrip + ItemList of TouristAttraction stops, WebPage, BreadcrumbList, ImageObject, Person | **WebPage has no `dateModified`.** Stop `TouristAttraction`s have no `geo`/`image` (acceptable as itinerary items). **Visible Q&A is not marked up as `FAQPage`** (see below). **`Person` "Zion National Park"** appears as an image creator, a misparsed photo credit. |
| Best time `/…/zion/best-time` (+3) | Article, BreadcrumbList, FAQPage, + site graph | Article: **no `author`, no `datePublished`**. Its `publisher` is a second, bare `Organization` (name only: no `url`, `logo` or `@id` link to `#organization`). No link to the place (`about` → TouristDestination). |
| Itinerary `/…/zion/itinerary` (+2) | same as best-time | Same gaps. The day-by-day plan is not marked up (could be `TouristTrip`/`ItemList`, like the destination page). |
| Glamping `/…/zion/glamping` | same as best-time | Same gaps. |
| German/French place `/de/…/zion`, `/fr/…/zion` | Organization, WebSite, **BreadcrumbList only** | **No TouristDestination, TouristTrip or WebPage.** The English page has them. `src/routes/de.destinations.$slug.$region.$place.index.tsx:49` emits only `breadcrumbJsonLd`. |
| German/French hub | Organization, WebSite, BreadcrumbList | As the English hub |

**Validation.** All 39 JSON-LD blocks on the 22 pages that returned 200 parsed without errors. BreadcrumbList items all have `position`, `name` and `item`. Every FAQPage question has `name` and `acceptedAnswer.text`.

**FAQ markup bug.**
- `/destinations/us/wyoming/yellowstone` shows the visible question "How many days should I spend in Yellowstone?" (source: `src/lib/data/destinationAnswers.ts`).
- The page has **no `FAQPage`**.
- `src/lib/seo/destinationJsonLd.ts:83` says FAQPage "mirrors the visible Quick answers section". But the route calls `buildDestinationJsonLd(d, pageUrl)` without the `faqs` argument (`src/routes/destinations.$slug.$region.$place.index.tsx:120`).

## 3. Answer-first check (10 sample pages + glamping)

**Guides (best-time, itinerary, glamping).**
- The first paragraph of `<main>` is a direct 2–3 sentence answer. This is good.
- But between the H1 and that answer, the server HTML contains **548–580 characters** of trip snapshot and the four-step booking strip ("Book in this order · Step 1 Find flights…"). This comes from `src/routes/destinations.$slug.$region.$place.$guide.tsx:195-200`: `TripSnapshot`, `TripQuickNav` and `BookingStepsStrip` render before `<main>`.

**Destination pages.**
- The hero shows only a short slogan (e.g. "Red sandstone cathedrals, a river you walk through…"), then score tiles.
- `<main>` opens with a **Black Friday promo** and **"Top tour"**.
- There is no 1–3 sentence answer to "what is it / when to go / how long" before long content.

**Home page.**
- It has **no `<main>` element**, unlike every other sampled page.
- Its first text after the header is the country menu.

First 400 characters of `<main>` (verbatim, from `evidence/answer.json`):

| Page | Direct answer at top? | First 400 characters of main content |
|---|---|---|
| best-time Zion | ✅ after 572 chars of widgets | Spring and fall are usually the most comfortable seasons for exploring Zion, especially if your plans center on hiking rather than long afternoons beside a pool. They are also popular, so pleasant weather does not necessarily mean quiet trails. The right dates depend on whether you want canyon walks, river hiking, cooler camping nights, or fewer people—and on how flexible you can be when weather c… |
| best-time Grand Canyon | ✅ after 562 | The best time to visit Grand Canyon depends on whether you want comfortable hiking weather, a family summer trip, or quieter overlooks with a chance of snow. Spring and fall usually offer the most balanced conditions at the South Rim, but elevation makes every season more complicated than a desert forecast suggests. Allow two to four days so you can adjust walks and viewpoints around weather. Spri… |
| best-time Yellowstone | ✅ after 562 (opens with "depends on…"; the actual answer is in sentence 2) | The best time to visit Yellowstone depends on whether you want easy access to the park's main sights, quieter wildlife watching, or a winter landscape reached through specialized transportation. Late June through September offers the most straightforward conditions for a first road trip, though mountain weather can change quickly in any month. Spring and fall bring fewer visitors in some areas, bu… |
| best-time Olympic | ✅ after 562 | June through September is the easiest starting point for an Olympic trip, especially if you want mountain viewpoints alongside rainforest walks and beach time. But Washington's Olympic Peninsula changes dramatically with elevation and exposure, so the best month depends on what you want to see. Allow two to four days, expect some wet weather in any season, and build your route around current road … |
| itinerary Zion | ✅ after 579 | Give Zion two to four days if you can: enough time to explore the main canyon without making every hour depend on one trail or permit. This plan starts with an arrival through St. George Regional Airport and uses Springdale as a convenient base. Treat the days as interchangeable, moving your biggest hike to the most suitable weather window and leaving space for shuttle lines, meals, and a slower a… |
| itinerary Grand Canyon | ✅ after 577 | This Grand Canyon itinerary uses the South Rim as a practical base for a first visit, with three core days and an optional fourth. Fly into Flagstaff Pulliam Airport, then allow roughly two hours for the drive before stops or entrance delays. The schedule balances classic overlooks with a short hike and downtime, so you can adapt it to heat, snow, family energy, or a late arrival. 1 Day 1: Arrive … |
| itinerary Moab | ✅ after 548 | Give Moab two to four days and you can combine an Arches visit with canyon overlooks, river scenery, and enough breathing room to enjoy the desert instead of racing through it. This Moab & Arches itinerary uses a four-day framework that you can shorten, with the longest walks placed early and arrival day kept light so flight timing, entry reservations, and weather can shape the details. 1 Day 1: A… |
| destination Zion | ❌ | Black Friday · ends 2 Dec — Cruise America & Cruise Canada up to 35% off. Selected dates & T&Cs apply. Top tour Tours & experiences near Zion National Park Know before you go Shuttle Requirements The Zion Canyon Scenic Drive is primarily accessed via shuttle for much of the year. Check the official seasonal schedule as private vehicle access is prohibited during operation hours. Springdale Staging… |
| destination Yellowstone | ❌ | Black Friday · ends 2 Dec — Cruise America & Cruise Canada up to 35% off. Selected dates & T&Cs apply. Top tour Tours & experiences near Yellowstone National Park Know before you go Geyser Basin Congestion Lots at Old Faithful and Midway Geyser Basin fill early during peak summer months. Consider visiting these areas in the early morning or late afternoon to avoid the busiest periods. Limited Conn… |
| destination Acadia | ❌ | Black Friday · ends 2 Dec — Cruise America & Cruise Canada up to 35% off. Selected dates & T&Cs apply. Top tour Tours & experiences near Acadia National Park Know before you go Sand Beach Capacity Sand Beach and Jordan Pond parking can be busy in peak season. When Island Explorer is operating, check its current routes and schedule before relying on the shuttle. Island Topography Cellular reception… |
| glamping Zion (extra) | ✅ after 580 | Glamping near Zion usually means sleeping outside the national park in a furnished tent, cabin-style retreat, or another outdoor-focused accommodation with more comfort than a basic campsite. It can be a lovely match for days spent hiking and evenings spent watching the desert light fade. The key is choosing for practical details—location, temperature control, bathrooms, and road access—not just f… |

## 4. About, author, organization and contact pages

| Page | Live | In footer | Notes |
|---|---|---|---|
| `/about` | 200 | ✅ | Describes an "independent outdoor-travel publisher" and AI-assisted, editorially reviewed content. **No named person, editor or team.** Says "Free **U.S.** outdoor travel guides", although the site covers 40+ countries. |
| `/contact` | 200 | ✅ | Email `info@minialife.com`; "based in the United States". |
| `/affiliate-disclosure`, `/privacy`, `/terms` | 200 | ✅ | |
| Author/team page (`/authors`, `/about/team`) | 404 | — | Does not exist |
| `/de/about` | 200 | — | `/fr/about`, `/de/contact`: 404 |

- The footer links are identical on home, guide and destination pages: `/about`, `/contact`, `/affiliate-disclosure`, `/privacy`, `/terms` (see `footer_links` in `evidence/analysis.json`).
- The Organization schema is on every page (root `head`). **There are no `sameAs` links.** There is no `founder`, `address` or `contactPoint`, and no `AboutPage` or `ContactPage` type on those pages.

## 5. Last-updated dates

**Visible:**
- No "Last updated / Updated / Aktualisiert / Mis à jour" text on any of the 22 sampled pages.
- One exception: the pilot answer blocks on Yellowstone show "checked 2026-10-17".

**Markup:**
- Guides have `Article.dateModified` = `landing_pages.updated_at`.
- Destination `WebPage`, hubs and home have no `dateModified`.

**The timestamps are bulk timestamps, not edit dates:**
- 7 of the 8 sampled guides carry the same `dateModified` of `2026-10-25T13:59:06.920175+00:00`.
- In the sitemap, all 500 US destination URLs share one `<lastmod>`: `2026-11-12T11:44:14.610Z`.
- 404 of 464 best-time URLs share one of three timestamps.

## 6. IndexNow and Bing

**IndexNow:**
- The key file is deployed: `public/e30e5c8f5cb37300c499a62294390bb2.txt`. The live URL returns 200 and its content is the key.
- **No code submits URLs.** There are no matches for `indexnow` or `api.indexnow.org` in `src`, `supabase` or `scripts` (outside audits).
- So Bing, Yandex and others are never notified of changes.

**Bing verification:**
- **No `msvalidate.01` meta tag.** The home `<head>` has only `google-site-verification` and `p:domain_verify` (Pinterest), from `src/routes/__root.tsx:87-89`.
- `/BingSiteAuth.xml` returns 404.
- Verification through DNS, or by importing from Google Search Console, cannot be seen from the code.

## 7. Server-side rendering

All 22 pages that returned 200 were fetched with plain `curl`, without JavaScript:

- **JSON-LD:** in the initial HTML on every page.
- **Main text:** `<main>` holds 5,785–11,324 characters on guide, destination and hub pages (`main_len` in `analysis.json`).
- **Headings and links:** the H1, breadcrumbs and internal links are present.
- **Home page:** its text (6,947 characters) is also server-rendered, but it has no `<main>` landmark.
- **Rendering stack:** TanStack Start (`createFileRoute` loaders plus `head()`). Content does not depend on client-side fetching.

## 8. hreflang and canonical

| Page | html lang | canonical | hreflang |
|---|---|---|---|
| `/`, `/de`, `/fr` | en/de/fr | self | en, de, fr, x-default (= en), identical on all three ✅ |
| `/destinations/us` + de/fr | en/de/fr | self | complete and reciprocal ✅ |
| `/destinations/us/utah/zion` + de/fr | en/de/fr | self | complete and reciprocal ✅ |
| `/about` | en | self | en, de, x-default (`/fr/about` does not exist, so this is correct) |
| `/contact` | en | self | none (`/de/contact` and `/fr/contact` do not exist) |
| Guides (best-time etc.) | en | self | none. English only: `/de/…/zion/best-time` returns 404, and German/French place pages link to the English guide URLs. |

- The sitemap repeats the same alternates (`<xhtml:link hreflang>`) on the 500 US destination entries.
- No conflicts were found: every canonical is self-referencing, and every hreflang target returns 200.

---

## Top 8 fixes (not implemented)

Ordered by effort, then expected value.

| # | Fix | Effort | Expected value | Evidence |
|---|---|---|---|---|
| 1 | **Pass the visible Quick-answers into `FAQPage`.** The route calls `buildDestinationJsonLd(d, pageUrl)` without `faqs`. | Small (1 line + test) | Medium: only the pilot places have answers today, but it is a markup/visible mismatch the code says should not exist | §2 |
| 2 | **Complete the Organization entity:** `sameAs` (official social and profile URLs), a logo ≥112 px, a brand-domain contact email; link the guide Articles' `publisher` to `#organization`. | Small | High for entity recognition by search and AI engines | §2, §4 |
| 3 | **Article fields on guides:** `author` (the Organization, or a named editor), `datePublished`, `about` → the place's TouristDestination. **Show a visible "Last updated" date** from the same field. | Small | High: freshness and authorship are the main signals AI answer engines cite | §2, §5 |
| 4 | **Bing verification and IndexNow pings.** The key file is already live; add a submit step on publish and update (pipeline or server function). | Small–medium | Medium–high: Bing's index feeds ChatGPT search and Copilot | §6 |
| 5 | **Answer first on guides:** render the intro paragraph directly under the H1, before `TripSnapshot` and `BookingStepsStrip` (they can follow it). | Medium (layout change; conflicts with the AGENTS.md "booking first" rule for destination pages, so needs your decision) | High: the answer becomes the first text after the H1 | §3 |
| 6 | **Answer block on destination pages:** a 1–3 sentence summary (what it is, best time, suggested days, from stored fields) at the top of `<main>`, before the promo banner and Viator tours. Add `<main>` to the home page. | Medium | High for "best time / how many days" queries | §3 |
| 7 | **Real modification dates:** `WebPage.dateModified` on destination and hub pages, and stop bulk scripts from touching `updated_at` (or keep a separate `content_updated_at`), so sitemap `lastmod` and `dateModified` mean something. | Medium | Medium | §5 |
| 8 | **Bring de/fr place pages up to the English JSON-LD** (TouristDestination, TouristTrip, WebPage with `inLanguage`). Fix the photo-credit parser that outputs `Person` "Zion National Park". | Medium | Medium: German and French pages currently give engines breadcrumbs only | §2 |

**Not in the top 8 (large effort):** named author or editor profiles with credentials (E-E-A-T), and localised de/fr guide pages.

## Decisions for you

1. **Fix 5 conflicts with the AGENTS.md rule "TopShowcase follows the booking bar, before guide content" (booking first).** Should guide pages move the answer above the booking strip?
2. **`sameAs`:** which official profiles exist (Pinterest is verified via `p:domain_verify`; others?).
3. **Contact email:** keep `info@minialife.com` in the Organization schema, or use a wildparkroutes.com address?
4. **About page:** it says "U.S." guides. Change it to worldwide? Also, should a named editor or person be shown?
5. **Bing:** do you already verify through DNS or a Search Console import? If not, a `msvalidate.01` code is needed from Bing Webmaster Tools.
6. **Network:** to read the live site I added `wildparkroutes.com` and `www.wildparkroutes.com` to this environment's allowed hosts. You approved this on the card.
