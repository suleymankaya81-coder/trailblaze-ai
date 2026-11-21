"""Publication gate: page text must never contain redaction markers or placeholder copy.

Used by publish-wave.py (before a destination is published) and by
scripts/audits/fr-pt-gr-2026-11/verify.py (offline bundle check). Any hit blocks publication.
"""
import re

BLOCKED_TEXT = (
    '[dated source]',
    '[source datée]',
    '[datierter Quelle]',
    '[datiert Quelle]',
    'Check official seasonal information',
)
# Keys that hold links or identifiers rather than page text.
IGNORED_KEYS = {'url', 'sourceUrl', 'source_url', 'stop_id', 'id', 'photo', 'image', 'hero_image'}


def find_blocked_text(value, path=''):
    """Return [(path, blocked text)] for every string inside value (dict/list/str) that contains a marker."""
    hits = []
    if isinstance(value, str):
        hits += [(path or '(text)', marker) for marker in BLOCKED_TEXT if marker in value]
    elif isinstance(value, dict):
        for key, item in value.items():
            if key not in IGNORED_KEYS:
                hits += find_blocked_text(item, f'{path}.{key}' if path else str(key))
    elif isinstance(value, list):
        for index, item in enumerate(value):
            hits += find_blocked_text(item, f'{path}[{index}]')
    return hits


def day_start_mismatches(english_plan, translated_fields):
    """German/French day starts must name the same starting place as the English plan
    ("Suggested: morning departure from X" → the translation must contain X). Returns day indexes."""
    bad = []
    en_days = (english_plan or {}).get('days') or []
    tr_days = (translated_fields or {}).get('days') or []
    for index, (en, tr) in enumerate(zip(en_days, tr_days)):
        match = re.fullmatch(r'Suggested: morning departure from (.+)', en.get('start') or '')
        if match and match.group(1) not in (tr.get('start') or ''):
            bad.append(index)
    return bad


def publication_problems(destination, translations=()):
    """Problems that block publishing one destination and its stored translations."""
    problems = []
    english = {k: destination.get(k) for k in ('tagline', 'seo_title', 'seo_description', 'best_season',
                                              'permit_headline', 'permit_note', 'travel_plan')}
    for where, marker in find_blocked_text(english):
        problems.append(f'placeholder text "{marker}" in {where}')
    for row in translations:
        locale, fields = row.get('locale'), row.get('fields') or {}
        for where, marker in find_blocked_text(fields):
            problems.append(f'placeholder text "{marker}" in {locale}:{where}')
        for index in day_start_mismatches(destination.get('travel_plan'), fields):
            problems.append(f'{locale}: day {index + 1} start does not name the English starting place')
    return problems
