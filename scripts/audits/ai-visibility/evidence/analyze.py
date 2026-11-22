import json,re,html,sys
from html.parser import HTMLParser
class P(HTMLParser):
  def __init__(s):
    super().__init__(convert_charrefs=True); s.stack=[]; s.ld=[]; s.cur=None; s.links=[]; s.metas=[]; s.lang=None
    s.main_depth=None; s.main=[]; s.body=[]; s.skip=0; s.h1=[]; s.inh1=False; s.footer=None; s.foot_links=[]; s.title=''; s.intitle=False; s.times=[]
  def handle_starttag(s,t,a):
    a=dict(a)
    if t=='html': s.lang=a.get('lang')
    if t=='script':
      s.skip+=1
      if a.get('type')=='application/ld+json': s.cur=[]
    if t=='style': s.skip+=1
    if t=='link': s.links.append(a)
    if t=='meta': s.metas.append(a)
    if t=='time': s.times.append(a)
    if t=='title': s.intitle=True
    if t=='main' and s.main_depth is None: s.main_depth=len(s.stack)
    if t=='h1': s.inh1=True
    if t=='footer': s.footer=len(s.stack)
    if t=='a' and s.footer is not None: s.foot_links.append(a.get('href'))
    if t not in('meta','link','img','br','input','hr','source'): s.stack.append(t)
  def handle_endtag(s,t):
    if t in('script','style'): s.skip-=1
    if t=='script' and s.cur is not None: s.ld.append(''.join(s.cur)); s.cur=None
    if t=='title': s.intitle=False
    if t=='h1': s.inh1=False
    while s.stack:
      x=s.stack.pop()
      if x==t: break
    if t=='main' and s.main_depth is not None and len(s.stack)==s.main_depth: s.main_depth=-1
    if t=='footer' and s.footer is not None and len(s.stack)<=s.footer: s.footer=None
  def handle_data(s,d):
    if s.cur is not None: s.cur.append(d); return
    if s.skip: return
    if s.intitle: s.title+=d
    if s.inh1: s.h1.append(d)
    s.body.append(d)
    if s.main_depth is not None and s.main_depth>=0: s.main.append(d)
def norm(x): return re.sub(r'\s+',' ',' '.join(x)).strip()
def types(o,out):
  if isinstance(o,dict):
    t=o.get('@type')
    if t: out.append(t if isinstance(t,str) else '/'.join(t))
    for v in o.values(): types(v,out)
  elif isinstance(o,list):
    for v in o: types(v,out)
  return out
def nodes(o):
  if isinstance(o,dict):
    yield o
    for v in o.values(): yield from nodes(v)
  elif isinstance(o,list):
    for v in o: yield from nodes(v)
REQ={'Organization':['name','url','logo','sameAs'],'Article':['headline','image','datePublished','dateModified','author'],
 'BreadcrumbList':['itemListElement'],'FAQPage':['mainEntity'],'WebPage':['name','dateModified'],
 'TouristDestination':['name','geo|address','image'],'TouristAttraction':['name','geo|address','image'],'Place':['name','geo|address'],'TouristTrip':['name','itinerary'],'ItemList':['itemListElement']}
def check(n):
  t=n.get('@type'); t=t if isinstance(t,str) else (t[0] if t else None)
  miss=[k for k in REQ.get(t,[]) if not any(n.get(x) not in (None,'',[]) for x in k.split('|'))]
  if t=='BreadcrumbList':
    for i,e in enumerate(n.get('itemListElement',[])):
      for k in('position','name'):
        if k not in e: miss.append(f'item{i}.{k}')
      if 'item' not in e and i<len(n['itemListElement'])-1: miss.append(f'item{i}.item')
  if t=='FAQPage':
    for q in n.get('mainEntity',[]):
      if not q.get('name') or not (q.get('acceptedAnswer') or {}).get('text'): miss.append('question/answer text')
  return t,miss
res={}
for name in sys.argv[1:]:
  p=P(); p.feed(open(f'pages/{name}.html',encoding='utf-8',errors='replace').read())
  lds=[]; bad=0
  for raw in p.ld:
    try: lds.append(json.loads(raw))
    except Exception: bad+=1
  ty=types(lds,[])
  checks=[check(n) for n in nodes(lds) if n.get('@type')]
  canon=[l.get('href') for l in p.links if l.get('rel')=='canonical']
  hl=[(l.get('hreflang'),l.get('href')) for l in p.links if l.get('rel')=='alternate' and l.get('hreflang')]
  robots=[m.get('content') for m in p.metas if m.get('name')=='robots']
  body=norm(p.body); main=norm(p.main)
  dates=re.findall(r'(?:Last updated|Updated|Reviewed|Aktualisiert|Zuletzt aktualisiert|Mis à jour|Dernière mise à jour)[^.|]{0,40}',body,re.I)
  dm=sorted({str(n.get('dateModified')) for n in nodes(lds) if n.get('dateModified')})
  res[name]=dict(title=p.title.strip(),lang=p.lang,h1=norm(p.h1),types=sorted(set(ty)),ld_blocks=len(p.ld),ld_parse_errors=bad,
    problems=sorted({f"{t}: missing {', '.join(m)}" for t,m in checks if m}),canonical=canon,hreflang=hl,robots=robots,
    visible_date=dates[:3],time_tags=p.times[:3],dateModified=dm,main_first400=main[:400],main_len=len(main),body_len=len(body),
    footer_links=sorted({h for h in p.foot_links if h}),has_main=p.main_depth is not None)
json.dump(res,open('analysis.json','w'),ensure_ascii=False,indent=1)
for k,v in res.items(): print(k,v['types'],v['problems'][:6],'| date:',v['visible_date'],v['dateModified'],'| canon',v['canonical'],'| hl',len(v['hreflang']),'| main',v['main_len'])
