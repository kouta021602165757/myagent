// MY AI Agent — protocol.ooo SEO 日次レポート (全自動)
//
// 毎朝 SEO_REPORT_HOUR 時 (JST) に起動し、以下を実行する:
//   1. Search Console API … クリック / 表示回数 / CTR / 平均掲載順位 + 上位クエリ・ページ
//   2. GA4 Data API       … セッション / ユーザー + チャネル別流入 + 上位LP
//   3. Claude (callAI)    … 数値を分析し「所見」と「改善アクション」を生成
//   4. sendEmail (Resend) … HTML レポートを SEO_REPORT_TO へ送信
//
// 認証はサービスアカウント (JWT bearer)。ユーザーの OAuth セッションに依存
// しないので、サーバープロセスだけで完全自動で回る。Render 無料枠は Cron Job
// が無いため marketing.js と同じ 60 秒 tick で時刻を待つ。
//
// 有効化に必要な env: SEO_REPORT=1 / SEO_REPORT_TO / SEO_GOOGLE_SA_KEY
//                     / SEO_GSC_SITE_URL / SEO_GA4_PROPERTY_ID
// 詳細は docs/SEO_REPORT.md

'use strict';

const https  = require('https');
const crypto = require('crypto');

const TZ_OFFSET_HOURS = 9; // JST

// ── 日付ヘルパー (すべて JST 基準) ──────────────────────────────────────────
function _jstNow(d){
  return new Date((d || new Date()).getTime() + TZ_OFFSET_HOURS * 3600 * 1000);
}
function _tokyoDateStr(d){
  return _jstNow(d).toISOString().slice(0, 10);
}
// 今日 (JST) から offsetDays 日ずらした "YYYY-MM-DD"
function _dateStr(offsetDays){
  const t = _jstNow();
  t.setUTCDate(t.getUTCDate() + offsetDays);
  return t.toISOString().slice(0, 10);
}

// ── 汎用 JSON-over-HTTPS ────────────────────────────────────────────────────
function _httpsJson(method, host, path, headers, body){
  return new Promise((resolve, reject) => {
    const req = https.request({ method, hostname: host, path, headers }, (res) => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => {
        let data;
        try { data = buf ? JSON.parse(buf) : {}; }
        catch { data = { _raw: buf.slice(0, 300) }; }
        resolve({ status: res.statusCode, data });
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('request timeout: ' + host + path)));
    if (body) req.write(body);
    req.end();
  });
}

// ── サービスアカウント認証 (JWT bearer → access_token, プロセス内キャッシュ) ──
function _b64url(input){
  return Buffer.from(input).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

let _tokenCache = { token: null, exp: 0 };

async function _getAccessToken(){
  if (_tokenCache.token && _tokenCache.exp - 60000 > Date.now()) return _tokenCache.token;

  const raw = process.env.SEO_GOOGLE_SA_KEY;
  if (!raw) throw new Error('SEO_GOOGLE_SA_KEY 未設定 (サービスアカウントの JSON キー)');
  let sa;
  try { sa = JSON.parse(raw); }
  catch { throw new Error('SEO_GOOGLE_SA_KEY が正しい JSON ではありません'); }
  if (!sa.client_email || !sa.private_key){
    throw new Error('SEO_GOOGLE_SA_KEY に client_email / private_key がありません');
  }

  const now = Math.floor(Date.now() / 1000);
  const scope = [
    'https://www.googleapis.com/auth/webmasters.readonly', // Search Console
    'https://www.googleapis.com/auth/analytics.readonly',  // GA4
  ].join(' ');

  const header = _b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim  = _b64url(JSON.stringify({
    iss: sa.client_email,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(header + '.' + claim);
  const assertion = header + '.' + claim + '.' + _b64url(signer.sign(sa.private_key));

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  }).toString();
  const r = await _httpsJson('POST', 'oauth2.googleapis.com', '/token',
    { 'Content-Type': 'application/x-www-form-urlencoded' }, body);
  if (r.status !== 200 || !r.data.access_token){
    throw new Error('SA トークン交換に失敗 (' + r.status + '): ' + JSON.stringify(r.data).slice(0, 200));
  }
  _tokenCache = {
    token: r.data.access_token,
    exp: Date.now() + (r.data.expires_in || 3600) * 1000,
  };
  return _tokenCache.token;
}

// ── Search Console ──────────────────────────────────────────────────────────
async function _gscQuery(token, siteUrl, payload){
  const r = await _httpsJson('POST', 'searchconsole.googleapis.com',
    '/webmasters/v3/sites/' + encodeURIComponent(siteUrl) + '/searchAnalytics/query',
    { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    JSON.stringify(payload));
  if (r.status !== 200){
    throw new Error('GSC query 失敗 (' + r.status + '): ' + JSON.stringify(r.data).slice(0, 220));
  }
  return r.data.rows || [];
}

function _sumGsc(rows){
  // ディメンション無しの集計クエリは通常 1 行 (全体合計) を返す
  let clicks = 0, impressions = 0, posSum = 0, n = 0;
  for (const row of rows){
    clicks += row.clicks || 0;
    impressions += row.impressions || 0;
    posSum += row.position || 0;
    n++;
  }
  return {
    clicks, impressions,
    ctr: impressions ? clicks / impressions : 0,
    position: n ? posSum / n : 0,
  };
}

async function collectGsc(siteUrl){
  const token = await _getAccessToken();
  // GSC のデータは 2〜3 日遅れるため、完成済みの 7 日窓を 2 期間ぶん使う
  const curEnd  = _dateStr(-3),  curStart  = _dateStr(-9);
  const prevEnd = _dateStr(-10), prevStart = _dateStr(-16);

  const [curRows, prevRows, queryRows, pageRows] = await Promise.all([
    _gscQuery(token, siteUrl, { startDate: curStart,  endDate: curEnd }),
    _gscQuery(token, siteUrl, { startDate: prevStart, endDate: prevEnd }),
    _gscQuery(token, siteUrl, { startDate: curStart, endDate: curEnd, dimensions: ['query'], rowLimit: 10 }),
    _gscQuery(token, siteUrl, { startDate: curStart, endDate: curEnd, dimensions: ['page'],  rowLimit: 10 }),
  ]);
  const mapRow = r => ({
    key: r.keys[0], clicks: r.clicks, impressions: r.impressions,
    ctr: r.ctr, position: r.position,
  });
  return {
    period:   { current: curStart + '〜' + curEnd, previous: prevStart + '〜' + prevEnd },
    current:  _sumGsc(curRows),
    previous: _sumGsc(prevRows),
    topQueries: queryRows.map(mapRow),
    topPages:   pageRows.map(mapRow),
  };
}

// ── GA4 (Analytics Data API) ────────────────────────────────────────────────
async function _ga4Report(token, propertyId, body){
  const r = await _httpsJson('POST', 'analyticsdata.googleapis.com',
    '/v1beta/properties/' + String(propertyId).replace('properties/', '') + ':runReport',
    { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    JSON.stringify(body));
  if (r.status !== 200){
    throw new Error('GA4 runReport 失敗 (' + r.status + '): ' + JSON.stringify(r.data).slice(0, 220));
  }
  return r.data;
}

async function collectGa4(propertyId){
  const token = await _getAccessToken();
  const metrics = [
    { name: 'sessions' }, { name: 'totalUsers' },
    { name: 'screenPageViews' }, { name: 'engagementRate' },
  ];

  const [totalsResp, channelResp, landingResp] = await Promise.all([
    // 直近7日 vs その前7日。複数 dateRanges 指定時は dateRange 次元が自動付与される
    _ga4Report(token, propertyId, {
      dateRanges: [
        { startDate: '7daysAgo',  endDate: 'yesterday' },
        { startDate: '14daysAgo', endDate: '8daysAgo' },
      ],
      metrics,
    }),
    _ga4Report(token, propertyId, {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
      metrics: [{ name: 'sessions' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    }),
    _ga4Report(token, propertyId, {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
      metrics: [{ name: 'sessions' }],
      dimensions: [{ name: 'landingPage' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    }),
  ]);

  const mh = (totalsResp.metricHeaders || []).map(h => h.name);
  let current = {}, previous = {};
  for (const row of (totalsResp.rows || [])){
    const which = row.dimensionValues[0].value; // date_range_0 / date_range_1
    const obj = {};
    row.metricValues.forEach((v, i) => { obj[mh[i]] = Number(v.value) || 0; });
    if (which === 'date_range_0') current = obj;
    else if (which === 'date_range_1') previous = obj;
  }

  const channels = (channelResp.rows || []).map(r => ({
    channel: r.dimensionValues[0].value,
    sessions: Number(r.metricValues[0].value) || 0,
  }));
  const landingPages = (landingResp.rows || []).map(r => ({
    page: r.dimensionValues[0].value,
    sessions: Number(r.metricValues[0].value) || 0,
  }));
  const organic = channels.find(c => /organic search/i.test(c.channel));

  return { current, previous, channels, landingPages, organicSessions: organic ? organic.sessions : 0 };
}

// ── Claude による分析コメント生成 ───────────────────────────────────────────
async function generateAnalysis(callAI, gsc, ga4){
  const payload = {
    search_console: gsc ? {
      period: gsc.period,
      current: gsc.current,
      previous: gsc.previous,
      top_queries: gsc.topQueries,
      top_pages: gsc.topPages,
    } : null,
    google_analytics: ga4 ? {
      current_7d: ga4.current,
      previous_7d: ga4.previous,
      organic_sessions_7d: ga4.organicSessions,
      channels: ga4.channels,
      top_landing_pages: ga4.landingPages,
    } : null,
  };
  const system = `あなたは protocol.ooo (スタートアップと投資家のマッチングプラットフォーム) の SEO アナリスト。
渡された Search Console と GA4 の数値を分析し、日本語で簡潔にレポートする。
出力は JSON のみ。マークダウンのコードフェンスは付けない。
{
  "headline": "今日の一言サマリー (40字以内)",
  "findings": ["所見を3〜5個。前週比の増減と、その要因の仮説。各70字以内"],
  "actions": ["今日〜今週の具体的な改善アクションを2〜3個。各70字以内"]
}
ルール: 数値を誇張しない。データが乏しい/欠損している場合は正直にその旨を書く。
掲載順位 (position) は数値が小さいほど良い。`;
  const userMsg = {
    role: 'user',
    content: '以下の SEO データを分析してください:\n```json\n' + JSON.stringify(payload) + '\n```',
  };

  let resp;
  try { resp = await callAI([userMsg], system, 'sonnet'); }
  catch (e){ return { headline: 'AI 分析の生成に失敗: ' + (e.message || e), findings: [], actions: [] }; }

  const text = (resp.content || []).map(b => b.text || '').join('').trim();
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  try {
    const p = JSON.parse(cleaned);
    return {
      headline: String(p.headline || '').slice(0, 120),
      findings: Array.isArray(p.findings) ? p.findings.map(s => String(s).slice(0, 200)) : [],
      actions:  Array.isArray(p.actions)  ? p.actions.map(s => String(s).slice(0, 200))  : [],
    };
  } catch {
    return { headline: '', findings: [text.slice(0, 600)], actions: [] };
  }
}

// ── HTML レポート描画 ───────────────────────────────────────────────────────
function _esc(s){
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function _int(n){ return Math.round(Number(n) || 0).toLocaleString('ja-JP'); }
function _dec(n){ return (Math.round((Number(n) || 0) * 10) / 10).toLocaleString('ja-JP'); }
function _delta(cur, prev){
  const c = Number(cur) || 0, p = Number(prev) || 0;
  const abs = c - p;
  const pct = p ? (abs / p * 100) : (c ? 100 : 0);
  return { abs, pct };
}
// lowerIsBetter=true なら減少を緑で表示 (掲載順位用)
function _deltaSpan(d, lowerIsBetter){
  const good = lowerIsBetter ? d.pct < 0 : d.pct > 0;
  const bad  = lowerIsBetter ? d.pct > 0 : d.pct < 0;
  const color = good ? '#10b981' : bad ? '#dc2626' : '#9a6a4a';
  const arrow = d.pct > 0 ? '▲' : d.pct < 0 ? '▼' : '±';
  const sign  = d.pct > 0 ? '+' : '';
  return '<span style="color:' + color + ';font-size:11px;font-weight:700">'
    + arrow + ' ' + sign + (Math.round(d.pct * 10) / 10) + '% 前週比</span>';
}
function _card(label, value, deltaHtml, accent){
  return '<div style="flex:1;min-width:128px;background:' + accent + '11;border:1px solid '
    + accent + '44;border-radius:10px;padding:12px 14px;">'
    + '<div style="font-size:10.5px;color:#9a6a4a;text-transform:uppercase;font-weight:700;letter-spacing:.04em">' + label + '</div>'
    + '<div style="font-size:30px;color:' + accent + ';line-height:1.1;margin:5px 0;font-weight:800">' + value + '</div>'
    + '<div>' + (deltaHtml || '') + '</div></div>';
}
function _gscTable(title, rows, firstColLabel){
  if (!rows || !rows.length) return '';
  const body = rows.map(r =>
    '<tr>'
    + '<td style="padding:6px 8px;border-bottom:1px solid #eee3d3;font-size:11.5px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _esc(r.key) + '</td>'
    + '<td style="padding:6px 8px;border-bottom:1px solid #eee3d3;text-align:right;font-size:11.5px">' + _int(r.clicks) + '</td>'
    + '<td style="padding:6px 8px;border-bottom:1px solid #eee3d3;text-align:right;font-size:11.5px">' + _int(r.impressions) + '</td>'
    + '<td style="padding:6px 8px;border-bottom:1px solid #eee3d3;text-align:right;font-size:11.5px">' + _dec((r.ctr || 0) * 100) + '%</td>'
    + '<td style="padding:6px 8px;border-bottom:1px solid #eee3d3;text-align:right;font-size:11.5px">' + _dec(r.position) + '</td>'
    + '</tr>').join('');
  return '<h2 style="font-size:13px;font-weight:800;margin:22px 0 8px">' + title + '</h2>'
    + '<table style="width:100%;border-collapse:collapse">'
    + '<tr style="color:#9a6a4a;font-size:10px;text-transform:uppercase">'
    + '<th style="text-align:left;padding:4px 8px">' + firstColLabel + '</th>'
    + '<th style="text-align:right;padding:4px 8px">クリック</th>'
    + '<th style="text-align:right;padding:4px 8px">表示</th>'
    + '<th style="text-align:right;padding:4px 8px">CTR</th>'
    + '<th style="text-align:right;padding:4px 8px">順位</th></tr>'
    + body + '</table>';
}
function _list(items){
  if (!items || !items.length) return '<li style="color:#9a6a4a">データなし</li>';
  return items.map(s => '<li style="margin-bottom:6px">' + _esc(s) + '</li>').join('');
}

function _renderHtml({ date, gsc, ga4, analysis, errors }){
  let gscBlock = '<div style="color:#9a6a4a;font-size:12px;padding:8px 0">Search Console データなし</div>';
  if (gsc){
    const c = gsc.current, p = gsc.previous;
    gscBlock =
      '<div style="font-size:11px;color:#9a6a4a;margin-bottom:8px">対象期間: ' + gsc.period.current + ' (前週比 ' + gsc.period.previous + ')</div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:8px">'
      + _card('クリック', _int(c.clicks), _deltaSpan(_delta(c.clicks, p.clicks), false), '#ea580c')
      + _card('表示回数', _int(c.impressions), _deltaSpan(_delta(c.impressions, p.impressions), false), '#d97706')
      + _card('CTR', _dec(c.ctr * 100) + '%', _deltaSpan(_delta(c.ctr, p.ctr), false), '#0d9488')
      + _card('平均掲載順位', _dec(c.position), _deltaSpan(_delta(c.position, p.position), true), '#7c3aed')
      + '</div>'
      + _gscTable('🔍 上位検索クエリ', gsc.topQueries, 'クエリ')
      + _gscTable('📄 上位ページ', gsc.topPages, 'ページ');
  }

  let ga4Block = '<div style="color:#9a6a4a;font-size:12px;padding:8px 0">GA4 データなし</div>';
  if (ga4){
    const c = ga4.current, p = ga4.previous;
    const chRows = (ga4.channels || []).map(ch =>
      '  ' + String(ch.channel).padEnd(22) + _int(ch.sessions)).join('\n');
    const lpRows = (ga4.landingPages || []).slice(0, 8).map(lp =>
      '<li style="margin-bottom:4px;font-size:11.5px"><span style="color:#0d9488;font-weight:700">' + _int(lp.sessions) + '</span> ' + _esc(lp.page) + '</li>').join('');
    ga4Block =
      '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:8px">'
      + _card('セッション (7日)', _int(c.sessions), _deltaSpan(_delta(c.sessions, p.sessions), false), '#0d9488')
      + _card('ユーザー (7日)', _int(c.totalUsers), _deltaSpan(_delta(c.totalUsers, p.totalUsers), false), '#0891b2')
      + _card('オーガニック流入', _int(ga4.organicSessions), '<span style="font-size:11px;color:#9a6a4a">自然検索のセッション</span>', '#16a34a')
      + '</div>'
      + '<h2 style="font-size:13px;font-weight:800;margin:18px 0 8px">📊 チャネル別セッション (7日)</h2>'
      + '<pre style="background:#f5ead9;border:1px solid #e3d3bd;border-radius:8px;padding:10px;font-size:11.5px;margin:0;overflow:auto">'
      + (chRows || '  データなし') + '</pre>'
      + '<h2 style="font-size:13px;font-weight:800;margin:18px 0 8px">🛬 上位ランディングページ (7日)</h2>'
      + '<ol style="margin:0;padding-left:20px">' + (lpRows || '<li style="color:#9a6a4a">データなし</li>') + '</ol>';
  }

  const errorBlock = (errors && errors.length)
    ? '<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px 12px;margin:0 0 16px;font-size:11.5px;color:#b91c1c">'
      + '⚠️ 一部データ取得に失敗:<br>' + errors.map(_esc).join('<br>') + '</div>'
    : '';

  return '<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,\'Hiragino Sans\',sans-serif;background:#fdf8f3;color:#1a0a00;margin:0;padding:24px">'
    + '<div style="background:#fff;border:1px solid #e3d3bd;border-radius:14px;padding:24px;max-width:680px;margin:0 auto">'
    + '<h1 style="font-size:22px;margin:0 0 2px;font-weight:800">protocol.ooo SEO 日次レポート</h1>'
    + '<div style="font-size:11px;color:#9a6a4a;letter-spacing:.08em;text-transform:uppercase;margin-bottom:18px">DAILY SEO REPORT · ' + date + ' JST</div>'
    + errorBlock
    + (analysis && analysis.headline
        ? '<div style="background:linear-gradient(135deg,#fff7ed,#fef3c7);border:1px solid #fcd34d;border-radius:10px;padding:13px 15px;margin-bottom:18px;font-size:14px;font-weight:700;color:#92400e">💡 ' + _esc(analysis.headline) + '</div>'
        : '')
    + '<h2 style="font-size:14px;font-weight:800;margin:0 0 10px">Search Console</h2>'
    + gscBlock
    + '<hr style="border:0;border-top:1px solid #eee3d3;margin:24px 0">'
    + '<h2 style="font-size:14px;font-weight:800;margin:0 0 10px">Google Analytics (GA4)</h2>'
    + ga4Block
    + '<hr style="border:0;border-top:1px solid #eee3d3;margin:24px 0">'
    + '<h2 style="font-size:14px;font-weight:800;margin:0 0 8px">🧭 AI 所見</h2>'
    + '<ul style="margin:0 0 16px;padding-left:20px;font-size:12.5px;line-height:1.65">' + _list(analysis && analysis.findings) + '</ul>'
    + '<h2 style="font-size:14px;font-weight:800;margin:0 0 8px">✅ 今週の改善アクション</h2>'
    + '<ul style="margin:0 0 8px;padding-left:20px;font-size:12.5px;line-height:1.65">' + _list(analysis && analysis.actions) + '</ul>'
    + '<hr style="border:0;border-top:1px solid #eee3d3;margin:24px 0">'
    + '<div style="font-size:10.5px;color:#9a6a4a;line-height:1.6">'
    + 'このレポートは毎朝自動送信されています。停止する場合は Render の環境変数 <b>SEO_REPORT</b> を 0 に。<br>'
    + 'GSC のデータは仕様上 2〜3 日遅れます (順位・クリックは確定値の7日窓で集計)。</div>'
    + '</div></body></html>';
}

// ── 1 回ぶんの実行 (データ収集 → 分析 → 送信) ───────────────────────────────
async function runOnce({ callAI, sendEmail, to }){
  const date = _tokyoDateStr();
  const siteUrl    = process.env.SEO_GSC_SITE_URL;
  const propertyId = process.env.SEO_GA4_PROPERTY_ID;

  let gsc = null, ga4 = null;
  const errors = [];

  if (siteUrl){
    try { gsc = await collectGsc(siteUrl); }
    catch (e){ errors.push('Search Console: ' + (e.message || e)); }
  } else {
    errors.push('SEO_GSC_SITE_URL 未設定 — Search Console セクションをスキップ');
  }

  if (propertyId){
    try { ga4 = await collectGa4(propertyId); }
    catch (e){ errors.push('GA4: ' + (e.message || e)); }
  } else {
    errors.push('SEO_GA4_PROPERTY_ID 未設定 — GA4 セクションをスキップ');
  }

  const analysis = await generateAnalysis(callAI, gsc, ga4);
  const html = _renderHtml({ date, gsc, ga4, analysis, errors });

  const bits = [];
  if (gsc) bits.push('クリック ' + _int(gsc.current.clicks));
  if (ga4) bits.push('セッション ' + _int(ga4.current.sessions));
  const subject = '📈 protocol.ooo SEO日次レポート ' + date
    + (bits.length ? ' — ' + bits.join(' / ') : '');

  await sendEmail(to, subject, html);
  return { date, gsc: !!gsc, ga4: !!ga4, errors };
}

// ── 軽量スケジューラ (Render 無料枠は Cron が無いので 60 秒 tick) ────────────
let _timer = null;
let _lastFired = null;

function startScheduler({ callAI, sendEmail, to }){
  if (_timer) return;
  const hour = Math.min(23, Math.max(0, Number(process.env.SEO_REPORT_HOUR || 8)));

  _timer = setInterval(async () => {
    const hourJst = _jstNow().getUTCHours();
    const dateStr = _tokyoDateStr();
    if (hourJst === hour && _lastFired !== dateStr){
      _lastFired = dateStr;
      try {
        const r = await runOnce({ callAI, sendEmail, to });
        console.log('[seo-report] sent for ' + dateStr
          + ' (gsc=' + r.gsc + ' ga4=' + r.ga4
          + (r.errors.length ? ' errors=' + r.errors.length : '') + ')');
      } catch (e){
        console.error('[seo-report] failed:', e.message || e);
      }
    }
  }, 60 * 1000);
  console.log('[seo-report] scheduler armed — daily at ' + hour + ':00 JST → ' + to);

  // 動作確認用: SEO_REPORT_RUN_ON_BOOT=1 なら起動 20 秒後に一度だけ送信
  if (process.env.SEO_REPORT_RUN_ON_BOOT === '1'){
    setTimeout(() => {
      runOnce({ callAI, sendEmail, to })
        .then(r => console.log('[seo-report] boot test sent (gsc=' + r.gsc + ' ga4=' + r.ga4 + ')'))
        .catch(e => console.error('[seo-report] boot test failed:', e.message || e));
    }, 20000);
  }
}

function stopScheduler(){
  if (_timer){ clearInterval(_timer); _timer = null; }
}

module.exports = {
  startScheduler,
  stopScheduler,
  runOnce,
  collectGsc,
  collectGa4,
  generateAnalysis,
  _tokyoDateStr,
};
