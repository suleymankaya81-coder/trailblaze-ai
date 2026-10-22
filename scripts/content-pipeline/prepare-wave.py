"""Tier rollout step 1: gather everything a catalog destination needs before it
can go live, and save it to /tmp/wave/<slug>.json for review.
  - Wikimedia Commons photos (hero, 2 gallery, 3 activity) with credits
  - coordinates (Wikipedia), nearest US airport with scheduled flights (OurAirports)
  - airport -> destination drive computed once with the free OSRM demo server
  - trip summary written by the AI gateway from saved facts only
Run: python scripts/content-pipeline/prepare-wave.py slug [slug ...]
Next: apply-wave.py, then generate/insert-landing-pages.py, then publish-wave.py.
"""
import csv, html, json, math, os, re, subprocess, sys, time, urllib.parse
import requests

OUT = "/tmp/wave"
os.makedirs(OUT, exist_ok=True)
FACTS_OUT = "scripts/content-pipeline/wave3-facts"
DB = os.environ["SUPABASE_DB_URL"]
UA = {"User-Agent": "minialife-content-pipeline/1.0 (https://minialife.com)"}
BAD = re.compile(r"map|logo|seal|sign|diagram|chart|plan|stamp|coin|flag|icon|svg|locator|poster|brochure|aerial view of", re.I)
# Use an explicitly named, verifiable landmark for broad regions or catalog aliases.
# These are map anchors, not claims that a region has one exact point.
WIKI_ANCHORS = {
    "bryce-canyon-region": "Bryce Canyon National Park",
    "atchafalaya-basin": "Henderson, Louisiana",
    "beartooth-highway": "Red Lodge, Montana",
    "blue-ridge-parkway": "Blowing Rock, North Carolina",
    "california-coast": "Big Sur",
    "colorado-rockies": "Rocky Mountain National Park",
    "columbia-river-gorge-washington": "Columbia River Gorge",
    "devil-s-lake": "Devil's Lake State Park (Wisconsin)",
    "eastern-sierra": "Bishop, California",
    "flaming-gorge": "Flaming Gorge National Recreation Area",
    "grand-teton-region": "Grand Teton National Park",
    "lake-george": "Lake George (New York)",
    "lake-powell-utah": "Lake Powell",
    "lake-tahoe-nevada": "Lake Tahoe",
    "north-shore-oahu": "North Shore (Oʻahu)",
    "north-shore-lake-superior": "North Shore (Lake Superior)",
    "ozark-mountains-missouri": "Ozarks",
    "sawtooth-mountains": "Sawtooth Range (Idaho)",
    "smith-rock": "Smith Rock State Park",
    "white-mountains": "White Mountains (New England)",
    "wisconsin-northwoods": "Eagle River, Wisconsin",
    "yellowstone-montana-gateway": "West Yellowstone, Montana",
    # Tier 2 anchors
    "allagash-wilderness": "Allagash Wilderness Waterway",
    "assateague-region": "Assateague Island National Seashore",
    "big-south-fork": "Big South Fork National River and Recreation Area",
    "blue-ridge-foothills": "Dahlonega, Georgia",
    "chaco-culture": "Chaco Culture National Historical Park",
    "chequamegon-nicolet-national-forest": "Chequamegon–Nicolet National Forest",
    "craters-of-the-moon": "Craters of the Moon National Monument and Preserve",
    "fort-myers-sanibel": "Sanibel, Florida",
    "gulf-coast-mississippi": "Biloxi, Mississippi",
    "helen": "Helen, Georgia",
    "inside-passage": "Juneau, Alaska",
    "lake-erie-shores": "Presque Isle State Park",
    "lost-maples": "Lost Maples State Natural Area",
    "maah-daah-hey-trail": "Medora, North Dakota",
    "natchez-trace": "Natchez Trace Parkway",
    "needles-highway": "Custer State Park",
    "pine-barrens": "Wharton State Forest",
    "sandhills": "Valentine, Nebraska",
    "tallgrass-prairie": "Tallgrass Prairie National Preserve",
    "white-mountains-maine": "Bethel, Maine",
    # New-destination wave 1 (gateway cities)
    "san-francisco": "San Francisco",
    "los-angeles": "Los Angeles",
    "miami": "Miami",
    "orlando": "Orlando, Florida",
    "denver": "Denver",
    "boston": "Boston",
    "honolulu": "Honolulu",
    "phoenix": "Phoenix, Arizona",
    "tucson": "Tucson, Arizona",
    "salt-lake-city": "Salt Lake City",
    "portland-oregon": "Portland, Oregon",
    "williams-arizona": "Williams, Arizona",
    # New-destination wave 2 (gateway cities)
    "new-york-city": "New York City",
    "philadelphia": "Philadelphia",
    "atlanta": "Atlanta",
    "nashville": "Nashville, Tennessee",
    "houston": "Houston",
    "dallas-fort-worth": "Dallas",
    "sacramento": "Sacramento, California",
    "charlotte": "Charlotte, North Carolina",
    "minneapolis": "Minneapolis",
    "pittsburgh": "Pittsburgh",
    "san-antonio": "San Antonio",
    "st-louis": "St. Louis",
}
# Fallback anchor coordinates when Wikipedia/OSM lookups return nothing (town or visitor center).
COORDS = {
    "helen": (34.7012, -83.7271),               # Helen, GA
    "natchez-trace": (34.3326, -88.7036),       # Parkway Visitor Center, Tupelo MS
    "chequamegon-nicolet-national-forest": (45.9344, -90.4416),  # Park Falls, WI
}
# Wikipedia lead image is not a scenic cover for these; use the first search photo instead.
HERO_FROM_SEARCH = {"los-angeles", "boston", "san-francisco", "new-york-city", "houston", "dallas-fort-worth", "charlotte", "atlanta"}
# Alternative Commons search terms for places with too few usable photos.
SEARCH_TERMS = {
    "flagstaff": ["Flagstaff Arizona landscape", "Flagstaff San Francisco Peaks"],
    "helen": ["Helen Georgia", "Unicoi State Park", "Anna Ruby Falls", "Chattahoochee River Helen"],
    "lost-maples": ["Lost Maples State Natural Area", "Sabinal River", "Lost Maples Texas", "Vanderpool Texas"],
    "allagash-wilderness": ["Allagash River", "Allagash Wilderness Waterway", "Allagash Lake", "Chamberlain Lake Maine"],
    "natchez-trace": ["Natchez Trace Parkway", "Natchez Trace", "Natchez Trace Mississippi", "Natchez Trace Tennessee"],
    "maah-daah-hey-trail": ["Maah Daah Hey Trail", "Little Missouri National Grassland", "Little Missouri River North Dakota", "Medora North Dakota badlands"],
    "chequamegon-nicolet-national-forest": ["Chequamegon National Forest", "Nicolet National Forest", "Chequamegon-Nicolet National Forest", "Park Falls Wisconsin"],
    "blue-ridge-foothills": ["Dahlonega Georgia", "Blue Ridge Mountains Georgia", "Amicalola", "Lumpkin County Georgia"],
    # New-destination wave 1: gateway cities show the nature they open to.
    "san-francisco": ["Golden Gate Bridge Marin Headlands", "Muir Woods redwoods", "Lands End San Francisco", "Point Reyes coast"],
    "los-angeles": ["Griffith Observatory Los Angeles hills", "Malibu coast", "Santa Monica Mountains", "El Matador State Beach"],
    "miami": ["Miami Beach South Beach", "Everglades National Park Anhinga Trail", "Biscayne National Park", "Key Biscayne beach"],
    "orlando": ["Kennedy Space Center Visitor Complex", "Wekiwa Springs", "Blue Spring State Park Florida", "Lake Eola Park"],
    "denver": ["Red Rocks Amphitheatre", "Denver skyline Rocky Mountains", "Mount Evans road", "Garden of the Gods"],
    "boston": ["Boston Public Garden", "Boston Harbor skyline", "Cape Cod National Seashore", "Freedom Trail Boston"],
    "honolulu": ["Diamond Head Waikiki", "Hanauma Bay", "Makapuu Point Lighthouse", "Waikiki Beach"],
    "phoenix": ["Camelback Mountain Phoenix", "South Mountain Park Phoenix", "Sonoran Desert saguaro Phoenix", "Papago Park"],
    "tucson": ["Saguaro National Park", "Sabino Canyon", "Mount Lemmon Catalina Highway", "Mission San Xavier del Bac"],
    "salt-lake-city": ["Salt Lake City Wasatch", "Antelope Island State Park", "Big Cottonwood Canyon", "Great Salt Lake"],
    "portland-oregon": ["Portland Oregon Mount Hood skyline", "Multnomah Falls", "Columbia River Gorge Crown Point", "Forest Park Portland Oregon"],
    "williams-arizona": ["Route 66 Williams Arizona", "Grand Canyon Railway", "Grand Canyon South Rim Mather Point", "Kaibab National Forest"],
    # New-destination wave 2
    "new-york-city": ["Central Park New York", "Hudson River Palisades", "Bear Mountain State Park", "Brooklyn Bridge Park"],
    "philadelphia": ["Wissahickon Valley Park", "Valley Forge National Historical Park", "Schuylkill River Trail", "Independence Hall"],
    "atlanta": ["Stone Mountain Park", "Chattahoochee River National Recreation Area", "Piedmont Park Atlanta", "Kennesaw Mountain"],
    "nashville": ["Radnor Lake State Park", "Percy Priest Lake", "Nashville skyline Cumberland River", "Natchez Trace Parkway bridge"],
    "houston": ["Buffalo Bayou Park", "Galveston Island beach", "Space Center Houston", "Brazos Bend State Park"],
    "dallas-fort-worth": ["White Rock Lake Dallas", "Fort Worth Stockyards", "Cedar Ridge Preserve", "Dallas Arboretum"],
    "sacramento": ["American River Sacramento", "Folsom Lake", "Old Sacramento", "Sacramento River delta"],
    "charlotte": ["Crowders Mountain State Park", "Lake Norman", "U.S. National Whitewater Center", "Charlotte skyline"],
    "minneapolis": ["Minnehaha Falls", "Chain of Lakes Minneapolis", "Stone Arch Bridge Minneapolis", "Mississippi River Minneapolis"],
    "pittsburgh": ["Point State Park Pittsburgh", "Ohiopyle State Park", "Mount Washington Pittsburgh view", "Fallingwater"],
    "san-antonio": ["San Antonio River Walk", "San Antonio Missions National Historical Park", "Mission San José San Antonio", "Natural Bridge Caverns"],
    "st-louis": ["Gateway Arch", "Forest Park St. Louis", "Elephant Rocks State Park", "Missouri Botanical Garden"],
}


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


def run(slug, facts_only=False):
    path = f"{OUT}/{slug}.json"
    if os.path.exists(path):
        return "cached"
    facts_path = f"{FACTS_OUT}/{slug}.json"
    if os.path.exists(facts_path):
        prepared = json.load(open(facts_path))
        if facts_only:
            return "facts cached"
    else:
        prepared = prepare_facts(slug)
        os.makedirs(FACTS_OUT, exist_ok=True)
        json.dump(prepared, open(facts_path, "w"), indent=1)
    if facts_only:
        return f"facts ready airport={prepared['airport']['code']}"
    sys.path.insert(0, "/tmp")
    from lovable_ai import call_ai_json  # temporary, server-side streaming helper
    d = prepared["destination"]
    published = q("select string_agg(slug, ',') from destinations where status='published'")
    facts = {**d, "lat": prepared["lat"], "lng": prepared["lng"],
             "nearest_airport": prepared["airport"]["name"],
             "drive_minutes": prepared["route"]["minutes"]}
    ai = call_ai_json(PROMPT.format(facts=json.dumps(facts), pool=published),
                      model="google/gemini-3-flash-preview", system=SYSTEM)
    if isinstance(ai, str):
        ai = json.loads(ai)
    if isinstance(ai, list):
        ai = ai[0]
    pub = set(published.split(","))
    ai["similar_slugs"] = [s for s in ai["similar_slugs"] if s in pub][:3]
    json.dump({k: v for k, v in prepared.items() if k != "destination"} | {"ai": ai},
              open(path, "w"), indent=1)
    return f"ok airport={prepared['airport']['code']} drive={prepared['route']['minutes']}min"


def prepare_facts(slug):
    d = json.loads(q(f"select row_to_json(t) from (select slug,name,state,destination_type,trip_tags,"
                     f"experience_tags from destinations where slug='{slug}') t"))
    used = set(q("select hero_image from destinations where hero_image is not null").split("\n"))
    used_cards = set(q("select coalesce(string_agg(array_to_string(gallery, E'\\n'), E'\\n'),'') from destinations").split("\n"))

    pimg, lat, lng = wiki(WIKI_ANCHORS.get(slug, d["name"]))
    if lat is None:
        pimg2, lat, lng = wiki(f"{d['name']}, {d['state']}")
        pimg = pimg or pimg2
    if lat is None:  # free OpenStreetMap geocoder fallback for the same named anchor
        anchor = WIKI_ANCHORS.get(slug, f"{d['name']}, {d['state']}")
        r = requests.get("https://nominatim.openstreetmap.org/search", headers=UA, timeout=30,
                         params={"q": anchor, "format": "json", "limit": 1, "countrycodes": "us"}).json()
        time.sleep(1)
        if r:
            lat, lng = float(r[0]["lat"]), float(r[0]["lon"])
    if lat is None and slug in COORDS:  # verified town/visitor-center anchor
        lat, lng = COORDS[slug]
    if lat is None:
        raise RuntimeError("no coordinates")

    terms = SEARCH_TERMS.get(slug, [d["name"], f"{d['name']} {d['state']}"])
    lists = [commons_search(t) for t in terms]
    pool = [l[i] for i in range(max(map(len, lists), default=0)) for l in lists if i < len(l)]  # interleave terms for variety
    seen, photos = set(), []
    hero = file_info(pimg) if pimg and not BAD.search(pimg) and slug not in HERO_FROM_SEARCH else None
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
    if len(photos) < 5:
        raise RuntimeError(f"only {len(photos)} extra photos")

    # Straight-line nearest can be across mountains or water: keep the shortest drive of the 4 nearest.
    best = []
    for cand in airports(lat, lng):
        r = route(cand, lat, lng)
        best.append((r["minutes"] if r else 10**6, cand, r))
        time.sleep(1)
    _, ap, rt = min(best, key=lambda b: b[0])
    if rt is None:
        raise RuntimeError("no drivable airport route")
    return {"slug": slug, "name": d["name"], "state": d["state"], "destination": d,
            "lat": lat, "lng": lng, "airport": ap, "route": rt, "hero": hero,
            "gallery": photos[:2], "activity": photos[2:5]}


if __name__ == "__main__":
    facts_only = "--facts-only" in sys.argv
    for s in (arg for arg in sys.argv[1:] if arg != "--facts-only"):
        try:
            print(s, run(s, facts_only=facts_only), flush=True)
        except Exception as e:  # noqa
            print(s, "ERR", e, flush=True)
        time.sleep(1)
