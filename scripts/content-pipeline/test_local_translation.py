import unittest
from quoted_visit import quoted_bundle

class TranslationEvidenceTests(unittest.TestCase):
    def test_display_translation_preserves_original_stop_validation(self):
        quote = 'Der Taunus ist eine Landschaft mit Wäldern und Bergen in Deutschland.'
        packet = {'slug':'taunus','sources':[{'kind':'official','url':'https://example.org', 'text':quote,
          'generation_excerpts':[quote], 'display_translation':'The Taunus is a landscape with forests and mountains in Germany.'}],
          'approved_stops':[{'id':'taunus','name':'Taunus','quote':quote,'source_url':'https://example.org'}]}
        bundle=quoted_bundle({'slug':'taunus','name':'Taunus','region':'hessen'},packet)
        self.assertEqual(bundle['travel']['plan']['days'][0]['stops'][0]['detail'], 'The Taunus is a landscape with forests and mountains in Germany.')
        self.assertEqual(packet['sources'][0]['text'], quote)