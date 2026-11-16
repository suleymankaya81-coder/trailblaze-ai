"""Offline checks; never fetch sources, generate content or publish records."""
import json
import re
from pathlib import Path
from urllib.parse import urlparse

COUNTRIES = ("no", "is", "se", "fi", "dk")
REQUIRED = {"slug", "name", "region", "also_regions", "country", "kind", "wave",
            "wikidata", "enwiki", "lat", "lng", "official_site", "access", "source", "source_urls"}


def validate_rows(rows, country):
    errors = []
    seen = set()
    qids = set()
    for row in rows:
        slug = row.get("slug", "")
        label = f"{country}/{slug}"
        if REQUIRED - row.keys():
            errors.append(f"{label}: missing {sorted(REQUIRED - row.keys())}")
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
            errors.append(f"{label}: invalid slug")
        if slug in seen:
            errors.append(f"{label}: duplicate slug")
        seen.add(slug)
        if row.get("country") != country:
            errors.append(f"{label}: wrong country")
        qid = row.get("wikidata")
        if qid:
            if not re.fullmatch(r"Q[1-9][0-9]*", qid) or qid in qids:
                errors.append(f"{label}: invalid or duplicate QID")
            qids.add(qid)
        lat, lng = row.get("lat"), row.get("lng")
        if (lat is None) != (lng is None):
            errors.append(f"{label}: incomplete coordinate pair")
        if lat is not None and (not isinstance(lat, (float, int)) or not -90 <= lat <= 90):
            errors.append(f"{label}: invalid latitude")
        if lng is not None and (not isinstance(lng, (float, int)) or not -180 <= lng <= 180):
            errors.append(f"{label}: invalid longitude")
        urls = row.get("source_urls", [])
        if not urls or any(urlparse(u).scheme not in ("https", "http") or not urlparse(u).netloc for u in urls):
            errors.append(f"{label}: missing/invalid sources")
        if row.get("access") != "road" and not row.get("access_note"):
            errors.append(f"{label}: non-road/unknown access needs note")
    return errors


def validate_coverage(catalogs, report):
    errors = []
    for inventory in report["inventories"]:
        country = inventory["country"]
        slugs = {r["slug"] for r in catalogs[country]}
        entries = inventory["entries"]
        if len(entries) != inventory["expected_count"]:
            errors.append(f"{inventory['id']}: inventory count mismatch")
        for entry in entries:
            if entry.get("catalog_slug") not in slugs:
                errors.append(f"{inventory['id']}: unmatched {entry['name']}")
    return errors


def main():
    root = Path(__file__).resolve().parent
    catalogs = {cc: json.loads((root / f"{cc}-catalog.json").read_text()) for cc in COUNTRIES}
    errors = [e for cc, rows in catalogs.items() for e in validate_rows(rows, cc)]
    errors += validate_coverage(catalogs, json.loads((root / "coverage.json").read_text()))
    if errors:
        raise SystemExit("\n".join(errors))
    print("Validated:", ", ".join(f"{cc}={len(rows)}" for cc, rows in catalogs.items()))


if __name__ == "__main__":
    main()