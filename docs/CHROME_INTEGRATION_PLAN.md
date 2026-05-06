# Google Chrome 連携 — 実装計画

最終更新: 2026-05-06
担当: Takeuchi Kouta + Claude

## ゴール

各エージェントの「🌐 Google Chrome 連携」トグルを、現在のフラグだけの状態から、**実際にブラウザを操作できる機能** に発展させる。

主なユースケース：
1. 自動インサイドエージェントが Web を調査して企業リストを抽出
2. フォーム入力（Google フォーム / 問い合わせフォーム）の自動化
3. Web 上のテキスト・画像取得（コンテンツ収集）
4. URL のスクリーンショット取得

---

## 検討した3つの方針

### A. Chrome 拡張機能（推奨度 ★★★）

**仕組み:**
- ブラウザに常駐する拡張機能を Chrome Web Store に公開
- 拡張がローカルで Chrome DevTools Protocol (CDP) を使ってタブを操作
- 拡張⇄サーバ間で WebSocket / native messaging で通信
- AI のツール呼び出し（Anthropic Tool Use）→ サーバ → 拡張 → ブラウザ操作

**メリット:**
- ユーザーが既に開いているブラウザを使えるためログインセッション維持
- ローカル実行なので個人情報・社内情報を扱う業務に強い
- スケーリングコスト不要（クライアント側で実行）

**デメリット:**
- Chrome Web Store 申請（数日〜2週間）
- ユーザーに拡張インストールを促す導線が必要
- Manifest V3 制約と CDP の組み合わせが面倒

**所要見込み:** 開発 2-3週間 + Web Store 審査 1-2週間

---

### B. サーバサイド Playwright + Anthropic Tool Use（推奨度 ★★）

**仕組み:**
- Render 上に Playwright をインストール（Chromium を VM 内で実行）
- Anthropic API の Tool Use 機能で `browse_url`, `click`, `type`, `screenshot` 等のツールを定義
- AI がツール呼び出しを返すと、サーバが Playwright で実行 → 結果を AI に戻す

**メリット:**
- ユーザーに何もインストールさせず動く（クラウド完結）
- 拡張開発・申請不要
- スクリーンショット等を AI に直接見せられる

**デメリット:**
- Render の VM コスト増（Chromium を常時 idle で持つか、起動時に毎回ダウンロードするか）
- ユーザーのログインセッションは使えない（公開Web情報のみ操作可能）
- 同時実行数の上限管理が必要
- 1リクエストあたり数十秒の遅延（実ブラウザ操作）

**所要見込み:** 1-2週間

---

### C. Model Context Protocol (MCP) Browser Server（推奨度 ★）

**仕組み:**
- Anthropic 標準の MCP プロトコルを採用
- 公式の `mcp-browser` または類似 OSS をサーバに同梱
- AI ⇄ MCP server ⇄ Chromium の3層

**メリット:**
- 標準プロトコルで保守容易
- 将来 Anthropic 純正の Browser MCP が出れば差し替え可能

**デメリット:**
- 現状 OSS 実装が安定していない
- B案とほぼ同じインフラコスト

**所要見込み:** 1週間（OSSの選定次第）

---

## 推奨方針（暫定）

**段階的リリース:**

| Phase | 期間 | 内容 |
|-------|------|------|
| **0**（現状）| 完了 | フラグのみ + AI への注釈 |
| **1** | 1-2週間 | **B案 (Playwright)** で読み取り専用 (ブラウジング + スクショ) を提供。AI Tool Use で `browse(url)` を実装 |
| **2** | +2週間 | クリック・フォーム入力を追加（書き込み系 Tool Use）|
| **3** | +1ヶ月 | **A案 (Chrome拡張)** をオプションで追加。ログインセッションが必要なケース対応 |

**理由:**
- B案はコストはかかるが、ユーザー体験で「インストール不要」が圧倒的に強い
- 最初は読み取り専用で安全運用、徐々に書き込みを許可
- A案は「業務 / 社内システム連携」を求めるパワーユーザー向けに後回し

---

## Phase 1 (B案) 技術詳細

### サーバ追加コンポーネント

```
server/
├── browser/
│   ├── pool.js          # Chromium インスタンスプール（同時実行3-5）
│   ├── tools.js         # Anthropic tool 定義 + ハンドラ
│   └── safety.js        # URL allow/block list, タイムアウト, リソース制限
└── index.js             # Tool Use ループを chat handler に組み込み
```

### Anthropic Tool 定義（最小）

```js
const browserTools = [
  {
    name: 'browse_url',
    description: '指定URLを開いて、表示テキストとスクリーンショットを取得する',
    input_schema: {
      type: 'object',
      properties: { url: { type: 'string', description: 'https://〜' } },
      required: ['url']
    }
  },
  {
    name: 'search_web',
    description: 'Google で検索してトップ10結果を取得する',
    input_schema: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: ['query']
    }
  }
];
```

### チャットフロー変更

```
user msg → AI (with tools) → AI returns tool_use
  ↓
  サーバが Playwright 実行
  ↓
  tool_result を AI に渡す
  ↓
  AI が最終回答
```

### 安全策（必須）

- URL allow-list（最初は公開検索エンジン + ニュースサイト等）
- タイムアウト 30秒
- 同時実行 5 まで
- メモリ 512MB / インスタンス
- ユーザーごとの実行回数制限（無料: 5 回/月, Pro: 100 回/月, Business: 500 回/月）

### 課金モデル

ブラウザ実行は AI 呼び出しと別に従量課金:
- 1 ブラウズ = $0.01
- スクショ = $0.005

→ アプリ側の `balance_jpy` から差し引き

---

## マイルストーン

- [ ] Render プランの確認（無料 → 有料へ要切替、Chromium に必要なメモリ）
- [ ] Anthropic Tool Use の動作確認（既存 chat handler の拡張）
- [ ] Playwright pool の安定性検証（同時5接続、メモリリーク無）
- [ ] URL allow-list の初期版作成
- [ ] 課金引き落としロジック追加
- [ ] エラーハンドリング（タイムアウト / 404 / blocked）
- [ ] フロント: ブラウザ実行中の進捗表示（"google.com にアクセス中..."）
- [ ] β リリース（Pro/Business 限定）
- [ ] 一般リリース

---

## 次のアクション（即実行）

1. **A or B を決定** ← ユーザー判断待ち
2. Render プラン見直し（B案なら $7/月 Starter から $25/月 Standard へ）
3. Anthropic Tool Use の実装（既存 `/api/chat/:agentId` に組み込み）
4. Phase 1 開発開始

決まったら言ってください。すぐ着手します。
