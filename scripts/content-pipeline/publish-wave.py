"""Tier rollout step 4: publish a wave only where every check passes.
Checks per destination: cover photo + credit, location + airport + drive,
at least 15 partner offers, a precomputed route line,
activity card photos, and no placeholder text ("[dated source]", "[source datée]",
"[datierter Quelle]", "[datiert Quelle]", "Check official seasonal information") in the English
page or its stored translations. Failures stay unpublished and are listed.
Run: python scripts/content-pipeline/publish-wave.py slug [slug ...]
"""
import json, os, sys
import requests
from combined_content import module
from visit_policy import required_offer_count, requires_activity_photos
from placeholder_gate import publication_problems
from indexnow import destination_url, notify

validate_travel = module('publish_travel', 'generate-travel-content.py').validate

def complete_plan(destination):
    try:
        validate_travel({'plan': destination['travel_plan'], 'headline': destination['permit_headline'],
                         'reservation': destination['permit_note'], 'source_url': destination['permit_source_url']})
        return True
    except (AssertionError, KeyError, TypeError, ValueError):
        return False

REST = os.environ["SUPABASE_URL"] + "/rest/v1"
SK = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
H = {"apikey": SK, "Authorization": f"Bearer {SK}", "Content-Type": "application/json"}
routes = json.load(open("src/data/routes.json"))
cards = json.load(open("src/data/destinationCardPhotos.wave.json"))
review = json.load(open("scripts/content-pipeline/canada/review.json"))


def get(path):
    r = requests.get(f"{REST}/{path}", headers=H)
    r.raise_for_status()
    return r.json()


held = []
published_urls = []
for slug in sys.argv[1:]:
    d = get(f"destinations?slug=eq.{slug}&select=id,hero_image,photo_credit,lat,lng,nearest_airport_code,drive_minutes,permit_headline,permit_note,permit_source_url,travel_plan,country_code,region_slug,access_type,tagline,seo_title,seo_description,best_season")[0]
    offers = get(f"offers?destination_id=eq.{d['id']}&select=id")
    translations = get(f"content_translations?entity_type=eq.destination&entity_id=eq.{slug}&select=locale,fields")
    c = review.get("photoDecisions", {}).get(slug, cards.get(slug, {}))
    problems = [msg for ok, msg in [
        (slug not in {r["slug"] for r in review.get("photoNeeds", [])}, "reviewed photo blocker"),
        (d["hero_image"] and d["photo_credit"], "cover photo"),
        (d["lat"] is not None and d["lng"] is not None and d["nearest_airport_code"] and (d["drive_minutes"] or d.get("access_type") in ("fly-in", "ferry")), "location/airport/drive"),
        (len(offers) >= required_offer_count(d['country_code'], d.get('travel_plan')), f"offers {len(offers)}"),
        (slug in routes, "route line"),
        (d["permit_note"], "reservation note"),
        (complete_plan(d), "local visit plan and field intel"),
        (not requires_activity_photos(d['country_code']) or (len(c.get("activity", [])) >= min(3, len({s['name'] for day in (d.get('travel_plan') or {}).get('days', []) for s in day['stops']})) and bool(c.get('activity'))), "activity card photos"),
    ] if not ok] + publication_problems(d, translations)
    if problems:
        held.append((slug, problems))
        print(slug, "HELD", problems)
        continue
    requests.patch(f"{REST}/destinations?slug=eq.{slug}", json={"status": "published", "seo_eligible": True},
                   headers=H).raise_for_status()
    # A province/state page becomes visible once it has a published place.
    requests.patch(f"{REST}/regions?country_code=eq.{d['country_code']}&slug=eq.{d['region_slug']}",
                   json={"status": "published"}, headers=H).raise_for_status()
    saved = get(f"destinations?slug=eq.{slug}&select=status,seo_eligible")[0]
    if saved != {'status': 'published', 'seo_eligible': True}:
        raise ValueError('Publication did not read back: ' + slug)
    print(slug, "published")
    published_urls.append(destination_url(d["country_code"], d["region_slug"], slug))
    published_urls += [destination_url(d["country_code"], d["region_slug"], slug, t["locale"]) for t in translations if t["locale"] in ("de", "fr")]
print(f"held back: {len(held)}")
# Tell IndexNow engines about the newly published pages (a failed ping never undoes the publish).
notify(published_urls)
