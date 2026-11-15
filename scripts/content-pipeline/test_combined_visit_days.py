import unittest
from combined_content import validate_bundle


class CombinedVisitDayTests(unittest.TestCase):
    def test_four_day_new_destination_is_rejected(self):
        item = {'slug': 'test-place', 'plan': {'days': [{}, {}, {}, {}]}}
        with self.assertRaisesRegex(ValueError, 'one to three days'):
            validate_bundle({'travel': item}, 'test-place', {})

    def test_empty_new_destination_is_rejected(self):
        item = {'slug': 'test-place', 'plan': {'days': []}}
        with self.assertRaisesRegex(ValueError, 'one to three days'):
            validate_bundle({'travel': item}, 'test-place', {})


if __name__ == '__main__':
    unittest.main()