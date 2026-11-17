"""Regression: Nominatim zoom 5 returns only country for Swedish locations."""
import importlib.util
import unittest
from pathlib import Path
from unittest.mock import patch


class NordicRegionTest(unittest.TestCase):
    def test_search_rejects_wrong_country(self):
        spec = importlib.util.spec_from_file_location('nordic_country_test', Path(__file__).parent / 'nordic/produce.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        wrong_entity = {'claims': {'P17': [{'mainsnak': {'datavalue': {'value': {'id': 'Q30'}}}}]}}
        with patch.object(module.fin, 'fetch_article', return_value={'pageprops': {'wikibase_item': 'Q1'}}), patch.object(module.fin, 'identity_and_packet', return_value=({}, {}, 'en', wrong_entity)):
            with self.assertRaisesRegex(ValueError, 'another country'):
                module._identity({'country': 'fi', 'name': 'Arctic Circle Hiking Area', 'enwiki': 'Gates of the Arctic'}, 'fi')

    def test_county_query_uses_admin_detail(self):
        spec = importlib.util.spec_from_file_location('nordic_region_test', Path(__file__).parent / 'nordic/produce.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        class Response:
            def json(self):
                return {'address': {'county': 'Västra Götaland County'}}

        with patch('requests.get', return_value=Response()) as get, patch.object(module.time, 'sleep'):
            self.assertEqual(module.region_for({'country': 'se'}, 58.851944, 12.161111), 'v-stra-g-taland')
        self.assertEqual(get.call_args.kwargs['params']['zoom'], 8)

    def test_translation_uses_recovered_region(self):
        spec = importlib.util.spec_from_file_location('nordic_translation_test', Path(__file__).parent / 'nordic/produce.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        row = {'region': None, 'slug': 'dalsland'}
        item = {'region': 'vastra-gotaland', 'packet': {}, 'lang': 'en'}
        with patch.object(module.fin, 'quoted_bundle', side_effect=RuntimeError('stop after region selection')) as bundle:
            with self.assertRaisesRegex(RuntimeError, 'stop after region selection'):
                module.translate(row, item)
        self.assertEqual(bundle.call_args.args[0]['region'], 'vastra-gotaland')


if __name__ == '__main__':
    unittest.main()