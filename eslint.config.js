import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // design_handoff_pip_cards holds the design-reference prototypes (Babel-in-
  // browser, window globals) — reference material, not app code.
  globalIgnores(['dist', 'design_handoff_pip_cards']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // also ignore unused component/constant-style ARGS (e.g. <Burst/>, <I/>,
      // <Star/> threaded as props and used only as JSX elements, which core
      // no-unused-vars does not count as a reference).
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // src/adventure/games/* are verbatim ports of the interactive prototype
    // mini-games. Their round-init effects, latest-state refs, and RNG spawns
    // are intentional and behavior-verified; the strict react-hooks@7 advisories
    // (which the prototype predates) would otherwise force risky rewrites.
    files: ['src/adventure/games/**/*.{js,jsx}', 'src/adventure/story/**/*.{js,jsx}', 'src/adventure/screens/Paint.jsx'],
    rules: {
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      // challenges.jsx co-locates the challenge components with the
      // COMIC_CHALLENGES lookup they populate (a dev-HMR-only concern).
      'react-refresh/only-export-components': 'off',
    },
  },
])
