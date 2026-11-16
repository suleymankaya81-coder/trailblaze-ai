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
            self.assertIsNone(discovery.wikipedia_background({'country': 'de'}, {'qid': 'Q1', 'countries': ['Q40']}))
            fetch.assert_not_called()

    def test_german_distinctive_names_not_generic_forests(self):
        row = {'authority': 'Naturpark Schwarzwald', 'name': 'Black Forest Nature Park'}
        self.assertTrue(discovery.matches(row, 'https://www.germany.travel/en/nature/schwarzwald.html'))
        self.assertFalse(discovery.matches(row, 'https://www.germany.travel/en/nature/forest.html'))

    def test_germany_wikipedia_accepts_only_country_matched_link(self):
        entity = {'entities': {'Q1': {'sitelinks': {'enwiki': {'url': 'https://en.wikipedia.org/wiki/Harz'}}}}}
        with patch.object(discovery, 'get', return_value={'body': __import__('json').dumps(entity)}), \
             patch.object(discovery, 'fetch_public_source', return_value={'text': 'Harz background', 'url': 'https://en.wikipedia.org/wiki/Harz'}):
            source = discovery.wikipedia_background({'country': 'de'}, {'qid': 'Q1', 'countries': ['Q183']})
            self.assertEqual(source['kind'], 'background')

    def test_sitemap_does_not_follow_external_hosts(self):
        discovery.sitemap_pages.cache_clear()
        xml = '<sitemapindex><sitemap><loc>https://unapproved.example/sitemap.xml</loc></sitemap></sitemapindex>'
        with patch.object(discovery, 'get', return_value={'body': xml}) as fetch:
            self.assertEqual(discovery.sitemap_pages('https://www.germany.travel/sitemap.xml'), ())
            self.assertEqual(fetch.call_count, 1)