# Agent Team Marketplace + Autonomous Workflows — Spec v0.1

ステータス: ドラフト ・ 2026-05-09
オーナー: 竹内 航太

---

## 0. 何を作るか (1 行)

**「個別エージェント」じゃなく「業務丸ごとを動かすエージェント・チーム」**を販売・購入・運用できる仕組み。

- フェーズ 1: チームをパックで販売 (Multi-Agent Team Marketplace)
- フェーズ 2: チーム内のエージェントが**順序通りに自動実行** (Workflow)
- フェーズ 3: 外部トリガー (時刻 / Webhook) で**完全自律**実行 (Autonomous)

---

## 1. ユースケース (北極星)

### Case A: EC ローンチ自動化チーム ¥9,800
> ユーザー: 副業で EC を始めたい人
> チーム構成 (5 エージェント):
> 1. **🛍 Product Curator** — 仕入れ商品を Web 検索 → 選定理由つきで提案
> 2. **📸 Image Generator** — 商品画像を AI 生成 (Replicate)
> 3. **🌐 Site Builder** — Shopify Storefront API で店舗を構築
> 4. **📱 SNS Promoter** — X / IG に投稿、ハッシュタグ最適化
> 5. **📊 Sales Analyst** — Stripe Webhook 受信 → 売上分析 → 改善提案

### Case B: SaaS カスタマーサクセス・チーム ¥4,980
> 1. **🤝 Onboarding Lead** — 新規ユーザーにメール送信 + Slack DM
> 2. **🎓 Tutorial Maker** — 利用シナリオごとの解説生成
> 3. **💬 Support Tier 1** — Intercom / Zendesk と連携、一次回答
> 4. **🔁 Churn Prevention** — 離脱予兆を検知 → 個別キャンペーン

### Case C: SNS グロース・チーム ¥1,980
> 1. **📈 Trend Spotter** — X / TikTok 急上昇トピック収集
> 2. **✍️ Content Writer** — トレンドに合わせた投稿文生成
> 3. **📅 Scheduler** — 最適時刻に自動投稿

---

## 2. データモデル

### 2.1 `Team` オブジェクト (新規)

```js
{
  id: 'team_xxx',
  name: 'EC ローンチ自動化チーム',
  description: '...',
  cover_image: 'data:...',     // Marketplace 用ヒーロー画像
  agents: [                     // 構成エージェント
    {
      role_id: 'curator',        // チーム内での役割 ID
      role_label: '商品選定',
      agent_template: { /* 既存 agent 形式 */ name, persona, skills, model, ... },
      order: 1,                  // ワークフロー順序 (フェーズ 2 で使用)
    },
    ...
  ],
  workflow: {                   // フェーズ 2 で追加
    type: 'sequential' | 'parallel' | 'conditional',
    steps: [
      { agent_role: 'curator', input_template: '...{user_input}...' },
      { agent_role: 'image', uses_output_of: 'curator' },
      ...
    ]
  },
  marketplace: {                // フェーズ 1 必須
    is_listed: true,
    price_jpy: 9800,
    category: 'ecommerce',
    tags: ['ec','automation','solo'],
    listed_at: ISO,
    purchases_count: 0,
  },
  created_at, updated_at,
}
```

### 2.2 `User.teams` (新フィールド)

```js
user.teams = [
  {
    team_id: 'team_xxx',                   // テンプレート参照
    purchased_team_id?: 'team_yyy',         // 購入元 (購入の場合)
    cloned_agents: ['ag_a','ag_b','ag_c'], // クローン後の agents.id 配列
    workflow_state: 'idle' | 'running' | 'paused' | 'error',
    last_run_at: ISO,
  }
]
```

### 2.3 Stripe / 購入

買い切り価格は既存の `marketplace.price_jpy` ロジックを流用。差分:
- 1 回の決済で**N 体すべてクローン**
- レベニューシェア: 70% (買い切り) / 10% (利用料) — 既存ルール踏襲

---

## 3. UI / UX

### 3.1 サイドバー
新セクション **🎯 Teams** を追加 (Talks / Agents の隣)。
- 購入 or 自作したチーム一覧
- クリック → Team Workspace 画面

### 3.2 Marketplace の拡張
既存 Agent Store に `?type=team` フィルタ追加。
- カードがリッチ (構成エージェント全員のミニアバター + 役割が見える)
- 単体 agent と切替えて表示

### 3.3 Team Workspace (Phase 1)
```
┌─────────────────────────────────────────┐
│ 🎯 EC ローンチ自動化チーム  [Run team ▶] │
├─────────────────────────────────────────┤
│ Members:                                 │
│  🛍 商品選定   📸 画像生成   🌐 サイト構築 │
│  📱 SNS 投稿   📊 売上分析               │
├─────────────────────────────────────────┤
│ Chat (mention で個別呼び出し):           │
│  @Curator この商品調べて                 │
│  Curator: ...                            │
│  @Image この画像生成して                 │
│  Image: ...                              │
└─────────────────────────────────────────┘
```

### 3.4 Team Builder (自作)
ユーザーが自分でチームを組んで Marketplace に出店:
1. チーム名・説明・カバー画像
2. メンバー追加 (既存 agents から or 新規作成)
3. ワークフロー定義 (sequential / parallel / conditional)
4. 価格設定 → 出店

---

## 4. ワークフロー (Phase 2)

### 4.1 シンプル順次実行
```yaml
trigger: manual
steps:
  - agent: curator
    input: "{user_query}"
  - agent: image
    input: "Use product spec from previous step"
    depends_on: curator
  - agent: site
    input: "Create Shopify store with product + image"
    depends_on: [curator, image]
```

### 4.2 並列・条件分岐
```yaml
- parallel:
    - agent: writer
    - agent: scheduler
- if: "scheduler.result.scheduled"
  then:
    - agent: notifier
```

### 4.3 エージェント間通信
- 共有メモリ: `team.shared_state` (JSONB)
- 各エージェントの output は `step.output` に書かれて次のエージェントの input に注入

---

## 5. 外部統合 (Phase 3)

| 統合 | 用途 | 備考 |
|---|---|---|
| Shopify | EC ストア構築・商品登録 | OAuth |
| Stripe Webhook | 売上検知トリガー | 既存基盤あり |
| X (Twitter) API | 投稿 | OAuth, 月 500 投稿 |
| IG Graph API | 投稿 | Business アカウント必須 |
| Slack | 通知・コマンド | Webhook |
| Replicate | 画像生成 | 既存基盤あり |
| Resend | メール送信 | 既存基盤あり |

### Triggers
- **Manual**: ユーザーが Run ボタン
- **Cron**: 毎日 9:00 等
- **Webhook**: Stripe `checkout.session.completed` 等
- **Event**: チーム内で別エージェントが完了

---

## 6. 価格・収益モデル

### 単体 vs チーム

| | 単体 Agent | Team |
|---|---|---|
| 平均価格 | ¥1,980 | ¥4,980〜¥19,800 |
| 想定客単価 | ¥1.9k | ¥10k+ |
| クリエイター還元 | 70% | 70% (パック単位) |
| 利用料シェア | 10% | 10% (チーム全体合算) |

→ チーム販売は **客単価が 5〜10 倍**、ユーザー側も「業務丸ごと解決」できるので価値が高い。

### Subscription オプション (後日)
チームを月額制にもできる: 「月 ¥980 で運用」など。

---

## 7. 実装ロードマップ

| Sprint | 期間 | 内容 |
|---|---|---|
| **S1: データモデル** | 3 日 | `Team` オブジェクト, DB schema, 基本 CRUD |
| **S2: Marketplace** | 5 日 | チーム出店 + 購入 + クローン |
| **S3: Workspace UI** | 4 日 | Team Workspace 画面、メンバー一覧、@mention で個別呼び出し |
| **S4: Workflow YAML** | 5 日 | Sequential 実行、step.output 連鎖 |
| **S5: Phase 3 統合** | 別途 | Shopify / X API / トリガー |

合計: **MVP まで 17 営業日 (約 1 ヶ月)**

---

## 8. Phase 1 の MVP 範囲

これだけで売れる:
1. Team データモデル + DB
2. Team Marketplace 出店フロー
3. Team 購入 (一括クローン + レベニューシェア)
4. Team Workspace 画面 (メンバー一覧 + 個別チャット, 既存グループチャット流用)
5. テンプレートチーム 5 つ用意 (デモ用)

これがあれば **ARPU が 5 倍**になる可能性。Workflow は次の Sprint。

---

## 9. リスク

- **API 統合の保守コスト**: Shopify / X API は仕様変更が多い → エージェント側で抽象化
- **暴走防止**: 自律実行で大量 API 呼出し → 1 日 X 回 limit + 残高監視
- **ToS 違反**: X 自動投稿はガイドラインに引っかかりやすい → 公式 API 経由のみ
- **収益分配の複雑化**: チーム = 1 人のクリエイターのみ販売可、共同制作は Phase 4
