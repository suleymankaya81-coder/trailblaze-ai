"""Offline AU/NZ catalog assembly from retained source evidence; never publishes."""
import collections
import json
import re
import unicodedata
from pathlib import Path
from urllib.parse import quote, urljoin
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent
E = ROOT / 'evidence'
CAPAD = 'https://gis.environment.gov.au/gispubmap/rest/services/ogc_services/CAPAD/FeatureServer/0'
AU_LIST = 'https://en.wikipedia.org/wiki/List_of_national_parks_of_Australia'
NZ_LIST = 'https://en.wikipedia.org/wiki/National_parks_of_New_Zealand'
STATES = {'ACT': 'australian-capital-territory', 'NSW': 'new-south-wales', 'NT': 'northern-territory', 'QLD': 'queensland', 'SA': 'south-australia', 'TAS': 'tasmania', 'VIC': 'victoria', 'WA': 'western-australia', 'JBT': 'jervis-bay-territory', 'EXT': 'external-territories'}
AGENCIES = {'NSW': 'https://www.nationalparks.nsw.gov.au/visit-a-park', 'QLD': 'https://parks.qld.gov.au/parks', 'NT': 'https://nt.gov.au/parks/find-a-park', 'WA': 'https://exploreparks.dbca.wa.gov.au/', 'SA': 'https://www.parks.sa.gov.au/find-a-park', 'TAS': 'https://parks.tas.gov.au/explore-our-parks', 'VIC': 'https://www.parks.vic.gov.au/', 'ACT': 'https://www.parks.act.gov.au/', 'JBT': 'https://booderee.gov.au/', 'EXT': 'https://parksaustralia.gov.au/'}
TYPES = {'National Park', 'National Park Aboriginal', 'CCA Zone 1 National Park', 'National Park (Commonwealth)', 'National Park (Scientific)'}

def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode().lower()).strip('-')

def norm(name):
    return slug(re.sub(r'\b(national park|and botanic gardens)\b', '', name.replace('–','-').replace('—','-'), flags=re.I))

def dump(name, value):
    (ROOT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def base(cc, name, kind, region, urls):
    return dict(slug=slug(name), name=name, region=region, also_regions=[], country=cc, kind=kind, wave=1 if kind=='national_park' else 2 if kind=='nature_park' else 3,
                wikidata=None, enwiki=None, lat=None, lng=None, official_site=None, access='unknown', source='retained_inventory', source_urls=urls,
                access_note='Visitor access, road gateways, seasonal closures and permissions require exact-place official review; no vehicle access implied.',
                identity_status='inventory_candidate_not_publication_ready', coordinate_source=None, coordinate_role='general_destination_point_not_navigation')

def main():
    catalogs = {'au': [], 'nz': []}
    supplement = []
    inventories = []
    excluded = []
    soup = BeautifulSoup((E/'au-rest.html').read_text(), 'html.parser')
    wiki = {}
    for section in soup.select('section'):
        h = section.find('h2', recursive=False)
        if not h: continue
        state = next((k for k,v in STATES.items() if slug(h.get_text(' ',strip=True)) == v), None)
        if not state: continue
        for tr in section.select('table.wikitable tr'):
            td = tr.find('td', recursive=False)
            a = td.find('a', href=True) if td else None
            if a and a.get('rel') == ['mw:WikiLink']:
                wiki[(state, norm(a.get_text(' ',strip=True)))] = (a.get_text(' ',strip=True), 'https://en.wikipedia.org/wiki/'+a['href'].removeprefix('./'))
    groups = collections.defaultdict(list)
    for feature in json.loads((E/'capad-national.json').read_text())['features']:
        a = feature['attributes']
        if a['TYPE'] in TYPES: groups[(a['STATE'], a['NAME'])].append(a)
        else: excluded.append(dict(source_id=a['PA_ID'], name=a['NAME'], designation=a['TYPE'], reason='Not a current national-park designation in the selected CAPAD types; no automatic destination.'))
    cap_entries = []
    for (state,name), parcels in sorted(groups.items()):
        alias = wiki.get((state,norm(name)))
        display = alias[0] if alias else name if 'national park' in name.lower() else name+' National Park'
        r = base('au',display,'national_park',STATES[state],[CAPAD,AU_LIST] if alias else [CAPAD])
        r['slug'] += '-'+state.lower()
        r.update(park_authority=sorted({p['AUTHORITY'] for p in parcels}), inventory_date='2024-06-30', inventory_names=[name], inventory_ids=sorted({p['PA_ID'] for p in parcels}), parcel_count=len(parcels), region_iso_codes=['AU-'+state] if state not in ['EXT','JBT'] else [], region_source=CAPAD)
        # A retained parcel centroid is NOT a visitor gateway or full-park centre.
        point = max(parcels, key=lambda p:p.get('GIS_AREA') or 0)
        r.update(lat=point.get('LATITUDE'), lng=point.get('LONGITUDE'), coordinate_source=CAPAD, coordinate_role='largest_inventory_parcel_centroid_not_navigation', official_directory=AGENCIES[state])
        if alias: r['enwiki']=alias[1]; r['source_urls'].append(alias[1])
        r['scientific_restriction_review'] = any(p['TYPE']=='National Park (Scientific)' for p in parcels)
        r['publication_hold'] = 'Exact-place public visitor access and current park identity require review; CAPAD is a 2024 land inventory, not a 2026 visitor guide.'
        if r['scientific_restriction_review']: r['publication_hold']='Scientific national park: public visitor access must be established before any publication.'
        if state=='EXT':
            r['publication_hold']='External territory: separate country/territory, flights/boat access and partner eligibility must be reviewed.'
            supplement.append(r)
        else: catalogs['au'].append(r)
        cap_entries.append(dict(name=name,state=state,catalog_slug=r['slug'],location='territories-supplement' if state=='EXT' else 'au-catalog',source_ids=r['inventory_ids']))
    inventories.append(dict(id='capad_2024_national_park_name_groups',country='au',source_url=CAPAD,inventory_date='2024-06-30',expected_count=len(cap_entries),entries=cap_entries))
    # Wikipedia-only discrepancies are retained, not silently discarded or declared current.
    unmatched=[]
    for (state,key),(name,url) in sorted(wiki.items()):
        if any(st==state and norm(n)==key for st,n in groups): continue
        r=base('au',name,'national_park',STATES[state],[url,AU_LIST]);r['slug']+='-'+state.lower();r['enwiki']=url;r['identity_status']='wikipedia_inventory_discrepancy';r['publication_hold']='Not exact-name matched to CAPAD 2024: review renaming, consolidation, newer designation or obsolete status.'
        target=supplement if state=='EXT' else catalogs['au']
        if not any(x['slug']==r['slug'] for x in target):target.append(r)
        unmatched.append(dict(name=name,state=state,catalog_slug=r['slug']))
    dump('inventory-discrepancies.json',unmatched)
    soup=BeautifulSoup((E/'nz-rest.html').read_text(),'html.parser')
    nz_entries=[]
    regions={'Abel Tasman':'tasman','Aoraki':'canterbury',"Arthur":'canterbury','Egmont':'taranaki','Fiordland':'southland','Kahurangi':'tasman','Mount Aspiring':'otago','Nelson Lakes':'tasman','Paparoa':'west-coast','Rakiura':'southland','Tongariro':'manawatu-whanganui','Westland':'west-coast','Whanganui':'manawatu-whanganui','Te Urewera':'hawkes-bay'}
    for tr in soup.select('table.wikitable tr'):
        td=tr.find('td',recursive=False);a=td.find('a',href=True) if td else None
        if not a:continue
        name=a.get_text(' ',strip=True); former='Te Urewera' in name
        url='https://en.wikipedia.org/wiki/'+a['href'].removeprefix('./')
        r=base('nz','Te Urewera' if former else 'Te Papa-Kura-o-Taranaki' if name=='Egmont National Park' else name,'nature_park' if former else 'national_park',next((v for k,v in regions.items() if k in name),None),[url,NZ_LIST])
        r['enwiki']=url
        if name=='Egmont National Park':
            r['aliases']=['Egmont National Park'];r['official_site']='https://www.doc.govt.nz/parks-and-recreation/places-to-go/taranaki/places/te-papa-kura-o-taranaki/';r['source_urls'].append(r['official_site'])
        if former:r['identity_status']='former_national_park_current_separate_protected_entity';r['aliases']=['Te Urewera National Park']
        catalogs['nz'].append(r)
        if not former:nz_entries.append(dict(name=r['name'],catalog_slug=r['slug']))
    inventories.append(dict(id='nz_current_national_parks',country='nz',source_url=NZ_LIST,corroborating_source_url='https://www.doc.govt.nz/parks-and-recreation/places-to-go/national-parks/',expected_count=13,entries=nz_entries))
    # Named conservation/forest parks in the retained protected-area navigation.
    for a in soup.select('a[href]'):
        title=a.get('title','')
        if not re.search(r'(Conservation|Forest) Park$',title) or title.startswith('Template:'):continue
        if any(x.get('enwiki','')=='https://en.wikipedia.org/wiki/'+a['href'].removeprefix('./') for x in catalogs['nz']):continue
        url='https://en.wikipedia.org/wiki/'+a['href'].removeprefix('./');r=base('nz',title,'nature_park',None,[url,NZ_LIST]);r['enwiki']=url;catalogs['nz'].append(r)
    soup=BeautifulSoup((E/'nz-compare.html').read_text(),'html.parser');walks=[]
    for a in soup.select('a[href]'):
        h=a['href']
        if a.get_text(' ',strip=True)!='Find out more' or '/tracks/' not in h and '/rakiura-track/' not in h:continue
        name=h.rstrip('/').rsplit('/',1)[1].replace('-',' ').title();url=urljoin('https://www.doc.govt.nz',h)
        r=base('nz',name,'walking_route',None,[url,'https://www.doc.govt.nz/parks-and-recreation/things-to-do/walking-and-tramping/great-walks/compare-great-walks/']);r['official_site']=url;r['access']='foot';r['access_note']='Multi-day Great Walk: not a drivable loop; hut/campsite bookings, transport and seasonal access require current official review.'
        if name=='Whanganui Journey':r['access']='boat';r['access_note']='Canoe journey, not a road or walking loop; transport, river conditions and bookings require current official review.'
        catalogs['nz'].append(r);walks.append(dict(name=name,catalog_slug=r['slug']))
    inventories.append(dict(id='nz_great_walks',country='nz',source_url='https://www.doc.govt.nz/parks-and-recreation/things-to-do/walking-and-tramping/great-walks/compare-great-walks/',expected_count=11,entries=walks))
    # Article existence is evidence for discovery only, not editorial approval.
    additions=json.loads((E/'discovery-additions.json').read_text())
    for r in additions:
        if not any(x['slug']==r['slug'] or x.get('wikidata') and x.get('wikidata')==r.get('wikidata') for x in catalogs[r['country']]):catalogs[r['country']].append(r)
    # Enrich identities from retained API, without replacing official inventory centroids.
    identities=json.loads((E/'wiki-identities.json').read_text())
    for r in catalogs['au']+catalogs['nz']+supplement:
        title=quote(r.get('enwiki','').rsplit('/',1)[-1].replace(' ','_'),safe="()/,:\u0027") if r.get('enwiki') else None
        x=identities.get(title)
        if x:
            r['wikidata']=x.get('wikidata');r['identity_evidence']='retained_exact_article_pageprops; country/location still requires production review'
            if r['lat'] is None and x.get('lat') is not None:r.update(lat=x['lat'],lng=x['lng'],coordinate_source=r['enwiki'])
    # Retained exact article-title aliases for CAPAD's dual names.
    aliases={'Boodjamulla (Lawn Hill) National Park':'Boodjamulla National Park',
             'Rinyirru (Lakefield) National Park':'Rinyirru National Park',
             'Kutini-Payamu (Iron Range) National Park':'Kutini-Payamu National Park',
             'Cudmore (Limited Depth) National Park':'Cudmore National Park',
             'Booderee National Park':'Booderee National Park and Botanic Gardens'}
    for old,new in aliases.items():
        keeper=next((r for r in catalogs['au'] if r['name']==old),None)
        other=next((r for r in catalogs['au']+supplement if r['name']==new),None)
        if keeper and other and other.get('wikidata'):
            keeper['wikidata']=other['wikidata'];keeper['enwiki']=other['enwiki'];keeper.setdefault('aliases',[]).append(new);keeper['source_urls']=list(dict.fromkeys(keeper['source_urls']+other['source_urls']))
    # Booderee is Jervis Bay Territory, not an overseas external territory.
    supplement=[r for r in supplement if r['name']!='Booderee National Park and Botanic Gardens']
    audit_path=E/'audit-overrides.json'
    overrides=json.loads(audit_path.read_text()) if audit_path.exists() else {}
    for r in catalogs['au']+catalogs['nz']:
        r.update(overrides.get(r['slug'],{}))
        if r.get('official_site') and r['official_site'] not in r['source_urls']:r['source_urls'].append(r['official_site'])
    # Exact QID duplicates/redirected subfeatures share one destination; remap ledgers.
    remap={}
    for cc,rows in catalogs.items():
        seen={};seen_names={};out=[]
        for r in rows:
            qid=r.get('wikidata')
            key=(r['region'],norm(r['name']))
            keeper=seen.get(qid) if qid else None
            keeper=keeper or seen_names.get(key)
            if keeper:
                keeper.setdefault('aliases',[]).append(r['name']);keeper['source_urls']=list(dict.fromkeys(keeper['source_urls']+r['source_urls']));remap[r['slug']]=keeper['slug']
                if not keeper.get('wikidata'):keeper['wikidata']=r.get('wikidata')
                if not keeper.get('enwiki'):keeper['enwiki']=r.get('enwiki')
            else:
                out.append(r)
                if qid:seen[qid]=r
                seen_names[key]=r
        catalogs[cc]=out
    for inv in inventories:
        for entry in inv['entries']:entry['catalog_slug']=remap.get(entry['catalog_slug'],entry['catalog_slug'])
    for entry in unmatched:entry['catalog_slug']=remap.get(entry['catalog_slug'],entry['catalog_slug'])
    dump('inventory-discrepancies.json',unmatched)
    # Exact official links extracted from downloaded agency directories, not constructed URLs.
    official=[]
    for key,origin in [('nsw','https://www.nationalparks.nsw.gov.au'),('tas','https://parks.tas.gov.au'),('vic','https://www.parks.vic.gov.au')]:
        for a in BeautifulSoup((E/(key+'.html')).read_text(),'html.parser').select('a[href]'):
            name=a.get_text(' ',strip=True);h=a['href']
            if ('national-park' in h.lower() or 'National-Park' in h) and name and name not in ['Read more','Find out more']:
                official.append((norm(name),urljoin(origin,h)))
    text=BeautifulSoup((E/'sa.html').read_text(),'html.parser')
    for script in text.select('script'):
        t=script.get_text();m=re.search(r'parks:\s*(\{"data".*)',t,re.S)
        if m:
            try:
                obj,_=json.JSONDecoder().raw_decode(m.group(1))
                for a in obj['data']['entries']:official.append((norm(a['title']),a['url']))
            except (ValueError,KeyError):pass
    for r in catalogs['au']:
        hits={url for name,url in official if name==norm(r['name'])}
        if len(hits)==1:r['official_site']=next(iter(hits));r['source_urls'].append(r['official_site'])
    # Historical names map by explicit aliases/exact names; ambiguity stays unresolved.
    authority=BeautifulSoup((E/'authority-au.html').read_text(),'html.parser').get_text('\n',strip=True).splitlines();start=authority.index('Abercrombie River');end=authority.index('Links');names=authority[start:end]
    aliases=json.loads((E/'authority-aliases.json').read_text());entries=[]
    for name in names:
        target=aliases.get(name,name);matches=[r for r in catalogs['au'] if norm(r['name'])==norm(target) or any(norm(a)==norm(target) for a in r.get('aliases',[]))]
        entries.append(dict(name=name,catalog_slug=matches[0]['slug'] if len(matches)==1 else None,status='mapped_alias' if len(matches)==1 and name in aliases else 'mapped_exact_name' if len(matches)==1 else 'ambiguous' if matches else 'unresolved_historical_identity',candidate_slugs=[r['slug'] for r in matches]))
    dump('authority-audit.json',dict(checked_at='2026-11-19',australia=dict(historical_country_path='/au/au.htm',archive_url='https://web.archive.org/web/19990221223249id_/http://world-national-parks.net:80/au/au.htm',entries=entries,park_links_in_capture=0,note='Park names are plain text, not individual links. No park URL invented.'),new_zealand=dict(historical_country_path='/ne/ne.htm',path_evidence='retained authority-index.html',capture_status='archived origin 404 File Not Found',park_names_recovered=False),redirects_changed=False))
    dump('territories-supplement.json',supplement);dump('exclusions.json',excluded)
    manifest=[]
    (ROOT/'batches').mkdir(exist_ok=True)
    for cc,rows in catalogs.items():
        rows.sort(key=lambda r:(r['wave'],r['region'] or '',r['name']))
        seen=set()
        for r in rows:
            if r['slug'] in seen:r['slug']+='-'+cc
            seen.add(r['slug'])
        dump(cc+'-catalog.json',rows)
        for i in range(0,len(rows),25):
            filename=f'batches/{cc}-input-part{i//25+1:02d}.json';chunk=rows[i:i+25];dump(filename,chunk);manifest.append(dict(country=cc,file=filename,count=len(chunk),slugs=[r['slug'] for r in chunk]))
    dump('batch-manifest.json',manifest)
    dump('coverage.json',dict(checked_at='2026-11-19',scope='National parks from CAPAD 2024, NZ parks/Great Walks and retained named nature discoveries; not every reserve or attraction.',inventories=inventories,countries={cc:dict(total=len(rows),national_park_candidates=sum(r['kind']=='national_park' for r in rows),missing_coordinates=sum(r['lat'] is None for r in rows),missing_regions=sum(r['region'] is None for r in rows)) for cc,rows in catalogs.items()}))
    print({cc:len(rows) for cc,rows in catalogs.items()})

if __name__=='__main__':main()