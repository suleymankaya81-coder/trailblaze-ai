ALTER TABLE public.offers ALTER COLUMN destination_id DROP NOT NULL;

ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS commissionable boolean NOT NULL DEFAULT true;

ALTER TYPE public.offer_category ADD VALUE IF NOT EXISTS 'insurance';
ALTER TYPE public.offer_category ADD VALUE IF NOT EXISTS 'esim';
ALTER TYPE public.offer_category ADD VALUE IF NOT EXISTS 'offline_maps';
ALTER TYPE public.offer_category ADD VALUE IF NOT EXISTS 'car_rental';
ALTER TYPE public.offer_category ADD VALUE IF NOT EXISTS 'travel_card';
ALTER TYPE public.offer_category ADD VALUE IF NOT EXISTS 'park_pass';