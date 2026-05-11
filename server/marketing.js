// MY AI Agent — Zero-cost marketing autopilot
//
// Daily pipeline (all server-side, no external paid services):
//   07:00 JST  generateDailyPosts()   — Claude drafts 8 X posts for today
//   ─ all day  /admin-marketing.html  — kota copies + pastes to X
//   ─ signup   recordAttribution()    — UTM-tag every signup that arrived
//                                       from an X post
//   23:00 JST  sendDailyReport()      — Resend HTMLs yesterday's numbers +
//                                       top-performing post to the admin
//
// State is intentionally simple:
//   - The post queue lives in-process (regenerated daily, so a restart only
//     costs us a re-gen call)
//   - Attribution lives on the user row (marketing_attribution column;
//     Supabase auto-drops it if the column isn't in the schema yet, which
//     is fine — the LDB path will hold it)

'use strict';

const https = require('https');

const TZ_OFFSET_HOURS = 9; // JST

function _tokyoDateStr(d){
  // Returns "YYYY-MM-DD" in Asia/Tokyo regardless of host TZ
  const t = new Date((d || new Date()).getTime() + TZ_OFFSET_HOURS * 3600 * 1000);
  return t.toISOString().slice(0, 10);
}

// ── content generator ──────────────────────────────────────────────────────

const POST_SYSTEM_PROMPT = `You are the official X (Twitter) marketing voice for MY AI Agent
(https://myaiagents.agency). Audience: indie hackers, solo founders, and
operators primarily in the US + EU. ALL posts must be in natural,
idiomatic English. No Japanese — even for posts about JP-based examples.

Product, in one paragraph:
"Type one goal in plain English. In ~30 seconds, AI assembles a 3-10
specialist agent team (avatars, personas, models, tools). Talk to it
like a Slack channel: @mention any member to switch the responder's
persona + model. Sell your teams on the Agent Store and keep 80%."

Pricing: FREE / PRO ($12.99/mo) / BUSINESS ($32.99/mo).

Today's task: 8 ready-to-post X drafts as a JSON array. Mix the
categories like a real founder timeline, not a press release:

  1. hook (2): provocative single-sentence opener, question, or
     contrarian take that stops the scroll. No emoji needed.
  2. build_in_public (2): a real-sounding number with context.
     "Day N: NN signups, NN listings, NN $ GMV. Here's what
     surprised me." Founder-voice, not marketing-voice.
  3. use_case (2): "[plausible indie hacker name] built a [team]
     to [outcome]. Here's the chat:" — short prose, optionally
     1-line of fake chat to illustrate.
  4. feature (1): isolate ONE feature and explain in concrete
     terms. e.g. "@mention switches the model too — call Opus
     for code review without leaving the chat."
  5. engagement (1): a real question that invites replies.
     "If you could spin up a 5-AI team for one task, what's the
     first task?" — no rhetorical bait.

Per post (JSON object):
- text: 100-260 chars (well under X's 280-char limit so links fit)
- lang: always "en"
- category: one of the 5 above
- cta_url: "https://myaiagents.agency?utm_source=x&utm_medium=organic&utm_campaign=YYYY-MM-DD-NN"
  (we'll overwrite this server-side with the right NN — you can just
  put a placeholder)
- image_prompt: optional, <=80 chars. Only if a visual would actually
  add something; empty string otherwise.

Hard NOs:
- "AI assistant" / "AI chatbot" / "your AI sidekick" — generic,
  blends into competitors. Always use "team / squad / @mention".
- Marketing-deck buzzwords ("revolutionary", "unlock", "10x").
- More than 2 emojis per post.
- Threading multiple sentences with ✨ • → — keep it conversational.
- Tagging unrelated big accounts to farm impressions.

Must-haves in every post:
- One concrete differentiator: "team", "@mention", "30s", "Agent
  Store 80%", or "Slack-like for AI".
- The CTA URL goes at the end of the text body, separated by "\\n\\n".

Output JSON only — no Markdown fences, no commentary:
{"posts":[{"text":"...","lang":"en","category":"hook","cta_url":"...","image_prompt":""}, ...]}`;

function _ctaUrlFor(dateStr, idx){
  const nn = String(idx + 1).padStart(2, '0');
  return `https://myaiagents.agency?utm_source=x&utm_medium=organic&utm_campaign=${dateStr}-${nn}`;
}

/**
 * Call Claude to generate today's queue. Returns {date, posts: [...]}
 * `callAI` is injected (the existing server/index.js helper) so we don't
 * duplicate the Anthropic plumbing.
 */
async function generateDailyPosts({ callAI, date }){
  const d = date || _tokyoDateStr();
  const userMsg = {
    role: 'user',
    content: `Today is ${d} (JST). Generate 8 English posts per the rules above.
Feedback from yesterday's top performer (if any):
${(globalThis.__mkt_yesterday_top || 'First run — keep the category mix balanced.')}`,
  };
  const sys = POST_SYSTEM_PROMPT;
  const resp = await callAI([userMsg], sys, 'sonnet');
  const text = (resp.content || []).map(b => b.text || '').join('').trim();
  // Claude wraps with ``` sometimes; strip
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  let parsed;
  try { parsed = JSON.parse(cleaned); }
  catch(e){
    throw new Error('marketing.generateDailyPosts: Claude returned non-JSON. First 200 chars:\n' + cleaned.slice(0, 200));
  }
  const posts = (parsed.posts || []).map((p, i) => ({
    id: `${d}-${String(i + 1).padStart(2, '0')}`,
    text: String(p.text || '').slice(0, 280),
    lang: p.lang === 'en' ? 'en' : 'ja',
    category: p.category || 'hook',
    cta_url: _ctaUrlFor(d, i),       // override anything Claude returned
    image_prompt: String(p.image_prompt || '').slice(0, 280),
    created_at: new Date().toISOString(),
  }));
  return { date: d, posts };
}

// ── queue (in-memory, regenerated daily) ────────────────────────────────────

let _todayQueue = null; // { date, posts, generatedAt }

function getTodayQueue(){
  const d = _tokyoDateStr();
  if (_todayQueue && _todayQueue.date === d) return _todayQueue;
  return null;
}

function setTodayQueue(queue){
  _todayQueue = { ...queue, generatedAt: new Date().toISOString() };
  return _todayQueue;
}

// ── attribution (per-signup) ────────────────────────────────────────────────
//
// Called from /api/auth/signup. Picks the utm_campaign off the referer or an
// explicit request field and stamps it onto the user.

function extractCampaignFromUrl(rawUrl){
  if (!rawUrl) return null;
  try {
    const u = new URL(rawUrl);
    if (u.searchParams.get('utm_source') !== 'x') return null;
    const c = u.searchParams.get('utm_campaign');
    if (!c || !/^\d{4}-\d{2}-\d{2}-\d{2}$/.test(c)) return null;
    return c; // e.g. "2026-05-11-03"
  } catch { return null; }
}

function attributionFromSignupReq(req, body){
  // 1) explicit utm_campaign in body (cleanest path — LP sets it)
  if (body && typeof body.utm_campaign === 'string') {
    if (/^\d{4}-\d{2}-\d{2}-\d{2}$/.test(body.utm_campaign)) return body.utm_campaign;
  }
  // 2) referer header (LP loaded with ?utm_campaign=... then submits)
  const ref = req && req.headers && req.headers.referer;
  return extractCampaignFromUrl(ref);
}

// ── metrics (today's signups, grouped by UTM) ───────────────────────────────

async function getTodayMetrics({ DB, USE_SUPA, LDB }){
  // Pulls all users created today (JST) — sums signups, breaks out by
  // marketing_attribution. Works on both Supabase and LDB.
  const todayJst = _tokyoDateStr();
  // Convert JST date back to a UTC range
  const startUtc = new Date(todayJst + 'T00:00:00+09:00').toISOString();
  const endUtc   = new Date(new Date(startUtc).getTime() + 86400*1000).toISOString();

  let rows = [];
  if (USE_SUPA && DB && DB.findAllCreatedBetween){
    rows = await DB.findAllCreatedBetween(startUtc, endUtc);
  } else if (LDB) {
    rows = LDB.all().filter(u => u.created_at >= startUtc && u.created_at < endUtc);
  }

  const totals = { all: 0, byCampaign: {}, byCategory: {} };
  for (const u of rows){
    totals.all++;
    const camp = u.marketing_attribution || '(direct)';
    totals.byCampaign[camp] = (totals.byCampaign[camp] || 0) + 1;
    const q = (_todayQueue && _todayQueue.posts.find(p => p.id === camp));
    const cat = q ? q.category : '(direct)';
    totals.byCategory[cat] = (totals.byCategory[cat] || 0) + 1;
  }
  return { date: todayJst, ...totals, source_rows: rows.length };
}

// ── daily report (HTML email) ───────────────────────────────────────────────

function _renderReportHtml({ date, metrics, queue, yesterday }){
  const top = Object.entries(metrics.byCampaign || {})
    .filter(([k]) => k !== '(direct)')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const topPostText = top.length
    ? top.map(([camp, count]) => {
        const q = queue && queue.posts.find(p => p.id === camp);
        return `<li><b>${camp}</b> — ${count} signup${count !== 1 ? 's' : ''}` +
               (q ? `<br><span style="color:#9a6a4a;font-size:12px">"${(q.text || '').slice(0, 100)}…"</span>` : '') +
               '</li>';
      }).join('')
    : '<li style="color:#9a6a4a">まだ X 経由の signup が無いか、UTM が付いていない投稿のみ</li>';

  const dailyDelta = yesterday ? metrics.all - yesterday : null;
  const deltaStr = dailyDelta === null ? '' :
    dailyDelta > 0 ? `<span style="color:#10b981">+${dailyDelta} vs yesterday</span>` :
    dailyDelta < 0 ? `<span style="color:#dc2626">${dailyDelta} vs yesterday</span>` :
                     `<span style="color:#9a6a4a">±0 vs yesterday</span>`;

  return `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Hiragino Sans',sans-serif;background:#fdf8f3;color:#1a0a00;margin:0;padding:24px;max-width:680px;">
  <div style="background:#fff;border:1px solid rgba(180,120,80,.22);border-radius:14px;padding:24px;">
    <h1 style="font-family:'Bebas Neue',sans-serif;font-size:32px;letter-spacing:-.01em;margin:0 0 4px;">MY AI AGENT</h1>
    <div style="font-size:12px;color:#9a6a4a;font-family:'SF Mono',Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;margin-bottom:20px;">DAILY GROWTH REPORT · ${date} JST</div>

    <div style="display:flex;gap:14px;margin-bottom:24px;">
      <div style="flex:1;background:rgba(251,146,60,.08);border:1px solid rgba(251,146,60,.25);border-radius:10px;padding:14px;">
        <div style="font-size:11px;color:#9a6a4a;text-transform:uppercase;font-weight:700">Today's signups</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:42px;color:#ea580c;line-height:1;margin:6px 0;">${metrics.all}</div>
        <div style="font-size:11px;">${deltaStr}</div>
      </div>
      <div style="flex:1;background:rgba(45,212,191,.08);border:1px solid rgba(45,212,191,.25);border-radius:10px;padding:14px;">
        <div style="font-size:11px;color:#9a6a4a;text-transform:uppercase;font-weight:700">Via X attribution</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:42px;color:#0d9488;line-height:1;margin:6px 0;">${metrics.all - (metrics.byCampaign['(direct)'] || 0)}</div>
        <div style="font-size:11px;color:#5c3a1e;">${Object.keys(metrics.byCampaign || {}).filter(k => k !== '(direct)').length} 投稿が attribution あり</div>
      </div>
    </div>

    <h2 style="font-size:14px;font-weight:800;margin:0 0 10px;color:#1a0a00;">🏆 Top performers (X)</h2>
    <ul style="margin:0 0 24px;padding:0 0 0 18px;font-size:13px;line-height:1.7;">${topPostText}</ul>

    <h2 style="font-size:14px;font-weight:800;margin:0 0 10px;color:#1a0a00;">📊 カテゴリ別 attribution</h2>
    <pre style="background:#f5ead9;border:1px solid rgba(180,120,80,.14);border-radius:8px;padding:12px;font-size:12px;margin:0 0 24px;overflow:auto;">${
      Object.keys(metrics.byCategory).length
        ? Object.entries(metrics.byCategory).map(([k,v]) => `  ${k.padEnd(20)} ${v}`).join('\n')
        : '  (まだ attribution データなし)'
    }</pre>

    <h2 style="font-size:14px;font-weight:800;margin:0 0 10px;color:#1a0a00;">📝 今日投稿された予定 (キュー)</h2>
    <div style="font-size:12px;color:#9a6a4a;margin-bottom:8px;">これらが <a href="https://myaiagents.agency/admin-marketing.html" style="color:#ea580c;">/admin-marketing.html</a> で生成済</div>
    <ol style="margin:0 0 24px;padding:0 0 0 22px;font-size:12.5px;line-height:1.6;">${
      (queue && queue.posts || []).map(p => `<li style="margin-bottom:10px;"><b style="color:#ea580c;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase">${p.category}·${p.lang}</b><br>${p.text.slice(0,180).replace(/</g,'&lt;')}</li>`).join('')
    }</ol>

    <hr style="border:0;border-top:1px solid rgba(180,120,80,.14);margin:24px 0;">
    <div style="font-size:11px;color:#9a6a4a;line-height:1.6;">
      明朝 7 時に翌日分を自動生成。手動で再生成する場合は <a href="https://myaiagents.agency/admin-marketing.html" style="color:#ea580c;">ダッシュボード</a> から。<br>
      停止する場合: 管理パネル → "Pause auto-generation".
    </div>
  </div>
  </body></html>`;
}

async function sendDailyReport({ to, callAI, DB, USE_SUPA, LDB, sendEmail, yesterdayTotal }){
  const date = _tokyoDateStr();
  const metrics = await getTodayMetrics({ DB, USE_SUPA, LDB });
  const queue = getTodayQueue();
  const html = _renderReportHtml({ date, metrics, queue, yesterday: yesterdayTotal });
  await sendEmail(to, `📊 ${date} signups: ${metrics.all} (MY AI Agent)`, html);

  // Stash top performer for tomorrow's generator
  const topCamp = Object.entries(metrics.byCampaign || {})
    .filter(([k]) => k !== '(direct)')
    .sort((a, b) => b[1] - a[1])[0];
  if (topCamp && queue){
    const q = queue.posts.find(p => p.id === topCamp[0]);
    if (q){
      globalThis.__mkt_yesterday_top = `Yesterday's top performer (${topCamp[1]} signups): category=${q.category}, lang=${q.lang}, text="${q.text.slice(0,140)}". Echo this pattern in 1-2 of today's posts.`;
    }
  }
  return { date, signups: metrics.all };
}

// ── lightweight in-process scheduler ────────────────────────────────────────
//
// Render's free tier doesn't ship Cron Jobs, so we run a 60s tick that
// triggers the morning generate and the evening report at the right local
// time. Exits cleanly when the process exits.

let _schedulerTimer = null;
let _lastFiredGen = null;
let _lastFiredReport = null;
let _yesterdayTotal = 0;

function startScheduler({ callAI, DB, USE_SUPA, LDB, sendEmail, adminEmail }){
  if (_schedulerTimer) return;
  _schedulerTimer = setInterval(async () => {
    const now = new Date();
    const jst = new Date(now.getTime() + TZ_OFFSET_HOURS * 3600 * 1000);
    const hourJst = jst.getUTCHours();
    const dateStr = _tokyoDateStr(now);

    // 07:00 JST — generate today's queue
    if (hourJst === 7 && _lastFiredGen !== dateStr){
      _lastFiredGen = dateStr;
      try {
        const queue = await generateDailyPosts({ callAI, date: dateStr });
        setTodayQueue(queue);
        console.log(`[marketing] generated ${queue.posts.length} posts for ${dateStr}`);
      } catch (e){
        console.error('[marketing] generate failed:', e.message);
      }
    }

    // 23:00 JST — daily report email + remember today's total for tomorrow's delta
    if (hourJst === 23 && _lastFiredReport !== dateStr){
      _lastFiredReport = dateStr;
      try {
        const r = await sendDailyReport({
          to: adminEmail, callAI, DB, USE_SUPA, LDB, sendEmail,
          yesterdayTotal: _yesterdayTotal,
        });
        _yesterdayTotal = r.signups;
        console.log(`[marketing] daily report sent for ${dateStr}: ${r.signups} signups`);
      } catch (e){
        console.error('[marketing] report failed:', e.message);
      }
    }
  }, 60 * 1000);
}

function stopScheduler(){
  if (_schedulerTimer){ clearInterval(_schedulerTimer); _schedulerTimer = null; }
}

module.exports = {
  generateDailyPosts,
  getTodayQueue,
  setTodayQueue,
  getTodayMetrics,
  sendDailyReport,
  attributionFromSignupReq,
  extractCampaignFromUrl,
  startScheduler,
  stopScheduler,
  _tokyoDateStr,
};
