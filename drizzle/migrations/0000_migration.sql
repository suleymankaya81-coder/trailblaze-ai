CREATE OR REPLACE FUNCTION public._fix_mojibake(t text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE m text; fixed text;
BEGIN
  IF t IS NULL OR t !~ '[\u00c2-\u00f4][\u0080-\u00bf]' THEN RETURN t; END IF;
  FOR m IN SELECT DISTINCT (regexp_matches(t, '[\u00c2-\u00f4][\u0080-\u00bf]+', 'g'))[1] LOOP
    BEGIN
      fixed := convert_from(convert_to(m, 'LATIN1'), 'UTF8');
      t := replace(t, m, fixed);
    EXCEPTION WHEN others THEN NULL;
    END;
  END LOOP;
  RETURN t;
END $$;

CREATE OR REPLACE FUNCTION public._fix_mojibake_json(j jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE s text; i int;
BEGIN
  IF j IS NULL THEN RETURN j; END IF;
  s := j::text;
  FOR i IN 128..159 LOOP
    s := replace(s, '\u' || lpad(to_hex(i), 4, '0'), chr(i));
  END LOOP;
  RETURN public._fix_mojibake(s)::jsonb;
END $$;

UPDATE public.destinations SET
  best_season = public._fix_mojibake(best_season),
  tagline = public._fix_mojibake(tagline),
  seo_title = public._fix_mojibake(seo_title),
  seo_description = public._fix_mojibake(seo_description),
  region = public._fix_mojibake(region),
  recommended_duration = public._fix_mojibake(recommended_duration),
  photo_credit = public._fix_mojibake(photo_credit),
  nearest_airport_name = public._fix_mojibake(nearest_airport_name),
  notes = public._fix_mojibake(notes)
WHERE row_to_json(destinations)::text ~ '[\u00c2-\u00f4]';

UPDATE public.seo_landing_pages SET
  seo_title = public._fix_mojibake(seo_title),
  seo_description = public._fix_mojibake(seo_description),
  intro_content = public._fix_mojibake(intro_content),
  cover_photo_credit = public._fix_mojibake(cover_photo_credit),
  content_sections = public._fix_mojibake_json(content_sections);

UPDATE public.offers SET
  title = public._fix_mojibake(title),
  description = public._fix_mojibake(description),
  why_recommended = public._fix_mojibake(why_recommended),
  price_display = public._fix_mojibake(price_display),
  duration = public._fix_mojibake(duration);

DROP FUNCTION public._fix_mojibake_json(jsonb);
DROP FUNCTION public._fix_mojibake(text);

DROP POLICY IF EXISTS "Offers of published destinations are publicly readable" ON public.offers;
CREATE POLICY "Offers of published destinations are publicly readable" ON public.offers
  FOR SELECT TO anon, authenticated
  USING (destination_id IS NULL OR EXISTS (SELECT 1 FROM public.destinations d WHERE d.id = offers.destination_id AND d.status = 'published'));