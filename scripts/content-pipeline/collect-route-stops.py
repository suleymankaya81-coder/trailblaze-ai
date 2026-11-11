"""Collect all public daily routing identities once; never geocode at page load.

Only exact stored source-marker matches carry coordinates. Unmatched stops retain
their canonical place-qualified query, rather than guessed park-centre points.
"""
import json
import re
import subprocess
from pathlib import Path
from travel_review_rules import reviewed_markers

ROOT = Path(__file__).resolve().parents[2]


def normalize(value):
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def collect(rows):
    cache, missing = {}, []
    for row in rows:
        plan = row.get("travel_plan") or {}
        markers = reviewed_markers(row["slug"], plan.get("markers", []))
        days = []
        for i, day in enumerate(plan.get("days", [])):
            points = []
            for stop in day["stops"]:
                name = stop["name"]
                point = {"name": name, "query": ", ".join(x for x in [name, row["name"], row.get("region"), row.get("state"), "USA"] if x)}
                marker = next((m for m in markers if normalize(m["name"]) == normalize(name) and m.get("sourceUrl")), None)
                if marker:
                    point.update(lat=marker["lat"], lng=marker["lng"], sourceUrl=marker["sourceUrl"])
                else:
                    missing.append({"slug": row["slug"], "day": i + 1, "stop": name, "query": point["query"]})
                points.append(point)
            days.append(points)
        cache[row["slug"]] = days
    return cache, missing


if __name__ == "__main__":
    rows = json.loads(subprocess.check_output(["psql", "-Atc", "select coalesce(json_agg(t),'[]') from (select slug,name,region,state,travel_plan from destinations where status='published' order by slug)t"], text=True))
    cache, missing = collect(rows)
    (ROOT / "src/data/daily-route-points.json").write_text(json.dumps(cache, ensure_ascii=False, separators=(",", ":")) + "\n")
    report = {"destinations": len(rows), "days": sum(map(len, cache.values())), "stops": sum(len(d) for days in cache.values() for d in days), "unverifiedCoordinates": len(missing), "missing": missing}
    (ROOT / "scripts/audits/route-coordinate-coverage.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({k: v for k, v in report.items() if k != "missing"}))