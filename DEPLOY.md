# 🚀 MY AI Agent — リリース手順書
## あなたがやること：全部で約30分

---

## ✅ STEP 1：Anthropic APIキーを取得（5分）

1. https://console.anthropic.com を開く
2. 「Sign Up」でアカウント作成（Google/GitHubログイン可）
3. クレジットカードを登録（初期クレジット $5 もらえます）
4. 「API Keys」→「Create Key」
5. 表示されたキー（`sk-ant-...`）をメモ帳にコピー

---

## ✅ STEP 2：Supabase DBを作成（5分）

1. https://supabase.com を開く → 「Start your project」
2. GitHubアカウントでサインイン
3. 「New project」→ 名前: `myagent` → パスワード設定 → リージョン: `Northeast Asia (Tokyo)`
4. プロジェクト作成完了まで約1分待つ
5. **「SQL Editor」**を開いて、`supabase_schema.sql` の中身を全部貼り付けて「Run」
6. **「Project Settings」→「API」** から以下をコピー：
   - `Project URL` → `SUPABASE_URL`
   - `service_role` → `SUPABASE_SERVICE_KEY`（⚠️ anon keyではなくservice_roleキー）

---

## ✅ STEP 3：GitHubにコードを上げる（5分）

```bash
# このフォルダでターミナルを開く

# Gitの初期設定（初めての場合）
git config --global user.email "あなたのメール"
git config --global user.name "あなたの名前"

# リポジトリ初期化
git init
git add .
git commit -m "first commit"
```

1. https://github.com を開く
2. 右上「+」→「New repository」
3. 名前: `myagent`、**Private**を選択、「Create repository」
4. 表示されたコマンドを実行：

```bash
git remote add origin https://github.com/あなたのユーザー名/myagent.git
git branch -M main
git push -u origin main
```

---

## ✅ STEP 4：Railwayにデプロイ（10分）

1. https://railway.app を開く
2. 「Login with GitHub」でログイン
3. 「New Project」→「Deploy from GitHub repo」
4. `myagent` リポジトリを選択
5. **「Variables」タブ**を開いて以下を1つずつ追加：

| 変数名 | 値 |
|--------|-----|
| `PORT` | `3000` |
| `JWT_SECRET` | ランダム文字列（下記で生成） |
| `ANTHROPIC_API_KEY` | `sk-ant-...`（STEP1で取得） |
| `SUPABASE_URL` | `https://xxxx.supabase.co`（STEP2で取得） |
| `SUPABASE_SERVICE_KEY` | `eyJh...`（STEP2で取得） |
| `APP_URL` | 後で設定（デプロイ後にURLが決まるので） |

**JWTシークレットの生成方法（ターミナルで実行）：**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

6. 「Deploy」ボタンをクリック
7. デプロイ完了（2〜3分）後、「Domains」タブで **URLをコピー**（例: `https://myagent-xxx.railway.app`）
8. Variables に戻って `APP_URL` に上記URLを設定 → 再デプロイ

**動作確認：** ブラウザで `https://myagent-xxx.railway.app` を開いてログイン画面が出ればOK！

---

## ✅ STEP 5：独自ドメインの設定（任意・10分）

1. お名前.com または https://www.cloudflare.com/ja-jp/products/registrar/ でドメイン取得（例: `myagent.jp` 約1,200円/年）
2. Railwayの「Settings」→「Domains」→「Custom Domain」→ドメイン入力
3. 表示されたCNAMEレコードをドメイン管理画面のDNSに設定
4. 反映まで最大24時間（だいたい数分〜1時間）

---

## ✅ STEP 6：Stripeで本物の課金を設定（任意・15分）

今はデモモードです。実際にお金を受け取るには：

1. https://stripe.com/jp でアカウント作成（本人確認・銀行口座が必要）
2. ダッシュボード → 「製品」→「製品を追加」
   - スターター: ¥480/月の定期支払いプランを作成 → `price_xxx` をコピー
   - プロ: ¥1,480/月の定期支払いプランを作成 → `price_xxx` をコピー
3. Railway環境変数に追加：
   - `STRIPE_SECRET_KEY` = `sk_live_...`
   - `STRIPE_PRICE_STARTER` = `price_xxx`
   - `STRIPE_PRICE_PRO` = `price_xxx`
4. Webhookの設定（Stripeダッシュボード → 「Webhooks」→「エンドポイントを追加」）：
   - URL: `https://あなたのドメイン/api/webhook/stripe`
   - イベント: `checkout.session.completed`
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...`

---

## 💰 月額コスト

| サービス | 無料枠 | 有料 |
|---------|--------|------|
| Railway | 月500時間 | $5/月〜 |
| Supabase | 500MB DB | $25/月〜 |
| ドメイン | - | 約¥1,500/年 |
| Anthropic API | - | 使った分だけ |

**月100ユーザーくらいまでは完全無料で運営できます。**

---

## 🆘 トラブルシューティング

**ログインできない**
→ Supabaseのテーブルが作られているか確認（STEP2の SQL実行を忘れずに）

**「APIキーが設定されていません」エラー**
→ Railway変数の `ANTHROPIC_API_KEY` を確認

**デプロイが失敗する**
→ Railwayの「Deployments」タブでログを確認。`JWT_SECRET` が未設定の場合が多い

**課金ボタンが動かない**
→ Stripe未設定の場合はデモモード（画面上ではプランが変わるが実際の課金なし）。正常な動作です

---

## 📞 次のステップ（リリース後）

- Google Analytics を入れてユーザー動向を把握
- メール通知（パスワードリセット等）: Resend.com が簡単
- 利用規約 / プライバシーポリシーページを追加（必須）
- X (Twitter) でサービスを告知
