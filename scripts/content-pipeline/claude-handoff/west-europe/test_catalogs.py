import json,unittest
from pathlib import Path
from validate_catalogs import errors,COUNTRIES
ROOT=Path(__file__).parent
class CatalogTests(unittest.TestCase):
    def test_requested_countries(self):self.assertEqual(COUNTRIES,('nl','be','dk','ie'))
    def test_all_inventories_and_batches(self):self.assertEqual(errors(),[])
    def test_denmark_preserves_all_64_existing_places(self):
        self.assertEqual(json.loads((ROOT/'dk-catalog.json').read_text()),json.loads((ROOT.parent/'nordic/dk-catalog.json').read_text()))
    def test_ireland_is_separate_from_northern_ireland(self):
        rows=json.loads((ROOT/'ie-catalog.json').read_text())
        self.assertFalse(any(r.get('region') in ('antrim','down','fermanagh','tyrone','armagh','derry') for r in rows))
    def test_irish_cross_county_reserve_is_not_duplicated(self):
        rows=[r for r in json.loads((ROOT/'ie-catalog.json').read_text()) if r['name']=='Slieve Bloom Mountains Nature Reserve']
        self.assertEqual(len(rows),1);self.assertEqual(rows[0]['also_regions'],['offaly'])
if __name__=='__main__':unittest.main()