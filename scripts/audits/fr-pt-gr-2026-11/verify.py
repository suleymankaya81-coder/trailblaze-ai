"""Step E: offline, no-model verification of the fr/pt/gr source packets and combined-content
bundles produced for this wave. Reads only files already on disk; makes no network or model calls.

Checks, per place that has both a source-packets/<slug>.json and combined-content/<slug>.json:
  1. every URL the bundle cites is one of the packet's own source URLs (no uncited sources).
  2. every stop name used in the bundle's visit plan matches an approved_stops name/quote in the
     packet, and that stop's detail text is an exact substring of the packet source text it's
     attributed to (independent re-check of what compact_evidence.py already enforced at write time).
  3. tagline length (<=90 chars per the task's own bar; the pipeline's own cap is 110, so this is
     reported, not treated as a hard pipeline bug when it's between 91 and 110).
  4. best_seasons subset of {spring,summer,fall,winter}; best_season enum/placeholder sanity.
  5. banned marketing words ("hidden gem", "breathtaking", "nestled") anywhere in generated/quoted text
     (noting separately when the hit is inside a verbatim Wikipedia quote, not generated prose).
  6. hero/cover photo licence+credit present (not "Unknown"/empty) wherever a hero record exists.
  7. no duplicate cover photo URL across all places examined.
  8. BLOCKING: no placeholder text anywhere in the bundle ("[dated source]", "[source datée]",
     "[datierter Quelle]", "[datiert Quelle]", "Check official seasonal information"); the same
     list blocks publish-wave.py (scripts/content-pipeline/placeholder_gate.py).

Run: python3 scripts/audits/fr-pt-gr-2026-11/verify.py
Writes scripts/audits/fr-pt-gr-2026-11/verification-findings.md (per-place findings only) and
report-data.json (machine-readable); the consolidated report.md deliverable is assembled separately
and incorporates this script's totals.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / "content-pipeline"
sys.path.insert(0, str(ROOT))
from placeholder_gate import find_blocked_text  # noqa: E402
PACKETS = ROOT / "source-packets"
BUNDLES = ROOT / "combined-content"
FACTS_DIRS = [ROOT / "wave3-facts", ROOT / "france" / "wave3-facts"]
OUT = Path(__file__).parent
BANNED = ["hidden gem", "breathtaking", "nestled"]
SEASONS = {"spring", "summer", "fall", "winter"}


def catalogs():
    rows = {}
    fr = json.loads((ROOT / "france" / "catalog.json").read_text())
    for r in fr:
        rows[r["slug"]] = r
    se = json.loads((ROOT / "south-europe" / "catalog.json").read_text())
    for r in se:
        if r["country"] in ("pt", "gr"):
            rows[r["slug"]] = r
    return rows


def load_json(path):
    try:
        return json.loads(path.read_text())
    except Exception as error:
        return {"__error__": str(error)}


def check_place(slug, packet, bundle_doc):
    findings = []
    if "__error__" in packet:
        return [f"packet unreadable: {packet['__error__']}"]
    if "__error__" in bundle_doc:
        return [f"bundle unreadable: {bundle_doc['__error__']}"]
    bundle = bundle_doc.get("bundle", bundle_doc)
    packet_urls = {s["url"] for s in packet.get("sources", [])}
    travel = bundle.get("travel", {})
    cited = [travel.get("source_url")] + [s.get("url") for s in travel.get("plan", {}).get("sources", [])]
    for url in cited:
        if url and url not in packet_urls:
            findings.append(f"cited URL not in packet sources: {url}")

    approved = {s["id"]: s for s in packet.get("approved_stops", [])}
    by_name = {s["name"].casefold(): s for s in approved.values()}
    src_text = {s["url"]: s.get("text", "") for s in packet.get("sources", [])}
    for day in travel.get("plan", {}).get("days", []):
        for stop in day.get("stops", []):
            identity = approved.get(stop.get("stop_id")) or by_name.get(stop.get("name", "").casefold())
            if identity is None:
                findings.append(f"stop not in approved_stops: {stop.get('name')!r}")
                continue
            detail = stop.get("detail", "")
            source_text = src_text.get(identity.get("source_url"), "")
            if detail and detail.strip() and detail not in source_text:
                findings.append(f"stop detail is not an exact substring of its cited source: {identity['name']!r}")

    summary = bundle.get("summary", {})
    tagline = summary.get("tagline", "")
    if tagline and len(tagline) > 90:
        severity = "pipeline cap (110) also exceeded" if len(tagline) > 110 else "within pipeline cap but over the task's 90-char bar"
        findings.append(f"tagline {len(tagline)} chars ({severity}): {tagline!r}")

    best_seasons = summary.get("best_seasons", [])
    if not set(best_seasons) <= SEASONS:
        findings.append(f"best_seasons has values outside spring/summer/fall/winter: {best_seasons}")
    for where, marker in find_blocked_text(bundle):
        findings.append(f"BLOCKING: placeholder text {marker!r} in {where} (publication gate)")

    haystacks = [tagline] + [d.get("detail", "") for day in travel.get("plan", {}).get("days", []) for d in day.get("stops", [])]
    for text in haystacks:
        low = text.lower()
        for phrase in BANNED:
            if phrase in low:
                quoted = any(phrase in src_text.get(s["url"], "").lower() for s in packet.get("sources", []))
                findings.append(f"banned phrase {phrase!r} found" + (" (inside a verbatim quoted source, not generated prose)" if quoted else " (in generated/templated text)"))
    return findings


def load_hero(slug):
    for d in FACTS_DIRS:
        p = d / f"{slug}.json"
        if p.exists():
            data = load_json(p)
            return data.get("hero")
    return None


def main():
    rows = catalogs()
    report = {"generated_for": "fr/pt/gr 2026-11 wave", "per_place": {}, "hero_urls": {}, "totals": {"checked": 0, "clean": 0, "with_findings": 0, "no_bundle": 0}}
    for slug in sorted(rows):
        packet_path = PACKETS / f"{slug}.json"
        bundle_path = BUNDLES / f"{slug}.json"
        if not packet_path.exists() and not bundle_path.exists():
            continue  # held before any artifact was written; covered by the *-result.json counts instead
        if not bundle_path.exists():
            report["totals"]["no_bundle"] += 1
            report["per_place"][slug] = ["no combined-content bundle (packet collected but not yet validated/bundled)"]
            continue
        packet = load_json(packet_path) if packet_path.exists() else {"__error__": "missing source packet"}
        bundle_doc = load_json(bundle_path)
        findings = check_place(slug, packet, bundle_doc)
        report["totals"]["checked"] += 1
        if findings:
            report["totals"]["with_findings"] += 1
        else:
            report["totals"]["clean"] += 1
        report["per_place"][slug] = findings
        hero = load_hero(slug)
        if hero:
            url = hero.get("url")
            if not hero.get("credit") or hero.get("credit") == "Unknown" or not hero.get("license") or hero.get("license") == "See source":
                report["per_place"].setdefault(slug, []).append(f"hero photo missing credit/licence: {hero}")
            if url:
                report["hero_urls"].setdefault(url, []).append(slug)

    dup_covers = {url: slugs for url, slugs in report["hero_urls"].items() if len(slugs) > 1}
    report["duplicate_covers_within_batch"] = dup_covers

    (OUT / "report-data.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
    lines = [
        "# fr/pt/gr offline verification (Step E)", "",
        f"Checked {report['totals']['checked']} places with a combined-content bundle; "
        f"{report['totals']['clean']} clean, {report['totals']['with_findings']} with findings, "
        f"{report['totals']['no_bundle']} with a packet but no bundle yet.", "",
        f"Duplicate cover photos within this batch: {len(dup_covers)}", "",
    ]
    for slug, findings in report["per_place"].items():
        if findings:
            lines.append(f"## {slug}")
            lines += [f"- {f}" for f in findings]
            lines.append("")
    (OUT / "verification-findings.md").write_text("\n".join(lines))
    print(json.dumps(report["totals"], indent=2))


if __name__ == "__main__":
    main()
