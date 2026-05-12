# OAuth App セットアップガイド

連携カタログ (50 サービス) のうち「公式 OAuth」フロー対応サービスを 1-click 接続にするため、各サービスで **OAuth App の開発者登録** が必要です。本ドキュメントは登録手順 + Render 環境変数の投入方法をサービスごとに記載します。

## ✅ 現状で「即接続可能」のサービス (PAT / Webhook / API キー方式)

以下は OAuth App 登録不要、ユーザーが管理画面でトークンを発行して貼り付けるだけで動きます。

| サービス | 取得元 | 入力フィールド |
|---|---|---|
| **GitHub** | github.com/settings/tokens?type=beta | `pat` (Personal Access Token) |
| **Slack** | api.slack.com/messaging/webhooks | `webhookUrl` |
| **Discord** | チャンネル → Integrations → Webhooks | `webhookUrl` |
| **WordPress** | ダッシュボード → プロフィール → Application Passwords | `siteUrl` + `username` + `appPassword` |
| **Vercel** | vercel.com/account/tokens | `token` |
| **Cloudflare** | dash.cloudflare.com → API Tokens | `apiToken` + `accountId` |
| **Netlify** | app.netlify.com/user/applications | `token` |
| **Render** | dashboard.render.com/u/settings | `apiKey` |
| **Sentry** | sentry.io → Settings → Auth Tokens | `authToken` + `orgSlug` |
| **Supabase** | プロジェクト → Settings → API | `projectUrl` + `serviceKey` |
| **Airtable** | airtable.com/create/tokens | `apiKey` |
| **Telegram** | @BotFather にメッセージ | `botToken` |
| **LINE** | developers.line.biz | `channelAccessToken` |
| **Resend** | resend.com/api-keys | `apiKey` |
| **SendGrid** | app.sendgrid.com → API Keys | `apiKey` |
| **Cal.com** | app.cal.com → Settings → Developer | `apiKey` |
| **Todoist** | todoist.com/app/settings/integrations | `apiToken` |
| **Ghost** | Admin → Integrations | `adminUrl` + `apiKey` |
| **Beehiiv** | app.beehiiv.com/settings/integrations/api | `apiKey` |
| **Stripe** | dashboard.stripe.com/apikeys | `secretKey` |
| **Shopify** | Admin → Apps → Develop apps | `shopDomain` + `accessToken` |
| **Lemon Squeezy** | app.lemonsqueezy.com/settings/api | `apiKey` |
| **Gumroad** | gumroad.com/settings/advanced | `accessToken` |
| **Tavily** | tavily.com | `apiKey` |
| **ElevenLabs** | elevenlabs.io → API Keys | `apiKey` |
| **PostHog** | app.posthog.com → Project Settings | `apiKey` + `host` |
| **Plausible** | plausible.io/account/api-keys | `apiKey` + `siteId` |
| **Zapier** | Zapier で Webhook by Zapier ZAP 作成 | `webhookUrl` |
| **n8n** | セルフホスト n8n の Webhook ノード | `webhookUrl` |
| **Obsidian** | ローカル MCP サーバー起動 | `mcpUrl` |

**合計: 30 サービスが今日から動く** (15 priority + 15 standard)。

---

## 🔧 OAuth App 登録が必要なサービス (今後昇格)

以下は kota さん側で各サービスで OAuth App を作って Client ID / Secret を発行 → Render に環境変数を投入する作業が必要です。所要時間目安: 1 サービス 10-20 分。

### 推奨優先順 (priority 印つき = MVP に入れたい)

| 順 | サービス | 登録 URL | 必要な env var |
|---|---|---|---|
| 1 ⭐ | **GitHub OAuth** (PAT より UX 良) | github.com/settings/applications/new | `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET` |
| 2 ⭐ | **Notion** | notion.so/my-integrations | `NOTION_OAUTH_CLIENT_ID` / `NOTION_OAUTH_CLIENT_SECRET` |
| 3 ⭐ | **Google (Drive + Calendar + Gmail + GA4 + YouTube + Search Console)** | console.cloud.google.com/apis/credentials | `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` |
| 4 ⭐ | **X (Twitter)** | developer.x.com → Apps | `X_OAUTH_CLIENT_ID` / `X_OAUTH_CLIENT_SECRET` |
| 5 ⭐ | **LinkedIn** | linkedin.com/developers/apps | `LINKEDIN_OAUTH_CLIENT_ID` / `LINKEDIN_OAUTH_CLIENT_SECRET` |
| 6 ⭐ | **Linear** | linear.app/settings/api/applications | `LINEAR_OAUTH_CLIENT_ID` / `LINEAR_OAUTH_CLIENT_SECRET` |
| 7 | Trello | trello.com/app-key | `TRELLO_API_KEY` |
| 8 | Dropbox | dropbox.com/developers/apps | `DROPBOX_OAUTH_CLIENT_ID` / `DROPBOX_OAUTH_CLIENT_SECRET` |
| 9 | Reddit | reddit.com/prefs/apps | `REDDIT_OAUTH_CLIENT_ID` / `REDDIT_OAUTH_CLIENT_SECRET` |
| 10 | Zoom | marketplace.zoom.us | `ZOOM_OAUTH_CLIENT_ID` / `ZOOM_OAUTH_CLIENT_SECRET` |
| 11 | Instagram + Threads (Meta) | developers.facebook.com | `META_OAUTH_CLIENT_ID` / `META_OAUTH_CLIENT_SECRET` |
| 12 | Substack | substack.com/admin/api | `SUBSTACK_OAUTH_CLIENT_ID` / `SUBSTACK_OAUTH_CLIENT_SECRET` |
| 13 | note | note.com → 開発者設定 (要申請) | `NOTE_OAUTH_CLIENT_ID` / `NOTE_OAUTH_CLIENT_SECRET` |
| 14 | Product Hunt | api.producthunt.com/v2/oauth/applications | `PH_OAUTH_CLIENT_ID` / `PH_OAUTH_CLIENT_SECRET` |
| 15 | AWS (IAM Identity Center) | AWS Console → IAM | `AWS_OAUTH_CLIENT_ID` / `AWS_OAUTH_CLIENT_SECRET` |

---

## 📝 OAuth App 登録の共通手順

### ① 各サービスの開発者ポータルで新規 App 作成

例: GitHub OAuth App
1. https://github.com/settings/applications/new
2. **Application name**: `MY AI Agent`
3. **Homepage URL**: `https://myaiagents.agency`
4. **Authorization callback URL**: `https://myaiagents.agency/api/auth/github/callback`
5. ✅ Create application
6. Client ID をコピー / "Generate a new client secret" をクリックして Client Secret も発行

### ② Render に環境変数を追加

1. https://dashboard.render.com → MY AI Agent サービス
2. **Environment** タブ
3. **Add Environment Variable**
   - `GITHUB_OAUTH_CLIENT_ID` = (コピーした Client ID)
   - `GITHUB_OAUTH_CLIENT_SECRET` = (発行した Secret)
4. Save → 自動でデプロイ再起動 (1-2 分)

### ③ カタログで自動昇格

env var が検出されると、そのサービスのカードは「🔧 準備中」から「[接続]」ボタンに自動切り替わります (バックエンドの `has_backend` flag が動的に決まる場合)。

---

## 🚀 おすすめ着手順

1. **今日 / 明日中**: GitHub OAuth App (Path B 承認済) → 既存 PAT より良 UX
2. **今週中**: Google (1 OAuth App で 6 サービス分のスコープ取れる、超お得)
3. **来週**: X / LinkedIn / Notion / Linear
4. **以降**: ニーズに応じて追加

---

## 💡 トラブルシューティング

- **Callback URL mismatch**: 各サービスで登録した callback URL とコード内の callback URL が完全一致しているか確認。`http` / `https`、末尾の `/` も含めて。
- **Scope 不足**: 各 OAuth App 登録時に必要なスコープ (e.g. `repo`, `read:user`) を設定。後から変更可能なものが多い。
- **テストモード制限**: Google / Meta は本番審査前は開発者本人のアカウントしか接続できない場合あり。本番リリース前に審査申請。

---

最終更新: 2026-05-13
