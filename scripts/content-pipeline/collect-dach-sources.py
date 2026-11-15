"""Cache DACH official website candidates without AI or automatic editorial approval.

Wikidata names, country and website claims are discovery hints, not verification.
Run once before finish-dach-free.py --remaining. Existing source packets are retained.
"""
import json
from pathlib import Path
import re
import unicodedata
import threading
import time
import requests
from source_evidence import fetch_source

ROOT = Path(__file__).parent
CACHE = ROOT / 'dach' / 'source-candidates'
COUNTRIES = {'de': 'Q183', 'at': 'Q40', 'ch': 'Q39'}
API = 'https://www.wikidata.org/w/api.php'
HEADERS = {'User-Agent': 'WildParkRoutes source collector/1.0'}
BLOCKED = threading.Event()

def normalized(value):
    value = unicodedata.normalize('NFKD', value.replace('ß', 'ss')).encode('ascii', 'ignore').decode().lower()
    return set(re.findall(r'[a-z0-9]+', value)) - {'national', 'park', 'nationalpark', 'nature', 'naturpark',
        'biosphere', 'reserve', 'region', 'area', 'biospharenreservat', 'lake', 'mountain', 'valley', 'of', 'the'}

def identity_matches(row, entity):
    countries = {c.get('mainsnak', {}).get('datavalue', {}).get('value', {}).get('id')
        for c in entity.get('claims', {}).get('P17', [])}
    if COUNTRIES[row['country']] not in countries:
        return False
    labels = [v['value'] for v in entity.get('labels', {}).values()]
    labels += [a['value'] for group in entity.get('aliases', {}).values() for a in group]
    expected = [normalized(row['name']), normalized(row['authority'])]
    return any(words and words == normalized(label) for words in expected for label in labels)

def api(params):
    if BLOCKED.is_set():
        raise ValueError('Source discovery paused after provider rate/access refusal; no automatic retries')
    response = requests.get(API, params={**params, 'format': 'json'}, headers=HEADERS, timeout=25)
    if response.status_code in (403, 429):
        BLOCKED.set()
        raise ValueError(f'Source discovery refused: HTTP {response.status_code}; batch paused without retries')
    response.raise_for_status()
    return response.json()

def collect(row):
    path = CACHE / (row['slug'] + '.json')
    if path.exists():
        return json.loads(path.read_text())
    result = {'slug': row['slug'], 'approved_for_generation': False, 'status': 'held', 'sources': []}
    try:
        packet_path = ROOT / 'source-packets' / (row['slug'] + '.json')
        if packet_path.exists():
            packet = json.loads(packet_path.read_text())
            result.update(status='existing_packet_retained', packet_approved=packet.get('approved_for_generation', False))
        else:
            ids = []
            for query, language in [(row['authority'], 'de'), (row['name'], 'en')]:
                hits = api({'action': 'wbsearchentities', 'search': query, 'language': language, 'limit': 3})
                ids.extend(h['id'] for h in hits.get('search', []))
            if not ids:
                raise ValueError('No matching identity found')
            entities = api({'action': 'wbgetentities', 'ids': '|'.join(dict.fromkeys(ids)),
                'props': 'labels|aliases|claims', 'languages': 'en|de'})['entities']
            matched = [e for e in entities.values() if identity_matches(row, e)]
            if len(matched) != 1:
                raise ValueError('Missing or ambiguous same-country exact identity')
            entity = matched[0]
            result['wikidata_id'] = entity['id']
            urls = [c.get('mainsnak', {}).get('datavalue', {}).get('value')
                for c in entity.get('claims', {}).get('P856', [])]
            urls = [u for u in dict.fromkeys(urls) if isinstance(u, str) and u.startswith('https://')]
            if not urls:
                raise ValueError('Exact identity has no HTTPS official website claim')
            # At most one fetch per place. Site language/content requires a later source review.
            result['candidate_url'] = urls[0]
            source = fetch_source(urls[0])
            result['sources'] = [{**source, 'kind': 'candidate_official'}]
            result['status'] = 'review_required'
            result['reason'] = 'Review official ownership, English prose, exact excerpts and visit identity before approval'
    except Exception as error:
        # Do not retain remote error bodies or credentials in the report.
        result['reason'] = str(error)[:180] if isinstance(error, ValueError) else type(error).__name__
        if isinstance(error, requests.HTTPError) and error.response is not None:
            result['reason'] = f'HTTP {error.response.status_code}'
    path.write_text(json.dumps(result, ensure_ascii=False, indent=2))
    return result

def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    rows = json.loads((ROOT / 'dach/catalog.json').read_text())
    results = []
    for row in rows:
        results.append(collect(row))
        if not BLOCKED.is_set():
            time.sleep(0.25)
    summary = [{k: v for k, v in r.items() if k != 'sources'} for r in results]
    (ROOT / 'dach/source-collection-result.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2))
    from collections import Counter
    print(json.dumps(dict(Counter(r['status'] for r in results))))

if __name__ == '__main__':
    main()