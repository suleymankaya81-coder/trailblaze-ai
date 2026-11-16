"""Offline excerpt translation; original official evidence remains immutable."""
import hashlib
import json
from pathlib import Path

CACHE = Path(__file__).parent / 'dach' / 'translations'

def translate_excerpt(text, source='de'):
    CACHE.mkdir(parents=True, exist_ok=True)
    path = CACHE / (hashlib.sha256((text if source == 'de' else source + ':' + text).encode()).hexdigest() + '.json')
    if path.exists():
        return json.loads(path.read_text())['translated']
    import argostranslate.translate
    value = argostranslate.translate.translate(text, source, 'en')
    if not value.strip():
        raise ValueError('empty local translation')
    path.write_text(json.dumps({'original': text, 'translated': value, 'method': f'Argos {source}-en offline; machine translation, not independent factual review'}, ensure_ascii=False, indent=2))
    return value