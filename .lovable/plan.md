# Destination page revamp: conversion-focused build order

Turns each destination page into a landing page built around the frustrations travelers mention on Reddit: sold-out campgrounds, hidden costs, poor cell signal and "15 open tabs" planning. Adds a free road trip map with no Google Maps costs.

## Step 1: Hero with "Trip Radar"
- **Permit badge** in the hero: "Reservation needed: High / Moderate / None".
- **Nearest airport and drive time**, for example "FCA airport, 45 min drive".
- **Sticky jump bar** under the hero: Stays, RV & Car Rentals, Tours, Checklist.

## Step 2: "Campgrounds sold out?" Plan B box, right below the hero
- A box that stands out: "Park campgrounds sold out? Here are private campsites and glamping 20–30 min away."
- The buttons go to the Hipcamp and Glamping Hub offers we already have, with clear partner labels.
- Short booking countdown: "Going in July? Book your campsite in January, your entry permit in March and your rental in May." It is built from the destination's best season.

## Step 3: Stays and budget combined
- Bigger stay cards that lead with the price.
- Every card gets one clear tag: **"Inside the park (hard to book)"** or **"Outside the park (easier to book)"**.
- All booking buttons look the same, stand out clearly and are marked "Partner link".
- The budget box moves next to the stays. On phones it shrinks to one short summary bar, so the page is shorter.

## Step 4: RV and getting there
- "Rent before you go" now shows only RV and campervan rentals you can pick up at the nearest airport (RVshare).
- A cost line: "About $X a day on average. Compare it with a hotel plus rental car." It uses the price ranges we already store and makes no savings promises.

## Step 5: Tours and activities in one section
- "Things to do" and "Travel services" become one section with 3–4 bookable experiences (Viator), such as canyon tours, boat tours and guided hikes.

## Step 6: Packing list that collects emails
- Show only the 3 most important gear items (REI).
- Below them, a form: "Get the full packing list, offline GPS points and emergency guide by email." Each signup is saved to the database. The actual emails can be set up later.

## Free "Plan your road trip" map, no Google costs
- **Map:** OpenFreeMap / OpenStreetMap tiles shown with the free MapLibre library. No API key, no fees, no request limits.
- **Route and drive time:** We work these out once per destination, ahead of time, with the free OSRM routing service, then save them with the destination. Visitors never trigger a routing request, so cost stays at zero.
- **Map contents:** a pin for the airport, a pin for the destination, the route line, distance and drive time. "On the way" shows nearby stays from our own offers.
- **"Get directions" button:** opens the route in the visitor's Google Maps app with a plain link. This is free and needs no API.
- No Google Maps connection is used.

## Data the steps need
New fields for each destination: permit level, nearest airport name and code, airport location, destination location, drive minutes, drive miles and the saved route line.
- First pass: fill these for the 20 published destinations. AI drafts the permit level and airport, then a free geocoding and OSRM script adds the locations and routes.
- Catalog destinations without this data hide those parts, so nothing is made up.

## Technical details
- Migration: add `permit_level` (enum high/moderate/none), `nearest_airport_code`, `nearest_airport_name`, `airport_lat/lng`, `lat/lng`, `drive_minutes`, `drive_miles` and `route_geojson` (jsonb) to `destinations`. Add an `email_leads` table (email, destination_id, session_id, created_at). Grant only insert to anon, and gate it through a server function with zod validation and a honeypot field.
- Script `scripts/content-pipeline/compute-routes.ts`: geocode with Nominatim (1 request/s, with a User-Agent), route with the OSRM public demo server (`router.project-osrm.org`), simplify the line, then write it to the database. It runs one time, not per visit.
- Front end: `maplibre-gl` loaded lazily on the client behind `ClientOnly` and `React.lazy`, using the OpenFreeMap "liberty" style with OSM attribution shown.
- Split the 54 KB `destinations.$slug.tsx` into `src/components/destination/*` (Hero, TripRadar, PlanB, StaysBudget, Rentals, Experiences, PackLead, RoadTripMap), and keep the route file as the composer.
- Keep the existing compliance: `rel="sponsored nofollow noopener"`, partner labels, noindex for thin pages and tracked outbound clicks.
- Record the module split and the "precomputed routes, no runtime map API" rule in AGENTS.md.
