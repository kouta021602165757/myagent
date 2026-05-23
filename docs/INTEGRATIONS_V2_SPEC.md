# 🔌 Integrations V2 仕様書

> SNS V1 (X) に続き、 V2 で **10 個の新接続** を実装する設計書。
>
> X と同じ「Browser Extension primary」方針を貫き、 API は Search Console だけ。
> ユーザーは URL を貼るだけで接続、 投稿は拡張がブラウザの login state を使う。

---

## 1. 対応 integration 一覧 (= 全 11 個)

| Category | Service | 接続方式 | AI 用ツール |
|---|---|---|---|
| 📊 分析 | **Google Search Console** | OAuth (= API 必須) | `gsc_query` |
| 🐦 SNS | **LinkedIn** | Extension (URL paste) | `post_to_linkedin` |
| 🧵 SNS | **Threads** | Extension (URL paste) | `post_to_threads` |
| 📸 SNS | **Instagram** | Extension (URL paste) | `post_to_instagram` |
| 📘 SNS | **Facebook Page** | Extension (URL paste) | `post_to_facebook` |
| 🎵 SNS | **TikTok** | Extension (URL paste) | `post_to_tiktok` |
| 📹 SNS | **YouTube** | Extension (URL paste) | `post_to_youtube_community` |
| 📝 コンテンツ | **WordPress** | Extension (admin URL paste) | `publish_wordpress` |
| 📓 コンテンツ | **note** | Extension (URL paste) | `publish_note` |
| 🛒 EC | **Shopify** | Extension (admin URL paste) | `shopify_update_product` |
| 🛒 EC | **BASE** | Extension (admin URL paste) | `base_update_product` |

---

## 2. 共通アーキテクチャ

### 2-A. 接続方式 (= 10/11 で同じ Pattern)

**URL paste 接続:**
```
ユーザー: 設定 → 接続 tab → 「LinkedIn 接続」 クリック
   ↓ modal 開く
URL or username 入力 (= https://www.linkedin.com/in/yourname / @yourname / yourname)
   ↓ 送信
サーバー: handle 抽出 → user.sns_connections.<platform> に保存
   ↓
「✅ LinkedIn 接続完了 (@yourname)」
```

### 2-B. 投稿実行フロー (= 既存 X と同じ)

```
AI が post_to_<platform> tool 呼び出し
   ↓
サーバー: executeExtensionTool を sequence 呼び出し:
  1. ext_open_url('https://platform.com/compose/...')
  2. ext_wait + ext_type で投稿内容入力
  3. 必要に応じて画像 / 動画 upload (ext_upload_file)
  4. ext_click で投稿ボタンクリック
  5. ext_read_page で投稿 URL 取得
   ↓
結果: { ok, url, post_id }
```

### 2-C. 拡張側の DOM 自動化 (= cs_* に platform 別の selector を持つ)

新しい platform を追加する時の最小作業:
1. Server に AI tool 定義追加 (`SNS_TOOLS` array)
2. Server に DOM 自動化 sequence 実装 (`executePostTo<Platform>Tool`)
3. UI の接続 tab に card 追加 (= status 表示と connect modal)
4. URL paste の handle 抽出 regex 追加

---

## 3. 各 integration の詳細

### 📊 Google Search Console

**接続方式:** OAuth 2.0 (= Google APIs)

**理由:** 検索データ (queries / impressions / clicks / position) は DOM scraping が遅すぎる + GSC は表示量が膨大。 OAuth で API 経由が defacto。

**スコープ:** `https://www.googleapis.com/auth/webmasters.readonly`

**注:** 既存の Google OAuth (Calendar / Sheets / GA4) と統合する設計 — refresh_token 共用 + scope だけ追加要求。

**AI ツール:**
```typescript
gsc_query({
  start_date?: string,        // ISO date, default: 28daysAgo
  end_date?: string,
  dimensions?: ('query'|'page'|'country'|'device')[],
  row_limit?: number,         // default 25, max 100
  filters?: { dimension, operator, expression }[],
}): { rows: [{ keys[], clicks, impressions, ctr, position }] }
```

**用途:**
- AEO / SEO 課が施策ターゲットを決める根拠
- 数字 tab の Search Console モジュールに表示
- 戦略 tab の persona / 競合分析に「実際の検索キーワード」 を反映

---

### 💼 LinkedIn

**接続方式:** Extension (URL paste)

**URL pattern:** `https://www.linkedin.com/in/{username}` または `@username`

**投稿 URL:** `https://www.linkedin.com/feed/?shareActive=true` (= 投稿モーダルを直接開く)

**DOM 自動化:**
- Textarea: `[data-test-id="share-form-text-area"]` or `[contenteditable="true"][aria-label*="投稿"]`
- 投稿ボタン: `[data-test-id="share-actions__primary-action"]` or button text "投稿"
- 投稿後 redirect: feed URL に戻る → 「投稿しました」 toast

**AI ツール:**
```typescript
post_to_linkedin({
  text: string,                    // 3000 字以内 (1300 で「もっと見る」)
  media?: string[],                // 画像 1 枚 or 動画 1 個
  visibility?: 'public'|'connections',  // default: public
  type?: 'post'|'article',         // article は別フロー
})
```

**用途:**
- B2B 向け週次投稿、 個人ブランディング、 求人投稿、 ケーススタディ展開
- portfolio / saas vertical で重要

---

### 🧵 Threads

**接続方式:** Extension (URL paste)

**URL pattern:** `https://www.threads.com/@{username}` or `https://www.threads.net/@{username}` または `@username`

**投稿 URL:** `https://www.threads.com/` の compose modal を開く

**DOM 自動化:**
- 「新規投稿」 button: `[aria-label*="新規スレッド"]` or `[role="button"]` with "投稿" text
- Textarea: `[contenteditable="true"][aria-label*="投稿"]`
- 投稿ボタン: button text "投稿する"

**AI ツール:**
```typescript
post_to_threads({
  text: string,                    // 500 字以内
  media?: string[],                // 画像 10 枚 or 動画 1 個
  link?: string,                   // リンクカード自動展開
})
```

**用途:**
- X と相互配信 (= 同じ投稿を Threads にも)
- Z 世代向け / 文章長め投稿の主戦場

---

### 📸 Instagram

**接続方式:** Extension (URL paste)

**URL pattern:** `https://www.instagram.com/{username}` または `@username`

**注意:** Instagram の投稿は **画像必須**。 テキストのみ投稿不可。

**投稿 URL:** `https://www.instagram.com/?next=create/style` または home → 「+ Create」 button

**DOM 自動化:**
1. Create button: `[aria-label="新規投稿"]` or `[aria-label="Create"]`
2. ファイル選択: `input[type="file"][accept*="image"]` に `ext_upload_file` で画像 push
3. 「次へ」 → 「次へ」 (フィルタ / 編集はスキップ)
4. キャプション textarea: `[aria-label="キャプションを入力..."]`
5. 「シェア」 button: `[role="button"]` with "シェア" text

**AI ツール:**
```typescript
post_to_instagram({
  caption: string,                 // 2200 字以内 + ハッシュタグ
  media: string[],                 // 画像 URL or data URL 必須、 1-10 枚
  type?: 'feed'|'reels'|'story',   // default: feed
})
```

**用途:**
- EC vertical / 店舗 vertical の主戦場
- AI 画像生成と連動して「画像 + キャプション + ハッシュタグ」を一気に投稿

---

### 📘 Facebook Page

**接続方式:** Extension (URL paste)

**URL pattern:** `https://www.facebook.com/{pageid}` or `https://www.facebook.com/yourpage`

**投稿 URL:** `https://www.facebook.com/{pageid}/posts/new`

**DOM 自動化:**
- 「投稿を作成」 button → modal 開く
- Textarea: `[contenteditable="true"][role="textbox"]`
- 「投稿」 button: button text "投稿"

**AI ツール:**
```typescript
post_to_facebook({
  text: string,                    // ~63206 字 (実質無制限)
  media?: string[],                // 画像 / 動画
  link?: string,
})
```

**用途:**
- 地域店舗 / B2B 企業ページ
- store vertical で重要

---

### 🎵 TikTok

**接続方式:** Extension (URL paste)

**URL pattern:** `https://www.tiktok.com/@{username}`

**投稿 URL:** `https://www.tiktok.com/upload` (= デスクトップアップロードページ)

**DOM 自動化:**
- ファイル選択: `input[type="file"][accept*="video"]` に `ext_upload_file` で動画 push
- キャプション textarea: `[contenteditable="true"]` (ハッシュタグ用)
- 「投稿」 button: button text "Post" or "投稿"

**注意:** TikTok は動画必須 (= 写真投稿は別フロー)。AI が動画生成 → 投稿が理想だが V2 では 「ユーザーが既にある動画 URL を AI に渡す」 pattern も対応。

**AI ツール:**
```typescript
post_to_tiktok({
  video: string,                   // 動画 URL or data URL 必須
  caption: string,                 // 2200 字以内 + ハッシュタグ
})
```

**用途:**
- Z 世代訴求、 EC / 店舗 / 個人ブランドのリーチ拡大

---

### 📹 YouTube (Community Post)

**接続方式:** Extension (URL paste)

**URL pattern:** `https://www.youtube.com/@{channel}` or `https://www.youtube.com/channel/{id}`

**投稿 URL:** YouTube Studio (`https://studio.youtube.com/`) → community tab

**DOM 自動化:**
- Studio に navigate → community → 「投稿を作成」
- Textarea: `[contenteditable="true"]`
- 投稿: button text "投稿"

**注意:** YouTube Community Post は **チャンネル登録者 500+ で開放**。Premium 機能ではないが、新規チャンネルでは利用不可。

**AI ツール:**
```typescript
post_to_youtube_community({
  text: string,                    // 投稿本文
  image?: string,                  // 画像 1 枚
  poll?: { question, options[] },  // 投票
})
```

**用途:**
- YouTube チャンネル運営者 (= blog / portfolio vertical の一部)

---

### 📝 WordPress

**接続方式:** Extension (admin URL paste)

**URL pattern:** `https://yoursite.com/wp-admin` または `https://yoursite.com` (= 自動で wp-admin を推定)

**注意:** WordPress は site_url が既にあるので、わざわざ URL paste 不要かも。AI チームのサイト URL = WP サイトの場合は自動で接続可能と想定。

**投稿 URL:** `{site_url}/wp-admin/post-new.php`

**DOM 自動化:**
- (Gutenberg block editor 想定)
- タイトル input: `.editor-post-title__input`
- 本文: paragraph blocks に block ごとに type
- カテゴリ / タグ 設定 (= sidebar)
- 「下書き保存」 or 「公開」 button

**AI ツール:**
```typescript
publish_wordpress({
  title: string,
  content: string,                 // HTML or markdown
  status?: 'draft'|'publish',      // default: draft
  category?: string,
  tags?: string[],
  featured_image?: string,         // URL or data URL
})
```

**用途:**
- blog vertical の主戦場
- AI ライターが書いた記事をそのまま下書き保存 → ユーザー確認 → 公開

---

### 📓 note

**接続方式:** Extension (URL paste)

**URL pattern:** `https://note.com/{username}`

**投稿 URL:** `https://note.com/notes/new`

**DOM 自動化:**
- タイトル: `[placeholder*="タイトル"]`
- 本文: `[contenteditable="true"]`
- 「下書き保存」 or 「公開」 button

**AI ツール:**
```typescript
publish_note({
  title: string,
  content: string,                 // 本文 (markdown 風 → note の formatting に変換)
  status?: 'draft'|'publish',
  tags?: string[],                 // ハッシュタグ
  free_zone?: number,              // 有料記事の場合、無料公開する文字数
  price?: number,                  // 円
})
```

**用途:**
- 日本市場のメディア / 個人ブランド
- blog vertical (日本) で WordPress と並ぶ重要 platform

---

### 🛒 Shopify

**接続方式:** Extension (admin URL paste)

**URL pattern:** `https://{shop}.myshopify.com/admin`

**注意:** Shopify は API tier がカスタム (Custom App / Private App) で OAuth 必要だが、 V2 は admin UI 経由でも DOM 自動化可能。

**主な操作:**
1. 商品ページ説明文を AI が書き換える
2. 商品タイトルの SEO 最適化
3. 商品画像の代替テキスト追加
4. 売上 / 受注一覧の取得

**AI ツール:**
```typescript
shopify_update_product({
  product_id: string,              // または URL slug
  title?: string,
  description?: string,             // HTML
  meta_title?: string,              // SEO
  meta_description?: string,
}): { ok, product_url }

shopify_list_orders({
  status?: 'open'|'closed'|'any',
  limit?: number,
}): { orders: [{ id, total, customer, created_at }] }
```

**DOM 自動化:**
- admin → Products → 該当商品 → 説明欄 textarea → 入力 → 「保存」 button
- admin → Orders → 一覧テーブル → 行抽出

**用途:**
- ec vertical の主戦場
- 商品ライター部門が SEO 最適化を自動投入

---

### 🛒 BASE

**接続方式:** Extension (admin URL paste)

**URL pattern:** `https://admin.thebase.in/`

**主な操作:** Shopify と同じ (商品ページ最適化 + 受注確認)

**AI ツール:**
```typescript
base_update_product({...}): {...}
base_list_orders({...}): {...}
```

**用途:**
- 日本市場の小規模 EC
- store / ec vertical の日本ユーザー

---

## 4. データモデル

`user.sns_connections` に platform 別に保存 (= 既存の X と同じ shape):

```typescript
user.sns_connections = {
  x:          { connected: true, profile: { username: '@kota', url: 'https://x.com/kota' }, method: 'manual_url', connected_at: '...' },
  linkedin:   { connected: true, profile: { username: '@kota_takeuchi', url: '...' }, method: 'manual_url', connected_at: '...' },
  threads:    { ... },
  instagram:  { ... },
  facebook:   { connected: true, profile: { page_id: '12345', page_name: 'My Shop', url: '...' }, ... },
  tiktok:     { connected: true, profile: { username: '@kota_tk', url: '...' }, ... },
  youtube:    { connected: true, profile: { channel_id: 'UC...', channel_name: 'kota channel', url: '...' }, ... },
  wordpress:  { connected: true, profile: { admin_url: 'https://yoursite.com/wp-admin', site_name: '...' }, ... },
  note:       { connected: true, profile: { username: 'kota_takeuchi', url: '...' }, ... },
  shopify:    { connected: true, profile: { shop_domain: 'myshop.myshopify.com', shop_name: '...' }, ... },
  base:       { connected: true, profile: { admin_url: 'https://admin.thebase.in/', shop_id: '...' }, ... },
}
```

GSC は既存 OAuth と同じ場所 (`user.google_oauth.scopes` に `webmasters.readonly` 追加):
```typescript
user.google_oauth = {
  refresh_token: '...',
  scopes: ['calendar', 'sheets', 'webmasters.readonly', ...],
}
```

---

## 5. REST endpoints (= URL paste 用)

各 platform で同じ pattern:

```
POST /api/sns/connect/<platform>     { url|handle }   → 接続
POST /api/sns/disconnect/<platform>  → 切断
```

`<platform>` ∈ { linkedin, threads, instagram, facebook, tiktok, youtube, wordpress, note, shopify, base }

GSC のみ別 OAuth flow:
```
GET  /api/oauth/gsc/start    → Google OAuth 開始
GET  /api/oauth/gsc/callback → callback でトークン保存
```

---

## 6. 実装フェーズ

### V2.1 (= 2 週間想定) — 高優先度
1. **LinkedIn** (= B2B / portfolio vertical の即効性)
2. **WordPress** (= blog vertical の主戦場)
3. **note** (= 日本ブログの主戦場)

### V2.2 (= 3 週間目)
4. **Threads** (= X と相互配信)
5. **Facebook Page** (= 店舗 vertical / B2B)

### V2.3 (= 4 週間目) — 視覚系
6. **Instagram** (= 画像投稿フロー追加開発要)
7. **YouTube Community Post** (= テキスト投稿のみ)

### V2.4 (= 5-6 週間目)
8. **TikTok** (= 動画投稿フロー、 ユーザーが動画 URL 持参 pattern)
9. **Google Search Console** (= OAuth + API、既存 Google 連携と統合)

### V2.5 (= 7-8 週間目) — EC vertical
10. **Shopify** (= admin DOM 自動化、 商品 update が中心)
11. **BASE** (= 日本 EC の同等機能)

---

## 7. AI ツールの buildSystem 注入 (= prompt rules)

各 platform の制約と best practice を agent.persona / siteAgentNote に注入。

```
【LinkedIn 投稿】 3000 字以内 / 改行多めで read more 誘導 / B2B トーン / 数字 + 具体例
【Threads 投稿】 500 字以内 / Z 世代調 / 絵文字多め / 画像があれば必ず添付
【Instagram 投稿】 画像 必須 / キャプション 2200 字 / ハッシュタグ 5-10 個 / Reels は 30-60 秒
【Facebook Page 投稿】 文字数は気にしない / Page tone / リンク貼ると埋め込みが綺麗
【TikTok 投稿】 縦動画 60 秒以内 / Hook は 1 秒目 / キャプションに hashtag 5 個程度
【YouTube Community】 画像 1 枚 + 投票 + テキスト / チャンネル登録者 500+ 必要
【WordPress 公開】 Gutenberg blocks (= 見出し / 本文 / 画像 / 引用) / カテゴリ + タグ
【note 公開】 H1 タイトル + 各 H2 で章分け / ハッシュタグ 3-5 個 / 有料記事は free_zone 設定可
【Shopify 商品更新】 SEO meta title (60 字) + description (160 字) / 商品本文に Bullet / 画像 alt
【BASE 商品更新】 Shopify と同じパターン
```

---

## 8. セキュリティ / TOS 配慮

### 規約準拠の確認
全 platform で「ユーザー本人のブラウザでのみ自動操作」 = TOS 違反ではない (= Buffer / Hootsuite と同じ規約解釈)。

**ただし platform 固有のリスク:**
- **Instagram**: 過度な自動投稿は spam 判定 → 1 日 5 投稿上限を server 側で enforce
- **LinkedIn**: connection request の自動化は規約違反 → 投稿のみに制限
- **TikTok**: 自動投稿のラベル付け推奨 (= caption に "[AI 投稿]" は不要、 通常投稿として扱う)

### Rate Limit (= 内部で enforce)
- 各 platform: 24h 以内 5 投稿まで (= spam 防止)
- 同じ platform に連続投稿は 30 分間隔
- AI 自動投稿モード ON 時もこの上限を超えない

### 接続誤りの安全装置
- URL paste で他人 URL を貼っても、 実投稿は **拡張 + ブラウザ login state** に従う
- 投稿 confirm モーダルで「投稿先: @表示中の handle」 を明示
- mismatch 検知時に warning 表示 (V2 で追加)

---

## 9. 環境変数

V2 で追加が必要なもの:
```
# Google Search Console (= 既存 google oauth scope に追加)
GOOGLE_OAUTH_CLIENT_ID=<既存>
GOOGLE_OAUTH_CLIENT_SECRET=<既存>
# (新 env なし、既存に webmasters.readonly scope を含めて再認可)
```

**他の platform は env 不要** (= 全部 Extension 経由)。

---

## 10. 成功指標

- **接続率**: 拡張 install 済みユーザーの中で 2 つ以上 SNS 接続済の比率 (目標 V2 終了時 40%+)
- **投稿成功率**: 各 platform で 90%+
- **AI 経由投稿数**: 1 ユーザー / 月 20 投稿+ (= X 単独より高い)
- **vertical 特化メトリクス**:
  - EC vertical: Shopify 接続 → 商品ページ更新 / 月 5 回+
  - blog vertical: WordPress 接続 → 記事公開 / 月 4 回+
  - portfolio vertical: LinkedIn 接続 → 投稿 / 月 8 回+

---

## 11. オープンクエスチョン

1. **WordPress.com vs Self-Hosted**: Self-Hosted の wp-admin DOM はサイトテーマで微妙に違う → 全環境対応は難しい。 V2.1 は Gutenberg + Twenty Twenty-* テーマ系のみ正式対応?
2. **Instagram / TikTok の画像 / 動画**: AI 生成した画像をどう upload するか? `ext_upload_file` で data URL を直接アップロード可能か?
3. **Shopify 商品の特定**: AI が「この商品を SEO 最適化」する時、商品 ID はどう知る? `shopify_list_products()` ツール先に必要?
4. **TikTok 動画生成**: V2 で AI が動画も生成する? それともユーザーが用意した動画 URL を渡す pattern のみ?
5. **YouTube Community Post 500+ subscriber 制限**: 接続時に subscriber 数チェックして、 < 500 なら警告表示する?

---

## 12. 提案する初手 (= まず動かすもの)

最も影響が大きいのは **LinkedIn + WordPress + note の 3 つ** (V2.1)。理由:

- **LinkedIn**: B2B / portfolio vertical の即効。投稿の structure (Hook + Story + CTA) が決まってて自動化しやすい
- **WordPress**: blog vertical の主戦場。 SEO ライター部門の納品物が「下書き保存 → ユーザー確認 → 公開」 flow に直結
- **note**: 日本市場で WordPress と並ぶ。 ユーザー数の多い JP インディー作家層を取り込める

3 つで実装パターンが固まる + ユーザーフィードバックを取ってから他に展開、 が安全。
