"""Build src/data/nearby.json: the 6 nearest published places for every place, from stored coordinates.

Rule: nearest places in the same country first (by great-circle distance); if fewer than 6 exist there,
fill with places in other countries within 150 km. No AI, no network, no database.

Coordinates (stored data only):
  1. the end point of the place's stored route in src/data/routes.json (airport → place), else
  2. the catalog coordinates in scripts/content-pipeline/claude-handoff/oceania/batches/*.json (NZ places
     without a road route).
The place list is src/data/destination-geo.json (refreshed on every publish). Run after refreshing it:
  python3 scripts/content-pipeline/build-nearby.py
"""
import glob, json, math, os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MAX = 6
CROSS_BORDER_KM = 150


def load_coords(geo):
    routes = json.load(open(os.path.join(ROOT, "src/data/routes.json")))
    coords = {s: (pts[-1][1], pts[-1][0]) for s, pts in routes.items() if s in geo and pts}
    for f in sorted(glob.glob(os.path.join(ROOT, "scripts/content-pipeline/claude-handoff/oceania/batches/*.json"))):
        def walk(o):
            if isinstance(o, dict):
                s = o.get("slug")
                lat, lng = o.get("lat"), o.get("lng")
                if isinstance(s, str) and s in geo and s not in coords and isinstance(lat, (int, float)) and isinstance(lng, (int, float)):
                    coords[s] = (lat, lng)
                for v in o.values():
                    walk(v)
            elif isinstance(o, list):
                for v in o:
                    walk(v)
        walk(json.load(open(f)))
    return coords


def km(a, b):
    (la1, lo1), (la2, lo2) = a, b
    p1, p2 = math.radians(la1), math.radians(la2)
    dp, dl = p2 - p1, math.radians(lo2 - lo1)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 6371.0 * 2 * math.asin(math.sqrt(h))


def build(geo, coords):
    country = {s: v.split("/")[0] for s, v in geo.items()}
    by_country = {}
    for s in coords:
        by_country.setdefault(country[s], []).append(s)
    out = {}
    for s in sorted(coords):
        here = coords[s]
        same = sorted(((km(here, coords[o]), o) for o in by_country[country[s]] if o != s))[:MAX]
        picked = [(o, d) for d, o in same]
        if len(picked) < MAX:
            others = sorted((km(here, coords[o]), o) for o in coords if country[o] != country[s])
            picked += [(o, d) for d, o in others if d <= CROSS_BORDER_KM][: MAX - len(picked)]
        out[s] = [[o, round(d)] for o, d in picked]
    return out


def main():
    geo = json.load(open(os.path.join(ROOT, "src/data/destination-geo.json")))
    coords = load_coords(geo)
    missing = sorted(set(geo) - set(coords))
    out = build(geo, coords)
    path = os.path.join(ROOT, "src/data/nearby.json")
    with open(path, "w") as f:
        json.dump(out, f, separators=(",", ":"), sort_keys=True)
    print(f"{len(out)} places, {len(missing)} without coordinates: {missing[:10]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
