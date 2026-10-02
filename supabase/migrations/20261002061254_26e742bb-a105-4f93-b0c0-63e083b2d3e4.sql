ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS photo_credit text;

DO $$ BEGIN
  ALTER TABLE public.destinations ADD CONSTRAINT destinations_published_hero_required
    CHECK (status <> 'published' OR coalesce(btrim(hero_image), '') <> '') NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TYPE public.landing_page_type ADD VALUE IF NOT EXISTS 'cabins';
ALTER TYPE public.landing_page_type ADD VALUE IF NOT EXISTS 'rv_parks';
ALTER TYPE public.landing_page_type ADD VALUE IF NOT EXISTS 'hotels';
ALTER TYPE public.landing_page_type ADD VALUE IF NOT EXISTS 'things_to_do';
ALTER TYPE public.landing_page_type ADD VALUE IF NOT EXISTS 'hiking';
ALTER TYPE public.landing_page_type ADD VALUE IF NOT EXISTS 'best_time';
ALTER TYPE public.landing_page_type ADD VALUE IF NOT EXISTS 'near_city';

CREATE OR REPLACE FUNCTION public.validate_landing_page_path()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  d record;
  tokens text := '-' || substr(NEW.path, 2) || '-';
  ok boolean := false;
  a text;
BEGIN
  SELECT slug, name, aliases INTO d FROM public.destinations WHERE id = NEW.destination_id;
  IF d IS NULL THEN RAISE EXCEPTION 'Unknown destination'; END IF;
  IF tokens LIKE '%-' || d.slug || '-%' THEN ok := true; END IF;
  IF NOT ok THEN
    FOREACH a IN ARRAY (d.aliases || d.name) LOOP
      a := trim(both '-' from regexp_replace(lower(a), '[^a-z0-9]+', '-', 'g'));
      IF a <> '' AND tokens LIKE '%-' || a || '-%' THEN ok := true; EXIT; END IF;
    END LOOP;
  END IF;
  IF NOT ok THEN
    RAISE EXCEPTION 'Landing page path % must contain the destination slug, name or an alias', NEW.path;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS validate_seo_landing_page_path ON public.seo_landing_pages;
CREATE TRIGGER validate_seo_landing_page_path
  BEFORE INSERT OR UPDATE OF path, destination_id ON public.seo_landing_pages
  FOR EACH ROW EXECUTE FUNCTION public.validate_landing_page_path();