# 📱 SNS Auto-Post Hub — 仕様書 (v2 — Extension-only 方針)

> MY AI Agent の Chrome 拡張を全 SNS 投稿の共通基盤として使い、
> **API を一切使わず** に X / Instagram / Threads / LinkedIn /
> TikTok / Facebook / YouTube への投稿を実現する。
>
> ユーザーは拡張をインストール + 各 SNS にログインしているだけで OK。
> OAuth / API key / Business アカウント / 課金 すべて不要。

---

## 1. 設計判断 (= 大方針の変更)

**v1 → v2 の変更**: API ベースを完全に廃止し、**全 platform を Chrome 拡張ベース** で実装。

### Why Extension-only?
- ✅ **コスト $0** (X Basic $100/mo の出費なし)
- ✅ **個人 IG アカウントも OK** (Business アカウント縛りなし)
- ✅ **OAuth フロー不要** (= 接続体験が「拡張を入れるだけ」)
- ✅ **Token 保存不要** (= AES 暗号化 / refresh ロジックなし)
- ✅ **rate limit なし** (= ユーザーの実ブラウザを使うので「人間として動く」)
- ✅ **すでに `ext_post_x` で動いている実績** (= 拡張アーキテクチャは検証済)

### Trade-off (= 受け入れる制約)
- ❌ **ユーザーが Chrome を開いている必要がある** (背景プロセスでは投稿できない)
- ❌ **拡張のインストールが必須** (Web 完結ではない、拡張ストアまでの 1 ステップ追加)
- ❌ **各 platform の DOM 構造が変わったら追従が必要** (= 月 1-2 回のメンテ想定)
- ❌ **スケジュール投稿は「ブラウザが開いている時刻」に依存** (= 完全な背景配信は無理)

---

## 2. ユーザー体験 (= フロー)

### 2-A. 初回セットアップ (1 回だけ)
```
ユーザー: ダッシュボード「⚙ 設定」 → 「📱 SNS 接続」
   ↓ MY AI Agent 拡張 未インストールなら
   →「拡張をインストール」ボタン → Chrome Web Store
   ↓ インストール済みなら
各 SNS カード:
  🐦 X         → [接続] (= 拡張に「X のタブで logged-in か」を確認させる)
  🧵 Threads   → [接続]
  📸 Instagram → [接続]
  💼 LinkedIn  → [接続]
  📘 Facebook  → [接続]
  📌 Pinterest → [接続]
  🎵 TikTok    → [接続]

「接続」 = 拡張がそのサイトを開いて login state を verify するだけ。
OAuth フロー / token / 確認画面 なし。
```

### 2-B. AI 投稿フロー (普段使い)
```
ユーザー: 「X に今日のスレッド投稿して」
   ↓
AI: スレッド案を artifact 生成
   ↓
AI: confirm UI 「この内容で投稿しますか? [はい / 編集 / 後で]」
   ↓ [はい]
AI: post_to_x_thread ツール呼び出し
   ↓
拡張: ユーザー Chrome で X.com を背景タブで開き、新規投稿モーダル → 入力 → 投稿
   ↓ 5-10 秒後
結果: 「✅ 投稿完了 → https://x.com/...」
```

### 2-C. AI が自分で投稿するモード (V2)
- ユーザーが「auto-post mode: ON」を選ぶ
- 毎週決まった時間 (例: 火曜 10:00) に AI が自動投稿
- 投稿前に email / Slack に通知 (= キャンセル猶予 30 分)

---

## 3. 対応プラットフォーム (Phased)

### V1 (1.5 ヶ月) — Extension 既存 + 主要 3 platform
| Platform | 既存 | 投稿タイプ | DOM 自動化の複雑度 |
|---|---|---|---|
| 🐦 **X (Twitter)** | ✅ `ext_post_x` | Tweet / Thread / リプライ | 中 |
| 💼 **LinkedIn** | ❌ 新規 | 個人投稿 / 画像 / 記事 | 低 |
| 🧵 **Threads** | ❌ 新規 | 投稿 / 画像 | 低 |

### V2 (3 ヶ月) — 視覚系 SNS
| Platform | 既存 | 投稿タイプ | 複雑度 |
|---|---|---|---|
| 📸 **Instagram** | ❌ 新規 | Feed / Reels / Story | 高 (画像 upload UI 複雑) |
| 📘 **Facebook Page** | ❌ 新規 | 投稿 / 画像 | 中 |
| 📌 **Pinterest** | ❌ 新規 | Pin 作成 | 中 |
| **AI 自動投稿モード** | ❌ 新規 | 週次定時 + 通知 | — |

### V3 (5 ヶ月) — 動画 / その他
| Platform | 既存 | 投稿タイプ | 複雑度 |
|---|---|---|---|
| 🎵 **TikTok** | ❌ 新規 | 動画 / 写真 | 高 |
| 📹 **YouTube** | ❌ 新規 | Community Post / Shorts metadata | 中 |
| 🔴 **Reddit** | ❌ 新規 | Post / Comment | 低 |
| **マルチ投稿** | ❌ 新規 | 1 投稿 → 複数 platform 同時配信 | — |

---

## 4. 拡張の技術構成

### 既存アーキテクチャ (= `ext_post_x` がやってる事)
1. 拡張に `content_script.js` (= X.com / linkedin.com 等の各 platform で実行)
2. MY AI Agent server が `ext_post_x` tool 呼び出し
3. server → ユーザーの拡張に「post task」を push (websocket or polling)
4. 拡張: 該当 platform のタブを開く → content script が DOM 操作で投稿
5. 投稿完了後 → 拡張 → server に「✅ 成功 + URL」 を report

### V1 で拡張に追加する content script
- `cs_x.js` (既存)
- `cs_linkedin.js` (新規)
- `cs_threads.js` (新規)

各 content script は **共通インターフェース** を実装:
```typescript
interface SnsContentScript {
  verifyLogin(): Promise<{ ok: boolean, profile?: Profile }>;
  post(params: PostParams): Promise<{ ok: boolean, url: string, post_id: string }>;
  delete(post_id: string): Promise<{ ok: boolean }>;
}
```

新 platform 追加 = この interface を実装する `cs_<platform>.js` を 1 個追加するだけ。

---

## 5. AI ツール API

```typescript
post_to_x({ text, media?, reply_to? }):
  { ok, tweet_id, url }

post_to_x_thread({ tweets: [{ text, media? }] }):
  { ok, thread_url, tweet_ids }

post_to_threads({ text, media?, link? }):
  { ok, post_id, url }

post_to_linkedin({ text, type?, article_title?, media?, visibility? }):
  { ok, post_urn, url }

// 全 tool 共通: 拡張が必要 / 未インストール時のエラー
// → { error: 'extension_required', detail: '拡張をインストールしてください', install_url: '...' }
```

---

## 6. データモデル (シンプル化)

API ベースの v1 仕様にあった暗号化 / token 管理が **すべて不要** に:

```typescript
user.sns_connections = {
  x: {
    connected: true,
    profile: { username: '@kota', display_name: '...', avatar_url: '...' },
    last_verified_at: '2026-05-23T...',
    // ※ token / refresh_token / scope なし
  },
  threads: { connected: true, profile: { ... } },
  linkedin: { connected: true, profile: { ... } },
}
```

**保存場所:** `users` テーブルの `sns_connections` JSONB カラム (新規)。
**暗号化不要** (= 個人情報は profile name のみ、 token なし)。

---

## 7. UI / UX

### 7-A. 接続管理ページ (ダッシュボード「⚙ 設定」内)
```
📱 SNS 接続

⚠️  MY AI Agent Chrome 拡張 [インストール →]
    投稿には拡張が必要です。インストール後、各 SNS にログインしてください。

┌─────────────────────────┐  ┌─────────────────────────┐
│  🐦 X (Twitter)          │  │  💼 LinkedIn             │
│  🟢 接続済 / @kota       │  │  🔘 未接続               │
│  最終投稿: 2 時間前       │  │  [接続する]              │
│  [投稿履歴] [切断]        │  │                          │
└─────────────────────────┘  └─────────────────────────┘
... 各 platform 同じ pattern
```

### 7-B. confirm UI (= 投稿前モーダル)
- 投稿内容 preview
- どの platform / どのアカウント へ投稿するか明示
- [今すぐ投稿] / [後で (下書き保存)] / [キャンセル]
- 「次回から確認なしで自動投稿する」チェックボックス (= per-platform 設定)

---

## 8. AI が知るべき投稿制約 (= buildSystem に注入)

`buildSystem` の siteAgentNote に platform 別ルール注入:

```
【X 投稿】 280 字 / 画像最大 4 / スレッドは 25 投稿まで / リンクは末尾推奨
【Threads 投稿】 500 字 / 画像 10 or 動画 1 / リンクカード自動展開
【LinkedIn 投稿】 3000 字 (1300 で「もっと見る」) / 画像 9 / 改行多めで read more 誘導
【Instagram 投稿】 キャプション 2200 字 / 画像 10 / Reels 90 秒以内
```

これにより AI が platform 制約を超えないコンテンツを生成する。

---

## 9. スケジュール投稿 (V2)

ユーザーが「火曜 10:00 に投稿」と指示 → 内部の `scheduled_posts[]` に保存:

```typescript
agent.scheduled_posts = [
  {
    id, platform, content,
    scheduled_at: '2026-05-27T10:00:00+09:00',
    status: 'pending' | 'posted' | 'failed' | 'cancelled',
    posted_url?: string,
  }
]
```

**実行**: `_startAgentScheduler` (= 60s tick) が時刻チェック → 拡張 に post task push。

**ブラウザ閉じている時の挙動**:
- 拡張 service worker が定期 wake-up (= chrome.alarms API)
- 拡張側で 5 分以内に投稿を試みる → 成功 → server に report
- ブラウザ完全に閉じていれば、次回起動時に「予約投稿 N 件待ちあり、今投稿しますか?」 を表示

---

## 10. AI 自動投稿モード (V2)

ユーザー設定 (= ダッシュボード「⚙ 設定」 内):
```
🤖 自動投稿モード
[ ] 有効化

✅ Auto-post enabled で動くこと:
- AI が毎週 月 / 火 / 木 / 金 の 10:00 に投稿を自動生成 + 投稿
- 投稿 30 分前に email で内容 preview + キャンセルリンク
- ユーザーが何もしなければ予定通り投稿
- 月 N 回まで (free 4 回 / pro 12 回 / business 無制限)
```

**ガードレール:**
- 同じ platform に 24h 以内 3 投稿まで (= spam 防止)
- AI が生成した投稿は AI safety filter 通過 (= NG ワード / 攻撃的内容 / 個人情報含まないか)
- 1 週間連続で「投稿前キャンセル」されたら auto-post を自動 OFF (= ユーザーが嫌がってる signal)

---

## 11. セキュリティ / プライバシー

- **拡張権限の最小化**: 各 SNS ドメインの host_permissions のみ要求 (= 全 URL アクセスではない)
- **content script は audit 可能**: コード公開 (= ユーザーが何をしてるか確認できる)
- **投稿 log**: ユーザーが「拡張 → アクティビティログ」で全投稿履歴を見れる
- **ワンタイム取り消し**: 投稿後 5 分以内なら拡張が delete API でロールバック可能
- **「投稿前 confirm」 は default ON** (= 慣れたユーザーが自分で OFF にする選択肢)

---

## 12. 実装フェーズ (= 詳細)

### Phase 1 (V1) — 6 週間想定
1. **データモデル** (`user.sns_connections`) — 30 分
2. **拡張に共通投稿 interface 設計** (= 各 SNS content script 用の base class) — 2 日
3. **`ext_post_x` を再リファクタ** (新しい interface に合わせる) — 1 日
4. **LinkedIn content script** (= login verify + 投稿 + delete) — 3 日
5. **Threads content script** — 3 日
6. **server: `post_to_linkedin` / `post_to_threads` tool 登録** — 1 日
7. **設定 UI** (= SNS 接続カード × 3) — 2 日
8. **confirm モーダル** (投稿前承認) — 1 日
9. **拡張未インストール時の誘導 UI** — 0.5 日
10. **AI への投稿制約 prompt 注入** (= buildSystem 修正) — 0.5 日
11. **エラーハンドリング** (拡張未起動 / login 切れ / DOM 変化) — 2 日
12. **テスト + バグ修正** — 1 週間

### Phase 2 (V2) — +6 週間
13. Instagram content script (= 一番複雑、 Reels / Story 含む)
14. Facebook / Pinterest content script
15. スケジュール投稿 (= server 側 queue + 拡張 alarms 連動)
16. AI 自動投稿モード + 安全装置

### Phase 3 (V3) — +6 週間
17. TikTok content script
18. YouTube / Reddit
19. マルチ投稿 (= 1 投稿 → 各 platform 制約に合わせ自動変形 + 同時配信)
20. 投稿分析 (= impression / engagement を 拡張で scrape + 数字 tab に表示)

---

## 13. 環境変数 (= 大幅に減った!)

```
# 不要になったもの (API ベースで必要だったもの):
# - X_OAUTH_CLIENT_ID, X_OAUTH_CLIENT_SECRET
# - THREADS_APP_ID, THREADS_APP_SECRET
# - LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET
# - SNS_TOKEN_KEY (token 暗号化用)
# - SNS_REDIRECT_BASE

# 必要なもの:
EXT_ID=<Chrome 拡張 ID>           # 既存
EXT_PUSH_SECRET=<拡張 ↔ server 認証用>  # 既存
```

---

## 14. 成功指標

- **接続率**: 拡張 install 済みユーザーの中で 1 つ以上 SNS 接続済の比率 (目標: 70%+)
- **投稿成功率**: AI が呼んだ `post_to_*` の DOM 自動化成功率 (目標: 92%+ 、 platform DOM 変更時は一時的に低下を許容)
- **拡張 install 率**: site agent 持ちユーザーの拡張 install 比率 (目標: 60%+)
- **AI 経由投稿数**: 1 ユーザー / 月 (目標: 15+ 投稿 / 月)

---

## 15. リスク / 緩和

| リスク | 影響 | 緩和策 |
|---|---|---|
| platform 側の DOM 変更 | 投稿失敗が一時的に増える | 各 content script に CI テスト + 失敗時の email アラート (= 開発者通知) |
| spam / bot 判定 | アカウント停止 | 投稿間隔を実装 (24h 3 投稿上限) + 「人間っぽい」遅延 / マウス動作 emulation |
| ユーザーが拡張を入れない | 機能利用不可 | onboarding で「拡張インストール」を強く促す + welcome mail で再促す |
| ブラウザ閉じてる時の予約失敗 | スケジュール投稿の信頼性 | 「次回起動時にまとめて投稿しますか?」 prompt + 起動時 catchup |

---

## 16. 確定したスコープ

| Q | 回答 |
|---|---|
| クロスブラウザ | ❌ Chrome のみ |
| ログイン切れ事前検知 | ✅ V1 で入れる |
| 複数アカウント | V2 で対応 |
| 投稿前プレビュー | ✅ actual に近い preview (画像 + アバター + 名前) |
| DOM 自動テスト CI | V1 は X 1 platform のみなので manual テストで OK |

## 17. V1 スコープ確定 (= X のみ)

LinkedIn / Threads は V2 に後送り。 V1 は **X 投稿だけ** を完全に動かす。

### V1 で実装するもの (= 6 週 → 縮小して 2-3 週想定)
1. **既存 ext_* primitives を使った post_to_x tool 実装** (server side)
2. **post_to_x_thread tool** (= 複数 Tweet 連続投稿)
3. **verify_x_login endpoint** (= ダッシュボードから「接続確認」)
4. **SNS 接続管理 UI** (= 設定 tab に X カード追加)
5. **拡張未インストール / ログイン切れ事前検知 + 通知 UI**
6. **投稿 confirm モーダル** with actual に近い preview (avatar + name + text + image)
7. **buildSystem に X 投稿制約 prompt 注入** (= 280 字 / スレッド 25 まで等)
8. **投稿後の AI チャット reply** (= 「✅ 投稿完了 + URL」を AI が報告)
