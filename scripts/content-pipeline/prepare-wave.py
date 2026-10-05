"""Tier rollout step 1: gather everything a catalog destination needs before it
can go live, and save it to /tmp/wave/<slug>.json for review.
  - Wikimedia Commons photos (hero, 2 gallery, 3 activity, 4 toolkit) with credits
  - coordinates (Wikipedia), nearest US airport with scheduled flights (OurAirports)
  - airport -> destination drive computed once with the free OSRM demo server
  - trip summary written by the AI gateway from saved facts only
Run: python scripts/content-pipeline/prepare-wave.py slug [slug ...]
Next: apply-wave.py, then generate/insert-landing-pages.py, then publish-wave.py.
"""
import csv, html, json, math, os, re, subprocess, sys, time, urllib.parse
import requests

sys.path.insert(0, "/tmp")
from lovable_ai import call_ai_json  # copied from the ai-gateway skill

OUT = "/tmp/wave"
os.makedirs(OUT, exist_ok=True)
DB = os.environ["SUPABASE_DB_URL"]
UA = {"User-Agent": "minialife-content-pipeline/1.0 (https://minialife.com)"}
BAD = re.compile(r"map|logo|seal|sign|diagram|chart|plan|stamp|coin|flag|icon|svg|locator|poster|brochure|aerial view of", re.I)


def q(sql):
    return subprocess.check_output(["psql", DB, "-Atc", sql], text=True).strip()


def api(host, **params):
    params.update(format="json", formatversion=2)
    for _ in range(3):
        r = requests.get(f"https://{host}/w/api.php", params=params, headers=UA, timeout=30)
        if r.ok:
            return r.json()
        time.sleep(2)
    r.raise_for_status()


def strip(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()[:120]


def info(page):
    ii = page["imageinfo"][0]
    md = ii.get("extmetadata", {})
    return {
        "file": page["title"],
        "url": (ii.get("thumburl") or ii["url"]).split("?utm_")[0],
        "source": ii["descriptionurl"],
        "credit": strip(md.get("Artist", {}).get("value")) or "Unknown",
        "license": strip(md.get("LicenseShortName", {}).get("value")) or "See source",
        "subject": re.sub(r"\.\w+$", "", page["title"].removeprefix("File:")).replace("_", " "),
        "w": ii.get("width", 0), "h": ii.get("height", 0),
    }


def wiki(name):
    j = api("en.wikipedia.org", action="query", titles=name, redirects=1,
            prop="pageimages|coordinates", piprop="name")
    p = j["query"]["pages"][0]
    c = (p.get("coordinates") or [{}])[0]
    return p.get("pageimage"), c.get("lat"), c.get("lon")


def file_info(fname, width=1920):
    j = api("commons.wikimedia.org", action="query", titles=f"File:{fname}", prop="imageinfo",
            iiprop="url|extmetadata|size", iiurlwidth=width)
    p = j["query"]["pages"][0]
    return info(p) if "imageinfo" in p else None


def commons_search(term, width=1280, limit=40):
    j = api("commons.wikimedia.org", action="query", generator="search", gsrnamespace=6,
            gsrsearch=f"{term} filetype:bitmap", gsrlimit=limit, prop="imageinfo",
            iiprop="url|extmetadata|size", iiurlwidth=width)
    pages = sorted(j.get("query", {}).get("pages", []), key=lambda p: p.get("index", 0))
    out = []
    for p in pages:
        if "imageinfo" not in p:
            continue
        i = info(p)
        if BAD.search(i["file"]) or i["w"] < 1200 or i["w"] < i["h"] * 1.2:
            continue
        out.append(i)
    return out


AIRPORTS = []
with open("/tmp/airports.csv") as f:
    for r in csv.DictReader(f):
        if r["iso_country"] == "US" and r["scheduled_service"] == "yes" and r["iata_code"] \
                and r["type"] in ("large_airport", "medium_airport"):
            AIRPORTS.append(r)


def hav(a, b, c, d):
    p = math.pi / 180
    x = math.sin((c - a) * p / 2) ** 2 + math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2
    return 7918 * math.asin(math.sqrt(x))


def airports(lat, lng, n=4):
    return [_ap(a) for a in sorted(AIRPORTS, key=lambda r: hav(lat, lng, float(r["latitude_deg"]), float(r["longitude_deg"])))[:n]]


def _ap(a):
    return {"code": a["iata_code"], "name": a["name"], "lat": round(float(a["latitude_deg"]), 4),
            "lng": round(float(a["longitude_deg"]), 4)}


def route(a, lat, lng):
    r = requests.get(f"https://router.project-osrm.org/route/v1/driving/{a['lng']},{a['lat']};{lng},{lat}"
                     "?overview=full&geometries=geojson", headers=UA, timeout=60).json()
    if not r.get("routes"):
        return None
    rt = r["routes"][0]
    coords = rt["geometry"]["coordinates"]
    step = max(1, math.ceil(len(coords) / 40))
    pts = [[round(x, 5), round(y, 5)] for x, y in coords[::step]] + [[round(coords[-1][0], 5), round(coords[-1][1], 5)]]
    return {"minutes": round(rt["duration"] / 60), "miles": round(rt["distance"] / 1609.34, 1), "coords": pts}


SYSTEM = """You write factual trip summaries for Minialife, a US outdoor travel guide.
Use only widely known, stable facts. No exact prices, no guarantees, no invented
business names. Return JSON only."""
PROMPT = """Destination: {facts}
Published Minialife destinations you may pick similar ones from: {pool}
Return JSON:
{{"region": short region e.g. "Southeastern Utah",
 "tagline": one evocative sentence, max 110 chars,
 "best_season": e.g. "March – May, September – October",
 "best_seasons": subset of ["spring","summer","fall","winter"],
 "scenic_score": 1-10, "camping_score": 1-10,
 "avg_daily_budget": rough USD per person per day incl. lodging (integer),
 "trip_duration_days": e.g. "2–3 days", "recommended_duration": e.g. "2-3 days",
 "permit_level": "high" if timed entry/lottery permits are commonly needed, "moderate" if some popular hikes or campsites need reservations, else "none",
 "aliases": 2-4 lowercase names people search for,
 "gateway_cities": 1-3 real nearby towns,
 "similar_slugs": exactly 3 slugs from the list,
 "trip_tags": subset of ["weekend","rv_road_trip","glamping","family","mountain","desert","lake","coastal","national_park"],
 "activities": exactly 3 short names of well-known real experiences there (e.g. "Delicate Arch Hike"),
 "seo_title": max 60 chars like "<Name> Camping, Stays & Trip Guide"}}"""


def run(slug):
    path = f"{OUT}/{slug}.json"
    if os.path.exists(path):
        return "cached"
    d = json.loads(q(f"select row_to_json(t) from (select slug,name,state,destination_type,trip_tags,"
                     f"experience_tags from destinations where slug='{slug}') t"))
    used = set(q("select hero_image from destinations where hero_image is not null").split("\n"))
    used_cards = set(q("select coalesce(string_agg(array_to_string(gallery, E'\\n'), E'\\n'),'') from destinations").split("\n"))

    pimg, lat, lng = wiki(d["name"])
    if lat is None:
        pimg2, lat, lng = wiki(f"{d['name']}, {d['state']}")
        pimg = pimg or pimg2
    if lat is None:
        raise RuntimeError("no coordinates")

    pool = commons_search(d["name"]) + commons_search(f"{d['name']} {d['state']}")
    seen, photos = set(), []
    hero = file_info(pimg) if pimg and not BAD.search(pimg) else None
    if hero and (hero["url"] in used or hero["w"] < hero["h"]):
        hero = None
    for p in pool:
        if p["file"] in seen or p["url"] in used or p["url"] in used_cards:
            continue
        seen.add(p["file"])
        photos.append(p)
    if hero:
        photos = [p for p in photos if p["file"] != hero["file"]]
    else:
        if not photos:
            raise RuntimeError("no photos")
        hero = file_info(photos.pop(0)["file"].removeprefix("File:"))
    if len(photos) < 9:
        raise RuntimeError(f"only {len(photos)} extra photos")

    # Straight-line nearest can be across mountains or water: keep the shortest drive of the 4 nearest.
    best = []
    for cand in airports(lat, lng):
        r = route(cand, lat, lng)
        best.append((r["minutes"] if r else 10**6, cand, r))
        time.sleep(1)
    _, ap, rt = min(best, key=lambda b: b[0])
    published = q("select string_agg(slug, ',') from destinations where status='published'")
    facts = {**d, "lat": lat, "lng": lng, "nearest_airport": ap["name"],
             "drive_minutes": rt and rt["minutes"]}
    ai = call_ai_json(PROMPT.format(facts=json.dumps(facts), pool=published), system=SYSTEM)
    if isinstance(ai, str):
        ai = json.loads(ai)
    if isinstance(ai, list):
        ai = ai[0]
    pub = set(published.split(","))
    ai["similar_slugs"] = [s for s in ai["similar_slugs"] if s in pub][:3]
    json.dump({"slug": slug, "name": d["name"], "state": d["state"], "lat": lat, "lng": lng,
               "airport": ap, "route": rt, "hero": hero, "gallery": photos[:2],
               "activity": photos[2:5], "toolkit": photos[5:9], "ai": ai},
              open(path, "w"), indent=1)
    return f"ok airport={ap['code']} drive={rt and rt['minutes']}min"


if __name__ == "__main__":
    for s in sys.argv[1:]:
        try:
            print(s, run(s), flush=True)
        except Exception as e:  # noqa
            print(s, "ERR", e, flush=True)
        time.sleep(1)
