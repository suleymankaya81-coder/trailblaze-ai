ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS destination_type text,
  ADD COLUMN IF NOT EXISTS tier text,
  ADD COLUMN IF NOT EXISTS parent_slug text,
  ADD COLUMN IF NOT EXISTS gateway_cities text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS experience_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS best_seasons text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS recommended_duration text,
  ADD COLUMN IF NOT EXISTS relevance jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS affiliate_potential jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS inventory_priority text,
  ADD COLUMN IF NOT EXISTS homepage_eligible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS plan_builder_eligible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS seo_eligible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS primary_keyword text,
  ADD COLUMN IF NOT EXISTS secondary_keywords text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notes text;

CREATE INDEX IF NOT EXISTS destinations_state_idx ON public.destinations (state);
CREATE INDEX IF NOT EXISTS destinations_trip_tags_idx ON public.destinations USING gin (trip_tags);