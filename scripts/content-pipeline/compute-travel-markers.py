import requests,json,subprocess,os,math,time
from travel_review_rules import reviewed_markers
rows=json.loads(subprocess.check_output(['psql','-Atc',"select json_agg(t) from (select slug,lat,lng,travel_plan from destinations)t"],text=True))
manual={'yellowstone':[{'name':'Old Faithful','lng':-110.828219,'lat':44.460364,'sourceUrl':'https://home.nps.gov/yell/planyourvisit/utms.htm'},{'name':'Artist Point','lng':-110.478939,'lat':44.720909,'sourceUrl':'https://www.nps.gov/planyourvisit/event-details.htm?id=4EBCB13A-C82E-D799-7796E587D8FF5A9C'}], 'acadia':[{'name':'Bass Harbor Head Lighthouse','lng':-68.337278,'lat':44.221806,'sourceUrl':'https://en.wikipedia.org/wiki/Bass_Harbor_Head_Light'}], 'adirondacks':[{'name':'Lake Placid village','lng':-73.98528,'lat':44.28556,'sourceUrl':'https://en.wikipedia.org/wiki/Lake_Placid,_New_York'},{'name':'Whiteface Mountain','lng':-73.90278,'lat':44.36583,'sourceUrl':'https://en.wikipedia.org/wiki/Whiteface_Mountain'}]}
names=list(dict.fromkeys(s['name'] for r in rows for d in r['travel_plan']['days'] for s in d['stops']))
found={}
for start in range(0,len(names),40):
 batch=names[start:start+40]
 resp=requests.get('https://en.wikipedia.org/w/api.php',params={'action':'query','format':'json','formatversion':2,'titles':'|'.join(batch),'prop':'coordinates','redirects':1},headers={'User-Agent':'MiniaLife/1.0 (https://minialife.com)'},timeout=40)
 resp.raise_for_status();j=resp.json().get('query',{}); pages={p['title']:p for p in j.get('pages',[])}; aliases={p['from']:p['to'] for p in j.get('normalized',[])+j.get('redirects',[])}
 for name in batch:
  title=name
  for _ in range(4):title=aliases.get(title,title)
  p=pages.get(title,{})
  c=(p.get('coordinates') or [None])[0]
  if c:found[name]={'name':name,'lat':c['lat'],'lng':c['lon'],'sourceUrl':'https://en.wikipedia.org/wiki/'+requests.utils.quote(title.replace(' ','_'))}
 time.sleep(.2)
key=os.environ['SUPABASE_SERVICE_ROLE_KEY'];total=0
for r in rows:
 candidates=[found[s['name']] for d in r['travel_plan']['days'] for s in d['stops'] if s['name'] in found]
 pts=[]
 for p in candidates:
  if r['lat'] is not None and r['lng'] is not None and abs(p['lat']-r['lat'])<3 and abs(p['lng']-r['lng'])<5 and p not in pts:pts.append(p)
 r['travel_plan']['markers']=reviewed_markers(r['slug'],manual.get(r['slug'],pts[:4]));total+=len(r['travel_plan']['markers'])
 resp=requests.patch(os.environ['SUPABASE_URL']+'/rest/v1/destinations',params={'slug':'eq.'+r['slug']},headers={'apikey':key,'Authorization':'Bearer '+key},json={'travel_plan':r['travel_plan']});resp.raise_for_status()
print('Source-matched markers after review exclusions',total,'destinations',sum(bool(r['travel_plan']['markers']) for r in rows))
