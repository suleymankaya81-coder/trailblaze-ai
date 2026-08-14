REVOKE EXECUTE ON FUNCTION public.save_trip_plan(text, text) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_trip_plan(text, text) TO service_role;