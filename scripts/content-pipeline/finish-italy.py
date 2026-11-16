"""Italy wave: Wikidata-identified Wikipedia overview + licensed cover + airport route; zero model calls.
Same flexible policy as DACH. Usage: python3 finish-italy.py [limit]"""
import json, sys
from pathlib import Path
from urllib.parse import urlencode
import importlib.util
ROOT = Path(__file__).parent
spec = importlib.util.spec_from_file_location('flex', ROOT/'finish-dach-flexible.py'); flex = importlib.util.module_from_spec(spec); spec.loader.exec_module(flex)
from dach_discovery import get
from local_translation import translate_excerpt

def sitelink(qid):
    e = json.loads(get('https://www.wikidata.org/wiki/Special:EntityData/'+qid+'.json')['body'])['entities'][qid]['sitelinks']
    for lang in ('en', 'it'):
        if lang+'wiki' in e: return e[lang+'wiki']['title'], lang
    raise ValueError('No en/it Wikipedia article for '+qid)

# Reviewed article identities for curated rows without a Wikidata ID or with a short English article.
TITLE_OVERRIDES = {'gorropu-gorge':('Gola di Gorropu','it'), 'great-dolomite-road':('Große Dolomitenstraße','de'),
    'capri-and-the-blue-grotto':('Capri','en'), 'aeolian-islands':('Aeolian Islands','en'),
    'marine-protected-area-capo-rizzuto':('Marine Protected Area Capo Rizzuto','en'),
    'alta-valle-antrona-natural-park':('Alta Valle Antrona Natural Park','en'),
    "parco-dell-oglio-nord":("Parco dell'Oglio Nord",'it'), 'parco-regionale-dei-monti-lattari':('Parco regionale dei Monti Lattari','it'),
    'seceda-and-val-gardena':('Seceda','it'), 'grotta-giusti-and-tuscan-hot-springs-saturnia':('Terme di Saturnia','it'),
    'chianti':('Chianti (region)','en')}
# Reviewed 2026-11-16 for the 8 held places: exact source wording, location and cover identities.
STOP_NAMES = {'marine-protected-area-capo-rizzuto':'Area marina protetta Capo Rizzuto', "parco-dell-oglio-nord":'parco Oglio Nord'}
# Chianti article has no point: Wikivoyage names Greve as a start; Dolomite Road: its highest pass, named in the article.
COORDS = {'chianti':(43.58333333,11.31666667,'https://en.wikipedia.org/wiki/Greve_in_Chianti'),
          'great-dolomite-road':('Pordoijoch','de')}
HEROES = {'parco-regionale-dei-monti-lattari':'I08 249 Monti Lattari.jpg','chianti':'ChiantiMonteSanMichele4.jpg',
          'great-dolomite-road':'Passo Pordoi-bops 01.jpg'}
# Islands: arrival by scheduled boat, quoted verbatim from Wikivoyage (CC BY-SA); no invented crossing details.
FERRY = {'capri-and-the-blue-grotto':('https://en.wikivoyage.org/wiki/Capri','Capri','There are also daily ferries from Naples'),
         'aeolian-islands':('https://en.wikivoyage.org/wiki/Aeolian_Islands','Aeolian Islands','There are frequent car ferries and much quicker hydrofoils')}

def ferry_source(slug):
    url, title, start = FERRY[slug]
    data = json.loads(get('https://en.wikivoyage.org/w/api.php?'+urlencode({'action':'query','format':'json','formatversion':2,'titles':title,'prop':'extracts','explaintext':1}))['body'])
    text = data['query']['pages'][0].get('extract','')
    hit = [l.strip() for l in text.split('\n') if l.strip().startswith(start) or start in l]
    if not hit: raise ValueError('Ferry evidence not found in Wikivoyage')
    line = hit[0]; sentence = line[line.index(start):]
    # Capri's line carries dated fares; keep only the undated port list.
    sentence = sentence.split(' (')[0] if 'Capri' in title else flex.re.split(r'(?<=\.)\s+', sentence)[0]
    if sentence not in text: raise ValueError('Ferry excerpt is not exact')
    return {'url':url,'kind':'wikivoyage','text':text,'generation_excerpts':[sentence]}, sentence

class StraightLine:
    """Delegate to prepare-wave, but store a location line: islands have no airport road route."""
    def __init__(self, base): self.base = base
    def __getattr__(self, k): return getattr(self.base, k)
    def route(self, ap, lat, lng): return {'minutes':0,'miles':0,'coords':[[ap['lng'],ap['lat']],[round(lng,5),round(lat,5)]]}
ITWIKI = {'monte-barro':'Monte Barro'}
ROAD_REACHABLE = {'marine-nature-reserve-of-miramare','marine-protected-area-capo-rizzuto'}  # mainland coast, reached by road

def packet_and_page(row, title, lang='en'):
    """QID-identified English article; the opening paragraph is the reviewed exact-place excerpt."""
    page = flex.article(title, lang)
    text = page.get('extract','').strip()
    paras = [p.strip() for p in text.split('\n') if len(p.strip()) >= (60 if row['slug'] in STOP_NAMES or row['slug']=='alta-valle-antrona-natural-park' else 80)]
    if (len(text) < 200 or not paras) and lang == 'en' and ITWIKI.get(row['slug']): return packet_and_page(row, ITWIKI[row['slug']], 'it')
    if (len(text) < 200 or not paras) and lang == 'en': raise ValueError('English article too short; Italian-only text is not shown untranslated')
    name = STOP_NAMES.get(row['slug'], page['title'].split(' (')[0])
    hit = [p for p in paras if name.casefold() in p.casefold()]
    if not hit:
        # Long official names are often shortened in the text; require every distinctive word of the title.
        generic = {'parco','park','national','natural','naturale','regionale','regional','nature','reserve','riserva','del','dei','della','delle','di','e','and','the','of','nord'}
        words = [w for w in flex.re.findall(r"[\w']+", name.casefold()) if w not in generic and len(w) > 3]
        hit = [p for p in paras if words and all(w in p.casefold() for w in words)]
        if hit:
            low = hit[0].casefold(); pos = [low.index(w) for w in words]
            start, end = min(pos), max(low.index(w) + len(w) for w in words)
            if end - start <= 80: name = hit[0][start:end]  # exact wording used by the source
    if not hit: raise ValueError('Article text never names the place exactly')
    excerpt = hit[0]
    url = f'https://{lang}.wikipedia.org/wiki/' + flex.quote(page['title'].replace(' ','_'))
    packet = {'slug':row['slug'],'approved_for_generation':True,'country_code':'it',
        'evidence_policy':'dach-wikipedia-overview','identity_verified':True,
        'review_note':'Wikidata-identified article; descriptive overview only, no current operational rules.',
        'sources':[{'url':url,'kind':'wikipedia','text':text,'generation_excerpts':[excerpt]}
                   | ({'display_translation':translate_excerpt(excerpt,lang),'translation_method':f'Argos offline {lang}-en; original excerpt retained'} if lang in ('it','de') else {})]
                   + ([ferry_source(row['slug'])[0]] if row['slug'] in FERRY else []),
        'approved_stops':[{'id':row['slug'],'name':name,'quote':excerpt,'source_url':url}]}
    (ROOT/'source-packets'/f"{row['slug']}.json").write_text(json.dumps(packet,ensure_ascii=False,indent=2))
    return packet, page, lang

def main():
    rows = [r for r in json.loads((ROOT/'south-europe/catalog.json').read_text()) if r['country']=='it']
    rows.sort(key=lambda r:(r['wave'], not r['enwiki']))
    limit = int(sys.argv[1]) if len(sys.argv)>1 else len(rows)
    prepare = flex.module('flex_prepare','prepare-wave.py')
    published = set(prepare.q("select slug from destinations where status='published'").splitlines())
    used = set(prepare.q('select hero_image from destinations where hero_image is not null').splitlines())
    report = ROOT/'south-europe/italy-result-2026-11-16.json'
    prev = {r['slug']:r for r in json.loads(report.read_text())['results']} if report.exists() else {}
    results=[r for r in prev.values()]; done={r['slug'] for r in results if r['status']=='published'}
    results=[r for r in results if r['slug'] in done]
    todo=[r for r in rows if r['slug'] not in done and r['slug'] not in published][:limit]
    import subprocess
    for row in todo:
        slug=row['slug']; row.setdefault('authority', row.get('official_site') or '')
        try:
            if slug in ROAD_REACHABLE: row['access']='road'
            if slug in FERRY: row['access']='ferry'
            if row['access'] not in ('road','ferry'): raise ValueError('Boat/island arrival needs ferry evidence; no invented drive')
            if slug in TITLE_OVERRIDES: title, lang = TITLE_OVERRIDES[slug]
            elif row.get('wikidata'):
                title, lang = sitelink(row['wikidata'])
            else: title, lang = row['name'].split(' (')[0], 'en'
            packet,page,lang = packet_and_page(row, title, lang)
            if slug in COORDS:
                c = COORDS[slug]
                if len(c) == 2:
                    pt = flex.article(c[0], c[1]); c = (pt['coordinates'][0]['lat'], pt['coordinates'][0]['lon'], f'https://{c[1]}.wikipedia.org/wiki/'+flex.quote(pt['title'].replace(' ','_')))
                    full = json.loads(get('https://de.wikipedia.org/w/api.php?'+urlencode({'action':'query','format':'json','formatversion':2,'titles':page['title'],'prop':'extracts','explaintext':1}))['body'])['query']['pages'][0].get('extract','')
                    if 'Pordoijoch' not in full: raise ValueError('Reference point is not named in the road article')
                page['coordinates'] = [{'lat':c[0],'lon':c[1]}]
            if slug in HEROES: page['pageimage'] = HEROES[slug]
            prepared = flex.prepared_facts(row,page,lang,StraightLine(prepare) if slug in FERRY else prepare,used)
            if slug in COORDS: prepared['coordinate_source'] = c[2]
            bundle = flex.validate_bundle(flex.quoted_bundle(row,packet),slug,flex.compact_packet(packet))
            if slug in FERRY:
                src, sentence = ferry_source(slug); t = bundle['travel']
                t['plan']['days'][0]['note'] = f'Wikivoyage: "{sentence}" Check current timetables with the boat operators before departure; crossings and fares change.'
                t['plan']['days'][0]['driving'] = 'Arrival by scheduled boat; crossing time depends on the port and operator. No road route to the island is shown.'
                t['plan']['intel'] = [i if i['kind']!='access' else {**i,'text':f'Wikivoyage: "{sentence}"'} for i in t['plan']['intel']]
            lit=lambda v:"'"+str(v).replace("'","''")+"'"
            prepare.q('insert into destinations (slug,name,state,country_code,region_slug,currency,park_authority,access_type,destination_type,status,tier,seo_eligible) values ('+
                ','.join(lit(v) for v in [slug,row['name'],prepared['state'],'it',row['region'],'EUR',row['authority'],row['access'],row['kind']])+",'draft','tier1',false) on conflict (slug) do nothing")
            (ROOT/'combined-content'/f'{slug}.json').write_text(json.dumps({'status':'validated','method':'wikipedia-overview-no-model','bundle':bundle},ensure_ascii=False,indent=2))
            Path('/tmp/wave').mkdir(exist_ok=True); Path(f'/tmp/wave/{slug}.json').write_text(json.dumps(prepared|{'ai':bundle['summary']}))
            p=subprocess.run([sys.executable,str(ROOT/'apply-wave.py'),slug],capture_output=True,text=True)
            if p.returncode: raise ValueError(p.stdout+p.stderr)
            flex.save_reviewed_bundle(slug)
            p=subprocess.run([sys.executable,str(ROOT/'publish-wave.py'),slug],capture_output=True,text=True)
            if slug+' published' not in p.stdout: raise ValueError(p.stdout+p.stderr)
            results.append({'slug':slug,'status':'published','country':'it','region':row['region']})
        except Exception as e: results.append({'slug':slug,'status':'held','reason':str(e)[-400:]})
        print(json.dumps(results[-1],ensure_ascii=False),flush=True)
        report.write_text(json.dumps({'content_model_calls':0,'results':results},ensure_ascii=False,indent=2))
    geo_path=ROOT/'../../src/data/destination-geo.json'; geo=json.loads(geo_path.read_text())
    for r in results:
        if r['status']=='published': geo[r['slug']]='it/'+r['region']
    geo_path.write_text(json.dumps(dict(sorted(geo.items())),separators=(',',':')))
    print('Published',sum(r['status']=='published' for r in results),flush=True)

if __name__=='__main__': main()
