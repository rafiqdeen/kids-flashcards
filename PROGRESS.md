# Pip Cards Implementation — PROGRESS

Source of truth: `design_handoff_pip_cards/README.md` > `Pip Cards v2.html` > reference JSX.
Verification log lives in `VERIFICATION.md` (created in Phase 1+).

## Phase status

| Phase | Status | Notes |
|---|---|---|
| 0 — Audit & plan | ✅ done | This document |
| 1 — Foundations | ✅ done | 15/15 checks; see VERIFICATION.md |
| 2 — Primitives | ✅ done | 23/23 checks; new code under `src/pip/` |
| 3 — Core loop | ✅ done | 40/40 behavioral + visual pass vs reference; legacy UI deleted |
| 4 — Quiz | ✅ done | 19/19 + visual pass; difficulty wired per README |
| 5 — Rewards + Paint | ✅ done | 36/36 + pixel-match visuals |
| 6 — Shell extras | ✅ done | 29/29 + visual; real SW toast, real parent stats |
| 7 — E2E + polish | ⏳ pending | |

---

## Phase 0 — Codebase audit

**Stack:** React 19.2 + Vite 5.4, `vite-plugin-pwa` 1.2 (`registerType: 'autoUpdate'`, `useRegisterSW` already used by `PWAUpdatePrompt`). No router library (view switch in `App.jsx`: `home | cards | quiz`). No test setup at all (no Playwright/Vitest). ESLint 9 flat config.

**Existing structure:**

- `src/App.jsx` (608 ln) — view switching, per-category `renderCardFront/Back` switch statements, inline `SpeakButton`, category name/color maps.
- `src/components/` — `CategorySelector` (609 ln + 1312 css), `CardDeck` (551 + 1313), `QuizMode` (321 + 821), `FlashCard` (58 + 771), `ProgressBar`, `PWAUpdatePrompt`, `ShapeSVG`, `illustrations/{Animal,Fruit}Illustrations.jsx`.
- `src/hooks/` — `useProgress` (key `kids-flashcards-progress`, shape `{cat:{viewed[],mastered[]}, lastCategory}`), `useSpeech` (hard-coded `en-IN`, Veena/Lekha preference, rate .6–.7 pitch 1.3, cancel-before-speak ✓), `useSound` (WebAudio sfx), `useTheme` (`documentElement.classList 'dark'`, key `theme`).
- `src/data/` — 12 category files, ~230 cards, **remote Unsplash/Flickr image URLs** (new design forbids raster/network art).
- `vite.config.js` — PWA manifest (theme `#667eea`), workbox runtime caching for unsplash/flickr/google-fonts.

## Migration plan (README → files)

New code goes in these locations; reference file noted in parens.

| README item | Target file | Replaces |
|---|---|---|
| Design tokens | `src/styles/tokens.css` (tokens.css verbatim) | `index.css` vars |
| Component/screen styles | `src/styles/app.css` (adapted app.css) | all per-component CSS |
| Theme/direction plumbing | `src/hooks/useSettings.js` → `data-theme`/`data-direction` on `#root` | `useTheme` |
| Speech + captions | `src/hooks/useSpeech.js` rewrite + `src/components/CaptionBar.jsx` (`announce` CustomEvent bus) | current `useSpeech` (keep voice-pick logic, add language setting, `speaking` state) |
| Icon set | `src/components/Icon.jsx` (components.jsx PATHS) | inline svgs |
| SpeakButton / FlashCard / CategoryTile / QuizOption / ProgressTrack / StreakBadge / Confetti | `src/components/*.jsx` (components.jsx) | `FlashCard.jsx`, parts of `CardDeck`, `QuizMode`, `ProgressBar` |
| Mascot | `src/components/Mascot.jsx` (mascot.jsx) | — new |
| Illu placeholder art | `src/art/Illu.jsx` (data.jsx Illu) | `ShapeSVG`, `illustrations/*`, emoji/photos |
| Category meta | `src/data/categories.js` (data.jsx CATS: id/name/icon/c1/c2) | App.jsx switch maps |
| Screens | `src/screens/{Onboarding,Home,Deck,Quiz,Rewards,Paint,MascotSheet,Parent}.jsx` (screens1–3.jsx) | `CategorySelector`, `CardDeck`, `QuizMode` |
| Global bits | `src/components/{UpdateToast,DailyGoalRing,WelcomeBack,KeyHelp}.jsx` (screens4.jsx) | `PWAUpdatePrompt` (UpdateToast keeps `useRegisterSW`) |
| Routing/shell | `App.jsx` rewrite: route switch + shared NAV array → sidebar (web) / bottom-nav (mobile) | current App.jsx |
| Persistence | `src/hooks/{useProgress,useDaily,useWelcomeBack}.js` on `pip-*` schema | `useProgress` |

## Deleted / replaced

- **Delete after migration:** `CategorySelector.{jsx,css}`, `CardDeck.{jsx,css}`, `QuizMode.{jsx,css}`, `FlashCard.{jsx,css}`, `ProgressBar.{jsx,css}`, `ShapeSVG.jsx`, `illustrations/`, `App.css`, `useTheme.js`, `PWAUpdatePrompt.{jsx,css}`.
- **Keep:** `useSound.js` (gated by `settings.sound`), all `src/data/*` card datasets (fields used by badges/quiz), PWA icon assets, `scripts/generate-icons.mjs`.
- **vite.config.js:** drop unsplash/flickr/google-fonts runtime caching (no network assets), update `theme_color` to `#fff3e2`-era branding once tokens land.
- **Not replicated** (per prompt): tweaks panel, device bezels, CDN/Babel, `window.*` globals, hard-coded parent stats, simulated update toast.

## Decisions (recorded per working discipline)

0. **UI prefs in `pip-settings`:** `theme`, `direction`, `mascot` persist as
   additional keys on the `pip-settings` schema (additive; README schema keys
   unchanged). Prototype kept these in the Tweaks panel, which is excluded.
   Default mascot is `pip` (brand) — the prototype's `TWEAK_DEFAULTS.mascot:
   "bear"` is reviewer scaffolding, README brand precedence applies.


1. **Card art:** existing datasets keep their fields, but rendering goes through `<Illu name={card.id} fallback={card.emoji}>`; cards without a bespoke outline render the emoji inside the chunky art chip (vector-consistent placeholder, swappable layer preserved). Remote `image` URLs are no longer rendered anywhere.
2. **Progress migration:** one-time read of `kids-flashcards-progress` → seed `pip-progress` with `{cat: mastered[]}` so existing kids don't lose mastery; old key left untouched.
3. **Quiz "Learn" nav target:** resumes `activeCat`, else `pip-progress` last non-empty category, else Home (README §Routes).
4. **Gallery storage:** localStorage with try/catch + cap 24 for v1 (no IndexedDB wrapper exists in codebase); revisit if quota errors observed in Phase 5 verification.
5. **Tooling added for the verification protocol:** Playwright + pixelmatch as devDependencies (screenshots of reference vs implementation). Justified by the prompt; not shipped to prod bundle.

### Phase 3 decisions

6. New code lives under `src/pip/` (screens/components/hooks/data/art) rather
   than scattered through `src/components` — keeps the redesign cohesive while
   legacy was being removed. Legacy components/hooks/styles deleted this phase.
7. Routes for later phases (quiz, rewards, paint, buddies, parent) render a
   kid-safe `ComingSoon` screen until their phase lands; onboarding gating
   arrives with Phase 6.
8. `CATEGORIES.count` derives from live datasets (e.g. colors is 17 in data,
   not the README's 9) — README "counts reflect live values" precedence.
9. Card adapter (`src/pip/data/cards.js`) reshapes all 12 legacy datasets to
   the reference card contract; ids preserved so migrated progress matches.
   Cards without bespoke Illu art render the emoji disc fallback (swappable
   art layer per Fidelity note). Remote image URLs are no longer used anywhere.

## Open diffs

None yet (no UI built).
