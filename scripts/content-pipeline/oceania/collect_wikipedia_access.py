"""Search full English Wikipedia article text (not only the lead) for an exact road-access sentence (cached)."""
import json, re
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import unquote
import requests
from collect_qld_access import BAD, HERE
from collect_wikivoyage_access import UA

CACHE = HERE / 'discovery-cache' / 'wikipedia-full'; CACHE.mkdir(parents=True, exist_ok=True)
PAT = re.compile(r'(?:accessed|accessible|access(?:ed)? (?:is )?(?:via|from|by)|reached (?:via|from|by)|entrance)[^.]{0,120}\b(?:road|highway|drive)\b|\b(?:road|highway)\b[^.]{0,80}\b(?:km|kilometres)\b[^.]{0,60}\b(?:from|of)\b', re.I)

def text(title):
    p = CACHE / (re.sub(r'[^a-z0-9]+', '_', title.lower()) + '.txt')
    if p.exists(): return p.read_text()
    r = requests.get('https://en.wikipedia.org/w/api.php', headers=UA, timeout=30, params={
        'action': 'query', 'prop': 'extracts', 'explaintext': 1, 'titles': title, 'redirects': 1, 'format': 'json'})
    t = ''.join(v.get('extract', '') for v in r.json()['query']['pages'].values())
    p.write_text(t); return t

def work(row):
    title = unquote(row['enwiki'].split('/wiki/', 1)[1]).replace('_', ' ')
    try:
        for s in re.split(r'(?<=[.!?])\s+|\n', text(title)):
            if 40 < len(s) < 400 and PAT.search(s) and not BAD.search(s) and not re.search(r'4WD|four.wheel|ferry|boat', s, re.I):
                return row['slug'], s.strip(), 'https://en.wikipedia.org/wiki/' + title.replace(' ', '_')
    except Exception:
        pass
    return row['slug'], None, None

if __name__ == '__main__':
    rows = json.loads((HERE.parent / 'claude-handoff/oceania/au-catalog.json').read_text())
    report = json.loads((HERE / 'production-report.json').read_text())
    ev = json.loads((HERE / 'access-evidence.json').read_text())
    held = [r for r in rows if r.get('enwiki') and 'road access' in report.get(r['slug'], '') and r['slug'] not in ev]
    hits = 0
    with ThreadPoolExecutor(2) as pool:
        for slug, q, url in pool.map(work, held):
            if q: ev[slug] = {'url': url, 'kind': 'wikipedia', 'quote': q}; hits += 1
    (HERE / 'access-evidence.json').write_text(json.dumps(ev, ensure_ascii=False, indent=2))
    print('hits', hits, 'of', len(held))
