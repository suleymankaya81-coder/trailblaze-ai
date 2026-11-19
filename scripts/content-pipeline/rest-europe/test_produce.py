import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('remaining', Path(__file__).with_name('produce.py'))
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)

class ProductionRules(unittest.TestCase):
    def test_requested_order(self):
        self.assertEqual(list(runner.SETTINGS)[:3], ['pl', 'ro', 'sk'])

    def test_catalog_scope(self):
        self.assertEqual(len(runner.SETTINGS), 19)
        self.assertEqual(sum(len(runner.original_rows([cc])) for cc in runner.SETTINGS), 819)

    def test_urban_squares_not_produced(self):
        self.assertFalse(any('square' in r['name'].casefold() for r in runner.base.rows(['pl'])))

    def test_exclusions(self):
        self.assertTrue({'tr', 'ua', 'ru', 'by', 'md', 'xk', 'am', 'az', 'ge'}.isdisjoint(runner.SETTINGS))

    def test_wrong_country_rejected(self):
        original = runner.base.fin.identity_and_packet
        runner.base.fin.identity_and_packet = lambda *args: ({}, {}, 'en', {'claims': {'P17': [{'mainsnak': {'datavalue': {'value': {'id': 'Q218'}}}}]}})
        try:
            with self.assertRaisesRegex(ValueError, 'another country'):
                runner.identity({'wikidata': 'Q1', 'country': 'pl'}, 'pl')
        finally:
            runner.base.fin.identity_and_packet = original

if __name__ == '__main__':
    unittest.main()