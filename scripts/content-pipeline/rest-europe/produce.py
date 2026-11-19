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

def production_row(row):
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
            and not any(word in r['name'].casefold() for word in ('square', 'market', 'plaza'))]
base.rows = outdoor_rows

if __name__ == '__main__':
    # Delegate bounded stages to the proven implementation, not a second writer.
    if '--country' not in sys.argv:
        sys.argv += ['--country', ','.join(SETTINGS)]
    base.main()