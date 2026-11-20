import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('oceania_production', Path(__file__).with_name('produce.py'))
production = importlib.util.module_from_spec(spec)
spec.loader.exec_module(production)

class AccessEvidenceTests(unittest.TestCase):
    def test_unknown_access_is_not_road_access(self):
        self.assertIsNone(production.road_evidence('The park is a forest reserve in New Zealand.'))

    def test_named_road_access_quote_is_retained(self):
        quote = 'The park entrance is reached by a public road.'
        self.assertEqual(production.road_evidence(quote), quote)

    def test_ferry_is_not_road_access(self):
        self.assertIsNone(production.road_evidence('The island is accessible by car-ferry services.'))

    def test_neighbouring_beaches_do_not_establish_destination_access(self):
        self.assertIsNone(production.road_evidence('The nearest beaches accessible by road are Karekare and Anawhata.'))

    def test_road_ending_before_destination_is_not_access(self):
        self.assertIsNone(production.road_evidence('Road access ends at Clifton, which is the departure point for tourists.'))

    def test_new_zealand_identity_settings(self):
        self.assertEqual(production.base.COUNTRIES['nz']['currency'], 'NZD')
        self.assertEqual(production.base.COUNTRIES['nz']['bounds'], (-47.5, -34, 166, 179))

if __name__ == '__main__':
    unittest.main()