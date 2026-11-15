"""One bounded CLI batch. Missing evidence holds a place before any AI spend.
Usage: python scripts/content-pipeline/run-content-wave.py --catalog uk/catalog.json --wave 2
Publication remains a separate explicit --publish choice after existing checks.
"""
import argparse
import json
import subprocess
import sys
import requests
from pathlib import Path
from compact_evidence import compact_packet
from source_evidence import load_packet
from save_reviewed_bundle import save_reviewed_bundle

def stage_failed(response, script):
    """A zero exit alone is not proof that a writer saved its output."""
    output = response.stdout + '\n' + response.stderr
    if response.returncode or any(word in output for word in ('HELD', 'ERR')):
        return True
    if script == 'apply-wave.py':
        return not any(line.endswith(' applied') for line in response.stdout.splitlines())
    return False

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--catalog', default='uk/catalog.json')
    p.add_argument('--wave', type=int, default=2)
    p.add_argument('--slugs', nargs='+')
    p.add_argument('--remaining', action='store_true', help='All unpublished catalog places, across waves')
    p.add_argument('--publish', action='store_true')
    a = p.parse_args()
    root = Path(__file__).parent
    catalog = json.loads((root / a.catalog).read_text())
    rows = [r for r in catalog if r['slug'] in a.slugs] if a.slugs else catalog if a.remaining else [r for r in catalog if r['wave'] == a.wave]
    if a.remaining:
        from combined_content import module
        published = set(module('wave_facts', 'prepare-wave.py').q(
            "select slug from destinations where status='published'").splitlines())
        rows = [r for r in rows if r['slug'] not in published]
    results = []
    for row in rows:
        slug = row['slug']
        try:
            compact_packet(load_packet(slug))
            from combined_content import module
            prepare = module('wave_catalog', 'prepare-wave.py')
            def literal(value):
                return "'" + value.replace("'", "''") + "'"
            values = [slug, row['name'], row['region'].replace('-', ' ').title(),
                      row['country'], row['region'], 'GBP' if row['country'] == 'gb' else 'USD',
                      row['authority'], 'fly-in' if row['access'] == 'island' else row['access'], row['kind']]
            prepare.q("insert into destinations (slug,name,state,country_code,region_slug,currency,park_authority,access_type,destination_type,status,tier,seo_eligible) values ("
                      + ','.join(literal(v) for v in values) + ", 'draft','tier1',false) on conflict (slug) do nothing")
        except ValueError as error:
            results.append({'slug': slug, 'status': 'held_before_ai', 'reason': str(error)})
            continue
        for script, args in [('prepare-wave.py', ['--combined', slug]), ('apply-wave.py', [slug])]:
            response = subprocess.run([sys.executable, str(root / script), *args], text=True, capture_output=True)
            if stage_failed(response, script):
                results.append({'slug': slug, 'status': 'held', 'stage': script, 'reason': (response.stdout + response.stderr)[-1500:]})
                break
        else:
            try:
                save_reviewed_bundle(slug)
            except (ValueError, requests.RequestException) as error:
                results.append({'slug': slug, 'status': 'held', 'stage': 'save_reviewed_bundle', 'reason': str(error)})
                continue
            if a.publish:
                response = subprocess.run([sys.executable, str(root / 'publish-wave.py'), slug], text=True, capture_output=True)
                status = 'published' if response.returncode == 0 and any(line == slug + ' published' for line in response.stdout.splitlines()) else 'held'
                if status == 'held':
                    results.append({'slug': slug, 'status': status, 'stage': 'publish-wave.py', 'reason': (response.stdout + response.stderr)[-1500:]})
                    continue
            else:
                status = 'prepared_for_review'
            results.append({'slug': slug, 'status': status})
        # Gateway failures have unknown/permanent outcomes: stop the whole batch, no blind retries.
        if results[-1].get('stage') == 'prepare-wave.py' and 'generation failed' in results[-1].get('reason', '').lower():
            break
        report = root / 'wave-run-report.json'
        report.write_text(json.dumps(results, ensure_ascii=False, indent=2))
    report = root / 'wave-run-report.json'
    report.write_text(json.dumps(results, ensure_ascii=False, indent=2))
    print(json.dumps({'places': len(results), 'statuses': {s: sum(r['status'] == s for r in results) for s in {r['status'] for r in results}}}))

if __name__ == '__main__':
    main()