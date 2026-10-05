DROP POLICY IF EXISTS "Offers are publicly readable" ON public.offers;
CREATE POLICY "Offers of published destinations are publicly readable" ON public.offers
FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.destinations d WHERE d.id = offers.destination_id AND d.status = 'published'));