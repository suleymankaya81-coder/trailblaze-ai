"""Render branded 1000x1500 Pinterest pin cards once, upload them to the private
`pins` bucket and record long-lived signed URLs in public.pin_assets.

Usage:
  python3 render-pins.py --sample          # 10 local samples in /tmp/pins/out
  python3 render-pins.py --all [--force]   # render + upload every missing pin
Fonts: Fraunces + Inter TTFs in /tmp/pins/fonts (Google Fonts, OFL).
"""
import datetime, hashlib, io, json, os, re, subprocess, sys, threading, time
from concurrent.futures import ThreadPoolExecutor
import requests
from PIL import Image, ImageDraw, ImageFont, ImageStat
from pin_schedule import release_schedule
import pin_copy_v2

# v1 = approved 2026-10-16 batch (never re-rendered). v2 = "Design the Exit" copy:
# intent-first kicker, concrete next step (days, airport, drive, booking) on the card.
VERSION = 2
W, H, PAD = 1000, 1500, 64
FONTS = "/tmp/pins/fonts"
OUT = "/tmp/pins/out"
DB = os.environ["SUPABASE_DB_URL"]
URL = os.environ["SUPABASE_URL"]; SK = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
AUTH = {"apikey": SK, "Authorization": f"Bearer {SK}"}
FOREST, SAGE, OFF, SAND = (29, 59, 43), (185, 207, 189), (251, 250, 246), (232, 224, 210)
CACHE = "/tmp/pins/photo-cache"
PHOTO_LOCKS = {}
PHOTO_LOCK_GUARD = threading.Lock()
BASE = "https://minialife.com"
CSV_DIR = "/mnt/documents/pinterest"
CSV_DAILY = 100  # manual uploads: half the RSS allowance, on days RSS is idle

KICKER = {"destination": "ROAD TRIP PLAN", "best_time": "WHEN TO GO", "things_to_do": "WHAT TO DO THERE",
          "glamping": "WHERE TO SLEEP", "trip_planner": "DAY-BY-DAY PLAN",
          "loop": "MULTI-PARK ROAD TRIP", "rv_camping": "RV & CAMPING TRIP", "corridor": "GATEWAY ROAD TRIP"}
CTA = {"destination": "Get the route →", "best_time": "Pick your dates →", "things_to_do": "Plan your days →",
       "glamping": "Find your stay →", "trip_planner": "Get the plan →", "loop": "Get the loop map →",
       "rv_camping": "Plan the RV trip →", "corridor": "Get the route →"}
FEED = {"destination": "parks", "trip_planner": "parks", "best_time": "best-time",
        "things_to_do": "things-to-do", "glamping": "rv", "loop": "road-trips", "rv_camping": "rv-camping",
        "corridor": "road-trips"}
CSV_KINDS = {"loop", "rv_camping", "corridor"}
BOARD = {"road-trips": "US Road Trip Routes", "rv-camping": "RV Camping Trips USA"}


def q(sql):
    return subprocess.check_output(["psql", DB, "-v", "ON_ERROR_STOP=1", "-Atc", sql], text=True)


def font(name, size, weight, opsz=None):
    f = ImageFont.truetype(f"{FONTS}/{name}.ttf", size)
    axes = {a["name"]: a for a in f.get_variation_axes()}
    vals = []
    for a in f.get_variation_axes():
        n = a["name"]
        vals.append(weight if n == b"Weight" else (opsz or min(size, a["maximum"])) if n in (b"Optical Size", b"Optical size") else 0 if n == b"Wonky" else a["default"])
    f.set_variation_by_axes(vals)
    return f


def dur_label(d):
    return re.sub(r"\s*days?$", "", d or "", flags=re.I).replace("-", "–") + "-day itinerary" if d else "Day-by-day plan"


def lines_for(text, fnt, maxw, draw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=fnt) <= maxw or not cur:
            cur = t
        else:
            lines.append(cur); cur = w
    lines.append(cur)
    return lines


def fit_one(text, name, start, minsize, weight, maxw, draw):
    size = start
    while size > minsize:
        f = font(name, size, weight)
        if draw.textlength(text, font=f) <= maxw:
            return f, text
        size -= 2
    f = font(name, minsize, weight)
    while draw.textlength(text + "…", font=f) > maxw and " " in text:
        text = text.rsplit(" ", 1)[0].rstrip(",·–")
    return f, text if draw.textlength(text, font=f) <= maxw else text


def parse_credit(raw, license_=None):
    if not raw:
        return None
    raw = re.sub(r"<[^>]+>", "", raw)
    if license_ is None:
        m = re.search(r"Hero:\s*(.+?)\s*/\s*(.+?)\s+via", raw)
        if not m:
            return None
        author, license_ = m.group(1), m.group(2)
    else:
        author = raw
    if re.search(r"public domain|cc0|pdm", license_, re.I):
        return None
    author = re.sub(r"\s+at English Wikipedia", "", author).strip()
    if author.lower() == "unknown":
        return f"Photo: {license_}"
    return f"Photo: {author[:40]} · {license_}"


def fetch(src):
    os.makedirs(CACHE, exist_ok=True)
    key = hashlib.sha256(src.encode()).hexdigest()
    path = f"{CACHE}/{key}.jpg"
    with PHOTO_LOCK_GUARD:
        lock = PHOTO_LOCKS.setdefault(key, threading.Lock())
    with lock:
        if not os.path.exists(path):
            for attempt in range(4):
                r = requests.get(src, headers={"User-Agent": "MiniaLifePinRenderer/1.0 (https://minialife.com; hello@minialife.com)"}, timeout=60)
                if r.status_code not in (429, 502, 503, 504) or attempt == 3:
                    break
                time.sleep(2 ** (attempt + 1))
            r.raise_for_status()
            im = Image.open(io.BytesIO(r.content)).convert("RGB")
            s = max(W / im.width, H / im.height)
            # A thumbnail may conceal a sufficiently detailed original.
            if s > 1.6 and "/commons/thumb/" in src:
                original = src.replace("thumb.wikimedia.org", "upload.wikimedia.org").replace("/commons/thumb/", "/commons/").rsplit("/", 1)[0]
                full = requests.get(original, headers={"User-Agent": "MiniaLifePinRenderer/1.0 (https://minialife.com; hello@minialife.com)"}, timeout=60)
                if full.ok:
                    im = Image.open(io.BytesIO(full.content)).convert("RGB")
                    s = max(W / im.width, H / im.height)
            if s > 1.6:
                # Preserve the complete landscape rather than heavily enlarging
                # a narrow crop. Text remains on the same branded lower field.
                if W / im.width > 1.6:
                    raise ValueError("source too small even for landscape layout")
                im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
                card = Image.new("RGB", (W, H), FOREST)
                card.paste(im, (0, 0))
            else:
                im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
                l, t = (im.width - W) // 2, (im.height - H) // 2
                card = im.crop((l, t, l + W, t + H))
            card.save(path, "JPEG", quality=95)
        with Image.open(path) as im:
            return im.convert("RGB")


def render(item):
    img = fetch(item["image"])
    # Brightness of lower half decides how strong the shade is.
    lum = ImageStat.Stat(img.crop((0, H // 2, W, H)).convert("L")).mean[0]
    peak = 225 if lum > 140 else 205 if lum > 100 else 190
    shade = Image.new("L", (1, H))
    for y in range(H):
        t = max(0.0, (y - 620) / (H - 620))
        shade.putpixel((0, y), int(peak * (t ** 1.4)))
    top = Image.new("L", (1, H))
    for y in range(H):
        top.putpixel((0, y), int(110 * max(0.0, 1 - y / 260)))
    dark = Image.new("RGB", (W, H), (12, 22, 16))
    img = Image.composite(dark, img, shade.resize((W, H)))
    img = Image.composite(dark, img, top.resize((W, H)))
    d = ImageDraw.Draw(img)
    maxw = W - 2 * PAD

    # Kicker pill
    kf = font("Inter", 28, 700)
    kt = KICKER[item["kind"]]
    spaced = " ".join(kt)  # letter-spaced look
    spaced = kt
    tw = d.textlength(spaced, font=kf)
    d.rounded_rectangle((PAD, PAD, PAD + tw + 44, PAD + 58), radius=29, fill=SAGE)
    d.text((PAD + 22, PAD + 29), spaced, font=kf, fill=FOREST, anchor="lm")

    # Footer
    y_rule = 1352
    d.line((PAD, y_rule, W - PAD, y_rule), fill=(*SAND,), width=2)
    bf = font("Fraunces", 42, 600, 72)
    d.text((PAD, y_rule + 48), "minialife.com", font=bf, fill=OFF, anchor="lm")
    cf = font("Inter", 30, 600)
    d.text((W - PAD, y_rule + 48), CTA[item["kind"]], font=cf, fill=SAGE, anchor="rm")
    if item.get("credit"):
        crf = font("Inter", 17, 400)
        ct = item["credit"]
        while d.textlength(ct, font=crf) > maxw and len(ct) > 10:
            ct = ct[:-2]
        d.text((W - PAD, H - 26), ct, font=crf, fill=(200, 200, 195), anchor="rs")

    # Info line, subtitle, name (bottom-up)
    y = y_rule - 46
    if item.get("info"):
        inf, it = fit_one(item["info"], "Inter", 34, 24, 500, maxw, d)
        d.text((PAD, y), it, font=inf, fill=SAND, anchor="ls")
        y -= 64
    sf = font("Inter", 46, 600)
    d.text((PAD, y), item["sub"], font=sf, fill=OFF, anchor="ls")
    y -= 78
    size = 132
    while True:
        nf = font("Fraunces", size, 600, 144)
        ls = lines_for(item["name"], nf, maxw, d)
        if (len(ls) <= 2 and all(d.textlength(l, font=nf) <= maxw for l in ls)) or size <= 64:
            break
        size -= 4
    lh = int(size * 1.02)
    for i, line in enumerate(reversed(ls)):
        d.text((PAD - 4, y - i * lh), line, font=nf, fill=OFF, anchor="ls")
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=86, optimize=True, progressive=True)
    return buf.getvalue()


def gallery_credit(raw, i):
    """Credit for gallery[i] from 'Hero: … · Gallery: a / LIC via …; b / LIC via …'."""
    m = re.search(r"Gallery:\s*(.+)$", re.sub(r"<[^>]+>", "", raw or ""))
    if not m:
        return None
    parts = [p.strip() for p in m.group(1).split(";")]
    if i >= len(parts):
        return None
    pm = re.match(r"(.+?)\s*/\s*(.+?)\s+via", parts[i])
    return parse_credit(pm.group(1), pm.group(2)) if pm else None


def alt_photo(d, i=0):
    """A credited gallery photo, so CSV pins don't repeat the destination pin's cover."""
    # Gallery frames were never subject-reviewed (one showed equipment, not scenery),
    # so CSV pins use the reviewed cover photo of their own destination.
    g = []
    if len(g) > i and g[i].startswith("https://"):
        c = gallery_credit(d.get("photo_credit"), i)
        if c:
            return g[i], c
    return d["hero_image"], parse_credit(d.get("photo_credit"))


def items():
    dests = json.loads(q("""select coalesce(json_agg(d),'[]') from (select slug, name, best_season,
      recommended_duration as dur, hero_image, photo_credit, scenic_score, gallery, camping_score,
      nearest_airport_code as airport, nearest_airport_name, drive_minutes, permit_level
      from destinations where status='published' and hero_image like 'https://%') d"""))
    by = {d["slug"]: d for d in dests}
    pages = json.loads(q("""select coalesce(json_agg(x),'[]') from (select d.slug, p.path, p.page_type::text as kind,
      p.cover_image as cover, p.cover_photo_credit as cc, p.cover_photo_license as cl
      from seo_landing_pages p join destinations d on d.id=p.destination_id
      where p.status='published' and d.status='published' and p.indexable) x"""))
    out = []

    def add(key, kind, name, d, image, credit, link, extra=None):
        if not image or not image.startswith("https://") or "Landsat_mosaic" in image:
            return
        sub, info = pin_copy_v2.card(kind, d, extra)
        out.append(dict(key=key, kind=kind, name=name, sub=sub, info=info or "", image=image, credit=credit,
                        feed=FEED[kind], score=d.get("scenic_score") or 0, link=link, extra=extra,
                        channel="csv" if kind in CSV_KINDS else "rss"))

    for d in dests:
        add(f"d:{d['slug']}", "destination", d["name"], d, d["hero_image"], parse_credit(d["photo_credit"]),
            f"{BASE}/destinations/{d['slug']}")
    for p in pages:
        d = by.get(p["slug"])
        if not d:
            continue
        use_cover = bool(p["cover"])
        add(f"p:{p['path']}", p["kind"], d["name"], d, p["cover"] if use_cover else d["hero_image"],
            parse_credit(p["cc"], p["cl"] or "") if use_cover else parse_credit(d["photo_credit"]), f"{BASE}{p['path']}")
    # RV & camping guides: same eligibility as the live /rv-camping pages.
    for d in dests:
        if (d.get("camping_score") or 0) >= 7 and d.get("airport") and d.get("nearest_airport_name") and d.get("drive_minutes") is not None:
            img, cr = alt_photo(d, 0)
            add(f"rv:{d['slug']}", "rv_camping", d["name"], d, img, cr, f"{BASE}/rv-camping/{d['slug']}")
    # Multi-park loops and gateway corridors.
    routes = [("loop", l["slug"], re.sub(r"\s+Road Trip Loop$|\s+Loop$", "", l["title"]), l["stops"], f"/road-trips/{l['slug']}")
              for l in json.load(open(os.path.join(os.path.dirname(__file__), "../../src/data/loops.json")))]
    routes.append(("corridor", "grand-circle-from-las-vegas", "Grand Circle from Las Vegas",
                   ["las-vegas", "zion", "bryce-canyon", "antelope-canyon", "horseshoe-bend", "grand-canyon"],
                   "/corridors/grand-circle-from-las-vegas"))
    for kind, slug, name, stops, path in routes:
        ss = [by[s] for s in stops if s in by]
        if len(ss) < 2:
            continue
        first = ss[0]
        extra = {"stops": len(ss), "days": sum(pin_copy_v2.days_from(s["dur"]) for s in ss),
                 "stop_names": " → ".join(s["name"] for s in ss),
                 "info": pin_copy_v2.join(pin_copy_v2.arrival("LAS" if kind == "corridor" else first.get("airport"), None), "free map with every stop")}
        pic = ss[1]
        img, cr = alt_photo(pic, 1 if len(pic.get("gallery") or []) > 1 else 0)
        add(f"{kind}:{slug}", kind, name, {**pic, "scenic_score": 10}, img, cr, f"{BASE}{path}", extra)
    return out


def upload(item):
    data = render(item)
    path = re.sub(r"[^a-z0-9-]+", "-", item["key"].lower()).strip("-") + f"-v{VERSION}.jpg"
    r = requests.post(f"{URL}/storage/v1/object/pins/{path}", data=data,
                      headers={**AUTH, "content-type": "image/jpeg", "x-upsert": "true", "cache-control": "31536000"}, timeout=60)
    r.raise_for_status()
    s = requests.post(f"{URL}/storage/v1/object/sign/pins/{path}", json={"expiresIn": 315360000}, headers=AUTH, timeout=30)
    s.raise_for_status()
    return f"{URL}/storage/v1{s.json()['signedURL']}"


def csv_schedule(keys, rss_dates, start, existing_csv=()):
    """CSV pins go out only on days with no RSS release, at most CSV_DAILY per day
    including CSV pins already scheduled that day."""
    from collections import Counter
    busy = {d.date() for d in rss_dates}
    used = Counter(d.date() for d in existing_csv)
    day, out = start.date(), {}
    for k in keys:
        while day in busy or used[day] >= CSV_DAILY:
            day += datetime.timedelta(days=1)
        out[k] = datetime.datetime.combine(day, datetime.time(15), datetime.timezone.utc)  # 15:00 UTC = US morning
        used[day] += 1
    return out


def write_csv(all_items):
    """Pinterest bulk-upload files (max 200 rows each), one per publish day."""
    import csv
    rows = json.loads(q("select coalesce(json_agg(x order by release_at, key),'[]') from (select key, image_url, release_at from pin_assets where channel='csv') x"))
    meta = {it["key"]: it for it in all_items}
    os.makedirs(CSV_DIR, exist_ok=True)
    for f in os.listdir(CSV_DIR):
        if f.endswith(".csv"):
            os.remove(os.path.join(CSV_DIR, f))
    by_day = {}
    for r in rows:
        it = meta.get(r["key"])
        if it:
            by_day.setdefault(r["release_at"][:10], []).append((r, it))
    for i, (day, group) in enumerate(sorted(by_day.items()), 1):
        with open(f"{CSV_DIR}/minialife-pins-{i:02d}-{day}.csv", "w", newline="", encoding="utf-8") as fh:
            w = csv.writer(fh)
            w.writerow(["Title", "Media URL", "Pinterest board", "Thumbnail", "Description", "Link", "Publish date", "Keywords"])
            for r, it in group:
                k = it["kind"]
                title = pin_copy_v2.csv_title(k, it["name"], it["extra"])
                desc = pin_copy_v2.csv_description(k, it["name"], it["sub"], it["info"], it["extra"])
                kw = {"rv_camping": f"{it['name']} RV camping, RV road trip, campgrounds",
                      }.get(k, f"{it['name']} road trip, national park road trip, US road trip itinerary")
                link = f"{it['link']}?utm_source=pinterest&utm_medium=csv"
                w.writerow([title, r["image_url"], BOARD[it["feed"]], "", desc, link, r["release_at"][:19], kw])
        print("csv", day, len(group))


def main():
    all_items = items()
    print(len(all_items), "eligible pins")
    if "--csv-only" in sys.argv:
        write_csv(all_items); return
    if "--sample" in sys.argv:
        os.makedirs(OUT, exist_ok=True)
        picks, seen = [], {}
        for it in sorted(all_items, key=lambda x: -x["score"]):
            if seen.get(it["kind"], 0) < 2 and it["name"] not in {p["name"] for p in picks}:
                picks.append(it); seen[it["kind"]] = seen.get(it["kind"], 0) + 1
        for it in picks:
            try: data = render(it)
            except ValueError as e: print("skip", it["key"], e); continue
            fn = f"{OUT}/{it['kind']}-{re.sub('[^a-z0-9]+','-',it['name'].lower())}.jpg"
            open(fn, "wb").write(data); print(fn)
        return
    # Existing cards (any version) are never re-rendered or re-dated.
    done = set(q("select key from pin_assets").split()) if "--force" not in sys.argv else set()
    todo = [it for it in all_items if it["key"] not in done]
    now = datetime.datetime.now(datetime.timezone.utc)
    assigned = json.loads(q("select coalesce(json_object_agg(key,release_at),'{}') from pin_assets where channel='rss'"))
    existing = {k: datetime.datetime.fromisoformat(v.replace("Z", "+00:00")) for k, v in assigned.items()}
    start_arg = next((x.split("=", 1)[1] for x in sys.argv if x.startswith("--release-start=")), None)
    start = datetime.datetime.fromisoformat(start_arg.replace("Z", "+00:00")) if start_arg else now
    rss_items = [it for it in all_items if it["channel"] == "rss"]
    release = release_schedule(rss_items, start, existing)
    csv_assigned = json.loads(q("select coalesce(json_object_agg(key,release_at),'{}') from pin_assets where channel='csv'"))
    csv_todo = sorted((it for it in todo if it["channel"] == "csv"), key=lambda x: (x["kind"] == "rv_camping", -x["score"], x["key"]))
    csv_dates = [datetime.datetime.fromisoformat(v.replace("Z", "+00:00")) for v in csv_assigned.values()]
    release.update(csv_schedule([it["key"] for it in csv_todo], release.values(), start, csv_dates))

    def work(it):
        try:
            url = upload(it)
            return it, url, None
        except Exception as e:  # noqa
            return it, None, type(e).__name__

    batch, fails = [], 0
    with ThreadPoolExecutor(8) as ex:
        for it, url, err in ex.map(work, todo):
            if err:
                fails += 1; print("FAIL", it["key"], err[:120]); continue
            batch.append({"key": it["key"], "kind": it["kind"], "image_url": url, "template_version": VERSION,
                          "feed": it["feed"], "release_at": release[it["key"]].isoformat(), "channel": it["channel"],
                          "updated_at": now.isoformat()})
            if len(batch) >= 100:
                flush(batch); batch = []
    flush(batch)
    print("done", len(todo) - fails, "fails", fails)
    write_csv(all_items)


def flush(batch):
    if not batch:
        return
    r = requests.post(f"{URL}/rest/v1/pin_assets?on_conflict=key", json=batch,
                      headers={**AUTH, "Prefer": "resolution=merge-duplicates"}, timeout=60)
    r.raise_for_status()
    print("saved", len(batch))


if __name__ == "__main__":
    main()
