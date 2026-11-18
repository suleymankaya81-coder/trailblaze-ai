"""Netherlands production adapter: reuse validated stages, isolated caches, no paid facts."""
import importlib.util,sys
from pathlib import Path
HERE=Path(__file__).parent
PIPE=HERE.parent
spec=importlib.util.spec_from_file_location('nordic',PIPE/'nordic/produce.py')
runner=importlib.util.module_from_spec(spec);spec.loader.exec_module(runner)
runner.COUNTRIES={'nl':dict(lang='nl',currency='EUR',mhr='netherlands',name='Netherlands',bounds=(50.7,53.8,3.0,7.3))}
runner.CATALOGS=PIPE/'claude-handoff/west-europe'
runner.OUT=HERE/'completion';runner.OUT.mkdir(exist_ok=True)
runner.CACHE=HERE/'discovery-cache';runner.CACHE.mkdir(exist_ok=True)
runner.REPORT=HERE/'production-report.json'
runner.prepare.EXTRA_COUNTRIES=tuple(runner.prepare.EXTRA_COUNTRIES)+('NL',)
runner.ARGOS_PAIRS={('nl','en'),('en','de')}
runner.GENERIC.update({'nationaal','nationale','park','het','de','van','natuurgebied','natuurgebieden'})
original_rows=runner.rows
def retained_rows(countries):
    rows=original_rows(countries)
    if len(sys.argv)>1 and sys.argv[1]=='facts' and runner.REPORT.exists():
        import json
        report=json.loads(runner.REPORT.read_text())
        rows=[r for r in rows if not report.get(r['slug'],'').startswith('HELD facts:')]
    return rows
runner.rows=retained_rows
if __name__=='__main__':
    if '--country' not in sys.argv:sys.argv.extend(['--country','nl'])
    runner.main()