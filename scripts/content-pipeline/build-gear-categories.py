#!/usr/bin/env python3
"""Split the ROCKBROS catalog into compact per-category files for /gear/category/{key}.
Usage: python3 scripts/content-pipeline/build-gear-categories.py
Re-run after import-rockbros-feed.py. Only in-stock models with photo + price are kept."""
import json, os, datetime
ROOT = os.path.join(os.path.dirname(__file__), "../..")
SRC = os.path.join(ROOT, "data/affiliate-feeds/rockbros/products.json")
OUT = os.path.join(ROOT, "src/data/gear-categories")

# First match wins, so each product lands in exactly one category.
RULES = [
    ("eyewear", ["sunglasses", "glasses", "goggles", "glove", "mitten"]),
    ("lights", ["light", "lamp", "lantern", "power bank", "flashlight", "headlamp"]),
    ("camping", ["camping", "tent", "camp ", "chair", "hammock", "picnic", "stove", "cooler", "sleeping"]),
    ("hiking", ["hiking", "backpack", "trekking", "hydration", "daypack", "water bag", "rucksack"]),
    ("bags", ["moto", "motorcycle", "travel", "pannier", "frame bag", "saddle bag", "handlebar bag", "top tube", "bikepacking", "bike bag", "waist bag", "sling", "crossbody", "phone bag", "duffel"]),
    ("apparel", ["jersey", "shorts", "sock", "hat", "cap", "balaclava", "gaiter", "jacket", "thermal", "vest", "pants", "shirt", "hood", "scarf", "sleeve", "shoe cover", "warmer", "neck"]),
    ("cycling", ["bike", "bicycle", "cycling", "helmet", "pump", "lock", "rack", "mount", "holder", "saddle", "pedal", "tool", "bell", "fender", "bottle", "grip", "computer", "mirror"]),
]

def classify(m):
    t = (m["model_key"] + " " + m.get("google_category", "")).lower()
    for key, words in RULES:
        if any(w in t for w in words):
            return key
    return None

def main():
    d = json.load(open(SRC))
    today = datetime.date.today().isoformat()
    out = {k: [] for k, _ in RULES}
    for m in d["models"]:
        if not m.get("in_stock") or not m.get("image", "").startswith("https://"):
            continue
        v = next((v for v in m["variants"] if v.get("availability") == "in_stock" and v.get("price")), None)
        if not v or "awinaffid=3115962" not in v["awin_link"] or "awinmid=58007" not in v["awin_link"]:
            continue
        key = classify(m)
        if not key:
            continue
        lp = v.get("list_price") or v["price"]
        out[key].append({
            "id": v["id"], "name": m["model_key"].strip(), "image": m["image"],
            "price": round(v["price"], 2), "listPrice": round(lp, 2) if lp > v["price"] else None,
            "url": v["awin_link"],
        })
    os.makedirs(OUT, exist_ok=True)
    for key, items in out.items():
        json.dump({"key": key, "reviewed": today, "items": items}, open(os.path.join(OUT, f"{key}.json"), "w"), separators=(",", ":"))
        print(key, len(items))
    json.dump({"reviewed": today, "counts": {k: len(v) for k, v in out.items()}}, open(os.path.join(OUT, "counts.json"), "w"), indent=1)

if __name__ == "__main__":
    main()
