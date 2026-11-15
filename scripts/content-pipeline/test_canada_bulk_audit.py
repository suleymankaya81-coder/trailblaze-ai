import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('canada_audit', Path(__file__).with_name('audit-canada.py'))
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)

class AuditTests(unittest.TestCase):
    def setUp(self):
        self.packet = {'sources': [{'url': 'https://official.example/park', 'text': 'The trail is closed until further notice.'}]}
        self.item = {'tagline': 'The trail is open.', 'travel_plan': {'markers': [{'lat': 50}], 'days': []}}

    def test_exact_quote_required_for_corrections(self):
        with self.assertRaisesRegex(ValueError, 'Missing exact evidence'):
            audit.apply_correction(self.item, {'path': '/tagline', 'value': 'Closed',
                'url': 'https://official.example/park', 'quote': 'This fabricated quote is not on the page.'}, self.packet)

    def test_marker_edits_are_rejected(self):
        with self.assertRaisesRegex(ValueError, 'Protected field'):
            audit.apply_correction(self.item, {'path': '/travel_plan/markers/0/lat', 'value': 40}, self.packet)

    def test_missing_checks_are_explicitly_unverified(self):
        result = {'checks': []}
        audit.complete_coverage(self.item, result, self.packet)
        self.assertTrue(any(c['path'] == '/tagline' and c['status'] == 'unverified' for c in result['checks']))

    def test_supported_label_without_evidence_is_not_accepted(self):
        result = {'checks': [{'path': '/tagline', 'status': 'supported', 'url': '', 'quote': ''}]}
        audit.complete_coverage(self.item, result, self.packet)
        self.assertEqual(result['checks'][0]['status'], 'unverified')

    def test_source_backed_text_applies_without_changing_markers(self):
        audit.apply_correction(self.item, {'path': '/destination/tagline', 'value': 'The trail is closed.',
            'url': 'https://official.example/park', 'quote': 'The trail is closed until further notice.'}, self.packet)
        self.assertEqual(self.item['tagline'], 'The trail is closed.')
        self.assertEqual(self.item['travel_plan']['markers'], [{'lat': 50}])

if __name__ == '__main__': unittest.main()