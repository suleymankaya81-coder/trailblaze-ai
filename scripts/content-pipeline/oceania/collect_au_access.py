"""Collect exact 'Getting there' sentences from NSW NPWS and Tasmania Parks pages into access-evidence.json.

Only sentences that name a starting town/road with a distance or time are retained; pages
are cached so reruns make no repeat requests. Run from the project root.
"""
import json, re, sys, time
from pathlib import Path
import requests
from bs4 import BeautifulSoup

HERE = Path(__file__).parent
CACHE = HERE / 'discovery-cache' / 'au-access'; CACHE.mkdir(parents=True, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 WildParkRoutes/1.0 (https://wildparkroutes.com; info@minialife.com)'}
ROUTE = re.compile(r'\b(take|drive|turn|follow|via|from)\b.*\b(road|highway|hwy|way|drive|track)\b', re.I)
MEASURE = re.compile(r'\d+\s?(km|kilometres|minutes|hours?)', re.I)
BAD = re.compile(r'4WD only|four-wheel drive only|boat access only|closed|no vehicle', re.I)

def nsw_slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower().replace("'", '')).strip('-')

def quote_for(text):
    i = text.find('Getting there')
    if i < 0:
        return None
    section = text[i:i + 2500]
    j = section.find('Get directions', 40)
    if j > 0:
        body = re.split(r'Park entry points|Parking Show more|Road quality|Vehicle access', section[j + 14:])[0].strip()
        body = body[:350].rsplit(' ', 1)[0] if len(body) > 350 else body
        if re.search(r'\bfrom\b', body, re.I) and re.search(r'\b(road|highway|hwy|way|drive|street)\b', body, re.I) and not BAD.search(body):
            return body
    section = section.replace('\r', ' ').replace('\n', ' ').replace('\xad', '')
    for s in re.split(r'(?<=[.!?])\s+|(?<=:)\s+', section):
        s = s.strip()
        if 30 < len(s) < 400 and ROUTE.search(s) and MEASURE.search(s) and not BAD.search(s):
            return s
    return None

URLS = {'new-south-wales': 'https://www.nationalparks.nsw.gov.au/visit-a-park/parks/{}/visitor-info',
        'tasmania': 'https://parks.tas.gov.au/explore-our-parks/{}'}

def main():
    cat = json.loads((HERE.parent / 'claude-handoff/oceania/au-catalog.json').read_text())
    path = HERE / 'access-evidence.json'
    evidence = json.loads(path.read_text()) if path.exists() else {}
    for row in cat:
        if row['region'] not in URLS or row['slug'] in evidence:
            continue
        url = URLS[row['region']].format(nsw_slug(row['name']))
        cached = CACHE / (row['slug'] + '.txt')
        if cached.exists():
            text = cached.read_text()
        else:
            try:
                r = requests.get(url, headers=UA, timeout=20)
                text = BeautifulSoup(r.text, 'html.parser').get_text(' ', strip=True) if r.status_code == 200 else ''
            except requests.RequestException:
                continue
            cached.write_text(text)
            time.sleep(0.3)
        q = quote_for(text)
        if q:
            evidence[row['slug']] = {'url': url, 'kind': 'official', 'quote': q}
        print(row['slug'], bool(q), flush=True)
        path.write_text(json.dumps(evidence, ensure_ascii=False, indent=1))

if __name__ == '__main__':
    main()
