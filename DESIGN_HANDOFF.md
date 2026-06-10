# Kids Flash Cards — Design Handoff Brief

> **For:** Claude Design (new UI / visual redesign)
> **From:** Engineering — current app analysis + research synthesis
> **Companion doc:** `UPGRADE_IDEAS.md` (full feature backlog, research sources, roadmap). This brief is the
> design-facing spec: what exists today, what must be honored (voice, keyboard, accessibility, safety), the
> creative direction for the new look, every screen/component/state to design, and the end-to-end (E2E) flows.

---

## 1. Product overview

**Kids Flash Cards** is an installable **React 19 + Vite PWA** (works offline, on Vercel at kidscards.vercel.app)
that teaches early concepts to children **ages 2–7** through flip cards, spoken pronunciation, and quizzes.
It has **12 categories / 200+ cards**, progress tracking, streaks, celebrations, and a dark mode.

**Goal of the redesign:** a warmer, more delightful, more *premium* and more *accessible* kid experience —
without losing the existing learning flows. Treat the default user as a **non-reader with developing fine-motor
control**. The new design must scale to many more categories, new game modes, a guide mascot, rewards/collection,
and parent features (see `UPGRADE_IDEAS.md`).

---

## 2. Non-negotiable design principles (research-backed)

1. **Audio-first, text-light.** Every interactive element must *speak* (we have TTS). Navigation is pictures + a
   guiding voice, not text menus.
2. **Big touch targets — minimum ~2 cm (~75 px), generously spaced.** Single-tap is the primary interaction.
3. **No fail states.** Wrong answers get a warm "try again!" — never a harsh red error.
4. **Forgiving & non-competitive.** Celebrate returning and effort; no streak-guilt, no public leaderboards.
5. **Reward = collection · character · surprise · celebration**, not abstract scores (protects intrinsic motivation).
6. **Privacy as a feature.** No login, local-only, ad-free; adult actions sit behind a math **parental gate**.
7. **Accessible by default.** WCAG 2.2 AA contrast, color never the only signal, full `prefers-reduced-motion`,
   captions for all audio, ARIA on every control, scalable text.

---

## 3. Art direction for the new look

| Aspect | Current | New direction |
|---|---|---|
| **Mood** | bright glassmorphism, rainbow gradients | **warm, soft, premium** — calm not carnival |
| **Base palette** | dark/light with vivid gradients | warm cream / off-white base (`#fff7ed`-ish), cocoa & dusty-rose neutrals; **saturated accent pops reserved for interactive & reward moments** |
| **Per-category color** | already color-coded (keep!) | keep as a non-reading wayfinding cue, **always paired with a literal icon** (color is never the only signal) |
| **Surfaces / depth** | heavy frosted glass (a contrast risk) | **soft, chunky, tactile "claymorphic"** surfaces with gentle shadows that say "touchable"; big corner radii |
| **Illustration** | mixed emoji + photos + some SVG (inconsistent) | **one coherent bespoke illustration style**; a friendly **guide mascot** (evolve the existing orange bird) |
| **Motion** | CSS flips, confetti, floating shapes | **juicy** spring microinteractions (squash/bounce, ripple, satisfying flip), confetti on wins, gentle wiggle on misses; fast (150–300 ms); must honor reduced-motion |
| **Type** | system fonts | **Lexend** (self-hosted; highly legible for emerging readers); large, minimal |

**Mascot (new):** one friendly character with states **idle / cheer / encourage / point-demonstrate / sleep**,
reused across home, cards, quiz, rewards, and onboarding. It narrates, celebrates, and guides non-readers.

### The kid-friendly bar (this comes first)

"Warm/premium" must never read as grown-up, minimal, or corporate. Above all the UI must be **playful, joyful,
and obviously made for little kids.** Concretely:

- **Fun first:** bright, friendly, vibrant — full of personality, smiling characters and faces, cute details,
  stickers, bouncy shapes. A 4-year-old should grin at it. (Keep it *warm and uncluttered*, not harsh neon and
  not overstimulating — vibrant ≠ chaotic.)
- **Big, bold, simple:** oversized rounded buttons and cards, chunky thick strokes, generous whitespace,
  minimal text. Nothing small, thin, dense, or fiddly.
- **Squishy & alive:** rounded "bubbly" forms, soft tactile depth, things that bounce/wiggle/squash on tap;
  delight on every interaction (sound + motion + the mascot reacting).
- **Imagery:** cute, expressive, hand-drawn-feeling illustrations with friendly faces; soft gradients; rounded icons.
- **Avoid:** dense/grid-heavy layouts, small or thin type, hairline icons, muted/sophisticated palettes,
  sharp corners, anything that feels like an adult productivity app.

---

## 4. Existing categories (design must cover all 12)

Each category is color-coded and has a flip card with a **front** (the prompt) and **back** (the answer + a
"speak" button). Counts and colors below are live values.

| Category | Color → gradient | Cards | Card FRONT | Card BACK | Data fields |
|---|---|---|---|---|---|
| **Alphabet** | `#6366f1`→`#8b5cf6` | 26 | big **letter** | image + word + hint badge + 🔊 "A is for Apple" | `letter, word, hint, image/emoji` |
| **Numbers** | `#14b8a6`→`#10b981` | 10 | big **number** | visual count + word + hint + 🔊 | `number, word, visual, hint` |
| **Animals** | `#f43f5e`→`#ec4899` | 46 | photo/emoji | photo + name + **sound** badge + 🔊 | `name, image, emoji, sound, habitat` |
| **Fruits** | `#f59e0b`→`#ef4444` | 18 | photo/emoji | photo + name + hint + 🔊 | `name, image, emoji, hint` |
| **Vegetables** | `#22c55e`→`#16a34a` | 20 | photo/emoji | photo + name + hint + 🔊 | `name, image, hint` |
| **Birds** | `#0ea5e9`→`#3b82f6` | 21 | photo/emoji | photo + name + **sound** + 🔊 | `name, image, sound` |
| **Colors** | `#a855f7`→`#ec4899` | 9 | **color circle** | color circle + name + example + 🔊 | `name, hex, example` |
| **Shapes** | `#8b5cf6`→`#6366f1` | 15 | **SVG shape** | shape + name + (sides / description) + 🔊 | `name, sides, description` (SVG by id) |
| **Vehicles** | `#ef4444`→`#f97316` | 20 | photo/emoji | photo + name + **sound** + 🔊 | `name, image, sound` |
| **Body Parts** | `#ec4899`→`#f472b6` | 17 | photo/emoji | photo + name + **action** + 🔊 | `name, image, action` |
| **Weather** | `#06b6d4`→`#0ea5e9` | 22 | photo/emoji | photo + name + description + 🔊 | `name, image, description` |
| **Emotions** | `#eab308`→`#f59e0b` | 25 | photo/emoji | photo + name + feeling + 🔊 | `name, image, feeling` |

> Design the card so the **back layout is consistent** across categories (big visual, word, one contextual
> badge, speaker button) while the **front varies** (letter / number / color swatch / shape / photo).
> The card images are being migrated to **local HD photos** (see `UPGRADE_IDEAS.md` §10) — design for square images.

**New categories coming** (data-only, same card shape): Dinosaurs, Sea Animals, Space, Insects, Family,
Community Helpers, Opposites, Action Verbs, Days of the Week, Sight Words, and more. Design the category grid
to scale gracefully to **25–30+ categories** (grouping/sections, search, or themed shelves).

---

## 5. Voice functionality (must be represented in the design)

The app speaks via the **Web Speech API** (`speechSynthesis`). The design must surface this clearly.

- **Voice profile:** currently hard-coded **Indian English (`en-IN`)**, female (Veena/Lekha), **slow** rate
  (0.6–0.7) and **higher** pitch (1.3) for a friendly kid tone. The redesign should add a **language/voice
  picker** in settings (so `en-IN` becomes a choice, not a hard-code), and eventually a **bilingual toggle**
  (Spanish first).
- **Speak triggers (4 modes):** `speakWord` (names), `speakLetter` (slow letters), `speakNumber`, `speakPhrase`
  ("A is for Apple"). Auto-narration should also fire on card flip and on first landing ("Tap a picture to hear it").
- **Speaker button (🔊):** appears on every card back. Design a **large, obvious, kid-tappable** speaker control
  with a clear "playing" animated state (pulsing sound waves) and an idle state. It must not be confused with
  navigation.
- **Captions:** when anything is spoken, **show the word/phrase as text too** (accessibility + literacy). Design
  a caption treatment.
- **No-voice fallback:** some browsers lack voices — design a subtle "voice unavailable" state.

**Design deliverables for voice:** speaker button (idle / playing / disabled), caption style, a global
"mute voice" toggle, the language/voice picker (in the gated parent settings), and a first-run "tap to hear"
coach mark.

---

## 6. Keyboard & input abilities (must be honored & shown)

The app is fully operable beyond touch — the design must include **visible focus states** and optional on-screen
key hints (helpful for parents/older kids on laptops, and required for accessibility).

| Input | Action | Design need |
|---|---|---|
| **← / →** | previous / next card | visible focus ring on the card; optional arrow-key hint |
| **Space / Enter** | flip the current card | focusable card with clear focused + flipped states |
| **Esc** | back to home/categories | — |
| **Tab** | move focus across controls | **clear, high-contrast focus indicators on every control** |
| **Trackpad / mouse wheel (horizontal)** | swipe between cards | — |
| **Touch swipe (left/right)** | previous / next card | swipe affordance (side-card peeks already hint this) |

**Design deliverables for input:** a consistent **focus-visible** style (thick, high-contrast, rounded), a
keyboard-shortcuts help affordance (e.g., a small "?" that opens a kid/parent-friendly key map), and ensure all
interactive states (hover/active/focus/disabled) are specified for every control.

---

## 7. Screens to design

### Existing (redesign these)
1. **Home / Category selector** — theme toggle, hero (mascot + title + headline + "Continue: {last}" + CTA),
   floating ambient shapes, **category grid** (each tile: icon, name, description, progress ring or "X cards to
   learn" start badge, completion stars when done), footer. States: fresh user, returning user (continue),
   completed categories.
2. **Card deck (learn)** — header (back, title, **3-step progress track**, X/Y count, Quiz button), main card
   with **side-card peeks** + prev/next arrows + the **flip card**, footer (position "n of N", **streak counter**
   with flame, **"I Know This!" / "Learned!"** mastered button, **thumbnail strip** of nearby cards). Overlays:
   confetti, star-burst, "{n} in a row!" streak celebration, **category-complete** trophy modal.
3. **Quiz** — header (back, title, score), progress bar + "n of N", question card (image/emoji/color/shape/number),
   **4 large answer buttons**, correct/wrong feedback states, and the **results screen** (trophy vs. encourage
   art, score X/N, %, message, **mistake review** list, "Try Again" / "Back to Cards").
4. **PWA update prompt** — "new version available, refresh" toast.

### New (design these — see `UPGRADE_IDEAS.md` for rationale)
5. **Onboarding / first-run** — audio-narrated, text-light; **pick an avatar** (big illustrated choices that
   speak their name); optional name (parent-entered); pictorial age tier; teach-the-flip by demonstration; skippable.
6. **Game hub + game screens** — Listen-and-tap, True/False, Memory match, Coloring, Tracing, etc. (start with
   the first three). Each needs its own play + win states.
7. **Progress journey map** — islands/stepping-stones showing path & next goal (non-numeric).
8. **Rewards & collection** — sticker album (filled/empty slots), **surprise treasure chest** (build-up → burst →
   reveal), badges shelf, treasure jar / progress tree.
9. **Avatar / pet** — avatar dress-up, pet + decoratable room.
10. **Profiles** — child profile picker (avatar + name).
11. **Parent area (gated)** — **math parental gate**, then dashboard (progress report, settings: sound/music/voice/
    language/motion/difficulty, per-category enable, screen-time limit, lock-to-category, export/import data,
    privacy statement).
12. **Settings / theme** — dark mode (exists) + unlockable **theme/card-back skins** (space, underwater, jungle, seasonal).

---

## 8. Component inventory (with required states)

- **FlashCard** — front, back, *flipping* animation, *flipped*, focused, mastered overlay.
- **CategoryTile** — default, in-progress (progress ring), completed (stars), focused, pressed.
- **SpeakButton** — idle, playing (animated waves), disabled.
- **MasteredButton** — not-ready (before flip), ready ("I Know This!"), mastered ("Learned!" + burst).
- **NavArrow / SideCardPeek / ThumbnailStrip item** (active, mastered, default).
- **QuizOption** — default, selected-correct, selected-wrong, reveal-correct, disabled.
- **ProgressTrack / ProgressRing / DailyGoalRing / StreakBadge** (warm/forgiving).
- **Mascot** — idle / cheer / encourage / point / sleep.
- **RewardChest, StickerAlbum, BadgeShelf, TreasureJar** — locked/earned/reveal.
- **ParentalGate, ParentDashboard, SettingsRow/Toggle, ProfileCard, LanguageToggle, AudioCaption,**
  **Confetti / Celebration overlay, Toast (PWA update), Onboarding step.**
- **Focus-visible style** and **toast/celebration** patterns applied globally.

For each component, deliver: all interaction states, light + dark, and a reduced-motion variant where animation
is involved.

---

## 9. Accessibility & safety (design constraints)

- **Contrast:** body/UI meets WCAG 2.2 AA (4.5:1 text, 3:1 icons/UI). Re-check any translucent surfaces.
- **Color independence:** every color-coded thing also carries an icon/shape/label.
- **Color-blind-safe accents:** prefer blue/orange pairings over red/green as the sole distinction.
- **Reduced motion:** specify a static alternative for confetti/flip/float (e.g., a checkmark + sound).
- **Captions** for all spoken audio; **ARIA labels** on all controls; decorative art marked decorative.
- **Scalable text** (use relative units; never disable zoom).
- **Parental gate** (math problem) in front of settings, external links, and any store/review prompt.
- **No dark patterns** — no nags, fake urgency, or guilt.

---

## 10. End-to-end (E2E) features & user journeys

The design must support these complete flows, start to finish:

**A. First run (new child):** Launch → mascot greets (voice) → choose avatar → (parent sets name/age, gated) →
guided first card auto-flips & speaks → land on Home.

**B. Learn a category:** Home → tap category (sound + transition) → Card deck → tap card to **flip** (flip sound +
TTS + marks "viewed") → 🔊 to repeat → navigate (arrows/swipe/wheel/keyboard) → tap **"I Know This!"** (confetti +
star-burst + streak++ → "Learned!") → at milestones, **streak celebration** → on last mastered card,
**category-complete trophy** → back to Home (tile now shows stars).

**C. Quiz:** Card deck → Quiz → 10 questions, tap one of 4 → instant correct/wrong feedback (correct = faster
advance + sound; wrong = shows correct answer, tracked) → **results** (score, %, message, **review mistakes**) →
Try Again or Back.

**D. Returning user:** Launch → Home shows **"Continue: {last category}"** → resume; progress persisted locally.

**E. Play a game (new):** Home/Game hub → pick game (e.g., Listen-and-tap) → play rounds (no fail state) → win +
reward → maybe **open a surprise chest** → sticker added to **collection**.

**F. Earn & customize (new):** Master cards / win games → earn stickers/coins → open chest → decorate pet room /
dress avatar / unlock a theme skin.

**G. Parent session (new, gated):** Tap "For Grown-Ups" → **math gate** → dashboard: see progress, toggle
sound/music/voice/**language**/motion/difficulty, enable/disable categories, set screen-time limit,
**lock to a category**, export/import data, read privacy statement.

**H. Habit loop (new, forgiving):** Daily visit → **daily goal ring** fills → gentle streak (with auto-freeze) →
"Welcome back!" comeback reward on return — never punished for missing.

**I. Install & offline:** Browser → custom "Add to Home Screen" prompt → launch fullscreen from icon →
works **fully offline** (cards, images, audio all local).

**J. Theme/dark mode:** toggle light/dark anywhere; later, switch unlockable theme skins.

---

## 11. E2E testing hooks (so the new UI is automatable)

To keep the redesign verifiable end-to-end (Playwright/Cypress), please design with stable, semantic handles in mind:

- Give every key interactive element a stable identity (we'll add `data-testid`s): `category-tile-{id}`,
  `flashcard`, `flashcard-flip`, `speak-button`, `mastered-button`, `nav-prev`/`nav-next`, `quiz-option-{i}`,
  `quiz-result`, `parental-gate`, `settings-toggle-{name}`, `mascot`.
- Ensure all states are **distinguishable** (correct vs wrong vs disabled have distinct, testable styling/aria).
- Don't hide critical text purely in images — keep accessible names so tests (and screen readers) can assert on them.
- Critical flows to keep test-stable: **flip → mastered → category-complete**, **full quiz → results → review**,
  **parental gate → settings**, **install/offline**, **profile switch**.

---

## 12. Technical constraints the design must respect

- **React 19 + Vite PWA**, CSS-variable theming (current `--primary`/`--secondary` etc.) — design tokens should map
  to CSS custom properties; per-category color via a `--card-color` variable.
- **Offline-first:** images/audio are local (square HD WebP + an audio sprite). Avoid designs that depend on
  network-only assets.
- **Performance:** lightweight; prefer CSS/SVG; heavy character animation (Lottie) only where justified and lazy-loaded.
- **Responsive:** phone-first, but great on tablet (primary kid device) and usable on desktop/laptop (keyboard).
  Specify portrait + landscape; games may request landscape.
- **Scales to 25–30+ categories, multiple profiles, and many reward items.**

---

## 13. Requested deliverables from Claude Design

1. **Design tokens** — color (warm base + accents + per-category), type scale (Lexend), spacing, radii, shadows,
   motion timings; **light + dark**.
2. **The mascot** — character sheet with the 5 states.
3. **High-fidelity screens** for every screen in §7 (existing redesigned + new), in light & dark, phone & tablet.
4. **Component library** (§8) with all states + reduced-motion variants.
5. **Key prototypes** for the E2E journeys in §10 (at minimum: learn-a-category, quiz, reward/chest, parent gate).
6. **Redlines / specs** sufficient to implement in React + CSS (token names, sizes, states, focus styles).
7. **Accessibility notes** per screen (contrast values, focus order, captions, reduced-motion behavior).

> Pair this brief with `UPGRADE_IDEAS.md` for the full feature rationale, competitor references, and the phased
> roadmap. When in doubt, optimize for a **non-reading 4-year-old**: big, warm, tappable, spoken, and forgiving.
</content>
