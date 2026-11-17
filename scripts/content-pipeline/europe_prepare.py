"""Standalone, DB-free replicas of prepare-wave.py's airport/route/Commons helpers,
for countries (fr, pt, gr) not reachable through prepare-wave.py (which requires
SUPABASE_DB_URL at import time). Logic, endpoints and params are copied verbatim;
only the country allowlist for the OurAirports cache is extended.
"""
import csv
import hashlib
import html
import json
import math
import os
import re
import time
from pathlib import Path
from urllib.parse import urlencode
import requests

UA = {"User-Agent": "minialife-content-pipeline/1.0 (https://minialife.com)"}
BAD = re.compile(r"map|logo|seal|sign|diagram|chart|plan|stamp|coin|flag|icon|svg|locator|poster|brochure|aerial view of", re.I)
AIRPORTS_CSV = "/tmp/airports.csv"
EXTRA_COUNTRIES = ("FR", "PT", "GR")
CACHE_DIR = Path(__file__).parent / "europe-prepare-cache"


def _cached(url):
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    return CACHE_DIR / (hashlib.sha256(url.encode()).hexdigest() + ".json")


def api(host, **params):
    params.update(format="json", formatversion=2)
    url = f"https://{host}/w/api.php?" + urlencode(params)
    path = _cached(url)
    if path.exists():
        return json.loads(path.read_text())
    for attempt in range(8):
        r = requests.get(f"https://{host}/w/api.php", params=params, headers=UA, timeout=30)
        if r.ok:
            time.sleep(1)
            data = r.json()
            path.write_text(json.dumps(data, ensure_ascii=False))
            return data
        if r.headers.get("Retry-After", "").isdigit():
            time.sleep(int(r.headers["Retry-After"]) + 1)
        else:
            time.sleep(min(60, 5 * (2 ** attempt)))
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


def hav(a, b, c, d):
    p = math.pi / 180
    x = math.sin((c - a) * p / 2) ** 2 + math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2
    return 7918 * math.asin(math.sqrt(x))


def airports(lat, lng, n=4, country="fr"):
    if not AIRPORTS:
        import urllib.request
        if not os.path.exists(AIRPORTS_CSV):
            urllib.request.urlretrieve("https://davidmegginson.github.io/ourairports-data/airports.csv", AIRPORTS_CSV)
        with open(AIRPORTS_CSV) as f:
            AIRPORTS.extend(r for r in csv.DictReader(f) if r["iso_country"] in
                            ("US", "CA", "GB", "DE", "AT", "CH", "IT", "ES") + EXTRA_COUNTRIES
                            and r["scheduled_service"] == "yes" and r["iata_code"]
                            and r["type"] in ("large_airport", "medium_airport"))
    pool = [a for a in AIRPORTS if a["iso_country"] == country.upper()]
    return [_ap(a) for a in sorted(pool, key=lambda r: hav(lat, lng, float(r["latitude_deg"]), float(r["longitude_deg"])))[:n]]


def _ap(a):
    return {"code": a["iata_code"], "name": a["name"], "lat": round(float(a["latitude_deg"]), 4),
            "lng": round(float(a["longitude_deg"]), 4)}


def route(a, lat, lng):
    url = (f"https://router.project-osrm.org/route/v1/driving/{a['lng']},{a['lat']};{lng},{lat}"
           "?overview=full&geometries=geojson")
    path = _cached(url)
    if path.exists():
        r = json.loads(path.read_text())
    else:
        r = requests.get(url, headers=UA, timeout=60).json()
        time.sleep(1)
        path.write_text(json.dumps(r, ensure_ascii=False))
    if not r.get("routes"):
        return None
    rt = r["routes"][0]
    coords = rt["geometry"]["coordinates"]
    step = max(1, math.ceil(len(coords) / 40))
    pts = [[round(x, 5), round(y, 5)] for x, y in coords[::step]] + [[round(coords[-1][0], 5), round(coords[-1][1], 5)]]
    return {"minutes": round(rt["duration"] / 60), "miles": round(rt["distance"] / 1609.34, 1), "coords": pts}
