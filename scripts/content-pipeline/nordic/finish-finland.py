"""Apply retained, individually reviewed Finnish source/photo/location assignments.

Run from project root with --apply to prepare and publish; no model calls.
Assignments contain source quotes, licensed exact-place covers and coordinate evidence.
Missing assignments remain explicit holds; the normal publish-wave checks stay intact.
"""
import argparse
import json
from pathlib import Path
import produce as nordic

ASSIGNMENTS = Path(__file__).with_name('finland-assignments.json')

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--apply', action='store_true')
    ap.add_argument('--limit', type=int, default=100)
    args = ap.parse_args()
    assignments = json.loads(ASSIGNMENTS.read_text())
    catalog = {r['slug']: r for r in nordic.rows(['fi'])}
    report = json.loads(nordic.REPORT.read_text())
    ready = []
    for slug, assignment in list(assignments.items())[:args.limit]:
        item = nordic.load(slug)
        if item.get('status') == 'prepared':
            ready.append(item)
            continue
        row = {**catalog[slug], 'region': assignment['region']}
        if not args.apply:
            print(slug, 'reviewed assignment; would prepare')
            continue
        try:
            lat, lng = assignment['lat'], assignment['lng']
            airport, route = nordic.fin.resolve_route(lat, lng, 'FI')
            item = dict(slug=slug, country='fi', status='facts', lang=assignment['lang'],
                        packet=assignment['packet'], photo=assignment['photo'], lat=lat, lng=lng,
                        coordinate_source=assignment['coordinate_source'],
                        coordinate_role=assignment['coordinate_role'], region=assignment['region'],
                        airport=airport, route=route)
            nordic.save(slug, item)
            (nordic.PIPE / 'source-packets' / f'{slug}.json').write_text(json.dumps(item['packet'], ensure_ascii=False, indent=2))
            item = nordic.translate(row, item)
            nordic.save(slug, item)
            report[slug] = 'prepared'
            ready.append(item)
            print(slug, 'prepared', flush=True)
        except Exception as exc:
            report[slug] = 'HELD completion: ' + repr(exc)[:250]
            print(slug, report[slug], flush=True)
        nordic.REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=1))
    if args.apply:
        for slug in nordic.publish(ready, catalog, True):
            report[slug] = 'published'
        nordic.REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=1))

if __name__ == '__main__':
    main()