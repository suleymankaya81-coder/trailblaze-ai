"""Drop dated statements from quoted source text instead of leaving visible placeholder tokens.

Quoted evidence may contain years ("established in 2009", "the 2021/22 season"). Pages must not
state dated facts as current, and the travel validator rejects any 20xx year. Earlier code replaced
the year with the literal token "[dated source]", which then appeared on English pages and was
machine-translated into "[source datée]" / "[datierter Quelle]". Now the whole sentence holding the
year is removed; if that would leave nothing, the first clause before the year is kept without
dangling words; if even that is too short, the text becomes empty and normal validation holds it.
"Natura 2000" is the name of the EU nature network, not a date, and is kept.
The same rules are mirrored in scripts/audits/translations-2026-11/fixes/01-helper.sql.
"""
import re

YEAR = re.compile(r'\b20\d{2}\b')
NOT_A_DATE = re.compile(r'\bNatura[ -]2000\b')
PLACEHOLDER_TOKENS = ('[dated source]', '[source datée]', '[datierter Quelle]', '[datiert Quelle]')
_TOKEN = re.compile(r'\[(dated source|source datée|datierter Quelle|datiert Quelle)\]')
_PROT, _SEP = '', ''
_ABBR = re.compile(r'(^|[^\w])(St|Ste|Mt|Dr|Nr|ca|Ca|bzw|vgl|Jh|Mio|Mrd|Str|No|Nos|Ft|Pt|Co|Jr|Sr|Hwy|Rd|Ave|Blvd'
                   r'|approx|etc|env|z\.B|d\.h|u\.a|e\.g|i\.e|U\.S)\.')
_ORDINAL = re.compile(r'(\d{1,2})\.(\s+)(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober'
                      r'|November|Dezember|Jahrhundert|Jh)')
_BOUNDARY = re.compile(r'([.!?…]+["»“”\'’)\]]*)(\s+)(?![a-zß-öø-ÿ])')
_MONTH_TAIL = re.compile(r'\s(in|en|im|au mois de)\s(January|February|March|April|May|June|July|August|September'
                         r'|October|November|December|janvier|février|mars|avril|mai|juin|juillet|août|septembre'
                         r'|octobre|novembre|décembre|Januar|Februar|März|Mai|Juni|Juli|Oktober|Dezember)$')
_DANGLING = set('''in on at of since from between by until to and or the a an was were is are been be which that
around about circa c. early late mid during as established founded created opened designated declared inaugurated
awarded listed built completed named launched started revealed renamed became protected
en le la les l' du de des d' depuis entre et ou au aux à dans vers été a ont est sont créé créée créés créées fondé
fondée établi établie inauguré inaugurée ouvert ouverte classé classée classés classées déclaré déclarée désigné
désignée achevé construit nommé devenu protégé fondés
im am an auf um seit von vom bis zwischen und oder der die das dem den ein eine wurde wurden ist sind war waren
gegründet eröffnet errichtet eingerichtet ausgewiesen erklärt geschaffen benannt gebaut ernannt jahr jahre
jahren'''.split())


def has_year(text):
    return bool(YEAR.search(NOT_A_DATE.sub('', text or '')))


def find_tokens(text):
    return [t for t in PLACEHOLDER_TOKENS if t in (text or '')]


def strip_dangling(text):
    t = (text or '').strip()
    while True:
        t = re.sub(r'[\s,;:(\[–—-]+$', '', t)
        t = _MONTH_TAIL.sub('', t)
        words = t.split()
        if not words:
            return ''
        last = words[-1].lower()
        if last in _DANGLING or re.fullmatch(r'\d+(er|e|\.)?', last):
            t = t[: len(t) - len(words[-1])].strip()
        else:
            return t


def _sentences(text):
    work = _ABBR.sub(lambda m: m.group(1) + m.group(2) + _PROT, text)
    work = _ORDINAL.sub(lambda m: m.group(1) + _PROT + m.group(2) + m.group(3), work)
    work = _BOUNDARY.sub(lambda m: m.group(1) + _SEP + m.group(2), work)
    return work.split(_SEP)


def _word_count(text):
    return len(re.sub(r'^[^.!?]*:\s*', '', text).split())


def drop_dated(text, is_dated=has_year):
    """Remove every sentence for which is_dated() is true (default: a 20xx year)."""
    if not text or not is_dated(text):
        return text
    kept, first_hit = [], None
    for piece in _sentences(text):
        if is_dated(piece.replace(_PROT, '.')):
            first_hit = first_hit if first_hit is not None else piece
        else:
            kept.append(piece)
    result = ''.join(kept).replace(_PROT, '.').strip()
    if result and not re.fullmatch(r'[^.!?]*:', result) and len(result.split()) >= 5:
        return result
    prefix = result if re.fullmatch(r'[^.!?]*:', result) else ''
    clause = first_hit.replace(_PROT, '.')
    marker = _TOKEN.search(clause) or YEAR.search(NOT_A_DATE.sub(lambda m: 'N' * len(m.group(0)), clause))
    clause = strip_dangling(clause[: marker.start()] if marker else clause)
    if _word_count(clause) < 5:
        return ''
    if not re.search(r'[.!?…]$', clause):
        clause += '.'
    return f'{prefix} {clause}'.strip()


def drop_placeholder_sentences(text):
    """Remove sentences that still contain an old placeholder token (same rule as 01-helper.sql)."""
    return drop_dated(text, is_dated=lambda s: bool(_TOKEN.search(s)))
