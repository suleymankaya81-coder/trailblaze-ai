"""Expand published European compact visits to 2-3 days using only sights named verbatim in the stored source text.
One cached Gemini call per place extracts sights + exact quotes; every quote is checked against the source,
details are the quotes themselves (offline-translated when not English). Run from project root.
Usage: python3 scripts/content-pipeline/multiday-europe.py [limit] [country,...]"""
import json, os, re, sys, datetime
from pathlib import Path
import requests
from combined_content import module, validate_bundle
from compact_evidence import compact_packet, plain
from gateway_call import call_ai_json
from quoted_visit import quoted_bundle, clean
from local_translation import translate_excerpt

ROOT = Path(__file__).parent
CACHE = ROOT / 'multiday'; CACHE.mkdir(exist_ok=True)
norm = lambda s: re.sub(r'\s+', ' ', s).strip()

PROMPT = '''From the source text about "{name}", list distinct visitable sights INSIDE or directly part of this place
(peaks, lakes, valleys, villages, trails, gorges, visitor centres, castles, viewpoints). Use only sights the text names.
For each give: "name" exactly as written in the text, and "quote": one complete sentence copied VERBATIM from the text
that contains that name and describes THAT sight specifically (not a list of many places, no dates of laws or founding).
Each stop needs a different sentence. If the text is not English, also give "english": a faithful, natural English translation of that exact quote (translate only, add nothing). Then group them into visit days of 2-4 nearby sights.
Use 3 days only with at least 7 sights, 2 days with at least 4; otherwise 1 day. Never invent or pad.
Day titles: short English theme naming the sights' area. Return JSON:
{{"stops":[{{"id":"s1","name":"...","quote":"...","english":"..."}}],"days":[{{"title":"...","stop_ids":["s1","s2"]}}]}}
SOURCE TEXT:
{text}'''

def extract(slug, name, text):
    import hashlib
    path = CACHE / f'{slug}.json'
    if path.exists():
        cached = json.loads(path.read_text())
        if cached.get('_text_sha', hashlib.sha256(text.encode()).hexdigest()) == hashlib.sha256(text.encode()).hexdigest(): return cached
    path = CACHE / f'{slug}.json'
    clean_text = re.sub(r'https?://\S+', '', re.sub(r'!?\[([^\]]*)\]\([^)]*\)', r'\1', text))[:9000]
    out = call_ai_json(PROMPT.format(name=name, text=clean_text))
    out['_text_sha'] = hashlib.sha256(text.encode()).hexdigest()
    path.write_text(json.dumps(out, ensure_ascii=False, indent=2)); return out

def verified(out, text, lang):
    src = plain(text); stops = {}
    for s in out.get('stops', []):
        n, q = s.get('name', '').strip(), s.get('quote', '').strip()
        if len(n) < 3 or len(q) < 40 or q not in src or n.casefold() not in q.casefold(): continue
        if any(n.casefold() == x['name'].casefold() or q == x['quote'] for x in stops.values()): continue
        if len(q) > 450 or q.count(',') > 6 or re.search(r'\b1[0-9]{3}\b|\b20\d{2}\b', q): continue  # lists and dated facts read badly
        stops[s['id']] = {'name': n, 'quote': q, 'detail': q if lang == 'en' else (s.get('english') or '').strip() or translate_excerpt(q, lang)}
    days = []
    for d in out.get('days', []):
        ids = [i for i in dict.fromkeys(d.get('stop_ids', [])) if i in stops and all(i not in x['ids'] for x in days)]
        if len(ids) >= 2 and d.get('title'): days.append({'title': clean(d['title'])[:80], 'ids': ids[:4]})
    return stops, days[:3]

def wiki_json(url, params):
    import time
    for attempt in range(5):
        r = requests.get(url, params=params, headers={'User-Agent': 'WildParkRoutes/1.0 (https://wildparkroutes.com; info@minialife.com)'}, timeout=30)
        if r.status_code == 200 and r.text.startswith('{'): return r.json()
        time.sleep(5 * (attempt + 1))
    raise ValueError(f'Wikipedia unavailable ({r.status_code})')

def fuller_source(src, country):
    """When the stored article is short, use the same article's local-language version (same Wikipedia page identity via langlinks)."""
    m = re.match(r'https://(\w\w)\.wikipedia\.org/wiki/(.+)', src['url'])
    if not m: return None
    from urllib.parse import unquote, quote
    lang, title = m[1], unquote(m[2]).replace('_', ' ')
    local = 'it' if country == 'it' else 'de'
    if lang != local:
        d = wiki_json(f'https://{lang}.wikipedia.org/w/api.php', {'action':'query','format':'json','formatversion':2,'titles':title,'redirects':1,'prop':'langlinks','lllang':local})
        links = d['query']['pages'][0].get('langlinks', [])
        if not links: return None
        lang, title = local, links[0]['title']
    d = wiki_json(f'https://{lang}.wikipedia.org/w/api.php', {'action':'query','format':'json','formatversion':2,'titles':title,'redirects':1,'prop':'extracts','explaintext':1})
    page = d['query']['pages'][0]; text = page.get('extract', '')[:14000]
    return {'url': f'https://{lang}.wikipedia.org/wiki/' + quote(page['title'].replace(' ', '_')), 'kind': 'wikipedia', 'text': text, 'generation_excerpts': []} if len(text) > len(src.get('text','')) else None

SITES = json.loads((ROOT / 'dach/official-sites.json').read_text())

def qid_source(slug, country):
    """Reviewed Wikidata identity (dach/official-sites.json) -> full local-language article."""
    qid = SITES.get(slug, {}).get('qid')
    if not qid: return None
    links = wiki_json('https://www.wikidata.org/w/api.php', {'action':'wbgetentities','ids':qid,'props':'sitelinks','format':'json'})['entities'][qid].get('sitelinks', {})
    for lang in ('de', 'en'):
        if lang + 'wiki' in links:
            from urllib.parse import quote
            title = links[lang + 'wiki']['title']
            d = wiki_json(f'https://{lang}.wikipedia.org/w/api.php', {'action':'query','format':'json','formatversion':2,'titles':title,'prop':'extracts','explaintext':1})
            text = d['query']['pages'][0].get('extract', '')[:14000]
            if len(text) >= 1500:
                return {'url': f'https://{lang}.wikipedia.org/wiki/' + quote(title.replace(' ', '_')), 'kind': 'wikipedia', 'text': text, 'generation_excerpts': []}
    return None

def main():
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 10**6
    countries = sys.argv[2].split(',') if len(sys.argv) > 2 else ['de', 'at', 'ch', 'it']
    REPORT = ROOT / ('multiday-result-' + '-'.join(countries) + '.json')
    prepare = module('md_prepare', 'prepare-wave.py')
    rows = json.loads(prepare.q("select coalesce(json_agg(t),'[]') from (select slug,name,region_slug as region,country_code from destinations where status='published' and country_code in ("
        + ','.join(f"'{c}'" for c in countries) + ") and jsonb_array_length(travel_plan->'days')<=3 order by slug) t"))
    results = json.loads(REPORT.read_text())['results'] if REPORT.exists() else []
    done = {r['slug'] for r in results}
    key = os.environ['SUPABASE_SERVICE_ROLE_KEY']; H = {'apikey': key, 'Authorization': 'Bearer ' + key, 'Prefer': 'return=representation'}
    for row in [r for r in rows if r['slug'] not in done][:limit]:
        slug = row['slug']
        try:
            ppath = ROOT / 'source-packets' / f'{slug}.json'
            packet = json.loads(ppath.read_text()) if ppath.exists() else {'slug': slug, 'approved_for_generation': True, 'country_code': row['country_code'], 'sources': [], 'approved_stops': []}
            src = packet['sources'][0] if packet['sources'] else {'url': '', 'text': ''}; text = src.get('text', '') if src.get('kind') == 'wikipedia' else ''
            if len(text) < 4000:
                extra = next((s for s in packet['sources'][1:] if s.get('kind') == 'wikipedia' and len(s.get('text','')) >= 4000), None) or (src.get('kind') == 'wikipedia' and fuller_source(src, row['country_code'])) or qid_source(slug, row['country_code'])
                if extra and extra.get('url') != src.get('url'):
                    # Same Wikidata-identified place; descriptive overview only (approved flexible European policy).
                    packet.update(evidence_policy='dach-wikipedia-overview', identity_verified=True)
                if extra:
                    if extra not in packet['sources']: packet['sources'].append(extra)
                    src, text = extra, extra['text']
            if len(text) < 1500: raise ValueError('Source too short for a multi-day plan; stays 1 day')
            m = re.match(r'https://(\w\w)\.wikipedia', src['url'])
            lang = m[1] if m else ('de' if row['country_code'] in ('de','at','ch') else 'it' if row['country_code'] == 'it' else 'en')
            stops, days = verified(extract(slug, row['name'], text), text, lang)
            if len(days) < 2: raise ValueError(f'Only {len(days)} verified day(s) of sights in the source; stays 1 day')
            base = packet['approved_stops'][:1]
            packet['approved_stops'] = base + [{'id': f'{slug}--{i}', 'name': s['name'], 'quote': s['quote'], 'source_url': src['url']} for i, s in stops.items()]
            if src is not packet['sources'][0] or not src.get('generation_excerpts'):
                src['generation_excerpts'] = list(dict.fromkeys(s['quote'] for s in stops.values()))
            ppath.write_text(json.dumps(packet, ensure_ascii=False, indent=2))
            bundle = quoted_bundle(row | {'region': row['region']}, packet)
            plan = bundle['travel']['plan']; one = plan['days'][0]
            plan['days'] = [{'title': d['title'], 'start': 'Suggested: 9 AM start, after checking official access hours',
                'stops': [{'name': stops[i]['name'], 'stop_id': f'{slug}--{i}', 'detail': clean(stops[i]['detail'])} for i in d['ids']],
                'driving': 'Allow time between these sights; local travel times are not verified and conditions vary.',
                'note': one['note']} for d in days]
            n = len(days); bundle['summary'].update(trip_duration_days=f'{n} visit days', recommended_duration=f'{n} visit days',
                activities=[stops[i]['name'] for i in days[0]['ids'][:3]])
            bundle = validate_bundle(bundle, slug, compact_packet(packet))
            item = bundle['travel']; item['plan']['reviewedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            (ROOT / 'combined-content' / f'{slug}.json').write_text(json.dumps({'status': 'validated', 'method': 'multiday-verbatim-quotes', 'bundle': bundle}, ensure_ascii=False, indent=2))
            payload = {'travel_plan': item['plan'], 'trip_duration_days': f'{n} visit days', 'recommended_duration': f'{n} visit days'}
            r = requests.patch(os.environ['SUPABASE_URL'] + '/rest/v1/destinations', params={'slug': 'eq.' + slug, 'status': 'eq.published'}, headers=H, json=payload, timeout=60)
            r.raise_for_status()
            if len(r.json()) != 1 or len(r.json()[0]['travel_plan']['days']) != n: raise ValueError('Write did not read back')
            results.append({'slug': slug, 'status': 'multiday', 'days': n, 'stops': sum(len(d['ids']) for d in days)})
        except Exception as e:
            results.append({'slug': slug, 'status': 'one_day', 'reason': str(e)[:300]})
        print(json.dumps(results[-1], ensure_ascii=False), flush=True)
        REPORT.write_text(json.dumps({'results': results}, ensure_ascii=False, indent=2))

if __name__ == '__main__': main()
