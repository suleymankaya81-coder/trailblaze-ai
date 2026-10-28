# Rental conversion — 3 steps

## 1. Fix wrong drive data
- Antelope Canyon (PGA): stored 9.9 mi / 48 min → correct to ~15 min.
- Adirondacks (SLK): stored 74.9 mi / 166 min → recheck against the real Saranac Lake → Lake Placid / central Adirondacks route and correct.
- Grand Canyon (FLG, 89.7 mi / 111 min): verify too.
- Quick scan of all 500 destinations for impossible speeds (under 15 mph or over 75 mph average) and list suspects; fix only clear errors.

## 2. Partner click tracking (GA4)
- One shared click listener sends an `affiliate_click` event for every outbound partner link (Motorhome Republic, Airport Rentals, Viator, Vrbo, Expedia, Harvest Hosts, REI, Travelpayouts, Awin).
- Event details: partner, category (car / RV / camper / stay / tour / gear / flight), page type, destination slug.
- No change to links, attribution or page design.

## 3. Grand Canyon pilot: "Which vehicle fits your trip?"
- Small choice box above the Step 2 rental cards on the Grand Canyon page only.
- Three options: Car (solo/couple, hotels), SUV (family, dirt roads), Motorhome/campervan (camp in the park).
- Choosing one highlights the matching card and its partner button; tracked as `vehicle_choice` in GA4.
- After 2–4 weeks of data, decide whether to roll out to all destinations.

## Technical notes
- Data fixes via data update on `destinations.drive_minutes/drive_miles`; test asserting corrected values.
- Tracking in `src/lib/analytics.ts` + a delegated listener mounted in root; partner detection by hostname map.
- Pilot component in `src/components/destination/`, gated by slug list.
