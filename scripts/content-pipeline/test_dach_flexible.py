import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import source_evidence as evidence
from compact_evidence import compact_packet

class FlexibleDachTests(unittest.TestCase):
    def packet(self):
        text = 'Plansee is a lake in Tyrol, Austria. ' * 10
        return {'slug': 'plansee', 'approved_for_generation': True,
                'evidence_policy': 'dach-wikipedia-overview', 'country_code': 'at', 'identity_verified': True,
                'sources': [{'kind': 'wikipedia', 'url': 'https://en.wikipedia.org/wiki/Plansee',
                             'text': text, 'generation_excerpts': [text]}],
                'approved_stops': [{'id': 'plansee', 'name': 'Plansee', 'quote': text,
                                    'source_url': 'https://en.wikipedia.org/wiki/Plansee'}]}

    def test_dach_wikipedia_overview_accepted_without_official_excerpt(self):
        p = self.packet()
        with tempfile.TemporaryDirectory() as root, patch.object(evidence, 'PACKETS', Path(root)):
            Path(root, 'plansee.json').write_text(json.dumps(p))
            self.assertEqual(compact_packet(evidence.load_packet('plansee'))['approved_stops'][0]['name'], 'Plansee')

    def test_non_dach_wikipedia_exception_rejected(self):
        p = self.packet(); p['country_code'] = 'us'
        self.assertFalse(evidence.overview_source(p['sources'][0], p))

    def test_unverified_identity_rejected(self):
        p = self.packet(); p['identity_verified'] = False
        self.assertFalse(evidence.overview_source(p['sources'][0], p))

    def test_unrelated_source_host_rejected(self):
        p = self.packet(); p['sources'][0]['url'] = 'https://example.com/wiki/Plansee'
        self.assertFalse(evidence.overview_source(p['sources'][0], p))

    def test_wikipedia_cannot_replace_unknown_permit_with_claim(self):
        from quoted_visit import quoted_bundle
        from combined_content import validate_bundle
        p = self.packet()
        bundle = quoted_bundle({'slug': 'plansee', 'name': 'Plansee', 'region': 'tyrol'}, p)
        bundle['travel']['reservation'] = 'All visitors have unrestricted access without reservations. ' * 4
        with self.assertRaisesRegex(ValueError, 'operational unknowns'):
            validate_bundle(bundle, 'plansee', compact_packet(p))

if __name__ == '__main__': unittest.main()