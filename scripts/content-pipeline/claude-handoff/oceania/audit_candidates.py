"""Retained AU/NZ candidate identity, link and completeness audit; no publication."""
import concurrent.futures
import json
import re
from pathlib import Path
from urllib.parse import unquote, quote, urlsplit
import requests
from build_catalogs import ROOT, E

HEADERS={'User-Agent':'WildParkRoutes-catalog-audit/1.0 (info@minialife.com)'}
EXPECTED={'au':'Q408','nz':'Q664'}

def wiki_key(url):
    # Titles contain slashes (Aoraki / Mount Cook); never take only the final segment.
    return unquote(urlsplit(url).path.removeprefix('/wiki/')).replace('_',' ')

def fetch_entities(qids):
    cache=E/'audit-entities.json';entities=json.loads(cache.read_text()) if cache.exists() else {}
    missing=sorted(set(qids)-entities.keys())
    for i in range(0,len(missing),40):
        try:
            r=requests.get('https://www.wikidata.org/w/api.php',params={'action':'wbgetentities','ids':'|'.join(missing[i:i+40]),'props':'claims|labels|sitelinks','languages':'en','sitefilter':'enwiki','format':'json'},headers=HEADERS,timeout=30)
            r.raise_for_status();entities.update(r.json()['entities']);cache.write_text(json.dumps(entities,ensure_ascii=False))
        except (requests.RequestException,KeyError,ValueError):continue
    return entities

def ids(entity,property):
    return [c.get('mainsnak',{}).get('datavalue',{}).get('value',{}).get('id') for c in entity.get('claims',{}).get(property,[])]

def main():
    rows=sum([json.loads((ROOT/f'{cc}-catalog.json').read_text()) for cc in ['au','nz']],[])
    titles={wiki_key(r['enwiki']) for r in rows if r.get('enwiki')}
    titles.update(r['name'] for r in rows if r['country']=='nz' and not r.get('enwiki'))
    cache=E/'audit-wiki.json';pages=json.loads(cache.read_text()) if cache.exists() else {}
    todo=sorted(titles-pages.keys())
    for i in range(0,len(todo),40):
        chunk=todo[i:i+40]
        try:
            r=requests.get('https://en.wikipedia.org/w/api.php',params={'action':'query','titles':'|'.join(chunk),'redirects':1,'prop':'coordinates|pageprops','colimit':'max','format':'json'},headers=HEADERS,timeout=30)
            r.raise_for_status();j=r.json()['query'];p={v['title']:v for v in j['pages'].values()};rd={v['from']:v['to'] for v in j.get('redirects',[])};nm={v['from']:v['to'] for v in j.get('normalized',[])}
            for t in chunk:
                n=nm.get(t,t);n=rd.get(n,n);pages[t]=p.get(n,{'missing':True})
            cache.write_text(json.dumps(pages,ensure_ascii=False))
        except (requests.RequestException,ValueError,KeyError):continue
    qids=[r['wikidata'] for r in rows if r.get('wikidata')]+[p.get('pageprops',{}).get('wikibase_item') for p in pages.values()]
    entities=fetch_entities([q for q in qids if q])
    # Resolve administrative ancestors, keeping named source hints rather than guessed regions.
    ancestors={q for entity in entities.values() for q in ids(entity,'P131') if q}
    entities.update(fetch_entities(ancestors))
    overrides_path=E/'audit-overrides.json'
    overrides=json.loads(overrides_path.read_text()) if overrides_path.exists() else {};findings=[]
    doc=(E/'doc-national-parks.md').read_text() if (E/'doc-national-parks.md').exists() else ''
    official={name:url for url,name in re.findall(r'\]\((https://www\.doc\.govt\.nz/parks-and-recreation/places-to-go/[^\s]+) "([^"]+)"\)',doc)}
    urls={u for r in rows for u in r['source_urls'] if 'wikipedia.org/wiki/' not in u and 'wikidata.org' not in u}
    links_path=E/'source-link-status.json';links=json.loads(links_path.read_text()) if links_path.exists() else {}
    def status(u):
        try:
            r=requests.get(u,headers=HEADERS,timeout=12,stream=True);v={'status':r.status_code,'final_url':r.url};r.close();return u,v
        except requests.RequestException as e:return u,{'status':None,'error':type(e).__name__}
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
        for u,v in ex.map(status,sorted(urls-links.keys())):links[u]=v
    links_path.write_text(json.dumps(links,ensure_ascii=False,indent=2)+'\n')
    for row in rows:
        s=row['slug'];o=dict(overrides.get(s,{}));issues=[]
        page=pages.get(wiki_key(row['enwiki']) if row.get('enwiki') else row['name'],{})
        if page.get('title','').startswith(('List of ','Lists of ')):
            page={};o.update(wikidata=None,enwiki=None);issues.append('article_redirects_to_inventory_not_exact_place')
        qid=None if 'article_redirects_to_inventory_not_exact_place' in issues else row.get('wikidata') or page.get('pageprops',{}).get('wikibase_item')
        entity=entities.get(qid,{}) if qid else {}
        countries=ids(entity,'P17')
        if countries and EXPECTED[row['country']] not in countries:issues.append('wrong_country_identity')
        elif qid:
            o['wikidata']=qid
            if page and 'missing' not in page:
                o['enwiki']='https://en.wikipedia.org/wiki/'+quote(page['title'].replace(' ','_'),safe="()/,:'")
            if row['lat'] is None:
                coords=page.get('coordinates',[])
                if not coords:
                    coords=[{'lat':c.get('mainsnak',{}).get('datavalue',{}).get('value',{}).get('latitude'),'lon':c.get('mainsnak',{}).get('datavalue',{}).get('value',{}).get('longitude')} for c in entity.get('claims',{}).get('P625',[])]
                for c in coords:
                    lat,lng=c.get('lat'),c.get('lon')
                    if lat is not None and lng is not None and (-45<=lat<=-9 and 110<=lng<=160 if row['country']=='au' else -48<=lat<=-33 and 165<=lng<=180):
                        o.update(lat=lat,lng=lng,coordinate_source='https://www.wikidata.org/wiki/'+qid,coordinate_role='general_destination_point_not_navigation');break
            hints=[entities.get(q,{}).get('labels',{}).get('en',{}).get('value') for q in ids(entity,'P131')]
            o['administrative_area_hints']=[h for h in hints if h]
            if row['country']=='nz' and not row['region']:
                regions={'Northland Region':'northland','Auckland Region':'auckland','Waikato Region':'waikato','Bay of Plenty Region':'bay-of-plenty','Gisborne District':'gisborne',"Hawke's Bay Region":'hawkes-bay','Taranaki Region':'taranaki','Manawatū-Whanganui Region':'manawatu-whanganui','Wellington Region':'wellington','Tasman District':'tasman','Marlborough District':'marlborough','West Coast Region':'west-coast','Canterbury Region':'canterbury','Otago Region':'otago','Southland Region':'southland'}
                candidates=[h for h in hints if h in regions]
                for q in ids(entity,'P131'):
                    candidates.extend(entities.get(parent,{}).get('labels',{}).get('en',{}).get('value') for parent in ids(entities.get(q,{}),'P131') if entities.get(parent,{}).get('labels',{}).get('en',{}).get('value') in regions)
                mapped=list(dict.fromkeys(regions[h] for h in candidates))
                if mapped:o.update(region=mapped[0],also_regions=mapped[1:],region_source='https://www.wikidata.org/wiki/'+qid,region_note='Administrative ancestry discovery hint; full park/track boundary not certified.')
        if row['name'] in official:o['official_site']=official[row['name']]
        if row['country']=='nz' and not row['region'] and row.get('official_site'):
            h=row['official_site'];regions={'nelson-tasman':'tasman','fiordland':'southland','southland':'southland','central-north-island':'manawatu-whanganui','manawatu-whanganui':'manawatu-whanganui','east-coast':'hawkes-bay','west-coast':'west-coast'}
            for k,v in regions.items():
                if '/places-to-go/'+k+'/' in h:o.update(region=v,region_source=h,region_note='Official DOC visitor region mapped to catalog primary region; full track boundary not certified.');break
        result={**row,**o}
        if not result.get('wikidata'):issues.append('missing_wikidata_identity')
        if result['lat'] is None:issues.append('missing_coordinate')
        if not result['region']:issues.append('missing_region')
        if not result['official_site']:issues.append('missing_exact_official_visitor_page')
        if page.get('missing') is not None:issues.append('missing_wikipedia_article')
        if row.get('scientific_restriction_review'):issues.append('scientific_public_access_review')
        issues.extend(['licensed_cover_not_collected','visitor_access_not_verified','english_german_content_not_produced'])
        o['candidate_audit']={'checked_at':'2026-11-19','country_claims':countries,'publication_ready':False,'issues':issues}
        overrides[s]=o;findings.append({'slug':s,'country':row['country'],'name':row['name'],'issues':issues})
    (E/'audit-overrides.json').write_text(json.dumps(overrides,ensure_ascii=False,indent=2)+'\n')
    (ROOT/'candidate-findings.json').write_text(json.dumps(findings,ensure_ascii=False,indent=2)+'\n')
    print('Audited',len(rows),'candidates; cached',len(pages),'article identities and',len(links),'source link statuses.')

if __name__=='__main__':main()