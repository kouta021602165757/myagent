#!/usr/bin/env node
// scripts/audit.js
// Recurring self-audit for the codebase. Runs cheap, deterministic checks that
// have historically caught real regressions:
//
//   - syntax errors in server/index.js and every inline <script> in app.html
//   - duplicate function definitions (paste-twice mistakes)
//   - .find(...).version style unsafe chaining (Ver-sync regressions)
//   - require('./xxx') of files not tracked in git (the seo-report.js outage)
//   - file-size growth (early warning before things get unwieldy)
//   - production /api/health (catches deploy-died-and-nobody-noticed)
//
// Usage:
//   node scripts/audit.js           # run all checks, exit 1 on failure
//   node scripts/audit.js --quick   # skip network checks (offline mode)
//
// Designed to be called from:
//   - npm run audit             (manual / pre-commit)
//   - .github/workflows/audit.yml (on push)
//   - "definitely before claiming a bug is fixed"

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const QUICK = process.argv.includes('--quick');

let fails = 0;
let warns = 0;

function ok(msg)   { console.log('  \x1b[32m✓\x1b[0m', msg); }
function fail(msg) { console.log('  \x1b[31m✗ FAIL\x1b[0m', msg); fails++; }
function warn(msg) { console.log('  \x1b[33m⚠ WARN\x1b[0m', msg); warns++; }
function head(msg) { console.log('\n\x1b[1m▶', msg + '\x1b[0m'); }

// ─────────────────────────────────────────────────────────────
// 1. Syntax — server/index.js
// ─────────────────────────────────────────────────────────────
head('Syntax: server/index.js');
try {
  execSync('node -c ' + path.join(ROOT, 'server/index.js'), { stdio: 'pipe' });
  ok('parses');
} catch (e) {
  fail('parse error:\n' + e.stderr.toString());
}

// ─────────────────────────────────────────────────────────────
// 2. Syntax — every inline <script> in app.html PLUS the extracted app.js
//    Catches mismatched braces, stray `}` etc. Both surfaces because we
//    moved the bulk of JS to public/app.js but a few inline scripts remain.
// ─────────────────────────────────────────────────────────────
head('Syntax: JS (inline + public/app.js)');
const appHtml = fs.readFileSync(path.join(ROOT, 'public/app.html'), 'utf8');
const scriptRe = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g;
let m, i = 0;
let scripts = [];
while ((m = scriptRe.exec(appHtml))) {
  i++;
  const before    = appHtml.slice(0, m.index);
  const startLine = (before.match(/\n/g) || []).length + 1;
  scripts.push({ idx: i, code: m[1], startLine, source: 'app.html' });
}
// Append the extracted main app.js if present (post-refactor). Treated as a
// single virtual <script> for the duplicate-name + safety checks below.
const appJsPath = path.join(ROOT, 'public/app.js');
if (fs.existsSync(appJsPath)) {
  scripts.push({ idx: scripts.length + 1, code: fs.readFileSync(appJsPath, 'utf8'), startLine: 1, source: 'public/app.js' });
}
let parsedAll = true;
for (const s of scripts) {
  try {
    new vm.Script(s.code, { filename: `${s.source}:script#${s.idx} @ L${s.startLine}` });
  } catch (e) {
    fail(`${s.source} script #${s.idx} (starts L${s.startLine}): ${e.message}`);
    parsedAll = false;
  }
}
if (parsedAll) ok(`${scripts.length} script source(s) parse`);

// ─────────────────────────────────────────────────────────────
// 3. Duplicate function definitions
//    The same `function foo(){}` defined twice is a paste-twice mistake
//    that JS silently accepts (last one wins). We've had it before.
// ─────────────────────────────────────────────────────────────
head('Duplicate function definitions');
function findDuplicates(src, label) {
  const seen = new Map();
  const dups = [];
  const re = /(?:^|\n)\s*function\s+([a-zA-Z_$][\w$]*)\s*\(/g;
  let mm;
  while ((mm = re.exec(src))) {
    const name = mm[1];
    const lineNo = (src.slice(0, mm.index).match(/\n/g) || []).length + 1;
    if (seen.has(name)) {
      dups.push({ name, first: seen.get(name), second: lineNo });
    } else {
      seen.set(name, lineNo);
    }
  }
  if (dups.length === 0) {
    ok(`${label}: no duplicate function names`);
  } else {
    // Multiple definitions can be legitimate inside different scopes,
    // so warn rather than fail unless they're clearly top-level.
    for (const d of dups) {
      warn(`${label}: function ${d.name}() defined twice — L${d.first} and L${d.second}`);
    }
  }
}
findDuplicates(scripts.map(s => s.code).join('\n//---\n'), 'app.html');
findDuplicates(fs.readFileSync(path.join(ROOT, 'server/index.js'), 'utf8'), 'server/index.js');

// ─────────────────────────────────────────────────────────────
// 4. Unsafe .find(...).property chaining
//    Pattern: `arr.find(...).foo` without `?.` — throws if find returns
//    undefined. The Ver-sync bug was exactly this shape.
// ─────────────────────────────────────────────────────────────
head('Unsafe .find(...).<prop> chains (would TypeError on missing)');
const allJs = scripts.map(s => s.code).join('\n//---\n') + '\n' + fs.readFileSync(path.join(ROOT, 'server/index.js'), 'utf8');
const unsafeFind = [];
const findRe = /\.find\s*\([^)]{0,200}\)\.[a-zA-Z_]/g;
let fm;
while ((fm = findRe.exec(allJs))) {
  const ctx = allJs.slice(Math.max(0, fm.index - 30), fm.index + fm[0].length + 20);
  // Allow .find(...)?.foo or .find(...) || {} fallbacks
  if (/\.find\s*\([^)]*\)\s*\?\./.test(ctx)) continue;
  if (/\.find\s*\([^)]*\)\s*\|\|/.test(ctx)) continue;
  unsafeFind.push(ctx.trim().slice(-90));
}
if (unsafeFind.length === 0) {
  ok('no unsafe .find().<prop> chains');
} else {
  // Many are likely fine in context (find immediately after creation, etc.)
  // Warn so we notice if the count grows.
  warn(`${unsafeFind.length} potentially unsafe chains (review):`);
  unsafeFind.slice(0, 5).forEach(x => console.log('       ', x));
  if (unsafeFind.length > 5) console.log('        ... and ' + (unsafeFind.length - 5) + ' more');
}

// ─────────────────────────────────────────────────────────────
// 5. require('./xxx') of files NOT in git
//    The seo-report.js outage: server/index.js required a local file
//    that was never `git add`-ed. Every deploy crashed on startup.
// ─────────────────────────────────────────────────────────────
head("require('./xxx') of git-untracked files");
const serverSrc = fs.readFileSync(path.join(ROOT, 'server/index.js'), 'utf8');
const reqRe = /require\(\s*['"](\.\/[^'"]+)['"]\s*\)/g;
let rm;
const localReqs = [];
while ((rm = reqRe.exec(serverSrc))) {
  localReqs.push(rm[1]);
}
let trackedSet = new Set();
try {
  const out = execSync('git ls-files', { cwd: ROOT }).toString();
  trackedSet = new Set(out.split('\n').filter(Boolean));
} catch (e) {
  warn('git not available — skipping tracked-file cross-check');
}
let missing = 0;
for (const rel of localReqs) {
  // server/index.js sits in server/, so ./foo resolves to server/foo
  let resolved = path.posix.join('server', rel.replace(/^\.\//, ''));
  // Try .js extension if not present
  const candidates = [resolved, resolved + '.js', resolved + '/index.js'];
  if (!candidates.some(c => trackedSet.has(c) || fs.existsSync(path.join(ROOT, c)))) {
    fail(`require('${rel}') — none of ${candidates.join(', ')} exist or are tracked`);
    missing++;
  }
}
if (missing === 0) ok(`${localReqs.length} local requires all resolve & are tracked`);

// ─────────────────────────────────────────────────────────────
// 6. File size growth (early warning)
// ─────────────────────────────────────────────────────────────
head('File size');
const sizeAppKb    = Math.round(fs.statSync(path.join(ROOT, 'public/app.html')).size / 1024);
const sizeServerKb = Math.round(fs.statSync(path.join(ROOT, 'server/index.js')).size / 1024);
const sizeJsKb     = fs.existsSync(path.join(ROOT, 'public/app.js'))  ? Math.round(fs.statSync(path.join(ROOT, 'public/app.js')).size  / 1024) : 0;
const sizeCssKb    = fs.existsSync(path.join(ROOT, 'public/app.css')) ? Math.round(fs.statSync(path.join(ROOT, 'public/app.css')).size / 1024) : 0;
console.log(`        public/app.html : ${sizeAppKb} KB`);
console.log(`        public/app.js   : ${sizeJsKb} KB`);
console.log(`        public/app.css  : ${sizeCssKb} KB`);
console.log(`        server/index.js : ${sizeServerKb} KB`);
const APP_LIMIT_KB    = 1500;
const JS_LIMIT_KB     = 1500;
const SERVER_LIMIT_KB = 1500;
if (sizeAppKb > APP_LIMIT_KB)       warn(`app.html exceeds ${APP_LIMIT_KB} KB — consider splitting`);
else                                ok(`app.html under ${APP_LIMIT_KB} KB limit`);
if (sizeJsKb > JS_LIMIT_KB)         warn(`app.js exceeds ${JS_LIMIT_KB} KB — consider splitting`);
else if (sizeJsKb > 0)              ok(`app.js under ${JS_LIMIT_KB} KB limit`);
if (sizeServerKb > SERVER_LIMIT_KB) warn(`server/index.js exceeds ${SERVER_LIMIT_KB} KB — consider splitting`);
else                                ok(`server/index.js under ${SERVER_LIMIT_KB} KB limit`);

// ─────────────────────────────────────────────────────────────
// 7. Production /api/health
//    Catches the case where the prod deploy is dead but nobody noticed.
// ─────────────────────────────────────────────────────────────
(async () => {
  if (!QUICK) {
    head('Production /api/health');
    const https = require('https');
    const url = 'https://myaiagents.agency/api/health';
    const got = await new Promise((resolve) => {
      const req = https.get(url, { timeout: 5000 }, (res) => {
        let body = '';
        res.on('data', (d) => body += d);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: 'timeout' }); });
      req.on('error', (e) => resolve({ status: 0, body: e.message }));
    });
    if (got.status === 200 && got.body.includes('"ok":true')) {
      ok('production responds with ok:true');
    } else {
      warn(`production /api/health: HTTP ${got.status} — ${got.body.slice(0, 200)}`);
    }
  } else {
    console.log('\n(skipping network checks in --quick mode)');
  }

  // ───────────────────────────────────────────────────────────
  console.log('');
  if (fails > 0) {
    console.log(`\x1b[31m✗ ${fails} failure(s)\x1b[0m, ${warns} warning(s)`);
    process.exit(1);
  } else if (warns > 0) {
    console.log(`\x1b[33m⚠ ${warns} warning(s)\x1b[0m — review above`);
    process.exit(0);
  } else {
    console.log('\x1b[32m✓ all checks passed\x1b[0m');
    process.exit(0);
  }
})();
