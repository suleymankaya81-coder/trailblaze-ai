import json,re,unicodedata,collections
sel=json.load(open('sel.json'));reg=json.load(open('reg.json'));g=json.load(open('geo.json'))
def slug(s): return re.sub(r'-+','-',re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())).strip('-')
PT={'Viana do Castelo':'norte','Braga':'norte','Vila Real':'norte','Bragança':'norte','Porto':'norte','Guarda':'centro','Castelo Branco':'centro','Leiria':'centro','Coimbra':'centro','Lisbon':'lisbon','Setúbal':'alentejo','Portalegre':'alentejo','Beja':'alentejo','Évora':'alentejo','Faro':'algarve','Azores':'azores','PT-30':'madeira','Madeira':'madeira'}
PTQ={'Q1548840':'alentejo','Q2448665':'azores','Q7058679':'norte','Q3049849':'lisbon','Q10343656':'lisbon'}
GRN={'Peloponnese, Western Greece and the Ionian':None,'Thessaly and Central Greece':None}
GRQ={'Q921082':'ionian-islands','Q3043336':'thessaly','Q7256056':'crete','Q12876760':'central-macedonia','Q6063067':'central-greece','Q12876743':'eastern-macedonia-and-thrace','Q12876748':'western-macedonia','Q21283530':'west-greece','Q26710914':'central-macedonia','Q26799672':'epirus','Q24953275':'eastern-macedonia-and-thrace','Q112032100':'crete','Q112032638':'west-greece'}
ITQ={'Q2860781':'calabria'}
EXCLUDE={'Q1537757':'offshore cetacean sanctuary; no visitor access point'}
FIX={'castilla-la-mancha':'castile-la-mancha','castillala-mancha':'castile-la-mancha'}
def rslug(r):
  s=slug(re.sub(r'\b(Region of|Region|Community of|Autonomous Community of)\b','',r).strip()); return FIX.get(s,s)
out=[];excluded=[]
for x in sel:
  q=x['qid']
  if q in EXCLUDE: excluded.append({'qid':q,'name':x['name'],'reason':EXCLUDE[q]});continue
  rs=reg.get(q,{}).get('regions') or []
  if x['cc']=='pt':
    regs=[PTQ.get(q) or PT.get(g.get(q)) or PT.get(rs[0] if rs else '')]
    if rs and rs[0] in ('Azores','Madeira','Autonomous Region of the Azores'): regs=['azores' if 'Azores' in rs[0] else 'madeira']
  elif x['cc']=='gr' and q in GRQ: regs=[GRQ[q]]
  elif x['cc']=='it' and q in ITQ: regs=[ITQ[q]]
  else: regs=[rslug(r) for r in (rs or [g.get(q)]) if r]
  lng,lat=map(float,re.findall(r'[-\d.]+',x['coord'])[:2])
  out.append({'slug':slug(x['name']),'name':x['name'],'region':regs[0],'also_regions':regs[1:],'country':x['cc'],'kind':x['kind'],'wave':x['wave'],
   'wikidata':q,'enwiki':x['en'],'lat':round(lat,5),'lng':round(lng,5),'official_site':reg.get(q,{}).get('off'),'access':'road','source':'wikidata'})
# curated iconic sights & scenic drives (wave 3); coordinates and identity are collected by the pipeline
CUR={'it':[('The Dolomites','trentino-south-tyrol','mountain_valley'),('Great Dolomite Road','trentino-south-tyrol','scenic_drive'),('Tre Cime di Lavaredo','veneto','mountain_valley'),('Seceda and Val Gardena','trentino-south-tyrol','mountain_valley'),('Lago di Braies','trentino-south-tyrol','lake'),('Stelvio Pass','lombardy','scenic_drive'),('Amalfi Coast','campania','scenic_drive'),('Capri and the Blue Grotto','campania','island_coast'),('Lake Como','lombardy','lake'),('Lake Garda','lombardy','lake'),('Lake Maggiore','piedmont','lake'),('Val d\'Orcia','tuscany','scenic_drive'),('Chianti','tuscany','scenic_drive'),('Mount Etna','sicily','mountain_valley'),('Aeolian Islands','sicily','island_coast'),('Costa Smeralda','sardinia','island_coast'),('Gorropu Gorge','sardinia','mountain_valley'),('Mont Blanc (Courmayeur)','aosta-valley','mountain_valley'),('Marmore Falls','umbria','waterfall_cave_formation'),('Frasassi Caves','marche','waterfall_cave_formation'),('Grotta Giusti and Tuscan hot springs Saturnia','tuscany','waterfall_cave_formation'),('Lake Bled','','skip')],
'es':[('Caminito del Rey','andalusia','mountain_valley'),('Costa Brava','catalonia','scenic_drive'),('Serra de Tramuntana','balearic-islands','scenic_drive'),('Cap de Formentor','balearic-islands','scenic_drive'),('Las Médulas','castile-and-leon','mountain_valley'),('Río Tinto','andalusia','mountain_valley'),('Enchanted City of Cuenca','castile-la-mancha','mountain_valley'),('Cares Route','asturias','mountain_valley'),('Playa de las Catedrales','galicia','island_coast'),('Roque Nublo','canary-islands','mountain_valley'),('Lakes of Covadonga','asturias','lake'),('Ronda and the Tajo Gorge','andalusia','mountain_valley'),('Cíes Islands','galicia','island_coast')],
'pt':[('N2 Road','centro','scenic_drive'),('Douro Valley','norte','scenic_drive'),('Benagil Cave and Algarve Coast','algarve','island_coast'),('Sete Cidades','azores','lake'),('Nazaré Canyon Coast','centro','island_coast'),('Laurisilva of Madeira','madeira','forest'),('Madeira Levada Walks','madeira','mountain_valley'),('Fajãs of São Jorge','azores','island_coast'),('Berlengas','centro','island_coast')],
'gr':[('Meteora','thessaly','mountain_valley'),('Navagio Beach','ionian-islands','island_coast'),('Santorini Caldera','south-aegean','island_coast'),('Vikos Gorge and Zagori','epirus','mountain_valley'),('Balos Lagoon','crete','island_coast'),('Elafonisi','crete','island_coast'),('Myrtos Beach','ionian-islands','island_coast'),('Melissani Cave','ionian-islands','waterfall_cave_formation'),('Mani Peninsula','peloponnese','scenic_drive'),('Sarakiniko and Milos coast','south-aegean','island_coast'),('Lake Plastiras','thessaly','lake'),('Diros Caves','peloponnese','waterfall_cave_formation'),('Voidokilia Beach','peloponnese','island_coast'),('Mount Olympus','central-macedonia','skip')]}
names=' '.join(o['name'].lower() for o in out)
dup=[]
for cc,L in CUR.items():
  for n,r,k in L:
    if k=='skip': continue
    key=slug(n).split('-')[0] if len(slug(n).split('-')[0])>5 else slug(n)
    hit=[o['name'] for o in out if o['country']==cc and slug(n).replace('-and-','-')[:12] in o['slug']]
    if hit: dup.append((n,hit));continue
    out.append({'slug':slug(n),'name':n,'region':r,'also_regions':[],'country':cc,'kind':k,'wave':3,'wikidata':None,'enwiki':True,'lat':None,'lng':None,'official_site':None,'access':'road','source':'curated'})
# fixes: island/boat access
for o in out:
  if re.search(r'marine|island|islands|archipelag|berlengas|cíes|alonnisos|zakynthos|navagio|capri|aeolian',o['name'],re.I) and o['kind']!='scenic_drive': o['access']='boat_or_island'
DROPN={'Mount Olympus':'duplicate of Olympos National Park','Missolonghi–Aitoliko Lagoons':'duplicate of National Park of Messolonghi - Aitoliko lagoons','Pindus National Park':'merged into North Pindos National Park','Cíes Islands':'part of Atlantic Islands of Galicia National Park','Vikos Gorge and Zagori':'covered by Vikos–Aoös National Park'}
for o in [o for o in out if o['name'] in DROPN]: out.remove(o); excluded.append({'qid':o['wikidata'],'name':o['name'],'reason':DROPN[o['name']]})
for o in out:
  if o['name']=='Skiritida forest': o['kind']='forest'
# dedupe slugs
c=collections.Counter(o['slug'] for o in out)
for o in out:
  if c[o['slug']]>1: o["slug"]=f"{o['slug']}-{o['region']}"
c=collections.Counter(o['slug'] for o in out); assert max(c.values())==1,[k for k,v in c.items() if v>1]
out.sort(key=lambda o:(o['country'],o['wave'],o['region'] or '',o['name']))
AUTH={'it':'/eu/it/it.htm','es':'/eu/sp/sp.htm','pt':'/eu/pr/pr.htm','gr':'/eu/gr/gr.htm'}
json.dump(out,open('/dev-server/scripts/content-pipeline/south-europe/catalog.json','w'),ensure_ascii=False,indent=1)
json.dump({'authority_country_pages':AUTH,'note':'world-national-parks.net only linked a country index for these four countries; Wayback CDX shows those pages returned 404 from 2000-2011 and no park-level pages exist. /eu/es is Estonia, not Spain.','excluded':excluded,'curated_skipped_as_duplicates':dup},open('/dev-server/scripts/content-pipeline/south-europe/sources.json','w'),ensure_ascii=False,indent=1)
print(len(out),collections.Counter(o['country'] for o in out),collections.Counter(o['kind'] for o in out))
print('missing region',[o['name'] for o in out if not o['region']]);print('dups',dup)
