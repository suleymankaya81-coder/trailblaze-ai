"""Nordic page production template (NO, IS, SE, FI, DK — all 658 catalog places).

Stages (run `setup` once per machine to install offline translation models; each resumable; results cached per place in nordic/completion/<slug>.json):
  facts      0 credits  Wikidata/Wikipedia identity, verbatim article excerpt, coordinates,
                        licensed Commons cover, nearest airport + OSRM route, region (OSM).
                        No language model: identity comes from the QID, catalog enwiki title,
                        or a Wikipedia search hit whose title shares a distinctive name word.
  translate  0 credits  English display text for local-language excerpts and the German
                        version, both via offline Argos (cached).
  publish    0 credits  Writes destination, offers, route line and German text, then runs
                        publish-wave.py checks; passing places go live immediately.
  plan       low cost   multiday-europe.py: one cached Gemini Flash call per live place turns
                        the stored article into 1-3 verified days (quotes checked verbatim).
  all        facts -> translate -> publish -> plan

Usage (project root):
  python3 scripts/content-pipeline/nordic/produce.py <stage> [--country no,is] [--limit N] [--apply]
Without --apply, publish only lists what would go live. Held places keep their reason in the
cache file and report; rerun the same command after fixing the catalog row.
"""
import argparse, importlib.util, json, os, re, subprocess, sys, time
from pathlib import Path
from urllib.parse import urlencode, quote

HERE = Path(__file__).parent
PIPE = HERE.parent
sys.path.insert(0, str(PIPE))
import europe_prepare as prepare  # noqa: E402
from europe_discovery import get  # noqa: E402

CATALOGS = PIPE / 'claude-handoff/nordic'
OUT = HERE / 'completion'; OUT.mkdir(exist_ok=True)
CACHE = HERE / 'discovery-cache'; CACHE.mkdir(exist_ok=True)
REPORT = HERE / 'production-report.json'

# Country/territory settings. Bounds: (lat_min, lat_max, lng_min, lng_max).
COUNTRIES = {
    'no': dict(lang='no', currency='NOK', mhr='norway', name='Norway', bounds=(57.5, 71.5, 4.0, 31.5)),
    'is': dict(lang='en', currency='ISK', mhr='iceland', name='Iceland', bounds=(63.0, 67.2, -25.0, -13.0)),
    'se': dict(lang='sv', currency='SEK', mhr='sweden', name='Sweden', bounds=(55.0, 69.2, 10.5, 24.3)),
    'fi': dict(lang='fi', currency='EUR', mhr='finland', name='Finland', bounds=(59.5, 70.2, 19.0, 31.7)),
    'dk': dict(lang='da', currency='DKK', mhr='denmark', name='Denmark', bounds=(54.4, 57.9, 7.9, 15.3)),
}
TERRITORIES = {'sj': (74.0, 81.0, 10.0, 35.0), 'fo': (61.3, 62.5, -7.8, -6.2), 'gl': (59.0, 84.0, -74.0, -10.0)}
prepare.EXTRA_COUNTRIES = tuple(prepare.EXTRA_COUNTRIES) + ('NO', 'IS', 'SE', 'FI', 'DK', 'SJ', 'FO', 'GL')

def module(name, filename):
    spec = importlib.util.spec_from_file_location(name, PIPE / filename)
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

fin = module('fin', 'finish-fr-pt-gr.py')
comp = module('comp', 'complete-fr-pt-gr-drafts.py')
# Argos has no Icelandic model (Iceland uses English articles) and names Norwegian Bokmål 'nb'.
_tx = comp.translate_excerpt
comp.translate_excerpt = lambda text, source='de': _tx(text, 'nb' if source == 'no' else source)
ARGOS_PAIRS = {('en', 'de'), ('da', 'en'), ('nb', 'en'), ('sv', 'en'), ('fi', 'en')}

def setup():
    import argostranslate.package as pk
    pk.update_package_index()
    have = {(x.from_code, x.to_code) for x in pk.get_installed_packages()}
    for x in pk.get_available_packages():
        if (x.from_code, x.to_code) in ARGOS_PAIRS - have: pk.install_from_path(x.download())

GENERIC = set(fin.GENERIC_WORDS) | {'nasjonalpark', 'nationalpark', 'kansallispuisto', 'þjóðgarður', 'naturreservat',
    'naturpark', 'landskapsvernområde', 'naturvernområde', 'friluftsområde', 'turistveg', 'scenic', 'route', 'reserve'}

def rows(countries):
    out = []
    for cc in countries:
        out += [r for r in json.loads((CATALOGS / f'{cc}-catalog.json').read_text())]
    return out

def words(name):
    return [w for w in re.findall(r'\w+', name.casefold()) if len(w) >= 3 and w not in GENERIC]

def save(slug, item):
    (OUT / f'{slug}.json').write_text(json.dumps(item, ensure_ascii=False, indent=2))

def load(slug):
    p = OUT / f'{slug}.json'
    return json.loads(p.read_text()) if p.exists() else {}

# ---------- Stage 1: facts (no language model) ----------
def identity(row, lang):
    packet, page, l, entity = _identity(row, lang)
    stop = packet['approved_stops'][0]
    if stop['name'].casefold() not in stop['quote'].casefold():  # e.g. "Wadden Sea National Park, Denmark"
        short = stop['name'].split(',')[0].strip()
        if short.casefold() in stop['quote'].casefold(): stop['name'] = short
    return packet, page, l, entity

def _identity(row, lang):
    if row.get('wikidata'):
        return fin.identity_and_packet(row, row['country'], lang, CACHE)
    title = row.get('enwiki') if isinstance(row.get('enwiki'), str) else None
    tl = 'en'
    if not title:
        want = set(words(row['name']))
        for l in ('en', lang):
            q = {'action': 'query', 'format': 'json', 'list': 'search', 'srsearch': row['name'], 'srlimit': 5}
            hits = json.loads(get(f'https://{l}.wikipedia.org/w/api.php?' + urlencode(q), CACHE)['body'])['query']['search']
            hit = next((h['title'] for h in hits if want and want & set(words(h['title']))), None)
            if hit: title, tl = hit, l; break
    if not title:
        raise ValueError('no Wikidata, enwiki or name-matching Wikipedia article')
    page = fin.fetch_article(title, tl, CACHE)
    qid = page.get('pageprops', {}).get('wikibase_item')
    if qid:  # re-enter through the QID path so the same identity cross-check applies
        result = fin.identity_and_packet({**row, 'wikidata': qid}, row['country'], lang, CACHE)
        countries = {c.get('mainsnak', {}).get('datavalue', {}).get('value', {}).get('id')
                     for c in result[3].get('claims', {}).get('P17', [])}
        expected = {'no': 'Q20', 'is': 'Q189', 'se': 'Q34', 'fi': 'Q33', 'dk': 'Q35'}
        if countries and expected[row['country']] not in countries:
            raise ValueError('Wikipedia search identity belongs to another country')
        return result
    raise ValueError(f'article {title!r} has no Wikidata identity')

def bounds_for(row):
    return TERRITORIES.get(row.get('territory') or '', COUNTRIES[row['country']]['bounds'])

def region_for(row, lat, lng):
    if row.get('region'): return row['region']
    import requests
    time.sleep(1)
    r = requests.get('https://nominatim.openstreetmap.org/reverse', params={'lat': lat, 'lon': lng, 'format': 'json', 'zoom': 8, 'accept-language': 'en'},
                     headers={'User-Agent': 'wildparkroutes-content/1.0 (info@minialife.com)'}, timeout=30).json()
    a = r.get('address', {})
    name = a.get('state') or a.get('county') or a.get('region')
    if not name: raise ValueError('no region from coordinates')
    return re.sub(r'[^a-z0-9]+', '-', name.casefold().replace(' county', '').replace(' fylke', '')).strip('-')

def cover(row, page, lang, used):
    hero = fin.resolve_hero(row, page, used)
    if comp.licensed(hero): return hero
    want = words(row['name'])
    for p in prepare.commons_search(page['title'].split(' (')[0], limit=25):
        if p['url'] not in used and comp.licensed(p) and p.get('w', 1280) >= 1000 and any(w in p['file'].casefold() for w in want):
            return p
    return None

def facts(row, used):
    slug, cc = row['slug'], row['country']
    cfg = COUNTRIES[cc]
    packet, page, lang, entity = identity(row, cfg['lang'])
    lat, lng, csrc = fin.resolve_coordinates(row, page, entity, bounds_for(row))
    photo = cover(row, page, lang, used)
    if not photo: raise ValueError('no licensed exact-place cover')
    ac = (row.get('territory') or cc).upper()
    remote = re.search(r'boat|ferry|flight|expedition', row.get('access') or '')
    try:
        airport, route = fin.resolve_route(lat, lng, ac)
    except ValueError:
        if not remote: raise
        airport = prepare.airports(lat, lng, n=1, country=ac)[0]
        route = {'minutes': None, 'miles': None, 'coords': [[airport['lng'], airport['lat']], [round(lng, 5), round(lat, 5)]]}
    (PIPE / 'source-packets' / f'{slug}.json').write_text(json.dumps(packet, ensure_ascii=False, indent=2))
    return dict(slug=slug, country=cc, status='facts', lang=lang, packet=packet, photo=photo, lat=lat, lng=lng,
                coordinate_source=csrc, region=region_for(row, lat, lng), airport=airport, route=route)

# ---------- Stage 3: translation (offline Argos) ----------
def translate(row, item):
    german = module('ger', 'audit-dach.py')
    row = {**row, 'region': item['region']}
    packet, lang = item['packet'], item['lang']
    bundle = comp.english_bundle(row, packet, lang, fin.validate_bundle(fin.quoted_bundle(row, packet), row['slug'], fin.compact_packet(packet)))
    s, t, a, r = bundle['summary'], bundle['travel'], item['airport'], item['route']
    payload = {k: v for k, v in s.items() if k != 'activities'}
    payload.update(gallery=[], seo_description=s['tagline'], lat=item['lat'], lng=item['lng'], nearest_airport_code=a['code'],
                   nearest_airport_name=a['name'], airport_lat=a['lat'], airport_lng=a['lng'], drive_minutes=r['minutes'],
                   drive_miles=r['miles'], travel_plan=t['plan'], permit_headline=t['headline'], permit_note=t['reservation'],
                   permit_source_url=t['source_url'])
    return {**item, 'status': 'prepared', 'bundle': bundle, 'payload': payload,
            'german': german.translate_row({'name': row['name'], **payload})}

# ---------- Stage 4: publish ----------
def publish(items, cat, apply):
    pub = module('pub', 'publish-fr-pt-gr.py')
    pub.MHR.update({cc: c['mhr'] for cc, c in COUNTRIES.items()})
    cols = set(pub.rq('GET', 'destinations?limit=1&select=*')[0].keys())
    routes_path = Path('src/data/routes.json'); routes = json.loads(routes_path.read_text())
    staged = []
    for item in items:
        slug, row = item['slug'], cat[item['slug']]
        cc, p = row['country'], item['payload']
        existing = pub.rq('GET', f'destinations?slug=eq.{slug}&select=id,status')
        if existing and existing[0]['status'] == 'published': continue
        if not apply: print(slug, 'would publish'); continue
        hero = item.get('hero') or comp.upload_photo(slug, item['photo'])
        item['hero'] = hero
        p = {**p, 'hero_image': hero['url'], 'photo_credit': f"Hero: {hero['credit']} / {hero['license']} via Wikimedia Commons ({hero['source']})"}
        region = item['region']
        if not pub.rq('GET', f'regions?country_code=eq.{cc}&slug=eq.{region}&select=id'):
            pub.rq('POST', 'regions', json={'country_code': cc, 'slug': region, 'name': region.replace('-', ' ').title(), 'status': 'draft'})
        if not existing:
            pub.rq('POST', 'destinations', json={'slug': slug, 'name': row['name'], 'state': region.replace('-', ' ').title(), 'country_code': cc,
                'region_slug': region, 'currency': COUNTRIES[cc]['currency'], 'park_authority': row.get('official_site') or '',
                'access_type': 'ferry' if re.search(r'boat|ferry', row.get('access') or '') else 'road',
                'destination_type': row['kind'], 'status': 'draft', 'tier': 'tier1', 'seo_eligible': False})
        pub.rq('PATCH', f'destinations?slug=eq.{slug}', json={k: v for k, v in p.items() if k in cols})
        dest_id = pub.rq('GET', f'destinations?slug=eq.{slug}&select=id')[0]['id']
        pub.rq('DELETE', f'offers?destination_id=eq.{dest_id}')
        pub.rq('POST', 'offers', json=pub.offers(dest_id, row['name'], p['nearest_airport_code'], cc, p['travel_plan']))
        if item['route'].get('coords'): routes[slug] = item['route']['coords']
        pub.rq('POST', 'content_translations?on_conflict=entity_type,entity_id,locale', headers={'Prefer': 'resolution=merge-duplicates'},
               json={'entity_type': 'destination', 'entity_id': slug, 'locale': 'de', 'fields': item['german'], 'status': 'draft'})
        save(slug, item); staged.append(slug); print(slug, 'staged', flush=True)
    routes_path.write_text(json.dumps(routes, separators=(',', ':')))
    if not staged: return []
    out = subprocess.run([sys.executable, str(PIPE / 'publish-wave.py'), *staged], capture_output=True, text=True,
                         env={**os.environ, 'PYTHONPATH': str(PIPE)})
    print(out.stdout[-4000:], out.stderr[-1500:])
    live = [l.split()[0] for l in out.stdout.splitlines() if l.endswith(' published')]
    geo_path = Path('src/data/destination-geo.json'); geo = json.loads(geo_path.read_text())
    for s in live:
        geo[s] = cat[s]['country'] + '/' + load(s)['region']
        pub.rq('PATCH', f'content_translations?entity_type=eq.destination&entity_id=eq.{s}&locale=eq.de', json={'status': 'published', 'reviewed_at': 'now()'})
        pub.rq('PATCH', f'regions?country_code=eq.{cat[s]["country"]}&slug=eq.{load(s)["region"]}', json={'status': 'published'})
    geo_path.write_text(json.dumps(dict(sorted(geo.items())), separators=(',', ':')))
    return live

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('stage', choices=['setup', 'facts', 'translate', 'publish', 'plan', 'all'])
    ap.add_argument('--country', default='no,is,se,fi,dk'); ap.add_argument('--limit', type=int, default=10**6)
    ap.add_argument('--apply', action='store_true')
    a = ap.parse_args()
    if a.stage == 'setup': return setup()
    countries = [c for c in a.country.split(',') if c in COUNTRIES]
    catalog = rows(countries); cat = {r['slug']: r for r in catalog}
    report = json.loads(REPORT.read_text()) if REPORT.exists() else {}
    stages = ['facts', 'translate', 'publish', 'plan'] if a.stage == 'all' else [a.stage]
    if 'facts' in stages:
        used = {load(r['slug']).get('photo', {}).get('url') for r in catalog}
        for row in [r for r in catalog if not load(r['slug']).get('status')][:a.limit]:
            try:
                item = facts(row, used); used.add(item['photo']['url']); save(row['slug'], item); report[row['slug']] = 'facts'
            except Exception as e:
                report[row['slug']] = 'HELD facts: ' + repr(e)[:180]
            print(row['slug'], report[row['slug']], flush=True)
            REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=1))
    if 'translate' in stages:
        for row in [r for r in catalog if load(r['slug']).get('status') == 'facts'][:a.limit]:
            try:
                save(row['slug'], translate(row, load(row['slug']))); report[row['slug']] = 'prepared'
            except Exception as e:
                report[row['slug']] = 'HELD translate: ' + repr(e)[:180]
            print(row['slug'], report[row['slug']], flush=True)
            REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=1))
    if 'publish' in stages:
        ready = [load(r['slug']) for r in catalog if load(r['slug']).get('status') == 'prepared'][:a.limit]
        for s in publish(ready, cat, a.apply): report[s] = 'published'
        REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=1))
    if 'plan' in stages and (a.apply or a.stage == 'plan'):
        subprocess.run([sys.executable, str(PIPE / 'multiday-europe.py'), str(a.limit), ','.join(countries)], check=False)
    counts = {}
    for v in report.values(): counts[v.split(':')[0]] = counts.get(v.split(':')[0], 0) + 1
    print('SUMMARY', json.dumps(counts))

if __name__ == '__main__':
    main()
