import json
import unittest
from pathlib import Path

ROOT = Path(__file__).parent


class AuthorityRecoveryTests(unittest.TestCase):
    def test_all_eight_historical_countries_have_catalog_links(self):
        links = json.loads((ROOT / 'authority-country-links.json').read_text())['countries']
        self.assertEqual(set(links), {'hr', 'ee', 'hu', 'lv', 'lt', 'pl', 'ro', 'si'})
        for cc, link in links.items():
            catalog = json.loads((ROOT / f'{cc}-catalog.json').read_text())
            self.assertEqual(link['catalog_slugs'], [row['slug'] for row in catalog])

    def test_montenegro_has_five_real_park_identities(self):
        catalog = json.loads((ROOT / 'me-catalog.json').read_text())
        parks = {r['wikidata'] for r in catalog if r['kind'] == 'national_park'}
        self.assertEqual(parks, {'Q1258880', 'Q212836', 'Q1370044', 'Q11955121', 'Q203811'})
        self.assertNotIn('Q1565555', {r['wikidata'] for r in catalog})

    def test_coverage_counts_match_catalogs(self):
        coverage = json.loads((ROOT / 'coverage.json').read_text())
        self.assertEqual(coverage['total'], 819)
        self.assertEqual(sum(len(json.loads(p.read_text())) for p in ROOT.glob('*-catalog.json')), 819)


if __name__ == '__main__':
    unittest.main()