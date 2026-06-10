# CLAUDE CODE PROMPT — Pip Cards Implementation

Copy everything below this line into Claude Code, run from the repo root with the `design_handoff_pip_cards/` folder placed inside the repo.

---

You are implementing a complete visual + UX redesign of this React 19 + Vite PWA ("Kids Flash Cards") to exactly match a high-fidelity design reference. Work autonomously, phase by phase, and do not consider any phase done until it passes the verification protocol below.

## Source of truth

1. `design_handoff_pip_cards/README.md` — the full written spec: design tokens, every screen, every state, copy, interaction rules, storage schema, a11y requirements. Read it END TO END before writing any code.
2. `design_handoff_pip_cards/Pip Cards v2.html` — the living reference. Serve it locally (e.g. `npx serve design_handoff_pip_cards`) and open it in a browser. This is what your implementation must match pixel-for-pixel. The Tweaks panel switches direction (clay/pop), theme (light/dark), and device (web/phone/tablet) — your implementation must support all of them.
3. The `.jsx` and `.css` files in the same folder — reference implementations of every component. Adapt them to this codebase's idioms (proper modules, no Babel-in-browser, no `window.*` globals, no tweaks-panel.jsx); do not blind-copy.

Rules of precedence: README.md prose > the rendered `Pip Cards v2.html` > the reference JSX source. If they conflict, follow that order and note the conflict in your final report.

## Non-negotiable constraints

- All styling derives from the CSS custom properties in `tokens.css`. Implement them first, verbatim. Components NEVER hard-code a color, radius, shadow, or duration that exists as a token.
- Theme (`data-theme`) and direction (`data-direction`) are attributes on the app root; components must not branch on them in JS — CSS variables do all the work.
- Keep every `data-testid` listed in the README — the E2E suite depends on them.
- Touch targets ≥ 44px (kid-facing primary actions ≥ 56px). `:focus-visible` rings everywhere. `prefers-reduced-motion` fully honored. No nested interactive elements.
- Audio-first: every meaningful tap speaks via Web Speech API (rate 0.7, pitch 1.3, language from settings) AND mirrors to the caption bar. No punishment patterns anywhere.
- All state local-only per the storage schema in the README. No network calls, no login.

## Phase plan

Execute in this order. Each phase ends with the verification protocol; do not start the next phase until the current one passes.

- **Phase 0 — Audit & plan.** Read the README fully. Inventory the existing codebase (routing, state, components, service worker, test setup). Produce a written migration plan mapping each README screen/component to new or existing files. Identify everything that will be deleted/replaced.
- **Phase 1 — Foundations.** tokens.css into the build, Lexend self-hosted, theme/direction attribute plumbing + persistence, global focus styles, reduced-motion handling.
- **Phase 2 — Primitives.** Icon set, speech hook + caption bus (`announce`), SpeakButton (with wave animation states), ProgressTrack, StreakBadge, Confetti (+ reduced-motion fallback), Mascot (all 6 concepts × 5 states), Illu placeholder art layer.
- **Phase 3 — Core loop.** Home (web sidebar + mobile bottom-nav variants, category grid, continue card, ambient blobs), Deck (flip card, mastery, streaks, thumb strip, trophy modal, keyboard map + help modal), persistence (progress/earned/settings/daily).
- **Phase 4 — Quiz.** Question flow, option states (correct/wrong/reveal/disabled), results with mistake review, all three result actions.
- **Phase 5 — Rewards + Paint.** Chest, sticker book, badges, art gallery; full Paint studio (13 templates, 4 brush styles, fill bucket, stamps, 3 sizes, undo, confirm-clear, "I'm done!" flow, per-template persistence).
- **Phase 6 — Shell extras.** Onboarding (first-run gating), Buddies sheet, Parent gate + dashboard (working toggles wired to real behavior), daily goal ring, welcome-back, PWA update toast wired to the real service-worker `waiting` state.
- **Phase 7 — Full E2E + polish.** Run the complete journey matrix (below), fix everything, then do a final pixel sweep of every screen in all 8 combinations (2 directions × 2 themes × web/phone) plus tablet spot-checks.

## Verification protocol (every phase)

This is the heart of the task. For each screen/state in the phase:

1. **Screenshot the reference**: open `Pip Cards v2.html` in the browser (Playwright or equivalent), drive it to the target screen/state, screenshot at web 1180×720, phone 390×844, and (spot-check) tablet 834×1112 — in light+clay, dark+clay, light+pop, dark+pop.
2. **Screenshot your implementation** in the identical state and viewport.
3. **Compare side by side, region by region** — layout geometry (positions, sizes, gaps), colors (sample exact pixels), typography (size/weight/line-height), radii, shadows, iconography, copy text. Use an image-diff (e.g. pixelmatch) where practical; eyeball where diffs are animation-timing noise.
4. **Log every mismatch** in a `VERIFICATION.md` checklist with screen, state, viewport, expected vs actual.
5. **Fix and re-verify. Loop until the diff list for the phase is empty.** Do not rationalize a mismatch as "close enough"; if you believe the reference itself is wrong/inconsistent, implement per README and record the discrepancy — never silently deviate.
6. **Behavioral checks** for the phase (interactions, keyboard, speech/captions, persistence round-trips through reload, reduced-motion) — verify by driving the real UI, not by reading your own code.

## Journey matrix for Phase 7 (all must pass end-to-end)

A. First run: onboarding (avatar gate, age, demo flip) → home, `pip-onboarded` set.
B. Learn: home → category → flip → speak → master ×N → streak pop at 3 → complete category → trophy → "Take the quiz".
C. Quiz: full run with at least one wrong answer → reveal behavior → results with mistake review → all three actions.
D. Returning user: reload mid-progress → lands Home with continue card, progress/stickers/settings intact; >6h gap → welcome-back moment.
E. Rewards: chest open → sticker lands in book; paint a picture → "I'm done!" → appears in My art.
F. Paint: every tool (4 brushes, fill stays inside outline, stamps, eraser, undo 10 levels, confirm-clear), template switch preserves WIP.
G. Parent: gate (wrong answer wiggles, correct unlocks), every toggle actually gates its behavior (voice off = no speech), language switch changes TTS voice.
H. Keyboard-only pass of B and C. Reduced-motion pass of B. Dark-mode pass of B and E. Sticker Pop pass of B.

## Working discipline

- Maintain `PROGRESS.md`: phase status, what passed verification, open diffs, decisions made.
- Commit at the end of each phase with the phase name; never commit a phase with open diffs.
- If the codebase has tests, keep them green; add tests against the `data-testid` hooks as you go.
- If something in the existing codebase fights the design (e.g. a UI library with baked-in styles), prefer removing the obstacle over compromising the design; record the decision.
- Final deliverable: working app + `PROGRESS.md` + `VERIFICATION.md` + a short report of any README-vs-reference discrepancies found.

## Technical implementation notes (read carefully — these encode bugs we already found and fixed)

### Card flip (Deck + onboarding demo)
- Structure: wrapper with `perspective: 1400px` → inner `.flashcard-3d` with `transform-style: preserve-3d; transition: transform 480ms cubic-bezier(.34,1.56,.64,1)` → two absolutely-stacked faces with `backface-visibility: hidden` (+ `-webkit-` prefix); back face has `transform: rotateY(180deg)`; flipped state sets `rotateY(180deg)` on `.flashcard-3d`.
- The card root must be a `role="button" tabIndex={0}` **div**, NOT a `<button>` — the SpeakButton lives inside it and nested buttons are invalid DOM (React validateDOMNesting warning) and double-fire on Enter. Same rule for quiz-result mistake rows (row = div role=button, inner speak button). Add `onKeyDown` for Enter/Space yourself on these divs.
- SpeakButton's onClick must `e.stopPropagation()` so it doesn't flip the card.

### Speech + captions
- One shared hook: `speechSynthesis.cancel()` before every utterance (prevents queue pileup from rapid taps); `rate 0.7, pitch 1.3`; voice = first matching `settings.language`, fallback any `en`; wrap in try/catch (no-throw if API missing); track `speaking` via utterance onstart/onend/onerror for the SpeakButton wave animation.
- Voices load async — listen to `voiceschanged` once at boot.
- `announce(text)` dispatches a CustomEvent consumed by a single global CaptionBar (`role="status"`, `aria-live="polite"`, auto-hide ~2.6s, reset timer on new text). Every `speak()` call site also calls `announce()`.
- Gate speech behind BOTH the kid mute toggle and the parent "voice" setting.

### Paint canvas
- Internal resolution 1000×1000, displayed scaled; map pointer coords via `(clientX - rect.left) * (1000 / rect.width)`.
- Pointer Events with `touch-action: none` on the canvas; `setPointerCapture` MUST be wrapped in try/catch (synthetic/stale pointers throw and crash the studio).
- Context created with `{ willReadFrequently: true }`; `lineCap/lineJoin: round`.
- Eraser = `globalCompositeOperation: 'destination-out'`, width ×1.4–1.8; ALWAYS reset to `source-over` after.
- Rainbow brush: advance hue by stroke distance (`hue = (hue + d*0.25) % 360`, `hsl(h,90%,55%)`). Spray: per-dab scatter of ~brush×1.5 small rects within radius brush×1.4 at random alpha .5–1 (reset globalAlpha!). Sparkle: 10-point star polygons (outer r ≈ brush×0.5–1.1, inner ×0.45) + small white twinkle stars. Stamps: spaced dabs along drag path (gap ≈ brush×3.2).
- **Flood fill:** build a boundary bitmap on an offscreen canvas = template outline stroked at lineWidth 2.2 (Path2D, transform: translate 6% + scale 0.88×RES/100) + drawImage of current painting; alpha > 40 = wall. If seed pixel is a wall, no-op. Scanline/stack fill into a NEW ImageData, then composite it under the painting with `destination-over` so brush lines stay crisp on top. Cap undo stack at 10 ImageDatas.
- Per-template WIP persistence: save `canvas.toDataURL('image/png')` on every stroke-end to `pip-doodle-{template}`; restore via Image draw on template switch. Export ("I'm done!") composites white paper `#fffdf9` + outline in `#d9c4ad` + painting at 480×480.
- Template outlines are single-path strings on a 0–100 viewBox (see `screens3.jsx` OUTLINE map) — keep them mostly-closed so fill works inside.

### Mascot (parametric SVG)
- One component, viewBox `0 0 136 150`: shared body (ellipse 50×52 at 68,80), belly, cheeks, feet; per-concept palette + ornament (Pip curl / fox+owl/bunny ears / bear round ears / monster antennae) + nose variant. States: idle (open eyes + smile), cheer (arc-happy eyes, open mouth, both arms up, sparkles), encourage (6° lean, one arm up), point (right arm point path), sleep (closed-arc eyes + "Zz"). Decorative by default (`aria-hidden`), `role="img"` + label when meaningful.

### Layout shells
- Web ≥ ~900px: 236px sidebar (logo, nav, goal ring, voice/theme, grown-ups) + scrollable main (content max-width 1060px, 4-col category grid, 1×4 quiz row). Phone: top bar + bottom nav, 2-col grid. Tablet: 3-col grid. One shared NAV array renders both sidebar and bottom-nav — never two divergent nav definitions.
- The deck-stage uses flex with side-peeks (46px phone / 80px tablet+) at 35% opacity showing adjacent card art.

### Parent gate
- Problem `a + b` with a∈[2,7], b∈[3,8]; numeric keypad builds a string (max 2 chars); auto-unlock ~250ms after the value parses equal; wrong at full expected length → wiggle + coral error state, ⌫ clears error. Regenerate the problem on each gate open.

### Quiz generation
- Per question: target card + 3 distractors sampled from the same category (difficulty "easy" = 1 distractor), shuffled. ~10 questions (cap by pool size). One attempt per question; advance 850ms after correct, 1500ms after wrong (with reveal). Score chip updates live.

### Persistence & PWA
- Storage keys + shapes are in README "State Management" — treat as a schema. JSON round-trip everything through try/catch (private-mode safe). Gallery dataURLs can exceed localStorage quotas — prefer IndexedDB for `pip-gallery` if the codebase has a wrapper.
- Update toast: listen for the SW `waiting` worker (vite-plugin-pwa `onNeedRefresh` or manual registration events); "Refresh" → `postMessage({type:'SKIP_WAITING'})` + reload on `controllerchange`. Show once per session.

### Animation timing reference
- Press: scale .92–.98 over 150ms spring. Flip: 480ms spring. Streak pop / trophy / sticker reveal: pop1 keyframe (1 → 1.18 → 1) 400ms spring. Confetti: 40 pieces, 1.5s ease-in fall, 6 accent colors, ~1.6s total then unmount. Welcome-back overlay: fadeOut 4.2s forwards. Caption: capIn 250ms spring. Mascot bob: 3.5s ±8px infinite (gate behind reduced-motion). Ambient blobs: 9/11/13s float loops, blur 2px, opacity .35.
- Reduced motion: single global media query kills all animation/transition durations (~0.001ms) + JS checks `matchMedia('(prefers-reduced-motion: reduce)')` before confetti (render static "Nice!" banner ~700ms instead).

### Known reference-file quirks (do NOT replicate)
- `tweaks-panel.jsx`, the device bezel/scaler chrome, and the `EDITMODE` TWEAK_DEFAULTS block in the HTML are prototype scaffolding — exclude entirely.
- Reference loads React + Babel from CDN and shares components via `window` globals — use real ES modules.
- Parent dashboard "This week" stats are hard-coded placeholders (24/3/12m) — wire to real tracked data or hide until tracked.
- `es-ES` language option is marked "(soon)" — keep visible but non-functional is acceptable for v1.

Begin with Phase 0 now.
