"""Cached DACH completeness audit and offline German publication, no content models."""
import argparse
import hashlib
import json
import re
from pathlib import Path
from combined_content import module
from placeholder_gate import day_start_mismatches, find_blocked_text

ROOT = Path(__file__).parent
CACHE = ROOT / 'dach' / 'german-page-cache'

# Reviewed German for the fixed English template sentences (quoted_visit.py), keyed exactly as
# translate_row() normalizes them (place name → WPRPLACE). These win over the Argos cache, which
# produced lowercase nouns and wrong meanings (audit 2026-11, rules B1–B5).
REVIEWED_DE = {
    'Check the official visitor information for WPRPLACE before departure. Entry, activity permissions and overnight accommodation are separate checks; the source excerpts below do not establish availability for your dates.':
        'Überprüfen Sie die offiziellen Besucherinformationen für WPRPLACE vor der Abreise. Eintritt, Aktivitätsgenehmigungen und Übernachtung müssen separat geprüft werden; die Quellenauszüge unten belegen keine Verfügbarkeit für Ihre Reisedaten.',
    'The reviewed sources do not establish current parking conditions for WPRPLACE. Check the official visitor information before departure.':
        'Die geprüften Quellen belegen keine aktuellen Parkbedingungen für WPRPLACE. Überprüfen Sie die offiziellen Besucherinformationen vor der Abreise.',
    'The reviewed sources do not establish mobile coverage for WPRPLACE. Check the official visitor information before departure.':
        'Die geprüften Quellen belegen keinen Mobilfunkempfang für WPRPLACE. Überprüfen Sie die offiziellen Besucherinformationen vor der Abreise.',
    'The reviewed sources do not establish fuel availability for WPRPLACE. Check the official visitor information before departure.':
        'Die geprüften Quellen belegen keine Tankmöglichkeiten für WPRPLACE. Überprüfen Sie die offiziellen Besucherinformationen vor der Abreise.',
    'The reviewed sources do not establish a best-season recommendation for WPRPLACE. Check the official visitor information before departure.':
        'Die geprüften Quellen belegen keine Empfehlung zur besten Reisezeit für WPRPLACE. Überprüfen Sie die offiziellen Besucherinformationen vor der Abreise.',
    'The reviewed sources do not establish all current access restrictions for WPRPLACE. Check the official visitor information before departure.':
        'Die geprüften Quellen belegen nicht alle aktuellen Zugangsbeschränkungen für WPRPLACE. Überprüfen Sie die offiziellen Besucherinformationen vor der Abreise.',
    'The reviewed sources do not establish a measured arrival schedule or supply stops for WPRPLACE. Check the official visitor information before departure.':
        'Die geprüften Quellen belegen weder einen gemessenen Ankunftsplan noch Versorgungsstopps für WPRPLACE. Überprüfen Sie die offiziellen Besucherinformationen vor der Abreise.',
    'The reviewed sources do not establish vehicle size or rental restrictions; do not assume RV access for WPRPLACE. Check the official visitor information before departure.':
        'Die geprüften Quellen belegen keine Beschränkungen für Fahrzeuggröße oder Mietwagen; gehen Sie nicht davon aus, dass WPRPLACE mit dem Wohnmobil erreichbar ist. Überprüfen Sie die offiziellen Besucherinformationen vor der Abreise.',
    'The reviewed sources do not establish a verified sunrise or sunset viewpoint for WPRPLACE. Check the official visitor information before departure.':
        'Die geprüften Quellen belegen keinen verifizierten Aussichtspunkt für Sonnenauf- oder -untergang bei WPRPLACE. Überprüfen Sie die offiziellen Besucherinformationen vor der Abreise.',
    'Parking check': 'Parken',
    'Access check': 'Zugang',
    'Timing check': 'Beste Reisezeit',
    'Fuel check': 'Tanken',
    'Signal check': 'Mobilfunkempfang',
    'Choose one local visit; travel time and onward transfers are not verified.':
        'Wählen Sie einen Besuch vor Ort; Reisezeit und Anschlussverbindungen werden nicht geprüft.',
    'Suggested: choose a daytime visit after checking official access hours':
        'Vorschlag: Wählen Sie einen Tagesbesuch nach Überprüfung der offiziellen Zugangszeiten',
    'Suggested: 9 AM start, after checking official access hours':
        'Vorschlag: 9 Uhr Start, nach Überprüfung der offiziellen Zugangszeiten',
}
# Multi-day templates: the place is copied from the English text, never replaced by the row name.
TEMPLATE_DE = [
    (re.compile(r'^Suggested: morning departure from (.+)$'), r'Vorschlag: Abfahrt am Morgen ab \1'),
    (re.compile(r'^About ([\d.,]+) km from (.+?) in a straight line; road distance is longer, so check the route before departure\.$'),
     r'Etwa \1 km Luftlinie ab \2; die Straßenstrecke ist länger, prüfen Sie die Route vor der Abfahrt.'),
]

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
    if day_start_mismatches(plan, out):
        raise ValueError('Translated day start names a different place than the English plan')
    if find_blocked_text(out):
        raise ValueError('Translation contains placeholder text')
    if not out['metaTitle'] or len(out['metaTitle']) > 60 or len(out['metaDescription']) > 160:
        raise ValueError('Invalid German search metadata')
    return out

def fit_title(name, suffix, limit=60):
    # Never cut a place name mid-word ("… National Pa – Reiseplan"): drop the suffix first,
    # then whole trailing words of the name.
    if len(name) + len(suffix) <= limit:
        return name + suffix
    if len(name) <= limit:
        return name
    kept = ''
    for word in name.split():
        if len((kept + ' ' + word).strip()) > limit:
            break
        kept = (kept + ' ' + word).strip()
    return kept or name[:limit]

def translate_row(row):
    import argostranslate.translate
    CACHE.mkdir(parents=True, exist_ok=True)
    name = row['name']
    def text(value):
        if not value: return value
        # Reuse repeated source-gap sentences without sending place names to the translator.
        normalized = value.replace(name, 'WPRPLACE')
        if normalized in REVIEWED_DE:
            return REVIEWED_DE[normalized].replace('WPRPLACE', name)
        for pattern, german in TEMPLATE_DE:
            if pattern.match(value):
                return pattern.sub(german, value)
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
        'metaTitle': fit_title(name, ' – Reiseplan'),
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