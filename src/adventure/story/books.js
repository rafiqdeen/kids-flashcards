// books.js — Story Land shelf + the four comic page-graphs. Pure data (no JSX),
// ported verbatim from adventure-story.jsx / story2.jsx / story3.jsx.

export const SHELF = [
  { id: 'book', title: 'Pip & the Lost Star', sub: 'A bedtime comic', c1: '#7986cb', c2: '#3949ab', icon: 'book' },
  { id: 'choose', title: 'Pip’s Big Day Out', sub: 'You choose the way!', c1: '#4ec0f0', c2: '#0288d1', icon: 'flag' },
  { id: 'quest', title: 'Rainbow Mountain', sub: 'Comic + challenges', c1: '#f5a623', c2: '#e65100', icon: 'trophy' },
  { id: 'comic', title: 'Pip’s Super Day', sub: 'A hero comic!', c1: '#ff4b4b', c2: '#c62828', icon: 'sparkle' },
];

const NIGHT = ['#1a2347', '#2c3a6b'], NGROUND = '#3b2f63';
const DAY = ['#4ec0f0', '#a8e4ff'], GGRASS = '#58cc02';
const LAKE = ['#4ec0f0', '#b3e5fc'], WATER = '#0288d1';
const GRASS = '#58cc02';
const DUSK = ['#f06292', '#ffd3a5'], DGROUND = '#ec407a';
const PINK = ['#f06292', '#ffd3a5'], PGROUND = '#ec407a';
const SKY = ['#4ec0f0', '#a8e4ff'];
const STAR = '#ffe066';

/* ---------- "Pip & the Lost Star" — simple comic ---------- */
export const LOST_STAR = {
  p1: {
    layout: 'duo', dot: 0, next: 'p2',
    panels: [
      { bg: NIGHT, ground: NGROUND, caption: 'Pip was fast asleep.',
        cast: [{ state: 'sleep', size: 80, x: 28, y: 6 }],
        props: [{ illu: 'star', color: STAR, size: 22, x: 72, y: 12, anim: 'twinkle', say: 'Twinkle twinkle!' }] },
      { bg: NIGHT, ground: NGROUND, caption: 'A little star fell down!',
        cast: [{ state: 'idle', size: 78, x: 12, y: 6 }],
        props: [{ illu: 'star', color: STAR, size: 52, x: 48, b: 10, anim: 'fall', say: 'Wheee!' }],
        burst: { text: 'BUMP!', color: '#ffc83d', x: 46, y: 66 } },
    ],
  },
  p2: {
    layout: 'duo', dot: 1, next: 'p3',
    panels: [
      { bg: NIGHT, ground: NGROUND,
        props: [{ illu: 'star', color: STAR, size: 56, x: 44, y: 66, anim: 'sniff', say: 'Sniff sniff.' }],
        bubble: { tail: 'right', who: 'right', text: 'I lost my home!', say: 'I lost my home!' } },
      { bg: NIGHT, ground: NGROUND,
        cast: [{ state: 'encourage', size: 88, x: 16, y: 6 }],
        props: [{ illu: 'star', color: STAR, size: 40, x: 52, y: 68, anim: 'sniff', say: 'Sniff.' }],
        bubble: { tail: 'left', text: 'Don’t cry! I will take you home!', say: 'Don’t cry! I will take you home!' } },
    ],
  },
  p3: {
    layout: 'hero', dot: 2, next: 'p4',
    panels: [
      { bg: DAY, ground: GGRASS, caption: 'Up, up, up the big hill!',
        cast: [{ state: 'point', size: 92, x: 18, y: 8 }],
        props: [{ illu: 'sun', size: 50, x: 78, y: 8, anim: 'spin-slow', say: 'Good morning!' },
          { illu: 'star', color: STAR, size: 42, x: 46, y: 50, anim: 'bobble', say: 'Almost there!' }],
        burst: { text: 'UP!', color: '#1cb0f6', x: 66, y: 40 } },
    ],
  },
  p4: {
    layout: 'duo', dot: 3, next: 'p5',
    panels: [
      { bg: ['#4ec0f0', '#e1f5fe'], ground: '#81d4fa', caption: 'A puffy cloud gave them a ride!',
        props: [{ illu: 'cloud', size: 132, x: 18, y: 52, anim: 'wob', say: 'Whoosh!' },
          { illu: 'star', color: STAR, size: 38, x: 52, y: 50, anim: 'bobble', say: 'Wheee!' }],
        cast: [{ state: 'cheer', size: 74, x: 30, y: 38, anim: 'fly' }],
        burst: { text: 'WHOOSH!', color: '#a560e8', x: 64, y: 8 } },
      { bg: ['#7986cb', '#c5cae9'], ground: '#5c6bc0', caption: 'They walked on the rainbow road.',
        props: [{ illu: 'rainbow', wide: 86, x: 7, y: 4, say: 'A rainbow road!' },
          { illu: 'star', color: STAR, size: 36, x: 80, y: 12, anim: 'bobble' }],
        cast: [{ state: 'point', size: 74, x: 34, y: 8 }] },
    ],
  },
  p5: {
    layout: 'hero', dot: 4, end: true,
    panels: [
      { bg: NIGHT, ground: NGROUND, caption: 'The little star was home. The end!',
        cast: [{ state: 'cheer', size: 96, x: 14, y: 8 }],
        props: [{ illu: 'star', color: STAR, size: 56, x: 48, y: 16, anim: 'twinkle', say: 'Home sweet home!' },
          { illu: 'star', color: '#fff3b0', size: 28, x: 28, y: 10, anim: 'twinkle' },
          { illu: 'star', color: '#fff3b0', size: 24, x: 68, y: 10, anim: 'twinkle' }],
        burst: { text: 'HOORAY!', color: '#58cc02', x: 66, y: 54 },
        bubble: { tail: 'right', who: 'right', text: 'Thank you, Pip!', say: 'Thank you, Pip!' } },
    ],
  },
};

/* ---------- "Pip's Big Day Out" — choices comic ---------- */
export const DAY_OUT = {
  start: {
    layout: 'hero', dot: 0,
    panels: [
      { bg: LAKE, ground: WATER, caption: 'Pip wants to visit Granny Owl. She lives across the big lake.',
        cast: [{ state: 'point', size: 92, x: 12, y: 10 }],
        props: [{ illu: 'sun', size: 48, x: 80, y: 8, anim: 'spin-slow' }, { illu: 'fish', size: 44, x: 60, y: 58, anim: 'bobble', say: 'Blub blub!' }],
        bubble: { tail: 'left', text: 'How should I go?', say: 'How should I go?' } },
    ],
    choices: [{ label: 'Sail the boat', icon: 'boat', next: 'boat' }, { label: 'Fly the balloon', icon: 'balloon', next: 'balloon' }],
  },
  boat: {
    layout: 'hero', dot: 1, next: 'arrive',
    panels: [
      { bg: LAKE, ground: WATER, caption: 'A friendly fish pushed the little boat.',
        props: [{ illu: 'boat', size: 128, x: 24, b: 10, anim: 'bobble', say: 'Toot toot!' },
          { illu: 'fish', size: 46, x: 72, b: 18, anim: 'bobble', say: 'Full speed ahead!' }],
        cast: [{ state: 'cheer', size: 58, x: 30, y: 18 }],
        burst: { text: 'SPLASH!', color: '#1cb0f6', x: 70, y: 14 },
        bubble: { tail: 'left', text: 'Wheee!', say: 'Wheee!' } },
    ],
  },
  balloon: {
    layout: 'hero', dot: 1, next: 'arrive',
    panels: [
      { bg: ['#4ec0f0', '#e1f5fe'], ground: '#81d4fa', caption: 'Pip floated up, up, over the clouds.',
        props: [{ illu: 'balloon', wide: 24, x: 22, b: 36, anim: 'bobble', say: 'Up we go!' },
          { illu: 'cloud', size: 52, x: 8, b: 16, anim: 'wob', say: 'So soft!' }, { illu: 'parrot', size: 44, x: 74, y: 24, anim: 'bobble', say: 'Tweet tweet! This way!' }],
        cast: [{ state: 'cheer', size: 46, x: 30, y: 38 }],
        burst: { text: 'UP UP!', color: '#a560e8', x: 66, y: 64 },
        bubble: { tail: 'left', text: 'I can fly!', say: 'I can fly!' } },
    ],
  },
  arrive: {
    layout: 'duo', dot: 2, next: 'tea',
    panels: [
      { bg: DAY, ground: GRASS, caption: 'Granny Owl was waiting in her tree.',
        cast: [{ concept: 'owl', state: 'idle', size: 84, x: 52, y: 8, flip: true }],
        props: [{ illu: 'tree', wide: 56, x: 34, b: 1, say: 'Her cozy tree!' }, { illu: 'sun', size: 42, x: 8, y: 8, anim: 'spin-slow' }] },
      { bg: DAY, ground: GRASS,
        cast: [{ state: 'cheer', size: 76, x: 10, y: 6 }, { concept: 'owl', state: 'cheer', size: 84, x: 56, y: 6, flip: true }],
        burst: { text: 'HUG!', color: '#ff4b4b', x: 8, y: 8 },
        bubble: { tail: 'right', who: 'right', text: 'Hello, little Pip!', say: 'Hello, little Pip!' } },
    ],
  },
  tea: {
    layout: 'hero', dot: 3,
    panels: [
      { bg: DAY, ground: GRASS, caption: 'Snack time!',
        cast: [{ state: 'idle', size: 80, x: 14, y: 8 }, { concept: 'owl', state: 'idle', size: 90, x: 60, y: 8, flip: true }],
        bubble: { tail: 'left', text: 'What should we eat?', say: 'What should we eat?' } },
    ],
    choices: [{ label: 'Crunchy apples', icon: 'apple', next: 'endA' }, { label: 'Sweet bananas', icon: 'banana', next: 'endB' }],
  },
  endA: {
    layout: 'hero', dot: 4, end: true,
    panels: [
      { bg: DUSK, ground: DGROUND, caption: 'They ate crunchy apples under the stars. The end!',
        cast: [{ state: 'cheer', size: 80, x: 12, y: 8 }, { concept: 'owl', state: 'cheer', size: 88, x: 60, y: 8, flip: true }],
        props: [{ illu: 'apple', size: 48, x: 42, b: 10, anim: 'bobble', say: 'Crunch crunch!' },
          { illu: 'star', color: STAR, size: 24, x: 26, y: 10, anim: 'twinkle' }, { illu: 'star', color: STAR, size: 20, x: 72, y: 8, anim: 'twinkle' }],
        burst: { text: 'YUM!', color: '#58cc02', x: 66, y: 28 } },
    ],
  },
  endB: {
    layout: 'hero', dot: 4, end: true,
    panels: [
      { bg: DUSK, ground: DGROUND, caption: 'They ate sweet bananas under the stars. The end!',
        cast: [{ state: 'cheer', size: 80, x: 12, y: 8 }, { concept: 'owl', state: 'cheer', size: 88, x: 60, y: 8, flip: true }],
        props: [{ illu: 'banana', size: 48, x: 42, b: 10, anim: 'bobble', say: 'Yum yum!' },
          { illu: 'star', color: STAR, size: 24, x: 26, y: 10, anim: 'twinkle' }, { illu: 'star', color: STAR, size: 20, x: 72, y: 8, anim: 'twinkle' }],
        burst: { text: 'YUM!', color: '#58cc02', x: 66, y: 28 } },
    ],
  },
};

/* ---------- "Rainbow Mountain" — challenge comic ---------- */
export const QUEST = {
  q1: {
    layout: 'hero', dot: 0, next: 'q2',
    panels: [
      { bg: DAY, ground: GRASS, caption: 'Pip went to find the treasure on Rainbow Mountain.',
        cast: [{ state: 'point', size: 78, x: 6, y: 8 }],
        props: [{ illu: 'mountain', wide: 54, x: 23, b: 1, say: 'Rainbow Mountain!' },
          { illu: 'rainbow', wide: 64, x: 18, y: 8, say: 'A rainbow!' },
          { illu: 'sun', size: 42, x: 85, y: 5, anim: 'spin-slow' }],
        burst: { text: 'GO!', color: '#ff9600', x: 74, y: 60 } },
    ],
  },
  q2: {
    layout: 'hero', dot: 1, next: 'q3', challenge: 'stones',
    panels: [
      { bg: LAKE, ground: WATER, caption: 'A river! Help Pip cross on the counting stones.',
        cast: [{ state: 'encourage', size: 66, x: 2, y: 8 }],
        props: [{ illu: 'stone', size: 46, x: 18, b: 22 }, { illu: 'stone', size: 46, x: 34, b: 27 },
          { illu: 'stone', size: 46, x: 50, b: 24 }, { illu: 'stone', size: 46, x: 66, b: 29 },
          { illu: 'stone', size: 46, x: 82, b: 25 },
          { illu: 'fish', size: 38, x: 80, y: 46, anim: 'bobble', say: 'You can do it!' }] },
    ],
  },
  q3: {
    layout: 'hero', dot: 2, next: 'q4', challenge: 'bridge',
    panels: [
      { bg: DAY, ground: GRASS, caption: 'The wobbly bridge lost its rainbow colors!',
        cast: [{ state: 'encourage', size: 70, x: 4, y: 8 }],
        props: [{ illu: 'bridge', wide: 64, x: 28, b: 2, say: 'The wobbly bridge!' }, { illu: 'cloud', size: 46, x: 8, y: 10, anim: 'drift' }],
        burst: { text: 'OH NO!', color: '#ff4b4b', x: 66, y: 16 } },
    ],
  },
  q4: {
    layout: 'hero', dot: 3, next: 'q5', challenge: 'chest',
    panels: [
      { bg: DUSK, ground: DGROUND, caption: 'At the top… the treasure box was waiting!',
        cast: [{ state: 'cheer', size: 76, x: 8, y: 8 }],
        props: [{ illu: 'chest', size: 104, x: 40, b: 4, say: 'Treasure!' },
          { illu: 'star', color: STAR, size: 26, x: 22, y: 10, anim: 'twinkle' }, { illu: 'star', color: STAR, size: 22, x: 84, y: 8, anim: 'twinkle' }] },
    ],
  },
  q5: {
    layout: 'hero', dot: 4, end: true,
    panels: [
      { bg: DUSK, ground: DGROUND, caption: 'Stickers and stars for brave Pip! The end!',
        cast: [{ state: 'cheer', size: 96, x: 14, y: 8 }],
        props: [{ illu: 'star', color: STAR, size: 52, x: 44, y: 34, anim: 'twinkle', say: 'Shiny!' },
          { illu: 'star', color: '#fff3b0', size: 30, x: 64, y: 20, anim: 'twinkle' }, { illu: 'star', color: '#fff3b0', size: 26, x: 26, y: 18, anim: 'twinkle' }],
        burst: { text: 'WOW!', color: '#a560e8', x: 66, y: 54 },
        bubble: { tail: 'left', text: 'What an adventure!', say: 'What an adventure!' } },
    ],
  },
};

/* ---------- "Pip's Super Day" — hero comic ---------- */
export const SUPER_DAY = {
  s1: {
    layout: 'duo', dot: 0, next: 's2',
    panels: [
      { bg: SKY, ground: GRASS, caption: 'A cozy morning.',
        cast: [{ state: 'sleep', size: 80, x: 28, y: 6 }],
        props: [{ illu: 'sun', size: 44, x: 70, y: 10, anim: 'spin-slow', say: 'Wake up, Pip!' }],
        bubble: { tail: 'left', text: 'Zzz… so cozy!', say: 'Zzz. So cozy!' } },
      { bg: SKY, ground: GRASS,
        cast: [{ state: 'cheer', size: 70, x: 6, y: 8 }],
        props: [{ illu: 'tree', wide: 50, x: 44, b: 1, say: 'The tall tree!' },
          { illu: 'banana', size: 38, x: 64, y: 16, anim: 'wiggle', say: 'My banana!' },
          { illu: 'parrot', size: 44, x: 40, y: 12, anim: 'bobble' }],
        bubble: { tail: 'right', who: 'right', text: 'HELP! My banana is stuck in the tree!', say: 'Help! My banana is stuck in the tree!' },
        burst: { text: 'GASP!', color: '#ffc83d', x: 6, y: 60 } },
    ],
  },
  s2: {
    layout: 'hero', dot: 1, next: 's3',
    panels: [
      { bg: PINK, ground: PGROUND, caption: 'Pip became… SUPER PIP!',
        cast: [{ state: 'point', size: 98, x: 14, y: 8 }],
        props: [{ illu: 'banana', size: 50, x: 74, y: 12, anim: 'wiggle', say: 'Help me down!' }, { illu: 'cloud', size: 44, x: 46, y: 6, anim: 'drift' }],
        bubble: { tail: 'left', text: 'Super Pip to the rescue!', say: 'Super Pip to the rescue!' },
        burst: { text: 'ZOOM!', color: '#1cb0f6', x: 62, y: 54 } },
    ],
  },
  s3: {
    layout: 'duo', dot: 2, next: 's4',
    panels: [
      { bg: ['#7986cb', '#c5cae9'], ground: '#5c6bc0', caption: 'Pip flew up high!',
        cast: [{ state: 'cheer', size: 84, x: 34, y: 24, anim: 'fly' }],
        props: [{ illu: 'banana', size: 46, x: 64, y: 12 }],
        burst: { text: 'POP!', color: '#ff4b4b', x: 8, y: 10 },
        bubble: { type: 'thought', tail: 'left', text: 'Almost… got it!', say: 'Almost. Got it!' } },
      { bg: SKY, ground: GRASS,
        cast: [{ state: 'cheer', size: 78, x: 16, y: 6 }],
        props: [{ illu: 'parrot', size: 48, x: 60, y: 12, anim: 'bobble' }, { illu: 'banana', size: 38, x: 74, y: 42 }],
        bubble: { tail: 'right', who: 'right', text: 'My hero! Thank you!', say: 'My hero! Thank you, Super Pip!' },
        burst: { text: 'HOORAY!', color: '#58cc02', x: 4, y: 54 } },
    ],
  },
  s4: {
    layout: 'hero', dot: 3, end: true,
    panels: [
      { bg: NIGHT, ground: NGROUND, caption: 'Being a hero is sleepy work. The end!',
        cast: [{ state: 'sleep', size: 92, x: 28, y: 8 }, { concept: 'owl', state: 'idle', size: 64, x: 64, y: 10, flip: true }],
        props: [{ illu: 'star', color: '#ffe066', size: 26, x: 16, y: 12, anim: 'twinkle' }, { illu: 'star', color: '#ffe066', size: 20, x: 84, y: 8, anim: 'twinkle' }],
        burst: { text: 'Zzz…', color: '#a560e8', x: 70, y: 52 } },
    ],
  },
};
