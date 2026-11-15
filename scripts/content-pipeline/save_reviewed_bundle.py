"""Save a validated retained bundle to a draft without replaying inference."""
import json
import os
import datetime
from pathlib import Path
import requests
from compact_evidence import compact_packet
from combined_content import validate_bundle
from source_evidence import load_packet

def save_reviewed_bundle(slug):
    root = Path(__file__).parent
    state = json.loads((root / 'combined-content' / (slug + '.json')).read_text())
    if state.get('status') != 'validated':
        raise ValueError('HELD: retained output is not validated')
    item = validate_bundle(state['bundle'], slug, compact_packet(load_packet(slug)))['travel']
    item['plan']['reviewedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
    headers = {'apikey': key, 'Authorization': 'Bearer ' + key, 'Prefer': 'return=representation'}
    payload = {'travel_plan': item['plan'], 'permit_headline': item['headline'],
               'permit_note': item['reservation'], 'permit_source_url': item['source_url']}
    response = requests.patch(os.environ['SUPABASE_URL'] + '/rest/v1/destinations',
        params={'slug': 'eq.' + slug, 'status': 'eq.draft'}, headers=headers, json=payload, timeout=60)
    response.raise_for_status()
    rows = response.json()
    if len(rows) != 1 or any(rows[0].get(k) != v for k, v in payload.items()):
        raise ValueError('HELD: draft write did not read back the reviewed output')
    return 'prepared_for_review'