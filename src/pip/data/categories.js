// Category meta — id, name, per-category color token key, icon (Illu name).
// `count` reflects the live datasets in src/data (wired in Phase 3).
export const CATEGORIES = [
  { id: 'alphabet', name: 'Alphabet', color: 'alphabet', count: 26, desc: 'A to Z', icon: { name: 'letter', char: 'A' } },
  { id: 'numbers', name: 'Numbers', color: 'numbers', count: 10, desc: 'Count 1–10', icon: { name: 'number', char: '3' } },
  { id: 'animals', name: 'Animals', color: 'animals', count: 46, desc: 'Furry friends', icon: { name: 'lion' } },
  { id: 'fruits', name: 'Fruits', color: 'fruits', count: 18, desc: 'Yummy & sweet', icon: { name: 'apple' } },
  { id: 'vegetables', name: 'Vegetables', color: 'vegetables', count: 20, desc: 'Good greens', icon: { name: 'carrot' } },
  { id: 'birds', name: 'Birds', color: 'birds', count: 21, desc: 'They fly!', icon: { name: 'parrot' } },
  { id: 'colors', name: 'Colors', color: 'colors', count: 9, desc: 'Rainbow', icon: { name: 'swatch', hex: '#a855f7' } },
  { id: 'shapes', name: 'Shapes', color: 'shapes', count: 15, desc: 'Round & flat', icon: { name: 'star' } },
  { id: 'vehicles', name: 'Vehicles', color: 'vehicles', count: 20, desc: 'Go go go', icon: { name: 'car' } },
  { id: 'body', name: 'Body Parts', color: 'body', count: 17, desc: 'All about me', icon: { name: 'hand' } },
  { id: 'weather', name: 'Weather', color: 'weather', count: 22, desc: 'Sky watch', icon: { name: 'sun' } },
  { id: 'emotions', name: 'Emotions', color: 'emotions', count: 25, desc: 'How I feel', icon: { name: 'happy' } },
];

// Avatars for onboarding (illustrated, each speaks its name)
export const AVATARS = [
  { id: 'cat', name: 'Kitty', illu: 'cat' },
  { id: 'dog', name: 'Puppy', illu: 'dog' },
  { id: 'frog', name: 'Hoppy', illu: 'frog' },
  { id: 'fish', name: 'Bubbles', illu: 'fish' },
];
