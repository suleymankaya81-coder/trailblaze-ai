-- Validate click event inserts
ALTER TABLE public.click_events
  ALTER COLUMN offer_id SET NOT NULL;

ALTER TABLE public.click_events
  DROP CONSTRAINT IF EXISTS click_events_outcome_check,
  ADD CONSTRAINT click_events_outcome_check
    CHECK (outcome IS NULL OR outcome IN ('click','impression','conversion','error'));

ALTER TABLE public.click_events
  DROP CONSTRAINT IF EXISTS click_events_session_id_check,
  ADD CONSTRAINT click_events_session_id_check
    CHECK (session_id IS NULL OR char_length(session_id) BETWEEN 1 AND 128);

ALTER TABLE public.click_events
  DROP CONSTRAINT IF EXISTS click_events_referrer_page_check,
  ADD CONSTRAINT click_events_referrer_page_check
    CHECK (referrer_page IS NULL OR char_length(referrer_page) <= 512);

ALTER TABLE public.click_events
  DROP CONSTRAINT IF EXISTS click_events_destination_slug_check,
  ADD CONSTRAINT click_events_destination_slug_check
    CHECK (destination_slug IS NULL OR destination_slug ~ '^[a-z0-9-]{1,120}$');

DROP POLICY IF EXISTS "Anyone can record click events" ON public.click_events;

CREATE POLICY "Anyone can record valid click events"
  ON public.click_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.offers o WHERE o.id = click_events.offer_id)
    AND (
      destination_slug IS NULL
      OR EXISTS (SELECT 1 FROM public.destinations d WHERE d.slug = click_events.destination_slug)
    )
    AND "timestamp" BETWEEN now() - interval '5 minutes' AND now() + interval '5 minutes'
  );