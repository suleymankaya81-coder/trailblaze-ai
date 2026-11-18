import importlib.util
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'west-europe'))
spec = importlib.util.spec_from_file_location('ireland_completion', Path(__file__).parent / 'west-europe/finish-ireland.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class IrelandCompletionTest(unittest.TestCase):
    def test_wrong_country_coordinate_rejected(self):
        with self.assertRaisesRegex(ValueError, 'outside Ireland'):
            module.verified_coordinates({'lat': 53.2, 'lng': -4.0, 'coordinate_source': 'Anglesey'})

    def test_coordinate_requires_evidence(self):
        with self.assertRaisesRegex(ValueError, 'evidence required'):
            module.verified_coordinates({'lat': 53.2, 'lng': -9.0})

    def test_cover_requires_exact_place_review(self):
        with self.assertRaisesRegex(ValueError, 'exact-place'):
            module.exact_cover({'photo': {'credit': 'Photographer', 'license': 'CC BY-SA 4.0'}})

if __name__ == '__main__':
    unittest.main()