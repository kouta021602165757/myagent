# Google OAuth Verification 申請チェックリスト

MY AI Agent の Google OAuth Workspace 6-in-1 機能を **テストユーザー以外の一般ユーザー** にも提供するための Google 公式審査 (Verification) を通すための手順 + 提出物まとめ。

## 🎯 目的

現状: テストモード (max 100 users / 全員 OAuth 同意画面で 「未確認のアプリ」警告が出る)
→ Verification 通過後: 警告なし / 無制限ユーザー対応

## 📅 想定タイムライン

| Phase | 所要時間 |
|---|---|
| 申請準備 (このドキュメント通り) | 1-2 時間 (kota さん作業) |
| Google 審査 | **2-6 週間** (Sensitive scope 含むため長め) |
| 不備差し戻し対応 | 各 1-2 週間 |

⚠️ 急ぐ場合は LP / Marketing で「テストユーザー登録制」を明示するか、Verification 不要の OAuth (例: `userinfo.profile` だけ) でログイン誘導するのも一手。

---

## 🛠️ 申請前の準備 (必須)

### 1. ドメイン所有権の検証
1. https://search.google.com/search-console を開く
2. **myaiagents.agency** を所有プロパティとして追加
3. DNS TXT レコードで verification 完了
4. Google Cloud Console → APIs & Services → Domain verification で同期確認

### 2. プライバシーポリシー / 利用規約ページ
**必須**: 以下を含む英語版ページが必要

- データ収集の種類と用途
- Google データの利用範囲 (Gmail / Drive / Calendar / Sheets 等それぞれ)
- データ保持期間
- 第三者への提供方針 (= 「行わない」と明記)
- 削除リクエストの方法

📝 推奨: `https://myaiagents.agency/privacy` と `https://myaiagents.agency/terms` を別途用意
- 現状の LP に privacy / terms ページがあるか確認 → なければ作成必要

### 3. ホームページに以下を表示
- アプリ名・ロゴ・短い説明
- プライバシーポリシーへのリンク (footer 等)
- 利用規約へのリンク
- サポート連絡先 (kota.takeuchi@protocol.ooo でも可)

---

## 📝 Google Cloud Console での申請手順

### Step 1: OAuth Consent Screen を完全に埋める

https://console.cloud.google.com/apis/credentials/consent

#### App information
| 項目 | 内容 |
|---|---|
| App name | `MY AI Agent` |
| User support email | `kota.takeuchi@protocol.ooo` |
| App logo | 120x120px PNG (Cloud Console にアップロード) |

#### App domain
| 項目 | URL |
|---|---|
| Application home page | `https://myaiagents.agency` |
| Application privacy policy link | `https://myaiagents.agency/privacy` |
| Application terms of service link | `https://myaiagents.agency/terms` |

#### Authorized domains
- `myaiagents.agency`

#### Developer contact information
- `kota.takeuchi@protocol.ooo`

### Step 2: Scopes — 必須項目

「Add or remove scopes」で以下を追加 (全部):

| Scope | 種別 | Justification 必須 |
|---|---|---|
| `userinfo.email` | non-sensitive | No |
| `userinfo.profile` | non-sensitive | No |
| `openid` | non-sensitive | No |
| `gmail.modify` | **Sensitive** + **Restricted** | **Yes — App Verification + CASA 必要** |
| `calendar` | Sensitive | Yes |
| `drive` | **Sensitive** + **Restricted** | **Yes — App Verification + CASA 必要** |
| `spreadsheets` | Sensitive | Yes |
| `analytics.readonly` | Sensitive | Yes |
| `youtube` | Sensitive | Yes |
| `webmasters.readonly` | Sensitive | Yes |

⚠️ **Restricted Scopes (gmail.modify, drive)** はさらに **CASA (Cloud Application Security Assessment)** が必要。**$15,000 〜の費用 + 数ヶ月**。スタートアップなら以下のオプション検討:
- ①  gmail.modify / drive を申請せず、`gmail.readonly` / `drive.file` (アプリ作成ファイルのみ) に絞る → 審査は楽
- ② 当面 Verification なしで運用 (テストユーザー max 100 だけ)
- ③ Restricted scopes を分離して新規プロジェクト (Workspace ユーザーのみに絞る等)

### Step 3: Scope ごとに Justification を書く

各 sensitive scope に対して、**なぜ必要か** を具体的に書く必要があり。テンプレ:

```
[gmail.modify]
本アプリでは AI エージェントがユーザーの指示に応じて、ユーザー本人のアカウント経由でメール送信・受信箱検索・スレッド管理を行います。具体的な機能:
- ユーザーから「○○ さんにメール送って」と指示された時に send_email ツールが本人のアカウントから送信
- 「最近のメールから△△に関するものを探して」と頼まれた時に労力なく検索
データは本人にしか表示せず、外部に送信・販売しません。

[calendar]
ユーザーが AI に「明日 15 時に会議入れて」「来週の空き時間教えて」と頼んだ時、本人のカレンダーに直接予定作成・空き時間取得を行います。

[drive]
ユーザーが「あの資料の中身教えて」「○○のドキュメント探して」と AI に頼んだ時、本人の Drive 内のファイルを検索・読み取りします。書き込みは create_artifact 経由のみ。

[spreadsheets]
ユーザーが AI に「このシートに今日の売上追記して」「○○のシートをグラフ化して」と頼んだ時、Sheets API 経由で読み書きを実行します。

[analytics.readonly]
ユーザーが「先週の GA データ要約して」「PV 推移グラフ化して」と頼んだ時、GA4 から読み取り専用でデータ取得します。書き込みなし。

[youtube]
ユーザーが「動画アップロードして」「コメント返信して」と AI に頼んだ時、本人の YouTube チャンネルでアップロード・コメント操作を行います。

[webmasters.readonly]
ユーザーが「SEO キーワード見たい」「順位レポート作って」と頼んだ時、Search Console から検索クエリ・順位・インプレッション等を読み取ります。書き込みなし。
```

### Step 4: アプリのデモ動画を録画

**1-2 分のデモ動画 (英語ナレーション or 字幕)** を YouTube に **非公開リスト** でアップ、URL を申請フォームに貼る。内容:

1. アプリ起動 → ログイン
2. 設定 → 連携 → Google 1 クリック接続
3. OAuth 同意画面で全 scope 承認
4. 戻ってきて Gmail / Calendar / Drive 機能を実際に使うシーン (例:「明日の予定教えて」とチャットで聞いて AI が Calendar API で予定取得)
5. プライバシーポリシーと利用規約ページ表示

⚠️ 動画は **scope を実際に使ってる挙動を示す** ことが必須。「Gmail に接続したけど機能を使わない」 = 「scope の利用目的が証明されてない」と却下される。

### Step 5: アプリの審査申請

Google Cloud Console → OAuth consent screen → **Publish App** → **Submit for verification**

申請フォーム入力:
- 上記の動画 URL
- Justification (各 scope)
- ドメイン所有権の確認
- 利用ユーザー想定数

---

## ⚠️ よくある却下理由

| 却下理由 | 対処 |
|---|---|
| **動画が scope の利用を示してない** | scope ごとに「使ってる場面」を 5-10 秒ずつ撮る |
| **プライバシーポリシーが Google データに言及してない** | "We access Gmail / Drive / Calendar with user's explicit consent and never share with third parties" の文言追加 |
| **ドメイン未検証** | Search Console で verification 必須 |
| **Restricted scope の CASA 未受験** | Restricted scope を外す or CASA 受験 ($15k〜) |
| **テストユーザーから本番ユーザーへの移行説明不足** | "Currently testing with 5 users, planning to release to 100+ users post-verification" を明記 |

---

## 🚀 実践的な進め方

### Phase 1: Verification 不要のまま運用 (~ 数週間〜数ヶ月)
- テストユーザー制限 (100 人まで) で運用
- LP に「現在ベータ版・テスター募集中」と明記
- Founder 100 と相性が良い (限定運用がむしろセールスポイント)

### Phase 2: Sensitive scope のみ申請 (CASA 不要)
- gmail.modify → gmail.send + gmail.readonly に分離 (CASA 不要)
- drive → drive.file (アプリが作成したファイルのみ) に絞る (CASA 不要)
- これで 2-6 週間で Verification 通る可能性高い

### Phase 3: 必要なら Restricted scope の CASA 受験
- ユーザー数が増えて gmail.modify / drive (full) が本当に必要になったタイミング
- 監査会社経由で $15k〜のセキュリティアセスメント
- 受験期間 1-3 ヶ月

---

## 🎯 まとめ

**今夜やる**: なし (申請は急がない)
**今週末**: privacy.html / terms.html ページ作成 (テンプレで OK)
**来月**: Phase 1 で運用継続、Phase 2 申請準備
**3 ヶ月後**: ユーザー数次第で Phase 3 検討

---

最終更新: 2026-05-13
