"""Offline country, inventory and lossless batch validation."""
import importlib.util,json
from pathlib import Path
ROOT=Path(__file__).parent
COUNTRIES=('nl','be','dk','ie')
spec=importlib.util.spec_from_file_location('nordic_validator',ROOT.parent/'nordic/validate_catalogs.py')
validator=importlib.util.module_from_spec(spec);spec.loader.exec_module(validator)
def errors():
    catalogs={c:json.loads((ROOT/(c+'-catalog.json')).read_text()) for c in COUNTRIES}
    found=[e for c,r in catalogs.items() for e in validator.validate_rows(r,c)]
    found+=validator.validate_coverage(catalogs,json.loads((ROOT/'coverage.json').read_text()))
    manifest=json.loads((ROOT/'batch-manifest.json').read_text())
    for c,r in catalogs.items():
        batchrows=[x for b in manifest if b['country']==c for x in json.loads((ROOT/b['file']).read_text())]
        if batchrows!=r:found.append(c+': batch content differs from catalog')
    return found
if __name__=='__main__':
    found=errors()
    if found:raise SystemExit('\n'.join(found))
    print('Four country catalogs, inventories and lossless batches validated')