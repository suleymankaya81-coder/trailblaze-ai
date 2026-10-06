"""One-off: quality-check /tmp/landing/*.json and upsert into seo_landing_pages.
Thin (<450 words) or near-duplicate pages and glamping pages without a fitting
stay offer are saved with indexable=false + noindex_reason."""
import glob, json, os, re, subprocess

TYPES = {  # key -> (page_type, path suffix, priority, keyword template)
    "best_time": ("best_time", "best-time-to-visit", 40, "best time to visit {n}"),
    "things_to_do": ("things_to_do", "things-to-do", 30, "things to do in {n}"),
    "itinerary": ("trip_planner", "itinerary", 20, "{n} itinerary"),
    "glamping": ("glamping", "glamping", 10, "{n} glamping"),
}
# Semrush US estimates (volume, difficulty) gathered earlier.
SEMRUSH = {("yellowstone", "best_time"): (6600, 29), ("yellowstone", "things_to_do"): (4400, 23),
           ("yellowstone", "itinerary"): (1000, 13), ("yellowstone", "glamping"): (590, 13)}
DB = os.environ["SUPABASE_DB_URL"]
import requests, datetime
URL = os.environ["SUPABASE_URL"]; SK = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
H = {"apikey": SK, "Authorization": f"Bearer {SK}", "Prefer": "resolution=merge-duplicates"}
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()


def q(sql):
    return subprocess.check_output(["psql", DB, "-v", "ON_ERROR_STOP=1", "-Atc", sql], text=True)


def fit_title(t):
    """Keep search titles within ~60 chars (Google truncates longer ones)."""
    if len(t) <= 60:
        return t
    for sep in (" | ", ": ", " – ", " - "):
        head = t.split(sep)[0]
        if sep in t and 20 <= len(head) <= 60:
            return head
    t2 = re.sub(r"^(\d+ Best|Top|The Ultimate|The Best)\s+", "", t)
    t2 = t2[0].upper() + t2[1:]
    return t2 if len(t2) <= 60 else t2[:57].rsplit(" ", 1)[0] + "…"


def fit_desc(s):
    """Keep meta descriptions within 160 chars, ending on a sentence when possible."""
    if len(s) <= 160:
        return s
    cut = s[:160]
    i = max(cut.rfind(". "), cut.rfind("! "))
    return cut[:i + 1] if i >= 110 else cut[:157].rsplit(" ", 1)[0].rstrip(",;:") + "…"


def lit(s):
    return "NULL" if s is None else "'" + str(s).replace("'", "''") + "'"


def shingles(t, k=5):
    w = re.findall(r"[a-z']+", t.lower())
    return {" ".join(w[i:i + k]) for i in range(len(w) - k)}


MIN_WORDS = int(os.environ.get("MIN_WORDS", "600"))
docs = [json.load(open(f)) for f in sorted(glob.glob("/tmp/landing/*.json"))]
glamping_ok = set(q("""select distinct d.slug from offers o join destinations d on d.id=o.destination_id
  where o.category='stay' and o.network in ('awin','info')""").split())

dest_ids = dict(l.split("|") for l in q("select slug,id from destinations").split())
rows = []
for d in docs:
    for key, p in d["pages"].items():
        text = p["intro"] + " " + " ".join(s["body"] for s in p["sections"])
        rows.append((d, key, p, text, shingles(text)))

for d, key, p, text, sh in rows:
    ptype, suffix, prio, kw = TYPES[key]
    words = len(text.split())
    reason = None
    if words < MIN_WORDS:
        reason = f"thin: {words} words"
    else:
        for d2, k2, _, _, sh2 in rows:
            if k2 == key and d2["slug"] < d["slug"] and sh and len(sh & sh2) / len(sh | sh2) > 0.2:
                reason = f"near-duplicate of {d2['slug']}"
                break
    if not reason and key == "glamping" and d["slug"] not in glamping_ok:
        reason = "no glamping stays to show yet"
    vol, kd = SEMRUSH.get((d["slug"], key), (None, None))
    sections = [{"type": "h1", "text": p["h1"]}] + [
        {"type": "text", "heading": s["heading"], "body": s["body"]} for s in p["sections"]]
    path = f"/{d['slug']}-{suffix}"
    row = {"destination_id": dest_ids[d["slug"]], "path": path, "page_type": ptype,
           "target_keyword": kw.format(n=d["short"].lower()), "search_volume": vol, "keyword_difficulty": kd,
           "priority": prio, "seo_title": fit_title(p["seo_title"]), "seo_description": fit_desc(p["seo_description"]),
           "intro_content": p["intro"], "content_sections": sections, "inventory_filter": {"type": ptype},
           "content_status": "ready", "status": "published", "indexable": not reason, "noindex_reason": reason,
           "canonical_url": "https://minialife.com" + path, "published_at": "now()", "last_content_reviewed_at": "now()"}
    row["published_at"] = row["last_content_reviewed_at"] = NOW
    r = requests.post(f"{URL}/rest/v1/seo_landing_pages?on_conflict=path", json=row, headers=H)
    r.raise_for_status()
    print(path, words, reason or "indexable")
