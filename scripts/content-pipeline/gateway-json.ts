import type {} from '../../src/generated/ai-gateway/models';
import { streamChatCompletion, GatewayError } from '@lovable.dev/ai-gateway';

const input = JSON.parse(await Bun.stdin.text());
try {
const stream = await streamChatCompletion({
  model: 'google/gemini-3-flash-preview',
  messages: [{ role: 'system', content: input.system }, { role: 'user', content: input.prompt }],
  response_format: { type: 'json_object' },
  stream_options: { include_usage: true },
});
let text = '';
for await (const event of stream) {
  if (event.usage) console.error(JSON.stringify({ usage: event.usage }));
  if (event.choices?.some(choice => ['length', 'content_filter', 'error'].includes(choice.finish_reason ?? ''))) {
    throw new Error('Incomplete or refused output retained for review');
  }
  for (const choice of event.choices ?? []) text += choice.delta?.content ?? '';
}
console.log(JSON.stringify(JSON.parse(text)));
} catch (error) {
  console.error(JSON.stringify(error instanceof GatewayError
    ? { code: error.code, outcome: error.outcome, recovery: error.recovery, ids: error.ids }
    : { code: 'invalid_output' }));
  process.exitCode = 1;
}