"""DB-free resumable Oceania facts and offline translations; explicit reviewed publication follows."""
import argparse
import importlib.util
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote
import requests
from bs4 import BeautifulSoup

HERE = Path(__file__).parent
PIPE = HERE.parent
sys.path.insert(0, str(PIPE))
spec = importlib.util.spec_from_file_location('oceania_base', PIPE / 'west-europe/produce.py')
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
base.OUT = HERE / 'completion'
base.CACHE = HERE / 'discovery-cache'
base.REPORT = HERE / 'production-report.json'
for directory in (base.OUT, base.CACHE):
    directory.mkdir(parents=True, exist_ok=True)
base.COUNTRIES = {'nz': dict(lang='en', currency='NZD', name='New Zealand', mhr='new-zealand', bounds=(-47.5, -34, 166, 179))}
base.prepare.EXTRA_COUNTRIES += ('NZ',)
base.comp.COUNTRY_NAMES['nz'] = 'New Zealand'
MEDIA_UA = {'User-Agent': 'WildParkRoutes/1.0 (https://wildparkroutes.com; info@minialife.com) python-requests/2.32'}

def download_cover(photo, target):
    """Identify the client as required by Wikimedia; retain licensed source metadata."""
    url = photo['url'].replace('https://thumb.wikimedia.org/', 'https://upload.wikimedia.org/')
    response = requests.get(url, headers=MEDIA_UA, timeout=60)
    response.raise_for_status()
    if not response.headers.get('Content-Type', '').startswith('image/'):
        raise ValueError('cover response is not an image')
    Path(target).write_bytes(response.content)
    return Path(target)

def road_evidence(text):
    sentences = re.split(r'(?<=[.!?])\s+|\n', text)
    return next((s.strip() for s in sentences if re.search(
        r'(?:drive|by car|state highway|SH\s?\d+|road end).{0,120}(?:km|minutes?|hours?|from|turn)|(?:access|accessible|accessed|reached|reach|entrance|car park|carpark|parking).{0,90}(?:road|highway|drive|vehicle|car)|(?:road|highway).{0,90}(?:access|entrance|car park|carpark)', s, re.I)
        and not re.search(r'ferry|access ends|nearest beaches|closed|no road|not accessible|inaccessible', s, re.I)), None)

def identity(row):
    # Wikidata's preferred English title is sometimes stale; the audited catalog
    # retains the exact modern title (including slashes).
    original_fetch = base.fin.fetch_article
    def fetch(title, lang, cache):
        try:
            return original_fetch(title, lang, cache)
        except ValueError:
            exact = unquote(row['enwiki'].split('/wiki/', 1)[1]).replace('_', ' ')
            return original_fetch(exact, 'en', cache)
    base.fin.fetch_article = fetch
    try:
        result = base.fin.identity_and_packet(row, 'nz', 'en', base.CACHE)
    finally:
        base.fin.fetch_article = original_fetch
    entity = result[3]
    countries = {c.get('mainsnak', {}).get('datavalue', {}).get('value', {}).get('id') for c in entity.get('claims', {}).get('P17', [])}
    if countries and 'Q664' not in countries:
        raise ValueError('identity belongs to another country')
    return result

OFFICIAL = {'aoraki-mount-cook-national-park': 'https://www.doc.govt.nz/parks-and-recreation/places-to-go/canterbury/places/aoraki-mount-cook-national-park/'}

def official_source(row):
    matches_path = HERE / 'official-source-matches.json'
    matches = json.loads(matches_path.read_text()) if matches_path.exists() else {}
    url = OFFICIAL.get(row['slug']) or matches.get(row['slug']) or row.get('official_site')
    if not url:
        return None
    path = base.CACHE / (row['slug'] + '-official.json')
    if path.exists():
        return json.loads(path.read_text())
    response = requests.get(url, headers=base.prepare.UA, timeout=30)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')
    for tag in soup(['script', 'style', 'nav', 'header', 'footer']):
        tag.decompose()
    text = soup.get_text(' ', strip=True)
    source = {'url': url, 'kind': 'official', 'text': text, 'generation_excerpts': [road_evidence(text)] if road_evidence(text) else []}
    path.write_text(json.dumps(source, ensure_ascii=False, indent=2))
    return source

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('stage', choices=['facts', 'translate'])
    parser.add_argument('--existing', default='/tmp/nz-existing.json')
    parser.add_argument('--only', default='', help='comma-separated slugs')
    args = parser.parse_args()
    rows = json.loads((PIPE / 'claude-handoff/oceania/nz-catalog.json').read_text())
    existing = {r['slug'] for r in json.loads(Path(args.existing).read_text())['rows']}
    report = json.loads(base.REPORT.read_text()) if base.REPORT.exists() else {}
    used = {base.load(r['slug']).get('photo', {}).get('url') for r in rows}
    for row in rows:
        slug = row['slug']
        if args.only and slug not in args.only.split(','):
            continue
        if slug in existing:
            report[slug] = 'existing published EN/DE'
            continue
        try:
            item = base.load(slug)
            if args.stage == 'facts' and not item:
                packet, page, lang, entity = identity(row)
                if row.get('access') in ('foot', 'boat'):
                    raise ValueError('walking/boat route needs reviewed arrival gateway')
                official = official_source(row)
                quote = road_evidence(official['text']) if official else road_evidence(page.get('extract', ''))
                reviewed = json.loads((HERE / 'access-evidence.json').read_text()).get(slug) if (HERE / 'access-evidence.json').exists() else None
                if not quote and reviewed:
                    quote = reviewed['quote']
                    official = dict(url=reviewed['url'], kind=reviewed['kind'], text=reviewed['quote'], generation_excerpts=[reviewed['quote']])
                if not quote:
                    raise ValueError('visitor road access not established in retained article')
                lat, lng, source = base.fin.resolve_coordinates(row, page, entity, base.COUNTRIES['nz']['bounds'])
                photo = base.cover(row, page, lang, used)
                if not photo:
                    raise ValueError('no licensed exact-place cover')
                airport, route = base.fin.resolve_route(lat, lng, 'NZ')
                end = route['coords'][-1]
                if base.prepare.hav(lat, lng, end[1], end[0]) > 1.25:
                    raise ValueError('route endpoint too far from reviewed destination point')
                packet['road_access_quote'] = quote
                if official and official['generation_excerpts']:
                    packet['sources'].append(official)
                item = dict(slug=slug, country='nz', status='facts', lang=lang, packet=packet, photo=photo,
                    lat=lat, lng=lng, coordinate_source=source, region=base.region_for(row, lat, lng), airport=airport, route=route)
                base.save(slug, item)
                used.add(photo['url'])
            if args.stage == 'translate' and item.get('status') == 'facts':
                reviewed = json.loads((HERE / 'access-evidence.json').read_text()).get(slug, {}) if (HERE / 'access-evidence.json').exists() else {}
                if not road_evidence(item['packet'].get('road_access_quote', '')) and item['packet'].get('road_access_quote') != reviewed.get('quote'):
                    raise ValueError('retained access quote does not establish visitor road access')
                item = base.translate(row, item)
                base.save(slug, item)
            report[slug] = item.get('status', report.get(slug, 'held'))
        except Exception as error:
            report[slug] = 'HELD: ' + str(error)[:220]
        print(slug, report[slug], flush=True)
        base.REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2))
    base.REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()