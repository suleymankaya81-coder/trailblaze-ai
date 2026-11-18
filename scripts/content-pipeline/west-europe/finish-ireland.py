"""Apply retained Irish identity/photo assignments through the existing Nordic pipeline.

Run from the project root with --apply. Missing exact-place evidence remains held;
no paid models, invented coordinates or substituted destination photos are used.
"""
import argparse
import json
import re
from pathlib import Path
import produce as west

HERE = Path(__file__).parent
ASSIGNMENTS = HERE / 'ireland-assignments.json'

def verified_coordinates(assignment):
    lat, lng = assignment['lat'], assignment['lng']
    if not assignment.get('coordinate_source'):
        raise ValueError('Coordinate evidence required')
    if not (51.3 <= lat <= 55.5 and -10.7 <= lng <= -5.9):
        raise ValueError('Coordinates outside Ireland')
    return lat, lng

def exact_cover(assignment):
    photo = assignment['photo']
    if not assignment.get('photo_review') or not west.comp.licensed(photo):
        raise ValueError('Reviewed licensed exact-place cover required')
    return photo

def prepare(row, assignment):
    lat, lng = verified_coordinates(assignment)
    photo = exact_cover(assignment)
    packet = assignment['packet']
    if packet['slug'] != row['slug'] or packet['country_code'] != 'ie':
        raise ValueError('Wrong source identity')
    row = {**row, 'region': assignment.get('region', row['region'])}
    if assignment.get('access') == 'ferry':
        row['access'] = 'ferry'
        airport = west.prepare.airports(lat, lng, n=1, country='IE')[0]
        route = {'minutes': None, 'miles': None,
                 'coords': [[airport['lng'], airport['lat']], [lng, lat]]}
    else:
        airport, route = west.fin.resolve_route(lat, lng, 'IE')
    item = dict(slug=row['slug'], country='ie', status='facts', lang='en',
                packet=packet, photo=photo, lat=lat, lng=lng,
                coordinate_source=assignment['coordinate_source'],
                coordinate_role=assignment.get('coordinate_role', 'destination-point'),
                region=row['region'], airport=airport, route=route)
    (west.PIPE / 'source-packets' / (row['slug'] + '.json')).write_text(
        json.dumps(packet, ensure_ascii=False, indent=2))
    item = west.translate(row, item)
    if assignment.get('access') == 'ferry':
        item['payload']['drive_minutes'] = None
        item['payload']['drive_miles'] = None
        item['payload']['travel_plan']['arrival'] = assignment['arrival_note']
        item['payload']['travel_plan']['vehicle'] = 'No mainland road arrival is implied. Verify island transfers and local transport before travel.'
        for day in item['payload']['travel_plan']['days']:
            day['driving'] = 'Island visit: check passenger transfers; this is not a mainland driving route.'
        german = west.module('ireland_german', 'audit-dach.py')
        item['german'] = german.translate_row({'name': row['name'], **item['payload']})
    return item, row

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--apply', action='store_true')
    ap.add_argument('--limit', type=int, default=1000)
    args = ap.parse_args()
    assignments = json.loads(ASSIGNMENTS.read_text())
    cat = {r['slug']: r for r in west.rows(['ie'])}
    report = json.loads(west.REPORT.read_text())
    ready = []
    for slug, assignment in list(assignments.items())[:args.limit]:
        try:
            if not args.apply:
                verified_coordinates(assignment); exact_cover(assignment)
                print(slug, 'reviewed; would prepare', flush=True)
                continue
            item = west.load(slug)
            if not item.get('status'):
                item, cat[slug] = prepare(cat[slug], assignment)
                west.save(slug, item)
            else:
                cat[slug] = {**cat[slug], 'access': assignment.get('access', cat[slug]['access'])}
            ready.append(item)
            report[slug] = 'prepared'
            print(slug, 'prepared', flush=True)
        except Exception as exc:
            report[slug] = 'HELD completion: ' + repr(exc)[:250]
            print(slug, report[slug], flush=True)
        west.REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=1))
    if args.apply:
        for slug in west.publish(ready, cat, True):
            report[slug] = 'published'
        west.REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=1))

if __name__ == '__main__':
    main()