"""Step B: de-duplicate also_regions in the France catalog in place, dropping entries equal to the primary region."""
import json
from pathlib import Path

PATH = Path(__file__).parent / "catalog.json"
rows = json.loads(PATH.read_text())
changed = 0
for r in rows:
    before = r.get("also_regions", [])
    seen = []
    for v in before:
        if v != r["region"] and v not in seen:
            seen.append(v)
    if seen != before:
        changed += 1
    r["also_regions"] = seen
PATH.write_text(json.dumps(rows, ensure_ascii=False, indent=1) + "\n")
print(f"de-duplicated also_regions on {changed}/{len(rows)} rows")
