ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'us',
  ADD COLUMN IF NOT EXISTS region_slug text,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';

UPDATE public.destinations
SET region_slug = trim(both '-' from regexp_replace(lower(state), '[^a-z0-9]+', '-', 'g'))
WHERE state IS NOT NULL AND region_slug IS NULL;

CREATE INDEX IF NOT EXISTS destinations_country_region_idx ON public.destinations (country_code, region_slug);

CREATE TABLE public.regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL,
  slug text NOT NULL,
  name text NOT NULL,
  intro text,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country_code, slug)
);

GRANT SELECT ON public.regions TO anon, authenticated;
GRANT ALL ON public.regions TO service_role;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published regions are public" ON public.regions
  FOR SELECT TO anon, authenticated USING (status = 'published');

CREATE TRIGGER regions_updated_at BEFORE UPDATE ON public.regions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.regions (country_code, slug, name)
SELECT DISTINCT 'us', region_slug, state FROM public.destinations
WHERE region_slug IS NOT NULL
ON CONFLICT DO NOTHING;