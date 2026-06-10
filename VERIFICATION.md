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

Reference discrepancies found & fixed (README precedence — AA contrast,
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
