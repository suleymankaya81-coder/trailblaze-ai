"""Bulk-resolve DACH official websites via Wikipedia pageprops + Wikidata P856 (~12 requests, no AI). Run from project root."""
import json,requests,time
H={'User-Agent':'WildParkRoutes/1.0 (info@minialife.com)'}
c=json.load(open('scripts/content-pipeline/dach/catalog.json'))
pub=set(open('/dev/null').read().split())
out={}
def batch(xs,n=50):
    for i in range(0,len(xs),n): yield xs[i:i+n]
# resolve via en then de wikipedia titles
for lang,key in [('en','name'),('de','authority')]:
    todo=[r for r in c if r['slug'] not in out]
    for b in batch(todo):
        t={r[key]:r for r in b}
        j=requests.get(f'https://{lang}.wikipedia.org/w/api.php',params={'action':'query','titles':'|'.join(t),'redirects':1,'prop':'pageprops','ppprop':'wikibase_item','format':'json'},headers=H,timeout=30).json()
        norm={x['from']:x['to'] for x in j['query'].get('normalized',[])+j['query'].get('redirects',[])}
        pages={p['title']:p.get('pageprops',{}).get('wikibase_item') for p in j['query']['pages'].values()}
        for name,r in t.items():
            n=name
            for _ in range(3): n=norm.get(n,n)
            if pages.get(n): out[r['slug']]=pages[n]
        time.sleep(1)
print(len(out))
ids=list(set(out.values()));site={}
for b in batch(ids):
    j=requests.get('https://www.wikidata.org/w/api.php',params={'action':'wbgetentities','ids':'|'.join(b),'props':'claims','format':'json'},headers=H,timeout=30)
    print(j.status_code)
    for k,e in j.json()['entities'].items():
        u=[x['mainsnak'].get('datavalue',{}).get('value') for x in e.get('claims',{}).get('P856',[])]
        cc=[x['mainsnak'].get('datavalue',{}).get('value',{}).get('id') for x in e.get('claims',{}).get('P17',[])]
        site[k]={'urls':[x for x in u if isinstance(x,str)],'countries':cc}
    time.sleep(2)
res={s:{'qid':q,**site.get(q,{})} for s,q in out.items()}
json.dump(res,open('scripts/content-pipeline/dach/official-sites.json','w'),indent=1)
print(sum(1 for v in res.values() if v.get('urls')))
