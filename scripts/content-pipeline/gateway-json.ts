import type {} from '../../src/generated/ai-gateway/models';
import { streamChatCompletion } from '@lovable.dev/ai-gateway';

const input = JSON.parse(await Bun.stdin.text());
const stream = await streamChatCompletion({
  model: 'google/gemini-3-flash-preview',
  messages: [{ role: 'system', content: input.system }, { role: 'user', content: input.prompt }],
  response_format: { type: 'json_object' },
});
let text = '';
for await (const event of stream) {
  for (const choice of event.choices ?? []) text += choice.delta?.content ?? '';
}
console.log(JSON.stringify(JSON.parse(text)));