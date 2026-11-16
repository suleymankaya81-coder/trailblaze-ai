import unittest
from combined_content import module

audit = module('dach_audit_tests', 'audit-dach.py')

class DachAuditTests(unittest.TestCase):
    def test_missing_exact_coordinates_are_reported(self):
        self.assertIn('coordinates', audit.issues({'lat': None, 'lng': 16.7}))

    def test_missing_plan_stops_are_reported(self):
        self.assertIn('daily_stops', audit.issues({'travel_plan': {'days': [{'stops': []}]}}))

    def test_german_preserves_navigation_identity(self):
        row = {'travel_plan': {'days': [{'stops': [{'name': 'Plansee', 'stop_id': 'plansee'}]}], 'intel': []}}
        out = {'days': [{'stops': [{'name': 'Another Lake', 'stop_id': 'plansee'}]}], 'intel': [], 'metaTitle': 'Plansee', 'metaDescription': 'Besuch'}
        with self.assertRaisesRegex(ValueError, 'routing identity'):
            audit.validate_translation(row, out)

if __name__ == '__main__': unittest.main()