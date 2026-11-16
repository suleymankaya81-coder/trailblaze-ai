"""Refresh stored German day texts for DACH places whose plan became multi-day.
Stop details reuse the original German source sentence when the source is German; other text is offline-translated (Argos en-de)."""
import json, os, hashlib
from pathlib import Path
import requests
from combined_content import module
ROOT = Path(__file__).parent; CACHE = ROOT / 'dach' / 'translations'
def de(text):
    path = CACHE / ('en-de-' + hashlib.sha256(text.encode()).hexdigest() + '.json')
    if path.exists(): return json.loads(path.read_text())['translated']
    import argostranslate.translate
    v = argostranslate.translate.translate(text, 'en', 'de'); path.write_text(json.dumps({'original': text, 'translated': v, 'method': 'Argos en-de offline'}, ensure_ascii=False)); return v
p = module('mg', 'prepare-wave.py')
key = os.environ['SUPABASE_SERVICE_ROLE_KEY']; H = {'apikey': key, 'Authorization': 'Bearer ' + key, 'Prefer': 'return=representation'}
slugs = [r['slug'] for c in ('de','at','ch') for r in json.loads((ROOT/f'multiday-result-{c}.json').read_text())['results'] if r['status'] == 'multiday']
n = 0
for slug in slugs:
    tr = json.loads(p.q(f"select coalesce(row_to_json(t),'null') from (select id, fields from content_translations where entity_type='destination' and entity_id='{slug}' and locale='de') t"))
    if not tr: continue
    plan = json.loads(p.q(f"select travel_plan from destinations where slug='{slug}'"))
    quotes = {s['id']: (s['quote'], s['source_url']) for s in json.loads((ROOT/'source-packets'/f'{slug}.json').read_text())['approved_stops']}
    days = [{'title': de(d['title']), 'start': de(d['start']), 'driving': de(d['driving']), 'note': tr['fields']['days'][0]['note'],
             'stops': [{'name': s['name'], 'detail': quotes[s['stop_id']][0] if s.get('stop_id') in quotes and 'de.wikipedia' in quotes[s['stop_id']][1] else de(s['detail'])} for s in d['stops']]} for d in plan['days']]
    fields = tr['fields'] | {'days': days}
    r = requests.patch(os.environ['SUPABASE_URL'] + '/rest/v1/content_translations', params={'id': 'eq.' + str(tr['id'])}, headers=H, json={'fields': fields}, timeout=60)
    r.raise_for_status(); n += 1
print('German day texts refreshed:', n, 'of', len(slugs))
