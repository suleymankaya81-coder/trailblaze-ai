"""No-model compact visits made from reviewed verbatim official evidence."""
import re
from compact_evidence import compact_packet
from dated_text import drop_dated

def clean(value):
    # Dated statements are dropped whole; never leave a "[dated source]" marker in page text.
    value = drop_dated(value)
    return re.sub(r'[*#]', '', value).strip()

def clean_name(value):
    # Stop names are routing identities: no sentence removal, only markup characters.
    return re.sub(r'[*#]', '', value).strip()

def quoted_bundle(row, packet):
    evidence = compact_packet(packet)
    sources = evidence['sources']
    translations = {s['url']: s['display_translation'] for s in packet['sources'] if s.get('display_translation')}
    excerpts = [clean(translations.get(s['url'], s['text'])) for s in sources]
    stops = [{**s, 'name': clean_name(s['name'])} for s in evidence['approved_stops'][:3]]
    url = stops[0]['source_url']
    note = ('Check the official visitor information for ' + row['name'] + ' before departure. '
            'Entry, activity permissions and overnight accommodation are separate checks; '
            'the source excerpts below do not establish availability for your dates.')
    gap = lambda topic: f'The reviewed sources do not establish {topic} for {row["name"]}. Check the official visitor information before departure.'
    detail = {s['url']: clean(translations.get(s['url'], s['text'])) for s in sources}
    plan = {'version': 1, 'days': [{'title': 'Visit highlights: ' + row['name'],
        'start': 'Suggested: choose a daytime visit after checking official access hours',
        'stops': [{'name': s['name'], 'stop_id': s['id'], 'detail': detail[s['source_url']]} for s in stops],
        'driving': 'Choose one local visit; travel time and onward transfers are not verified.',
        'note': note}],
        'intel': [{'kind': k, 'title': k.title() + ' check', 'text': gap(v)} for k,v in
            [('parking','current parking conditions'),('signal','mobile coverage'),('fuel','fuel availability'),
             ('timing','a best-season recommendation'),('access','all current access restrictions')]],
        'arrival': gap('a measured arrival schedule or supply stops'),
        'vehicle': gap('vehicle size or rental restrictions; do not assume RV access'),
        'goldenHour': gap('a verified sunrise or sunset viewpoint'),
        'sources': [{'label': 'Wikipedia · CC BY-SA' if s['kind'] == 'wikipedia' else 'Wikivoyage · CC BY-SA' if s['kind'] == 'wikivoyage' else 'Official visitor information', 'url': s['url']} for s in sources], 'markers': []}
    summary = {'region': row['region'].replace('-', ' ').title(), 'tagline': clean(excerpts[0]).split('\n')[0][:110],
        'best_season': f'No verified visitor-season recommendation is available for {row["name"]}; consult the park authority for your travel dates.',
        'best_seasons': [],
        'scenic_score': None, 'camping_score': None, 'avg_daily_budget': None,
        'trip_duration_days': '1 visit day', 'recommended_duration': '1 visit day', 'permit_level': 'moderate',
        'aliases': [], 'gateway_cities': [], 'similar_slugs': [], 'trip_tags': [],
        'activities': [s['name'] for s in stops], 'seo_title': (row['name'] + ' Visit Guide')[:60]}
    return {'summary': summary, 'travel': {'slug': row['slug'], 'overview_name': row['name'], 'headline': 'Check visitor access before departure',
        'reservation': note, 'source_url': url, 'plan': plan}}