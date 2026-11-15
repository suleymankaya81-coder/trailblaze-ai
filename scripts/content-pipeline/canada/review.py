"""Persist sourced Canadian overrides across preparation/generation retries."""
import json
from pathlib import Path

REVIEW = Path(__file__).with_name('review.json')

def overrides(slug):
    return json.loads(REVIEW.read_text()).get('records', {}).get(slug, {}).get('fields', {})

def reviewed_item(item):
    fields = overrides(item['slug'])
    return {**item, **({'plan': fields['travel_plan']} if 'travel_plan' in fields else {}),
            **({'headline': fields['permit_headline']} if 'permit_headline' in fields else {}),
            **({'reservation': fields['permit_note']} if 'permit_note' in fields else {}),
            **({'source_url': fields['permit_source_url']} if 'permit_source_url' in fields else {})}