"""DB-free, resumable recovery of reviewed catalog identities; publication is separate."""
import argparse
import json
from pathlib import Path
from urllib.parse import quote

from combined_content import module, validate_bundle
from compact_evidence import compact_packet
from quoted_visit import quoted_bundle
from local_translation import translate_excerpt

ROOT = Path(__file__).parent
OUT = ROOT / 'fr-pt-gr-completion'

def reviewed_source(value):
    if not value or not value.get('url', '').startswith('https://'):
        raise ValueError('Reviewed official HTTPS source required')
    if not value.get('quote') or value['quote'] not in value.get('text', ''):
        raise ValueError('Official quote is not verbatim')
    language = value.get('language', 'en')
    display = value['quote'] if language == 'en' else translate_excerpt(value['quote'], language)
    return dict(url=value['url'], kind='official', text=value['text'],
        generation_excerpts=[value['quote']], language=language,
        display_translation=display), display

def apply_season(item, review):
    value = review.get('season_source')
    if not value:
        return False
    source, display = reviewed_source(value)
    packet = item['packet']
    if source not in packet['sources']:
        packet['sources'].append(source)
    item['payload']['best_season'] = display
    item['bundle']['summary']['best_season'] = display
    plan = item['payload']['travel_plan']
    for intel in plan.get('intel', []):
        if intel.get('kind') == 'timing':
            intel['text'] = display
    if not any(s['url'] == source['url'] for s in plan['sources']):
        plan['sources'].append({'label':'Official seasonal visitor information', 'url':source['url']})
    item['season_review'] = {'url':source['url'], 'quote':value['quote'],
        'caveat':value.get('caveat') or value.get('authority_note'), 'status':'source_supported_not_opening_guarantee'}
    item.pop('german', None)
    return True

def reviewed_packet(row, page, lang, stop_name=None):
    text = page.get('extract', '').strip()
    if len(text) < 200:
        raise ValueError('Reviewed article is too short')
    finisher = module('recovery_identity', 'finish-fr-pt-gr.py')
    excerpt, name = finisher.find_excerpt(text, stop_name or page['title'].split(' (')[0])
    if not excerpt:
        raise ValueError('Article does not name reviewed identity')
    url = f'https://{lang}.wikipedia.org/wiki/' + quote(page['title'].replace(' ', '_'))
    return dict(slug=row['slug'], country_code=row['country'], approved_for_generation=True,
        evidence_policy='dach-wikipedia-overview', identity_verified=True,
        review_note='Explicit reviewed catalog/article identity; operational facts require separate official evidence.',
        sources=[dict(url=url, kind='wikipedia', text=text, generation_excerpts=[excerpt])],
        approved_stops=[dict(id=row['slug'],name=name,quote=excerpt,source_url=url)])

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--review', required=True, help='Reviewed identities, not automated search guesses')
    parser.add_argument('--limit', type=int, default=1000)
    args = parser.parse_args()
    reviews = json.loads(Path(args.review).read_text())
    finisher = module('recovery_finisher', 'finish-fr-pt-gr.py')
    completion = module('recovery_completion', 'complete-fr-pt-gr-drafts.py')
    german = module('recovery_german', 'audit-dach.py')
    catalogs = {r['slug']:r for cfg in finisher.COUNTRIES.values()
        for r in json.loads(cfg['catalog'].read_text()) if r['country'] in ('fr','pt','gr')}
    OUT.mkdir(exist_ok=True)
    used = {json.loads(p.read_text())['hero']['original_url'] for p in OUT.glob('*.json')
        if isinstance(json.loads(p.read_text()),dict) and json.loads(p.read_text()).get('hero')}
    results = []
    for review in reviews[:args.limit]:
        slug = review['slug']
        try:
            if (OUT/f'{slug}.json').exists():
                item = json.loads((OUT/f'{slug}.json').read_text())
                apply_season(item, review)
                if not item.get('german'):
                    item['german'] = german.translate_row({'name':catalogs[slug]['name'],**item['payload']})
                    (OUT/f'{slug}.json').write_text(json.dumps(item,ensure_ascii=False,indent=2))
                results.append(dict(slug=slug,status='retained'))
                print(json.dumps(results[-1]),flush=True)
                continue
            row = catalogs[slug]; cfg = finisher.COUNTRIES[row['country']]
            if slug in finisher.HELD_OVERSEAS:
                raise ValueError('Separate overseas airport/geography configuration required; metropolitan route forbidden')
            if not review.get('identity_note'):
                raise ValueError('Explicit destination/article identity review required')
            if review.get('article_title'):
                lang = review.get('lang','en')
                page = finisher.fetch_article(review['article_title'],lang,cfg['cache'])
                packet = reviewed_packet(row,page,lang,review.get('stop_name'))
                entity = None
            else:
                packet,page,lang,entity = finisher.identity_and_packet(row,row['country'],cfg['local_lang'],cfg['cache'])
            if review.get('coordinate') and review['coordinate'].get('article_title') != page['title']:
                point = review['coordinate']
                if point['name'].casefold() not in packet['sources'][0]['text'].casefold():
                    raise ValueError('Routing anchor is absent from destination source')
                anchor = finisher.fetch_article(point['article_title'],point.get('lang','en'),cfg['cache'])
                lat,lng,coordinate_source = finisher.resolve_coordinates({},anchor,None,cfg['bounds'])
                coordinate_source = 'Reviewed source-named anchor: '+point['article_title']
            else:
                lat,lng,coordinate_source = finisher.resolve_coordinates(row,page,entity,cfg['bounds'])
            file = review.get('photo_file') or page.get('pageimage','')
            if review.get('photo_file') and not review.get('photo_identity_note'):
                raise ValueError('Exact-place cover review required')
            photo = completion.prepare.file_info(file)
            if not completion.licensed(photo) or completion.prepare.BAD.search(photo['file']) or photo['w'] < 1200:
                raise ValueError('Reusable photographic cover of sufficient resolution missing')
            if photo['url'] in used:
                raise ValueError('Cover already assigned to another destination')
            airport,route = finisher.resolve_route(lat,lng,row['country'])
            access = review.get('access_source')
            if row['access'] != 'road' and not access:
                raise ValueError('Boat access requires reviewed official evidence')
            if access:
                source, display_access = reviewed_source(access)
                packet['sources'].append(source)
            bundle = completion.english_bundle(row,packet,lang,quoted_bundle(row,packet))
            if access:
                # Retain the deterministic operational unknowns. The exact official
                # access excerpt is separate evidence, not a blanket availability claim.
                bundle['travel']['plan']['intel'].append({'kind':'access',
                    'title':'Sourced arrival and access note','text':display_access})
            bundle = validate_bundle(bundle,slug,compact_packet(packet))
            hero = completion.upload_photo(slug,photo)
            summary,travel = bundle['summary'],bundle['travel']
            payload = {k:v for k,v in summary.items() if k!='activities'}
            payload.update(hero_image=hero['url'], photo_credit=f"Hero: {hero['credit']} / {hero['license']} via Wikimedia Commons ({hero['source']})",
                gallery=[],seo_description=summary['tagline'],lat=lat,lng=lng,
                nearest_airport_code=airport['code'],nearest_airport_name=airport['name'],airport_lat=airport['lat'],airport_lng=airport['lng'],
                drive_minutes=route['minutes'],drive_miles=route['miles'],travel_plan=travel['plan'],permit_headline=travel['headline'],
                permit_note=travel['reservation'],permit_source_url=travel['source_url'])
            item = dict(slug=slug,country=row['country'],status='prepared',hero=hero,coordinate_source=coordinate_source,
                coordinate_evidence=packet['sources'][0]['url'],route=route,packet=packet,bundle=bundle,payload=payload)
            apply_season(item, review)
            (OUT/f'{slug}.json').write_text(json.dumps(item,ensure_ascii=False,indent=2))
            item['german'] = german.translate_row({'name':row['name'],**payload})
            (OUT/f'{slug}.json').write_text(json.dumps(item,ensure_ascii=False,indent=2))
            used.add(photo['url'])
            results.append(dict(slug=slug,status='prepared'))
        except Exception as error:
            results.append(dict(slug=slug,status='held',reason=str(error)))
        print(json.dumps(results[-1],ensure_ascii=False),flush=True)
        (OUT/'recovery-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))

if __name__ == '__main__':
    main()