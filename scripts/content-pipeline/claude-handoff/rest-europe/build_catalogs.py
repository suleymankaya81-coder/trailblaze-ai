"""Remaining-Europe catalog from Wikidata (free, no AI). Not publication."""
import json, re, time, unicodedata, requests
from pathlib import Path
ROOT=Path(__file__).parent; E=ROOT/'evidence'
COUNTRIES={'lu':'Q32','pl':'Q36','cz':'Q213','sk':'Q214','hu':'Q28','si':'Q215','hr':'Q224','me':'Q236','al':'Q222','mk':'Q221','ba':'Q225','rs':'Q403','bg':'Q219','ro':'Q218','ee':'Q191','lv':'Q211','lt':'Q37','mt':'Q233','cy':'Q229'}
EXCLUDED={'ua':'Active war zone','ru':'War party; sanctions','by':'War-adjacent; sanctions','md':'Transnistria conflict risk; limited partner coverage','xk':'Unresolved status; limited partner coverage','tr':'Excluded by owner decision','am':'Outside scope/conflict region','az':'Outside scope/conflict region','ge':'Occupied regions; outside scope'}
# national park, nature park, natural WHS, biosphere reserve, AONB, landscape park
MINSL={'Q34038':8,'Q2232001':6,'Q150784':8,'Q23397':12,'Q8502':15}
KINDS={'national_park':['Q46169'],'nature_park':['Q1123754','Q2324794','Q174782','Q6015140'],'unesco_natural':['Q9259'],'natural_attraction':['Q34038','Q2232001','Q150784','Q23397','Q8502']}
UA={'User-Agent':'WildParkRoutes-catalog/1.0 (info@minialife.com)'}
def slug(n): return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',n).encode('ascii','ignore').decode().lower()).strip('-')
def q(cc,qid,cls,direct=False):
    path='?i wdt:P31 wd:'+cls+'; wikibase:sitelinks ?sl; ' if direct else ''
    s=f'''SELECT DISTINCT ?i ?l ?c ?w ?site WHERE {{ {path or '?k wdt:P279* wd:'+cls+'. ?i wdt:P31 ?k; wikibase:sitelinks ?sl; '} wdt:P17 wd:{qid}. 
    ?w schema:about ?i; schema:isPartOf <https://en.wikipedia.org/>. OPTIONAL{{?i wdt:P625 ?c}} OPTIONAL{{?i wdt:P856 ?site}} FILTER NOT EXISTS{{?i wdt:P576 ?e}} FILTER(?sl >= {MINSL.get(cls,1)})
    ?i rdfs:label ?l FILTER(lang(?l)='en') }}'''
    for a in range(3):
        try:
            r=requests.get('https://query.wikidata.org/sparql',params={'query':s,'format':'json'},headers=UA,timeout=60)
            if r.ok: return r.json()['results']['bindings']
        except requests.RequestException: pass
        time.sleep(3)
    if not direct: return q(cc,qid,cls,True)
    print('FAILED',cc,cls,flush=True); return None
if __name__=='__main__':
    cov={}
    for cc,qid in COUNTRIES.items():
        rows={}
        for kind,clss in KINDS.items():
          for cls in clss:
            f=E/f'{cc}-{cls}.json'
            b=json.loads(f.read_text()) if f.exists() else q(cc,qid,cls)
            if b is None: continue
            f.write_text(json.dumps(b))
            for x in b:
                wd=x['i']['value'].rsplit('/',1)[1]
                if wd in rows: continue
                lat=lng=None
                if 'c' in x:
                    m=re.match(r'Point\(([-\d.]+) ([-\d.]+)\)',x['c']['value'])
                    if m: lng,lat=float(m[1]),float(m[2])
                rows[wd]=dict(slug=slug(x['l']['value']),name=x['l']['value'],country=cc,kind=kind,wave=1 if kind=='national_park' else 2 if kind!='natural_attraction' else 3,
                  wikidata=wd,enwiki=x['w']['value'],lat=lat,lng=lng,official_site=x.get('site',{}).get('value'),region=None,
                  source='wikidata',source_urls=[x['i']['value'],x['w']['value']],access='unknown',
                  access_note='Access and seasonal restrictions require source verification; no road access implied.')
        for r in rows.values():
            if r['kind']!='national_park' and re.search(r'national park|nacionalni park|park narodowy|rahvuspark|nemzeti park',r['name'],re.I): r.update(kind='national_park',wave=1)
        seen=set();out=[]
        for r in sorted(rows.values(),key=lambda r:(r['wave'],r['name'])):
            if r['slug'] in seen: r['slug']+='-'+cc
            seen.add(r['slug']);out.append(r)
        (ROOT/f'{cc}-catalog.json').write_text(json.dumps(out,ensure_ascii=False,indent=1))
        cov[cc]=dict(total=len(out),national_parks=sum(r['kind']=='national_park' for r in out),no_coords=sum(r['lat'] is None for r in out))
        print(cc,cov[cc],flush=True)
    (ROOT/'coverage.json').write_text(json.dumps(dict(countries=cov,excluded=EXCLUDED,partner_basis='Webjet group (Airport Rentals / Motorhome Republic) Europe coverage; per-country partner links still resolved via countryPartners.ts'),indent=1))
