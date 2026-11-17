"""AI-assisted completion of the remaining FR/PT/GR catalog places.
Gemini only chooses among real candidates (Wikipedia article titles, Commons cover files);
all text still comes verbatim from the chosen article (quoted_bundle), coordinates from the
article/Wikidata and routes from OSRM. Writes prepared bundles; publish-fr-pt-gr.py publishes.
Run from project root: python3 scripts/content-pipeline/ai-finish-fr-pt-gr.py
"""
import importlib.util, json, re, sys
from pathlib import Path
from urllib.parse import urlencode
sys.path.insert(0, str(Path(__file__).parent))
import europe_prepare as prepare
from europe_discovery import get
from gateway_call import call_ai_json

ROOT = Path(__file__).parent
OUT = ROOT / 'fr-pt-gr-completion'
OVERSEAS = {'reunion': 'RE', 'guadeloupe': 'GP', 'guyane': 'GF', 'guiana': 'GF', 'mayotte': 'YT', 'martinique': 'MQ'}
prepare.EXTRA_COUNTRIES = tuple(prepare.EXTRA_COUNTRIES) + ('FR', 'PT', 'GR', 'RE', 'GP', 'GF', 'YT', 'MQ')

def module(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / filename)
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

fin = module('fin', 'finish-fr-pt-gr.py')
comp = module('comp', 'complete-fr-pt-gr-drafts.py')
german = module('ger', 'audit-dach.py')

def search(lang, term, cache):
    q = {'action': 'query', 'format': 'json', 'list': 'search', 'srsearch': term, 'srlimit': 6}
    return [(lang, r['title']) for r in json.loads(get(f'https://{lang}.wikipedia.org/w/api.php?' + urlencode(q), cache)['body'])['query']['search']]

def candidates(row, local, cache):
    out = []
    if row.get('wikidata'):
        try:
            e = json.loads(get(f"https://www.wikidata.org/wiki/Special:EntityData/{row['wikidata']}.json", cache)['body'])['entities']
            e = next(iter(e.values()))
            out += [(k[:-4], v['title']) for k, v in e.get('sitelinks', {}).items() if k[:-4] in ('en', local, 'fr', 'de')]
        except Exception:
            pass
    for lang in ('en', local):
        try: out += search(lang, row['name'], cache)
        except Exception: pass
    return list(dict.fromkeys(out))

def pick_article(row, cands):
    listing = '\n'.join(f'{i}: [{l}] {t}' for i, (l, t) in enumerate(cands))
    r = call_ai_json(f"Destination: {row['name']} ({row['kind']}, region {row['region']}, country {row['country']}).\n"
                     f"Which Wikipedia article is exactly this place (prefer the article about the protected area/site itself)? "
                     f"Answer {{\"index\": n}} or {{\"index\": null}} if none matches.\n{listing}")
    return None if r.get('index') is None else cands[int(r['index'])]

def pick_cover(row, photos):
    listing = '\n'.join(f"{i}: {p['file']} — {p['subject']}" for i, p in enumerate(photos))
    r = call_ai_json(f"Pick a landscape cover photo that clearly shows {row['name']} ({row['country']}). Reject maps, logos, "
                     f"buildings unrelated to the site, people portraits and other places. Answer {{\"index\": n}} or {{\"index\": null}}.\n{listing}")
    return None if r.get('index') is None else photos[int(r['index'])]

def article_images(page_title, lang):
    j = prepare.api(f'{lang}.wikipedia.org', action='query', titles=page_title, prop='images', imlimit=40)
    files = [i['title'] for i in j['query']['pages'][0].get('images', []) if re.search(r'\.(jpe?g|png)$', i['title'], re.I)]
    out = []
    for f in files[:25]:
        if prepare.BAD.search(f): continue
        info = prepare.file_info(f)
        if info and info['w'] >= 1000: out.append(info)
    return out

def main():
    done = {p.stem for p in OUT.glob('*.json')}
    used = {json.loads(p.read_text()).get('hero', {}).get('original_url') for p in OUT.glob('*.json') if p.stem not in ('assignments', 'photo-review')}
    rows = json.loads((ROOT / 'france/catalog.json').read_text()) + [r for r in json.loads((ROOT / 'south-europe/catalog.json').read_text()) if r['country'] in ('pt', 'gr')]
    for row in rows:
        slug, cc = row['slug'], row['country']
        if slug in done and json.loads((OUT / f'{slug}.json').read_text()).get('status') == 'prepared':
            continue
        cfg = fin.COUNTRIES[cc]
        try:
            cands = candidates(row, cfg['local_lang'], cfg['cache'])
            choice = pick_article(row, cands) if cands else None
            if not choice: raise ValueError('AI found no matching article')
            lang, title = choice
            page = fin.fetch_article(title, lang, cfg['cache'])
            text = page.get('extract', '').strip()
            name0 = page['title'].split(' (')[0]
            excerpt, name = fin.find_excerpt(text, name0)
            if excerpt is None: raise ValueError('article never names place')
            url = f"https://{lang}.wikipedia.org/wiki/" + fin.quote(page['title'].replace(' ', '_'))
            packet = {'slug': slug, 'approved_for_generation': True, 'country_code': cc, 'evidence_policy': 'dach-wikipedia-overview',
                      'identity_verified': True, 'review_note': 'AI-selected Wikipedia article among search/sitelink candidates; descriptive overview only.',
                      'sources': [{'url': url, 'kind': 'wikipedia', 'text': text, 'generation_excerpts': [excerpt], 'language': lang}],
                      'approved_stops': [{'id': slug, 'name': name, 'quote': excerpt, 'source_url': url}]}
            ov = next((v for k, v in OVERSEAS.items() if k in slug or k in row['region']), None)
            coords = page.get('coordinates') or []
            if coords: lat, lng = coords[0]['lat'], coords[0]['lon']
            elif row.get('lat') is not None: lat, lng = row['lat'], row['lng']
            else: raise ValueError('no coordinates')
            if not ov:
                lo, hi, lo2, hi2 = cfg['bounds']
                if not (lo <= lat <= hi and lo2 <= lng <= hi2): raise ValueError('coordinates outside country')
            photos = [p for p in article_images(page['title'], lang) + prepare.commons_search(name0, limit=15)
                      if p['url'] not in used and comp.licensed(p)]
            photos = list({p['file']: p for p in photos}.values())[:30]
            photo = pick_cover(row, photos) if photos else None
            if not photo: raise ValueError('no licensed cover')
            ferry = 'boat' in (row.get('access') or '')
            try:
                airport, route = fin.resolve_route(lat, lng, ov or cc)
            except ValueError:
                airport = prepare.airports(lat, lng, n=1, country=ov or cc)[0]
                if not ferry: raise
                route = {'minutes': None, 'miles': None, 'coords': [[airport['lng'], airport['lat']], [round(lng, 5), round(lat, 5)]]}
            bundle = comp.english_bundle(row, packet, lang, fin.validate_bundle(fin.quoted_bundle(row, packet), slug, fin.compact_packet(packet)))
            hero = comp.upload_photo(slug, photo)
            s, t = bundle['summary'], bundle['travel']
            payload = {k: v for k, v in s.items() if k != 'activities'}
            payload.update(hero_image=hero['url'], photo_credit=f"Hero: {hero['credit']} / {hero['license']} via Wikimedia Commons ({hero['source']})",
                           gallery=[], seo_description=s['tagline'], lat=lat, lng=lng, nearest_airport_code=airport['code'],
                           nearest_airport_name=airport['name'], airport_lat=airport['lat'], airport_lng=airport['lng'],
                           drive_minutes=route['minutes'], drive_miles=route['miles'], travel_plan=t['plan'],
                           permit_headline=t['headline'], permit_note=t['reservation'], permit_source_url=t['source_url'])
            item = dict(slug=slug, country=cc, status='prepared', hero=hero, coordinate_source='wikipedia/catalog', coordinate_evidence=url,
                        route=route, packet=packet, bundle=bundle, payload=payload)
            item['german'] = german.translate_row({'name': row['name'], **payload})
            (OUT / f'{slug}.json').write_text(json.dumps(item, ensure_ascii=False, indent=2))
            used.add(photo['url'])
            print(slug, 'prepared', title, flush=True)
        except Exception as error:
            print(slug, 'HELD', repr(error)[:200], flush=True)

if __name__ == '__main__':
    main()
