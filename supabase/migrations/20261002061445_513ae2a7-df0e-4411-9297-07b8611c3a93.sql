CREATE UNIQUE INDEX IF NOT EXISTS destinations_published_hero_unique
  ON public.destinations (hero_image) WHERE status = 'published';
ALTER TABLE public.destinations VALIDATE CONSTRAINT destinations_published_hero_required;