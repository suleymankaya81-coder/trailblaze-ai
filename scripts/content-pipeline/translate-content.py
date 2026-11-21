"""Translate destination page text once into content_translations (no per-visit AI).
Resumable: places that already have a row for the locale are skipped unless --force.
Run: python scripts/content-pipeline/translate-content.py --locale de --pilot [slug ...] [--force]   |   --locale de --all  (every published place, resumable)
"""
import json, os, sys
import requests
from placeholder_gate import find_blocked_text

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
run_all = "--all" in args
if not run_all and ("--pilot" in args or not slugs):
    slugs = slugs or PILOT
lang = LOCALE_NAMES[locale]
# Reviewed terms from the 2026-11 translation audit (scripts/audits/translations-2026-11/report.md).
GLOSSARY = {
    "de": ('Glossary: "Parking check" = "Parken", "Access check" = "Zugang", "Timing check" = "Beste Reisezeit", '
           '"Fuel check" = "Tanken", "Signal check" = "Mobilfunkempfang", "Suggested:" = "Vorschlag:", '
           '"onward transfers" = "Anschlussverbindungen", "trailhead" = "Wanderparkplatz", "trail" = "Wanderweg" (never "Zug"), '
           '"campground" = "Campingplatz", "timed entry permit" = "Zeitfenster-Ticket", "4WD" = "Allradantrieb", '
           '"ferry" = "Fähre", "shuttle" = "Shuttle", "ranger station" = "Rangerstation", '
           '"the reviewed sources do not establish" = "die geprüften Quellen belegen keine".'),
    "fr": ('Glossaire : "Timing check" = "Horaires", "Parking check" = "Stationnement", "Fuel check" = "Carburant", '
           '"trailhead" = "départ de sentier", "campground" = "camping", "timed entry permit" = "réservation à créneau horaire", '
           '"4WD" = "4x4", "ferry" = "ferry", "shuttle" = "navette", "ranger station" = "poste des rangers". '
           'Do not put "le/au/du" in front of a place name that has no French article (write "pour Ærø", "à Lovund", "de Sørøya"). '
           'Use French typography: a space before : ; ! ? and « » quotes.'),
}


def fit_words(text: str, limit: int) -> str:
    """Shorten at a word boundary; never leave a cut word such as "itinéraire et co"."""
    text = text.strip()
    if len(text) <= limit:
        return text
    cut = text[: limit - 1]
    return cut[: cut.rfind(" ")].rstrip(" ,;:–-") + "…" if " " in cut else text[:limit]


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
slug_filter = "" if run_all else f"&slug=in.({','.join(slugs)})"
rows = requests.get(
    f"{REST}/destinations?status=eq.published{slug_filter}&order=slug"
    "&select=slug,name,region,tagline,best_season,permit_headline,permit_note,travel_plan", headers=H).json()

def work(d):
    if d["slug"] in existing and not force:
        return
    plan = d.get("travel_plan") or {}
    source = {
        "name": d["name"], "region": d["region"], "tagline": d["tagline"], "bestSeason": d["best_season"],
        "permitHeadline": d["permit_headline"], "permitNote": d["permit_note"],
        "days": plan.get("days", []), "intel": [{"title": i["title"], "text": i["text"]} for i in plan.get("intel", [])],
        "arrival": plan.get("arrival"), "vehicle": plan.get("vehicle"), "goldenHour": plan.get("goldenHour"),
    }
    prompt = f"""Translate this U.S. road-trip guide content from English into natural, fluent {lang} for travellers from that country.
Return JSON with exactly the same keys and structure, plus "metaTitle" (max 60 chars, includes the place name and a {lang} search phrase like "Roadtrip" or "Reiseplan") and "metaDescription" (max 155 chars).
Rules: keep official proper names (park names, trails, roads, towns) in their usual form; when the source gives miles, keep miles and add km in brackets the first time; when the source gives km, write only km and never add miles; do not add facts, prices, guarantees or urgency; null stays null.
Never output the markers "[dated source]" or "Check official seasonal information" (drop that sentence instead). Capitalise every German noun.
{GLOSSARY.get(locale, "")}
SOURCE JSON:
{json.dumps(source, ensure_ascii=False)}"""
    try:
        out = ai_json(prompt)
    except Exception as e:  # noqa: BLE001
        print(d["slug"], "FAILED", e, flush=True); return
    if isinstance(out, list) and len(out) == 1: out = out[0]
    if not isinstance(out, dict):
        print(d["slug"], "REJECTED (not object)", flush=True); return
    ok = (out.get("name") and out.get("metaTitle") and out.get("metaDescription")
          and len(out.get("days", [])) == len(source["days"]) and len(out.get("intel", [])) == len(source["intel"]))
    if not ok:
        print(d["slug"], "REJECTED (structure)", flush=True); return
    out["metaTitle"] = fit_words(out["metaTitle"], 60)
    out["metaDescription"] = fit_words(out["metaDescription"], 160)
    if find_blocked_text(out):
        print(d["slug"], "REJECTED (placeholder text)", flush=True); return
    res = requests.post(f"{REST}/content_translations?on_conflict=entity_type,entity_id,locale",
                        headers={**H, "Prefer": "resolution=merge-duplicates"},
                        json={"entity_type": "destination", "entity_id": d["slug"], "locale": locale,
                              "fields": out, "status": "published", "updated_at": "now()"})
    print(d["slug"], "saved" if res.ok else f"ERROR {res.status_code} {res.text[:200]}", flush=True)


from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(work, rows))
