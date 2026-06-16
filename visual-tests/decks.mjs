// decks.mjs — data-integrity guard over EVERY zone's card deck (pure Node, no
// browser). The e2e only drives one zone (animals); this asserts the invariants
// that matter for ALL 20 zones so a bad deck can't slip in again:
//   • non-empty
//   • UNIQUE ids  (id-count == length) — the id-keyed mastered Set must be able
//     to reach deck.length, or the zone can NEVER complete (this caught the
//     vehicles "boat"/weather "sun" id collisions)
//   • no duplicate learn keys (word, or letter for alphabet)
//   • every card has a word, a phrase, and a valid art source for its kind
//
//   node visual-tests/decks.mjs
import { CARDS } from '../src/adventure/data/cards.js';
import { ZONE_CATS } from '../src/adventure/data/categories.js';

let passed = 0, failed = 0;
const ok = (name, cond, detail = '') => { if (cond) { passed++; } else { failed++; console.log(`  ✗ ${name} ${detail}`); } };

const artOK = (c) => {
  const f = c.front;
  if (f.kind === 'mega') return !!f.text;
  if (f.kind === 'swatch') return !!f.hex;
  if (f.kind === 'shape') return !!f.name;
  if (f.kind === 'illu') return !!f.name;
  if (f.kind === 'emoji') return !!f.char;
  return false;
};
const learnKey = (catId, c) => (catId === 'alphabet' ? (c.front.text || '') : (c.word || '')).toLowerCase();

for (const catId of ZONE_CATS) {
  const deck = CARDS[catId] || [];
  ok(`${catId}: deck non-empty`, deck.length > 0, `len=${deck.length}`);

  const ids = deck.map((c) => c.id);
  const uniqueIds = new Set(ids).size;
  ok(`${catId}: unique ids (completable: ${uniqueIds}/${deck.length})`, uniqueIds === deck.length,
    `dupes: ${[...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))].join(', ')}`);

  const keys = deck.map((c) => learnKey(catId, c));
  const dupKeys = [...new Set(keys.filter((k, i) => k && keys.indexOf(k) !== i))];
  ok(`${catId}: no duplicate learn keys`, dupKeys.length === 0, `dupes: ${dupKeys.join(', ')}`);

  const missWord = deck.filter((c) => !c.word).map((c) => c.id);
  ok(`${catId}: every card has a word`, missWord.length === 0, missWord.join(', '));
  const missPhrase = deck.filter((c) => !c.phrase).map((c) => c.id);
  ok(`${catId}: every card has a phrase`, missPhrase.length === 0, missPhrase.join(', '));
  const missArt = deck.filter((c) => !artOK(c)).map((c) => `${c.id}(${c.front.kind})`);
  ok(`${catId}: every card has valid art`, missArt.length === 0, missArt.join(', '));
}

console.log(`\n${ZONE_CATS.length} zones checked — ${passed} assertions passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
