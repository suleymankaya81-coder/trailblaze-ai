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


def q(sql):
    return subprocess.check_output(["psql", DB, "-v", "ON_ERROR_STOP=1", "-Atc", sql], text=True)


def lit(s):
    return "NULL" if s is None else "'" + str(s).replace("'", "''") + "'"


def shingles(t, k=5):
    w = re.findall(r"[a-z']+", t.lower())
    return {" ".join(w[i:i + k]) for i in range(len(w) - k)}


docs = [json.load(open(f)) for f in sorted(glob.glob("/tmp/landing/*.json"))]
glamping_ok = set(q("""select distinct d.slug from offers o join destinations d on d.id=o.destination_id
  where o.category='stay' and o.network in ('awin','info')""").split())

rows = []
for d in docs:
    for key, p in d["pages"].items():
        text = p["intro"] + " " + " ".join(s["body"] for s in p["sections"])
        rows.append((d, key, p, text, shingles(text)))

for d, key, p, text, sh in rows:
    ptype, suffix, prio, kw = TYPES[key]
    words = len(text.split())
    reason = None
    if words < 450:
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
    sql = f"""insert into seo_landing_pages (destination_id,path,page_type,target_keyword,search_volume,
      keyword_difficulty,priority,seo_title,seo_description,intro_content,content_sections,inventory_filter,
      content_status,status,indexable,noindex_reason,canonical_url,published_at,last_content_reviewed_at)
      select id,{lit(path)},'{ptype}',{lit(kw.format(n=d['short'].lower()))},{vol or 'NULL'},{kd or 'NULL'},{prio},
      {lit(p['seo_title'])},{lit(p['seo_description'])},{lit(p['intro'])},{lit(json.dumps(sections))}::jsonb,
      {lit(json.dumps({'type': ptype}))}::jsonb,'ready','published',{'false' if reason else 'true'},{lit(reason)},
      {lit('https://minialife.com' + path)},now(),now() from destinations where slug={lit(d['slug'])}
      on conflict (path) do update set seo_title=excluded.seo_title,seo_description=excluded.seo_description,
      intro_content=excluded.intro_content,content_sections=excluded.content_sections,indexable=excluded.indexable,
      noindex_reason=excluded.noindex_reason,last_content_reviewed_at=now()"""
    q(sql)
    print(path, words, reason or "indexable")
