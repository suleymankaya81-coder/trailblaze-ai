"""Read-only data-sufficiency audit for Europe and Australia/New Zealand guides (seo-structure-1, Part 2).
Uses repository files only: no database, no network, no AI. Writes data_audit.json next to this file.
Run from repo root: PYTHONDONTWRITEBYTECODE=1 python3 scripts/audits/seo-structure-1/data_audit.py
"""
import glob, json, re, statistics
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CP = ROOT / "scripts/content-pipeline"
OUT = Path(__file__).with_name("data_audit.json")
OCEANIA = {"au", "nz"}

# Python mirror of src/lib/seo/season.ts isSeasonText (kept identical in behaviour).
SEASON_WORD = re.compile(r"(?<![^\W\d_])(" + "|".join([
    "january|february|march|april|may|june|july|august|september|october|november|december",
    "jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec",
    "spring|summer|autumn|fall|winter|year-round|year round|all year",
    "januar|februar|märz|mai|juni|juli|oktober|dezember|frühling|frühjahr|sommer|herbst|ganzjährig",
    "janvier|février|mars|avril|juin|juillet|août|septembre|octobre|novembre|décembre|printemps|été|automne|hiver|toute l'année",
]) + r")(?![^\W\d_])", re.I)
NOT_A_SEASON = re.compile(r"(no verified|not specify|does not|check official|official seasonal|consult|contact local|keine verifizierte|überprüfen sie|konsultieren|aucune recommandation|consulte[rz]?|vérifi|recheck|verify)", re.I)
UNKNOWN = re.compile(r"(do|does|did) not (establish|specify|contain|confirm)|not (verified|specified|established|confirmed)|^no verified|are separate checks|check (the )?official|check with", re.I)


def is_season(v):
    s = (v or "").strip()
    if not s or len(s) > 80 or NOT_A_SEASON.search(s) or re.search(r"[;:]", s) or re.search(r"[.!?]\s*\S", s):
        return False
    return bool(SEASON_WORD.search(s))


def load(p):
    try:
        return json.loads(Path(p).read_text())
    except Exception:
        return None


geo = load(ROOT / "src/data/destination-geo.json")
routes = load(ROOT / "src/data/routes.json")
places = {s: {"country": v.split("/")[0], "region": v.split("/")[1]} for s, v in geo.items()
          if v.split("/")[0] not in ("us", "ca")}

# Stored bundles: completion outputs (with airport/route/coords) and combined-content bundles.
rec = defaultdict(dict)
def take(slug, d):
    if slug not in places or not isinstance(d, dict):
        return
    r = rec[slug]
    b = d.get("bundle") or {}
    s = {**(d.get("payload") or {}), **(b.get("summary") or {})}
    t = b.get("travel") or {}
    for k in ("tagline", "best_season", "permit_level", "trip_duration_days"):
        if s.get(k) not in (None, "") and k not in r:
            r[k] = s[k]
    if t.get("reservation") and "reservation" not in r:
        r["reservation"] = t["reservation"]
    if t.get("plan") and "plan" not in r:
        r["plan"] = t["plan"]
    lat = d.get("lat", s.get("lat"))
    if lat is not None:
        r.setdefault("coords", True)
    ap = d.get("airport") or {}
    code = ap.get("code") or s.get("nearest_airport_code")
    if code:
        r.setdefault("airport", code)
    route = d.get("route") or {}
    mins = route.get("minutes") if isinstance(route, dict) else None
    mins = mins if mins is not None else s.get("drive_minutes")
    if mins is not None:
        r.setdefault("drive_minutes", mins)
    if isinstance(d.get("packet"), dict):
        r.setdefault("packet_inline", d["packet"])

for p in glob.glob(str(CP / "*/completion/*.json")) + glob.glob(str(CP / "fr-pt-gr-completion/*.json")) + glob.glob(str(CP / "combined-content/*.json")):
    d = load(p)
    if isinstance(d, dict):
        take(d.get("slug") or Path(p).stem, d)

# Catalog coordinates (Oceania/Nordic/handoff catalogs) and access types.
for p in glob.glob(str(CP / "claude-handoff/**/*-catalog.json"), recursive=True) + glob.glob(str(CP / "*/catalog.json")):
    d = load(p)
    for row in d if isinstance(d, list) else []:
        if isinstance(row, dict) and row.get("slug") in places:
            if row.get("lat") is not None:
                rec[row["slug"]].setdefault("coords", True)
            if row.get("access"):
                rec[row["slug"]].setdefault("access", row["access"])

packets = {Path(p).stem: p for p in glob.glob(str(CP / "source-packets/*.json"))}
multiday = {Path(p).stem: p for p in glob.glob(str(CP / "multiday/*.json"))}

rows = []
for slug, base in places.items():
    r = rec.get(slug, {})
    cc = base["country"]
    pk = load(packets[slug]) if slug in packets else r.get("packet_inline")
    overview = 0
    if pk:
        overview = sum(len((s.get("text") or "").split()) for s in pk.get("sources", []) if "wikipedia" in (s.get("url") or ""))
    md = load(multiday[slug]) if slug in multiday else None
    plan = r.get("plan") or {}
    days = len(plan.get("days") or []) if isinstance(plan, dict) else 0
    stops = sum(len(dd.get("stops") or []) for dd in (plan.get("days") or [])) if isinstance(plan, dict) else 0
    if md:
        days = max(days, len(md.get("days") or []))
        stops = max(stops, len(md.get("stops") or []))
    res = (r.get("reservation") or "").strip()
    rows.append({
        "slug": slug, "country": cc,
        "coords": bool(r.get("coords")) or slug in routes,
        "tagline": bool((r.get("tagline") or "").strip()),
        "season": is_season(r.get("best_season")),
        "season_raw_present": bool(r.get("best_season")),
        "permit_level": r.get("permit_level") in ("none", "low", "moderate", "high"),
        "permit_note": bool(res) and not UNKNOWN.search(res.split(".")[0]),
        # Airport code / drive minutes are in repo files only for some pipelines (others keep them in the DB).
        # Every stored route line starts at the arrival airport, so a route counts as airport + drive known.
        "airport_code_in_repo": bool(r.get("airport")),
        "drive_minutes_in_repo": r.get("drive_minutes") is not None,
        "airport": bool(r.get("airport")) or slug in routes,
        "drive": r.get("drive_minutes") is not None or slug in routes,
        "route": slug in routes,
        "stay_offer": False,  # non-US publish scripts write no 'stay' offers (publish-fr-pt-gr.py offers())
        "packet": bool(pk and pk.get("approved_for_generation")),
        "packet_source": "file" if slug in packets else ("inline" if pk else None),
        "overview_words": overview,
        "plan_days": days, "plan_stops": stops,
        "has_bundle": bool(r),
    })

# Guide gate (transparent, stored facts only):
#   best_time  : packet + genuine season + (permit level or permit note) + overview >= 300 words
#   itinerary  : packet + airport + drive + route + plan with >=2 days or >=4 stops
#   glamping   : packet + stay offer (insert-landing-pages.py glamping_ok rule) + coords
# All three additionally need the 600-word / near-duplicate checks at insert time (not testable before generation).
GATES = {
    "best_time": [("packet", lambda x: x["packet"]), ("season", lambda x: x["season"]),
                  ("permit", lambda x: x["permit_level"] or x["permit_note"]), ("overview>=300w", lambda x: x["overview_words"] >= 300)],
    "itinerary": [("packet", lambda x: x["packet"]), ("airport", lambda x: x["airport"]), ("drive", lambda x: x["drive"]),
                  ("route", lambda x: x["route"]), ("plan>=2d|4stops", lambda x: x["plan_days"] >= 2 or x["plan_stops"] >= 4)],
    "glamping": [("packet", lambda x: x["packet"]), ("stay_offer", lambda x: x["stay_offer"]), ("coords", lambda x: x["coords"])],
}
FIELDS = ["airport_code_in_repo", "drive_minutes_in_repo", "coords", "tagline", "season", "permit_level", "permit_note", "airport", "drive", "route", "stay_offer", "packet", "has_bundle"]

by_cc = defaultdict(list)
for x in rows:
    by_cc[x["country"]].append(x)
season_raw = Counter((rec.get(x['slug'], {}).get('best_season') or '')[:40] for x in rows)
summary = {}
for cc, xs in sorted(by_cc.items(), key=lambda kv: -len(kv[1])):
    s = {"places": len(xs), **{f: sum(1 for x in xs if x[f]) for f in FIELDS}}
    s["overview_words_median"] = int(statistics.median([x["overview_words"] for x in xs])) if xs else 0
    s["overview>=300w"] = sum(1 for x in xs if x["overview_words"] >= 300)
    for g, checks in GATES.items():
        passed = [x for x in xs if all(f(x) for _, f in checks)]
        first_missing = Counter(next(n for n, f in checks if not f(x)) for x in xs if x not in passed)
        s[f"gate_{g}"] = len(passed)
        s[f"gate_{g}_main_missing"] = first_missing.most_common(1)[0] if first_missing else None
    summary[cc] = s

group = lambda cc: "oceania" if cc in OCEANIA else "europe"
totals = defaultdict(Counter)
for cc, s in summary.items():
    for k, v in s.items():
        if isinstance(v, int) and k != "overview_words_median":
            totals[group(cc)][k] += v
for g in ("europe", "oceania"):
    totals[g]["overview_words_median"] = int(statistics.median([x["overview_words"] for x in rows if group(x["country"]) == g]))
    for gate, checks in GATES.items():
        totals[g][f"gate_{gate}_main_missing"] = dict(Counter(next(n for n, f in checks if not f(x)) for x in rows
                                                       if group(x["country"]) == g and not all(f(x) for _, f in checks)))
OUT.write_text(json.dumps({"by_country": summary, "totals": totals, "stored_season_values_top": season_raw.most_common(12), "per_place": rows}, indent=1, ensure_ascii=False))
print(json.dumps(totals, indent=1))
