"""Collect Queensland 'Getting there' sentences via the website-fetch gateway (parks.qld.gov.au blocks direct requests).

Only held QLD candidates with a Wikipedia identity are queried; pages are cached and the run is resumable.
Run from the project root with AGW_URL/AGW_TOKEN set.
"""
import json, os, re, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import requests

HERE = Path(__file__).parent
CACHE = HERE / 'discovery-cache' / 'qld-access'; CACHE.mkdir(parents=True, exist_ok=True)
EVID = HERE / 'access-evidence.json'
BAD = re.compile(r'4WD only|four-wheel drive only|4WD is required|high clearance 4WD|boat access only|access is by boat|no vehicle|closed', re.I)
ROADISH = re.compile(r'\b(road|highway|hwy|drive|street|track)\b', re.I)
MEASURE = re.compile(r'\d+\s?(km|kilometres|minutes|hours?|hrs?)\b', re.I)

def qld_slug(name):
    n = re.sub(r'\(.*?\)', '', name)
    n = re.sub(r'\b(National Park|Conservation Park|Resources Reserve|Regional Park|\(CYPAL\))\b', '', n)
    return re.sub(r'[^a-z0-9]+', '-', n.lower().replace("'", '')).strip('-')

def fetch(url):
    key = CACHE / (re.sub(r'[^a-z0-9]+', '_', url.lower())[-120:] + '.md')
    if key.exists():
        return key.read_text()
    r = requests.post(os.environ['AGW_URL'] + '/f/website-fetch/v2/scrape', timeout=90,
        headers={'Authorization': 'Bearer ' + os.environ['AGW_TOKEN']}, json={'url': url, 'formats': ['markdown']})
    md = (r.json().get('data') or {}).get('markdown') or ''
    key.write_text(md)
    return md

def quote_for(md):
    i = md.find('## Getting there')
    if i < 0 or 'Page not found' in md[:1500]:
        return None
    section = re.split(r'\n## (?!Getting there)', md[i:])[0]
    lines = [re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', l).strip(' -*#') for l in section.splitlines()]
    for line in lines:
        for s in re.split(r'(?<=[.!?])\s+', line):
            if len(s) > 40 and re.search(r'\bfrom\b|\bvia\b', s, re.I) and ROADISH.search(s) and (MEASURE.search(s) or re.search(r'turn|follow|signpost', s, re.I)) and not BAD.search(s):
                return s[:400]
    return None

def work(row):
    url = f"https://parks.qld.gov.au/parks/{qld_slug(row['name'])}/visiting-safely"
    try:
        q = quote_for(fetch(url))
    except Exception as e:
        return row['slug'], None, url, str(e)
    return row['slug'], q, url, None

if __name__ == '__main__':
    rows = json.loads((HERE.parent / 'claude-handoff/oceania/au-catalog.json').read_text())
    report = json.loads((HERE / 'production-report.json').read_text())
    held = [r for r in rows if r['region'] == 'queensland' and r.get('enwiki') and 'road access' in report.get(r['slug'], '')]
    if len(sys.argv) > 1: held = held[:int(sys.argv[1])]
    ev = json.loads(EVID.read_text()) if EVID.exists() else {}
    hits = 0
    with ThreadPoolExecutor(8) as pool:
        for slug, q, url, err in pool.map(work, held):
            if q:
                ev[slug] = {'url': url, 'kind': 'official', 'quote': q}; hits += 1
            print(slug, 'OK' if q else ('ERR ' + err if err else '-'), flush=True)
    EVID.write_text(json.dumps(ev, ensure_ascii=False, indent=2))
    print('hits', hits, 'of', len(held))
