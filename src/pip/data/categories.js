import { CARDS } from './cards.js';

// Category meta — id, name, per-category color token key, icon (Illu name).
// `count` derives from the live datasets so the grid scales with data.
const META = [
  { id: 'alphabet', name: 'Alphabet', color: 'alphabet', desc: 'A to Z', icon: { name: 'letter', char: 'A' } },
  { id: 'numbers', name: 'Numbers', color: 'numbers', desc: 'Count 1–10', icon: { name: 'number', char: '3' } },
  { id: 'animals', name: 'Animals', color: 'animals', desc: 'Furry friends', icon: { name: 'lion' } },
  { id: 'fruits', name: 'Fruits', color: 'fruits', desc: 'Yummy & sweet', icon: { name: 'apple' } },
  { id: 'vegetables', name: 'Vegetables', color: 'vegetables', desc: 'Good greens', icon: { name: 'carrot' } },
  { id: 'birds', name: 'Birds', color: 'birds', desc: 'They fly!', icon: { name: 'parrot' } },
  { id: 'colors', name: 'Colors', color: 'colors', desc: 'Rainbow', icon: { name: 'swatch', hex: '#a855f7' } },
  { id: 'shapes', name: 'Shapes', color: 'shapes', desc: 'Round & flat', icon: { name: 'star' } },
  { id: 'vehicles', name: 'Vehicles', color: 'vehicles', desc: 'Go go go', icon: { name: 'car' } },
  { id: 'body', name: 'Body Parts', color: 'body', desc: 'All about me', icon: { name: 'hand' } },
  { id: 'weather', name: 'Weather', color: 'weather', desc: 'Sky watch', icon: { name: 'sun' } },
  { id: 'emotions', name: 'Emotions', color: 'emotions', desc: 'How I feel', icon: { name: 'happy' } },
];

export const CATEGORIES = META.map((m) => ({ ...m, count: (CARDS[m.id] || []).length }));

// Avatars for onboarding (illustrated, each speaks its name)
export const AVATARS = [
  { id: 'cat', name: 'Kitty', illu: 'cat' },
  { id: 'dog', name: 'Puppy', illu: 'dog' },
  { id: 'frog', name: 'Hoppy', illu: 'frog' },
  { id: 'fish', name: 'Bubbles', illu: 'fish' },
];
