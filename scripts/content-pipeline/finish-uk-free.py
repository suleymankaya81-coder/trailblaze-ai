"""One resumable UK completion command. Never calls an AI model."""
import concurrent.futures
import json
import subprocess
import sys
import os
import requests
from pathlib import Path
from combined_content import module, validate_bundle
from compact_evidence import compact_packet
from source_evidence import load_packet
from quoted_visit import quoted_bundle
from save_reviewed_bundle import save_reviewed_bundle

ROOT = Path(__file__).parent

def main():
    rows = {r['slug']: r for r in json.loads((ROOT/'uk/catalog.json').read_text())}
    pending = json.loads((ROOT/'uk/recovery-outcome-2026-11-15.json').read_text())['remaining']
    key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
    response = requests.get(os.environ['SUPABASE_URL'] + '/rest/v1/destinations',
        params={'country_code':'eq.gb','status':'eq.published','select':'slug'},
        headers={'apikey':key,'Authorization':'Bearer '+key}, timeout=30)
    response.raise_for_status()
    published = {r['slug'] for r in response.json()}
    pending = [r for r in pending if r['slug'] not in published]
    prepare = module('free_prepare', 'prepare-wave.py')
    def facts(entry):
        slug = entry['slug']
        try:
            packet = load_packet(slug)
            compact_packet(packet)
            path = ROOT/'wave3-facts'/f'{slug}.json'
            if not path.exists():
                value = prepare.prepare_facts(slug)
                path.write_text(json.dumps(value, ensure_ascii=False, indent=2))
            return slug, None
        except Exception as error:
            return slug, str(error)
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        outcomes = list(pool.map(facts, pending))
    results = []
    for slug, error in outcomes:
        if error:
            results.append({'slug': slug, 'status': 'held', 'reason': error})
            continue
        try:
            packet = load_packet(slug)
            bundle = validate_bundle(quoted_bundle(rows[slug], packet), slug, compact_packet(packet))
            # Never overwrite an existing paid outcome; retain it for audit.
            cache = ROOT/'combined-content'/f'{slug}.json'
            if cache.exists():
                retained = ROOT/'uk'/f'{slug}-retained-outcome.json'
                if not retained.exists(): retained.write_text(cache.read_text())
            cache.write_text(json.dumps({'status':'validated','method':'official-excerpts-no-model','bundle':bundle}, ensure_ascii=False, indent=2))
            prepared = json.loads((ROOT/'wave3-facts'/f'{slug}.json').read_text())
            Path('/tmp/wave').mkdir(exist_ok=True)
            Path(f'/tmp/wave/{slug}.json').write_text(json.dumps({k:v for k,v in prepared.items() if k != 'destination'} | {'ai':bundle['summary']}))
            response = subprocess.run([sys.executable,str(ROOT/'apply-wave.py'),slug], text=True,capture_output=True)
            if response.returncode: raise ValueError(response.stdout + response.stderr)
            save_reviewed_bundle(slug)
            response = subprocess.run([sys.executable,str(ROOT/'publish-wave.py'),slug], text=True,capture_output=True)
            if slug + ' published' not in response.stdout: raise ValueError(response.stdout + response.stderr)
            results.append({'slug':slug,'status':'published'})
        except Exception as error:
            results.append({'slug':slug,'status':'held','reason':str(error)[-1200:]})
        (ROOT/'uk/free-completion-result.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
    (ROOT/'uk/free-completion-result.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
    print(json.dumps(results, ensure_ascii=False, indent=2))
    geo_path = Path('src/data/destination-geo.json')
    geo = json.loads(geo_path.read_text())
    for slug in published | {r['slug'] for r in results if r['status'] == 'published'}:
        if slug in rows: geo[slug] = 'gb/' + rows[slug]['region']
    geo_path.write_text(json.dumps(dict(sorted(geo.items())), separators=(',',':')))

if __name__ == '__main__': main()