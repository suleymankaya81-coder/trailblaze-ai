"""Steps A+B+C of the de/fr translation audit.

READ-ONLY. Uses SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY from the environment (the publishable/anon
key already committed in this repo's .env -- never the service role key, and this script never
prints or logs either value). Paged REST reads only; no writes anywhere.

Run from the repo root:  python3 scripts/audits/translations-2026-11/export_and_check.py

Writes:
  scripts/audits/translations-2026-11/raw/content_translations_<locale>.json  (untracked, gitignored)
  scripts/audits/translations-2026-11/raw/destinations_en_source.json        (untracked, gitignored)
  scripts/audits/translations-2026-11/findings.csv                            (tracked deliverable)
  scripts/audits/translations-2026-11/counts.json                             (tracked deliverable: Step A counts)
  scripts/audits/translations-2026-11/sample_for_review.json                  (untracked -- see note below)

sample_for_review.json contains full bilingual text for the stratified 30+30 review sample. It is
NOT committed (same raw/ treatment) because it is a large verbatim excerpt of DB content; the parent
session reads it directly (or has it relayed) to do Step E's human-judgment review itself.
"""
import csv
import json
import os
import re
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import quote

import requests

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).parent
RAW = OUT / "raw"
RAW.mkdir(parents=True, exist_ok=True)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_PUBLISHABLE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    print("STOP: SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY not set in the environment. Not falling back to anything.", file=sys.stderr)
    sys.exit(1)

HEADERS = {"apikey": SUPABASE_KEY}
if not SUPABASE_KEY.startswith("sb_"):
    HEADERS["Authorization"] = f"Bearer {SUPABASE_KEY}"


def rest(path_and_query, page_size=500):
    out = []
    offset = 0
    while True:
        sep = "&" if "?" in path_and_query else "?"
        url = f"{SUPABASE_URL}/rest/v1/{path_and_query}{sep}limit={page_size}&offset={offset}"
        r = requests.get(url, headers=HEADERS, timeout=60)
        if not r.ok:
            print(f"STOP: REST call failed with HTTP {r.status_code} for {path_and_query.split('?')[0]} "
                  f"(offset {offset}). Body (first 300 chars): {r.text[:300]}", file=sys.stderr)
            sys.exit(1)
        page = r.json()
        if not isinstance(page, list):
            print(f"STOP: unexpected REST response shape for {path_and_query.split('?')[0]}: {page}", file=sys.stderr)
            sys.exit(1)
        out.extend(page)
        if len(page) < page_size:
            return out
        offset += page_size


def dedup(rows, key):
    seen, out = set(), []
    for r in rows:
        k = r.get(key)
        if k in seen:
            continue
        seen.add(k)
        out.append(r)
    return out


BANNED_TOKENS = ["{{", "}}", "{PLACE}", "undefined", "null", "[dated source]", "Check official seasonal information"]
LANG_MARKERS = {
    "de": re.compile(r"\b(der|die|das|und|für|mit|nicht|eine?|ihre?)\b|[äöüß]", re.I),
    "fr": re.compile(r"\b(le|la|les|des|et|pour|vous|votre|dans|une?)\b|[éèêàçî]", re.I),
    "en": re.compile(r"\b(the|and|for|with|your|not|that|this)\b", re.I),
    "pt": re.compile(r"\b(para|com|não|uma?|você|dos|das)\b|[ãõáéíóú]", re.I),
    "es": re.compile(r"\b(el|la|los|las|para|con|usted)\b|[ñáéíóú]", re.I),
    "el": re.compile(r"[Ͱ-Ͽ]"),  # Greek script
}
IMMUTABLE_FIELDS = {"name", "stop_id", "routingName", "source", "url", "sourceUrl", "citation", "citations", "photo", "image", "id"}

findings = []  # rows for the CSV: slug, locale, field, check, offending_text
counts = Counter()


def flag(slug, locale, field, check, text):
    findings.append({"slug": slug, "locale": locale, "field": field, "check": check, "offending_text": (text or "")[:200]})
    counts[(locale, check)] += 1


def walk(value, path=()):
    if isinstance(value, str):
        yield path, value
    elif isinstance(value, list):
        for i, v in enumerate(value):
            yield from walk(v, path + (i,))
    elif isinstance(value, dict):
        for k, v in value.items():
            yield from walk(v, path + (k,))


def at(obj, path):
    for p in path:
        if obj is None:
            return None
        obj = obj[p] if isinstance(obj, list) else obj.get(p)
    return obj


def path_str(path):
    return ".".join(str(p) for p in path)


def fr_typography_issues(text):
    # Missing (non-breaking) space before : ; ! ? -- flag only a fully-missing space (clearer bug
    # than "wrong kind of space", which we note separately but don't hard-fail on).
    issues = []
    for m in re.finditer(r"(?<=\S)([:;!?])", text):
        ch_before = text[m.start() - 1]
        if ch_before not in (" ", " ", " "):
            issues.append(f"missing space before '{m.group(1)}' near: ...{text[max(0, m.start()-20):m.start()+1]}...")
    if re.search(r'"[^"]+"', text) and "«" not in text:
        issues.append("straight double quotes used instead of « »")
    return issues


def check_locale(locale, rows_by_slug, en_by_slug):
    for slug, fields in rows_by_slug.items():
        en = en_by_slug.get(slug)
        if en is None:
            flag(slug, locale, "*", "no_english_source_row", "translated row exists but no matching published EN destination")
            continue
        for path, text in walk(fields):
            field = path_str(path)
            leaf = path[-1] if path else None
            if leaf in IMMUTABLE_FIELDS:
                en_val = at(en, path)
                if isinstance(en_val, str) and text != en_val:
                    flag(slug, locale, field, "immutable_field_changed", f"EN={en_val!r} {locale}={text!r}")
                continue
            for token in BANNED_TOKENS:
                if token in text:
                    flag(slug, locale, field, "leftover_placeholder_token", text)
            if field == "metaTitle" and len(text) > 60:
                flag(slug, locale, field, "metaTitle_over_60", text)
            if field == "metaDescription" and not (140 <= len(text) <= 160):
                flag(slug, locale, field, "metaDescription_outside_140_160", f"len={len(text)}: {text}")
            if field == "tagline" and len(text) > 110:
                flag(slug, locale, field, "tagline_over_110", text)
            if text.strip() == "":
                flag(slug, locale, field, "empty_field", "")
            en_val = at(en, path)
            if isinstance(en_val, str):
                if text == en_val and len(text) > 3:
                    flag(slug, locale, field, "identical_to_english_source", text)
            marker = LANG_MARKERS[locale]
            if len(text) >= 25 and not marker.search(text):
                flag(slug, locale, field, "no_target_language_markers_rough", text)
            for other_lang, other_marker in LANG_MARKERS.items():
                if other_lang in (locale, "en"):
                    continue
                if len(text) >= 20 and other_marker.search(text) and not marker.search(text):
                    flag(slug, locale, field, f"looks_like_{other_lang}_not_{locale}", text)
            if locale == "fr":
                for issue in fr_typography_issues(text):
                    flag(slug, locale, field, "fr_typography", issue)
        # stop-name / day-count checks against the English travel plan
        en_days = en.get("days") or []
        tr_days = fields.get("days") or []
        if len(en_days) != len(tr_days):
            flag(slug, locale, "days", "day_count_mismatch", f"en={len(en_days)} {locale}={len(tr_days)}")
        for i, (ed, td) in enumerate(zip(en_days, tr_days)):
            en_stops, tr_stops = ed.get("stops") or [], td.get("stops") or []
            if len(en_stops) != len(tr_stops):
                flag(slug, locale, f"days.{i}.stops", "stop_count_mismatch", f"en={len(en_stops)} {locale}={len(tr_stops)}")
            for j, (es, ts) in enumerate(zip(en_stops, tr_stops)):
                if es.get("name") != ts.get("name"):
                    flag(slug, locale, f"days.{i}.stops.{j}.name", "stop_name_changed", f"en={es.get('name')!r} {locale}={ts.get('name')!r}")


def destination_source(d):
    plan = d.get("travel_plan") or {}
    return {
        "name": d.get("name"), "region": d.get("region"), "tagline": d.get("tagline"), "bestSeason": d.get("best_season"),
        "permitHeadline": d.get("permit_headline"), "permitNote": d.get("permit_note"),
        "days": plan.get("days") or [], "intel": plan.get("intel") or [],
        "arrival": plan.get("arrival"), "vehicle": plan.get("vehicle"), "goldenHour": plan.get("goldenHour"),
        "country_code": d.get("country_code"),
    }


def main():
    dests = dedup(rest("destinations?select=slug,name,region,tagline,best_season,permit_headline,permit_note,travel_plan,country_code,status&status=eq.published&order=slug.asc"), "slug")
    en_by_slug = {d["slug"]: destination_source(d) for d in dests}
    (RAW / "destinations_en_source.json").write_text(json.dumps(en_by_slug, ensure_ascii=False, indent=1))

    counts_out = {"published_destinations_en": len(dests), "by_country": dict(Counter(d.get("country_code") for d in dests)), "locales": {}}
    rows_by_locale = {}
    for locale in ("de", "fr"):
        rows = dedup(rest(f"content_translations?select=entity_id,fields,status,updated_at&entity_type=eq.destination&locale=eq.{locale}&status=eq.published&order=entity_id.asc"), "entity_id")
        (RAW / f"content_translations_{locale}.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1))
        by_slug = {r["entity_id"]: r["fields"] for r in rows}
        rows_by_locale[locale] = by_slug
        by_country = Counter(en_by_slug[s]["country_code"] for s in by_slug if s in en_by_slug)
        counts_out["locales"][locale] = {"published_rows": len(rows), "by_country": dict(by_country), "rows_with_no_matching_en_source": sum(1 for s in by_slug if s not in en_by_slug)}
        check_locale(locale, by_slug, en_by_slug)

    (OUT / "counts.json").write_text(json.dumps(counts_out, ensure_ascii=False, indent=2))
    with (OUT / "findings.csv").open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["slug", "locale", "field", "check", "offending_text"])
        w.writeheader()
        w.writerows(findings)
    summary = {f"{loc}:{chk}": n for (loc, chk), n in sorted(counts.items())}
    (OUT / "findings_summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2))

    # Stratified sample for Step E (manual review, done by the parent session): 30 per locale --
    # all rows with the most check failures first, then a spread across countries/kinds, then random.
    fail_counts = Counter(f["slug"] for f in findings)
    sample = {}
    for locale in ("de", "fr"):
        slugs = list(rows_by_locale[locale].keys())
        ranked = sorted(slugs, key=lambda s: -fail_counts.get(s, 0))
        chosen, seen_countries = [], set()
        for s in ranked[:10]:
            chosen.append(s)
        import random
        random.seed(42)
        remaining = [s for s in slugs if s not in chosen]
        random.shuffle(remaining)
        for s in remaining:
            if len(chosen) >= 30:
                break
            cc = en_by_slug.get(s, {}).get("country_code")
            if cc not in seen_countries or len(chosen) >= 20:
                chosen.append(s)
                seen_countries.add(cc)
        sample[locale] = {s: {"en_source": en_by_slug.get(s), "translated": rows_by_locale[locale][s], "check_failures": fail_counts.get(s, 0)} for s in chosen[:30]}
    (OUT / "sample_for_review.json").write_text(json.dumps(sample, ensure_ascii=False, indent=1))

    print(json.dumps({"counts": counts_out, "findings_total": len(findings), "findings_by_check": summary}, indent=2))


if __name__ == "__main__":
    main()
