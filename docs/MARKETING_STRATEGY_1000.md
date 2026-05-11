# MY AI AGENT — 7 日で 1,000 ユーザー獲得スプリント (v2)

最終更新: 2026-05-11
担当: kota.takeuchi (founder-led)
方針: **英語のみ / US + EU overseas indie hacker 中心**
内部メモは JP のまま (これ自体, 日次レポート etc.)。公開向けコピーはすべて英語。

---

## ⚠️ 正直な前提

**1 週間で 1000 sign-up は cold start でストレッチ。** 達成には複数条件揃う必要あり:

1. **Hero day** (Day 4) で 600+ signup
2. **ショート動画を 4 プラットフォームに横展開** (TikTok / Reels / YT Shorts / LinkedIn) — 今回新規追加
3. **既存インフラ (autopilot / Founder 100 / 動画)** をフル活用
4. **ニュースレター 1+ 件の掲載確定** を Day 4 までに
5. **50-100 名のサポーター連絡先**を Day 3 までに

**期待値レンジ**:
- 全条件揃う + 短尺動画が 1 本でも当たる → **1,000-1,800 signup**
- PH か HN どちらかが front page → **600-1,000 signup** (target 圏内)
- どちらもコケる → **300-600 signup** (未達)

**達成確率の感覚**: 50-60% (短尺動画追加で前回より +10pt)

---

## ✅ 構築完了済 (本日着手すれば即稼働)

| 項目 | 状態 | 起動方法 |
|---|---|---|
| X 投稿自動生成 (英語 8 本/日) | ✅ 稼働可能 | Render Env で `MKT_AUTOPILOT=1` + `MKT_ADMIN_EMAIL=...` set |
| 23:00 JST 日次 HTML レポート | ✅ 同上 | autopilot が自動で送信 |
| UTM Attribution | ✅ deployed | 全 signup 自動 tag |
| `/admin-marketing.html` 管理画面 | ✅ live | `📋 コピー` + `𝕏 投稿ウィンドウ` ワンクリック |
| **Founder 100 機構** | ✅ deployed (本日) | LP に sticky 残席カウンター / signup welcome modal / 100% Store fee |
| **16:9 デモ動画** (`demo.mp4`, 540KB) | ✅ 生成済 | YouTube unlisted upload → PH に URL |
| **9:16 縦版デモ** (`demo-vertical.mp4`, 1.8MB) | ✅ 生成済 (本日) | TikTok / Reels / Shorts ネイティブ upload |
| 5 枚 PH ギャラリー画像 | ✅ 生成済 | PH submission に upload |
| PH submission コピー | ✅ doc 化 | `docs/PRODUCTHUNT_LAUNCH.md` |
| HN Show HN draft | ✅ doc 化 | 同上 |
| X tweet 8 variants | ✅ doc 化 | `docs/X_LAUNCH_TWEETS.md` |

→ **インフラ完備**。Day 4 までは流通先確保 + サポーター動員 + ニュースレター pitch に集中。

---

## 📊 ファネル試算 (v2: 短尺動画追加)

```
1,000 sign-up
  ÷ 8% (LP→signup with Founder 100 urgency)
  = 12,500 LP visits
```

### チャネル別期待 signup (zero-cost)

| チャネル | 期待 signup | 工数/日 | 種別 |
|---|---:|---|---|
| **PH 公開** (Day 4) | **200-500** | 集中 | hero |
| **HN "Show HN"** (Day 4) | **100-400** | 朝集中 | hero |
| X (autopilot 8 投稿/日) | 50-150 | 3 分 (コピペ) | 持続 |
| **🆕 TikTok** (縦動画 daily) | **40-200** | 2 分 (再投稿) | 持続 |
| **🆕 Instagram Reels** | 20-80 | 2 分 | 持続 |
| **🆕 YouTube Shorts** | 30-100 | 2 分 | 持続 |
| **🆕 LinkedIn 動画** | 15-50 | 5 分 | 持続 |
| Newsletter (Ben's Bites/TLDR AI) 1-2 掲載 | 100-200 | Day 1 ピッチ送信 | hero |
| Indie Hackers milestone post | 20-50 | 30 分 | 持続 |
| Reddit r/ClaudeAI / r/SaaS | 30-80 | 1 投稿 30 分 | 持続 |
| 友人 / サポーター動員 | 30-80 | DM 30 通 | hero (Day 4) |
| 直接 / SEO | 20-40 | — | 受動 |
| **合計レンジ** | **555-1,830** | 約 28 hrs / 7 日 | |

短尺動画追加で **+100-430** の期待増、達成圏内が広がる。

---

## 🎬 短尺動画マルチプラットフォーム配信 (NEW chapter)

### なぜやるか
- TikTok の `#AItools` ハッシュタグは月間 数億 view、indie/SaaS 系で AI 製品が当たる時期
- YouTube Shorts は **永続的に検索でヒット**する (TikTok は古いと露出落ちる)
- Reels はインスタフォロワー基盤への二次拡散
- LinkedIn の動画は B2B 個人 (ops, RevOps) に届く
- **全部に同じ動画を出すだけ** で工数は最小、当たる確率を分散

### 配布する動画

**1. `assets/demo-vertical.mp4`** (今日生成)
- 1080×1920 / 30 秒 / 1.8 MB
- 常時 subtitle strip 付き (ミュート再生対応)
- 5 シーン: hook / type goal / 5 agents / @mention / pricing

**2. (任意) `assets/demo.mp4` 16:9 版** をクロップして 1:1 正方形版
- Twitter ネイティブで両比率を試す

### プラットフォーム別タクティクス

#### A. TikTok
- アカウント: `@myaiagent` (新規作成、Bio に myaiagents.agency)
- **caption**: フック + ハッシュタグ 5-7 個まで (詰めると逆効果)
- **bestcadence**: 1-2 posts/day for first 7 days
- **hashtags (rotate)**: `#AItools #BuildInPublic #IndieHacker #SaaS #ChatGPT #AI #Productivity`
- **CTA**: `Link in bio` 一択 (キャプ内 URL は de-rank される)
- 反応見て **A/B**: 同じ動画で caption だけ変える × 3 パターン

#### B. Instagram Reels
- 個人アカ (kota_takeuchi) を活用 → ブランドアカ後追い
- caption: 100-150 字、emoji 1-2 個まで
- hashtag: 同 TikTok セット + `#AICommunity #Tech`
- **追加**: ハッシュタグはキャプション本文に詰めず、**最初のコメント**として投稿 (見た目が綺麗)
- Stories でも同動画を流して story 経由のリンク tap を狙う

#### C. YouTube Shorts
- アカ: `MY AI Agent` を新規 (個人 ch でもいい)
- **タイトル**: 検索ヒット重視で keyword-rich
  - `"AI Team in 30 Seconds — Type One Goal, Get 5 Agents"` 等
- **説明**:
  ```
  Type one goal → AI assembles a 5-agent specialist team in 30 seconds. Talk to them like a Slack channel: @mention any member to switch the responder, persona, model, and tools.
  
  Free for the first 100 founders → https://myaiagents.agency
  
  #AI #SaaS #Productivity
  ```
- **end card**: 最後の 3 秒は URL 強調 (動画ループしても CTA に戻る)

#### D. LinkedIn
- kota の個人 profile から native video post (URL リンクと混ぜると de-rank)
- caption: B2B トーンで
  ```
  Solo founder building MY AI Agent. The bottleneck for me wasn't ideas — it was running 5 specialist AIs in 5 separate chats and copying context between them.

  So we built a thing where you type one goal, and Claude assembles a 5-role specialist team in 30 seconds. You talk to all five in one chat. @mention switches the responder + their model + their tools.

  Free to try (3 agents, no card). First 100 founders get 1 month of BUSINESS on us.

  → myaiagents.agency
  ```
- comment 欄に URL を後付け (一発で本文に貼ると LinkedIn は外部リンクを抑制する)
- 投稿後 15 分で 5+ いいね/コメントを支援者から → アルゴリズム到達範囲拡大

### 想定されるダウンサイド

| リスク | 対応 |
|---|---|
| TikTok アカウントが 0 followers で初動最低 | 最初 3 本まで再生数 < 200 でも継続。アルゴリズムは投稿数で学習 |
| 著作権 / 効果音問題 | 動画は完全無音 (subtitle strip だけ) なので安全 |
| 短尺で価値伝わらない疑念 | 30 秒で 5 シーン詰めてあるので OK。詰め過ぎ感あれば 15 秒版も後で |
| クロスポスト疑い (TikTok は重複検知あり) | 動画ファイル自体は使い回しで OK、caption だけ別 |

---

## 📅 7-day Playbook (v2)

### Day 0 (今日 5/11 日) — 弾込め
- [x] Founder 100 機構 deploy 完了 (✅ 実装済)
- [x] 16:9 + 9:16 動画 生成完了 (✅ 実装済)
- [ ] **YouTube unlisted** に `assets/demo.mp4` upload
- [ ] **TikTok アカウント** 新規作成 `@myaiagent` (なければ)
- [ ] **Instagram Reels アカウント** 確認
- [ ] **LinkedIn** 個人 profile 整備 (kota_takeuchi)
- [ ] Render Env: `MKT_AUTOPILOT=1` + `MKT_ADMIN_EMAIL=kota.takeuchi@protocol.ooo`
- [ ] PH submission を draft 保存
- [ ] 友人 30 名連絡先リスト作成

### Day 1 (5/12 月) — 短尺動画爆撃 + waitlist
- [ ] 9:16 動画を **4 platform 同時投稿** (TikTok / Reels / Shorts / LinkedIn)
- [ ] X teaser thread (kota 個人アカ) - [docs/X_LAUNCH_TWEETS.md](X_LAUNCH_TWEETS.md) #5
- [ ] /admin-marketing.html → 8 投稿コピー → X
- [ ] ニュースレター 5 件にピッチ送信 (Ben's Bites / TLDR AI / AI Tidbits / Lenny / Rundown)
- [ ] testimonial を友人 5 名に依頼

### Day 2 (5/13 火) — 反応見て pivot
- [ ] 動画 4 platform に再投稿 (前日 caption を A/B で変える)
- [ ] /admin-marketing.html → 8 投稿
- [ ] TikTok の上位エンゲージ動画と同じカテゴリ (#AItools 中の hot post) にコメント投下
- [ ] OG / Twitter card validator 全 URL

### Day 3 (5/14 水) — リハ
- [ ] 動画 4 platform 投稿 (caption A/B 継続)
- [ ] /admin-marketing.html → 8 投稿
- [ ] サポーター 50 名最終確認
- [ ] 影響力者 5 名に DM (`@swyx`, `@levelsio`, `@marc_louvion`, `@amasad`, `@Suhail`)
- [ ] ニュースレター pitch リマインド

### 🔥 Day 4 (5/15 木) — HERO DAY 🔥

時刻 (PT = 太平洋時間 / JST = 日本時間):

| PT | JST | アクション |
|---|---|---|
| 00:01 | 16:01 木 | **PH 公開** (PH スケジュール済) |
| 00:05 | 16:05 | サポーター 50 名に通知 |
| 00:30 | 16:30 | **X EN founder thread** (#7 founder offer 版) |
| 01:00 | 17:00 | IH launch post |
| 02:00 | 18:00 | **TikTok ヒーロー投稿** (Day 4 専用 caption) |
| 02:30 | 18:30 | **Instagram Reels ヒーロー投稿** |
| 03:00 | 19:00 | **YouTube Shorts ヒーロー投稿** |
| 06:00 | 22:00 | ニュースレター掲載確認 |
| **07:00** | **23:00** | **HN "Show HN" 投稿** (米国朝) |
| 07-09 | 23-01 | HN コメントに 5 分以内返信 |
| 09-15 | 01-07 金 | PH コメント返信、X で進捗投稿 |
| 15:00 | 07:00 金 | Reddit (r/ClaudeAI, r/SideProject) |
| 18:00 | 10:00 金 | **LinkedIn ヒーロー投稿** (B2B は EU 朝向け) |
| 20:00 | 12:00 金 | X で初日 retro thread |

### Day 5 (5/16 金) — 持続加速
- [ ] 動画 4 platform 投稿 (Day 4 数字を caption に入れた版)
- [ ] /admin-marketing.html → 8 投稿
- [ ] **Day 4 数字を transparent retro** (X / LinkedIn / IH)
- [ ] YouTuber 1-2 名に "Day 4 数字" 持って再アプローチ
- [ ] 早期 paid ユーザー 1 名にインタビュー

### Day 6 (5/17 土) — Founder 残数 urgency
- [ ] 動画 4 platform 投稿
- [ ] /admin-marketing.html → 8 投稿
- [ ] Founder 残数で全 SNS connecting urgency
- [ ] IH milestone post: "X signup in 5 days"
- [ ] Reddit 2 本目 (角度違い)

### Day 7 (5/18 日) — 1000 目標日
- [ ] 動画 4 platform 投稿
- [ ] 朝: 残数 / 残 signup 確認
- [ ] "1000 まで残 X 席、Founder Final Day" ピン留め
- [ ] HN に "1 week later" 更新投稿
- [ ] 達成 / ニアミス問わず transparent retro

---

## 🎯 Activation / Retention (NEW chapter)

signup ≠ value 体験 = retention。1000 signup 取っても 60% が 1 メッセージも送らずに去ると無意味。

### 重要 KPI

| ステージ | target |
|---|---|
| Sign-up | 1,000 |
| First message (activation) | 600 (60%) |
| First agent created | 500 (50%) |
| First @mention (team chat) | 200 (20%) |
| Day-7 retention | 300 (30%) |
| Paid (PRO + BUSINESS) | 20-50 |

### Day 4-7 で実装すべき: 軽量オンボーディング

(Founder 100 と並行で priority 上げる)

1. signup 直後の welcome modal (Founder modal 拡張)
2. ホーム上部に "Send your first message →" 進捗
3. 1 メッセージ送信後に "Now create your first AI" 誘導
4. Day 2 メール: 未送信ユーザーに "What goal would you tell your AI team?" カムバックメール

→ activation を 30% → 60% に上げるだけで **paid 転換が 2x** になる (一般則)。

実装ボリューム: 4-6 時間。1000 sign-up より retention の方が pay-back 大きい。

---

## 📆 Day 8+ Post-launch (NEW chapter)

Day 7 を 800 signup で終えても、Day 8-30 で **追加 +500-1500** 取れれば 月次目標を達成できる。

### Week 2 (Day 8-14)
- 動画 4 platform を週 5 回ペースで継続
- IH milestone post: "Week 1 retro: signups / paid / lessons"
- Hacker News に "1 month later" の自然な続編準備
- 早期 paid ユーザー 3 名に case study 依頼
- Note publish on **Substack** (英語、indie 系ニュースレター)

### Week 3-4 (Day 15-28)
- SEO 記事 1 本/週: "How to build a 5-AI team for [niche]" シリーズ
- YouTube long-form 1 本 (8-12 min): "I built MY AI Agent in 2 months. Here's the stack."
- Indie Hackers の SaaS Calendar に登録
- Cold email outreach: 関連 SaaS の operator 50 名にパートナーシップ打診

### Month 2+ (Day 30-)
- 数字 transparent: monthly user count + paid rate を public dashboard `/stats` (構築済 plan あり)
- Affiliate / referral プログラム本格化 (既存 referral_code 機構を強化)
- 1 ヶ月 BUSINESS 無料が切れる Founder layer の paid 転換を計測 → 失敗者にカスタム offer

---

## 📝 Ready-to-use コピー (per platform)

### TikTok caption pack (rotate)

**variant A (hook):**
```
You don't need an AI assistant.
You need an AI TEAM. 🧠
30 seconds. 5 specialists. One chat.
#AItools #SaaS #BuildInPublic
```

**variant B (founder voice):**
```
Built this because I was running 5 ChatGPT tabs and going insane 🌀
Type one goal → get a 5-AI team that talks like Slack.
Free for first 100 → link in bio
#IndieHacker #AI
```

**variant C (specific use):**
```
"Build & sell on Shopify with 50% margin"
30s later: 5 AI specialists, ready.
@mention to switch the responder.
This isn't a chatbot. It's a team.
#AItools #Shopify #SaaS
```

### Instagram Reels caption pack

**variant A:**
```
30 seconds to a 5-AI team.
One goal in → specialists out.

@mention any member to switch the responder, persona, model, tools.

First 100 founders → free month of BUSINESS

myaiagents.agency
```
(Hashtags as first comment: `#AItools #SaaS #IndieHacker #BuildInPublic #ChatGPT #AI #Productivity`)

### YouTube Shorts metadata pack

**Title (rotate):**
- `AI Team in 30 Seconds — Type One Goal, Get 5 Agents`
- `Stop Using AI Chatbots. Hire an AI Team Instead.`
- `How I Replaced 5 ChatGPT Tabs With One AI Team`

**Description**:
```
Type one goal → Claude assembles a 5-agent specialist team in 30 seconds. Talk to all five in one chat: @mention any member to switch the responder, persona, model, and tools.

This isn't a chatbot. It's a team.

✨ Free for the first 100 founders (1 month BUSINESS, 0% Store fees forever, Founder badge): https://myaiagents.agency

🎯 What this video shows:
0:00 — Why one AI isn't enough
0:03 — Type one goal
0:08 — 5 specialists materialise
0:18 — @mention switches the responder
0:25 — Pricing + Founder offer

#AItools #SaaS #IndieHacker #BuildInPublic #ChatGPT
```

### LinkedIn post pack

**variant A (founder story):**
```
Solo founder shipping MY AI Agent today.

The bottleneck for me wasn't ideas — it was running 5 specialist AIs in 5 different chat tabs and copying context between them like a deranged person.

So I built a thing:
   • Type one goal
   • Claude assembles a 5-role specialist team in ~30 seconds
   • You talk to all five in one chat
   • @mention any member to switch the responder + their persona + their model + their tools

It's the closest thing I've seen to actually hiring people who happen to be AI.

Free for the first 100 founders → 1 month of BUSINESS on us, 0% Agent Store fees forever, and a Founder badge.

Link in the first comment.

Roast me — feedback (especially negative) is the most useful thing today.
```

### X founder thread (Day 4 Hero Day)

(参照: `docs/X_LAUNCH_TWEETS.md` の #7 — Founder Offer 版が Hero Day 最強)

### HN "Show HN"

(参照: `docs/MARKETING_STRATEGY_1000.md` の本ファイル末尾 + `docs/PRODUCTHUNT_LAUNCH.md`)

---

## 📊 Metrics & gates

### 毎日トラッキング (5 分)
- signups (yesterday / cumulative)
- LP visits (GA)
- top source (UTM)
- founder seats remaining
- **🆕 video views per platform** (TikTok / Reels / Shorts / LinkedIn)
- new paid

23:00 JST に自動メールレポート届く (UTM + signups breakdown)。

### Gates
- **Day 1 終了**: waitlist + early signups < 30 → メッセージ刺さってない → hook を Founder 100 訴求にピボット
- **Day 4 PT 2am**: PH < 30 upvote → サポーター動員失敗 → 即 X 連投で behind-scenes 数字
- **Day 4 終わり**: signup < 300 → 短尺動画を Day 5 朝に 2x ペースで投稿 (1 日 8 platform 投稿)
- **Day 6 終わり**: 累計 < 700 → $500 paid (X Ads) を Day 7 push に投入
- **Day 7 終わり**: 800-999 → +24h 延長

---

## 🚫 やらないこと

- **Google Ads** ($5-15 CPC で AI 系は赤字)
- **LinkedIn 広告** (audience 違う)
- **PR エージェンシー** ($5k+ で 1 週間効果出ない)
- **Note JP / JP X 専用スレッド** (EN-only ターゲット方針に反する)
- **完璧主義** (Day 0 改修は「動くこと」優先)
- **新機能追加** (今週は獲得一択)
- **同一動画を同日に全 platform 投稿** (重複 detection で de-rank) — 平均 30 分以上ずらす

---

## 📋 今すぐ着手 (Day 0)

優先度順 — 上から消化:

1. **Render Env**: `MKT_AUTOPILOT=1` + `MKT_ADMIN_EMAIL=...` (autopilot 起動)
2. **YouTube upload**: `demo.mp4` を unlisted で → PH の Video 欄に URL ペースト
3. **TikTok アカウント** 新規 / 既存確認 → bio に `myaiagents.agency`
4. **Instagram + LinkedIn** profile 確認
5. **PH submission draft** 保存 (今日中)
6. **HN body draft** 保存 (`docs/PRODUCTHUNT_LAUNCH.md` 内)
7. **友人 30 名連絡先リスト** スプレッドシート化
8. **testimonial** を友人 5 名に依頼 → Day 2 までに集める

---

**Owner**: kota.takeuchi
**Cadence**: 毎晩 23:00 JST に自動レポート受信、週次でこの doc に retro 追記
