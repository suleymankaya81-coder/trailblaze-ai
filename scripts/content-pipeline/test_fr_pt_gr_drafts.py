import unittest
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location('draft_completion', Path(__file__).with_name('complete-fr-pt-gr-drafts.py'))
completion = importlib.util.module_from_spec(spec)
spec.loader.exec_module(completion)

class DraftCompletionTests(unittest.TestCase):
    def test_missing_season_is_named_not_placeholder(self):
        text = completion.seasonal_text('Écrins National Park', [])
        self.assertIn('Écrins National Park', text)
        self.assertNotIn('Check official seasonal information', text)
        self.assertIn('No verified', text)

    def test_only_official_season_is_used(self):
        sources = [{'kind':'wikipedia','generation_excerpts':['The best time to visit is summer.']}]
        self.assertIn('No verified', completion.seasonal_text('Test Park',sources))
        sources[0]['kind']='official'
        self.assertEqual(completion.seasonal_text('Test Park',sources),'The best time to visit is summer.')

    def test_unlicensed_photos_rejected(self):
        self.assertFalse(completion.licensed({'credit':'Artist','license':'See source'}))
        self.assertFalse(completion.licensed({'credit':'Artist','license':'CC BY-NC'}))
        self.assertTrue(completion.licensed({'credit':'Artist','license':'CC BY-SA 4.0'}))