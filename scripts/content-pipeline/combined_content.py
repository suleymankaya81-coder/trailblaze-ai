"""One paid call per new destination; durable attempts prevent blind replays."""
import hashlib
import importlib.util
import json
from pathlib import Path
from compact_evidence import compact_packet
from source_evidence import load_packet, validate_citations, GROUNDING, allows_wikipedia_overview, overview_source
from gateway_call import call_ai_json

ROOT = Path(__file__).parent
CACHE = ROOT / 'combined-content'

def module(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / filename)
    if spec is None or spec.loader is None:
        raise RuntimeError('Missing writer module')
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result

def validate_bundle(bundle, slug, packet):
    if isinstance(bundle, list) and len(bundle) == 1 and isinstance(bundle[0], dict):
        bundle = bundle[0]
    travel = module('combined_travel', 'generate-travel-content.py')
    item = bundle['travel']
    if isinstance(item, dict) and isinstance(item.get('items'), list) and len(item['items']) == 1:
        item = item['items'][0]
        bundle['travel'] = item
    if item['slug'] != slug:
        raise ValueError('Slug mismatch')
    if not 1 <= len(item['plan']['days']) <= 3:
        raise ValueError('New destination visits require one to three days')
    stops = {s['id']: s for s in packet['approved_stops']}
    by_name = {s['name'].casefold(): s for s in stops.values()}
    used = set()
    for day in item['plan']['days']:
        for stop in day['stops']:
            identity = stops.get(stop.get('stop_id'))
            if identity is None:
                identity = by_name.get(stop.get('name', '').casefold())
            if identity is None:
                raise ValueError('Unapproved stop ID')
            stop['name'] = identity['name']
            stop['stop_id'] = identity['id']
            used.add(identity['id'])
    if not used:
        raise ValueError('At least one distinct sourced stop required')
    travel.validate(item)
    urls = [item['source_url']] + [s['url'] for s in item['plan']['sources']]
    validate_citations(urls, packet)
    official = {s['url'] for s in packet['sources'] if overview_source(s, packet)}
    if not set(urls) <= official:
        raise ValueError('Operational sources must be official')
    if allows_wikipedia_overview(packet):
        # Wikipedia overviews are deterministic, not a bypass for generated permit claims.
        name = item.get('overview_name', '')
        expected = ('Check the official visitor information for ' + name + ' before departure. '
                    'Entry, activity permissions and overnight accommodation are separate checks; '
                    'the source excerpts below do not establish availability for your dates.')
        if not name or item['headline'] != 'Check visitor access before departure' or item['reservation'] != expected:
            raise ValueError('Wikipedia overview must retain explicit operational unknowns')
    summary = bundle['summary']
    required = ['region','tagline','best_season','best_seasons','scenic_score','camping_score',
                'avg_daily_budget','trip_duration_days','recommended_duration','permit_level',
                'aliases','gateway_cities','similar_slugs','trip_tags','activities','seo_title']
    if any(k not in summary for k in required):
        raise ValueError('Incomplete summary')
    if summary['permit_level'] not in ('none', 'moderate', 'high'):
        raise ValueError('Invalid permit level: expected none, moderate or high')
    if not set(summary['best_seasons']) <= {'spring', 'summer', 'fall', 'winter'}:
        raise ValueError('Invalid season values')
    if not summary['tagline'] or len(summary['tagline']) > 110 or len(summary['seo_title']) > 60:
        raise ValueError('Invalid summary length')
    if summary['avg_daily_budget'] is not None:
        raise ValueError('No sourced budget benchmark supplied; budget must remain null')
    if not 1 <= len(summary['activities']) <= 3 or any(a not in {s['name'] for s in stops.values()} for a in summary['activities']):
        raise ValueError('Activities must use approved stop names')
    return bundle

def generate_bundle(prepared):
    slug = prepared['slug']
    packet = compact_packet(load_packet(slug))
    travel = module('combined_travel_prompt', 'generate-travel-content.py')
    summary_schema = {k: '' for k in ['region','tagline','best_season','trip_duration_days',
        'recommended_duration','permit_level','seo_title']}
    summary_schema.update(best_seasons=[],scenic_score=0,camping_score=0,avg_daily_budget=None,
        aliases=[],gateway_cities=[],similar_slugs=[],trip_tags=[],activities=[])
    travel_prompt = travel.PROMPT.replace('Return JSON object {"items":[...]}, exactly one per input slug, each:',
        'travel has the following schema:')
    prompt = (GROUNDING + '\nGenerate one object {"summary":...,"travel":...}.\n'
        + 'summary schema: ' + json.dumps(summary_schema)
        + '\nFor travel use the item schema below, not an items wrapper:\n' + travel_prompt
        + '\nEvery stop must contain stop_id from approved_stops. Do not select new names. '
        'Use one to three visit days, normally one for a compact attraction. '
        'Use only as many distinct IDs as the visit needs; never pad or duplicate stops. Summary activities are one to three approved stop names. '
        'similar_slugs must be []; avg_daily_budget must be null. Tagline max 110 chars, seo_title max 60 chars. '
        'permit_level must be exactly none, moderate or high, never prose or Parking Fee. '
        'best_seasons must use only lowercase spring, summer, fall, winter. '
        'Use only evidence for season, regional scores (editorial assessments), gateways and permit level. '
        'Do not invent signal coverage, fuel locations or parking conditions; when evidence is missing explicitly '
        'state the gap and direct readers to verify before departure. Cite every official source used.\n'
        + json.dumps({'slug': slug, 'name': prepared['name'], 'evidence': packet}, ensure_ascii=False))
    fingerprint = hashlib.sha256(prompt.encode()).hexdigest()
    CACHE.mkdir(exist_ok=True)
    path = CACHE / (slug + '.json')
    if path.exists():
        state = json.loads(path.read_text())
        if state['status'] == 'validated':
            return validate_bundle(state['bundle'], slug, packet)
        raise ValueError('HELD: prior attempt retained; explicit editorial review required before replay')
    state = {'fingerprint': fingerprint, 'status': 'started', 'prompt_chars': len(prompt)}
    # Exclusive creation prevents concurrent duplicate paid calls.
    with path.open('x') as f:
        json.dump(state, f)
    try:
        bundle = call_ai_json(prompt)
        state.update(status='received', bundle=bundle)
        path.write_text(json.dumps(state, ensure_ascii=False, indent=2))
        bundle = validate_bundle(bundle, slug, packet)
        state['bundle'] = bundle
        state['status'] = 'validated'
        path.write_text(json.dumps(state, ensure_ascii=False, indent=2))
        (ROOT / 'travel-content' / (slug + '.json')).write_text(json.dumps(bundle['travel'], ensure_ascii=False, indent=2))
        return bundle
    except Exception as error:
        state.update(status='held', error=type(error).__name__)
        path.write_text(json.dumps(state, ensure_ascii=False, indent=2))
        raise