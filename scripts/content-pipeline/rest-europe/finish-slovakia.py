"""Prepare retained exact-place Slovak assignments, then use existing publication gates.

Run with offline Argos installed: finish-slovakia.py --apply.
Original colliding Polish slugs and their published records are never overwritten.
"""
import argparse
import json
from pathlib import Path
import produce as runner

HERE = Path(__file__).parent
ASSIGNMENTS = HERE / 'slovakia-assignments.json'

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--apply', action='store_true')
    args = ap.parse_args()
    base = runner.base
    catalog = {r['slug']: r for r in base.rows(['sk'])}
    report = json.loads(base.REPORT.read_text())
    ready = []
    for slug, assignment in json.loads(ASSIGNMENTS.read_text()).items():
        if not args.apply:
            print(slug, 'reviewed assignment; would prepare')
            continue
        item = base.load(slug)
        try:
            if item.get('status') != 'prepared':
                lat, lng = assignment['lat'], assignment['lng']
                if item.get('airport') and item.get('route'):
                    airport, route = item['airport'], item['route']
                else:
                    airport, route = base.fin.resolve_route(lat, lng, 'SK')
                item = dict(slug=slug, country='sk', status='facts', lang=assignment['lang'],
                            packet=assignment['packet'], photo=assignment['photo'], lat=lat, lng=lng,
                            coordinate_source=assignment['coordinate_source'], region=assignment['region'],
                            airport=airport, route=route)
                base.save(slug, item)
                (base.PIPE / 'source-packets' / f'{slug}.json').write_text(json.dumps(item['packet'], ensure_ascii=False, indent=2))
                item = base.translate(catalog[slug], item)
                base.save(slug, item)
            report[slug] = 'prepared'
            ready.append(item)
            print(slug, 'prepared', flush=True)
        except Exception as error:
            report[slug] = 'HELD completion: ' + repr(error)[:250]
            print(slug, report[slug], flush=True)
        base.REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=1))
    if args.apply:
        for slug in base.publish(ready, catalog, True):
            report[slug] = 'published'
        base.REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=1))

if __name__ == '__main__':
    main()