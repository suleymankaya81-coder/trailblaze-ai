import json,re,collections,requests,unicodedata,time
d=json.load(open('wd.json'))
NAT={'national park'}
PARK={'regional park','nature park','natural park','biosphere reserve','UNESCO-MAB Biosphere Reserve','geopark','UNESCO Global Geopark','marine protected area','protected landscape area','natural monument of Spain','natural monument'}
items={}
for cc,rows in d.items():
  for r in rows:
    qid=r['i']['value'].rsplit('/',1)[1]; t=r['tl']['value']; en='en' in r; n=int(r['n']['value']); lab=r['l']['value']
    it=items.setdefault(qid,{'qid':qid,'cc':cc,'name':lab,'types':set(),'en':en,'n':n,'coord':r['coord']['value']})
    it['types'].add(t)
sel=[]
for it in items.values():
  T=it['types']
  if T&NAT: it['kind']='national_park';it['wave']=1
  elif T&{'regional park','nature park','natural park'} or (('protected area' in T) and re.search(r'\b(park|parco|parque)\b',it['name'],re.I)): it['kind']='nature_park';it['wave']=2
  elif not it['en']: continue
  elif T&{'biosphere reserve','UNESCO-MAB Biosphere Reserve'}: it['kind']='biosphere_reserve';it['wave']=2
  elif T&{'geopark','UNESCO Global Geopark'}: it['kind']='geopark';it['wave']=2
  elif T&{'marine protected area'}: it['kind']='marine_park';it['wave']=2
  elif T&{'natural monument of Spain','natural monument','protected landscape area'} and it['n']>=5: it['kind']='natural_monument';it['wave']=3
  else: continue
  if re.search(r'urban|city park|villa |garden|giardino|jard[ií]n|botanic',it['name'],re.I): continue
  sel.append(it)
print(len(sel),collections.Counter((x['cc'],x['kind']) for x in sel))
json.dump([{**x,'types':sorted(x['types'])} for x in sel],open('sel.json','w'))
