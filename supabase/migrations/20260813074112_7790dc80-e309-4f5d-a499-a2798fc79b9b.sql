UPDATE public.offers
SET external_url = 'https://glampinghub.com/rentalsearch/?q=' ||
  replace(initcap(replace(regexp_replace(external_url, '^https://glampinghub\.com/unitedstates/([a-z-]+)/?$', '\1'), '-', ' ')), ' ', '%20')
WHERE partner = 'glamping_hub' AND external_url LIKE 'https://glampinghub.com/unitedstates/%';