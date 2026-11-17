"""One durable assignment entry point for 42 original holds and 32 French additions.

Runs reviewed recovery only. Unknowns remain explicit; never publishes or auto-approves
search matches, ferry schedules, overseas road geometry or seasonal claims.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path
from combined_content import module

ROOT = Path(__file__).parent
MANIFEST = ROOT / 'fr-pt-gr-completion' / 'assignments.json'

def scope():
    finisher = module('assignment_finisher', 'finish-fr-pt-gr.py')
    rows = {}
    for cc, cfg in finisher.COUNTRIES.items():
        catalog = {r['slug']:r for r in json.loads(cfg['catalog'].read_text()) if r['country']==cc}
        for r in json.loads(cfg['result'].read_text())['results']:
            if r['status']=='held':
                rows[r['slug']] = {**catalog[r['slug']], 'assignment_group':'original_hold', 'original_hold':r['reason']}
    coverage = json.loads((ROOT/'france/coverage-review-2026-11-17.json').read_text())
    for r in coverage['candidates']:
        if r['category'] not in ('missing_pnr','missing_labelled_grand_site_identity'):
            continue
        # Baie de Somme is a documented overlapping landscape, not silently dropped.
        if r['proposed_slug']=='baie-de-somme':
            rows[r['proposed_slug']] = {**r,'slug':r['proposed_slug'],'assignment_group':'fr_inventory',
                'merge_into':'baie-de-somme-picardie-maritime'}
        else:
            rows[r['proposed_slug']] = {**r,'slug':r['proposed_slug'],'assignment_group':'fr_inventory'}
    return rows

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--review', action='append', default=[])
    parser.add_argument('--run', action='store_true')
    args = parser.parse_args()
    rows = scope()
    existing = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else []
    reviews = {r['slug']:r for r in existing}
    for file in args.review:
        for row in json.loads(Path(file).read_text()):
            reviews[row['slug']] = {**reviews.get(row['slug'],{}), **row}
    assignments = []
    for slug,row in rows.items():
        item = {**row, **reviews.get(slug,{})}
        staged = ROOT/'fr-pt-gr-completion'/f'{slug}.json'
        if item.get('merge_into'):
            item['assignment_status']='overlap_requires_content_merge'
        elif staged.exists():
            data=json.loads(staged.read_text())
            item['assignment_status']='retained'
            item['season_status']='reviewed' if data.get('season_review') else 'not_verified'
        elif item.get('article_title') and item.get('identity_note'):
            item['assignment_status']='reviewed_identity'
        else:
            item['assignment_status']='evidence_missing'
        assignments.append(item)
    MANIFEST.write_text(json.dumps(assignments,ensure_ascii=False,indent=2))
    if args.run:
        runnable=[r for r in assignments if r['assignment_status'] in ('retained','reviewed_identity')]
        runfile=MANIFEST.with_name('assignments-run.json')
        runfile.write_text(json.dumps(runnable,ensure_ascii=False,indent=2))
        subprocess.run([sys.executable,str(ROOT/'recover-fr-pt-gr.py'),'--review',str(runfile)],check=True)
    outcomes={r['slug']:r for r in json.loads(MANIFEST.with_name('recovery-results.json').read_text())} if MANIFEST.with_name('recovery-results.json').exists() else {}
    report=[]
    for r in assignments:
        file=ROOT/'fr-pt-gr-completion'/f"{r['slug']}.json"
        data=json.loads(file.read_text()) if file.exists() else {}
        blockers=[] if data.get('german') else r.get('blockers',[])
        reason=outcomes.get(r['slug'],{}).get('reason')
        if reason and reason not in blockers:
            blockers=[*blockers,reason]
        if not data.get('german') and not blockers:
            blockers=['Exact identity, photo, access or overseas geography evidence still missing']
        report.append({'slug':r['slug'],'group':r['assignment_group'],'prepared':bool(data.get('german')),
            'season_verified':bool(data.get('season_review')),'blockers':blockers,
            'merge_into':r.get('merge_into')})
    MANIFEST.with_name('assignment-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print(json.dumps({'assignments':len(report),'prepared':sum(r['prepared'] for r in report),
        'season_verified':sum(r['season_verified'] for r in report),'published':0}))

if __name__=='__main__':main()