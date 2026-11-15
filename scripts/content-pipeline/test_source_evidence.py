import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import source_evidence as evidence

class SourceEvidenceTests(unittest.TestCase):
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