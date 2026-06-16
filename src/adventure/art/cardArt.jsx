// cardArt — renders a card's front art (mega glyph, color swatch, big emoji, or
// named illustration). Shared by Learn + Quiz. Ported from adventure-app.jsx
// `art`, extended with an `emoji` kind: the prototype only drew ~90 bespoke
// illustrations, so cards beyond that set render their realistic emoji (the same
// fallback the earlier redesign used) — keeps the drawn art where it exists and
// fills out the full card decks.
import { Illu } from './Illu.jsx';
import { emojiArt as emoji, hasFluent } from './emojiArt.jsx';

export const art = (card, size) => {
  const f = card.front;
  // a bespoke card tagged with an emoji renders its Fluent 3D face when we have
  // one (consistent HD look across the whole deck); the drawing stays a fallback.
  if (card.emoji && hasFluent(card.emoji)) return emoji(card.emoji, size);
  if (f.kind === 'mega') return <span className="amega">{f.text}</span>;
  if (f.kind === 'swatch') return <Illu name="swatch" hex={f.hex} size={size} />;
  if (f.kind === 'emoji') return emoji(f.char, size);
  return <Illu name={f.name} size={size} />;
};

// the flip-card BACK art: alphabet/emoji-back cards show the word's emoji,
// `illu`-tagged cards show that drawing, otherwise the front art is reused.
export const backArt = (card, size) => {
  if (card.illu === 'emoji') return emoji(card.front.char, size);
  if (card.illu) return <Illu name={card.illu} size={size} />;
  return art(card, size);
};
