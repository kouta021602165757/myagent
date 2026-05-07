# MY AI AGENT — 公開前チェックリスト

最終更新: 2026-05-07

このリストは、コード側で対応できない（外部ダッシュボード操作・申請・文書整備）公開前タスクをまとめたもの。
コード側の修正は別途 git で完結している。

---

## 🔴 必須（公開前にやらないと事故る）

### 1. Render: Node → Docker モード切替

**理由**: Chrome 連携（Playwright/Chromium）が Linux Node 環境では `libnss3` 等の OS ライブラリ不足で
launch 失敗するケースがある。Docker モードなら `Dockerfile` (mcr.microsoft.com/playwright ベース) で
OS deps が全部揃う。

**手順**:
1. https://dashboard.render.com にログイン
2. `my-ai-agent` サービスを選択
3. Settings → Environment セクション
4. `Node` から **`Docker`** に切替
5. Save → 自動再デプロイ

**確認**: ログに `[browser] os_deps_missing` が消える。Chrome 連携 ON のエージェントでブラウジングが動く。

---

### 2. Anthropic: Tier 1 へアップグレード

**理由**: Free Tier は **10,000 input tokens/min** が org 全体の上限。
ヘビーユーザー 2-3 人同時に使うとレート制限で詰まる（429 エラー）。

**手順**:
1. https://console.anthropic.com/settings/limits
2. `Plans & billing` → Tier 1（または Tier 2/3）にアップグレード
3. クレジットカード登録 + $5 以上のチャージ

**Tier 別レート**:
| Tier | input tokens/min | RPM | 月間費用上限 |
|---|---|---|---|
| Free | 10K | 50 | $5 |
| Tier 1 | 50K | 50 | $100 |
| Tier 2 | 100K | 1K | $500 |
| Tier 3 | 200K | 2K | $1K |
| Tier 4 | 400K | 4K | $5K |

**推奨**: 公開直後は Tier 1、月 100 ユーザー超えたら Tier 2 へ。

---

### 3. Stripe Connect: 本番有効化（出金機能用）

**理由**: クリエイター出金機能（#7）は Stripe Connect Express 経由。
Connect は Stripe アカウント別に申請 + 審査が必要。

**手順**:
1. https://dashboard.stripe.com/connect/onboarding
2. `Connect を始める` → ビジネスタイプ等を入力
3. プラットフォーム情報の審査（通常 1-7 営業日）
4. 審査完了後、`stripe_connect_id` 経由で Express 口座作成可能になる

**注意**: 日本の Connect は対応済みだが、プラットフォーム手数料・KYC 要件が独自。
Stripe サポートに「クリエイターマーケットプレイスで 10% プラットフォーム手数料を引いて creator に送金」
という運用を伝えると審査が早い。

**未審査時の挙動**: 出金ボタン押下で Stripe API が 400 を返す → UI が「銀行口座の登録ができません」表示
（無音失敗ではなく、ユーザーには明示）。

---

### 4. 法的文書: プレースホルダー埋め

3 ファイルに赤字プレースホルダーが残っている。

**`public/legal.html`** (特商法表記):
- `〒XXX-XXXX 東京都〇〇区〇〇 X-X-X` → 実際の所在地
- `XX-XXXX-XXXX` → 実際の電話番号

**省略する場合の代替**:
特定商取引法では、住所・電話番号は「請求があれば遅滞なく開示する」と明記すれば省略可。
ただしこの方法はクレカ会社の審査（Stripe や決済代行）で弾かれることがあるので、
実住所表示が無難。

**`public/terms.html`** (利用規約):
プレースホルダー無し。ただし条文を弁護士に最終チェックしてもらうのが望ましい
（特に第8条免責、第10条管轄）。

**`public/privacy.html`** (プライバシー):
プレースホルダー無し。Personal Information Protection Commission（個人情報保護委員会）の
公式ガイドに沿った構成だが、扱う情報が増えたら都度更新が必要。

---

### 5. Google OAuth ログイン設定

**理由**: 「Googleでログイン」ボタンをクリックすると、現在は `?error=google_failed&reason=not_configured` でエラー表示される。
`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` が Render の環境変数に未設定のため。

**手順**:

1. **Google Cloud Console で OAuth Client を作成**:
   - https://console.cloud.google.com/apis/credentials
   - 「認証情報を作成」 → 「OAuth クライアント ID」
   - アプリケーションの種類: **Web アプリケーション**
   - 承認済みのリダイレクト URI に追加:
     ```
     https://myaiagents.agency/api/auth/google/callback
     ```
   - 作成後、Client ID と Client Secret をコピー

2. **OAuth 同意画面 (consent screen) を設定**:
   - 公開ステータス: 「テスト中」 → 「本番環境」
   - スコープ: `openid`, `email`, `profile`
   - アプリ名・サポートメール・ロゴを入力（公開審査に必要）

3. **Render 環境変数に追加**:
   - Render Dashboard → my-ai-agent → Environment
   - `GOOGLE_CLIENT_ID` = （Client ID）
   - `GOOGLE_CLIENT_SECRET` = （Client Secret）
   - 保存 → 自動再デプロイ

4. **動作確認**:
   - https://myaiagents.agency/auth.html → 「Googleでログイン」 → Google アカウント選択画面 → 戻ってきて自動ログイン

### 6. 管理者フラグの自分への付与

通報モデレーション機能は `is_admin: true` のユーザーのみ使える。

**手順** (Supabase の場合):
1. https://supabase.com/dashboard/project/<your-project>/sql/new
2. 以下を実行:
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'kota.takeuchi@protocol.ooo';
   ```
3. アプリで一度ログアウト→再ログインすると、設定パネルに「🛡 モデレーション」タブが出現

---

## 🟠 推奨（公開後でも可だが早めに）

### A. クリエイター検証バッジ

最初に出店する自分の `users.is_verified` を `true` に設定。

```sql
UPDATE users SET is_verified = true WHERE email = 'kota.takeuchi@protocol.ooo';
```

→ マーケットの自分の出店に青い ✓ が表示。OG 画像 (Pattern E) にも反映。

### B. Twitter Card 検証

公開した listing の URL を Twitter Card Validator で確認:
1. https://cards-dev.twitter.com/validator
2. URL 入力（例: `https://myaiagents.agency/l/ls_xxxxx-yyyyy-zzzz`）
3. Preview card で Pattern E のサムネイルが出れば OK

### C. 動作確認（最低限の E2E）

- [ ] サインアップ（メール / Google 両方）
- [ ] エージェント作成（テンプレ + ゼロから）
- [ ] チャット送信 → 課金が動くこと
- [ ] Pro プラン購読 → サブスク作成
- [ ] エージェント出店 → マーケットに出る
- [ ] 別アカで clone → 元 creator の `revenue_history` に + 10% 加算
- [ ] 詳細モーダル → デモプロンプト試用 → レビュー投稿
- [ ] お気に入り追加・削除
- [ ] タグフィルタ
- [ ] 公開ページ `/l/:id` で 3 ターン無料体験
- [ ] SNS シェアモーダル → サムネ表示
- [ ] Chrome 連携エージェント → ブラウジング動作

### D. メール送信設定

`RESEND_API_KEY` が設定されていない場合、メール認証メールが送られない（コンソールログにダンプされるだけ）。

**手順**:
1. https://resend.com/api-keys でキー発行
2. Render 環境変数に `RESEND_API_KEY` を追加
3. 検証用ドメインを `myaiagents.agency` で設定 → DNS TXT レコード追加
4. `FROM_EMAIL` を `noreply@myaiagents.agency` 等に変更

---

## 🟢 任意（後回し OK）

- Google Analytics / Plausible 設置
- sitemap.xml 動的生成（listing 自動追加）
- robots.txt の整備
- Twitter Card / OG meta の英語版
- 多言語化（公開ページ）
- お問い合わせフォーム
- 利用規約のバージョン管理（ユーザー再同意フロー）

---

## 公開当日のチェック

```bash
# 主要 URL が 200 で返るか
for url in "/" "/lp.html" "/auth.html" "/app.html" "/terms.html" "/privacy.html" "/legal.html"; do
  echo -n "$url → "
  curl -s -o /dev/null -w "%{http_code}\n" "https://myaiagents.agency$url"
done

# Health check
curl -s "https://myaiagents.agency/api/health"

# OG タグ確認
curl -s "https://myaiagents.agency/lp.html" | grep -E 'og:|twitter:'
```
