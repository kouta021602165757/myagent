# MY AI Agent — モバイルアプリ (Capacitor)

iOS / Android 両対応のネイティブシェル。
中身は `www/index.html` (起動スプラッシュ) → 既存 Web 版 (`https://myaiagents.agency/app.html`) を WebView で表示する設計。

## アーキテクチャ

```
┌──────────────────────────────────┐
│ iOS (.ipa) / Android (.apk)      │  Capacitor 6.x
│  ├ ネイティブシェル                │
│  ├ Plugins:                      │
│  │  ・PushNotifications (FCM/APNs)│
│  │  ・Camera (写真撮影・ライブラリ)  │
│  │  ・Preferences (Keychain)      │
│  │  ・StatusBar / Keyboard        │
│  │  ・Browser / Share / Haptics   │
│  └ WebView                       │
│     └ www/index.html (splash)    │
│         ↓ navigate to            │
│         https://myaiagents.agency │
└──────────────────────────────────┘
```

---

## 初回セットアップ (1度だけ)

### 1. 必要なもの

| | 用途 |
|---|---|
| **Node.js 20+** | `npm install` 用 |
| **Xcode 16+** + Apple Developer ID | iOS ビルド (Mac 必須) |
| **Android Studio** + JDK 17 | Android ビルド |
| CocoaPods | iOS のネイティブ依存 (`sudo gem install cocoapods`) |

### 2. プロジェクトセットアップ

```bash
cd mobile

# 依存パッケージ取得
npm install

# iOS / Android プロジェクトを生成
npx cap add ios
npx cap add android

# 念のため sync (web assets を native にコピー)
npx cap sync
```

→ `ios/` と `android/` ディレクトリが生成される (これらは `.gitignore` 対象、各自のマシンで生成)。

### 3. 環境チェック

```bash
npx cap doctor
```

→ 必要なツールが揃ってるか診断。Xcode / Android Studio がない場合はここで分かる。

---

## 実行 (シミュレータ / 実機)

### iOS (Mac 必須)

```bash
# Xcode で開く (推奨)
npm run ios

# または直接シミュレータで実行
npm run run:ios
```

→ Xcode が起動 → 上部の Run ボタン (▶) でシミュレータ起動。
→ 実機テストは Apple Developer Program の有料アカウントが必要。

### Android

```bash
# Android Studio で開く
npm run android

# または直接エミュレータで実行
npm run run:android
```

→ Android Studio で AVD (Android Virtual Device) を起動 → Run。

---

## 開発フロー

### Web 版を直してアプリにも反映

シェルが本番 URL を WebView で表示してるので、**Render に push すれば即時反映**。アプリ側はリビルド不要。

### スプラッシュ画面 (`www/index.html`) を直す

```bash
# 編集後
npx cap sync   # www/ を native プロジェクトにコピー
```

→ Xcode / Android Studio で再ビルド。

### ネイティブプラグイン追加

```bash
npm install @capacitor/<plugin-name>
npx cap sync
```

iOS の場合、Xcode で Pod 追加: `cd ios/App && pod install`

---

## App Store / Google Play 提出

### 必要なアセット

#### iOS
- アイコン: 1024×1024 PNG (App Store Connect 用) + 各サイズ
- スクショ: iPhone 6.7" / 6.5" / 5.5" 各サイズ最低 3 枚
- App Store Connect で新規アプリ作成 → archive → upload

#### Android
- アイコン: 512×512 PNG
- フィーチャーグラフィック: 1024×500 PNG
- スクショ: 最低 2 枚 (16:9 or 9:16)
- Google Play Console で APK / AAB アップロード

### 審査時の注意 (App Store 特に厳しい)

✅ **クリアすべきこと**
- WebView 単独ではなく、ネイティブ機能 (Push/Camera等) が動作している
- プライバシーポリシー URL 提供 (`https://myaiagents.agency/privacy.html`)
- ユーザーに価値を提供している (自己宣伝のみ NG)
- 課金は App Store IAP 経由 (or 「アカウント設定は Web で」と明記)

❌ **却下されやすいこと**
- 単なる Web ラッパー (= ネイティブ機能ゼロ)
- 外部リンクのみで何も操作できない
- プライバシーポリシー欠如

このプロジェクトは Push/Camera/Preferences を実装済みなので、上記をクリアできる見込み。

---

## プッシュ通知の流れ

```
[Server: タスク完了]
  ↓
[FCM / APNs にリクエスト送信]
  ↓
[端末: Capacitor.PushNotifications がトリガー]
  ↓
[ユーザータップ]
  ↓
[アプリ起動 → 該当画面へ deep link]
```

サーバー側は `/api/mobile/register-device` エンドポイント (要追加実装) で
端末トークンを受け取る予定 — 現状未実装、今後の Phase 2 で。

---

## トラブルシューティング

| 問題 | 対処 |
|---|---|
| `npx cap doctor` で警告 | 表示された通りツール導入 (Xcode CLI Tools 等) |
| iOS で `pod install` が失敗 | CocoaPods 再インストール: `sudo gem install cocoapods` |
| Android で gradle build が失敗 | `cd android && ./gradlew clean` |
| WebView でログインが保持されない | Cookie/LocalStorage が消える設定になってないか確認 |
| Push 通知が来ない | iOS は本番ビルドのみで動作 (シミュレータ不可) |

---

## 次のステップ

- [ ] 実機 (iPhone/Android) で動作確認
- [ ] FCM Console / Apple APNs 証明書セットアップ
- [ ] スクリーンショット 5 枚撮影 (App Store / Play Store 用)
- [ ] App Store Connect / Google Play Console でアプリ作成
- [ ] TestFlight / Internal Testing で身内に配布
- [ ] 審査用に提出
