// util.jsx — shared game helpers (ported from the activities files). No
// component exports (camelCase fns + consts) so react-refresh stays happy.
import { Illu } from '../art/Illu.jsx';
import { emojiArt, hasFluent } from '../art/emojiArt.jsx';
import { CARDS } from '../data/cards.js';

export const shuffle = (a) => [...a].sort(() => Math.random() - .5);

export const pickCards = (catId, n) => (CARDS[catId] || CARDS.animals).slice(0, n);

// build a pool of n unique cards, topping up from other categories when the
// zone is small (small zones like dinos/space have only 4-5 cards).
const FALLBACK_CATS = ['animals', 'fruits', 'shapes', 'weather', 'vehicles', 'emotions', 'vegetables', 'colors', 'birds', 'body', 'ocean', 'dinos', 'space', 'music', 'clothes', 'home', 'foods', 'helpers'];
export const advGamePool = (catId, n, noMega) => {
  const out = [], seen = new Set();
  const push = (c) => { if (out.length < n && !seen.has(c.word) && !(noMega && c.front.kind === 'mega')) { seen.add(c.word); out.push(c); } };
  (CARDS[catId] || []).forEach(push);
  FALLBACK_CATS.forEach((f) => { if (f !== catId) (CARDS[f] || []).forEach(push); });
  return out;
};

// game card art (note: mega uses an inline-styled span, distinct from the
// flashcard `.amega` styling in art/cardArt.jsx).
export const cardArt = (card, size) => {
  const f = card.front;
  if (card.emoji && hasFluent(card.emoji)) return emojiArt(card.emoji, size);
  if (f.kind === 'mega') return <span style={{ fontSize: size * .9, fontWeight: 700, color: 'var(--zc)', lineHeight: 1 }}>{f.text}</span>;
  if (f.kind === 'swatch') return <Illu name="swatch" hex={f.hex} size={size} />;
  if (f.kind === 'emoji') return emojiArt(f.char, size);
  return <Illu name={f.name} size={size} />;
};

export const NUM_WORDS = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
