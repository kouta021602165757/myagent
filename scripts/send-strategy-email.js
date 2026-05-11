#!/usr/bin/env node
/**
 * Send the 7-day "1000 users" strategy as a styled HTML email.
 *
 * Run from project root:
 *   node scripts/send-strategy-email.js
 * Or override the recipient:
 *   STRATEGY_TO=other@example.com node scripts/send-strategy-email.js
 *
 * Requires RESEND_API_KEY in .env (already wired for the rest of the app).
 */
'use strict';

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ── Inline .env loader (matches server/index.js) ───────────────────────────
function loadEnv(){
  const p = path.join(__dirname, '..', '.env');
  if(!fs.existsSync(p)) return;
  fs.readFileSync(p, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if(k && v.length && !process.env[k.trim()]){
      process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
}
loadEnv();

const TO         = process.env.STRATEGY_TO   || 'kota.takeuchi@protocol.ooo';
const RESEND_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL    || 'noreply@myaiagent.jp';

if(!RESEND_KEY){
  console.error('❌ RESEND_API_KEY is not set in .env. Aborting.');
  process.exit(1);
}

// ── The strategy content (HTML) ────────────────────────────────────────────
//
// One self-contained document. Reads top-to-bottom; sections are anchor-linked
// for quick navigation. Optimised for inbox readability — no external CSS.

const TODAY = new Date().toISOString().slice(0,10);

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>7日間 1000 ユーザー獲得戦略 — MY AI Agent</title>
</head>
<body style="margin:0;padding:24px 16px;background:#fdf8f3;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Sans','Noto Sans JP','SF Pro Text',sans-serif;color:#1a0a00;-webkit-font-smoothing:antialiased;line-height:1.65;">

<div style="max-width:720px;margin:0 auto;background:#fff;border:1px solid rgba(180,120,80,.22);border-radius:14px;padding:36px 32px;">

<!-- HEADER -->
<div style="border-bottom:1px solid rgba(180,120,80,.14);padding-bottom:20px;margin-bottom:28px;">
  <div style="font-family:'SF Mono',Menlo,monospace;font-size:11px;color:#9a6a4a;letter-spacing:.12em;text-transform:uppercase;">Growth strategy — composed ${TODAY}</div>
  <h1 style="margin:8px 0 4px;font-family:'Hiragino Mincho ProN',serif;font-size:32px;font-weight:700;line-height:1.15;color:#1a0a00;">
    7 日間で 1,000 ユーザー
  </h1>
  <div style="font-size:14px;color:#5c3a1e;">zero-budget + 既存インフラのみで取り得る最大プラン</div>
</div>

<!-- TL;DR -->
<h2 style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#ea580c;margin:0 0 14px;font-weight:800;">TL;DR (60 秒で読める版)</h2>
<div style="background:#faf3eb;border:1px solid rgba(180,120,80,.14);border-left:3px solid #ea580c;border-radius:6px;padding:18px 22px;margin-bottom:32px;font-size:14.5px;">
  <ul style="margin:0;padding-left:18px;">
    <li><b>ゴール</b>: 5/11 (今日) → 5/18 で累計 1,000 sign-up</li>
    <li><b>現実的着地</b>: 純自動 + 中強度マーケで <b>200-400</b>。1,000 はストレッチ。</li>
    <li><b>達成条件</b>: ProductHunt 公開 + HN "Show HN" 同日打ち + X 8 投稿/日 + 友人 30 名動員。<b>どれか 1 つ抜けると 600 圏内</b>。</li>
    <li><b>すでに自動化済</b>: X コンテンツ生成・UTM 計測・毎晩レポート (今日構築完了)。</li>
    <li><b>あなたの手動作業</b>: 1 日 3-5 分の X コピペ + 火曜の PH 投稿 + 友人へのお願い。それ以外は完全自動。</li>
  </ul>
</div>

<!-- BUILT TODAY -->
<h2 style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#0d9488;margin:32px 0 14px;font-weight:800;">✅ 本日構築完了したインフラ</h2>
<table cellpadding="0" cellspacing="0" style="width:100%;font-size:13.5px;border-collapse:collapse;margin-bottom:32px;">
  <tr style="background:rgba(45,212,191,.06);">
    <td style="padding:10px 14px;border:1px solid rgba(45,212,191,.18);font-weight:700;width:34%;">07:00 JST 自動生成</td>
    <td style="padding:10px 14px;border:1px solid rgba(45,212,191,.18);">Claude が毎朝 X 投稿 8 本 (4JA / 4EN × 5 カテゴリ) を生成</td>
  </tr>
  <tr>
    <td style="padding:10px 14px;border:1px solid rgba(45,212,191,.18);font-weight:700;">/admin-marketing.html</td>
    <td style="padding:10px 14px;border:1px solid rgba(45,212,191,.18);">ドラフトの [📋 コピー] / [𝕏 投稿ウィンドウを開く] / 数値ダッシュボード</td>
  </tr>
  <tr style="background:rgba(45,212,191,.06);">
    <td style="padding:10px 14px;border:1px solid rgba(45,212,191,.18);font-weight:700;">UTM Attribution</td>
    <td style="padding:10px 14px;border:1px solid rgba(45,212,191,.18);">どの投稿が何件 signup を取ったか自動計測 (LP→signup の utm_campaign を user 行に記録)</td>
  </tr>
  <tr>
    <td style="padding:10px 14px;border:1px solid rgba(45,212,191,.18);font-weight:700;">23:00 JST レポート</td>
    <td style="padding:10px 14px;border:1px solid rgba(45,212,191,.18);">このメールと同じ形式の HTML 日次レポートを <b>${TO}</b> に自動送信</td>
  </tr>
  <tr style="background:rgba(45,212,191,.06);">
    <td style="padding:10px 14px;border:1px solid rgba(45,212,191,.18);font-weight:700;">自己学習</td>
    <td style="padding:10px 14px;border:1px solid rgba(45,212,191,.18);">前日 top performer のテキスト/カテゴリ/言語が翌朝の生成プロンプトに自動注入</td>
  </tr>
</table>

<div style="background:#fff7ed;border:1px solid rgba(251,146,60,.32);border-radius:8px;padding:14px 18px;margin-bottom:32px;font-size:13.5px;">
  <b style="color:#ea580c;">▶ 起動手順 (1 分):</b> Render Dashboard → Environment で <code style="background:#fff;padding:2px 6px;border-radius:4px;border:1px solid rgba(180,120,80,.22);font-family:'SF Mono',Menlo,monospace;font-size:12px;">MKT_AUTOPILOT=1</code> + <code style="background:#fff;padding:2px 6px;border-radius:4px;border:1px solid rgba(180,120,80,.22);font-family:'SF Mono',Menlo,monospace;font-size:12px;">MKT_ADMIN_EMAIL=${TO}</code> を追加 → Save → 自動デプロイ完了で稼働。
</div>

<!-- MATH -->
<h2 style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#ea580c;margin:32px 0 14px;font-weight:800;">📊 ファネル試算</h2>
<p style="font-size:14px;margin:0 0 12px;">1,000 sign-up に必要な LP 訪問数を逆算 (LP→signup 8% 想定):</p>
<div style="background:#1a0a00;color:#fdf8f3;border-radius:8px;padding:18px 22px;font-family:'SF Mono',Menlo,monospace;font-size:13px;line-height:1.8;margin-bottom:24px;overflow:auto;">
1,000 sign-up<br>
&nbsp;&nbsp;÷ 8% (LP→signup, free product)<br>
&nbsp;&nbsp;= 12,500 LP visits<br>
<br>
&nbsp;&nbsp;÷ 各チャネル click-through<br>
&nbsp;&nbsp;= ProductHunt 5,000 + HN 3,500 + X 1,500 + Note 800<br>
&nbsp;&nbsp;&nbsp;&nbsp;+ Reddit 700 + 友人動員 500 + 直接 500
</div>

<h3 style="font-size:14px;margin:24px 0 10px;">チャネル別期待 signup (zero-cost)</h3>
<table cellpadding="0" cellspacing="0" style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:32px;">
  <tr style="background:#f5ead9;">
    <th style="padding:9px 12px;border:1px solid rgba(180,120,80,.22);text-align:left;">チャネル</th>
    <th style="padding:9px 12px;border:1px solid rgba(180,120,80,.22);text-align:right;width:120px;">期待 signup</th>
    <th style="padding:9px 12px;border:1px solid rgba(180,120,80,.22);text-align:left;width:140px;">工数 / 日</th>
  </tr>
  <tr><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">X 自動 (autopilot)</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);text-align:right;">50-150</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">3 分 (コピペ)</td></tr>
  <tr style="background:#faf3eb;"><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);"><b>ProductHunt 公開</b> (Day 4)</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);text-align:right;"><b>200-500</b></td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">公開日に集中</td></tr>
  <tr><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);"><b>HN "Show HN"</b> (Day 4)</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);text-align:right;"><b>100-400</b></td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">朝 PT 7am に投稿</td></tr>
  <tr style="background:#faf3eb;"><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">Note JP 連載 3 本</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);text-align:right;">30-60</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">1 本 60 分</td></tr>
  <tr><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">Indie Hackers / IH milestone</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);text-align:right;">20-50</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">30 分</td></tr>
  <tr style="background:#faf3eb;"><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">Reddit (r/ClaudeAI / r/SaaS)</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);text-align:right;">30-80</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">1 投稿 30 分</td></tr>
  <tr><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">友人 / サポーター動員</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);text-align:right;">30-80</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">DM 30 通</td></tr>
  <tr style="background:#faf3eb;"><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">SEO / 直接</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);text-align:right;">20-40</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">—</td></tr>
  <tr><td style="padding:11px 12px;border:1px solid rgba(180,120,80,.22);font-weight:800;background:#fff7ed;">合計</td><td style="padding:11px 12px;border:1px solid rgba(180,120,80,.22);text-align:right;font-weight:800;background:#fff7ed;color:#ea580c;">480-1,360</td><td style="padding:11px 12px;border:1px solid rgba(180,120,80,.22);font-weight:800;background:#fff7ed;">合計 約 25 hrs / 7 日</td></tr>
</table>

<!-- PLAYBOOK -->
<h2 style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#ea580c;margin:32px 0 14px;font-weight:800;">📅 7-day Playbook</h2>

<div style="margin-bottom:24px;">
  <div style="background:#1a0a00;color:#fdf8f3;padding:10px 18px;border-radius:8px 8px 0 0;font-weight:700;font-size:14px;">Day 0 (今日 5/11 日) — 弾込め</div>
  <ul style="margin:0;padding:14px 20px 14px 38px;border:1px solid rgba(180,120,80,.14);border-top:0;border-radius:0 0 8px 8px;font-size:13.5px;line-height:1.85;">
    <li>Render Env で <code>MKT_AUTOPILOT=1</code> + <code>MKT_ADMIN_EMAIL</code> set <b>(最優先)</b></li>
    <li>ProductHunt の投稿ページ <a href="https://www.producthunt.com/posts/new" style="color:#ea580c;">producthunt.com/posts/new</a> で submission を <b>下書き保存</b> (公開はまだ)</li>
    <li>HN Show HN タイトル + body draft (下記コピー欄から流用)</li>
    <li>X teaser thread (kota 個人アカ): "火曜 PH 公開、Founder 100 席のみ"</li>
    <li>友人 30 名連絡先リスト作成 → Day 3 までに予告 DM</li>
  </ul>
</div>

<div style="margin-bottom:24px;">
  <div style="background:#1a0a00;color:#fdf8f3;padding:10px 18px;border-radius:8px 8px 0 0;font-weight:700;font-size:14px;">Day 1 (5/12 月) — Waitlist hype</div>
  <ul style="margin:0;padding:14px 20px 14px 38px;border:1px solid rgba(180,120,80,.14);border-top:0;border-radius:0 0 8px 8px;font-size:13.5px;line-height:1.85;">
    <li>📋 /admin-marketing.html から 8 投稿コピー → X に貼って投稿</li>
    <li>Note JP 1 本目 "AI 5 人チームで Shopify を 1 日で立ち上げた話" 公開</li>
    <li>LP に "Founder 100 席残 N" カウンター実装 (Day 0 で未実装の場合)</li>
    <li>ニュースレター 5 件 (Ben's Bites / TLDR AI / AI Tidbits / Lenny / Rundown AI) にピッチメール送信</li>
  </ul>
</div>

<div style="margin-bottom:24px;">
  <div style="background:#1a0a00;color:#fdf8f3;padding:10px 18px;border-radius:8px 8px 0 0;font-weight:700;font-size:14px;">Day 2 (5/13 火) — 改修ラッシュ</div>
  <ul style="margin:0;padding:14px 20px 14px 38px;border:1px solid rgba(180,120,80,.14);border-top:0;border-radius:0 0 8px 8px;font-size:13.5px;line-height:1.85;">
    <li>📋 8 投稿コピー → X</li>
    <li>testimonial を友人 5 名に依頼 → LP に追加</li>
    <li>OG / Twitter card 全 URL で validator を通す</li>
    <li>PH submission draft 内部レビュー + 修正</li>
  </ul>
</div>

<div style="margin-bottom:24px;">
  <div style="background:#1a0a00;color:#fdf8f3;padding:10px 18px;border-radius:8px 8px 0 0;font-weight:700;font-size:14px;">Day 3 (5/14 水) — リハ</div>
  <ul style="margin:0;padding:14px 20px 14px 38px;border:1px solid rgba(180,120,80,.14);border-top:0;border-radius:0 0 8px 8px;font-size:13.5px;line-height:1.85;">
    <li>📋 8 投稿コピー → X</li>
    <li>友人 50 名に「明日朝 PT 12:01am 公開、ぜひ upvote」最終リマインド</li>
    <li>ニュースレター pitch のリマインド送信 (返信無の宛先)</li>
    <li>影響力者 5 名に DM (@swyx, @levelsio, @marc_louvion, @yusuke_jp, @shu_yamaguchi)</li>
  </ul>
</div>

<div style="margin-bottom:24px;border:2px solid #ea580c;border-radius:10px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#fb923c,#ea580c);color:#fff;padding:14px 18px;font-weight:800;font-size:15px;">🔥 Day 4 (5/15 木) — HERO DAY 🔥</div>
  <ul style="margin:0;padding:14px 20px 14px 38px;font-size:13.5px;line-height:1.95;">
    <li><b>PT 12:01am</b>: <b>ProductHunt 公開</b> (火曜 = 最強の曜日)</li>
    <li><b>PT 12:05am</b>: サポーター 50 名に通知 (LINE / Slack / DM 一斉)</li>
    <li><b>PT 12:30am</b>: X EN founder thread 投下 + GIF</li>
    <li><b>PT 1:00am</b>: X JP founder thread 投下 + IH launch post</li>
    <li><b>PT 7:00am</b>: <b>Hacker News "Show HN"</b> 投稿 (米国の朝)</li>
    <li><b>PT 7-9am</b>: HN コメントに 5 分以内返信、front page 入り狙い</li>
    <li><b>PT 9am-3pm</b>: PH コメントに即返信、X で進捗投稿 ("PH Top 5 入り")</li>
    <li><b>PT 3pm</b>: Reddit (r/ClaudeAI, r/SideProject) 投稿</li>
    <li><b>PT 8pm</b>: X で初日 retro thread (transparent metrics)</li>
  </ul>
  <div style="background:#fff7ed;padding:10px 18px;font-size:12px;color:#5c3a1e;border-top:1px solid #fed7aa;">
    <b>目標</b>: 1 日で 600+ signup / PH Top 5 / HN front page 1+ 時間
  </div>
</div>

<div style="margin-bottom:24px;">
  <div style="background:#1a0a00;color:#fdf8f3;padding:10px 18px;border-radius:8px 8px 0 0;font-weight:700;font-size:14px;">Day 5 (5/16 金) — 持続加速</div>
  <ul style="margin:0;padding:14px 20px 14px 38px;border:1px solid rgba(180,120,80,.14);border-top:0;border-radius:0 0 8px 8px;font-size:13.5px;line-height:1.85;">
    <li>📋 8 投稿 — autopilot は Day 4 数字を学習済</li>
    <li>朝: Day 4 数字を transparent に retro 投稿 (X で)</li>
    <li>YouTuber 1-2 名に「数字付き」で再アプローチ</li>
    <li>Note JP 2 本目 公開</li>
    <li>早期 paid ユーザー 1 名にインタビュー → testimonial 動画化</li>
  </ul>
</div>

<div style="margin-bottom:24px;">
  <div style="background:#1a0a00;color:#fdf8f3;padding:10px 18px;border-radius:8px 8px 0 0;font-weight:700;font-size:14px;">Day 6 (5/17 土) — Founder 残数 urgency</div>
  <ul style="margin:0;padding:14px 20px 14px 38px;border:1px solid rgba(180,120,80,.14);border-top:0;border-radius:0 0 8px 8px;font-size:13.5px;line-height:1.85;">
    <li>📋 8 投稿</li>
    <li>Founder 残数を全 SNS に連打 ("あと N 席")</li>
    <li>IH milestone post: "X signup in 5 days"</li>
    <li>Reddit 2 本目 (角度違い)</li>
  </ul>
</div>

<div style="margin-bottom:32px;">
  <div style="background:#1a0a00;color:#fdf8f3;padding:10px 18px;border-radius:8px 8px 0 0;font-weight:700;font-size:14px;">Day 7 (5/18 日) — 1000 目標日</div>
  <ul style="margin:0;padding:14px 20px 14px 38px;border:1px solid rgba(180,120,80,.14);border-top:0;border-radius:0 0 8px 8px;font-size:13.5px;line-height:1.85;">
    <li>朝: 残数 / 残 signup 確認</li>
    <li>"1000 まで残 X 席、Founder Final Day" をピン留め投稿</li>
    <li>HN に "1 week later, what happened" 更新投稿</li>
    <li>達成 / ニアミス問わず、数字 transparent retro</li>
  </ul>
</div>

<!-- COPY -->
<h2 style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#ea580c;margin:32px 0 14px;font-weight:800;">📋 すぐ使えるコピー</h2>

<h3 style="font-size:14px;margin:18px 0 8px;">ProductHunt タグライン (60 chars)</h3>
<pre style="background:#f5ead9;border:1px solid rgba(180,120,80,.22);border-radius:6px;padding:11px 14px;font-family:'SF Mono',Menlo,monospace;font-size:12.5px;margin:0 0 20px;white-space:pre-wrap;">AI assembles a 3-10 agent team from one sentence</pre>

<h3 style="font-size:14px;margin:18px 0 8px;">PH 説明 (260 chars)</h3>
<pre style="background:#f5ead9;border:1px solid rgba(180,120,80,.22);border-radius:6px;padding:11px 14px;font-family:'SF Mono',Menlo,monospace;font-size:12.5px;margin:0 0 20px;white-space:pre-wrap;">Stop asking AI to do things — hire a team.
Type one goal. In 30 seconds, AI generates a 3-10 specialist team with personas, models, and tools. @mention any member to switch. Sell what you build on the Agent Store and earn up to 80%. Free forever for the first 100 founders.</pre>

<h3 style="font-size:14px;margin:18px 0 8px;">HN "Show HN" タイトル候補</h3>
<ul style="margin:0 0 20px;padding-left:18px;font-size:13.5px;line-height:1.75;">
  <li>Show HN: I built a tool that generates a 5-AI team from one sentence</li>
  <li>Show HN: MY AI Agent — describe a goal, get a 3-10 agent team in 30s</li>
</ul>

<h3 style="font-size:14px;margin:18px 0 8px;">HN 本文 (300 chars)</h3>
<pre style="background:#f5ead9;border:1px solid rgba(180,120,80,.22);border-radius:6px;padding:11px 14px;font-family:'SF Mono',Menlo,monospace;font-size:12px;margin:0 0 20px;white-space:pre-wrap;">I'm a solo founder. My bottleneck wasn't ideas — it was running 5 specialist AIs in 5 separate chats and copying context between them.

So I built MY AI AGENT: type one sentence ("build &amp; sell on Shopify with 50% margins"), and Claude assembles a 5-role team (Sourcer, Designer, Storefront, Social, Analyst) with avatars, personas, skills, tools — in 30 seconds. You talk to it like a Slack channel: @mention any member to switch persona/model.

Stack: Node + Supabase + Anthropic SDK. Free tier real (3 agents, 10 msgs). Pro $12.99/mo. Honest feedback (especially negative) most useful.</pre>

<h3 style="font-size:14px;margin:18px 0 8px;">X EN founder thread #1 (Day 4)</h3>
<pre style="background:#f5ead9;border:1px solid rgba(180,120,80,.22);border-radius:6px;padding:11px 14px;font-family:'SF Mono',Menlo,monospace;font-size:12px;margin:0 0 20px;white-space:pre-wrap;">1/ I just launched MY AI AGENT.

It generates a 3-10 AI agent team from one sentence. In 30 seconds.

Why? I was tired of running 5 separate ChatGPT tabs and copying context between them. /thread

2/ Type: "build &amp; sell on Shopify with 50%+ margins, post on social"
Get: 🛍 Sourcer + 📸 Designer + 🌐 Storefront + 📱 Social + 📊 Analyst
With avatars, personas, models per agent, integrations.
[15s GIF]

3/ Talk to it like a Slack channel.
@social write 3 launch posts → switches to Social Manager.
@store ship to Shopify → switches to Storefront Architect.
One timeline, many minds.

4/ Free forever (3 agents, no card)
Pro $12.99/mo (20 agents, full team gen)
Sell what you build, keep 80%.

5/ Today only: first 100 sign-ups become FOUNDERS.
2x credit forever + Founder badge + 0% Store fees.
[link] | [PH link]

Roast me.</pre>

<h3 style="font-size:14px;margin:18px 0 8px;">X JP founder thread #1</h3>
<pre style="background:#f5ead9;border:1px solid rgba(180,120,80,.22);border-radius:6px;padding:11px 14px;font-family:'SF Mono',Menlo,monospace;font-size:12px;margin:0 0 20px;white-space:pre-wrap;">1/ AI を 1 個ずつ作る時代を終わらせたかったので、新しいプロダクトを公開しました。

MY AI AGENT — 1 文 を投げると、Claude が 30 秒で 3-10 人のエージェントチームを組成。
役割・persona・モデル・道具まで自動設計。/続く

2/ 例: 「Shopify で margin 50% 以上の商品を作って販売、SNS 投稿、売上監視」
→ 🛍 商品リサーチ + 📸 ビジュアル + 🌐 ストア + 📱 SNS + 📊 収益分析
の 5 人組が 30 秒で生成される。
[GIF]

3/ Slack チャンネルみたいに 1 つの会話で:
@social 「launch 投稿 3 本書いて」→ SNS 担当の persona に切替
@store 「Shopify に出して」→ ストア構築担当の persona に切替

4/ 料金: Free 永久 (3 agents, カード不要) / Pro $12.99/mo (20 agents, チーム生成 ON)
自分で作った Team を Store に出すと最大 80% 還元

5/ 本日先着 100 名: Founder 認定 = クレジット永久 2x + 手数料 -10%。
[link]

正直なフィードバック歓迎です。</pre>

<h3 style="font-size:14px;margin:18px 0 8px;">ニュースレター pitch メール (EN)</h3>
<pre style="background:#f5ead9;border:1px solid rgba(180,120,80,.22);border-radius:6px;padding:11px 14px;font-family:'SF Mono',Menlo,monospace;font-size:12px;margin:0 0 32px;white-space:pre-wrap;">Subject: New tool — AI generates a 3-10 agent team from one sentence

Hi [name],

Solo founder shipping MY AI AGENT today — describe a goal, get a 3-10 specialist AI team in 30 seconds, talk to it like Slack. Built for the indie hacker / operator audience your readers fit.

Going on Product Hunt Tuesday. 90s demo: [link].
Anything that would make this fit better as a feature — happy to tailor.

Thanks,
Kota — myaiagents.agency</pre>

<!-- RISKS -->
<h2 style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#ea580c;margin:32px 0 14px;font-weight:800;">🚨 リスクゲート + Plan B</h2>
<table cellpadding="0" cellspacing="0" style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:32px;">
  <tr style="background:#f5ead9;">
    <th style="padding:9px 12px;border:1px solid rgba(180,120,80,.22);text-align:left;width:35%;">兆候</th>
    <th style="padding:9px 12px;border:1px solid rgba(180,120,80,.22);text-align:left;">即時対応</th>
  </tr>
  <tr><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">Day 1 終了で waitlist &lt; 30</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">message が刺さってない → hook を "Founder 100 + 80% revenue share" に変更</td></tr>
  <tr style="background:#faf3eb;"><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">Day 4 PT 2am で PH &lt; 30 upvote</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">サポーター動員失敗 → 即 X JP 連投で behind-the-scenes 数字、逆転狙い</td></tr>
  <tr><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">Day 4 PT 8am で HN &lt; 5 点</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">翌日 angle 変えて再投稿 (max 2 回まで)</td></tr>
  <tr style="background:#faf3eb;"><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">Day 4 終わり &lt; 300 signup</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">hero day 不発 → Day 5 影響力者 2 次連絡 + autopilot を 12 投稿/日 に増量</td></tr>
  <tr><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">Day 6 終わり &lt; 700</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">7 日達成は厳しい → 最低限 paid $500 (X Ads) を最終 push に投入</td></tr>
  <tr style="background:#faf3eb;"><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">Day 7 で 800-999</td><td style="padding:9px 12px;border:1px solid rgba(180,120,80,.14);">あと一歩 → +24h 延長して "あと N" で push、透明性持って</td></tr>
</table>

<!-- DO NOT -->
<h2 style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#ea580c;margin:32px 0 14px;font-weight:800;">🚫 やらないこと (明示)</h2>
<ul style="margin:0 0 32px;padding-left:18px;font-size:13.5px;line-height:1.75;">
  <li><b>Google Ads</b> (CPC が AI 系で $5-15、ROI 悪い)</li>
  <li><b>LinkedIn 広告</b> (audience 違う)</li>
  <li><b>PR エージェンシー</b> ($5k+ で 1 週間効果出ない)</li>
  <li><b>TikTok / Instagram に時間投下</b> (audience 違う)</li>
  <li><b>完璧主義</b> (Day 0 の改修は「動くこと」優先、磨き込みは Day 5 以降)</li>
  <li><b>新機能追加</b> (今週は獲得一択、機能追加は来週以降)</li>
</ul>

<!-- TODO -->
<h2 style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#ea580c;margin:32px 0 14px;font-weight:800;">📋 今すぐの 7 項目 (Day 0)</h2>
<ol style="margin:0 0 32px;padding-left:22px;font-size:13.5px;line-height:1.95;">
  <li>Render Env に <code>MKT_AUTOPILOT=1</code> + <code>MKT_ADMIN_EMAIL=${TO}</code> set <b>(autopilot 起動)</b></li>
  <li>PH submission の draft (tagline / description / gallery 3 枚) を保存</li>
  <li>HN draft (上記 2 案 + body) を保存</li>
  <li>X EN/JP founder thread を Day 4 に予約投稿 (TweetDeck or 手動)</li>
  <li>Note JP 1 本目の draft (3,000 字) を着手</li>
  <li>友人 30 名の連絡先リスト (Slack/LINE/DM) を作成</li>
  <li>testimonial を友人 5 名に依頼 → Day 2 までに集める</li>
</ol>

<!-- FOOTER -->
<div style="border-top:1px solid rgba(180,120,80,.14);padding-top:18px;margin-top:24px;font-size:11.5px;color:#9a6a4a;line-height:1.7;">
  この戦略書は MY AI Agent サーバーの marketing autopilot 機能と一体設計です。<br>
  Day 1 以降、毎晩 23:00 JST に進捗レポート (実際の signup 数 / top performer / 翌朝の生成計画) が同じアドレスに自動送信されます。<br><br>
  <b>Dashboard</b>: <a href="https://myaiagents.agency/admin-marketing.html" style="color:#ea580c;">myaiagents.agency/admin-marketing.html</a><br>
  <b>サーバー稼働状況</b>: <a href="https://myaiagents.agency/api/health" style="color:#ea580c;">/api/health</a><br>
  <b>戦略本文 (Markdown 版)</b>: docs/MARKETING_STRATEGY_1000.md (git)
</div>

</div>

<div style="text-align:center;color:#9a6a4a;font-size:11px;margin-top:24px;font-family:'SF Mono',Menlo,monospace;letter-spacing:.06em;">
  MY AI AGENT · sent ${TODAY} JST via marketing autopilot
</div>

</body>
</html>`;

// ── Send ────────────────────────────────────────────────────────────────────

const payload = JSON.stringify({
  from:    `MY AI Agent Strategy <${FROM_EMAIL}>`,
  to:      TO,
  subject: '🚀 7日間で 1,000 ユーザー獲得戦略 — MY AI Agent',
  html,
});

const req = https.request({
  hostname: 'api.resend.com',
  path: '/emails',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${RESEND_KEY}`,
    'Content-Length': Buffer.byteLength(payload),
  },
  timeout: 15000,
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    if(res.statusCode >= 200 && res.statusCode < 300){
      console.log(`✅ Sent to ${TO} (HTTP ${res.statusCode})`);
      try {
        const parsed = JSON.parse(data);
        if(parsed.id) console.log(`   Resend message id: ${parsed.id}`);
      } catch {}
    } else {
      console.error(`❌ Resend rejected (HTTP ${res.statusCode}):`);
      console.error(data);
      process.exit(1);
    }
  });
});
req.on('error', e => { console.error('Network error:', e.message); process.exit(1); });
req.on('timeout', () => { req.destroy(); console.error('Resend timeout'); process.exit(1); });
req.write(payload);
req.end();
