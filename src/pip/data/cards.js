// Card adapter — full legacy datasets reshaped to the redesign card contract:
//   { id, front:{kind:'mega'|'illu'|'swatch'|'shape', ...}, word,
//     badge:{label,icon}, phrase, illu? }
// All art goes through <Illu>; ids without bespoke outlines fall back to the
// Illu default disc showing the card's emoji (swappable placeholder layer).
import { alphabet } from '../../data/alphabet';
import { numbers } from '../../data/numbers';
import { animals } from '../../data/animals';
import { fruits } from '../../data/fruits';
import { vegetables } from '../../data/vegetables';
import { birds } from '../../data/birds';
import { colors } from '../../data/colorsShapes';
import { shapes } from '../../data/shapes';
import { vehicles } from '../../data/vehicles';
import { bodyParts } from '../../data/bodyParts';
import { weather } from '../../data/weather';
import { emotions } from '../../data/emotions';

// Shape ids that have a clean geometric SVG in Illu; other shapes fall back to
// their native emoji. (Photo-style categories all render native emoji now.)
const SHAPE_SVG = new Set(['circle', 'square', 'triangle', 'star', 'heart']);

const cleanSound = (s) => (s || '').replace(/!+$/, '');

const CARDS = {
  alphabet: alphabet.map((c) => ({
    id: c.id,
    front: { kind: 'mega', text: c.letter, char: c.emoji },
    word: c.word,
    badge: { label: `${c.letter} is for ${c.word}`, icon: 'tag' },
    illu: 'emoji', // card back shows the word's realistic emoji
    phrase: `${c.letter} is for ${c.word}.`,
  })),
  numbers: numbers.map((c) => ({
    id: String(c.id),
    front: { kind: 'mega', text: String(c.number) },
    word: c.word,
    badge: { label: c.hint, icon: 'tag' },
    phrase: `${c.word}.`,
  })),
  animals: animals.map((c) => ({
    id: c.id,
    front: { kind: 'emoji', char: c.emoji },
    word: c.name,
    badge: c.sound
      ? { label: `Says “${cleanSound(c.sound)}”`, icon: 'sound' }
      : { label: `Lives: ${(c.habitat || '').toLowerCase()}`, icon: 'home' },
    phrase: c.sound ? `${c.name}. The ${c.name.toLowerCase()} says ${cleanSound(c.sound).toLowerCase()}.` : `${c.name}.`,
  })),
  fruits: fruits.map((c) => ({
    id: c.id,
    front: { kind: 'emoji', char: c.emoji },
    word: c.name,
    badge: { label: c.hint, icon: 'tag' },
    phrase: `${c.name}.`,
  })),
  vegetables: vegetables.map((c) => ({
    id: c.id,
    front: { kind: 'emoji', char: c.emoji },
    word: c.name,
    badge: { label: c.hint, icon: 'tag' },
    phrase: `${c.name}.`,
  })),
  birds: birds.map((c) => ({
    id: c.id,
    front: { kind: 'emoji', char: c.emoji },
    word: c.name,
    badge: c.sound
      ? { label: `Says “${cleanSound(c.sound)}”`, icon: 'sound' }
      : { label: `Lives: ${(c.habitat || '').toLowerCase()}`, icon: 'home' },
    phrase: c.sound ? `${c.name}. The ${c.name.toLowerCase()} says ${cleanSound(c.sound).toLowerCase()}.` : `${c.name}.`,
  })),
  colors: colors.map((c) => ({
    id: c.id,
    front: { kind: 'swatch', hex: c.hex },
    word: c.name,
    badge: { label: c.example, icon: 'tag' },
    phrase: `${c.name}.`,
  })),
  shapes: shapes.map((c) => ({
    id: c.id,
    front: SHAPE_SVG.has(c.id)
      ? { kind: 'shape', name: c.id }
      : { kind: 'emoji', char: c.emoji },
    word: c.name,
    badge: { label: c.sides > 0 ? `${c.sides} sides` : c.description, icon: 'info' },
    phrase: `${c.name}.`,
  })),
  vehicles: vehicles.map((c) => ({
    id: c.id,
    front: { kind: 'emoji', char: c.emoji },
    word: c.name,
    badge: { label: `Says “${cleanSound(c.sound)}”`, icon: 'sound' },
    phrase: `${c.name}. ${cleanSound(c.sound)}.`,
  })),
  body: bodyParts.map((c) => ({
    id: c.id,
    front: { kind: 'emoji', char: c.emoji },
    word: c.name,
    badge: { label: c.action, icon: 'info' },
    phrase: `${c.name}.`,
  })),
  weather: weather.map((c) => ({
    id: c.id,
    front: { kind: 'emoji', char: c.emoji },
    word: c.name,
    badge: { label: c.description, icon: 'info' },
    phrase: `${c.name}.`,
  })),
  emotions: emotions.map((c) => ({
    id: c.id,
    front: { kind: 'emoji', char: c.emoji },
    word: c.name,
    badge: { label: c.feeling, icon: 'info' },
    phrase: `${c.name}.`,
  })),
};

export { CARDS };
