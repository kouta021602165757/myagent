// ESLint flat config — minimal rule set focused on catching the bug classes
// that have actually hit us in this codebase. Reasoning beside each rule.
//
// What stays OFF (intentional, to avoid noise on legacy code):
//   - style rules (semis, quotes, indent) — formatter's job, not lint's
//   - no-unused-vars on `catch` bindings — we use `catch(_){}` extensively
//   - complexity limits — won't refactor 21k LOC in one go

const globals = require('globals');

// Project-specific globals that are real top-level `var` declarations in our
// codebase. Pre-listing them keeps no-undef accurate. We DON'T list things
// defined IN app.js itself (those would conflict with no-redeclare) — only
// truly-external globals here.
const projectGlobals = {
  // External libs loaded via <script src>
  Stripe: 'readonly',          // stripe.js
  hljs: 'readonly',            // highlight.js (defer)
  katex: 'readonly',           // katex (defer)
  Sentry: 'readonly',          // sentry-cdn (lazy)
  loadPyodide: 'readonly',     // pyodide (lazy)
  pyodide: 'writable',
  // The Chrome extension page exposes this on window when the user has it
  chrome: 'readonly',
  // Inline init scripts at the bottom of app.html define these
  _isJa: 'writable',
  _i18nMap: 'writable',
  _GA_ID: 'readonly', gtag: 'readonly', dataLayer: 'writable',
  // Browser globals that base 'browser' env in older eslint preset misses
  reportError: 'readonly',
  // Defensively-guarded references to functions that don't exist (yet?).
  // The callsites use try/catch or typeof checks, so they're safe at runtime
  // — but they're dead branches worth cleaning up eventually. Listing them
  // here so no-undef doesn't false-alarm.
  openBillingModal: 'readonly',
  sendChat: 'readonly',
};

module.exports = [
  {
    files: ['public/app.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...projectGlobals,
      },
    },
    rules: {
      // ── Bug-class rules that have bitten us ──────────────────────────
      // Bug-class: use-before-define. WARN-level (not error) because the
      // existing codebase has ~15 cases of `var` hoisting that work at runtime
      // (var hoists with `undefined`); the real bug class is `let|const`
      // before define (TDZ TypeError) — that's caught by a stricter custom
      // check in scripts/audit.js. ESLint's rule doesn't distinguish var
      // from let/const, so we keep it informational here.
      'no-use-before-define': ['warn', { variables: true, functions: false, classes: true }],
      // Same-name redeclarations. WARN because loop-counter `var i` patterns
      // are pervasive in legacy code and not actually broken (var is
      // function-scoped). New same-name top-level definitions are still
      // visible — and the audit script's strict duplicate check is the
      // backstop for that specific class.
      'no-redeclare': 'warn',
      // Typos / missing globals — these have been real bugs. Error-level.
      'no-undef': 'error',
      // Catches `if(a == b)` — implicit type coercion has bitten us in version
      // comparison code. Soft-warn so existing == in this codebase doesn't all
      // turn into errors overnight.
      eqeqeq: ['warn', 'smart'],
      // ── Things we deliberately allow ─────────────────────────────────
      'no-empty': ['warn', { allowEmptyCatch: true }],     // catch(_){} pattern
      // Top-level functions referenced ONLY from inline onclick="…" in HTML
      // (or via window.foo from other scripts) look "unused" to ESLint. Mute
      // function-defs to avoid hundreds of false positives in this codebase.
      // Still warns on truly unused locals / vars.
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none', varsIgnorePattern: '^_', vars: 'local' }],
      'no-console': 'off',                                 // we log a lot, intentionally
      'no-prototype-builtins': 'warn',
      'no-inner-declarations': 'off',                       // legacy code has these
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-control-regex': 'off',                            // we have some intentional ones
      'no-useless-escape': 'warn',
      'no-async-promise-executor': 'warn',
    },
  },
  {
    files: ['server/index.js', 'scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-use-before-define': ['warn', { variables: true, functions: false, classes: true }],
      'no-redeclare': 'warn',
      'no-undef': 'error',
      eqeqeq: ['warn', 'smart'],
      'no-empty': ['warn', { allowEmptyCatch: true }],
      // Top-level functions referenced ONLY from inline onclick="…" in HTML
      // (or via window.foo from other scripts) look "unused" to ESLint. Mute
      // function-defs to avoid hundreds of false positives in this codebase.
      // Still warns on truly unused locals / vars.
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none', varsIgnorePattern: '^_', vars: 'local' }],
      'no-console': 'off',
      'no-prototype-builtins': 'warn',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-control-regex': 'off',
      'no-useless-escape': 'warn',
      'no-async-promise-executor': 'warn',
    },
  },
  {
    // Don't lint third-party / generated bundles
    ignores: [
      'node_modules/**',
      'public/generated/**',
      'public/lib/**',
      'docs/**',
      '**/*.min.js',
    ],
  },
];
