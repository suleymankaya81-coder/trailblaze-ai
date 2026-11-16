import requests,json,sys
C={'it':'Q38','es':'Q29','pt':'Q45','gr':'Q41'}
def run(q):
  r=requests.get('https://query.wikidata.org/sparql',params={'query':q,'format':'json'},headers={'User-Agent':'WPRcatalog/1.0 (info@minialife.com)'},timeout=120);r.raise_for_status();return r.json()['results']['bindings']
out={}
for cc,q in C.items():
  rows=run(f'''SELECT ?i ?l ?t ?tl ?coord ?en (COUNT(DISTINCT ?sl) AS ?n) WHERE {{
 ?i wdt:P17 wd:{q}; wdt:P31 ?t. ?t wdt:P279* wd:Q473972.
 ?i wdt:P625 ?coord. ?i rdfs:label ?l FILTER(lang(?l)="en")
 ?t rdfs:label ?tl FILTER(lang(?tl)="en")
 OPTIONAL{{?en schema:about ?i; schema:isPartOf <https://en.wikipedia.org/>}}
 ?sl schema:about ?i.
 FILTER NOT EXISTS {{?i wdt:P576 ?x}}
}} GROUP BY ?i ?l ?t ?tl ?coord ?en HAVING(COUNT(DISTINCT ?sl)>=3)''')
  out[cc]=rows;print(cc,len(rows),file=sys.stderr)
json.dump(out,open('wd.json','w'))
