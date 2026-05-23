# 📱 SNS Auto-Post Hub — 仕様書 (v1)

> MY AI Agent 上で SNS への自動投稿ができる「内蔵ツール群」を構築。
> ユーザーは Buffer / Hootsuite / Zapier を経由せず、MY AI Agent の
> 「SNS Hub」に各 SNS アカウントを接続するだけで、AI チームが投稿を
> 完結できるようにする。

---

## 1. 目的 (Why)

**現状の問題:**
- AI が X スレッドや LinkedIn 投稿を生成しても、 **ユーザーが手動でコピペして投稿** している
- = 「AI 雇った」のに「投稿は自分でやる」 という分断
- = AEO / SNS 戦略の実行が結局ユーザー作業

**ゴール:**
- AI チームの SNS 投稿担当が **本当に投稿できる** 状態を作る
- ユーザーは初回 OAuth 接続するだけ。以降は AI 任せ
- Buffer / Zapier を MY AI Agent が置き換える

---

## 2. 対応プラットフォーム (Phased)

### V1 (Phase 1) — 2 週間以内に出せる
| Platform | 接続方法 | 投稿 | 備考 |
|---|---|---|---|
| 🐦 X (Twitter) | (a) Browser Extension (既存) + (b) OAuth 1.0a / 2.0 | Tweet / Thread | Extension が primary、API は Pro tier 以上で |
| 🧵 Threads | Meta Graph API (OAuth 2.0) | 投稿 / 画像付き | 無料 |
| 💼 LinkedIn | LinkedIn OAuth 2.0 | 個人投稿 / 記事 | 無料 |

### V2 (Phase 2) — 1 ヶ月以内
| Platform | 接続方法 | 投稿 | 備考 |
|---|---|---|---|
| 📸 Instagram | Meta Graph API (Business アカウント + FB Page 連携必須) | Feed / Reel / Story | 制約多いが API は安定 |
| 📘 Facebook Page | Meta Graph API | 投稿 / 画像 | LinkedIn と同等 |
| 📌 Pinterest | Pinterest API v5 | Pin 作成 | API 無料 |

### V3 (Phase 3) — 2 ヶ月以内
| Platform | 接続方法 | 投稿 | 備考 |
|---|---|---|---|
| 🎵 TikTok | TikTok for Business API + Extension fallback | 動画 / 写真 | API 制限あり |
| 📹 YouTube | YouTube Data API v3 | Community Post / Shorts metadata | OAuth |
| 🔴 Reddit | Reddit OAuth | Post / Comment | サブレディット選択 UI |

---

## 3. AI ツール API 設計

### ツール命名規則
`post_to_<platform>` で統一。各ツールは AI agent から呼び出し可能。

### V1 ツール一覧

```typescript
// X (Twitter) — Tweet 投稿
post_to_x({
  text: string,                  // 280 字以内
  media?: string[],              // 画像 URL / data URL 最大 4 枚
  reply_to_tweet_id?: string,    // リプライ時
  via?: 'extension' | 'oauth',   // default: extension (= ユーザー browser)
}): { ok: boolean, tweet_id: string, url: string }

// X — スレッド投稿 (= 複数 Tweet を連続投稿)
post_to_x_thread({
  tweets: Array<{ text: string, media?: string[] }>,  // 2-25 個
  via?: 'extension' | 'oauth',
}): { ok: boolean, thread_url: string, tweet_ids: string[] }

// Threads
post_to_threads({
  text: string,                  // 500 字以内
  media?: string[],              // 画像 / 動画
  link?: string,                 // リンクカード
}): { ok: boolean, post_id: string, url: string }

// LinkedIn
post_to_linkedin({
  text: string,                  // 3000 字以内
  type?: 'post' | 'article',     // default: post
  article_title?: string,        // type=article 時
  media?: string,                // 画像 1 枚
  visibility?: 'public' | 'connections',  // default: public
}): { ok: boolean, post_urn: string, url: string }
```

### 共通の戻り値

成功:
```json
{ "ok": true, "platform": "x", "post_url": "https://x.com/...", "post_id": "..." }
```

失敗:
```json
{ "error": "auth_expired" | "rate_limited" | "validation" | "platform_error",
  "detail": "...", "retry_after_sec": 60 }
```

---

## 4. 接続方法 (Auth)

### 4-A. OAuth (推奨 / V1 デフォルト)
- MY AI Agent が OAuth App を保有
- ユーザーは「接続する」ボタン → 各 SNS のログイン画面へ redirect → callback で access_token 取得
- Refresh token で自動更新

### 4-B. Browser Extension (X / TikTok 用)
- 既存の MY AI Agent Chrome 拡張を利用
- ユーザーの **ブラウザのログイン状態をそのまま使う** ため API 不要
- API 制限が厳しい / 高価な platform で primary
- 既存に `ext_post_x` が実装済み → これを SNS Hub から呼ぶ

### 4-C. Personal Access Token (= 上級者 fallback)
- 一部 platform で OAuth 失敗時に PAT 入力できる UI
- 暗号化して保存

---

## 5. データモデル

```typescript
user.sns_connections = {
  x: {
    method: 'extension' | 'oauth_2' | 'oauth_1a',
    access_token?: string,        // 暗号化 (Supabase Vault 想定)
    refresh_token?: string,
    expires_at?: string,           // ISO8601
    profile: {
      username: string,            // @handle
      display_name: string,
      avatar_url: string,
      followers_count?: number,    // 接続時の snapshot
    },
    scope: string[],
    connected_at: string,
  },
  threads: { ... 同じ構造 ... },
  linkedin: { ... },
}
```

**保存場所:** `users` テーブルの `sns_connections` JSONB カラム (新規)。
暗号化は `node:crypto` AES-256-GCM、key は `process.env.SNS_TOKEN_KEY`。

---

## 6. UI / UX フロー

### 6-A. 接続管理ページ
- 場所: ダッシュボード「⚙ 設定」 tab に「📱 SNS 接続」セクション追加
- 各 platform カード: ロゴ + 接続状態 (🟢 接続済 / 🔘 未接続) + [接続] / [切断]
- 接続済みカード: アカウント名 / フォロワー数 / 最終投稿日時

### 6-B. OAuth フロー
1. ユーザー [接続] クリック
2. `/api/sns/connect/x` → 302 redirect to X OAuth page
3. ユーザー認可
4. callback `/api/sns/callback/x?code=...` → token 取得 → DB 保存
5. ダッシュボードに戻る → 「✅ 接続完了」 toast

### 6-C. AI 投稿フロー (= ユーザー視点)
1. ユーザー: チャットで「今日の X 投稿作って」
2. AI: スレッド案を artifact として生成
3. AI: 「投稿しますか? (はい / 編集してから / 後で)」 と confirm UI
4. ユーザー: 「はい」
5. AI: `post_to_x_thread` ツール呼び出し
6. 結果: 「✅ 投稿完了 https://x.com/...」 + チャット履歴に URL 残る

### 6-D. 安全装置
- **初回投稿は必ず confirm** (= 誤投稿防止)
- **投稿後の編集 / 削除も AI から可能** (= `delete_x_post(id)`)
- **下書き投稿**: AI が直接投稿せず「下書きに保存 → ユーザーが承認」モード (オプション設定)

---

## 7. スケジュール投稿

V1 では即時投稿のみ。V2 で:

```typescript
schedule_post({
  platform: 'x' | 'threads' | 'linkedin',
  content: object,           // 各 platform 用の payload
  scheduled_at: string,      // ISO8601
}): { ok: boolean, schedule_id: string }
```

- `agent.scheduled_posts[]` に保存
- 既存の `_startAgentScheduler` (60s tick) で時刻チェック → 投稿実行
- ダッシュボード「⚡ アクション」 tab に「予約投稿一覧」を表示

---

## 8. 制約 / Best Practices (= AI に教える)

各 platform の制約を `buildSystem` の siteAgentNote に注入:

```
【X 投稿制約】 280 字 / 媒体: 画像最大 4 枚 / 動画 2:20 / スレッドは 25 投稿まで
【Threads 投稿制約】 500 字 / 媒体: 画像 10 枚 or 動画 1 個
【LinkedIn 投稿制約】 3000 字 / 1300 字超は「もっと見る」 / 媒体: 画像 9 枚 or 動画 1 個
```

→ AI が platform 制約を超えないコンテンツを生成する。

---

## 9. 実装フェーズ

### Phase 1 (V1) — 想定 2 週間
1. **データモデル + 暗号化** (`user.sns_connections`, `SNS_TOKEN_KEY` env)
2. **X (Extension)** ツール: 既存 `ext_post_x` を `post_to_x` / `post_to_x_thread` として登録
3. **Threads OAuth** + `post_to_threads`
4. **LinkedIn OAuth** + `post_to_linkedin`
5. **設定 UI**: SNS 接続カード (3 つ)
6. **confirm UI**: AI 投稿前の承認モーダル

### Phase 2 (V2) — 1 ヶ月
7. **Instagram OAuth** (Business アカウント必須)
8. **Facebook Page** OAuth
9. **Pinterest** OAuth
10. **画像生成 → 自動投稿** フロー (= AI が画像 + キャプション同時生成 → 直接投稿)
11. **スケジュール投稿**

### Phase 3 (V3) — 2 ヶ月
12. **TikTok** (API + Extension)
13. **YouTube** API
14. **Reddit** API
15. **マルチ投稿** (= 1 つの投稿を複数 platform に同時配信、各 platform 制約に合わせ自動変形)
16. **投稿分析** (= 投稿後の impression / engagement を取得して 数字 tab に表示)

---

## 10. 環境変数 (新規)

```
SNS_TOKEN_KEY=<32-byte hex>                 # AES-256 暗号化キー
X_OAUTH_CLIENT_ID=<X API client>
X_OAUTH_CLIENT_SECRET=<X API secret>
THREADS_APP_ID=<Meta app id>
THREADS_APP_SECRET=<Meta secret>
LINKEDIN_CLIENT_ID=<LinkedIn app>
LINKEDIN_CLIENT_SECRET=<LinkedIn secret>
SNS_REDIRECT_BASE=https://myaiagents.agency  # OAuth callback ベース URL
```

---

## 11. セキュリティ

- **Token 暗号化**: AES-256-GCM、 key は env、 IV は per-record ランダム
- **スコープ最小化**: post 権限のみ要求、 read / follow / DM は要求しない
- **誤投稿防止**: V1 では「初回投稿は必ず confirm」。後にユーザーが「auto-post mode」 を ON にできる
- **Rate Limit**: 各 platform の上限を内部で tracking、上限超え時は queue に積む
- **Audit Log**: 全投稿の trace (= いつ / どの AI が / 何を投稿したか) を `agent.sns_post_log` に記録

---

## 12. オープンクエスチョン

1. **X API のコスト負担**: X Basic = $100/mo。 Extension primary でも OAuth tier をどこで上げる?
2. **複数アカウント対応**: 1 ユーザー = 1 アカウント / platform で V1 は OK?
3. **ビジネス vs 個人アカウント**: Instagram / Facebook は Business 限定 = 個人アカウントの人をどう救う?
4. **下書き保存先**: Threads / LinkedIn は drafts API なし → MY AI Agent 内で「下書きキュー」を持つ?
5. **AI auto-post mode**: ユーザーがフル自動を選んだら毎週決まったタイミングで AI が勝手に投稿、というモードを V2 で?

---

## 13. 成功指標 (= リリース後に追う数字)

- **接続率**: site agent を持つユーザーの中で 1 つ以上 SNS 接続済の比率 (目標: 50%+)
- **投稿成功率**: AI が呼んだ `post_to_*` の成功比率 (目標: 95%+)
- **ユーザー投稿数**: 1 ユーザー / 月の AI 経由投稿数 (目標: 12+ / 月)
- **エンゲージメント取得率**: V3 で投稿の impression / engagement を取得できた比率
