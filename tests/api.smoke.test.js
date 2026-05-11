/**
 * Critical-path API smoke tests.
 *
 * Boots the server in-process against a temporary local JSON DB (no Supabase /
 * Stripe / Anthropic env required) and hits the routes that touch revenue and
 * auth. The aim is to catch refactoring regressions before they reach prod —
 * not to exhaustively cover business logic.
 *
 * Run: `npm test`
 */
'use strict';

const test    = require('node:test');
const assert  = require('node:assert/strict');
const fs      = require('node:fs');
const path    = require('node:path');
const os      = require('node:os');

// Force-isolate from production:
//   1. SKIP_DOTENV stops server/index.js from reading the developer's .env
//      (which would otherwise inject real Supabase / Stripe keys).
//   2. Explicitly blank out anything inherited from the parent shell so even
//      `SUPABASE_URL=... npm test` cannot escape into prod.
process.env.SKIP_DOTENV = '1';
for (const k of [
  'SUPABASE_URL', 'SUPABASE_SERVICE_KEY',
  'STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRO_PRICE_ID', 'STRIPE_BIZ_PRICE_ID',
  'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET',
  'ANTHROPIC_API_KEY', 'RESEND_API_KEY', 'BRAVE_API_KEY',
]) delete process.env[k];

// Isolated temp DB for this run; cleaned up in the after() hook.
const TMP_DB = path.join(os.tmpdir(), 'myagent-test-db-' + Date.now() + '.json');
process.env.LDB_PATH = TMP_DB;
process.env.JWT_SECRET = 'test-secret-please-do-not-use-in-prod';
process.env.PORT = '0'; // ignored — we listen on 0 directly anyway

const server = require('../server/index.js');

let baseUrl;

test.before(async () => {
  await new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', resolve);
    server.once('error', reject);
  });
  const addr = server.address();
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

test.after(async () => {
  // Drop any lingering HTTP keep-alive sockets from fetch() before close() so
  // the test runner can exit cleanly instead of waiting for the agent timeout.
  if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
  await new Promise(r => server.close(r));
  try { fs.unlinkSync(TMP_DB); } catch {}
});

// ── helpers ─────────────────────────────────────────────────────────────────
async function req(method, pathname, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(baseUrl + pathname, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: res.status, data };
}

function uniqEmail(prefix = 'u') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.local`;
}

// ── public surface ──────────────────────────────────────────────────────────
test('GET /api/health returns 200 with ok flag', async () => {
  const r = await req('GET', '/api/health');
  assert.equal(r.status, 200);
  assert.equal(r.data.ok, true);
  assert.equal(typeof r.data.ts, 'number');
});

test('GET /api/config returns public flags only (no secrets)', async () => {
  const r = await req('GET', '/api/config');
  assert.equal(r.status, 200);
  assert.equal(typeof r.data.google_login_enabled, 'boolean');
  assert.equal(typeof r.data.stripe_enabled, 'boolean');
  // Anything that looks like a secret would be a regression.
  const serialized = JSON.stringify(r.data);
  assert.ok(!/sk_live|sk_test|service_role/.test(serialized),
    'config response leaked a secret-shaped value');
});

test('GET /api/marketplace returns a listings array', async () => {
  const r = await req('GET', '/api/marketplace');
  assert.equal(r.status, 200);
  // The shape can be {listings:[]} or {agents:[]} depending on implementation.
  // We just want a non-error JSON object — not a 500 from a refactor.
  assert.equal(typeof r.data, 'object');
  assert.notEqual(r.data, null);
});

// ── auth: signup / login / me ───────────────────────────────────────────────
test('POST /api/auth/signup creates a user and returns a JWT', async () => {
  const email = uniqEmail('signup');
  const r = await req('POST', '/api/auth/signup', {
    body: { name: 'Test User', email, password: 'password-123' },
  });
  assert.equal(r.status, 201);
  assert.ok(r.data.token, 'expected token in signup response');
  assert.equal(r.data.user.email, email);
  // The hashed password must never come back to the client.
  assert.equal(r.data.user.password, undefined);
});

test('POST /api/auth/signup rejects weak passwords', async () => {
  const r = await req('POST', '/api/auth/signup', {
    body: { name: 'X', email: uniqEmail('weak'), password: 'short' },
  });
  assert.equal(r.status, 400);
});

test('POST /api/auth/signup rejects duplicate email with 409', async () => {
  const email = uniqEmail('dup');
  const ok = await req('POST', '/api/auth/signup', {
    body: { name: 'A', email, password: 'password-123' },
  });
  assert.equal(ok.status, 201);

  const dup = await req('POST', '/api/auth/signup', {
    body: { name: 'B', email, password: 'password-123' },
  });
  assert.equal(dup.status, 409);
});

test('POST /api/auth/login with correct credentials returns a JWT', async () => {
  const email = uniqEmail('login');
  await req('POST', '/api/auth/signup', {
    body: { name: 'L', email, password: 'password-123' },
  });
  const r = await req('POST', '/api/auth/login', {
    body: { email, password: 'password-123' },
  });
  assert.equal(r.status, 200);
  assert.ok(r.data.token);
});

test('POST /api/auth/login with wrong password returns 401', async () => {
  const email = uniqEmail('badpw');
  await req('POST', '/api/auth/signup', {
    body: { name: 'L', email, password: 'password-123' },
  });
  const r = await req('POST', '/api/auth/login', {
    body: { email, password: 'wrong-password' },
  });
  assert.equal(r.status, 401);
});

test('GET /api/me without token returns 401', async () => {
  const r = await req('GET', '/api/me');
  assert.equal(r.status, 401);
});

test('GET /api/me with token returns the authed user', async () => {
  const email = uniqEmail('me');
  const sign = await req('POST', '/api/auth/signup', {
    body: { name: 'Me User', email, password: 'password-123' },
  });
  const r = await req('GET', '/api/me', { token: sign.data.token });
  assert.equal(r.status, 200);
  assert.equal(r.data.user.email, email);
});

// ── agents: create / list ───────────────────────────────────────────────────
test('POST /api/agents creates an agent and GET /api/agents lists it', async () => {
  const email = uniqEmail('ag');
  const sign = await req('POST', '/api/auth/signup', {
    body: { name: 'Agent Owner', email, password: 'password-123' },
  });
  const token = sign.data.token;

  const create = await req('POST', '/api/agents', {
    token,
    body: { avatar: '🤖', name: 'SEO Writer', skills: ['writing'], persona: 'helpful' },
  });
  assert.equal(create.status, 201);
  assert.ok(create.data.agent.id);
  assert.equal(create.data.agent.name, 'SEO Writer');

  const list = await req('GET', '/api/agents', { token });
  assert.equal(list.status, 200);
  assert.ok(Array.isArray(list.data.agents));
  const found = list.data.agents.find(a => a.id === create.data.agent.id);
  assert.ok(found, 'created agent should appear in the list');
});

test('POST /api/agents rejects request with no skills', async () => {
  const email = uniqEmail('noskill');
  const sign = await req('POST', '/api/auth/signup', {
    body: { name: 'X', email, password: 'password-123' },
  });
  const r = await req('POST', '/api/agents', {
    token: sign.data.token,
    body: { name: 'Nameless', skills: [] },
  });
  assert.equal(r.status, 400);
});

test('POST /api/agents without token returns 401', async () => {
  const r = await req('POST', '/api/agents', {
    body: { name: 'X', skills: ['x'] },
  });
  assert.equal(r.status, 401);
});

// ── Founder 100 ────────────────────────────────────────────────────────────
test('GET /api/founder/status is public and returns numeric counters', async () => {
  const r = await req('GET', '/api/founder/status');
  assert.equal(r.status, 200);
  assert.equal(typeof r.data.taken, 'number');
  assert.equal(typeof r.data.total, 'number');
  assert.equal(typeof r.data.remaining, 'number');
  assert.equal(typeof r.data.sold_out, 'boolean');
  // Math sanity
  assert.equal(r.data.remaining, r.data.total - r.data.taken);
});

test('Signup before the limit allocates a Founder seat (is_founder=true)', async () => {
  const r = await req('POST', '/api/auth/signup', {
    body: { name: 'F', email: uniqEmail('founder'), password: 'password-123' },
  });
  assert.equal(r.status, 201);
  // Server is empty for this test run, so we're well under the 100 cap.
  assert.equal(r.data.user.is_founder, true);
  assert.equal(typeof r.data.user.founder_seat_no, 'number');
  assert.ok(r.data.user.founder_seat_no >= 1);
  // Trial fields populated — used by /api/me lazy downgrade
  assert.ok(r.data.user.business_trial_until);
  assert.equal(r.data.user.plan, 'business');
});

// ── Onboarding ─────────────────────────────────────────────────────────────
test('POST /api/onboarding/dismiss flips the flag without creating agents', async () => {
  const email = uniqEmail('onb');
  const sign = await req('POST', '/api/auth/signup', {
    body: { name: 'O', email, password: 'password-123' },
  });
  const before = sign.data.user.onboarded_v1 || false;
  assert.equal(before, false);
  const r = await req('POST', '/api/onboarding/dismiss', { token: sign.data.token });
  assert.equal(r.status, 200);
  assert.equal(r.data.ok, true);
  // Re-fetch /api/me — the flag should now be true and no agents added
  const me = await req('GET', '/api/me', { token: sign.data.token });
  assert.equal(me.data.user.onboarded_v1, true);
  assert.ok(!me.data.user.agents || me.data.user.agents.length === 0);
});

test('POST /api/onboarding/quickstart rejects too-short goals', async () => {
  const sign = await req('POST', '/api/auth/signup', {
    body: { name: 'S', email: uniqEmail('short'), password: 'password-123' },
  });
  const r = await req('POST', '/api/onboarding/quickstart', {
    token: sign.data.token,
    body: { goal: 'hi', lang: 'en' },   // 2 chars, well under the 6-char min
  });
  assert.equal(r.status, 400);
});

// ── Marketing autopilot (admin-gated) ──────────────────────────────────────
test('GET /api/admin/marketing/today returns 403 for non-admin', async () => {
  const sign = await req('POST', '/api/auth/signup', {
    body: { name: 'Plain', email: uniqEmail('plain'), password: 'password-123' },
  });
  const r = await req('GET', '/api/admin/marketing/today', { token: sign.data.token });
  assert.equal(r.status, 403);
});

test('GET /api/admin/media-status returns 403 for non-admin', async () => {
  const sign = await req('POST', '/api/auth/signup', {
    body: { name: 'Plain2', email: uniqEmail('plain2'), password: 'password-123' },
  });
  const r = await req('GET', '/api/admin/media-status', { token: sign.data.token });
  assert.equal(r.status, 403);
});
