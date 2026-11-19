"""Resumable remaining-Europe production using the retained Nordic stage contract.

Run from the project root with PYTHONPATH containing the installed Argos package:
  python3 scripts/content-pipeline/rest-europe/produce.py facts --country pl --limit 20
  python3 scripts/content-pipeline/rest-europe/produce.py translate --country pl
  python3 scripts/content-pipeline/rest-europe/produce.py publish --country pl --apply
Countries run in the requested order; failed identities remain named holds.
"""
import argparse
import importlib.util
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
PIPE = HERE.parent
sys.path.insert(0, str(PIPE))
spec = importlib.util.spec_from_file_location('west_reused', PIPE / 'west-europe/produce.py')
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)

# Country bounds are validation limits, not inferred sightseeing coordinates.
SETTINGS = {
    'pl': ('pl', 'PLN', 'Poland', 'Q36', (49, 55, 14, 24.3)),
    'ro': ('ro', 'RON', 'Romania', 'Q218', (43.5, 48.4, 20.2, 30)),
    'sk': ('sk', 'EUR', 'Slovakia', 'Q214', (47.6, 49.7, 16.7, 22.7)),
    'cz': ('cs', 'CZK', 'Czechia', 'Q213', (48.5, 51.1, 12, 18.9)),
    'hu': ('hu', 'HUF', 'Hungary', 'Q28', (45.7, 48.6, 16, 23)),
    'si': ('sl', 'EUR', 'Slovenia', 'Q215', (45.4, 46.9, 13.3, 16.7)),
    'hr': ('hr', 'EUR', 'Croatia', 'Q224', (42.3, 46.6, 13.4, 19.5)),
    'me': ('sr', 'EUR', 'Montenegro', 'Q236', (41.8, 43.6, 18.4, 20.4)),
    'al': ('sq', 'ALL', 'Albania', 'Q222', (39.5, 42.7, 19.1, 21.1)),
    'mk': ('mk', 'MKD', 'North Macedonia', 'Q221', (40.8, 42.4, 20.4, 23.1)),
    'ba': ('bs', 'BAM', 'Bosnia and Herzegovina', 'Q225', (42.5, 45.3, 15.7, 19.7)),
    'rs': ('sr', 'RSD', 'Serbia', 'Q403', (42.2, 46.3, 18.8, 23.1)),
    'bg': ('bg', 'BGN', 'Bulgaria', 'Q219', (41.2, 44.3, 22.3, 28.7)),
    'ee': ('et', 'EUR', 'Estonia', 'Q191', (57.4, 59.9, 21.7, 28.3)),
    'lv': ('lv', 'EUR', 'Latvia', 'Q211', (55.6, 58.2, 20.8, 28.3)),
    'lt': ('lt', 'EUR', 'Lithuania', 'Q37', (53.8, 56.5, 20.8, 27)),
    'lu': ('fr', 'EUR', 'Luxembourg', 'Q32', (49.4, 50.3, 5.7, 6.6)),
    'mt': ('en', 'EUR', 'Malta', 'Q233', (35.7, 36.2, 14.1, 14.7)),
    'cy': ('en', 'EUR', 'Cyprus', 'Q229', (34.5, 35.8, 32.2, 34.7)),
}
base.COUNTRIES = {cc: dict(lang=s[0], currency=s[1], name=s[2], mhr='', bounds=s[4]) for cc, s in SETTINGS.items()}
base.CATALOGS = PIPE / 'claude-handoff/rest-europe'
base.OUT = HERE / 'completion'
base.CACHE = HERE / 'discovery-cache'
base.REPORT = HERE / 'production-report.json'
base.OUT.mkdir(parents=True, exist_ok=True)
base.CACHE.mkdir(parents=True, exist_ok=True)
base.prepare.EXTRA_COUNTRIES += tuple(cc.upper() for cc in SETTINGS)
base.comp.COUNTRY_NAMES.update({cc: s[2] for cc, s in SETTINGS.items()})

def identity(row, lang):
    if not row.get('wikidata'):
        raise ValueError('catalog identity needs reviewed Wikidata ID')
    result = base.fin.identity_and_packet(row, row['country'], lang, base.CACHE)
    countries = {c.get('mainsnak', {}).get('datavalue', {}).get('value', {}).get('id')
                 for c in result[3].get('claims', {}).get('P17', [])}
    if countries and SETTINGS[row['country']][3] not in countries:
        raise ValueError('Wikidata identity belongs to another country')
    stop = result[0]['approved_stops'][0]
    short = stop['name'].split(',')[0].strip()
    if stop['name'].casefold() not in stop['quote'].casefold() and short.casefold() in stop['quote'].casefold():
        stop['name'] = short
    return result

base.identity = identity

# Urban squares accidentally entered the original broad Wikidata discovery.
# Retain their catalog records, but do not publish them as outdoor destinations.
original_rows = base.rows
SK_SLUGS = {
    'pieniny-national-park': 'pieniny-national-park-sk',
    'tatra-national-park': 'tatra-national-park-sk',
    'babia-gora': 'babia-gora-sk',
    'kasprowy-wierch': 'kasprowy-wierch-sk',
    'rysy': 'rysy-sk',
    'swinica': 'swinica-sk',
}
SK_EXCLUDED = {
    'national-park-podunajsko': 'Planned park shelved in 2024; not an existing national park.',
    'danubian-limes': 'Transnational Roman cultural frontier, not one natural destination.',
    'primate-s-square': 'Urban square, not a nature park.',
    'snp-square': 'Urban square, not a nature park.',
    'slovak-national-uprising-square-banska-bystrica': 'Urban square, not a nature park.',
    'st-francis-square': 'Urban square with incorrect Philippines coordinates; not a nature park.',
}

# Czech counterparts of cross-border summits keep their own slug; the shared
# Polish record is never overwritten. Covers are reviewed exact-place Commons files.
CZ_SLUGS = {s: s + '-cz' for s in ('snezka', 'kralicky-sneznik', 'szrenica', 'czantoria-wielka')}
CZ_REGIONS = {'petrin': 'prague', 'czantoria-wielka': 'moravian-silesian-region', 'szrenica': 'liberec-region'}
CZ_COVERS = {
    'koneprusy-caves': 'File:Jeskyne Koneprusy.JPG',
    'krivoklatsko-protected-landscape-area': 'File:Křivoklátsko - Podzimní bučina.JPG',
    'kralicky-sneznik-cz': 'File:GlatzerSchneeberg-1.jpg',
    'zbrasov-aragonite-caves': 'File:Národní přírodní památka Zbrašovské aragonitové jeskyně, okres Přerov (11).jpg',
    'orseg-national-park': 'File:OrsegiNemzetiPark1.jpg',
    'planina-cave': 'File:Planina Cave Slovenia - entrance.JPG',
    'velika-planina': 'File:Velika planina (8965483960).jpg',
}

# Hungarian urban squares (tér/körtér), transit lines and cultural sites are not
# outdoor destinations even when the catalog lists them.
HU_EXCLUDED = {
    'budapest-metro-line-1': 'Underground railway line, not an outdoor destination.',
    'danubian-limes': 'Transnational Roman cultural frontier, not one natural destination.',
    'early-christian-necropolis-of-pecs': 'Cultural burial site, not a nature destination.',
    'szinva-terrace': 'Urban riverside promenade in Miskolc, not a nature destination.',
}
HU_SQUARE_WORDS = (' tér', ' tere', 'körtér', 'square')

# Croatian catalog rows that are not one Croatian outdoor destination: the
# transnational beech-forest listing whose Croatian components lie inside
# Northern Velebit National Park (already a page), and the Una waterfall whose
# published page already sits under Bosnia and Herzegovina.
HR_EXCLUDED = {
    'ancient-and-primeval-beech-forests-of-the-carpathians-and-other-regions-of-europe':
        'Transnational serial listing; Croatian components lie inside Northern Velebit National Park, already a page.',
    'strbacki-buk': 'Una-river waterfall already published under Bosnia and Herzegovina.',
    'krndija': 'No licensed photograph of Krndija itself was found on Wikimedia Commons.',
    'psunj': 'No licensed photograph of Psunj itself was found on Wikimedia Commons.',
    'grabovaca': 'Commons results show neighbouring caves (Amidžina, Tabakuša), not Grabovača itself.',
}
# "Red Lake" is already Romania's slug; the Croatian Crveno jezero on Biokovo
# keeps its own local name so neither page overwrites the other.
HR_SLUGS = {'red-lake': 'crveno-jezero'}
# Reviewed exact-place Commons files for Croatian candidates the automatic
# search could not match; filled in only after each file is checked by hand.
HR_COVERS = {
    'sveta-gera': 'File:Trdinov vrh 02.jpg',
    'crveno-jezero': 'File:Red Lake Imotski 002.jpg',
}

# Serbian catalog rows that are not one Serbian outdoor destination: Belgrade
# squares and an urban quarter, the transnational Roman frontier, mountain rows
# duplicated by their own national-park row, a summit inside Kopaonik National
# Park, places already published under a neighbouring country, and the Kosovo
# entries held back with the war-zone rule.
RS_EXCLUDED = {
    'cvetni-trg': 'Belgrade flower square, not a nature destination.',
    'nikola-pasic-square': 'Belgrade city square, not a nature destination.',
    'republic-square': 'Belgrade city square, not a nature destination.',
    'slavija-square': 'Belgrade city square, not a nature destination.',
    'studentski-trg': 'Belgrade city square, not a nature destination.',
    'terazije': 'Belgrade city square, not a nature destination.',
    'trg-kralja-aleksandra': 'Belgrade city square, not a nature destination.',
    'kopitareva-gradina': 'Belgrade urban quarter, not a nature destination.',
    'danubian-limes': 'Transnational Roman cultural frontier, not one natural destination.',
    'fruska-gora': 'Mountain row duplicated by Fruška Gora National Park.',
    'kopaonik': 'Mountain row duplicated by Kopaonik National Park.',
    'tara': 'Mountain row duplicated by Tara National Park; the Tara River Canyon page sits under Bosnia and Herzegovina.',
    'pancic-s-peak': 'Summit inside Kopaonik National Park, already a page.',
    'ruy-mountain': 'Border massif already published under Bulgaria.',
    'skopska-crna-gora': 'Border massif already published under North Macedonia.',
    'zvornik-lake': 'Reservoir already published under Bosnia and Herzegovina.',
    'sharr-mountains-national-park': 'National park lies in Kosovo; held back with the war-zone rule.',
    'prokletije-national-park': 'Park lies in Kosovo; held back with the war-zone rule.',
    'batllava-lake': 'Reservoir lies in Kosovo; held back with the war-zone rule.',
    'gazivoda-lake': 'Reservoir lies in Kosovo; held back with the war-zone rule.',
    'radoniq-lake': 'Reservoir lies in Kosovo; held back with the war-zone rule.',
    'goljak': 'Mountain lies in Kosovo; held back with the war-zone rule.',
}
# Montenegro already publishes the Mokra Gora near Plav; the Serbian Mokra Gora
# on the Drina side keeps its own address so neither page overwrites the other.
RS_SLUGS = {'mokra-gora': 'mokra-gora-serbia'}

# Estonian catalog rows that are not one Estonian outdoor destination: the
# transnational geodetic arc and the duplicate Lake Peipus row.
EE_EXCLUDED = {
    'struve-geodetic-arc': 'Transnational geodetic arc, not one natural destination.',
    'lake-peipus-ee': 'Duplicate of the lake-peipus row.',
}

# Latvian catalog rows that are not one Latvian outdoor destination: the
# transnational geodetic arc and the Lake Murati row whose slug Estonia
# already publishes.
LV_EXCLUDED = {
    'struve-geodetic-arc': 'Transnational geodetic arc, not one natural destination.',
    'lake-murati': 'Slug already published for Estonia\'s Lake Murati.',
}

# Maltese catalog rows that are not one outdoor destination: Saqqajja is a
# Rabat landmark loggia/fountain, not a nature place.
MT_EXCLUDED = {
    'saqqajja': 'Rabat landmark loggia, not a nature destination.',
}

# Reviewed coordinate/region corrections: Wikidata points on the wrong side of a
# border or at a same-named place produce foreign regions and wrong routes.
PLACE_FIXES = {
    'divjake-karavasta-national-park': {'lat': 40.9969, 'lng': 19.4992, 'region': 'fier-county'},
    'karavasta-lagoon': {'lat': 40.9200, 'lng': 19.5030, 'region': 'fier-county'},
    'lake-butrint': {'lat': 39.7700, 'lng': 20.0250, 'region': 'vlore-county'},
    'pericnik-falls': {'lat': 46.4419, 'lng': 13.8953, 'region': 'kranjska-gora'},
    'matajur': {'region': 'kobarid'},
    'aggtelek-national-park': {'lat': 48.4717, 'lng': 20.4950, 'region': 'borsod-abauj-zemplen'},
    'ferto-hansag-national-park': {'lat': 47.6567, 'lng': 16.8608, 'region': 'gyor-moson-sopron'},
    'neusiedl-lake': {'lat': 47.7211, 'lng': 16.6869, 'region': 'gyor-moson-sopron'},
    'danube-drava-national-park': {'region': 'baranya'},
    # Kopaonik National Park's Wikidata point sits on the Kosovo side of the
    # ridge; the park itself lies in Serbia's Raška district. Mokra Gora's
    # Wikidata item is the Kosovo village, not the Serbian one above Užice.
    'kopaonik-national-park': {'lat': 43.3200, 'lng': 20.6800, 'region': 'raska-administrative-district'},
    'mokra-gora-serbia': {'lat': 43.792478, 'lng': 19.506933, 'region': 'zlatibor-administrative-district'},
    # The Blue Grotto's Wikidata point sits in the sea off Wied iż-Żurrieq, so
    # no region resolves; the caves are reached from the Qrendi shore.
    'blue-grotto-malta': {'lat': 35.8208, 'lng': 14.4572, 'region': 'southern-region'},
}

def production_row(row):
    if row['country'] == 'cz':
        if row['slug'] == 'ancient-and-primeval-beech-forests-of-the-carpathians-and-other-regions-of-europe':
            return {**row, 'slug': 'jizerskohorske-buciny', 'name': 'Jizerskohorské bučiny',
                    'wikidata': 'Q8546570', 'enwiki': None, 'lat': None, 'lng': None}
        return {**row, 'slug': CZ_SLUGS.get(row['slug'], row['slug']), 'region': CZ_REGIONS.get(row['slug'])}
    if row['country'] == 'hr' and row['slug'] in HR_SLUGS:
        return {**row, 'slug': HR_SLUGS[row['slug']]}
    if row['country'] == 'rs' and row['slug'] in RS_SLUGS:
        slug = RS_SLUGS[row['slug']]
        return {**row, 'slug': slug, 'wikidata': 'Q1016709',
                'enwiki': 'https://en.wikipedia.org/wiki/Mokra_Gora', **PLACE_FIXES.get(slug, {})}
    if row['slug'] in PLACE_FIXES:
        return {**row, **PLACE_FIXES[row['slug']]}
    if row['country'] != 'sk':
        return row
    if row['slug'] == 'ancient-and-primeval-beech-forests-of-the-carpathians-and-other-regions-of-europe':
        return {**row, 'slug': 'stuzica-primeval-forest', 'name': 'Stužica Primeval Forest',
                'wikidata': 'Q1786462', 'enwiki': 'https://en.wikipedia.org/wiki/Stu%C5%BEica',
                'lat': 49.08333333, 'lng': 22.53333333}
    return {**row, 'slug': SK_SLUGS.get(row['slug'], row['slug'])}

def outdoor_rows(countries):
    return [production_row(r) for r in original_rows(countries)
            if not (r['country'] == 'sk' and r['slug'] in SK_EXCLUDED)
            and not (r['country'] == 'hr' and r['slug'] in HR_EXCLUDED)
            and not (r['country'] == 'rs' and r['slug'] in RS_EXCLUDED)
            and not (r['country'] == 'ee' and r['slug'] in EE_EXCLUDED)
            and not (r['country'] == 'lv' and r['slug'] in LV_EXCLUDED)
            and not (r['country'] == 'mt' and r['slug'] in MT_EXCLUDED)
            and not (r['country'] == 'hu' and (r['slug'] in HU_EXCLUDED
                     or any(w in ' ' + r['name'].casefold() for w in HU_SQUARE_WORDS)))
            and not any(word in (r['name'] + ' ' + (r.get('enwiki') or '')).casefold()
                        for word in ('square', 'market', 'plaza', 'náměstí', 'nám.', 'zelný trh'))]
base.rows = outdoor_rows

original_coordinates = base.fin.resolve_coordinates
def reviewed_coordinates(row, page, entity, bounds):
    fix = PLACE_FIXES.get(row['slug'], {})
    if 'lat' in fix:
        return fix['lat'], fix['lng'], 'reviewed-coordinate-correction'
    return original_coordinates(row, page, entity, bounds)
base.fin.resolve_coordinates = reviewed_coordinates

# Retained facts can predate a reviewed correction. Fix the whole fact bundle
# before translation/publication, not only coordinates during fresh discovery.
original_load = base.load
def reviewed_load(slug):
    item = original_load(slug)
    fix = PLACE_FIXES.get(slug)
    if not item or not fix:
        return item
    corrected = {**item, **fix}
    if 'lat' in fix and (item.get('lat'), item.get('lng')) != (fix['lat'], fix['lng']):
        airport, route = base.fin.resolve_route(fix['lat'], fix['lng'], item['country'].upper())
        corrected.update(airport=airport, route=route)
        if item.get('payload'):
            corrected['payload'] = {**item['payload'], 'lat': fix['lat'], 'lng': fix['lng'],
                'airport_lat': airport['lat'], 'airport_lng': airport['lng'],
                'nearest_airport_code': airport['code'], 'nearest_airport_name': airport['name'],
                'drive_minutes': route['minutes'], 'drive_miles': route['miles']}
    return corrected
base.load = reviewed_load

REVIEWED_COVERS = {**CZ_COVERS, **HR_COVERS}

original_cover = base.cover
def reviewed_cover(row, page, lang, used):
    fname = REVIEWED_COVERS.get(row['slug'])
    if fname:
        photo = base.prepare.file_info(fname)
        if photo and base.comp.licensed(photo):
            return photo
    return original_cover(row, page, lang, used)
base.cover = reviewed_cover

# Some countries (e.g. North Macedonia) expose no state in OSM; fall back to the
# containing municipality at a finer zoom instead of holding the place.
original_region = base.region_for
def region_with_fallback(row, lat, lng):
    try:
        return original_region(row, lat, lng)
    except ValueError:
        import re, time, requests
        time.sleep(1)
        a = requests.get('https://nominatim.openstreetmap.org/reverse',
                         params={'lat': lat, 'lon': lng, 'format': 'json', 'zoom': 10, 'accept-language': 'en'},
                         headers={'User-Agent': 'wildparkroutes-content/1.0 (info@minialife.com)'}, timeout=30).json().get('address', {})
        name = a.get('municipality') or a.get('county') or a.get('city') or a.get('town')
        if not name:
            raise
        name = re.sub(r'^(Municipality of|Opština|Općina|Obshtina)\s+', '', name)
        return re.sub(r'[^a-z0-9]+', '-', name.casefold()).strip('-')
base.region_for = region_with_fallback

if __name__ == '__main__':
    # Delegate bounded stages to the proven implementation, not a second writer.
    if '--country' not in sys.argv:
        sys.argv += ['--country', ','.join(SETTINGS)]
    base.main()