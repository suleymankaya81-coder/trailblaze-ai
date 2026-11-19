"""One cached Wikipedia identity request per 40 article titles; no AI or DB writes."""
import json
import time
from pathlib import Path
from urllib.parse import unquote, quote
import requests
from build_catalogs import base, ROOT, E

# Named landscape/route discovery seeds, accepted only when an actual article exists.
SEEDS = {
 'au': {
 'victoria': ['Great Ocean Road','Twelve Apostles (Victoria)','Great Alpine Road','Phillip Island','Mornington Peninsula','Yarra Valley','Dandenong Ranges','Gippsland Lakes','Great Ocean Walk'],
 'new-south-wales': ['Blue Mountains (New South Wales)','Lord Howe Island','Grand Pacific Drive','Three Sisters (Australia)','Jenolan Caves','Snowy Mountains','Cape Byron','Jervis Bay'],
 'queensland': ['Great Barrier Reef','K\u0027gari','Whitsunday Islands','Atherton Tableland','Daintree Rainforest','Cape York Peninsula','Scenic Rim','Boodjamulla National Park'],
 'western-australia': ['Ningaloo Coast','Shark Bay','Rottnest Island','Margaret River (wine region)','Horizontal Falls','Lake Hillier','Wave Rock','Gibb River Road','The Pinnacles (Western Australia)','Bungle Bungle Range','Cape to Cape Track'],
 'south-australia': ['Kangaroo Island','Flinders Ranges','Limestone Coast','Lake Eyre','Wilpena Pound','Nullarbor Plain','Fleurieu Peninsula'],
 'northern-territory': ['Uluru','Kata Tjuta','Kings Canyon (Northern Territory)','Simpsons Gap','Larapinta Trail','MacDonnell Ranges'],
 'tasmania': ['Cradle Mountain','Lake St Clair (Tasmania)','Bay of Fires','Wineglass Bay','Bruny Island','Overland Track','Three Capes Track','Tarkine','Tasman Peninsula','Gordon River'],
 },
 'nz': {
 'northland': ['Cape Reinga','Bay of Islands','Ninety Mile Beach, New Zealand','Waipoua Forest','Poor Knights Islands','Hokianga'],
 'auckland': ['Wait\u0101kere Ranges','Hunua Ranges','Rangitoto Island','Waiheke Island','Great Barrier Island','Tiritiri Matangi Island','Piha'],
 'waikato': ['Coromandel Peninsula','Cathedral Cove','Hot Water Beach','Waitomo Caves','Bridal Veil Falls (Waikato)','Lake Taup\u014d','Huka Falls'],
 'bay-of-plenty': ['Mount Maunganui','Waiotapu','Waimangu Volcanic Rift Valley','Whakarewarewa','Tarawera Falls'],
 'gisborne': ['East Cape','Rere Falls'],
 'hawkes-bay': ['Cape Kidnappers','Lake Waikaremoana'],
 'taranaki': ['Mount Taranaki','Pouakai Range'],
 'wellington': ['Cape Palliser','Kapiti Island','Putangirua Pinnacles'],
 'tasman': ['Farewell Spit','Wharariki Beach','Te Waikoropup\u016b Springs','Golden Bay / Mohua','T\u014dtaranui'],
 'marlborough': ['Marlborough Sounds','Queen Charlotte Track','Pelorus Sound','Pelorus Bridge'],
 'canterbury': ['Kaik\u014dura Peninsula','Lake Tekapo','Lake Pukaki','Tasman Glacier','Hooker Valley Track','Banks Peninsula','Lake \u014chau','Lewis Pass'],
 'west-coast': ['Franz Josef Glacier','Fox Glacier','Lake Matheson','Punakaiki','Hokitika Gorge','Haast Pass'],
 'otago': ['Lake W\u0101naka','Lake H\u0101wea','Lake Wakatipu','Nugget Point','Moeraki Boulders','Rob Roy Glacier','Otago Peninsula'],
 'southland': ['Milford Sound','Doubtful Sound','Lake Te Anau','Lake Manapouri','Catlins','Stewart Island / Rakiura','Curio Bay','Southern Scenic Route'],
 }
}

def main():
    cache=E/'wiki-identities.json'
    identities=json.loads(cache.read_text())
    titles=set()
    for cc in ['au','nz']:
        for r in json.loads((ROOT/f'{cc}-catalog.json').read_text()):
            if r.get('enwiki'): titles.add(unquote(r['enwiki'].rsplit('/',1)[1]).replace('_',' '))
    for regions in SEEDS.values():
        for names in regions.values():titles.update(names)
    todo=sorted(t for t in titles if quote(t.replace(' ','_'),safe="()/,:\u0027") not in identities)
    failures=[]
    for i in range(0,len(todo),40):
        chunk=todo[i:i+40]
        try:
            r=requests.get('https://en.wikipedia.org/w/api.php',params={'action':'query','titles':'|'.join(chunk),'prop':'pageprops|coordinates','redirects':1,'format':'json','colimit':'max'},headers={'User-Agent':'WildParkRoutes-catalog/1.0 (info@minialife.com)'},timeout=45)
            r.raise_for_status(); j=r.json()['query'];pages={p['title']:p for p in j['pages'].values()};redirects={x['from']:x['to'] for x in j.get('redirects',[])};normalized={x['from']:x['to'] for x in j.get('normalized',[])}
            for title in chunk:
                t=normalized.get(title,title);t=redirects.get(t,t);p=pages.get(t,{})
                key=quote(title.replace(' ','_'),safe="()/,:\u0027");coords=p.get('coordinates',[{}])[0]
                identities[key]=dict(title=t,exists='missing' not in p and bool(p),wikidata=p.get('pageprops',{}).get('wikibase_item'),lat=coords.get('lat'),lng=coords.get('lon'))
            cache.write_text(json.dumps(identities,ensure_ascii=False,indent=2)+'\n')
            print(i+len(chunk),'/',len(todo),flush=True)
        except (requests.RequestException,ValueError,KeyError) as e:failures.append(dict(titles=chunk,error=type(e).__name__))
        time.sleep(.2)
    additions=[]
    for cc,regions in SEEDS.items():
        for region,names in regions.items():
            for name in names:
                key=quote(name.replace(' ','_'),safe="()/,:\u0027");x=identities.get(key,{})
                if not x.get('exists'):continue
                url='https://en.wikipedia.org/wiki/'+key
                kind='scenic_route' if any(w in name for w in ['Road','Drive','Route']) else 'walking_route' if any(w in name for w in ['Track','Trail','Walk']) else 'natural_attraction'
                r=base(cc,name,kind,region,[url]);r.update(enwiki=url,wikidata=x.get('wikidata'),lat=x.get('lat'),lng=x.get('lng'),coordinate_source=url if x.get('lat') is not None else None,identity_status='existing_article_discovery_candidate',region_note='Curated discovery region, not verified boundary coverage.')
                if any(w in name for w in ['Island','Sound','Reef']):r['access_note']='Island/marine destination: boat/ferry/flight access, vehicle carriage and suitable visitor gateways require exact-place verification; no mainland drive assumed.'
                additions.append(r)
    (E/'discovery-additions.json').write_text(json.dumps(additions,ensure_ascii=False,indent=2)+'\n')
    (E/'identity-fetch-report.json').write_text(json.dumps(dict(failures=failures,discovery_seed_count=sum(len(n) for r in SEEDS.values() for n in r.values()),accepted=len(additions)),indent=2)+'\n')

if __name__=='__main__':main()