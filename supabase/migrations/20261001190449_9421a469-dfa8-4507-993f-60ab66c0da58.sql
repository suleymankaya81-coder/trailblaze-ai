ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS network text, ADD COLUMN IF NOT EXISTS network_mid integer;

UPDATE public.offers SET network='awin', network_mid=11018 WHERE partner='viator';
UPDATE public.offers SET network='info', commissionable=false WHERE category='park_pass' AND destination_id IS NULL;

INSERT INTO public.offers (destination_id, category, subcategory, title, partner, network, network_mid, external_url, image, why_recommended, commissionable)
SELECT d.id, 'stay'::public.offer_category, 'Campground', 'Campsites near ' || d.name || ' on Campspot', 'campspot', 'awin', 22326,
  'https://www.campspot.com/search?location=' || replace(d.name,' ','%20'), d.hero_image,
  'Private campgrounds, cabins and glamping just outside the park, often with availability when park sites sell out.', true
FROM public.destinations d WHERE d.status='published'
UNION ALL
SELECT d.id, 'stay'::public.offer_category, 'RV Park', 'RV parks near ' || d.name || ' on RoverPass', 'roverpass', 'awin', 32065,
  'https://www.roverpass.com/search?q=' || replace(d.name,' ','%20'), d.hero_image,
  'Book RV parks and campgrounds online with full hookups near the park.', true
FROM public.destinations d WHERE d.status='published'
UNION ALL
SELECT d.id, 'stay'::public.offer_category, 'RV Park', 'Harvest Hosts stays on the way to ' || d.name, 'harvest_hosts', 'awin', 111454,
  'https://www.harvesthosts.com', d.hero_image,
  'Membership for overnight RV stays at farms, wineries and other unique spots along your route.', true
FROM public.destinations d WHERE d.status='published'
UNION ALL
SELECT d.id, 'rv_rental'::public.offer_category, 'Car rental', 'Car rentals at ' || coalesce(d.nearest_airport_code, 'the nearest airport'), 'rentcars', 'awin', 18808,
  'https://www.rentcars.com/en/', d.hero_image,
  'Compare rental companies at the nearest airport in one search.', true
FROM public.destinations d WHERE d.status='published'
UNION ALL
SELECT d.id, 'gear_purchase'::public.offer_category, 'Power', 'Jackery Portable Power Station', 'jackery', 'awin', 59183,
  'https://www.jackery.com', NULL,
  'Keeps phones, lights and a cooler charged at campsites without hookups.', true
FROM public.destinations d WHERE d.status='published';

INSERT INTO public.offers (destination_id, category, title, partner, network, network_mid, external_url, price_display, commissionable) VALUES
 (NULL,'insurance','Travel Insurance','generali','awin',49127,'https://www.generalitravelinsurance.com/','Get a quote',true),
 (NULL,'esim','Global eSIM Data','bnesim','awin',99589,'https://bnesim.com','View plans',true),
 (NULL,'offline_maps','Offline Trail Maps','outdooractive','awin',29649,'https://www.outdooractive.com/en/','View options',true),
 (NULL,'car_rental','Car Rental','rentcars','awin',18808,'https://www.rentcars.com/en/','Compare prices',true);