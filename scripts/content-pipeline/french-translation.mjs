// Run with bun. Reuses aligned published French wording and durable phrase batches.
import { generateChatCompletion, GatewayError } from '@lovable.dev/ai-gateway';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { finishFrench, fitTitle, fitDescription } from './french-fixes.mjs';

const root = 'data/translations/fr';
await mkdir(root, { recursive: true });
const url = process.env['SUPABASE_URL'];
const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
if (!url || !key) throw new Error('Existing content writer configuration is unavailable');
const headers = { apikey: key, 'Content-Type': 'application/json', ...(key.startsWith('sb_') ? {} : { Authorization: `Bearer ${key}` }) };
async function rows(query) {
  const all = [];
  for (let offset = 0; ; offset += 1000) {
    const r = await fetch(`${url}/rest/v1/${query}&limit=1000&offset=${offset}`, { headers });
    if (!r.ok) throw new Error(`Content read failed: ${r.status}`);
    const page = await r.json(); all.push(...page);
    if (page.length < 1000) return all;
  }
}
const dests = await rows('destinations?select=slug,name,region,tagline,best_season,permit_headline,permit_note,travel_plan&status=eq.published&order=slug.asc');
const existing = await rows('content_translations?select=entity_id,fields&entity_type=eq.destination&locale=eq.fr&status=eq.published&order=entity_id.asc');
const done = new Map(existing.map(r => [r.entity_id, r.fields]));
const dictionary = new Map();
const normalized = (text, name) => text.split(name).join('{{PLACE}}');
const source = d => ({ name: d.name, region: d.region, tagline: d.tagline, bestSeason: d.best_season, permitHeadline: d.permit_headline, permitNote: d.permit_note, days: d.travel_plan?.days ?? [], intel: (d.travel_plan?.intel ?? []).map(i => ({ title: i.title, text: i.text })), arrival: d.travel_plan?.arrival ?? null, vehicle: d.travel_plan?.vehicle ?? null, goldenHour: d.travel_plan?.goldenHour ?? null });
const immutable = new Set(['name', 'stop_id', 'routingName', 'source', 'url', 'sourceUrl', 'citation', 'citations', 'photo', 'image', 'id']);
function walk(a, visit, path = []) {
  if (typeof a === 'string') { if (!immutable.has(path.at(-1)) && a && !a.startsWith('https://')) visit(a, path); }
  else if (Array.isArray(a)) a.forEach((v, i) => walk(v, visit, [...path, i]));
  else if (a && typeof a === 'object') Object.entries(a).forEach(([k, v]) => walk(v, visit, [...path, k]));
}
function at(obj, path) { return path.reduce((v, k) => v?.[k], obj); }
for (const d of dests) {
  const tr = done.get(d.slug);
  if (!tr) continue;
  walk(source(d), (text, path) => {
    const translated = at(tr, path);
    if (typeof translated === 'string' && translated && translated !== text) dictionary.set(normalized(text, d.name), normalized(translated, tr.name || d.name));
  });
}
let cached = {};
try { cached = JSON.parse(await readFile(`${root}/phrases.json`, 'utf8')); } catch {}
for (const [a, b] of Object.entries(cached)) dictionary.set(a, b);
try {
  const reviewed = JSON.parse(await readFile(`${root}/reviewed-phrases.json`, 'utf8'));
  for (const [a, b] of Object.entries(reviewed)) dictionary.set(a, b);
} catch {}
const pending = dests.filter(d => !done.has(d.slug));
const wanted = new Set();
for (const d of pending) walk(source(d), text => { const n = normalized(text, d.name); if (!dictionary.has(n)) wanted.add(n); });
const batches = []; let batch = [], size = 0;
for (const text of wanted) {
  if (batch.length >= 35 || size + text.length > 14000) { batches.push(batch); batch = []; size = 0; }
  batch.push(text); size += text.length;
}
if (batch.length) batches.push(batch);
console.log(JSON.stringify({ places: dests.length, existing: done.size, pending: pending.length, phrases: wanted.size, batches: batches.length }));
let cursor = Number(process.env['FR_START_BATCH'] || 0), paused = false, failed = 0;
async function worker() {
  while (!paused && cursor < batches.length) {
    const i = cursor++, texts = batches[i];
    const hash = createHash('sha256').update(JSON.stringify(texts)).digest('hex');
    const file = `${root}/${hash}.json`;
    try {
      let result;
      try { result = JSON.parse(await readFile(file, 'utf8')); } catch {
        const reply = await generateChatCompletion({ model: 'google/gemini-3-flash-preview', messages: [{ role: 'user', content: `Translate these travel-guide strings into fluent French. Return JSON {"translations":[...]} in exactly the same order and count. Preserve {{PLACE}} literally, official place/trail names, URLs, numbers, units and facts. Do not add facts or remove uncertainty. Input: ${JSON.stringify(texts)}` }], response_format: { type: 'json_object' } }, { runId: `fr-${hash}` });
        const content = reply.choices?.[0]?.message?.content;
        if (typeof content !== 'string') throw new Error('Missing translation text');
        result = JSON.parse(content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')).translations;
        if (!Array.isArray(result) || result.length !== texts.length || result.some((t, j) => typeof t !== 'string' || !t.trim() || (texts[j].includes('{{PLACE}}') && !t.includes('{{PLACE}}')))) throw new Error('Translation structure rejected');
        await writeFile(file, JSON.stringify(result));
      }
      texts.forEach((text, j) => dictionary.set(text, result[j]));
      console.log(`batch ${i + 1}/${batches.length} retained`);
    } catch (e) {
      failed++;
      console.log(`batch ${i + 1} held: ${e instanceof GatewayError ? e.code : e.message}`);
      if (e instanceof GatewayError) paused = true; // no replay of uncertain/billed calls
    }
  }
}
await Promise.all(Array.from({ length: Number(process.env['FR_WORKERS'] || 12) }, worker));
await writeFile(`${root}/phrases.json`, JSON.stringify(Object.fromEntries(dictionary)));
let saved = 0; const held = [];
for (const d of pending) {
  const fields = structuredClone(source(d)); let missing = false;
  walk(fields, (text, path) => {
    const translated = dictionary.get(normalized(text, d.name));
    if (!translated) { missing = true; return; }
    const parent = at(fields, path.slice(0, -1)); parent[path.at(-1)] = translated.split('{{PLACE}}').join(d.name);
  });
  if (missing) { held.push(d.slug); continue; }
  // Audit 2026-11: articles, "Timing", duplicate units; placeholders or wrong distances hold the page.
  const finished = finishFrench(fields, d.travel_plan, d.name);
  if (finished.held.length) { held.push(d.slug); console.log(`held ${d.slug}: ${finished.held.join('; ')}`); continue; }
  Object.assign(fields, finished.fields);
  fields.metaTitle = fitTitle(d.name, ' : itinéraire et conseils', 60);
  fields.metaDescription = fitDescription(`${d.name} : ${fields.tagline || 'itinéraire, carte et conseils pour préparer votre visite.'}`, 160);
  const r = await fetch(`${url}/rest/v1/content_translations?on_conflict=entity_type,entity_id,locale`, { method: 'POST', headers: { ...headers, Prefer: 'resolution=ignore-duplicates' }, body: JSON.stringify({ entity_type: 'destination', entity_id: d.slug, locale: 'fr', fields, status: 'published', updated_at: new Date().toISOString() }) });
  if (!r.ok) { held.push(d.slug); console.log(`save held ${d.slug}: ${r.status}`); } else saved++;
}
await writeFile(`${root}/status.json`, JSON.stringify({ saved, held, failed, paused, existing: done.size, total: dests.length }, null, 2));
console.log(JSON.stringify({ saved, held: held.length, failed, paused }));