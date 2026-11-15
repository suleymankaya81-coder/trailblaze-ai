import importlib.util
import subprocess
import unittest
from pathlib import Path
import json
import tempfile
from unittest.mock import patch, Mock
import save_reviewed_bundle as saver

spec = importlib.util.spec_from_file_location('runner', Path(__file__).with_name('run-content-wave.py'))
if spec is None or spec.loader is None:
    raise RuntimeError('Runner missing')
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)

class WaveOutcomeTests(unittest.TestCase):
    def test_stderr_failure_cannot_be_marked_prepared(self):
        response = subprocess.CompletedProcess([], 0, '', 'ERR update rejected')
        self.assertTrue(runner.stage_failed(response, 'apply-wave.py'))

    def test_apply_requires_saved_confirmation(self):
        response = subprocess.CompletedProcess([], 0, 'richmond-park skipped', '')
        self.assertTrue(runner.stage_failed(response, 'apply-wave.py'))
        response.stdout = 'richmond-park applied\n'
        self.assertFalse(runner.stage_failed(response, 'apply-wave.py'))

    def test_draft_save_rejects_zero_rows_and_protects_published_pages(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'combined-content').mkdir()
            (root / 'combined-content' / 'test.json').write_text(json.dumps({'status': 'validated', 'bundle': {}}))
            response = Mock()
            response.json.return_value = []
            item = {'plan': {'days': []}, 'headline': 'Reviewed headline', 'reservation': 'Reviewed note', 'source_url': 'https://park.test'}
            with patch.object(saver, '__file__', str(root / 'writer.py')), \
                patch.object(saver, 'load_packet', return_value={}), \
                patch.object(saver, 'compact_packet', return_value={}), \
                patch.object(saver, 'validate_bundle', return_value={'travel': item}), \
                patch.dict(saver.os.environ, {'SUPABASE_SERVICE_ROLE_KEY': 'test', 'SUPABASE_URL': 'https://db.test'}), \
                patch.object(saver.requests, 'patch', return_value=response) as write:
                with self.assertRaisesRegex(ValueError, 'read back'):
                    saver.save_reviewed_bundle('test')
                self.assertEqual(write.call_args.kwargs['params']['status'], 'eq.draft')

if __name__ == '__main__':
    unittest.main()