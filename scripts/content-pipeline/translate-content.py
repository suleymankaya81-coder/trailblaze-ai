"""Translate destination page text once into content_translations (no per-visit AI).
Resumable: places that already have a row for the locale are skipped unless --force.
Run: python scripts/content-pipeline/translate-content.py --locale de --pilot [slug ...] [--force]
"""
import json, os, sys
import requests

LOCALE_NAMES = {"de": "German", "fr": "French", "es": "Spanish", "nl": "Dutch", "it": "Italian"}
PILOT = ["yellowstone", "yosemite", "grand-canyon", "zion", "arches-national-park", "glacier",
         "grand-teton", "bryce-canyon", "rocky-mountain", "great-smoky-mountains"]
REST = os.environ["SUPABASE_URL"] + "/rest/v1"
SK = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
H = {"apikey": SK, "Authorization": f"Bearer {SK}", "Content-Type": "application/json"}
MODEL = "google/gemini-3-flash-preview"

args = sys.argv[1:]
force = "--force" in args
locale = args[args.index("--locale") + 1] if "--locale" in args else "de"
slugs = [a for a in args if not a.startswith("--") and a != locale]
if "--pilot" in args or not slugs:
    slugs = slugs or PILOT
lang = LOCALE_NAMES[locale]


def ai_json(prompt: str) -> dict:
    r = requests.post(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        headers={"Authorization": f"Bearer {os.environ['LOVABLE_API_KEY']}", "Content-Type": "application/json"},
        json={"model": MODEL, "messages": [{"role": "user", "content": prompt}], "response_format": {"type": "json_object"}},
        timeout=180,
    )
    if r.status_code in (402, 429):
        sys.exit(f"AI gateway stopped: {r.status_code}")
    r.raise_for_status()
    text = r.json()["choices"][0]["message"]["content"].strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0]
    return json.loads(text)


existing = {row["entity_id"] for row in requests.get(
    f"{REST}/content_translations?select=entity_id&entity_type=eq.destination&locale=eq.{locale}", headers=H).json()}
rows = requests.get(
    f"{REST}/destinations?status=eq.published&slug=in.({','.join(slugs)})"
    "&select=slug,name,region,tagline,best_season,permit_headline,permit_note,travel_plan", headers=H).json()

for d in rows:
    if d["slug"] in existing and not force:
        print(d["slug"], "skip (exists)"); continue
    plan = d.get("travel_plan") or {}
    source = {
        "name": d["name"], "region": d["region"], "tagline": d["tagline"], "bestSeason": d["best_season"],
        "permitHeadline": d["permit_headline"], "permitNote": d["permit_note"],
        "days": plan.get("days", []), "intel": [{"title": i["title"], "text": i["text"]} for i in plan.get("intel", [])],
        "arrival": plan.get("arrival"), "vehicle": plan.get("vehicle"), "goldenHour": plan.get("goldenHour"),
    }
    prompt = f"""Translate this U.S. road-trip guide content from English into natural, fluent {lang} for travellers from that country.
Return JSON with exactly the same keys and structure, plus "metaTitle" (max 60 chars, includes the place name and a {lang} search phrase like "Roadtrip" or "Reiseplan") and "metaDescription" (max 155 chars).
Rules: keep official proper names (park names, trails, roads, towns) in their usual form; keep miles but add km in brackets the first time distances appear; do not add facts, prices, guarantees or urgency; null stays null.
SOURCE JSON:
{json.dumps(source, ensure_ascii=False)}"""
    try:
        out = ai_json(prompt)
    except Exception as e:  # noqa: BLE001
        print(d["slug"], "FAILED", e); continue
    ok = (out.get("name") and out.get("metaTitle") and out.get("metaDescription")
          and len(out.get("days", [])) == len(source["days"]) and len(out.get("intel", [])) == len(source["intel"]))
    if not ok:
        print(d["slug"], "REJECTED (structure)"); continue
    out["metaTitle"] = out["metaTitle"][:60]
    out["metaDescription"] = out["metaDescription"][:160]
    res = requests.post(f"{REST}/content_translations?on_conflict=entity_type,entity_id,locale",
                        headers={**H, "Prefer": "resolution=merge-duplicates"},
                        json={"entity_type": "destination", "entity_id": d["slug"], "locale": locale,
                              "fields": out, "status": "published", "updated_at": "now()"})
    print(d["slug"], "saved" if res.ok else f"ERROR {res.status_code} {res.text[:200]}")
