"""Offline, source-snapshot catalog assembly; no AI calls or publication."""
import json, re, unicodedata
from pathlib import Path
from urllib.parse import urljoin
from bs4 import BeautifulSoup

ROOT = Path(__file__).parent
E = ROOT / 'evidence'
catalogs = {c: [] for c in ('nl', 'be', 'dk', 'ie')}
inventories = []
def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode().lower()).strip('-')
def add(cc, name, kind, url, region=None, source='official_inventory', aliases=None):
    s = slug(name)
    old = next((r for r in catalogs[cc] if r['slug'] == s), None)
    if old:
        if region and old['region'] != region: old['also_regions'].append(region)
        return old
    row = dict(slug=s, name=name, region=region, also_regions=[], country=cc, kind=kind,
               wave=1 if kind=='national_park' else 2 if kind in ('nature_park','nature_reserve') else 3,
               wikidata=None, enwiki=None, lat=None, lng=None, official_site=url, access='unknown',
               source=source, source_urls=[url], access_note='Access, seasonal restrictions and visitor entry points require source verification; no road access or landing permission is implied.',
               identity_status='named_in_official_directory' if source=='official_inventory' else 'research_candidate',
               coordinate_role='unknown_not_navigation', aliases=aliases or [])
    catalogs[cc].append(row); return row
def inventory(id, cc, url, rows, note=None):
    inventories.append(dict(id=id,country=cc,source_url=url,expected_count=len(rows),entries=[dict(name=r['name'],catalog_slug=r['slug']) for r in rows],note=note))

# Dutch current directory includes transition/new-generation names; do not infer designation solely from its heading.
soup=BeautifulSoup((E/'nl-parks.txt').read_text(),'html.parser');parks=[]
for h in soup.select('h2'):
    if not ('Park' in h.text or 'Grenspark' in h.text) or 'Parken Post' in h.text: continue
    parent=h
    for _ in range(3): parent=parent.parent
    a=parent.select_one('a[href]')
    if a:
        r=add('nl',h.get_text(' ',strip=True),'national_park',urljoin('https://nationaleparken.nl',a['href']))
        if 'Hollandse Duinen' in r['name']: r.update(kind='nature_region',designation_note='Directory-listed new-generation park; formal national designation must be checked before publication.')
        if 'De Peel' in r['name']:r['aliases']=['De Groote Peel'];r['designation_note']='Existing De Groote Peel transitions toward De Peel; never duplicate the names as separate national parks.'
        parks.append(r)
inventory('netherlands-park-directory','nl','https://nationaleparken.nl/nl/de-parken',parks,'22 directory entries are not a claim of 22 legally designated national parks; government describes 21. Hollandse Duinen designation and De Peel transition are explicitly marked.')
merge={'nationaal-park-drents-friese-wold':'Drents-Friese Wold','nationaal-park-dwingelderveld':'Dwingelderveld','nationaal-park-oosterschelde':'Oosterschelde','nationaal-park-schiermonnikoog':'Schiermonnikoog','nationaal-park-veluwezoom':'Veluwezoom','nationaal-park-zuid-kennemerland':'Zuid-Kennemerland','de-wieden':'Weerribben-Wieden','loonse-en-drunense-duinen':'Loonse en Drunense Duinen'}
areas=[];excluded=[]
for item in json.loads((E/'nl-areas.json').read_text()):
    name=item.get('name');tail=item['url'].split('/')[-1]
    if not name or item['status']!=200:
        excluded.append(dict(url=item['url'],reason='Fetch failed; identity is not verified.'));continue
    # Formal park duplicate names merge to one canonical row.
    target=next((p for p in parks if merge.get(tail) and merge[tail] in p['name']),None)
    if target:
        target['source_urls'].append(item['url']);areas.append(target);continue
    if tail in ('arboretum-poort-bulten','buitenplaats-beeckestijn','buitenplaats-de-tempel'):
        excluded.append(dict(url=item['url'],reason='Arboretum or ornamental estate, outside core outdoor destination scope.'));continue
    r=add('nl',name,'nature_region',item['url'],source='official_inventory');r['scope_review']='Named manager area; visitor relevance, scale and access require review before production.';areas.append(r)
inventory('netherlands-natuurmonumenten-main-areas','nl','https://www.natuurmonumenten.nl/natuurgebieden',list({r['slug']:r for r in areas}.values()),'Broad manager-area discovery, not automatic publication; small areas remain scope-review candidates. Forts, generic topics and editorial child URLs excluded.')

flemish=[('Bosland National Park','national_park'),('National Park Forests of Brabant','national_park'),('Boundless Bocageland','nature_park'),('Landscape Park of Haspengouw','nature_park'),('Hoge Kempen National Park','national_park'),('Meuse Valley River Park','nature_park'),('National Park Scheldt Valley','national_park'),('Landscape Park Flemish Ardennes','nature_park'),('Landscape Park the Zwin Region','nature_park')]
fr=[add('be',n,k,'https://www.visitflanders.com/en/nature/flemish-parks','flanders') for n,k in flemish]
inventory('flanders-four-national-five-landscape-parks','be','https://www.visitflanders.com/en/nature/flemish-parks',fr)
wn=[add('be','Entre-Sambre-et-Meuse National Park','national_park','https://www.parc-national-esem.be/','wallonia'),add('be','Semois Valley National Park','national_park','https://semois-parcnational.be/','wallonia')]
inventory('wallonia-national-parks','be','https://wwf.be/fr/actualites/la-decouverte-des-six-parcs-nationaux-en-belgique',wn)
wall=[];seen=set();soup=BeautifulSoup((E/'be-home.html').read_text(),'html.parser')
for a in soup.select('a[href]'):
    url=urljoin('https://parcsnaturelsdewallonie.be',a['href'])
    if '/parcs/parc-naturel-' not in url or url in seen:continue
    seen.add(url);name=url.rstrip('/').split('/')[-1].replace('parc-naturel-','').replace('-',' ').title()
    reviewed=next((x.get('name') for x in json.loads((E/'be-wallonia-parks.json').read_text()) if x['url']==url and x.get('status')==200),None)
    wall.append(add('be',reviewed or 'Parc naturel '+name,'nature_park',url,'wallonia'))
inventory('wallonia-thirteen-nature-parks','be','https://parcsnaturelsdewallonie.be/',wall)
for n in ['High Fens','Hallerbos','Sonian Forest','Meerdaal Forest','Kalmthoutse Heide','Zwin Nature Park','Westhoek Nature Reserve','Hoge Blekker','Bourgoyen-Ossemeersen','Hobokense Polder','Liereman','Averbode Bos en Heide','De Teut','Terhills','Connecterra','Han-sur-Lesse Caves','Lesse Valley','Ninglinspo Valley','Furfooz Nature Park','Fondry des Chiens','Rochehaut','Botassart Giant’s Tomb','Signal de Botrange','Robertville Lake','Eau d’Heure Lakes','Villers-la-Ville Forest','Hertogenwald','Hautes Fagnes Boardwalks','Baraque de Fraiture','Hoge Dijken','Blaasveldbroek','Buitenland Bornem','Sahara Lommel','Valley of the Hoëgne','Ourthe Valley','Semois Valley','Durbuy Rock Landscapes']:
    if n=='Connecterra':continue # same gateway as Terhills
    r=add('be',n,'natural_attraction','https://www.visitflanders.com/en/nature' if n in ['Hallerbos','Sonian Forest','Meerdaal Forest','Kalmthoutse Heide','Zwin Nature Park','Westhoek Nature Reserve','Hoge Blekker','Bourgoyen-Ossemeersen','Hobokense Polder','Liereman','Averbode Bos en Heide','De Teut','Terhills','Hoge Dijken','Blaasveldbroek','Buitenland Bornem','Sahara Lommel'] else 'https://visitwallonia.com/en-gb/3/where-to-go-in-wallonia/nature','flanders' if n in ['Hallerbos','Sonian Forest','Meerdaal Forest','Kalmthoutse Heide','Zwin Nature Park','Westhoek Nature Reserve','Hoge Blekker','Bourgoyen-Ossemeersen','Hobokense Polder','Liereman','Averbode Bos en Heide','De Teut','Terhills','Hoge Dijken','Blaasveldbroek','Buitenland Bornem','Sahara Lommel'] else 'wallonia',source='editorial_discovery')
    r['source_note']='Regional directory is a research starting point, not a fetched exact-place quotation.'
    if n=='Terhills':r['aliases']=['Connecterra']

# Reuse all 64 Danish identities verbatim, rather than restarting discovery.
catalogs['dk']=json.loads((ROOT.parent/'nordic/dk-catalog.json').read_text())
old=json.loads((ROOT.parent/'nordic/coverage.json').read_text())
inventories += [i for i in old['inventories'] if i['country']=='dk']

ip=[]
for name,path,region in [('Burren','burren','clare'),('Connemara','connemara','galway'),('Glenveagh','glenveagh','donegal'),('Killarney','killarney','kerry'),('Wicklow Mountains','wicklow','wicklow'),('Wild Nephin','wild-nephin','mayo'),('Páirc Náisiúnta na Mara, Ciarraí','pairc-naisiunta-na-mara','kerry'),('Brú na Bóinne','bru-na-boinne','meath')]:
    url='https://www.nationalparks.ie/'+path+'/' if path!='bru-na-boinne' else 'https://heritageireland.ie/places-to-visit/bru-na-boinne-visitor-centre-newgrange-and-knowth/'
    r=add('ie',name if 'Páirc' in name or name=='Brú na Bóinne' else name+' National Park','national_park',url,region)
    if name=='Brú na Bóinne':r['scope_note']='Include because the government lists it among eight parks; principally archaeological heritage, not a wilderness park.'
    if name=='Wild Nephin':r['aliases']=['Ballycroy National Park']
    ip.append(r)
inventory('ireland-eight-government-listed-parks','ie','https://www.gov.ie/en/department-of-housing-local-government-and-heritage/consultations/your-parks-your-say-the-future-of-irelands-national-parks/',ip,'Nationalparks.ie directory currently displays seven; government consultation includes Brú na Bóinne as eighth. Preserve distinction.')
reserve=[]
for county in ['clare','cork','donegal','dublin','galway','kerry','kildare','kilkenny','laois','mayo','meath','offaly','sligo','tipperary','westmeath','wexford','wicklow']:
    soup=BeautifulSoup((E/(county+'.html')).read_text(),'html.parser')
    for h in soup.select('h2'):
        name=h.get_text(' ',strip=True)
        if name=='You are here':continue
        r=add('ie',name,'nature_reserve','https://www.npws.ie/nature-reserves/'+county,county);r['scope_review']='Official reserve identity only; small, private and restricted reserves require visitor-suitability review.';reserve.append(r)
inventory('ireland-npws-county-reserves','ie','https://www.npws.ie/nature-reserves',list({r['slug']:r for r in reserve}.values()),'County pages reconciled; Slieve Bloom appears in Laois and Offaly but has one catalog identity. Listing is not permission to enter.')
extras={'donegal':['Slieve League','Malin Head','Fanad Head','Horn Head','Errigal','Glenesh Pass','Inishowen Peninsula','Ards Forest Park'], 'sligo':['Benbulben','Knocknarea','Lough Gill'], 'mayo':['Achill Island','Keem Bay','Croagh Patrick','Downpatrick Head','Doolough Valley','Clew Bay','Great Western Greenway'], 'galway':['Killary Harbour','Diamond Hill','Inishmore','Inishmaan','Inisheer','Derrigimlagh','Twelve Bens','Sky Road'], 'clare':['Cliffs of Moher','Loop Head','Black Head','Burren Coast'], 'kerry':['Ring of Kerry','Dingle Peninsula','Slea Head Drive','Conor Pass','Inch Beach','Gap of Dunloe','Carrauntoohil','Torc Waterfall','Muckross Lake','Derrynane Beach','Valentia Island','Bray Head Valentia','Great Blasket Island'], 'cork':['Beara Peninsula','Healy Pass','Mizen Head','Sheep’s Head Peninsula','Dursey Island','Gougane Barra','Cape Clear Island','Baltimore Beacon','Ballycotton Cliff Walk'], 'waterford':['Copper Coast Geopark','Comeragh Mountains','Coumshingaun Lake','Mahon Falls','Ardmore Cliff Walk'], 'tipperary':['Glen of Aherlow','Galtee Mountains'], 'wicklow':['Sally Gap','Lough Tay','Great Sugar Loaf','Djouce','Lugnaquilla','Wicklow Way'], 'dublin':['Howth Cliff Walk','Dublin Mountains'], 'louth':['Cooley Peninsula','Carlingford Lough'], 'leitrim':['Glencar Waterfall'], 'roscommon':['Lough Key Forest Park'], 'cavan':['Cavan Burren Park'], 'multi-region':['Wild Atlantic Way','Shannon River','Lough Derg','Lough Ree']}
for county,names in extras.items():
    for n in names:
        r=add('ie',n,'scenic_route' if n in ['Wild Atlantic Way','Ring of Kerry','Slea Head Drive','Sky Road','Wicklow Way','Great Western Greenway'] else 'natural_attraction','https://www.discoverireland.ie/',county,source='editorial_discovery');r['source_note']='Tourism directory research candidate; exact-place source still required.'

for cc,rows in catalogs.items():
    for r in rows:r['also_regions']=list(dict.fromkeys(r.get('also_regions',[])))
    if cc!='dk':rows.sort(key=lambda r:(r['wave'],r['slug']))
    (ROOT/(cc+'-catalog.json')).write_text(json.dumps(rows,ensure_ascii=False,indent=2))
(ROOT/'coverage.json').write_text(json.dumps(dict(checked_at='2026-11-18',inventories=inventories),ensure_ascii=False,indent=2))
(ROOT/'exclusions.json').write_text(json.dumps(excluded,ensure_ascii=False,indent=2))
print({c:len(r) for c,r in catalogs.items()})