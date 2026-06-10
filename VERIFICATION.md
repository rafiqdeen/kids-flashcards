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
