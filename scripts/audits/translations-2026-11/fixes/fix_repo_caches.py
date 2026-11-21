"""Apply the 2026-11 translation rules to the translation caches stored in the repository, so a later
pipeline run reuses corrected wording instead of re-creating the published errors.

Touches only files in the repo (no database, no network, no model calls):
  * scripts/content-pipeline/dach/german-page-cache/*.json   Argos phrase cache + per-slug German outputs
  * scripts/content-pipeline/dach/translations/en-de-*.json  Argos phrase cache (multi-day German)
  * data/translations/fr/phrases.json                         French phrase dictionary
  * data/translations/fr/reviewed-phrases.json                reviewed French overrides
Rules (same wording as 01-helper.sql / 03-apply.sql):
  A  sentences with [dated source]/[source datée]/[datierter Quelle]/[datiert Quelle] removed
     (per-slug German outputs only; phrase caches are keyed by their English source text)
  B1–B5 German templates, D1 "Timing" → "Horaires", D2 duplicate km/miles where the km equals English.
D2 cases whose number differs from English and every D3 article are NOT changed here (D3 needs the
place name; french-translation.mjs applies it when a page is saved).
Run from the repo root: python3 scripts/audits/translations-2026-11/fixes/fix_repo_caches.py [--check]
--check only prints counts and writes nothing. Running twice changes nothing the second time.
"""
import glob
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT / 'scripts' / 'content-pipeline'))
from dated_text import drop_placeholder_sentences  # noqa: E402

B_LITERAL = [
    ('Eintritt, aktivitätsberechtigungen und Übernachtung sind separate Überprüfungen; die quellenauszüge unten '
     'stellen die verfügbarkeit für ihre daten nicht fest.',
     'Eintritt, Aktivitätsgenehmigungen und Übernachtung müssen separat geprüft werden; die Quellenauszüge unten '
     'belegen keine Verfügbarkeit für Ihre Reisedaten.'),
    ('Wählen Sie einen lokalen Besuch; Reisezeit und Weiterleitungen werden nicht überprüft.',
     'Wählen Sie einen Besuch vor Ort; Reisezeit und Anschlussverbindungen werden nicht geprüft.'),
]
B_REGEX = [
    (r'Die überprüften Quellen legen keine aktuellen Parkbedingungen für (.+?) fest\.',
     r'Die geprüften Quellen belegen keine aktuellen Parkbedingungen für \1.'),
    (r'Die überprüften Quellen legen keine mobile Abdeckung für (.+?) fest\.',
     r'Die geprüften Quellen belegen keinen Mobilfunkempfang für \1.'),
    (r'Die überprüften Quellen stellen keine Kraftstoffverfügbarkeit für (.+?) fest\.',
     r'Die geprüften Quellen belegen keine Tankmöglichkeiten für \1.'),
    (r'Die überprüften Quellen erstellen keine Best-Saison-Empfehlung für (.+?)\.(\s|$)',
     r'Die geprüften Quellen belegen keine Empfehlung zur besten Reisezeit für \1.\2'),
    (r'Die überprüften Quellen legen nicht alle aktuellen Zugangsbeschränkungen für (.+?) fest\.',
     r'Die geprüften Quellen belegen nicht alle aktuellen Zugangsbeschränkungen für \1.'),
    (r'Die überprüften Quellen legen keinen gemessenen Ankunftsplan oder Versorgungsstopps für (.+?) fest\.',
     r'Die geprüften Quellen belegen weder einen gemessenen Ankunftsplan noch Versorgungsstopps für \1.'),
    (r'Die überprüften Quellen legen keine Fahrzeuggröße oder Mietbeschränkungen fest; nehmen Sie keinen RV-Zugang für (.+?) an\.',
     r'Die geprüften Quellen belegen keine Beschränkungen für Fahrzeuggröße oder Mietwagen; gehen Sie nicht davon aus, '
     r'dass \1 mit dem Wohnmobil erreichbar ist.'),
    (r'Die überprüften Quellen legen keinen verifizierten Sonnenauf- oder -untergangsstandpunkt für (.+?) fest\.',
     r'Die geprüften Quellen belegen keinen verifizierten Aussichtspunkt für Sonnenauf- oder -untergang bei \1.'),
]
DE_TITLES = {'Parkkontrolle': 'Parken', 'Zugangskontrolle': 'Zugang', 'Zeitplanungsprüfung': 'Beste Reisezeit',
             'Kraftstoffprüfung': 'Tanken', 'Signalprüfung': 'Mobilfunkempfang'}
SKIP_KEYS = {'name', 'stop_id', 'routingName', 'kind', 'url', 'sourceUrl', 'source_url', 'label', 'id'}
NUM = r'([0-9]+(?:[.,][0-9]+)?)'


def german_text(text):
    for old, new in B_LITERAL:
        text = text.replace(old, new)
    for pattern, repl in B_REGEX:
        text = re.sub(pattern, repl, text)
    return text


def german_doc(value, key=None, placeholders=True):
    if isinstance(value, str):
        out = german_text(value)
        if key == 'title' and out in DE_TITLES:
            out = DE_TITLES[out]
        if key == 'start':
            out = re.sub(r'^(Vorgeschlagen|Empfohlen):\s+', 'Vorschlag: ', out)
        return drop_placeholder_sentences(out) if placeholders else out
    if isinstance(value, dict):
        return {k: v if k in SKIP_KEYS else german_doc(v, k, placeholders) for k, v in value.items()}
    if isinstance(value, list):
        return [german_doc(v, key, placeholders) for v in value]
    return value


def french_distance(fr, en):
    """('fix', text) when the kept km equals the English km, ('mismatch', fr) when it differs, (None, fr)."""
    m = re.match(r'^About ([0-9][0-9.,]*) km from ', en or '')
    if not m or not fr:
        return None, fr
    en_km = float(m.group(1).replace(',', ''))
    num = lambda s: float(s.replace(' ', '').replace(',', '.'))
    a = re.search(NUM + r' km ?[\[(] ?' + NUM + r' ?(km|miles?|mi) ?[\])]', fr)
    if a:
        if num(a.group(1)) == en_km:
            return 'fix', fr[:a.start()] + a.group(1) + ' km' + fr[a.end():]
        return 'mismatch', fr
    b = re.search(NUM + r' ?(miles?|mi) ?[\[(] ?' + NUM + r' ?km ?[\])]', fr)
    if b:
        if num(b.group(3)) == en_km:
            return 'fix', fr[:b.start()] + b.group(3) + ' km' + fr[b.end():]
        return 'mismatch', fr
    return None, fr


def write_json(path, data, raw):
    # Keep each file's own layout: indented, Python-style one line, or compact JS (JSON.stringify).
    if '\n' in raw.strip():
        text = json.dumps(data, ensure_ascii=False, indent=2)
    elif '": ' in raw[:400] or '", "' in raw[:400]:
        text = json.dumps(data, ensure_ascii=False)
    else:
        text = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    if raw.endswith('\n') and not text.endswith('\n'):
        text += '\n'
    path.write_text(text)


def main(check):
    counts = {'de_phrase_cache': 0, 'de_slug_outputs': 0, 'fr_phrases': 0, 'fr_reviewed': 0, 'fr_distance_mismatch': 0}
    pipeline = ROOT / 'scripts' / 'content-pipeline' / 'dach'
    for name in sorted(glob.glob(str(pipeline / 'german-page-cache' / '*.json')) + glob.glob(str(pipeline / 'translations' / 'en-de-*.json'))):
        path = Path(name)
        raw = path.read_text()
        data = json.loads(raw)
        if isinstance(data.get('translated'), str):            # phrase cache entry
            new = german_doc(data['translated'], placeholders=False)
            if data.get('original', '').strip() in {'Parking check', 'Access check', 'Timing check', 'Fuel check', 'Signal check'}:
                new = DE_TITLES.get(new, new)
            if data.get('original', '').startswith('Suggested:'):
                new = re.sub(r'^(Vorgeschlagen|Empfohlen):\s+', 'Vorschlag: ', new)
            if new != data['translated']:
                counts['de_phrase_cache'] += 1
                if not check:
                    data['translated'] = new
                    data['review'] = '2026-11 translation audit: reviewed template wording (rules B1–B5)'
                    write_json(path, data, raw)
        elif isinstance(data.get('days'), list):              # per-slug German output
            new = german_doc(data)
            if new != data:
                counts['de_slug_outputs'] += 1
                if not check:
                    write_json(path, new, raw)

    fr_dir = ROOT / 'data' / 'translations' / 'fr'
    phrases_path = fr_dir / 'phrases.json'
    raw = phrases_path.read_text()
    phrases = json.loads(raw)
    for en, fr in list(phrases.items()):
        new = 'Horaires' if en == 'Timing check' and fr == 'Timing' else fr
        status, fixed = french_distance(new, en)
        if status == 'fix':
            new = fixed
        elif status == 'mismatch':
            counts['fr_distance_mismatch'] += 1
        if new != fr:
            counts['fr_phrases'] += 1
            phrases[en] = new
    if counts['fr_phrases'] and not check:
        write_json(phrases_path, phrases, raw)

    reviewed_path = fr_dir / 'reviewed-phrases.json'
    raw = reviewed_path.read_text()
    reviewed = json.loads(raw)
    if reviewed.get('Timing check') != 'Horaires':
        counts['fr_reviewed'] += 1
        reviewed['Timing check'] = 'Horaires'
        if not check:
            write_json(reviewed_path, reviewed, raw)
    print(json.dumps(counts))


if __name__ == '__main__':
    main('--check' in sys.argv)
