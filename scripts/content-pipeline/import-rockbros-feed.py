#!/usr/bin/env python3
"""Normalize ROCKBROS (Awin 58007) feeds into one product catalog.
Usage: python3 scripts/content-pipeline/import-rockbros-feed.py
Re-run after replacing files in data/affiliate-feeds/rockbros/raw/."""
import csv, gzip, json, re, glob, os
from collections import defaultdict
BASE = os.path.join(os.path.dirname(__file__), "../../data/affiliate-feeds/rockbros")
csv.field_size_limit(10**8)
THEMES = [("bikepacking-bags", ["bikepacking","frame bag","saddle bag","handlebar bag","pannier","top tube","bike bag"]),
 ("lights", ["light","lamp"]), ("repair-pumps", ["pump","repair","multi-tool","tool kit"]),
 ("sunglasses", ["sunglasses","glasses","goggles"]), ("racks-mounts", ["rack","carrier","phone mount","holder"]),
 ("helmets", ["helmet"]), ("locks", ["lock"]), ("gloves", ["glove"]),
 ("cold-weather", ["balaclava","gaiter","jacket","thermal"]), ("apparel", ["jersey","shorts","sock","hat"])]
def theme(t):
    t=t.lower()
    for k,ws in THEMES:
        if any(w in t for w in ws): return k
    return "other"
def price(v):
    m=re.search(r"[\d.]+",v or ""); return float(m.group()) if m else None
models=defaultdict(lambda:{"variants":[]})
for fp in glob.glob(f"{BASE}/raw/*retail*.csv.gz"):
    with gzip.open(fp,"rt",encoding="utf-8-sig",errors="ignore") as f:
        for r in csv.DictReader(f):
            title=r.get("title","").strip()
            if not title: continue
            key=r.get("item_group_id") or re.sub(r"\s+-\s+[^-]+$","",title)
            m=models[key]
            m.setdefault("model_key",key); m.setdefault("title",title)
            m.setdefault("google_category",r.get("google_product_category",""))
            m.setdefault("image",r.get("image_link","")); m.setdefault("description",(r.get("description") or "")[:600])
            m.setdefault("theme",theme(title+" "+m["google_category"]))
            m["variants"].append({"id":r.get("id"),"title":title,"price":price(r.get("sale_price")) or price(r.get("price")),
              "list_price":price(r.get("price")),"availability":r.get("availability"),
              "awin_link":r.get("aw_deep_link"),"product_url":r.get("link")})
out=[]
for m in models.values():
    ps=[v["price"] for v in m["variants"] if v["price"]]
    m["price_min"]=min(ps) if ps else None; m["price_max"]=max(ps) if ps else None
    m["in_stock"]=any(v["availability"]=="in_stock" for v in m["variants"])
    out.append(m)
out.sort(key=lambda m:(m["theme"],m["title"]))
json.dump({"advertiser_id":58007,"publisher_id":3115962,"models":out},open(f"{BASE}/products.json","w"),indent=1)
summary=defaultdict(int)
for m in out: summary[m["theme"]]+=1
print(len(out),"models,",sum(len(m["variants"]) for m in out),"variants"); print(dict(summary))
