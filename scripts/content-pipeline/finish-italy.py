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
TITLE_OVERRIDES = {'gorropu-gorge':('Gola di Gorropu','it'), 'great-dolomite-road':('Grande Strada delle Dolomiti','it'),
    'seceda-and-val-gardena':('Seceda','it'), 'grotta-giusti-and-tuscan-hot-springs-saturnia':('Terme di Saturnia','it'),
    'chianti':('Monti del Chianti','it')}
ITWIKI = {'monte-barro':'Monte Barro'}
ROAD_REACHABLE = {'marine-nature-reserve-of-miramare','marine-protected-area-capo-rizzuto'}  # mainland coast, reached by road

def packet_and_page(row, title, lang='en'):
    """QID-identified English article; the opening paragraph is the reviewed exact-place excerpt."""
    page = flex.article(title, lang)
    text = page.get('extract','').strip()
    paras = [p.strip() for p in text.split('\n') if len(p.strip()) >= 80]
    if (len(text) < 200 or not paras) and lang == 'en' and ITWIKI.get(row['slug']): return packet_and_page(row, ITWIKI[row['slug']], 'it')
    if len(text) < 200 or not paras: raise ValueError('English article too short; Italian-only text is not shown untranslated')
    name = page['title'].split(' (')[0]
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
                   | ({'display_translation':translate_excerpt(excerpt,'it'),'translation_method':'Argos offline it-en; original excerpt retained'} if lang=='it' else {})],
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
            if row['access']!='road': raise ValueError('Boat/island arrival needs ferry evidence; no invented drive')
            if slug in TITLE_OVERRIDES: title, lang = TITLE_OVERRIDES[slug]
            elif row.get('wikidata'):
                title, lang = sitelink(row['wikidata'])
            else: title, lang = row['name'].split(' (')[0], 'en'
            packet,page,lang = packet_and_page(row, title, lang)
            prepared = flex.prepared_facts(row,page,lang,prepare,used)
            bundle = flex.validate_bundle(flex.quoted_bundle(row,packet),slug,flex.compact_packet(packet))
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
