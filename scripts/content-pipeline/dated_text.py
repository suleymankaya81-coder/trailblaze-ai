"""Drop dated statements from quoted source text instead of leaving visible placeholder tokens.

Quoted evidence may contain years ("established in 2009", "the 2021/22 season"). Pages must not
state dated facts as current, and the travel validator rejects any 20xx year. Earlier code replaced
the year with the literal token "[dated source]", which then appeared on English pages and was
machine-translated into "[source datée]" / "[datierter Quelle]".

Rule A, version 2 (same rules as scripts/audits/translations-2026-11/fixes/01b-helper-rule-a-v2.sql;
the two give identical results on the 463 live preview items):
  1. remove every sentence holding a year/token; drop trailing kept pieces that are fragments;
  2. if nothing valid is left, take the clause before the marker and run the dangling check
     (clause_problems): no relative pronoun/conjunction/auxiliary/preposition at the end, no participle
     lead-in without a year, no bare day + month or month without year, a main verb present, not a
     fragment start ("Mit", "With", "Avec", lower case, verb first), at least 5 words;
  3. when invalid: (a) cut back to the last complete clause, (a2) keep the main clause after a short
     dated opening phrase ("Created in 2009, it …"), (b) for tagline / seo_description /
     metaDescription the next marked sentence that yields a valid clause, (c) otherwise unresolved.
Never writes a fragment. "Natura 2000" is the name of the EU nature network, not a date, and is kept.
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

MONTHS = ('January|February|March|April|May|June|July|August|September|October|November|December|'
          'janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|'
          'Januar|Februar|März|Juni|Juli|Oktober|Dezember')
_DAY_MONTH = re.compile(r'\b\d{1,2}(\.|er|st|nd|rd|th)?\s+(?i:' + MONTHS + r')\b(?!\s*,?\s*\d{4})'
                        r'|\b(?i:' + MONTHS + r')\s+\d{1,2}\b(?!\s*,?\s*\d{4})')
_ENDS_MONTH = re.compile(r'\b(?i:' + MONTHS + r')$')
_MONTH_NO_YEAR = re.compile(r'\b(in|en|im|on|since|seit|depuis|au mois de|von|bis|début|fin|mi|anfang|ende|mitte'
                            r'|early|late|mid|begin of)[ -](' + MONTHS + r')\b(?!\s*,?\s*\d{4})', re.I)
PARTICIPLES = set('''established founded created opened designated declared inaugurated awarded listed built completed named
launched started revealed renamed protected accepted added chosen ouvert ouverte geöffnet créé créée créés créées fondé
fondée établi établie inauguré inaugurée classé classée classés classées déclaré déclarée désigné désignée accepté acceptée
ajouté ajoutée gegründet eröffnet errichtet eingerichtet ausgewiesen erklärt geschaffen benannt gebaut ernannt angelegt
eingeweiht angenommen hinzugefügt'''.split())
_DANGLING_END = set('''which that who whose whom where when and or but nor as than the a an is are was were be been being
has have had of in on at by to from with for since until into onto upon about around during after before between through
via per qui que qu' dont où lequel laquelle lesquels et ou mais ni comme le la les l' un une des du de d' au aux à en
dans par pour avec sur sous vers chez depuis entre jusqu' est sont était étaient ont avait été être situé située der die
das dem den ein eine einer eines einem einen welche welcher welches und oder aber sowie als wie ist sind war waren wurde
wurden worden wird werden hat haben hatte im am an auf aus bei mit nach seit von vom zu zum zur bis für durch gegen um
über unter vor zwischen während'''.split())
_DE_AUX = {'wurde', 'wurden', 'ist', 'sind', 'war', 'waren', 'wird', 'werden', 'hat', 'haben', 'hatte'}
_FRAGMENT_START = re.compile(r'^(Mit|With|Avec|Since|Seit|Depuis|From|Von|Vom|Ab|Am|On|Durch|Through|During|Während'
                             r'|Pendant|Après|After|Nach|Until|Bis|Jusqu|And|Und|Et|But|Aber|Mais|Or|Oder|Ou|Which|That'
                             r'|Qui|Que|Dont)\b')
_VERB_FIRST = re.compile(r'^(Ist|Sind|War|Waren|Wurde|Wurden|Hat|Haben|Hatte|Umfasst|Liegt|Est|Sont|Is|Are|Was|Were'
                         r'|Has|Have)\b')
VERBS = re.compile(r'\b(is|are|was|were|has|have|had|covers|cover|includes|include|lies|lie|contains|consists|forms|'
                   r'comprises|extends|spans|became|becomes|received|attained|completed|offers|runs|flows|rises|stands|'
                   r'borders|protects|attracts|features|houses|hosts|reaches|measures|belongs|surrounds|connects|'
                   r'encompasses|increases|announced|remains|means|ist|sind|war|waren|wurde|wurden|hat|haben|hatte|'
                   r'hatten|umfasst|umfassen|liegt|liegen|erhielt|erreichte|befindet|befinden|gehört|bildet|bietet|'
                   r'erstreckt|fließt|zählt|beherbergt|grenzt|besteht|reicht|trägt|schützt|zieht|verbindet|misst|'
                   r'kündigte|bleibt|gilt|heißt|est|sont|était|étaient|a|ont|avait|avaient|couvre|couvrent|comprend|'
                   r'comprennent|comptait|compte|abrite|forme|possède|offre|borde|protège|attire|traverse|relie|mesure|'
                   r'appartient|entoure|domine|accueille|s\'étend|se trouve|se situe|agit|englobe|passe|annoncé|reste|'
                   r'signifie)\b', re.I)
_RELATIVE = re.compile(r'(,\s+(der|die|das|dem|den|welche[rs]?|which|who|qui|que|dont)\s|\s(that|which|qui|que|dont)\s)'
                       r'(?!.*(,\s+(der|die|das|dem|den|welche[rs]?|which|who|qui|que|dont)\s|\s(that|which|qui|que|dont)\s))'
                       r'(.*)$')
_LEAD_IN = re.compile(r'(,\s|\s\(|\s[–—-]\s|\s(?=(that|which|who|whose|where|when|established|founded|created|opened|'
                      r'designated|declared|inaugurated|since|on|as of|by|with|in|from|for|at|until|qui|que|dont|où|'
                      r'créée?s?|établie?s?|fondée?s?|inaugurée?s?|déclarée?s?|désignée?s?|depuis|le|au|avec|par|en|pour|'
                      r'dans|jusqu|der|die|das|welche[rs]?|gegründet|eingerichtet|eröffnet|ausgewiesen|seit|am|vom|mit|'
                      r'durch|im|in|für|bis|und|and|et)\b))')
_TAIL_WORDS = set('''in on at of since from between by until to and or the a an which that around about as en le la les
l' du de des d' depuis entre et ou au aux à dans vers qui que dont im am an auf um seit von vom bis zwischen und oder der
die das dem den ein eine'''.split())
SUMMARY_FIELDS = ('tagline', 'seo_description', 'metaDescription')


def has_year(text):
    return bool(YEAR.search(NOT_A_DATE.sub('', text or '')))


def find_tokens(text):
    return [t for t in PLACEHOLDER_TOKENS if t in (text or '')]


def strip_dangling(text):
    """Remove trailing punctuation and prepositions/articles/pronouns (never verbs)."""
    t = (text or '').strip()
    while True:
        t = re.sub(r'[\s,;:(\[–—/-]+$', '', t)
        words = t.split()
        if words and (words[-1].lower() in _TAIL_WORDS or re.fullmatch(r'\d+(er|e|\.)?', words[-1].lower())):
            t = t[: len(t) - len(words[-1])].strip()
        else:
            return t


def clause_problems(text, strict=True):
    """Reasons why a clause (without final punctuation) must not be written; [] = valid."""
    body = re.sub(r'^[^.!?:]{1,90}\s?:\s', '', (text or '').strip())
    words = body.split()
    last = (words or [''])[-1].lower().strip('"»«“”()')
    prev = words[-2] if len(words) > 1 else ''
    p = []
    if '[' in body: p.append('token/bracket')
    if len(words) < 5: p.append('short')
    if re.match(r'^[a-zß-öø-ÿ]', body): p.append('lowercase start')
    if _FRAGMENT_START.match(body): p.append('fragment start')
    if _VERB_FIRST.match(body): p.append('starts with verb')
    if last in PARTICIPLES and not re.search(r'\b1[5-9]\d{2}\b', body): p.append('participle end without year')
    de_aux_ok = last in _DE_AUX and re.fullmatch(r'[a-zäöüß-]+(t|en)', prev)
    if (last in _DANGLING_END and last not in PARTICIPLES and not de_aux_ok) or \
            f'{prev} {last}'.lower() in ('a été', 'ont été', 'as of', 'seit dem', 'depuis le'):
        p.append('dangling word')
    if re.search(r'([/–—,;:(-]|\bn°|\bNo\.?|\bNr\.?)$', body): p.append('dangling mark')
    if re.search(r'\b(by|par|durch|per)\s+(the\s+|le\s+|la\s+)?(Decree|Law|Act|décret|loi|Gesetz|Dekret|Verordnung)$', body, re.I):
        p.append('dangling reference')
    rel = _RELATIVE.search(body)
    if rel:
        tail = rel.group(rel.lastindex)
        if not VERBS.search(tail) and not any(w.lower().strip('.,') in PARTICIPLES for w in tail.split()):
            p.append('relative clause without verb')
    if strict:
        if _DAY_MONTH.search(body): p.append('bare day-month')
        if _ENDS_MONTH.search(body): p.append('ends with month')
        if _MONTH_NO_YEAR.search(body): p.append('month without year')
        if not VERBS.search(body): p.append('no verb')
    return p


def _finish(text):
    text = re.sub(r'\s+([.!?…])$', r'\1', text.strip())
    return text if re.search(r'[.!?…]$', text) else text + '.'


def _cut_back(text):
    cur = text
    while True:
        matches = list(_LEAD_IN.finditer(cur))
        if not matches:
            return None
        cur = cur[: matches[-1].start()]
        cand = strip_dangling(cur)
        if cand and not clause_problems(cand):
            return cand


def _sentences(text):
    work = _ABBR.sub(lambda m: m.group(1) + m.group(2) + _PROT, text)
    work = _ORDINAL.sub(lambda m: m.group(1) + _PROT + m.group(2) + m.group(3), work)
    work = _BOUNDARY.sub(lambda m: m.group(1) + _SEP + m.group(2), work)
    return [piece.replace(_PROT, '.') for piece in work.split(_SEP)]


def _truncated_token_tail(text):
    m = re.search(r'\[([^\]]*)$', text)
    return bool(m and len(m.group(1)) >= 2 and any(t[1:-1].startswith(m.group(1)) for t in PLACEHOLDER_TOKENS))


def _clause_from(piece, marker):
    """Clause candidates for one marked sentence: before marker, (a2) after a short opening phrase, (a) cut back."""
    found = marker.search(piece)
    clause = strip_dangling(piece[: found.start()] if found else re.sub(r'\[[^\]]*$', '', piece))
    if clause and not clause_problems(clause):
        return _finish(clause), 'fallback'
    if found:
        head, rest = piece[: found.start()], piece[found.end():]
        if rest.startswith(',') and len(head) <= 40 and len(head.split()) <= 4 and '[' not in head and ',' not in head and not VERBS.search(head):
            rest = rest[1:].strip()
            rest = rest[:1].upper() + rest[1:]
            if rest and not _TOKEN.search(rest) and not has_year(rest) and not clause_problems(re.sub(r'[.!?…]+$', '', rest)):
                return _finish(rest), 'fallback_intro'
    cut = _cut_back(clause) if clause else None
    if cut:
        return _finish(cut), 'fallback_cut'
    return None, 'unresolved'


def remove_marked(text, is_marked, marker, field=None):
    """(result, mode) — mode: none, removed, fallback, fallback_cut, fallback_intro, fallback_next, unresolved."""
    pieces = _sentences(text)
    kept, hits = [], []
    for i, piece in enumerate(pieces):
        if is_marked(piece) or (i == len(pieces) - 1 and _truncated_token_tail(piece)):
            hits.append(piece.strip())
        else:
            kept.append(piece)
    while kept and not (len(kept) == 1 and re.fullmatch(r'[^.!?]*:', kept[0].strip())) and \
            clause_problems(re.sub(r'[.!?…]+["»“”\'’)\]]*$', '', kept[-1].strip()), strict=False):
        kept.pop()
    result = ''.join(kept).strip()
    if result and not re.fullmatch(r'[^.!?]*:', result):
        return result, 'removed'
    prefix = result
    for index, piece in enumerate(hits):
        if index > 0 and field not in SUMMARY_FIELDS:
            break
        clause, mode = _clause_from(piece, marker)
        if clause:
            return f'{prefix} {clause}'.strip(), (mode if index == 0 else 'fallback_next')
    return text, 'unresolved'


def drop_dated(text, is_dated=has_year, field=None):
    """Remove dated sentences (default: a 20xx year). Returns '' when no valid text can be kept,
    so normal validation holds the place instead of publishing a fragment."""
    if not text or not is_dated(text):
        return text
    marker = re.compile(r'(?<!Natura )(?<!Natura-)\b20\d{2}\b') if is_dated is has_year else _TOKEN
    result, mode = remove_marked(text, is_dated, marker, field)
    return '' if mode == 'unresolved' else result


def drop_placeholder_sentences(text, field=None):
    """Remove sentences holding an old placeholder token (same as SQL rule A v2); unresolved → unchanged."""
    return placeholder_rule_a(text, field)[0]


def placeholder_rule_a(text, field=None):
    if not text or (not _TOKEN.search(text) and not _truncated_token_tail(text)):
        return text, 'none'
    work = re.sub(r'Natura([ -])\[(dated source|source datée|datierter Quelle|datiert Quelle)\]', r'Natura\g<1>2000', text)
    if not _TOKEN.search(work) and not _truncated_token_tail(work):
        return work, 'natura'
    return remove_marked(work, lambda s: bool(_TOKEN.search(s)), _TOKEN, field)
