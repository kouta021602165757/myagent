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

-- ── PostgREST のスキーマキャッシュをリロード ──────────────────────
NOTIFY pgrst, 'reload schema';

-- 確認: 全カラムが揃っているか
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'users'
-- ORDER BY ordinal_position;
