"""Build DACH source packets from official websites with exact excerpts. No AI model.
Run: python scripts/content-pipeline/build-dach-packets.py --country ch [--kind nature_park] [--limit 40]
A packet is approved only when an official page (country-matched Wikidata P856 site) contains a
paragraph naming the place; English preferred, German official text accepted as fallback (language recorded)."""
import argparse, json, re, time
from pathlib import Path
from source_evidence import fetch_source
from compact_evidence import plain
from dach_discovery import austria_urls, germany_urls, fetch_public_source, wikipedia_background

ROOT = Path(__file__).parent
QID = {'de': 'Q183', 'at': 'Q40', 'ch': 'Q39'}
GERMAN = re.compile(r'\b(und|der|die|das|ist|mit|für|nicht|wir|auf)\b', re.I)

def paragraphs(text):
    for line in plain(text).split('\n'):
        line = re.sub(r'\s+', ' ', line).strip()
        if 80 <= len(line) <= 600 and not line.startswith(('|', '#', '*', '-', '>')) and line.count('.') >= 1:
            yield line

GENERIC = re.compile(r'\b(lake|falls|valley|nature park|regional nature park|regional park|landscape park|gorge|caves?|pass|and|the|mount|glacier|nature|park|shore|swiss|wilderness|forest|region|world heritage)\b', re.I)

def core(name):
    c = re.sub(r'\s+', ' ', GENERIC.sub(' ', name)).strip(' -')
    return c if len(c) >= 5 else None

NEWS = re.compile(r'\b(gestern|gestrigen|heute|yesterday|today|\d{1,2}\. (Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember) \d{4}|(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2},? \d{4})\b', re.I)

def is_news(para):
    # Dated news items and truncated teasers are not visitor evidence.
    return bool(NEWS.search(para)) or not para.rstrip().endswith(('.', '!', '?'))

def pick(row, text):
    names = [n for n in [row['name'], row['authority'], core(row['name'])] if n]
    for para in paragraphs(text):
        if is_news(para):
            continue
        for n in names:
            if n.casefold() in para.casefold():
                return n, para
    return None

TOURISM_SEARCH = {'ch': 'https://www.myswitzerland.com/en-ch/search/?q='}

def tourism_pages(row):
    # National tourism board search (official). Only result paths containing the place's core name.
    if row['country'] not in TOURISM_SEARCH or not core(row['name']):
        return []
    import os, requests, urllib.parse
    r = requests.post(os.environ['AGW_URL'] + '/f/website-fetch/v2/scrape', timeout=90,
        headers={'Authorization': 'Bearer ' + os.environ['AGW_TOKEN']},
        json={'url': TOURISM_SEARCH[row['country']] + urllib.parse.quote(core(row['name'])), 'formats': ['links']})
    key = re.sub(r'[^a-z0-9]+', '-', core(row['name']).lower().replace('ä','a').replace('ö','o').replace('ü','u'))
    links = [l for l in r.json().get('data', {}).get('links', []) if '/planning/offers/' not in l and key in l.lower()]
    return sorted(dict.fromkeys(links), key=len)[:2]

def build(row, site, translate_german=False):
    urls = []
    if QID[row['country']] in site.get('countries', []):
        base = next((u.replace('http://', 'https://', 1) for u in site.get('urls', [])), None)
        if base:
            urls = [base.rstrip('/') + '/en/', base]
    urls += tourism_pages(row)
    if row['country'] == 'at':
        urls = austria_urls(row) + urls
    elif row['country'] == 'de':
        urls = germany_urls(row) + urls
    if not urls:
        raise ValueError('no official website found')
    found = None
    for url in urls:
        try:
            src = fetch_public_source(url) if row['country'] in ('at', 'de') else fetch_source(url)
        except Exception:
            continue
        hit = pick(row, src['text'])
        if hit and (not found or (found[3] == 'de' and not GERMAN.search(hit[1]))):
            found = (src, hit[0], hit[1], 'de' if len(GERMAN.findall(hit[1])) >= 2 else 'en')
            if found[3] == 'en':
                break
        time.sleep(1)
    if not found:
        raise ValueError('official site has no paragraph naming the place')
    src, name, quote, lang = found
    if row['country'] in ('at', 'de') and lang != 'en' and not translate_german:
        raise ValueError('official German evidence retained in cache; English excerpt still missing (no automatic translation)')
    background = wikipedia_background(row, site) if row['country'] in ('at', 'de') else None
    translation = {}
    if lang == 'de' and translate_german:
        from local_translation import translate_excerpt
        translation = {'display_translation': translate_excerpt(quote), 'translation_method': 'Argos offline de-en; original excerpt retained'}
    return {'slug': row['slug'], 'approved_for_generation': True, 'language': lang,
        'sources': [{**src, 'kind': 'official', 'generation_excerpts': [quote], **translation}] + ([background] if background else []),
        'approved_stops': [{'id': row['slug'], 'name': name, 'quote': quote, 'source_url': src['url']}],
        'review_note': f'DACH chunk: automated exact {lang} excerpt from country-matched official website; no model.'}

def main():
    p = argparse.ArgumentParser(); p.add_argument('--country'); p.add_argument('--kind'); p.add_argument('--limit', type=int, default=40)
    p.add_argument('--translate-german', action='store_true')
    a = p.parse_args()
    sites = json.loads((ROOT/'dach/official-sites.json').read_text())
    rows = [r for r in json.loads((ROOT/'dach/catalog.json').read_text())
        if (not a.country or r['country'] == a.country) and (not a.kind or r['kind'] == a.kind)
        and not (ROOT/'source-packets'/f"{r['slug']}.json").exists()][:a.limit]
    ok = []
    for r in rows:
        try:
            pk = build(r, sites.get(r['slug'], {}), a.translate_german)
            (ROOT/'source-packets'/f"{r['slug']}.json").write_text(json.dumps(pk, ensure_ascii=False, indent=1))
            ok.append(r['slug']); print('approved', r['slug'], pk['language'], flush=True)
        except Exception as e:
            print('held', r['slug'], str(e)[:100], flush=True)
    print(json.dumps({'checked': len(rows), 'approved': len(ok)}))
    print(' '.join(ok))

if __name__ == '__main__': main()
