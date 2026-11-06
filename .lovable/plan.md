# Multilingual foundation (German first)

## Goal
Add a reusable language system so German launches now and French, Spanish, Dutch, etc. later require only a dictionary file plus a one-time content translation run — no page rewrites.

## What visitors will see
- A language switcher (EN / DE) in the header and footer.
- German pages at `minialife.com/de/...`; English stays at today's addresses (no URL changes, no SEO loss).
- Pilot German pages: homepage, Destinations list, Road Trips list, and the 10 most popular park pages.
- Pages not yet translated show no German link in the switcher (no half-English German pages).

## URL structure
```text
/                      -> English (unchanged)
/destinations/zion     -> English (unchanged)
/de                    -> German homepage
/de/destinations       -> German directory
/de/destinations/zion  -> German park page (same slug, easier mapping)
/de/road-trips         -> German road trips list
```
Same slugs across languages keep hreflang pairing simple.

## Steps
1. **Language registry** — one central list of supported languages (code, name, Google hreflang tag, enabled flag). Adding French later = one line.
2. **Interface dictionary** — English and German text files for menu, buttons, section headings, card labels, footer, breadcrumbs, dates/units (miles + km for German). Missing German keys fall back to English automatically.
3. **German routes** — a `/de` section that reuses the existing page sections, passing the language in. Explicit `/de` routes take priority over the single-segment search-page route so they never collide.
4. **Content translations** — a new database table for translated park text (title, intro, plan text, FAQs, search title/description), generated once by a content-pipeline script for the 10 pilot parks, reviewed, then published. No per-visit AI.
5. **SEO** — each English and German page lists both versions (`hreflang` en, de, x-default) only when the German version is published; German title/description/og tags; `lang="de"` on the page; German pages added as a separate sitemap file; breadcrumbs and JSON-LD in German.
6. **Language switcher** — keeps you on the equivalent page; remembers choice but never auto-redirects by browser language (Google must see both versions).
7. **Affiliate links** — unchanged tracking; partner links stay the same (German partner sites can be swapped later per partner).
8. **Tests** — language fallback, hreflang pairs only for published translations, `/de` routes not caught by the search-page route.

## Expanding later
Add language to registry → add dictionary file → run translation script for chosen pages → publish. Switcher, hreflang and sitemap update automatically.

## Cost note
Translation of 10 parks is a one-time AI cost (small). Scaling to all ~parks and guides should follow Search Console evidence that German pages earn impressions.

## Technical details
- `src/lib/i18n/locales.ts` (registry), `src/lib/i18n/dict/{en,de}.ts`, `useT()` hook + `t(locale,key)` for SSR-safe use in `head()`.
- Routes: `src/routes/de.tsx` (layout, `<Outlet/>`), `de.index.tsx`, `de.destinations.index.tsx`, `de.destinations.$slug.tsx`, `de.road-trips.index.tsx`; components accept `locale` prop, default `en`.
- Root `<html lang>` derived from matched route.
- Migration: `content_translations(entity_type, entity_id, locale, fields jsonb, status, reviewed_at)` with public anon SELECT on `status='published'`, unique (entity_type, entity_id, locale).
- Script: `scripts/content-pipeline/translate-content.py --locale de --pilot`.
- Sitemap: `/sitemaps/de.xml` added to index in `sitemap.server.ts`; `alternates` helper in `src/lib/seo/hreflang.ts`.
- Breadcrumb crumbs get locale-aware names and `/de` paths.
- AGENTS.md rule recording the i18n architecture.
