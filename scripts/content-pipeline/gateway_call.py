"""Use the supported Gateway SDK from offline Python writers."""
import json
import subprocess
import datetime
from pathlib import Path

def call_ai_json(prompt, model='google/gemini-3-flash-preview', system='Return JSON only.'):
    if model != 'google/gemini-3-flash-preview':
        raise ValueError('This content writer retains its configured Gemini model')
    result = subprocess.run(['bun', 'scripts/content-pipeline/gateway-json.ts'],
        input=json.dumps({'system': system, 'prompt': prompt}), text=True, capture_output=True)
    metrics = Path('scripts/content-pipeline/generation-metrics.jsonl')
    records = []
    for line in result.stderr.splitlines():
        try:
            records.append(json.loads(line))
        except json.JSONDecodeError:
            pass
    with metrics.open('a') as f:
        f.write(json.dumps({'at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
            'model': model, 'input_chars': len(prompt)+len(system), 'success': result.returncode == 0,
            'diagnostics': records}) + '\n')
    if result.returncode:
        raise RuntimeError('Content generation failed; response retained by Gateway request logs')
    return json.loads(result.stdout)