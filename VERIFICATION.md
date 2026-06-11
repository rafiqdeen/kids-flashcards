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

## Phase 4 — Quiz (PASSED 19/19 + visual)

Automated: `node scripts/verify-phase4.mjs` — question flow, one-attempt rule,
correct/wrong/reveal/disabled states with distinct ✓/✗ marks, 850/1500ms
advance, results (score, ≥70% "Amazing!"), mistake review (role=button row +
inner speak button), three actions, "Try again" remount, easy difficulty = 2
choices (README spec; reference prototype ignored difficulty — implemented per
README and recorded). Visual: quiz + results pairs (clay·light·web) in
`verification-shots/phase4/` — match; option-art diffs are the documented
emoji-disc placeholder fallback for cards without bespoke Illu outlines.

Open diffs: none.

## Phase 5 — Rewards + Paint (PASSED 36/36 + visual)

Automated: `node scripts/verify-phase5.mjs` — chest closed→opening→reveal with
sticker persisted to `pip-earned`, badges, gallery empty-state → Paint; Paint:
13 templates, 12 spoken swatches, 4 tools + 3 sizes, marker/rainbow (hue
cycles along stroke, verified by endpoint colors)/spray/sparkle, 4 stamps,
eraser (destination-out), 10-level undo, kid-safe clear confirm, magic fill
bounded by the outline (corner stays clean; enclosed pockets like the cat's
nose correctly stay unfilled), per-template WIP restore, "I'm done!" →
480×480 export → `pip-gallery` → framed in My Treasures.
Visual: Paint + Rewards pairs (clay·light·web) in `verification-shots/phase5/`
— pixel match.

Test-harness note: three initial "failures" were stale Playwright coordinates
(toolbar clicks auto-scroll the pane) and a sample point inside the cat-nose
pocket — test fixed, app unchanged.

Open diffs: none.

## Phase 6 — Shell extras (PASSED 29/29 + visual)

Automated: `node scripts/verify-phase6.mjs` — onboarding gating (fresh →
Onboarding, `pip-onboarded` set, returning → Home), avatar/size/demo-flip
steps with narration, Buddies sheet (6 concepts × 5 moods, pick persists +
re-themes), parental gate (wrong → wiggle/coral, ⌫ clears, correct → 250ms
unlock), working settings (voice/motion/language/difficulty/limit persist and
gate real behavior; motion off → static celebrate), welcome-back >6h overlay
with 4.2s auto-dismiss, no simulated PWA toast (real `useRegisterSW` waiting
state wired). Visual pairs (onboarding/buddies/gate/dashboard) match.

Deviations per the do-NOT-replicate list (recorded):
- Parent "This week" shows 2 REAL stats (cards learned from `pip-daily-*`,
  sets started from `pip-progress`); the prototype's hard-coded play-time
  stat is hidden until time is actually tracked.
- Export/Import data buttons are functional (JSON download / file restore of
  `pip-*` keys) instead of the prototype's inert ghosts.
- Update toast uses the real service-worker `waiting` state, not the 9s timer.
- `es-ES` stays visible as "(soon)" and selects without voice support (allowed).

Open diffs: none.

## Post-launch fixes — Learn tab, emoji consistency, speech audio (PASSED 17/17)

User-reported on the running app; `node scripts/verify-fixes.mjs`:
1. **Learn tab dead with no progress** — `goLearn` fell back to Home when there
   was no active/last category, so clicking Learn on Home did nothing. Now
   resumes the active/last category, else opens the first (Alphabet). Always
   opens a deck.
2. **Mixed art (big bespoke SVG vs tiny emoji-on-pink-disc)** — photo-style
   categories (animals/fruits/vegetables/birds/vehicles/body/weather/emotions)
   now render the dataset's **native color emoji** uniformly via a new
   `Illu name="emoji"` path (HTML span, full-size). Alphabet keeps the mega
   letter front + emoji back; numbers keep the mega number; colors keep
   swatches; shapes keep geometric SVG for circle/square/triangle/star and
   native emoji for the rest. Verified: 0 pink-disc fallbacks; every thumb +
   front + back renders the realistic emoji. (Also fixed: emoji card *backs*
   were blank — `CardBack` didn't handle `kind:'emoji'`.)
3. **No speech audio anywhere** — the engine reported `speaking=true` but
   `u.lang` was never set and voice selection could lock onto a remote/enhanced
   OS voice (e.g. macOS "Rishi" en-IN) that emits no audio until downloaded.
   Now: prefer `localService` (offline) voices matching the language, then any
   offline English, then remote matches; always set `u.lang`; call
   `speechSynthesis.resume()` after speak (Chrome can leave synthesis paused →
   silent). Voice-pick + lang verified through the real SpeakButton.

Decision: home-screen category tiles keep their single bespoke icon (internally
consistent per-grid); only card surfaces switched to emoji. Easy to flip tiles
to emoji too if desired.

Regression: phase suites 2–7 all still green after the change.

## Phase 7 — Journey matrix + final sweep (PASSED 35/35 + 81-shot sweep)

Automated: `node scripts/verify-phase7.mjs` — all journeys A–H from the brief:
- A first-run onboarding → Home (`pip-onboarded`)
- B learn loop ×10 with streak pop at 3, trophy, "Take the quiz"
- C quiz with one wrong (reveal + spoken correction), results, review, all actions
- D returning user (continue card, intact state) + >6h welcome-back
- E chest → sticker book; painting → My art
- F undo capped at exactly 10 levels, template-switch WIP round-trip
- G gate, voice-off ⇒ zero utterances (captions still announce), language
  switch picks the matching TTS voice (verified via a speechSynthesis recorder)
- H keyboard-only learn pass (Tab/Enter/arrows/Space/Esc), reduced-motion pass,
  dark-mode pass of learn+rewards, Sticker-Pop pass of learn

Final sweep: `scripts/capture-phase7-sweep.mjs` — 9 screens (onboard, home,
deck, quiz, rewards, paint, buddies, gate, dashboard) × clay/pop × light/dark
× web/phone + tablet spot-checks = 81 screenshots in
`verification-shots/phase7/`, sampled and reviewed (tablet 3-col grid,
pop-dark phone paint, etc.). Direction/theme variation is token-driven and was
pixel-validated against the live reference per-screen in earlier phases.

Full regression at finish: phase suites 1–7 all green
(15/15, 23/23, 40/40, 19/19, 36/36, 29/29, 35/35).

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
