// cards.js — full card sets per category. The Adventure prototype shipped only
// a representative SAMPLE per category (e.g. 6 of 46 animals); those bespoke
// <Illu>-drawn samples lead each deck, then the full legacy datasets (src/data/*)
// are appended as emoji cards (deduped) so each Learn deck carries its real
// count. front.kind: 'mega' | 'illu' | 'swatch' | 'shape' | 'emoji'.
import { alphabet } from '../../data/alphabet.js';
import { numbers } from '../../data/numbers.js';
import { animals } from '../../data/animals.js';
import { fruits } from '../../data/fruits.js';
import { vegetables } from '../../data/vegetables.js';
import { birds } from '../../data/birds.js';
import { colors as legacyColors } from '../../data/colorsShapes.js';
import { shapes as legacyShapes } from '../../data/shapes.js';
import { vehicles } from '../../data/vehicles.js';
import { bodyParts } from '../../data/bodyParts.js';
import { weather } from '../../data/weather.js';
import { emotions } from '../../data/emotions.js';

// the prototype's hand-drawn sample cards — kept as the lead of each deck.
// `emoji` upgrades the face to the matching Fluent 3D asset where one exists
// (art/cardArt.jsx prefers it; the drawn <Illu> stays only as a fallback).
const SAMPLES = {
  animals: [
    { id:'cat', front:{kind:'illu', name:'cat'}, emoji:'🐱', word:'Cat', badge:{label:'Says “Meow”', icon:'sound'}, phrase:'Cat. The cat says meow.' },
    { id:'dog', front:{kind:'illu', name:'dog'}, emoji:'🐶', word:'Dog', badge:{label:'Says “Woof”', icon:'sound'}, phrase:'Dog. The dog says woof.' },
    { id:'lion', front:{kind:'illu', name:'lion'}, emoji:'🦁', word:'Lion', badge:{label:'Says “Roar”', icon:'sound'}, phrase:'Lion. The lion says roar.' },
    { id:'elephant', front:{kind:'illu', name:'elephant'}, emoji:'🐘', word:'Elephant', badge:{label:'Lives: savanna', icon:'home'}, phrase:'Elephant.' },
    { id:'frog', front:{kind:'illu', name:'frog'}, emoji:'🐸', word:'Frog', badge:{label:'Says “Ribbit”', icon:'sound'}, phrase:'Frog. The frog says ribbit.' },
    { id:'fish', front:{kind:'illu', name:'fish'}, emoji:'🐟', word:'Fish', badge:{label:'Lives: water', icon:'home'}, phrase:'Fish.' },
  ],
  alphabet: [
    { id:'a', front:{kind:'mega', text:'A'}, word:'Apple', badge:{label:'A is for Apple', icon:'tag'}, illu:'apple', phrase:'A is for Apple.' },
    { id:'b', front:{kind:'mega', text:'B'}, word:'Bee', badge:{label:'B is for Bee', icon:'tag'}, illu:'bee', phrase:'B is for Bee.' },
    { id:'c', front:{kind:'mega', text:'C'}, word:'Cat', badge:{label:'C is for Cat', icon:'tag'}, illu:'cat', phrase:'C is for Cat.' },
    { id:'d', front:{kind:'mega', text:'D'}, word:'Dog', badge:{label:'D is for Dog', icon:'tag'}, illu:'dog', phrase:'D is for Dog.' },
  ],
  fruits: [
    { id:'apple', front:{kind:'illu', name:'apple'}, emoji:'🍎', word:'Apple', badge:{label:'Crunchy & red', icon:'tag'}, phrase:'Apple.' },
    { id:'banana', front:{kind:'illu', name:'banana'}, emoji:'🍌', word:'Banana', badge:{label:'Soft & yellow', icon:'tag'}, phrase:'Banana.' },
  ],
  vegetables: [
    { id:'carrot', front:{kind:'illu', name:'carrot'}, emoji:'🥕', word:'Carrot', badge:{label:'Orange & crunchy', icon:'tag'}, phrase:'Carrot.' },
    { id:'broccoli', front:{kind:'illu', name:'broccoli'}, emoji:'🥦', word:'Broccoli', badge:{label:'Little green trees', icon:'tag'}, phrase:'Broccoli.' },
    { id:'tomato', front:{kind:'illu', name:'tomato'}, emoji:'🍅', word:'Tomato', badge:{label:'Red & juicy', icon:'tag'}, phrase:'Tomato.' },
    { id:'corn', front:{kind:'illu', name:'corn'}, emoji:'🌽', word:'Corn', badge:{label:'Pop pop!', icon:'tag'}, phrase:'Corn.' },
    { id:'potato', front:{kind:'illu', name:'potato'}, emoji:'🥔', word:'Potato', badge:{label:'Grows underground', icon:'tag'}, phrase:'Potato.' },
  ],
  colors: [
    { id:'red', front:{kind:'swatch', hex:'#ef4444'}, word:'Red', badge:{label:'Like an apple', icon:'tag'}, phrase:'Red.' },
    { id:'blue', front:{kind:'swatch', hex:'#3b82f6'}, word:'Blue', badge:{label:'Like the sky', icon:'tag'}, phrase:'Blue.' },
    { id:'green', front:{kind:'swatch', hex:'#22c55e'}, word:'Green', badge:{label:'Like the grass', icon:'tag'}, phrase:'Green.' },
  ],
  shapes: [
    { id:'circle', front:{kind:'shape', name:'circle'}, word:'Circle', badge:{label:'No corners', icon:'info'}, phrase:'Circle.' },
    { id:'square', front:{kind:'shape', name:'square'}, word:'Square', badge:{label:'4 sides', icon:'info'}, phrase:'Square.' },
    { id:'triangle', front:{kind:'shape', name:'triangle'}, word:'Triangle', badge:{label:'3 sides', icon:'info'}, phrase:'Triangle.' },
    { id:'star', front:{kind:'shape', name:'star'}, word:'Star', badge:{label:'5 points', icon:'info'}, phrase:'Star.' },
  ],
  numbers: [
    { id:'1', front:{kind:'mega', text:'1'}, word:'One', badge:{label:'1 apple', icon:'tag'}, dots:1, phrase:'One.' },
    { id:'2', front:{kind:'mega', text:'2'}, word:'Two', badge:{label:'2 apples', icon:'tag'}, dots:2, phrase:'Two.' },
    { id:'3', front:{kind:'mega', text:'3'}, word:'Three', badge:{label:'3 apples', icon:'tag'}, dots:3, phrase:'Three.' },
  ],
  weather: [
    { id:'sun', front:{kind:'illu', name:'sun'}, emoji:'☀️', word:'Sunny', badge:{label:'Warm & bright', icon:'info'}, phrase:'Sunny.' },
    { id:'cloud', front:{kind:'illu', name:'cloud'}, emoji:'☁️', word:'Cloudy', badge:{label:'Grey sky', icon:'info'}, phrase:'Cloudy.' },
    { id:'rain', front:{kind:'illu', name:'rain'}, emoji:'🌧️', word:'Rainy', badge:{label:'Drip drop!', icon:'info'}, phrase:'Rainy. Drip drop.' },
    { id:'snow', front:{kind:'illu', name:'snow'}, emoji:'❄️', word:'Snowy', badge:{label:'Cold & white', icon:'info'}, phrase:'Snowy.' },
    { id:'rainbow', front:{kind:'illu', name:'rainbow'}, emoji:'🌈', word:'Rainbow', badge:{label:'After rain', icon:'info'}, phrase:'Rainbow.' },
  ],
  emotions: [
    { id:'happy', front:{kind:'illu', name:'happy'}, emoji:'😊', word:'Happy', badge:{label:'I feel good!', icon:'info'}, phrase:'Happy.' },
    { id:'sad', front:{kind:'illu', name:'sad'}, emoji:'😢', word:'Sad', badge:{label:'It’s okay to cry', icon:'info'}, phrase:'Sad.' },
    { id:'angry', front:{kind:'illu', name:'angry'}, emoji:'😠', word:'Angry', badge:{label:'Take a big breath', icon:'info'}, phrase:'Angry. Take a big breath.' },
    { id:'surprised', front:{kind:'illu', name:'surprised'}, emoji:'😮', word:'Surprised', badge:{label:'Oh wow!', icon:'info'}, phrase:'Surprised. Oh wow!' },
  ],
  vehicles: [
    { id:'car', front:{kind:'illu', name:'car'}, emoji:'🚗', word:'Car', badge:{label:'Says “Vroom”', icon:'sound'}, phrase:'Car. Vroom.' },
    { id:'bus', front:{kind:'illu', name:'bus'}, emoji:'🚌', word:'Bus', badge:{label:'Says “Beep”', icon:'sound'}, phrase:'Bus. Beep beep.' },
    { id:'train', front:{kind:'illu', name:'train'}, emoji:'🚂', word:'Train', badge:{label:'Choo choo!', icon:'sound'}, phrase:'Train. Choo choo.' },
    { id:'boat', front:{kind:'illu', name:'boat'}, emoji:'⛵', word:'Boat', badge:{label:'Sails the sea', icon:'info'}, phrase:'Boat.' },
  ],
  birds: [
    { id:'parrot', front:{kind:'illu', name:'parrot'}, emoji:'🦜', word:'Parrot', badge:{label:'Can talk!', icon:'sound'}, phrase:'Parrot.' },
    { id:'owl', front:{kind:'illu', name:'owlbird'}, emoji:'🦉', word:'Owl', badge:{label:'Says “Hoo hoo”', icon:'sound'}, phrase:'Owl. Hoo hoo.' },
    { id:'duck', front:{kind:'illu', name:'duck'}, emoji:'🦆', word:'Duck', badge:{label:'Says “Quack”', icon:'sound'}, phrase:'Duck. Quack quack.' },
    { id:'penguin', front:{kind:'illu', name:'penguin'}, emoji:'🐧', word:'Penguin', badge:{label:'Loves the cold', icon:'info'}, phrase:'Penguin.' },
  ],
  body: [
    { id:'hand', front:{kind:'illu', name:'hand'}, emoji:'✋', word:'Hand', badge:{label:'I can wave', icon:'info'}, phrase:'Hand.' },
    { id:'eye', front:{kind:'illu', name:'eye'}, emoji:'👁️', word:'Eye', badge:{label:'I can see', icon:'info'}, phrase:'Eye. I can see.' },
    { id:'foot', front:{kind:'illu', name:'foot'}, emoji:'🦶', word:'Foot', badge:{label:'I can stomp', icon:'info'}, phrase:'Foot. Stomp stomp.' },
    { id:'face', front:{kind:'illu', name:'happy'}, emoji:'😀', word:'Face', badge:{label:'I can smile', icon:'info'}, phrase:'Face. I can smile.' },
  ],
  ocean: [
    { id:'fish', front:{kind:'illu', name:'fish'}, emoji:'🐟', word:'Fish', badge:{label:'Blub blub', icon:'sound'}, phrase:'Fish. Blub blub.' },
    { id:'whale', front:{kind:'illu', name:'whale'}, emoji:'🐳', word:'Whale', badge:{label:'So big!', icon:'info'}, phrase:'Whale. So big!' },
    { id:'octopus', front:{kind:'illu', name:'octopus'}, emoji:'🐙', word:'Octopus', badge:{label:'8 arms!', icon:'info'}, phrase:'Octopus. Eight arms!' },
    { id:'crab', front:{kind:'illu', name:'crab'}, emoji:'🦀', word:'Crab', badge:{label:'Walks sideways', icon:'info'}, phrase:'Crab.' },
    { id:'turtle', front:{kind:'illu', name:'turtle'}, emoji:'🐢', word:'Turtle', badge:{label:'Slow & steady', icon:'info'}, phrase:'Turtle.' },
  ],
  dinos: [
    { id:'trex', front:{kind:'illu', name:'trex'}, emoji:'🦖', word:'T-Rex', badge:{label:'Says “ROAR”', icon:'sound'}, phrase:'T Rex. Roar!' },
    { id:'stego', front:{kind:'illu', name:'stego'}, emoji:'🦕', word:'Stegosaurus', badge:{label:'Spiky back', icon:'info'}, phrase:'Stegosaurus.' },
    { id:'longneck', front:{kind:'illu', name:'longneck'}, emoji:'🦕', word:'Longneck', badge:{label:'Eats tree tops', icon:'info'}, phrase:'Longneck dinosaur.' },
    { id:'dinoegg', front:{kind:'illu', name:'dinoegg'}, emoji:'🥚', word:'Dino Egg', badge:{label:'Who’s inside?', icon:'info'}, phrase:'Dino egg.' },
  ],
  space: [
    { id:'rocket', front:{kind:'illu', name:'rocketship'}, emoji:'🚀', word:'Rocket', badge:{label:'3, 2, 1… blast off!', icon:'sound'}, phrase:'Rocket. Blast off!' },
    { id:'planet', front:{kind:'illu', name:'planet'}, emoji:'🪐', word:'Planet', badge:{label:'Has rings!', icon:'info'}, phrase:'Planet.' },
    { id:'moonc', front:{kind:'illu', name:'moon'}, emoji:'🌙', word:'Moon', badge:{label:'Glows at night', icon:'info'}, phrase:'Moon.' },
    { id:'star', front:{kind:'illu', name:'star'}, emoji:'⭐', word:'Star', badge:{label:'Twinkle twinkle', icon:'info'}, phrase:'Star. Twinkle twinkle.' },
  ],
  music: [
    { id:'drum', front:{kind:'illu', name:'drum'}, emoji:'🥁', word:'Drum', badge:{label:'Boom boom!', icon:'sound'}, phrase:'Drum. Boom boom.' },
    { id:'guitar', front:{kind:'illu', name:'guitar'}, emoji:'🎸', word:'Guitar', badge:{label:'Strum strum', icon:'sound'}, phrase:'Guitar.' },
    { id:'trumpet', front:{kind:'illu', name:'trumpet'}, emoji:'🎺', word:'Trumpet', badge:{label:'Toot toot!', icon:'sound'}, phrase:'Trumpet. Toot toot.' },
    { id:'bell', front:{kind:'illu', name:'bell'}, emoji:'🔔', word:'Bell', badge:{label:'Ding dong!', icon:'sound'}, phrase:'Bell. Ding dong.' },
  ],
  clothes: [
    { id:'shirt', front:{kind:'illu', name:'shirt'}, emoji:'👕', word:'Shirt', badge:{label:'Arms go in!', icon:'info'}, phrase:'Shirt.' },
    { id:'hat', front:{kind:'illu', name:'hat'}, emoji:'🎩', word:'Hat', badge:{label:'On my head', icon:'info'}, phrase:'Hat.' },
    { id:'shoes', front:{kind:'illu', name:'shoes'}, emoji:'👟', word:'Shoes', badge:{label:'For my feet', icon:'info'}, phrase:'Shoes.' },
    { id:'socks', front:{kind:'illu', name:'socks'}, emoji:'🧦', word:'Socks', badge:{label:'Warm toes!', icon:'info'}, phrase:'Socks.' },
  ],
  home: [
    { id:'bed', front:{kind:'illu', name:'bed'}, emoji:'🛏️', word:'Bed', badge:{label:'Sleep tight', icon:'info'}, phrase:'Bed. Sleep tight.' },
    { id:'chair', front:{kind:'illu', name:'chair'}, emoji:'🪑', word:'Chair', badge:{label:'Take a seat', icon:'info'}, phrase:'Chair.' },
    { id:'lamp', front:{kind:'illu', name:'lamp'}, emoji:'💡', word:'Lamp', badge:{label:'Lights on!', icon:'info'}, phrase:'Lamp.' },
    { id:'cup', front:{kind:'illu', name:'cup'}, emoji:'🥤', word:'Cup', badge:{label:'Gulp gulp', icon:'info'}, phrase:'Cup.' },
  ],
  foods: [
    { id:'pizza', front:{kind:'illu', name:'pizza'}, emoji:'🍕', word:'Pizza', badge:{label:'Cheesy slice', icon:'info'}, phrase:'Pizza.' },
    { id:'bread', front:{kind:'illu', name:'bread'}, emoji:'🍞', word:'Bread', badge:{label:'Fresh & warm', icon:'info'}, phrase:'Bread.' },
    { id:'cake', front:{kind:'illu', name:'cake'}, emoji:'🎂', word:'Cake', badge:{label:'Happy birthday!', icon:'info'}, phrase:'Cake. Happy birthday!' },
    { id:'milk', front:{kind:'illu', name:'milk'}, emoji:'🥛', word:'Milk', badge:{label:'Strong bones', icon:'info'}, phrase:'Milk.' },
  ],
  helpers: [
    { id:'helmet', front:{kind:'illu', name:'helmet'}, emoji:'🚒', word:'Firefighter', badge:{label:'Brave & fast', icon:'info'}, phrase:'Firefighter. Brave and fast.' },
    { id:'stetho', front:{kind:'illu', name:'stetho'}, emoji:'🩺', word:'Doctor', badge:{label:'Makes you better', icon:'info'}, phrase:'Doctor.' },
    { id:'envelope', front:{kind:'illu', name:'envelope'}, emoji:'✉️', word:'Mail Carrier', badge:{label:'Letters for you!', icon:'info'}, phrase:'Mail carrier.' },
    { id:'badge', front:{kind:'illu', name:'badge'}, emoji:'🚓', word:'Police Officer', badge:{label:'Keeps us safe', icon:'info'}, phrase:'Police officer.' },
  ],
};

/* ---- full legacy datasets, reshaped to the card contract (emoji art) ---- */
const cleanSound = (s) => (s || '').replace(/!+$/, '');
const SHAPE_SVG = new Set(['circle', 'square', 'triangle', 'star', 'heart']);
const emojiCard = (c, badge) => ({ id: c.id, front: { kind: 'emoji', char: c.emoji }, word: c.name, badge, phrase: `${c.name}.` });
const critter = (c) => ({
  id: c.id, front: { kind: 'emoji', char: c.emoji }, word: c.name,
  badge: c.sound ? { label: `Says “${cleanSound(c.sound)}”`, icon: 'sound' } : { label: `Lives: ${(c.habitat || '').toLowerCase()}`, icon: 'home' },
  phrase: c.sound ? `${c.name}. The ${c.name.toLowerCase()} says ${cleanSound(c.sound).toLowerCase()}.` : `${c.name}.`,
});

const LEGACY = {
  alphabet: alphabet.map((c) => ({ id: c.id, front: { kind: 'mega', text: c.letter, char: c.emoji }, word: c.word, badge: { label: `${c.letter} is for ${c.word}`, icon: 'tag' }, illu: 'emoji', phrase: `${c.letter} is for ${c.word}.` })),
  numbers: numbers.map((c) => ({ id: String(c.id), front: { kind: 'mega', text: String(c.number) }, word: c.word, badge: { label: c.hint, icon: 'tag' }, phrase: `${c.word}.` })),
  animals: animals.map(critter),
  fruits: fruits.map((c) => emojiCard(c, { label: c.hint, icon: 'tag' })),
  vegetables: vegetables.map((c) => emojiCard(c, { label: c.hint, icon: 'tag' })),
  birds: birds.map(critter),
  colors: legacyColors.map((c) => ({ id: c.id, front: { kind: 'swatch', hex: c.hex }, word: c.name, badge: { label: c.example, icon: 'tag' }, phrase: `${c.name}.` })),
  shapes: legacyShapes.map((c) => ({ id: c.id, front: SHAPE_SVG.has(c.id) ? { kind: 'shape', name: c.id } : { kind: 'emoji', char: c.emoji }, word: c.name, badge: { label: c.sides > 0 ? `${c.sides} sides` : c.description, icon: 'info' }, phrase: `${c.name}.` })),
  vehicles: vehicles.map((c) => emojiCard(c, c.sound ? { label: `Says “${cleanSound(c.sound)}”`, icon: 'sound' } : { label: 'On the go!', icon: 'info' })),
  body: bodyParts.map((c) => emojiCard(c, { label: c.action, icon: 'info' })),
  weather: weather.map((c) => emojiCard(c, { label: c.description, icon: 'info' })),
  emotions: emotions.map((c) => emojiCard(c, { label: c.feeling, icon: 'info' })),
};

// merge bespoke samples (lead) + legacy extras (deduped). alphabet dedupes by
// letter; everything else by word — so the drawn samples and the first-N cards
// the games/quiz pull stay exactly as before.
const keyOf = (cat, c) => (cat === 'alphabet' ? (c.front.text || '') : (c.word || '')).toLowerCase();
const merge = (cat, samples = [], extras = []) => {
  const seen = new Set(samples.map((c) => keyOf(cat, c)));
  const out = [...samples];
  for (const c of extras) { const k = keyOf(cat, c); if (k && !seen.has(k)) { seen.add(k); out.push(c); } }
  return out;
};

// A sample and a legacy card can share an `id` while having different words
// (e.g. vehicles "Boat" vs "Sailboat", weather "Sunny" vs "Sun"). Word-dedup
// keeps both, so we must guarantee unique ids — otherwise React keys collide AND
// the per-zone mastered Set (keyed by id) can never reach the deck length, which
// would make those zones impossible to complete.
const uniqueIds = (deck) => {
  const seen = new Set();
  return deck.map((c) => {
    if (!seen.has(c.id)) { seen.add(c.id); return c; }
    let n = 2; while (seen.has(`${c.id}-${n}`)) n++;
    const id = `${c.id}-${n}`; seen.add(id);
    return { ...c, id };
  });
};

export const CARDS = {};
for (const cat of Object.keys(SAMPLES)) CARDS[cat] = uniqueIds(SAMPLES[cat]);
for (const cat of Object.keys(LEGACY)) CARDS[cat] = uniqueIds(merge(cat, SAMPLES[cat], LEGACY[cat]));

// Avatars for onboarding (illustrated)
export const AVATARS = [
  { id:'cat', name:'Kitty', illu:'cat' },
  { id:'dog', name:'Puppy', illu:'dog' },
  { id:'frog', name:'Hoppy', illu:'frog' },
  { id:'fish', name:'Bubbles', illu:'fish' },
];
