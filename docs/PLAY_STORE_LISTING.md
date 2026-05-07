# Google Play 掲載情報 — MY AI Agent (Android)

Play Console に貼り付けるテキスト & チェックリスト。
2026 年現在の Google の文字数制限 / フォーマットに準拠。

---

## 基本情報

| 項目 | 値 |
|---|---|
| **アプリ名** | MY AI Agent |
| **パッケージ名** | `ooo.protocol.myaiagent` |
| **デフォルト言語** | 日本語 (Japanese) |
| **アプリ / ゲーム** | アプリ |
| **無料 / 有料** | 無料 (アプリ内サブスクリプションあり) |
| **公開ステータス** | 本番 (まずは内部テスト → クローズドテスト → 本番) |

---

## ストア掲載情報

### アプリ名 (30 文字以内)

```
MY AI Agent — 自分専用AI作成
```

### 簡単な説明 (80 文字以内)

```
あなた専用のAIエージェントを30秒で作成。Claude搭載、スプレッドシート連携、業務自動化対応。
```

### 詳細な説明 (4000 文字以内)

```
MY AI Agent は、自分専用の AI エージェントを誰でも作れるサービスです。

🚀 こんな人におすすめ
・繰り返し作業を AI に任せたい
・ChatGPT より自分の業務に特化した AI が欲しい
・Google スプレッドシートの集計や入力を自動化したい
・社内ナレッジを使った Q&A ボットを作りたい

✨ 主な機能

📌 AI エージェント作成
・自然言語で「この AI に何をさせたいか」を書くだけ
・Claude (Anthropic) の最新モデルを使用
・1 アカウントで複数のエージェントを使い分け
・公開 / 非公開の切り替え可能

📌 Google スプレッドシート連携
・Google アカウントでログインして承認するだけ
・「このスプレッドシートに今月の売上を入力して」と指示すれば AI が自動操作
・読み取り / 書き込み / 集計 / フォーマット全部対応

📌 ブラウザ拡張連携 (PC で Chrome 必要)
・Chrome 拡張をインストールすると、AI があなたのブラウザを操作
・「楽天で商品検索して比較表作って」のような複雑タスクを実行
・ローカル実行なので Cloudflare 等のチェックも通過

📌 Agent Store
・他のクリエイターが作った AI エージェントを試せる
・気に入ったものは「自分用にコピー」して即利用
・作成者は売上分配の対象 (今後実装予定)

📌 プッシュ通知
・長時間タスクが完了したら通知
・チャットへの新着メッセージを通知

💰 料金
・無料プラン: 月 50 メッセージ / 1 エージェント
・Pro プラン: 月 1,980 円 / 無制限メッセージ / 10 エージェント
・Business プラン: 月 9,800 円 / 無制限 + チーム機能

サブスクリプションは Web 版 (myaiagents.agency) から登録できます。

🔒 プライバシー
・チャット内容は AI 応答生成のみに使用
・第三者への販売は一切なし
・詳細: https://myaiagents.agency/privacy.html

📞 サポート
support@myaiagents.agency
平日 24 時間以内に返信します。

開発: 株式会社 PROTOCOL (Tokyo, Japan)
```

---

## グラフィック アセット

### アプリアイコン

- **必須**: 512×512 PNG (32-bit, アルファ可)
- **生成済み**: `mobile/resources/android/ic_launcher-512.png`

### フィーチャーグラフィック

- **必須**: 1024×500 JPG/PNG
- **デザイン案**: 黒地 + 「AI Agent を 30 秒で作る」キャッチコピー + 3 本バーロゴ
- **作成方法**: Figma / Canva で作成、または mobile/scripts/generate-feature-graphic.js を後日追加

### スクリーンショット (Android)

- **最低 2 枚、推奨 8 枚**
- **携帯**: 16:9 縦 = 1080×1920 推奨 (320〜3840px)
- **タブレット**: 7 インチ + 10 インチ最低各 1 枚

→ Playwright で生成: `mobile/scripts/generate-screenshots.js`

### ビデオ (任意、推奨)

- YouTube URL 1 本 (30 秒〜2 分)
- 後日 OBS で画面録画 → アップロード

---

## カテゴリ / タグ

| 項目 | 値 |
|---|---|
| **アプリのカテゴリ** | 仕事効率化 (Productivity) |
| **タグ** | AI, アシスタント, 自動化, 業務効率, 生産性 |

---

## 連絡先情報

| 項目 | 値 |
|---|---|
| **ウェブサイト** | https://myaiagents.agency |
| **メール** | support@myaiagents.agency |
| **電話** | (任意) |
| **プライバシーポリシー** | https://myaiagents.agency/privacy.html |

---

## コンテンツのレーティング

Google Play の質問票で全て **No / 該当なし** を選択 → IARC レーティング **3+** (全年齢)

- 暴力 / 性的内容 / 不適切な言葉: 該当なし
- ユーザー生成コンテンツ: あり (Agent / Chat 履歴) → モデレーション機能あり
- 位置情報共有: なし
- 個人情報共有: メール / 名前 (アカウント機能のため必須)

---

## アプリ コンテンツ

Play Console → アプリ コンテンツ で以下を申告:

### 個人情報の取り扱い (Data Safety)

| データ種別 | 収集 | 共有 | 暗号化 | 削除依頼可 |
|---|---|---|---|---|
| メールアドレス | ✅ | ❌ | ✅ | ✅ |
| 名前 (任意) | ✅ | ❌ | ✅ | ✅ |
| ユーザー ID | ✅ | ❌ | ✅ | ✅ |
| メッセージ (チャット) | ✅ | ✅ (Anthropic API) | ✅ | ✅ |
| アプリ操作 / 機能利用状況 | ✅ | ✅ (Google Analytics) | ✅ | ❌ |
| クラッシュログ / 診断 | ✅ | ❌ | ✅ | ❌ |

### 広告 ID 使用

❌ なし (広告未表示)

### ターゲット ユーザー

13 歳以上

### 政府向けアプリ

❌ いいえ

### COVID-19 関連

❌ いいえ

### ニュース アプリ

❌ いいえ

---

## 公開設定

### 国 / 地域

最初は **日本** のみ。動作確認後にグローバル展開。

### デバイス

- 携帯電話: ✅
- タブレット: ✅
- Chromebook: ✅ (Android アプリ動作可)
- Wear OS: ❌
- TV: ❌
- Auto: ❌

---

## ビルド & 提出フロー

### 0. 事前準備 (1 度だけ)

1. **Google Play Console** 登録 ($25 一括)
   → https://play.google.com/console
2. **アプリ署名鍵** を Play App Signing に委ねる (推奨)
3. **新規アプリ作成**
   - 名前: MY AI Agent
   - デフォルト言語: 日本語
   - アプリ / ゲーム: アプリ
   - 無料 / 有料: 無料

### 1. アイコン / スプラッシュをネイティブにコピー

```bash
cd mobile
npm install -D @capacitor/assets
npx capacitor-assets generate --android
```

### 2. ビルド (AAB 形式)

```bash
cd mobile
npm run build
npx cap sync android
cd android
./gradlew bundleRelease
```

→ `android/app/build/outputs/bundle/release/app-release.aab` が生成される

⚠ 初回は **署名キーストア** 作成が必要:
```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -alias myaiagent -keyalg RSA -keysize 2048 -validity 10000
```

→ `android/keystore.properties` に登録 (gitignore 必須):
```properties
storeFile=../my-release-key.keystore
storePassword=xxx
keyAlias=myaiagent
keyPassword=xxx
```

→ `android/app/build.gradle` の signingConfigs を有効化

### 3. 内部テスト

1. Play Console → リリース → テスト → 内部テスト
2. AAB をアップロード
3. テスター (自分のメール) を追加
4. 招待リンクから Play ストアでインストール

### 4. クローズド テスト → 本番

1. 内部テストで動作確認 OK → クローズドテストに昇格
2. 20 人 14 日間のテスト要件をクリア (2024 年から必須)
3. 本番に昇格 → 審査 (通常 1〜7 日)

---

## 却下されやすいポイント & 対策

| 却下理由 | 対策 |
|---|---|
| **Data Safety フォーム不備** | 全項目正確に申告 ✅ |
| **プライバシーポリシー URL 切れ** | privacy.html を恒常的に維持 ✅ |
| **WebView 単独** | Push / Camera / Preferences 使用済み ✅ |
| **20 人 / 14 日テスト要件未達** | クローズドテストで満たす |
| **Target API Level 古すぎ** | Capacitor 6 = API 34 で OK ✅ |
| **権限の過剰宣言** | 使用してない権限は manifest から削除 |

---

## バージョン更新時

```bash
# capacitor.config の version を上げる必要なし (build.gradle で管理)
cd mobile/android
# build.gradle:
#   versionCode 2
#   versionName "1.0.1"
./gradlew bundleRelease
# Play Console で AAB を新規リリースとしてアップロード
```

「リリースノート」例:

```
v1.0.1
・スプラッシュ表示時間を短縮
・Android 14+ のセーフエリア対応
・軽微な不具合修正
```
