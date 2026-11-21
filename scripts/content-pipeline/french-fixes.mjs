// Deterministic French post-processing applied by french-translation.mjs before a page is saved
// (same rules as scripts/audits/translations-2026-11/fixes/01-helper.sql, D1–D3 + publication gate).
// No model calls; pure functions, tested with `node --test scripts/content-pipeline/test_french_fixes.mjs`.

export const BLOCKED_TEXT = ['[dated source]', '[source datée]', '[datierter Quelle]', '[datiert Quelle]', 'Check official seasonal information'];

// Names that start with a French generic noun keep their article ("le Parc …", "du Lac …").
const GENERIC = /^(Parc|Lac|Mont|Monts|Massif|Cap|Golfe|Détroit|Pic|Col|Cirque|Gorge|Gorges|Forêt|Bois|Val|Vallée|Plateau|Marais|Étang|Pointe|Baie|Réserve|Domaine|Pont|Canal|Château|Musée|Jardin|Côte|Plage|Rocher|Roc|Aven|Grotte|Gouffre|Causse|Puy|Dent|Aiguille|Mer|Île|Îles|Archipel|Delta|Glacier|Barrage|Cascade|Chute|Chutes|Source|Sentier|Route|Chemin|Port|Phare|Fort|Abbaye|Désert|Volcan|Lagune|Estuaire|Presqu'île|Péninsule|Dune|Falaise|Grand|Grande|Petit|Petite|Haut|Haute|Bas|Basse)(?![\p{L}\p{N}])/iu;
const escape = s => s.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');

export function takesArticle(name) { return GENERIC.test(name); }

/** "pour le / au / du {name}" → "pour / à / de|d' {name}" unless the name starts with a generic noun. */
export function fixArticles(text, name) {
  if (typeof text !== 'string' || !name || takesArticle(name) || !text.includes(name)) return text;
  const n = escape(name);
  const de = /^[aeiouyæøåäöüéèêîôûœ]/i.test(name) ? "d'" : 'de ';
  const left = '(^|[^\\p{L}])', right = '(?![\\p{L}\\p{N}])';
  return text
    .replace(new RegExp(`${left}pour le ${n}${right}`, 'gu'), (_, a) => `${a}pour ${name}`)
    .replace(new RegExp(`${left}au ${n}${right}`, 'gu'), (_, a) => `${a}à ${name}`)
    .replace(new RegExp(`${left}du ${n}${right}`, 'gu'), (_, a) => `${a}${de}${name}`);
}

const NUM = '([0-9]+(?:[.,][0-9]+)?)';
const num = s => Number(s.replace(/\s/g, '').replace(',', '.'));

/** { status: 'fix' | 'mismatch' | null, text } for one French driving line vs its English source. */
export function fixDistance(fr, en) {
  const m = /^About ([0-9][0-9.,]*) km from /.exec(en ?? '');
  if (!m || typeof fr !== 'string') return { status: null, text: fr };
  const enKm = Number(m[1].replace(/,/g, ''));
  const a = new RegExp(`${NUM} km ?[\\[(] ?${NUM} ?(km|miles?|mi) ?[\\])]`).exec(fr);
  if (a) return num(a[1]) === enKm ? { status: 'fix', text: fr.replace(a[0], `${a[1]} km`) } : { status: 'mismatch', text: fr };
  const b = new RegExp(`${NUM} ?(miles?|mi) ?[\\[(] ?${NUM} ?km ?[\\])]`).exec(fr);
  if (b) return num(b[3]) === enKm ? { status: 'fix', text: fr.replace(b[0], `${b[3]} km`) } : { status: 'mismatch', text: fr };
  return { status: null, text: fr };
}

/** Cut at a word boundary (never "itinéraire et co"); drop the optional suffix first. */
export function fitTitle(name, suffix, limit = 60) {
  if ((name + suffix).length <= limit) return name + suffix;
  if (name.length <= limit) return name;
  let kept = '';
  for (const word of name.split(/\s+/)) { if ((kept ? `${kept} ${word}` : word).length > limit) break; kept = kept ? `${kept} ${word}` : word; }
  return kept || name.slice(0, limit);
}

export function fitDescription(text, limit = 160) {
  if (text.length <= limit) return text;
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [];
  let out = '';
  for (const s of sentences) { if ((out + s).trim().length > limit) break; out += s; }
  if (out.trim()) return out.trim();
  const cut = text.slice(0, limit - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:]+$/, '')}…`;
}

function walk(value, fn, key) {
  if (typeof value === 'string') return fn(value, key);
  if (Array.isArray(value)) return value.map(v => walk(v, fn, key));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, ['name', 'stop_id', 'routingName', 'url', 'sourceUrl'].includes(k) ? v : walk(v, fn, k)]));
  return value;
}

/** Returns { fields, held } — held lists reasons the page must not be saved. */
export function finishFrench(fields, englishPlan, name) {
  const held = [];
  let out = walk(fields, text => fixArticles(text, name));
  out = { ...out, intel: (out.intel ?? []).map(i => (i.title === 'Timing' ? { ...i, title: 'Horaires' } : i)) };
  out.days = (out.days ?? []).map((day, i) => {
    const r = fixDistance(day.driving, englishPlan?.days?.[i]?.driving);
    if (r.status === 'mismatch') held.push(`day ${i + 1}: French distance differs from English`);
    return { ...day, driving: r.text };
  });
  const text = JSON.stringify(out);
  for (const marker of BLOCKED_TEXT) if (text.includes(marker)) held.push(`placeholder text ${marker}`);
  return { fields: out, held };
}
