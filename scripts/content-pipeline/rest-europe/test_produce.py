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

    def test_czech_market_and_local_square_names_excluded(self):
        slugs = {r['slug'] for r in runner.base.rows(['cz'])}
        self.assertTrue({'zelny-trh', 'nam-premysla-otakara-ii', 'malostranske-namesti',
                         'male-namesti', 'namesti-republiky-cz'}.isdisjoint(slugs))
        self.assertEqual(sum(r['kind'] == 'national_park' for r in runner.base.rows(['cz'])), 4)

    def test_slovak_parks_do_not_reuse_polish_identity(self):
        rows = {r['slug']: r for r in runner.base.rows(['sk'])}
        self.assertEqual(rows['pieniny-national-park-sk']['wikidata'], 'Q1783680')
        self.assertEqual(rows['tatra-national-park-sk']['wikidata'], 'Q1080683')
        self.assertNotIn('pieniny-national-park', rows)

    def test_cancelled_park_not_published(self):
        self.assertNotIn('national-park-podunajsko', {r['slug'] for r in runner.base.rows(['sk'])})

    def test_slovak_unesco_uses_actual_local_forest(self):
        rows = {r['slug']: r for r in runner.base.rows(['sk'])}
        forest = rows['stuzica-primeval-forest']
        self.assertEqual(forest['wikidata'], 'Q1786462')
        self.assertEqual((forest['lat'], forest['lng']), (49.08333333, 22.53333333))

    def test_wrong_country_rejected(self):
        original = runner.base.fin.identity_and_packet
        runner.base.fin.identity_and_packet = lambda *args: ({}, {}, 'en', {'claims': {'P17': [{'mainsnak': {'datavalue': {'value': {'id': 'Q218'}}}}]}})
        try:
            with self.assertRaisesRegex(ValueError, 'another country'):
                runner.identity({'wikidata': 'Q1', 'country': 'pl'}, 'pl')
        finally:
            runner.base.fin.identity_and_packet = original

    def test_serbian_renamed_place_keeps_reviewed_coordinates(self):
        row = runner.production_row({'country': 'rs', 'slug': 'mokra-gora', 'lat': 42.83222222, 'lng': 20.36361111})
        self.assertEqual((row['lat'], row['lng'], row['region']),
                         (43.792478, 19.506933, 'zlatibor-administrative-district'))
        self.assertEqual(row['wikidata'], 'Q1016709')

    def test_retained_serbian_facts_receive_reviewed_coordinates_and_route(self):
        from unittest.mock import patch
        stale = {'slug': 'kopaonik-national-park', 'country': 'rs', 'lat': 43.26916667,
                 'lng': 20.8225, 'region': 'district-of-mitrovica', 'payload': {'lat': 43.26916667}}
        airport = {'lat': 43.818, 'lng': 20.587, 'code': 'KVO', 'name': 'Morava'}
        route = {'minutes': 120, 'miles': 60, 'coords': [[20.587, 43.818], [20.68, 43.32]]}
        with patch.object(runner, 'original_load', return_value=stale), patch.object(runner.base.fin, 'resolve_route', return_value=(airport, route)):
            item = runner.reviewed_load('kopaonik-national-park')
        self.assertEqual((item['lat'], item['lng'], item['region']), (43.32, 20.68, 'raska-administrative-district'))
        self.assertEqual(item['payload']['lat'], 43.32)
        self.assertEqual(item['route']['coords'][-1], [20.68, 43.32])

if __name__ == '__main__':
    unittest.main()

def test_hungarian_squares_and_cultural_sites_excluded():
    import produce
    assert 'budapest-metro-line-1' in produce.HU_EXCLUDED
    rows = [{'country': 'hu', 'slug': 'kalvin-ter', 'name': 'Kálvin tér'},
            {'country': 'hu', 'slug': 'lake-heviz', 'name': 'Lake Hévíz'},
            {'country': 'hu', 'slug': 'szinva-terrace', 'name': 'Szinva Terrace'}]
    orig = produce.original_rows
    produce.original_rows = lambda c: rows
    try:
        assert [r['slug'] for r in produce.outdoor_rows(['hu'])] == ['lake-heviz']
    finally:
        produce.original_rows = orig
