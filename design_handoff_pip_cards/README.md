# Handoff: Pip Cards — Kids Flash Cards Visual + UX Redesign

> **For:** Claude Code (implementation in the existing React 19 + Vite PWA)
> **From:** Claude Design
> **Date:** June 2026
> **Primary design reference:** `Pip Cards v2.html` (open in a browser — everything is interactive)

---

## Overview

This is a complete visual + UX redesign of the **Kids Flash Cards** PWA (ages 2–7): flip cards, spoken pronunciation, and quizzes across 12 categories, plus newly designed features — a guide mascot ("buddy") system, rewards/sticker collection, a Paint & Doodle studio, a parent area behind a math gate, daily goal ring, welcome-back moments, and a PWA update toast.

The redesign brand is **"Pip!"** — warm cream surfaces, chunky rounded geometry, Lexend type, per-category color coding, audio-first interaction, and a parametric mascot with 6 selectable characters.

Two complete visual directions are implemented and switchable at runtime:
- **Cuddle Clay** (`data-direction="clay"`) — soft, puffy claymorphic surfaces, no outlines. **This is the default.**
- **Sticker Pop** (`data-direction="pop"`) — sticker-book style: 3px cocoa outlines + 4px white sticker rims + hard offset shadows.

Both ship with full **light and dark themes**, and three responsive frames: **web (default), phone, tablet**.

## About the Design Files

The files in this bundle are **design references created in HTML** — fully interactive prototypes showing intended look and behavior. They are **not production code to copy directly**. The HTML app shell (device frames, Babel-in-browser, the Tweaks panel, `tweaks-panel.jsx`) is prototype scaffolding only.

Your task is to **recreate these designs inside the existing React 19 + Vite codebase**, using its established patterns (components, routing, state, service worker). The JSX in this bundle is close to React idiom and can often be adapted nearly 1:1, but treat it as reference, not source.

## Fidelity

**High-fidelity.** Colors, typography, spacing, radii, shadows, motion curves, copy, and interaction states are final and should be matched pixel-perfectly. All values are tokenized in `tokens.css` — implement those as CSS custom properties (they already are) and build components against the tokens, never hard-coded values.

One deliberate exception: **card/category illustration art** is placeholder chunky-SVG (`data.jsx` → `Illu`). The client may later swap in a commissioned illustration set; keep the art layer behind a single component boundary (`<Illu name=… />`) so it's swappable.

---

## Architecture of the reference files

| File | Contents |
|---|---|
| `tokens.css` | **All design tokens.** Type scale, spacing, radii, motion, per-category colors, light/dark themes, clay/pop direction variables. |
| `app.css` | Every component + screen style, keyed off the tokens. ~1500 lines, organized by screen with banner comments. |
| `mascot.jsx` | `<Mascot concept state size flip />` — parametric SVG buddy. 6 concepts × 5 states. |
| `data.jsx` | Category definitions, sample card data, avatar list, and the `Illu` placeholder illustration library. |
| `components.jsx` | Primitives: `Icon`, `useSpeech`, `SpeakButton`, `CaptionBar`/`announce`, `FlashCard`, `CategoryTile`, `QuizOption`, `ProgressTrack`, `StreakBadge`, `Confetti`. |
| `screens1.jsx` | `Onboarding`, `Home`, `Deck` (learn flow). |
| `screens2.jsx` | `Quiz` + results, `Rewards`, `Parent` (gate + dashboard), `MascotSheet`. |
| `screens3.jsx` | `Paint` — the full paint/coloring studio. |
| `screens4.jsx` | `UpdateToast`, `DailyGoalRing`, `useWelcomeBack`/`WelcomeBack`, `KeyHelp`. |
| `Pip Cards v2.html` | App shell: routing, persistence, web/phone/tablet frames, Tweaks. **The canonical reference.** |
| `Pip Cards Prototype.html` | v1 (pre-Paint/pre-persistence). Historical; ignore unless comparing. |
| `tweaks-panel.jsx` | Prototype-only review tooling. **Do not implement.** |

---

## Design Tokens (implement exactly — see `tokens.css`)

### Typography
- **Family:** `Lexend` (Google Fonts, variable 100–900), system-ui fallback. Used everywhere — no second family.
- Scale:
  - `--fs-display: clamp(34px, 8vw, 56px)` — card-back word
  - `--fs-h1: clamp(26px, 5vw, 36px)`
  - `--fs-h2: 24px`, `--fs-h3: 20px`, `--fs-body: 18px`, `--fs-label: 15px`
  - `--fs-mega: clamp(96px, 30vw, 200px)` — giant letters/numbers on card fronts
- Weights: 500 regular, 600 medium, 700 bold, 800 black. Headings are 800 with `-0.01em` tracking.

### Spacing & radii
- Spacing: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 (`--s-1`…`--s-8`)
- Radii: 12 / 20 / 28 / 40 / 999 (`--r-sm/md/lg/xl/full`). Cards use `--r-xl`, tiles `--r-lg`, chips/buttons `--r-full`.
- **Touch target floor: 44px absolute minimum; primary kid actions ≥ 56–76px** (`--touch: 76px`).

### Motion
- `--t-fast: 150ms`, `--t-med: 250ms`, `--t-slow: 400ms`
- Spring ease: `cubic-bezier(.34, 1.56, .64, 1)` — used for presses, pops, flips
- Card flip: 480ms spring rotateY
- **`prefers-reduced-motion: reduce` collapses all animation/transition durations to ~0 and swaps confetti for a static "Nice!" banner.** Non-negotiable.

### Color — themes
Light (`data-theme="light"`): bg `#fff3e2`, bg-2 `#ffe9d2`, surface `#fffaf3`, surface-2 `#fff1e0`, surface-3 `#ffe6cf`, ink `#43301f`, ink-2 `#735a45`, ink-3 `#a3866d`, rose `#f6d4c8`, rose-deep `#e7a695`.
Dark (`data-theme="dark"`): bg `#241a13`, surface `#34271d`, surface-2 `#3e2f23`, surface-3 `#4a392b`, ink `#fbeede`, ink-2 `#d8c2ab`, ink-3 `#a8917c`.

### Color — per category (always paired with a literal icon, never color alone)
| Category | c1 | c2 |
|---|---|---|
| Alphabet | `#6366f1` | `#8b5cf6` |
| Numbers | `#14b8a6` | `#10b981` |
| Animals | `#f43f5e` | `#ec4899` |
| Fruits | `#f59e0b` | `#ef4444` |
| Vegetables | `#22c55e` | `#16a34a` |
| Birds | `#0ea5e9` | `#3b82f6` |
| Colors | `#a855f7` | `#ec4899` |
| Shapes | `#8b5cf6` | `#6366f1` |
| Vehicles | `#ef4444` | `#f97316` |
| Body Parts | `#ec4899` | `#f472b6` |
| Weather | `#06b6d4` | `#0ea5e9` |
| Emotions | `#eab308` | `#f59e0b` |

Accent pops: sun `#fbbf24`, coral `#fb7185`, teal `#2dd4bf`, sky `#38bdf8`, grass `#4ade80`, grape `#a78bfa`, gold `#f6b73c`. Success = grass, error/try-again = coral, info/reveal = sky.

### Direction variables (the key to the dual style)
Every surface reads `--elev-1/--elev-2/--elev-press`, `--stroke-w`, `--stroke`:
- **Clay:** `--stroke-w: 0`; elevations are layered soft shadows + inset top highlight (see `tokens.css` for exact values).
- **Pop:** `--stroke-w: 3px`, `--stroke: #3a2a1d`; elevation = `0 0 0 4px #fffaf3` (sticker rim) + `4px 5px 0` hard offset shadow.

Implement direction as a `data-direction` attribute on the app root; **components must not branch in JS** — CSS variables do all the work.

### Focus
Global `:focus-visible`: 4px solid sky (`#38bdf8`) outline, 3px offset (gold in dark theme). Never remove.

---

## Screens / Views

All screens carry `data-screen-label`. Stable test hooks (`data-testid`) are listed per screen — **keep every one**, they match the E2E suite.

### 1. Onboarding (`data-screen-label="Onboarding"`) — first run only
3 steps, mascot present throughout, each step spoken aloud.
1. **Pick a buddy:** 2×2 grid of illustrated avatar cards (Kitty/Puppy/Hoppy/Bubbles). Selection = sky ring + lift; speaks the name. Next disabled until picked.
2. **How big are you?** 3 size cards (Little/Bigger/Big kid) — mascot rendered at 56/78/100px. Tapping any advances (age tunes difficulty later; no typing).
3. **Tap the card!** Demo flashcard (letter A → Apple) with pulsing tap-ring; flipping speaks "A is for Apple." CTA reads "Skip" → "Let's play!" after the flip.
- Progress dots bottom; "Skip" top-right (steps 1–2).
- On completion set `pip-onboarded=1`; returning users go straight Home.

### 2. Home (`data-screen-label="Home"`)
- **Web:** persistent left sidebar (236px): wordmark, nav (Home/Learn/Paint/Treasures/Buddies), daily goal ring + "Today's goal", voice & theme round buttons, rose "For grown-ups" button. Content max-width 1060px, 4-col category grid.
- **Phone/tablet:** top bar (wordmark "Pip!" — "Pip" in fruits-orange, tilted "!" in teal; round voice/theme/parent buttons), floating goal ring, bottom nav (same 4 + Paint items), 2-col grid (3-col tablet).
- **Hero:** bobbing mascot (3.5s float) + "Hi there! What do you want to learn?" + sun-gradient CTA.
- **Continue card** (`continue-card`): shown when progress exists — category-gradient banner, white icon chip, "Keep going / {Category}", chevron.
- **Category tiles** (`category-tile-{id}`): 84px icon chip on tinted gradient, name, footer = "{n} cards" pill → "{pct}%" pill → 3 gold stars when complete. Hover lift −3px; press scale .97.
- 3 floating ambient blobs behind content (teal/coral/grape, 35% opacity, 9–13s float loops).

### 3. Deck / Learn (`data-screen-label="Deck: {Category}"`)
- Header: back (`deck-back`), category chip + name, 3-segment progress track + "{learned}/{total} learned", grape **Quiz** button (`quiz-start`).
- Stage: prev/next arrows (`nav-prev`/`nav-next`), dimmed side-peeks of adjacent card art, center **FlashCard** (`flashcard`, max-width 340px, 3:4):
  - **Front:** giant art / mega letter in category color + "tap to flip" pulsing pill.
  - **Back** (`flashcard-flip`): smaller art, word at `--fs-display` 800, one contextual badge chip ("Says 'Meow'", "3 sides"…), 84px **SpeakButton** (`speak-button`) — category-colored circle, white speaker icon, 3 expanding wave rings while speaking.
  - Flip = 480ms spring rotateY; flipping to back speaks the phrase. Implement as `role="button"` div with `tabIndex=0` — **never nest the speak `<button>` inside another `<button>`** (validateDOMNesting + double-activation bug; already fixed in reference).
  - Mastered: green "★ Learned!" ribbon top-right + grass glow ring.
- Footer: "{i} of {n}", **StreakBadge** (flame + count; lit coral-orange gradient when > 0, pop animation), **mastered button** (`mastered-button`): disabled "Flip first" → pulsing grass "I know this!" → quiet "Learned!".
- Thumb strip: 56px squares per card, active = category border ring, learned = grass tint + mini star badge.
- **Mastering:** confetti burst; every 3rd streak a full-screen cheer "{n} in a row!" (auto-dismiss ~1.6s); finishing all cards → **trophy modal** (`category-complete`): cheering mascot, gold trophy disc, "You did it!", 3 stars, **"Take the quiz"** primary + "Back home" ghost.
- **Keyboard:** ←/→ navigate, Space/Enter flip, Esc back. "?" button (`key-help-btn`, bottom-right) opens the key map modal (`key-help`).

### 4. Quiz (`data-screen-label="Quiz: {Category}"`)
- Header: back, fill progress bar + "{i} of {n}", gold score chip.
- Prompt: pointing mascot + tappable "🔊 Find the **{word}**" pill (replays audio). Question spoken on entry.
- 2×2 grid (web: 1×4) of **QuizOption** (`quiz-option-{i}`): art + label, min 140px tall.
  - Correct → grass tint + ring + corner ✓ badge, "Yes!", advance ~850ms.
  - Wrong → coral ring + wiggle + ✗ badge; correct answer gets sky "reveal" ring; speaks "Try again. This is the {word}"; logged to mistakes; advance ~1.5s. **One attempt per question, no fail state.**
- **Results** (`quiz-result`): mascot cheers (≥70%) or encourages; giant gold score; "Amazing!" / "Good try!" (never negative); **mistake review** — rows with art + word + small speak button (row itself is a `role="button"` div, see nesting note); actions: "Try again" / "Back to cards" / "🎁 See my stickers".

### 5. Rewards / Treasures (`data-screen-label="Rewards"`)
- **Surprise chest** (`reward-chest`): gold gradient, jiggles on hover, "Tap to open!" → lid lifts + shakes (~900ms suspense) → sticker reveal pop + "Surprise!". CTA "Yay! Keep going".
- **My art** (`art-gallery`): grid of finished paintings in white frames, alternating ±1.5° tilt, labels. Empty state = dashed card "Paint a picture and it will live here!" → navigates to Paint.
- **Sticker book:** 3-col (4 tablet/web) slots; earned = solid card pop-in, unearned = dashed rose border + lock.
- **Badges:** medal circles (gold gradient when earned) + labels.

### 6. Paint & Doodle (`data-screen-label="Paint"`)
Canvas studio, 1000×1000 internal resolution scaled to fit.
- **Template row:** 13 chips (Blank + Cat, Apple, Star, Sun, Fish, Flower, House, Car, Butterfly, Balloon, Rocket, Ice cream) drawn as outline previews; switching persists current page and speaks "Color the {name}".
- **Paper:** white-ish card; template outline rendered behind the canvas in `#d9c4ad`.
- **12 color swatches** (named, spoken on pick: "Red!"…): red/orange/yellow/green/teal/sky/blue/purple/pink/brown/black/white.
- **Tool group** (segmented): Brush (`paint-tool-brush`), Magic fill (`paint-tool-fill`), Stamps (`paint-tool-stamp`), Eraser (`paint-eraser`).
  - **Brush styles** (sub-row when Brush active, `paint-brush-{id}`): Marker; **Rainbow** (hue cycles with stroke distance); **Spray** (speckle mist); **Sparkle** (scattered stars + white twinkles).
  - **Magic fill:** flood fill bounded by template outline + existing paint (alpha > 40 threshold; fill painted `destination-over` so lines stay crisp). Speaks "Whoosh!".
  - **Stamps** (`paint-stamp-{id}`): Star, Heart, Flower, Smiley — tap to place, drag to trail (spaced dabs).
- **3 brush sizes** (14/30/56px) — dot preview in current color; applies to all tools.
- **Undo** (10 levels) · **Clear** (`paint-clear`) → kid-safe confirm modal (`paint-clear-confirm`) "Start over?" with "Yes, clean it!" / "Keep painting".
- **"I'm done!"** (`paint-done`): disabled until ink exists, then pulsing grass. On tap: composites outline + painting onto 480×480 paper, saves to gallery, confetti + "Beautiful! I love it!", modal (`paint-complete`) with framed art → "Paint another" / "See my treasures".
- Each template's WIP auto-persists (`pip-doodle-{template}`) — leaving and returning restores the drawing.
- Canvas uses Pointer Events with `touch-action: none`; wrap `setPointerCapture` in try/catch.

### 7. Buddies / Mascot sheet (`data-screen-label="Mascot sheet"`)
- Header with back (`mascot-back`).
- 6 concept cards (Pip bird / Fox / Owl / Bear / Bunny / Monster), selected = sky ring. Picking re-themes the mascot app-wide.
- "All moods" rail: idle, cheer, encourage, point, sleep.
- Mascot is parametric SVG (`mascot.jsx`): shared round body/eyes/mouth/arms; per-concept palette + head ornament (tuft/ears/antennae) + nose. States change eyes (open/happy-arc/sleepy), mouth, arm poses, lean; cheer adds sparkles, sleep adds "Zz".

### 8. Parent area
- **Gate** (`parental-gate`): lock icon, "For grown-ups", math problem ({a}+{b}, a∈2–7, b∈3–8), big keypad (3-col, ⌫). Correct → dashboard (~250ms); wrong full-length entry → wiggle + coral. Close button top-right.
- **Dashboard** (`data-screen-label="Parent dashboard"`): "This week" stat card (cards learned / sets started / play time); settings list — toggles (`settings-toggle-{name}`: sound, music, voice, motion, limit) as 64×36 switches (grass when on), voice language select (`settings-toggle-language`: en-IN default, en-US, en-GB, es-ES "soon"), difficulty select (easy 2 / normal 4 choices); "Export data"/"Import data" ghost buttons; footer: *"No login. No ads. Everything stays on this device."*

### 9. Global / ambient
- **CaptionBar:** every spoken line also appears as a dark pill caption bottom-center (~2.6s, `role="status"` `aria-live="polite"`). Drive via a single `announce(text)` event bus.
- **Daily goal ring** (`daily-goal`): 5 cards/day; grass ring fills per mastery, ✓ when met. Resets daily, **no streak guilt, never shames**.
- **Welcome back** (`welcome-back`): >6h absence → cheering mascot + "Welcome back!" teal pill overlay (~4.2s) + spoken greeting. Comeback celebrated; absence never punished.
- **PWA update toast** (`pwa-toast`): dark pill top-center "✨ A new version is ready!" + gold "Refresh" + dismiss ✕. In production wire to the service-worker `waiting` state (prototype simulates at 9s, once per session).

## Interactions & Behavior — global rules

1. **Audio-first:** every meaningful tap speaks (Web Speech API: rate 0.7, pitch 1.3, prefer `en-IN` voice, honoring the language setting). Always cancel pending speech before speaking. Mute toggle + "voice" parent setting both gate it. Every utterance mirrors to the caption bar.
2. **No reading required** for kid-facing navigation: icon + color + voice always accompany text.
3. **No punishment:** no ✗-without-✓ feedback, no fail screens, no guilt streaks. Wrong answers = "Try again" + reveal.
4. **Press feedback everywhere:** scale ~.92–.98 + shadow drop on `:active`, spring ease.
5. **State is never color-only** (badges + icons + shape changes accompany color).

## State Management

| Key | Contents |
|---|---|
| `pip-onboarded` | `'1'` after onboarding completes |
| `pip-progress` | `{ [categoryId]: cardId[] }` mastered cards |
| `pip-earned` | `string[]` sticker ids |
| `pip-settings` | `{ sound, music, voice, motion, language, difficulty, limit }` |
| `pip-daily-YYYY-MM-DD` | number mastered today |
| `pip-last-visit` | epoch ms (welcome-back trigger) |
| `pip-gallery` | array of `{ id, template, label, data(PNG dataURL) }`, cap 24 |
| `pip-doodle-{template}` | WIP canvas PNG dataURL per coloring page |

All local-only (no login, no network). In the real app use your existing storage layer (localStorage or IndexedDB — gallery dataURLs may warrant IndexedDB).

Routes: `onboard → home ⇄ {deck ⇄ quiz, rewards, paint, mascot, parent}`. Nav destinations (Home/Learn/Paint/Treasures/Buddies) are one shared definition rendered as sidebar (web) or bottom nav (mobile). "Learn" resumes `activeCat` or last-played category, else Home.

## Accessibility checklist
- Lexend everywhere; body ≥ 18px, labels ≥ 13px (parent-only) 
- 44px minimum hit targets (kid-facing ≥ 56px)
- 4px sky `:focus-visible` rings; full keyboard map on deck/quiz (←/→/Space/Enter/Esc + "?" help)
- `aria-label` on every icon-only control; `role="switch"` + `aria-checked` on toggles; `role="progressbar"` on tracks; `aria-live` captions
- `prefers-reduced-motion` fully honored
- No nested interactive elements (FlashCard and mistake rows are `role="button"` divs hosting inner buttons)

## Assets
- **Font:** Lexend via Google Fonts (self-host in production for offline PWA).
- **Icons:** inline 24×24 filled SVG paths (`components.jsx` `PATHS`) — no icon library dependency.
- **Illustrations:** placeholder chunky SVGs in `data.jsx` (stroke `#3a2a1d`, width ~3.4, rounded joins). Swappable layer — see Fidelity.
- **Mascot:** fully parametric SVG, no image assets.
- No raster images anywhere; everything is vector/CSS.

## Suggested implementation order
1. Tokens (`tokens.css`) + theme/direction attribute plumbing
2. Primitives: Icon, SpeakButton + speech/caption bus, FlashCard, CategoryTile
3. Home + Deck + persistence (the core loop)
4. Quiz + results
5. Rewards + Paint
6. Mascot system + onboarding
7. Parent gate/dashboard, goal ring, welcome-back, update toast

## Files
Open **`Pip Cards v2.html`** in any browser (needs network for React/Babel CDN). Use the Tweaks panel (or edit `TWEAK_DEFAULTS`) to switch direction/theme/device/buddy. All `data-testid` hooks above are live in it.
