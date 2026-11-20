CREATE OR REPLACE FUNCTION public.save_trip_plan(p_email text, p_destination_slug text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
  ON CONFLICT (lower(email), destination_slug) DO NOTHING;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.save_trip_plan(text, text) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_trip_plan(text, text) TO service_role;