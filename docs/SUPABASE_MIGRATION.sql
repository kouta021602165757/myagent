-- ──────────────────────────────────────────────────────────────────
-- MY AI AGENT — Supabase users 表に欠けてるカラムを追加するマイグレーション
-- ──────────────────────────────────────────────────────────────────
-- 実行方法:
--   1. https://supabase.com/dashboard/project/<your-project>/sql/new
--   2. このファイルの中身を貼り付け
--   3. 「Run」 をクリック
--   4. すべて成功したらアプリで再試行 (プラン購読 → Free に戻らないか確認)
--
-- 既に存在するカラムは IF NOT EXISTS でスキップされる (再実行安全)
-- ──────────────────────────────────────────────────────────────────

-- ── マーケットプレイス: クリエイター収益台帳 ──────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance_jpy_pending      numeric DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance_jpy_available    numeric DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS revenue_history          jsonb   DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS payout_history           jsonb   DEFAULT '[]'::jsonb;

-- ── マーケットプレイス: お気に入り + 検証バッジ ───────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified              boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorites                jsonb   DEFAULT '[]'::jsonb;

-- ── Stripe Connect (クリエイター出金) ──────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_connect_id                text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_connect_payouts_enabled   boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_connect_charges_enabled   boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_connect_details_submitted boolean DEFAULT false;

-- ── サブスクリプション情報 ──────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_id     text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status text;

-- ── Admin / モデレーション ──────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- ── Google Sheets API 連携トークン ─────────────────────────────
-- 形式: { access_token, refresh_token, expires_at(unix ms), scope, email }
-- 切断時は null に戻す。
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_oauth jsonb;

-- ── ブラウザ拡張連携 (Phase 1) ─────────────────────────────────
-- token はトップレベル列で高速ルックアップ、メタは jsonb。
ALTER TABLE users ADD COLUMN IF NOT EXISTS extension_device_id    text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS extension_device_token text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS extension_device_meta  jsonb;

-- ── モバイル端末登録 (Phase 2) ─────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_devices         jsonb DEFAULT '[]'::jsonb;

-- ── グループチャット (Phase 3) ─────────────────────────────────
-- 他人がホストするグループへの参加メンバーシップ。
-- 各エントリ: {host_id, agent_id, joined_at}
ALTER TABLE users ADD COLUMN IF NOT EXISTS group_memberships      jsonb DEFAULT '[]'::jsonb;

-- ── AI 生成アーティファクト永続化 ────────────────────────────────
-- create_artifact ツールが書き出した HTML を DB に保存。Render 等の
-- ephemeral disk で /generated/ が消えても URL が生き残るための fallback。
-- 形式: [{id, filename, title, description, html, created_at, size}, ...]
-- 1 ユーザー 100 件まで (古いものから自動削除)。
ALTER TABLE users ADD COLUMN IF NOT EXISTS artifacts             jsonb DEFAULT '[]'::jsonb;

-- ── 外向き Webhook (Slack / Discord 通知連携) ────────────────────
-- 形式: { slack: 'https://hooks.slack.com/...', discord: 'https://discord.com/api/webhooks/...' }
-- AI が notify_slack / notify_discord ツールを使う時に参照する。
ALTER TABLE users ADD COLUMN IF NOT EXISTS outgoing_webhooks      jsonb DEFAULT '{}'::jsonb;

-- ── 公開クリエイターハンドル (/u/:handle) ────────────────────────
-- 3-30 文字の a-z0-9_, グローバルにユニーク。
ALTER TABLE users ADD COLUMN IF NOT EXISTS handle                 text;
CREATE UNIQUE INDEX IF NOT EXISTS users_handle_unique             ON users (handle) WHERE handle IS NOT NULL;

-- ── Founder 100 機構 (席番 1-100 を先着で割り当て) ───────────────
-- code は server/index.js のサインアップ処理で is_founder / founder_seat_no /
-- founder_granted_at / business_trial_until を書く。schema 未追加だと
-- DB.create の auto-drop で silently 失われ、UI バッジが常に外れる。
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_founder            boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS founder_seat_no       integer;
ALTER TABLE users ADD COLUMN IF NOT EXISTS founder_granted_at    text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_trial_until  text;

-- ── 紹介プログラム ────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code         text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by           text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_stats        jsonb DEFAULT '{"count":0,"last_at":null,"total_credit_jpy":0}'::jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS users_referral_code_unique     ON users (referral_code) WHERE referral_code IS NOT NULL;

-- ── ログイン履歴 / プロフィール拡張 / 長期メモリ / pin / リアクション ──
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_history         jsonb DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role                  text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS memories              jsonb DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS chat_pinned           jsonb DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reactions             jsonb DEFAULT '[]'::jsonb;

-- ── 統合 (Integrations) — 接続バグ防止の最重要列 ─────────────────
-- WordPress (sites[]) / Slack (multi-webhooks) / Zapier (multi-webhooks) /
-- Buffer OAuth / X (Twitter) OAuth / Google bundle (Gmail/Drive/GA4/...) /
-- Stripe Connect / Notion / その他 OAuth & API キーの保存先。
-- 形式: { wordpress:{sites:[...]}, slack:{webhooks:[...]}, github:{pat:...},
--        buffer:{access_token:...}, twitter:{access_token:...}, ... }
-- これが無いと「接続成功トースト出るのに次回 GET で未接続のまま」になる
-- (DB.save が unknown column を silently ドロップするため)。
ALTER TABLE users ADD COLUMN IF NOT EXISTS integrations         jsonb DEFAULT '{}'::jsonb;

-- ── GitHub PAT (top-level for fast lookup by tool dispatch) ──────
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_pat            text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_login          text;

-- ── 共有メモ / リマインダー / 購入履歴 / MCP / オンボ ─────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS notes                 jsonb DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reminders             jsonb DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS purchases             jsonb DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mcp_servers           jsonb DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarded_at          text;

-- ── マーケ系 last_* (重複通知ガード) ─────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_nudge_global_at  text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_stripe_event_at  text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_weekly_digest_at text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_attribution jsonb;

-- ── i18n / 互換フラグ ────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS lang                  text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sheets_connected boolean DEFAULT false;

-- ── 通知環境設定 ────────────────────────────────────────────────
-- グループで @<名前> でメンションされた時にメール通知を送るかどうか
-- 値: 'on' (デフォルト) | 'off'
-- 未設定 = 'on' (NULL / 列なし) でメール送信される。
ALTER TABLE users ADD COLUMN IF NOT EXISTS mention_email_pref    text;

-- ── PostgREST のスキーマキャッシュをリロード ──────────────────────
NOTIFY pgrst, 'reload schema';

-- ──────────────────────────────────────────────────────────────────
-- メディア機能 (= Phase A、 2026-06-01) — agent.media は agent JSONB 内、
-- ただし記事本文 (= body_html) は size が大きいので別 column に分離。
-- USER_COLS_LEAN には含めず、 GET /media/:slug 等の SSR でのみ SELECT。
-- ──────────────────────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS media_posts_full jsonb DEFAULT '{}'::jsonb;

-- ──────────────────────────────────────────────────────────────────
-- (OPTIONAL) 既存ユーザーを retroactively Founder 100 に登録するバックフィル
-- ──────────────────────────────────────────────────────────────────
-- Founder 100 機構を後付けした関係で、既存のサインアップ済みユーザーには
-- バッジが付かない (列が無かったため auto-drop されてた)。ビジネス判断で
-- 「最初の N 人を Founder 扱いにする」ならコメントを外して 1 度だけ実行。
--
-- WITH first_100 AS (
--   SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS seat
--   FROM users
--   WHERE password IS NOT NULL                      -- ボット seed user を除外
--   ORDER BY created_at ASC LIMIT 100
-- )
-- UPDATE users SET
--   is_founder = true,
--   founder_seat_no = f.seat,
--   founder_granted_at = users.created_at,
--   business_trial_until = (users.created_at::timestamptz + interval '30 days')::text
-- FROM first_100 f WHERE users.id = f.id;

-- 確認: 全カラムが揃っているか
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'users'
-- ORDER BY ordinal_position;
