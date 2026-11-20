import importlib.util
import unittest
from unittest.mock import patch, Mock
import tempfile
from pathlib import Path

spec = importlib.util.spec_from_file_location('oceania_production', Path(__file__).with_name('produce.py'))
production = importlib.util.module_from_spec(spec)
spec.loader.exec_module(production)

class AccessEvidenceTests(unittest.TestCase):
    def test_media_identifies_client_and_checks_image_response(self):
        response = Mock(headers={'Content-Type': 'image/jpeg'}, content=b'photo')
        with tempfile.TemporaryDirectory() as folder, patch.object(production.requests, 'get', return_value=response) as get:
            target = Path(folder) / 'cover.jpg'
            production.download_cover({'url': 'https://thumb.wikimedia.org/wikipedia/commons/test.jpg'}, target)
            self.assertEqual(target.read_bytes(), b'photo')
            self.assertEqual(get.call_args.args[0], 'https://upload.wikimedia.org/wikipedia/commons/test.jpg')
            self.assertIn('WildParkRoutes/1.0', get.call_args.kwargs['headers']['User-Agent'])
            response.raise_for_status.assert_called_once()
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