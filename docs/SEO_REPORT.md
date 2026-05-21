# protocol.ooo SEO 日次レポート — セットアップ

毎朝、Search Console と GA4 の数値を集計し、Claude の分析コメントを添えて
メール送信する自動レポート。サーバープロセスだけで完結し、PC が起動して
いなくても動く。

実装:
- `server/seo-report.js` — データ収集 / Claude 分析 / HTML 生成 / 送信 / スケジューラ
- `server/index.js` — `SEO_REPORT=1` のとき起動時にスケジューラを開始
- メール送信は既存の Resend (`sendEmail`)、分析は既存の `callAI` を再利用

認証は **サービスアカウント (JWT bearer)**。ユーザーの OAuth ログインに
依存しないため、無人で安定して回る。

---

## セットアップ手順 (一度だけ)

### 1. Google Cloud でサービスアカウントを作成

1. https://console.cloud.google.com → プロジェクトを選択 (myagent 既存のものでOK)
2. 「APIとサービス」→「ライブラリ」で以下 2 つを **有効化**:
   - **Google Search Console API**
   - **Google Analytics Data API**
3. 「IAMと管理」→「サービスアカウント」→「サービスアカウントを作成」
   - 名前: 例 `seo-report`
   - ロール付与は不要 (データ側で個別に権限を渡す)
4. 作成したサービスアカウント →「キー」→「鍵を追加」→「JSON」
   - JSON ファイルがダウンロードされる。中の `client_email` を控える
     (例: `seo-report@xxxx.iam.gserviceaccount.com`)

### 2. Search Console にサービスアカウントを追加

1. https://search.google.com/search-console を開く
2. protocol.ooo のプロパティを選択
   - ドメインプロパティ推奨 (全サブドメインをまとめて集計できる)
3. 「設定」→「ユーザーと権限」→「ユーザーを追加」
4. 手順 1 で控えた `client_email` を、権限「制限付き」で追加

### 3. GA4 にサービスアカウントを追加

1. GA4 管理画面 →「管理」→「プロパティのアクセス管理」
2. `client_email` を、役割「閲覧者」で追加
3. 同じく「管理」→「プロパティの詳細」で **プロパティ ID** (数字) を控える

### 4. Render の環境変数を設定

Render ダッシュボード → my-ai-agent → Environment に以下を追加:

| キー | 値 |
|---|---|
| `SEO_REPORT` | `1` |
| `SEO_REPORT_TO` | レポート送信先メール (例: kota.takeuchi@protocol.ooo) |
| `SEO_REPORT_HOUR` | 送信時刻 JST。例 `8` (= 毎朝 8 時) |
| `SEO_GSC_SITE_URL` | `sc-domain:protocol.ooo` (ドメインプロパティの場合) |
| `SEO_GA4_PROPERTY_ID` | 手順 3 のプロパティ ID (数字のみ) |
| `SEO_GOOGLE_SA_KEY` | 手順 1 の JSON ファイルの中身を**そのまま全部**貼り付け |

`SEO_GOOGLE_SA_KEY` は JSON 全体を 1 つの値として貼り付ける。
`private_key` 内の改行 (`\n`) はそのままでよい。

### 5. 動作確認

1. 一時的に `SEO_REPORT_RUN_ON_BOOT=1` も追加してデプロイ
2. 起動の約 20 秒後にテストメールが 1 通届く
3. Render のログで `[seo-report] boot test sent` を確認
4. 確認できたら `SEO_REPORT_RUN_ON_BOOT` を `0` に戻す (または削除)

以降は毎朝 `SEO_REPORT_HOUR` 時に自動送信される。

---

## レポートの内容

- **Search Console**: クリック / 表示回数 / CTR / 平均掲載順位 (各前週比)、
  上位検索クエリ 10、上位ページ 10
- **GA4**: セッション / ユーザー / オーガニック流入 (各前週比)、
  チャネル別セッション、上位ランディングページ
- **AI 所見**: Claude が数値を読んで要因仮説を 3〜5 点
- **改善アクション**: その週にやるべき施策を 2〜3 点

GSC のデータは仕様上 2〜3 日遅れるため、確定済みの 7 日窓
(今日 -9 〜 -3 日) と、その前 7 日を比較している。

---

## 運用メモ

- **停止**: `SEO_REPORT` を `0` にする
- **送信時刻変更**: `SEO_REPORT_HOUR` を変更
- **サブドメイン個別**: `SEO_GSC_SITE_URL` を `https://about.protocol.ooo/`
  等の URL プレフィックスプロパティに変えると、そのサイト単体を集計
- Render 無料枠は Cron Job が無いため 60 秒 tick で時刻を待つ方式
  (marketing.js と同じ)。スリープ対策の keep-alive ping は既存のものを利用
- サービスアカウント JSON キーはリポジトリにコミットしない
  (env 変数のみ。`.env` も `.gitignore` 済み)
