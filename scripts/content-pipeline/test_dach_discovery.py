import unittest
from unittest.mock import patch
import dach_discovery as discovery

class DiscoveryTests(unittest.TestCase):
    def test_english_place_path_matches_umlaut_name(self):
        row = {'authority': 'Ötztal', 'name': 'Ötztal Nature Park'}
        self.assertTrue(discovery.matches(row, 'https://www.tyrol.com/regions/oetztal'))

    def test_generic_park_and_wrong_place_are_rejected(self):
        row = {'authority': 'Karwendel', 'name': 'Karwendel Nature Park'}
        self.assertFalse(discovery.matches(row, 'https://www.tyrol.com/nature/park/zillertal'))
        self.assertFalse(discovery.matches(row, 'https://www.tyrol.com/karwendelhotel'))

    def test_wrong_country_wikipedia_is_never_fetched(self):
        with patch.object(discovery, 'get') as fetch:
            self.assertIsNone(discovery.wikipedia_background({}, {'qid': 'Q1', 'countries': ['Q183']}))
            fetch.assert_not_called()