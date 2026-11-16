"""Complete the retained 63 DACH holds with exact Wikipedia overviews; zero model calls."""
import json
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlencode, quote
from combined_content import module, validate_bundle
from compact_evidence import compact_packet
from dach_discovery import get, key
from quoted_visit import quoted_bundle
from save_reviewed_bundle import save_reviewed_bundle

ROOT = Path(__file__).parent
# Reviewed article identities, not search-result positions or parent authorities.
TITLES = {
 'southern-black-forest-biosphere-area': 'Biosphärengebiet Schwarzwald',
 'elbe-river-landscape-biosphere-reserve': 'Biosphärenreservat Flusslandschaft Elbe',
 'vessertal-thuringian-forest-biosphere-reserve': 'Vessertal-Thüringen Forest',
 'upper-lusatian-heath-and-pond-landscape': 'Upper Lusatian Heath and Pond Landscape',
 'ore-mountains-nature-park': 'Ore Mountains/Vogtland Nature Park',
 'feldberg-black-forest': 'Feldberg (Black Forest)',
 'danube-gorge-weltenburg-narrows': 'Donaudurchbruch bei Weltenburg', 'lake-eibsee': 'Eibsee',
 'alpsee-fussen': 'Alpsee', 'lake-constance-german-shore': 'Lake Constance',
 'titisee': 'Titisee', 'mummelsee': 'Mummelsee', 'lake-edersee': 'Edersee',
 'eifel-maars-daun': 'Dauner Maare', 'rugen-chalk-cliffs-konigsstuhl': 'Königsstuhl (Rügen)',
 'island-of-amrum': 'Amrum', 'island-of-fohr': 'Föhr', 'island-of-norderney': 'Norderney',
 'island-of-juist': 'Juist', 'herreninsel-chiemsee': 'Herreninsel',
 'elbe-sandstone-mountains-bastei': 'Bastei', 'kyffhauser': 'Kyffhäuser',
 'triberg-waterfalls': 'Triberg Waterfalls', 'todtnau-waterfall': 'Todtnauer Wasserfall',
 'barenhohle-swabian-alb': 'Bärenhöhle (Sonnenbühl)', 'teufelshohle-pottenstein': 'Teufelshöhle bei Pottenstein',
 'salzburger-lungau-and-karntner-nockberge-biosphere': 'Salzburger Lungau und Kärntner Nockberge',
 'grossglockner-and-pasterze-glacier': 'Pasterze', 'eisriesenwelt-ice-cave': 'Eisriesenwelt',
 'dachstein-ice-cave-and-five-fingers': 'Dachstein-Rieseneishöhle',
 'hallstatt-and-lake-hallstatt': 'Hallstätter See', 'plansee': 'Plansee',
 'gosau-lakes': 'Gosauseen', 'stubai-valley-and-glacier': 'Stubaital',
 'kaprun-glacier-kitzsteinhorn': 'Kitzsteinhorn', 'tscheppaschlucht': 'Tscheppaschlucht',
 'golling-waterfall': 'Gollinger Wasserfall', 'stuibenfall': 'Stuibenfall (Umhausen)',
 'umbalfalle': 'Umbalfälle', 'grindelwald-and-eiger': 'Eiger',
 'schilthorn-and-murren': 'Schilthorn', 'rhine-gorge-ruinaulta': 'Ruinaulta',
 'stoos-and-fronalpstock': 'Fronalpstock (Schwyz)', 'ebenalp-and-seealpsee': 'Seealpsee',
 'lake-maggiore-swiss-shore': 'Lake Maggiore', 'vall-e-de-joux': 'Vallée de Joux',
 'black-forest-central-north-nature-park': 'Central/North Black Forest Nature Park',
 'bavarian-rhon-nature-park': 'Bavarian Rhön Nature Park', 'rhine-taunus-nature-park': 'Naturpark Rhein-Taunus',
 'nassau-nature-park': 'Naturpark Nassau', 'peene-valley-river-landscape-nature-park': 'Naturpark Flusslandschaft Peenetal',
 'nossentin-schwinz-heath-nature-park': 'Naturpark Nossentiner/Schwinzer Heide',
 'uckermark-lakes-nature-park': 'Uckermark Lakes Nature Park', 'schlaube-valley-nature-park': 'Schlaube Valley Nature Park',
 'south-harz-nature-park': 'South Harz Nature Park', 'harz-nature-park-saxony-anhalt': 'Harz/Saxony-Anhalt Nature Park',
 'dromling-nature-park': 'Drömling', 'wadden-sea-and-halligen-biosphere-reserve': 'Schleswig-Holstein Wadden Sea National Park',
 'lower-saxon-elbe-valley-biosphere-reserve': 'Biosphärenreservat Niedersächsische Elbtalaue',
 'lech-valley-nature-park': 'Naturpark Tiroler Lech', 'buchberg-nature-park': 'Naturpark Buchberg',
 'eisenwurzen-nature-park-lower-austria': 'Naturpark Eisenwurzen (Niederösterreich)',
 'neusiedler-see-leithagebirge-nature-park': 'Naturpark Neusiedler See – Leithagebirge',
}

def article(title, lang):
    params = {'action':'query','format':'json','formatversion':2,'redirects':1,'titles':title,
              'prop':'extracts|coordinates|pageimages|pageprops','explaintext':1,'exintro':1,'piprop':'name'}
    data = json.loads(get(f'https://{lang}.wikipedia.org/w/api.php?' + urlencode(params))['body'])
    page = data['query']['pages'][0]
    if page.get('missing') or 'disambiguation' in page.get('pageprops', {}):
        raise ValueError('Article missing or ambiguous: ' + title)
    return page

def packet_and_page(row):
    title = TITLES[row['slug']]
    for lang in ('en','de'):
        try:
            page = article(title, lang)
            text = page.get('extract','').strip()
            if len(text) < 200: continue
            name = page['title'].split(' (')[0]
            paragraphs = [p.strip() for p in text.split('\n') if name.casefold() in p.casefold() and len(p.strip()) >= 80]
            if not paragraphs:
                # German inflections often differ from the article title; use its exact opening bold-name phrase.
                first = text.split('\n')[0].strip()
                candidate = re.split(r'\s+(?:ist|liegt|wurde|umfasst|befindet)\s+', first, maxsplit=1)[0]
                if 4 <= len(candidate) <= 150 and len(first) >= 80:
                    name = candidate; paragraphs = [first]
            if not paragraphs: continue
            excerpt = paragraphs[0]
            url = f'https://{lang}.wikipedia.org/wiki/' + quote(page['title'].replace(' ','_'))
            source = {'url':url,'kind':'wikipedia','text':text,'generation_excerpts':[excerpt]}
            if lang == 'de':
                from local_translation import translate_excerpt
                source['display_translation'] = translate_excerpt(excerpt)
            packet = {'slug':row['slug'],'approved_for_generation':True,'country_code':row['country'],
                'evidence_policy':'dach-wikipedia-overview','identity_verified':True,
                'review_note':'Explicit article identity; descriptive overview only, no current operational rules.',
                'sources':[source], 'approved_stops':[{'id':row['slug'],'name':name,'quote':excerpt,'source_url':url}]}
            (ROOT/'source-packets'/f"{row['slug']}.json").write_text(json.dumps(packet,ensure_ascii=False,indent=2))
            return packet, page, lang
        except Exception as error:
            last = error
    raise ValueError('No usable exact-place Wikipedia overview: ' + str(locals().get('last','short article')))

def prepared_facts(row, page, lang, prepare, used):
    path = ROOT/'wave3-facts'/f"{row['slug']}.json"
    if path.exists(): return json.loads(path.read_text())
    coords = page.get('coordinates', [])
    if not coords and page.get('pageprops',{}).get('wikibase_item'):
        qid = page['pageprops']['wikibase_item']
        entity = json.loads(get('https://www.wikidata.org/wiki/Special:EntityData/'+qid+'.json')['body'])['entities'][qid]
        claims = entity.get('claims',{}).get('P625',[])
        if claims:
            point = claims[0]['mainsnak']['datavalue']['value']
            coords = [{'lat':point['latitude'],'lon':point['longitude']}]
    if not coords: raise ValueError('Exact article coordinates missing')
    lat,lng = coords[0]['lat'], coords[0]['lon']
    bounds = {'de':(47,55.2,5.5,15.5),'at':(46.3,49.1,9.4,17.2),'ch':(45.8,47.9,5.8,10.6)}[row['country']]
    if not (bounds[0]<=lat<=bounds[1] and bounds[2]<=lng<=bounds[3]): raise ValueError('Coordinate country mismatch')
    hero = prepare.file_info(page['pageimage']) if page.get('pageimage') else None
    if hero and (hero['url'] in used or prepare.BAD.search(hero['file'])): hero = None
    if not hero:
        term = page['title'].split(' (')[0]
        for photo in prepare.commons_search(term,limit=16):
            tokens = [key(t) for t in term.split() if len(key(t))>=6 and key(t) not in ('naturpark','nationalpark','biosphaerenreservat')]
            if (key(term) in key(photo['file']) or any(t in key(photo['file']) for t in tokens)) and photo['url'] not in used: hero=photo;break
    if not hero or hero['credit']=='Unknown' or hero['license'] in ('','See source'): raise ValueError('Licensed unique same-place cover missing')
    routes=[]
    for airport in prepare.airports(lat,lng,n=2,country=row['country']):
        rt=prepare.route(airport,lat,lng)
        if rt: routes.append((rt['minutes'],airport,rt))
    if not routes: raise ValueError('No routable airport arrival; no invented island transfer')
    _,airport,rt=min(routes,key=lambda x:x[0])
    result={'slug':row['slug'],'name':row['name'],'state':row['region'].replace('-',' ').title(),
        'lat':lat,'lng':lng,'airport':airport,'route':rt,'hero':hero,'gallery':[],'activity':[],
        'coordinate_source':f'https://{lang}.wikipedia.org/wiki/'+quote(page['title'])}
    used.add(hero['url']);path.write_text(json.dumps(result,ensure_ascii=False,indent=2));return result

def main():
    prepare=module('flex_prepare','prepare-wave.py')
    rows={r['slug']:r for r in json.loads((ROOT/'dach/catalog.json').read_text())}
    slugs=[r['slug'] for r in json.loads((ROOT/'dach/gemini-completion-2026-11-16.json').read_text())['results'] if r['status'].startswith('held')]
    published=set(prepare.q("select slug from destinations where status='published'").splitlines())
    used=set(prepare.q('select hero_image from destinations where hero_image is not null').splitlines())
    report=ROOT/'dach/flexible-completion-2026-11-16.json'
    previous={r['slug']:r for r in json.loads(report.read_text())['results']} if report.exists() else {}
    results=[]
    for slug in slugs:
        try:
            if slug in published: results.append(previous.get(slug,{'slug':slug,'status':'already_published'}));continue
            row=rows[slug];packet,page,lang=packet_and_page(row)
            prepared=prepared_facts(row,page,lang,prepare,used)
            bundle=validate_bundle(quoted_bundle(row,packet),slug,compact_packet(packet))
            lit=lambda v: "'"+str(v).replace("'","''")+"'"
            prepare.q('insert into destinations (slug,name,state,country_code,region_slug,currency,park_authority,access_type,destination_type,status,tier,seo_eligible) values ('+
                ','.join(lit(v) for v in [slug,row['name'],prepared['state'],row['country'],row['region'],'CHF' if row['country']=='ch' else 'EUR',row['authority'],row['access'],row['kind']])+",'draft','tier1',false) on conflict (slug) do nothing")
            (ROOT/'combined-content'/f'{slug}.json').write_text(json.dumps({'status':'validated','method':'wikipedia-overview-no-model','bundle':bundle},ensure_ascii=False,indent=2))
            Path('/tmp/wave').mkdir(exist_ok=True);Path(f'/tmp/wave/{slug}.json').write_text(json.dumps(prepared|{'ai':bundle['summary']}))
            proc=subprocess.run([sys.executable,str(ROOT/'apply-wave.py'),slug],capture_output=True,text=True)
            if proc.returncode: raise ValueError(proc.stdout+proc.stderr)
            save_reviewed_bundle(slug)
            proc=subprocess.run([sys.executable,str(ROOT/'publish-wave.py'),slug],capture_output=True,text=True)
            if slug+' published' not in proc.stdout: raise ValueError(proc.stdout+proc.stderr)
            results.append({'slug':slug,'status':'published','country':row['country'],'region':row['region']})
        except Exception as error: results.append({'slug':slug,'status':'held','reason':str(error)[-500:]})
        print(json.dumps(results[-1],ensure_ascii=False),flush=True)
        report.write_text(json.dumps({'requested':len(slugs),'content_model_calls':0,'results':results},ensure_ascii=False,indent=2))
    geo_path=Path('src/data/destination-geo.json');geo=json.loads(geo_path.read_text())
    for r in results:
        if r['status']=='published':geo[r['slug']]=r['country']+'/'+r['region']
    geo_path.write_text(json.dumps(dict(sorted(geo.items())),separators=(',',':')))
    print('Published',sum(r['status']=='published' for r in results),'of',len(slugs),flush=True)

if __name__=='__main__': main()