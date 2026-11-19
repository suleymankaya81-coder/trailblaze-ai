"""Offline Nordic-format catalog, coverage and batch checks; no network or writes."""
import json
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT=Path(__file__).resolve().parent
REQUIRED={'slug','name','region','also_regions','country','kind','wave','wikidata','enwiki','lat','lng','official_site','access','source','source_urls'}

def validate_rows(rows,cc):
    errors=[];slugs=set();qids=set()
    for r in rows:
        s=r.get('slug','')
        if REQUIRED-r.keys():errors.append(f'{cc}/{s}: missing fields')
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',s) or s in slugs:errors.append(f'{cc}/{s}: invalid/duplicate slug')
        slugs.add(s)
        if r['country']!=cc:errors.append(f'{s}: wrong country')
        q=r.get('wikidata')
        if q:
            if q in qids or not re.fullmatch(r'Q[1-9][0-9]*',q):errors.append(f'{s}: invalid/duplicate identity')
            qids.add(q)
        lat,lng=r.get('lat'),r.get('lng')
        if (lat is None)!=(lng is None):errors.append(f'{s}: coordinate pair')
        if lat is not None and (not -90<=lat<=90 or not -180<=lng<=180):errors.append(f'{s}: coordinate range')
        if lat is not None and cc=='au' and not (-45<=lat<=-9 and 110<=lng<=160):errors.append(f'{s}: outside AU mainland/Tasmania/Lord Howe bounds')
        if lat is not None and cc=='nz' and not (-48<=lat<=-33 and 165<=lng<=180):errors.append(f'{s}: outside NZ bounds')
        if not r.get('source_urls') or any(urlparse(u).scheme not in ['http','https'] or not urlparse(u).netloc for u in r['source_urls']):errors.append(f'{s}: sources')
        if r['access']!='road' and not r.get('access_note'):errors.append(f'{s}: missing access caveat')
        if lat is not None and not r.get('coordinate_source'):errors.append(f'{s}: unsourced point')
    return errors

def validate_all():
    catalogs={cc:json.loads((ROOT/f'{cc}-catalog.json').read_text()) for cc in ['au','nz']}
    supplement=json.loads((ROOT/'territories-supplement.json').read_text())
    errors=[e for cc,rows in catalogs.items() for e in validate_rows(rows,cc)]
    for inventory in json.loads((ROOT/'coverage.json').read_text())['inventories']:
        if inventory['expected_count']!=len(inventory['entries']):errors.append(inventory['id']+': count mismatch')
        for entry in inventory['entries']:
            pool=supplement if entry.get('location')=='territories-supplement' else catalogs[inventory['country']]
            if entry['catalog_slug'] not in {r['slug'] for r in pool}:errors.append(inventory['id']+': unmatched '+entry['name'])
    manifest=json.loads((ROOT/'batch-manifest.json').read_text())
    for cc,rows in catalogs.items():
        combined=[]
        for batch in manifest:
            if batch['country']!=cc:continue
            chunk=json.loads((ROOT/batch['file']).read_text())
            if len(chunk)!=batch['count'] or len(chunk)>25 or [r['slug'] for r in chunk]!=batch['slugs']:errors.append(batch['file']+': malformed batch')
            combined.extend(chunk)
        if combined!=rows:errors.append(cc+': batches not lossless')
    return errors

if __name__=='__main__':
    errors=validate_all()
    if errors:raise SystemExit('\n'.join(errors))
    print('AU/NZ catalogs, coverage and lossless batches validated.')