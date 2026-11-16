"""Cached DACH completeness audit and offline German publication, no content models."""
import argparse
import hashlib
import json
from pathlib import Path
from combined_content import module

ROOT = Path(__file__).parent
CACHE = ROOT / 'dach' / 'german-page-cache'

def issues(row):
    missing = [key for key in ('tagline', 'hero_image', 'photo_credit', 'seo_title',
        'seo_description', 'region_slug', 'currency', 'permit_note', 'permit_source_url',
        'nearest_airport_code') if not row.get(key)]
    if row.get('lat') is None or row.get('lng') is None:
        missing.append('coordinates')
    plan = row.get('travel_plan') or {}
    if not plan.get('days') or any(not d.get('stops') for d in plan.get('days', [])):
        missing.append('daily_stops')
    return missing

def validate_translation(row, out):
    plan = row['travel_plan']
    if len(out['days']) != len(plan['days']) or len(out['intel']) != len(plan['intel']):
        raise ValueError('Translation changed plan structure')
    for original, translated in zip(plan['days'], out['days']):
        if len(original['stops']) != len(translated['stops']):
            raise ValueError('Translation changed stop count')
        for a, b in zip(original['stops'], translated['stops']):
            if a['name'] != b['name'] or a.get('stop_id') != b.get('stop_id'):
                raise ValueError('Translation changed routing identity')
    if not out['metaTitle'] or len(out['metaTitle']) > 60 or len(out['metaDescription']) > 160:
        raise ValueError('Invalid German search metadata')
    return out

def translate_row(row):
    import argostranslate.translate
    CACHE.mkdir(parents=True, exist_ok=True)
    name = row['name']
    def text(value):
        if not value: return value
        # Reuse repeated source-gap sentences without sending place names to the translator.
        normalized = value.replace(name, 'WPRPLACE')
        path = CACHE / (hashlib.sha256(normalized.encode()).hexdigest() + '.json')
        if path.exists(): result = json.loads(path.read_text())['translated']
        else:
            result = argostranslate.translate.translate(normalized, 'en', 'de')
            if not result.strip(): raise ValueError('Empty German translation')
            path.write_text(json.dumps({'original': normalized, 'translated': result,
                'method': 'Argos en-de offline; language-quality review not certified'}, ensure_ascii=False))
        return result.replace('WPRPLACE', name)
    plan = row['travel_plan']
    days = []
    for day in plan['days']:
        days.append({**day, **{k: text(day[k]) for k in ('title','start','driving','note') if k in day},
            'stops': [{**s, 'detail': text(s['detail'])} for s in day['stops']]})
    out = {'name': name, 'region': text(row['region']), 'tagline': text(row['tagline']),
        'bestSeason': text(row['best_season']), 'permitHeadline': text(row['permit_headline']),
        'permitNote': text(row['permit_note']), 'days': days,
        'intel': [{**i, 'title': text(i['title']), 'text': text(i['text'])} for i in plan.get('intel', [])],
        **{k: text(plan.get(k)) for k in ('arrival', 'vehicle', 'goldenHour')},
        'metaTitle': (name[:47] + ' – Reiseplan')[:60],
        'metaDescription': (f'{name}: Besuchsplan, Karte und Hinweise zur Anreise. Zugang und saisonale Regeln vor der Reise bei offiziellen Stellen prüfen.')[:160]}
    return validate_translation(row, out)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--translate', action='store_true')
    parser.add_argument('--shard', default='0/1', help='i/n: translate only every n-th row (parallel runs)')
    parser.add_argument('--countries', default='de,at,ch', help='comma-separated ISO codes, e.g. it')
    args = parser.parse_args()
    lit = lambda v: "'" + str(v).replace("'", "''") + "'"
    prepare = module('dach_audit_prepare', 'prepare-wave.py')
    rows = json.loads(prepare.q("select coalesce(json_agg(d),'[]') from (select * from destinations where country_code in (" + ','.join(lit(c) for c in args.countries.split(',')) + ") order by slug) d"))
    existing = set(prepare.q("select entity_id from content_translations where entity_type='destination' and locale='de' and status='published'").splitlines())
    results = []
    lit2 = lambda v: "'" + str(v).replace("'", "''") + "'"
    si, sn = map(int, args.shard.split('/'))
    if sn > 1: rows = rows[si::sn]
    for row in rows:
        result = {'slug': row['slug'], 'country': row['country_code'], 'status': row['status'], 'missing': issues(row)}
        if args.translate and row['status'] == 'published' and row['slug'] not in existing and not result['missing']:
            path = CACHE / (row['slug'] + '.json')
            if path.exists(): out = validate_translation(row, json.loads(path.read_text()))
            else:
                out = translate_row(row)
                path.write_text(json.dumps(out, ensure_ascii=False, indent=2))
            prepare.q("insert into content_translations(entity_type,entity_id,locale,fields,status) values ('destination',"
                + lit(row['slug']) + ",'de'," + lit(json.dumps(out, ensure_ascii=False)) + "::jsonb,'published') "
                + "on conflict(entity_type,entity_id,locale) do nothing")
            existing.add(row['slug'])
        result['german'] = row['slug'] in existing
        results.append(result)
        print(json.dumps(result, ensure_ascii=False), flush=True)
        (ROOT/'dach'/('full-audit-2026-11-16.json' if args.countries == 'de,at,ch' else f"german-audit-{args.countries.replace(',','-')}-{si}.json")).write_text(json.dumps({'total': len(rows), 'content_model_calls': 0,
            'results': results}, ensure_ascii=False, indent=2))

if __name__ == '__main__': main()