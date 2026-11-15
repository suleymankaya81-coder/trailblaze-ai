import importlib.util
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('apply_reviewed', Path(__file__).with_name('apply-wave.py'))
if spec is None or spec.loader is None:
    raise RuntimeError('Apply module missing')
apply = importlib.util.module_from_spec(spec)
spec.loader.exec_module(apply)

class ReviewedPhotoAssetsTest(unittest.TestCase):
    def test_stored_photo_is_reused_without_download(self):
        photo = {'subject': 'Oxford Island', 'url': '/__l5e/assets-v1/test/oxford.jpg',
                 'source': 'https://www.flickr.com/photos/author/123/',
                 'credit': 'Author', 'license': 'CC BY-ND 2.0'}
        with patch.object(apply.requests, 'get') as download:
            self.assertEqual(apply.mirror(photo), photo)
            download.assert_not_called()

    def test_credit_preserves_flickr_identity_and_licence(self):
        photo = {'source': 'https://www.flickr.com/photos/author/123/', 'credit': 'Author', 'license': 'CC BY-ND 2.0'}
        value = apply.credit(photo)
        self.assertIn('CC BY-ND 2.0', value)
        self.assertIn('via Flickr', value)
        self.assertIn(photo['source'], value)

if __name__ == '__main__': unittest.main()