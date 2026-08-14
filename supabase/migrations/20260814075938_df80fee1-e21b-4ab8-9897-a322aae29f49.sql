ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS trip_tags text[] NOT NULL DEFAULT '{}';

UPDATE public.destinations SET trip_tags = v.tags
FROM (VALUES
  ('acadia', ARRAY['national_park','coastal','family']),
  ('asheville', ARRAY['mountain','rv_road_trip','glamping','family']),
  ('big-sur', ARRAY['coastal','rv_road_trip','glamping','weekend']),
  ('bryce-canyon', ARRAY['national_park','desert','weekend']),
  ('glacier', ARRAY['national_park','mountain','rv_road_trip']),
  ('grand-canyon', ARRAY['national_park','desert','family']),
  ('grand-teton', ARRAY['national_park','mountain','lake']),
  ('great-smoky-mountains', ARRAY['national_park','mountain','family','glamping']),
  ('joshua-tree', ARRAY['national_park','desert','weekend','glamping']),
  ('lake-tahoe', ARRAY['lake','mountain','family']),
  ('moab', ARRAY['desert','national_park','rv_road_trip','glamping']),
  ('mount-rainier', ARRAY['national_park','mountain','family']),
  ('olympic', ARRAY['national_park','coastal','mountain','rv_road_trip']),
  ('outer-banks', ARRAY['coastal','family','rv_road_trip']),
  ('rocky-mountain', ARRAY['national_park','mountain','family']),
  ('sedona', ARRAY['desert','glamping','family']),
  ('shenandoah', ARRAY['national_park','mountain','weekend','rv_road_trip']),
  ('yellowstone', ARRAY['national_park','mountain','rv_road_trip','family']),
  ('yosemite', ARRAY['national_park','mountain','family']),
  ('zion', ARRAY['national_park','desert','glamping'])
) AS v(slug, tags)
WHERE public.destinations.slug = v.slug;