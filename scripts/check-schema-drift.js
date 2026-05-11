#!/usr/bin/env node
/**
 * Schema drift check — diff fields that server/index.js writes to user.*
 * against the actual columns present in the Supabase `users` table.
 *
 * Runs against production Supabase using SUPABASE_URL + SUPABASE_SERVICE_KEY
 * from the env (loaded from .env if present). Exits 1 on drift so CI can
 * block deploys with missing columns.
 *
 *   node scripts/check-schema-drift.js
 *
 * Why this exists: 12 columns silently dropped via DB.create's auto-drop
 * loop went unnoticed for weeks because the API kept returning 200. This
 * script makes that failure mode loud.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

// ── load .env (very lightweight) ─────────────────────────────
try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    });
  }
} catch {}

const SU = process.env.SUPABASE_URL;
const SK = process.env.SUPABASE_SERVICE_KEY;
if (!SU || !SK) {
  console.error('SUPABASE_URL or SUPABASE_SERVICE_KEY missing');
  process.exit(2);
}

// ── columns the code writes ──────────────────────────────────
// Hand-curated list — keep in sync with newUser() in server/index.js. The
// alternative (regex-scan the source) gave too many false positives because
// not every user.* read is a write.
const EXPECTED = [
  // identity
  'id', 'name', 'email', 'password', 'verified', 'verify_token',
  'reset_token', 'reset_expiry', 'created_at',
  // plan / billing
  'plan', 'balance_jpy', 'usage_count', 'billing_history',
  'stripe_customer_id', 'subscription_id', 'subscription_status',
  'balance_jpy_pending', 'balance_jpy_available',
  'revenue_history', 'payout_history',
  // creator / marketplace
  'is_verified', 'favorites', 'agents',
  'stripe_connect_id', 'stripe_connect_payouts_enabled',
  'stripe_connect_charges_enabled', 'stripe_connect_details_submitted',
  // founder 100
  'is_founder', 'founder_seat_no', 'founder_granted_at', 'business_trial_until',
  // referrals
  'referral_code', 'referred_by', 'referral_stats',
  // profile / activity
  'role', 'handle', 'login_history', 'memories',
  'chat_pinned', 'reactions',
  // admin
  'is_admin',
  // integrations
  'google_oauth', 'outgoing_webhooks',
  'extension_device_id', 'extension_device_token', 'extension_device_meta',
  'mobile_devices', 'group_memberships',
];

async function probeColumn(col) {
  return new Promise((resolve) => {
    const u = new URL(SU + '/rest/v1/users?select=' + encodeURIComponent(col) + '&limit=1');
    const req = https.request({
      method: 'GET',
      hostname: u.hostname,
      path: u.pathname + u.search,
      headers: { apikey: SK, Authorization: 'Bearer ' + SK },
    }, (rs) => {
      let body = '';
      rs.on('data', c => body += c);
      rs.on('end', () => resolve({ col, code: rs.statusCode, body }));
    });
    req.on('error', e => resolve({ col, code: 0, body: e.message }));
    req.setTimeout(8000, () => { req.destroy(new Error('timeout')); });
    req.end();
  });
}

(async () => {
  const results = await Promise.all(EXPECTED.map(probeColumn));
  const missing = results.filter(r => r.code !== 200);
  const present = results.filter(r => r.code === 200);
  console.log(`✓ present: ${present.length} columns`);
  if (missing.length) {
    console.error(`✗ missing: ${missing.length} columns`);
    for (const m of missing) {
      const detail = (() => { try { return JSON.parse(m.body).message || ''; } catch { return m.body.slice(0,80); } })();
      console.error('  - ' + m.col + ' (HTTP ' + m.code + ': ' + detail + ')');
    }
    console.error('\nFix: add the missing columns to docs/SUPABASE_MIGRATION.sql and redeploy.');
    process.exit(1);
  }
  console.log('\nSchema in sync — no drift detected.');
})();
