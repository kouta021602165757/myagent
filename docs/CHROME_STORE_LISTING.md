# Chrome Web Store 掲載情報 — v0.2.0

提出時にコピペで使えるテキスト群。**日本語版・英語版** 併記。
Chrome Web Store Developer Dashboard の各フィールドにそのまま貼り付け可能。

最終更新: 2026-05-11

---

## 1. パッケージのタイトル (Package Title)

**日本語** (32 文字以内):
```
MY AI Agent — Browser Connector
```

**英語**:
```
MY AI Agent — Browser Connector
```

> ブランド名 (MY AI Agent) を先頭に置き、機能 (Browser Connector) で
> ストア検索 (`browser`, `connector`, `AI`) からも見つかる構成。

---

## 2. パッケージの概要 (Summary, 上限 132 文字)

**日本語** (74 文字):
```
AI がブラウザを操作。X 投稿・Gmail 送信・社内ツール入力まで、ログイン済みサイトの操作をチャット 1 行で。承認制で安全。
```

**英語** (130 文字):
```
Let AI run tasks in your browser. From the MY AI Agent chat, drive any logged-in site — post, message, fill forms — with one-click approval.
```

---

## 3. 説明 (Description) ※検索ヒット率と CTR に直結

### 日本語版

```
🤖 MY AI Agent — Browser Connector とは?

「X にこの記事をシェア」「Gmail で〇〇さんに返信下書き」
「Notion の議事録から ToDo を抜き出して」
— AI に話しかけるだけで、あなたが普段使うブラウザを AI がそのまま操作してくれます。

MY AI Agent (https://myaiagents.agency) の公式 Chrome 拡張機能。
個人で使う AI に "目と手" を与えて、調査だけでなく実行まで任せられるようにします。


✨ できること

• ログイン済みサイトをチャット指示で操作
  X / Gmail / Slack / Notion / LinkedIn / 楽天 / Amazon / Salesforce / 社内 SaaS …
  あなたが既にログインしているなら、ほぼどのサイトでも操作対象になります。

• 自然な日本語 (英語) の 1 文で OK
  「Slack の #general に "リリース完了" と投稿して」と言うだけ。
  AI が必要なステップに分解して、あなたのブラウザ上で実行します。

• 不可逆な操作はすべて承認制
  投稿・送信・購入など取り消せない操作は、実行直前に AI が
  「これをやります」と内容をプレビューします。あなたが OK を押した時だけ進みます。

• 全操作を監査ログで記録
  「いつ・どのサイトで・何が起きたか」を後から確認可能。改竄防止のハッシュ
  チェーンで保護されています。


🚀 使い方 (3 分)

1. https://myaiagents.agency で無料登録 (カード不要)
2. この拡張機能を Chrome に追加
3. アプリで AI を作成 → エージェント編集の「ブラウザ拡張連携」を ON
   (自動でペアリングされます)
4. AI に普段の言葉で指示するだけ。例: 「先週の Gmail から請求関係を 5 件まとめて」


🔒 プライバシーとセキュリティ

• 拡張機能は あなたの保存パスワード や 認証情報 にアクセスしません
• 各操作は 必ずあなたの承認後 にだけ実行されます
• データは MY AI Agent サーバー (Render / Supabase 上) と
  Anthropic Claude API のみに送信されます。第三者には共有しません
• いつでも 1 クリックで連携を切断できます (アプリ右上の「切断」ボタン)


📝 v0.2.0 の更新

• 接続安定性を大幅改善
  Chrome MV3 のサービスワーカーが ~30 秒のアイドルで停止する仕様に対し、
  chrome.alarms による自動 keep-alive を実装。長時間チャット中でも
  「拡張機能がオフライン」と表示される問題を解消しました。
• 新規権限: alarms (上記 keep-alive のみで使用)


🎯 こんな方に

• 毎日の SNS 運用 / メール返信 / 日報入力を自動化したい
• Zapier / IFTTT では到達できない社内ツールも自動化したい
• 1 人で複数業務を回している indie hacker / solo founder
• ノーコード自動化を AI チャットで完結させたい運用担当者


ℹ️ 必要環境

• Chrome 116 以上 (Chromium 系の Edge / Brave などでも動作)
• MY AI Agent のアカウント (無料プランあり)
• 操作したいサイトへの事前ログイン


💬 サポート

• ヘルプ: https://myaiagents.agency/contact
• 不具合報告: 上記 URL から
• ソースコード: github.com/kouta021602165757/myagent (公開リポジトリ)
```

### 英語版

```
🤖 MY AI Agent — Browser Connector

"Share this article on X." "Draft a reply to John in Gmail."
"Pull the action items out of last week's Notion meeting notes."
Just tell MY AI Agent what to do — and it runs the task in *your* browser,
on the sites you're already signed in to.

The official Chrome extension for MY AI Agent (https://myaiagents.agency).
Gives your personal AI agents the eyes and hands to actually execute work,
not just research it.


✨ What it does

• Drive any logged-in site through chat
  X, Gmail, Slack, Notion, LinkedIn, Amazon, Salesforce, your internal tools.
  If you're logged in, AI can drive it.

• One sentence, plain English
  "Send a Slack message to #marketing saying we shipped." That's it.
  AI breaks the task into steps and runs them in your browser.

• Approval before every irreversible action
  Posting, sending, purchasing — AI shows you what it's about to do and
  waits for your click before going through with it.

• Full audit log
  Every action AI takes on your behalf is recorded with a tamper-evident
  hash chain you can review later.


🚀 Setup (3 minutes)

1. Sign up free at https://myaiagents.agency (no credit card)
2. Add this extension to Chrome
3. In the app, edit any agent and toggle "Browser Extension" on —
   pairing happens automatically
4. Talk to the AI in plain language: "Find the latest 5 invoices in
   my Gmail and summarize them."


🔒 Privacy & security

• The extension never reads or stores your saved passwords or login
  credentials
• Every action requires your explicit approval before it runs
• Data only flows between MY AI Agent's server (Render / Supabase)
  and the Anthropic Claude API. We don't share with third parties.
• Disconnect anytime with one click (the "Disconnect" button in the
  agent edit panel)


📝 What's new in v0.2.0

• Major stability improvement
  Chrome MV3 idles service workers after ~30 seconds, which would
  occasionally drop the SSE stream and surface as "extension offline"
  during long sessions. v0.2.0 introduces a chrome.alarms-based
  keep-alive that prevents this entirely.
• New permission: alarms (used solely for the keep-alive above)


🎯 Built for

• Solo founders & indie hackers running five jobs at once
• Operators automating things Zapier can't reach
• Anyone whose company tools live behind a login wall
• People who want no-code automation, but driven by AI chat


ℹ️ Requirements

• Chrome 116+ (or any recent Chromium browser: Edge, Brave, Arc)
• A MY AI Agent account (free plan available)
• You must be logged in to any site you want AI to operate


💬 Support

• Help: https://myaiagents.agency/contact
• Bug reports: same URL
• Source: github.com/kouta021602165757/myagent (open repo)
```

---

## 4. カテゴリ (Category)

**Primary**: `Productivity` (生産性)

理由: 業務自動化 / 反復作業の効率化に位置づけられる。
"Developer Tools" は誤誘導 (技術者専用のように見える)。

---

## 5. 言語 (Languages)

- 日本語 (デフォルト)
- 英語

両方の説明を上記の通り提供。

---

## 6. プライバシー / 権限の正当化 (Privacy Practices タブ)

> Chrome Web Store 審査では各権限について「なぜ必要か」を必ず書く。
> 不十分だと差し戻しになるため、以下の文言をそのまま貼り付けてください。

### 単一目的の説明 (Single purpose)

**日本語**:
```
このプロダクトの単一目的は、MY AI Agent (https://myaiagents.agency) で
作成した AI エージェントが、ユーザーがログイン済みのウェブサイト
(X / Gmail / Slack / Notion / 社内ツールなど) を自動操作できるように
することです。AI からの指示は SSE で受信し、対応するブラウザ操作を
ユーザー承認のもとで実行します。
```

**英語**:
```
The single purpose of this extension is to let AI agents created in
MY AI Agent (https://myaiagents.agency) operate websites the user is
already signed in to — X, Gmail, Slack, Notion, internal company
tools, and so on. The extension receives commands from the agent
over SSE and executes them in the active browser, with explicit
user approval before any irreversible action.
```

### 各権限の正当化

**`alarms`** ★ v0.2.0 で新規追加 ★
```
Used solely to fire a periodic chrome.alarms event (~24 seconds)
that keeps the extension's service worker alive while the user has
the MY AI Agent web app open. Without this, Chrome MV3's 30-second
service-worker idle timeout would drop the SSE stream that delivers
AI commands, causing tool calls to fail intermittently. No external
network requests, telemetry, or data collection are tied to this
permission.
```

**`tabs`**
```
Required so the AI can (1) list open tabs when the user asks "what's
open right now", (2) switch focus to the correct tab before running
an action, and (3) close tabs when the user asks. All tab operations
are user-triggered via explicit chat commands and surface in the
audit log.
```

**`storage`**
```
Stores only the device-pair token issued by the MY AI Agent server,
which identifies this Chrome instance for SSE delivery. No personal
data, no browsing history, no page content is stored.
```

**`scripting`**
```
Required to execute the user-issued command on the target page —
clicking a specific button, filling a form field, reading a visible
section. Each script invocation is tied 1:1 to a user-approved chat
command.
```

**`notifications`**
```
Surfaces task completion notifications when the user has switched
to a different tab while an AI command is running. Disabled at the
OS level until the user explicitly grants permission to Chrome.
```

**`activeTab`**
```
Allows reading content from the currently focused tab so AI can
fulfill commands like "summarize what's on this page" — only when
the user has explicitly invoked such a command in chat.
```

**`host_permissions: <all_urls>`** ★ 説明が最重要 ★
```
MY AI Agent users have heterogeneous workflows: one user automates
Slack and Notion, another drives a private Salesforce instance, a
third drives an internal company SaaS that has no public domain.
We cannot enumerate the host list at publish time. The extension
only injects content scripts and runs operations after the user
explicitly issues a command for that domain via the MY AI Agent
chat — never speculatively, never on page load. The audit log
captures every host the extension ever touched.
```

### リモート コードの使用 (Remote Code)

**選択**: 「いいえ、リモート コードは使用していません」

理由: 拡張のすべての JS は manifest にバンドル。サーバーから受信するのは
コマンド (JSON) のみで、コードを取得・実行することはありません。

### データ使用に関する開示 (Data Practices)

| 取り扱うデータ | 用途 |
|---|---|
| ユーザー アクティビティ (操作履歴) | AI に次の指示を作らせるための文脈生成 |
| ウェブサイト コンテンツ (現在のページ) | ユーザーが「このページを要約」と頼んだ時のみ取得 |
| 認証情報 | **取得しません** (`storage` に持つのは MY AI Agent 発行のデバイストークンのみ) |

「以下のデータを送信しますか?」のチェックボックス:
- ☐ 個人を特定できる情報
- ☑️ 認証情報 (実体: device_token のみ。Google/X/Slack のパスワード等は触らない)
- ☑️ ユーザー アクティビティ
- ☑️ ウェブサイト コンテンツ
- ☐ 健康情報、財務情報

「データ使用方法」3 つの宣言:
- ☑️ 認証されている内容にのみアクセス
- ☑️ 第三者へ販売しない
- ☑️ 拡張機能のコア機能と無関係な目的に使用しない

---

## 7. プロモーションタイル / スクリーンショット

### スモール プロモーション タイル (440 × 280 px)
- 中央に **🤖 MY AI Agent** ロゴ
- サブテキスト: "Your AI agents, in your browser."
- 背景: ピーチ → ダーク オレンジのグラデ (`#fb923c → #ea580c`)

### スクリーンショット (1280 × 800 px、最大 5 枚)
推奨セット:
1. **Hero**: アプリのチャット画面で「@x で○○を投稿」 + ブラウザに X が表示されている split view
2. **Approval modal**: 「X に投稿します。よろしいですか?」のスクリーン
3. **Audit log**: 過去の操作一覧
4. **Settings**: エージェント編集の「ブラウザ拡張連携 ● 接続中」
5. **Multi-site**: Gmail / Slack / Notion を同時に操作する図

`mobile/store-screenshots/` に既存の画像あり (流用検討)。

---

## 8. リンク類 (Listing Links)

| フィールド | URL |
|---|---|
| 公式 URL | https://myaiagents.agency |
| サポート URL | https://myaiagents.agency/contact |
| プライバシー ポリシー URL | https://myaiagents.agency/privacy-extension.html |

> プライバシーポリシーは **拡張機能用に分離**してあるのでこの URL を使用。
> /privacy.html (アプリ全体用) ではなく専用ページが Chrome Web Store の
> 推奨に合致。

---

## 9. 提出時の最終チェックリスト

- [ ] パッケージ: `extension-v0.2.0.zip` をアップロード済み
- [ ] バージョンが `0.2.0` で表示されている
- [ ] 上記日本語タイトル / 概要 / 説明 を貼り付け
- [ ] 英語ロケールも追加 (任意だが米国ユーザー獲得に有利)
- [ ] 全権限の正当化 (特に `alarms` 新規分) を入力
- [ ] スクリーンショット 5 枚アップロード
- [ ] プライバシー ポリシー URL 設定
- [ ] カテゴリ: Productivity
- [ ] 公開対象地域: 全世界 (推奨) or 日本のみ (慎重ローンチ)
- [ ] 「審査のため送信」をクリック

審査期間目安: **1-3 営業日** (新規権限 alarms 追加につき若干長くなる可能性あり)。
