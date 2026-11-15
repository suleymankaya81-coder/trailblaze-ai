import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('dach_finish', Path(__file__).with_name('finish-dach-free.py'))
if spec is None or spec.loader is None:
    raise RuntimeError('Missing DACH runner')
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)
collector_spec = importlib.util.spec_from_file_location('dach_sources', Path(__file__).with_name('collect-dach-sources.py'))
if collector_spec is None or collector_spec.loader is None:
    raise RuntimeError('Missing source collector')
collector = importlib.util.module_from_spec(collector_spec)
collector_spec.loader.exec_module(collector)

class RemainingDachTests(unittest.TestCase):
    def setUp(self):
        self.catalog = [{'slug': 'park', 'wave': 1}, {'slug': 'lake', 'wave': 2}, {'slug': 'valley', 'wave': 3}]

    def test_remaining_includes_every_destination_type(self):
        self.assertEqual(runner.select_slugs(self.catalog, [], True, set()), ['park', 'lake', 'valley'])

    def test_published_places_are_never_reprocessed(self):
        self.assertEqual(runner.select_slugs(self.catalog, [], True, {'park', 'lake'}), ['valley'])

    def test_default_preserves_wave_one(self):
        self.assertEqual(runner.select_slugs(self.catalog, [], False, set()), ['park'])

    def test_unknown_slug_rejected(self):
        with self.assertRaises(ValueError):
            runner.select_slugs(self.catalog, ['unknown'], True, set())

    def test_same_name_in_wrong_country_rejected(self):
        row = {'name': 'Zugspitze', 'authority': 'Zugspitze', 'country': 'de'}
        entity = {'labels': {'en': {'value': 'Zugspitze'}}, 'claims': {'P17': [{'mainsnak': {'datavalue': {'value': {'id': 'Q40'}}}}]}}
        self.assertFalse(collector.identity_matches(row, entity))

    def test_exact_same_country_identity_accepted_as_candidate(self):
        row = {'name': 'Zugspitze', 'authority': 'Zugspitze', 'country': 'de'}
        entity = {'labels': {'en': {'value': 'Zugspitze'}}, 'claims': {'P17': [{'mainsnak': {'datavalue': {'value': {'id': 'Q183'}}}}]}}
        self.assertTrue(collector.identity_matches(row, entity))

if __name__ == '__main__':
    unittest.main()