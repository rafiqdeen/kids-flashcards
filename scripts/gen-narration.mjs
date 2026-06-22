// gen-narration.mjs — one-time (re-runnable) build step. Pre-generates the
// app's core narration as audio using a macOS `say` voice (female Indian
// "Isha (Enhanced)" by default — Chrome won't expose it to the live Web Speech
// API, but we CAN use it offline to bake audio), bundling realistic female-Indian
// playback while keeping the app fully offline. Lines not generated here fall
// back to the live Web Speech voice at runtime (see hooks/useSpeech.js).
//
//   node scripts/gen-narration.mjs                    # default "Isha (Enhanced)"
//   node scripts/gen-narration.mjs "Tara (Premium)"   # any installed voice
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CARDS } from '../src/adventure/data/cards.js';
import { CATEGORIES } from '../src/adventure/data/categories.js';
import { narrationKey } from '../src/adventure/data/narrationKey.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public/narration');
const VOICE = process.argv[2] || 'Isha (Enhanced)';
const RATE = 150;   // words-per-minute — kid-friendly, unhurried
const PAUSE = 450;  // ms of silence inserted at each sentence break (a beat after the headword)
// `say` reads "Deer. The deer says bleat." with no pause; insert [[slnc]] after
// every sentence-ender that is followed by more text. Only affects the audio —
// the manifest is still keyed by the clean phrase.
const withPauses = (text) => text.replace(/([.!?])\s+(?=\S)/g, `$1 [[slnc ${PAUSE}]] `);
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// ---- the core narration set (high-value, low-cardinality lines) ----
const cards = Object.values(CARDS).flat();
const phrases = new Set();
const add = (s) => { const k = narrationKey(s); if (k) phrases.add(k); };

cards.forEach((c) => { if (c.phrase) add(c.phrase); });          // flip + speaker-button line
cards.forEach((c) => { if (c.word) add(`Find the ${c.word}!`); }); // primary quiz prompt
CATEGORIES.forEach((c) => { add(`Let's learn ${c.name}!`); add(`${c.name} quiz! Ready?`); });
// fixed, non-interpolated lines spoken across the core flow
[
  'Play time!', 'Treasure time!', 'Learned!', 'Yes!', 'Story time!', 'To the map!',
  'Treasure! You found a sticker!', 'All lands are open!',
  'All fresh! Let’s start a new adventure!', "Hi! I'm Pip. Let's go on an adventure!",
  'Welcome to Story Land! Pick a comic book!',
].forEach(add);
// ---- Play games: fixed (wordless) feedback/instruction lines + finite per-game
// combos. Per-word game PROMPTS reuse the baked `Find the {word}!` clips above
// (the games speak that for the target), so they need no new per-word clips. ----
[
  'A match!', 'All aboard! Choo choo!', 'Almost! Try another spot!', 'Build a big tower! Tap the drop button!',
  'Click! Perfect!', 'Dance party!', 'Empty! Try another box!', 'Hmm, try another shadow!',
  'Keep peeking! Unfold more!', 'Nobody here! Try another door!', 'Perfect fit!', 'Pop! Yes!', 'Pop!',
  'Round two! New shadows!', 'Tap a colour, then tap the monster who loves it!', 'Tap a friend, then tap its shadow!',
  'Tap tap!', 'Tap the eggs to hatch your friends!', 'Unfold the magic paper! What is hiding inside?',
  'Welcome to the calm corner. Breathe with the flower.', 'You found them all!', 'Your turn!',
  "It's cracking!", "Oops! Listen again!", 'Watch closely!',
  // Feed the Monsters (3 fixed colours)
  'Red', 'Yellow', 'Blue', 'Yum! Red!', 'Yum! Yellow!', 'Yum! Blue!',
  'No no — I only eat red!', 'No no — I only eat yellow!', 'No no — I only eat blue!',
].forEach(add);
// Tracing: the finite glyph "say" lines and their two prompt forms
['C!', 'Big letter L!', 'V!', 'One!', 'Three!', 'Seven!', 'A circle!', 'A square!', 'Zig zag!', 'A wavy wave!', 'Up the hill and down!']
  .forEach((s) => { add(s); add(`Tap the glowing dot to trace it! ${s}`); add(`Now this one! ${s}`); add(`${s} Wonderful!`); });
// game labels — spoken when a game opens (ActivityHub.open -> speak(`${label}!`))
[
  'Bubble Pop', 'Memory Match', 'Tracing', 'Feed the Monsters', 'Counting Train', 'Shadow Puzzle',
  'Pip Says', 'Calm Corner', 'Peek-a-Boo', 'Magic Cube', 'Picture Pieces', 'Egg Surprise',
  'Mystery Boxes', 'Prize Wheel', 'Magic Doors', 'Magic Paper', 'Block Stacker', 'Tunnel Runner',
  'Card Fountain', 'Balloon Float', 'Paint Studio',
].forEach((s) => add(`${s}!`));

const list = [...phrases];
console.log(`voice: "${VOICE}"  |  generating ${list.length} clips → public/narration/`);

// say -> aiff -> afconvert -> m4a (aac, ~32kbps mono-ish: tiny, fine for speech)
const manifest = {};
let i = 0, failed = 0;
for (const key of list) {
  const id = String(++i).padStart(4, '0');
  const aiff = path.join(OUT, `${id}.aiff`);
  const m4a = path.join(OUT, `${id}.m4a`);
  try {
    execFileSync('say', ['-v', VOICE, '-r', String(RATE), '-o', aiff, withPauses(key)]);
    execFileSync('afconvert', [aiff, m4a, '-f', 'm4af', '-d', 'aac', '-b', '32000']);
    fs.rmSync(aiff, { force: true });
    manifest[key] = `/narration/${id}.m4a`;
  } catch (e) {
    failed++; fs.rmSync(aiff, { force: true });
    console.warn(`  ✗ ${id} "${key.slice(0, 30)}" — ${e.message.split('\n')[0]}`);
  }
  if (i % 100 === 0) console.log(`  …${i}/${list.length}`);
}

const body = Object.entries(manifest).sort().map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join('\n');
fs.writeFileSync(path.join(ROOT, 'src/adventure/data/narrationManifest.js'),
  `// AUTO-GENERATED by scripts/gen-narration.mjs — spoken line -> bundled "${VOICE}"\n`
  + `// audio clip. Keyed by narrationKey(text). Lines absent here fall back to the\n`
  + `// live Web Speech voice at runtime. Re-run the script to regenerate.\n`
  + `export const NARRATION = {\n${body}\n};\n`);

const bytes = fs.readdirSync(OUT).filter((f) => f.endsWith('.m4a'))
  .reduce((s, f) => s + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`done: ${Object.keys(manifest).length} clips, ${failed} failed, ${(bytes / 1048576).toFixed(1)} MB total.`);
