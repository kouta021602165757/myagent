# MY AI Agent — モバイルリリース チェックリスト

戻ってきたらこのファイルを上から順にチェック。
所要時間は **Apple Developer / Google Play 登録待ちを除いて約 1 日**。

---

## 完了済み (Claude が事前準備)

- [x] Capacitor プロジェクト初期化 (`mobile/`)
- [x] アイコン生成 — `mobile/resources/icon.png` + iOS 15 サイズ + Android 6 サイズ
- [x] スプラッシュ画像 — `mobile/resources/splash.png` + dark
- [x] サーバー API: `/api/mobile/register-device`, `/api/mobile/devices`, `/api/mobile/unregister-device`
- [x] スプラッシュ HTML が登録 API を自動呼び出し (`mobile/www/index.html`)
- [x] App Store 掲載文 — `docs/APP_STORE_LISTING.md`
- [x] Google Play 掲載文 — `docs/PLAY_STORE_LISTING.md`
- [x] App Store 用 SS 8 枚 (1290×2796) — `mobile/store-screenshots/ios/`
- [x] Play Store 用 SS 8 枚 (1080×2400) — `mobile/store-screenshots/android/`

---

## 次にやること (Takeuchi が手を動かす)

### Phase 1: 開発環境セットアップ (30 分)

- [ ] **Xcode 16+** インストール (App Store から無料)
- [ ] **Xcode CLI Tools**: `xcode-select --install`
- [ ] **CocoaPods**: `sudo gem install cocoapods`
- [ ] **Android Studio** インストール (https://developer.android.com/studio)
- [ ] **JDK 17** 確認: `java -version`
- [ ] **環境チェック**:
  ```bash
  cd mobile
  npm install
  npx cap doctor   # 全部 ✅ になればOK
  ```

### Phase 2: ネイティブプロジェクト作成 (10 分)

- [ ] iOS プロジェクト生成:
  ```bash
  cd mobile
  npx cap add ios
  ```
- [ ] Android プロジェクト生成:
  ```bash
  cd mobile
  npx cap add android
  ```
- [ ] アセットを native にコピー:
  ```bash
  npm install -D @capacitor/assets
  npx capacitor-assets generate
  ```

### Phase 3: ローカル動作確認 (30 分)

#### iOS シミュレータ

- [ ] `npm run ios` で Xcode 起動
- [ ] 上部 ▶ ボタン → iPhone 16 Pro Max シミュレータで起動
- [ ] スプラッシュ → 本番サイトに遷移することを確認
- [ ] Push 通知許可ダイアログが出ることを確認

#### Android エミュレータ

- [ ] Android Studio で AVD 作成 (Pixel 8 / API 34)
- [ ] `npm run android` → ▶ で実行
- [ ] スプラッシュ → 本番サイトに遷移確認

### Phase 4: 開発者アカウント登録 (各 30 分 + 審査待ち)

#### Apple Developer Program ($99/年)

- [ ] https://developer.apple.com/programs/ でサインアップ
- [ ] Individual or Organization を選択
  - 株式会社 PROTOCOL → **Organization** で登録すると D-U-N-S 番号が必要 (約 1 週間)
  - すぐ進めたいなら **Individual** で登録、後日 Organization に移行可
- [ ] 支払い完了後 24〜48h でアクティベート
- [ ] App Store Connect で新規 App 作成
  - Bundle ID: `ooo.protocol.myaiagent`
  - SKU: `myaiagent-ios-001`
  - Name: `MY AI Agent`

#### Google Play Console ($25 一括)

- [ ] https://play.google.com/console でサインアップ
- [ ] $25 支払い → 即時アクティベート
- [ ] 「アプリを作成」
  - 名前: `MY AI Agent`
  - デフォルト言語: 日本語
  - アプリ / ゲーム: アプリ
  - 無料

### Phase 5: ビルド & アップロード

#### iOS (TestFlight 経由)

- [ ] `npx cap sync ios && open ios/App/App.xcworkspace`
- [ ] Xcode → Signing & Capabilities → Team 選択
- [ ] Bundle Identifier 確認: `ooo.protocol.myaiagent`
- [ ] Push Notifications capability を追加
- [ ] Product → Archive
- [ ] Window → Organizer → Distribute App → App Store Connect
- [ ] アップロード完了後、TestFlight で 15〜30 分待つ
- [ ] 自分の iPhone に TestFlight アプリで配信 → 動作確認
- [ ] OK なら App Store 提出
  - 説明文: `docs/APP_STORE_LISTING.md` からコピペ
  - スクショ: `mobile/store-screenshots/ios/` 8 枚アップロード
  - 「審査に提出」

#### Android (Internal Testing → Closed Testing → Production)

- [ ] 署名キーストア作成 (1 度だけ):
  ```bash
  cd mobile/android
  keytool -genkey -v -keystore my-release-key.keystore \
    -alias myaiagent -keyalg RSA -keysize 2048 -validity 10000
  ```
  → パスワードを 1Password に保存
- [ ] `mobile/android/keystore.properties` 作成 (gitignore 必須):
  ```properties
  storeFile=../my-release-key.keystore
  storePassword=xxx
  keyAlias=myaiagent
  keyPassword=xxx
  ```
- [ ] AAB ビルド:
  ```bash
  cd mobile/android
  ./gradlew bundleRelease
  ```
- [ ] Play Console → 内部テスト → AAB アップロード
- [ ] 自分のメールをテスター追加 → スマホで動作確認
- [ ] OK ならクローズドテスト → 20 名 / 14 日 → 本番へ昇格
  - 説明文: `docs/PLAY_STORE_LISTING.md` からコピペ
  - スクショ: `mobile/store-screenshots/android/` 8 枚アップロード

### Phase 6: 審査対応

- [ ] App Store: 審査 1〜7 日。却下されたら指摘箇所を修正して再提出
- [ ] Play Store: 審査 1〜7 日。クローズドテスト要件 (20名/14日) を待つ間に他作業

---

## トラブルシューティング

| 症状 | 対処 |
|---|---|
| `npx cap doctor` で警告 | 表示通りツール導入。Xcode CLI / JDK17 不足が多い |
| `pod install` 失敗 | `sudo gem install cocoapods` 再実行 |
| `./gradlew` で OutOfMemory | `~/.gradle/gradle.properties` に `org.gradle.jvmargs=-Xmx4g` |
| iOS Push 通知が来ない | シミュレータでは届かない (実機 + APNs 証明書必須) |
| WebView でログイン保持されない | iOS の `WKWebsiteDataStore` 設定で Cookie 永続化 |
| 「単なる Web ラッパー」と却下 | Camera / Push / Preferences が呼ばれていることを審査ノートで明記 |

---

## 配信開始までの目安

| 段階 | 所要時間 |
|---|---|
| Apple Developer 登録 | 1〜7 日 (D-U-N-S 取得が長い) |
| Google Play 登録 | 即日 |
| 初回ビルド & TestFlight | 1 日 |
| App Store 審査 | 1〜7 日 |
| Play Store 内部 → 本番 | 14 日 (テスト要件) |

→ **App Store 経由なら最短 5 日、Play Store は 14 日後**

---

## 次に Claude に頼むタスク (戻ってきたら)

- 課金 (App Store IAP / Google Play Billing) 実装
- 多言語化 (英語 / 中国語) — 海外展開時
- ディープリンク (`myaiagent://chat/123`) でメッセージから直接チャットへ
- App Store / Play Store の SS 撮り直し (実機ベース)
- Sentry / Firebase Crashlytics 統合
