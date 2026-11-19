# Avustralya/Yeni Zelanda üretim talimatı

Bir `batches/<ülke>-input-partNN.json` dosyasını ve `schema.json` dosyasını birlikte kullanın. Her slug için tam bir yanıt; eksik kanıt varsa aynı slug ile `hold` gerekir. Katalog hiçbir kaydı otomatik yayıma uygun ilan etmez.

Prepare source-bound English destination content for WildParkRoutes. Return only a JSON array matching schema.json. Never publish or rename input slugs.

1. Read exact-place official visitor sources and retained Wikipedia background before writing. Catalog URLs/QIDs are discovery references, not approved source packets. Every proposed stop requires an exact quote and the actual consulted source URL.
2. Use 1–3 visit days only when distinct sourced sights justify them. Never pad a viewpoint into three days or compress an eleven-day trek into a three-day road trip. Long Great Walks/Overland/Larapinta routes need honest overview/partial-visit treatment with sourced access; otherwise hold.
3. Catalog coordinates are general destination points or CAPAD parcel centroids, never trailheads/parking/navigation. Keep stop coordinates null unless independently verified. Keep AU/NZ identities, states and original Māori/Aboriginal names; do not reuse same-name places overseas.
4. CAPAD is a 30 June 2024 land inventory. Verify present names, park consolidations, public access and scientific/marine restrictions before publication. Proposed parks are not current national parks. Te Urewera is not a current national park; Egmont is an alias of Te Papa-Kura-o-Taranaki.
5. Do not infer roads, campervan access, free camping, 4WD suitability, ferry vehicle carriage or available rentals. Reef/island destinations require appropriate boat/flight evidence. External territories need their own travel and partner checks. Whanganui Journey is a canoe journey, not a walking/driving loop.
6. Current fees, reservations, hut/campsite bookings, freedom camping, sacred-site restrictions, fire danger, cyclone/monsoon closures, alpine hazards, ferries and permits require dated official sources. Seasonal advice must follow the southern hemisphere and exact region, never a blanket European calendar. Unsupported operational statements stay null.
7. No packing, FAQ or invented budget panels. No invented airports, photos or partner inventory. Licensed exact-place cover matching and German translation occur after evidence review.
8. Historical authority-domain mentions only establish historical discovery, not current status/access. Preserve ambiguous historical aliases as holds instead of manufacturing old park URLs.

Output name: `<country>-result-partNN.json`; include every input slug exactly once, with explicit hold_reason where needed.