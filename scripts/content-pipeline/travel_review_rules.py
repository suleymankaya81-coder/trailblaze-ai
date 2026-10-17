"""Apply evidence-backed marker decisions without guessing replacement coordinates."""
import json
from pathlib import Path

REVIEW_PATH = Path(__file__).with_name('travel-review-2026-10-17.json')

def reviewed_markers(slug, markers, review=None):
    review = review or json.loads(REVIEW_PATH.read_text())
    exclusions = {(item['slug'], item['name']) for item in review['markerExclusions']}
    corrections = {(item['slug'], item['name']): item['replacement'] for item in review['markerCorrections']}
    result = []
    for marker in markers:
        key = (slug, marker['name'])
        if key in exclusions:
            continue
        value = corrections.get(key, marker)
        if value not in result:
            result.append(value.copy())
    return result