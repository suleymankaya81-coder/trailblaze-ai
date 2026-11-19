import json
import unittest
from validate_catalogs import ROOT, validate_all, validate_rows

class CatalogTests(unittest.TestCase):
    def test_nordic_format_coverage_and_batches(self):
        self.assertEqual(validate_all(),[])

    def test_nz_current_parks_not_former_urewera(self):
        rows=json.loads((ROOT/'nz-catalog.json').read_text())
        self.assertEqual(sum(r['kind']=='national_park' for r in rows),13)
        self.assertEqual(next(r for r in rows if r['name']=='Te Urewera')['kind'],'nature_park')
        self.assertEqual(next(r for r in rows if r['name']=='Te Papa-Kura-o-Taranaki')['aliases'],['Egmont National Park'])

    def test_eleven_great_walks_keep_boat_journey(self):
        cov=json.loads((ROOT/'coverage.json').read_text())
        inv=next(i for i in cov['inventories'] if i['id']=='nz_great_walks')
        self.assertEqual(len(inv['entries']),11)
        rows=json.loads((ROOT/'nz-catalog.json').read_text())
        self.assertEqual(next(r for r in rows if r['name']=='Whanganui Journey')['access'],'boat')

    def test_parcels_not_duplicate_destinations(self):
        rows=json.loads((ROOT/'au-catalog.json').read_text())
        self.assertEqual(sum(r['region']=='tasmania' and r['kind']=='national_park' and r.get('inventory_ids') is not None for r in rows),18)
        self.assertGreater(next(r for r in rows if r['name']=='South Bruny National Park')['parcel_count'],1)

    def test_wrong_country_point_rejected(self):
        r=json.loads((ROOT/'nz-catalog.json').read_text())[0]
        r.update(lat=40,lng=-100)
        self.assertTrue(any('outside NZ' in e for e in validate_rows([r],'nz')))

if __name__=='__main__':unittest.main()