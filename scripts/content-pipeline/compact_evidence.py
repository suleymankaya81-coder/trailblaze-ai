"""Bounded evidence, with editorially approved exact-phrase stop identities."""
import re
from source_evidence import overview_source

MAX_SOURCE_CHARS = 14000

def plain(text):
    text = re.sub(r'!?\[([^\]]*)\]\([^)]*\)', r'\1', text)
    return re.sub(r'https?://\S+', '', text)

def approved_stops(packet):
    stops = packet.get('approved_stops', [])
    if not stops:
        raise ValueError('HELD: at least one editorially approved sourced stop required')
    official = {s['url']: plain(s['text']) for s in packet['sources'] if overview_source(s, packet)}
    ids = set()
    for stop in stops:
        if stop['id'] in ids or not stop['name'].strip():
            raise ValueError('HELD: duplicate/empty approved stop')
        ids.add(stop['id'])
        quote = stop['quote']
        if len(quote) < 20 or quote not in official.get(stop['source_url'], '') or stop['name'].casefold() not in quote.casefold():
            raise ValueError('HELD: stop lacks exact official evidence: ' + stop['name'])
    return stops

def compact_packet(packet):
    stops = approved_stops(packet)
    sources = []
    remaining = MAX_SOURCE_CHARS
    # Explicit excerpts are reviewed once, never silently cut from operational evidence.
    for src in packet['sources']:
        excerpts = src.get('generation_excerpts')
        if not excerpts:
            if src['kind'] == 'official':
                raise ValueError('HELD: review compact official excerpts before generation: ' + src['url'])
            continue
        clean = plain(src['text'])
        if any(excerpt not in clean for excerpt in excerpts):
            raise ValueError('HELD: excerpt is not an exact source quote')
        text = '\n\n'.join(dict.fromkeys(excerpts))
        remaining -= len(text)
        if remaining < 0:
            raise ValueError('HELD: compact evidence exceeds budget; review excerpts, do not truncate')
        sources.append({'url': src['url'], 'kind': src['kind'], 'text': text})
    if not sources:
        raise ValueError('HELD: compact evidence missing')
    return {**{k: packet[k] for k in ('evidence_policy', 'country_code', 'identity_verified') if k in packet},
            'slug': packet['slug'], 'sources': sources, 'approved_stops': stops}