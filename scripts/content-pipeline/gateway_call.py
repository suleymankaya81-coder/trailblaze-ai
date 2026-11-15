"""Use the supported Gateway SDK from offline Python writers."""
import json
import subprocess

def call_ai_json(prompt, model='google/gemini-3-flash-preview', system='Return JSON only.'):
    if model != 'google/gemini-3-flash-preview':
        raise ValueError('This content writer retains its configured Gemini model')
    result = subprocess.run(['bun', 'scripts/content-pipeline/gateway-json.ts'],
        input=json.dumps({'system': system, 'prompt': prompt}), text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError('Content generation failed; response retained by Gateway request logs')
    return json.loads(result.stdout)