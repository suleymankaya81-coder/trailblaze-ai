"""One resumable DACH completion command. Never calls an AI model.
Run: python scripts/content-pipeline/finish-dach-free.py [slug ...]  (default: wave 1)"""
import argparse, json, subprocess, sys
from pathlib import Path
from combined_content import module, validate_bundle
from compact_evidence import compact_packet
from source_evidence import load_packet
from quoted_visit import quoted_bundle
from save_reviewed_bundle import save_reviewed_bundle

ROOT = Path(__file__).parent
CURRENCY = {'de': 'EUR', 'at': 'EUR', 'ch': 'CHF'}

def lit(v): return "'" + str(v).replace("'", "''") + "'"

def select_slugs(catalog, requested, remaining, published):
    selected = requested or [r['slug'] for r in catalog if remaining or r['wave'] == 1]
    unknown = set(selected) - {r['slug'] for r in catalog}
    if unknown:
        raise ValueError('Unknown catalog destinations: ' + ', '.join(sorted(unknown)))
    return [s for s in dict.fromkeys(selected) if s not in published]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('slugs', nargs='*')
    parser.add_argument('--remaining', action='store_true', help='All unpublished catalog destinations across all waves')
    args = parser.parse_args()
    catalog = json.loads((ROOT/'dach/catalog.json').read_text())
    rows = {r['slug']: r for r in catalog}
    prepare = module('dach_prepare', 'prepare-wave.py')
    published = set(prepare.q("select slug from destinations where status='published'").splitlines())
    slugs = select_slugs(catalog, args.slugs, args.remaining, published)
    report = ROOT/'dach'/('remaining-result.json' if args.remaining else 'wave1-result.json')
    for directory in ('wave3-facts', 'combined-content'):
        (ROOT/directory).mkdir(parents=True, exist_ok=True)
    results = []
    for slug in slugs:
        row = rows[slug]
        try:
            packet = load_packet(slug)
            bundle = validate_bundle(quoted_bundle(row, packet), slug, compact_packet(packet))
            prepare.q("insert into destinations (slug,name,state,country_code,region_slug,currency,park_authority,access_type,destination_type,status,tier,seo_eligible) values ("
                + ','.join(lit(v) for v in [slug, row['name'], row['region'].replace('-', ' ').title(), row['country'], row['region'],
                CURRENCY[row['country']], row['authority'], row['access'], row['kind']]) + ",'draft','tier1',false) on conflict (slug) do nothing")
            facts = ROOT/'wave3-facts'/f'{slug}.json'
            if not facts.exists():
                facts.write_text(json.dumps(prepare.prepare_facts(slug), ensure_ascii=False, indent=2))
            (ROOT/'combined-content'/f'{slug}.json').write_text(json.dumps({'status':'validated','method':'official-excerpts-no-model','bundle':bundle}, ensure_ascii=False, indent=2))
            prepared = json.loads(facts.read_text())
            Path('/tmp/wave').mkdir(exist_ok=True)
            Path(f'/tmp/wave/{slug}.json').write_text(json.dumps({k:v for k,v in prepared.items() if k != 'destination'} | {'ai': bundle['summary']}))
            r = subprocess.run([sys.executable, str(ROOT/'apply-wave.py'), slug], text=True, capture_output=True)
            if r.returncode: raise ValueError(r.stdout + r.stderr)
            save_reviewed_bundle(slug)
            r = subprocess.run([sys.executable, str(ROOT/'publish-wave.py'), slug], text=True, capture_output=True)
            if slug + ' published' not in r.stdout: raise ValueError(r.stdout + r.stderr)
            results.append({'slug': slug, 'status': 'published'})
        except Exception as error:
            results.append({'slug': slug, 'status': 'held', 'reason': str(error)[-800:]})
        print(json.dumps(results[-1], ensure_ascii=False)[:400], flush=True)
        report.write_text(json.dumps(results, ensure_ascii=False, indent=2))
    geo_path = Path('src/data/destination-geo.json')
    geo = json.loads(geo_path.read_text())
    for r in results:
        if r['status'] == 'published': geo[r['slug']] = rows[r['slug']]['country'] + '/' + rows[r['slug']]['region']
    geo_path.write_text(json.dumps(dict(sorted(geo.items())), separators=(',',':')))
    print(json.dumps({'selected': len(slugs), 'published': sum(r['status'] == 'published' for r in results),
        'held': sum(r['status'] == 'held' for r in results), 'content_model_calls': 0,
        'note': 'Content-model calls exclude Lovable agent/build and hosting usage.'}), flush=True)

if __name__ == '__main__': main()
