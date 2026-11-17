"""Publish every prepared FR/PT/GR bundle: create missing drafts, write payload, German text,
route line and partner offers, then hand off to publish-wave.py checks.
Run from project root: python3 scripts/content-pipeline/publish-fr-pt-gr.py [--apply]
"""
import json, os, sys, urllib.parse, subprocess
from pathlib import Path
import requests

ROOT = Path(__file__).parent
OUT = ROOT / 'fr-pt-gr-completion'
REST = os.environ['SUPABASE_URL'] + '/rest/v1'
SK = os.environ['SUPABASE_SERVICE_ROLE_KEY']
H = {'apikey': SK, 'Authorization': f'Bearer {SK}', 'Content-Type': 'application/json'}
MHR = {'fr': 'france', 'pt': 'portugal', 'gr': 'greece'}
COLS = None

def rq(method, path, **kw):
    r = requests.request(method, f'{REST}/{path}', headers={**H, **kw.pop('headers', {})}, **kw)
    if not r.ok:
        raise ValueError(f'{path}: {r.status_code} {r.text[:300]}')
    return r.json() if r.text else None

def catalog():
    rows = json.loads((ROOT / 'france/catalog.json').read_text())
    rows += [r for r in json.loads((ROOT / 'south-europe/catalog.json').read_text()) if r['country'] in ('pt', 'gr')]
    return {r['slug']: r for r in rows}

def offers(dest_id, name, code, cc, plan):
    acts = list(dict.fromkeys(s['name'] for d in plan['days'] for s in d['stops']))[:3]
    mhr = f'https://www.motorhomerepublic.com/{MHR[cc]}/'
    rows = [
        ('rv_rental', 'airport_rentals', None, None, 'Car rental', f'Standard car rentals at {code}', 'https://www.airportrentals.com/?affiliate=minialife', 'Compare rental companies at the nearest airport in one search.', None),
        ('rv_rental', 'motorhome_republic', None, None, 'RV', 'Class C Motorhome — Sleeps 4', mhr, 'Wake up wherever the view is best — no check-in desk, no curfew.', 'Full kitchen, comfortable bed, fits scenic roads without stress.'),
        ('rv_rental', 'motorhome_republic', None, None, 'Campervan', 'Campervan Adventure Van', mhr, 'Small enough to park at the trailhead, comfy enough to sleep in.', 'Fold-out bed, parks almost anywhere.'),
    ]
    for a in acts:
        rows.append(('activity', 'viator', 'awin', 11018, 'Activity', a, 'https://www.viator.com/searchResults/all?text=' + urllib.parse.quote(f'{name} {a}'), f'One of the classic ways to experience {name}.', f'Compare guided and bookable options for {a} on Viator.'))
    rows.append(('gear_purchase', 'jackery', 'awin', 59183, 'Power', 'Jackery Portable Power Station', 'https://www.jackery.com', 'Keeps phones, lights and a cooler charged at campsites without hookups.', None))
    for t, why, desc in [('Insulated 32oz Bottle', 'One fill in the morning is all most day hikes need.', 'Stays cold 24h on the trail.'),
                         ('Merino Base Layer', 'Handles big temperature swings between sunrise and lunch.', 'Warm at dawn, breathable by noon.'),
                         ('Headlamp 400 Lumen', 'The difference between finishing a sunset hike and turning back early.', 'Hands-free after dark.'),
                         ('Pocket First-Aid Kit', 'Small now beats cutting a trip short over a blister.', 'The one thing you will wish you packed.'),
                         ('Packable Down Jacket', 'Weighs nothing in your pack and saves every cold evening.', 'Fits in its own pocket.')]:
        rows.append(('gear_purchase', 'rei', None, None, 'Essential', t, 'https://www.rei.com/search?q=' + urllib.parse.quote(t), why, desc))
    keys = ['category', 'partner', 'network', 'network_mid', 'subcategory', 'title', 'external_url', 'why_recommended', 'description']
    return [{'destination_id': dest_id, **dict(zip(keys, r))} for r in rows]

def main():
    apply = '--apply' in sys.argv
    cat = catalog()
    cols = set(rq('GET', 'destinations?limit=1&select=*')[0].keys())
    routes_path = Path('src/data/routes.json')
    routes = json.loads(routes_path.read_text())
    slugs = []
    for path in sorted(OUT.glob('*.json')):
        item = json.loads(path.read_text())
        if not isinstance(item, dict) or item.get('status') != 'prepared' or item['slug'] not in cat:
            continue
        slug, row, p = item['slug'], cat[item['slug']], item['payload']
        cc = row['country']
        existing = rq('GET', f'destinations?slug=eq.{slug}&select=id,status')
        if existing and existing[0]['status'] == 'published':
            continue
        if not apply:
            print(slug, 'would publish'); continue
        if not existing:
            region = row['region']
            if not rq('GET', f'regions?country_code=eq.{cc}&slug=eq.{region}&select=id'):
                rq('POST', 'regions', json={'country_code': cc, 'slug': region, 'name': region.replace('-', ' ').title(), 'status': 'draft'})
            rq('POST', 'destinations', json={'slug': slug, 'name': row['name'], 'state': region.replace('-', ' ').title(),
                'country_code': cc, 'region_slug': region, 'currency': 'EUR', 'park_authority': row.get('official_site') or '',
                'access_type': 'ferry' if 'boat' in (row.get('access') or '') else 'road', 'destination_type': row['kind'], 'status': 'draft', 'tier': 'tier1', 'seo_eligible': False})
            rq('PATCH', f'destinations?slug=eq.{slug}', json={k: v for k, v in p.items() if k in cols})
        dest_id = rq('GET', f'destinations?slug=eq.{slug}&select=id')[0]['id']
        rq('DELETE', f'offers?destination_id=eq.{dest_id}')
        rq('POST', 'offers', json=offers(dest_id, row['name'], p['nearest_airport_code'], cc, p['travel_plan']))
        if item.get('route') and item['route'].get('coords'):
            routes[slug] = item['route']['coords']
        if item.get('german'):
            rq('POST', 'content_translations?on_conflict=entity_type,entity_id,locale', headers={'Prefer': 'resolution=merge-duplicates'},
               json={'entity_type': 'destination', 'entity_id': slug, 'locale': 'de', 'fields': item['german'], 'status': 'draft'})
        slugs.append(slug)
        print(slug, 'staged', flush=True)
    routes_path.write_text(json.dumps(routes, separators=(',', ':')))
    if apply and slugs:
        out = subprocess.run([sys.executable, str(ROOT / 'publish-wave.py'), *slugs], capture_output=True, text=True, cwd='.',
                             env={**os.environ, 'PYTHONPATH': str(ROOT)})
        print(out.stdout[-6000:], out.stderr[-2000:])
        live = [l.split()[0] for l in out.stdout.splitlines() if l.endswith(' published')]
        geo_path = Path('src/data/destination-geo.json'); geo = json.loads(geo_path.read_text())
        for s in live:
            geo[s] = cat[s]['country'] + '/' + rq('GET', f'destinations?slug=eq.{s}&select=region_slug')[0]['region_slug']
        geo_path.write_text(json.dumps(dict(sorted(geo.items())), separators=(',', ':')))
        for s in live:
            rq('PATCH', f'content_translations?entity_type=eq.destination&entity_id=eq.{s}&locale=eq.de', json={'status': 'published', 'reviewed_at': 'now()'})

if __name__ == '__main__':
    main()
