# FormTap — 法人営業自動化ツール 仕様書

> **「営業担当を雇う前に、AI 営業チームを雇おう」**
> URL 入れるだけで AI が毎日 100 件の法人に営業してくれる SaaS。

## 1. プロダクト一行
URL 1 つで AI がペルソナ抽出 → 法人リスト化 → 個別文面生成 → Chrome ext で自動送信。月 ¥10,000 で営業代行 ¥30 万相当の効果。

## 2. ICP (= 誰が買うか)
- A. B2B SaaS スタートアップ (シード〜シリーズ A、5-20 人、sales 0-1 人)
- B. 受託開発 / コンサル (1-5 人、自力営業できない個人 / 小規模)
- C. メーカー営業部 (中堅、リード不足、AI 導入意欲高)
- D. 個人事業主 / フリーランス (web 制作 / 業務委託)

## 3. 価値提案
| 既解決策 | 月額 | FormTap |
|---|---|---|
| 営業採用 | ¥50-80 万 | 月 ¥10K = **40 倍安い** |
| 営業代行 | ¥20-40 万 | 月 ¥10K = **20 倍安い** |
| 自分で送信 | 機会損失 | 自動化で時間ゼロ |

ROI 試算 (Pro ¥9,800):
- 月 200 件送信 × 反応率 3% = 6 件反応 × 商談化 30% = 1.8 件商談 × 受注 30% = 0.54 件受注 × ¥300K = **¥162,000 売上**
- ROI = **16 倍**、契約 1 件 = 1 年分元取り

## 4. 競合差別化
| | FormTap | KaiU | フォーマー | Apollo |
|---|---|---|---|---|
| ペルソナ AI 抽出 | ✅ | ❌ | ❌ | △ |
| 法人リスト AI | ✅ | 別取得 | 別取得 | US 中心 |
| 文面 AI 個別化 | ✅ | テンプレ | ❌ | テンプレ |
| Chrome ext 自動送信 | ✅ | ✅ | ✅ | ❌ |
| reCAPTCHA 対応 | ✅ user click | NG | NG | N/A |
| 月額 | **¥10K** | ¥50K+ | ¥30K+ | ¥15K |

## 5. プライシング
| プラン | 月額 | リスト / 月 | 送信 / 月 | 機能 |
|---|---|---|---|---|
| Free | ¥0 | 10 | 0 (手動) | ペルソナ + AI 文面確認 |
| Starter | ¥4,800 | 100 | 50 | + Chrome ext + dashboard |
| Pro | **¥9,800** | 500 | 200 | + Slack + 反応検知 + A/B |
| Business | ¥29,800 | 3,000 | 1,000 | + multi-account + 商談化 tracking |
| Enterprise | ¥98,000+ | 無制限 | 5,000+ | + API + 専任サポート |

年払い = 2 ヶ月無料。

## 6. ユーザージャーニー

### Onboarding (3 分、5 step)
1. Google OAuth signup
2. 「あなたのサービス URL を教えて」 入力
3. AI ペルソナ抽出 (= 10 秒)
4. 結果確認 + edit
5. 「最初の 10 件リスト」 = Free で即表示

### Free 体験
- 10 件リスト + AI 文面確認
- 「自分で送信」 (= フォーム URL に飛ぶ)
- 1 件反応で paid 動機

### Pro 後の日次
```
08:00 Slack 通知 「100 件リスト用意完了」
08:10 dashboard で確認 (= AI チームが動く視覚化)
08:15 chat で 「{法人} は業種違う」 → AI 即 fix
08:20 「全部送信開始」
08:37 Chrome ext で 17 分で 100 件送信完了
17:00 Slack 通知 「反応 3 件」
17:05 AI が次の文面提案 → user 承認 → 送信
月末: 商談 5 件 + 受注 1 件 (¥300K)
```

## 7. 画面構成 (= mock-formtap.html 対応)

### 画面 1: Dashboard (= /app#home)
- 上 stat = 送信 / 反応 / 商談 / 受注 (= 今月)
- AI チーム · 今動いてる (= 既 mock 流用)
- 今日の進捗 bar + 反応 feed
- 「Start new campaign →」 CTA

### 画面 2: ペルソナ (= /app#persona)
- 自社 URL 入力 + AI 抽出結果
- 業種 / 規模 / 役職 / 課題 (= edit 可)
- fit score ルール
- 「保存 + リスト再生成」

### 画面 3: 法人リスト (= /app#companies)
- filter (fit score / 業種 / 規模 / 地域)
- list (= 法人名 / 業種 / fit / 問合せ URL 状況)
- 「全部送信開始」 button

### 画面 4: 文面 (= /app#pitches)
- 左 = 相手 LP preview
- 右 = AI 生成文面 (件名 + 本文 + CTA)
- chat で改善依頼

### 画面 5: 送信 (= /app#send)
- Chrome ext 進捗 bar
- リアルタイム log
- 各件 status (= sent / reCAPTCHA 待 / skipped)

### 画面 6: 反応 (= /app#responses)
- 新着反応 + AI 次の文面提案
- 「アポ取れた」 = 商談化カウント

### 画面 7: 設定 (= /app#settings)
- account / plan / 送信元 / Slack / 退会

## 8. 技術アーキ
```
[サーバ: Render]
  - ペルソナ抽出 (Claude Haiku/Sonnet)
  - 法人 DB (国税庁 API + Google Custom Search + 自前)
  - AI 文面生成 (Claude)
  - Stripe / Auth / DB

[Chrome Extension: Manifest V3]
  - サーバから send-jobs 取得
  - フォーム自動入力 (AI mapping)
  - reCAPTCHA = user 1 click
  - submit + status 報告

[user PC Browser]
  - ext がフォーム制御
  - IP = user の (= ブロック回避)
```

## 9. DB スキーマ
```sql
campaigns (id, user_id, persona_json, created_at)
companies (id, campaign_id, name, industry, size, region, hp_url, contact_url, fit_score, status)
pitches (id, company_id, subject, body, cta_url, ai_model, sent_at)
sends (id, pitch_id, status, failure_reason, screenshot_url, sent_at)
responses (id, send_id, source, raw_text, ai_summary, status, received_at)
```

## 10. ロードマップ
| Week | 内容 |
|---|---|
| 1 | 既 user 30 名説明 + ICP 10 社インタビュー + ドメイン |
| 2 | LP + mock を production に + ペルソナ抽出 MVP |
| 3-4 | 法人リスト + 文面 + dashboard |
| 5-6 | Chrome ext α (手動送信) |
| 7-8 | Chrome ext 自動送信 (reCAPTCHA user click) |
| 9-10 | 反応検知 + 商談化 tracking |
| 11-12 | 一般公開 + Product Hunt JP |

## 11. KPI
- 3 ヶ月: MRR ¥100 万 / 100 paid
- 6 ヶ月: MRR ¥300 万 / 300 paid
- 1 年: MRR ¥1,000 万 / 1,000 paid

## 12. リスク対策
- spam 化: fit score 60+ guard + opt-out 必須 + PR 表記
- 法律: フォーム送信 = 特電法対象外 + 弁護士監修
- reCAPTCHA: 突破せず user 1 click
- IP ブロック: Chrome ext で user IP 経由
- 既 user 説明: ピボット説明メール + Pro 半年無料

## 13. 既 build 流用率
| 既 | 用途 | 改修 |
|---|---|---|
| auth / Stripe / DB | そのまま | 0 |
| AI 文章生成 | 営業文 (prompt 改修) | 20% |
| mock 「AI チーム」 視覚化 | そのまま | 0 |
| chat | 文面改善 AI | 0 |
| publish-jobs | send-jobs に rename | 10% |
| メディア機能 | 成約事例集 (= SEO 流入) | 30% |
**= 70-80% 流用 + 20-30% 新規 (Chrome ext / 法人 DB)**
