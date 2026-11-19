"""Ensure every officially designated national park per country is in the catalog (authority check)."""
import json, re, requests, sys
from pathlib import Path
from build_catalogs import slug, UA
ROOT=Path(__file__).parent
TITLE_ALIASES = {'Skadar Lake National Park': 'Lake Skadar'}
NP={
'ee':['Lahemaa National Park','Soomaa National Park','Vilsandi National Park','Matsalu National Park','Karula National Park','Alutaguse National Park'],
'me':['Durmitor National Park','Lovćen National Park','Biogradska Gora National Park','Skadar Lake National Park','Prokletije National Park (Montenegro)'],
'hr':['Plitvice Lakes National Park','Krka National Park','Paklenica National Park','Risnjak National Park','Mljet National Park','Kornati National Park','Brijuni National Park','Northern Velebit National Park'],
'si':['Triglav National Park'],
'cz':['Krkonoše National Park','Šumava National Park','Podyjí National Park','Bohemian Switzerland National Park','Křivoklátsko Protected Landscape Area'],
'bg':['Pirin National Park','Rila National Park','Central Balkan National Park'],
'cy':['Troodos Mountains','Akamas','Cape Greco'],
'mt':['Majjistral Nature and History Park','Għadira Nature Reserve','Dingli Cliffs','Blue Grotto (Malta)','Comino'],
'lu':['Upper Sûre Natural Park','Our Natural Park','Mullerthal'],
'lv':['Gauja National Park','Ķemeri National Park','Slītere National Park','Rāzna National Park'],
'lt':['Aukštaitija National Park','Curonian Spit National Park','Dzūkija National Park','Žemaitija National Park','Trakai Historical National Park'],
'pl':['Białowieża National Park','Tatra National Park','Bieszczady National Park','Karkonosze National Park','Słowiński National Park','Pieniny National Park','Biebrza National Park','Wolin National Park','Table Mountains National Park','Ojców National Park'],
'sk':['Tatra National Park, Slovakia','Slovak Paradise National Park','Low Tatras National Park','Pieniny National Park (Slovakia)','Malá Fatra National Park','Veľká Fatra National Park','Muránska planina National Park','Poloniny National Park','Slovak Karst National Park'],
'hu':['Hortobágy National Park','Aggtelek National Park','Bükk National Park','Kiskunság National Park','Balaton Uplands National Park','Danube-Ipoly National Park','Fertő-Hanság National Park','Danube-Drava National Park','Körös-Maros National Park','Őrség National Park'],
'rs':['Tara National Park','Kopaonik National Park','Đerdap National Park','Fruška Gora National Park','Šar Mountains National Park'],
'ro':['Retezat National Park','Piatra Craiului National Park','Bucegi Natural Park','Danube Delta','Cheile Bicazului-Hășmaș National Park','Ceahlău Massif','Apuseni Natural Park','Transfăgărășan','Transalpina'],
'al':['Butrint National Park','Llogara National Park','Theth National Park','Valbonë Valley National Park','Dajti National Park','Divjakë-Karavasta National Park'],
'mk':['Mavrovo National Park','Galičica National Park','Pelister National Park','Lake Ohrid','Matka Canyon'],
'ba':['Sutjeska National Park','Una National Park','Kozara National Park','Drina National Park','Kravica (waterfall)'],
}
def resolve(title):
    r=requests.get('https://en.wikipedia.org/w/api.php',params=dict(action='query',titles=TITLE_ALIASES.get(title, title),redirects=1,prop='pageprops|coordinates',format='json'),headers=UA,timeout=30).json()
    p=next(iter(r['query']['pages'].values()))
    if 'missing' in p or re.match(r'^(List of|National parks of|Protected areas of)\b', p['title'], re.I): return None
    c=(p.get('coordinates') or [{}])[0]
    return dict(title=p['title'],wikidata=p.get('pageprops',{}).get('wikibase_item'),lat=c.get('lat'),lng=c.get('lon'))
if __name__=='__main__':
    audit={}
    for cc,names in NP.items():
        f=ROOT/f'{cc}-catalog.json'; cat=json.loads(f.read_text()) if f.exists() else []
        ids={r['wikidata'] for r in cat}; added=[];missing=[]
        for n in names:
            x=resolve(n)
            if not x: missing.append(n); continue
            if x['wikidata'] in ids:
                for r in cat:
                    if r['wikidata']==x['wikidata'] and 'national park' in n.lower(): r.update(kind='national_park',wave=1)
                continue
            k='national_park' if 'National Park' in n else 'natural_attraction'
            s=slug(x['title']); s=s if s not in {r['slug'] for r in cat} else s+'-'+cc
            cat.append(dict(slug=s,name=x['title'],country=cc,kind=k,wave=1 if k=='national_park' else 3,wikidata=x['wikidata'],
              enwiki='https://en.wikipedia.org/wiki/'+x['title'].replace(' ','_'),lat=x['lat'],lng=x['lng'],official_site=None,region=None,
              source='authority_list',source_urls=['https://en.wikipedia.org/wiki/'+x['title'].replace(' ','_')],access='unknown',
              access_note='Access and seasonal restrictions require source verification; no road access implied.'))
            ids.add(x['wikidata']); added.append(x['title'])
        cat.sort(key=lambda r:(r['wave'],r['name'])); f.write_text(json.dumps(cat,ensure_ascii=False,indent=1))
        audit[cc]=dict(checked=len(names),added=added,unresolved=missing); print(cc,len(added),'added',missing,flush=True)
    (ROOT/'authority-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=1))
