import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },

  /*
   * Chapter 25 — three rules relaxed for test-support code only.
   *
   * CI now fails on lint, so these had to be either fixed or justified rather than left as three
   * errors nobody looks at. They are justified: all three fire on helpers whose entire job is the
   * thing the rule forbids, and none of them fires anywhere in `src` outside test scaffolding.
   *
   *   react-hooks/immutability and react-hooks/globals
   *     `renderWithProviders` and `useCatalogueParams.test` render a probe component that writes
   *     what it sees — the current router location, the parsed query params — to a variable the
   *     test then asserts on. Writing to an outer variable during render is exactly what the rules
   *     forbid and exactly how you observe a hook's output from a test. Restructuring to satisfy
   *     them means either rendering the value into the DOM and parsing it back out, or a state
   *     hook that re-renders on every capture; both make the tests worse to read and neither makes
   *     them more correct.
   *
   *   react-refresh/only-export-components
   *     Fires because these files export helpers alongside a component. Fast Refresh is a *dev
   *     server* feature and these files are only ever loaded by Vitest, so the rule is guarding a
   *     scenario that cannot occur.
   *
   * Scoped by path rather than switched off globally, so the same mistakes in application code are
   * still errors.
   */
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/immutability': 'off',
      'react-hooks/globals': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
])
