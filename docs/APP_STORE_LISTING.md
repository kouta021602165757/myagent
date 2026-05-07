# App Store 掲載情報 — MY AI Agent (iOS)

App Store Connect に貼り付けるテキスト & チェックリスト。
すべて 2026 年現在の Apple の文字数制限 / フォーマットに準拠。

---

## 基本情報

| 項目 | 値 |
|---|---|
| **App Name** | MY AI Agent |
| **Subtitle** | AI エージェントを自分用に作る |
| **Bundle ID** | `ooo.protocol.myaiagent` |
| **Primary Language** | 日本語 (Japanese) |
| **Primary Category** | Productivity (生産性) |
| **Secondary Category** | Business (ビジネス) |
| **Age Rating** | 4+ (No objectionable content) |
| **Pricing** | Free (with In-App Purchases / external subscription) |
| **Availability** | 日本 (Japan) のみ初回リリース、後にグローバル展開 |

---

## App Store 説明文

### Subtitle (30 文字以内)

```
AIエージェントを自分用に作る
```

### Promotional Text (170 文字以内、いつでも更新可)

```
🚀 自分専用の AI エージェントを 30 秒で作成。Claude を使った会話、Google スプレッドシート連携、ブラウザ自動操作まで全部できる。プロトタイプから業務自動化まで、あなたの代わりに動く AI を。
```

### Description (4000 文字以内)

```
MY AI Agent は、自分専用の AI エージェントを誰でも作れるサービスです。

■ こんな人におすすめ
・繰り返し作業を AI に任せたい
・ChatGPT より自分の業務に特化した AI が欲しい
・Google スプレッドシートの集計や入力を自動化したい
・社内ナレッジを使った Q&A ボットを作りたい

■ 主な機能

【AI エージェント作成】
・自然言語で「この AI に何をさせたいか」を書くだけ
・Claude (Anthropic) の最新モデルを使用
・1 アカウントで複数のエージェントを使い分け
・公開 / 非公開の切り替え可能

【Google スプレッドシート連携】
・Google アカウントでログインして承認するだけ
・「このスプレッドシートに今月の売上を入力して」と指示すれば AI が自動操作
・読み取り / 書き込み / 集計 / フォーマット全部対応

【ブラウザ拡張連携 (Chrome)】
・Chrome 拡張をインストールすると、AI があなたのブラウザを操作
・「楽天で商品検索して比較表作って」のような複雑タスクを実行
・ローカル実行なので Cloudflare などのチェックも通過

【Agent Store】
・他のクリエイターが作った AI エージェントを試せる
・気に入ったものは「自分用にコピー」して即利用
・作成者は売上分配の対象 (今後実装予定)

【プッシュ通知】
・長時間タスクが完了したら通知
・チャットへの新着メッセージを通知

■ 料金

・無料プラン: 月 50 メッセージ / 1 エージェント
・Pro プラン: 月 1,980 円 / 無制限メッセージ / 10 エージェント
・Business プラン: 月 9,800 円 / 無制限 + チーム機能

サブスクリプションは Web 版から登録 (Stripe 経由)。
App Store IAP には対応していません。

■ プライバシー

・チャット内容は AI 応答生成のみに使用
・第三者への販売は一切なし
・詳細: https://myaiagents.agency/privacy.html

■ サポート

問題が起きた場合は support@myaiagents.agency まで。
平日 24 時間以内に返信します。

開発: 株式会社 PROTOCOL (Tokyo, Japan)
```

### Keywords (100 文字以内、カンマ区切り)

```
AI,エージェント,Claude,自動化,スプレッドシート,業務効率,ChatGPT,アシスタント,生産性,自動操作
```

### Support URL

```
https://myaiagents.agency/support
```

### Marketing URL

```
https://myaiagents.agency
```

### Privacy Policy URL

```
https://myaiagents.agency/privacy.html
```

---

## App Privacy (App Privacy Details)

App Store Connect → App Privacy で以下を申告:

### 収集するデータ

| データ種別 | 用途 | 第三者共有 |
|---|---|---|
| Email Address | アカウント認証 | なし |
| Name (任意) | プロフィール表示 | なし |
| User Content (チャット履歴) | サービス機能 (AI応答生成) | あり: Anthropic (AI 処理) |
| Identifiers (User ID) | サービス機能 / 分析 | なし |
| Usage Data (機能利用状況) | 分析 / 製品改善 | あり: Google Analytics |
| Diagnostics (クラッシュログ) | アプリ品質改善 | なし |

### Data Linked to User

- Email Address ✅
- Name ✅
- User Content ✅
- User ID ✅

### Data Used to Track You

- なし (Tracking なし)

---

## In-App Purchases (将来用)

現在は Web で Stripe 課金のみ。
App Store IAP を追加する場合:

| Product ID | Type | Price |
|---|---|---|
| `pro_monthly` | Auto-Renewable Subscription | ¥1,980/月 |
| `business_monthly` | Auto-Renewable Subscription | ¥9,800/月 |

⚠ Apple は外部課金を厳しく制限。Web 課金しか案内しない場合、Reader App 認定 or Sign-in 不要 UI を維持する必要あり。

---

## Age Rating Questionnaire

すべて **No** で 4+ 想定:

- Cartoon or Fantasy Violence: No
- Realistic Violence: No
- Sexual Content or Nudity: No
- Profanity or Crude Humor: No
- Alcohol, Tobacco, or Drug Use: No
- Mature/Suggestive Themes: No
- Horror/Fear Themes: No
- Gambling: No
- Contests: No
- Unrestricted Web Access: No (WebView は本サービス内のみ)
- User-Generated Content: Yes (Agent 作成 / Agent Store) → モデレーション機能あり
- Medical/Treatment Information: No

→ 4+

---

## App Review Information (審査担当者向け)

### Demo Account

```
Email: review@myaiagents.agency
Password: Review2026!Apple
```

(専用アカウントを事前作成。サンプル Agent と Chat 履歴を仕込んでおく)

### Notes

```
Hello,

This is MY AI Agent — a Japan-based SaaS that lets users create personal AI agents powered by Claude (Anthropic).

The app is a Capacitor wrapper around our web product (myaiagents.agency). Native features used:
- Push Notifications (FCM/APNs) for task completion alerts
- Camera (for users to upload images during chat — optional)
- Preferences (Keychain) to store the device push token

Test flow:
1. Launch the app — splash screen appears.
2. After ~1 second, the app navigates to the web view.
3. Sign in with the demo account above (or use Apple Sign-In if visible).
4. Create a new agent with any prompt — AI responds within 5 seconds.
5. Tap the bell icon to see push notification permission prompt (granted = ✅).

If you have trouble signing in, please contact support@myaiagents.agency.

Thank you for the review.
```

### Sign-In Required

**Yes** — but the demo account above grants full access.

### Contact Information

- First Name: Kouta
- Last Name: Takeuchi
- Phone: +81-XX-XXXX-XXXX
- Email: kota.takeuchi@protocol.ooo

---

## ビルド & 提出フロー

### 0. 事前準備 (1 度だけ)

1. **Apple Developer Program** 加入 ($99/年) → https://developer.apple.com/programs/
2. **App Store Connect** で新規 App 登録
   - Name: MY AI Agent
   - Bundle ID: ooo.protocol.myaiagent
   - SKU: myaiagent-ios-001
   - Primary Language: Japanese
3. **証明書 / Provisioning Profile** を Xcode に自動生成させる (Xcode → Settings → Accounts)

### 1. アイコン / スプラッシュをネイティブにコピー

```bash
cd mobile
npm install -D @capacitor/assets
npx capacitor-assets generate --ios
```

→ `ios/App/App/Assets.xcassets/AppIcon.appiconset/` に全サイズが配置される

### 2. ビルド

```bash
cd mobile
npm run build
npx cap sync ios
open ios/App/App.xcworkspace  # Xcode 起動
```

Xcode で:
- Signing & Capabilities → Team を選択 (有料アカウント必須)
- Product → Archive
- Window → Organizer → Distribute App → App Store Connect → Upload

### 3. TestFlight で内部テスト

1. App Store Connect → TestFlight
2. ビルドが「処理中」→ 「テスト準備完了」になるまで待つ (15 分程度)
3. Internal Testing グループに自分を追加
4. iPhone で TestFlight アプリからインストール → 動作確認

### 4. 審査提出

1. App Store → 1.0 → Build を選択
2. 上記の説明文をコピペ
3. スクリーンショット 5 枚 (6.7" 必須 = 1290×2796) アップロード
4. 「Submit for Review」

審査期間: 通常 1〜3 日 (初回は 7 日かかることも)

---

## 却下されやすいポイント & 対策

| 却下理由 | 対策 |
|---|---|
| **Guideline 4.2 — 単なる Web ラッパー** | Push / Camera / Preferences プラグイン使用済み ✅ |
| **Guideline 5.1.1 — プライバシーポリシー欠如** | privacy.html 提供済み ✅ |
| **Guideline 3.1.1 — Apple IAP 迂回** | Web 課金は触れない or「アカウント設定は Web で」と表記 |
| **Guideline 2.1 — クラッシュ** | TestFlight で 5 端末以上テスト |
| **Guideline 5.1.2 — データ共有の透明性** | App Privacy で正確に申告 |
| **Guideline 1.5 — 連絡先情報欠如** | サポートメール / URL 提供済み ✅ |

---

## バージョン更新時 (v1.0.1 以降)

```bash
# package.json と Xcode の Version / Build を上げる
cd mobile
npm version patch  # 1.0.0 → 1.0.1
npx cap sync ios
# Xcode で Build 番号を増やす (1 → 2)
# Archive → Upload → 「What's New」を書いて Submit
```

「What's New」例:

```
v1.0.1
・スプラッシュ表示時間を短縮
・iPhone 16 Pro Max のセーフエリア対応
・軽微な不具合修正
```
