"""Collect exact road-access sentences from Parks Victoria ('How to get there') and WA Explore Parks pages.

Only held VIC/WA candidates with a Wikipedia identity are queried; pages are cached and reruns are free.
Run from the project root.
"""
import json, re, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import requests
from bs4 import BeautifulSoup

HERE = Path(__file__).parent
CACHE = HERE / 'discovery-cache' / 'vic-wa-access'; CACHE.mkdir(parents=True, exist_ok=True)
EVID = HERE / 'access-evidence.json'
UA = {'User-Agent': 'Mozilla/5.0 WildParkRoutes/1.0 (https://wildparkroutes.com; info@minialife.com)'}
BAD = re.compile(r'4WD only|four-wheel drive only|4WD is required|high clearance|boat access only|access is by boat|no vehicle|closed|walk(?:ing)? only', re.I)
ROADISH = re.compile(r'\b(road|highway|hwy|freeway|drive|street|track)\b', re.I)
MEASURE = re.compile(r'\d+\s?(km|kilometres|minutes|hours?|hrs?)\b|\b(hour|hours)\b', re.I)

def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', re.sub(r'\(.*?\)', '', name).lower().replace("'", '')).strip('-')

def url_for(row):
    s = slug(row['name'])
    if row['region'] == 'victoria':
        return f'https://www.parks.vic.gov.au/places-to-see/parks/{s}'
    return f'https://exploreparks.dbca.wa.gov.au/park/{s}'

def text_of(url):
    key = CACHE / (re.sub(r'[^a-z0-9]+', '_', url.lower())[-120:] + '.txt')
    if key.exists():
        return key.read_text()
    r = requests.get(url, headers=UA, timeout=40)
    t = ''
    if r.status_code == 200:
        soup = BeautifulSoup(r.text, 'html.parser')
        for tag in soup(['script', 'style', 'nav', 'footer']):
            tag.decompose()
        t = soup.get_text('\n', strip=True)
    key.write_text(t)
    return t

def quote_for(text):
    starts = [m.start() for m in re.finditer(r'How to get there|Getting there|Access\b', text)]
    for i in starts:
        for s in re.split(r'(?<=[.!?])\s+|\n', text[i:i + 2500]):
            s = s.strip()
            if 40 < len(s) < 400 and re.search(r'\bfrom\b|\bvia\b', s, re.I) and ROADISH.search(s) and MEASURE.search(s) and not BAD.search(s):
                return s
    return None

def work(row):
    url = url_for(row)
    try:
        return row['slug'], quote_for(text_of(url)), url
    except Exception:
        return row['slug'], None, url

if __name__ == '__main__':
    rows = json.loads((HERE.parent / 'claude-handoff/oceania/au-catalog.json').read_text())
    report = json.loads((HERE / 'production-report.json').read_text())
    held = [r for r in rows if r['region'] in ('victoria', 'western-australia') and r.get('enwiki') and 'road access' in report.get(r['slug'], '')]
    ev = json.loads(EVID.read_text()) if EVID.exists() else {}
    hits = []
    with ThreadPoolExecutor(6) as pool:
        for s, q, url in pool.map(work, held):
            if q:
                ev[s] = {'url': url, 'kind': 'official', 'quote': q}; hits.append(s)
            print(s, 'OK |' + q if q else '-', flush=True)
    EVID.write_text(json.dumps(ev, ensure_ascii=False, indent=2))
    print('hits', len(hits), 'of', len(held)); print(','.join(hits))
