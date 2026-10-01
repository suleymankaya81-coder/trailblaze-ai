DO $$ BEGIN
  CREATE TYPE public.landing_page_type AS ENUM
    ('destination','camping','rv_rental','glamping','trip_planner','lodging','activities','transportation','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.landing_content_status AS ENUM ('draft','ready','published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.landing_publication_status AS ENUM ('draft','published','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.seo_landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid NOT NULL REFERENCES public.destinations(id) ON DELETE RESTRICT,
  path text NOT NULL,
  page_type public.landing_page_type NOT NULL,
  target_keyword text,
  search_volume integer CHECK (search_volume IS NULL OR search_volume >= 0),
  keyword_difficulty numeric CHECK (keyword_difficulty IS NULL OR (keyword_difficulty >= 0 AND keyword_difficulty <= 100)),
  priority integer NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  intro_content text,
  content_sections jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(content_sections) = 'array'),
  inventory_filter jsonb CHECK (inventory_filter IS NULL OR jsonb_typeof(inventory_filter) = 'object'),
  inventory_requirements jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(inventory_requirements) = 'object'),
  content_status public.landing_content_status NOT NULL DEFAULT 'draft',
  status public.landing_publication_status NOT NULL DEFAULT 'draft',
  indexable boolean NOT NULL DEFAULT false,
  noindex_reason text,
  canonical_url text,
  published_at timestamptz,
  last_content_reviewed_at timestamptz,
  schema_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT seo_landing_pages_path_format
    CHECK (path ~ '^/[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT seo_landing_pages_path_not_reserved
    CHECK (path NOT IN ('/destinations','/search','/about','/contact','/privacy','/terms',
                        '/affiliate-disclosure','/sitemap','/robots','/go','/out','/api','/auth')),
  CONSTRAINT seo_landing_pages_canonical_absolute
    CHECK (canonical_url IS NULL OR canonical_url ~ '^https://')
);

CREATE UNIQUE INDEX IF NOT EXISTS seo_landing_pages_path_key ON public.seo_landing_pages (path);
CREATE INDEX IF NOT EXISTS seo_landing_pages_destination_idx ON public.seo_landing_pages (destination_id);
CREATE INDEX IF NOT EXISTS seo_landing_pages_published_idx
  ON public.seo_landing_pages (destination_id, priority DESC) WHERE status = 'published';

GRANT SELECT ON public.seo_landing_pages TO anon, authenticated;
GRANT ALL ON public.seo_landing_pages TO service_role;
ALTER TABLE public.seo_landing_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published landing pages are publicly readable" ON public.seo_landing_pages;
CREATE POLICY "Published landing pages are publicly readable"
  ON public.seo_landing_pages FOR SELECT TO anon, authenticated
  USING (
    status = 'published'
    AND EXISTS (SELECT 1 FROM public.destinations d
                WHERE d.id = seo_landing_pages.destination_id AND d.status = 'published')
  );

DROP TRIGGER IF EXISTS update_seo_landing_pages_updated_at ON public.seo_landing_pages;
CREATE TRIGGER update_seo_landing_pages_updated_at
  BEFORE UPDATE ON public.seo_landing_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();