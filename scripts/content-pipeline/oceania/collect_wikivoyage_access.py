"""Collect Wikivoyage 'Get in' road sentences for held Australian candidates into access-evidence.json (cached, resumable)."""
import json, re
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import unquote
import requests
from collect_qld_access import BAD, ROADISH, MEASURE, HERE

CACHE = HERE / 'discovery-cache' / 'wikivoyage'; CACHE.mkdir(parents=True, exist_ok=True)
UA = {'User-Agent': 'WildParkRoutes/1.0 (https://wildparkroutes.com; info@minialife.com)'}

def get_in(title):
    path = CACHE / (re.sub(r'[^a-z0-9]+', '_', title.lower()) + '.json')
    if path.exists():
        return json.loads(path.read_text())
    r = requests.get('https://en.wikivoyage.org/w/api.php', headers=UA, timeout=30, params={
        'action': 'parse', 'page': title, 'prop': 'wikitext', 'format': 'json', 'redirects': 1})
    text = r.json().get('parse', {}).get('wikitext', {}).get('*', '')
    m = re.search(r'==\s*Get in\s*==(.*?)(?:\n==[^=]|$)', text, re.S)
    data = {'title': title, 'get_in': m.group(1) if m else ''}
    path.write_text(json.dumps(data))
    return data

def clean(t):
    t = re.sub(r'\{\{[^{}]*\}\}', '', t); t = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]*)\]\]', r'\1', t)
    return re.sub(r"'''?|<[^>]+>", '', t)

def quote(section):
    for s in re.split(r'(?<=[.!?])\s+|\n', clean(section)):
        s = s.strip(' *:')
        if len(s) > 40 and ROADISH.search(s) and (MEASURE.search(s) or re.search(r'\bfrom\b|\bvia\b|turn', s, re.I)) and not BAD.search(s):
            return s[:400]

def work(row):
    title = unquote(row['enwiki'].split('/wiki/', 1)[1]).replace('_', ' ')
    try:
        return row['slug'], quote(get_in(title)['get_in']), 'https://en.wikivoyage.org/wiki/' + title.replace(' ', '_')
    except Exception:
        return row['slug'], None, None

if __name__ == '__main__':
    rows = json.loads((HERE.parent / 'claude-handoff/oceania/au-catalog.json').read_text())
    report = json.loads((HERE / 'production-report.json').read_text())
    ev = json.loads((HERE / 'access-evidence.json').read_text())
    held = [r for r in rows if r.get('enwiki') and 'road access' in report.get(r['slug'], '') and r['slug'] not in ev]
    hits = 0
    with ThreadPoolExecutor(6) as pool:
        for slug, q, url in pool.map(work, held):
            if q:
                ev[slug] = {'url': url, 'kind': 'wikivoyage', 'quote': q}; hits += 1
    ev.update({k: v for k, v in json.loads((HERE / 'access-evidence.json').read_text()).items() if k not in ev})
    (HERE / 'access-evidence.json').write_text(json.dumps(ev, ensure_ascii=False, indent=2))
    print('hits', hits, 'of', len(held))
