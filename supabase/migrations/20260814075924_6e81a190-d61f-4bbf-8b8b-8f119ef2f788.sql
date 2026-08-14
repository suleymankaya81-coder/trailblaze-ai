CREATE TABLE public.saved_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  destination_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_plans
  ADD CONSTRAINT saved_plans_email_check
    CHECK (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  ADD CONSTRAINT saved_plans_destination_slug_check
    CHECK (destination_slug ~ '^[a-z0-9-]{1,120}$');

CREATE UNIQUE INDEX saved_plans_email_destination_idx
  ON public.saved_plans (lower(email), destination_slug);

ALTER TABLE public.saved_plans ENABLE ROW LEVEL SECURITY;

-- No RLS policies and no direct grants for anon/authenticated: with RLS
-- enabled and zero policies, every direct table operation (including
-- SELECT and INSERT) is denied by default. The only way in is the
-- SECURITY DEFINER function below, which anon/authenticated may only
-- execute, never query.
REVOKE ALL ON public.saved_plans FROM anon, authenticated;
GRANT ALL ON public.saved_plans TO service_role;

CREATE OR REPLACE FUNCTION public.save_trip_plan(p_email text, p_destination_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_email IS NULL OR p_email !~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;

  IF p_destination_slug IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.destinations d WHERE d.slug = p_destination_slug
  ) THEN
    RAISE EXCEPTION 'Invalid destination';
  END IF;

  INSERT INTO public.saved_plans (email, destination_slug)
  VALUES (lower(trim(p_email)), p_destination_slug)
  ON CONFLICT (lower(email), destination_slug)
  DO UPDATE SET created_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.save_trip_plan(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_trip_plan(text, text) TO anon, authenticated;