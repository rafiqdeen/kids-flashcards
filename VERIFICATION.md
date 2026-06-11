# VERIFICATION — Pip Cards redesign

Per-phase verification log. Protocol: reference screenshot vs implementation
screenshot, region-by-region; behavioral checks driven through the real UI.
Mismatches listed as `screen / state / viewport / expected vs actual`; phase is
done only when its list is empty.

## Phase 1 — Foundations (PASSED 15/15)

Automated: `node scripts/verify-phase1.mjs` against `vite preview` (build output).

| Check | Result |
|---|---|
| `data-theme` defaults to `light` on app root | ✅ |
| `data-direction` defaults to `clay` | ✅ |
| `app-root` class applied to `#root` | ✅ |
| `web` class ≥900px, `tablet` at 834px, none at 390px | ✅ |
| `--bg` resolves `#fff3e2` (light) / `#241a13` (dark) | ✅ |
| Lexend variable font loads, served from `/fonts/` (no gstatic request) | ✅ |
| Global `:focus-visible` = 4px solid `#38bdf8`, offset 3px | ✅ |
| Theme + direction persist through reload (`pip-settings`) | ✅ |
| Pop direction activates `--stroke-w: 3px` | ✅ |
| `prefers-reduced-motion` collapses transitions to ≤0.001ms | ✅ |

Notes / fixes made during verification:
- Removed legacy focus-ring overrides (`index.css`, `CategorySelector.css`,
  `QuizMode.css`) so the global ring is authoritative during migration.
- Initial focus-ring "failure" was a measurement artifact: legacy
  `button { transition: all .2s }` animates the outline in; sampled after settle.
  That legacy rule is deleted with `index.css` in Phase 3.
- Pixel comparison vs reference: not applicable in this phase (no redesigned
  screens yet); starts in Phase 2/3.

Open diffs: none.

## Phase 2 — Primitives (PASSED 23/23)

Automated: `node scripts/verify-phase2.mjs` driving the `?pip-lab` harness
(all primitives in all states); screenshots in `verification-shots/` for
clay/pop × light/dark.

| Area | Checks |
|---|---|
| Mascot | 6 concepts × 5 states render (30 svgs) ✅ |
| FlashCard | role=button div (no nested buttons, no DOM warnings), click/Space/Enter flip, speak click doesn't flip, mastered ribbon ✅ |
| Speech/captions | caption bar `role=status aria-live=polite` mirrors every announce ✅ |
| CategoryTile | fresh "{n} cards" / in-progress % ring / done 3 stars ✅ |
| QuizOption | correct+reveal disabled, wrong stays enabled, distinct ✓/✗ marks ✅ |
| ProgressTrack/StreakBadge | aria progressbar, lit only when >0 ✅ |
| SpeakButton | 84px lg per spec, wave state ✅ |
| Reduced motion | confetti → static "Nice!" banner ✅ |

## Phase 3 — Core loop: Home, Deck, shells, persistence (PASSED 40/40 + visual)

Automated: `node scripts/verify-phase3.mjs` (40 behavioral checks — shells,
deck flow, mastery, streaks, trophy, keyboard, key-help, persistence,
legacy-progress migration). Visual: `scripts/capture-phase3-visual.mjs`
captured reference (`Pip Cards v2.html`, served per-combo via rewritten
`TWEAK_DEFAULTS`) vs implementation for Home + Deck in clay/pop × light/dark ×
web/phone — 32 shots in `verification-shots/phase3/`, reviewed region by region.

| Pair reviewed | Verdict |
|---|---|
| Home clay·light·web | match (sidebar geometry, hero, tiles, foot) |
| Deck clay·light·web | match; content diffs only (46-card live dataset vs 6-card reference sample) |
| Home pop·dark·phone | match (stroke+rim tiles, bottom nav, goal float) |
| Deck pop·light·web | match (sticker outlines, offset shadows) |

Accepted diff-noise (recorded, not deviations):
- Reference device frames render `vw`-based `clamp()` type against the outer
  browser viewport, inflating hero h1 inside the 390px frame; at a real 390px
  viewport the implementation's size is the correct reading of the tokens.
- Card order/count comes from live datasets (Phase 0 decision #9); reference
  shows sample sets.
- One reference capture includes its simulated PWA toast (9s timer) — excluded
  by the do-NOT-replicate list; real `waiting`-worker toast lands in Phase 6.

Fixes made during verification:
- Ported the reference HTML's `html, body { height: 100% }` shell rule
  (missing → sidebar footer fell below the fold; webmain wasn't its own
  scroll container).
- `openCategory` now announces to the caption bar (was speak-only).

Open diffs: none.

## Reference discrepancies found & fixed in Phase 2 (README precedence — AA contrast,
tappable SpeakButton):
1. **Buttons don't inherit font/color** — reference `.cat-tile` (a `<button>`)
   renders UA-black tile names, invisible in dark theme. Added
   `button,select,input { font: inherit; color: inherit }` to app.css base.
2. **Back-face hit-testing** — Chromium culls hit-tests on backface-hidden
   planes at exactly 180°, making the back-face SpeakButton untappable in some
   environments (and iOS Safari mis-targets similarly). Fixed with 0.6px face
   Z-separation + per-face pointer-events + geometry routing in FlashCard's
   click handler. Visuals unchanged (480ms spring flip per spec).
3. **Chrome drops `onend`** — added a 500ms `speechSynthesis.speaking` watchdog
   so the SpeakButton wave state can't stick on.

Open diffs: none.
