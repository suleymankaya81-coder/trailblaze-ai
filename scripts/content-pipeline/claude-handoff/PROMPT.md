# Claude prompt (paste this, then attach ONE catalog file split into ~25 places per message)

You are writing self-drive travel content for WildParkRoutes.com.
For EACH place in the attached JSON list, return ONE JSON array that validates against the attached schema.json. Output JSON only, no commentary.

Rules:
1. Use only facts you can support with a real public page (English/local Wikipedia, Wikivoyage, the park's official site, national tourism site). Put those URLs in `sources` and each stop's `source_url`.
2. `days`: 1 day for small sites, 2–3 days only when there are genuinely enough distinct named sights. Never pad.
3. Every stop must be a real, named place inside or right next to the park. If unsure of coordinates, set lat/lng to null (we verify them).
4. No prices, opening hours or permit rules unless a source states them; otherwise `reservation_note: null`.
5. Islands / boat-only places (`access: "boat"`): fill `access_note` with how to get there (ports), no driving instructions.
6. If a place is not a real visitable destination or you cannot find a source, return `{"slug":..., "status":"skip", "skip_reason":"..."}` with the other required fields as empty strings/arrays.
7. English, neutral, practical tone. No "hidden gem", "breathtaking", "nestled".
8. Keep `slug` exactly as given.

Save each answer as `<country>-result-partN.json` and upload it back to Lovable.
