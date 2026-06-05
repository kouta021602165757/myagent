# Phase 1b — DDL (= Supabase Dashboard で 1 回実行)

## 背景
[project_db_migration_2026_06] Phase 1a (= saveAgent による payload 軽量化) 完了 (commit `bfeb844` + `8da41a5`)。

Phase 1b は **新テーブル作成** が必要。 PostgREST 経由では DDL 不可、 Supabase Dashboard SQL Editor で 1 回 実行してください。

## 実行手順

1. https://supabase.com/dashboard/project/zhdfhvbvlchydzsetvfq → 左メニュー「SQL Editor」
2. 「New query」 で 下の SQL を 貼り付け
3. 「Run」

## DDL

```sql
-- ════════════════════════════════════════════════════
-- Phase 1b: 正規化テーブル 作成 (= 2026-06-05)
-- 目的: user.agents JSONB 5-7MB を 分割して 高速化
-- ════════════════════════════════════════════════════

-- 1. agents テーブル (= agent ごとに 1 行)
--    user.agents JSONB から meta だけ 抽出して 1 行/agent
CREATE TABLE IF NOT EXISTS agents (
  id text PRIMARY KEY,                -- agent.id (= ag_xxx)
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text,
  avatar text,
  persona text,
  site_url text,
  site_vertical text,
  is_group boolean DEFAULT false,
  is_team boolean DEFAULT false,
  media jsonb,                        -- media 設定 + categories
  media_slug text,                    -- INDEX 用 (= 検索 高速)
  org jsonb,                          -- AI チーム組織図
  strategy jsonb,
  roadmap jsonb,
  ga4_snapshot jsonb,
  history_total_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS agents_user_id_idx ON agents(user_id);
CREATE INDEX IF NOT EXISTS agents_media_slug_idx ON agents(media_slug) WHERE media_slug IS NOT NULL;

-- 2. chat_messages テーブル (= chat 1 メッセージ 1 行)
--    agent.history 配列 から 分離。 SELECT で「直近 50 件 だけ」 簡単に
CREATE TABLE IF NOT EXISTS chat_messages (
  id text PRIMARY KEY,                -- msg.id (= u_xxx / a_xxx)
  agent_id text NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,              -- denormalized for fast lookup
  role text NOT NULL,                 -- 'user' / 'assistant' / 'system'
  content text,
  time text,
  kind text,                          -- system_publish / system_publish_start 等
  thread_parent_id text,
  article_url text,
  article_title text,
  article_category text,
  cost_jpy numeric,
  tool_log jsonb,
  idx integer,                        -- order in history (= 元の配列 index)
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_messages_agent_idx ON chat_messages(agent_id, idx);
CREATE INDEX IF NOT EXISTS chat_messages_thread_idx ON chat_messages(thread_parent_id) WHERE thread_parent_id IS NOT NULL;

-- 3. media_posts テーブル (= 公開記事 メタ 1 行)
--    agent.media_posts_idx 配列 から 分離 + media_posts_full と 統合
CREATE TABLE IF NOT EXISTS media_posts (
  id text PRIMARY KEY,                -- post.id (= mpo_xxx)
  agent_id text NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  excerpt text,
  body_html text,                     -- 本文 (= media_posts_full から 統合)
  category_name text,
  tags text[],
  hero_image_url text,
  status text DEFAULT 'published',
  keyword text,
  published_at timestamptz,
  rewritten_at timestamptz,
  rewrite_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS media_posts_agent_idx ON media_posts(agent_id, published_at DESC);
CREATE INDEX IF NOT EXISTS media_posts_slug_idx ON media_posts(agent_id, slug);

-- 4. RLS (= service key access only、 API 経由は 既存 auth check で対応)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_posts ENABLE ROW LEVEL SECURITY;

-- service_role は 全 access (= server から sbReq で使う key)
CREATE POLICY "service_role full access" ON agents FOR ALL TO service_role USING (true);
CREATE POLICY "service_role full access" ON chat_messages FOR ALL TO service_role USING (true);
CREATE POLICY "service_role full access" ON media_posts FOR ALL TO service_role USING (true);
```

## 実行後 私に教えてください

1. 「DDL 実行完了」 と教えて頂ければ Phase 2 (= dual-write) に進みます
2. エラーが出たら エラー文 を 教えてください
3. 既存 table 名と衝突したら 名前変更 (= agents → user_agents 等) で対応

## Phase 2 以降

DDL 完了後:
- Phase 2: dual-write (= 既存 JSONB + 新テーブル 両方に書く)
- Phase 3: backfill (= 既存 JSONB → 新テーブル コピー)
- Phase 4: dual-read 検証 (= 1 週間 観察)
- Phase 5: 読み切替 (= endpoint 単位、 rollback 1 行で 可能)
- Phase 6: 旧 JSONB 廃止 (= 1-2 週間後)

各 phase は 独立 rollback 可能、 ダウンタイム 0、 UI/UX 0 変化 を 維持。
