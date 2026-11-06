CREATE TABLE public.content_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  locale text NOT NULL,
  fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id, locale)
);
GRANT SELECT ON public.content_translations TO anon, authenticated;
GRANT ALL ON public.content_translations TO service_role;
ALTER TABLE public.content_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published translations are public" ON public.content_translations
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE INDEX content_translations_locale_idx ON public.content_translations (locale, entity_type, status);