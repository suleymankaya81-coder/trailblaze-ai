"""Resumable DB-free staging for the frozen 125 drafts; never publishes.

Reuses identity-checked Wikipedia/Commons caches and offline Argos translations.
Outputs durable payloads for guarded draft updates, not identity-only inserts.
"""
import argparse
import copy
import importlib.util
import json
import re
import subprocess
from pathlib import Path

import europe_prepare as prepare
from local_translation import translate_excerpt
from compact_evidence import compact_packet
from combined_content import validate_bundle

ROOT = Path(__file__).parent
OUT = ROOT / 'fr-pt-gr-completion'

def module(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / filename)
    if spec is None or spec.loader is None:
        raise RuntimeError(filename)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result

def seasonal_text(name, sources):
    # Do not infer the visitor season from climate or geography.
    for source in sources:
        if source.get('kind') != 'official':
            continue
        for quote in source.get('generation_excerpts', []):
            if re.search(r'best time to visit|best season to visit', quote, re.I):
                return quote
    return f'No verified visitor-season recommendation is available for {name}; consult the park authority for your travel dates.'

def english_bundle(row, packet, lang, original):
    bundle = copy.deepcopy(original)
    if lang != 'en':
        for source in packet['sources']:
            excerpts = source.get('generation_excerpts', [])
            source['display_translation'] = translate_excerpt('\n'.join(excerpts), lang)
            source['translation_method'] = f'Argos offline {lang}-en; original evidence retained'
        displays = {s['url']: s['display_translation'] for s in packet['sources']}
        for day in bundle['travel']['plan']['days']:
            for stop in day['stops']:
                identity = next(s for s in packet['approved_stops'] if s['id'] == stop['stop_id'])
                stop['detail'] = displays[identity['source_url']]
    # Remove pronunciation/foreign-name parentheticals, not proper place names.
    for day in bundle['travel']['plan']['days']:
        for stop in day['stops']:
            stop['detail'] = re.sub(r'\([^()]*\)', '', stop['detail'])
            stop['detail'] = re.sub(r'\s+', ' ', stop['detail']).replace(' ,', ',').strip()
    detail = bundle['travel']['plan']['days'][0]['stops'][0]['detail']
    sentences = re.split(r'(?<=[.!?])\s+', detail)
    short = next((s for s in sentences if 30 <= len(s) <= 110), None)
    # A literal category/location sentence is preferable to a cut-off quote.
    fallback = f'{row["name"]}: {row["kind"].replace("_", " ")} in {dict(fr="France",pt="Portugal",gr="Greece")[row["country"]]}.'
    bundle['summary']['tagline'] = short or fallback
    if len(bundle['summary']['tagline']) > 110:
        bundle['summary']['tagline'] = f'{row["kind"].replace("_", " ").capitalize()} in {dict(fr="France",pt="Portugal",gr="Greece")[row["country"]]}.'
    bundle['summary']['best_season'] = seasonal_text(row['name'], packet['sources'])
    return validate_bundle(bundle, row['slug'], compact_packet(packet))

def licensed(photo):
    return bool(photo and photo.get('credit') not in ('', 'Unknown') and
        re.search(r'CC.?BY|CC0|public domain|PDM', photo.get('license', ''), re.I) and
        not re.search(r'\bNC\b|\bND\b', photo.get('license', ''), re.I))

def upload_photo(slug, photo):
    pointer = ROOT / '../../src/assets/destination-covers' / f'{slug}.jpg.asset.json'
    pointer.parent.mkdir(parents=True, exist_ok=True)
    if not pointer.exists():
        import requests
        raw = Path('/tmp/fr-pt-gr-photos') / f'{slug}.jpg'
        raw.parent.mkdir(parents=True, exist_ok=True)
        response = requests.get(photo['url'], headers=prepare.UA, timeout=60)
        response.raise_for_status()
        if not response.headers.get('content-type', '').startswith('image/'):
            raise ValueError('Cover response is not an image')
        raw.write_bytes(response.content)
        with pointer.open('w') as output:
            subprocess.run(['lovable-assets', 'create', '--file', str(raw), '--filename', f'{slug}.jpg'], stdout=output, check=True)
    return {**photo, 'original_url': photo['url'], 'url': json.loads(pointer.read_text())['url']}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--country', choices=['fr','pt','gr'])
    parser.add_argument('--translate', action='store_true')
    args = parser.parse_args()
    finisher = module('frptgr_finisher', 'finish-fr-pt-gr.py')
    german = module('frptgr_german', 'audit-dach.py')
    OUT.mkdir(exist_ok=True)
    used = set()
    for path in OUT.glob('*.json'):
        item = json.loads(path.read_text())
        if item.get('hero'):
            used.add(item['hero']['original_url'])
    for cc, cfg in finisher.COUNTRIES.items():
        if args.country and args.country != cc:
            continue
        results = json.loads(cfg['result'].read_text())['results']
        ready = {r['slug']: r for r in results if r['status']=='ready'}
        rows = [r for r in json.loads(cfg['catalog'].read_text()) if r['country']==cc and r['slug'] in ready]
        for row in rows:
            slug = row['slug']
            path = OUT / f'{slug}.json'
            try:
                if path.exists():
                    item = json.loads(path.read_text())
                else:
                    packet, page, lang, entity = finisher.identity_and_packet(row,cc,cfg['local_lang'],cfg['cache'])
                    lat,lng,coordinate_source = finisher.resolve_coordinates(row,page,entity,cfg['bounds'])
                    photo = finisher.resolve_hero(row,page,used)
                    if not licensed(photo):
                        raise ValueError('No approved reusable exact-place cover')
                    # Article image is linked to the identified exact-place article;
                    # search-only matches must be reviewed separately, never auto-approved.
                    article_file = 'File:' + page.get('pageimage','')
                    if photo['file'].replace('_',' ') != article_file.replace('_',' '):
                        raise ValueError('Commons search cover requires explicit identity review')
                    airport, route = finisher.resolve_route(lat,lng,cc)
                    old = json.loads((ROOT/'combined-content'/f'{slug}.json').read_text())
                    bundle = english_bundle(row,packet,lang,old['bundle'])
                    hero = upload_photo(slug,photo)
                    summary,travel = bundle['summary'],bundle['travel']
                    payload = {k:v for k,v in summary.items() if k not in ('activities',)}
                    payload.update(hero_image=hero['url'],photo_credit=f"Hero: {hero['credit']} / {hero['license']} via Wikimedia Commons ({hero['source']})",gallery=[],seo_description=summary['tagline'],lat=lat,lng=lng,nearest_airport_code=airport['code'],nearest_airport_name=airport['name'],airport_lat=airport['lat'],airport_lng=airport['lng'],drive_minutes=route['minutes'],drive_miles=route['miles'],travel_plan=travel['plan'],permit_headline=travel['headline'],permit_note=travel['reservation'],permit_source_url=travel['source_url'])
                    item = dict(slug=slug,country=cc,status='prepared',hero=hero,coordinate_source=coordinate_source,coordinate_evidence=packet['sources'][0]['url'],route=route,packet=packet,bundle=bundle,payload=payload)
                    path.write_text(json.dumps(item,ensure_ascii=False,indent=2))
                    used.add(photo['url'])
                if args.translate and 'german' not in item:
                    item['german'] = german.translate_row({'name':row['name'],**item['payload']})
                    path.write_text(json.dumps(item,ensure_ascii=False,indent=2))
                print(slug,'prepared', 'de' if item.get('german') else '',flush=True)
            except Exception as error:
                print(slug,'HELD',str(error),flush=True)
                (OUT/f'{slug}.error.txt').write_text(str(error))

if __name__ == '__main__':
    main()