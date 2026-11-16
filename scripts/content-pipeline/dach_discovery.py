"""Cached, sequential public-source discovery; no model or translation service."""
import datetime
import hashlib
import json
import re
import time
import unicodedata
from pathlib import Path
from functools import lru_cache
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup

CACHE = Path(__file__).parent / 'dach' / 'discovery-cache'
BLOCKED = set()
SESSION = requests.Session()
SESSION.headers['User-Agent'] = 'WildParkRoutesSourceReview/1.0 (+https://wildparkroutes.com/about)'

def key(value):
    value = value.lower().replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue').replace('ß', 'ss')
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', value)

def get(url):
    CACHE.mkdir(parents=True, exist_ok=True)
    path = CACHE / (hashlib.sha256(url.encode()).hexdigest() + '.json')
    if path.exists():
        value = json.loads(path.read_text())
        if value['status'] != 200:
            raise ValueError('cached HTTP ' + str(value['status']))
        return value
    host = urlparse(url).hostname
    if host in BLOCKED:
        raise ValueError('host blocked for this run')
    time.sleep(1)
    response = SESSION.get(url, timeout=15)
    value = {'status': response.status_code, 'url': response.url, 'body': response.text,
             'fetched_at': datetime.datetime.now(datetime.timezone.utc).isoformat()}
    path.write_text(json.dumps(value, ensure_ascii=False))
    if response.status_code in (403, 429):
        BLOCKED.add(host)
    response.raise_for_status()
    return value

def fetch_public_source(url):
    value = get(url)
    soup = BeautifulSoup(value['body'], 'html.parser')
    for node in soup.select('script, style, nav, header, footer, aside'):
        node.decompose()
    main = soup.select_one('main') or soup
    text = '\n'.join(p.get_text(' ', strip=True) for p in main.select('p'))
    if len(text) < 200:
        raise ValueError('empty visitor text')
    return {'url': value['url'], 'fetched_at': value['fetched_at'], 'text': text}

def matches(row, url):
    # Whole distinctive path tokens, not a generic region or a substring of another name.
    terms = re.findall(r'[\wÀ-ž]+', row['authority'] + ' ' + row['name'])
    generic = {'national', 'nationalpark', 'nature', 'naturpark', 'park', 'lake', 'valley',
               'biosphere', 'reserve', 'mountain', 'high', 'road', 'glacier', 'austria', 'lower',
               'germany', 'forest', 'regional', 'nationalparks', 'naturparks', 'upper'}
    tokens = {key(t) for t in terms if len(key(t)) >= 5 and t.lower() not in generic}
    parts = {key(t) for t in re.findall(r'[\wÀ-ž]+', urlparse(url).path)}
    return bool(tokens & parts)

def austria_urls(row):
    urls = []
    # Official national tourism English sitemap bypasses the inaccessible search UI.
    try:
        xml = BeautifulSoup(get('https://www.austria.info/__sitemap__/en-GB.xml')['body'], 'xml')
        urls += [n.text for n in xml.select('loc') if '/en-gb/' in n.text and matches(row, n.text)]
    except (requests.RequestException, ValueError):
        pass
    try:
        index = BeautifulSoup(get('https://www.tyrol.com/sitemap.xml')['body'], 'xml')
        for loc in index.select('loc')[:4]:
            child = BeautifulSoup(get(loc.text)['body'], 'xml')
            urls += [n.text for n in child.select('loc') if matches(row, n.text)]
    except (requests.RequestException, ValueError):
        pass
    if row['kind'] == 'nature_park':
        try:
            directory = BeautifulSoup(get('https://www.naturparke.at/naturparke')['body'], 'html.parser')
            urls += [urljoin('https://www.naturparke.at', a['href']) for a in directory.select('a[href]')
                     if a['href'].startswith('/naturpark/') and matches(row, a['href'])]
        except (requests.RequestException, ValueError):
            pass
    return list(dict.fromkeys(sorted(urls, key=len)))[:4]

GERMANY_SITEMAPS = (
    'https://www.germany.travel/en/sitemap.xml',
    'https://www.bavaria.travel/sitemap.xml',
    'https://www.niedersachsen-tourism.com/sitemap.xml',
    'https://www.saechsische-schweiz.de/en/sitemap.xml',
    'https://www.visit-thuringia.com/sitemap.xml',
    'https://www.visit-nrw.com/sitemap.xml',
    'https://www.off-to-mv.com/sitemap.xml',
)

@lru_cache(maxsize=16)
def sitemap_pages(url):
    """Bounded official sitemap expansion, once per process and persistently cached."""
    try:
        xml = BeautifulSoup(get(url)['body'], 'xml')
        locations = [n.text.strip() for n in xml.select('loc')]
        if xml.find('sitemapindex'):
            pages = []
            for child in locations[:4]:
                # Never follow a sitemap into an unapproved external host.
                if urlparse(child).hostname != urlparse(url).hostname:
                    continue
                child_xml = BeautifulSoup(get(child)['body'], 'xml')
                pages += [n.text.strip() for n in child_xml.select('loc')]
            return tuple(pages)
        return tuple(locations)
    except (requests.RequestException, ValueError):
        return ()

def germany_urls(row):
    pages = [url for sitemap in GERMANY_SITEMAPS for url in sitemap_pages(sitemap)
             if matches(row, url) and not re.search(r'/(de|fr|nl|es)(/|$)', urlparse(url).path)]
    return list(dict.fromkeys(sorted(pages, key=len)))[:4]

def wikipedia_background(row, site):
    """Only an exact country-matched entity may supply a linked English article."""
    country = {'at': 'Q40', 'de': 'Q183', 'ch': 'Q39'}.get(row.get('country'))
    if not country or country not in site.get('countries', []):
        return None
    qid = site.get('qid')
    if not qid:
        return None
    try:
        data = json.loads(get('https://www.wikidata.org/wiki/Special:EntityData/' + qid + '.json')['body'])
        link = data['entities'][qid].get('sitelinks', {}).get('enwiki', {})
        url = link.get('url')
        if not url:
            return None
        source = fetch_public_source(url)
        source.update(kind='background', licence='CC BY-SA; see article attribution and licence',
                      usage='Background only; never permits, access, closures or approved stops')
        return source
    except (requests.RequestException, ValueError, KeyError):
        return None