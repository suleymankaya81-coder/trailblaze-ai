DROP POLICY IF EXISTS "Destinations are publicly readable" ON public.destinations;
DROP POLICY IF EXISTS "Published destinations are publicly readable" ON public.destinations;
CREATE POLICY "Published destinations are publicly readable"
  ON public.destinations FOR SELECT TO anon, authenticated
  USING (status = 'published');