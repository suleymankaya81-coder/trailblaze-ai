ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS trip_tags text[] NOT NULL DEFAULT '{}';

-- First-pass heuristic tagging computed from each destination's own data
-- (region/name keywords, camping_score, trip_duration_days, and its
-- offers' category/subcategory mix) — not hand-curated. Review and adjust
-- individual rows as needed; this just gets every destination unblocked
-- for the Plan Builder rather than leaving trip_tags empty for all 20.
UPDATE public.destinations d
SET trip_tags = array_remove(
  ARRAY[
    CASE
      WHEN d.trip_duration_days ILIKE '%2%' OR d.trip_duration_days ILIKE '%weekend%'
      THEN 'weekend-escape'
    END,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM public.offers o
        WHERE o.destination_id = d.id AND o.category = 'rv_rental'
      )
      THEN 'rv-road-trip'
    END,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM public.offers o
        WHERE o.destination_id = d.id
          AND (o.subcategory ILIKE '%glamp%' OR o.category = 'stay' AND o.subcategory ILIKE '%glamp%')
      )
      THEN 'glamping-getaway'
    END,
    CASE
      WHEN d.camping_score IS NOT NULL AND d.camping_score >= 7
      THEN 'family-camping'
    END,
    CASE
      WHEN d.region ILIKE '%mountain%' OR d.name ILIKE '%mountain%'
        OR d.name ILIKE '%tahoe%' OR d.name ILIKE '%glacier%' OR d.name ILIKE '%yosemite%'
      THEN 'mountain-escape'
    END,
    CASE
      WHEN d.region ILIKE '%desert%' OR d.name ILIKE '%desert%' OR d.name ILIKE '%canyon%'
        OR d.name ILIKE '%arches%' OR d.name ILIKE '%zion%' OR d.name ILIKE '%moab%'
      THEN 'desert-adventure'
    END
  ],
  NULL
);
