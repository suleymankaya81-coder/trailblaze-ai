"""France/Portugal/Greece wave: Wikidata-identified Wikipedia overview + licensed cover +
airport route; zero model calls, zero database access. Mirrors finish-italy.py's identity
and evidence pattern, but stops short of apply-wave.py/publish-wave.py (no DB credentials
available in this run) and writes ready-to-run SQL instead.

Usage: python3 finish-fr-pt-gr.py [country ...]   (default: fr pt gr)
"""
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import quote, urlencode

import europe_prepare as prepare
from europe_discovery import get
from combined_content import validate_bundle
from compact_evidence import compact_packet
from quoted_visit import quoted_bundle

ROOT = Path(__file__).parent

HELD_OVERSEAS = {
    'reunion-national-park', 'guadeloupe-national-park', 'guiana-amazonian-park',
    'parc-naturel-regional-de-guyane', 'mayotte-marine-natural-park',
    'parc-naturel-regional-de-la-martinique',
}
OVERSEAS_REASON = 'overseas territory — held from this wave per owner instruction'

HELD_FERRY = {
    'scandola-nature-reserve', 'landscape-of-the-pico-island-vineyard-culture', 'berlengas',
    'national-marine-park-of-zakynthos', 'alonnisos-marine-park', 'navagio-beach',
}
FERRY_REASON = 'ferry/boat access — needs reviewed Wikivoyage arrival quote (manual review, like finish-italy.py\'s FERRY dict)'

COUNTRIES = {
    'fr': dict(catalog=ROOT / 'france/catalog.json', cache=ROOT / 'france/discovery-cache',
               local_lang='fr', bounds=(41.0, 51.5, -5.5, 9.8),
               result=ROOT / 'france/fr-result.json', sql=ROOT / 'france/apply-ready.sql'),
    'pt': dict(catalog=ROOT / 'south-europe/catalog.json', cache=ROOT / 'south-europe/discovery-cache',
               local_lang='pt', bounds=(29.3, 42.2, -31.5, -6.1),
               result=ROOT / 'south-europe/pt-result.json', sql=ROOT / 'south-europe/apply-pt-ready.sql'),
    'gr': dict(catalog=ROOT / 'south-europe/catalog.json', cache=ROOT / 'south-europe/discovery-cache',
               local_lang='el', bounds=(34.7, 41.8, 19.3, 29.7),
               result=ROOT / 'south-europe/gr-result.json', sql=ROOT / 'south-europe/apply-gr-ready.sql'),
}

# Descriptive/administrative words stripped before matching a proper-noun identity in
# article text or Commons filenames; extends finish-italy.py's generic set to fr/pt/el.
GENERIC_WORDS = {
    'national', 'natural', 'nature', 'park', 'parks', 'regional', 'reserve', 'reserves',
    'area', 'protected', 'marine', 'mount', 'mountain', 'mountains', 'the', 'and', 'of',
    'parc', 'naturel', 'régional', 'regional', 'réserve', 'nationale', 'marin', 'forêt',
    'foret', 'montagne', 'la', 'le', 'les', 'et', 'de', 'du', 'des', 'd',
    'parque', 'nacional', 'reserva', 'paisagem', 'protegida', 'da', 'do', 'dos', 'das', 'e', 'serra',
    'εθνικό', 'εθνικός', 'εθνικών', 'πάρκο', 'πάρκου', 'φυσικό', 'φυσικός', 'φυσικών',
    'περιοχή', 'προστατευόμενη', 'δρυμός', 'δρυμού', 'όρος', 'όρη', 'θαλάσσιο', 'θαλάσσιος',
}


def norm_words(name):
    # Apostrophe excluded from the word class: an elision like "d'Annecy" or "d'Étretat" must
    # split into "d" (stripped as a generic word, same as the space-separated "du"/"des"/"de")
    # and "Annecy"/"Étretat", or it never matches a title spelled "Lake Annecy" / "Site d'Étretat".
    return [w for w in re.findall(r"[\w]+", name.casefold()) if w not in GENERIC_WORDS and len(w) > 3]


def sitelink(qid, local_lang, cache_dir):
    data = json.loads(get(f'https://www.wikidata.org/wiki/Special:EntityData/{qid}.json', cache_dir)['body'])
    entity = data['entities'][qid]
    sitelinks = entity.get('sitelinks', {})
    for lang in ('en', local_lang):
        if f'{lang}wiki' in sitelinks:
            return sitelinks[f'{lang}wiki']['title'], lang, entity
    raise ValueError(f'no en/{local_lang} Wikipedia sitelink')


def fetch_article(title, lang, cache_dir):
    params = {'action': 'query', 'format': 'json', 'formatversion': 2, 'redirects': 1, 'titles': title,
              'prop': 'extracts|coordinates|pageimages|pageprops', 'explaintext': 1, 'exchars': 8000, 'piprop': 'name'}
    data = json.loads(get(f'https://{lang}.wikipedia.org/w/api.php?' + urlencode(params), cache_dir)['body'])
    page = data['query']['pages'][0]
    if page.get('missing') or 'disambiguation' in page.get('pageprops', {}):
        raise ValueError('article missing or ambiguous: ' + title)
    return page


def find_excerpt(text, name):
    """≥80-char paragraphs first, ≥60-char as a fallback for short names; exact-name match,
    else every distinctive word of the title present (finish-italy.py's fallback logic)."""
    for min_len in (80, 60):
        paras = [p.strip() for p in text.split('\n') if len(p.strip()) >= min_len]
        if not paras:
            continue
        hit = [p for p in paras if name.casefold() in p.casefold()]
        if hit:
            return hit[0], name
        words = norm_words(name)
        hit = [p for p in paras if words and all(w in p.casefold() for w in words)]
        if hit:
            low = hit[0].casefold()
            pos = [low.index(w) for w in words]
            start, end = min(pos), max(low.index(w) + len(w) for w in words)
            candidate = hit[0][start:end] if end - start <= 80 else name
            return hit[0], candidate
    return None, None


def identity_and_packet(row, cc, local_lang, cache_dir):
    if row.get('wikidata'):
        title, lang, entity = sitelink(row['wikidata'], local_lang, cache_dir)
        # find_excerpt below only checks the resolved title against its OWN article text,
        # which is nearly always true (a page's lead names itself) even when the catalog's
        # Wikidata QID is simply wrong. Cross-check the resolved title against the catalog
        # row's own name here, or a bad QID silently pulls in an unrelated real article
        # (observed: a QID typo'd to an unrelated entity, e.g. a band or a video game).
        cat_words = set(norm_words(row['name']))
        # A pure translation pair (e.g. "Pink Granite Coast" / "Côte de Granit Rose") can share
        # no word with the sitelink title at all; check Wikidata's own recorded labels/aliases in
        # every language too, not just the one title being fetched, before calling it a mismatch.
        entity_words = set(norm_words(title))
        for block in (entity.get('labels', {}), entity.get('aliases', {})):
            for lang_entries in block.values():
                entries = lang_entries if isinstance(lang_entries, list) else [lang_entries]
                for entry in entries:
                    entity_words.update(norm_words(entry['value']))
        if cat_words and not (cat_words & entity_words):
            raise ValueError(f'identity mismatch: catalog name {row["name"]!r} vs '
                              f'Wikidata-resolved title {title!r} (wrong QID {row["wikidata"]})')
    else:
        title, lang, entity = row['name'].split(' (')[0], 'en', None
    page = fetch_article(title, lang, cache_dir)
    text = page.get('extract', '').strip()
    if len(text) < 200:
        raise ValueError('article too short: ' + title)
    name0 = page['title'].split(' (')[0]
    excerpt, name = find_excerpt(text, name0)
    if excerpt is None:
        raise ValueError('article text never names the place exactly: ' + title)
    url = f'https://{lang}.wikipedia.org/wiki/' + quote(page['title'].replace(' ', '_'))
    packet = {
        'slug': row['slug'], 'approved_for_generation': True, 'country_code': cc,
        'evidence_policy': 'dach-wikipedia-overview', 'identity_verified': True,
        'review_note': 'Wikidata-identified article; descriptive overview only, no current operational rules.'
                       + ('' if lang == 'en' else ' Local-language article; no offline translation model is installed in this run, so only the original-language excerpt is stored (no display_translation).'),
        'sources': [{'url': url, 'kind': 'wikipedia', 'text': text, 'generation_excerpts': [excerpt]}],
        'approved_stops': [{'id': row['slug'], 'name': name, 'quote': excerpt, 'source_url': url}],
    }
    return packet, page, lang, entity


def resolve_coordinates(row, page, entity, bounds):
    lo_lat, hi_lat, lo_lng, hi_lng = bounds
    coords = page.get('coordinates', [])
    if coords:
        lat, lng = coords[0]['lat'], coords[0]['lon']
        if lo_lat <= lat <= hi_lat and lo_lng <= lng <= hi_lng:
            return lat, lng, 'wikipedia-article-coordinates'
    if entity:
        claims = entity.get('claims', {}).get('P625', [])
        if claims:
            point = claims[0]['mainsnak']['datavalue']['value']
            lat, lng = point['latitude'], point['longitude']
            if lo_lat <= lat <= hi_lat and lo_lng <= lng <= hi_lng:
                return lat, lng, 'wikidata-P625'
    if row.get('lat') is not None and row.get('lng') is not None:
        lat, lng = row['lat'], row['lng']
        if lo_lat <= lat <= hi_lat and lo_lng <= lng <= hi_lng:
            return lat, lng, 'catalog'
    raise ValueError('no coordinate within country bounds')


def resolve_hero(row, page, used):
    name = row['name'].split(' (')[0]
    words = norm_words(name)
    tight = re.sub(r'[^a-z0-9]', '', name.casefold())

    def relevant(filename):
        key = filename.casefold()
        if words:
            return any(w in key for w in words) or tight in re.sub(r'[^a-z0-9]', '', key)
        return True

    def ok(photo):
        return (photo and photo['url'] not in used and photo['credit'] != 'Unknown'
                and photo['license'] not in ('', 'See source') and relevant(photo['file']))

    pimg = page.get('pageimage')
    if pimg and not prepare.BAD.search(pimg):
        hero = prepare.file_info(pimg)
        if ok(hero):
            return hero
    for photo in prepare.commons_search(name, limit=20):
        if ok(photo):
            return photo
    return None


def resolve_route(lat, lng, cc):
    candidates = prepare.airports(lat, lng, n=4, country=cc.upper())
    best = None
    for cand in candidates:
        rt = prepare.route(cand, lat, lng)
        if rt and (best is None or rt['minutes'] < best[1]['minutes']):
            best = (cand, rt)
    if best is None:
        raise ValueError('no routable airport arrival; no invented route')
    return best


def process_country(cc, cfg, used):
    rows = [r for r in json.loads(cfg['catalog'].read_text()) if r['country'] == cc]
    report = cfg['result']
    prev = {r['slug']: r for r in json.loads(report.read_text())['results']} if report.exists() else {}
    results = [r for r in prev.values()]
    done = {r['slug'] for r in results}
    sql_lines = []

    for row in rows:
        slug = row['slug']
        if slug in done:
            continue
        if slug in HELD_OVERSEAS:
            results.append({'slug': slug, 'status': 'held', 'reason': OVERSEAS_REASON, 'country': cc, 'region': row['region']})
        elif slug in HELD_FERRY:
            results.append({'slug': slug, 'status': 'held', 'reason': FERRY_REASON, 'country': cc, 'region': row['region']})
        else:
            try:
                packet, page, lang, entity = identity_and_packet(row, cc, cfg['local_lang'], cfg['cache'])
                lat, lng, coord_source = resolve_coordinates(row, page, entity, cfg['bounds'])
                hero = resolve_hero(row, page, used)
                if not hero:
                    raise ValueError('no licensed unique cover photo')
                airport, rt = resolve_route(lat, lng, cc)
                used.add(hero['url'])
                (ROOT / 'source-packets' / f'{slug}.json').write_text(json.dumps(packet, ensure_ascii=False, indent=2))
                bundle = validate_bundle(quoted_bundle(row, packet), slug, compact_packet(packet))
                (ROOT / 'combined-content' / f'{slug}.json').write_text(
                    json.dumps({'status': 'validated', 'method': 'wikipedia-overview-no-model', 'bundle': bundle}, ensure_ascii=False, indent=2))
                state = row['region'].replace('-', ' ').title()
                authority = row.get('official_site') or row.get('authority') or ''
                lit = lambda v: "'" + str(v).replace("'", "''") + "'"
                sql_lines.append(
                    'insert into destinations (slug,name,state,country_code,region_slug,currency,park_authority,access_type,destination_type,status,tier,seo_eligible) values ('
                    + ','.join(lit(v) for v in [slug, row['name'], state, cc, row['region'], 'EUR', authority, row['access'], row['kind']])
                    + ",'draft','tier1',false) on conflict (slug) do nothing;")
                results.append({'slug': slug, 'status': 'ready', 'country': cc, 'region': row['region'],
                                 'wikipedia_lang': lang, 'coordinate_source': coord_source,
                                 'airport': airport['code'], 'drive_minutes': rt['minutes']})
            except Exception as error:
                results.append({'slug': slug, 'status': 'held', 'reason': str(error)[-400:], 'country': cc, 'region': row['region']})
        print(cc, json.dumps(results[-1], ensure_ascii=False), flush=True)
        report.write_text(json.dumps({'content_model_calls': 0, 'results': results}, ensure_ascii=False, indent=2))

    if sql_lines:
        header = f'-- {cc}: ready-to-run inserts generated by finish-fr-pt-gr.py. Run manually with real DB credentials; never executed by the script itself.\n'
        existing = cfg['sql'].read_text() if cfg['sql'].exists() else header
        if not existing.endswith('\n'):
            existing += '\n'
        cfg['sql'].write_text(existing + '\n'.join(sql_lines) + ('\n' if sql_lines else ''))
    return results


def main():
    countries = sys.argv[1:] or list(COUNTRIES)
    used = set()
    totals = {}
    for cc in countries:
        results = process_country(cc, COUNTRIES[cc], used)
        totals[cc] = {'ready': sum(r['status'] == 'ready' for r in results), 'held': sum(r['status'] == 'held' for r in results), 'total': len(results)}
    print('TOTALS', json.dumps(totals), flush=True)


if __name__ == '__main__':
    main()
