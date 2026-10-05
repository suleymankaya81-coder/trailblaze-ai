"""Tier rollout step 2: write /tmp/wave/<slug>.json (from prepare-wave.py) into
the database and the app's bundled data. Destinations stay unpublished here.
  - destinations row: photos + credits, location, airport, drive, trip summary
  - offers: the same partner set every live destination has (Awin + RVshare/REI direct)
  - src/data/routes.json: precomputed airport -> destination line
  - src/data/destinationCardPhotos.wave.json + public/images/destination-cards/*: activity/toolkit photos
Re-running is safe: offers for the slug are replaced, everything else is overwritten.
Run: python scripts/content-pipeline/apply-wave.py slug [slug ...]
"""
import hashlib, json, os, subprocess, sys, urllib.parse
import requests

DB = os.environ["SUPABASE_DB_URL"]  # read-only lookups
REST = os.environ["SUPABASE_URL"] + "/rest/v1"
SK = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
H = {"apikey": SK, "Authorization": f"Bearer {SK}", "Content-Type": "application/json"}
UA = {"User-Agent": "minialife-content-pipeline/1.0 (https://minialife.com)"}
ROUTES = "src/data/routes.json"
CARDS = "src/data/destinationCardPhotos.wave.json"
IMG_DIR = "public/images/destination-cards"


def q(sql):
    return subprocess.check_output(["psql", DB, "-v", "ON_ERROR_STOP=1", "-Atc", sql], text=True).strip()


def lit(v):
    if v is None:
        return "NULL"
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, list):
        return "ARRAY[" + ",".join(lit(x) for x in v) + "]::text[]" if v else "'{}'::text[]"
    return "'" + str(v).replace("'", "''") + "'"


def credit(p):
    return f"{p['credit']} / {p['license']} via Wikimedia Commons"


def mirror(p):
    name = hashlib.sha256(p["source"].encode()).hexdigest()[:16] + ".jpg"
    path = f"{IMG_DIR}/{name}"
    if not os.path.exists(path):
        url = p["url"].replace("/1920px-", "/1280px-")
        r = requests.get(url, headers=UA, timeout=60)
        if not r.ok:
            r = requests.get(p["url"], headers=UA, timeout=60)
        r.raise_for_status()
        open(path, "wb").write(r.content)
    return {"subject": p["subject"], "url": f"/images/destination-cards/{name}", "source": p["source"],
            "credit": p["credit"], "license": p["license"]}


def offers(d, dest_id):
    name, short, code = d["name"], d["name"].replace(" National Park", ""), d["airport"]["code"]
    enc = urllib.parse.quote(name)
    state = (d["state"] or "").lower().replace(" ", "-")
    rows = [
        ("stay", "roverpass", "awin", 32065, "RV Park", f"RV parks near {name} on RoverPass",
         f"https://www.roverpass.com/search?q={enc}", None, None, None,
         "Book RV parks and campgrounds online with full hookups near the park.", None, None),
        ("stay", "campspot", "awin", 22326, "Campground", f"Campsites near {name} on Campspot",
         f"https://www.campspot.com/search?location={enc}", None, None, None,
         "Private campgrounds, cabins and glamping just outside the park, often with availability when park sites sell out.", None, None),
        ("stay", "harvest_hosts", "awin", 111454, "RV Park", f"Harvest Hosts stays on the way to {name}",
         "https://www.harvesthosts.com", None, None, None,
         "Membership for overnight RV stays at farms, wineries and other unique spots along your route.", None, None),
        ("rv_rental", "rentcars", "awin", 18808, "Car rental", f"Car rentals at {code}",
         "https://www.rentcars.com/en/", None, None, None,
         "Compare rental companies at the nearest airport in one search.", None, None),
        ("rv_rental", "rvshare", None, None, "RV", "Class C Motorhome — Sleeps 4",
         f"https://rvshare.com/rv-rental/{state}", "$245/day", 245, "day",
         "Wake up wherever the view is best — no check-in desk, no curfew.",
         "Full kitchen, queen bed, fits scenic byways without stress.", None),
        ("rv_rental", "rvshare", None, None, "Campervan", "Sprinter Adventure Van",
         f"https://rvshare.com/rv-rental/{state}", "$189/day", 189, "day",
         "Small enough to park at the trailhead, comfy enough to sleep in.",
         "Off-grid solar, fold-out bed, parks almost anywhere.", None),
    ]
    for a in d["ai"]["activities"][:3]:
        rows.append(("activity", "viator", "awin", 11018, "Activity", a,
                     f"https://www.viator.com/searchResults/all?text={urllib.parse.quote(short + ' ' + a)}",
                     "Varies", None, "person", f"One of the classic ways to experience {short}.",
                     f"Compare guided and bookable options for {a} on Viator.", None))
    rows.append(("gear_purchase", "jackery", "awin", 59183, "Power", "Jackery Portable Power Station",
                 "https://www.jackery.com", None, None, None,
                 "Keeps phones, lights and a cooler charged at campsites without hookups.", None, None))
    for t, price, why, desc in [
        ("Insulated 32oz Bottle", 38, "One fill in the morning is all most day hikes need.", "Stays cold 24h on the trail."),
        ("Merino Base Layer", 89, "Handles a 30-degree swing between sunrise and lunch without a change.", "Warm at dawn, breathable by noon."),
        ("Headlamp 400 Lumen", 45, "The difference between finishing a sunset hike and turning back early.", "Hands-free for setting up after dark."),
        ("Pocket First-Aid Kit", 28, "Twenty dollars now beats cutting a trip short over a blister.", "The one thing you'll wish you packed."),
        ("Packable Down Jacket", 165, "Weighs nothing in your pack and saves every cold evening.", "Shockingly warm. Fits in its own pocket."),
    ]:
        rows.append(("gear_purchase", "rei", None, None, "Essential", t,
                     f"https://www.rei.com/search?q={urllib.parse.quote(t)}", f"${price}", price, "item", why, desc, None))
    keys = ["category", "partner", "network", "network_mid", "subcategory", "title", "external_url",
            "price_display", "price_value", "price_unit", "why_recommended", "description", "duration"]
    return [{"destination_id": dest_id, **dict(zip(keys, r))} for r in rows]


def apply(slug):
    d = json.load(open(f"/tmp/wave/{slug}.json"))
    a, ai, rt = d["airport"], d["ai"], d["route"]
    dest_id = q(f"select id from destinations where slug={lit(slug)}")
    photo_credit = f"Hero: {credit(d['hero'])} · Gallery: " + "; ".join(credit(p) for p in d["gallery"])
    sets = {
        "hero_image": d["hero"]["url"], "gallery": [p["url"] for p in d["gallery"]], "photo_credit": photo_credit,
        "region": ai["region"], "tagline": ai["tagline"], "best_season": ai["best_season"],
        "best_seasons": ai["best_seasons"], "scenic_score": ai["scenic_score"], "camping_score": ai["camping_score"],
        "avg_daily_budget": ai["avg_daily_budget"], "trip_duration_days": ai["trip_duration_days"],
        "recommended_duration": ai["recommended_duration"], "aliases": ai["aliases"],
        "gateway_cities": ai["gateway_cities"], "similar_slugs": ai["similar_slugs"], "trip_tags": ai["trip_tags"],
        "seo_title": ai["seo_title"], "seo_description": ai["tagline"],
        "nearest_airport_code": a["code"], "nearest_airport_name": a["name"],
        "airport_lat": a["lat"], "airport_lng": a["lng"], "lat": round(d["lat"], 4), "lng": round(d["lng"], 4),
        "drive_minutes": rt and rt["minutes"], "drive_miles": rt and rt["miles"],
    }
    sets["permit_level"] = ai["permit_level"]
    requests.patch(f"{REST}/destinations?slug=eq.{slug}", json=sets, headers=H).raise_for_status()
    requests.delete(f"{REST}/offers?destination_id=eq.{dest_id}", headers=H).raise_for_status()
    requests.post(f"{REST}/offers", json=offers(d, dest_id), headers=H).raise_for_status()

    routes = json.load(open(ROUTES))
    if rt:
        routes[slug] = rt["coords"]
    json.dump(routes, open(ROUTES, "w"), separators=(",", ":"))
    cards = json.load(open(CARDS)) if os.path.exists(CARDS) else {}
    cards[slug] = {"activity": [mirror(p) for p in d["activity"]], "toolkit": [mirror(p) for p in d["toolkit"]]}
    json.dump(cards, open(CARDS, "w"), indent=1, ensure_ascii=False)
    return "applied"


if __name__ == "__main__":
    for s in sys.argv[1:]:
        try:
            print(s, apply(s), flush=True)
        except Exception as e:  # noqa
            print(s, "ERR", e, flush=True)
