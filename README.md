# MY AI Agent 🤖

専属AIエージェントを作って仕事を任せるWebサービス

## セットアップ手順

### 1. .env を作成
```bash
cp .env.example .env
```
`.env` を開いて以下を設定：
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx   # Anthropic APIキー
JWT_SECRET=ランダムな文字列
PORT=3000
```

### 2. サーバー起動
```bash
node server/index.js
```

### 3. ブラウザで開く
```
http://localhost:3000
```

---

## 技術スタック

- **フロントエンド**: Vanilla JS + CSS（外部依存なし）
- **バックエンド**: Node.js 組み込みモジュールのみ（`http`, `https`, `crypto`, `fs`）
- **DB**: JSON ファイル（`server/db.json` に自動生成）
- **認証**: JWT (HS256, 自前実装)
- **パスワード**: PBKDF2 ハッシュ
- **AIチャット**: Anthropic Claude API

## API エンドポイント

| Method | Path | 説明 |
|--------|------|------|
| POST | /api/auth/signup | 新規登録 |
| POST | /api/auth/login | ログイン |
| GET | /api/me | 自分の情報 |
| GET | /api/agents | エージェント一覧 |
| POST | /api/agents | エージェント作成 |
| DELETE | /api/agents/:id | エージェント削除 |
| POST | /api/chat/:agentId | チャット送信 |
| POST | /api/billing/upgrade | プランアップグレード |
| GET | /api/usage | 使用状況 |

## プラン

| プラン | 価格 | メッセージ数 |
|--------|------|-------------|
| Free | 無料 | 50通 |
| スターター | ¥480/月 | 100通 |
| プロ | ¥1,480/月 | 無制限 |

## 本番デプロイ時の追加対応

- [ ] Stripe Webhook で本物の決済処理
- [ ] PostgreSQL / MySQL に移行
- [ ] HTTPS 対応 (リバースプロキシ: nginx)
- [ ] Rate limiting 追加
- [ ] メール認証

## デモアカウント
- Email: `test@test.com`
- Password: `password`
