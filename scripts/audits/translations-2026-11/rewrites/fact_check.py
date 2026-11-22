#!/usr/bin/env python3
"""Fact check for rewrites/proposals.json (REWRITE items only).

Every number (digits and number words), unit and capitalised proper name in the NEW text must appear,
after folding accents/case and number separators (1,278 = 1.278 = 1 278), in at least one of:
  a) the OLD text of the same field,
  b) English text of the same destination (live preview exports + sample.json),
  c) any scripts/content-pipeline/**/<slug>.json (source packets and caches).
de/fr names may match through ALIAS (translated place names) below; German common nouns are not names.
Usage: python3 fact_check.py [proposals.json]   (exit code 1 when something fails)
"""
import json,os,re,sys,unicodedata,collections
R=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','..'))
A=R+'/audits/translations-2026-11'
p=json.load(open(sys.argv[1] if len(sys.argv)>1 else A+'/rewrites/proposals.json'))
slugs={x['slug'] for x in p}
files=collections.defaultdict(list)
for root,_,fs in os.walk(R+'/content-pipeline'):
  for f in fs:
    if f.endswith('.json') and f[:-5] in slugs: files[f[:-5]].append(os.path.join(root,f))
def strings(o):
  if isinstance(o,str): yield o
  elif isinstance(o,dict):
    for v in o.values(): yield from strings(v)
  elif isinstance(o,list):
    for v in o: yield from strings(v)
C={s:{'en_db':[], 'cache':[]} for s in slugs}
# b) English text of same destination
for x in json.load(open(A+'/preview-2026-11-22-live/needs-human.json')):
  if x['locale']=='en' and x['slug'] in C: C[x['slug']]['en_db'].append(x['current_text'])
for x in json.load(open(A+'/preview-2026-11-22-live/write-list-with-old.json')):
  if x['locale']=='en' and x['slug'] in C: C[x['slug']]['en_db']+= [x['old'],x['new']]
for r in json.load(open(A+'/sample.json'))['rows']:
  if r['slug'] in C: C[r['slug']]['en_db']+=list(strings(r['en']))
for s,fs in files.items():
  for f in fs:
    try: C[s]['cache']+=[(os.path.relpath(f,R),t) for t in strings(json.load(open(f)))]
    except Exception as e: print('bad',f,e)

# Function words / sentence starters (not names), all languages.
STOP=set('''the a an it its this these they in on at of and or with from for to by as is are was around almost together most part sites
der die das den dem des ein eine einer eines einem einen er sie es im in am an auf aus bei mit von vom zu zum zur und oder als ist sind wird wurde wurden dazu hier zwischen nach über unter rund etwa fast mehr insgesamt ganz ziel zwischen
le la les l un une des du de d en au aux et ou il elle ils elles c ce cette ces son sa ses sur dans par pour avec entre près presque on y leurs leur celui rattaché zones ouvertes point situé'''.split())
# German common nouns are capitalised; these are generic nouns, not proper names (de only).
GENERIC_DE=set('''Almwirtschaft Gebirgszugs Gebirgszug Gemeinden Gemeinde Hochebenen Hochebene Provinz Höhlengruppe Oberen Stätte Küstenabschnitten Leuchtturms Leuchtturm
Meeresnationalpark Nebengebäuden Nationalpark Nordseite Norden Regionaler Süden Südrand Gebirge Region Inselland Uferzonen Kap See Wälder Nordwesten Mündungen Sitz
Wasserfläche Orten Ufer Delta Lebensräumen Parks Pflanzen Tierarten Umland Werts Nordwestende Gebiet Hektar Hügel Zentrum Landschaft Meeresschutzgebiet Mittelmeerküste
Festlands Nord Waldgebiets Land Meeresteilen Ebene Fluss Teile Naturpark Naturschutzgebiet Schutzfläche Gebirges Gebirgsschutzgebiet Quadratkilometern Rentiergebiete
Basaltfelsnadeln Geotopen Alpenkrähen Berghänflinge Bienen Blässgänse Dünentälern Geländes Marsch Marschen Niedermooren Pflanzenvielfalt Ragwurz Reservat Schilfflächen
Stendelwurz Trupp Vogelschutzgebiet Wasservogelreservat Weidetiere Landschaften Gewässersysteme Gletschern Kulturerbe Meer Schutzgebiet Osten Insel Inseln Fläche
Quadratkilometer Kilometer Meter Hälfte Besucher Bewohner Sommer Winter Name Herrscher Winde Archipel Berg Berge Gipfel Täler Flüsse Wasserfälle Wälder Felsformationen
Gebieten Ökosystem Ökosysteme Artenvielfalt Erbe Vogel Wanderweg Auftrag Schutzgebiet Meeresnaturpark Küstenflüssen Seen Dorf Dorfes Stadt Grenze Gletscher Lawinen
Prozesse Jahren Hunderttausende Landschaften Besucher Täler Feuchtgebiete Feuchtgebietskomplex Größe Ziel Schutz Projekts Rahmen Raststationen Erlebnis Sinne Wander'''.split())
GENERIC={'de':GENERIC_DE,'en':set(),'fr':set()}
# Translated / localised names -> the spelling that appears in the English text or source.
ALIAS={
 'Norwegen':['Norway'],'Norvège':['Norway'],'Spanien':['Spain'],'Espagne':['Spain'],'Griechenlands':['Greece'],'Grèce':['Greece'],
 'Frankreichs':['France'],'Schwedens':['Sweden'],'Dänemarks':['Denmark'],'Europas':['Europe','European'],'Finnlands':['Finland'],'Finnland':['Finland'],
 'Finlande':['Finland'],'Pologne':['Poland'],'Okzitanien':['Occitanie'],'Murgia':['Murge'],'Murges':['Murge'],'Tarent':['Taranto'],'Tarente':['Taranto'],
 'Apuliens':['Apulia'],'Pouilles':['Apulia','Puglia'],'Mitteljütland':['Central Jutland'],'Nordwestjütland':['Northwest Jutland'],
 'Kantabrischen':['Cantábrica'],'Cantabrique':['Cantábrica'],'Ostmakedonien':['Eastern Macedonia'],'Macédoine':['Macedonia'],'Orientale':['Eastern'],
 'Südisland':['Iceland'],'Navarras':['Navarra'],'Galles':['New South Wales'],'Nouvelle':['New South Wales'],'Sud':['South'],'Pays':['Netherlands'],'Bas':['Netherlands'],
 'Bois':["'s-Hertogenbosch"],'Duc':["'s-Hertogenbosch"],'Hollande':['South Holland'],'Méridionale':['South Holland'],'Achaïe':['Achaia'],'Élide':['Ilia'],
 'République':['Republika Srpska'],'Pinde':['Pindos'],'Nord':['North'],'Agrigente':['Agrigento'],'Palerme':['Palermo'],'CFF':['SBB'],'Jura':['Schwäbische Alb'],
 'Äolischen':['Aeolian'],'Äolier':['Aeolians'],'Aiolos':['Aeolus'],'Éole':['Aeolus'],'Éoliennes':['Aeolian'],'Éoliens':['Aeolians'],'Sizilien':['Sicily'],'Sicile':['Sicily'],
 'Liparische':['Lipari'],'Tyrrhenischen':['Tyrrhenian'],'Tyrrhénienne':['Tyrrhenian'],'Albaniens':['Albania'],'Albanischen':['Albanian'],'Dinariden':['Dinarides'],
}
WORDNUM={}
for i,ws in enumerate(['one|first|ein|eine|erste|un|une|premier|premiere','two|second|zwei|zweite|deux|deuxieme','three|third|drei|dritte|trois|troisieme',
 'four|fourth|vier|vierte|quatre|quatrieme','five|fifth|funf|funfte|cinq|cinquieme','six|sixth|sechs|sechste|sixieme','seven|seventh|sieben|siebte|sept|septieme',
 'eight|eighth|acht|achte|huit|huitieme','nine|ninth|neun|neunte|neuf|neuvieme','ten|tenth|zehn|zehnte|dix|dixieme','eleven|elf|onze','twelve|zwolf|douze',
 'fifteen|funfzehn|quinze','seventeen|seventeenth|siebzehn|siebzehnte|dix-sept|dix-septieme','eighteen|achtzehn|dix-huit'],1):
  n={11:11,12:12,13:15,14:17,15:18}.get(i,i)
  for w in ws.split('|'): WORDNUM[w]=str(n)
# 'one', 'un', 'eine', 'premier' are too common as articles/pronouns to count as facts
for w in ['one','ein','eine','un','une','first','erste','premier','premiere']: WORDNUM.pop(w,None)
GENERIC_DE.update('Reiseziel Landes Prägend Hinterland Hügelland Orte Steilküste Südosten'.split())
ALIAS.update({'Pyrenäen':['Pyrenees','Pyrénées'],'Karpatenvorland':['Subcarpathian']})
GENERIC_DE.update(['Teil','Teilen'])

def fold(s): return ''.join(c for c in unicodedata.normalize('NFKD',s) if not unicodedata.combining(c)).lower()
NUM=re.compile(r'(?<![A-Za-z²])\d(?:[\d]|[.,   ](?=\d{3}\b)|[.,](?=\d))*')
def nums(s):
  out=set(re.sub(r'\D','',m.group()) for m in NUM.finditer(s))
  f=fold(s)
  for w,d in WORDNUM.items():
    if re.search(r'(?<![a-z])'+w+r'(?![a-z])',f): out.add(d)
  return out
UNITS=[('KM2',r'km2|km²|square[- ]kilomet|quadratkilomet|kilometres? carres|kilometre carre'),('HA',r'\bha\b|hectare|hektar'),
 ('PCT',r'%|per ?cent|prozent|pour cent'),('KM',r'\bkm\b(?![2²])|kilomet(?:re|er)s?\b(?! carr)'),('M',r'\b\d[\d.,  ]*\s?m\b|\bmet(?:re|er)s?\b|\bmètres?\b')]
def units(s):
  f=fold(s); return {u for u,rx in UNITS if re.search(rx,f)}
NAME=re.compile(r"[A-ZÀ-ÖØ-ÞŁŚŻŹĆŃÆØÅ][\w'’\-]*")
LANG='en'
def names(s):
  out=set()
  for m in NAME.finditer(s):
    t=m.group().strip("'’-")
    for part in re.split(r"[-’']",t):
      if len(part)<2 or not part[0].isupper(): continue
      if part.lower() in STOP or part in GENERIC[LANG]: continue
      out.add(part)
  return out
def lookup(x):
  srcs=[('old',x['old'])]+[('en',t) for t in C[x['slug']]['en_db']]+[(f,t) for f,t in C[x['slug']]['cache']]
  return srcs
res=[];fails=collections.Counter();passes=collections.Counter()
for x in p:
  v=x['new_or_CLEAR_or_WRONG_PLACE']
  if v in('CLEAR','WRONG_PLACE'): continue
  srcs=lookup(x); LANG=x['locale']
  allt=' \n '.join(t for _,t in srcs); fa=fold(allt)
  cn=set().union(*[nums(t) for _,t in srcs]); cu=units(allt)
  miss=[]
  for n in sorted(nums(v)):
    if n not in cn: miss.append(('number',n))
  for u in sorted(units(v)):
    if u not in cu: miss.append(('unit',u))
  for nm in sorted(names(v)):
    cands=[nm]+ALIAS.get(nm,[])
    if not any(re.search(r'(?<![a-z0-9])'+re.escape(fold(c)),fa) for c in cands): miss.append(('name',nm))
  if miss: fails[x['locale']]+=1; res.append((x,miss))
  else: passes[x['locale']]+=1
def where(x):
  return x['reason']
print('pass',dict(passes),'fail',dict(fails))
for x,m in res: print(x['locale'],x['slug'],x['field'],m)

sys.exit(1 if res else 0)
