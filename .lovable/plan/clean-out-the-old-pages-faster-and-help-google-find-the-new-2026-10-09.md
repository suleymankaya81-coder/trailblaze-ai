# Clean out the old pages faster and help Google find the new ones

## What's going on
- **28,368 "Not found (404)":** These are the old addresses (for example /plans/...) that we deleted on purpose. That's expected and they'll drop off over time. A 404 tells Google "maybe temporary", though, so it keeps coming back to check them.
- **739 indexed:** Many of these are still old /plans/... pages. Google's copy is from late August, so they still show in search.
- **65,719 "Crawled, not indexed":** Most of these are probably old pages too. Google spends its time on the site re-checking old addresses instead of reading the new ones.
- **New pages:** The site map lists all 2,206 new addresses and they load fine. Google has simply been slow to read them because of the pile of old ones.

## What I'll do
1. **Tell Google the old pages are gone for good (410 "Gone").** Every old address (/plans/... and the other old patterns I find in the Search Console reports) gets a short "this page was permanently removed" response. Google drops 410 pages much faster than 404s. The new pages aren't affected.
2. **Redirect worthwhile old addresses where it makes sense.** If an old address clearly matches a current place (for example an old Yosemite page), it sends visitors to the new destination page instead (a permanent 301 redirect). That passes the old page's value to the new one. Anything without a clear match gets the 410.
3. **Split the site map into smaller files.** One for main pages, one for destinations, and one each for the guide types. Search Console then shows how many pages are indexed in each file, so you can see where things stand. Then I'll resubmit it.
4. **Fix the small items:** the 1 "redirect error", the 5 "soft 404" pages and the 50 "duplicate" pages. I'll check samples through Search Console and correct their canonical address or response.
5. **Check sample pages:** I'll look up a few new destination and guide pages in Search Console to confirm Google sees them as eligible for indexing.

## What you do after publishing
- In Search Console, click **"Validate fix"** on the "Not found (404)" row so Google re-checks the old addresses sooner.
- For the old pages that still show in search, you can optionally use the **Removals** tool with the prefix `https://minialife.com/plans/`. That hides them for 6 months right away.
- Use "Request indexing" on the 10–20 most important destination pages (Yellowstone, Yosemite, Grand Canyon, and so on).

## Realistic expectations
The old pages should clear out within weeks. The new pages will then get indexed gradually over weeks to a few months, as Google's trust in the site recovers.

## Technical details
- `src/server.ts`: before the TanStack handler, match legacy path patterns (`/plans/*`, plus other prefixes taken from the Search Console 404 samples) and return `410` with a minimal HTML body and `X-Robots-Tag: noindex`. A small slug→destination map gives `301` where there's a clear match. Don't block these paths in robots.txt, because Google has to be able to see the 410.
- `sitemap.server.ts`: serve `/sitemap.xml` as a sitemap index plus child sitemaps (`/sitemaps/pages.xml`, `/sitemaps/destinations.xml`, `/sitemaps/guides-<type>.xml`). Keep the paginated fetch.
- Search Console via the existing connection: list the sites, pull URL Inspection samples, and resubmit `sitemap.xml` after publishing.
- Add the legacy-path rule to AGENTS.md.
