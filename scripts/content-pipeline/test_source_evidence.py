import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import source_evidence as evidence

class SourceEvidenceTests(unittest.TestCase):
    def test_new_zealand_reuses_identity_verified_nordic_overviews(self):
        packet = {'country_code': 'nz', 'evidence_policy': 'dach-wikipedia-overview', 'identity_verified': True}
        source = {'kind': 'wikipedia', 'url': 'https://en.wikipedia.org/wiki/Huka_Falls'}
        self.assertTrue(evidence.overview_source(source, packet))
        self.assertFalse(evidence.overview_source(source, {**packet, 'identity_verified': False}))

    def test_australia_reuses_identity_verified_overviews(self):
        packet = {'country_code': 'au', 'evidence_policy': 'dach-wikipedia-overview', 'identity_verified': True}
        source = {'kind': 'wikipedia', 'url': 'https://en.wikipedia.org/wiki/Barrington_Tops_National_Park'}
        self.assertTrue(evidence.overview_source(source, packet))
        self.assertFalse(evidence.overview_source(source, {**packet, 'identity_verified': False}))

    def test_belgium_uses_verified_nordic_overview_policy(self):
        packet = {'country_code': 'be', 'evidence_policy': 'dach-wikipedia-overview', 'identity_verified': True}
        source = {'kind': 'wikipedia', 'url': 'https://nl.wikipedia.org/wiki/Zwin'}
        self.assertTrue(evidence.overview_source(source, packet))
        self.assertFalse(evidence.overview_source(source, {**packet, 'identity_verified': False}))

    def test_ireland_uses_verified_western_overview_policy(self):
        packet = {'country_code': 'ie', 'evidence_policy': 'dach-wikipedia-overview', 'identity_verified': True}
        self.assertTrue(evidence.overview_source({'kind': 'wikipedia', 'url': 'https://en.wikipedia.org/wiki/Killarney_National_Park'}, packet))
        self.assertFalse(evidence.overview_source({'kind': 'wikipedia', 'url': 'https://example.com/wiki/Park'}, packet))

    def test_missing_source_blocks_generation(self):
        with tempfile.TemporaryDirectory() as root, patch.object(evidence, 'PACKETS', Path(root)):
            with self.assertRaisesRegex(ValueError, 'collect and review'):
                evidence.grounded_rows([{'slug': 'new-park', 'name': 'New Park'}])

    def test_unapproved_packet_blocks_generation(self):
        with tempfile.TemporaryDirectory() as root, patch.object(evidence, 'PACKETS', Path(root)):
            Path(root, 'new-park.json').write_text(json.dumps({'slug': 'new-park', 'sources': []}))
            with self.assertRaisesRegex(ValueError, 'not approved'):
                evidence.load_packet('new-park')

    def test_wikipedia_alone_cannot_support_current_park_rules(self):
        with tempfile.TemporaryDirectory() as root, patch.object(evidence, 'PACKETS', Path(root)):
            Path(root, 'new-park.json').write_text(json.dumps({'slug': 'new-park', 'approved_for_generation': True,
                'sources': [{'kind': 'background', 'url': 'https://en.wikipedia.org/wiki/Park', 'text': 'x' * 300}]}))
            with self.assertRaisesRegex(ValueError, 'official evidence missing'):
                evidence.load_packet('new-park')

    def test_invented_citation_is_rejected(self):
        with self.assertRaises(ValueError):
            evidence.validate_citations(['https://example.com/invented'], {'sources': [{'url': 'https://example.com/real'}]})

if __name__ == '__main__':
    unittest.main()

