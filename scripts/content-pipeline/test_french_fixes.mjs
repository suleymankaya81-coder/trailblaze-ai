// Run: node --test scripts/content-pipeline/test_french_fixes.mjs (kept out of the vitest *.test.* pattern)
import test from 'node:test';
import assert from 'node:assert/strict';
import { fixArticles, fixDistance, fitTitle, fitDescription, finishFrench } from './french-fixes.mjs';

test('article removed before names without a generic noun', () => {
  assert.equal(fixArticles('Les sources consultées pour le Ærø. Vérifiez.', 'Ærø'), 'Les sources consultées pour Ærø. Vérifiez.');
  assert.equal(fixArticles('départ le matin du Lovund', 'Lovund'), 'départ le matin de Lovund');
  assert.equal(fixArticles('visiteurs du Åre', 'Åre'), "visiteurs d'Åre");
  assert.equal(fixArticles('coucher du soleil au La Gomera', 'La Gomera'), 'coucher du soleil à La Gomera');
  assert.equal(fixArticles('Bureau Lovund', 'Lovund'), 'Bureau Lovund');
});

test('article kept for names starting with a generic French noun', () => {
  assert.equal(fixArticles('pour le Parc naturel régional du Vercors', 'Parc naturel régional du Vercors'), 'pour le Parc naturel régional du Vercors');
  assert.equal(fixArticles('au Lac de Garde', 'Lac de Garde'), 'au Lac de Garde');
});

test('duplicate distance units only when the km equals English', () => {
  const en = 'About 37 km from Åre in a straight line; road distance is longer, so check the route before departure.';
  assert.deepEqual(fixDistance("Environ 37 km [37 km] d'Åre", en), { status: 'fix', text: "Environ 37 km d'Åre" });
  assert.deepEqual(fixDistance("Environ 23 miles [37 km] d'Åre", en), { status: 'fix', text: "Environ 37 km d'Åre" });
  assert.equal(fixDistance('Environ 37 km (23 miles) de X', en).text, 'Environ 37 km de X');
  const folgefonna = 'About 10 km from Folgefonna National Park in a straight line; road distance is longer, so check the route before departure.';
  assert.equal(fixDistance('Environ 10 miles [16 km] de Folgefonna National Park', folgefonna).status, 'mismatch');
  assert.equal(fixDistance('Environ 12 km de X', en).status, null);
});

test('titles and descriptions never end mid-word', () => {
  assert.equal(fitTitle('Loire-Anjou-Touraine Regional Nature Park', ' : itinéraire et conseils'), 'Loire-Anjou-Touraine Regional Nature Park');
  assert.equal(fitTitle('Åre', ' : itinéraire et conseils'), 'Åre : itinéraire et conseils');
  const d = fitDescription('Une phrase complète ici. ' + 'mot '.repeat(60));
  assert.ok(d.length <= 160 && /[.…]$/.test(d));
});

test('finishFrench fixes D1–D3 and holds placeholders or mismatched distances', () => {
  const english = { days: [{ driving: 'Choose one local visit.' }, { driving: 'About 10 km from Folgefonna in a straight line; road distance is longer, so check the route before departure.' }] };
  const fields = { name: 'Folgefonna', intel: [{ title: 'Timing', text: 'pour le Folgefonna' }],
    days: [{ driving: 'Choisissez', stops: [{ name: 'Folgefonna', detail: 'créé en [dated source].' }] }, { driving: 'Environ 10 miles [16 km] du Folgefonna', stops: [] }] };
  const { fields: out, held } = finishFrench(fields, english, 'Folgefonna');
  assert.equal(out.intel[0].title, 'Horaires');
  assert.equal(out.intel[0].text, 'pour Folgefonna');
  assert.equal(out.days[0].stops[0].name, 'Folgefonna');
  assert.equal(held.length, 2);
});
