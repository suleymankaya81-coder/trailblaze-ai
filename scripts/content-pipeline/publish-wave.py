"""Tier rollout step 4: publish a wave only where every check passes.
Checks per destination: cover photo + credit, location + airport + drive,
at least 15 partner offers, 4 guide pages, a precomputed route line and
activity card photos. Failures stay unpublished and are listed.
Run: python scripts/content-pipeline/publish-wave.py slug [slug ...]
"""
import json, os, sys
import requests

REST = os.environ["SUPABASE_URL"] + "/rest/v1"
SK = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
H = {"apikey": SK, "Authorization": f"Bearer {SK}", "Content-Type": "application/json"}
routes = json.load(open("src/data/routes.json"))
cards = json.load(open("src/data/destinationCardPhotos.wave.json"))


def get(path):
    r = requests.get(f"{REST}/{path}", headers=H)
    r.raise_for_status()
    return r.json()


held = []
for slug in sys.argv[1:]:
    d = get(f"destinations?slug=eq.{slug}&select=id,hero_image,photo_credit,lat,nearest_airport_code,drive_minutes")[0]
    offers = get(f"offers?destination_id=eq.{d['id']}&select=id")
    pages = get(f"seo_landing_pages?destination_id=eq.{d['id']}&select=id")
    c = cards.get(slug, {})
    problems = [msg for ok, msg in [
        (d["hero_image"] and d["photo_credit"], "cover photo"),
        (d["lat"] is not None and d["nearest_airport_code"] and d["drive_minutes"], "location/airport/drive"),
        (len(offers) >= 15, f"offers {len(offers)}"),
        (len(pages) == 4, f"guides {len(pages)}"),
        (slug in routes, "route line"),
        (len(c.get("activity", [])) >= 3, "activity card photos"),
    ] if not ok]
    if problems:
        held.append((slug, problems))
        print(slug, "HELD", problems)
        continue
    requests.patch(f"{REST}/destinations?slug=eq.{slug}", json={"status": "published", "seo_eligible": True},
                   headers=H).raise_for_status()
    print(slug, "published")
print(f"held back: {len(held)}")
