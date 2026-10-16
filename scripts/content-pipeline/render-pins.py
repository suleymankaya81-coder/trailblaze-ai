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

VERSION = 1
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

KICKER = {"destination": "ROAD TRIP GUIDE", "best_time": "BEST TIME TO VISIT", "things_to_do": "THINGS TO DO",
          "glamping": "GLAMPING & RV STAYS", "trip_planner": "ITINERARY"}
FEED = {"destination": "parks", "trip_planner": "parks", "best_time": "best-time",
        "things_to_do": "things-to-do", "glamping": "rv"}


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
    d.text((W - PAD, y_rule + 48), "Free route map →", font=cf, fill=SAGE, anchor="rm")
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


def items():
    rows = json.loads(q("""select coalesce(json_agg(x),'[]') from (
      select d.slug, d.name, d.best_season, d.recommended_duration as dur, d.hero_image, d.photo_credit, d.scenic_score,
        null::text as path, 'destination' as kind, null::text as cover, null::text as cc, null::text as cl
      from destinations d where d.status='published' and d.hero_image like 'https://%'
      union all
      select d.slug, d.name, d.best_season, d.recommended_duration, d.hero_image, d.photo_credit, d.scenic_score,
        p.path, p.page_type::text, p.cover_image, p.cover_photo_credit, p.cover_photo_license
      from seo_landing_pages p join destinations d on d.id=p.destination_id
      where p.status='published' and d.status='published' and p.indexable
    ) x"""))
    out = []
    for r in rows:
        k = r["kind"]
        use_cover = bool(r["cover"]) and k != "destination"
        image = r["cover"] if use_cover else r["hero_image"]
        if not image or not image.startswith("https://") or "Landsat_mosaic" in image:
            continue
        credit = parse_credit(r["cc"], r["cl"] or "") if use_cover else parse_credit(r["photo_credit"])
        season = r["best_season"]; dur = r["dur"]
        sub = {"destination": "Free route map & trip plan", "best_time": "Month-by-month guide",
               "things_to_do": "Top outdoor activities", "glamping": "Where to stay near nature",
               "trip_planner": dur_label(dur)}[k]
        info = {"destination": " · ".join(x for x in [season and f"Best: {season}", dur] if x),
                "best_time": season and f"Peak season: {season}", "things_to_do": "Hikes · scenic drives · family ideas",
                "glamping": "Cabins · glamping · RV campgrounds", "trip_planner": season and f"Best: {season}"}[k]
        key = f"d:{r['slug']}" if k == "destination" else f"p:{r['path']}"
        out.append(dict(key=key, kind=k, name=r["name"], sub=sub, info=info or "", image=image, credit=credit,
                        feed=FEED[k], score=r["scenic_score"] or 0))
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


def main():
    all_items = items()
    print(len(all_items), "eligible pins")
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
    done = set(q(f"select key from pin_assets where template_version={VERSION}").split()) if "--force" not in sys.argv else set()
    todo = [it for it in all_items if it["key"] not in done]
    now = datetime.datetime.now(datetime.timezone.utc)
    # Re-runs preserve assigned dates and account for existing daily capacity.
    assigned = json.loads(q("select coalesce(json_object_agg(key,release_at),'{}') from pin_assets"))
    existing = {k: datetime.datetime.fromisoformat(v.replace("Z", "+00:00")) for k, v in assigned.items()}
    start_arg = next((x.split("=", 1)[1] for x in sys.argv if x.startswith("--release-start=")), None)
    start = datetime.datetime.fromisoformat(start_arg.replace("Z", "+00:00")) if start_arg else now
    release = release_schedule(all_items, start, existing)

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
                          "feed": it["feed"], "release_at": release[it["key"]].isoformat(),
                          "updated_at": now.isoformat()})
            if len(batch) >= 100:
                flush(batch); batch = []
    flush(batch)
    print("done", len(todo) - fails, "fails", fails)


def flush(batch):
    if not batch:
        return
    r = requests.post(f"{URL}/rest/v1/pin_assets?on_conflict=key", json=batch,
                      headers={**AUTH, "Prefer": "resolution=merge-duplicates"}, timeout=60)
    r.raise_for_status()
    print("saved", len(batch))


if __name__ == "__main__":
    main()
