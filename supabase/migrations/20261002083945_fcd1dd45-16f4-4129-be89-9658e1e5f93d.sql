ALTER TABLE public.seo_landing_pages
  ADD COLUMN IF NOT EXISTS cover_image text,
  ADD COLUMN IF NOT EXISTS cover_photo_credit text,
  ADD COLUMN IF NOT EXISTS cover_photo_source text,
  ADD COLUMN IF NOT EXISTS cover_photo_license text;

CREATE UNIQUE INDEX IF NOT EXISTS seo_landing_pages_cover_image_unique
  ON public.seo_landing_pages (cover_image)
  WHERE cover_image IS NOT NULL;

CREATE OR REPLACE FUNCTION public.validate_landing_cover_image()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  destination_cover text;
BEGIN
  IF NEW.cover_image IS NOT NULL THEN
    SELECT hero_image INTO destination_cover FROM public.destinations WHERE id = NEW.destination_id;
    IF NEW.cover_image = destination_cover THEN
      RAISE EXCEPTION 'A landing page cover cannot repeat its destination cover';
    END IF;
    IF NEW.cover_image !~ '^https://' THEN
      RAISE EXCEPTION 'Landing page covers require an https URL';
    END IF;
    IF coalesce(btrim(NEW.cover_photo_credit), '') = '' OR
       coalesce(btrim(NEW.cover_photo_source), '') = '' OR
       coalesce(btrim(NEW.cover_photo_license), '') = '' THEN
      RAISE EXCEPTION 'Landing page covers require credit, source and license';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_seo_landing_cover_image
BEFORE INSERT OR UPDATE ON public.seo_landing_pages
FOR EACH ROW EXECUTE FUNCTION public.validate_landing_cover_image();