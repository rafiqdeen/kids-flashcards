// diff.mjs — pixelmatch ref/ vs impl/ for every captured screen, write a diff
// PNG, and report the mismatched-pixel % per screen. Threshold: <= 1.0%.
//
// Usage: node visual-tests/diff.mjs [filter]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REF = path.join(__dirname, 'ref');
const IMPL = path.join(__dirname, 'impl');
const DIFF = path.join(__dirname, 'diff');
const THRESHOLD = 1.0; // percent
// Screens that intentionally diverge from the prototype per an explicit product
// decision (reported, but not counted as failures).
//  - create/picker/parent-gate: profile screens re-centered vertically (prototype
//    top-aligns them) at the user's request.
//  - learn/quiz + card-showing games: card faces now render Microsoft Fluent 3D
//    art instead of the prototype's flat <Illu>/emoji drawings (user asked for HD
//    faces on every card). The diffs are confined to the card-art region; layout
//    is unchanged (verified). The reference is the old-art prototype, so these
//    can't reach 0% — behaviour is still guarded by functional.mjs + e2e.mjs.
const DEVIATIONS = new Set([
  'create', 'picker', 'parent-gate',
  'learn', 'learn-back', 'quiz',
  // Games given the centred "play board" treatment (the `gctr` modifier) so tall/
  // wide screens no longer strand content at the edges — an intentional, approved
  // divergence from the edge-pinned prototype. Behaviour still covered by zones.mjs.
  'game-boxes', 'game-cube', 'game-fountain', 'game-jigsaw', 'game-pipsays', 'game-shadow', 'game-wheel',
  'game-memory', 'game-trace', 'game-sort', 'game-train', 'game-peek', 'game-egg', 'game-doors', 'game-unfold',
  // World map: the trail is dropped when the first node (Learn) is the current
  // one, so the "you are here" mascot clears the zone-title banner instead of
  // overlapping it (the prototype had the overlap). Whole trail shifts down.
  // The Settings + profile-sheet modals render over a dimmed-but-visible World,
  // so the shifted trail/mascot shows behind them — same intentional change.
  // (Their modal CONTENT is unchanged and still covered by e2e.mjs.)
  'world',
  'profile-sheet', 'settings-gate', 'settings-buddy', 'settings-sound',
  'settings-play', 'settings-activities', 'settings-progress',
  // Story comics: the panel ground was raised so characters stand ON it (the
  // prototype floated them), the fallen star now lands on the ground, and the
  // cloud-ride star rides with Pip — intentional fixes that diverge from the
  // old-art reference. (story-shelf has no panels and stays a real pixel test.)
  'story-book', 'story-choose', 'story-quest', 'story-comic',
  // Paint Studio: redesigned to the "Studio dock" layout (user-approved) — the
  // canvas now fills the left and all colours/tools live in a right-hand rail
  // (a bottom dock on narrow phones) so the white drawing area is far larger.
  // The prototype had a stacked top-strip + bottom-dock, so this can't reach 0%.
  // Tool/brush/stamp/size/fill/undo behaviour is fully guarded by functional.mjs.
  'paint',
]);
const devName = (f) => f.replace(/-(phone|tablet)\.png$/, '');
fs.mkdirSync(DIFF, recursive());
function recursive() { return { recursive: true }; }

const filter = process.argv[2];
const files = fs.existsSync(IMPL) ? fs.readdirSync(IMPL).filter((f) => f.endsWith('.png') && (!filter || f.includes(filter))) : [];

let worst = 0, fails = 0;
const rows = [];
for (const f of files.sort()) {
  const refPath = path.join(REF, f);
  if (!fs.existsSync(refPath)) { rows.push([f, 'NO REF', '—']); continue; }
  if (DEVIATIONS.has(devName(f))) { rows.push([f, '—', 'DEVIATION (intentional)']); continue; }
  const a = PNG.sync.read(fs.readFileSync(refPath));
  const b = PNG.sync.read(fs.readFileSync(path.join(IMPL, f)));
  const w = Math.min(a.width, b.width), h = Math.min(a.height, b.height);
  const diff = new PNG({ width: w, height: h });
  // crop both to common size if dimensions differ
  const crop = (img) => {
    if (img.width === w && img.height === h) return img;
    const out = new PNG({ width: w, height: h });
    PNG.bitblt(img, out, 0, 0, w, h, 0, 0);
    return out;
  };
  const A = crop(a), B = crop(b);
  const mismatched = pixelmatch(A.data, B.data, diff.data, w, h, { threshold: 0.1 });
  fs.writeFileSync(path.join(DIFF, f), PNG.sync.write(diff));
  const pct = (mismatched / (w * h)) * 100;
  const dimNote = (a.width !== b.width || a.height !== b.height) ? ` (dim ref ${a.width}x${a.height} vs impl ${b.width}x${b.height})` : '';
  worst = Math.max(worst, pct);
  const pass = pct <= THRESHOLD;
  if (!pass) fails++;
  rows.push([f, `${pct.toFixed(3)}%`, pass ? 'PASS' : 'FAIL', dimNote]);
}

console.log('\nscreen'.padEnd(26), 'mismatch'.padEnd(10), 'verdict');
console.log('-'.repeat(60));
for (const [f, pct, verdict, note = ''] of rows) {
  console.log(f.padEnd(26), String(pct).padEnd(10), verdict, note);
}
console.log('-'.repeat(60));
console.log(`worst: ${worst.toFixed(3)}%  threshold: ${THRESHOLD}%  fails: ${fails}/${files.length}`);
process.exit(fails > 0 ? 1 : 0);
