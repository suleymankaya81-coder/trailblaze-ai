"""One-off: write the 4 search pages (best time, things to do, itinerary,
glamping) for every published destination with the AI gateway and save them
to /tmp/landing/<slug>.json. Insert step: insert-landing-pages.py.
Run: python scripts/content-pipeline/generate-landing-pages.py [slug ...]
"""
import json, os, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, "/tmp")
from lovable_ai import call_ai_json  # copied from the ai-gateway skill

MODEL = "google/gemini-3-flash-preview"
OUT = "/tmp/landing"
MIN_WORDS = 600


def words(p):
    return len((p["intro"] + " " + " ".join(x["body"] for x in p["sections"])).split())
os.makedirs(OUT, exist_ok=True)

SYSTEM = """You write practical US outdoor travel guide pages for MiniaLife.
Rules: use only widely known, stable facts about the place; no exact prices,
no price guarantees, no "best deal", no safety or medical guarantees; describe
costs as rough estimates; never invent specific business names, phone numbers
or opening hours; recommend checking the official park/NPS site for current
conditions and reservations. Plain, warm, specific American English.
Return JSON only."""

PROMPT = """Destination facts (JSON): {facts}

Write 4 pages. Return JSON:
{{"pages": {{
 "best_time": P, "things_to_do": P, "itinerary": P, "glamping": P
}}}}
where P = {{"seo_title": <= 60 chars, includes the target keyword,
 "seo_description": 140-160 chars,
 "h1": page heading,
 "intro": 2-3 sentences (60-90 words),
 "sections": [{{"heading": str, "body": 125-170 words, paragraphs separated by \\n\\n}}] x 5}}
Each page MUST total at least 650 words (intro + all section bodies). Never pad with filler; add concrete, place-specific detail.
Target keywords: best_time="best time to visit {name}", things_to_do="things to do in {name}",
itinerary="{name} itinerary", glamping="{name} glamping".
best_time: season by season, crowds, weather, reservations timing.
things_to_do: top experiences, hikes/scenic drives, wildlife or water, with kids, rainy day.
itinerary: day-by-day plan (Day 1, Day 2, Day 3 ...) using the airport/drive facts, plus tips.
glamping: what glamping looks like near here, where in the area (towns/gateway areas, not invented businesses), season, glamping vs camping vs RV."""


def facts(slug):
    sql = f"""select row_to_json(t) from (select slug,name,region,state,tagline,best_season,
      best_seasons,experience_tags,trip_tags,gateway_cities,recommended_duration,
      nearest_airport_name,nearest_airport_code,drive_minutes,drive_miles,permit_level,
      avg_daily_budget from destinations where slug='{slug}') t"""
    return subprocess.check_output(["psql", os.environ["SUPABASE_DB_URL"], "-Atc", sql], text=True).strip()


def run(slug):
    path = f"{OUT}/{slug}.json"
    if os.path.exists(path):
        return slug, "cached"
    f = facts(slug)
    name = json.loads(f)["name"]
    short = name.replace(" National Park", "")
    data = None
    for attempt in range(3):  # 1 normal + 1 rewrite for short pages; transient errors retried with backoff
        try:
            d = call_ai_json(PROMPT.format(facts=f, name=short), model=MODEL, system=SYSTEM)
        except Exception as e:
            code = getattr(e, "status", None) or getattr(e, "code", None)
            if code in (402, 403) or attempt == 2:
                raise
            time.sleep(10 * (attempt + 1)); continue
        if isinstance(d, str):
            d = json.loads(d)
        assert set(d["pages"]) == {"best_time", "things_to_do", "itinerary", "glamping"}
        short_pages = [k for k, p in d["pages"].items() if words(p) < MIN_WORDS]
        data = d
        if not short_pages:
            break
    if [k for k, p in data["pages"].items() if words(p) < MIN_WORDS]:
        raise ValueError("pages under %d words after rewrite" % MIN_WORDS)
    json.dump({"slug": slug, "short": short, **data}, open(path, "w"), indent=1)
    return slug, "ok"


def _safe(s):
    try:
        return run(s)
    except Exception as e:  # noqa
        return s, f"ERR {e}"


if __name__ == "__main__":
    slugs = sys.argv[1:] or subprocess.check_output(
        ["psql", os.environ["SUPABASE_DB_URL"], "-Atc",
         "select slug from destinations where status='published' order by slug"], text=True).split()
    with ThreadPoolExecutor(4) as ex:
        for s, r in ex.map(lambda s: _safe(s), slugs):
            print(s, r, flush=True)
