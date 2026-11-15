import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from compact_evidence import compact_packet, MAX_SOURCE_CHARS
import combined_content

def packet():
    quotes = [f'Place {i} is a woodland walk described by the park authority.' for i in range(6)]
    return {'slug': 'test', 'sources': [{'url': 'https://park.test/walks', 'kind': 'official',
        'text': '\n'.join(quotes), 'generation_excerpts': quotes}], 'approved_stops': [
        {'id': str(i), 'name': f'Place {i}', 'quote': q, 'source_url': 'https://park.test/walks'} for i,q in enumerate(quotes)]}

class CompactEvidenceTests(unittest.TestCase):
    def test_only_approved_exact_official_stop_names_pass(self):
        p = packet(); p['approved_stops'][0]['name'] = 'Invented Falls'
        with self.assertRaisesRegex(ValueError, 'exact official evidence'):
            compact_packet(p)

    def test_six_stops_required_before_paid_generation(self):
        p = packet(); p['approved_stops'] = p['approved_stops'][:5]
        with self.assertRaisesRegex(ValueError, 'six'):
            compact_packet(p)

    def test_unreviewed_excerpts_hold_instead_of_truncating(self):
        p = packet(); del p['sources'][0]['generation_excerpts']
        with self.assertRaisesRegex(ValueError, 'review compact'):
            compact_packet(p)

    def test_context_budget_cannot_silently_drop_evidence(self):
        p = packet(); text = 'x' * (MAX_SOURCE_CHARS + 1)
        p['sources'][0]['text'] += text; p['sources'][0]['generation_excerpts'] += [text]
        with self.assertRaisesRegex(ValueError, 'exceeds budget'):
            compact_packet(p)

    def test_failed_attempt_is_not_replayed_as_paid_call(self):
        p = packet()
        with tempfile.TemporaryDirectory() as tmp, patch.object(combined_content, 'CACHE', Path(tmp)), \
            patch.object(combined_content, 'load_packet', return_value=p), \
            patch.object(combined_content, 'module') as mod, \
            patch.object(combined_content, 'validate_bundle', side_effect=lambda b,*_: b), \
            patch.object(combined_content, 'call_ai_json') as ai:
            mod.return_value.PROMPT = 'schema'
            # First failed call must also not be replayed automatically.
            ai.side_effect = RuntimeError('unknown gateway outcome')
            with self.assertRaises(RuntimeError): combined_content.generate_bundle({'slug': 'test', 'name': 'Test'})
            with self.assertRaisesRegex(ValueError, 'prior attempt'): combined_content.generate_bundle({'slug': 'test', 'name': 'Test'})
            self.assertEqual(ai.call_count, 1)

    def test_validated_bundle_is_reused_without_another_paid_request(self):
        p = packet()
        with tempfile.TemporaryDirectory() as tmp, patch.object(combined_content, 'CACHE', Path(tmp)), \
            patch.object(combined_content, 'load_packet', return_value=p), \
            patch.object(combined_content, 'module') as mod, \
            patch.object(combined_content, 'validate_bundle', side_effect=lambda b,*_: b), \
            patch.object(combined_content, 'call_ai_json') as ai:
            mod.return_value.PROMPT = 'schema'
            ai.side_effect = RuntimeError('test capture')
            with self.assertRaises(RuntimeError): combined_content.generate_bundle({'slug': 'test', 'name': 'Test'})
            path = Path(tmp, 'test.json'); state = json.loads(path.read_text())
            state.update(status='validated', bundle={'travel': {'slug': 'test'}})
            path.write_text(json.dumps(state))
            self.assertEqual(combined_content.generate_bundle({'slug': 'test', 'name': 'Test'}), state['bundle'])
            self.assertEqual(ai.call_count, 1)

if __name__ == '__main__': unittest.main()