'use strict';
const http=require('http'),https=require('https'),fs=require('fs'),
      path=require('path'),crypto=require('crypto'),url=require('url');
const marketing = require('./marketing');

// ── ENV ───────────────────────────────────────────────────────
function loadEnv(){
  // Tests opt out of .env loading so they can run against an isolated local DB
  // even when the developer's machine has production credentials in .env.
  // Without this guard, `npm test` would write to production Supabase.
  if(process.env.SKIP_DOTENV) return;
  const p=path.join(__dirname,'..', '.env');
  if(!fs.existsSync(p))return;
  fs.readFileSync(p,'utf8').split('\n').forEach(line=>{
    const[k,...v]=line.split('=');
    if(k&&v.length&&!process.env[k.trim()])
      process.env[k.trim()]=v.join('=').trim().replace(/^["']|["']$/g,'');
  });
}
loadEnv();

const PORT         = process.env.PORT||3000;
const JWT_SECRET   = process.env.JWT_SECRET||(()=>{throw new Error('JWT_SECRET required')})();
const ANTHROPIC    = process.env.ANTHROPIC_API_KEY||'';
// Google Gemini — used for the `gemini-flash` / `gemini-pro` aliases. Gemini
// 2.5 Flash is roughly 5x faster than Sonnet on first-token + cheap, so it's
// the default for new agents. If GEMINI_API_KEY is unset, the provider
// router transparently falls back to Sonnet so the chat keeps working.
const GEMINI_KEY   = process.env.GEMINI_API_KEY||'';
// ── Image providers (paid, optional) ──────────────────────────
// If a key is set, generate_image routes premium "style" values to that
// provider. Unset keys gracefully fall through to the free Pollinations
// fallback, so the app still works on a fresh install.
const FAL_KEY      = process.env.FAL_KEY||'';            // FLUX 1.1 Pro Ultra + FLUX Kontext
const RECRAFT_KEY  = process.env.RECRAFT_KEY||'';        // Recraft V3 — typography/logo/vector
const IDEOGRAM_KEY = process.env.IDEOGRAM_KEY||'';       // Ideogram V3 — text-in-image
// OpenAI — used for `text-embedding-3-small` (1536-dim) to power vector
// retrieval in the knowledge base. Falls back to CJK bigram scoring when
// the key isn't set, so the app keeps working on a fresh install.
const OPENAI_KEY   = process.env.OPENAI_API_KEY||'';
const SUPA_URL     = process.env.SUPABASE_URL||'';
const SUPA_KEY     = process.env.SUPABASE_SERVICE_KEY||'';
const STRIPE_SK    = process.env.STRIPE_SECRET_KEY||'';
const STRIPE_PK    = process.env.STRIPE_PUBLISHABLE_KEY||'';
const STRIPE_WH    = process.env.STRIPE_WEBHOOK_SECRET||'';
const STRIPE_PRO_PRICE = process.env.STRIPE_PRO_PRICE_ID||'';
const STRIPE_BIZ_PRICE = process.env.STRIPE_BIZ_PRICE_ID||'';
const GOOGLE_ID    = process.env.GOOGLE_CLIENT_ID||'';
const GOOGLE_SEC   = process.env.GOOGLE_CLIENT_SECRET||'';
const RESEND_KEY   = process.env.RESEND_API_KEY||'';
const BRAVE_KEY    = process.env.BRAVE_API_KEY||'';                  // optional, falls back to DDG
const GA_ID        = process.env.GA_MEASUREMENT_ID||'';              // optional, e.g. G-XXXXXXXXXX
const APP_URL      = process.env.APP_URL||`http://localhost:${PORT}`;
// One unified sender for everything MY AI Agent emails (verification,
// password reset, daily reports, send_email tool). All AI agents share
// this address — the agent's own name goes into the human-readable
// "From" display so recipients see e.g. "Sales Tanaka via MY AI Agent
// <noreply@myaiagents.agency>".
const FROM_EMAIL   = process.env.FROM_EMAIL||'noreply@myaiagents.agency';
const PUBLIC_DIR   = path.join(__dirname,'..','public');
const USE_SUPA     = !!(SUPA_URL&&SUPA_KEY);
const USD_TO_JPY   = parseFloat(process.env.USD_TO_JPY||'150');
const CURRENCY = 'usd';

// ── PRICING ───────────────────────────────────────────────────
const PRICING={ user:{ input:4.5, output:22.5 } };

// ── FOUNDER 100 ─────────────────────────────────────────────
// First N sign-ups get: 1 month BUSINESS free + permanent Founder badge
// + permanent 0% Agent Store fees. After the 1-month BUSINESS trial they
// auto-downgrade to 'free' (handled lazily on /api/me reads).
const FOUNDER_LIMIT = 100;

// ── INTEGRATIONS CATALOG (50 services) ─────────────────────
// Single source of truth used by:
//   ・ /api/me/integrations/catalog (UI cards)
//   ・ generic PUT/DELETE handler (field validation per service)
//   ・ inline CTA emitter (when a tool fails for missing integration)
//
// flow types:
//   'form'    — user pastes API key / token. Fields validated server-side.
//   'webhook' — user pastes a Webhook URL (Slack / Discord style).
//   'oauth'   — 1-click OAuth flow. `has_backend:true` means we have a route.
//
// `priority` flags the 15-service "recommended starter set".
function _integrationsCatalog(){
  return [
    // ── 開発 / インフラ ─────────────────────────
    { id:'github', name:'GitHub', logo:'🐙', group:'dev', desc:'PR/Issue/コードを AI が読み書き', flow:'form', priority:true, has_backend:true,
      fields:[{key:'pat', label:'Personal Access Token', type:'password', required:true, pattern:'^(ghp_|github_pat_|gho_|ghu_|ghs_)[A-Za-z0-9_]{20,}$', help:'github.com/settings/tokens?type=beta で発行 (Contents/Metadata/Issues = Read)'}] },
    { id:'vercel', name:'Vercel', logo:'▲', group:'dev', desc:'デプロイ・プレビュー URL・ビルドログ参照', flow:'form', priority:true,
      fields:[{key:'token', label:'API Token', type:'password', required:true, help:'vercel.com/account/tokens'}] },
    { id:'cloudflare', name:'Cloudflare', logo:'☁️', group:'dev', desc:'Workers / Pages / DNS / R2 を操作', flow:'form', priority:true,
      fields:[{key:'apiToken', label:'API Token', type:'password', required:true, help:'dash.cloudflare.com → My Profile → API Tokens'},
              {key:'accountId', label:'Account ID', type:'text', required:false}] },
    { id:'netlify', name:'Netlify', logo:'🟦', group:'dev', desc:'静的サイトデプロイ・フォーム・Edge Functions', flow:'form',
      fields:[{key:'token', label:'Personal Access Token', type:'password', required:true, help:'app.netlify.com/user/applications'}] },
    { id:'render', name:'Render', logo:'🟢', group:'dev', desc:'フルスタックデプロイ・再起動・ログ', flow:'form',
      fields:[{key:'apiKey', label:'API Key', type:'password', required:true, help:'dashboard.render.com/u/settings'}] },
    { id:'sentry', name:'Sentry', logo:'🐛', group:'dev', desc:'エラー監視・スタックトレース解析', flow:'form',
      fields:[{key:'authToken', label:'Auth Token', type:'password', required:true},
              {key:'orgSlug', label:'Org Slug', type:'text', required:true}] },
    { id:'aws', name:'AWS', logo:'📦', group:'dev', desc:'S3 / Lambda / CloudWatch', flow:'oauth' },
    { id:'supabase', name:'Supabase', logo:'⚡', group:'dev', desc:'DB / Auth / Storage', flow:'form',
      fields:[{key:'projectUrl', label:'Project URL', type:'url', required:true},
              {key:'serviceKey', label:'Service Role Key', type:'password', required:true}] },

    // ── ドキュメント / ナレッジ ───────────────────
    { id:'notion', name:'Notion', logo:'📝', group:'docs', desc:'ドキュメント / DB 読み書き', flow:'oauth', priority:true },
    { id:'google_drive', name:'Google Drive', logo:'📁', group:'docs', desc:'ファイル横断検索・Docs/Sheets 作成', flow:'oauth', priority:true },
    { id:'dropbox', name:'Dropbox', logo:'📦', group:'docs', desc:'ファイル取得・アップロード・共有リンク', flow:'oauth' },
    { id:'airtable', name:'Airtable', logo:'🗂️', group:'docs', desc:'DB / シートの読み書き', flow:'form',
      fields:[{key:'apiKey', label:'Personal Access Token', type:'password', required:true, help:'airtable.com/create/tokens'}] },
    { id:'obsidian', name:'Obsidian', logo:'🟣', group:'docs', desc:'ローカル Vault に MCP 経由でアクセス', flow:'form',
      fields:[{key:'mcpUrl', label:'Local MCP Server URL', type:'url', required:true, help:'例: http://localhost:3010/sse'}] },

    // ── コミュニケーション ────────────────────────
    { id:'slack', name:'Slack', logo:'💬', group:'chat', desc:'メッセージ送信・通知', flow:'webhook', priority:true, has_backend:true,
      fields:[{key:'webhookUrl', label:'Incoming Webhook URL', type:'url', required:true, pattern:'^https://hooks\\.slack\\.com/', help:'api.slack.com/messaging/webhooks'}] },
    { id:'discord', name:'Discord', logo:'🎮', group:'chat', desc:'チャンネル通知・コミュニティ運営', flow:'webhook', priority:true, has_backend:true,
      fields:[{key:'webhookUrl', label:'Webhook URL', type:'url', required:true, pattern:'^https://discord(?:app)?\\.com/api/webhooks/', help:'チャンネル設定 → Integrations → Webhooks'}] },
    { id:'telegram', name:'Telegram', logo:'✈️', group:'chat', desc:'Bot API でメッセージ送受信', flow:'form', priority:true,
      fields:[{key:'botToken', label:'Bot Token', type:'password', required:true, pattern:'^\\d+:[A-Za-z0-9_-]{30,}$', help:'@BotFather にメッセージして作成'}] },
    { id:'line', name:'LINE', logo:'🟢', group:'chat', desc:'Messaging API (日本向け Bot)', flow:'form',
      fields:[{key:'channelAccessToken', label:'Channel Access Token', type:'password', required:true, help:'developers.line.biz'}] },
    { id:'zoom', name:'Zoom', logo:'🎥', group:'chat', desc:'会議録画・文字起こし・予定作成', flow:'oauth' },

    // ── メール ───────────────────────────────
    { id:'gmail', name:'Gmail', logo:'📧', group:'mail', desc:'受信箱検索・自動返信', flow:'oauth', priority:true },
    { id:'resend', name:'Resend', logo:'💌', group:'mail', desc:'モダン送信 API・月 3,000 通無料', flow:'form', priority:true,
      fields:[{key:'apiKey', label:'API Key', type:'password', required:true, pattern:'^re_', help:'resend.com/api-keys'}] },
    { id:'sendgrid', name:'SendGrid', logo:'📨', group:'mail', desc:'大量配信・トランザクション送信', flow:'form',
      fields:[{key:'apiKey', label:'API Key', type:'password', required:true, pattern:'^SG\\.', help:'app.sendgrid.com/settings/api_keys'}] },

    // ── カレンダー / タスク ──────────────────────
    { id:'google_calendar', name:'Google Calendar', logo:'📆', group:'cal', desc:'予定登録・空き時間提案', flow:'oauth', priority:true },
    { id:'linear', name:'Linear', logo:'📐', group:'cal', desc:'Issue 作成・進捗管理', flow:'oauth', priority:true },
    { id:'cal_com', name:'Cal.com', logo:'🗓️', group:'cal', desc:'予約リンク生成・空き時間公開', flow:'form',
      fields:[{key:'apiKey', label:'API Key', type:'password', required:true, help:'app.cal.com/settings/developer/api-keys'}] },
    { id:'todoist', name:'Todoist', logo:'✅', group:'cal', desc:'個人タスクの追加・完了', flow:'form',
      fields:[{key:'apiToken', label:'API Token', type:'password', required:true, help:'todoist.com/app/settings/integrations'}] },
    { id:'trello', name:'Trello', logo:'📋', group:'cal', desc:'カンバン操作・カード移動', flow:'oauth' },

    // ── ブログ / 発信 ─────────────────────────
    { id:'wordpress', name:'WordPress', logo:'📰', group:'blog', desc:'記事作成・更新・公開', flow:'form', priority:true,
      fields:[{key:'siteUrl', label:'Site URL', type:'url', required:true, pattern:'^https?://'},
              {key:'username', label:'ユーザー名', type:'text', required:true},
              {key:'appPassword', label:'Application Password', type:'password', required:true, help:'ダッシュボード → ユーザー → プロフィール → Application Passwords'}] },
    { id:'ghost', name:'Ghost', logo:'👻', group:'blog', desc:'記事投稿・ニュースレター送信', flow:'form',
      fields:[{key:'adminUrl', label:'Admin URL', type:'url', required:true},
              {key:'apiKey', label:'Admin API Key', type:'password', required:true}] },
    { id:'substack', name:'Substack', logo:'📩', group:'blog', desc:'ニュースレター下書き・配信予約', flow:'oauth' },
    { id:'beehiiv', name:'Beehiiv', logo:'🐝', group:'blog', desc:'記事投稿・統計取得', flow:'form',
      fields:[{key:'apiKey', label:'API Key', type:'password', required:true, help:'app.beehiiv.com/settings/integrations/api'}] },
    { id:'note', name:'note', logo:'📓', group:'blog', desc:'下書き作成・公開予約', flow:'oauth' },

    // ── SNS ─────────────────────────────────
    { id:'twitter', name:'X (Twitter)', logo:'𝕏', group:'sns', desc:'投稿・スレッド・DM 自動応答', flow:'oauth', priority:true },
    { id:'linkedin', name:'LinkedIn', logo:'💼', group:'sns', desc:'B2B 投稿・つながり管理', flow:'oauth', priority:true },
    { id:'youtube', name:'YouTube', logo:'▶️', group:'sns', desc:'動画アップロード・字幕生成', flow:'oauth' },
    { id:'instagram', name:'Instagram', logo:'📷', group:'sns', desc:'投稿・ストーリーズ・コメント返信', flow:'oauth' },
    { id:'threads', name:'Threads', logo:'🧵', group:'sns', desc:'Instagram 連動の投稿', flow:'oauth' },
    { id:'reddit', name:'Reddit', logo:'🤖', group:'sns', desc:'投稿・コメント・サブレディット監視', flow:'oauth' },
    { id:'producthunt', name:'Product Hunt', logo:'🏆', group:'sns', desc:'ローンチ予約・コメント監視', flow:'oauth' },

    // ── EC / 決済 ───────────────────────────
    { id:'stripe', name:'Stripe', logo:'💳', group:'pay', desc:'顧客・サブスク・売上・払い戻し', flow:'form', priority:true,
      fields:[{key:'secretKey', label:'Secret API Key', type:'password', required:true, pattern:'^sk_(test|live)_', help:'dashboard.stripe.com/apikeys'}] },
    { id:'shopify', name:'Shopify', logo:'🛒', group:'pay', desc:'商品・注文・在庫・顧客', flow:'form', priority:true,
      fields:[{key:'shopDomain', label:'Shop Domain', type:'text', required:true, pattern:'\\.myshopify\\.com$'},
              {key:'accessToken', label:'Admin API Access Token', type:'password', required:true}] },
    { id:'lemon_squeezy', name:'Lemon Squeezy', logo:'🍋', group:'pay', desc:'MoR インディー決済・サブスク', flow:'form',
      fields:[{key:'apiKey', label:'API Key', type:'password', required:true, help:'app.lemonsqueezy.com/settings/api'}] },
    { id:'gumroad', name:'Gumroad', logo:'📦', group:'pay', desc:'デジタル販売・顧客リスト', flow:'form',
      fields:[{key:'accessToken', label:'Access Token', type:'password', required:true}] },

    // ── アナリティクス / マーケ ──────────────────
    { id:'ga4', name:'Google Analytics 4', logo:'📈', group:'data', desc:'トラフィック分析・コンバージョン', flow:'oauth', priority:true },
    { id:'posthog', name:'PostHog', logo:'🎯', group:'data', desc:'プロダクト分析・ファネル可視化', flow:'form',
      fields:[{key:'apiKey', label:'Project API Key', type:'password', required:true},
              {key:'host', label:'Host (省略可)', type:'url', required:false}] },
    { id:'search_console', name:'Search Console', logo:'🔍', group:'data', desc:'SEO 検索クエリ・順位', flow:'oauth' },
    { id:'plausible', name:'Plausible', logo:'📉', group:'data', desc:'プライバシー重視のシンプル解析', flow:'form',
      fields:[{key:'apiKey', label:'API Key', type:'password', required:true},
              {key:'siteId', label:'Site ID', type:'text', required:true}] },

    // ── AI / 検索 / 音声 ────────────────────
    { id:'tavily', name:'Tavily', logo:'🔎', group:'ai', desc:'Web 検索 API (AI 用)', flow:'form',
      fields:[{key:'apiKey', label:'API Key', type:'password', required:true, pattern:'^tvly-', help:'tavily.com'}] },
    { id:'elevenlabs', name:'ElevenLabs', logo:'🎙️', group:'ai', desc:'高品質 TTS', flow:'form',
      fields:[{key:'apiKey', label:'API Key', type:'password', required:true, help:'elevenlabs.io/app/settings/api-keys'}] },

    // ── ワークフロー / メタ連携 ──────────────────
    { id:'zapier', name:'Zapier', logo:'⚡', group:'flow', desc:'5,000+ サービスへブリッジ', flow:'webhook', priority:true, has_backend:true,
      fields:[{key:'webhookUrl', label:'Zap Webhook URL', type:'url', required:true, help:'Zapier で Webhook by Zapier トリガーを作って URL を取得'}] },
    { id:'n8n', name:'n8n', logo:'🔧', group:'flow', desc:'OSS ワークフロー・独自トリガー', flow:'webhook',
      fields:[{key:'webhookUrl', label:'Webhook URL', type:'url', required:true}] },
  ];
}

const INTEGRATION_GROUP_LABELS = {
  dev: '💻 開発 / インフラ',
  docs: '📚 ドキュメント / ナレッジ',
  chat: '💬 コミュニケーション',
  mail: '✉️ メール',
  cal: '📅 カレンダー / タスク',
  blog: '✍️ ブログ / 発信',
  sns: '🐦 SNS',
  pay: '💰 EC / 決済',
  data: '📊 アナリティクス / マーケ',
  ai: '🤖 AI / 検索 / 音声',
  flow: '🔌 ワークフロー / メタ連携',
};

// Returns { connected, account? } for a single service. Reads legacy fields
// (user.github_pat, user.outgoing_webhooks.{slack,discord}) so MIGRATING
// users see their existing setup reflected as ✓ Connected without re-entry.
function _getIntegrationStatus(user, id){
  if(!user) return { connected: false };
  if(id === 'github'){
    if(user.github_pat) return { connected: true, account: user.github_login || '' };
    return { connected: false };
  }
  if(id === 'slack' && user.outgoing_webhooks && user.outgoing_webhooks.slack){
    return { connected: true };
  }
  if(id === 'discord' && user.outgoing_webhooks && user.outgoing_webhooks.discord){
    return { connected: true };
  }
  const v = user.integrations && user.integrations[id];
  if(v && (v.connected_at || v.apiKey || v.token || v.webhookUrl || v.botToken || v.secretKey || v.accessToken || v.appPassword || v.pat)){
    return { connected: true, connected_at: v.connected_at || null };
  }
  return { connected: false };
}

const {createClient}=require('@supabase/supabase-js');
const supabase=USE_SUPA?createClient(SUPA_URL,SUPA_KEY):null;
function calcCost(inputTok,outputTok){
  const usd=(inputTok/1e6*PRICING.user.input)+(outputTok/1e6*PRICING.user.output);
  return{ usd, jpy:Math.ceil(usd*USD_TO_JPY*1000)/1000, inputTok, outputTok };
}
// USD金額をセント（Stripe用）に変換
function usdToCents(usd){ return Math.round(usd*100); }

// ── RATE LIMITER ──────────────────────────────────────────────
const RL=new Map();
function rateLimit(ip,max=100,win=60000){
  const now=Date.now(),r=RL.get(ip)||{n:0,reset:now+win};
  if(now>r.reset){r.n=0;r.reset=now+win;}
  r.n++;RL.set(ip,r);return r.n<=max;
}
setInterval(()=>{const now=Date.now();for(const[k,v]of RL)if(now>v.reset+60000)RL.delete(k);},120000);

// ── LOCAL DB ──────────────────────────────────────────────────
const DB_PATH=process.env.LDB_PATH||path.join(__dirname,'db.json');
const LDB=(()=>{
  let d={users:[]};
  if(fs.existsSync(DB_PATH)){try{d=JSON.parse(fs.readFileSync(DB_PATH,'utf8'));}catch{}}
  const save=()=>fs.writeFileSync(DB_PATH,JSON.stringify(d,null,2));
  return{
    find:fn=>d.users.find(fn),
    all:()=>d.users.slice(),
    add(u){d.users.push(u);save();},
    upd(u){const i=d.users.findIndex(x=>x.id===u.id);if(i>=0){d.users[i]=u;save();}},
    del(id){const i=d.users.findIndex(x=>x.id===id);if(i>=0){d.users.splice(i,1);save();}},
  };
})();

// ── SUPABASE ──────────────────────────────────────────────────
function sbReq(method,table,qs='',body=null){
  return new Promise((res,rej)=>{
    const u=new url.URL(`${SUPA_URL}/rest/v1/${table}${qs}`);
    const pay=body?JSON.stringify(body):null;
    const headers={'apikey':SUPA_KEY,'Authorization':`Bearer ${SUPA_KEY}`,
      'Content-Type':'application/json','Prefer':'return=representation',
      ...(pay?{'Content-Length':Buffer.byteLength(pay)}:{})};
    const req=https.request({
      hostname:u.hostname,path:u.pathname+u.search,method,headers,timeout:8000
    },r=>{
      // CRITICAL: setEncoding('utf8') so Node buffers incomplete multi-byte
      // sequences across data chunks. Without it, "d += chunk" can split a
      // 3-byte Japanese char between two chunks → 文字化け in agent names,
      // chat history, etc. Same fix as httpsReq above.
      r.setEncoding('utf8');
      let d='';
      r.on('data',c=>d+=c);
      r.on('end',()=>{try{res({s:r.statusCode,d:JSON.parse(d||'[]')});}catch{res({s:r.statusCode,d});}});
    });
    req.on('error',e=>{console.error('sbReq error:',e.message);rej(e);});
    req.on('timeout',()=>{req.destroy();rej(new Error('Supabase timeout'));});
    if(pay)req.write(pay);
    req.end();
  });
}

// ── DB ABSTRACTION ────────────────────────────────────────────
// 注意: コードと Supabase スキーマは共に snake_case を使用。case 変換は不要。
const DB={
  async findBy(field,val){
    if(!USE_SUPA)return LDB.find(u=>u[field]===val)||null;
    const r=await sbReq('GET','users','?select=*&'+field+'=eq.'+encodeURIComponent(val)+'&limit=1');
    if(!r.d||!r.d[0])return null;
    return r.d[0];
  },
  async create(user){
    if(!USE_SUPA){LDB.add(user);return user;}
    // Auto-retry: drop unknown columns (e.g., new fields added before migration)
    // so signup never silently fails if a migration is pending. Same defensive
    // pattern as DB.save.
    const payload = {...user};
    for(let attempt=0; attempt<12; attempt++){
      const r = await sbReq('POST','users','',payload);
      if(r.s < 400){
        const arr = Array.isArray(r.d) ? r.d : [r.d];
        return arr[0] || user;
      }
      const msg = (r.d && (r.d.message || r.d.hint)) || '';
      const m = msg.match(/Could not find the '([\w_]+)' column/);
      if(m && payload[m[1]] !== undefined){
        console.warn('[DB.create] dropping unknown column "'+m[1]+'" — run docs/SUPABASE_MIGRATION.sql to add it');
        delete payload[m[1]];
        continue;
      }
      console.error('[DB.create] Supabase rejected (HTTP '+r.s+'):', JSON.stringify(r.d).slice(0,400));
      // Don't return the in-memory user (that masked the bug). Throw so the
      // signup endpoint surfaces a 500 instead of pretending success.
      throw new Error('Supabase create failed: ' + (msg || 'HTTP '+r.s));
    }
    throw new Error('Supabase create failed after column-drop retries');
  },
  async save(user){
    if(!USE_SUPA){LDB.upd(user);return;}
    const payload = {...user};
    delete payload.id; // never update primary key
    for(let attempt=0; attempt<12; attempt++){
      const r = await sbReq('PATCH','users','?id=eq.'+user.id,payload);
      if(r.s<400){
        // Verify the PATCH actually hit a row. With Prefer: return=representation,
        // r.d should be an array of updated rows. Empty array == nothing matched.
        if(Array.isArray(r.d) && r.d.length===0){
          console.error('[DB.save] PATCH returned 0 rows for id='+user.id+' — RLS policy or wrong key? plan saved=NO');
          throw new Error('Supabase: 0 rows updated (RLS policy blocking, or service key wrong)');
        }
        // Useful diagnostic: log when plan changed
        if(payload.plan){
          console.log('[DB.save] saved id='+user.id+' plan='+payload.plan+' rows='+(Array.isArray(r.d)?r.d.length:'?'));
        }
        return;
      }
      const msg = (r.d && (r.d.message || r.d.hint)) || '';
      const m = msg.match(/Could not find the '([\w_]+)' column/);
      if(m && payload[m[1]] !== undefined){
        console.warn('[DB.save] dropping unknown column "'+m[1]+'"');
        delete payload[m[1]];
        continue;
      }
      console.error('[DB.save] Supabase rejected (HTTP '+r.s+'):', JSON.stringify(r.d).slice(0,400));
      throw new Error(msg || 'Supabase save failed (HTTP '+r.s+')');
    }
    throw new Error('Supabase save failed after retries');
  },
  async remove(id){
    if(!USE_SUPA){LDB.data=(LDB.data||[]).filter(u=>u.id!==id);return true;}
    const r=await sbReq('DELETE','users','?id=eq.'+id);
    return r.s<300;
  },
  // Founder 100: count how many seats are already allocated.
  async countFounders(){
    if(!USE_SUPA){
      return LDB.all().filter(u => u.is_founder).length;
    }
    const r = await sbReq('GET','users','?select=id&is_founder=eq.true&limit=200');
    return Array.isArray(r.d) ? r.d.length : 0;
  },
  // For marketing daily-report aggregation: pull users created in a UTC window.
  async findAllCreatedBetween(startIso, endIso){
    if(!USE_SUPA){
      return LDB.all().filter(u => u.created_at >= startIso && u.created_at < endIso);
    }
    const qs = '?select=id,email,marketing_attribution,created_at'
      + '&created_at=gte.' + encodeURIComponent(startIso)
      + '&created_at=lt.'  + encodeURIComponent(endIso)
      + '&limit=10000';
    const r = await sbReq('GET','users',qs);
    return Array.isArray(r.d) ? r.d : [];
  },
};

// ── JWT ───────────────────────────────────────────────────────
const JWT={
  sign(p,exp=86400000*30){
    const h=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');
    const b=Buffer.from(JSON.stringify({...p,exp:Date.now()+exp})).toString('base64url');
    const s=crypto.createHmac('sha256',JWT_SECRET).update(`${h}.${b}`).digest('base64url');
    return`${h}.${b}.${s}`;
  },
  verify(t){
    try{
      const[h,b,s]=(t||'').split('.');
      const e=crypto.createHmac('sha256',JWT_SECRET).update(`${h}.${b}`).digest('base64url');
      if(s!==e)return null;
      const p=JSON.parse(Buffer.from(b,'base64url').toString());
      if(p.exp&&Date.now()>p.exp)return null;return p;
    }catch{return null;}
  },
};

// ── PASSWORD ──────────────────────────────────────────────────
const PW={
  hash(pw){const s=crypto.randomBytes(16).toString('hex');return s+':'+crypto.pbkdf2Sync(pw,s,100000,64,'sha512').toString('hex');},
  check(pw,stored){
    if(!stored)return false;
    const[s,h]=stored.split(':');
    try{return crypto.timingSafeEqual(Buffer.from(h,'hex'),crypto.pbkdf2Sync(pw,s,100000,64,'sha512'));}
    catch{return false;}
  },
};

// ── HTTP HELPERS ──────────────────────────────────────────────
const SEC={'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'strict-origin-when-cross-origin'};
function jres(res,status,data){
  const body=JSON.stringify(data);
  res.writeHead(status,{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body),'Access-Control-Allow-Origin':APP_URL,...SEC});
  res.end(body);
}
// Max body size: 50 MB. PDF / image attachments are sent base64 (~1.37x
// inflation) so a 32 MB PDF (Anthropic's per-request cap) fits comfortably
// here with headroom for JSON wrapping. Frontend caps individual attachments
// at 32 MB so this is the right ceiling.
function readBody(req,max=50*1024*1024){
  return new Promise((resolve,reject)=>{
    let b='',sz=0,settled=false;
    req.on('data',c=>{
      if(settled) return;
      sz+=c.length;
      if(sz>max){
        settled=true;
        try{ req.destroy(); }catch(e){}
        const err = new Error('Body too large');
        err.statusCode = 413;
        reject(err);
        return;
      }
      b+=c;
    });
    req.on('end',()=>{
      if(settled) return;
      settled=true;
      try{ resolve(JSON.parse(b||'{}')); }catch{ resolve({}); }
    });
    req.on('error',(e)=>{
      if(settled) return;
      settled=true; reject(e);
    });
  });
}
function readRaw(req){return new Promise((resolve,reject)=>{const c=[];req.on('data',d=>c.push(d));req.on('end',()=>resolve(Buffer.concat(c)));req.on('error',reject);});}
function getAuth(req){return JWT.verify((req.headers['authorization']||'').replace('Bearer ',''));}
function getIP(req){return(req.headers['x-forwarded-for']||req.socket.remoteAddress||'').split(',')[0].trim();}
function safe(u){
  const{password:_,verify_token:__,reset_token:___,reset_expiry:____,
        google_oauth:gOAuth,
        extension_device_token:extTok,
        github_pat:ghPat,
        ...s}=u;
  // Expose only the *connection state* — never the secret tokens themselves.
  s.google_sheets_connected = !!(gOAuth && gOAuth.refresh_token);
  s.google_sheets_email = (gOAuth && gOAuth.email) || null;
  s.extension_paired = !!extTok;
  s.extension_connected = !!(extTok && _extConnections.has(extTok));
  s.github_connected = !!ghPat;
  // Plan v2 surface (frontend uses this to render correct credit amount and
  // gate Team / agent-cap UIs without doing date math itself).
  s.plan_v2_grandfathered = _isGrandfathered(u);
  return s;
}
function newUser(base){
  return{id:crypto.randomUUID(),plan:'free',balance_jpy:0,usage_count:0,
    agents:[],billing_history:[],stripe_customer_id:null,
    // Creator revenue ledger (#5)
    balance_jpy_pending:0,         // 7日経過前の未確定収益
    balance_jpy_available:0,       // 出金可能な確定収益
    revenue_history:[],            // {date, listing_id, agent_name, buyer_user_id, cost_jpy, share_jpy, status:'pending'|'confirmed', confirms_at}
    payout_history:[],             // {date, amount_jpy, method, status, stripe_payout_id}
    // Marketplace UX
    is_verified:false,             // 公式 / 検証済みクリエイターバッジ (admin manual)
    favorites:[],                  // listing_ids the user favorited
    // Group memberships: groups this user joined that are owned by OTHERS.
    group_memberships:[],
    // Referral: my own short code (lazy-generated) + who referred me + count
    referral_code:null,
    referred_by:null,
    referral_stats:{ count:0, last_at:null, total_credit_jpy:0 },
    // Recent login events for security visibility (last 30)
    // [{at, ip, ua, kind: 'login'|'signup'|'google'}]
    login_history:[],
    // Google Sheets API tokens — null when not connected.
    // {access_token, refresh_token, expires_at, scope, email}
    google_oauth:null,
    // ── Founder 100 ────────────────────────────────────────────
    // First 100 sign-ups get: 1 month BUSINESS free + permanent badge
    // + permanent 0% Agent Store fees. Allocated at signup.
    is_founder:false,
    founder_seat_no:null,           // 1-100
    founder_granted_at:null,        // ISO timestamp
    business_trial_until:null,      // ISO timestamp; trial is over when now > this
    verified:false,verify_token:null,reset_token:null,reset_expiry:null,
    created_at:new Date().toISOString(),...base};
}

// ── LOGIN HISTORY ─────────────────────────────────────────────
// Append a login event onto the user record for security visibility.
function recordLogin(user, req, kind){
  if(!user) return;
  user.login_history = Array.isArray(user.login_history) ? user.login_history : [];
  user.login_history.unshift({
    at: new Date().toISOString(),
    kind: kind || 'login',
    ip: getIP(req) || null,
    ua: ((req.headers['user-agent'] || '').toString()).slice(0, 200),
  });
  if(user.login_history.length > 30) user.login_history = user.login_history.slice(0, 30);
}

// ── REFERRAL HELPERS ──────────────────────────────────────────
// Generate a short (10-char base32) referral code. Cheap to type by hand.
function genReferralCode(){
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for(let i=0;i<8;i++) s += A[Math.floor(Math.random()*A.length)];
  return s;
}
async function ensureReferralCode(user){
  if(user.referral_code && user.referral_code.length === 8) return user.referral_code;
  user.referral_code = genReferralCode();
  await DB.save(user).catch(()=>{});
  return user.referral_code;
}
async function findUserByReferralCode(code){
  if(!code || typeof code !== 'string' || code.length !== 8) return null;
  if(USE_SUPA){
    const r = await sbReq('GET','users','?select=*&referral_code=eq.'+encodeURIComponent(code)+'&limit=1');
    return (r && r.d && r.d[0]) || null;
  } else {
    return LDB.find(u => u.referral_code === code) || null;
  }
}

// ── GROUP HELPERS ─────────────────────────────────────────────
// Generate a short shareable invite token (no '0/O/1/I' to avoid confusion).
function genInviteToken(){
  const A = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for(let i=0;i<8;i++) s += A[Math.floor(Math.random()*A.length)];
  return s;
}

// Returns a "public-safe" view of a member entry (no email, no tokens).
function _safeMember(m){
  if(!m) return null;
  return {
    user_id: m.user_id,
    name: m.name || '',
    avatar: m.avatar || '',
    role: m.role || 'member',
    joined_at: m.joined_at || null,
    last_seen: m.last_seen || null,
    // Read-receipt pointer: which message index this member has read up to.
    // Required for the "既読 N" indicator next to a user's sent message to
    // update when other members open the chat. Not PII — it's just a number.
    last_read_idx: Number.isInteger(m.last_read_idx) ? m.last_read_idx : 0,
  };
}

// Resolve a token to {host, agent}. Scans Supabase via JSONB containment.
// Returns null if not found or expired.
async function findGroupByToken(token){
  if(!token) return null;
  if(USE_SUPA){
    const filter = encodeURIComponent(JSON.stringify([{invite_token: token}]));
    const r = await sbReq('GET','users','?select=*&agents=cs.'+filter+'&limit=1');
    const host = r && r.d && r.d[0];
    if(!host) return null;
    const agent = (host.agents||[]).find(a => a.invite_token === token && a.is_group);
    if(!agent) return null;
    return { host, agent };
  } else {
    for(const u of LDB.all()){
      const ag = (u.agents||[]).find(a => a.invite_token === token && a.is_group);
      if(ag) return { host: u, agent: ag };
    }
    return null;
  }
}

// Count history entries newer than the user's last_read_idx, excluding their
// own messages and skipping system rows. Returns 0 if the user isn't a member.
function _unreadCountForUser(agent, userId){
  if(!agent || !Array.isArray(agent.history) || !Array.isArray(agent.members)) return 0;
  const member = agent.members.find(m => m.user_id === userId);
  const lastIdx = member && Number.isInteger(member.last_read_idx) ? member.last_read_idx : 0;
  const tail = agent.history.slice(lastIdx);
  let n = 0;
  for(const m of tail){
    if(!m) continue;
    if(m.role === 'system') continue;
    // Don't count the user's own messages as unread
    if(m.role === 'user' && m.user_id === userId) continue;
    n++;
    if(n > 99) break; // capped — UI shows "99+"
  }
  return n;
}

// Returns true if invite is currently valid (not expired, under capacity)
function isInviteValid(agent){
  if(!agent || !agent.invite_token) return false;
  if(agent.invite_expires_at){
    const exp = new Date(agent.invite_expires_at).getTime();
    if(!isFinite(exp) || exp < Date.now()) return false;
  }
  const cap = agent.invite_max_members || 50;
  if((agent.members||[]).length >= cap) return false;
  return true;
}

/* ── Tag suggestions ────────────────────────────────────────── */
const MARKET_TAGS = [
  {id:'b2b',         label:'BtoB'},
  {id:'b2c',         label:'BtoC'},
  {id:'free',        label:'無料枠OK'},
  {id:'sole',        label:'個人事業主向け'},
  {id:'creator',     label:'クリエイター向け'},
  {id:'student',     label:'学生向け'},
  {id:'enterprise',  label:'法人向け'},
  {id:'startup',     label:'スタートアップ向け'},
  {id:'remote',      label:'リモートワーク'},
  {id:'beginner',    label:'初心者向け'},
  {id:'jp',          label:'日本市場特化'},
  {id:'global',      label:'グローバル対応'},
];
const MARKET_TAG_LABEL = MARKET_TAGS.reduce((a,t)=>{a[t.id]=t.label;return a;},{});

/* ── One-click automation templates ──────────────────────────
 * Each entry instantiates a ready-to-run agent + optional schedule and
 * surfaces hints about which integrations to plug in. Persona text is
 * intentionally short — the model fills the gaps. Avoid app-specific
 * knowledge here; templates should work for any user.
 */
const TEMPLATES = [
  {
    id: 'daily-slack-briefing',
    icon: '🌅',
    title: 'Daily Slack Briefing',
    description: '毎朝 9 時に「今日やるべきこと」をまとめて Slack に投稿する AI。Notion / メールの代わり。',
    skills: ['chat'],
    avatar: '🌅',
    persona:
      'あなたは「Daily Briefing Coordinator」というアシスタントです。\n' +
      '\n採用目的:\nユーザーの 1 日の最初に、その日意識すべき優先タスク / 注意点 / 1 メッセージ励まし を 3-5 行でまとめる。\n' +
      '\n業務内容:\n- 毎朝、簡潔な「今日のブリーフィング」を生成\n- 過去のチャット / ナレッジ から最近の状況を把握\n- Slack に投げやすい mrkdwn 形式で出力\n- 完了時に notify_slack ツールで自動投稿\n' +
      '\n性格: 元気で前向きだが冗長じゃない。仕事の同僚として接する。',
    schedule: { kind:'daily', hour:9, minute:0, prompt:'今日のブリーフィングを作って Slack に投げて。', deliver:'chat', label:'Daily Slack Briefing' },
    suggestedIntegrations: ['slack'],
  },
  {
    id: 'meeting-notes',
    icon: '🎙️',
    title: 'Meeting Notes → Action Items',
    description: '会議の文字起こし or 議事録を貼り付けると、決定事項と担当者付きアクションを抽出してくれる。',
    skills: ['chat'],
    avatar: '🎙️',
    persona:
      'あなたは「Meeting Notes Distiller」というアシスタントです。\n' +
      '\n採用目的:\n会議の文字起こし / 議事録を渡されると、即座に決定事項・アクションアイテム (担当者 + 期限 付き)・未解決の論点 の 3 セクションに整理する。\n' +
      '\n業務内容:\n- 決定: 箇条書き 3-5 件\n- アクション: 「@誰が / いつまでに / 何を」の表 (Markdown)\n- 未解決: 残った論点を 2-3 件\n- 全体を Slack に貼って共有しやすい形式で\n' +
      '\n性格: 端的・実務的。要約は短く具体的に。',
    schedule: null,
    suggestedIntegrations: ['slack'],
  },
  {
    id: 'newsletter-drafter',
    icon: '✉️',
    title: 'Weekly Newsletter Draft',
    description: '毎週金曜の朝に「今週のハイライト + 来週の予告」を下書きしてメールに送信。',
    skills: ['chat','writing'],
    avatar: '✉️',
    persona:
      'あなたは「Weekly Newsletter Writer」というアシスタントです。\n' +
      '\n採用目的:\n読者を飽きさせない 5-7 段落のニュースレター下書きを毎週生成。書き手はそれを微調整して送るだけにしたい。\n' +
      '\n業務内容:\n- 件名 (40 字以内、興味喚起)\n- 導入 (1 段落)\n- 本文 (今週のハイライト 3 つ、それぞれ 2-3 文)\n- 来週のお知らせ\n- CTA (1 つだけ)\n- 完成したらユーザーのメールに send_email で送信\n' +
      '\n性格: 友好的だが押し付けがましくない。読者を 1 人称で呼ぶ。',
    schedule: { kind:'daily', hour:8, minute:0, prompt:'今週のニュースレター下書きを生成して、ユーザーのメールに送って。', deliver:'email', label:'Weekly Newsletter' },
    suggestedIntegrations: [],
  },
  {
    id: 'lead-researcher',
    icon: '🔎',
    title: 'Sales Lead Researcher',
    description: 'Webhook で「相手の名前 / 会社」を受け取ると、その人の公開情報を調べて Slack に通知。',
    skills: ['chat','search'],
    avatar: '🔎',
    persona:
      'あなたは「Lead Research Analyst」というアシスタントです。\n' +
      '\n採用目的:\n営業がアポ前に「相手は何者か」を 30 秒で把握できるよう、名前・会社が来たら 5 行サマリで返す。\n' +
      '\n業務内容:\n- web_search で本人の公開情報を集める (LinkedIn / 会社 HP / プレスリリース)\n- サマリは: 役職 / 会社の事業 / 直近 6 か月の動き / 注目すべき発信 / 推奨アプローチ角度\n- 完了したら notify_slack で営業チャンネルに投稿\n' +
      '\n性格: 簡潔、事実ベース。憶測は明記する。',
    chrome_enabled: true,
    schedule: null,
    suggestedIntegrations: ['slack'],
  },
  {
    id: 'support-triage',
    icon: '🛟',
    title: 'Customer Support Triage',
    description: 'お問い合わせフォームから webhook 投稿 → カテゴリ分類 + 一次返信案 + Slack 通知。',
    skills: ['chat'],
    avatar: '🛟',
    persona:
      'あなたは「Support Triage Bot」というアシスタントです。\n' +
      '\n採用目的:\nWebhook 経由で届く問い合わせ本文を、(1) カテゴリ分類 (2) 緊急度 (3) 一次返信ドラフト の 3 つに即座に整える。\n' +
      '\n業務内容:\n- カテゴリ: bug / billing / feature_request / how_to / other\n- 緊急度: high / mid / low (本文の感情と影響範囲から判定)\n- 返信案: 顧客に送れる丁寧な日本語ドラフト 3-5 行\n- 完了したら notify_slack で #support に投稿し、緊急度 high は @here で呼びかけ\n' +
      '\n性格: 共感的・正確。顧客のフラストレーションを再認識する語り口。',
    schedule: null,
    suggestedIntegrations: ['slack'],
  },
  {
    id: 'morning-reflection',
    icon: '☕',
    title: 'Morning Reflection Coach',
    description: '毎朝 7:30、3 つの軽い質問で 1 日を整えてくれるコーチ。回答は memories に蓄積。',
    skills: ['chat'],
    avatar: '☕',
    persona:
      'あなたは「Morning Reflection Coach」というアシスタントです。\n' +
      '\n採用目的:\n忙しい起業家が 1 日の最初に「方向感覚」を取り戻せるよう、軽い 3 問だけを投げかける。\n' +
      '\n業務内容:\n- 質問は: ① 今日の最重要 1 タスク ② 今日避けたい誘惑 ③ 1 日の最後に感謝したい想定の理由\n- ユーザーが答えたら、それを memories に保存して次の日参照\n- 重圧をかけない。失敗を裁かない。' ,
    schedule: { kind:'daily', hour:7, minute:30, prompt:'今日の朝のリフレクション質問を投げかけて。', deliver:'chat', label:'Morning Reflection' },
    suggestedIntegrations: [],
  },
];
function _findTemplate(id){ return TEMPLATES.find(t => t.id === id) || null; }

/* ── Creator revenue helpers (#5) ───────────────────────────── */
const PURCHASE_SHARE_RATE = 0.70;  // 70% of upfront purchase price → creator
const USAGE_SHARE_RATE    = 0.10;  // 10% of chat usage cost      → creator
const REVENUE_SHARE_RATE  = USAGE_SHARE_RATE; // legacy alias for chat usage callsites
const PENDING_DAYS = 7;
const MIN_PRICE_JPY = 100;         // ¥100 minimum for paid listings (Stripe min ¥50, leave buffer)
const MAX_PRICE_JPY = 100000;      // ¥100,000 cap to prevent typos / abuse
function _r3(n){ return Math.round(n*1000)/1000; }

/** Move any confirmed pending revenue into available. Mutates user. */
function reconcilePending(user){
  if(!user || !Array.isArray(user.revenue_history)) return;
  const now = Date.now();
  let movedJpy = 0;
  for(const r of user.revenue_history){
    if(r.status==='pending' && r.confirms_at && new Date(r.confirms_at).getTime() <= now){
      r.status = 'confirmed';
      r.confirmed_at = new Date().toISOString();
      movedJpy = _r3(movedJpy + (r.share_jpy||0));
    }
  }
  if(movedJpy > 0){
    user.balance_jpy_pending  = _r3((user.balance_jpy_pending||0)  - movedJpy);
    user.balance_jpy_available= _r3((user.balance_jpy_available||0)+ movedJpy);
    if(user.balance_jpy_pending < 0) user.balance_jpy_pending = 0;
  }
}

/** Credit a creator for a buyer's chat. Saves the creator. */
async function creditCreatorRevenue(creatorUserId, meta){
  if(!creatorUserId || !meta || !(meta.cost_jpy>0)) return;
  if(creatorUserId === meta.buyer_user_id) return; // shouldn't happen, defensive
  const creator = await DB.findBy('id', creatorUserId);
  if(!creator) return;
  const share = _r3(meta.cost_jpy * REVENUE_SHARE_RATE);
  if(share <= 0) return;
  creator.balance_jpy_pending = _r3((creator.balance_jpy_pending||0) + share);
  creator.revenue_history = creator.revenue_history || [];
  creator.revenue_history.push({
    date: new Date().toISOString(),
    listing_id: meta.listing_id,
    agent_name: meta.agent_name,
    buyer_user_id: meta.buyer_user_id,
    cost_jpy: meta.cost_jpy,
    share_jpy: share,
    status: 'pending',
    confirms_at: new Date(Date.now() + PENDING_DAYS*86400000).toISOString(),
  });
  if(creator.revenue_history.length>2000) creator.revenue_history = creator.revenue_history.slice(-2000);
  await DB.save(creator);
}

// ── HTTPS REQUEST ─────────────────────────────────────────────
function httpsReq(method,hostname,pathname,headers,body,opts){
  return new Promise((resolve,reject)=>{
    const pay=body?(typeof body==='string'?body:JSON.stringify(body)):null;
    const h={...headers};
    if(pay)h['Content-Length']=Buffer.byteLength(pay);
    const timeoutMs = (opts && opts.timeout) || 50000; // 50s default — under Render's 100s edge cap
    const req=https.request({hostname,path:pathname,method,headers:h,timeout:timeoutMs},r=>{
      // CRITICAL: setEncoding('utf8') makes Node buffer incomplete multi-byte
      // sequences across data chunks. Without it, "d += chunk" can split a
      // 3-byte Japanese char like ド between two chunks, producing replacement
      // characters in the output.
      r.setEncoding('utf8');
      let d='';r.on('data',c=>d+=c);
      r.on('end',()=>{try{resolve({s:r.statusCode,d:JSON.parse(d)});}catch{resolve({s:r.statusCode,d});}});
    });
    req.on('error',reject);
    req.on('timeout',()=>{ try{req.destroy(new Error('upstream timeout '+timeoutMs+'ms'));}catch(e){} reject(new Error('upstream timeout '+timeoutMs+'ms')); });
    if(pay)req.write(pay);req.end();
  });
}

// ── URL fetch helper (for chat URL ingest) ───────────────────
// Streams up to MAX_BYTES, follows up to 5 redirects, handles http+https,
// rejects private/loopback hosts to avoid SSRF.
function _isPrivateHost(host) {
  const h = (host || '').toLowerCase();
  if (h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0' || h === '::1') return true;
  // Private IP ranges
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true; // link-local (cloud metadata)
  if (/^fc[0-9a-f]{2}:/i.test(h) || /^fd[0-9a-f]{2}:/i.test(h)) return true; // ipv6 ULA
  return false;
}
function fetchUrlText(targetUrl, opts = {}) {
  const MAX_BYTES = opts.maxBytes || 2 * 1024 * 1024; // 2 MB hard cap
  const TIMEOUT = opts.timeout || 12000;
  const MAX_REDIRECTS = 5;

  return new Promise((resolve, reject) => {
    function step(currentUrl, redirectsLeft) {
      let parsed;
      try { parsed = new URL(currentUrl); } catch (e) { return reject(new Error('Invalid URL')); }
      if (!/^https?:$/.test(parsed.protocol)) return reject(new Error('http(s) URLs only'));
      if (_isPrivateHost(parsed.hostname)) return reject(new Error('Private/loopback hosts are not allowed'));

      const lib = parsed.protocol === 'https:' ? https : http;
      const req = lib.get({
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + parsed.search,
        timeout: TIMEOUT,
        headers: {
          // Real Chrome UA — many sites (TikTok, Instagram, X, Cloudflare-protected)
          // serve placeholder / blocked pages to anything self-identifying as a bot.
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'identity', // no gzip — keeps parsing simple
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Upgrade-Insecure-Requests': '1',
        },
      }, r => {
        // Redirect handling
        if ([301, 302, 303, 307, 308].includes(r.statusCode) && r.headers.location) {
          if (redirectsLeft <= 0) { r.destroy(); return reject(new Error('Too many redirects')); }
          const next = new URL(r.headers.location, currentUrl).toString();
          r.destroy();
          return step(next, redirectsLeft - 1);
        }
        if (r.statusCode >= 400) { r.destroy(); return reject(new Error('HTTP ' + r.statusCode)); }

        const ct = (r.headers['content-type'] || '').toLowerCase();
        const buf = [];
        let len = 0;
        let aborted = false;
        r.on('data', chunk => {
          if (aborted) return;
          len += chunk.length;
          if (len > MAX_BYTES) { aborted = true; r.destroy(); return reject(new Error('Response too large (>2MB)')); }
          buf.push(chunk);
        });
        r.on('end', () => {
          if (aborted) return;
          const raw = Buffer.concat(buf).toString('utf8');
          // Title extraction
          let title = '';
          const tm = raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
          if (tm) title = tm[1].replace(/\s+/g, ' ').trim();

          // Open Graph / Twitter Card meta — works for SPAs (TikTok, Instagram,
          // X, YouTube, etc.) that render body content via JS but expose preview
          // metadata in <head>.
          const meta = (prop) => {
            const re = new RegExp('<meta[^>]+(?:property|name)=["\']' + prop + '["\'][^>]+content=["\']([^"\']+)["\']','i');
            const m = raw.match(re);
            if (m) return m[1].trim();
            const re2 = new RegExp('<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']' + prop + '["\']','i');
            const m2 = raw.match(re2);
            return m2 ? m2[1].trim() : '';
          };
          const og = {
            title: meta('og:title') || meta('twitter:title'),
            description: meta('og:description') || meta('twitter:description') || meta('description'),
            site_name: meta('og:site_name'),
            image: meta('og:image') || meta('twitter:image'),
            type: meta('og:type'),
            url: meta('og:url') || currentUrl,
          };
          if (og.title && og.title.length > title.length) title = og.title;

          // SPA structured data: JSON-LD + Next.js / TikTok / etc. embedded JSON
          let structured = '';
          // 1) JSON-LD blocks
          const jsonLds = raw.match(/<script[^>]+type=["\']application\/ld\+json["\'][^>]*>([\s\S]*?)<\/script>/gi) || [];
          for (const block of jsonLds.slice(0, 4)) {
            const m = block.match(/>([\s\S]*?)<\/script>/);
            if (m) {
              try {
                const data = JSON.parse(m[1].trim());
                structured += '\n[JSON-LD] ' + JSON.stringify(data).slice(0, 4000);
              } catch (e) {/* skip */}
            }
          }
          // 2) TikTok-specific universal data
          const tk = raw.match(/<script[^>]+id=["\']__UNIVERSAL_DATA_FOR_REHYDRATION__["\'][^>]*>([\s\S]*?)<\/script>/i);
          if (tk) {
            try {
              const data = JSON.parse(tk[1]);
              const ds = (data && data.__DEFAULT_SCOPE__) || {};
              const userDetail = ds['webapp.user-detail'];
              if (userDetail && userDetail.userInfo) {
                const ui = userDetail.userInfo;
                structured += '\n[TikTok UserInfo] ' + JSON.stringify({
                  user: ui.user,
                  stats: ui.stats,
                  shareMeta: ui.shareMeta,
                }).slice(0, 4000);
              }
              const videoList = ds['webapp.video-detail'] || ds['webapp.user-post'];
              if (videoList) {
                structured += '\n[TikTok Posts] ' + JSON.stringify(videoList).slice(0, 4000);
              }
            } catch (e) { /* skip */ }
          }
          // 3) Next.js __NEXT_DATA__
          const nx = raw.match(/<script[^>]+id=["\']__NEXT_DATA__["\'][^>]*>([\s\S]*?)<\/script>/i);
          if (nx && !structured.includes('[Next.js]')) {
            try {
              const data = JSON.parse(nx[1]);
              const props = (data && data.props) || {};
              const slim = JSON.stringify(props.pageProps || props).slice(0, 4000);
              if (slim) structured += '\n[Next.js] ' + slim;
            } catch (e) {/* skip */}
          }

          // Strip HTML if html-ish; otherwise keep raw
          let text = raw;
          if (ct.includes('html') || /<\/?(html|body|div|p|h[1-6])\b/i.test(raw.slice(0, 4000))) {
            text = raw
              .replace(/<script[\s\S]*?<\/script>/gi, ' ')
              .replace(/<style[\s\S]*?<\/style>/gi, ' ')
              .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
              .replace(/<!--[\s\S]*?-->/g, ' ')
              .replace(/<[^>]+>/g, ' ')
              .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
              .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
              .replace(/[ \t]+/g, ' ')
              .replace(/\n[ \t]+/g, '\n')
              .replace(/\n{3,}/g, '\n\n')
              .trim();
          }

          // Build a header preamble that highlights OG meta + structured data
          // before the (often sparse for SPAs) body text. The AI sees this
          // structured info first.
          const preamble = [];
          if (og.site_name) preamble.push('Site: ' + og.site_name);
          if (og.type) preamble.push('Type: ' + og.type);
          if (og.title) preamble.push('Title: ' + og.title);
          if (og.description) preamble.push('Description: ' + og.description);
          if (og.image) preamble.push('Image: ' + og.image);
          const header = preamble.length ? preamble.join('\n') + '\n\n' : '';
          const structuredBlock = structured ? '--- Structured Data ---' + structured + '\n\n' : '';
          const bodyBlock = text ? '--- Page Body ---\n' + text : '';
          let finalText = (header + structuredBlock + bodyBlock).trim() || text || raw.slice(0, 2000);

          // Hard text cap (post-strip)
          const MAX_TEXT = 60000;
          let truncated = false;
          if (finalText.length > MAX_TEXT) { finalText = finalText.slice(0, MAX_TEXT); truncated = true; }
          resolve({
            url: currentUrl,
            title: title || og.title || '',
            text: finalText,
            content_type: ct,
            truncated,
            og,
          });
        });
        r.on('error', err => reject(err));
      });
      req.on('timeout', () => { try { req.destroy(new Error('Timeout')); } catch (e) {} reject(new Error('Request timeout')); });
      req.on('error', err => reject(err));
    }
    step(targetUrl, MAX_REDIRECTS);
  });
}

// ── IMAGE GENERATION (Replicate proxy, env-gated) ─────────────
// Gated behind REPLICATE_API_TOKEN (https://replicate.com/account/api-tokens).
// When unset, returns a placeholder + clear "not configured" error to UI.
async function generateImage(prompt, opts){
  if(!process.env.REPLICATE_API_TOKEN){
    throw new Error('not_configured: REPLICATE_API_TOKEN not set');
  }
  // Default to a fast SDXL Lightning model. Override via env if needed.
  const modelVersion = process.env.REPLICATE_MODEL_VERSION
    || '727e49a643e999d602a896c774a0658ffefea21465756a6ce24b7ea4165eba6a'; // SDXL
  const r = await httpsReq('POST', 'api.replicate.com', '/v1/predictions',
    {'Authorization':'Token '+process.env.REPLICATE_API_TOKEN, 'Content-Type':'application/json'},
    {version: modelVersion, input: {prompt: String(prompt||'').slice(0, 500), num_outputs: 1, ...(opts||{})}});
  if(r.s >= 400) throw new Error('Replicate ' + r.s + ': ' + JSON.stringify(r.d).slice(0,200));
  // Poll for completion (Replicate is async)
  const id = r.d && r.d.id;
  if(!id) throw new Error('No prediction id returned');
  for(let i=0;i<60;i++){ // up to 60 seconds
    await new Promise(rs => setTimeout(rs, 1000));
    const p = await httpsReq('GET', 'api.replicate.com', '/v1/predictions/' + id,
      {'Authorization':'Token '+process.env.REPLICATE_API_TOKEN}, null);
    if(p.s >= 400) throw new Error('Replicate poll ' + p.s);
    const status = p.d && p.d.status;
    if(status === 'succeeded'){
      const urls = (p.d.output || []).filter(u => typeof u === 'string');
      return { urls, model: modelVersion };
    }
    if(status === 'failed' || status === 'canceled'){
      throw new Error('Generation failed: ' + (p.d.error || status));
    }
  }
  throw new Error('Generation timed out');
}

// ── VIDEO GENERATION stub (would use Sora/Runway when available) ──
async function generateVideo(prompt){
  // TODO: integrate when Sora API GA / Runway API key is set
  if(!process.env.RUNWAY_API_TOKEN){
    throw new Error('not_configured: Video generation requires RUNWAY_API_TOKEN');
  }
  throw new Error('Video generation provider not yet wired up');
}

// ── DOCUMENT GENERATION stub (Word/PDF/Slides via libraries) ─────
// TODO: needs `docx` and/or `pdf-lib` deps. For now returns a clear stub.
async function generateDocument(format, title, content){
  throw new Error('not_configured: Document generation pending (docx/pdf-lib install)');
}

// ── CALENDAR INTEGRATION stub (Google Calendar) ──────────────────
// TODO: requires Google OAuth scope `https://www.googleapis.com/auth/calendar.events`
async function createCalendarEvent(user, eventInput){
  throw new Error('not_configured: Google Calendar scope not yet provisioned');
}

// ── PUSH NOTIFICATIONS (FCM legacy + APNs proxied via FCM) ───
// Send a notification to one device token. Gated behind FCM_SERVER_KEY:
// when not configured (dev / before Firebase setup), logs and returns OK.
// Production: set FCM_SERVER_KEY in Render env to the legacy server key
// from Firebase Console → Project Settings → Cloud Messaging.
async function sendPushFCM(token, payload){
  if(!process.env.FCM_SERVER_KEY){
    if(process.env.PUSH_DEBUG === '1'){
      console.log('[push] would send:', JSON.stringify({token: (token||'').slice(0,16)+'…', payload}).slice(0, 300));
    }
    return { ok: false, reason: 'fcm_not_configured' };
  }
  try {
    const body = {
      to: token,
      notification: {
        title: payload.title || 'MY AI Agent',
        body:  payload.body  || '',
        sound: 'default',
        badge: payload.badge || 1,
      },
      data: payload.data || {},
      priority: 'high',
    };
    const r = await httpsReq('POST', 'fcm.googleapis.com', '/fcm/send', {
      'Authorization': 'key=' + process.env.FCM_SERVER_KEY,
      'Content-Type': 'application/json',
    }, body);
    return { ok: r.s < 400, status: r.s };
  } catch(e){
    console.warn('[push] FCM send failed:', e.message);
    return { ok: false, error: e.message };
  }
}

// Notify group members of a new message. Respects per-user notify_pref:
//   'all'      → always send
//   'mentions' → only when @AI / @name was used
//   'mute'     → never send
// Skips the sender's own devices. Fire-and-forget.
async function notifyGroupMembers(host, agent, opts){
  try {
    if(!agent || !agent.is_group || !Array.isArray(agent.members)) return;
    const senderUid   = opts.sender_user_id || '';
    const senderName  = opts.sender_name || 'メンバー';
    const messageText = (opts.text || '').toString().slice(0, 200);
    const isAIReply   = !!opts.is_ai_reply;
    const isMention   = !!opts.is_mention;

    const targets = agent.members.filter(m => {
      if(!m || !m.user_id) return false;
      // Don't notify the sender (unless this is an AI reply — sender wants to know AI replied)
      if(m.user_id === senderUid && !isAIReply) return false;
      const pref = m.notify_pref || 'all';
      if(pref === 'mute') return false;
      if(pref === 'mentions' && !isMention && !isAIReply) return false;
      return true;
    });
    if(!targets.length) return;

    const title = agent.name || 'グループ';
    const body  = isAIReply
      ? (agent.name + ': ' + messageText)
      : (senderName + ': ' + messageText);

    for(const m of targets){
      const member = await DB.findBy('id', m.user_id);
      if(!member) continue;
      const devices = Array.isArray(member.mobile_devices) ? member.mobile_devices : [];
      if(!devices.length) continue;
      const payload = {
        title, body,
        data: {
          type: 'group_message',
          agent_id: agent.id,
          host_id: host.id,
          sender_user_id: senderUid,
          is_ai_reply: isAIReply ? '1' : '0',
        },
      };
      for(const d of devices){
        await sendPushFCM(d.token, payload).catch(()=>{});
      }
    }
  } catch(e){
    console.warn('[push] notifyGroupMembers error:', e.message);
  }
}

// ── EMAIL (Resend) ────────────────────────────────────────────
// fromName: optional human-friendly display name. Defaults to "MY AI Agent"
// for system mails (verify, reset, daily report). The send_email tool passes
// the agent's name so the recipient sees who actually composed the message.
// Strip control + quote chars from the display name — RFC 5322 doesn't like
// them in an unquoted addr-spec.
function _safeFromName(name){
  return String(name || 'MY AI Agent')
    .replace(/["<>\\\r\n\t]+/g, '')
    .trim().slice(0, 60) || 'MY AI Agent';
}
async function sendEmail(to,subject,html,opts){
  if(!RESEND_KEY){console.log(`[DEV EMAIL] To:${to}\nSubject:${subject}\n${html.replace(/<[^>]+>/g,'')}\n`);return;}
  const displayName = _safeFromName(opts && opts.fromName);
  await httpsReq('POST','api.resend.com','/emails',
    {'Content-Type':'application/json','Authorization':`Bearer ${RESEND_KEY}`},
    {from:`${displayName} <${FROM_EMAIL}>`,to,subject,html});
}

async function sendVerifyEmail(user){
  const link=`${APP_URL}/api/auth/verify?token=${user.verify_token}`;
  await sendEmail(user.email,'【MY AI Agent】メールアドレスの確認',
    `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
      <h2 style="color:#c8ff57;">メールアドレスの確認</h2>
      <p>${user.name} 様、ご登録ありがとうございます。</p>
      <p>以下のボタンをクリックして、メールアドレスを確認してください。</p>
      <a href="${link}" style="display:inline-block;margin:24px 0;padding:14px 32px;background:#c8ff57;color:#04040a;border-radius:10px;font-weight:700;text-decoration:none;">メールを確認する</a>
      <p style="color:#888;font-size:13px;">このリンクは24時間有効です。心当たりがない場合は無視してください。</p>
    </div>`);
}

async function sendResetEmail(user,token){
  const link=`${APP_URL}/auth.html?reset=${token}`;
  await sendEmail(user.email,'【MY AI Agent】パスワードリセット',
    `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
      <h2 style="color:#c8ff57;">パスワードリセット</h2>
      <p>${user.name} 様</p>
      <p>以下のボタンをクリックして、新しいパスワードを設定してください。</p>
      <a href="${link}" style="display:inline-block;margin:24px 0;padding:14px 32px;background:#c8ff57;color:#04040a;border-radius:10px;font-weight:700;text-decoration:none;">パスワードをリセット</a>
      <p style="color:#888;font-size:13px;">このリンクは1時間有効です。心当たりがない場合は無視してください。</p>
    </div>`);
}

// ── LIGHTWEIGHT WEB SEARCH ────────────────────────────────────
// Used by /api/search slash-command. Brave first (high quality), DDG fallback.
async function braveSearch(query){
  if(!BRAVE_KEY) throw new Error('not_configured');
  const r = await httpsReq('GET','api.search.brave.com',
    '/res/v1/web/search?q='+encodeURIComponent(query)+'&count=8&country=JP&search_lang=jp',
    {'X-Subscription-Token':BRAVE_KEY,'Accept':'application/json'},
    null);
  if(r.s>=400) throw new Error(r.d?.message||('brave_'+r.s));
  return ((r.d&&r.d.web&&r.d.web.results)||[]).map(x=>({
    title: (x.title||'').slice(0,200),
    url: x.url||'',
    snippet: (x.description||'').replace(/<[^>]+>/g,'').slice(0,300),
  }));
}
function ddgSearch(query){
  return new Promise((resolve)=>{
    const path = '/html/?q='+encodeURIComponent(query);
    const req = https.request({
      hostname:'html.duckduckgo.com', path, method:'GET',
      headers:{'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/537.36','Accept':'text/html'},
    }, (r)=>{
      let buf=''; r.setEncoding('utf8');
      r.on('data', c=>buf+=c);
      r.on('end', ()=>{
        const results = [];
        const re = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
        let m;
        while((m = re.exec(buf)) && results.length < 8){
          // DDG wraps the real URL in a redirect; extract uddg= param
          let url = m[1];
          try{
            const u = new URL(url, 'https://duckduckgo.com');
            const real = u.searchParams.get('uddg');
            if(real) url = real;
          }catch(e){}
          results.push({
            title: m[2].replace(/<[^>]+>/g,'').trim().slice(0,200),
            url,
            snippet: m[3].replace(/<[^>]+>/g,'').trim().slice(0,300),
          });
        }
        resolve(results);
      });
      r.on('error', ()=>resolve([]));
    });
    req.on('error', ()=>resolve([]));
    req.setTimeout(5000, ()=>{ try{req.destroy();}catch(e){} resolve([]); });
    req.end();
  });
}

// ── ANTHROPIC ─────────────────────────────────────────────────

/**
 * Wrap a string `system` prompt as a content block array with cache_control:
 * ephemeral. Anthropic caches the marked block for ~5 min — subsequent calls
 * within that window read it from cache, cutting input tokens by ~90% on the
 * cached portion and latency by ~70%. The persona is the same per agent so
 * caching pays off after the first message.
 */
function _systemBlocks(system){
  if(Array.isArray(system)) return system;
  const text = String(system||'');
  if(text.length < 200) return text; // not worth caching tiny prompts
  return [{ type:'text', text, cache_control:{ type:'ephemeral' } }];
}

// Mark the LAST tool with cache_control so Anthropic caches the full tool spec.
// Tools are static across turns, so this saves a lot of input tokens per call.
function _toolsWithCache(tools){
  if(!Array.isArray(tools) || tools.length===0) return tools;
  // cache_control on server-managed tools (web_search, web_fetch, etc.) may
  // be rejected. Find the last *user-defined* tool (one with input_schema)
  // and attach cache_control there.
  let lastUserToolIdx = -1;
  for(let i=tools.length-1; i>=0; i--){
    if(tools[i] && tools[i].input_schema){ lastUserToolIdx = i; break; }
  }
  if(lastUserToolIdx === -1) return tools;
  return tools.map((t,i)=> i === lastUserToolIdx
    ? { ...t, cache_control:{ type:'ephemeral' } }
    : t);
}

/**
 * Trim history messages before sending to AI:
 * - drop image / document blocks from all but the latest user turn (huge token saver)
 * - cap any single text-string message at MAX_CHARS so a paste-bomb doesn't
 *   inflate the next request
 */
// Per-message char cap before "…[省略]" truncation. Was 2000 which clipped
// even a small code paste mid-line — Anthropic context budget can easily
// absorb 8K per message at standard model prices. Bumped to 8000.
const HIST_MAX_CHARS = 8000;
// Turns sent to AI per call. Was 12 (≈ 6 user-AI pairs) which often forgot
// the original topic in extended planning chats. 30 is still well within
// Anthropic's 200K context.
const HIST_MAX_MSGS  = 30;
// Cap history length. Only safe for plain-chat paths (no tool_use/result pairing risk).
function _capHistory(messages){
  return messages.length > HIST_MAX_MSGS
    ? messages.slice(messages.length - HIST_MAX_MSGS)
    : messages;
}
function _trimHistory(messages){
  return messages.map((m, i) => {
    const isLast = i === messages.length - 1;
    if(typeof m.content === 'string'){
      // Defensive: Anthropic rejects any message with empty content
      // ("messages.N: user messages must have non-empty content"). This
      // happens when a user sent attachments without typing text, or when
      // a regenerate / edit path produced an empty entry. Replace with a
      // single-char placeholder so the API call succeeds.
      let c = m.content == null ? '' : m.content;
      if(c.length === 0 || !c.trim()){
        c = m.role === 'user' ? '(添付のみ)' : '(empty)';
      } else if(c.length > HIST_MAX_CHARS){
        c = c.slice(0, HIST_MAX_CHARS - 10) + '…[省略]';
      }
      return { role:m.role, content:c };
    }
    if(Array.isArray(m.content)){
      const filtered = isLast
        ? m.content
        : m.content.filter(b => b.type !== 'image' && b.type !== 'document');
      if(filtered.length === 0) return { role:m.role, content:'(画像/PDF省略)' };
      const trimmed = filtered.map(b => {
        if(b.type === 'text' && typeof b.text === 'string' && b.text.length > HIST_MAX_CHARS){
          return { ...b, text: b.text.slice(0, HIST_MAX_CHARS - 10) + '…[省略]' };
        }
        return b;
      });
      // Catch fully-empty text blocks too.
      const allEmpty = trimmed.every(b =>
        (b.type === 'text' && (!b.text || !b.text.trim())) ||
        (b.type === 'tool_result' && (!b.content || (Array.isArray(b.content) && b.content.length===0)))
      );
      if(allEmpty){ return { role:m.role, content: m.role === 'user' ? '(添付のみ)' : '(empty)' }; }
      return { role:m.role, content:trimmed };
    }
    return m;
  });
}

// ── ROLLING CONVERSATION SUMMARY ──────────────────────────────
// Once an agent.history exceeds SUMMARY_TRIGGER turns, fold the oldest
// SUMMARY_BATCH non-summary turns into one synthesized assistant message
// with _summary:true. The archived raw turns move to agent.history_archive
// for "全履歴を見る" UI access. Cuts input tokens by ~60-70% in long chats
// and prevents the "途中で記憶が飛ぶ" effect we kept hearing about.
const SUMMARY_TRIGGER = 40;
const SUMMARY_BATCH   = 20;
async function _summarizeOldHistory(agent){
  try {
    if(!agent || !Array.isArray(agent.history)) return false;
    const nonSummary = agent.history.filter(m => m && !m._summary);
    if(nonSummary.length < SUMMARY_TRIGGER) return false;
    // Find the existing summary (if any) and the slice to fold.
    const existingSummary = agent.history.find(m => m && m._summary);
    const oldSummaryText  = (existingSummary && existingSummary.content) || '';
    const toFold = nonSummary.slice(0, SUMMARY_BATCH);
    if(toFold.length === 0) return false;
    // Render the slice as a transcript for the summarizer.
    const transcript = toFold.map(m => {
      const role = m.role === 'assistant' ? 'AI' : (m.user_name || 'USER');
      let body = '';
      if(typeof m.content === 'string') body = m.content;
      else if(Array.isArray(m.content)) body = m.content.filter(b => b && b.type==='text').map(b => b.text).join(' ');
      return role + ': ' + (body || '').slice(0, 1500);
    }).join('\n');
    const prompt = (oldSummaryText
      ? `これまでの要約:\n${oldSummaryText}\n\n` : '')
      + `追加で発生した会話 (${toFold.length} 件):\n${transcript}\n\n`
      + `上記を踏まえ、ユーザーの目的・主要な決定事項・未解決の論点・固有名詞 (人名・サービス名・URL・数値) を中心に、`
      + `次の会話で AI が参照できる「これまでの経緯」を 400 字以内で日本語で要約してください。`
      + `箇条書きではなく自然な文で。冗長な前置きや「以下に要約します」は不要。`;
    // Use the cheapest fast model available. Prefer Gemini Flash, else Haiku.
    const summarizerAlias = GEMINI_KEY ? 'gemini-flash' : 'haiku';
    const info = _resolveModelInfo(summarizerAlias);
    let summaryText = '';
    if(info.provider === 'gemini'){
      const r = await _callGemini([{ role:'user', content: prompt }], '', info);
      summaryText = (r && r.content && r.content[0] && r.content[0].text || '').trim();
    } else {
      // Anthropic fallback
      const headers = {'Content-Type':'application/json','x-api-key':ANTHROPIC,'anthropic-version':'2023-06-01'};
      const r = await httpsReq('POST','api.anthropic.com','/v1/messages', headers,
        { model: info.modelId, max_tokens: 800, messages: [{role:'user', content: prompt}] },
        { timeout: 30000 });
      if(r.s === 200){
        summaryText = (r.d.content || []).filter(b => b.type==='text').map(b => b.text).join('').trim();
      }
    }
    if(!summaryText || summaryText.length < 30){
      console.warn('[summary] generation failed or too short, abort');
      return false;
    }
    // Archive the raw folded turns.
    agent.history_archive = Array.isArray(agent.history_archive) ? agent.history_archive : [];
    agent.history_archive.push(...toFold);
    if(agent.history_archive.length > 2000){
      agent.history_archive = agent.history_archive.slice(-2000);
    }
    // Replace folded turns + old summary with a single new summary message.
    const folded = toFold.length;
    const newSummary = {
      role: 'assistant',
      _summary: true,
      content: summaryText,
      time: new Date().toLocaleTimeString('en-GB', { hour12:false, hour:'2-digit', minute:'2-digit' }),
      _summary_count: ((existingSummary && existingSummary._summary_count) || 0) + folded,
      _summary_updated_at: new Date().toISOString(),
    };
    // Rebuild history: [summary, ...non-summary non-folded].
    const remaining = nonSummary.slice(folded); // keep the newer half
    agent.history = [newSummary, ...remaining];
    console.log('[summary] folded ' + folded + ' turns into summary for agent=' + (agent.id||'?'));
    return true;
  } catch(e){
    console.warn('[summary] error:', e.message);
    return false;
  }
}

// ── AGENT INTELLIGENCE: memory · KPI · playbook · tasks ───────
// One unified per-agent context layer. Four shapes live on the agent:
//
//   agent.memories     = [{id, text, source, created_at, last_used_at, score}]
//   agent.kpis         = [{id, name, target, current, unit, history:[{at,value}]}]
//   agent.playbook     = [{id, pattern, context, success_count, last_used_at}]
//   agent.open_tasks   = [{id, title, status, progress_pct, notes, started_at}]
//
// After each chat turn we run ONE Gemini Flash call that extracts
// updates for all four dimensions from the latest exchange — way cheaper
// than running 4 separate "what should we remember" calls. Failures are
// silent: this is enrichment, not correctness-critical.

function _agentMemoryScore(memText, query){
  // CJK-friendly bigram overlap (no embeddings required). Same approach
  // as the KB retriever in `_kbHits`. Returns roughly the number of
  // shared bigrams + a recency boost (added by the caller).
  if(!memText || !query) return 0;
  const ngrams = (s) => {
    const out = new Set();
    const t = String(s||'').toLowerCase().replace(/\s+/g,'');
    for(let i=0;i<t.length-1;i++) out.add(t.slice(i,i+2));
    return out;
  };
  const a = ngrams(memText), b = ngrams(query);
  let n = 0;
  for(const g of a) if(b.has(g)) n++;
  return n;
}

function _injectAgentContext(agent, opts){
  // Build a compact "現在の文脈" block to append to the agent's system
  // prompt. Pulls top-N relevant memories + active KPIs + open tasks +
  // 2-3 relevant playbook entries. Capped to ~800 chars to keep the
  // prompt budget tight.
  if(!agent) return '';
  const userQuery = String((opts && opts.userQuery) || '').slice(0, 2000);
  const lines = [];
  // 1) Open tasks first — most actionable.
  const tasks = Array.isArray(agent.open_tasks) ? agent.open_tasks.filter(t => t && t.status !== 'done') : [];
  if(tasks.length){
    lines.push('【進行中の案件】');
    tasks.slice(0, 3).forEach(t => {
      const pct = (typeof t.progress_pct === 'number') ? ' (' + t.progress_pct + '%)' : '';
      lines.push(' • ' + (t.title || 'untitled') + pct + (t.notes ? ' — ' + String(t.notes).slice(0,80) : ''));
    });
  }
  // 2) KPIs — keep numerical orientation.
  const kpis = Array.isArray(agent.kpis) ? agent.kpis : [];
  if(kpis.length){
    lines.push('【今期の目標 (応答は常にこれに沿わせる)】');
    kpis.slice(0, 4).forEach(k => {
      const cur = (k.current != null ? k.current : '?');
      const tgt = (k.target  != null ? k.target  : '?');
      lines.push(' • ' + (k.name || '?') + ': ' + cur + ' / ' + tgt + (k.unit ? ' ' + k.unit : ''));
    });
  }
  // 3) Memories — vector cosine if embedding available, otherwise bigram.
  // The chat handler can pre-compute the user-query embedding (in parallel
  // with the KB-query embedding) and pass it as opts.queryEmbedding to
  // avoid an extra OpenAI round trip per turn.
  const mems = Array.isArray(agent.memories) ? agent.memories : [];
  const qEmb = (opts && Array.isArray(opts.queryEmbedding)) ? opts.queryEmbedding : null;
  if(mems.length && userQuery){
    let scored;
    const hasMemEmb = qEmb && mems.some(m => Array.isArray(m.embedding));
    if(hasMemEmb){
      scored = mems.map(m => {
        const cos = Array.isArray(m.embedding) ? _cosine(qEmb, m.embedding) : 0;
        const recBoost = (m.created_at && (Date.now() - new Date(m.created_at).getTime()) < 30*86400*1000) ? 0.05 : 0;
        return { m, score: cos + recBoost + (m.pinned ? 0.3 : 0) };
      }).filter(x => x.score > 0.30).sort((a,b) => b.score - a.score).slice(0, 5);
    } else {
      scored = mems.map(m => ({
        m,
        score: _agentMemoryScore(m.text, userQuery)
          + (m.created_at && (Date.now() - new Date(m.created_at).getTime()) < 30*86400*1000 ? 0.5 : 0)
          + (m.pinned ? 5 : 0),
      })).filter(x => x.score >= 1).sort((a,b) => b.score - a.score).slice(0, 5);
    }
    if(scored.length){
      lines.push('【ユーザーについての記憶】');
      scored.forEach(x => lines.push(' • ' + String(x.m.text||'').slice(0, 100)));
    }
  } else if(mems.length){
    const pinned = mems.filter(m => m && m.pinned).slice(0, 2);
    const recent = mems.filter(m => !m.pinned).slice(-2);
    const picks = [...pinned, ...recent].slice(0, 3);
    if(picks.length){
      lines.push('【ユーザーについての記憶】');
      picks.forEach(p => lines.push(' • ' + String(p.text||'').slice(0, 100)));
    }
  }
  // 4) Playbook — same vector-if-available pattern as memories.
  const plays = Array.isArray(agent.playbook) ? agent.playbook : [];
  if(plays.length && userQuery){
    let scored;
    const hasPbEmb = qEmb && plays.some(p => Array.isArray(p.embedding));
    if(hasPbEmb){
      scored = plays.map(p => {
        const cos = Array.isArray(p.embedding) ? _cosine(qEmb, p.embedding) : 0;
        return { p, score: cos + Math.min(0.1, (p.success_count||0) * 0.02) };
      }).filter(x => x.score > 0.30).sort((a,b) => b.score - a.score).slice(0, 2);
    } else {
      scored = plays.map(p => ({
        p,
        score: _agentMemoryScore(p.context + ' ' + p.pattern, userQuery)
          + Math.min(2, (p.success_count || 0) * 0.3),
      })).filter(x => x.score >= 1).sort((a,b) => b.score - a.score).slice(0, 2);
    }
    if(scored.length){
      lines.push('【過去にうまくいったアプローチ (参考)】');
      scored.forEach(x => lines.push(' • ' + String(x.p.pattern||'').slice(0, 100)));
    }
  }
  if(lines.length === 0) return '';
  // Cap total payload. Was 1200; tightened to 600 — system prompt was bloating
  // by 1k chars on agents with rich memory, slowing TTFT on every turn.
  let out = lines.join('\n');
  if(out.length > 600) out = out.slice(0, 600) + '\n…(要約省略)';
  return '\n\n' + out;
}

async function _afterTurnExtract(agent, opts){
  // Runs ONCE after a chat turn completes. One Gemini Flash call extracts:
  //   - new_memories: 0-3 facts about the user worth remembering
  //   - task_updates: started/progressed/done items
  //   - kpi_updates : { name → current } when AI mentioned a metric
  //   - playbook    : 0-1 successful patterns to save (only when user reacted positively)
  // Cheap (< $0.001) but compounds into long-term value. Fail-silently.
  try {
    if(!agent || !opts) return false;
    const userMsg = String(opts.userMsg || '').slice(0, 1500);
    const aiReply = String(opts.aiReply || '').slice(0, 1500);
    if(!userMsg && !aiReply) return false;
    // Skip on trivial exchanges: "ok"/"ありがとう"/"yes"/emoji-only → no
    // meaningful facts to extract. Saves ~$0.0005 + a Gemini round-trip per
    // ack message. Trivial = short user msg AND short AI reply.
    const _isTrivialUser  = userMsg.length < 14 || /^[\s。、,.?!？！💯👍❤🎉🙏👀✨🚀💡🤖ok好yes是はいThank thank ありが おk 了解 わかr ack 👌]+$/iu.test(userMsg);
    const _isTrivialReply = aiReply.length < 90;
    if(_isTrivialUser && _isTrivialReply){
      return false;
    }
    const existingKpis = (Array.isArray(agent.kpis) ? agent.kpis : []).map(k => k.name).slice(0, 8).join(', ');
    const prompt = `あなたはエージェント "${agent.name || ''}" の長期記憶を整理するアシスタントです。\n\n直前のターン:\nUSER: ${userMsg}\nAI: ${aiReply}\n\n既存の KPI 名: ${existingKpis || '(なし)'}\n\n以下を JSON で返してください (該当なければ空配列 / 空オブジェクト):\n{\n  "new_memories": ["事実 1", "事実 2"],   // ユーザーの好み・事業・固有名詞・数値・NG事項のうち、将来の会話で参照に値する事実を 0-3 個。1 件 80 字以内。雑談・挨拶は無視。\n  "task_updates": [                         // タスクの新規開始 / 進捗 / 完了\n    { "title": "...", "status": "started|progress|done", "progress_pct": 0-100, "notes": "短い補足" }\n  ],\n  "kpi_updates": { "<既存KPI名>": <現在値> },  // AI または USER が KPI 数値に言及していれば\n  "playbook": [                             // ユーザーが明確にポジティブなリアクションをした場合に限り、AI のアプローチを 1 件抽出\n    { "context": "どんな状況で", "pattern": "AI はどう動いたか / どう答えたか", "success_count": 1 }\n  ]\n}\n\n注意:\n- 余計な文言、Markdown、コードブロック、説明は禁止。JSON のみ。\n- USER がネガティブ反応 / 修正要求をした場合 playbook は []。\n- 明らかな雑談 (挨拶 / 確認 / 軽い感想) は new_memories から除外。`;
    const info = _resolveModelInfo(GEMINI_KEY ? 'gemini-flash' : 'haiku');
    let raw = '';
    if(info.provider === 'gemini'){
      const r = await _callGemini([{role:'user', content: prompt}], '', info);
      raw = (r && r.content && r.content[0] && r.content[0].text || '').trim();
    } else if(ANTHROPIC){
      const r = await httpsReq('POST','api.anthropic.com','/v1/messages',
        {'Content-Type':'application/json','x-api-key':ANTHROPIC,'anthropic-version':'2023-06-01'},
        { model: info.modelId, max_tokens: 600, messages:[{role:'user', content: prompt}] },
        { timeout: 25000 });
      if(r.s === 200) raw = (r.d.content || []).filter(b => b.type==='text').map(b => b.text).join('').trim();
    }
    if(!raw) return false;
    raw = raw.replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'').trim();
    let parsed; try { parsed = JSON.parse(raw); } catch(e){ return false; }
    if(!parsed || typeof parsed !== 'object') return false;
    let dirty = false;
    // ── new_memories ──
    if(Array.isArray(parsed.new_memories) && parsed.new_memories.length){
      agent.memories = Array.isArray(agent.memories) ? agent.memories : [];
      const toAdd = [];
      for(const t of parsed.new_memories){
        const text = String(t||'').trim().slice(0, 200);
        if(text.length < 6) continue;
        const dupe = agent.memories.find(m => m && m.text && _agentMemoryScore(m.text, text) > Math.min(8, ngramSize(text) * 0.6));
        if(dupe) continue;
        toAdd.push({
          id: 'mem_'+crypto.randomBytes(4).toString('hex'),
          text,
          source: 'auto',
          pinned: false,
          created_at: new Date().toISOString(),
        });
      }
      if(toAdd.length){
        // Batch-embed new memories so retrieval can use vector similarity.
        // Falls back silently if OpenAI key missing or embed fails.
        if(OPENAI_KEY){
          try {
            const embs = await _openaiEmbeddings(toAdd.map(m => m.text));
            if(Array.isArray(embs) && embs.length === toAdd.length){
              toAdd.forEach((m,i) => { m.embedding = embs[i]; });
            }
          } catch(e){ /* fall back silently */ }
        }
        for(const m of toAdd){
          agent.memories.push(m);
          dirty = true;
        }
      }
      if(agent.memories.length > 200){
        agent.memories.sort((a,b) => (b.pinned?1:0) - (a.pinned?1:0));
        agent.memories = agent.memories.slice(0, 200);
      }
    }
    // ── task_updates ──
    if(Array.isArray(parsed.task_updates) && parsed.task_updates.length){
      agent.open_tasks = Array.isArray(agent.open_tasks) ? agent.open_tasks : [];
      for(const t of parsed.task_updates){
        if(!t || typeof t !== 'object') continue;
        const title = String(t.title||'').trim().slice(0, 100);
        if(!title) continue;
        const status = ['started','progress','done'].includes(t.status) ? t.status : 'progress';
        const pct = Math.max(0, Math.min(100, parseInt(t.progress_pct, 10) || (status === 'done' ? 100 : 50)));
        // Match an existing open task by case-insensitive title contains
        const existing = agent.open_tasks.find(x => x && x.title && (x.title.toLowerCase().includes(title.toLowerCase()) || title.toLowerCase().includes(x.title.toLowerCase())));
        if(existing){
          existing.progress_pct = pct;
          existing.notes = String(t.notes||existing.notes||'').slice(0, 200);
          existing.status = status;
          existing.last_touched_at = new Date().toISOString();
        } else {
          agent.open_tasks.push({
            id: 'tsk_'+crypto.randomBytes(4).toString('hex'),
            title,
            status,
            progress_pct: pct,
            notes: String(t.notes||'').slice(0, 200),
            started_at: new Date().toISOString(),
            last_touched_at: new Date().toISOString(),
          });
        }
        dirty = true;
      }
      // Trim done tasks older than 30 days.
      const cutoff = Date.now() - 30*86400*1000;
      agent.open_tasks = agent.open_tasks.filter(t => !(t && t.status==='done' && t.last_touched_at && new Date(t.last_touched_at).getTime() < cutoff));
      if(agent.open_tasks.length > 50) agent.open_tasks = agent.open_tasks.slice(-50);
    }
    // ── kpi_updates ──
    if(parsed.kpi_updates && typeof parsed.kpi_updates === 'object'){
      agent.kpis = Array.isArray(agent.kpis) ? agent.kpis : [];
      for(const [name, val] of Object.entries(parsed.kpi_updates)){
        const k = agent.kpis.find(x => x && x.name === name);
        if(!k) continue;
        const num = parseFloat(val);
        if(!isFinite(num)) continue;
        k.current = num;
        k.history = Array.isArray(k.history) ? k.history : [];
        k.history.push({ at: new Date().toISOString(), value: num });
        if(k.history.length > 200) k.history = k.history.slice(-200);
        k.updated_at = new Date().toISOString();
        dirty = true;
      }
    }
    // ── playbook ──
    if(Array.isArray(parsed.playbook) && parsed.playbook.length){
      agent.playbook = Array.isArray(agent.playbook) ? agent.playbook : [];
      for(const p of parsed.playbook){
        if(!p || typeof p !== 'object') continue;
        const pattern = String(p.pattern||'').trim().slice(0, 240);
        const context = String(p.context||'').trim().slice(0, 160);
        if(pattern.length < 12) continue;
        const dupe = agent.playbook.find(x => x && x.pattern && _agentMemoryScore(x.pattern, pattern) > Math.min(10, ngramSize(pattern) * 0.5));
        if(dupe){
          dupe.success_count = (dupe.success_count || 0) + 1;
          dupe.last_used_at = new Date().toISOString();
        } else {
          agent.playbook.push({
            id: 'pb_'+crypto.randomBytes(4).toString('hex'),
            context,
            pattern,
            success_count: 1,
            created_at: new Date().toISOString(),
            last_used_at: new Date().toISOString(),
          });
        }
        dirty = true;
      }
      if(agent.playbook.length > 60){
        // Drop least-used + oldest first.
        agent.playbook.sort((a,b) => (b.success_count||0) - (a.success_count||0));
        agent.playbook = agent.playbook.slice(0, 60);
      }
    }
    return dirty;
  } catch(e){
    console.warn('[after-turn] failed:', e.message);
    return false;
  }
}
function ngramSize(s){
  const t = String(s||'').toLowerCase().replace(/\s+/g,'');
  return Math.max(1, t.length - 1);
}

// ── PROACTIVE NUDGES ──────────────────────────────────────────
// "AI が自発的に言ってくる" minimal implementation. Once per day per user,
// pick one qualifying agent (some real chat history, >24h since last user
// message) and generate a short 1-2 sentence nudge. The user sees it as
// a card at the top of that agent's chat on next open. Click → injected
// as a user message and the conversation continues. Dismiss → marked
// read. This is the cheapest possible "alive feel" without any cron.
// ── KPI ALERT nudges ──────────────────────────────────────────
// Triggered before the conversational nudge in _maybeGenerateNudgeForUser.
// When any KPI dips < 80% of target and hasn't fired an alert in 7 days,
// emit a focused nudge to the owning agent. Bypasses the 22h global cooldown
// because KPI dips are time-sensitive (better one extra ping than missing it).
async function _maybeGenerateKpiAlert(user){
  try {
    if(!user || !Array.isArray(user.agents)) return false;
    const now = Date.now();
    for(const ag of user.agents){
      if(!ag || ag.is_group) continue;
      const kpis = Array.isArray(ag.kpis) ? ag.kpis : [];
      // Skip if there's an undismissed nudge already (avoid stacking).
      const nudges = Array.isArray(ag.proactive_nudges) ? ag.proactive_nudges : [];
      if(nudges.find(n => n && !n.dismissed && !n.acted)) continue;
      for(const k of kpis){
        if(!k || k.target == null || k.current == null) continue;
        const target = parseFloat(k.target);
        const current = parseFloat(k.current);
        if(!isFinite(target) || target === 0 || !isFinite(current)) continue;
        const ratio = current / target;
        if(ratio >= 0.8) continue;             // healthy — skip
        const lastAlert = k.last_alert_at ? new Date(k.last_alert_at).getTime() : 0;
        if(now - lastAlert < 7 * 86400000) continue;  // already alerted recently
        const pct = Math.round(ratio * 100);
        const text = '📉 ' + k.name + ' が目標未達: '
          + current + (k.unit||'') + ' / 目標 ' + target + (k.unit||'')
          + ' (' + pct + '%)。改善策を一緒に考えませんか?';
        ag.proactive_nudges = nudges;
        ag.proactive_nudges.push({
          id: 'nud_'+crypto.randomBytes(5).toString('hex'),
          text,
          source: 'kpi-alert',
          kpi_id: k.id,
          created_at: new Date().toISOString(),
          dismissed: false,
          acted: false,
        });
        if(ag.proactive_nudges.length > 5) ag.proactive_nudges = ag.proactive_nudges.slice(-5);
        k.last_alert_at = new Date().toISOString();
        ag.last_nudge_at = new Date().toISOString();
        user.last_nudge_global_at = new Date().toISOString();
        await DB.save(user);
        console.log('[nudge:kpi-alert] agent=' + ag.id + ' kpi=' + k.name + ' ratio=' + pct + '%');
        return true; // one per call
      }
    }
    return false;
  } catch(e){
    console.warn('[nudge:kpi-alert] failed:', e.message);
    return false;
  }
}

// ── WEEKLY DIGEST nudge ───────────────────────────────────────
// On Monday morning (JST), pick the most-active agent and generate a
// "今週のまとめ + 今週やること" digest as a proactive nudge. Fires at most
// once per ISO week per user.
async function _maybeGenerateWeeklyDigest(user){
  try {
    if(!user || !Array.isArray(user.agents)) return false;
    const now = new Date();
    // Convert to JST (UTC+9) to decide what "Monday morning" means.
    const jst = new Date(now.getTime() + 9 * 3600 * 1000);
    if(jst.getUTCDay() !== 1) return false;        // 1 = Monday
    if(jst.getUTCHours() < 7 || jst.getUTCHours() > 12) return false; // 7-12 JST window
    const last = user.last_weekly_digest_at ? new Date(user.last_weekly_digest_at).getTime() : 0;
    if(Date.now() - last < 6 * 86400000) return false;
    // Pick the agent with most history in the last 7 days.
    const activeAgents = (user.agents||[]).filter(a => a && !a.is_group && Array.isArray(a.history) && a.history.length >= 6);
    if(activeAgents.length === 0) return false;
    activeAgents.sort((a,b) => b.history.length - a.history.length);
    const ag = activeAgents[0];
    // Avoid stacking on an existing undismissed nudge.
    const nudges = Array.isArray(ag.proactive_nudges) ? ag.proactive_nudges : [];
    if(nudges.find(n => n && !n.dismissed && !n.acted)) return false;
    const recent = ag.history.slice(-20).map(m => {
      const role = m.role === 'assistant' ? ag.name : (m.user_name || 'USER');
      const body = typeof m.content === 'string' ? m.content : '';
      return role + ': ' + body.slice(0, 200);
    }).join('\n');
    const kpiBlock = (ag.kpis||[]).slice(0,4).map(k => '・' + k.name + ': ' + (k.current||'?') + '/' + (k.target||'?')+(k.unit||'')).join('\n');
    const prompt = '今週のまとめを 1 つの「つぶやき」として 100 字以内で生成してください。形式: 「先週は X、Y。今週は Z をやりませんか?」\n\n直近の会話:\n' + recent + '\n\nKPI:\n' + (kpiBlock || '(なし)') + '\n\n出力は本文のみ。';
    const info = _resolveModelInfo(GEMINI_KEY ? 'gemini-flash' : 'haiku');
    let text = '';
    if(info.provider === 'gemini'){
      const r = await _callGemini([{role:'user', content: prompt}], '', info);
      text = (r && r.content && r.content[0] && r.content[0].text || '').trim();
    } else if(ANTHROPIC){
      const r = await httpsReq('POST','api.anthropic.com','/v1/messages',
        {'Content-Type':'application/json','x-api-key':ANTHROPIC,'anthropic-version':'2023-06-01'},
        { model: info.modelId, max_tokens: 200, messages:[{role:'user', content: prompt}] },
        { timeout: 25000 });
      if(r.s === 200) text = (r.d.content || []).filter(b => b.type==='text').map(b => b.text).join('').trim();
    }
    if(!text || text.length < 12) return false;
    text = '📅 今週のまとめ\n' + text;
    if(text.length > 280) text = text.slice(0, 280);
    ag.proactive_nudges = nudges;
    ag.proactive_nudges.push({
      id: 'nud_'+crypto.randomBytes(5).toString('hex'),
      text, source:'weekly-digest',
      created_at: new Date().toISOString(),
      dismissed:false, acted:false,
    });
    if(ag.proactive_nudges.length > 5) ag.proactive_nudges = ag.proactive_nudges.slice(-5);
    ag.last_nudge_at = new Date().toISOString();
    user.last_nudge_global_at = new Date().toISOString();
    user.last_weekly_digest_at = new Date().toISOString();
    await DB.save(user);
    console.log('[nudge:weekly] agent=' + ag.id);
    return true;
  } catch(e){
    console.warn('[nudge:weekly] failed:', e.message);
    return false;
  }
}

async function _maybeGenerateNudgeForUser(user){
  try {
    if(!user || !Array.isArray(user.agents) || user.agents.length === 0) return false;
    // KPI alert has priority — fires even if regular cooldown not elapsed,
    // because a KPI dip is time-sensitive.
    if(await _maybeGenerateKpiAlert(user)) return true;
    // Weekly digest — Monday morning, once per week.
    if(await _maybeGenerateWeeklyDigest(user)) return true;
    const now = Date.now();
    // Global daily throttle.
    if(user.last_nudge_global_at && now - new Date(user.last_nudge_global_at).getTime() < 22 * 3600 * 1000) return false;
    // Qualifying agents: solo (skip groups for v1), have at least 4 history
    // turns, no active undismissed nudge, last_nudge_at older than 24h.
    const candidates = user.agents.filter(a => {
      if(!a || a.is_group) return false;
      if(!Array.isArray(a.history) || a.history.length < 4) return false;
      const nudges = Array.isArray(a.proactive_nudges) ? a.proactive_nudges : [];
      if(nudges.find(n => !n.dismissed && !n.acted)) return false;
      if(a.last_nudge_at && now - new Date(a.last_nudge_at).getTime() < 24 * 3600 * 1000) return false;
      return true;
    });
    if(candidates.length === 0) return false;
    // Pick the one with the most recent activity (most relevant context).
    candidates.sort((a, b) => (b.history.length || 0) - (a.history.length || 0));
    const agent = candidates[0];
    const recent = (agent.history || []).slice(-6).map(m => {
      const role = m.role === 'assistant' ? agent.name : (m.user_name || 'USER');
      const body = typeof m.content === 'string' ? m.content : (Array.isArray(m.content) ? m.content.filter(b => b && b.type==='text').map(b => b.text).join(' ') : '');
      return role + ': ' + (body || '').slice(0, 240);
    }).join('\n');
    const prompt = `あなたは "${agent.name}" という AI エージェントです。\nPersona: ${(agent.persona||'').slice(0,400)}\n\n直近の会話:\n${recent}\n\nユーザーから問いかけがない今、こちらから自発的にユーザーに送る短い「つぶやき」を 1 つだけ生成してください。条件:\n- 1〜2 文、80 字以内\n- 直前の会話の続き / 気づき / 提案 / 確認 のどれか (脈絡が伝わるもの)\n- 売り込み・煽り・誇張は禁止、自然で親しみやすいトーン\n- 出力は本文のみ。前置きや「以下が…」のような枕詞、句読点による飾りは禁止`;
    const info = _resolveModelInfo(GEMINI_KEY ? 'gemini-flash' : 'haiku');
    let text = '';
    if(info.provider === 'gemini'){
      const r = await _callGemini([{role:'user', content: prompt}], '', info);
      text = (r && r.content && r.content[0] && r.content[0].text || '').trim();
    } else if(ANTHROPIC) {
      const r = await httpsReq('POST','api.anthropic.com','/v1/messages',
        {'Content-Type':'application/json','x-api-key':ANTHROPIC,'anthropic-version':'2023-06-01'},
        { model: info.modelId, max_tokens: 200, messages:[{role:'user',content:prompt}] },
        { timeout: 20000 });
      if(r.s === 200) text = (r.d.content || []).filter(b => b.type==='text').map(b => b.text).join('').trim();
    }
    text = (text || '').replace(/^["'「『]|["'」』]$/g, '').trim();
    if(!text || text.length < 6) return false;
    if(text.length > 240) text = text.slice(0, 240);
    agent.proactive_nudges = Array.isArray(agent.proactive_nudges) ? agent.proactive_nudges : [];
    agent.proactive_nudges.push({
      id: 'nud_' + crypto.randomBytes(5).toString('hex'),
      text,
      created_at: new Date().toISOString(),
      dismissed: false,
      acted: false,
    });
    if(agent.proactive_nudges.length > 5) agent.proactive_nudges = agent.proactive_nudges.slice(-5);
    agent.last_nudge_at = new Date().toISOString();
    user.last_nudge_global_at = new Date().toISOString();
    await DB.save(user);
    console.log('[nudge] generated agent=' + agent.id + ' text=' + text.slice(0, 60));
    return true;
  } catch(e){
    console.warn('[nudge] failed:', e.message);
    return false;
  }
}

// ── PLAN-EXECUTE-REVIEW ───────────────────────────────────────
// Triggered by the user prefixing their message with `/plan `. Workflow:
//   1. PLAN  — AI produces a 3-5 step JSON plan
//   2. EXEC  — each step is run as its own AI turn (sequential, streamed)
//   3. REVIEW — final pass concatenates the per-step outputs + reflection
// Far slower than a single turn (3-5× LLM calls), so kept opt-in. Streams
// progress via SSE so the user sees each step land.
async function _runPlanExecuteReview(message, opts){
  // opts = { agent, sse, baseSysFn, modelAlias }
  const sse = opts && opts.sse;
  const buildSys = opts && opts.baseSysFn; // function(extraOpts) → system string
  const modelAlias = (opts && opts.modelAlias) || 'sonnet';   // plans benefit from Smart
  const goal = String(message || '').replace(/^\/plan\s+/i, '').trim();
  if(!goal || goal.length < 6){
    return { reply: '`/plan` の後に目標を書いてください。例: `/plan SaaS の LP を作って収集ページまで`', tokens:{input:0, output:0} };
  }
  let totalIn = 0, totalOut = 0;
  const planSys = (typeof buildSys === 'function' ? buildSys() : '')
    + '\n\nあなたは複雑なタスクを 3-5 ステップに分解するプランナーです。各ステップは独立して実行可能で、入力と出力が明確である必要があります。';
  const planPrompt = `次の目標を 3-5 ステップに分解してください。\n\n目標: ${goal}\n\nJSON で返してください (それ以外禁止):\n{\n  "steps": [\n    { "title": "ステップ短いタイトル", "instruction": "AI への詳細指示", "tool": null }\n  ]\n}`;
  if(sse) sse('plan_status', { phase:'planning' });
  let planRaw = '';
  try {
    const info = _resolveModelInfo(modelAlias);
    if(info.provider === 'gemini'){
      const r = await _callGemini([{role:'user', content: planPrompt}], planSys, info);
      planRaw = (r?.content?.[0]?.text || '').trim();
      totalIn += r?.usage?.input_tokens || 0;
      totalOut += r?.usage?.output_tokens || 0;
    } else {
      const r = await callAI([{role:'user', content: planPrompt}], planSys, modelAlias, opts.agent);
      planRaw = r?.content?.find(b=>b.type==='text')?.text || '';
      totalIn += r?.usage?.input_tokens || 0;
      totalOut += r?.usage?.output_tokens || 0;
    }
  } catch(e){
    return { reply: 'プラン生成に失敗: ' + e.message, tokens:{input:totalIn, output:totalOut} };
  }
  planRaw = planRaw.replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'').trim();
  let plan; try { plan = JSON.parse(planRaw); } catch(e){
    return { reply: 'プランを JSON として読めませんでした:\n\n' + planRaw, tokens:{input:totalIn, output:totalOut} };
  }
  if(!plan || !Array.isArray(plan.steps) || !plan.steps.length){
    return { reply: 'プランが空でした。もう少し具体的な依頼でお試しください。', tokens:{input:totalIn, output:totalOut} };
  }
  const steps = plan.steps.slice(0, 6); // hard cap
  // Stream the plan to the client first
  if(sse) sse('plan_outline', { steps: steps.map((s,i) => ({ n: i+1, title: s.title })) });
  // EXEC — sequential
  const stepResults = [];
  for(let i = 0; i < steps.length; i++){
    const step = steps[i];
    if(sse) sse('plan_status', { phase:'executing', step: i+1, title: step.title });
    const stepSys = (typeof buildSys === 'function' ? buildSys() : '')
      + '\n\n[現在のプラン]\n' + steps.map((s,j)=>`${j+1}. ${s.title}`).join('\n')
      + '\n\n[直前のステップ結果]\n' + (stepResults.slice(-2).map((r,j)=>`Step ${stepResults.length-1+j}: ${r.slice(0,400)}`).join('\n\n') || '(まだなし)');
    const stepPrompt = `ステップ ${i+1}: ${step.title}\n\n指示: ${step.instruction}\n\n上記を実行して結果のみ返してください (前置きや「以下に…」禁止)。`;
    try {
      const info = _resolveModelInfo(modelAlias);
      let txt = '';
      if(info.provider === 'gemini'){
        const r = await _callGemini([{role:'user', content: stepPrompt}], stepSys, info);
        txt = (r?.content?.[0]?.text || '').trim();
        totalIn += r?.usage?.input_tokens || 0;
        totalOut += r?.usage?.output_tokens || 0;
      } else {
        const r = await callAI([{role:'user', content: stepPrompt}], stepSys, modelAlias, opts.agent);
        txt = r?.content?.find(b=>b.type==='text')?.text || '';
        totalIn += r?.usage?.input_tokens || 0;
        totalOut += r?.usage?.output_tokens || 0;
      }
      stepResults.push(txt);
      if(sse) sse('plan_step_done', { step: i+1, result: txt.slice(0, 600) });
    } catch(e){
      stepResults.push('(エラー: ' + e.message + ')');
      if(sse) sse('plan_step_done', { step: i+1, result: '(エラー)', error: e.message });
    }
  }
  // REVIEW
  if(sse) sse('plan_status', { phase:'reviewing' });
  const reviewPrompt = `目標: ${goal}\n\n実行結果:\n` +
    steps.map((s, i) => `### ${i+1}. ${s.title}\n${stepResults[i] || '(no result)'}`).join('\n\n') +
    `\n\n上記を統合した最終回答を作成してください。各ステップの良い部分を取り入れ、矛盾や重複を整理。出力は本文のみ。`;
  let final = '';
  try {
    const info = _resolveModelInfo(modelAlias);
    if(info.provider === 'gemini'){
      const r = await _callGemini([{role:'user', content: reviewPrompt}], '', info);
      final = (r?.content?.[0]?.text || '').trim();
      totalIn += r?.usage?.input_tokens || 0;
      totalOut += r?.usage?.output_tokens || 0;
    } else {
      const r = await callAI([{role:'user', content: reviewPrompt}], '', modelAlias, opts.agent);
      final = r?.content?.find(b=>b.type==='text')?.text || '';
      totalIn += r?.usage?.input_tokens || 0;
      totalOut += r?.usage?.output_tokens || 0;
    }
  } catch(e){
    final = stepResults.join('\n\n');
  }
  if(!final) final = stepResults.join('\n\n');
  // Format as a structured reply with collapsible steps
  const header = '📋 **' + steps.length + ' ステップで実行**\n\n' +
    steps.map((s,i) => `${i+1}. ${s.title}`).join('\n');
  const finalReply = header + '\n\n---\n\n' + final;
  return { reply: finalReply, tokens: { input: totalIn, output: totalOut } };
}

// ── CRITIC PASS ───────────────────────────────────────────────
// Optional second-pass quality check. When triggered, the model scores its
// own reply 1-10 and rewrites it if < 7. Costs 1 extra AI round-trip, so
// we only run it on:
//   • long replies (≥ 1,000 chars) where quality dropoff is most visible
//   • explicit /improve trigger from the user
//   • optionally: when create_artifact / generate_pdf produced a result
// Returns the (possibly rewritten) reply text. Failure → returns original.
async function _runCriticPass(originalReply, opts){
  try {
    const userMsg = String((opts && opts.userMsg) || '').slice(0, 800);
    const modelAlias = (opts && opts.model) || 'gemini-flash';
    const info = _resolveModelInfo(modelAlias);
    const reply = String(originalReply || '').slice(0, 12000);
    if(reply.length < 60) return originalReply;
    const prompt = `あなたは厳しい品質レビュアーです。以下の AI 応答を 1-10 で採点してください。\n\n[ユーザーの依頼]\n${userMsg}\n\n[AI の応答]\n${reply}\n\n採点基準:\n- ユーザーの依頼に正面から答えているか (5 点満点)\n- 情報の具体性・実用性 (3 点満点)\n- 構造・読みやすさ (2 点満点)\n\nJSON で返してください:\n{"score": <1-10>, "issues": ["問題 1", "問題 2"], "improved_reply": "<7 点未満なら必ず書き直した完全版を入れる。7 以上なら null>"}\n\n注意: JSON のみ。前置きや説明禁止。improved_reply を書く場合は markdown も完全な形で。`;
    let raw = '';
    if(info.provider === 'gemini'){
      const r = await _callGemini([{role:'user', content: prompt}], '', info);
      raw = (r && r.content && r.content[0] && r.content[0].text || '').trim();
    } else if(ANTHROPIC){
      const r = await httpsReq('POST','api.anthropic.com','/v1/messages',
        {'Content-Type':'application/json','x-api-key':ANTHROPIC,'anthropic-version':'2023-06-01'},
        { model: info.modelId, max_tokens: 4000, messages:[{role:'user', content: prompt}] },
        { timeout: 60000 });
      if(r.s === 200) raw = (r.d.content || []).filter(b => b.type==='text').map(b => b.text).join('').trim();
    }
    if(!raw) return originalReply;
    raw = raw.replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'').trim();
    let parsed; try { parsed = JSON.parse(raw); } catch(e){ return originalReply; }
    if(!parsed) return originalReply;
    console.log('[critic] score=' + parsed.score + ' issues=' + (parsed.issues || []).length);
    if(typeof parsed.score === 'number' && parsed.score >= 7) return originalReply;
    if(typeof parsed.improved_reply === 'string' && parsed.improved_reply.length > 30){
      return parsed.improved_reply;
    }
    return originalReply;
  } catch(e){
    console.warn('[critic] failed:', e.message);
    return originalReply;
  }
}
function _shouldRunCritic(message, reply, agent){
  // Explicit /improve prefix from user
  if(/^\/improve\b/i.test(String(message||'').trim())) return true;
  // Long output gates: ≥ 1500 chars + non-trivial. Skip when reply is mostly
  // a single URL (artifact paths) or an error message.
  const r = String(reply || '');
  if(r.length < 1500) return false;
  if(/^[🎨🖼️✂️🎬🎵📄📊📐🔗✅⚠️]/.test(r) && r.length < 2000) return false; // wrap-up reply
  if(/応答エラー|エラーが発生|生成できません/.test(r)) return false;
  return true;
}

// ── AUTO MODEL ROUTING ────────────────────────────────────────
// When agent.model === 'auto', the chat handler routes each turn through
// _autoPickModel() to balance speed vs. quality. Light queries stay on
// Gemini Flash (cheap + fast), complex tasks escalate to Sonnet. Opus is
// reserved for explicit user request ("/opus" prefix) because it's pricy.
//
// Signals used:
//   • Slash command for known complex tools  → Sonnet
//   • Message > 400 chars                    → Sonnet (likely structured)
//   • Multiple action verbs (3+ "して/して/して") → Sonnet
//   • Code-block / multi-line input          → Sonnet
//   • Plain conversation, < 100 chars        → Flash
function _autoPickModel(message, agent){
  const raw = String(message || '').trim();
  // Explicit override via slash prefix
  if(/^\/opus\b/i.test(raw))   return 'opus';
  if(/^\/sonnet\b/i.test(raw)) return 'sonnet';
  if(/^\/fast\b|^\/flash\b/i.test(raw)) return 'gemini-flash';
  // Heuristics
  if(raw.length > 400) return 'sonnet';
  if(/```/.test(raw))  return 'sonnet';            // code block in input
  if((raw.match(/\n/g)||[]).length >= 4) return 'sonnet';  // multi-line / structured
  // Complex create_* requests
  if(/(create_artifact|lp|サイト|モック|dashboard|プロトタイプ|prototype|landing|ホームページ)/i.test(raw)) return 'sonnet';
  if(/(設計|アーキ|architecture|design.*system|データベース.*設計|API.*設計)/i.test(raw)) return 'sonnet';
  // Multi-step requests (3+ "and"-like joiners)
  const joiners = (raw.match(/(そして|それから|あと|また|and then|after that|\+)/gi)||[]).length;
  if(joiners >= 2) return 'sonnet';
  return 'gemini-flash';
}

// Resolve a per-agent model alias to {provider, modelId, maxTokens}.
// Supported aliases:
//   - 'haiku' | 'sonnet' | 'opus'             → Anthropic
//   - 'gemini-flash' | 'gemini-pro'           → Google Gemini
// If a Gemini alias is requested but GEMINI_API_KEY is unset, the resolver
// transparently downgrades to Sonnet so the chat keeps working. Defaults to
// 'gemini-flash' (cheap + fast) when no alias is set and the key is present;
// otherwise to Sonnet.
function _resolveModelInfo(alias){
  const a = (alias||'').toLowerCase();
  if(a === 'gemini-flash' || a === 'gemini-pro'){
    if(!GEMINI_KEY){
      // Fall through to Anthropic Sonnet — no Gemini key configured.
      return { provider:'anthropic', modelId:'claude-sonnet-4-6', maxTokens:16000, alias:'sonnet' };
    }
    return a === 'gemini-pro'
      ? { provider:'gemini', modelId:'gemini-2.5-pro',   maxTokens:16000, alias:'gemini-pro' }
      : { provider:'gemini', modelId:'gemini-2.5-flash', maxTokens:8192,  alias:'gemini-flash' };
  }
  switch(a){
    case 'haiku':  return { provider:'anthropic', modelId:'claude-haiku-4-5-20251001', maxTokens:8000,  alias:'haiku' };
    case 'opus':   return { provider:'anthropic', modelId:'claude-opus-4-7',           maxTokens:32000, alias:'opus' };
    case 'sonnet': return { provider:'anthropic', modelId:'claude-sonnet-4-6',         maxTokens:16000, alias:'sonnet' };
    default:
      // Unset alias: pick Gemini Flash if available, else Sonnet.
      return GEMINI_KEY
        ? { provider:'gemini',    modelId:'gemini-2.5-flash', maxTokens:8192,  alias:'gemini-flash' }
        : { provider:'anthropic', modelId:'claude-sonnet-4-6', maxTokens:16000, alias:'sonnet' };
  }
}
// Legacy helpers — kept so existing callsites that only need the Anthropic
// model id keep working. New code should use _resolveModelInfo directly.
function _resolveModel(alias){ return _resolveModelInfo(alias).modelId; }
function _maxTokensFor(alias){ return _resolveModelInfo(alias).maxTokens; }

// ── GEMINI ↔ ANTHROPIC FORMAT CONVERSION ──────────────────────
// Gemini's REST API uses a different shape:
//   contents:[{role:'user'|'model', parts:[{text}|{inlineData}|{functionCall}|{functionResponse}]}]
//   systemInstruction: {parts:[{text}]}
//   tools:[{functionDeclarations:[{name,description,parameters}]}]
//   toolConfig:{functionCallingConfig:{mode:'AUTO'|'ANY'|'NONE', allowedFunctionNames?}}
// We accept Anthropic-shaped inputs everywhere internally and convert here.
function _antToGeminiMessages(messages){
  const out = [];
  for(const m of (messages||[])){
    const role = m.role === 'assistant' ? 'model' : 'user';
    const parts = [];
    if(typeof m.content === 'string'){
      const t = (m.content||'').trim();
      if(t) parts.push({ text: t });
    } else if(Array.isArray(m.content)){
      for(const b of m.content){
        if(b.type === 'text' && b.text){ parts.push({ text: b.text }); continue; }
        if(b.type === 'image' && b.source){
          // Anthropic source: {type:'base64'|'url', media_type, data|url}
          if(b.source.type === 'base64'){
            parts.push({ inlineData: { mimeType: b.source.media_type || 'image/png', data: b.source.data } });
          } else if(b.source.type === 'url' && b.source.url){
            // Gemini doesn't accept image URLs directly via inlineData. Skip
            // gracefully — most UI image uploads come through as base64 anyway.
            parts.push({ text: '[image: '+b.source.url+']' });
          }
          continue;
        }
        if(b.type === 'tool_use'){
          parts.push({ functionCall: { name: b.name, args: b.input || {} } });
          continue;
        }
        if(b.type === 'tool_result'){
          // Anthropic tool_result.content can be string or array of blocks.
          let resp;
          if(typeof b.content === 'string'){
            resp = { result: b.content };
          } else if(Array.isArray(b.content)){
            const texts = b.content.filter(x => x && x.type==='text').map(x => x.text).join('\n');
            resp = texts ? { result: texts } : { result: '(omitted)' };
          } else {
            resp = { result: '' };
          }
          // We don't know the tool name here from Anthropic's shape — it's
          // referenced via tool_use_id. Gemini wants the function name.
          // Resolve by scanning earlier assistant messages for the matching id.
          let name = '';
          for(const prior of messages){
            if(!Array.isArray(prior.content)) continue;
            for(const pb of prior.content){
              if(pb && pb.type==='tool_use' && pb.id === b.tool_use_id){ name = pb.name; break; }
            }
            if(name) break;
          }
          parts.push({ functionResponse: { name: name || 'tool', response: resp } });
          continue;
        }
      }
    }
    if(parts.length === 0) parts.push({ text: '(empty)' });
    // Merge consecutive same-role turns — Gemini rejects alternation breaks.
    if(out.length && out[out.length-1].role === role){
      out[out.length-1].parts.push(...parts);
    } else {
      out.push({ role, parts });
    }
  }
  return out;
}
function _antToGeminiTools(tools){
  if(!Array.isArray(tools) || tools.length===0) return undefined;
  // Drop Anthropic server tools (web_search_*, web_fetch_*, computer_*) —
  // Gemini doesn't host them and would 400 on the unknown type field.
  const decls = tools
    .filter(t => t && t.name && t.input_schema)
    .map(t => ({
      name: t.name,
      description: t.description || '',
      parameters: _sanitizeJsonSchema(t.input_schema),
    }));
  if(decls.length === 0) return undefined;
  return [{ functionDeclarations: decls }];
}
function _sanitizeJsonSchema(s){
  // Gemini's parameters schema is a subset of JSON Schema — it rejects
  // fields like `$schema`, `additionalProperties` (sometimes), and
  // cache_control. Recursively strip cache_control + a few unsafe keys.
  if(!s || typeof s !== 'object') return s;
  if(Array.isArray(s)) return s.map(_sanitizeJsonSchema);
  const out = {};
  for(const k of Object.keys(s)){
    if(k === 'cache_control' || k === '$schema' || k === 'additionalProperties') continue;
    out[k] = _sanitizeJsonSchema(s[k]);
  }
  return out;
}
function _antToGeminiToolChoice(tc){
  if(!tc) return undefined;
  if(tc.type === 'tool' && tc.name){
    return { functionCallingConfig: { mode:'ANY', allowedFunctionNames:[tc.name] } };
  }
  if(tc.type === 'any')  return { functionCallingConfig: { mode:'ANY' } };
  if(tc.type === 'none') return { functionCallingConfig: { mode:'NONE' } };
  return { functionCallingConfig: { mode:'AUTO' } };
}
function _systemTextOf(system){
  if(Array.isArray(system)){
    return system.map(b => (b && typeof b.text === 'string') ? b.text : '').filter(Boolean).join('\n\n');
  }
  return String(system||'');
}

// ── GEMINI CONTEXT CACHING ────────────────────────────────────
// Google's cachedContents API holds the systemInstruction + tools spec on
// their side. Re-using the cache cuts input tokens by ~75% for the cached
// portion (persona + tool defs are static per-agent, so this pays off after
// the first message). TTL = 1h; we refresh-on-use.
//
// Storage: each agent carries `agent.gemini_cache = {name, expires_at,
// persona_hash, tools_hash, model_id}`. Cache invalidates automatically when
// persona or tools change (hash mismatch). Pure best-effort — any cache
// failure silently falls back to the uncached path.
const GEMINI_CACHE_TTL_SEC = 3600; // 1h
const GEMINI_CACHE_MIN_TOKENS = 4096; // gemini-2.5-flash requires >=4096 tokens to cache; below this Google rejects
function _geminiHashFor(personaText, tools){
  const h = crypto.createHash('sha256');
  h.update(personaText || ''); h.update('|');
  h.update(JSON.stringify(tools || []));
  return h.digest('hex').slice(0, 16);
}
function _geminiCacheValid(agent, info, systemText, tools){
  const c = agent && agent.gemini_cache;
  if(!c || !c.name || !c.expires_at) return false;
  if(c.model_id !== info.modelId) return false;
  if(c.expires_at < Date.now() + 60_000) return false; // 60s safety margin
  const personaHash = _geminiHashFor(systemText, []);
  const toolsHash   = _geminiHashFor('', tools || []);
  return c.persona_hash === personaHash && c.tools_hash === toolsHash;
}
async function _geminiCacheCreate(info, systemText, tools, agentLabel){
  // Heuristic skip: cache requires ~4K input tokens. If persona + tools
  // doesn't reach that, Google will 400. Cheap chars/4 estimate.
  const estChars = (systemText || '').length + JSON.stringify(tools || []).length;
  if(Math.ceil(estChars / 4) < GEMINI_CACHE_MIN_TOKENS){
    return null;
  }
  return new Promise((resolve)=>{
    const body = {
      model: 'models/' + info.modelId,
      ttl: GEMINI_CACHE_TTL_SEC + 's',
      displayName: agentLabel ? agentLabel.slice(0, 40) : 'agent-cache',
    };
    if(systemText) body.systemInstruction = { parts:[{text: systemText}] };
    const gtools = _antToGeminiTools(tools);
    if(gtools) body.tools = gtools;
    const payload = JSON.stringify(body);
    const req = https.request({
      hostname:'generativelanguage.googleapis.com',
      path: '/v1beta/cachedContents?key=' + encodeURIComponent(GEMINI_KEY),
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Content-Length': Buffer.byteLength(payload) }
    }, (r)=>{
      let buf = '';
      r.setEncoding('utf8');
      r.on('data', c => buf += c);
      r.on('end', ()=>{
        try{
          const obj = JSON.parse(buf || '{}');
          if(r.statusCode >= 400 || !obj.name){
            // Common case: input below 4096 token threshold — silently skip.
            const msg = (obj.error && obj.error.message) || ('HTTP '+r.statusCode);
            console.warn('[gemini-cache] create failed:', msg.slice(0, 200));
            resolve(null);
            return;
          }
          const expireMs = obj.expireTime ? Date.parse(obj.expireTime) : (Date.now() + GEMINI_CACHE_TTL_SEC*1000);
          resolve({
            name: obj.name,
            expires_at: expireMs,
            persona_hash: _geminiHashFor(systemText, []),
            tools_hash: _geminiHashFor('', tools || []),
            model_id: info.modelId,
            usage_tokens: (obj.usageMetadata && obj.usageMetadata.totalTokenCount) || 0,
          });
        }catch(e){ console.warn('[gemini-cache] create parse:', e.message); resolve(null); }
      });
      r.on('error', e => { console.warn('[gemini-cache] create http:', e.message); resolve(null); });
    });
    req.on('error', e => { console.warn('[gemini-cache] create req:', e.message); resolve(null); });
    req.write(payload); req.end();
  });
}
// Touch — extend TTL on re-use without re-uploading content.
function _geminiCacheTouch(name){
  if(!name) return;
  const payload = JSON.stringify({ ttl: GEMINI_CACHE_TTL_SEC + 's' });
  const req = https.request({
    hostname:'generativelanguage.googleapis.com',
    path: '/v1beta/' + name + '?key=' + encodeURIComponent(GEMINI_KEY),
    method:'PATCH',
    headers:{ 'Content-Type':'application/json', 'Content-Length': Buffer.byteLength(payload) }
  }, (r)=>{ r.resume(); });
  req.on('error', ()=>{});
  req.write(payload); req.end();
}
// Per-call entry point: returns {cacheName, systemForReq, toolsForReq, freshlyCreated}.
// If a valid cache exists, sysText/tools come back as undefined (caller must
// drop them from payload). Otherwise the caller sends them inline AND we
// fire-and-forget create a cache for the NEXT call.
async function _geminiResolveCache(opts){
  const { info, system, tools, agent, agentLabel } = opts;
  const sysText = _systemTextOf(system);
  if(!GEMINI_KEY || !agent){
    return { cacheName: null, systemForReq: sysText, toolsForReq: tools };
  }
  if(_geminiCacheValid(agent, info, sysText, tools)){
    // Hit. Touch async so TTL extends without blocking the call.
    _geminiCacheTouch(agent.gemini_cache.name);
    console.log('[gemini-cache] hit agent=' + (agent.id||'?') + ' name=' + agent.gemini_cache.name);
    return { cacheName: agent.gemini_cache.name, systemForReq: undefined, toolsForReq: undefined };
  }
  // Miss → kick off creation in the background. This call still sends full
  // payload uncached; the next call within TTL will hit.
  _geminiCacheCreate(info, sysText, tools, agentLabel).then((c)=>{
    if(!c) return;
    agent.gemini_cache = c;
    console.log('[gemini-cache] created agent=' + (agent.id||'?') + ' name=' + c.name + ' tokens=' + c.usage_tokens);
  }).catch(()=>{});
  return { cacheName: null, systemForReq: sysText, toolsForReq: tools };
}

// Gemini streaming endpoint (SSE-style chunks). Returns
// {text, inputTokens, outputTokens, stopReason}.
function _callGeminiStream(messages, system, onText, info, cacheCtx){
  return new Promise((resolve, reject)=>{
    const contents = _antToGeminiMessages(messages);
    const bodyObj = {
      contents,
      generationConfig: { maxOutputTokens: info.maxTokens, temperature: 0.7 },
    };
    if(cacheCtx && cacheCtx.cacheName){
      bodyObj.cachedContent = cacheCtx.cacheName;
    } else {
      const sysText = _systemTextOf(system);
      if(sysText) bodyObj.systemInstruction = { parts:[{text: sysText}] };
    }
    const body = JSON.stringify(bodyObj);
    const reqPath = '/v1beta/models/'+encodeURIComponent(info.modelId)+':streamGenerateContent?key='+encodeURIComponent(GEMINI_KEY)+'&alt=sse';
    const req = https.request({
      hostname:'generativelanguage.googleapis.com',
      path: reqPath,
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (r)=>{
      let buf = '';
      let fullText = '';
      let inputTokens = 0, outputTokens = 0;
      let stopReason = null;
      let errored = false;
      r.setEncoding('utf8');
      r.on('data', (chunk)=>{
        buf += chunk;
        let i;
        while((i = buf.indexOf('\n\n')) >= 0){
          const event = buf.slice(0, i);
          buf = buf.slice(i + 2);
          let dataLine = '';
          for(const line of event.split('\n')){
            if(line.startsWith('data: ')) dataLine = line.slice(6);
          }
          if(!dataLine || dataLine === '[DONE]') continue;
          try{
            const obj = JSON.parse(dataLine);
            if(obj.error){
              errored = true;
              reject(new Error(obj.error.message || 'Gemini stream error'));
              try{ r.destroy(); }catch(e){}
              return;
            }
            const cands = obj.candidates || [];
            for(const c of cands){
              const parts = (c.content && c.content.parts) || [];
              for(const p of parts){
                if(typeof p.text === 'string'){
                  fullText += p.text;
                  try{ onText(p.text); }catch(e){}
                }
              }
              if(c.finishReason){
                // Gemini reasons: STOP, MAX_TOKENS, SAFETY, RECITATION, OTHER
                stopReason = c.finishReason === 'MAX_TOKENS' ? 'max_tokens' :
                             c.finishReason === 'STOP'       ? 'end_turn'   :
                             c.finishReason;
              }
            }
            if(obj.usageMetadata){
              inputTokens  = obj.usageMetadata.promptTokenCount || inputTokens;
              outputTokens = obj.usageMetadata.candidatesTokenCount || outputTokens;
            }
          }catch(e){ /* partial event */ }
        }
      });
      r.on('end', ()=>{
        if(errored) return;
        if(r.statusCode && r.statusCode >= 400){
          reject(new Error('Gemini '+r.statusCode+': '+(fullText||'request failed').slice(0,200)));
          return;
        }
        let finalText = fullText;
        if(stopReason === 'max_tokens'){
          finalText += '\n\n…（出力上限に達したため途中までです。続きを生成するには「続けて」と送ってください）';
        }
        resolve({ text: finalText, inputTokens, outputTokens, stopReason });
      });
      r.on('error', (e)=>{ if(!errored) reject(e); });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Non-streaming Gemini call — returns an Anthropic-shaped response object
// (so callers don't care which provider answered). Used by callAI().
async function _callGemini(messages, system, info, cacheCtx){
  return new Promise((resolve, reject)=>{
    const bodyObj = {
      contents: _antToGeminiMessages(messages),
      generationConfig: { maxOutputTokens: info.maxTokens, temperature: 0.7 },
    };
    if(cacheCtx && cacheCtx.cacheName){
      bodyObj.cachedContent = cacheCtx.cacheName;
    } else {
      const sysText = _systemTextOf(system);
      if(sysText) bodyObj.systemInstruction = { parts:[{text: sysText}] };
    }
    const body = JSON.stringify(bodyObj);
    const reqPath = '/v1beta/models/'+encodeURIComponent(info.modelId)+':generateContent?key='+encodeURIComponent(GEMINI_KEY);
    const req = https.request({
      hostname:'generativelanguage.googleapis.com',
      path: reqPath,
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (r)=>{
      let buf = '';
      r.setEncoding('utf8');
      r.on('data', c => buf += c);
      r.on('end', ()=>{
        try{
          const obj = JSON.parse(buf || '{}');
          if(r.statusCode && r.statusCode >= 400){
            reject(new Error(obj?.error?.message || 'Gemini '+r.statusCode));
            return;
          }
          const cand = (obj.candidates||[])[0] || {};
          const parts = (cand.content && cand.content.parts) || [];
          const text = parts.filter(p => typeof p.text === 'string').map(p => p.text).join('');
          // Shape like Anthropic so callAI() consumers (which expect r.content[0].text) keep working.
          resolve({
            content: [{ type:'text', text }],
            usage: {
              input_tokens: (obj.usageMetadata && obj.usageMetadata.promptTokenCount) || 0,
              output_tokens: (obj.usageMetadata && obj.usageMetadata.candidatesTokenCount) || 0,
            },
            stop_reason: cand.finishReason === 'MAX_TOKENS' ? 'max_tokens'
                       : cand.finishReason === 'STOP'       ? 'end_turn'
                       : (cand.finishReason || 'end_turn'),
          });
        }catch(e){ reject(e); }
      });
      r.on('error', reject);
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

// Gemini tool-use call — single round-trip. Returns an Anthropic-shaped
// response so the existing tool-loop driver in /api/chat works unchanged.
async function _callGeminiWithTools(messages, system, tools, toolChoice, info, cacheCtx){
  return new Promise((resolve, reject)=>{
    const body = {
      contents: _antToGeminiMessages(messages),
      generationConfig: { maxOutputTokens: info.maxTokens, temperature: 0.7 },
    };
    if(cacheCtx && cacheCtx.cacheName){
      body.cachedContent = cacheCtx.cacheName;
    } else {
      const sysText = _systemTextOf(system);
      if(sysText) body.systemInstruction = { parts:[{text: sysText}] };
      const gtools = _antToGeminiTools(tools);
      if(gtools) body.tools = gtools;
    }
    // tool_choice always goes inline — it's a per-call control, not cached.
    const gtc = _antToGeminiToolChoice(toolChoice);
    if(gtc) body.toolConfig = gtc;
    const payload = JSON.stringify(body);
    const reqPath = '/v1beta/models/'+encodeURIComponent(info.modelId)+':generateContent?key='+encodeURIComponent(GEMINI_KEY);
    const req = https.request({
      hostname:'generativelanguage.googleapis.com',
      path: reqPath,
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Content-Length': Buffer.byteLength(payload) }
    }, (r)=>{
      let buf = '';
      r.setEncoding('utf8');
      r.on('data', c => buf += c);
      r.on('end', ()=>{
        try{
          const obj = JSON.parse(buf || '{}');
          if(r.statusCode && r.statusCode >= 400){
            reject(new Error(obj?.error?.message || 'Gemini '+r.statusCode));
            return;
          }
          const cand = (obj.candidates||[])[0] || {};
          const parts = (cand.content && cand.content.parts) || [];
          // Translate Gemini parts → Anthropic content blocks.
          const content = [];
          let toolUseSeen = false;
          for(const p of parts){
            if(typeof p.text === 'string' && p.text){
              content.push({ type:'text', text: p.text });
            } else if(p.functionCall){
              toolUseSeen = true;
              content.push({
                type:'tool_use',
                id: 'gem_'+crypto.randomBytes(8).toString('hex'),
                name: p.functionCall.name,
                input: p.functionCall.args || {},
              });
            }
          }
          if(content.length === 0) content.push({ type:'text', text:'' });
          const stop_reason = toolUseSeen ? 'tool_use'
                            : cand.finishReason === 'MAX_TOKENS' ? 'max_tokens'
                            : cand.finishReason === 'STOP'       ? 'end_turn'
                            : (cand.finishReason || 'end_turn');
          resolve({
            content,
            stop_reason,
            usage: {
              input_tokens: (obj.usageMetadata && obj.usageMetadata.promptTokenCount) || 0,
              output_tokens: (obj.usageMetadata && obj.usageMetadata.candidatesTokenCount) || 0,
            },
          });
        }catch(e){ reject(e); }
      });
      r.on('error', reject);
    });
    req.on('error', reject);
    req.write(payload); req.end();
  });
}

async function callAI(messages,system,modelAlias,cacheAgent){
  const info = _resolveModelInfo(modelAlias);
  const trimmedMsgs = _trimHistory(_capHistory(messages));
  if(info.provider === 'gemini'){
    const cacheCtx = await _geminiResolveCache({ info, system, tools: [], agent: cacheAgent, agentLabel: cacheAgent && cacheAgent.name });
    return _callGemini(trimmedMsgs, system, info, cacheCtx);
  }
  const headers = {'Content-Type':'application/json','x-api-key':ANTHROPIC,'anthropic-version':'2023-06-01','anthropic-beta':'prompt-caching-2024-07-31'};
  const tryCall = async (sys) => httpsReq('POST','api.anthropic.com','/v1/messages',headers,
    {model:info.modelId,max_tokens:info.maxTokens,system:sys,messages:trimmedMsgs},
    {timeout: 180000});
  let r = await tryCall(_systemBlocks(system));
  // If Anthropic rejected cache_control formatting, retry with plain string system
  if(r.s===400 && /cache_control|content block/i.test(JSON.stringify(r.d||''))){
    console.warn('[callAI] retrying without cache_control:', JSON.stringify(r.d).slice(0,200));
    r = await tryCall(String(system||''));
  }
  if(r.s!==200)throw new Error(r.d?.error?.message||`Anthropic ${r.s}`);
  return r.d;
}

/**
 * Streaming variant. Calls onText(chunk) for each text_delta.
 * Resolves with {text, inputTokens, outputTokens}.
 */
function callAIStream(messages, system, onText, modelAlias, cacheAgent){
  const info = _resolveModelInfo(modelAlias);
  if(info.provider === 'gemini'){
    return _geminiResolveCache({ info, system, tools: [], agent: cacheAgent, agentLabel: cacheAgent && cacheAgent.name })
      .then(cacheCtx => _callGeminiStream(_trimHistory(_capHistory(messages)), system, onText, info, cacheCtx));
  }
  return new Promise((resolve, reject)=>{
    const body = JSON.stringify({
      model: info.modelId,
      max_tokens: info.maxTokens,
      system: _systemBlocks(system),
      messages: _trimHistory(_capHistory(messages)),
      stream:true,
    });
    const req = https.request({
      hostname:'api.anthropic.com',
      path:'/v1/messages',
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'x-api-key':ANTHROPIC,
        'anthropic-version':'2023-06-01',
        'anthropic-beta':'prompt-caching-2024-07-31',
        'Content-Length':Buffer.byteLength(body),
      }
    }, (r)=>{
      let buf = '';
      let fullText = '';
      let inputTokens = 0, outputTokens = 0;
      let stopReason = null;
      let errored = false;
      r.setEncoding('utf8');
      r.on('data', (chunk)=>{
        buf += chunk;
        let i;
        while((i = buf.indexOf('\n\n')) >= 0){
          const event = buf.slice(0, i);
          buf = buf.slice(i + 2);
          let dataLine = '';
          for(const line of event.split('\n')){
            if(line.startsWith('data: ')) dataLine = line.slice(6);
          }
          if(!dataLine) continue;
          try{
            const obj = JSON.parse(dataLine);
            if(obj.type === 'content_block_delta' && obj.delta && obj.delta.type === 'text_delta'){
              const t = obj.delta.text || '';
              fullText += t;
              try{ onText(t); }catch(e){}
            } else if(obj.type === 'message_start' && obj.message && obj.message.usage){
              inputTokens = obj.message.usage.input_tokens || 0;
            } else if(obj.type === 'message_delta'){
              if(obj.usage) outputTokens = obj.usage.output_tokens || outputTokens;
              if(obj.delta && obj.delta.stop_reason) stopReason = obj.delta.stop_reason;
            } else if(obj.type === 'error'){
              errored = true;
              reject(new Error(obj.error?.message || 'Anthropic stream error'));
              try{ r.destroy(); }catch(e){}
              return;
            }
          }catch(e){ /* ignore parse errors on partial events */ }
        }
      });
      r.on('end', ()=>{
        if(!errored){
          // If max_tokens was reached mid-response, append a friendly note so
          // the user knows the answer was cut off (and isn't a server bug).
          let finalText = fullText;
          if(stopReason === 'max_tokens'){
            finalText += '\n\n…（出力上限に達したため途中までです。続きを生成するには「続けて」と送ってください）';
          }
          resolve({text: finalText, inputTokens, outputTokens, stopReason});
        }
      });
      r.on('error', (e)=>{ if(!errored) reject(e); });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Variant with tool definitions (for Google Chrome integration via Tool Use)
async function callAIWithTools(messages,system,tools,toolChoice,modelAlias,cacheAgent){
  const info = _resolveModelInfo(modelAlias);
  // Gemini: route through the Gemini-specific implementation. Server-managed
  // Anthropic tools (web_search / web_fetch) are stripped inside _antToGeminiTools
  // because Gemini doesn't host them — if the agent really needs web, the
  // user should pick a Sonnet/Opus agent for that task.
  if(info.provider === 'gemini'){
    const cacheCtx = await _geminiResolveCache({ info, system, tools, agent: cacheAgent, agentLabel: cacheAgent && cacheAgent.name });
    return _callGeminiWithTools(messages, system, tools, toolChoice, info, cacheCtx);
  }
  // Single retry on 429 with short backoff — Render edge times out around 60–100s
  // so we can't afford long waits. Surface the rate limit to the user instead.
  let attempt = 0;
  let useCache = true;
  // Build the anthropic-beta header. web_fetch (server tool) needs an opt-in
  // beta flag — without it, the request fails silently and the agent ends up
  // saying "I can't fetch URLs". Add the flag when any web tool is in `tools`.
  const betas = ['prompt-caching-2024-07-31'];
  const hasWebFetch = Array.isArray(tools) && tools.some(t => t && (t.type==='web_fetch_20250910' || t.name==='web_fetch'));
  if(hasWebFetch) betas.push('web-fetch-2025-09-10');
  const headers = {'Content-Type':'application/json','x-api-key':ANTHROPIC,'anthropic-version':'2023-06-01','anthropic-beta': betas.join(',')};
  // DEBUG: log when web tools are being sent so we can verify in Render logs
  const toolNames = Array.isArray(tools) ? tools.map(t => t && (t.name || t.type)).filter(Boolean) : [];
  if(toolNames.length){
    console.log('[chat] tools sent:', toolNames.join(','), '/ betas:', betas.join(','));
  }
  while(true){
    const sys = useCache ? _systemBlocks(system) : String(system||'');
    const cachedTools = useCache ? _toolsWithCache(tools) : tools;
    // Honor the agent's chosen model (sonnet by default) instead of always
    // falling back to Haiku. Tool-use chats used to be hardcoded to Haiku here
    // which was the dominant reason users said "Claude.ai feels smarter" —
    // they were comparing Claude.ai's Sonnet/Opus output to our chat running
    // on the cheapest tier despite the agent.model selector.
    const reqBody = {
      model: info.modelId,
      max_tokens: info.maxTokens,
      system: sys,
      messages: _trimHistory(messages),
      tools: cachedTools,
    };
    if(toolChoice){ reqBody.tool_choice = toolChoice; }
    const r=await httpsReq('POST','api.anthropic.com','/v1/messages',headers,
                           reqBody,
                           {timeout: 120000});
    if(r.s===200){
      // DEBUG: log stop_reason and any tool_use blocks the model decided to call
      try{
        const blocks = (r.d && r.d.content) || [];
        const used = blocks.filter(b => b.type==='tool_use' || b.type==='server_tool_use').map(b => b.name||b.type);
        console.log('[chat] stop=', r.d.stop_reason, '/ tools_used=', used.join(',') || 'none');
      }catch(e){}
      return r.d;
    }
    if(r.s===400 && useCache && /cache_control|content block/i.test(JSON.stringify(r.d||''))){
      console.warn('[chat] cache_control rejected, retrying without:', JSON.stringify(r.d).slice(0,200));
      useCache = false;
      continue;
    }
    if(r.s===429 && attempt < 1){
      console.warn('[chat] Anthropic 429 rate-limited, retrying once in 5s');
      await new Promise(res=>setTimeout(res, 5000));
      attempt++;
      continue;
    }
    console.error('[chat] Anthropic '+r.s+':', JSON.stringify(r.d||'').slice(0,400));
    throw new Error(r.d?.error?.message||`Anthropic ${r.s}`);
  }
}

/**
 * Strip large data from older tool_result blocks to keep input tokens low.
 * - Drops images from all tool_results except the latest user turn
 * - Truncates text in older tool_result blocks
 * Mutates the messages array.
 */
function _trimToolHistory(messages){
  // Find the index of the LAST user turn that contains tool_result blocks
  let latestToolUserIdx = -1;
  for(let i=messages.length-1; i>=0; i--){
    const m = messages[i];
    if(m.role!=='user' || !Array.isArray(m.content)) continue;
    if(m.content.some(b=>b.type==='tool_result')){ latestToolUserIdx = i; break; }
  }
  for(let i=0; i<messages.length; i++){
    if(i===latestToolUserIdx) continue;
    const m = messages[i];
    if(m.role!=='user' || !Array.isArray(m.content)) continue;
    m.content = m.content.map(b=>{
      if(b.type!=='tool_result') return b;
      // tool_result.content can be string or array of blocks
      if(typeof b.content === 'string'){
        return {...b, content: b.content.slice(0, 400)};
      }
      if(Array.isArray(b.content)){
        const compact = b.content
          .filter(x=>x.type!=='image')                  // drop old screenshots
          .map(x=>x.type==='text' ? {...x, text: (x.text||'').slice(0,400)} : x);
        return {...b, content: compact.length ? compact : '(omitted)'};
      }
      return b;
    });
  }
}

// ── WEB TOOLS (Anthropic-hosted, server-side) ─────────────────
// These are processed by Anthropic's API itself — no Playwright/Chromium
// required, no Render egress hop. They satisfy "browse this URL" /
// "search the web for X" cleanly even on free-tier hosts.
//
// Including them in the `tools` array on a Messages API request
// auto-enables web search + URL fetch. We don't need to handle a
// tool_use round-trip — Anthropic returns the final text directly.
const WEB_TOOLS = [
  { type: 'web_search_20250305', name: 'web_search', max_uses: 5 },
  { type: 'web_fetch_20250910', name: 'web_fetch', max_uses: 5 },
];

// ── BROWSER TOOLS (Google Chrome integration, paid/Docker only) ──
// Kept for hosts where Chromium fits in RAM (≥1.5GB). Not used on
// Render free tier — agents toggle to WEB_TOOLS instead. See callsite.
const browser = require('./browser');
const BROWSER_TOOLS = [
  {
    name:'browse_url',
    description:'指定URLにアクセスしてページのタイトル・テキスト・スクリーンショットを取得します。https:// または http:// で始まるURLを渡してください。',
    input_schema:{
      type:'object',
      properties:{ url:{type:'string',description:'https://〜 形式のURL'} },
      required:['url']
    }
  },
  {
    name:'search_web',
    description:'Web検索を実行して上位10件の結果（タイトル / URL / 抜粋）を取得します。情報を探すときに最初に呼びます。',
    input_schema:{
      type:'object',
      properties:{ query:{type:'string',description:'検索クエリ'} },
      required:['query']
    }
  },
  {
    name:'click_element',
    description:'現在開いているページ内の要素をクリックします。表示テキストでもCSSセレクタでも指定可能。事前に browse_url か search_web でページを開いておく必要があります。',
    input_schema:{
      type:'object',
      properties:{ target:{type:'string',description:'クリックする要素のテキスト or CSSセレクタ'} },
      required:['target']
    }
  },
  {
    name:'type_text',
    description:'現在のページの入力欄に文字列を入力します。事前にページを開いておく必要があります。',
    input_schema:{
      type:'object',
      properties:{
        selector:{type:'string',description:'入力欄のCSSセレクタ または placeholder テキスト'},
        text:{type:'string',description:'入力する文字列'}
      },
      required:['selector','text']
    }
  },
  {
    name:'press_key',
    description:'キーボード操作を実行（Enter / Tab / Escape など）。フォーム送信などに使います。',
    input_schema:{
      type:'object',
      properties:{
        key:{type:'string',description:'押すキー (例: Enter, Tab, Escape)'},
        selector:{type:'string',description:'対象要素のCSSセレクタ（任意、未指定なら現在のフォーカス対象）'}
      },
      required:['key']
    }
  },
  {
    name:'take_screenshot',
    description:'現在開いているページのスクリーンショットを取得します。',
    input_schema:{ type:'object', properties:{} }
  },
  {
    name:'read_page',
    description:'現在開いているページの可視テキストを再取得します（再読込せずに最新の状態を確認）。',
    input_schema:{ type:'object', properties:{} }
  },
  // ── v0.3.0: SPA-friendly primitives + structured page understanding ──
  // These map 1:1 to the extension's content.js handlers added in v0.3.0.
  // For users still on v0.1/v0.2 of the extension the server will return
  // unknown_command — they can re-install to pick up the new tools.
  {
    name:'ext_scroll',
    description:'ページをスクロールします。下にコンテンツが追加読込されるサイト (X / LinkedIn / Notion 等) で必須。selector を指定するとその要素まで scroll。',
    input_schema:{
      type:'object',
      properties:{
        direction:{type:'string',enum:['up','down','left','right'],description:'スクロール方向 (既定: down)'},
        amount:{type:'integer',description:'スクロール量 (px, 既定 600)'},
        selector:{type:'string',description:'特定要素まで scroll したい場合の CSS セレクタ or 表示テキスト'},
      },
    },
  },
  {
    name:'ext_wait_for',
    description:'指定した要素 / テキストが表示されるまで待ちます (最大 timeout_ms 秒)。動的に出現するボタンや読込完了の確認に使う — ext_wait の "とりあえず 2 秒待つ" より確実。',
    input_schema:{
      type:'object',
      properties:{
        selector:{type:'string',description:'CSS セレクタ (推奨)'},
        text:{type:'string',description:'or 表示されるはずのテキスト'},
        timeout_ms:{type:'integer',description:'最大待機ミリ秒 (既定 5000, max 20000)'},
      },
    },
  },
  {
    name:'ext_hover',
    description:'要素にマウスホバーします。ホバーで開くドロップダウンメニュー (Gmail / Notion / SaaS 系) でクリック前に必要なケース。',
    input_schema:{
      type:'object',
      properties:{ target:{type:'string',description:'CSS セレクタ or 表示テキスト'} },
      required:['target'],
    },
  },
  {
    name:'ext_fill_form',
    description:'複数のフォーム入力を 1 コールで一括入力します。サインアップ / 連絡先 / 設定など複数欄あるフォーム向け。selector に CSS or placeholder/aria-label 部分一致が使える。',
    input_schema:{
      type:'object',
      properties:{
        fields:{
          type:'array',
          description:'入力フィールド配列',
          items:{
            type:'object',
            properties:{
              selector:{type:'string',description:'CSS セレクタ or placeholder/aria-label'},
              value:{type:'string',description:'入力する値'},
            },
            required:['selector','value'],
          },
        },
      },
      required:['fields'],
    },
  },
  {
    name:'ext_extract',
    description:'CSS セレクタを使って現在のページから構造化データを抽出します。商品一覧 / レビュー / テーブル等を再パースせず取得。items に複数の「名前と selector」を指定すると、それぞれの全マッチをまとめて返す。',
    input_schema:{
      type:'object',
      properties:{
        items:{
          type:'array',
          description:'抽出ターゲット',
          items:{
            type:'object',
            properties:{
              name:{type:'string',description:'結果の key 名 (例: "titles")'},
              selector:{type:'string',description:'CSS セレクタ (例: ".product-card .name")'},
              attribute:{type:'string',description:'(任意) attribute 名 (例: "href") — 指定しなければ innerText'},
            },
            required:['name','selector'],
          },
        },
      },
      required:['items'],
    },
  },
  {
    name:'ext_read_markdown',
    description:'現在のページを Markdown 形式で読み取ります (見出し・リスト・リンク・コード ブロックを保持)。長文記事・ドキュメント・ブログを正確に把握する時。最大 12,000 文字。',
    input_schema:{ type:'object', properties:{} },
  },
  {
    name:'ext_page_outline',
    description:'ページの構造的アウトラインを取得 (見出し / フォーム / ボタン / リンク のリスト)。「次に何をすべきか」の判断に最適 — 全文を読む前に 1 コール推奨。',
    input_schema:{ type:'object', properties:{} },
  },
  {
    name:'ext_eval',
    description:'ページ上で任意の JavaScript を実行します (async OK)。複雑な抽出や DOM 操作で他のツールが届かない時の最終手段。code は 5000 文字以下、結果は安全 JSON 化されて返ります。',
    input_schema:{
      type:'object',
      properties:{ code:{type:'string',description:'実行する JS (async OK, 最後の return 値が結果)'} },
      required:['code'],
    },
  },
  {
    name:'ext_upload_file',
    description:'AI が生成したファイル (generate_image / generate_pdf 等の URL) を <input type="file"> にアップロード。data_url か /generated/ パスを指定。',
    input_schema:{
      type:'object',
      properties:{
        selector:{type:'string',description:'<input type="file"> の CSS セレクタ'},
        data_url:{type:'string',description:'data:image/png;base64,... 形式 (or /generated/ パスの場合はサーバが data URL に変換)'},
        filename:{type:'string',description:'ファイル名'},
      },
      required:['selector','data_url'],
    },
  },
];

// ── Image generation tools ───────────────────────────────────
// generate_image routes to the best provider for the requested `style`:
//   - 'photo' / 'illustration' / 'anime' → FLUX 1.1 Pro Ultra (fal.ai, $0.06)
//   - 'logo' / 'icon' / 'typography'     → Recraft V3 OR Ideogram V3 ($0.04)
//   - 'auto' / undefined                 → AI hints + best-available
// edit_image takes an existing image URL + instruction → FLUX Kontext.
// Without provider keys, both fall back to Pollinations FLUX Schnell (free).
const IMAGE_TOOLS = [
  {
    name:'generate_image',
    description:'画像を生成。プロンプトは英語の方が品質が高い。style パラメータで「写真風」「ロゴ・タイポグラフィ」「イラスト」を出し分けてください — 用途が違うとモデルが違うので品質が大きく変わります。返ってきた URL は最終応答で必ず markdown 構文 ![短い説明](URL) として埋め込んでください。生成は 5-20 秒。',
    input_schema:{
      type:'object',
      properties:{
        prompt:{type:'string',description:'画像の詳細な英語説明。スタイル・構図・雰囲気も含める。例: "minimalist isometric illustration of a smartphone with 5 AI avatars floating above it, peach gradient background"'},
        style:{type:'string',enum:['auto','photo','illustration','anime','logo','typography','icon'],description:'用途。auto=AI 判断 (default), photo=写真ライク (FLUX Ultra), illustration/anime=イラスト (FLUX Ultra), logo/typography/icon=ロゴ・文字入り・アイコン (Recraft/Ideogram)。'},
        width:{type:'integer',description:'生成幅 (256-1536, 既定 1024)'},
        height:{type:'integer',description:'生成高さ (256-1536, 既定 1024)'},
      },
      required:['prompt'],
    },
  },
  {
    name:'edit_image',
    description:'既存画像を編集 (背景差し替え、要素追加・削除、スタイル変更など)。元画像 URL + 編集指示を英語で渡す。例: "remove the person, keep the cafe interior" / "change the sky to sunset". FLUX Kontext を使うので元画像の構図・キャラクター同一性は維持される。',
    input_schema:{
      type:'object',
      properties:{
        image_url:{type:'string',description:'編集対象の画像 URL (https://... or /generated/...). 直前の generate_image の返り値を渡せる。'},
        instruction:{type:'string',description:'編集指示 (英語推奨, 100 字以内). 例: "replace background with a beach at sunset"'},
        aspect:{type:'string',enum:['1:1','16:9','9:16','4:3','3:4'],description:'出力比率 (既定 1:1)'},
      },
      required:['image_url','instruction'],
    },
  },
];

// ── Video generation tool (Playwright + ffmpeg, zero external API) ──
// AI authors a self-contained HTML/CSS animation; we render it in headless
// Chromium for the requested duration, transcode webm → mp4, and hand back
// a /generated/*.mp4 URL the chat embeds inline via <video>.
const VIDEO_TOOLS = [
  {
    name:'generate_video',
    description:'HTML/CSS アニメーションから動画 (mp4) を生成。SNS マーケティング動画 / ロゴアニメ / 解説動画 / タイポグラフィ / 数値カウントダウン等に最適。実写は不可。input.html は完全な単一 HTML 文書で、CSS @keyframes と animation-delay で時間軸を作ること。任意でナレーション (narration) を指定すると TTS で音声が合成されて mp4 にミックスされます。返ってきた URL は最終応答で markdown 画像構文 ![説明](URL) として埋め込む — チャットが mp4 を <video> として再生します。MY AI Agent ブランド: ピーチ #fb923c, ダーク #0a0a0c, クリーム #fdf8f3, Bebas Neue 見出し。',
    input_schema:{
      type:'object',
      properties:{
        title:{type:'string',description:'動画の短いタイトル (ファイル名に使う, a-z0-9 のみ)'},
        duration_seconds:{type:'integer',description:'録画する秒数 (5-30)'},
        aspect:{type:'string',enum:['landscape','portrait'],description:'landscape = 1280×720 (X / YouTube horizontal), portrait = 1080×1920 (TikTok / Reels / Shorts)'},
        html:{type:'string',description:'完全な HTML 文書 (<!doctype html>...). 動画は最初の duration_seconds 秒間を録画。Google Fonts は <link> で読み込み可。'},
        narration:{type:'string',description:'(任意) 音声で読み上げるナレーション。英語推奨 (TTS 品質が一番高い)。1-300 文字。短すぎる/長すぎると不自然になるので動画長 (秒) × ~14 文字を目安に。'},
        voice:{type:'string',enum:['alloy','echo','fable','onyx','nova','shimmer'],description:'TTS の声 (OpenAI 互換)。alloy=中性, nova=明るい, echo=温かい, fable=ストーリーテラー, onyx=深い男声, shimmer=明るい女声'},
      },
      required:['title','duration_seconds','aspect','html'],
    },
  },
];

// ── Tier-1 media + utility tools (all zero-cost) ──────────────
//
// generate_audio   — TTS standalone mp3 (Pollinations openai-audio)
// generate_pdf     — Playwright page.pdf() from arbitrary HTML
// generate_chart   — Chart.js + Playwright headless screenshot
// generate_diagram — Mermaid via kroki.io public service
// send_email       — Resend, restricted to the user's own email
// generate_qr      — qrcode npm package, local
const MEDIA_UTIL_TOOLS = [
  {
    name:'generate_audio',
    description:'TTS で音声 (mp3) を単体生成。ポッドキャストクリップ、ボイスメモ、SNS 音声投稿、留守電など。英語推奨。',
    input_schema:{
      type:'object',
      properties:{
        text:{type:'string',description:'読み上げる本文 (1-800 文字, 英語推奨)'},
        voice:{type:'string',enum:['alloy','echo','fable','onyx','nova','shimmer'],description:'voice。alloy=neutral, nova=energetic, echo=warm, fable=storyteller, onyx=deep, shimmer=bright'},
        title:{type:'string',description:'ファイル名用の短いタイトル (a-z0-9)'},
      },
      required:['text'],
    },
  },
  {
    name:'generate_pdf',
    description:'HTML から PDF を生成。請求書、提案書、レポート、ホワイトペーパー、契約書ドラフトなどに最適。完全な HTML 文書を渡すこと。@page CSS で印刷余白も指定可。',
    input_schema:{
      type:'object',
      properties:{
        html:{type:'string',description:'完全な HTML 文書 (<!doctype html>...). A4 印刷向けに余白を考慮。'},
        title:{type:'string',description:'ファイル名 (a-z0-9)'},
        format:{type:'string',enum:['A4','Letter','Legal','Tabloid'],description:'用紙サイズ (既定 A4)'},
        landscape:{type:'boolean',description:'横向きにする場合は true'},
      },
      required:['html','title'],
    },
  },
  {
    name:'generate_chart',
    description:'グラフ画像 (PNG) を生成。売上推移・KPI ダッシュボード・カテゴリ分布・比較表など、数字を視覚化したい時に使う。Chart.js を裏で使うので、データは Chart.js v4 の dataset 形式で渡す。',
    input_schema:{
      type:'object',
      properties:{
        type:{type:'string',enum:['bar','line','pie','doughnut','radar','polarArea'],description:'チャート種別'},
        title:{type:'string',description:'チャートのタイトル'},
        labels:{type:'array',items:{type:'string'},description:'X 軸ラベル (例: ["Mon","Tue","Wed"])'},
        datasets:{type:'array',description:'Chart.js datasets 配列。例: [{label:"Signups", data:[12,19,30], backgroundColor:"#fb923c"}]',items:{type:'object'}},
        width:{type:'integer',description:'幅 px (default 800, max 1600)'},
        height:{type:'integer',description:'高さ px (default 500, max 1200)'},
      },
      required:['type','labels','datasets'],
    },
  },
  {
    name:'generate_diagram',
    description:'Mermaid 記法から図 (フローチャート/シーケンス図/ER 図/ガント/組織図など) の PNG 画像を生成。技術仕様・ワークフロー・組織設計の可視化に。',
    input_schema:{
      type:'object',
      properties:{
        mermaid:{type:'string',description:'Mermaid ソースコード (例: "graph LR\\nA-->B\\nB-->C")'},
        title:{type:'string',description:'ファイル名 (a-z0-9)'},
      },
      required:['mermaid'],
    },
  },
  {
    name:'send_email',
    description:'ユーザー自身のメールアドレスにメールを送信します。要約・レポート・リマインダー・調査結果の自分宛通知などに使う。安全のため、宛先は **ユーザー本人のみ** で他人には送れません。',
    input_schema:{
      type:'object',
      properties:{
        subject:{type:'string',description:'件名 (1-100 文字)'},
        html_body:{type:'string',description:'HTML 本文。inline style 推奨 (メールクライアントは外部 CSS 非対応が多い)。'},
        text_body:{type:'string',description:'(任意) プレーンテキスト fallback'},
      },
      required:['subject','html_body'],
    },
  },
  {
    name:'generate_qr',
    description:'QR コード画像を生成。招待 URL・決済リンク・イベント参加・名刺などに使う。テキストは URL でも任意の文字列でも可。',
    input_schema:{
      type:'object',
      properties:{
        text:{type:'string',description:'QR にエンコードする内容 (URL または任意文字列, 最大 1000 文字)'},
        size:{type:'integer',description:'解像度 px (default 400, max 1024)'},
        title:{type:'string',description:'ファイル名 (a-z0-9)'},
      },
      required:['text'],
    },
  },
  {
    name:'create_artifact',
    description:`完全な HTML/CSS/JS で構成された 1 ページのモックサイト / ランディングページ / デモ / 計算機 / ダッシュボード / インタラクティブな図表などを生成し、チャット内で iframe としてインライン表示する。Claude.ai の Artifacts と同じ感覚。

【最重要：デザイン品質を最大化すること】
ユーザーは "見せたら相手が感動する" レベルを期待している。default Tailwind を貼っただけの「それっぽい」ページではダメ。Linear / Stripe / Vercel / Apple / Anthropic / Notion / Figma の LP に並べても遜色ない仕上がりを目指すこと。

▼ 必ず守る design rules (この通り作れば 9 割クオリティが出る):

1. **タイポグラフィを最初に決める**
   - 見出しは display フォント。Google Fonts から: Inter / DM Serif Display / Space Grotesk / Geist / Bricolage Grotesque / Instrument Serif / Playfair Display のどれか。本文は Inter or DM Sans。
   - 見出しは font-weight: 800-900, letter-spacing: -0.02em ~ -0.04em, line-height: 0.95-1.05。
   - h1 は 56-96px (clamp で responsive), h2 40-64px, 本文 16-18px / line-height 1.6-1.7。
   - 等幅は SF Mono / JetBrains Mono / Geist Mono。

2. **カラーシステムを 3 色以内で決める**
   - メインの 1 色 (#fb923c など) + ニュートラル系 2-3 階調 + アクセント 1 色だけ。
   - default Tailwind の bg-blue-500 みたいな出来合いの色は使うな。HSL で微調整した独自色 or 既製ブランド (Linear: #5e6ad2, Vercel: #000/#fafafa, Notion: #2e2e2e + #ff7849) を引用。
   - 大胆な背景: 黒地 (#0a0a0a) / オフホワイト (#fafaf7) / 1 色の薄いグラデーション。グレー一色のミニマルは「無印良品」レベルでないと逆に貧相に見える。

3. **余白 (whitespace) を恐れない**
   - セクション間 padding: 96-160px vertical。
   - hero の上下 padding はビューポートの 12-18%。
   - 要素間は 24/32/48/64px をシステマティックに使う。
   - 「詰まってる」と感じたらだいたい余白不足。

4. **視覚階層を明確に**
   - 最重要メッセージは画面に 1 つだけ。それ以外は意図的に小さく/薄く。
   - キャッチコピーは 1 行で完結する強い言葉。説明は副次的なサイズで。

5. **質感ディテール**
   - Box shadow は subtle。\`0 1px 2px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.08)\` のような multi-layer shadow。
   - Border は \`1px solid rgba(0,0,0,.06)\` レベルの薄さ。
   - Border-radius は 8 / 12 / 16 / 24 のどれかに統一 (混ぜない)。
   - Hover transition は 150-220ms cubic-bezier(0.4, 0, 0.2, 1)。

6. **画像 / イラスト**
   - placeholder は \`https://picsum.photos/seed/<word>/800/600\` か \`https://api.dicebear.com/7.x/...\` を使う。Lorem ipsum 画像で穴を埋めない。
   - 図は素の SVG を inline で描く (アイコン: \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\`)。Font Awesome 等は最終手段。
   - Lucide icons (\`https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/<name>.svg\`) が一番きれい。

7. **動き / インタラクティブ**
   - hero に subtle な animation (fade-in-up 600ms ease-out)。
   - hover で要素は 1-3px translate + shadow 強化。
   - 計算機 / ダッシュボードなら値が変わる時に number-tween アニメ (Alpine x-transition でも CSS でも)。

8. **モバイル対応**
   - レイアウトは max-width: 1200px + 中央寄せ。
   - clamp() で font-size を流動的に。
   - メディアクエリは 1 つで十分 (\`@media (max-width: 720px)\`)。

9. **使える CDN (build なしで動く OK な物)**
   - Tailwind: \`<script src="https://cdn.tailwindcss.com"></script>\` (config を <script> で渡せる)
   - Alpine.js: \`<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>\`
   - htmx: \`https://unpkg.com/htmx.org@1.9\`
   - Chart.js: \`https://cdn.jsdelivr.net/npm/chart.js\`
   - Three.js: \`https://cdn.jsdelivr.net/npm/three@0.160/build/three.min.js\`
   - GSAP: \`https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js\`
   - Google Fonts (link rel=stylesheet で読み込み)
   - Lucide icons (上記)
   React/Vue のビルドが必要な物は不可。

10. **やってはいけない**
    - default Tailwind の \`text-gray-600 bg-gray-100\` 一色貼り
    - すべての見出しを font-bold text-2xl のような中途半端なサイズで揃える
    - emoji を装飾にむやみに使う (1 ページに 1-2 個まで)
    - 大量のコピーを段落で並べる (情報密度より読みやすさ)
    - 真四角の枠線 box-shadow 強めのコンビ ("Bootstrap 2014" になる)
    - placeholder 画像のリンク先が画像でない (404 になる)

▼ 出力前の self-check:
- 見出しのフォントは display フォントになっているか?
- カラーパレットは 3 色 (+ニュートラル) 以内か?
- セクション間に十分な余白 (80px+) があるか?
- ファーストビュー 1 つだけ強い見出しか?
- shadow / border は subtle で複層か?

▼ 引数:
- title: ファイル名 + 表示タイトル (a-z0-9-, 1-40 文字)
- html: 完全な単一 HTML 文書 (<!doctype html>...). 自己完結 — JS / CSS は CDN のみ参照可。
- description: (任意) 何を作ったか 1-2 行の説明`,
    input_schema:{
      type:'object',
      properties:{
        title:{type:'string',description:'ファイル名 + 表示タイトル (a-z0-9-, 1-40 文字)'},
        html:{type:'string',description:'完全な単一 HTML 文書 (<!doctype html>...)。デザイン品質は上記 10 ルールに厳密に従うこと — default Tailwind 貼り付けレベルではダメ。'},
        description:{type:'string',description:'(任意) 何を作ったか 1-2 行の説明'},
        style_ref:{type:'string',description:'(任意) 目指す美意識のリファレンス。例: "linear", "stripe", "apple", "vercel", "notion", "figma", "editorial-magazine", "brutalist", "soft-pastel". 1 つ選ぶと出力が安定する。'},
      },
      required:['title','html'],
    },
  },
  {
    name:'generate_agent_promo_video',
    description:'今チャットしている AI エージェント自身の縦長 (9:16) 9 秒プロモ動画を生成します。ユーザーが SNS でこの AI をシェアしたい時に呼ぶ。引数は不要 — agent.name / persona / skills / avatar を自動で使う。TikTok / Reels / YouTube Shorts 向け。',
    input_schema:{
      type:'object',
      properties:{
        // No required inputs — the agent template uses the active agent's
        // own metadata. Accept an optional `tagline` override for spice.
        tagline:{type:'string',description:'(任意) ペルソナの代わりに使う 1-2 行のキャッチコピー'},
      },
    },
  },
  {
    name:'notify_slack',
    description:'ユーザーが設定済みの Slack Incoming Webhook へメッセージを投稿します。リマインダー・売上アラート・新規ユーザー通知・スケジュールの結果など、Slack で受け取りたい内容に使う。事前に Settings で Slack Webhook URL を保存している必要があります。',
    input_schema:{
      type:'object',
      properties:{
        text:{type:'string',description:'Slack に投稿する本文 (1-3500 文字, Slack mrkdwn 可)'},
        username:{type:'string',description:'(任意) 投稿者名の上書き'},
      },
      required:['text'],
    },
  },
  {
    name:'notify_discord',
    description:'ユーザーが設定済みの Discord Webhook へメッセージを投稿します。事前に Settings で Discord Webhook URL を保存している必要があります。',
    input_schema:{
      type:'object',
      properties:{
        text:{type:'string',description:'Discord に投稿する本文 (1-1900 文字, Discord markdown 可)'},
        username:{type:'string',description:'(任意) 投稿者名の上書き'},
      },
      required:['text'],
    },
  },
];

// Lazy: only load these when generate_video first fires. Keeps cold-boot fast.
let _playwrightChromium = null;
let _ffmpegStaticPath   = null;
function _loadVideoDeps(){
  if(!_playwrightChromium){
    try { _playwrightChromium = require('playwright').chromium; }
    catch(e){ throw new Error('playwright module not installed: ' + e.message); }
    // Probe the actual Chromium binary too — postinstall `playwright install chromium`
    // can silently fail on free-tier hosts (network/disk) and we'd otherwise blow up
    // inside .launch() with a much less clear error.
    try {
      const exec = _playwrightChromium.executablePath();
      if(!fs.existsSync(exec)){
        throw new Error('Chromium binary missing at ' + exec + ' — run: npx playwright install chromium');
      }
    } catch(e){ throw new Error('Chromium check failed: ' + e.message); }
  }
  if(!_ffmpegStaticPath){
    try { _ffmpegStaticPath = require('ffmpeg-static'); }
    catch(e){ throw new Error('ffmpeg-static module not installed: ' + e.message); }
    if(!fs.existsSync(_ffmpegStaticPath)){
      throw new Error('ffmpeg binary missing at ' + _ffmpegStaticPath);
    }
  }
  return { chromium: _playwrightChromium, ffmpegPath: _ffmpegStaticPath };
}

// Low-memory Chromium args — Render's free tier is ~512MB, which is right at
// the edge for Chromium + Node. These flags shave ~80-150MB off peak usage.
const _CHROMIUM_LAUNCH_ARGS = [
  '--no-sandbox',
  '--disable-dev-shm-usage',           // critical on small /dev/shm hosts
  '--disable-gpu',
  '--disable-software-rasterizer',
  '--disable-extensions',
  '--disable-background-networking',
  '--disable-default-apps',
  '--disable-sync',
  '--no-first-run',
  '--no-zygote',
  '--mute-audio',
];

const GENERATED_DIR = path.join(PUBLIC_DIR, 'generated');
try { fs.mkdirSync(GENERATED_DIR, { recursive: true }); } catch(e){}

// Sweep videos older than 24h every hour to keep the public/ disk bounded.
setInterval(() => {
  try {
    const now = Date.now();
    const ttl = 24 * 3600 * 1000;
    for(const f of fs.readdirSync(GENERATED_DIR)){
      if(!/\.(mp4|webm)$/.test(f)) continue;
      const p = path.join(GENERATED_DIR, f);
      try {
        const st = fs.statSync(p);
        if((now - st.mtimeMs) > ttl) fs.unlinkSync(p);
      } catch(e){}
    }
  } catch(e){}
}, 60 * 60 * 1000);

// ── TTS via Pollinations (OpenAI-audio compat, no key, free) ──
// Pollinations exposes OpenAI's TTS through their text endpoint. We hit
// GET text.pollinations.ai/<prompt>?model=openai-audio&voice=<v> and the
// response body is an mp3 byte stream.
async function _generateNarrationMp3(text, voice, outPath){
  const clean = String(text || '').slice(0, 800);
  if(!clean) throw new Error('empty narration');
  const safeVoice = ['alloy','echo','fable','onyx','nova','shimmer'].includes(voice) ? voice : 'alloy';
  const url = 'https://text.pollinations.ai/' + encodeURIComponent(clean)
            + '?model=openai-audio&voice=' + safeVoice;
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search, method: 'GET',
      timeout: 45000,
      headers: { 'Accept': 'audio/mpeg' },
    }, (res) => {
      if(res.statusCode !== 200){
        return reject(new Error('TTS HTTP ' + res.statusCode));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if(buf.length < 1000) return reject(new Error('TTS response too small (' + buf.length + ' bytes)'));
        fs.writeFileSync(outPath, buf);
        resolve();
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('TTS timeout')); });
    req.end();
  });
}

async function _recordHtmlToMp4(html, outPath, durationSec, aspect, narration, voice){
  const { chromium, ffmpegPath } = _loadVideoDeps();
  const tmpDir = path.dirname(outPath);
  fs.mkdirSync(tmpDir, { recursive: true });
  const tmpHtml = path.join(tmpDir, '.tmp-' + crypto.randomBytes(6).toString('hex') + '.html');
  fs.writeFileSync(tmpHtml, html);
  const size = aspect === 'portrait' ? { width:1080, height:1920 } : { width:1280, height:720 };

  // Kick off TTS in parallel with the video recording so end-to-end latency
  // is max(record, tts) instead of record + tts.
  let ttsPath = null;
  let ttsPromise = null;
  if(narration && narration.trim()){
    ttsPath = path.join(tmpDir, '.narr-' + crypto.randomBytes(6).toString('hex') + '.mp3');
    ttsPromise = _generateNarrationMp3(narration, voice, ttsPath).catch(e => {
      console.warn('[generate_video] TTS failed, falling back to silent:', e.message);
      ttsPath = null;
    });
  }

  let webmPath = null;
  const browser = await chromium.launch({ args: _CHROMIUM_LAUNCH_ARGS });
  try {
    const context = await browser.newContext({ viewport: size, recordVideo: { dir: tmpDir, size } });
    const page = await context.newPage();
    await page.goto('file://' + tmpHtml);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(durationSec * 1000);
    await context.close();
  } finally {
    await browser.close();
    try { fs.unlinkSync(tmpHtml); } catch(e){}
  }
  // Locate the freshest webm produced by Playwright
  const candidates = fs.readdirSync(tmpDir)
    .filter(f => f.endsWith('.webm') && !f.startsWith('.tmp-') && !f.startsWith('.narr-'))
    .map(f => ({ f, t: fs.statSync(path.join(tmpDir, f)).mtimeMs }))
    .sort((a,b) => b.t - a.t);
  if(!candidates.length) throw new Error('Playwright produced no webm');
  webmPath = path.join(tmpDir, candidates[0].f);

  // Wait for TTS to finish (started before recording)
  if(ttsPromise) await ttsPromise;

  // Transcode to mp4, optionally muxing in the TTS track. If the audio is
  // shorter than the video, ffmpeg pads with silence (apad). If it's longer,
  // we let it ride to the video end (-shortest implicitly, since we pin the
  // duration to the video stream length via -map).
  const useAudio = ttsPath && fs.existsSync(ttsPath);
  const args = ['-y', '-i', webmPath];
  if(useAudio) args.push('-i', ttsPath);
  args.push(
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', '-preset', 'fast', '-crf', '24',
  );
  if(useAudio){
    args.push(
      '-c:a', 'aac', '-b:a', '128k',
      '-af', 'apad',          // pad short narration with silence
      '-shortest',            // cut audio at video end if longer
      '-map', '0:v:0', '-map', '1:a:0',
    );
  }
  args.push(outPath);

  await new Promise((resolve, reject) => {
    const proc = require('child_process').spawn(ffmpegPath, args);
    proc.stderr.on('data', () => {}); // discard
    proc.on('close', (code) => code === 0 ? resolve() : reject(new Error('ffmpeg exit ' + code)));
    proc.on('error', reject);
  });
  try { fs.unlinkSync(webmPath); } catch(e){}
  if(ttsPath){ try { fs.unlinkSync(ttsPath); } catch(e){} }
}

async function executeAgentPromoVideo(agent){
  if(!agent) return { error: 'no_agent_context' };
  const name = String(agent.name || 'AI').slice(0, 40);
  const avatar = String(agent.avatar || '🤖').slice(0, 6);
  const persona = String(agent.persona || '').slice(0, 140) || 'Your personal AI on MY AI AGENT.';
  const skills = (Array.isArray(agent.skills) ? agent.skills : []).slice(0,4);
  const safeTitle = name.toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,30) || 'agent';
  const skillsHtml = skills.length
    ? skills.map(s => `<span class="sk">${_xmlEscape(s)}</span>`).join('')
    : '<span class="sk">Talk to me</span>';
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Promo</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif;}
  html,body{width:100%;height:100%;background:#1a0a00;color:#fff8f0;overflow:hidden;}
  .stage{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 40px;background:linear-gradient(180deg,#1a0a00,#3d1a0a 60%,#1a0a00);position:relative;}
  .stage::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 20%,rgba(251,146,60,.22),transparent 50%),radial-gradient(circle at 70% 80%,rgba(234,88,12,.18),transparent 60%);}
  .av{width:200px;height:200px;border-radius:48px;background:linear-gradient(135deg,#fb923c,#ea580c);display:flex;align-items:center;justify-content:center;font-size:104px;font-weight:800;box-shadow:0 30px 90px rgba(251,146,60,.45);position:relative;z-index:1;animation:av-in 1.5s cubic-bezier(.18,.89,.32,1.28) both;}
  @keyframes av-in{0%{transform:scale(.5) rotate(-12deg);opacity:0}80%{transform:scale(1.05) rotate(2deg);opacity:1}100%{transform:scale(1) rotate(0)}}
  .nm{font-size:64px;font-weight:900;margin:32px 0 14px;letter-spacing:-.03em;text-align:center;position:relative;z-index:1;animation:slide-up 1.2s .35s cubic-bezier(.16,.84,.44,1) both;}
  .pe{font-size:24px;color:#ffd7b0;line-height:1.4;max-width:680px;text-align:center;font-weight:600;position:relative;z-index:1;animation:slide-up 1.2s .55s cubic-bezier(.16,.84,.44,1) both;}
  .skills{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:24px;position:relative;z-index:1;animation:slide-up 1.2s .8s cubic-bezier(.16,.84,.44,1) both;}
  .sk{background:rgba(251,146,60,.15);border:2px solid rgba(251,146,60,.4);color:#fb923c;padding:10px 18px;border-radius:999px;font-weight:800;font-size:16px;letter-spacing:.02em;}
  .badge{position:absolute;top:50px;left:0;right:0;text-align:center;font-size:14px;color:#ea580c;font-weight:900;letter-spacing:.4em;animation:fade-in 1s 1.2s both;}
  .ctab{position:absolute;bottom:60px;left:0;right:0;text-align:center;font-size:18px;color:rgba(255,248,240,.7);animation:slide-up 1.2s 1.5s cubic-bezier(.16,.84,.44,1) both;}
  .ctab b{color:#fb923c;font-weight:900;}
  @keyframes slide-up{0%{transform:translateY(40px);opacity:0}100%{transform:translateY(0);opacity:1}}
  @keyframes fade-in{0%{opacity:0}100%{opacity:1}}
</style>
</head><body>
<div class="stage">
  <div class="badge">MY AI AGENT</div>
  <div class="av">${avatar}</div>
  <div class="nm">${_xmlEscape(name)}</div>
  <div class="pe">${_xmlEscape(persona)}</div>
  <div class="skills">${skillsHtml}</div>
  <div class="ctab">Try <b>${_xmlEscape(name)}</b> for free → myaiagents.agency</div>
</div>
</body></html>`;
  const id = crypto.randomBytes(5).toString('hex');
  const filename = 'promo-' + safeTitle + '-' + id + '.mp4';
  const outPath = path.join(GENERATED_DIR, filename);
  const narration = `Meet ${name}. ${persona.slice(0,100)}. Available now on MY AI AGENT.`;
  try {
    await _recordHtmlToMp4(html, outPath, 9, 'portrait', narration, 'nova');
  } catch(e){
    console.error('[promo_video] failed:', e.message);
    return { error: 'render_failed: ' + (e.message||'unknown') };
  }
  const sizeKb = Math.round(fs.statSync(outPath).size / 1024);
  const url = '/generated/' + filename;
  return {
    url,
    aspect: 'portrait',
    duration_seconds: 9,
    size_kb: sizeKb,
    markdown: '![' + safeTitle + '-promo](' + url + ')',
    instructions: '生成した縦長プロモ動画。最終応答に上記 markdown を含めてユーザーが SNS に投稿しやすいよう促してください (例: 「TikTok / Reels / YouTube Shorts にどうぞ」)。',
  };
}

async function executeVideoTool(name, input){
  if(name !== 'generate_video') return { error: 'unknown_video_tool: ' + name };
  const safeTitle = String(input && input.title || 'video')
    .toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40) || 'video';
  const duration = Math.max(5, Math.min(30, parseInt(input.duration_seconds) || 10));
  const aspect = input.aspect === 'portrait' ? 'portrait' : 'landscape';
  const html = String(input.html || '');
  if(html.length < 100)  return { error: 'html too short (need a complete HTML document)' };
  if(html.length > 80000) return { error: 'html too long (max 80KB)' };
  const narration = String(input.narration || '').trim().slice(0, 800);
  const voice = ['alloy','echo','fable','onyx','nova','shimmer'].includes(input.voice) ? input.voice : 'alloy';

  const id = crypto.randomBytes(5).toString('hex');
  const filename = safeTitle + '-' + id + '.mp4';
  const outPath = path.join(GENERATED_DIR, filename);
  try {
    await _recordHtmlToMp4(html, outPath, duration, aspect, narration, voice);
  } catch(e){
    console.error('[generate_video] failed:', e.message);
    if(e.stack) console.error(e.stack.split('\n').slice(0,4).join(' | '));
    return { error: 'render_failed: ' + (e.message || 'unknown') };
  }
  const sizeKb = Math.round(fs.statSync(outPath).size / 1024);
  const url = '/generated/' + filename;
  return {
    url,
    duration_seconds: duration,
    aspect,
    size_kb: sizeKb,
    has_audio: !!narration,
    voice: narration ? voice : null,
    markdown: '![' + safeTitle + '](' + url + ')',
    instructions: '次の最終応答で必ず上記 markdown 構文を本文に含めてください。チャットが mp4 を <video> として自動的にインライン再生します。',
  };
}

// encodeURIComponent leaves ( ) ! * ' ~ unencoded because RFC 3986 lists them
// as "sub-delims" — fine for transport, but they break the markdown image
// regex ![](...) which stops at the first ')'. Force-encode them so URLs
// embedded in chat render correctly.
function _encodeForMd(s){
  return encodeURIComponent(s)
    .replace(/\(/g, '%28').replace(/\)/g, '%29')
    .replace(/\!/g, '%21').replace(/\*/g, '%2A')
    .replace(/'/g,  '%27');
}

// ── Server-side public-web tools (no extension required) ────────────
// ── MCP (Model Context Protocol) client ───────────────────────
// MCP is the emerging standard for AI-tool plumbing (Anthropic-led, now
// industry-wide). One MCP client implementation gives this app instant
// access to hundreds of services: GitHub, Slack, Notion, Linear, Stripe,
// Zapier (→ 6,000+ apps), Brave Search, Puppeteer, etc.
//
// Wire shape:
//   user.mcp_servers = [{id, name, url, auth?, enabled, added_at}]
//   agent.mcp_server_ids = [serverId, ...]   (per-agent enable)
//
// Cache shape: in-memory only (cleared on server restart). Tools rarely
// change so 30 min TTL is fine; users can hit "Refresh" in the UI to
// invalidate.
const _mcpToolsCache = new Map(); // serverId → { tools, at }
const MCP_TOOLS_TTL_MS = 30 * 60 * 1000;

// Sanitize a tool name into Anthropic's `[a-zA-Z0-9_-]+` constraint, max 64.
function _mcpSafeToolName(serverId, toolName){
  const prefix = 'mcp_' + serverId + '_';
  const safe = String(toolName||'').replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 64 - prefix.length);
  return (prefix + safe).slice(0, 64);
}

// Issue a JSON-RPC 2.0 call to an MCP HTTP endpoint. Supports both plain-JSON
// and SSE-wrapped responses (some servers return "data: {...}\n\n").
function _mcpRpc(serverUrl, method, params, auth){
  return new Promise((resolve)=>{
    let url;
    try { url = new URL(serverUrl); } catch(e){ resolve({ ok:false, error:'invalid url' }); return; }
    const body = JSON.stringify({ jsonrpc:'2.0', id: Date.now() + Math.floor(Math.random()*1000), method, params: params || {} });
    const headers = {
      'Content-Type':'application/json',
      'Accept':'application/json, text/event-stream',
      'Content-Length': Buffer.byteLength(body),
      'User-Agent':'MY-AI-Agent/1.0',
    };
    if(auth) headers['Authorization'] = auth;
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + (url.search || ''),
      method:'POST',
      headers,
    }, (r)=>{
      let buf = '';
      r.setEncoding('utf8');
      r.on('data', c => buf += c);
      r.on('end', ()=>{
        if(r.statusCode >= 400){
          resolve({ ok:false, status:r.statusCode, error:'HTTP '+r.statusCode+' '+buf.slice(0,200) });
          return;
        }
        try {
          // SSE-style? Pick the first `data: {...}` line.
          let data;
          if(buf.indexOf('data: ') === 0 || buf.indexOf('\ndata: ') >= 0){
            const dataLine = buf.split('\n').find(l => l.startsWith('data: '));
            data = dataLine ? JSON.parse(dataLine.slice(6)) : null;
          } else {
            data = JSON.parse(buf || '{}');
          }
          if(data && data.error){
            resolve({ ok:false, error: data.error.message || JSON.stringify(data.error).slice(0,200) });
            return;
          }
          resolve({ ok:true, data });
        } catch(e){
          resolve({ ok:false, error:'parse: ' + e.message, raw: buf.slice(0,200) });
        }
      });
    });
    req.on('error', e => resolve({ ok:false, error:e.message }));
    req.setTimeout(30000, ()=> req.destroy(new Error('timeout')));
    req.write(body); req.end();
  });
}

async function _mcpListTools(server, opts){
  if(!opts || !opts.force){
    const cached = _mcpToolsCache.get(server.id);
    if(cached && (Date.now() - cached.at) < MCP_TOOLS_TTL_MS) return cached.tools;
  }
  // Best-effort initialize (some MCP servers require this, others don't care)
  await _mcpRpc(server.url, 'initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name:'MY AI Agent', version:'1.0' },
  }, server.auth);
  const r = await _mcpRpc(server.url, 'tools/list', {}, server.auth);
  if(!r.ok || !r.data || !r.data.result || !Array.isArray(r.data.result.tools)){
    console.warn('[mcp] list_tools failed server=' + server.id + ' err=' + (r.error||''));
    _mcpToolsCache.set(server.id, { tools: [], at: Date.now(), error: r.error || 'list_tools failed' });
    return [];
  }
  const tools = r.data.result.tools;
  _mcpToolsCache.set(server.id, { tools, at: Date.now() });
  return tools;
}

async function _mcpCallTool(server, toolName, args){
  const r = await _mcpRpc(server.url, 'tools/call', {
    name: toolName,
    arguments: args || {},
  }, server.auth);
  if(!r.ok){
    return { error: 'mcp_call_failed: ' + (r.error || 'unknown') };
  }
  const result = (r.data && r.data.result) || {};
  if(result.isError){
    const errText = (result.content||[]).map(c => c.text||'').join('\n');
    return { error: errText || 'mcp tool returned isError' };
  }
  // Aggregate textual content into a single string for AI consumption.
  const blocks = result.content || [];
  const textParts = [];
  const imageUrls = [];
  for(const b of blocks){
    if(b.type === 'text' && b.text) textParts.push(b.text);
    else if(b.type === 'image' && b.data){ imageUrls.push('data:'+(b.mimeType||'image/png')+';base64,'+b.data); }
    else if(b.type === 'resource' && b.resource && b.resource.uri) textParts.push('[resource: '+b.resource.uri+']');
  }
  return {
    ok: true,
    text: textParts.join('\n\n').slice(0, 30000),
    images: imageUrls,
    raw: result,
  };
}

// Compose MCP tools for chat: list user's MCP servers enabled for THIS agent,
// fetch their tool catalog (cached), and wrap in Anthropic format with a
// stable `mcp_<serverId>_<toolName>` prefix so the dispatch can route back.
async function _composeMcpToolsForAgent(user, agent){
  const allServers = Array.isArray(user && user.mcp_servers) ? user.mcp_servers : [];
  if(allServers.length === 0) return { tools: [], routing: new Map() };
  // Per-agent enable: if agent.mcp_server_ids is undefined → all servers; if
  // present → only those listed. This way new servers default to on for
  // existing agents (less friction).
  const enabledIds = Array.isArray(agent && agent.mcp_server_ids) ? agent.mcp_server_ids : null;
  const servers = allServers.filter(s => s && s.enabled !== false && (!enabledIds || enabledIds.includes(s.id)));
  if(servers.length === 0) return { tools: [], routing: new Map() };
  const tools = [];
  const routing = new Map(); // anthropicToolName → { server, toolName }
  for(const s of servers){
    try {
      const mcpTools = await _mcpListTools(s);
      for(const t of mcpTools){
        if(!t || !t.name) continue;
        const anthName = _mcpSafeToolName(s.id, t.name);
        tools.push({
          name: anthName,
          description: '[' + (s.name||s.id) + '] ' + (t.description||t.name||''),
          input_schema: t.inputSchema || { type:'object', properties:{} },
        });
        routing.set(anthName, { server: s, toolName: t.name });
      }
    } catch(e){
      console.warn('[mcp] compose failed server=' + s.id + ' err=' + e.message);
    }
  }
  return { tools, routing };
}

// ── GitHub integration tools ──────────────────────────────────
// Indie / solo developers store their "second brain" in GitHub repos:
// READMEs, issue threads, commit messages, design docs. With a personal
// access token (PAT) the AI can read this context and answer specifically
// against the user's actual codebase — something ChatGPT structurally
// cannot do.
// MVP: read-only (search / read / list). Write support (create issue,
// open PR comment) deferred to phase 2.
const GITHUB_TOOLS = [
  {
    name:'github_create_pr',
    description:'GitHub repo にファイル変更を含む Pull Request を作成。AI がコードを修正して PR を出すフロー。direct main push は禁止 — 必ず新ブランチ + PR 経由。ユーザーは GitHub の PR 画面でレビューしてマージする。',
    input_schema:{
      type:'object',
      properties:{
        repo:{type:'string',description:'owner/repo 形式 (例: myorg/myapp)'},
        title:{type:'string',description:'PR タイトル (60 字以内推奨)'},
        body:{type:'string',description:'PR 本文 (markdown OK, 変更理由 + テスト方針 を書く)'},
        branch:{type:'string',description:'新規ブランチ名 (例: ai/fix-auth-bug)。base から枝分かれする。'},
        base:{type:'string',description:'base branch (省略時は main / master)'},
        changes:{
          type:'array',
          description:'変更ファイル群',
          items:{
            type:'object',
            properties:{
              path:{type:'string',description:'ルートからのパス'},
              content:{type:'string',description:'新しいファイル全文 (UTF-8 テキスト)'},
              message:{type:'string',description:'このファイルのコミットメッセージ (任意)'},
            },
            required:['path','content'],
          },
        },
      },
      required:['repo','title','branch','changes'],
    },
  },
  {
    name:'github_create_issue',
    description:'GitHub repo に Issue を作成。バグ報告・タスク作成に使う。',
    input_schema:{
      type:'object',
      properties:{
        repo:{type:'string',description:'owner/repo 形式'},
        title:{type:'string',description:'Issue タイトル'},
        body:{type:'string',description:'本文 (markdown OK)'},
        labels:{type:'array',items:{type:'string'},description:'ラベル配列 (任意)'},
      },
      required:['repo','title'],
    },
  },
  {
    name:'github_search_code',
    description:'GitHub のあなたのリポジトリ全体からコード検索。"todo handler" のような自然語クエリでも OK。返ってきたファイルパスは github_get_file で詳細を取得できます。',
    input_schema:{
      type:'object',
      properties:{
        query:{type:'string',description:'検索文字列 (関数名 / TODO 文字列 / 設定キー など)'},
        repo:{type:'string',description:'特定 repo に限定する場合: owner/repo 形式 (任意)'},
        max_results:{type:'integer',description:'最大件数 (1-20, 既定 8)'},
      },
      required:['query'],
    },
  },
  {
    name:'github_get_file',
    description:'GitHub repo 内の特定ファイルの中身を取得。README、設定ファイル、コードファイルなど。',
    input_schema:{
      type:'object',
      properties:{
        repo:{type:'string',description:'owner/repo 形式 (例: myorg/myapp)'},
        path:{type:'string',description:'リポジトリルートからのファイルパス (例: src/index.ts)'},
        ref:{type:'string',description:'ブランチ / コミット / タグ (任意, 既定 default branch)'},
      },
      required:['repo','path'],
    },
  },
  {
    name:'github_list_issues',
    description:'GitHub repo の Issue / PR を一覧。タイトル + 本文の冒頭 + 状態を返す。バグ調査・タスク棚卸しに使う。',
    input_schema:{
      type:'object',
      properties:{
        repo:{type:'string',description:'owner/repo 形式'},
        state:{type:'string',enum:['open','closed','all'],description:'状態フィルタ (既定 open)'},
        labels:{type:'string',description:'カンマ区切りラベル (任意)'},
        max_results:{type:'integer',description:'最大件数 (1-30, 既定 10)'},
      },
      required:['repo'],
    },
  },
];

async function executeGitHubTool(user, name, input){
  const pat = (user && (user.github_pat || (user.integrations && user.integrations.github && user.integrations.github.pat))) || '';
  if(!pat){
    return { error: 'GitHub PAT が未登録です。設定 → 連携 で Personal Access Token を登録してください。' };
  }
  const headers = {
    'Authorization': 'Bearer ' + pat,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'MY-AI-Agent',
  };
  const getJson = (path) => new Promise((resolve)=>{
    const url = new URL('https://api.github.com' + path);
    const req = https.request({
      hostname: url.hostname, path: url.pathname + url.search, method:'GET', headers,
    }, (r)=>{
      let buf=''; r.on('data', c => buf += c);
      r.on('end', ()=>{ try { resolve({ status:r.statusCode, data: JSON.parse(buf||'null') }); } catch(e){ resolve({status:r.statusCode, data:null, raw:buf}); } });
    });
    req.on('error', e => resolve({status:0, data:null, error:e.message}));
    req.setTimeout(25000, ()=> req.destroy(new Error('timeout')));
    req.end();
  });
  // POST/PUT helper for write ops. Body is JSON-serialized.
  const sendJson = (method, path, body) => new Promise((resolve)=>{
    const url = new URL('https://api.github.com' + path);
    const payload = JSON.stringify(body || {});
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: { ...headers, 'Content-Type':'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, (r)=>{
      let buf=''; r.on('data', c => buf += c);
      r.on('end', ()=>{ try { resolve({ status:r.statusCode, data: JSON.parse(buf||'null') }); } catch(e){ resolve({status:r.statusCode, data:null, raw:buf}); } });
    });
    req.on('error', e => resolve({status:0, data:null, error:e.message}));
    req.setTimeout(25000, ()=> req.destroy(new Error('timeout')));
    req.write(payload); req.end();
  });
  try {
    // ── Write ops ───────────────────────────────────────
    if(name === 'github_create_pr'){
      const repo = String(input.repo||'').trim();
      const title = String(input.title||'').trim();
      const body = String(input.body||'');
      const branch = String(input.branch||'').trim();
      const baseRequested = String(input.base||'').trim();
      const changes = Array.isArray(input.changes) ? input.changes.filter(c => c && c.path && typeof c.content === 'string') : [];
      if(!repo || !title || !branch) return { error: 'repo / title / branch required' };
      if(changes.length === 0) return { error: 'changes[] is empty' };
      if(changes.length > 30) return { error: 'too many file changes in one PR (max 30)' };
      // 1) Resolve base branch — use requested or repo default
      let base = baseRequested;
      if(!base){
        const repoInfo = await getJson('/repos/' + repo);
        if(repoInfo.status !== 200) return { error: 'repo lookup failed: HTTP ' + repoInfo.status };
        base = repoInfo.data.default_branch || 'main';
      }
      // 2) Get base SHA
      const baseRef = await getJson('/repos/' + repo + '/git/refs/heads/' + encodeURIComponent(base));
      if(baseRef.status !== 200 || !baseRef.data.object){
        return { error: 'base branch "' + base + '" not found (HTTP ' + baseRef.status + ')' };
      }
      const baseSha = baseRef.data.object.sha;
      // 3) Create the new branch
      const branchRes = await sendJson('POST', '/repos/' + repo + '/git/refs', {
        ref: 'refs/heads/' + branch,
        sha: baseSha,
      });
      if(branchRes.status !== 201 && branchRes.status !== 422){
        // 422 = ref already exists → reuse it; everything else is a hard fail
        return { error: 'branch create failed: HTTP ' + branchRes.status + ' ' + ((branchRes.data && branchRes.data.message) || '') };
      }
      // 4) Commit each file change to the new branch
      const committed = [];
      for(const ch of changes){
        const path = String(ch.path).replace(/^\//,'');
        // Need to know whether file exists on this branch (PUT requires SHA when updating)
        const existing = await getJson('/repos/' + repo + '/contents/' + encodeURI(path) + '?ref=' + encodeURIComponent(branch));
        const putBody = {
          message: String(ch.message || 'AI: update ' + path),
          content: Buffer.from(String(ch.content), 'utf8').toString('base64'),
          branch,
        };
        if(existing.status === 200 && existing.data && existing.data.sha) putBody.sha = existing.data.sha;
        const putRes = await sendJson('PUT', '/repos/' + repo + '/contents/' + encodeURI(path), putBody);
        if(putRes.status !== 200 && putRes.status !== 201){
          return { error: 'file write failed (' + path + '): HTTP ' + putRes.status + ' ' + ((putRes.data && putRes.data.message) || '') };
        }
        committed.push({ path, url: putRes.data && putRes.data.content && putRes.data.content.html_url });
      }
      // 5) Open the PR
      const prRes = await sendJson('POST', '/repos/' + repo + '/pulls', {
        title, body, head: branch, base,
      });
      if(prRes.status !== 201){
        return {
          error: 'PR open failed: HTTP ' + prRes.status + ' ' + ((prRes.data && prRes.data.message) || ''),
          branch_url: 'https://github.com/' + repo + '/tree/' + branch,
          committed,
        };
      }
      return {
        ok: true,
        url: prRes.data.html_url,
        number: prRes.data.number,
        branch,
        base,
        committed_files: committed.length,
        markdown: '🔀 [PR #' + prRes.data.number + ': ' + title + '](' + prRes.data.html_url + ')',
        instructions: '次の応答で markdown リンクを本文に含めてください。',
      };
    }
    if(name === 'github_create_issue'){
      const repo = String(input.repo||'').trim();
      const title = String(input.title||'').trim();
      if(!repo || !title) return { error: 'repo and title required' };
      const r = await sendJson('POST', '/repos/' + repo + '/issues', {
        title,
        body: String(input.body || ''),
        labels: Array.isArray(input.labels) ? input.labels.slice(0, 10) : undefined,
      });
      if(r.status !== 201){
        return { error: 'issue create failed: HTTP ' + r.status + ' ' + ((r.data && r.data.message) || '') };
      }
      return {
        ok: true,
        url: r.data.html_url,
        number: r.data.number,
        markdown: '📋 [Issue #' + r.data.number + ': ' + title + '](' + r.data.html_url + ')',
      };
    }
    if(name === 'github_search_code'){
      const q = String(input.query||'').trim();
      if(!q) return { error: 'query required' };
      const max = Math.max(1, Math.min(20, parseInt(input.max_results)||8));
      // GitHub search syntax: q + qualifiers
      let query = encodeURIComponent(q);
      if(input.repo) query += '+repo:'+encodeURIComponent(input.repo);
      else query += '+user:@me'; // search user's own repos
      const r = await getJson('/search/code?q=' + query + '&per_page=' + max);
      if(r.status === 422) return { error: 'GitHub 検索は user/repo 修飾子が必要。repo を指定するか、PAT に repo スコープが必要です。' };
      if(r.status !== 200) return { error: 'github_search_code HTTP '+r.status };
      const items = (r.data && r.data.items || []).slice(0, max).map(x => ({
        repo: x.repository && x.repository.full_name,
        path: x.path,
        url: x.html_url,
        score: x.score,
      }));
      return { count: items.length, results: items };
    }
    if(name === 'github_get_file'){
      const repo = String(input.repo||'').trim();
      const path = String(input.path||'').trim();
      if(!repo || !path) return { error: 'repo and path required' };
      const ref = input.ref ? '?ref=' + encodeURIComponent(input.ref) : '';
      const r = await getJson('/repos/' + repo + '/contents/' + encodeURI(path) + ref);
      if(r.status === 404) return { error: 'file not found' };
      if(r.status !== 200) return { error: 'github_get_file HTTP '+r.status };
      const d = r.data;
      if(d.type !== 'file') return { error: 'not a file (got: '+d.type+')' };
      let content = '';
      try { content = Buffer.from(d.content || '', 'base64').toString('utf8'); } catch(e){}
      if(content.length > 30000) content = content.slice(0, 30000) + '\n…(truncated)';
      return { repo, path, size: d.size, content, url: d.html_url };
    }
    if(name === 'github_list_issues'){
      const repo = String(input.repo||'').trim();
      if(!repo) return { error: 'repo required' };
      const state = ['open','closed','all'].includes(input.state) ? input.state : 'open';
      const max = Math.max(1, Math.min(30, parseInt(input.max_results)||10));
      const labels = input.labels ? '&labels=' + encodeURIComponent(input.labels) : '';
      const r = await getJson('/repos/' + repo + '/issues?state=' + state + '&per_page=' + max + labels);
      if(r.status !== 200) return { error: 'github_list_issues HTTP '+r.status };
      const items = (r.data || []).map(x => ({
        number: x.number,
        title: x.title,
        state: x.state,
        body: (x.body || '').slice(0, 400),
        labels: (x.labels||[]).map(l => l.name),
        url: x.html_url,
        is_pr: !!x.pull_request,
      }));
      return { count: items.length, issues: items };
    }
    return { error: 'unknown github tool: ' + name };
  } catch(e){
    return { error: 'github_tool_failed: ' + (e.message||'unknown') };
  }
}

// These let the agent operate on PUBLIC sites without needing the Chrome
// extension or even being on desktop. Anything that needs login still
// goes through ext_* (the user's authenticated browser). Anything public
// (news, docs, leaderboards, marketing pages) can be done server-side.
const WEB_NATIVE_TOOLS = [
  {
    name:'web_screenshot',
    description:'公開 URL のスクリーンショットを撮ります (拡張機能・ログイン不要)。AI が「このページを見たい」時の最速手段。',
    input_schema:{
      type:'object',
      properties:{
        url:{type:'string',description:'https://〜 形式の公開 URL'},
        full_page:{type:'boolean',description:'true で全画面 / false で viewport のみ (既定 false)'},
        viewport:{type:'string',enum:['desktop','mobile'],description:'desktop=1280×800, mobile=390×844'},
      },
      required:['url'],
    },
  },
  {
    name:'web_read_markdown',
    description:'公開 URL のページを Markdown 化して読みます (拡張機能・ログイン不要)。ニュース記事・ドキュメント・ブログ・GitHub README 等を高品質で取得。',
    input_schema:{
      type:'object',
      properties:{ url:{type:'string',description:'公開 URL'} },
      required:['url'],
    },
  },
  {
    name:'web_extract',
    description:'公開 URL から CSS セレクタで構造化データを抽出 (拡張機能・ログイン不要)。商品一覧 / リーダーボード / 検索結果のスクレイピングに。',
    input_schema:{
      type:'object',
      properties:{
        url:{type:'string',description:'公開 URL'},
        items:{
          type:'array',
          description:'抽出対象。例: [{name:"titles", selector:".post h2"}, {name:"urls", selector:".post a", attribute:"href"}]',
          items:{
            type:'object',
            properties:{
              name:{type:'string'},
              selector:{type:'string'},
              attribute:{type:'string'},
            },
            required:['name','selector'],
          },
        },
      },
      required:['url','items'],
    },
  },
];

async function _runWebTask(url, action){
  const { chromium } = _loadVideoDeps();
  if(!/^https?:\/\//i.test(url)) throw new Error('url must be http(s)');
  const browser = await chromium.launch({ args: _CHROMIUM_LAUNCH_ARGS });
  try {
    const ctx = await browser.newContext({
      viewport: action.viewport === 'mobile' ? { width:390, height:844 } : { width:1280, height:800 },
      userAgent: action.viewport === 'mobile'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil:'networkidle', timeout: 25000 });
    return await action.run(page);
  } finally {
    await browser.close();
  }
}

async function executeWebScreenshotTool(input){
  const url = String(input.url||'').trim();
  if(!url) return { error: 'url required' };
  const id = crypto.randomBytes(5).toString('hex');
  const filename = 'webshot-' + id + '.png';
  const outPath = path.join(GENERATED_DIR, filename);
  try {
    await _runWebTask(url, {
      viewport: input.viewport,
      run: async (page) => {
        await page.screenshot({ path: outPath, fullPage: !!input.full_page, type:'png' });
      },
    });
  } catch(e){
    console.error('[web_screenshot] failed:', e.message);
    return { error: 'screenshot_failed: ' + e.message };
  }
  return {
    url: '/generated/' + filename,
    source_url: url,
    size_kb: Math.round(fs.statSync(outPath).size / 1024),
    markdown: '![web screenshot](/generated/' + filename + ')',
  };
}

async function executeWebReadMdTool(input){
  const url = String(input.url||'').trim();
  if(!url) return { error: 'url required' };
  try {
    const result = await _runWebTask(url, {
      run: async (page) => {
        await page.waitForTimeout(300);
        // Server-side DOM walk that mirrors the content.js getMarkdown logic.
        return await page.evaluate(() => {
          const root = document.querySelector('main, article, [role="main"]') || document.body;
          const out = [];
          function walk(node) {
            if (!node) return;
            if (node.nodeType === Node.TEXT_NODE) { const t = node.textContent.replace(/\s+/g,' '); if(t.trim()) out.push(t); return; }
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            const tag = node.tagName.toLowerCase();
            if (['script','style','noscript','svg','iframe','nav','footer'].includes(tag)) return;
            if (/^h[1-6]$/.test(tag)) { out.push('\n\n'+'#'.repeat(+tag.slice(1))+' '+(node.innerText||'').trim()+'\n'); return; }
            if (tag === 'p')  { out.push('\n\n'); for(const c of node.childNodes) walk(c); return; }
            if (tag === 'br') { out.push('\n'); return; }
            if (tag === 'li') { out.push('\n- '); for(const c of node.childNodes) walk(c); return; }
            if (tag === 'pre'){ out.push('\n\n```\n'+(node.innerText||'')+'\n```\n'); return; }
            if (tag === 'code'){ out.push('`'+(node.innerText||'')+'`'); return; }
            if (tag === 'a' && node.href) { const txt = (node.innerText||'').trim(); if(txt){ out.push('['+txt+']('+node.href+')'); return; } }
            if (tag === 'strong' || tag === 'b') { out.push('**'); for(const c of node.childNodes) walk(c); out.push('**'); return; }
            for (const c of node.childNodes) walk(c);
          }
          walk(root);
          return { title: document.title, markdown: out.join('').replace(/\n{3,}/g,'\n\n').trim().slice(0, 12000) };
        });
      },
    });
    return { source_url: url, ...result };
  } catch(e){
    console.error('[web_read_markdown] failed:', e.message);
    return { error: 'read_failed: ' + e.message };
  }
}

async function executeWebExtractTool(input){
  const url = String(input.url||'').trim();
  const items = Array.isArray(input.items) ? input.items : [];
  if(!url) return { error: 'url required' };
  if(!items.length) return { error: 'items[] required' };
  try {
    const data = await _runWebTask(url, {
      run: async (page) => {
        await page.waitForTimeout(300);
        return await page.evaluate((items) => {
          const out = {};
          for (const it of items) {
            try {
              const nodes = document.querySelectorAll(it.selector);
              out[it.name || it.selector] = Array.from(nodes).slice(0, 200).map(n => {
                if (it.attribute) return n.getAttribute(it.attribute) || '';
                return (n.innerText || n.textContent || '').trim().slice(0, 500);
              });
            } catch (e) { out[it.name || it.selector] = { error: 'bad_selector: ' + e.message }; }
          }
          return out;
        }, items);
      },
    });
    return { source_url: url, data };
  } catch(e){
    console.error('[web_extract] failed:', e.message);
    return { error: 'extract_failed: ' + e.message };
  }
}

async function executeImageTool(name, input){
  if(name !== 'generate_image') return { error: 'unknown_image_tool: ' + name };
  const prompt = String(input && input.prompt || '').trim();
  if(!prompt) return { error: 'prompt required' };
  if(prompt.length > 800) return { error: 'prompt too long (max 800 chars)' };
  const width  = Math.max(256, Math.min(1536, parseInt(input.width)  || 1024));
  const height = Math.max(256, Math.min(1536, parseInt(input.height) || 1024));
  const style  = String(input && input.style || 'auto').toLowerCase();

  // Provider selection — best paid tier first, fall back to free.
  let provider = 'pollinations';
  if(style === 'logo' || style === 'typography' || style === 'icon'){
    if(IDEOGRAM_KEY)     provider = 'ideogram';
    else if(RECRAFT_KEY) provider = 'recraft';
    else if(FAL_KEY)     provider = 'flux-ultra';
  } else if(style === 'photo' || style === 'illustration' || style === 'anime'){
    if(FAL_KEY)         provider = 'flux-ultra';
    else if(RECRAFT_KEY) provider = 'recraft';
  } else {
    // auto — go for the most general high-quality model we have a key for.
    if(FAL_KEY)         provider = 'flux-ultra';
    else if(IDEOGRAM_KEY) provider = 'ideogram';
    else if(RECRAFT_KEY) provider = 'recraft';
  }

  try {
    let result;
    if(provider === 'flux-ultra'){
      result = await _imgFluxUltra(prompt, width, height);
    } else if(provider === 'ideogram'){
      result = await _imgIdeogram(prompt, width, height, style);
    } else if(provider === 'recraft'){
      result = await _imgRecraft(prompt, width, height, style);
    } else {
      result = _imgPollinations(prompt, width, height);
    }
    if(!result || !result.url){
      // Last-ditch fallback so the model always gets *some* image back.
      result = _imgPollinations(prompt, width, height);
      result.provider_fallback = true;
    }
    const altSafe = prompt.replace(/[\[\]()]/g, '').slice(0,120);
    return {
      url: result.url,
      provider: result.provider,
      prompt, style,
      width, height,
      markdown: '![' + altSafe + '](' + result.url + ')',
      instructions: '次の最終応答で必ず上記 markdown を本文に含めてください。そうするとユーザーには画像が直接表示されます。',
    };
  } catch(e){
    console.warn('[image] provider=' + provider + ' failed:', e.message);
    const fb = _imgPollinations(prompt, width, height);
    const altSafe = prompt.replace(/[\[\]()]/g, '').slice(0,120);
    return {
      url: fb.url,
      provider: 'pollinations-fallback',
      prompt, style,
      width, height,
      markdown: '![' + altSafe + '](' + fb.url + ')',
      warning: 'primary provider failed: ' + (e.message||'unknown') + ' — fell back to free tier',
    };
  }
}

// ── Image edit tool — FLUX Kontext ────────────────────────────
async function executeImageEditTool(input){
  const imageUrl = String(input && input.image_url || '').trim();
  const instr    = String(input && input.instruction || '').trim();
  const aspect   = ['1:1','16:9','9:16','4:3','3:4'].includes(input && input.aspect) ? input.aspect : '1:1';
  if(!imageUrl) return { error: 'image_url required' };
  if(!instr)    return { error: 'instruction required' };
  if(instr.length > 400) return { error: 'instruction too long (max 400 chars)' };
  if(!FAL_KEY){
    return { error: 'FLUX Kontext は FAL_KEY が必要です。サーバー管理者に依頼してください。' };
  }
  try {
    // Resolve local /generated/ paths to absolute URLs FAL can fetch.
    let absUrl = imageUrl;
    if(absUrl.startsWith('/generated/')){
      absUrl = APP_URL.replace(/\/$/,'') + absUrl;
    }
    const result = await _imgFluxKontext(absUrl, instr, aspect);
    if(!result || !result.url) return { error: 'edit_failed' };
    const altSafe = instr.replace(/[\[\]()]/g, '').slice(0,120);
    return {
      url: result.url,
      provider: 'flux-kontext',
      source_image: imageUrl,
      instruction: instr,
      aspect,
      markdown: '![' + altSafe + '](' + result.url + ')',
      instructions: '次の最終応答で必ず上記 markdown を本文に含めてください。',
    };
  } catch(e){
    return { error: 'edit_failed: ' + (e.message || 'unknown') };
  }
}

// ── Image provider clients ───────────────────────────────────

function _imgPollinations(prompt, width, height){
  // Free fallback — FLUX Schnell via Pollinations.ai (GET URL, no auth).
  const seed = Math.floor(Math.random() * 999999999);
  const url = 'https://image.pollinations.ai/prompt/'
    + _encodeForMd(prompt)
    + '?width=' + width
    + '&height=' + height
    + '&model=flux&nologo=true&safe=true&seed=' + seed;
  return { url, provider: 'pollinations' };
}

// Generic JSON POST helper for the image providers below.
function _httpsJsonPost(opts){
  return new Promise((resolve, reject)=>{
    const payload = typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body);
    const req = https.request({
      hostname: opts.hostname,
      path: opts.path,
      method: 'POST',
      headers: Object.assign({
        'Content-Type':'application/json',
        'Content-Length': Buffer.byteLength(payload),
      }, opts.headers || {}),
    }, (r)=>{
      let buf = '';
      r.setEncoding('utf8');
      r.on('data', c => buf += c);
      r.on('end', ()=>{
        try {
          const data = buf ? JSON.parse(buf) : {};
          if(r.statusCode >= 400){
            reject(new Error((data && (data.error?.message || data.message)) || ('HTTP '+r.statusCode+': '+buf.slice(0,160))));
            return;
          }
          resolve(data);
        } catch(e){ reject(new Error('parse failed: '+e.message+' / '+buf.slice(0,160))); }
      });
      r.on('error', reject);
    });
    req.setTimeout(opts.timeout || 60000, ()=>{ req.destroy(new Error('timeout')); });
    req.on('error', reject);
    req.write(payload); req.end();
  });
}

// fal.ai uses a request → queue → result pattern. We poll up to ~30s.
async function _falQueueRun(modelPath, input){
  const submit = await _httpsJsonPost({
    hostname: 'queue.fal.run',
    path: '/' + modelPath,
    headers: { Authorization: 'Key ' + FAL_KEY },
    body: input,
  });
  // Synchronous queue can return {images:[...]} directly OR a status_url.
  if(submit && submit.images && submit.images[0] && submit.images[0].url){
    return submit.images[0].url;
  }
  if(!submit || !submit.status_url) throw new Error('fal queue submit returned no status_url');
  // Poll
  for(let i = 0; i < 30; i++){
    await new Promise(r => setTimeout(r, 1500));
    const st = await new Promise((resolve, reject)=>{
      const req = https.request({
        hostname: 'queue.fal.run',
        path: new URL(submit.status_url).pathname + (new URL(submit.status_url).search || ''),
        method: 'GET',
        headers: { Authorization: 'Key ' + FAL_KEY },
      }, (r)=>{
        let buf=''; r.setEncoding('utf8');
        r.on('data', c=>buf+=c);
        r.on('end', ()=>{ try{ resolve(JSON.parse(buf||'{}')); }catch(e){ reject(e); } });
        r.on('error', reject);
      });
      req.on('error', reject); req.end();
    });
    if(st && st.status === 'COMPLETED' && submit.response_url){
      const out = await new Promise((resolve, reject)=>{
        const req = https.request({
          hostname: 'queue.fal.run',
          path: new URL(submit.response_url).pathname,
          method: 'GET',
          headers: { Authorization: 'Key ' + FAL_KEY },
        }, (r)=>{
          let buf=''; r.setEncoding('utf8');
          r.on('data', c=>buf+=c);
          r.on('end', ()=>{ try{ resolve(JSON.parse(buf||'{}')); }catch(e){ reject(e); } });
          r.on('error', reject);
        });
        req.on('error', reject); req.end();
      });
      const u = out && out.images && out.images[0] && out.images[0].url;
      if(u) return u;
      throw new Error('fal completed but no image url');
    }
    if(st && st.status === 'FAILED') throw new Error('fal job failed: ' + JSON.stringify(st).slice(0,200));
  }
  throw new Error('fal timeout');
}

async function _imgFluxUltra(prompt, width, height){
  // FLUX 1.1 [pro] Ultra — fal.ai endpoint.
  const aspect = (width > height) ? '16:9' : (height > width) ? '9:16' : '1:1';
  const url = await _falQueueRun('fal-ai/flux-pro/v1.1-ultra', {
    prompt,
    aspect_ratio: aspect,
    num_images: 1,
    safety_tolerance: '2',
    output_format: 'jpeg',
    enable_safety_checker: true,
  });
  return { url, provider: 'flux-ultra' };
}

async function _imgFluxKontext(imageUrl, instruction, aspect){
  const url = await _falQueueRun('fal-ai/flux-pro/kontext', {
    prompt: instruction,
    image_url: imageUrl,
    aspect_ratio: aspect,
    num_images: 1,
    safety_tolerance: '2',
    output_format: 'jpeg',
  });
  return { url, provider: 'flux-kontext' };
}

async function _imgRecraft(prompt, width, height, style){
  // Recraft V3 — recraftai.com API.
  // Style mapping: realistic_image, digital_illustration, vector_illustration, icon.
  let recraftStyle = 'realistic_image';
  if(style === 'illustration' || style === 'anime') recraftStyle = 'digital_illustration';
  if(style === 'logo' || style === 'typography')    recraftStyle = 'vector_illustration';
  if(style === 'icon')                              recraftStyle = 'icon';
  // Recraft expects size like "1024x1024" — pick the closest supported step.
  const size = _recraftSize(width, height);
  const data = await _httpsJsonPost({
    hostname: 'external.api.recraft.ai',
    path: '/v1/images/generations',
    headers: { Authorization: 'Bearer ' + RECRAFT_KEY },
    body: { prompt, style: recraftStyle, size, n: 1, response_format: 'url' },
  });
  const u = data && data.data && data.data[0] && data.data[0].url;
  if(!u) throw new Error('recraft returned no url');
  return { url: u, provider: 'recraft' };
}
function _recraftSize(w, h){
  // Recraft accepts a fixed set: 1024x1024, 1365x1024, 1024x1365, 1536x1024, 1024x1536, 1820x1024, 1024x1820, 2048x1024, 1024x2048
  if(w === h) return '1024x1024';
  if(w > h){
    if(w / h >= 1.6) return '1536x1024';
    return '1365x1024';
  }
  if(h / w >= 1.6) return '1024x1536';
  return '1024x1365';
}

async function _imgIdeogram(prompt, width, height, style){
  // Ideogram V3 — best for text-in-image and typography/logos.
  const aspect = _ideogramAspect(width, height);
  const styleType = (style === 'logo' || style === 'typography' || style === 'icon') ? 'DESIGN' : 'GENERAL';
  const data = await _httpsJsonPost({
    hostname: 'api.ideogram.ai',
    path: '/v1/ideogram-v3/generate',
    headers: { 'Api-Key': IDEOGRAM_KEY },
    body: {
      prompt,
      aspect_ratio: aspect,
      rendering_speed: 'DEFAULT',
      style_type: styleType,
      num_images: 1,
    },
  });
  const u = data && data.data && data.data[0] && data.data[0].url;
  if(!u) throw new Error('ideogram returned no url');
  return { url: u, provider: 'ideogram' };
}
function _ideogramAspect(w, h){
  if(w === h) return '1x1';
  if(w > h){
    if(w / h >= 1.7) return '16x9';
    if(w / h >= 1.4) return '3x2';
    return '4x3';
  }
  if(h / w >= 1.7) return '9x16';
  if(h / w >= 1.4) return '2x3';
  return '3x4';
}

// ── helpers shared by media utility tools ────────────────────
function _safeName(s, fallback){
  const x = String(s || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  return x || fallback || 'file';
}

// ── 1) generate_audio — standalone TTS mp3 ───────────────────
async function executeAudioTool(input){
  const text  = String(input && input.text || '').trim();
  const voice = ['alloy','echo','fable','onyx','nova','shimmer'].includes(input.voice) ? input.voice : 'alloy';
  if(!text) return { error: 'text required' };
  if(text.length > 800) return { error: 'text too long (max 800 chars)' };
  const title = _safeName(input.title, 'audio');
  const id = crypto.randomBytes(5).toString('hex');
  const filename = title + '-' + id + '.mp3';
  const outPath = path.join(GENERATED_DIR, filename);
  try {
    await _generateNarrationMp3(text, voice, outPath);
  } catch(e){
    return { error: 'tts_failed: ' + (e.message || 'unknown') };
  }
  const url = '/generated/' + filename;
  return {
    url, voice,
    size_kb: Math.round(fs.statSync(outPath).size / 1024),
    markdown: '![' + title + '](' + url + ')',
    instructions: '最終応答で上記 markdown 構文を本文に含めてください。チャットが mp3 を <audio> として再生します。',
  };
}

// ── 2) generate_pdf — HTML → PDF via Playwright ──────────────
async function executePdfTool(input){
  const html = String(input && input.html || '');
  if(html.length < 50)    return { error: 'html too short' };
  if(html.length > 200000) return { error: 'html too long (max 200KB)' };
  const title = _safeName(input.title, 'document');
  const format = ['A4','Letter','Legal','Tabloid'].includes(input.format) ? input.format : 'A4';
  const landscape = !!input.landscape;
  const { chromium } = _loadVideoDeps();
  const id = crypto.randomBytes(5).toString('hex');
  const filename = title + '-' + id + '.pdf';
  const outPath = path.join(GENERATED_DIR, filename);
  const tmpHtml = path.join(GENERATED_DIR, '.tmp-pdf-' + id + '.html');
  fs.writeFileSync(tmpHtml, html);
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('file://' + tmpHtml, { waitUntil:'networkidle' });
    await page.waitForTimeout(400);
    await page.pdf({ path: outPath, format, landscape, printBackground: true,
                     margin:{ top:'18mm', bottom:'18mm', left:'16mm', right:'16mm' } });
  } catch(e){
    console.error('[generate_pdf] failed:', e.message);
    return { error: 'pdf_render_failed: ' + (e.message || 'unknown') };
  } finally {
    if(browser) await browser.close();
    try { fs.unlinkSync(tmpHtml); } catch(e){}
  }
  const url = '/generated/' + filename;
  return {
    url, format, landscape,
    size_kb: Math.round(fs.statSync(outPath).size / 1024),
    markdown: '[📄 ' + title + ' (PDF)](' + url + ')',
    instructions: '最終応答で上記 markdown リンクを本文に含めてください。クリックで PDF が開きます。',
  };
}

// ── 3) generate_chart — Chart.js → PNG via Playwright ────────
async function executeChartTool(input){
  const type = ['bar','line','pie','doughnut','radar','polarArea'].includes(input.type) ? input.type : 'bar';
  const labels = Array.isArray(input.labels) ? input.labels.slice(0,50) : [];
  const datasets = Array.isArray(input.datasets) ? input.datasets.slice(0,8) : [];
  if(!labels.length || !datasets.length) return { error: 'labels and datasets required' };
  const title = _safeName(input.title, 'chart');
  const width  = Math.max(320, Math.min(1600, parseInt(input.width)  || 800));
  const height = Math.max(240, Math.min(1200, parseInt(input.height) || 500));

  const config = { type, data: { labels, datasets },
    options: { responsive:false, animation:false, plugins:{ title:{ display:!!input.title, text:String(input.title||''), font:{ size:18 } } } } };

  const html = '<!doctype html><html><head><meta charset="utf-8">'
    + '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>'
    + '<style>body{margin:0;background:#fff;font-family:-apple-system,sans-serif;}'
    + '#wrap{width:' + width + 'px;height:' + height + 'px;padding:18px;box-sizing:border-box;}</style></head>'
    + '<body><div id="wrap"><canvas id="c" width="' + (width-36) + '" height="' + (height-36) + '"></canvas></div>'
    + '<script>const cfg = ' + JSON.stringify(config) + ';'
    + 'new Chart(document.getElementById("c"), cfg);</script></body></html>';

  const { chromium } = _loadVideoDeps();
  const id = crypto.randomBytes(5).toString('hex');
  const filename = title + '-' + id + '.png';
  const outPath = path.join(GENERATED_DIR, filename);
  const tmpHtml = path.join(GENERATED_DIR, '.tmp-chart-' + id + '.html');
  fs.writeFileSync(tmpHtml, html);
  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({ viewport:{ width, height }, deviceScaleFactor:2 });
    const page = await context.newPage();
    await page.goto('file://' + tmpHtml, { waitUntil:'networkidle' });
    await page.waitForTimeout(500); // let Chart.js render
    await page.screenshot({ path: outPath, type:'png', omitBackground:false });
  } catch(e){
    console.error('[generate_chart] failed:', e.message);
    return { error: 'chart_render_failed: ' + (e.message || 'unknown') };
  } finally {
    if(browser) await browser.close();
    try { fs.unlinkSync(tmpHtml); } catch(e){}
  }
  const url = '/generated/' + filename;
  return {
    url, type, width, height,
    markdown: '![' + title + '](' + url + ')',
    instructions: '最終応答で上記 markdown 画像構文を本文に含めてください。',
  };
}

// ── 4) generate_diagram — Mermaid via kroki.io (free public) ─
async function executeDiagramTool(input){
  const src = String(input && input.mermaid || '').trim();
  if(!src) return { error: 'mermaid source required' };
  if(src.length > 20000) return { error: 'mermaid too long (max 20KB)' };
  const title = _safeName(input.title, 'diagram');

  // kroki accepts POST body. We always go to PNG so the result drops cleanly
  // into the existing markdown image renderer.
  const id = crypto.randomBytes(5).toString('hex');
  const filename = title + '-' + id + '.png';
  const outPath = path.join(GENERATED_DIR, filename);
  try {
    await new Promise((resolve, reject) => {
      const body = Buffer.from(src, 'utf8');
      const req = https.request({
        hostname:'kroki.io', path:'/mermaid/png', method:'POST',
        timeout: 25000,
        headers:{ 'Content-Type':'text/plain', 'Content-Length':body.length, 'Accept':'image/png' },
      }, (res) => {
        if(res.statusCode !== 200) return reject(new Error('Kroki HTTP ' + res.statusCode));
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          if(buf.length < 200) return reject(new Error('kroki returned empty PNG'));
          fs.writeFileSync(outPath, buf);
          resolve();
        });
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('kroki timeout')); });
      req.write(body); req.end();
    });
  } catch(e){
    return { error: 'diagram_render_failed: ' + (e.message || 'unknown') };
  }
  const url = '/generated/' + filename;
  return {
    url,
    size_kb: Math.round(fs.statSync(outPath).size / 1024),
    markdown: '![' + title + '](' + url + ')',
    instructions: '最終応答で上記 markdown 画像構文を本文に含めてください。',
  };
}

// ── 5) send_email — Resend, restricted to user's own address ─
async function executeEmailTool(user, agent, input){
  if(!user || !user.email) return { error: 'no user email on file' };
  const subject = String(input && input.subject || '').slice(0, 100).trim();
  const htmlBody = String(input && input.html_body || '');
  if(!subject)  return { error: 'subject required' };
  if(htmlBody.length < 10)    return { error: 'html_body too short' };
  if(htmlBody.length > 200000) return { error: 'html_body too long (max 200KB)' };
  // Display name: "Sales Tanaka via MY AI Agent" so the recipient instantly
  // sees which agent composed it. All agents still send from the same
  // unified sender address (FROM_EMAIL = noreply@myaiagents.agency).
  const fromName = (agent && agent.name)
    ? (agent.name + ' via MY AI Agent')
    : 'MY AI Agent';
  // Restricted: only to the user's own address. Prevents the agent from
  // spraying mails on the user's behalf without explicit consent.
  try {
    await sendEmail(user.email, subject, htmlBody, { fromName });
  } catch(e){
    return { error: 'email_send_failed: ' + (e.message || 'unknown') };
  }
  return {
    ok: true,
    sent_to: user.email,
    sent_from: FROM_EMAIL,
    from_display: fromName,
    subject,
    instructions: '送信完了。次の応答で 「✉️ メールを ' + user.email + ' に送信しました (差出人: ' + fromName + ')」 と報告してください。',
  };
}

// ── 7) create_artifact — save AI-authored HTML as a live page ────
// Claude.ai-style "Artifacts" — the AI writes a complete self-contained
// HTML doc, we drop it in /generated/ and hand back a URL. The chat
// renders .html URLs as a sandboxed iframe with a control bar.
async function executeArtifactTool(input, ownerUser){
  const title = _safeName(input && input.title, 'artifact');
  const html  = String(input && input.html || '');
  const desc  = String(input && input.description || '').slice(0, 240);
  if(html.length < 50)     return { error: 'html too short' };
  if(html.length > 500000) return { error: 'html too long (max 500KB)' };
  const id = crypto.randomBytes(5).toString('hex');
  const filename = 'artifact-' + title + '-' + id + '.html';
  const outPath = path.join(GENERATED_DIR, filename);
  // Write to ephemeral disk (fast path for this container's lifetime).
  let sizeKb = Math.round(Buffer.byteLength(html, 'utf8') / 1024);
  try {
    fs.writeFileSync(outPath, html, 'utf8');
    sizeKb = Math.round(fs.statSync(outPath).size / 1024);
  } catch(e){
    console.warn('[artifact] disk write failed:', e.message);
    // Continue — DB persistence below is the source of truth on free-tier hosting.
  }
  // Persist to DB so the URL survives container restarts (Render free-tier
  // wipes /generated/ on every deploy). serveStatic falls back to this on miss.
  if(ownerUser){
    try {
      ownerUser.artifacts = Array.isArray(ownerUser.artifacts) ? ownerUser.artifacts : [];
      ownerUser.artifacts.push({
        id, filename, title, description: desc,
        html,
        created_at: new Date().toISOString(),
        size: Buffer.byteLength(html, 'utf8'),
      });
      // Cap at 100 most-recent artifacts per user to keep JSONB row small.
      if(ownerUser.artifacts.length > 100){
        ownerUser.artifacts.splice(0, ownerUser.artifacts.length - 100);
      }
      await DB.save(ownerUser);
    } catch(e){
      console.warn('[artifact] DB persist failed:', e.message);
      // Don't fail the tool call — disk copy might still work for this session.
    }
  }
  const url = '/generated/' + filename;
  return {
    url, title, description: desc,
    size_kb: sizeKb,
    markdown: '![' + title + '](' + url + ')',
    instructions: '最終応答で必ず上記 markdown 構文を本文に含めてください。チャットは URL を「新タブで開く ↗」リンクカードとしてレンダリングします。',
  };
}

// Lookup an artifact by filename across all users (for the static-route
// fallback when the on-disk copy was wiped by a container restart).
async function findArtifactByFilename(filename){
  if(!filename) return null;
  try {
    if(USE_SUPA){
      const filter = encodeURIComponent('[{"filename":"'+filename+'"}]');
      const r = await sbReq('GET','users','?select=*&artifacts=cs.'+filter+'&limit=1');
      if(Array.isArray(r.d) && r.d.length){
        const a = (r.d[0].artifacts||[]).find(x => x.filename===filename);
        if(a) return a;
      }
      // Broad scan fallback.
      const r2 = await sbReq('GET','users','?select=artifacts&limit=2000');
      if(Array.isArray(r2.d)){
        for(const u of r2.d){
          const a = (u.artifacts||[]).find(x => x.filename===filename);
          if(a) return a;
        }
      }
    } else {
      for(const u of LDB.all()){
        const a = (u.artifacts||[]).find(x => x.filename===filename);
        if(a) return a;
      }
    }
  } catch(e){ console.warn('[artifact] lookup failed:', e.message); }
  return null;
}

// ── 6) generate_qr — qrcode npm, fully local ─────────────────
async function executeQrTool(input){
  const text = String(input && input.text || '').trim();
  if(!text) return { error: 'text required' };
  if(text.length > 1000) return { error: 'text too long (max 1000 chars)' };
  const size = Math.max(128, Math.min(1024, parseInt(input.size) || 400));
  const title = _safeName(input.title, 'qr');
  let QRCode;
  try { QRCode = require('qrcode'); }
  catch(e){ return { error: 'qrcode package missing — run: npm install qrcode' }; }
  const id = crypto.randomBytes(5).toString('hex');
  const filename = title + '-' + id + '.png';
  const outPath = path.join(GENERATED_DIR, filename);
  try {
    await QRCode.toFile(outPath, text, {
      width: size, margin: 2,
      color: { dark:'#1a0a00', light:'#ffffff' }, // MY AI Agent brand
      errorCorrectionLevel: 'M',
    });
  } catch(e){
    return { error: 'qr_failed: ' + (e.message || 'unknown') };
  }
  const url = '/generated/' + filename;
  return {
    url, size, text_preview: text.slice(0, 80),
    markdown: '![' + title + '](' + url + ')',
    instructions: '最終応答で上記 markdown 画像構文を本文に含めてください。',
  };
}

// ── Slack / Discord notify (via user-supplied incoming webhooks) ──
async function executeNotifyTool(kind, user, input){
  const text = String(input && input.text || '').trim();
  if(!text) return { error: 'text required' };
  const url = (user && user.outgoing_webhooks && user.outgoing_webhooks[kind]) || '';
  if(!url){
    return { error: kind + '_not_configured', detail: 'Settings → Integrations で ' + kind + ' webhook URL を保存してください。' };
  }
  // Sanity-check the URL shape so we don't proxy arbitrary requests.
  const allowedHost = (kind === 'slack') ? /^https:\/\/hooks\.slack\.com\// : /^https:\/\/(?:discord(?:app)?\.com)\/api\/webhooks\//;
  if(!allowedHost.test(url)){
    return { error: 'invalid_webhook_url', detail: kind + ' webhook URL の形式が想定外です。' };
  }
  const maxLen = kind === 'slack' ? 3500 : 1900;
  const body = kind === 'slack'
    ? JSON.stringify({ text: text.slice(0, maxLen), username: input.username || undefined })
    : JSON.stringify({ content: text.slice(0, maxLen), username: input.username || undefined });
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const opts = {
        method: 'POST',
        hostname: u.hostname,
        path: u.pathname + (u.search || ''),
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      };
      const r = https.request(opts, (rs) => {
        let chunks = '';
        rs.on('data', d => { if(chunks.length < 1000) chunks += d.toString(); });
        rs.on('end', () => {
          if(rs.statusCode && rs.statusCode < 300){
            resolve({ ok:true, status: rs.statusCode, kind, length: text.length });
          } else {
            resolve({ error: kind+'_http_'+rs.statusCode, detail: chunks.slice(0, 200) });
          }
        });
      });
      r.on('error', e => resolve({ error: 'request_failed', detail: e.message }));
      r.setTimeout(8000, () => { r.destroy(new Error('timeout')); });
      r.write(body); r.end();
    } catch(e){ resolve({ error: 'request_failed', detail: e.message }); }
  });
}

// ── Browser-extension live connection registry ───────────────
// In-memory only (single-server deployment). Map from device_token → { res, ... }.
// On multi-instance deploys, swap to Redis pub/sub.
const _extConnections = new Map();    // token → { res, owner_id, heartbeat }
const _extPending = new Map();        // command_id → { resolve, t0, timeout }

// ── Browser Extension tools (require user has paired extension) ──
const EXTENSION_TOOLS = [
  {
    name:'ext_open_url',
    description:'ユーザーのブラウザで指定URLを新しいタブまたは現在のタブで開きます。ログイン済みのサイト (X / Slack / Gmail / 社内SaaS 等) をそのまま操作できます。',
    input_schema:{
      type:'object',
      properties:{
        url:{type:'string',description:'https://〜 形式のURL'},
        in_active_tab:{type:'boolean',description:'true なら現在のアクティブタブで開く（デフォルトは新規タブ）'}
      },
      required:['url']
    }
  },
  {
    name:'ext_read_page',
    description:'現在のアクティブタブの URL・タイトル・本文テキスト・操作可能な要素一覧を取得します。要素操作の前に必ず呼んでください。',
    input_schema:{ type:'object', properties:{} }
  },
  {
    name:'ext_click',
    description:'現在のページ上の要素をクリックします。target は CSS セレクタ または 表示テキストの一部 (どちらでも自動判別)。',
    input_schema:{
      type:'object',
      properties:{ target:{type:'string',description:'例: "投稿" または "[data-testid=tweetButton]"'} },
      required:['target']
    }
  },
  {
    name:'ext_type',
    description:'入力欄に文字列を入力します。selector は CSS or placeholder / aria-label。React/Vue のような SPA でも検出可能。',
    input_schema:{
      type:'object',
      properties:{
        selector:{type:'string',description:'例: "tweetTextarea" または "textarea[name=...]"'},
        text:{type:'string',description:'入力する文字列'}
      },
      required:['selector','text']
    }
  },
  {
    name:'ext_press_key',
    description:'キー押下 (Enter / Escape / Tab 等)。フォーム送信、検索、モーダル閉じるなどに使用。',
    input_schema:{
      type:'object',
      properties:{
        key:{type:'string',description:'例: Enter, Escape, Tab'},
        selector:{type:'string',description:'(任意) 対象要素。未指定ならアクティブ要素'}
      },
      required:['key']
    }
  },
  {
    name:'ext_screenshot',
    description:'現在表示されているタブのスクリーンショット (jpeg, base64) を取得します。視覚的な確認が必要なときだけ。',
    input_schema:{ type:'object', properties:{} }
  },
  {
    name:'ext_wait',
    description:'指定ミリ秒だけ待機します。ページの非同期処理が落ち着くのを待つときに。最大 10000ms。',
    input_schema:{
      type:'object',
      properties:{ ms:{type:'integer',description:'ミリ秒 (1〜10000)'} },
      required:['ms']
    }
  },
  {
    name:'ext_list_tabs',
    description:'現在開いている全タブの一覧を取得します。タブ切り替え前の確認用。',
    input_schema:{ type:'object', properties:{} }
  },
];

// Send a command to the user's connected extension. Returns the result (or {error}).
async function executeExtensionTool(user, name, input){
  const tok = user.extension_device_token;
  if(!tok) return { error:'extension_not_paired: ユーザーがブラウザ拡張を連携していません。' };

  // Chrome MV3 service workers idle out after ~30s, dropping the SSE stream
  // even though the user just saw "Online" in the UI. Wait briefly so the
  // extension's auto-reconnect (or the next chrome.runtime.sendMessage from
  // the web app) has a chance to re-establish the link before we hard-fail.
  let conn = _extConnections.get(tok);
  if(!conn){
    for(let i=0; i<5; i++){
      await new Promise(r=>setTimeout(r, 1000));
      conn = _extConnections.get(tok);
      if(conn) break;
    }
  }
  if(!conn) return { error:'extension_offline: 拡張機能との接続が切れています (Chrome が拡張機能をスリープさせた可能性)。Chrome 拡張アイコンをクリックすると復活します。それでも直らない場合は Chrome を再起動してください。' };

  const command_id = 'cmd_' + crypto.randomBytes(8).toString('hex');
  const realName = name.replace(/^ext_/, ''); // server-side names are ext_*, extension expects bare names
  const cmd = { id: command_id, name: realName, input: input || {} };
  return await new Promise((resolve)=>{
    const timeoutMs = 30000;
    const timeout = setTimeout(()=>{
      _extPending.delete(command_id);
      resolve({ error:'extension_timeout: ブラウザからの応答が30秒以内に返りませんでした。' });
    }, timeoutMs);
    _extPending.set(command_id, { resolve, t0:Date.now(), timeout });
    try{
      conn.res.write('event: cmd\ndata: ' + JSON.stringify(cmd) + '\n\n');
    }catch(e){
      clearTimeout(timeout);
      _extPending.delete(command_id);
      resolve({ error:'extension_send_failed: ' + (e.message||'unknown') });
    }
  });
}

// ── Google Sheets API tools (require user.google_oauth set) ──
const SHEETS_TOOLS = [
  {
    name:'create_calendar_event',
    description:'Google カレンダーに予定を作成します。スケジューリング・会議調整・期限の登録などに使う。タイムゾーン込みの ISO 8601 (例: 2026-05-15T09:00:00+09:00) で start/end を指定。attendees を渡すと招待メールも送られる。事前に Google を連携している必要がある。\n\n【既存ユーザーの注意】Sheets を以前から連携しているアカウントは Calendar 権限が不足している可能性あり。"insufficient_scope" エラーが返ったら、ユーザーに「設定 → Sheets を切断 → 再接続してください (Calendar 権限が追加されます)」と案内すること。',
    input_schema:{
      type:'object',
      properties:{
        summary:{type:'string',description:'予定タイトル (例: "ABC 社との打ち合わせ")'},
        start:{type:'string',description:'開始時刻 ISO 8601 (例: 2026-05-15T09:00:00+09:00)'},
        end:{type:'string',description:'終了時刻 ISO 8601 (例: 2026-05-15T10:00:00+09:00)'},
        description:{type:'string',description:'(任意) 詳細 / アジェンダ。改行可。'},
        location:{type:'string',description:'(任意) 場所 (会議室名 / Zoom URL / 住所)'},
        attendees:{type:'array',items:{type:'string'},description:'(任意) 参加者のメールアドレス配列'},
        calendar_id:{type:'string',description:"(任意) 対象カレンダー ID (省略時 'primary')"},
      },
      required:['summary','start','end'],
    },
  },
  {
    name:'sheets_read',
    description:'指定した Google スプレッドシートからセル値を読みます。range は A1 形式 (例: "シート1!A1:C20")。Spreadsheet ID は URL の /d/ と /edit の間 (例: "1Wq8xv...nMpX...")。',
    input_schema:{
      type:'object',
      properties:{
        spreadsheet_id:{type:'string',description:'スプレッドシートID'},
        range:{type:'string',description:'A1 形式 (例: "Sheet1!A1:Z100")'}
      },
      required:['spreadsheet_id','range']
    }
  },
  {
    name:'sheets_write',
    description:'指定範囲にセル値を書き込みます (上書き)。values は2次元配列 (行x列)。range の左上セルを起点に書き込みます。',
    input_schema:{
      type:'object',
      properties:{
        spreadsheet_id:{type:'string',description:'スプレッドシートID'},
        range:{type:'string',description:'書き込む範囲の左上セル (例: "Sheet1!A2")'},
        values:{type:'array',description:'2次元配列 (行x列)。例: [["山田","営業","東京"],["佐藤","技術","大阪"]]'}
      },
      required:['spreadsheet_id','range','values']
    }
  },
  {
    name:'sheets_append',
    description:'シートの最終行の下に新しい行を追記します。既存データを破壊しません。',
    input_schema:{
      type:'object',
      properties:{
        spreadsheet_id:{type:'string',description:'スプレッドシートID'},
        range:{type:'string',description:'対象シート名 (例: "Sheet1!A:E")'},
        values:{type:'array',description:'2次元配列 (追記する行)'}
      },
      required:['spreadsheet_id','range','values']
    }
  },
  {
    name:'sheets_clear',
    description:'指定範囲のセル値をクリア (削除) します。',
    input_schema:{
      type:'object',
      properties:{
        spreadsheet_id:{type:'string',description:'スプレッドシートID'},
        range:{type:'string',description:'クリアする範囲'}
      },
      required:['spreadsheet_id','range']
    }
  },
  {
    name:'sheets_get_meta',
    description:'スプレッドシートのタイトルとシート名一覧を取得します。シート構成を確認したいときに最初に呼びます。',
    input_schema:{
      type:'object',
      properties:{ spreadsheet_id:{type:'string'} },
      required:['spreadsheet_id']
    }
  },
  {
    name:'sheets_create_spreadsheet',
    description:'新しい Google スプレッドシートをユーザーのアカウントに作成します。タイトルを指定。返り値の url をユーザーに伝えると Google ドライブで開けます。',
    input_schema:{
      type:'object',
      properties:{
        title:{type:'string',description:'新規スプレッドシートのタイトル'},
        sheet_titles:{type:'array',description:'(任意) 初期シート名の配列。例: ["顧客", "商品", "売上"]。省略時はシート1のみ'}
      },
      required:['title']
    }
  },
  {
    name:'sheets_add_sheet',
    description:'既存スプレッドシートに新しいシート(タブ)を追加します。',
    input_schema:{
      type:'object',
      properties:{
        spreadsheet_id:{type:'string'},
        sheet_title:{type:'string',description:'追加する新規シート名'}
      },
      required:['spreadsheet_id','sheet_title']
    }
  },
  {
    name:'sheets_format',
    description:'指定範囲のセル書式を変更します (太字・背景色・テキスト色・フォントサイズ等)。複雑な編集は1回で済ませてください。',
    input_schema:{
      type:'object',
      properties:{
        spreadsheet_id:{type:'string'},
        sheet_title:{type:'string',description:'対象シート名 (sheet_id ではなくシート名)'},
        start_row:{type:'integer',description:'開始行 (1-indexed)'},
        end_row:{type:'integer',description:'終了行 (1-indexed, inclusive)'},
        start_col:{type:'integer',description:'開始列 (1-indexed, A=1)'},
        end_col:{type:'integer',description:'終了列 (1-indexed, inclusive)'},
        bold:{type:'boolean'},
        background:{type:'string',description:'背景色 hex (例 "#FFEB3B" または "#fb923c")'},
        text_color:{type:'string',description:'文字色 hex'},
        font_size:{type:'integer',description:'フォントサイズ pt'},
      },
      required:['spreadsheet_id','sheet_title','start_row','end_row','start_col','end_col']
    }
  },
];

// Common Sheets API request — auto-refreshes token, returns parsed JSON or {error}.
async function _sheetsApi(user, method, pathSuffix, body){
  let token;
  try{ token = await getValidGoogleAccessToken(user); }
  catch(e){ return {error:'sheets_not_connected: '+(e.message||'')}; }
  const headers={'Authorization':`Bearer ${token}`,'Content-Type':'application/json'};
  const r = await httpsReq(method, 'sheets.googleapis.com', pathSuffix, headers, body||null, {timeout:25000});
  if(r.s>=200 && r.s<300) return r.d;
  const errMsg = (r.d && r.d.error && r.d.error.message) || (typeof r.d==='string'?r.d:JSON.stringify(r.d)).slice(0,200);
  // Friendly translation for the most common setup error so the AI does not dump
  // cryptic Google error URLs to end users.
  if(/has not been used in project|disabled\.|consumer.*disabled/i.test(errMsg)){
    return {error:'sheets_setup_pending: Google Sheets API がまだ有効化されていません。アプリ管理者の設定が完了するまでお待ちください (通常1〜2分で反映)。'};
  }
  if(/PERMISSION_DENIED|caller does not have permission/i.test(errMsg)){
    return {error:'sheets_no_permission: このスプレッドシートへのアクセス権がありません。Google で共有設定を確認してください。'};
  }
  if(/Requested entity was not found|notFound/i.test(errMsg)){
    return {error:'sheets_not_found: 指定されたスプレッドシートが見つかりません。URL またはシート名・範囲を確認してください。'};
  }
  // Range parse error usually means the AI guessed a sheet name (e.g. "Sheet1") that
  // doesn't exist. Tell it to call sheets_get_meta first.
  if(/Unable to parse range/i.test(errMsg)){
    return {error:`sheets_bad_range: ${errMsg}. → 必ず先に sheets_get_meta を呼んで本物のシート名を取得し、"<シート名>!A1:Z100" 形式で再試行してください (シート名に日本語やスペースがある場合は 'シート名'!A1 のようにシングルクォートで囲む)。`};
  }
  return {error:`sheets_api_${r.s}: ${errMsg}`};
}

// Sanitize the AI-supplied 2D values array before sending to Sheets API.
// Anthropic sometimes emits objects ({type:'text',text:'...'}) or null cells inside arrays.
// Returns null if the shape is invalid.
function _cleanSheetValues(values){
  if(!Array.isArray(values)) return null;
  return values.map(row=>{
    if(!Array.isArray(row)){
      // Single-value rows: accept and wrap.
      if(row==null || ['string','number','boolean'].includes(typeof row)) return [row==null?'':row];
      return [String(row)];
    }
    return row.map(cell=>{
      if(cell==null) return '';
      if(typeof cell === 'string' || typeof cell === 'number' || typeof cell === 'boolean') return cell;
      // Anthropic sometimes wraps strings in {type:'text',text:'...'} — flatten.
      if(cell && typeof cell.text === 'string') return cell.text;
      return JSON.stringify(cell);
    });
  });
}

// Convert "#RRGGBB" or "#rgb" hex to Google's float-RGB (0..1) color object.
function _hexToRgbFloat(hex){
  const m = String(hex||'').trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if(!m) return null;
  let h = m[1];
  if(h.length===3) h = h.split('').map(c=>c+c).join('');
  const r = parseInt(h.slice(0,2),16) / 255;
  const g = parseInt(h.slice(2,4),16) / 255;
  const b = parseInt(h.slice(4,6),16) / 255;
  return { red:r, green:g, blue:b };
}

async function executeCalendarTool(user, input){
  try {
    if(!user.google_oauth || !user.google_oauth.refresh_token){
      return { error: 'google_not_connected', detail: '設定 → Integrations → Google を再連携してください。' };
    }
    const access = await getValidGoogleAccessToken(user);
    const calId = encodeURIComponent(input.calendar_id || 'primary');
    const body = {
      summary: String(input.summary||'').slice(0,200),
      description: input.description ? String(input.description).slice(0,4000) : undefined,
      location: input.location ? String(input.location).slice(0,200) : undefined,
      start: { dateTime: String(input.start||'') },
      end:   { dateTime: String(input.end||'')   },
      attendees: Array.isArray(input.attendees)
        ? input.attendees.slice(0,30).map(e => ({ email: String(e||'').slice(0,100) })).filter(a => /@/.test(a.email))
        : undefined,
    };
    if(!body.summary || !body.start.dateTime || !body.end.dateTime){
      return { error: 'missing_required_fields', detail: 'summary, start, end は必須' };
    }
    const sendUpdates = (body.attendees && body.attendees.length) ? '?sendUpdates=all' : '';
    const r = await httpsReq(
      'POST', 'www.googleapis.com',
      `/calendar/v3/calendars/${calId}/events${sendUpdates}`,
      { 'Content-Type':'application/json', 'Authorization':'Bearer '+access },
      body
    );
    if(r.s===403 && /insufficient/i.test(JSON.stringify(r.d||''))){
      return { error:'insufficient_scope', detail:'Google を再連携してカレンダー権限を付与してください。' };
    }
    if(r.s>=400) return { error:'calendar_'+r.s, detail: JSON.stringify(r.d).slice(0,300) };
    return {
      ok: true,
      event_id: r.d.id,
      html_link: r.d.htmlLink,
      summary: r.d.summary,
      start: r.d.start && r.d.start.dateTime,
      end:   r.d.end   && r.d.end.dateTime,
      attendees: (r.d.attendees||[]).map(a => a.email),
    };
  } catch(e){
    return { error: 'calendar_failed', detail: (e && e.message || '').slice(0,200) };
  }
}

async function executeSheetsTool(user, name, input){
  try{
    // create_calendar_event is bundled into SHEETS_TOOLS so it ships with the
    // same Google connection; dispatch it before the spreadsheet_id check.
    if(name === 'create_calendar_event'){
      return await executeCalendarTool(user, input);
    }
    const id  = input.spreadsheet_id || '';
    const rng = encodeURIComponent(input.range || '');
    // sheets_create_spreadsheet doesn't need spreadsheet_id; check inside that branch.
    if(!id && name !== 'sheets_create_spreadsheet') return {error:'spreadsheet_id is required'};
    if(name==='sheets_read'){
      const d = await _sheetsApi(user, 'GET', `/v4/spreadsheets/${encodeURIComponent(id)}/values/${rng}`);
      if(d.error) return d;
      // Cap response size to avoid blowing the AI's input window. 500 rows is plenty for
      // analytical work; the AI can request additional ranges if needed.
      const values = d.values || [];
      const MAX_ROWS = 500;
      const truncated = values.length > MAX_ROWS;
      return {
        range: d.range,
        values: truncated ? values.slice(0, MAX_ROWS) : values,
        rows: values.length,
        ...(truncated ? { truncated:true, note:`先頭 ${MAX_ROWS} 行のみ返却。続きを読むには range を分割してください (例: "シート名!A501:Z1000")` } : {}),
      };
    }
    if(name==='sheets_write'){
      // valueInputOption=USER_ENTERED makes Google parse "=SUM(...)" as a formula and
      // "1234" as a number. Pre-clean the values so AI's stray nulls/objects don't choke.
      const cleanValues = _cleanSheetValues(input.values);
      if(!cleanValues) return {error:'values must be a 2D array (rows × cols of strings/numbers/booleans/null)'};
      const d = await _sheetsApi(user, 'PUT',
        `/v4/spreadsheets/${encodeURIComponent(id)}/values/${rng}?valueInputOption=USER_ENTERED`,
        {values: cleanValues});
      if(d.error) return d;
      return { updated_range:d.updatedRange, updated_rows:d.updatedRows, updated_cols:d.updatedColumns };
    }
    if(name==='sheets_append'){
      const cleanValues = _cleanSheetValues(input.values);
      if(!cleanValues) return {error:'values must be a 2D array (rows × cols of strings/numbers/booleans/null)'};
      const d = await _sheetsApi(user, 'POST',
        `/v4/spreadsheets/${encodeURIComponent(id)}/values/${rng}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {values: cleanValues});
      if(d.error) return d;
      return { updated_range: d.updates&&d.updates.updatedRange, appended_rows:(d.updates&&d.updates.updatedRows)||0 };
    }
    if(name==='sheets_clear'){
      const d = await _sheetsApi(user, 'POST',
        `/v4/spreadsheets/${encodeURIComponent(id)}/values/${rng}:clear`, {});
      if(d.error) return d;
      return { cleared_range:d.clearedRange };
    }
    if(name==='sheets_get_meta'){
      const d = await _sheetsApi(user, 'GET', `/v4/spreadsheets/${encodeURIComponent(id)}?fields=properties.title,sheets.properties(title,sheetId,gridProperties)`);
      if(d.error) return d;
      return {
        title:(d.properties&&d.properties.title)||'',
        sheets:(d.sheets||[]).map(s=>({
          title:s.properties&&s.properties.title,
          sheet_id:s.properties&&s.properties.sheetId,
          rows:s.properties&&s.properties.gridProperties&&s.properties.gridProperties.rowCount,
          cols:s.properties&&s.properties.gridProperties&&s.properties.gridProperties.columnCount,
        })),
      };
    }
    if(name==='sheets_create_spreadsheet'){
      // Note: spreadsheet_id NOT required for this op — override the early-return.
      const title = (input.title||'').trim();
      if(!title) return {error:'title is required'};
      const sheetTitles = Array.isArray(input.sheet_titles) && input.sheet_titles.length
        ? input.sheet_titles.filter(t=>typeof t==='string' && t.trim())
        : null;
      const body = {
        properties: { title },
        ...(sheetTitles ? { sheets: sheetTitles.map(t=>({ properties:{title:t} })) } : {}),
      };
      const d = await _sheetsApi(user, 'POST', '/v4/spreadsheets', body);
      if(d.error) return d;
      return {
        spreadsheet_id: d.spreadsheetId,
        url: d.spreadsheetUrl,
        title: d.properties && d.properties.title,
        sheets: (d.sheets||[]).map(s=>s.properties && s.properties.title),
      };
    }
    if(name==='sheets_add_sheet'){
      const t = (input.sheet_title||'').trim();
      if(!t) return {error:'sheet_title is required'};
      const d = await _sheetsApi(user, 'POST',
        `/v4/spreadsheets/${encodeURIComponent(id)}:batchUpdate`,
        { requests:[{ addSheet:{ properties:{ title:t } } }] });
      if(d.error) return d;
      const reply = (d.replies||[])[0];
      const props = reply && reply.addSheet && reply.addSheet.properties;
      return { added_sheet: props ? props.title : t, sheet_id: props ? props.sheetId : null };
    }
    if(name==='sheets_format'){
      // Resolve sheet_title → sheetId via meta call (Google's batchUpdate needs the
      // numeric sheet ID, but we accept human-readable title from the AI for clarity).
      const sheetTitle = (input.sheet_title||'').trim();
      if(!sheetTitle) return {error:'sheet_title is required'};
      const meta = await _sheetsApi(user, 'GET', `/v4/spreadsheets/${encodeURIComponent(id)}?fields=sheets.properties(title,sheetId)`);
      if(meta.error) return meta;
      const sheet = (meta.sheets||[]).find(s=>s.properties && s.properties.title === sheetTitle);
      if(!sheet) return {error:`sheet_not_found: "${sheetTitle}"。利用可能なシート: ${(meta.sheets||[]).map(s=>s.properties&&s.properties.title).filter(Boolean).join(', ')}`};
      const sheetId = sheet.properties.sheetId;
      // Build cellFormat from the optional inputs.
      const cellFormat = {};
      const fields = [];
      if(typeof input.bold==='boolean'){ cellFormat.textFormat = {...(cellFormat.textFormat||{}), bold:input.bold}; fields.push('userEnteredFormat.textFormat.bold'); }
      if(input.background){
        const c = _hexToRgbFloat(input.background);
        if(c){ cellFormat.backgroundColor = c; fields.push('userEnteredFormat.backgroundColor'); }
      }
      if(input.text_color){
        const c = _hexToRgbFloat(input.text_color);
        if(c){ cellFormat.textFormat = {...(cellFormat.textFormat||{}), foregroundColor:c}; fields.push('userEnteredFormat.textFormat.foregroundColor'); }
      }
      if(typeof input.font_size==='number'){ cellFormat.textFormat = {...(cellFormat.textFormat||{}), fontSize:input.font_size}; fields.push('userEnteredFormat.textFormat.fontSize'); }
      if(fields.length===0) return {error:'少なくとも bold / background / text_color / font_size のいずれかを指定してください'};
      const d = await _sheetsApi(user, 'POST',
        `/v4/spreadsheets/${encodeURIComponent(id)}:batchUpdate`,
        { requests:[{ repeatCell:{
          range:{
            sheetId,
            startRowIndex: Math.max(0, (input.start_row|0) - 1),
            endRowIndex: input.end_row|0,
            startColumnIndex: Math.max(0, (input.start_col|0) - 1),
            endColumnIndex: input.end_col|0,
          },
          cell:{ userEnteredFormat: cellFormat },
          fields: fields.join(','),
        } }] });
      if(d.error) return d;
      return { ok:true, formatted:{ sheet:sheetTitle, rows:`${input.start_row}-${input.end_row}`, cols:`${input.start_col}-${input.end_col}` } };
    }
    return {error:'unknown_sheets_tool: '+name};
  }catch(e){
    return {error:'sheets_failed: '+(e&&e.message||String(e))};
  }
}

async function executeBrowserTool(session, name, input, ctx){
  try{
    // Intercept Google Workspace URLs — they require login that the cloud Chromium
    // doesn't have. Redirect AI to the Sheets API tools (or surface enable hint).
    if(name==='browse_url' && /docs\.google\.com\/(spreadsheets|document|presentation)/.test(input.url||'')){
      const sheetsConnected = !!(ctx && ctx.sheetsConnected);
      const sheetsActive = !!(ctx && ctx.sheetsActive);
      if(/spreadsheets/.test(input.url||'')){
        if(sheetsActive){
          return {error:'wrong_tool: Google スプレッドシートには browse_url を使わないでください。代わりに sheets_get_meta → sheets_read を URL から抽出した spreadsheet_id で呼んでください。'};
        }
        if(sheetsConnected){
          return {error:'sheets_disabled_for_this_agent: ユーザーは Google スプレッドシートに接続済みですが、このエージェントの「📊 Google スプレッドシート連携」トグルが OFF のため API ツールが使えません。ユーザーに「エージェント編集 → 📊 トグルを ON にしてください」と案内してください。'};
        }
        return {error:'sheets_not_connected: Google スプレッドシートを編集するにはユーザー側で「+ Google アカウントと接続」が必要です。エージェント編集パネルから接続できます。'};
      }
      return {error:'google_workspace_login_required: Google ドキュメント・スライドはログインが必要なためブラウザでは扱えません。ユーザーに公開エクスポート (CSV/PDF) を依頼してください。'};
    }
    if(name==='browse_url')      return await session.browseUrl(input.url);
    if(name==='search_web')      return await session.searchWeb(input.query);
    if(name==='click_element')   return await session.clickElement(input.target);
    if(name==='type_text')       return await session.typeText(input.selector, input.text);
    if(name==='press_key')       return await session.pressKey(input.key, input.selector);
    if(name==='take_screenshot') return await session.takeScreenshot();
    if(name==='read_page')       return await session.readPage();
    return {error:'unknown_tool: '+name};
  }catch(e){
    return {error:'tool_failed: '+(e&&e.message||String(e))};
  }
}

/** Build a tool_result block; if the tool returned a screenshot, attach it as an image. */
function buildToolResult(toolUseId, name, result){
  // Make a JSON-safe summary (drop big base64 from text portion)
  const summary = {};
  if(result && typeof result==='object'){
    for(const k of Object.keys(result)){
      if(k==='screenshot') continue;
      summary[k] = result[k];
    }
  } else summary.value = result;

  if(result && result.screenshot){
    return {
      type:'tool_result',
      tool_use_id:toolUseId,
      content:[
        {type:'text', text:'[tool='+name+'] '+JSON.stringify(summary)},
        {type:'image', source:{type:'base64', media_type:'image/jpeg', data:result.screenshot}}
      ]
    };
  }
  return {
    type:'tool_result',
    tool_use_id:toolUseId,
    content: JSON.stringify(summary)
  };
}

// ── GOOGLE OAUTH ──────────────────────────────────────────────
function googleAuthURL(){
  const params=new URLSearchParams({
    client_id:GOOGLE_ID,
    redirect_uri:`${APP_URL}/api/auth/google/callback`,
    response_type:'code',
    scope:'openid email profile',
    access_type:'offline',
    prompt:'select_account',
  });
  return`https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function googleExchange(code){
  const r=await httpsReq('POST','oauth2.googleapis.com','/token',
    {'Content-Type':'application/x-www-form-urlencoded'},
    new URLSearchParams({code,client_id:GOOGLE_ID,client_secret:GOOGLE_SEC,
      redirect_uri:`${APP_URL}/api/auth/google/callback`,grant_type:'authorization_code'}).toString());
  if(r.s!==200)throw new Error('Google OAuth exchange failed');
  return r.d;
}

async function googleUserInfo(accessToken){
  const r=await httpsReq('GET','www.googleapis.com','/oauth2/v2/userinfo',
    {'Authorization':`Bearer ${accessToken}`},null);
  if(r.s!==200)throw new Error('Google userinfo failed');
  return r.d;
}

// ── Google Sheets API connection (separate OAuth scope) ──────
// Single Google OAuth flow now covers Sheets *and* Calendar — adding the
// calendar.events scope here means new connections automatically gain calendar
// access. Existing users who paired before this change will see the calendar
// tools return "insufficient_scope" and need to reconnect once.
const SHEETS_SCOPE = 'openid email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar.events';
function googleSheetsAuthURL(state){
  const params=new URLSearchParams({
    client_id:GOOGLE_ID,
    redirect_uri:`${APP_URL}/api/google/sheets/callback`,
    response_type:'code',
    scope:SHEETS_SCOPE,
    access_type:'offline',
    prompt:'consent', // force re-consent so we always receive a refresh_token
    state: state||'',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}
async function googleSheetsExchange(code){
  const r=await httpsReq('POST','oauth2.googleapis.com','/token',
    {'Content-Type':'application/x-www-form-urlencoded'},
    new URLSearchParams({code,client_id:GOOGLE_ID,client_secret:GOOGLE_SEC,
      redirect_uri:`${APP_URL}/api/google/sheets/callback`,grant_type:'authorization_code'}).toString());
  if(r.s!==200)throw new Error('Sheets OAuth exchange failed: '+JSON.stringify(r.d).slice(0,200));
  return r.d; // {access_token, refresh_token, expires_in, scope, ...}
}
async function googleRefreshAccessToken(refreshToken){
  const r=await httpsReq('POST','oauth2.googleapis.com','/token',
    {'Content-Type':'application/x-www-form-urlencoded'},
    new URLSearchParams({refresh_token:refreshToken,client_id:GOOGLE_ID,client_secret:GOOGLE_SEC,
      grant_type:'refresh_token'}).toString());
  if(r.s!==200)throw new Error('Sheets token refresh failed: '+JSON.stringify(r.d).slice(0,200));
  return r.d; // {access_token, expires_in, ...} (no new refresh_token)
}
// Returns a non-expired access_token, refreshing if needed. Mutates user.google_oauth + persists.
async function getValidGoogleAccessToken(user){
  const o=user.google_oauth;
  if(!o||!o.refresh_token) throw new Error('Google Sheets not connected');
  const now=Date.now();
  const skew=60_000; // refresh 1 min before expiry
  if(o.access_token && o.expires_at && o.expires_at - skew > now) return o.access_token;
  const fresh=await googleRefreshAccessToken(o.refresh_token);
  user.google_oauth={
    ...o,
    access_token:fresh.access_token,
    expires_at:Date.now()+(fresh.expires_in||3600)*1000,
  };
  try{ await DB.save(user); }catch(e){ console.warn('[sheets] failed to persist refreshed token:', e.message); }
  return user.google_oauth.access_token;
}

// ── STRIPE ────────────────────────────────────────────────────

async function stripeCreateCustomer(email, name){
  const r=await httpsReq('POST','api.stripe.com','/v1/customers',
    {'Authorization':'Basic '+Buffer.from(STRIPE_SK+':').toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},
    new URLSearchParams({email, name}).toString());
  if(r.s!==200)throw new Error(r.d?.error?.message||'Stripe customer error');
  return r.d.id;
}

async function stripeCreateSubscription(customerId, priceId, paymentMethodId){
  const params = {
    customer: customerId,
    'items[0][price]': priceId,
    'payment_settings[payment_method_types][0]': 'card',
    'expand[0]': 'latest_invoice.payment_intent',
  };
  if(paymentMethodId){
    // SetupIntent 完了済の PaymentMethod を即座に紐付け、即課金させる
    params.default_payment_method = paymentMethodId;
  } else {
    // フォールバック: 旧フロー (default_incomplete + first invoice の PI)
    params.payment_behavior = 'default_incomplete';
    params['payment_settings[save_default_payment_method]'] = 'on_subscription';
  }
  const r=await httpsReq('POST','api.stripe.com','/v1/subscriptions',
    {'Authorization':'Basic '+Buffer.from(STRIPE_SK+':').toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},
    new URLSearchParams(params).toString());
  if(r.s!==200)throw new Error(r.d?.error?.message||'Stripe subscription error');
  return r.d;
}

async function stripeCreateSetupIntent(customerId){
  const r=await httpsReq('POST','api.stripe.com','/v1/setup_intents',
    {'Authorization':'Basic '+Buffer.from(STRIPE_SK+':').toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},
    new URLSearchParams({
      customer: customerId,
      'payment_method_types[0]': 'card',
      usage: 'off_session',
    }).toString());
  if(r.s!==200)throw new Error(r.d?.error?.message||'Stripe setup intent error');
  return r.d;
}

async function stripeListSubscriptions(customerId){
  const r=await httpsReq('GET','api.stripe.com',
    '/v1/subscriptions?customer='+encodeURIComponent(customerId)+'&status=all&limit=10',
    {'Authorization':'Basic '+Buffer.from(STRIPE_SK+':').toString('base64')},null);
  if(r.s>=400)throw new Error(r.d?.error?.message||'Stripe list_subscriptions error');
  return r.d.data || [];
}

async function stripeCancelSubscription(subscriptionId){
  const r=await httpsReq('DELETE','api.stripe.com','/v1/subscriptions/'+subscriptionId,
    {'Authorization':'Basic '+Buffer.from(STRIPE_SK+':').toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},
    '');
  if(r.s!==200)throw new Error(r.d?.error?.message||'Stripe cancel error');
  return r.d;
}

/* ── Stripe Connect (creator payouts, #7) ─────────────────── */
const PAYOUT_MIN_JPY = 1000;
async function stripeConnectCreateAccount(email){
  const r=await httpsReq('POST','api.stripe.com','/v1/accounts',
    {'Content-Type':'application/x-www-form-urlencoded','Authorization':`Bearer ${STRIPE_SK}`},
    new URLSearchParams({
      type:'express',
      country:'JP',
      email,
      'capabilities[transfers][requested]':'true',
    }).toString());
  if(r.s>=400)throw new Error(r.d?.error?.message||'Stripe Connect account error');
  return r.d;
}
async function stripeConnectOnboardingLink(accountId, returnUrl, refreshUrl){
  const r=await httpsReq('POST','api.stripe.com','/v1/account_links',
    {'Content-Type':'application/x-www-form-urlencoded','Authorization':`Bearer ${STRIPE_SK}`},
    new URLSearchParams({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    }).toString());
  if(r.s>=400)throw new Error(r.d?.error?.message||'Stripe onboarding link error');
  return r.d;
}
async function stripeConnectGetAccount(accountId){
  const r=await httpsReq('GET','api.stripe.com','/v1/accounts/'+accountId,
    {'Authorization':`Bearer ${STRIPE_SK}`}, null);
  if(r.s>=400)throw new Error(r.d?.error?.message||'Stripe account fetch error');
  return r.d;
}
async function stripeCreateTransfer(amountJpy, destAccountId, metadata){
  const params = new URLSearchParams({
    amount: String(Math.round(amountJpy)),
    currency: 'jpy',
    destination: destAccountId,
  });
  if(metadata) for(const k of Object.keys(metadata)) params.append('metadata['+k+']', String(metadata[k]));
  const r=await httpsReq('POST','api.stripe.com','/v1/transfers',
    {'Content-Type':'application/x-www-form-urlencoded','Authorization':`Bearer ${STRIPE_SK}`},
    params.toString());
  if(r.s>=400)throw new Error(r.d?.error?.message||'Stripe transfer error');
  return r.d;
}

async function stripeCreatePaymentIntent(amtCentsUsd,userId,email){
  // amtCentsUsd は USDセント (例: 699 = $6.99)。フロント側パラメータ名 amount_jpy は misnomer。
  const r=await httpsReq('POST','api.stripe.com','/v1/payment_intents',
    {'Content-Type':'application/x-www-form-urlencoded','Authorization':`Bearer ${STRIPE_SK}`},
    new URLSearchParams({
      amount:String(amtCentsUsd),
      currency:'usd',
      'automatic_payment_methods[enabled]':'true',
      receipt_email:email,
      'metadata[userId]':userId,
      'metadata[amount_cents_usd]':String(amtCentsUsd)
    }).toString());
  if(r.s!==200)throw new Error(r.d?.error?.message||'Stripe error');
  return r.d;
}

async function verifyStripeWebhook(raw,sig){
  const parts=sig.split(',').reduce((a,p)=>{const[k,v]=p.split('=');a[k]=v;return a;},{});
  const exp=crypto.createHmac('sha256',STRIPE_WH).update(`${parts.t}.${raw.toString('utf8')}`).digest('hex');
  if(exp!==parts.v1)throw new Error('Invalid stripe webhook signature');
  return JSON.parse(raw.toString('utf8'));
}

// ── SKILL SYSTEM PROMPT ───────────────────────────────────────
const SKILL_MAP={
  writing:'ライティング（メール・記事・提案書作成）',
  research:'リサーチ（情報収集・整理・競合分析）',
  coding:'プログラミング（コード作成・レビュー・デバッグ）',
  marketing:'マーケティング（戦略立案・コピーライティング）',
  planning:'プランニング（企画・タスク整理・スケジュール管理）',
  analysis:'データ分析（数値解析・レポート作成）',
  translate:'翻訳（日英・多言語対応）',
  support:'カスタマー対応（問い合わせ対応・FAQ作成）',
  idea:'アイデア出し（ブレスト・クリエイティブ発想）',
  teaching:'教育・解説（わかりやすく丁寧に説明）',
  ceo:'アシスタントCEO（経営戦略・意思決定）',
  coo:'アシスタントCOO（業務最適化・オペレーション）',
  secretary:'秘書（スケジュール・調整・連絡）',
  designer:'デザイナー（UI/UX・ビジュアル）',
  sns:'SNS担当（投稿作成・分析・集客）',
  other:'その他（上記以外のカスタム業務）',
};
/* ── Share helpers ─────────────────────────────────────────── */
function genShareId(){
  // 12 chars from base36, hyphenated for readability
  const c='abcdefghijklmnopqrstuvwxyz0123456789';
  let s=''; for(let i=0;i<12;i++) s+=c[Math.floor(Math.random()*c.length)];
  return s.slice(0,4)+'-'+s.slice(4,8)+'-'+s.slice(8,12);
}

/* ── Team templates (Phase 1 MVP) ─────────────────────────── */
// Each template, when activated, clones N agents into the user's account
// and creates a single group containing all of them. Workflow execution
// is Phase 2 — for now, the user @-mentions individual agents.
const TEAM_TEMPLATES = [
  {
    id: 'tpl-ec-launch',
    name: 'EC Launch Starter',
    cover_emoji: '🛍',
    category: 'ecommerce',
    price_jpy: 0,             // free
    description: 'Source products → generate visuals → build store → post on social → analyze sales. Run an entire e-commerce business with 5 AI agents.',
    agents: [
      { avatar:'🛍', name:'Product Sourcer',  skills:['research','analysis'],     persona:'採用目的: 利益率 > 50% かつ需要が伸びている商品を Web 検索 + トレンド分析で特定する\n業務内容: Alibaba / Google Trends / Reddit を調査し、上位 3 候補を margin・demand・差別化で評価して提案する。' },
      { avatar:'📸', name:'Visual Designer',  skills:['idea','marketing'],        persona:'採用目的: ブランド一貫性のある商品ライフスタイル写真を生成する\n業務内容: ユーザーが選んだ商品に対して 5 パターンの画像を生成 (golden hour / minimal / cozy etc.) し、各シーンの意図を添える。' },
      { avatar:'🌐', name:'Storefront Architect', skills:['coding','planning'],   persona:'採用目的: Shopify Storefront の構築をワンステップで完了させる\n業務内容: 商品ページ作成、Stripe 決済設定、配送ゾーン設定、SEO 最適化、ローンチ前チェックリスト。' },
      { avatar:'📱', name:'Social Manager',    skills:['marketing','sns','writing'],persona:'採用目的: 新店舗のローンチを X / IG / TikTok で同時配信し、最適時刻でエンゲージを取る\n業務内容: ハッシュタグ最適化、投稿テキスト生成、ベストタイム計算、画像との整合性確認。' },
      { avatar:'📊', name:'Revenue Analyst',   skills:['analysis','planning'],     persona:'採用目的: 売上をモニタしながら改善提案を返す常駐エージェント\n業務内容: Stripe webhook で受注検知、日次サマリー、商品別分析、改善アクションの提示。' },
    ],
  },
  {
    id: 'tpl-sns-growth',
    name: 'SNS Growth Starter',
    cover_emoji: '📱',
    category: 'sns',
    price_jpy: 0,
    description: 'Spot trends → write engaging posts → schedule across X / Instagram / TikTok at peak engagement times.',
    agents: [
      { avatar:'📈', name:'Trend Spotter',  skills:['research','sns'],      persona:'採用目的: X / TikTok の急上昇トピックを毎日 5 つ抽出する\n業務内容: トレンド検索 → 関連性スコア付け → 投稿候補テーマ提案。' },
      { avatar:'✍️', name:'Content Writer', skills:['writing','marketing'],  persona:'採用目的: バズる投稿テキストを書く\n業務内容: トレンドに沿ったフック → 本文 → CTA の 3 段構成、絵文字・改行最適化。' },
      { avatar:'📅', name:'Scheduler',      skills:['planning','sns'],       persona:'採用目的: 各 SNS の最適時刻に投稿を予約する\n業務内容: ベストタイムテーブルに基づき 1 日複数回の予約配信、結果を翌日に学習。' },
    ],
  },
  {
    id: 'tpl-solo-founder',
    name: 'Solo Founder Toolkit',
    cover_emoji: '💼',
    category: 'productivity',
    price_jpy: 0,
    description: 'Email writer + meeting note-taker + task tracker. Daily essentials for indie hackers and solo founders.',
    agents: [
      { avatar:'📧', name:'Email Drafter',   skills:['writing','support'],    persona:'採用目的: 30秒で目的に合った返信メールを書く\n業務内容: 受信メールに対する返信案を 3 トーン (formal / friendly / direct) で提示。' },
      { avatar:'📝', name:'Note Taker',      skills:['writing','analysis'],   persona:'採用目的: 議事録・メモを構造化された ToDo に変換する\n業務内容: 録音/メモ → 議事録 → アクションアイテム → 期限付き ToDo を出力。' },
      { avatar:'✅', name:'Task Tracker',     skills:['planning','support'],   persona:'採用目的: 散らかったタスクを優先順位付きの今日のリストにする\n業務内容: 締切 + インパクト + 工数で並べ替え、上位 5 件をピックアップ。' },
    ],
  },
  {
    id: 'tpl-tutor-squad',
    name: 'Personal Tutor Squad',
    cover_emoji: '🎓',
    category: 'education',
    price_jpy: 0,
    description: 'Researcher + explainer + quiz maker. Learn anything new — coding, finance, language — with a 3-agent crew.',
    agents: [
      { avatar:'🔍', name:'Researcher',      skills:['research'],             persona:'採用目的: 学習トピックの最新で正確な情報源を 3 つ集める\n業務内容: Web 検索 + 学術ソース確認、要約と出典を返す。' },
      { avatar:'🎓', name:'Explainer',        skills:['teaching','writing'],   persona:'採用目的: 中学生でも理解できる例え話で説明する\n業務内容: コアコンセプト → 日常の例え → 図解の言語化、長さは 200-400 字。' },
      { avatar:'🧠', name:'Quiz Maker',       skills:['teaching','analysis'],  persona:'採用目的: 学んだ内容の定着を確認する 5 問クイズを作る\n業務内容: 4 択 3 + 記述 2、解説付き、間違えやすいポイントを優先。' },
    ],
  },
  {
    id: 'tpl-dev-squad',
    name: 'Dev Squad',
    cover_emoji: '💻',
    category: 'engineering',
    price_jpy: 3980,   // paid
    description: 'Code reviewer + bug fixer + test writer + deploy helper. Boost code quality without the team meetings.',
    agents: [
      { avatar:'🔍', name:'Code Reviewer',  skills:['coding','analysis'],    persona:'採用目的: PR の差分をレビューし、バグ・セキュリティ・可読性を指摘する\n業務内容: diff 受領 → 行単位コメント → 修正提案 → 重要度ラベル付与。' },
      { avatar:'🔧', name:'Bug Fixer',       skills:['coding'],               persona:'採用目的: スタックトレース or バグ報告から修正コードを書く\n業務内容: 再現 → 原因特定 → 最小修正パッチ → リグレッション防止のテスト案。' },
      { avatar:'🧪', name:'Test Writer',     skills:['coding','analysis'],    persona:'採用目的: 関数・コンポーネントに対するテストを過不足なく書く\n業務内容: ユニット → 結合 → e2e の優先順位、エッジケースの列挙、CI で動くテスト。' },
      { avatar:'🚀', name:'Deploy Helper',   skills:['coding','planning'],    persona:'採用目的: デプロイ手順を間違えないようサポートする\n業務内容: 事前チェックリスト → ロールアウト計画 → ロールバック手順 → スモークテスト。' },
    ],
  },
];

function _findTeamTemplate(id){
  return TEAM_TEMPLATES.find(t => t.id === id) || null;
}

/**
 * Plan v2 launched 2026-05-10. Users who registered before this date are
 * grandfathered: they keep old credit ($20 / $60) and old caps (no per-tier
 * agent / team limits). New signups follow the v2 rules.
 */
const PLAN_V2_LAUNCH_AT = '2026-05-10T00:00:00Z';
function _isGrandfathered(user){
  if(user.plan_v2_grandfathered === true) return true;
  if(user.plan_v2_grandfathered === false) return false;
  // Lazy migration: derive from created_at the first time we see this user.
  const t = user.created_at ? new Date(user.created_at).getTime() : NaN;
  if(!isFinite(t)) return false; // unknown → treat as new
  return t < new Date(PLAN_V2_LAUNCH_AT).getTime();
}

/**
 * Plan-based gate for any /api/teams/* mutation.
 * Returns null when allowed, or a JSON body { error, upgrade_required } to send.
 *
 * Free   : no Teams at all (upgrade to pro).
 * Pro    : at most 1 active Team — block creating a 2nd.
 * Biz    : unlimited.
 * Grandfathered users keep the pre-migration "anyone can build any number of
 * teams" behaviour so we don't pull a feature out from under them.
 */
function _planTeamGate(user){
  if(_isGrandfathered(user)) return null;
  const plan = user.plan || 'free';
  if(plan === 'free'){
    return {
      error: 'Agent Team は Pro プラン以上で利用できます。',
      upgrade_required: 'pro',
      reason: 'team_requires_pro',
    };
  }
  if(plan === 'pro'){
    const activeTeams = (user.agents||[]).filter(a => a.is_team && a.is_group).length;
    if(activeTeams >= 1){
      return {
        error: 'Pro プランで持てる Agent Team は 1 つまでです。複数 Team を運用するには Business にアップグレードしてください。',
        upgrade_required: 'business',
        reason: 'team_cap_reached',
      };
    }
  }
  return null;
}

/* ── Marketplace helpers ───────────────────────────────────── */
const MARKET_CATEGORIES = ['sales','marketing','research','writing','ops','other'];
const MARKET_CAT_LABEL = {
  sales:'セールス', marketing:'マーケティング', research:'リサーチ',
  writing:'ライティング', ops:'業務効率化', other:'その他'
};
function genListingId(){
  const c='abcdefghijklmnopqrstuvwxyz0123456789';
  let s=''; for(let i=0;i<14;i++) s+=c[Math.floor(Math.random()*c.length)];
  return 'ls_'+s.slice(0,5)+'-'+s.slice(5,10)+'-'+s.slice(10,14);
}
/** Build a public-safe listing object (joined with creator). */
function publicListing(user, ag){
  const m = ag.marketplace||{};
  const tags = Array.isArray(m.tags) ? m.tags.slice(0,5) : [];
  // For team listings, surface a preview of the AI members so cards / detail
  // pages can render "🎯 Team · 5 agents" instead of looking like a single AI.
  let teamMembers = null;
  if(ag.is_team && Array.isArray(ag.team_member_agent_ids) && ag.team_member_agent_ids.length){
    const ownerAgents = user.agents || [];
    teamMembers = ag.team_member_agent_ids
      .map(id => ownerAgents.find(a => a.id === id))
      .filter(Boolean)
      .slice(0,8)
      .map(a => ({
        avatar: a.avatar || '🤖',
        name: a.name || 'AI',
        skills: Array.isArray(a.skills) ? a.skills.slice(0,3) : [],
      }));
  }
  return {
    listing_id: m.listing_id,
    is_team: !!ag.is_team,
    member_count: teamMembers ? teamMembers.length : 0,
    team_members: teamMembers,
    team_goal: ag.is_team ? (ag.team_goal||'') : undefined,
    agent: {
      avatar: ag.avatar||'🤖',
      skills: ag.skills||[],
      chrome_enabled: !!ag.chrome_enabled,
    },
    title: m.title || ag.name,
    description: m.description || ag.persona || '',
    category: m.category || 'other',
    category_label: MARKET_CAT_LABEL[m.category||'other']||'その他',
    tags,
    tag_labels: tags.map(t=>MARKET_TAG_LABEL[t]||t),
    demo_prompts: Array.isArray(m.demo_prompts) ? m.demo_prompts.slice(0,3) : [],
    creator: {
      handle: '@'+(user.email||'').split('@')[0],
      name: user.name || '',
      is_verified: !!user.is_verified,
    },
    rating: m.rating_avg || 0,
    rating_count: m.rating_count || 0,
    uses: m.uses_count || 0,
    purchases: m.purchases_count || 0,
    price_jpy: Number.isFinite(m.price_jpy) ? m.price_jpy : 0,
    badge: (m.uses_count||0) >= 100 ? 'hot' : (Date.now()-new Date(m.listed_at||0).getTime() < 14*86400000 ? 'new' : null),
    listed_at: m.listed_at,
  };
}

/** Escape text for safe inclusion in SVG / HTML. */
function _xmlEscape(s){
  return String(s||'').replace(/[<>&'"]/g, c=>({
    '<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'
  }[c]));
}
/** Truncate to ~maxChars, appending ellipsis if cut. */
function _trunc(s, n){ s=String(s||''); return s.length>n ? s.slice(0,n-1)+'…' : s; }
/** Wrap text into N lines of ~chars each (returns array). Crude word-wrap (CJK splits). */
function _wrapText(s, maxChars, maxLines){
  s = String(s||''); const out=[]; let cur='';
  for(const ch of s){
    if((cur+ch).length > maxChars){
      out.push(cur); cur=ch;
      if(out.length >= maxLines-1){ out.push((cur+s.slice(out.join('').length+ch.length)).slice(0,maxChars-1)+'…'); return out; }
    } else { cur += ch; }
  }
  if(cur) out.push(cur);
  return out;
}

// Lazy-load @resvg/resvg-js so the server still boots if the optional
// native binding is missing on the host. Falls back to SVG-only mode.
let _resvg = null, _resvgFailed = false;
function _loadResvg(){
  if(_resvg || _resvgFailed) return _resvg;
  try{ _resvg = require('@resvg/resvg-js'); return _resvg; }
  catch(e){ _resvgFailed = true; console.warn('[og] resvg unavailable:', e.message); return null; }
}

// Twemoji cache for emoji rendering (Linux servers usually lack color emoji fonts).
// We fetch the Twemoji SVG once per emoji and embed it in the OG SVG.
const _twemojiCache = new Map();

// ── OG PNG render cache (in-memory) ──
// resvg + Twemoji takes ~3s per render. Without a cache, every Twitter / FB
// scraper retry pays that cost — and Twitter's image fetch budget is short
// enough that a slow first response often gets cached as a failure ("generic
// document" placeholder). Caching the rendered Buffer keyed by share_id /
// listing_id + mtime makes every subsequent scrape ~10ms instead of 3s.
const _OG_PNG_CACHE = new Map();          // key → {buf, mtime, cachedAt}
const _OG_PNG_CACHE_MAX = 300;            // LRU bound
const _OG_PNG_CACHE_TTL_MS = 7*24*60*60*1000; // 7 days
function _ogPngCacheGet(key, sourceMtime){
  const e = _OG_PNG_CACHE.get(key);
  if(!e) return null;
  if(Date.now() - e.cachedAt > _OG_PNG_CACHE_TTL_MS){ _OG_PNG_CACHE.delete(key); return null; }
  // If the agent was edited after we cached the PNG, treat the cache as stale.
  if(sourceMtime && e.mtime && e.mtime < sourceMtime){ _OG_PNG_CACHE.delete(key); return null; }
  // Touch (re-insert to mark as MRU)
  _OG_PNG_CACHE.delete(key); _OG_PNG_CACHE.set(key, e);
  return e.buf;
}
function _ogPngCacheSet(key, buf, sourceMtime){
  if(!buf) return;
  if(_OG_PNG_CACHE.size >= _OG_PNG_CACHE_MAX){
    const firstKey = _OG_PNG_CACHE.keys().next().value;
    if(firstKey) _OG_PNG_CACHE.delete(firstKey);
  }
  _OG_PNG_CACHE.set(key, { buf, mtime: sourceMtime||0, cachedAt: Date.now() });
}

// Pre-render the OG PNG for a freshly-created share_id. Called fire-and-forget
// from the share endpoint so the response stays fast. The next Twitter scrape
// finds a warm cache and gets the image in ~10ms.
async function _prerenderShareOG(owner, ag){
  if(!ag || !ag.share_id) return;
  try {
    let svg;
    if(ag.is_team){
      const memberAgents = (owner.agents||[]).filter(a => (ag.team_member_agent_ids||[]).includes(a.id)).slice(0, 6);
      const avatarMap = new Map();
      const emojis = [ag.avatar || '🎯', ...memberAgents.map(m => m.avatar || '🤖')];
      for(const em of emojis){
        if(!em || em.startsWith('data:image/') || avatarMap.has(em)) continue;
        try {
          const tw = await _getTwemojiSvg(em);
          if(tw) avatarMap.set(em, _twemojiDataUri(tw));
        } catch(e){}
      }
      svg = renderTeamOgSvg(ag, memberAgents, avatarMap);
    } else {
      const detail = _agentAsListing(owner, ag);
      let twemojiUri = null;
      try {
        const tw = await _getTwemojiSvg(detail.agent?.avatar || '🤖');
        if(tw) twemojiUri = _twemojiDataUri(tw);
      } catch(e){}
      svg = renderListingOgSvg(detail, twemojiUri);
    }
    const png = svgToPng(svg);
    if(!png) return;
    const sourceMtime = new Date(ag.updated_at || ag.created_at || 0).getTime();
    _ogPngCacheSet('a:'+ag.share_id, png, sourceMtime);
    console.log('[og/prerender] cached '+ag.share_id+' ('+png.length+' bytes)');
  } catch(e){
    console.warn('[og/prerender] failed:', e.message);
  }
}
const _TWEMOJI_VER = '15.1.0';
function _emojiCodepoints(emoji){
  const cps = [];
  for(const ch of emoji){
    const cp = ch.codePointAt(0);
    // Skip variation selector U+FE0F (twemoji file names omit it)
    if(cp !== 0xFE0F) cps.push(cp.toString(16));
  }
  return cps.join('-');
}
function _getTwemojiSvg(emoji){
  if(_twemojiCache.has(emoji)) return Promise.resolve(_twemojiCache.get(emoji));
  const codepoints = _emojiCodepoints(emoji);
  if(!codepoints || codepoints.length < 2) return Promise.resolve(null);
  const reqPath = '/gh/jdecked/twemoji@'+_TWEMOJI_VER+'/assets/svg/' + codepoints + '.svg';
  return new Promise((resolve)=>{
    const req = https.get({hostname:'cdn.jsdelivr.net', path:reqPath, headers:{'User-Agent':'myagent-og/1.0'}}, (r)=>{
      if(r.statusCode !== 200){ _twemojiCache.set(emoji, null); resolve(null); return; }
      let buf = '';
      r.on('data', c=>buf+=c);
      r.on('end', ()=>{
        _twemojiCache.set(emoji, buf);
        resolve(buf);
      });
    });
    req.on('error', ()=>{ _twemojiCache.set(emoji, null); resolve(null); });
    req.setTimeout(2500, ()=>{ try{req.destroy();}catch(e){} _twemojiCache.set(emoji, null); resolve(null); });
  });
}
function _twemojiDataUri(svgString){
  // Strip the XML declaration if present, then base64-encode for safe embedding
  const cleaned = String(svgString||'').replace(/<\?xml[^?]*\?>/,'').trim();
  return 'data:image/svg+xml;base64,' + Buffer.from(cleaned,'utf8').toString('base64');
}

/* ── CJK font for OG PNG rendering ──────────────────────────── */
// Render's default Linux image lacks CJK fonts, so Japanese text renders as
// tofu boxes in PNG output. We bundle Noto Sans JP via @fontsource/noto-sans-jp
// (npm dep) so the font is available at runtime without a network fetch.
let _jpFontPaths = null;
function _resolveJpFonts(){
  if(_jpFontPaths) return _jpFontPaths;
  const out = [];
  // Prefer the bundled TTF — it's a full Noto Sans JP variable font that
  // resvg unambiguously matches by family name. The @fontsource woff2 fallback
  // had spotty glyph coverage on Render Linux (boxes / 豆腐 in CJK output).
  const bundled = path.join(__dirname, '..', 'assets', 'fonts', 'NotoSansJP-VF.ttf');
  if(fs.existsSync(bundled) && fs.statSync(bundled).size > 100000){
    out.push(bundled);
  }
  // Also try the npm-installed @fontsource files (latin range covers ASCII text).
  for(const slug of ['japanese-400-normal','latin-400-normal']){
    try{
      const p = require.resolve('@fontsource/noto-sans-jp/files/noto-sans-jp-'+slug+'.woff2');
      if(fs.existsSync(p) && fs.statSync(p).size > 10000){ out.push(p); }
    }catch(e){ /* package not installed; fall through */ }
  }
  _jpFontPaths = out;
  return out;
}

/** Convert an SVG string to a PNG Buffer. Returns null if resvg is unavailable. */
/** Last-resort fallback for /api/og endpoints when svgToPng fails.
 *  Streams the static brand sample PNG so SNS unfurl always shows something. */
function _serveStaticOgFallback(res){
  const p = path.join(PUBLIC_DIR, 'social', 'og-agent-sample.png');
  fs.readFile(p, (err, data) => {
    if(err){
      res.writeHead(404, {'Content-Type':'text/plain'});
      return res.end('og fallback missing');
    }
    res.writeHead(200, {
      'Content-Type':'image/png',
      'Cache-Control':'public, max-age=3600',
      'Access-Control-Allow-Origin':'*',
      'Content-Length': data.length,
    });
    res.end(data);
  });
}

function svgToPng(svg, opts){
  const r = _loadResvg();
  if(!r) return null;
  const fontFiles = _resolveJpFonts();
  try{
    const resvg = new r.Resvg(svg, {
      fitTo: { mode: 'width', value: (opts && opts.width) || 1200 },
      background: '#fdf8f3',
      font: {
        loadSystemFonts: true,
        defaultFontFamily: 'Noto Sans JP',
        fontFiles,
      },
    });
    return resvg.render().asPng();
  }catch(e){
    console.warn('[og] svg→png failed:', e.message);
    return null;
  }
}

/** Render Pattern E thumbnail (1200×630) as SVG. Pass `twemojiUri` (optional) to embed an emoji image. */
function renderListingOgSvg(d, twemojiUri){
  const av = d.agent?.avatar || '🤖';
  const title = _trunc(d.title||'', 30);
  // Filter AI system prompts out of the OG description — they read like
  // "You are operating as a fully autonomous..." which is internal copy.
  const rawDesc = (d.description||'').trim();
  const looksLikeSystemPrompt = /^(you are|you operate|you act|act as|operate as|あなたは|あなたが|お前は)/i.test(rawDesc.slice(0,40));
  const cleanDesc = looksLikeSystemPrompt
    ? ((d.agent?.skills||[]).slice(0,3).join(' · ') || 'AI agent on MY AI AGENT')
    : rawDesc;
  const tagLines = _wrapText(cleanDesc, 26, 2);
  const cat = _xmlEscape(d.category_label||'');
  const handle = _xmlEscape(d.creator?.handle||'');
  const ratingNum = d.rating>0 ? d.rating.toFixed(1) : '';
  const usesNum = (d.uses||0) >= 1000 ? (d.uses/1000).toFixed(1)+'k' : String(d.uses||0);
  const chrome = d.agent?.chrome_enabled;

  // Sticker (white rounded square + emoji) at left center
  // Info on right: tag pill + title + tagline + meta pills
  // Decorative circles. Brand badge bottom-right.
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" font-family="'Hiragino Sans','Noto Sans JP','Helvetica Neue',Arial,sans-serif">
  <defs>
    <radialGradient id="bg" cx="30%" cy="20%" r="100%">
      <stop offset="0%" stop-color="#ffedd5"/>
      <stop offset="60%" stop-color="#fed7aa"/>
      <stop offset="130%" stop-color="#fb923c"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="14"/>
      <feOffset dx="0" dy="14"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.25"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- decorative circles -->
  <circle cx="-40" cy="-40" r="220" fill="rgba(255,255,255,.32)"/>
  <circle cx="1080" cy="500" r="160" fill="rgba(255,255,255,.34)"/>
  <circle cx="900" cy="120" r="100" fill="rgba(234,88,12,.18)"/>
  <circle cx="220" cy="500" r="60" fill="rgba(251,146,60,.42)"/>

  <!-- sticker (white rounded square with emoji or uploaded image), tilted -8deg -->
  <g transform="translate(170 315) rotate(-8)">
    <rect x="-160" y="-160" width="320" height="320" rx="56" ry="56" fill="#fff" stroke="#fff" stroke-width="8" filter="url(#shadow)"/>
    ${av && av.startsWith('data:image/')
      ? `<clipPath id="stickerClip"><rect x="-150" y="-150" width="300" height="300" rx="48" ry="48"/></clipPath><image x="-150" y="-150" width="300" height="300" href="${av}" preserveAspectRatio="xMidYMid slice" clip-path="url(#stickerClip)"/>`
      : (twemojiUri
        ? `<image x="-130" y="-130" width="260" height="260" href="${twemojiUri}" preserveAspectRatio="xMidYMid meet"/>`
        : `<text x="0" y="0" text-anchor="middle" dominant-baseline="central" font-size="200">${_xmlEscape(av)}</text>`)}
  </g>

  <!-- info column, right of sticker -->
  <g transform="translate(420 130)">
    <!-- category pill -->
    <g>
      <rect x="0" y="0" width="${Math.max(140, cat.length*22+34)}" height="38" rx="19" ry="19" fill="#ffffff"/>
      <text x="${Math.max(70, (cat.length*22+34)/2)}" y="25" text-anchor="middle" fill="#ea580c" font-size="16" font-weight="800" letter-spacing="0.06em">${cat}</text>
    </g>

    <!-- title -->
    <text x="0" y="120" fill="#1a0d05" font-size="62" font-weight="900" letter-spacing="-0.02em">${_xmlEscape(title)}</text>

    <!-- tagline (up to 2 lines) -->
    ${tagLines.map((l,i)=>`<text x="0" y="${190 + i*36}" fill="#6b4226" font-size="22" font-weight="500">${_xmlEscape(l)}</text>`).join('')}

    <!-- meta pills -->
    <g transform="translate(0 ${280 + Math.max(0,(tagLines.length-1)*36)})">
      ${ratingNum ? `<g>
        <rect x="0" y="0" width="120" height="38" rx="14" ry="14" fill="#ffffff"/>
        <!-- Star drawn as SVG path (no emoji/font dependency) -->
        <path d="M16 9 L18.4 14 L23.6 14.6 L19.6 18 L20.6 23.4 L16 20.6 L11.4 23.4 L12.4 18 L8.4 14.6 L13.6 14 Z" fill="#fbbf24" stroke="#d97706" stroke-width="0.5"/>
        <text x="68" y="25" text-anchor="middle" fill="#1a0d05" font-size="15" font-weight="800">${ratingNum}</text>
      </g>` : ''}
      <g transform="translate(${ratingNum ? 132 : 0} 0)">
        <rect x="0" y="0" width="${48 + usesNum.length*12}" height="38" rx="14" ry="14" fill="#ffffff"/>
        <text x="${(48 + usesNum.length*12)/2}" y="25" text-anchor="middle" fill="#1a0d05" font-size="15" font-weight="800">${_xmlEscape((d.htmlLang === 'en' || (typeof d.lang === 'string' && d.lang === 'en')) ? `${usesNum} uses` : `利用 ${usesNum} 回`)}</text>
      </g>
      ${chrome?`<g transform="translate(${(ratingNum ? 132 : 0) + (48+usesNum.length*12) + 12} 0)">
        <rect x="0" y="0" width="140" height="38" rx="14" ry="14" fill="#ffffff"/>
        <text x="70" y="25" text-anchor="middle" fill="#1a0d05" font-size="14" font-weight="800">Web access</text>
      </g>`:''}
    </g>

    <!-- creator -->
    <text x="0" y="${360 + Math.max(0,(tagLines.length-1)*36)}" fill="#6b4226" font-size="18" font-weight="700">by ${handle}${d.creator?.is_verified ? ' ' : ''}</text>
    ${d.creator?.is_verified ? `
    <g transform="translate(${65 + handle.length*11} ${344 + Math.max(0,(tagLines.length-1)*36)})">
      <circle cx="0" cy="0" r="11" fill="#2563eb"/>
      <path d="M-5,0 L-1,4 L5,-3" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>` : ''}
  </g>

  <!-- brand badge bottom-right (3-bar logo + wordmark, no emoji to avoid tofu) -->
  <g transform="translate(1144 580)">
    <rect x="-220" y="-22" width="220" height="44" rx="22" ry="22" fill="#fff"/>
    <g transform="translate(-200 -10)">
      <rect x="0"  y="0"  width="6" height="20" rx="3" fill="#ea580c"/>
      <rect x="9"  y="4"  width="6" height="16" rx="3" fill="#ea580c" opacity="0.65"/>
      <rect x="18" y="8"  width="6" height="12" rx="3" fill="#ea580c" opacity="0.35"/>
    </g>
    <text x="-95" y="6" text-anchor="middle" fill="#ea580c" font-size="15" font-weight="900" letter-spacing="0.18em">MY AI AGENT</text>
  </g>
</svg>`;
}

/** Render the dark "Member Grid" Team OG (Variant B from the approved mock).
 *  Inputs:
 *    team       — the team agent record (name, avatar, team_goal)
 *    members    — array of {avatar, name} cloned-agent records (max 6 displayed)
 *    avatarMap  — optional Map<emoji, twemojiDataUri> for member avatars
 */
function renderTeamOgSvg(team, members, avatarMap){
  members = Array.isArray(members) ? members.slice(0, 6) : [];
  const teamName = _trunc(team.name || 'Agent Team', 24);
  // Pull the headline source. If team_goal isn't set, persona can be used —
  // BUT only when it reads like user-facing copy. AI system prompts ("You are
  // operating as...", "あなたは XX として動作します") must NOT leak into the
  // OG headline.
  const rawGoal = (team.team_goal || '').trim();
  const rawPersona = (team.persona || '').trim();
  const looksLikeSystemPrompt = (s) => !s || /^(you are|you operate|you act|act as|operate as|あなたは|あなたが|お前は)/i.test(s.trim().slice(0,40));
  const goal = !looksLikeSystemPrompt(rawGoal)
    ? rawGoal
    : (!looksLikeSystemPrompt(rawPersona) ? rawPersona : '');
  const goalLines = _wrapText(goal, 30, 2);
  const cover = team.avatar || '🎯';
  const memberCount = (Array.isArray(team.team_member_agent_ids) ? team.team_member_agent_ids.length : members.length) || 0;
  // Lang-aware copy. Prefer the team's stored lang; fall back to detecting
  // CJK characters in the team name / goal so legacy teams without `lang` set
  // still render correctly.
  const isJa = team.lang === 'ja' || (team.lang !== 'en' && /[ぁ-んァ-ヶー一-龠]/.test((team.name||'') + ' ' + (rawGoal||rawPersona||'')));
  const tHeadlineFallback1 = isJa ? `${memberCount} 体の AI が`           : `${memberCount} AI agents`;
  const tHeadlineFallback2 = isJa ? '業務を回す。'                         : 'run the workflow.';
  const tHandoff           = isJa ? '1 クリックでクローン → 自分のアカウントで起動。'
                                  : '1-click clone → spins up in your own account.';
  const teamEmojiUri = (avatarMap && avatarMap.get(cover)) || null;
  // Member palette — index-based gradients matching the mock
  const memberGrads = ['#fff7ee→#fb923c','#ede9fe→#8b5cf6','#dbeafe→#3b82f6','#fce7f3→#ec4899','#d1fae5→#10b981','#fef3c7→#f59e0b'];

  // Right-side grid: 2 cols × 3 rows. Each card 270×60 with 14px gap.
  const grid = members.map((m, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 660 + col * 284;
    const y = 150 + row * 74;
    const [g1, g2] = memberGrads[i % memberGrads.length].split('→');
    const av = m.avatar || '🤖';
    const nm = _trunc(m.name || 'AI', 14);
    const role = `Step ${i+1}`;
    const memUri = avatarMap && avatarMap.get(av);
    const avInner = av.startsWith('data:image/')
      ? `<clipPath id="memClip${i}"><rect x="-19" y="-19" width="38" height="38" rx="9" ry="9"/></clipPath><image x="-19" y="-19" width="38" height="38" href="${av}" preserveAspectRatio="xMidYMid slice" clip-path="url(#memClip${i})"/>`
      : (memUri
        ? `<image x="-16" y="-16" width="32" height="32" href="${memUri}" preserveAspectRatio="xMidYMid meet"/>`
        : `<text x="0" y="0" text-anchor="middle" dominant-baseline="central" font-size="22">${_xmlEscape(av)}</text>`);
    return `
    <g transform="translate(${x} ${y})">
      <rect x="0" y="0" width="270" height="60" rx="13" ry="13" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.10)" stroke-width="1"/>
      <defs><linearGradient id="memG${i}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${g1}"/><stop offset="100%" stop-color="${g2}"/></linearGradient></defs>
      <rect x="11" y="11" width="38" height="38" rx="9" ry="9" fill="url(#memG${i})"/>
      <g transform="translate(30 30)">${avInner}</g>
      <text x="60" y="28" fill="#ffffff" font-size="15" font-weight="800">${_xmlEscape(nm)}</text>
      <text x="60" y="46" fill="rgba(255,245,230,0.6)" font-size="10" font-weight="600" letter-spacing="0.06em" text-transform="uppercase">${_xmlEscape(role)}</text>
    </g>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" font-family="'Hiragino Sans','Noto Sans JP','Helvetica Neue',Arial,sans-serif">
  <defs>
    <radialGradient id="bgPeach" cx="20%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#fb923c" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="#fb923c" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="bgViolet" cx="90%" cy="110%" r="70%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Dark base -->
  <rect width="1200" height="630" fill="#0c0a09"/>
  <rect width="1200" height="630" fill="url(#bgPeach)"/>
  <rect width="1200" height="630" fill="url(#bgViolet)"/>

  <!-- Header -->
  <g transform="translate(48 32)">
    <!-- M square -->
    <rect x="0" y="0" width="44" height="44" rx="9" ry="9" fill="#fb923c"/>
    <text x="22" y="32" text-anchor="middle" fill="#0c0a09" font-size="24" font-weight="900" letter-spacing="-0.02em">M</text>
    <!-- wordmark -->
    <text x="56" y="30" fill="#ffffff" font-size="22" font-weight="900" letter-spacing="0.04em">MY AI AGENT</text>
    <!-- TEAM pill at right -->
    <g transform="translate(${1200 - 48 - 200} 0)">
      <rect x="0" y="0" width="200" height="34" rx="17" ry="17" fill="#fb923c"/>
      <text x="100" y="23" text-anchor="middle" fill="#0c0a09" font-size="13" font-weight="900" letter-spacing="0.08em">🎯 AGENT TEAM</text>
    </g>
  </g>

  <!-- LEFT side: cover pill + headline + desc + meta -->
  <g transform="translate(48 130)">
    <!-- cover pill -->
    <g>
      <rect x="0" y="0" width="${Math.min(540, 70 + teamName.length*22)}" height="54" rx="27" ry="27" fill="rgba(251,146,60,0.18)" stroke="rgba(251,146,60,0.32)" stroke-width="1"/>
      <circle cx="27" cy="27" r="17" fill="#ffffff"/>
      <g transform="translate(27 27)">
        ${cover.startsWith('data:image/')
          ? `<clipPath id="coverClip"><circle cx="0" cy="0" r="15"/></clipPath><image x="-15" y="-15" width="30" height="30" href="${cover}" preserveAspectRatio="xMidYMid slice" clip-path="url(#coverClip)"/>`
          : (teamEmojiUri
            ? `<image x="-13" y="-13" width="26" height="26" href="${teamEmojiUri}" preserveAspectRatio="xMidYMid meet"/>`
            : `<text x="0" y="0" text-anchor="middle" dominant-baseline="central" font-size="20">${_xmlEscape(cover)}</text>`)}
      </g>
      <text x="56" y="34" fill="#fb923c" font-size="15" font-weight="800" letter-spacing="0.04em">${_xmlEscape(teamName)}</text>
    </g>

    <!-- big headline = goal line 1 (or fallback) -->
    <text x="0" y="120" fill="#ffffff" font-size="56" font-weight="900" letter-spacing="-0.02em">${_xmlEscape(goalLines[0] || tHeadlineFallback1)}</text>
    <text x="0" y="180" fill="#ffffff" font-size="56" font-weight="900" letter-spacing="-0.02em">${_xmlEscape(goalLines[1] || tHeadlineFallback2)}</text>

    <!-- desc / handoff line -->
    <text x="0" y="240" fill="rgba(255,245,230,0.78)" font-size="20" font-weight="500">${_xmlEscape(tHandoff)}</text>

    <!-- meta pills -->
    <g transform="translate(0 290)">
      <rect x="0" y="0" width="${64 + String(memberCount).length*12}" height="32" rx="16" ry="16" fill="rgba(251,146,60,0.10)" stroke="rgba(251,146,60,0.28)" stroke-width="1"/>
      <text x="${(64 + String(memberCount).length*12)/2}" y="22" text-anchor="middle" fill="#fb923c" font-size="13" font-weight="800" letter-spacing="0.04em">🤖 ${memberCount} AGENTS</text>
      <g transform="translate(${64 + String(memberCount).length*12 + 10} 0)">
        <rect x="0" y="0" width="76" height="32" rx="16" ry="16" fill="rgba(251,146,60,0.10)" stroke="rgba(251,146,60,0.28)" stroke-width="1"/>
        <text x="38" y="22" text-anchor="middle" fill="#fb923c" font-size="13" font-weight="800" letter-spacing="0.04em">💼 FREE</text>
      </g>
    </g>
  </g>

  <!-- RIGHT side: 6-member grid -->
  ${grid}

  <!-- Footer: URL on left, CTA on right -->
  <g transform="translate(48 568)">
    <text x="0" y="22" fill="rgba(255,245,230,0.72)" font-size="14" font-weight="500" font-family="'DM Mono','SF Mono',Menlo,monospace">myaiagents.agency/a/${_xmlEscape(team.share_id||'')}</text>
  </g>
  <g transform="translate(${1200 - 48 - 220} 564)">
    <rect x="0" y="0" width="220" height="44" rx="9" ry="9" fill="#fb923c"/>
    <text x="110" y="28" text-anchor="middle" fill="#0c0a09" font-size="14" font-weight="900" letter-spacing="0.04em">▶ 1-CLICK CLONE</text>
  </g>
</svg>`;
}

/** Render sitemap.xml: static pages + every live public listing. */
async function serveSitemapXml(res){
  const now = new Date().toISOString().slice(0,10);
  const urls = [
    {loc: APP_URL + '/',           changefreq:'weekly',  priority:'1.0', lastmod: now},
    {loc: APP_URL + '/lp.html',    changefreq:'weekly',  priority:'1.0', lastmod: now},
    {loc: APP_URL + '/store',      changefreq:'daily',   priority:'0.9', lastmod: now},
    {loc: APP_URL + '/changelog',  changefreq:'weekly',  priority:'0.7', lastmod: now},
    {loc: APP_URL + '/auth.html',  changefreq:'monthly', priority:'0.5', lastmod: now},
    {loc: APP_URL + '/terms.html', changefreq:'yearly',  priority:'0.3', lastmod: now},
    {loc: APP_URL + '/privacy.html',changefreq:'yearly', priority:'0.3', lastmod: now},
    {loc: APP_URL + '/legal.html', changefreq:'yearly',  priority:'0.3', lastmod: now},
  ];
  try{
    const listings = await listAllPublicListings();
    for(const l of listings){
      urls.push({
        loc: APP_URL + '/l/' + l.listing_id,
        changefreq: 'weekly',
        priority: '0.7',
        lastmod: (l.listed_at || now).slice(0,10),
      });
    }
  }catch(e){ console.warn('[sitemap] listings fetch failed:', e.message); }

  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(u => '  <url>\n' +
      '    <loc>' + _xmlEscape(u.loc) + '</loc>\n' +
      '    <lastmod>' + u.lastmod + '</lastmod>\n' +
      '    <changefreq>' + u.changefreq + '</changefreq>\n' +
      '    <priority>' + u.priority + '</priority>\n' +
      '  </url>').join('\n') +
    '\n</urlset>\n';

  res.writeHead(200, {
    'Content-Type':'application/xml; charset=utf-8',
    'Cache-Control':'public, max-age=900',                // 15分キャッシュ
  });
  res.end(xml);
}

/** Render the public group-invite landing HTML.
 * Shows the invitee a preview before they join — works without login.
 * Includes <meta og:*> for rich previews when the link is shared in LINE/Slack/Twitter.
 */
async function serveGroupInvitePage(res, token){
  let found = null;
  try { found = await findGroupByToken(token); } catch(e) { console.warn('[invite-landing]', e.message); }
  const safeToken = String(token||'').replace(/[^a-zA-Z0-9]/g,'').slice(0,16);

  if(!found){
    const html404 = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>招待が見つかりません — MY AI Agent</title>
<style>body{font-family:-apple-system,'SF Pro Display','Inter','Noto Sans JP',sans-serif;background:#fafafa;color:#09090b;margin:0;padding:80px 24px;text-align:center}h1{font-size:24px;margin-bottom:12px}p{color:#52525b;font-size:15px}a{color:#ea580c;font-weight:700;text-decoration:none}</style></head><body><h1>招待が見つかりません</h1><p>リンクが期限切れか、間違っている可能性があります。<br><a href="${APP_URL}">MY AI Agent トップへ →</a></p></body></html>`;
    res.writeHead(404,{'Content-Type':'text/html; charset=utf-8',...SEC});
    return res.end(html404);
  }

  const ag = found.agent;
  const host = found.host;
  const valid = isInviteValid(ag);
  const memberCount = (ag.members||[]).length;
  const maxMembers = ag.invite_max_members || 50;
  const hostName = host.name || (host.email||'').split('@')[0] || 'ホスト';
  const groupName = ag.name || 'グループ';
  const aiAvatar = (ag.avatar||'🤖');
  const aiAvDisplay = aiAvatar.startsWith('data:image/') ? '🤖' : aiAvatar; // emoji-only in OG/title

  const ogUrl = APP_URL + '/g/' + safeToken;
  const ogTitle = `${groupName} に招待されました`;
  const ogDesc  = `${hostName} さんから · AI + ${memberCount} 名 / 最大 ${maxMembers} 名 · あなたは無料で参加できます`;

  // Inline HTML (split-payload OG image is overkill for invites; keep simple)
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escHtml(ogTitle)} — MY AI Agent</title>
<meta name="description" content="${escHtml(ogDesc)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escHtml(ogTitle)}">
<meta property="og:description" content="${escHtml(ogDesc)}">
<meta property="og:url" content="${ogUrl}">
<meta property="og:site_name" content="MY AI Agent">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escHtml(ogTitle)}">
<meta name="twitter:description" content="${escHtml(ogDesc)}">
<style>
:root{--peach:#fb923c;--peach-dark:#ea580c;--peach-light:#fed7aa;--peach-soft:#fff7ed;
  --ink-900:#09090b;--ink-700:#27272a;--ink-500:#52525b;--ink-300:#a1a1aa;--ink-200:#d4d4d8;
  --bg-50:#fafafa;--bg-100:#f4f4f5;--green:#10b981;--rose:#ef4444;
  --line:rgba(9,9,11,.06);--line-strong:rgba(9,9,11,.1);
  --sans:-apple-system,'SF Pro Display','Inter','Noto Sans JP','Hiragino Kaku Gothic ProN',sans-serif;}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg-50);color:var(--ink-900);font-family:var(--sans);font-size:15px;line-height:1.6;letter-spacing:-.005em;-webkit-font-smoothing:antialiased;}
.wrap{max-width:480px;margin:0 auto;padding:32px 20px;}
.card{background:#fff;border-radius:18px;border:.5px solid var(--line);box-shadow:0 16px 40px rgba(0,0,0,.06),0 4px 10px rgba(0,0,0,.03);overflow:hidden;}
.banner{height:120px;background:linear-gradient(135deg,var(--peach),var(--peach-dark));display:flex;align-items:center;justify-content:center;color:#fff;}
.stack{position:relative;width:120px;height:56px;}
.stack > *{position:absolute;width:54px;height:54px;border-radius:14px;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.18);}
.stack .a1{left:0;top:0;background:linear-gradient(135deg,#3b82f6,#1d4ed8);}
.stack .a2{left:32px;top:0;background:linear-gradient(135deg,#10b981,#059669);}
.stack .a3{left:64px;top:0;background:linear-gradient(135deg,var(--peach),var(--peach-dark));}
.body{padding:24px 22px 16px;text-align:center;}
.from{font-size:12px;color:var(--ink-500);margin-bottom:8px;}
.from b{color:var(--ink-900);font-weight:700;}
.name{font-size:22px;font-weight:800;color:var(--ink-900);letter-spacing:-.02em;margin-bottom:6px;}
.desc{font-size:13px;color:var(--ink-500);line-height:1.55;margin-bottom:18px;}
.info{background:var(--bg-100);border-radius:11px;padding:14px;margin:0 22px 16px;}
.info-row{display:flex;justify-content:space-between;font-size:13px;padding:5px 0;border-bottom:.5px solid var(--line);}
.info-row:last-child{border-bottom:0;}
.info-row .k{color:var(--ink-500);}
.info-row .v{color:var(--ink-900);font-weight:600;}
.cost{margin:0 22px 14px;padding:11px 14px;background:var(--peach-soft);border:.5px solid rgba(251,146,60,.22);border-radius:11px;display:flex;align-items:flex-start;gap:9px;}
.cost .em{font-size:16px;flex-shrink:0;}
.cost .txt{font-size:12.5px;color:var(--peach-dark);line-height:1.5;}
.cost .txt b{font-weight:700;}
.cta{padding:0 22px 22px;display:flex;flex-direction:column;gap:8px;}
.btn-pri{background:linear-gradient(135deg,var(--peach),var(--peach-dark));color:#fff;border:0;border-radius:13px;padding:14px;font-size:14.5px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:-.005em;box-shadow:0 8px 20px rgba(251,146,60,.32);}
.btn-pri:disabled{background:var(--ink-200);color:#fff;box-shadow:none;cursor:not-allowed;}
.btn-sec{background:transparent;color:var(--ink-700);border:.5px solid var(--line-strong);border-radius:13px;padding:12px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;}
.expired{margin:0 22px 14px;padding:11px 14px;background:rgba(239,68,68,.08);border:.5px solid rgba(239,68,68,.2);border-radius:11px;color:#dc2626;font-size:12.5px;font-weight:600;text-align:center;}
.brand{text-align:center;font-size:11px;color:var(--ink-500);margin-top:24px;}
.brand a{color:var(--peach-dark);font-weight:700;text-decoration:none;}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="banner">
      <div class="stack">
        <div class="a1">${escHtml((hostName.charAt(0)||'?').toUpperCase())}</div>
        <div class="a2">+</div>
        <div class="a3">${escHtml(aiAvDisplay)}</div>
      </div>
    </div>
    <div class="body">
      <div class="from"><b>${escHtml(hostName)}</b> さんから招待</div>
      <div class="name">${escHtml(groupName)}</div>
      <div class="desc">AI + 仲間と一緒に話せる<br>グループ会話に参加できます</div>
    </div>
    <div class="info">
      <div class="info-row"><span class="k">参加者</span><span class="v">${memberCount} / ${maxMembers} 名</span></div>
      <div class="info-row"><span class="k">AI エージェント</span><span class="v">${escHtml(aiAvDisplay)} ${escHtml(groupName)}</span></div>
      <div class="info-row"><span class="k">招待主</span><span class="v">${escHtml(hostName)}</span></div>
    </div>
    <div class="cost">
      <span class="em">💰</span>
      <div class="txt"><b>あなたは 0 円から参加可能</b><br>AI 利用料はホストが負担。チャットは無料で使えます。</div>
    </div>
    ${valid ? '' : '<div class="expired">⚠ この招待は期限切れまたは満員です。ホストに新しいリンクをもらってください。</div>'}
    <div class="cta">
      <button class="btn-pri" id="joinBtn" ${valid?'':'disabled'} onclick="joinGroup()">参加する</button>
      <button class="btn-sec" onclick="location.href='${APP_URL}'">後で</button>
    </div>
  </div>
  <div class="brand">Powered by <a href="${APP_URL}">MY AI Agent</a></div>
</div>
<script>
const TOKEN = ${JSON.stringify(safeToken)};
async function joinGroup(){
  const btn = document.getElementById('joinBtn');
  btn.disabled = true;
  btn.textContent = '処理中…';
  // If not logged in, store token and redirect to auth, then back here on success
  const tk = localStorage.getItem('token');
  if(!tk){
    localStorage.setItem('pendingJoinToken', TOKEN);
    location.href = '/auth.html?next=' + encodeURIComponent('/g/' + TOKEN);
    return;
  }
  try {
    const r = await fetch('/api/g/' + TOKEN + '/join', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer ' + tk },
    });
    const d = await r.json();
    // 202 pending — host requires approval. Show pending state.
    if(r.status === 202 && d && d.pending){
      btn.disabled = true;
      btn.style.background = 'var(--ink-300)';
      btn.style.boxShadow = 'none';
      btn.textContent = '⏳ 承認待ち';
      const sub = document.createElement('div');
      sub.style.cssText = 'margin-top:10px;padding:11px 14px;background:rgba(99,102,241,.08);border:.5px solid rgba(99,102,241,.18);border-radius:11px;color:#4338ca;font-size:11.5px;text-align:center;line-height:1.55';
      sub.innerHTML = 'ホスト (' + (d.group_name ? '<b>'+d.group_name.replace(/[<>]/g,'')+'</b>' : 'グループの作成者') + ') の承認待ちです。<br>承認されたら通知が届きます。';
      btn.parentElement.appendChild(sub);
      return;
    }
    if(r.ok && d && d.ok){
      location.href = '/app.html?openAgent=' + encodeURIComponent(d.agent_id || '');
      return;
    }
    // 401 with "ユーザーが見つかりません" → stale token from a failed signup.
    // Clear local state and re-route through auth so they can register cleanly.
    if(r.status === 401){
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.setItem('pendingJoinToken', TOKEN);
      alert('ログイン情報が無効です。再度ログインまたは新規登録してください。');
      location.href = '/auth.html?next=' + encodeURIComponent('/g/' + TOKEN);
      return;
    }
    btn.textContent = (d && d.error) || 'エラー';
    setTimeout(()=>{ btn.disabled = false; btn.textContent = '参加する'; }, 2000);
  } catch(e){
    btn.textContent = 'ネットワークエラー';
    setTimeout(()=>{ btn.disabled = false; btn.textContent = '参加する'; }, 2000);
  }
}
// On page load: if user already authed and a pending token matches, auto-join
(async () => {
  const pending = localStorage.getItem('pendingJoinToken');
  const tk = localStorage.getItem('token');
  if(tk && pending === TOKEN){
    localStorage.removeItem('pendingJoinToken');
    joinGroup();
  }
})();
</script>
</body>
</html>`;
  res.writeHead(valid ? 200 : 410, {'Content-Type':'text/html; charset=utf-8',...SEC});
  return res.end(html);
}

function escHtml(s){
  return String(s==null?'':s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/** Build a publicListing-shaped object from an agent share, so we can reuse
 *  renderListingOgSvg without forking the renderer. */
function _agentAsListing(user, ag){
  const handle = '@' + ((user.email||'').split('@')[0] || 'creator');
  return {
    listing_id: ag.share_id || '',
    agent: {
      avatar: ag.avatar || '🤖',
      skills: ag.skills || [],
      chrome_enabled: !!ag.chrome_enabled,
    },
    title: ag.name || 'AI Agent',
    description: ag.persona || '',
    category: 'agent',
    category_label: 'AI Agent',
    tags: [],
    tag_labels: [],
    demo_prompts: [],
    creator: {
      handle,
      name: user.name || '',
      is_verified: !!user.is_verified,
    },
    rating: 0,
    rating_count: 0,
    uses: 0,
    purchases: 0,
    price_jpy: 0,
    badge: null,
    listed_at: ag.created_at || null,
  };
}

/** Render the public agent share landing HTML with OG meta SSR.
 *  Loads the static share.html and injects OG/Twitter Card tags before </head>
 *  so SNS unfurls show a proper preview. */
async function serveCreatorProfilePage(res, handle){
  try {
    let owner = null;
    if(USE_SUPA){
      const r = await sbReq('GET','users','?select=*&handle=eq.'+encodeURIComponent(handle)+'&limit=1');
      owner = (r.d && r.d[0]) || null;
    } else {
      owner = LDB.find(u => (u.handle||'').toLowerCase() === handle) || null;
    }
    if(!owner){
      res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'});
      return res.end('<!doctype html><meta charset="utf-8"><title>Not found</title><body style="font-family:system-ui;padding:60px;text-align:center;color:#444"><h1 style="font-size:22px;margin:0 0 8px">@'+escHtml(handle)+' not found</h1><p>This creator handle doesn\'t exist (yet).</p><p><a href="/">Go home</a></p></body>');
    }
    const listings = (owner.agents||[]).filter(a => a.marketplace && a.marketplace.is_listed).slice(0, 24);
    const name = escHtml(owner.name || ('@'+handle));
    const titleH = escHtml(name + ' — AI agents on MY AI AGENT');
    const descRaw = `${listings.length} AI agent${listings.length===1?'':'s'} by @${handle} on MY AI AGENT.`;
    const descH = escHtml(descRaw);
    const pageUrl = APP_URL + '/u/' + handle;
    const cardsHtml = listings.map(a => {
      const target = a.marketplace && a.marketplace.listing_id ? ('/l/' + a.marketplace.listing_id) : (a.share_id ? ('/a/' + a.share_id) : '#');
      const skills = (a.skills||[]).slice(0,3).map(s => '<span class="sk">'+escHtml(s)+'</span>').join('');
      return `<a class="card" href="${target}">
        <div class="card-av">${escHtml(a.avatar||'🤖')}</div>
        <div class="card-nm">${escHtml(a.name||'AI')}</div>
        <div class="card-pe">${escHtml((a.persona||'').slice(0,90))}</div>
        <div class="card-sk">${skills}</div>
      </a>`;
    }).join('') || `<div style="grid-column:1/-1;text-align:center;color:#a1a1aa;padding:40px 16px;font-size:13px">No listed agents yet.</div>`;
    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${titleH}</title>
<meta name="description" content="${descH}">
<meta property="og:type" content="profile">
<meta property="og:url" content="${pageUrl}">
<meta property="og:title" content="${titleH}">
<meta property="og:description" content="${descH}">
<meta property="og:image" content="${APP_URL}/social/og-agent-sample.png">
<meta property="og:site_name" content="MY AI AGENT">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${titleH}">
<meta name="twitter:description" content="${descH}">
<meta name="twitter:image" content="${APP_URL}/social/og-agent-sample.png">
<style>
  *{box-sizing:border-box}
  body{margin:0;background:#faf7f2;color:#1c1c1f;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Inter','Hiragino Sans',sans-serif;}
  .wrap{max-width:960px;margin:0 auto;padding:40px 22px 80px;}
  .hd{display:flex;align-items:center;gap:18px;margin-bottom:30px;}
  .hd .av{width:84px;height:84px;border-radius:20px;background:linear-gradient(135deg,#fff3e6,#ffe5cc);display:flex;align-items:center;justify-content:center;font-size:38px;font-weight:800;color:#7c2d12;flex-shrink:0;}
  .hd h1{font-size:28px;font-weight:800;margin:0 0 4px;letter-spacing:-.02em;}
  .hd .handle{color:#52525b;font-size:14px;font-weight:700;}
  .hd .stat{color:#a1a1aa;font-size:12.5px;margin-top:6px;}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;}
  .card{display:flex;flex-direction:column;gap:8px;padding:18px;background:#fff;border:1px solid #eee;border-radius:14px;text-decoration:none;color:inherit;transition:transform .12s ease;}
  .card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(0,0,0,.06);}
  .card-av{width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#fff3e6,#ffe5cc);display:flex;align-items:center;justify-content:center;font-size:22px;}
  .card-nm{font-weight:800;font-size:14.5px;}
  .card-pe{color:#52525b;font-size:12.5px;line-height:1.55;min-height:36px;}
  .card-sk{display:flex;gap:5px;flex-wrap:wrap;margin-top:2px;}
  .sk{background:#fdf1e3;color:#9a3412;font-size:11px;font-weight:700;padding:3px 7px;border-radius:6px;}
  .badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;}
  .b{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:800;padding:4px 9px;border-radius:999px;letter-spacing:.02em;}
  .b.founder{background:linear-gradient(135deg,#fb923c,#ea580c);color:#fff;box-shadow:0 4px 12px rgba(234,88,12,.32);}
  .b.founder::before{content:'★';font-size:13px;line-height:1;}
  .b.verified{background:rgba(22,163,74,.12);color:#15803d;border:1px solid rgba(22,163,74,.3);}
  .ftr{margin-top:50px;text-align:center;color:#a1a1aa;font-size:12px;}
  .ftr a{color:#ea580c;text-decoration:none;}
  @media (max-width:560px){
    .wrap{padding:24px 14px 60px;}
    .hd{flex-direction:column;align-items:flex-start;gap:14px;}
    .hd .av{width:64px;height:64px;font-size:28px;}
    .hd h1{font-size:22px;}
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="hd">
    <div class="av">${escHtml((owner.name||handle).charAt(0).toUpperCase())}</div>
    <div>
      <h1>${escHtml(owner.name||('@'+handle))}</h1>
      <div class="handle">@${escHtml(handle)}${owner.is_verified ? ' <span style="color:#16a34a">✓</span>' : ''}</div>
      <div class="badges">
        ${owner.is_founder ? `<span class="b founder" title="One of the first 100 creators on MY AI AGENT">Founder${owner.founder_seat_no?` #${owner.founder_seat_no}`:''}</span>` : ''}
        ${owner.is_verified ? '<span class="b verified">✓ Verified</span>' : ''}
      </div>
      <div class="stat" style="margin-top:6px">${listings.length} agent${listings.length===1?'':'s'} on the Agent Store</div>
    </div>
  </div>
  <div class="grid">${cardsHtml}</div>
  <div class="ftr">Discover more on <a href="/">MY AI AGENT</a></div>
</div>
</body></html>`;
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=180', ...SEC});
    res.end(html);
  } catch(e){
    console.warn('[profile] failed:', e.message);
    res.writeHead(500,{'Content-Type':'text/plain'}); res.end('Server error');
  }
}

async function serveChatSharePage(res, shareId, req){
  try{
    const found = await findChatShareById(shareId);
    if(!found){
      res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'});
      return res.end('<!doctype html><meta charset="utf-8"><title>Not found</title><body style="font-family:system-ui;padding:60px;text-align:center;color:#444"><h1 style="font-size:22px;margin:0 0 8px">Conversation not found</h1><p>This share link is invalid or has been deleted.</p><p><a href="/">Go home</a></p></body>');
    }
    // Expired share — 410 Gone with a friendlier page.
    if(found.share.expires_at && new Date(found.share.expires_at).getTime() < Date.now()){
      res.writeHead(410, {'Content-Type':'text/html; charset=utf-8'});
      return res.end('<!doctype html><meta charset="utf-8"><title>Expired</title><body style="font-family:system-ui;padding:60px;text-align:center;color:#444"><h1 style="font-size:22px;margin:0 0 8px">⌛ This share has expired</h1><p>The creator set this link to expire. Ask them for a fresh one.</p><p><a href="/">Go home</a></p></body>');
    }
    // View counter bump (fire and forget). Skip when bots are unfurling links —
    // Twitterbot / facebookexternalhit / Slackbot / LinkedInBot keep counts honest.
    const ua = (req && req.headers && req.headers['user-agent']) || '';
    const isBot = /bot|crawler|spider|preview|unfurl/i.test(ua);
    if(!isBot){
      found.share.view_count = (found.share.view_count||0) + 1;
      DB.save(found.user).catch(e => console.warn('[chat-share SSR view bump]', e.message));
    }
    const ag = found.agent || {};
    const sh = found.share || {};
    const owner = found.user || {};
    const ownerName = escHtml(owner.name || (owner.email||'').split('@')[0] || 'User');
    const agName = escHtml(ag.name || 'AI');
    const agAvatar = escHtml(ag.avatar || '🤖');
    const titleRaw = sh.title || (agName + ' — chat');
    const titleH = escHtml(_trunc(titleRaw, 90));
    const msgCount = (sh.messages||[]).length;
    const descRaw = ((sh.messages||[]).slice(-1)[0]?.content || '').toString().replace(/\s+/g,' ').slice(0,160) || `A ${msgCount}-message conversation with ${ag.name||'AI'} on MY AI AGENT.`;
    const descH = escHtml(_trunc(descRaw, 160));
    const pageUrl = APP_URL + '/c/' + shareId;
    // Inline the conversation as JSON inside a <script type="application/json"> so
    // we don't need a second round trip. Escape </script> defensively.
    const json = JSON.stringify({
      title: sh.title,
      created_at: sh.created_at,
      agent: { name: ag.name||'AI', avatar: ag.avatar||'🤖' },
      owner: { name: owner.name || (owner.email||'').split('@')[0] || 'User' },
      messages: sh.messages || [],
    }).replace(/<\/script/gi,'<\\/script');

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${titleH} — MY AI AGENT</title>
<meta name="description" content="${descH}">
<meta property="og:type" content="article">
<meta property="og:url" content="${pageUrl}">
<meta property="og:title" content="${titleH}">
<meta property="og:description" content="${descH}">
<meta property="og:image" content="${APP_URL}/social/og-agent-sample.png">
<meta property="og:site_name" content="MY AI AGENT">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${titleH}">
<meta name="twitter:description" content="${descH}">
<meta name="twitter:image" content="${APP_URL}/social/og-agent-sample.png">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js" crossorigin="anonymous"></script>
<style>
  :root{--bg:#faf7f2;--card:#fff;--ink:#1c1c1f;--ink2:#52525b;--ink3:#a1a1aa;--peach:#fb923c;--peach-d:#ea580c;--ring:rgba(251,146,60,.25);--ai-bg:#fff7ed;--u-bg:#1c1c1f;--u-ink:#fff8f0;}
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Inter','Hiragino Sans',sans-serif;line-height:1.55;}
  .wrap{max-width:760px;margin:0 auto;padding:18px 18px 96px;}
  .hd{display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--card);border:1px solid #eee;border-radius:14px;margin-bottom:14px;}
  .av{width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#fff3e6,#ffe5cc);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;}
  .h-name{font-weight:800;font-size:15px;}
  .h-meta{font-size:12px;color:var(--ink3);margin-top:1px;}
  .badge{font-size:10.5px;font-weight:800;letter-spacing:.04em;color:var(--peach-d);background:rgba(251,146,60,.12);border:1px solid var(--ring);padding:4px 8px;border-radius:999px;margin-left:auto;}
  h1.t{font-size:22px;font-weight:800;letter-spacing:-.01em;margin:6px 4px 14px;}
  .m{display:flex;gap:10px;margin:10px 0;align-items:flex-start;}
  .m.u{flex-direction:row-reverse;}
  .m .ic{width:30px;height:30px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;background:#e4e4e7;color:#27272a;}
  .m.a .ic{background:linear-gradient(135deg,#fff3e6,#ffe5cc);}
  .m .b{max-width:78%;border-radius:14px;padding:10px 14px;font-size:14.5px;}
  .m.a .b{background:var(--ai-bg);border:1px solid #f5e1cd;border-top-left-radius:4px;}
  .m.u .b{background:var(--u-bg);color:var(--u-ink);border-top-right-radius:4px;}
  .m .b pre{background:#0d0d10;color:#fafafa;padding:10px 12px;border-radius:8px;overflow-x:auto;font-size:12.5px;line-height:1.45;margin:6px 0;}
  .m.a .b code:not(pre code){background:#fde4cb;color:#7c2d12;padding:1px 5px;border-radius:4px;font-size:12.5px;}
  .m.u .b code:not(pre code){background:rgba(255,255,255,.12);color:#fff8f0;padding:1px 5px;border-radius:4px;font-size:12.5px;}
  .m .b img{max-width:100%;border-radius:8px;margin:4px 0;}
  .m .b a{color:inherit;text-decoration:underline;text-underline-offset:2px;}
  .m .b .katex{font-size:1em;}
  .sysrow{text-align:center;color:var(--ink3);font-size:11px;margin:10px 0;}
  .cta{position:fixed;left:0;right:0;bottom:0;background:linear-gradient(180deg,rgba(250,247,242,0) 0%,#faf7f2 32%);padding:30px 16px 18px;text-align:center;pointer-events:none;}
  .cta .inner{display:inline-flex;align-items:center;gap:10px;background:#1c1c1f;color:#fff;padding:11px 18px 11px 14px;border-radius:999px;font-weight:700;font-size:14px;box-shadow:0 14px 32px rgba(0,0,0,.18);pointer-events:auto;text-decoration:none;}
  .cta .inner b{color:var(--peach);font-weight:800;}
  .ftr{text-align:center;color:var(--ink3);font-size:11px;margin-top:18px;}
  @media (max-width:560px){
    .wrap{padding:14px 12px 96px;}
    .m .b{max-width:84%;font-size:14px;padding:9px 12px;}
    h1.t{font-size:19px;}
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="hd">
    <div class="av">${agAvatar}</div>
    <div>
      <div class="h-name">${agName}</div>
      <div class="h-meta">by ${owner.handle ? `<a href="/u/${escHtml(owner.handle)}" style="color:inherit;font-weight:700">@${escHtml(owner.handle)}</a>` : ownerName}${owner.is_founder ? ' <span style="background:linear-gradient(135deg,#fb923c,#ea580c);color:#fff;font-size:9.5px;font-weight:800;padding:2px 7px;border-radius:999px;letter-spacing:.02em;vertical-align:1px">★ Founder</span>' : ''} · ${msgCount} message${msgCount===1?'':'s'}${sh.view_count ? ' · 👁 '+sh.view_count+' view'+(sh.view_count===1?'':'s') : ''}</div>
    </div>
    <span class="badge">SHARED</span>
  </div>
  <h1 class="t">${titleH}</h1>
  <div id="msgs"><div class="sysrow">Loading…</div></div>
  <div class="ftr">Shared from <a href="/" style="color:inherit">MY AI AGENT</a> · read-only snapshot</div>
</div>
<a class="cta" href="/auth.html?ref=chatshare"><span class="inner">▶ Continue chatting on <b>MY AI AGENT</b></span></a>
<script type="application/json" id="data">${json}</script>
<script>
(function(){
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function md(src){
    if(!src) return '';
    var codeBlocks=[];
    src=String(src).replace(/\`\`\`(\\w*)\\n?([\\s\\S]*?)\`\`\`/g, function(_,l,c){ var i=codeBlocks.length; codeBlocks.push(c.replace(/\\n+$/,'')); return '\\u0001CB'+i+'\\u0001'; });
    var math=[];
    function pm(t,d){ var i=math.length; math.push({tex:t,display:!!d}); return '\\u0002MX'+i+'\\u0002'; }
    src=src.replace(/\\$\\$([\\s\\S]+?)\\$\\$/g, function(_,t){ return pm(t,true); });
    src=src.replace(/\\\\\\[([\\s\\S]+?)\\\\\\]/g, function(_,t){ return pm(t,true); });
    src=src.replace(/\\\\\\(([\\s\\S]+?)\\\\\\)/g, function(_,t){ return pm(t,false); });
    src=src.replace(/(^|[^$\\\\\\w])\\$([^\\s$][^$\\n]*?[^\\s$])\\$(?=$|[^$\\w])/g, function(m,pre,t){ if(/^\\s*\\d+(\\.\\d+)?\\s*$/.test(t)) return m; return pre+pm(t,false); });
    var html=esc(src);
    html=html.replace(/\\u0001CB(\\d+)\\u0001/g, function(_,i){ return '<pre><code>'+esc(codeBlocks[+i])+'</code></pre>'; });
    html=html.replace(/\\u0002MX(\\d+)\\u0002/g, function(_,i){ var b=math[+i]; if(window.katex){ try{ return window.katex.renderToString(b.tex,{displayMode:b.display,throwOnError:false,output:'html'}); }catch(e){} } return '<code>'+esc(b.tex)+'</code>'; });
    html=html.replace(/^### (.+)$/gm,'<h3>$1</h3>').replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^# (.+)$/gm,'<h1>$1</h1>');
    html=html.replace(/\`([^\`\\n]+)\`/g,'<code>$1</code>');
    html=html.replace(/\\*\\*([^*\\n]+)\\*\\*/g,'<strong>$1</strong>').replace(/\\*([^*\\n]+)\\*/g,'<em>$1</em>');
    html=html.replace(/!\\[([^\\]]*)\\]\\((https?:\\/\\/[^)]+)\\)/g,'<img src="$2" alt="$1" loading="lazy">');
    html=html.replace(/\\[([^\\]]+)\\]\\((https?:\\/\\/[^)]+)\\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
    html=html.replace(/\\n/g,'<br>');
    return html;
  }
  var data; try{ data=JSON.parse(document.getElementById('data').textContent); }catch(e){ data={messages:[]}; }
  var av = data.agent && data.agent.avatar || '🤖';
  var owner = data.owner && data.owner.name || 'User';
  var el = document.getElementById('msgs');
  if(!data.messages.length){ el.innerHTML='<div class="sysrow">(empty)</div>'; return; }
  el.innerHTML = data.messages.map(function(m){
    if(m.role==='system') return '<div class="sysrow">'+esc(m.content||'')+'</div>';
    var isU = m.role==='user';
    var ic = isU ? (m.user_avatar || (owner.charAt(0)||'?').toUpperCase()) : av;
    return '<div class="m '+(isU?'u':'a')+'"><div class="ic">'+esc(ic)+'</div><div class="b">'+md(m.content||'')+'</div></div>';
  }).join('');
  // Run KaTeX once the deferred script loads.
  if(window.katex){ /* already inlined */ }
  else window.addEventListener('load', function(){ /* re-render with katex */
    el.innerHTML = data.messages.map(function(m){
      if(m.role==='system') return '<div class="sysrow">'+esc(m.content||'')+'</div>';
      var isU = m.role==='user';
      var ic = isU ? (m.user_avatar || (owner.charAt(0)||'?').toUpperCase()) : av;
      return '<div class="m '+(isU?'u':'a')+'"><div class="ic">'+esc(ic)+'</div><div class="b">'+md(m.content||'')+'</div></div>';
    }).join('');
  });
})();
</script>
</body></html>`;
    res.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=120', ...SEC});
    res.end(html);
  }catch(e){
    console.warn('[chatShareSSR] failed:', e.message);
    res.writeHead(500, {'Content-Type':'text/plain'});
    res.end('Server error');
  }
}

async function serveAgentSharePage(res, shareId){
  try{
    const found = await findAgentByShareId(shareId);
    // Always inject *some* OG block — even on lookup miss we show brand card
    // so SNS unfurls don't show a bare URL.
    const hasAgent = !!(found && found.agent && found.agent.share_id);
    const ag = hasAgent ? found.agent : null;
    const isTeam = hasAgent && !!ag.is_team;
    const memCount = isTeam ? (Array.isArray(ag.team_member_agent_ids) ? ag.team_member_agent_ids.length : 0) : 0;
    // Lang for OG title/description: stored team.lang wins; otherwise detect
    // from CJK chars in the agent's text. English is the default product
    // language so unknown / mixed cases lean EN.
    const ogIsJa = isTeam
      ? (ag.lang === 'ja' || (ag.lang !== 'en' && /[ぁ-んァ-ヶー一-龠]/.test((ag.name||'') + ' ' + (ag.team_goal||''))))
      : (hasAgent && /[ぁ-んァ-ヶー一-龠]/.test((ag.name||'') + ' ' + (ag.persona||'')));
    const titleH = escHtml(hasAgent
      ? (isTeam
          ? (ogIsJa
              ? `🎯 ${ag.name || 'Agent Team'} · AI ${memCount} 体のチーム`
              : `🎯 ${ag.name || 'Agent Team'} · ${memCount} AI agents`)
          : (ag.name || 'AI Agent'))
      : 'MY AI AGENT — Build your own AI Team');
    // Teams have empty persona — fall back to team_goal so the unfurl still
    // tells the visitor what the team does.
    const fallbackTeamDesc = ogIsJa
      ? 'MY AI AGENT で動くマルチエージェント AI チーム。'
      : 'A multi-agent AI team on MY AI AGENT.';
    const fallbackAgentDesc = ogIsJa
      ? 'MY AI AGENT で作られたカスタム AI エージェント。'
      : 'A custom AI agent on MY AI AGENT.';
    const fallbackBrandDesc = 'Build your own AI agent team. Templates, group chat, Agent Store. Free to start.';
    // Filter AI system prompts out of og:description — they're internal copy.
    const _isSysPrompt = (s) => !!s && /^(you are|you operate|you act|act as|operate as|あなたは|あなたが|お前は)/i.test(String(s).trim().slice(0,40));
    const _pickDesc = (...candidates) => {
      for(const c of candidates){
        const t = (c||'').trim();
        if(t && !_isSysPrompt(t)) return t;
      }
      return '';
    };
    const descSrc = isTeam
      ? (_pickDesc(ag.team_goal, ag.persona) || fallbackTeamDesc)
      : hasAgent
      ? (_pickDesc(ag.persona) || fallbackAgentDesc)
      : fallbackBrandDesc;
    const descH  = escHtml(_trunc(descSrc, 160));
    const pageUrl = APP_URL + '/a/' + shareId;
    // Per-agent dynamic OG. The endpoint renders a 1200x630 card with the
    // agent's name, description, avatar, and creator handle.
    // Cache-bust key: derived from agent.updated_at so SNS unfurls refresh
    // when the creator edits the agent (otherwise Twitter / FB cache the
    // first fetch result indefinitely).
    let cacheKey = '';
    if(hasAgent){
      const stamp = String(ag.updated_at || ag.created_at || '') + (ag.name||'') + (ag.persona||'');
      cacheKey = '?v=' + crypto.createHash('sha1').update(stamp).digest('hex').slice(0,8);
    }
    const ogPng  = hasAgent
      ? APP_URL + '/api/og/a/' + shareId + '.png' + cacheKey
      : APP_URL + '/social/og-agent-sample.png';
    const ogSvg  = hasAgent
      ? APP_URL + '/api/og/a/' + shareId + '.svg' + cacheKey
      : APP_URL + '/social/og-agent-sample.svg';

    const ogBlock = `<title>${titleH} — MY AI AGENT</title>
<meta name="description" content="${descH}">
<meta property="og:type" content="website">
<meta property="og:url" content="${pageUrl}">
<meta property="og:title" content="${titleH}">
<meta property="og:description" content="${descH}">
<meta property="og:image" content="${ogPng}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${titleH}">
<meta property="og:site_name" content="MY AI AGENT">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${titleH}">
<meta name="twitter:description" content="${descH}">
<meta name="twitter:image" content="${ogPng}">
<meta name="twitter:image:alt" content="${titleH}">
<link rel="alternate" type="image/svg+xml" href="${ogSvg}">`;

    fs.readFile(path.join(PUBLIC_DIR, 'share.html'), 'utf8', (err, raw) => {
      if(err){
        res.writeHead(500, {'Content-Type':'text/plain'});
        return res.end('share template missing');
      }
      // Strip the existing <title> and inject the OG block right before </head>.
      let html = raw.replace(/<title>[\s\S]*?<\/title>/i, '');
      html = html.replace(/<\/head>/i, ogBlock + '\n</head>');
      const headers = {
        'Content-Type':'text/html; charset=utf-8',
        'Cache-Control':'public, max-age=300',
        ...SEC,
      };
      res.writeHead(200, headers);
      res.end(html);
    });
  }catch(e){
    console.warn('[shareSSR] failed:', e.message);
    return serveStatic(res, path.join(PUBLIC_DIR, 'share.html'));
  }
}

/** Render the public listing landing HTML with OG meta SSR. */
async function serveListingPage(res, listingId, lang){
  lang = (lang === 'en') ? 'en' : 'ja';
  const T_JA = {
    notFound:'Listing not found', langSwitch:'EN', langSwitchHref:'?lang=en', htmlLang:'ja',
    navMarket:'Agent Store', navSignup:'無料で始める',
    trustPill1:'3 ターン無料で試せる', trustPill2:'登録不要', trustPill3:'30 秒で結果',
    ctaPriHero:'🎯 今すぐ無料で試す →',
    statRatingsLbl:'件の評価', statUsesLbl:'利用回数',
    descSectionH:'このエージェントができること',
    demosSectionH:'こんな依頼が得意です（クリックで試せる）',
    demosArrow:'▸ クリックで実行', demosCustom:'あなたの状況を直接書いて試す', demosCustomArrow:'▸ 自由入力',
    tryBannerH:'まずは話しかけてみる', tryBannerSub:'サインアップ前に <b>3 ターン</b> まで無料で会話できます。リアルなレスポンスをその場で確認できます。',
    tryBannerPh:'例: 商談後の追客メールを書いて', tryBannerSend:'送信',
    howSectionH:'使い方は 3 ステップ',
    how1H:'まず無料で試す', how1P:'登録不要で 3 ターン会話できます。期待した品質か確認',
    how2H:'チームに追加', how2P:'30 秒で無料登録。あなたのアカウントにこのエージェントを追加',
    how3H:'毎日使う', how3P:'10 メッセージまで無料。あとは利用量に応じた従量課金',
    finalH:'このエージェントを<br>あなたのチームに迎えませんか？',
    finalSub:'登録は 30 秒。最初の 10 メッセージは無料です。',
    finalBtn:'＋ チームに追加して使い始める →',
    creatorLbl:'クリエイター: ', skillsLbl:'スキル: ', chromeLbl:'Chrome 連携',
    rateUnRated:'未評価',
    tryTitle:'🎯 試してみる', trySub:'サインアップ前に <b>3 ターン</b> まで無料で会話できます',
    tryEmpty:'まずは下から話しかけてみてください', tryPlaceholder:'メッセージを入力…',
    trySend:'送信', tryRemainingPre:'残り ', tryRemainingPost:' ターン',
    trySignupCTA:'無料登録して続けて使う →', tryThinking:'考え中…', tryError:'エラー',
    tryNetErr:'通信エラー', tryDemoH:'デモプロンプト',
    sShareCopy:'🔗 URL コピー', sShareDone:'✓ コピー済',
    footPowered:'Powered by', footAbout:'サービスを知る',
    footTerms:'利用規約', footPrivacy:'プライバシー', footLegal:'特商法表記',
    tweetSuffix:' — MY AI AGENT',
  };
  const T_EN = {
    notFound:'Listing not found', langSwitch:'日本語', langSwitchHref:'?lang=ja', htmlLang:'en',
    navMarket:'Marketplace', navSignup:'Get started free',
    trustPill1:'3 turns free', trustPill2:'No signup needed', trustPill3:'Results in seconds',
    ctaPriHero:'🎯 Try it free now →',
    statRatingsLbl:'ratings', statUsesLbl:'uses',
    descSectionH:'What this agent can do',
    demosSectionH:'Try one of these (click to run)',
    demosArrow:'▸ Click to run', demosCustom:'Or type your own scenario', demosCustomArrow:'▸ Free input',
    tryBannerH:'Talk to it first', tryBannerSub:'Talk for <b>3 turns</b> free before signup. See the real response right here.',
    tryBannerPh:'e.g. Write a follow-up email after a sales meeting', tryBannerSend:'Send',
    howSectionH:'How it works (3 steps)',
    how1H:'Try it free', how1P:'No signup. 3 turns of conversation to check quality',
    how2H:'Add to your team', how2P:'30-second free signup. Adds this agent to your account',
    how3H:'Use daily', how3P:'First 10 messages free, then pay-as-you-go',
    finalH:'Ready to add this agent<br>to your team?',
    finalSub:'30-second signup. First 10 messages are free.',
    finalBtn:'+ Add to my team and start →',
    creatorLbl:'Creator: ', skillsLbl:'Skills: ', chromeLbl:'Chrome connected',
    rateUnRated:'no ratings',
    tryTitle:'🎯 Try it', trySub:'Talk to this agent for <b>3 turns</b> free, no signup required',
    tryEmpty:'Send a message to start chatting', tryPlaceholder:'Type a message…',
    trySend:'Send', tryRemainingPre:'', tryRemainingPost:' turns left',
    trySignupCTA:'Sign up free to continue →', tryThinking:'Thinking…', tryError:'Error',
    tryNetErr:'Network error', tryDemoH:'Demo prompts',
    sShareCopy:'🔗 Copy URL', sShareDone:'✓ Copied',
    footPowered:'Powered by', footAbout:'About',
    footTerms:'Terms', footPrivacy:'Privacy', footLegal:'Commerce',
    tweetSuffix:' — MY AI AGENT',
  };
  const t = lang === 'en' ? T_EN : T_JA;

  try{
    const found = await findAgentByListingId(listingId);
    if(!found || !found.agent.marketplace.is_listed){
      res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});
      const isEn = lang === 'en';
      const ttl = isEn ? 'Listing not found' : '出店が見つかりません';
      const hint = isEn
        ? 'This listing may have been unpublished or the link is incorrect.'
        : 'この出店は取り下げられたか、URL が間違っている可能性があります。';
      const back = isEn ? '← Browse all agents' : '← Agent Store を見る';
      const home = isEn ? 'Go home' : 'ホームへ';
      return res.end(`<!doctype html><html lang="${isEn?'en':'ja'}"><head><meta charset="utf-8"><title>${ttl} — MY AI AGENT</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:'Inter','Hiragino Sans',sans-serif;background:#fdf8f3;color:#1a0a00;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;}.box{max-width:480px;background:#fff;border:1px solid rgba(180,120,80,.16);border-radius:18px;padding:36px 32px;text-align:center;box-shadow:0 14px 40px rgba(180,90,30,.10);}.em{font-size:64px;margin-bottom:14px;line-height:1;}h1{font-size:22px;font-weight:800;letter-spacing:-.01em;margin:0 0 8px;}p{font-size:13.5px;color:#5c3a1e;line-height:1.7;margin:0 0 22px;}a{display:inline-block;background:#fb923c;color:#fff;text-decoration:none;font-weight:700;font-size:13px;padding:11px 22px;border-radius:10px;margin:0 4px;box-shadow:0 6px 14px rgba(251,146,60,.28);}a.alt{background:#fff;color:#5c3a1e;border:1px solid rgba(180,120,80,.22);box-shadow:none;}a:hover{background:#ea580c;}a.alt:hover{background:#faf3eb;}</style></head><body><div class="box"><div class="em">🔍</div><h1>${ttl}</h1><p>${hint}</p><a href="/">${back}</a><a href="/" class="alt">${home}</a></div></body></html>`);
    }
    const d = publicListing(found.user, found.agent);
    // PNG for OG / Twitter (raster required). SVG variant available for inline preview.
    const ogPngUrl = APP_URL + '/api/og/' + listingId + '.png';
    const ogSvgUrl = APP_URL + '/api/og/' + listingId + '.svg';
    const pageUrl = APP_URL + '/l/' + listingId;
    const titleH = _xmlEscape(d.title||'AI Agent');
    const descH = _xmlEscape(_trunc(d.description||'', 160));
    const catH = _xmlEscape(d.category_label||'');
    const av = _xmlEscape(d.agent?.avatar||'🤖');
    const skills = (d.agent?.skills||[]).join(' / ');
    const handle = _xmlEscape(d.creator?.handle||'');
    const verifiedBadge = d.creator?.is_verified
      ? '<span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;background:#2563eb;border-radius:50%;color:#fff;font-size:10px;font-weight:900;margin-left:4px;vertical-align:middle">✓</span>'
      : '';
    const ratingTxt = d.rating>0 ? `★ ${d.rating.toFixed(1)} (${d.rating_count})` : ('★ '+t.rateUnRated);
    const usesTxt = (d.uses||0).toLocaleString();

    const html = `<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${titleH} — MY AI AGENT</title>
<link rel="alternate" hreflang="ja" href="${pageUrl}?lang=ja">
<link rel="alternate" hreflang="en" href="${pageUrl}?lang=en">
<link rel="alternate" hreflang="x-default" href="${pageUrl}">
<meta name="description" content="${descH}">
<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="${pageUrl}">
<meta property="og:title" content="${titleH}">
<meta property="og:description" content="${descH}">
<meta property="og:image" content="${ogPngUrl}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${titleH}">
<meta property="og:site_name" content="MY AI AGENT">
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${titleH}">
<meta name="twitter:description" content="${descH}">
<meta name="twitter:image" content="${ogPngUrl}">
<meta name="twitter:image:alt" content="${titleH}">
<style>
:root{
  --peach:#fb923c;--peach-dark:#ea580c;--peach-light:#fed7aa;
  --cream:#fdf8f3;--cream2:#faf3eb;--cream3:#f5ebe0;
  --text:#2d1a0e;--text2:#6b4226;--text3:#9a6a4a;
  --wire:rgba(180,120,80,.08);--wire2:rgba(180,120,80,.18);
  --green:#10b981;--blue:#2563eb;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Hiragino Sans','Noto Sans JP','Helvetica Neue',sans-serif;background:var(--cream);color:var(--text);min-height:100vh;}
a{color:inherit;}

.lp-nav{display:flex;align-items:center;justify-content:space-between;padding:14px 22px;background:rgba(255,255,255,.85);backdrop-filter:blur(8px);border-bottom:1px solid var(--wire);position:sticky;top:0;z-index:5;}
.lp-brand{font-weight:900;color:var(--peach-dark);letter-spacing:.04em;font-size:14px;text-decoration:none;}
.lp-nav-r{display:flex;gap:14px;align-items:center;font-size:12.5px;}
.lp-nav-r a{color:var(--text3);text-decoration:none;font-weight:700;}
.lp-nav-r a:hover{color:var(--text);}
.lp-nav-r .lp-cta{background:var(--peach);color:#fff;padding:8px 16px;border-radius:9px;}
.lp-nav-r .lp-cta:hover{background:var(--peach-dark);color:#fff;}

.lp-hero{background:radial-gradient(ellipse at top,#ffedd5 0%,#fed7aa 30%,transparent 70%),linear-gradient(180deg,#fdf8f3 0%,#fff 100%);padding:56px 22px 36px;text-align:center;position:relative;overflow:hidden;}
.lp-hero::after{content:'';position:absolute;width:340px;height:340px;border-radius:50%;background:rgba(255,255,255,.4);right:-120px;top:60px;}
.lp-hero::before{content:'';position:absolute;width:240px;height:240px;border-radius:50%;background:rgba(251,146,60,.18);left:-80px;bottom:-50px;}
.lp-cat{display:inline-block;font-size:11.5px;font-weight:800;color:var(--peach-dark);background:rgba(251,146,60,.12);padding:5px 14px;border-radius:999px;letter-spacing:.06em;margin-bottom:18px;position:relative;z-index:1;}
.lp-sticker{width:130px;height:130px;border-radius:32px;background:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:80px;box-shadow:0 14px 36px rgba(180,80,40,.2);transform:rotate(-6deg);margin-bottom:24px;position:relative;z-index:1;overflow:hidden;}
.lp-sticker img{width:100%;height:100%;object-fit:cover;}
.lp-name{font-size:38px;font-weight:900;color:#1a0d05;letter-spacing:-.02em;line-height:1.1;margin-bottom:14px;position:relative;z-index:1;max-width:760px;margin-left:auto;margin-right:auto;}
.lp-tagline{font-size:17px;color:var(--text2);font-weight:600;line-height:1.65;max-width:580px;margin:0 auto 24px;position:relative;z-index:1;white-space:pre-wrap;}
.lp-creator-row{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--text2);font-weight:600;background:#fff;padding:7px 14px;border-radius:999px;border:1px solid var(--wire2);position:relative;z-index:1;margin-bottom:8px;}
.lp-creator-row b{color:var(--peach-dark);font-weight:800;}
.lp-verified{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;background:var(--blue);color:#fff;border-radius:50%;font-size:10px;font-weight:900;}
.lp-trust-pills{display:flex;justify-content:center;gap:8px;margin:24px 0 30px;flex-wrap:wrap;position:relative;z-index:1;}
.lp-trust-pills .pl{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:800;color:var(--text);background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.25);padding:7px 14px;border-radius:999px;}
.lp-trust-pills .pl .ck{color:var(--green);font-size:13px;}
.lp-cta-primary{display:inline-block;background:var(--peach);color:#fff;font-weight:900;font-size:17px;padding:16px 38px;border-radius:14px;border:none;cursor:pointer;font-family:inherit;text-decoration:none;box-shadow:0 12px 28px rgba(251,146,60,.4);position:relative;z-index:1;transition:all .15s;}
.lp-cta-primary:hover{background:var(--peach-dark);transform:translateY(-2px);box-shadow:0 16px 36px rgba(234,88,12,.45);}
.lp-stats{display:flex;justify-content:center;gap:36px;margin-top:24px;position:relative;z-index:1;flex-wrap:wrap;}
.lp-stats .st{text-align:center;}
.lp-stats .st .v{font-size:22px;font-weight:900;color:#1a0d05;font-feature-settings:'tnum';}
.lp-stats .st .v .star{color:#f59e0b;}
.lp-stats .st .l{font-size:11px;color:var(--text3);font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-top:2px;}

.lp-section{max-width:760px;margin:0 auto;padding:40px 22px;}
.lp-section h2{font-size:22px;font-weight:900;color:#1a0d05;text-align:center;margin-bottom:22px;letter-spacing:-.01em;}
.lp-desc-box{background:#fff;border:1px solid var(--wire2);border-radius:18px;padding:24px 28px;font-size:14.5px;line-height:1.85;color:var(--text);box-shadow:0 4px 14px rgba(180,120,80,.04);white-space:pre-wrap;}

.lp-demos{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
@media(max-width:560px){.lp-demos{grid-template-columns:1fr;}}
.lp-demo-card{background:#fff;border:1px solid var(--wire2);border-radius:14px;padding:18px 22px;cursor:pointer;transition:all .15s;text-align:left;font-family:inherit;}
.lp-demo-card:hover{border-color:var(--peach);transform:translateY(-2px);box-shadow:0 8px 20px rgba(180,120,80,.08);}
.lp-demo-card .num{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;background:var(--peach);color:#fff;border-radius:50%;font-size:12px;font-weight:900;margin-bottom:10px;}
.lp-demo-card .txt{font-size:14px;color:var(--text);font-weight:600;line-height:1.55;}
.lp-demo-card .arrow{margin-top:8px;font-size:12px;color:var(--peach-dark);font-weight:700;}
.lp-demo-card.custom{background:linear-gradient(135deg,#fff7ed,#ffedd5);border-color:rgba(251,146,60,.25);}
.lp-demo-card.custom .num{background:var(--text2);}

.lp-try-banner{background:linear-gradient(135deg,#fff7ed,#ffedd5);border:1px solid rgba(251,146,60,.25);border-radius:18px;padding:24px 28px;}
.lp-try-banner .head{display:flex;align-items:center;gap:14px;margin-bottom:14px;}
.lp-try-banner .em{font-size:42px;line-height:1;flex-shrink:0;}
.lp-try-banner h3{font-size:17px;font-weight:900;color:#1a0d05;margin-bottom:5px;}
.lp-try-banner p{font-size:13px;color:var(--text2);font-weight:600;line-height:1.65;}
.lp-try-banner p b{color:var(--peach-dark);}

.try-msgs{display:flex;flex-direction:column;gap:8px;min-height:60px;max-height:340px;overflow-y:auto;padding:4px 2px;margin-bottom:8px;}
.try-msgs:empty::before{content:'${t.tryEmpty.replace(/'/g,"\\'")}';color:var(--text3);font-size:12.5px;font-weight:600;font-style:italic;padding:14px 4px;display:block;text-align:center;}
.try-bub{padding:11px 14px;border-radius:14px;font-size:13.5px;line-height:1.6;max-width:88%;white-space:pre-wrap;word-break:break-word;}
.try-bub.u{align-self:flex-end;background:rgba(251,146,60,.14);border:1px solid rgba(251,146,60,.25);color:var(--text);}
.try-bub.a{align-self:flex-start;background:#fff;border:1px solid var(--wire2);color:var(--text);box-shadow:0 2px 6px rgba(180,120,80,.04);}
.try-bub.thinking{color:var(--text3);font-style:italic;}
.try-form{display:flex;gap:6px;margin-top:6px;}
.try-form input{flex:1;padding:12px 16px;border:1px solid rgba(180,120,80,.2);border-radius:11px;background:#fff;font-size:14px;font-family:inherit;color:var(--text);outline:none;}
.try-form input:focus{border-color:var(--peach);}
.try-form input:disabled{opacity:.6;}
.try-form button{padding:0 22px;background:var(--peach);color:#fff;border:none;border-radius:11px;font-weight:800;font-size:14px;cursor:pointer;font-family:inherit;}
.try-form button:hover:not(:disabled){background:var(--peach-dark);}
.try-form button:disabled{opacity:.5;cursor:not-allowed;}
.try-status{margin-top:8px;font-size:11px;color:var(--text3);font-weight:600;text-align:right;}
.try-cta{margin-top:12px;padding:14px 16px;background:linear-gradient(135deg,var(--peach),var(--peach-dark));color:#fff;border-radius:11px;text-align:center;display:block;text-decoration:none;font-weight:800;font-size:13px;}
.try-cta:hover{filter:brightness(1.08);}

.lp-how{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
@media(max-width:560px){.lp-how{grid-template-columns:1fr;}}
.lp-how-step{background:#fff;border:1px solid var(--wire2);border-radius:14px;padding:22px 18px;text-align:center;}
.lp-how-step .n{width:38px;height:38px;border-radius:50%;background:var(--peach);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:15px;margin:0 auto 12px;}
.lp-how-step h3{font-size:14px;font-weight:900;color:#1a0d05;margin-bottom:6px;}
.lp-how-step p{font-size:12.5px;color:var(--text2);font-weight:600;line-height:1.6;}

.lp-final-cta{background:linear-gradient(135deg,var(--peach),var(--peach-dark));color:#fff;border-radius:24px;padding:44px 28px;text-align:center;}
.lp-final-cta h2{color:#fff;font-size:24px;margin-bottom:0;}
.lp-final-cta p{font-size:14.5px;color:rgba(255,255,255,.85);font-weight:600;margin:12px 0 22px;line-height:1.7;}
.lp-final-btn{background:#fff;color:var(--peach-dark);font-weight:900;font-size:16px;padding:16px 38px;border-radius:12px;border:none;cursor:pointer;font-family:inherit;text-decoration:none;display:inline-block;}
.lp-final-btn:hover{background:#fef3e7;}

.lp-share{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:14px;}
.lp-share a{padding:8px 14px;border-radius:10px;font-size:12.5px;font-weight:700;text-decoration:none;color:var(--text2);background:#fff;border:1px solid var(--wire2);display:inline-flex;align-items:center;gap:5px;}
.lp-share a:hover{background:var(--cream2);}

.lp-foot{padding:28px 22px;text-align:center;font-size:12px;color:var(--text3);font-weight:600;border-top:1px solid var(--wire);margin-top:30px;}
.lp-foot a{color:var(--peach-dark);text-decoration:none;font-weight:700;}

.lang-switch{position:absolute;top:14px;right:18px;font-size:12px;color:var(--text2);background:#fff;padding:6px 12px;border:1px solid var(--wire2);border-radius:8px;font-weight:700;text-decoration:none;z-index:2;}
.lang-switch:hover{background:var(--cream2);color:var(--text);}
</style>
</head>
<body>
<nav class="lp-nav">
  <a href="/" class="lp-brand">🍑 MY AI AGENT</a>
  <div class="lp-nav-r">
    <a href="/app.html">${t.navMarket}</a>
    <a href="${t.langSwitchHref}">${t.langSwitch}</a>
    <a href="/auth.html?next=/l/${listingId}" class="lp-cta">${t.navSignup}</a>
  </div>
</nav>

<div class="lp-hero">
  <div class="lp-cat">${catH}</div>
  <div class="lp-sticker">${av.startsWith('data:image/') ? `<img src="${av}" alt="">` : av}</div>
  <div class="lp-name">${titleH}</div>
  <div class="lp-tagline">${_xmlEscape(_trunc(d.description||'', 140))}</div>

  <div class="lp-creator-row">
    ${t.creatorLbl}<b>${handle}</b>${d.creator?.is_verified ? '<span class="lp-verified">✓</span>' : ''}
  </div>

  <div class="lp-trust-pills">
    <span class="pl"><span class="ck">✓</span>${t.trustPill1}</span>
    <span class="pl"><span class="ck">✓</span>${t.trustPill2}</span>
    <span class="pl"><span class="ck">✓</span>${t.trustPill3}</span>
  </div>

  <a class="lp-cta-primary" href="#try">${t.ctaPriHero}</a>

  <div class="lp-stats">
    <div class="st"><div class="v"><span class="star">★</span> ${d.rating>0 ? d.rating.toFixed(1) : '—'}</div><div class="l">${d.rating_count||0} ${t.statRatingsLbl}</div></div>
    <div class="st"><div class="v">${usesTxt}</div><div class="l">${t.statUsesLbl}</div></div>
  </div>
</div>

<div class="lp-section">
  <h2>${t.descSectionH}</h2>
  <div class="lp-desc-box">${_xmlEscape(d.description||'')}</div>
</div>

${d.is_team && Array.isArray(d.team_members) && d.team_members.length ? `<div class="lp-section">
  <h2>${lang==='en'?'Team members':'チームのメンバー'} <span style="font-size:14px;color:#9a6a4a;font-weight:600;letter-spacing:0">· ${d.member_count||d.team_members.length} ${lang==='en'?'agents':'体'}</span></h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:12px">
    ${d.team_members.map((m, i) => `<div style="background:#fff;border:1px solid rgba(180,120,80,.16);border-radius:13px;padding:14px;display:flex;align-items:flex-start;gap:11px">
      <div style="width:42px;height:42px;border-radius:11px;background:linear-gradient(135deg,#fff7ee,#fed7aa);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${_xmlEscape(m.avatar||'🤖')}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:10px;font-weight:800;color:#ea580c;letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px">Step ${i+1}</div>
        <div style="font-size:13.5px;font-weight:800;letter-spacing:-.005em;margin-bottom:5px">${_xmlEscape(m.name||'AI')}</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">${(m.skills||[]).slice(0,3).map(s => `<span style="background:#faf3eb;color:#5c3a1e;font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px;border:.5px solid rgba(180,120,80,.18)">${_xmlEscape(s)}</span>`).join('')}</div>
      </div>
    </div>`).join('')}
  </div>
  ${d.team_goal ? `<div style="margin-top:14px;padding:13px 16px;background:linear-gradient(135deg,#fff7ee,#ffe8d4);border:1px solid rgba(251,146,60,.28);border-radius:11px;font-size:13.5px;color:#5c3a1e;line-height:1.7"><b style="color:#ea580c">${lang==='en'?'Team goal':'チームの目的'}:</b> ${_xmlEscape(d.team_goal)}</div>` : ''}
</div>` : ''}

${d.demo_prompts && d.demo_prompts.length ? `<div class="lp-section">
  <h2>${t.demosSectionH}</h2>
  <div class="lp-demos">
    ${d.demo_prompts.map((p,i)=>`<button class="lp-demo-card" onclick="useTryDemo(${i});document.getElementById('tryInput').focus();">
      <div class="num">${i+1}</div>
      <div class="txt">${_xmlEscape(p)}</div>
      <div class="arrow">${t.demosArrow}</div>
    </button>`).join('')}
    <button class="lp-demo-card custom" onclick="document.getElementById('tryInput').focus();">
      <div class="num">+</div>
      <div class="txt">${t.demosCustom}</div>
      <div class="arrow">${t.demosCustomArrow}</div>
    </button>
  </div>
</div>` : ''}

<div class="lp-section" id="try">
  <div class="lp-try-banner">
    <div class="head">
      <div class="em">🎯</div>
      <div>
        <h3>${t.tryBannerH}</h3>
        <p>${t.tryBannerSub}</p>
      </div>
    </div>
    <div class="try-msgs" id="tryMsgs"></div>
    ${d.demo_prompts && d.demo_prompts.length ? `<div style="display:none">${d.demo_prompts.map((p,i)=>`<button class="try-demo" data-demo="${_xmlEscape(p).replace(/"/g,'&quot;')}">${_xmlEscape(p)}</button>`).join('')}</div>` : ''}
    <form class="try-form" onsubmit="sendTry(event)">
      <input type="text" id="tryInput" placeholder="${t.tryBannerPh}" autocomplete="off" maxlength="2000">
      <button type="submit" id="tryBtn">${t.tryBannerSend}</button>
    </form>
    <div class="try-status" id="tryStatus">${t.tryRemainingPre}3${t.tryRemainingPost}</div>
  </div>
</div>

<div class="lp-section">
  <h2>${t.howSectionH}</h2>
  <div class="lp-how">
    <div class="lp-how-step"><div class="n">1</div><h3>${t.how1H}</h3><p>${t.how1P}</p></div>
    <div class="lp-how-step"><div class="n">2</div><h3>${t.how2H}</h3><p>${t.how2P}</p></div>
    <div class="lp-how-step"><div class="n">3</div><h3>${t.how3H}</h3><p>${t.how3P}</p></div>
  </div>
</div>

<div class="lp-section">
  <div class="lp-final-cta">
    <h2>${t.finalH}</h2>
    <p>${t.finalSub}</p>
    <a href="/auth.html?next=/l/${listingId}" class="lp-final-btn">${t.finalBtn}</a>
  </div>
  <div class="lp-share">
    <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(d.title+t.tweetSuffix)}" target="_blank" rel="noopener">𝕏 ${lang==='en'?'Share':'シェア'}</a>
    <a href="https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(pageUrl)}" target="_blank" rel="noopener">💬 LINE</a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}" target="_blank" rel="noopener">📘 Facebook</a>
    <a href="javascript:void(0)" onclick="navigator.clipboard.writeText(location.href);this.textContent='${t.sShareDone}';">${t.sShareCopy}</a>
  </div>
</div>

<div class="lp-foot">
  ${t.footPowered} <a href="/">MY AI AGENT</a> ・ <a href="/lp.html">${t.footAbout}</a><br>
  <span style="margin-top:10px;display:inline-block">
    <a href="/terms.html">${t.footTerms}</a> ・
    <a href="/privacy.html">${t.footPrivacy}</a> ・
    <a href="/legal.html">${t.footLegal}</a>
  </span>
</div>
<script>
var LISTING_ID = ${JSON.stringify(listingId)};
var I18N = ${JSON.stringify({
  remainPre: t.tryRemainingPre,
  remainPost: t.tryRemainingPost,
  signupCTA: t.trySignupCTA,
  thinking: t.tryThinking,
  error: t.tryError,
  netErr: t.tryNetErr,
})};
var TRY_MAX = 3;
var tryMsgs = [];                                     // [{role,content}]
var tryTurns = 0;
function _esc(s){return String(s||'').replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));}
function _scrollMsgs(){var el=document.getElementById('tryMsgs');if(el)el.scrollTop=el.scrollHeight;}
function _appendMsg(role, content, cls){
  var el=document.getElementById('tryMsgs'); if(!el) return;
  var d=document.createElement('div'); d.className='try-bub '+(role==='user'?'u':'a')+(cls?' '+cls:''); d.textContent=content;
  el.appendChild(d); _scrollMsgs();
}
function _setStatus(){
  var el=document.getElementById('tryStatus'); if(!el) return;
  var remaining = TRY_MAX - tryTurns;
  if(remaining > 0) el.textContent = I18N.remainPre + remaining + I18N.remainPost;
  else el.innerHTML = '<a class="try-cta" href="/auth.html?next=/l/'+LISTING_ID+'">'+I18N.signupCTA+'</a>';
}
function useTryDemo(idx){
  var btns = document.querySelectorAll('.try-demo');
  if(btns[idx]){
    var p = btns[idx].getAttribute('data-demo') || btns[idx].textContent.replace(/^▸\\s*/,'');
    var inp=document.getElementById('tryInput');
    if(inp){ inp.value = p; inp.focus(); }
  }
}
async function sendTry(e){
  e && e.preventDefault();
  var inp=document.getElementById('tryInput');
  var btn=document.getElementById('tryBtn');
  if(!inp || !btn) return;
  var text = (inp.value||'').trim();
  if(!text) return;
  if(tryTurns >= TRY_MAX){ _setStatus(); return; }
  inp.value=''; inp.disabled=true; btn.disabled=true;
  _appendMsg('user', text);
  tryMsgs.push({role:'user', content:text});
  // thinking indicator
  var el=document.getElementById('tryMsgs');
  var t=document.createElement('div'); t.className='try-bub a thinking'; t.textContent=I18N.thinking; el.appendChild(t); _scrollMsgs();
  try{
    var r = await fetch('/api/listing/'+LISTING_ID+'/preview', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({messages: tryMsgs.slice(0,-1), message: text}),
    });
    var ct = (r.headers.get('content-type')||'').toLowerCase();
    if(!ct.includes('application/json')){ throw new Error(I18N.netErr); }
    var data = await r.json();
    if(t && t.parentNode) t.parentNode.removeChild(t);
    if(!r.ok){
      _appendMsg('assistant', data.error||I18N.error, 'thinking');
      if(data.preview_exhausted){ tryTurns = TRY_MAX; _setStatus(); }
      return;
    }
    _appendMsg('assistant', data.reply||'(no reply)');
    tryMsgs.push({role:'assistant', content:data.reply||''});
    tryTurns += 1;
    _setStatus();
  }catch(err){
    if(t && t.parentNode) t.parentNode.removeChild(t);
    _appendMsg('assistant', I18N.error + ': ' + err.message, 'thinking');
  } finally {
    inp.disabled=false; btn.disabled=false; inp.focus();
    if(tryTurns >= TRY_MAX){ inp.disabled=true; btn.disabled=true; _setStatus(); }
  }
}
_setStatus();
</script>
</body>
</html>`;
    res.writeHead(200,{
      'Content-Type':'text/html; charset=utf-8',
      'Cache-Control':'public, max-age=120',
    });
    res.end(html);
  }catch(e){
    console.error('[serveListingPage]', e.message);
    res.writeHead(500,{'Content-Type':'text/html; charset=utf-8'});
    res.end('<h1>Server error</h1>');
  }
}

/** Recompute rating_avg + rating_count from reviews[]. Mutates m. */
function recomputeRatings(m){
  const reviews = m.reviews||[];
  if(!reviews.length){
    m.rating_avg = 0;
    m.rating_count = 0;
    return;
  }
  const sum = reviews.reduce((s,r)=>s+(r.rating||0),0);
  m.rating_count = reviews.length;
  m.rating_avg = Math.round((sum/reviews.length)*10)/10;
}
/** Scan all users and return live + public listings.
 *  Skip listings missing price_jpy (legacy data created before pricing existed) —
 *  creator must explicitly set a price (¥0 OK) to appear in the store.
 */
async function listAllPublicListings(){
  const out = [];
  const collect = (users) => {
    for(const u of users||[]){
      for(const ag of (u.agents||[])){
        const m = ag.marketplace;
        if(m && m.is_listed && m.status==='live' && (m.visibility||'public')==='public'
           && Number.isFinite(m.price_jpy)){
          out.push(publicListing(u, ag));
        }
      }
    }
  };
  try{
    if(USE_SUPA){
      const r = await sbReq('GET','users','?select=*&limit=500');
      if(Array.isArray(r.d)) collect(r.d);
    } else {
      collect(LDB.data||[]);
    }
  }catch(e){ console.warn('[market] list failed:', e.message); }
  // Most recent first; 'hot' agents float up regardless
  out.sort((a,b)=>{
    if(a.badge==='hot' && b.badge!=='hot') return -1;
    if(b.badge==='hot' && a.badge!=='hot') return 1;
    return new Date(b.listed_at||0).getTime() - new Date(a.listed_at||0).getTime();
  });
  return out;
}
/** Find {user, agent} by listing_id (cross-user). Uses JSONB containment. */
async function findAgentByListingId(listingId){
  if(!listingId) return null;
  const match = (users) => {
    for(const u of users||[]){
      const ag=(u.agents||[]).find(a=>a.marketplace && a.marketplace.listing_id===listingId);
      if(ag) return {user:u, agent:ag};
    }
    return null;
  };
  try{
    if(USE_SUPA){
      // Targeted query: only the user whose agents array contains this listing_id
      const filter = encodeURIComponent('[{"marketplace":{"listing_id":"'+listingId+'"}}]');
      const r=await sbReq('GET','users','?select=*&agents=cs.'+filter+'&limit=1');
      const hit = Array.isArray(r.d) ? match(r.d) : null;
      if(hit) return hit;
      // Fallback (broad scan) if containment isn't supported / didn't match
      const r2=await sbReq('GET','users','?select=*&limit=2000');
      return Array.isArray(r2.d) ? match(r2.d) : null;
    }
    return match(LDB.data||[]);
  }catch(e){ console.warn('[listing] lookup failed:', e.message); return null; }
}
async function findAgentByShareId(shareId){
  // Returns {user, agent} or null. Uses JSONB containment to find the
  // exact owner without scanning the whole users table.
  if(!shareId) return null;
  try{
    if(USE_SUPA){
      // PostgREST JSONB containment: agents @> '[{"share_id":"..."}]'
      const filter = encodeURIComponent('[{"share_id":"'+shareId+'"}]');
      const r=await sbReq('GET','users','?select=*&agents=cs.'+filter+'&limit=1');
      if(Array.isArray(r.d) && r.d.length){
        const u = r.d[0];
        const ag=(u.agents||[]).find(a=>a.share_id===shareId);
        if(ag) return {user:u, agent:ag};
      }
      // Fallback to broad scan if containment is unsupported on this PostgREST version
      const r2=await sbReq('GET','users','?select=id,name,email,agents&limit=2000');
      if(Array.isArray(r2.d)){
        for(const u of r2.d){
          const ag=(u.agents||[]).find(a=>a.share_id===shareId);
          if(ag) return {user:u, agent:ag};
        }
      }
    } else {
      const u=LDB.find(u=>(u.agents||[]).some(a=>a.share_id===shareId));
      if(u){ const ag=u.agents.find(a=>a.share_id===shareId); if(ag) return {user:u, agent:ag}; }
    }
  }catch(e){
    console.warn('[share] lookup failed:', e.message);
  }
  return null;
}

// ── Chat share (public read-only conversation links) ─────────
// A "chat share" is a frozen snapshot of an agent's chat history at the
// moment the user clicked Share. Lives inside `agent.chat_shares` so it
// rides along with the existing JSONB-stored agents array — no schema
// migration needed.
function genChatShareId(){
  // 128-bit URL-safe token. The URL is the only auth gate, so entropy matters.
  return 'c_' + crypto.randomBytes(16).toString('base64url');
}
async function findChatShareById(shareId){
  if(!shareId) return null;
  try{
    if(USE_SUPA){
      const filter = encodeURIComponent('[{"chat_shares":[{"id":"'+shareId+'"}]}]');
      const r = await sbReq('GET','users','?select=*&agents=cs.'+filter+'&limit=1');
      if(Array.isArray(r.d) && r.d.length){
        for(const ag of (r.d[0].agents||[])){
          const sh = (ag.chat_shares||[]).find(s => s.id===shareId);
          if(sh) return {user:r.d[0], agent:ag, share:sh};
        }
      }
      // Fallback broad scan (containment may not match nested arrays on older PostgREST).
      const r2 = await sbReq('GET','users','?select=id,name,email,agents&limit=2000');
      if(Array.isArray(r2.d)){
        for(const u of r2.d){
          for(const ag of (u.agents||[])){
            const sh = (ag.chat_shares||[]).find(s => s.id===shareId);
            if(sh) return {user:u, agent:ag, share:sh};
          }
        }
      }
    } else {
      for(const u of LDB.all()){
        for(const ag of (u.agents||[])){
          const sh = (ag.chat_shares||[]).find(s => s.id===shareId);
          if(sh) return {user:u, agent:ag, share:sh};
        }
      }
    }
  }catch(e){ console.warn('[chat-share] lookup failed:', e.message); }
  return null;
}

// ── Knowledge base (RAG, lexical) ──────────────────────────────
// Per-agent `agent.knowledge = [{id, name, text, chunks:[string,...], created_at}]`.
// Free, zero-dep retrieval: split each doc into ~1500-char chunks (with overlap),
// score by tokenized term overlap with the query, return the top-K.
const _KB_CHUNK_SIZE = 1500;
const _KB_CHUNK_OVERLAP = 200;
const _KB_STOPWORDS = new Set('the a an of and or but to in on at for with by as is are was were be been being it this that these those i you he she we they me my your our their have has had do does did will would can could should may might must not no な は が の を に も と で て だ で す ま し か です である これ それ あれ どれ こと もの'.split(/\s+/));
function _kbTokenize(s){
  s = String(s||'').toLowerCase();
  // Word-token pass: works for English / European text.
  const wordTokens = s.replace(/[^\p{L}\p{N}_-]+/gu, ' ').split(/\s+/)
    .filter(t => t.length >= 2 && !_KB_STOPWORDS.has(t));
  // CJK bigram pass: Japanese / Chinese / Korean have no spaces, so the
  // word-token pass collapses whole sentences into one giant token. Emit
  // overlapping 2-character bigrams from runs of CJK so retrieval finds
  // sub-string matches ("ナレッジ" in a query matches "ナレッジベース" in the doc).
  const tokens = [...wordTokens];
  const cjkRuns = s.match(/[぀-ヿ㐀-鿿가-힯＀-￯]+/g) || [];
  for(const run of cjkRuns){
    for(let i=0; i<run.length-1; i++){
      tokens.push(run.slice(i, i+2));
    }
  }
  return tokens;
}
function _kbChunkText(text){
  text = String(text||'').replace(/\r\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
  if(!text) return [];
  const chunks=[];
  let i=0;
  while(i < text.length){
    let end = Math.min(i + _KB_CHUNK_SIZE, text.length);
    // Prefer ending on a paragraph or sentence boundary — search BACKWARDS
    // from the desired end so we find the *last* boundary inside the slice
    // (a previous version used String.search() which returns the FIRST
    // match — chunks then never honored a boundary at all).
    if(end < text.length){
      const slice = text.slice(i, end);
      const lastPara = slice.lastIndexOf('\n\n');
      const lastSent = Math.max(
        slice.lastIndexOf('. '),
        slice.lastIndexOf('。'),
        slice.lastIndexOf('! '),
        slice.lastIndexOf('? '),
        slice.lastIndexOf('！'),
        slice.lastIndexOf('？'),
      );
      const minBoundary = _KB_CHUNK_SIZE * 0.5;
      const boundary = lastPara > minBoundary ? lastPara + 2
                     : lastSent > minBoundary ? lastSent + 1
                     : -1;
      if(boundary > 0) end = i + boundary;
    }
    const c = text.slice(i, end).trim();
    // Keep every non-trivial chunk — silently dropping short tails loses
    // important short paragraphs (FAQ answers, headings).
    if(c.length > 0) chunks.push(c);
    if(end >= text.length) break;
    i = Math.max(end - _KB_CHUNK_OVERLAP, end - _KB_CHUNK_SIZE + 1);
  }
  return chunks;
}
function _kbScoreChunk(qTokens, chunkText){
  const cTokens = _kbTokenize(chunkText);
  if(!cTokens.length) return 0;
  const cSet = new Set(cTokens);
  let hits = 0;
  for(const t of qTokens){ if(cSet.has(t)) hits++; }
  // Normalize by chunk length so very long chunks don't always win.
  return hits / Math.sqrt(cTokens.length);
}

// ── Vector RAG (optional, requires OPENAI_API_KEY) ─────────────
// When the key is set, KB chunks are embedded at upload time and stored as
// 1536-dim float arrays. Retrieval then does cosine similarity for vastly
// better semantic recall than CJK bigrams. Without the key, the code path
// silently falls back to the lexical scorer above — zero behavior change
// on existing installs.
function _cosine(a, b){
  if(!a || !b || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for(let i=0;i<a.length;i++){ dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  if(!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
async function _openaiEmbeddings(texts){
  // Batches up to 100 inputs per call (text-embedding-3-small max is 2048,
  // but we cap at 100 to keep payload tiny and stay way under rate limits).
  if(!OPENAI_KEY || !Array.isArray(texts) || texts.length === 0) return null;
  const inputs = texts.map(t => String(t||'').slice(0, 8000));
  return new Promise((resolve)=>{
    const body = JSON.stringify({ model: 'text-embedding-3-small', input: inputs });
    const req = https.request({
      hostname:'api.openai.com', path:'/v1/embeddings', method:'POST',
      headers:{
        'Content-Type':'application/json', 'Authorization':'Bearer '+OPENAI_KEY,
        'Content-Length': Buffer.byteLength(body),
      }
    }, (r)=>{
      let buf=''; r.setEncoding('utf8');
      r.on('data', c => buf += c);
      r.on('end', ()=>{
        try {
          const obj = JSON.parse(buf||'{}');
          if(r.statusCode >= 400 || !Array.isArray(obj.data)){
            console.warn('[openai-embed] HTTP '+r.statusCode+':', (obj.error?.message||'').slice(0,200));
            resolve(null); return;
          }
          resolve(obj.data.map(d => d.embedding));
        } catch(e){ console.warn('[openai-embed] parse:', e.message); resolve(null); }
      });
    });
    req.on('error', e => { console.warn('[openai-embed] err:', e.message); resolve(null); });
    req.setTimeout(20000, ()=> req.destroy(new Error('timeout')));
    req.write(body); req.end();
  });
}
// Sync (lexical / bigram) retrieval. Existing callers (schedules, email,
// webhook entry, chat handler) all use this. Vector retrieval is opt-in via
// the async `_retrieveKbChunksVector` below and used only by the chat
// handler when OPENAI_API_KEY is set + the doc has embeddings.
function _retrieveKbChunks(agent, query, k=3){
  if(!agent || !Array.isArray(agent.knowledge) || !agent.knowledge.length) return [];
  const qTokens = _kbTokenize(query);
  if(!qTokens.length) return [];
  const scored = [];
  for(const doc of agent.knowledge){
    const chunks = Array.isArray(doc.chunks) && doc.chunks.length ? doc.chunks : (doc.text ? _kbChunkText(doc.text) : []);
    for(let i=0;i<chunks.length;i++){
      const s = _kbScoreChunk(qTokens, chunks[i]);
      if(s > 0) scored.push({ score:s, doc_name:doc.name, text:chunks[i] });
    }
  }
  scored.sort((a,b) => b.score - a.score);
  return scored.slice(0, k);
}

// Vector retrieval. Async because it embeds the query via OpenAI before
// scoring. Returns [] if OpenAI key isn't set OR no doc has embeddings —
// the chat handler then falls back to the sync lexical scorer.
async function _retrieveKbChunksVector(agent, query, k=3){
  if(!OPENAI_KEY || !agent || !Array.isArray(agent.knowledge)) return [];
  const hasEmbeddings = agent.knowledge.some(d => Array.isArray(d.embeddings) && d.embeddings.length > 0);
  if(!hasEmbeddings) return [];
  try {
    const qEmb = await _openaiEmbeddings([String(query||'').slice(0, 2000)]);
    if(!qEmb || !qEmb[0]) return [];
    const qv = qEmb[0];
    const scored = [];
    for(const doc of agent.knowledge){
      const chunks = Array.isArray(doc.chunks) ? doc.chunks : [];
      const embs = Array.isArray(doc.embeddings) ? doc.embeddings : [];
      for(let i = 0; i < chunks.length; i++){
        const emb = embs[i];
        if(!Array.isArray(emb)) continue;
        const s = _cosine(qv, emb);
        if(s > 0.20) scored.push({ score: s, doc_name: doc.name, text: chunks[i] });
      }
    }
    scored.sort((a,b) => b.score - a.score);
    return scored.slice(0, k);
  } catch(e){
    console.warn('[kb-vector] retrieval failed:', e.message);
    return [];
  }
}
function genKbDocId(){ return 'kb_'+Math.random().toString(36).slice(2,9); }

// ── Scheduled agent runs ────────────────────────────────────
// Per-agent `agent.schedules = [{id, prompt, kind, hour, minute, tz_offset_min,
// deliver, enabled, label, last_run, next_run}]`. A 60s tick walks every user
// and fires any schedule whose next_run is in the past.
function genScheduleId(){ return 'sch_'+Math.random().toString(36).slice(2,9); }
function genWebhookToken(){
  // 36-char URL-safe token. Long enough to resist guessing without a DB.
  return 'wh_' + crypto.randomBytes(24).toString('base64url');
}
async function findAgentByWebhookToken(tok){
  if(!tok) return null;
  try{
    if(USE_SUPA){
      const filter = encodeURIComponent('[{"webhook_token":"'+tok+'"}]');
      const r = await sbReq('GET','users','?select=*&agents=cs.'+filter+'&limit=1');
      if(Array.isArray(r.d) && r.d.length){
        const u=r.d[0];
        const ag=(u.agents||[]).find(a => a.webhook_token===tok);
        if(ag) return { user:u, agent:ag };
      }
      const r2 = await sbReq('GET','users','?select=id,email,name,agents,balance_jpy,plan,memories&limit=2000');
      if(Array.isArray(r2.d)){
        for(const u of r2.d){
          const ag=(u.agents||[]).find(a => a.webhook_token===tok);
          if(ag) return { user:u, agent:ag };
        }
      }
    } else {
      const u = LDB.find(u => (u.agents||[]).some(a => a.webhook_token===tok));
      if(u){ const ag=u.agents.find(a => a.webhook_token===tok); if(ag) return { user:u, agent:ag }; }
    }
  }catch(e){ console.warn('[webhook] lookup failed:', e.message); }
  return null;
}
function _scheduleNextRun(s, fromMs){
  // All math in UTC. tz_offset_min is the user's UTC offset (e.g. +540 for JST).
  // The user wants "9am in their local time" so we compute that as
  // (UTC_hour - tz_offset/60) modulo 24.
  const now = fromMs ? new Date(fromMs) : new Date();
  const tz = Number(s.tz_offset_min || 0);
  if(s.kind === 'hourly'){
    // Fire every hour at the configured minute.
    const next = new Date(now);
    next.setUTCSeconds(0,0);
    const minute = Math.max(0, Math.min(59, Number(s.minute||0)));
    next.setUTCMinutes(minute);
    if(next.getTime() <= now.getTime()){
      next.setTime(next.getTime() + 60*60*1000);
    }
    return next.toISOString();
  }
  if(s.kind === 'daily'){
    // Target HH:MM in the user's local timezone — that's
    // (HH - tz/60) mod 24 in UTC, with day rollover.
    const hourLocal = Math.max(0, Math.min(23, Number(s.hour||9)));
    const minuteLocal = Math.max(0, Math.min(59, Number(s.minute||0)));
    // Compute today's target (UTC). Convert "local HH:MM" → UTC.
    const utc = new Date(Date.UTC(
      now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
      hourLocal, minuteLocal, 0, 0
    ));
    utc.setTime(utc.getTime() - tz * 60 * 1000);
    if(utc.getTime() <= now.getTime()){
      utc.setTime(utc.getTime() + 24*60*60*1000);
    }
    return utc.toISOString();
  }
  // Default: 1 hour from now.
  return new Date(now.getTime() + 60*60*1000).toISOString();
}
async function _runOneSchedule(user, agent, sched){
  // Execute the schedule's prompt as if the user sent it. No tools (keeps the
  // scheduled run fast & cheap). Reply is appended to agent.history and, if
  // deliver='email', emailed to the user.
  try {
    const sys = buildSystem(agent, {
      memories: (user.memories || []),
      kbHits: _retrieveKbChunks(agent, sched.prompt || '', 3),
    });
    const msgs = [...(agent.history||[]), { role:'user', content: String(sched.prompt||'') }];
    const r = await callAI(msgs, sys, agent.model);
    const reply = (r && r.content && r.content[0] && r.content[0].text) || '';
    const cost = (r && r.usage)
      ? calcCost(r.usage.input_tokens||0, r.usage.output_tokens||0)
      : { jpy:0, usd:0, inputTok:0, outputTok:0 };
    // Neutral HH:MM (24h) — no locale tied. Renderer treats this as display-only.
    const ts = new Date().toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit',hour12:false});
    agent.history = [
      ...(agent.history||[]),
      { role:'user', content: sched.prompt, time: ts, scheduled:true, schedule_id:sched.id },
      { role:'assistant', content: reply, time: ts, cost_jpy: cost.jpy, scheduled:true },
    ];
    if(agent.history.length > 200) agent.history = agent.history.slice(-200);
    user.balance_jpy = Math.round(((user.balance_jpy||0) - cost.jpy) * 1000) / 1000;
    if(sched.deliver === 'email' && user.email){
      // Match recipient language: if their email contains a Japanese name or
      // their user.name has CJK characters, send in Japanese. Otherwise English.
      const isJa = /[ぁ-んァ-ヶー一-龠]/.test((user.name||'') + (user.email||''));
      const subj = isJa
        ? `🤖 ${sched.label || agent.name || 'AI'} — 定期実行レポート`
        : `🤖 ${sched.label || agent.name || 'AI'} — scheduled report`;
      const tagline   = isJa ? '定期タスクからの自動実行' : 'Triggered by your scheduled task';
      const promptLbl = isJa ? 'プロンプト:'           : 'Prompt:';
      const noLabel   = isJa ? '(ラベルなし)'           : '(no label)';
      try {
        await sendEmail(
          user.email, subj,
          '<div style="font-family:system-ui;max-width:600px;margin:0 auto;padding:20px">'+
          '<h2 style="margin:0 0 8px">'+_xmlEscape(agent.name||'AI')+'</h2>'+
          '<div style="color:#52525b;font-size:13px;margin-bottom:14px">'+tagline+': <i>'+_xmlEscape(sched.label||noLabel)+'</i></div>'+
          '<div style="font-size:11px;color:#a1a1aa;margin-bottom:6px"><b>'+promptLbl+'</b> '+_xmlEscape(sched.prompt||'')+'</div>'+
          '<div style="background:#fff7ed;border:1px solid #f5e1cd;padding:14px;border-radius:10px;white-space:pre-wrap;font-size:14px;line-height:1.55">'+_xmlEscape(reply)+'</div>'+
          '<div style="margin-top:18px;text-align:center;color:#a1a1aa;font-size:11px">— MY AI AGENT</div>'+
          '</div>'
        );
      } catch(e){ console.warn('[schedule] email failed:', e.message); }
    }
    sched.last_run = new Date().toISOString();
    sched.next_run = _scheduleNextRun(sched);
    sched.last_error = null;
  } catch(e){
    sched.last_error = (e && e.message || String(e)).slice(0, 200);
    console.warn('[schedule] run failed:', sched.id, sched.last_error);
    // Push next_run forward 1h so we don't spin on persistent failures.
    sched.next_run = new Date(Date.now() + 60*60*1000).toISOString();
  }
}
let _scheduleTimer = null;
function _startAgentScheduler(){
  if(_scheduleTimer) return;
  _scheduleTimer = setInterval(async () => {
    try {
      const users = USE_SUPA
        ? (await sbReq('GET','users','?select=id,email,name,memories,agents,balance_jpy,plan&limit=2000')).d || []
        : LDB.all();
      const nowMs = Date.now();
      for(const u of users){
        let changed = false;
        for(const ag of (u.agents||[])){
          for(const s of (ag.schedules||[])){
            if(!s.enabled) continue;
            if(!s.next_run){ s.next_run = _scheduleNextRun(s); changed = true; continue; }
            if(new Date(s.next_run).getTime() > nowMs) continue;
            await _runOneSchedule(u, ag, s);
            changed = true;
          }
        }
        if(changed){
          try { await DB.save(u); }
          catch(e){ console.warn('[schedule] save failed:', e.message); }
        }
      }
    } catch(e){
      console.warn('[schedule] tick failed:', e.message);
    }
  }, 60 * 1000);
  console.log('[schedule] agent scheduler started (60s tick)');
}

function buildSystem(agent, opts){
  const sheetsActive = !!(opts && opts.sheetsActive);
  const extensionActive = !!(opts && opts.extensionActive);
  const isGroup = !!(opts && opts.isGroup);
  const speakerName = (opts && opts.speakerName) || '';
  const memories = (opts && Array.isArray(opts.memories)) ? opts.memories : [];
  // Knowledge-base retrieval hits, already pre-selected by `_retrieveKbChunks`.
  // Each hit: { doc_name, text }. Injected before the persona so the AI treats
  // them as authoritative context.
  const kbHits = (opts && Array.isArray(opts.kbHits)) ? opts.kbHits : [];
  const kbNote = kbHits.length ? `

【参考資料 (ナレッジベース) — ユーザーが事前にこの AI へ登録した文書からの抜粋】
${kbHits.map((h,i) => `[${i+1}] ${h.doc_name || 'doc'}\n${(h.text||'').slice(0, 800)}`).join('\n\n---\n\n')}

これらは ユーザーが信頼できる情報源 として登録した内容です。回答する際はこの資料の内容を優先して使い、引用元 (例: 「[1] 〜より」) を明記してください。資料に書かれていないことは、その旨を正直に伝えてください。` : '';
  // Team context — injected into a team member's prompt so they know they're
  // part of a larger team working toward a shared goal.
  const teamName = (opts && opts.teamName) || '';
  const teamGoal = (opts && opts.teamGoal) || '';
  const teamMembers = (opts && Array.isArray(opts.teamMembers)) ? opts.teamMembers : [];
  const teamNote = (teamName || teamGoal) ? `

【あなたが所属するチーム】
- チーム名: ${teamName || '(無題)'}
${teamGoal ? `- チームの目的: ${teamGoal}\n` : ''}${teamMembers.length ? `- 他のメンバー: ${teamMembers.map(m => '@'+(m.name||'').replace(/\s+/g,'')+'('+(m.name||'')+')').join(' / ')}\n` : ''}この目的を踏まえてあなたの専門性で貢献し、必要なら他メンバーへの引き継ぎ案 (例: 「次は @SocialManager に投稿文の生成を依頼しましょう」) を 1 行添えてください。` : '';
  const memoriesNote = memories.length ? `

【ユーザーが覚えておいてほしいこと (long-term memories)】
${memories.slice(-20).map(m => '- ' + (m.text||'')).join('\n')}
これらの情報を踏まえて、ユーザーの状況・好みに合わせた応答をしてください。` : '';
  const groupNote = isGroup ? `

【グループ会話モード】
これは複数人 + あなた (AI) が参加するグループチャットです。
- 各ユーザーメッセージの先頭は「[名前] ...」の形式。誰の発言か必ず確認してください。
- 直前の発言者: ${speakerName || '不明'}
- メンションされた特定の人物 (例: マサルさん、佐藤さん) には名前で呼びかけて応答してください。
- 一般的な会話 (@AI を含む発言) は、参加者全員に有益な内容を心がけてください。
- 個人を特定するメンションがない場合は、最後の発言者に向けて答えてください。` : '';
  const extensionNote = extensionActive
    ? `

【ツール: ブラウザ拡張連携 — ユーザーの実ブラウザ自動操作】
ユーザーは MY AI Agent ブラウザ拡張をインストール済みで、あなたは **ユーザー本人のChrome** を直接操作できます。X / Slack / Gmail / LinkedIn / Notion / 社内SaaS など **ログイン済みのサイトはそのまま操作可能** です。

利用可能なツール:
- ext_open_url(url, in_active_tab?): タブを開く・遷移
- ext_read_page(): 現在のページのテキスト + 操作可能要素一覧 (操作前に必ず呼ぶ)
- ext_click(target): CSS セレクタ or 表示テキストで要素クリック
- ext_type(selector, text): 入力欄に文字列を入力 (React/Vue 対応)
- ext_press_key(key, selector?): Enter / Tab / Escape 等
- ext_screenshot(): 現在表示中のタブのスクショ (確認用)
- ext_wait(ms): 待機 (1〜10000ms)
- ext_list_tabs(): 開いてるタブ一覧

【絶対ルール】
1. ページ操作前に必ず ext_read_page で **現在のページの構造を取得** してください。決め打ちセレクタは時々失敗します
2. ext_type の selector は CSS よりも **placeholder や aria-label** での指定が長持ちします (例: "ツイートを投稿" "メッセージを入力")
3. ext_click の target は **CSS or 表示テキスト**。表示テキストの方がメンテ不要で安全
4. 投稿・送信・削除など **不可逆な操作の前は、ext_read_page で内容を確認** してからユーザーに「この内容で実行しますか?」と確認してください
5. 失敗したら ext_screenshot で実際の画面を見て判断
6. 1ステップずつ実行 → 結果確認 → 次のステップ。乱発しない

【標準フロー (例: X 投稿)】
1. ext_open_url("https://x.com/compose/post")
2. ext_wait(1500) — ページ表示待ち
3. ext_read_page() — 構造取得・ログイン状態確認
4. ext_type(selector="ツイートを投稿", text="...")
5. ext_click(target="投稿") もしくは ユーザー確認
6. ext_screenshot() で結果確認 → ユーザーに報告`
    : '';
  const sheetsNote = sheetsActive
    ? `

【ツール: Google スプレッドシート連携 — 認証済み API 直結】
このエージェントは **ユーザー本人の Google アカウントに接続されており、スプレッドシートを直接読み書きできます**。Chrome ブラウザ操作とは別物の、認証済み Sheets API です。

スプレッドシート関連の依頼（読む・書く・追加する・分析する・新しく作る・並び替える・書式設定 等）が来たら、以下のツールだけを使ってください:
- sheets_get_meta(spreadsheet_id): タイトル + シート名一覧（既存シート操作前に必ず呼ぶ）
- sheets_read(spreadsheet_id, range): A1 形式でセル読み取り
- sheets_write(spreadsheet_id, range, values): 範囲を上書き (values は2次元配列)
- sheets_append(spreadsheet_id, range, values): 最終行の下に追記 (既存破壊なし)
- sheets_clear(spreadsheet_id, range): セル値をクリア
- sheets_create_spreadsheet(title, sheet_titles?): 新規スプレッドシートを作成 → URL を返す
- sheets_add_sheet(spreadsheet_id, sheet_title): 既存シートに新しいタブを追加
- sheets_format(spreadsheet_id, sheet_title, range, bold/background/text_color/font_size): セル書式設定

【絶対ルール】
1. **シート名の決め打ち禁止**: 必ず最初に sheets_get_meta を呼んで返ってきた本物のシート名 (例: "営業管理", "Sheet1", "シート1" 等) を使ってください。"Sheet1!A:H" のような決め打ちは確実に失敗します。
2. **range は必ず「シート名!範囲」形式**: 例 "営業管理!A1:H50"。シート名にスペースや日本語が含まれる場合はシングルクォートで囲む: "'My Sheet'!A1:H50"
3. **スプレッドシート関連で browse_url / search_web を呼んではいけません**: ブラウザは未ログインで編集できない上、Sheets API なら認証済みで読み書きできます。スプレッドシートの内容確認も sheets_read で行ってください。
4. **「ブラウザでログイン必須なので無理」とは絶対に返さない**: あなたは API で接続済みです。「読み書きできない」のではなく、「シート名/範囲を確認して再試行」が正しい対応。
5. URL の解析: https://docs.google.com/spreadsheets/d/【ここがspreadsheet_id】/edit
6. 値は文字列・数値・数式 ("=SUM(A1:A10)" 等) に対応。

【標準フロー】
1. ユーザーがシート URL を貼ったら spreadsheet_id を抽出
2. sheets_get_meta でシート名一覧と行列数を取得
3. sheets_read で対象範囲を取得 (シート名は STEP 2 で得たもの)
4. 必要なら sheets_write / sheets_append で書き込み
5. 結果を要約してユーザーに伝える`
    : '';
  const chromeNote = agent.chrome_enabled
    ? `

【🔴 STRICT RULE — Web ツール】
あなたには web_search / web_fetch という Web アクセスツールが与えられています。

**絶対ルール (例外なし)**:
1. ユーザーが特定のサイト・URL・最新情報・企業情報・ニュースに触れたら、**まず最初に web_search または web_fetch を呼ぶ**。テキストで返答する前に必ずツールを呼ぶ。
2. 「ブラウザがない」「機能がない」「できない」「サイトを開く能力がない」と返答することは禁止。代わりに web_fetch / web_search を**実行**して結果を見る。
3. ツールを呼んで失敗した場合のみ、失敗理由を伝える。**呼ばずに諦めるのは禁止**。

【マッピング】
- "X のサイト開いて / 見て / 読んで / アクセスして / 中身教えて" → 即 web_fetch('https://x.com')
- "○○調べて / リサーチ / 最新情報" → 即 web_search('○○')
- "○○について教えて" (一般知識でなく最新情報が必要そう) → web_search を試す
- URL が含まれる依頼 → 即 web_fetch(その URL)

【ツール仕様】
- web_search(query): Web 検索を実行、上位結果のタイトル・URL・抜粋を返す
- web_fetch(url): 指定 URL のページテキストを取得 (公開ページ・http/https URL)

【ログイン壁の扱い】
公開トップページや記事ページは web_fetch で取得できます。X (Twitter) のホーム /explore は試して OK。個別タイムラインなどログイン必須ページは取得できないので、その時点で初めて伝えてください ("試したけどログイン壁でした")。

【🔖 引用ルール — 必須】
web_search / web_fetch を 1 度でも呼んだら、最終応答内の事実主張に番号付き引用を付ける:
- フォーマット: 文末 / 句末に \`[1]\` \`[2]\` を半角ブラケットで挿入
- 番号は ツール呼び出しの順 (1 つ目の検索結果 = [1], 2 つ目 = [2], ...)
- 客観事実ごとに引用。意見・推測には付けない
- UI 側で [1] [2] が自動的にクリック可能なリンクに変換され、文末に出典カードが並ぶ — 別途「出典一覧」セクションを書く必要は無い
例: "東京の人口は約 1,400 万人 [1]。直近 5 年で 2.3% 増加した [2]。"

【書き込み制約】
あなたが今持っているのは **読み取り専用** (web_search / web_fetch) のツールだけです。
投稿・送信・クリック・自動操作などの write アクションには、**ブラウザ拡張連携 (Browser Extension)** が別途必要です。

ユーザーが「X で投稿して」「Slack で送って」「Gmail 開いて返信」など書き込み系の依頼をしてきたら:
1. まず「投稿/送信は **読み取りツールでは出来ない** ので、ブラウザ拡張連携を有効化する必要があります」と短く伝える
2. 続けて **下記の有効化手順をそのまま提示**（ユーザーが迷わないよう）:
   - 画面右上の <b>⚙ 設定</b> → 「<b>🌐 ブラウザ拡張連携</b>」セクションへ
   - 「<b>＋ ブラウザ拡張をペアリング</b>」をクリック (未インストールなら案内ページが開く)
   - ペアリング完了後、エージェントの編集 (⚙) で「<b>🌐 ブラウザ拡張連携</b>」を ON
3. 提案で終わるのではなく、「**今この場で出来る代替案**」を 1 つ提示する:
   - 投稿文だけ書いてあげる (ユーザーが手動で貼り付け)
   - 投稿文 + 推奨ハッシュタグ + 最適投稿時刻のセット
   - "@拡張機能あり" のメンバー (Team の場合) を呼び出すよう促す

「できません」だけで終わらせるのは禁止。投稿文・案内・代替案 をワンメッセージで完結させてください。

${sheetsActive ? '（注: Google スプレッドシートは sheets_read/write を使用、web_fetch ではなく）' : ''}

【引用】取得結果を返す時は出典 URL を明記 (例: 「〜とのことです (出典: example.com)」)。

実行例:
ユーザー: "X のサイト開いて"
正しい動作: web_fetch('https://x.com') を呼ぶ → 結果を要約して返す (ログイン壁ならその旨も伝える)
誤り: 「ブラウザを操作できません」とテキストだけで返す`
    : '';
  // ── Stall-detection nudge ──
  // If the recent assistant turns are stuck in a "作ります → 完成したら送ります" loop
  // without firing any actual tool, the model has tuned itself into chatty mode
  // and prompt-only instructions get drowned out by the chat history. Append
  // an aggressive turn-level reminder so the next response is forced into tool
  // use. Only fires when the pattern is clearly active.
  const recentHistory = Array.isArray(opts && opts.recentHistory) ? opts.recentHistory : [];
  const stallRe = /(作ります|完成したら|少々お待ち|今から作|今から制作|now creating|i['']?ll (create|make|build|send|generate)|i am creating|i am making|i am building|completed soon|coming up soon)/i;
  const lastAssistantTurns = recentHistory.filter(m => m.role==='assistant').slice(-3);
  const stallCount = lastAssistantTurns.filter(m =>
    typeof m.content==='string' && stallRe.test(m.content) && !(Array.isArray(m.tool_log) && m.tool_log.length)
  ).length;
  const stallNudge = stallCount >= 1 ? `

🚨 緊急: 直前の ${stallCount} 回、あなたは「作ります」「完成したら送ります」と返答したのに、実際にはツールを 1 度も呼んでいません。
このまま同じ返答を続けるのは禁止。今このターンで以下のいずれかを必ず実行してください:
  1) ユーザーが LP / モック / デザイン / ダッシュボード / 計算機 を要求している → \`create_artifact\` を呼ぶ (HTML 1 ファイル丸ごと)
  2) 画像なら \`generate_image\`、動画なら \`generate_video\`
  3) 「ユーザーの要件を確認させてください」と聞き直す (具体的に何を作るか不明な場合のみ)
3) を選ぶ場合も、"作ります" などの空約束は絶対に禁止。質問を 1 つ投げるだけ。` : '';

  const deliveryRules = `

【最重要：成果物の即時納品ルール — このルールは persona より優先】
ユーザーが「作って / 作成して / 出して / 用意して / 送って / 完成させて / 見せて / make / create / build / send / generate / show me」のように依頼してきたら、**そのターン内に必ずツールを呼んで成果物を出す**こと。以下を厳禁:
- ❌「作ります！」「今から作ります！」「完成したら連絡します！」「少々お待ちください」「今この瞬間に作成・送信します」だけ返してツールを呼ばない
- ❌「完成しました！」と言いつつ実際の成果物 (URL / 画像 / ファイル) を出さない
- ❌「完成までしばらくかかります」と先送り
- ❌ 同じ「作ります」を繰り返すループ (あなたはこのループに陥りやすい — 常に警戒)

ツール呼び出し = "今すぐここで実行"。"後で送る" という概念は存在しない — このターンを終えたら、あなたは次のユーザー発話まで完全に停止する。「完成したら送ります」「今から制作します」は技術的に不可能な嘘になる。

正しい挙動:
- ✅ LP / モック / デザイン / ダッシュボード / 計算機 / インタラクティブ図表 → \`create_artifact\` を今このメッセージで呼ぶ (HTML 1 ファイル)
- ✅ 画像 → \`generate_image\` (\`style:'logo'\` で文字入り / \`'photo'\` で写真 / \`'illustration'\` でイラスト) / 動画 → \`generate_video\` / 音声 → \`generate_audio\`
- ✅ 既存画像の編集 (背景差し替え / 要素追加・削除 / スタイル変更) → \`edit_image\` (直前 generate_image の URL を渡す)
- ✅ PDF → \`generate_pdf\` / グラフ → \`generate_chart\` / 図 → \`generate_diagram\` / QR → \`generate_qr\`
- ✅ メール → \`send_email\` / Slack → \`notify_slack\` / Discord → \`notify_discord\`
- ✅ 予定 → \`create_calendar_event\`
- ✅ Web 調査 → \`web_search\` / \`web_fetch\` / \`web_screenshot\` / \`web_read_markdown\`
- ✅ 要件が曖昧なら 「○○ですか? △△ですか?」と 1 問だけ聞く (空約束はしない)
- ✅ できない要件なら「○○の理由でできません。代わりに△△ならできます」と即答 (先送りしない)`;

  // Per-agent context: open tasks + KPIs + relevant memories + playbook hits.
  // Pulled live from the agent record so chats feel like they remember
  // what's going on. `userQuery` is the latest user message; the injector
  // scores memories / playbook against it for relevance.
  const agentCtx = _injectAgentContext(agent, { userQuery: (opts && opts.userQuery) || '' });

  // Inline-CTA nudge: when an action requires an external service that
  // hasn't been connected, the AI can emit `<connect:service_id>` once at
  // the end of its reply. The frontend strips the marker and renders a
  // "[🔌 X を接続]" button inline. Service IDs match the catalog
  // (github, slack, wordpress, stripe, shopify, twitter, gmail, notion …).
  const integrationsHint = `

【外部サービス連携 — inline 提案】
ユーザーの依頼を実行するには未接続の外部サービス (GitHub / Slack / WordPress / Stripe / X / Notion / Shopify / Gmail / Google Calendar / Linear など) との連携が必要だと気付いた場合は、回答末尾に 1 度だけ次の形式で **接続マーカー** を出してください:
- 例: \`<connect:github>\` ・ \`<connect:wordpress>\` ・ \`<connect:stripe>\`
このマーカーは UI 側で「🔌 X を接続」ボタンに自動置換されます。マーカーは 1 メッセージにつき最大 2 個まで、不要な時は出さないこと。`;
  return`${deliveryRules}
${stallNudge}${integrationsHint}

──────────────────────────────

あなたは「${agent.name}」というAIエージェントです。
得意スキル：${(agent.skills||[]).map(s=>SKILL_MAP[s]||s).join(' / ')}
${agent.persona?`性格・指示：${agent.persona}`:''}${teamNote}${extensionNote}${sheetsNote}${chromeNote}${groupNote}${memoriesNote}${kbNote}${agentCtx}
ユーザーの専属スタッフとして、プロフェッショナルかつ親しみやすく対応してください。返答は実用的で簡潔にし、必要に応じてMarkdownを使ってください。`;
}

// ══════════════════════════════════════════════════════════════
// API ROUTER
// ══════════════════════════════════════════════════════════════
async function handleAPI(req,res,pathname,method,ip){
  // ── GET /api/health (PUBLIC, unrate-limited) ───────────────
  // Used by keep-alive ping and uptime monitors. Must come before rateLimit.
  if(pathname==='/api/health'&&method==='GET'){
    return jres(res,200,{ok:true,ts:Date.now()});
  }

  // ── GET /api/admin/media-status (admin diagnostic) ─────────
  // Reports whether each piece of the media-generation pipeline can boot.
  // The chat says "ビデオ生成がエラーになりました" without telling you why;
  // hit this endpoint to see the actual root cause (binary missing,
  // disk perms, etc.) without combing through Render logs.
  if(pathname==='/api/admin/media-status'&&method==='GET'){
    const u = getAuth(req);
    let isAdmin = false;
    if(u){
      const me = await DB.findBy('id', u.userId);
      isAdmin = !!(me && me.is_admin);
    }
    if(!isAdmin) return jres(res,403,{error:'admin required'});
    const status = {
      playwright_module: 'unknown',
      chromium_binary:   'unknown',
      ffmpeg_module:     'unknown',
      ffmpeg_binary:     'unknown',
      qrcode_module:     'unknown',
      generated_dir:     'unknown',
      render_test:       'not_run',
    };
    try {
      const { chromium } = require('playwright');
      status.playwright_module = 'ok';
      try {
        const exec = chromium.executablePath();
        status.chromium_binary = fs.existsSync(exec) ? ('ok: ' + exec) : ('MISSING: ' + exec);
      } catch(e){ status.chromium_binary = 'check failed: ' + e.message; }
    } catch(e){ status.playwright_module = 'missing: ' + e.message; }
    try {
      const ffmpegPath = require('ffmpeg-static');
      status.ffmpeg_module = 'ok';
      status.ffmpeg_binary = (ffmpegPath && fs.existsSync(ffmpegPath)) ? ('ok: ' + ffmpegPath) : ('MISSING: ' + ffmpegPath);
    } catch(e){ status.ffmpeg_module = 'missing: ' + e.message; }
    try { require('qrcode'); status.qrcode_module = 'ok'; }
    catch(e){ status.qrcode_module = 'missing: ' + e.message; }
    try {
      const st = fs.statSync(GENERATED_DIR);
      status.generated_dir = st.isDirectory() ? ('ok: ' + GENERATED_DIR) : 'not a directory';
    } catch(e){ status.generated_dir = 'missing: ' + e.message; }
    // Optional: actually try a 1-second Chromium launch + close so we can detect
    // launch-time errors (sandbox missing, OOM, libs missing on host).
    if(req.url.includes('test=1')){
      try {
        const { chromium } = require('playwright');
        const browser = await chromium.launch({ args: _CHROMIUM_LAUNCH_ARGS });
        const ctx = await browser.newContext();
        await ctx.newPage();
        await ctx.close();
        await browser.close();
        status.render_test = 'ok';
      } catch(e){ status.render_test = 'launch_failed: ' + e.message; }
    }
    return jres(res,200,status);
  }

  // ── GET /api/founder/status (PUBLIC) ───────────────────────
  // Drives the LP "X / 100 founder seats left" counter. Polled every
  // ~8s by the LP, so kept fast (single COUNT) and unrate-limited.
  if(pathname==='/api/founder/status'&&method==='GET'){
    try {
      const taken = await DB.countFounders();
      return jres(res,200,{
        taken,
        total: FOUNDER_LIMIT,
        remaining: Math.max(0, FOUNDER_LIMIT - taken),
        sold_out: taken >= FOUNDER_LIMIT,
      });
    } catch(e){
      return jres(res,200,{ taken:0, total:FOUNDER_LIMIT, remaining:FOUNDER_LIMIT, sold_out:false });
    }
  }

  if(!rateLimit(ip,150,60000))return jres(res,429,{error:'リクエストが多すぎます。しばらく待ってから試してください。'});


  // ── DEBUG: check env ──
  if(pathname==='/api/debug-env'&&method==='GET'){
    return jres(res,200,{
      anthropic_key_prefix: ANTHROPIC ? ANTHROPIC.substring(0,15) : 'EMPTY',
      anthropic_key_len: ANTHROPIC ? ANTHROPIC.length : 0,
    });
  }

  // ── POST /api/auth/signup ──────────────────────────────────
  if(pathname==='/api/auth/signup'&&method==='POST'){
    const body = await readBody(req);
    const {name, email, password} = body;
    const refCode = (body.ref || '').toString().trim().toUpperCase();
    if(!name?.trim()||!email?.trim()||!password)return jres(res,400,{error:'すべての項目を入力してください'});
    if(password.length<8)return jres(res,400,{error:'パスワードは8文字以上にしてください'});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return jres(res,400,{error:'メールアドレスの形式が正しくありません'});
    if(await DB.findBy('email',email.toLowerCase()))return jres(res,409,{error:'このメールアドレスはすでに登録されています'});
    const verify_token=crypto.randomBytes(32).toString('hex');
    const user=newUser({name:name.trim(),email:email.toLowerCase(),password:PW.hash(password),verified:!RESEND_KEY,verify_token});

    // Referral: bonus both sides
    let referrer = null;
    const REFERRAL_BONUS_JPY = 500;
    if(refCode){
      try {
        referrer = await findUserByReferralCode(refCode);
        if(referrer && referrer.id !== user.id){
          user.referred_by = referrer.id;
          user.balance_jpy = (user.balance_jpy||0) + REFERRAL_BONUS_JPY;
        }
      } catch(e){ console.warn('[signup] referral lookup failed:', e.message); }
    }

    // ── Founder 100: first 100 sign-ups get BUSINESS for 30 days + perks
    try {
      const taken = await DB.countFounders();
      if(taken < FOUNDER_LIMIT){
        user.is_founder = true;
        user.founder_seat_no = taken + 1;
        user.founder_granted_at = new Date().toISOString();
        // 1 month of BUSINESS, then auto-downgrades on next /api/me touch
        user.plan = 'business';
        user.business_trial_until = new Date(Date.now() + 30*24*3600*1000).toISOString();
      }
    } catch(e){ console.warn('[signup] founder allocation failed:', e.message); }

    // ── Marketing attribution: stamp the X-utm campaign that brought them in
    try {
      const camp = marketing.attributionFromSignupReq(req, body);
      if(camp) user.marketing_attribution = camp;
    } catch(e){ /* noop — attribution is best-effort */ }

    try {
      await DB.create(user);
    } catch(e) {
      console.error('[signup] DB.create failed:', e.message);
      return jres(res,500,{error:'アカウント作成に失敗しました。少し時間をおいて再試行してください。', detail: e.message});
    }

    // Credit the referrer (after our user is committed)
    if(referrer && user.referred_by){
      try {
        const fresh = await DB.findBy('id', referrer.id);
        if(fresh){
          fresh.balance_jpy = (fresh.balance_jpy||0) + REFERRAL_BONUS_JPY;
          fresh.referral_stats = fresh.referral_stats || { count:0, last_at:null, total_credit_jpy:0 };
          fresh.referral_stats.count = (fresh.referral_stats.count||0) + 1;
          fresh.referral_stats.last_at = new Date().toISOString();
          fresh.referral_stats.total_credit_jpy = (fresh.referral_stats.total_credit_jpy||0) + REFERRAL_BONUS_JPY;
          fresh.billing_history = fresh.billing_history || [];
          fresh.billing_history.push({
            date:new Date().toISOString(),
            type:'referral_bonus',
            referred_user_id:user.id,
            referred_name:user.name,
            amount_jpy:REFERRAL_BONUS_JPY,
          });
          await DB.save(fresh);
        }
      } catch(e){ console.warn('[signup] referrer credit failed:', e.message); }
    }

    if(RESEND_KEY)await sendVerifyEmail(user);
    recordLogin(user, req, 'signup');
    try{ await DB.save(user); }catch(e){}
    const token=JWT.sign({userId:user.id,email:user.email});
    return jres(res,201,{token,user:safe(user),needsVerify:!!RESEND_KEY});
  }

  // ── POST /api/auth/login ───────────────────────────────────
  if(pathname==='/api/auth/login'&&method==='POST'){
    const{email,password}=await readBody(req);
    if(!email||!password)return jres(res,400,{error:'入力してください'});
    // demo account
    if(email==='test@test.com'&&password==='password'){
      let demo=await DB.findBy('email','test@test.com');
      if(!demo){demo=newUser({name:'デモユーザー',email:'test@test.com',password:PW.hash('password'),verified:true});await DB.create(demo);}
      return jres(res,200,{token:JWT.sign({userId:demo.id,email:demo.email}),user:safe(demo)});
    }
    const user=await DB.findBy('email',email.toLowerCase());
    if(!user||!PW.check(password,user.password))return jres(res,401,{error:'メールアドレスまたはパスワードが違います'});
    recordLogin(user, req, 'login');
    try{ await DB.save(user); }catch(e){}
    return jres(res,200,{token:JWT.sign({userId:user.id,email:user.email}),user:safe(user)});
  }

  // ── GET /api/auth/google ───────────────────────────────────
  if(pathname==='/api/auth/google'&&method==='GET'){
    if(!GOOGLE_ID || !GOOGLE_SEC){
      // Redirect back to auth page with a friendly error rather than raw JSON
      res.writeHead(302,{Location:'/auth.html?error=google_failed&reason=not_configured'});
      res.end(); return;
    }
    res.writeHead(302,{Location:googleAuthURL()});res.end();return;
  }

  // ── GET /api/setup/sheets-status (PUBLIC, dev-onboarding) ─
  // Reports whether Google OAuth env vars are set and whether the google_oauth
  // column exists in Supabase. Used by /setup-google-sheets.html.
  if(pathname==='/api/setup/sheets-status' && method==='GET'){
    let dbMigrated = false;
    if(USE_SUPA){
      try{
        // PostgREST returns 400 with "column does not exist" if the column is missing.
        const probe = await sbReq('GET','users','?select=google_oauth&limit=1');
        // 200 (with data) OR 200 with empty array == column exists. 400 == missing.
        dbMigrated = probe.s === 200;
      }catch(e){ dbMigrated = false; }
    } else {
      dbMigrated = true; // local JSON DB always has the field
    }
    return jres(res,200,{
      google_oauth: !!(GOOGLE_ID && GOOGLE_SEC),
      db_migrated: dbMigrated,
      database_url_set: !!(process.env.DATABASE_URL || process.env.SUPABASE_DB_URL),
    });
  }

  // ── GET /api/config (PUBLIC) ───────────────────────────────
  // Lightweight feature-flag endpoint so the frontend knows what's enabled.
  if(pathname==='/api/config' && method==='GET'){
    return jres(res,200,{
      google_login_enabled: !!(GOOGLE_ID && GOOGLE_SEC),
      stripe_enabled: !!STRIPE_SK,
      stripe_publishable_key: STRIPE_PK || null,           // safe to expose
      stripe_pro_configured: !!STRIPE_PRO_PRICE,
      stripe_biz_configured: !!STRIPE_BIZ_PRICE,
      brave_search_enabled: !!BRAVE_KEY,
      ga_measurement_id: GA_ID || null,                    // safe to expose (public tag)
    });
  }

  // ── GET /api/auth/google/callback ─────────────────────────
  if(pathname==='/api/auth/google/callback'&&method==='GET'){
    const qs=new url.URL(req.url,APP_URL).searchParams;
    const code=qs.get('code');
    const oauthErr=qs.get('error'); // Google may return ?error=access_denied etc.
    if(oauthErr){
      console.error('[Google OAuth] returned error:', oauthErr);
      res.writeHead(302,{Location:'/auth.html?error=google_failed&reason='+encodeURIComponent(oauthErr)});
      res.end();return;
    }
    if(!code){
      console.error('[Google OAuth] no authorization code');
      res.writeHead(302,{Location:'/auth.html?error=google_failed&reason=no_code'});
      res.end();return;
    }
    try{
      if(!GOOGLE_ID || !GOOGLE_SEC){
        throw new Error('not_configured: Google OAuth env vars missing on server');
      }
      const tokens=await googleExchange(code);
      const gUser=await googleUserInfo(tokens.access_token);
      let user=await DB.findBy('email',gUser.email.toLowerCase());
      if(!user){
        user=newUser({name:gUser.name||gUser.email,email:gUser.email.toLowerCase(),password:'',verified:true,google_id:gUser.id});
        await DB.create(user);
      }else if(!user.google_id){
        user.google_id=gUser.id;user.verified=true;
      }
      recordLogin(user, req, 'google');
      try{ await DB.save(user); }catch(e){}
      const token=JWT.sign({userId:user.id,email:user.email});
      res.writeHead(302,{Location:`/app.html?token=${token}`});res.end();
    }catch(e){
      console.error('[Google OAuth] callback failed:', e.message);
      var reason = (e.message||'').includes('not_configured') ? 'not_configured'
        : (e.message||'').includes('exchange') ? 'token_exchange_failed'
        : (e.message||'').includes('userinfo') ? 'userinfo_failed'
        : 'unknown';
      res.writeHead(302,{Location:'/auth.html?error=google_failed&reason='+reason});
      res.end();
    }
    return;
  }

  // ── GET /api/google/sheets/callback ────────────────────────
  // Google redirects here after user grants Sheets scope. The `state` query param
  // carries the user's JWT (we put it there when we generated the auth URL) so we
  // can identify which user is connecting.
  if(pathname==='/api/google/sheets/callback' && method==='GET'){
    const qs=new url.URL(req.url,APP_URL).searchParams;
    const code=qs.get('code');
    const state=qs.get('state'); // user's JWT
    const oauthErr=qs.get('error');
    if(oauthErr || !code || !state){
      res.writeHead(302,{Location:'/app.html?google_sheets=error&reason='+encodeURIComponent(oauthErr||'no_code')});
      res.end();return;
    }
    try{
      if(!GOOGLE_ID || !GOOGLE_SEC) throw new Error('not_configured');
      const claims=JWT.verify(state);
      if(!claims) throw new Error('invalid_state');
      const user=await DB.findBy('id',claims.userId);
      if(!user) throw new Error('user_not_found');
      const tokens=await googleSheetsExchange(code);
      if(!tokens.refresh_token){
        // Google only returns refresh_token on first consent. We sent prompt=consent so
        // this should always be present, but if not we can't make API calls later.
        throw new Error('no_refresh_token (revoke previous grant in Google account settings and retry)');
      }
      const gUser=await googleUserInfo(tokens.access_token);
      user.google_oauth = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Date.now() + (tokens.expires_in||3600)*1000,
        scope: tokens.scope || SHEETS_SCOPE,
        email: (gUser && gUser.email) || '',
      };
      await DB.save(user);
      res.writeHead(302,{Location:'/app.html?google_sheets=connected'});res.end();
    }catch(e){
      console.error('[Sheets OAuth] callback failed:', e.message);
      res.writeHead(302,{Location:'/app.html?google_sheets=error&reason='+encodeURIComponent((e.message||'unknown').slice(0,80))});
      res.end();
    }
    return;
  }

  // ── GET /api/auth/verify ───────────────────────────────────
  if(pathname==='/api/auth/verify'&&method==='GET'){
    const token=new url.URL(req.url,APP_URL).searchParams.get('token');
    if(!token){res.writeHead(302,{Location:'/auth.html?error=invalid_token'});res.end();return;}
    const user=await DB.findBy('verify_token',token);
    if(!user){res.writeHead(302,{Location:'/auth.html?error=invalid_token'});res.end();return;}
    user.verified=true;user.verify_token=null;await DB.save(user);
    res.writeHead(302,{Location:'/app.html?verified=1'});res.end();return;
  }

  // ── POST /api/auth/resend-verify ──────────────────────────
  if(pathname==='/api/auth/resend-verify'&&method==='POST'){
    const claims=getAuth(req);if(!claims)return jres(res,401,{error:'認証が必要です'});
    const user=await DB.findBy('id',claims.userId);
    if(!user||user.verified)return jres(res,400,{error:'確認済みです'});
    user.verify_token=crypto.randomBytes(32).toString('hex');
    await DB.save(user);await sendVerifyEmail(user);
    return jres(res,200,{ok:true});
  }

  // ── POST /api/auth/forgot-password ────────────────────────
  if(pathname==='/api/auth/forgot-password'&&method==='POST'){
    const{email}=await readBody(req);
    if(!email)return jres(res,400,{error:'メールアドレスを入力してください'});
    const user=await DB.findBy('email',email.toLowerCase());
    // Always return 200 to prevent email enumeration
    if(user&&!user.google_id){
      user.reset_token=crypto.randomBytes(32).toString('hex');
      user.reset_expiry=Date.now()+3600000; // 1 hour
      await DB.save(user);
      await sendResetEmail(user,user.reset_token);
    }
    return jres(res,200,{ok:true,message:'登録済みのメールアドレスであればリセットリンクを送信しました'});
  }

  // ── POST /api/auth/reset-password ─────────────────────────
  if(pathname==='/api/auth/reset-password'&&method==='POST'){
    const{token,password}=await readBody(req);
    if(!token||!password)return jres(res,400,{error:'入力してください'});
    if(password.length<8)return jres(res,400,{error:'パスワードは8文字以上にしてください'});
    const user=await DB.findBy('reset_token',token);
    if(!user||!user.reset_expiry||Date.now()>user.reset_expiry)
      return jres(res,400,{error:'リセットリンクの有効期限が切れています。もう一度お試しください'});
    user.password=PW.hash(password);user.reset_token=null;user.reset_expiry=null;
    await DB.save(user);
    return jres(res,200,{ok:true,message:'パスワードを変更しました。ログインしてください'});
  }

  // ── GET /api/share/:share_id (PUBLIC, no auth) ───────────────
  // Returns minimal agent info so the share landing page can render.
  // Includes team-only fields when agent.is_team so the page can show
  // member previews and the team goal.
  const psm=pathname.match(/^\/api\/share\/([a-z0-9-]+)$/);
  if(psm&&method==='GET'){
    const shareId=psm[1];
    const found=await findAgentByShareId(shareId);
    if(!found) return jres(res,404,{error:'共有エージェントが見つかりません'});
    const ag = found.agent;
    let memberPreview = null;
    if(ag.is_team && Array.isArray(ag.team_member_agent_ids) && ag.team_member_agent_ids.length){
      memberPreview = ag.team_member_agent_ids
        .map(id => (found.user.agents||[]).find(a => a.id === id))
        .filter(Boolean)
        .slice(0, 8)
        .map(a => ({
          avatar: a.avatar || '🤖',
          name: a.name || 'AI',
          skills: Array.isArray(a.skills) ? a.skills.slice(0,3) : [],
        }));
    }
    return jres(res,200,{
      agent:{
        avatar: ag.avatar,
        name: ag.name,
        skills: ag.skills||[],
        persona: ag.persona||'',
        chrome_enabled: !!ag.chrome_enabled,
        is_team: !!ag.is_team,
        team_goal: ag.is_team ? (ag.team_goal||'') : undefined,
        member_count: memberPreview ? memberPreview.length : undefined,
      },
      members: memberPreview,
      owner:{
        name: (found.user.name||(found.user.email||'').split('@')[0]||'ユーザー'),
        handle: found.user.handle || null,
        is_founder: !!found.user.is_founder,
        founder_seat_no: found.user.is_founder ? (found.user.founder_seat_no || null) : null,
      }
    });
  }

  // ── POST /api/chat/share — create a public, read-only conversation link ─
  // Body: { agent_id, title?, last_n? }. Snapshots the current chat history
  // (up to last 200 messages) and returns { share_id, url }.
  if(pathname==='/api/chat/share' && method==='POST'){
    const auth=getAuth(req); if(!auth) return jres(res,401,{error:'認証が必要です'});
    const user=await DB.findBy('id',auth.userId); if(!user) return jres(res,401,{error:'認証が必要です'});
    const body = (await readBody(req)) || {};
    const ag=(user.agents||[]).find(a=>a.id===body.agent_id);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    // In group chats, the snapshot includes every member's messages — only
    // the host should be able to publish that. Solo agents = owner only too.
    if(ag.is_group && ag.host_id && ag.host_id !== user.id){
      return jres(res,403,{error:'グループの会話を共有できるのはホストのみです'});
    }
    const hist = Array.isArray(ag.history) ? ag.history : [];
    if(!hist.length) return jres(res,400,{error:'共有できる会話がまだありません'});
    const lastN = Math.max(1, Math.min(200, parseInt(body.last_n,10) || 100));
    // Strip server-only fields. Keep role/content/time/user_name/user_avatar/tool_log.
    const snap = hist.slice(-lastN).map(m => ({
      role: m.role,
      content: m.content || '',
      time: m.time || '',
      user_name: m.user_name || undefined,
      user_avatar: m.user_avatar || undefined,
      tool_log: Array.isArray(m.tool_log) ? m.tool_log.map(t => {
        // Public-facing snapshot — only expose URLs from external sites
        // (search results, fetched pages). Hide `/generated/*` URLs (could
        // leak private user-rendered artifacts) and any other relative path.
        const url = (typeof t.url === 'string' && /^https?:\/\//.test(t.url)) ? t.url : undefined;
        return {
          name: t.name, ok: t.ok, error: t.error,
          title: t.title, url,
          // drop screenshot bytes — too heavy + may include sensitive info
        };
      }) : undefined,
    }));
    // Optional expiry: body.expires_in_days = 1 / 7 / 30 / 0 (never). Default 0.
    let expiresAt = null;
    if(typeof body.expires_in_days === 'number' && body.expires_in_days > 0){
      const days = Math.max(1, Math.min(365, Math.floor(body.expires_in_days)));
      expiresAt = new Date(Date.now() + days*24*60*60*1000).toISOString();
    }
    const sh = {
      id: genChatShareId(),
      title: String(body.title||'').slice(0,120) || ((snap[0]&&snap[0].content)?String(snap[0].content).slice(0,60):'Conversation'),
      messages: snap,
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
      msg_count: snap.length,
      view_count: 0,
    };
    ag.chat_shares = Array.isArray(ag.chat_shares) ? ag.chat_shares : [];
    ag.chat_shares.push(sh);
    // Cap to 20 shares per agent — drop oldest first.
    if(ag.chat_shares.length > 20) ag.chat_shares.splice(0, ag.chat_shares.length - 20);
    await DB.save(user);
    return jres(res,200,{share_id:sh.id, url:APP_URL+'/c/'+sh.id, title:sh.title});
  }

  // ── GET /api/chat/share/:id — public, no auth ─────────────────
  const csm = pathname.match(/^\/api\/chat\/share\/(c_[A-Za-z0-9_-]+)$/);
  if(csm && method==='GET'){
    const found = await findChatShareById(csm[1]);
    if(!found) return jres(res,404,{error:'共有が見つかりません'});
    // Expiry check — return 410 Gone for expired shares (distinct from 404).
    if(found.share.expires_at && new Date(found.share.expires_at).getTime() < Date.now()){
      return jres(res,410,{error:'expired', detail:'This share link has expired.'});
    }
    // View counter — fire-and-forget save so a slow disk doesn't block reads.
    // Skip when viewer === owner (don't inflate stats from creator previews).
    const viewerAuth = getAuth(req);
    if(!viewerAuth || viewerAuth.userId !== found.user.id){
      found.share.view_count = (found.share.view_count||0) + 1;
      DB.save(found.user).catch(e => console.warn('[chat-share view bump] save failed:', e.message));
    }
    return jres(res,200,{
      title: found.share.title,
      created_at: found.share.created_at,
      expires_at: found.share.expires_at || null,
      view_count: found.share.view_count || 0,
      msg_count: found.share.msg_count || (found.share.messages||[]).length,
      agent: {
        name: found.agent.name || 'AI',
        avatar: found.agent.avatar || '🤖',
      },
      owner: {
        name: (found.user.name || (found.user.email||'').split('@')[0] || 'User'),
        handle: found.user.handle || null,
        is_founder: !!found.user.is_founder,
        founder_seat_no: found.user.is_founder ? (found.user.founder_seat_no || null) : null,
      },
      messages: found.share.messages || [],
    });
  }

  // ── GET /api/templates — public, list one-click automation templates ──
  if(pathname === '/api/templates' && method === 'GET'){
    return jres(res, 200, { templates: TEMPLATES.map(t => ({
      id: t.id, icon: t.icon, title: t.title, description: t.description,
      avatar: t.avatar, skills: t.skills,
      has_schedule: !!t.schedule,
      schedule_summary: t.schedule ? (
        t.schedule.kind === 'daily'
          ? `Daily ${String(t.schedule.hour).padStart(2,'0')}:${String(t.schedule.minute).padStart(2,'0')}`
          : `Hourly :${String(t.schedule.minute||0).padStart(2,'0')}`
      ) : null,
      suggested_integrations: t.suggestedIntegrations || [],
    })) });
  }

  // ── GET /api/u/:handle — public creator profile JSON ─────────
  const uApi = pathname.match(/^\/api\/u\/([a-z0-9_]{3,30})$/);
  if(uApi && method === 'GET'){
    const h = uApi[1];
    let owner = null;
    try {
      if(USE_SUPA){
        const r = await sbReq('GET','users','?select=*&handle=eq.'+encodeURIComponent(h)+'&limit=1');
        owner = (r.d && r.d[0]) || null;
      } else {
        owner = LDB.find(u => (u.handle||'').toLowerCase() === h) || null;
      }
    } catch(e){}
    if(!owner) return jres(res,404,{error:'profile not found'});
    const listings = (owner.agents||[]).filter(a => a.marketplace && a.marketplace.is_listed).map(a => ({
      id: a.id,
      listing_id: (a.marketplace && a.marketplace.listing_id) || '',
      share_id: a.share_id || null,
      avatar: a.avatar,
      name: a.name,
      persona: (a.persona||'').slice(0,160),
      skills: a.skills || [],
      uses_count: (a.marketplace && a.marketplace.uses_count) || 0,
      price_jpy: (a.marketplace && a.marketplace.price_jpy) || 0,
    }));
    return jres(res,200,{
      handle: owner.handle,
      name: owner.name || '',
      role: owner.role || '',
      is_verified: !!owner.is_verified,
      is_founder: !!owner.is_founder,
      founder_seat_no: owner.is_founder ? (owner.founder_seat_no || null) : null,
      joined_at: owner.created_at || null,
      listings,
      listing_count: listings.length,
    });
  }

  // ── POST /api/inbound/email — inbound email forwarder ──────
  // We don't run IMAP ourselves (free-tier hosting can't keep an IMAP socket
  // open). Instead, the user wires up a forwarder (Mailgun Inbound Parse,
  // SendGrid Inbound, Resend Inbound — any provider) to POST the email here
  // as JSON.
  //
  // Body: { token, to, from, subject, body }
  //   token   = INBOUND_EMAIL_TOKEN (shared secret, env var)
  //   to      = anything that contains a webhook token like `wh_abc...`.
  //             A handy alias format is `agent+wh_abc123@inbound.example.com`
  //             — providers preserve the `+`-suffix when forwarding.
  if(pathname === '/api/inbound/email' && method === 'POST'){
    if(!process.env.INBOUND_EMAIL_TOKEN){
      return jres(res, 503, { error: 'inbound_email_disabled', detail: 'INBOUND_EMAIL_TOKEN env var not set' });
    }
    const body = (await readBody(req)) || {};
    if(body.token !== process.env.INBOUND_EMAIL_TOKEN){
      return jres(res, 401, { error: 'invalid token' });
    }
    // Do NOT lowercase — webhook tokens are base64url (case-sensitive). Email
    // local-parts are technically case-sensitive too; forwarders preserve case.
    const toField = String(body.to || '');
    const tokMatch = toField.match(/wh_[A-Za-z0-9_-]{16,}/);
    if(!tokMatch){
      return jres(res, 400, { error: 'no webhook token in `to` field', hint:'format the alias like agent+wh_<token>@inbound.example.com' });
    }
    try {
      const found = await findAgentByWebhookToken(tokMatch[0]);
      if(!found) return jres(res, 404, { error: 'agent not found for that token' });
      const { user: owner, agent } = found;
      const from = String(body.from || '').slice(0,200);
      const subject = String(body.subject || '').slice(0,200);
      const emailBody = String(body.body || '').slice(0, 12000);
      const message = `[Inbound email]\nFrom: ${from}\nSubject: ${subject}\n\n${emailBody}`;
      if((owner.balance_jpy||0) <= 0){
        return jres(res, 402, { error: 'owner balance is zero' });
      }
      const sys = buildSystem(agent, {
        memories: (owner.memories || []),
        kbHits: _retrieveKbChunks(agent, subject + ' ' + emailBody, 3),
      });
      const msgs = [...(agent.history||[]).slice(-20), { role:'user', content: message }];
      const r = await callAI(msgs, sys, agent.model);
      const reply = (r && r.content && r.content[0] && r.content[0].text) || '';
      const cost = (r && r.usage)
        ? calcCost(r.usage.input_tokens||0, r.usage.output_tokens||0)
        : { jpy:0, usd:0 };
      const ts = new Date().toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit',hour12:false});
      agent.history = [
        ...(agent.history||[]),
        { role:'user', content: message, time: ts, via:'inbound_email', from: from, subject: subject },
        { role:'assistant', content: reply, time: ts, cost_jpy: cost.jpy, via:'inbound_email' },
      ];
      if(agent.history.length > 200) agent.history = agent.history.slice(-200);
      owner.balance_jpy = Math.round(((owner.balance_jpy||0) - cost.jpy)*1000)/1000;
      try { await DB.save(owner); } catch(e){ console.warn('[inbound] save failed:', e.message); }
      let email_back = false;
      if(from && /@/.test(from) && body.reply_email !== false){
        try {
          await sendEmail(from, 'Re: ' + (subject || agent.name || 'AI reply'),
            '<div style="font-family:system-ui;max-width:600px;margin:0 auto;padding:20px">'+
            '<div style="background:#fff7ed;border:1px solid #f5e1cd;padding:14px;border-radius:10px;white-space:pre-wrap;font-size:14px;line-height:1.55">'+_xmlEscape(reply)+'</div>'+
            '<div style="margin-top:18px;text-align:center;color:#a1a1aa;font-size:11px">— '+_xmlEscape(agent.name||'AI')+' via MY AI AGENT</div>'+
            '</div>',
            { fromName: agent.name || 'AI' }
          );
          email_back = true;
        } catch(e){ console.warn('[inbound] reply email failed:', e.message); }
      }
      return jres(res, 200, { ok: true, reply, email_back, agent: { name: agent.name } });
    } catch(e){
      console.error('[inbound] error:', e.message);
      return jres(res, 500, { error: 'internal', detail: (e&&e.message||'').slice(0,200) });
    }
  }

  // ── DELETE /api/chat/share/:id — auth required, owner only ────
  const csmd = pathname.match(/^\/api\/chat\/share\/(c_[A-Za-z0-9_-]+)$/);
  if(csmd && method==='DELETE'){
    const auth=getAuth(req); if(!auth) return jres(res,401,{error:'認証が必要です'});
    const user=await DB.findBy('id',auth.userId); if(!user) return jres(res,401,{error:'認証が必要です'});
    let removed=false;
    for(const ag of (user.agents||[])){
      const i=(ag.chat_shares||[]).findIndex(s => s.id===csmd[1]);
      if(i>=0){ ag.chat_shares.splice(i,1); removed=true; break; }
    }
    if(!removed) return jres(res,404,{error:'共有が見つかりません'});
    await DB.save(user);
    return jres(res,200,{ok:true});
  }

  // ── GET /api/og/a/:share_id.svg ────────────────────────────
  // Public: SNS unfurl image for agent share pages (/a/:share_id).
  // Teams (is_team:true) render the dark "Member Grid" variant; solo agents
  // render the existing peach-gradient listing card.
  const ogShareSvg = pathname.match(/^\/api\/og\/a\/([a-z0-9-]+)\.svg$/);
  if(ogShareSvg && method==='GET'){
    const found = await findAgentByShareId(ogShareSvg[1]);
    if(!found || !found.agent || !found.agent.share_id){
      res.writeHead(404,{'Content-Type':'text/plain'});
      return res.end('Share not found');
    }
    let svg;
    if(found.agent.is_team){
      const memberAgents = (found.user.agents||[]).filter(a => (found.agent.team_member_agent_ids||[]).includes(a.id)).slice(0, 6);
      svg = renderTeamOgSvg(found.agent, memberAgents);
    } else {
      const detail = _agentAsListing(found.user, found.agent);
      svg = renderListingOgSvg(detail);
    }
    res.writeHead(200, {
      'Content-Type':'image/svg+xml; charset=utf-8',
      'Cache-Control':'public, max-age=300',
      'Access-Control-Allow-Origin':'*',
    });
    res.end(svg);
    return;
  }

  // ── GET /api/og/a/:share_id.png ────────────────────────────
  // Public: PNG variant for Twitter / Facebook (raster-only platforms).
  const ogSharePng = pathname.match(/^\/api\/og\/a\/([a-z0-9-]+)\.png$/);
  if(ogSharePng && method==='GET'){
    const shareId = ogSharePng[1];
    const found = await findAgentByShareId(shareId);
    if(!found || !found.agent || !found.agent.share_id){
      res.writeHead(404,{'Content-Type':'text/plain'});
      return res.end('Share not found');
    }
    // Cache lookup — keyed by share_id, invalidated when agent.updated_at advances.
    const sourceMtime = new Date(found.agent.updated_at || found.agent.created_at || 0).getTime();
    const cacheKey = 'a:' + shareId;
    const cached = _ogPngCacheGet(cacheKey, sourceMtime);
    if(cached){
      res.writeHead(200, {
        'Content-Type':'image/png',
        'Cache-Control':'public, max-age=604800',
        'Access-Control-Allow-Origin':'*',
        'Content-Length': cached.length,
        'X-Og-Cache':'hit',
      });
      return res.end(cached);
    }
    let svg;
    if(found.agent.is_team){
      const memberAgents = (found.user.agents||[]).filter(a => (found.agent.team_member_agent_ids||[]).includes(a.id)).slice(0, 6);
      const avatarMap = new Map();
      const emojis = [found.agent.avatar || '🎯', ...memberAgents.map(m => m.avatar || '🤖')];
      for(const em of emojis){
        if(!em || em.startsWith('data:image/') || avatarMap.has(em)) continue;
        try {
          const tw = await _getTwemojiSvg(em);
          if(tw) avatarMap.set(em, _twemojiDataUri(tw));
        } catch(e){ /* skip */ }
      }
      svg = renderTeamOgSvg(found.agent, memberAgents, avatarMap);
    } else {
      const detail = _agentAsListing(found.user, found.agent);
      let twemojiUri = null;
      try{
        const av = detail.agent?.avatar || '🤖';
        const tw = await _getTwemojiSvg(av);
        if(tw) twemojiUri = _twemojiDataUri(tw);
      }catch(e){ /* fall back */ }
      svg = renderListingOgSvg(detail, twemojiUri);
    }
    const png = svgToPng(svg);
    if(!png) return _serveStaticOgFallback(res);
    _ogPngCacheSet(cacheKey, png, sourceMtime);
    res.writeHead(200, {
      'Content-Type':'image/png',
      'Cache-Control':'public, max-age=604800',     // 7 days at the edge
      'Access-Control-Allow-Origin':'*',
      'Content-Length': png.length,
      'X-Og-Cache':'miss',
    });
    res.end(png);
    return;
  }

  // ── GET /api/og/:listing_id.svg ────────────────────────────
  // Public: Pattern E thumbnail for SNS / OG (SVG variant). Cacheable.
  const ogm = pathname.match(/^\/api\/og\/(ls_[a-z0-9_-]+)\.svg$/);
  if(ogm && method==='GET'){
    const found = await findAgentByListingId(ogm[1]);
    if(!found || !found.agent.marketplace.is_listed){
      res.writeHead(404,{'Content-Type':'text/plain'});
      return res.end('Listing not found');
    }
    const detail = publicListing(found.user, found.agent);
    // Inline browsers/clients render emoji natively — skip Twemoji fetch for SVG variant
    const svg = renderListingOgSvg(detail);
    res.writeHead(200, {
      'Content-Type':'image/svg+xml; charset=utf-8',
      'Cache-Control':'public, max-age=300',
      'Access-Control-Allow-Origin':'*',
    });
    res.end(svg);
    return;
  }

  // ── GET /api/og/:listing_id.png ────────────────────────────
  // Public: PNG variant for Twitter / Facebook (raster-only platforms).
  // Embeds Twemoji SVG so the avatar emoji renders even on Linux hosts
  // that lack a color emoji font. Falls back to SVG redirect if resvg fails.
  const ogmPng = pathname.match(/^\/api\/og\/(ls_[a-z0-9_-]+)\.png$/);
  if(ogmPng && method==='GET'){
    const listingId = ogmPng[1];
    const found = await findAgentByListingId(listingId);
    if(!found || !found.agent.marketplace.is_listed){
      res.writeHead(404,{'Content-Type':'text/plain'});
      return res.end('Listing not found');
    }
    const sourceMtime = new Date(found.agent.marketplace.updated_at || found.agent.updated_at || 0).getTime();
    const cacheKey = 'l:' + listingId;
    const cached = _ogPngCacheGet(cacheKey, sourceMtime);
    if(cached){
      res.writeHead(200, {
        'Content-Type':'image/png',
        'Cache-Control':'public, max-age=604800',
        'Access-Control-Allow-Origin':'*',
        'Content-Length': cached.length,
        'X-Og-Cache':'hit',
      });
      return res.end(cached);
    }
    const detail = publicListing(found.user, found.agent);
    let twemojiUri = null;
    try{
      const av = detail.agent?.avatar || '🤖';
      const tw = await _getTwemojiSvg(av);
      if(tw) twemojiUri = _twemojiDataUri(tw);
    }catch(e){ /* ignore */ }
    const svg = renderListingOgSvg(detail, twemojiUri);
    const png = svgToPng(svg);
    if(!png){
      return _serveStaticOgFallback(res);
    }
    _ogPngCacheSet(cacheKey, png, sourceMtime);
    res.writeHead(200, {
      'Content-Type':'image/png',
      'Cache-Control':'public, max-age=604800',             // 7 days
      'X-Og-Cache':'miss',
      'Access-Control-Allow-Origin':'*',
      'Content-Length': png.length,
    });
    res.end(png);
    return;
  }

  // ── GET /api/listing/:listing_id (public) ──────────────────
  // Used by /l/:id landing page. No auth required so SNS scrapers can hit it.
  const plm = pathname.match(/^\/api\/listing\/(ls_[a-z0-9_-]+)$/);
  if(plm && method==='GET'){
    const found = await findAgentByListingId(plm[1]);
    if(!found || !found.agent.marketplace.is_listed){
      return jres(res,404,{error:'Listing not found'});
    }
    return jres(res,200, publicListing(found.user, found.agent));
  }

  // ── POST /api/listing/:listing_id/preview (public) ─────────
  // Anonymous chat preview — let visitors try the agent before signing up.
  // body: {messages: [{role,content}], message: string}
  // Rate limit: 3 messages per session (client-side + server enforced),
  // and 10 per IP per hour (server enforced).
  const prv = pathname.match(/^\/api\/listing\/(ls_[a-z0-9_-]+)\/preview$/);
  if(prv && method==='POST'){
    if(!ANTHROPIC) return jres(res,503,{error:'APIキーが設定されていません'});
    if(!rateLimit('preview:'+ip, 10, 3600000)) return jres(res,429,{error:'プレビュー利用回数の上限です。少し待ってから試してください。'});
    const found = await findAgentByListingId(prv[1]);
    if(!found || !found.agent.marketplace.is_listed){
      return jres(res,404,{error:'Listing not found'});
    }
    const body = await readBody(req);
    const message = String(body.message||'').trim();
    if(!message) return jres(res,400,{error:'メッセージを入力してください'});
    if(message.length > 2000) return jres(res,400,{error:'長すぎます（2000文字まで）'});
    // Cap conversation length to keep token cost bounded
    const prior = Array.isArray(body.messages) ? body.messages.slice(-6) : [];
    if(prior.length >= 6) return jres(res,403,{error:'このプレビューは 3 ターンまでです。続けるには無料登録してください。', preview_exhausted:true});
    const msgs = [...prior, {role:'user', content:message}];
    try{
      const d = await callAI(msgs, buildSystem(found.agent));
      const reply = d.content?.find(b=>b.type==='text')?.text || 'エラー';
      const remaining = Math.max(0, 3 - Math.ceil((prior.length+1)/2));
      return jres(res,200,{
        reply,
        remaining,                   // turns remaining for the visitor
        preview_exhausted: remaining<=0,
      });
    }catch(e){
      return jres(res,502,{error:'AI応答エラー: '+e.message});
    }
  }

  // ── POST /api/contact (PUBLIC — no auth) ───────────────────
  // body: {name, email, subject, message}
  if(pathname==='/api/contact' && method==='POST'){
    if(!rateLimit('contact:'+ip, 5, 3600000)) return jres(res,429,{error:'送信回数の上限に達しました。しばらくしてから再度お試しください。'});
    let cBody; try{ cBody = await readBody(req); }catch(e){ return jres(res,400,{error:'入力エラー'}); }
    const cName = String(cBody.name||'').trim().slice(0,100);
    const cEmail = String(cBody.email||'').trim().slice(0,200);
    const cSubject = String(cBody.subject||'').trim().slice(0,200);
    const cMessage = String(cBody.message||'').trim();
    if(!cName || !cEmail || !cSubject || !cMessage){
      return jres(res,400,{error:'すべての項目を入力してください'});
    }
    if(cMessage.length < 10) return jres(res,400,{error:'メッセージは 10 文字以上で入力してください'});
    if(cMessage.length > 5000) return jres(res,400,{error:'メッセージは 5000 文字以下で入力してください'});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cEmail)) return jres(res,400,{error:'メールアドレスの形式が不正です'});

    const escH = (s)=>String(s).replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
    const html = `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#ea580c">お問い合わせ受付</h2>
      <p><b>名前:</b> ${escH(cName)}</p>
      <p><b>メール:</b> ${escH(cEmail)}</p>
      <p><b>件名:</b> ${escH(cSubject)}</p>
      <hr style="border:0;border-top:1px solid #eee;margin:18px 0">
      <pre style="white-space:pre-wrap;font-family:inherit;font-size:14px;line-height:1.7">${escH(cMessage)}</pre>
      <hr style="border:0;border-top:1px solid #eee;margin:18px 0">
      <p style="color:#888;font-size:11px">IP: ${escH(ip||'-')}</p>
    </div>`;
    try{
      await sendEmail('kota.takeuchi@protocol.ooo', '【MY AI AGENT】お問い合わせ: '+cSubject, html);
    }catch(e){
      console.error('[contact] send failed:', e.message);
    }
    return jres(res,200,{ok:true});
  }

  // ── GET /api/extension/stream (token-only auth) ────────────
  // Browser extension keeps an SSE connection here. Server pushes 'cmd' events
  // when the AI wants the extension to do something.
  if(pathname==='/api/extension/stream' && method==='GET'){
    const qs=new url.URL(req.url,APP_URL).searchParams;
    const tok = qs.get('token') || '';
    if(!tok || tok.length < 16) return jres(res,400,{error:'token required'});
    const owner = await DB.findBy('extension_device_token', tok);
    if(!owner) return jres(res,401,{error:'invalid token'});
    res.writeHead(200, {
      'Content-Type':'text/event-stream; charset=utf-8',
      'Cache-Control':'no-cache, no-transform',
      'Connection':'keep-alive',
      'X-Accel-Buffering':'no',
      'Access-Control-Allow-Origin':'*',
    });
    res.write('event: ready\ndata: {"ok":true}\n\n');
    // Replace any existing connection for this token (single-device assumption).
    const old = _extConnections.get(tok);
    if(old){ try{ old.res.end(); }catch(e){} }
    const heartbeat = setInterval(()=>{ try{ res.write('event: ping\ndata: {}\n\n'); }catch(e){} }, 20000);
    _extConnections.set(tok, { res, owner_id: owner.id, heartbeat });
    // Touch last_seen
    if(owner.extension_device_meta){
      owner.extension_device_meta = { ...owner.extension_device_meta, last_seen: new Date().toISOString() };
      try{ await DB.save(owner); }catch(e){}
    }
    req.on('close', ()=>{
      clearInterval(heartbeat);
      const cur = _extConnections.get(tok);
      if(cur && cur.res === res){ _extConnections.delete(tok); }
    });
    return;
  }

  // ── POST /api/extension/result (token-only auth) ───────────
  if(pathname==='/api/extension/result' && method==='POST'){
    const auth = (req.headers['authorization']||'').replace(/^Bearer\s+/i,'');
    if(!auth || auth.length < 16) return jres(res,401,{error:'token required'});
    const owner = await DB.findBy('extension_device_token', auth);
    if(!owner) return jres(res,401,{error:'invalid token'});
    const body = await readBody(req);
    const cid = body && body.command_id;
    if(!cid) return jres(res,400,{error:'command_id required'});
    const pending = _extPending.get(cid);
    if(pending){
      if(pending.timeout) clearTimeout(pending.timeout);
      _extPending.delete(cid);
      pending.resolve(body.result || { error:'empty_result' });
    }
    return jres(res,200,{ok:true});
  }

  // ── PUBLIC: GET /api/g/:token (group preview before login) ─
  // Anyone with the link can see the invite landing card.
  const previewM = pathname.match(/^\/api\/g\/([a-zA-Z0-9]{4,16})$/);
  if(previewM && method === 'GET'){
    const found = await findGroupByToken(previewM[1]);
    if(!found) return jres(res,404,{error:'招待が見つかりません'});
    const valid = isInviteValid(found.agent);
    return jres(res, valid ? 200 : 410, {
      ok: valid,
      group_name: found.agent.name,
      group_avatar: found.agent.avatar,
      ai_name: found.agent.name,           // alias — agent IS the AI
      ai_avatar: found.agent.avatar,
      member_count: (found.agent.members||[]).length,
      max_members: found.agent.invite_max_members || 50,
      expires_at: found.agent.invite_expires_at || null,
      host_name: found.host.name || (found.host.email||'').split('@')[0] || 'ホスト',
      members_preview: (found.agent.members||[]).slice(0, 6).map(m => ({
        name: m.name, avatar: m.avatar, role: m.role,
      })),
      // Cost transparency for the invitee
      free_for_invitees: true,
      payer: 'host',
    });
  }

  // ── GET /api/teams/templates (public) ─────────────────────
  // Returns the catalog of team templates. Anyone can browse before signup.
  if(pathname==='/api/teams/templates' && method==='GET'){
    return jres(res, 200, {
      templates: TEAM_TEMPLATES.map(t => ({
        id: t.id,
        name: t.name,
        cover_emoji: t.cover_emoji,
        category: t.category,
        price_jpy: t.price_jpy,
        description: t.description,
        agent_count: t.agents.length,
        agents_preview: t.agents.map(a => ({ avatar: a.avatar, name: a.name, skills: a.skills })),
      })),
    });
  }

  // ── GET /api/marketplace (PUBLIC, no auth) ─────────────────
  // Same shape as the authed /api/marketplace below, just without
  // user-specific data (favorites). Lets anonymous visitors of /store
  // browse listings + drives sign-up via "Get / Clone" CTAs.
  if(pathname==='/api/marketplace' && method==='GET'){
    const qs = new url.URL(req.url, APP_URL).searchParams;
    const cat = (qs.get('category')||'').trim();
    const q = (qs.get('q')||'').trim().toLowerCase();
    const sort = (qs.get('sort')||'popular').trim();
    // Trending window: day / week / month / all. day/week/month filters by
    // listed_at then ranks by raw uses. 'all' uses exp-decay scorer.
    const windowParam = (qs.get('window')||'all').trim();
    const tagsRaw = (qs.get('tags')||'').trim();
    const tagFilter = tagsRaw ? tagsRaw.split(',').map(s=>s.trim()).filter(Boolean) : [];
    let listings = await listAllPublicListings();
    if(cat && cat!=='all') listings = listings.filter(l=>l.category===cat);
    if(tagFilter.length){
      listings = listings.filter(l=>tagFilter.every(t=>(l.tags||[]).indexOf(t)>=0));
    }
    if(q){
      listings = listings.filter(l=>{
        const hay = (l.title+' '+l.description+' '+l.category_label+' '+(l.creator.handle||'')+' '+(l.tag_labels||[]).join(' ')).toLowerCase();
        return hay.indexOf(q)>=0;
      });
    }
    if(sort==='recent'){
      listings.sort((a,b)=>new Date(b.listed_at||0).getTime()-new Date(a.listed_at||0).getTime());
    } else if(sort==='top_rated'){
      const score = l => (l.rating||0) * Math.log(1+(l.rating_count||0));
      listings.sort((a,b)=>score(b)-score(a));
    } else if(sort==='trending'){
      const now = Date.now();
      const windowDays = windowParam==='day' ? 1
                       : windowParam==='week' ? 7
                       : windowParam==='month' ? 30
                       : 0;
      if(windowDays > 0){
        const cutoff = now - windowDays*86400000;
        listings = listings.filter(l => new Date(l.listed_at||0).getTime() >= cutoff);
        listings.sort((a,b) => (b.uses||0) - (a.uses||0));
      } else {
        // 'all' — exp decay half-life ~14 days.
        const score = l => {
          const ageDays = Math.max(0, (now - new Date(l.listed_at||0).getTime()) / 86400000);
          const decay = Math.exp(-ageDays / 14);
          return (l.uses||0) * (0.4 + 0.6*decay) + (l.rating_count||0) * 2 * decay;
        };
        listings.sort((a,b)=>score(b)-score(a));
      }
    } else {
      listings.sort((a,b)=>{
        if(a.badge==='hot' && b.badge!=='hot') return -1;
        if(b.badge==='hot' && a.badge!=='hot') return 1;
        return (b.uses||0)-(a.uses||0);
      });
    }
    // Try to attach favorites if a token IS present (idempotent for logged-out)
    let favorites = [];
    try {
      const claims = getAuth(req);
      if(claims){
        const u = await DB.findBy('id', claims.userId);
        if(u && Array.isArray(u.favorites)) favorites = u.favorites;
      }
    } catch(e){}
    return jres(res,200,{
      listings,
      categories: MARKET_CATEGORIES.map(id=>({id, label:MARKET_CAT_LABEL[id]})),
      tags: MARKET_TAGS,
      sort,
      favorites,
    });
  }

  // ── Auth required below ────────────────────────────────────
  const claims=getAuth(req);
  if(!claims)return jres(res,401,{error:'認証が必要です'});
  const user=await DB.findBy('id',claims.userId);
  if(!user)return jres(res,401,{error:'ユーザーが見つかりません'});
  // Promote any pending creator revenue past the 7-day hold
  if(user.revenue_history && user.revenue_history.length){
    const before = user.balance_jpy_available || 0;
    reconcilePending(user);
    if((user.balance_jpy_available||0) !== before) await DB.save(user);
  }

  // ── GET /api/me ────────────────────────────────────────────
  if(pathname==='/api/me'&&method==='GET'){
    // Lazy Founder 100 trial expiry: if the 1-month BUSINESS trial elapsed,
    // downgrade back to free (badge + 0% Store fees persist forever).
    if(user.is_founder && user.business_trial_until && user.plan === 'business'
       && new Date(user.business_trial_until).getTime() < Date.now()){
      user.plan = 'free';
      try { await DB.save(user); } catch(e){ /* noop */ }
    }
    // Proactive nudge: fire-and-forget, will surface in the next /api/me call.
    // Quietly tries to generate one short "AI が思い出したように言ってくる"
    // message for a qualifying agent. Capped to 1/day per user.
    _maybeGenerateNudgeForUser(user).catch(()=>{});
    return jres(res,200,{user:safe(user)});
  }

  // ── GET /api/agents ────────────────────────────────────────
  if(pathname==='/api/agents'&&method==='GET')return jres(res,200,{agents:user.agents||[]});

  // ── POST /api/onboarding/quickstart ────────────────────────
  // First-run onboarding: Claude designs a single solo agent that matches
  // the user's goal, we create it, return the new agent. Works for every
  // plan (no team-gen gate). Caps the user at one quickstart agent so
  // repeated calls don't spam the sidebar.
  if(pathname==='/api/onboarding/quickstart' && method==='POST'){
    const body = await readBody(req);
    const goal = String(body.goal || '').trim().slice(0, 800);
    const lang = (body.lang === 'ja') ? 'ja' : 'en';
    if(goal.length < 6) return jres(res,400,{error: lang==='ja' ? '目的をもう少し詳しく書いてください' : 'Please describe your goal in a bit more detail'});
    if(!ANTHROPIC)        return jres(res,500,{error: 'AI is not configured'});
    if((user.agents||[]).filter(a => !a.is_group).length >= 1000) return jres(res,400,{error:'agents at cap'});

    const VALID_SKILLS = ['writing','research','coding','marketing','planning','analysis','translate','support','idea','teaching','ceo','coo','secretary','designer','sns','other'];

    const sys = lang === 'ja'
      ? 'あなたは AI エージェント設計の専門家。ユーザーの 1 文目標から、それを実行する最適な solo AI エージェントを 1 体設計する。出力は厳密な JSON のみ、説明文や ``` も無し。'
      : 'You design AI agents. Given a one-sentence goal, design ONE solo AI agent that will execute that goal best. Output strict JSON only — no commentary, no code fences.';

    const schemaHint = '{"name":"<role name in target language, 12 chars max>","avatar":"<single emoji>","skills":[<1-3 of: '+VALID_SKILLS.join(',')+'>],"persona":"<1-2 sentence first-person persona describing scope and tone>"}';

    let designed = null;
    try {
      const r = await callAI(
        [{role:'user', content: 'Goal: ' + goal + '\n\nReturn JSON matching: ' + schemaHint}],
        sys,
        'haiku',
      );
      const raw = (r.content || []).map(b => b.text || '').join('').trim()
        .replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'');
      designed = JSON.parse(raw);
    } catch(e){
      return jres(res,502,{error:'AI design failed: ' + (e.message || 'unknown')});
    }
    if(!designed || !designed.name) return jres(res,502,{error:'AI returned no design'});

    const skills = (Array.isArray(designed.skills) ? designed.skills : ['support'])
      .filter(s => VALID_SKILLS.includes(s)).slice(0,3);
    if(!skills.length) skills.push('support');

    const agent = {
      id: 'ag_' + crypto.randomUUID(),
      avatar: String(designed.avatar || '🤖').slice(0, 6),
      name: String(designed.name).trim().slice(0, 40),
      skills,
      persona: String(designed.persona || '').slice(0, 1200),
      chrome_enabled: false,
      sheets_enabled: false,
      extension_enabled: false,
      model: 'gemini-flash',
      history: [],
      created_at: new Date().toISOString(),
      via_onboarding: true,
    };
    user.agents = [...(user.agents||[]), agent];
    user.onboarded_v1 = true;
    user.onboarded_at = new Date().toISOString();
    await DB.save(user);
    return jres(res,201,{ agent, goal });
  }

  // ── POST /api/onboarding/dismiss ───────────────────────────
  // User skipped the wizard. Just flips the flag so we don't show it again.
  if(pathname==='/api/onboarding/dismiss' && method==='POST'){
    user.onboarded_v1 = true;
    user.onboarded_at = new Date().toISOString();
    try { await DB.save(user); } catch(e){}
    return jres(res,200,{ok:true});
  }

  // ── POST /api/agents ───────────────────────────────────────
  // ── POST /api/templates/:id/install — 1-click apply ──────────
  // Creates a new agent from the template, optionally seeds its first
  // schedule, and returns suggested integration setup links.
  const tmplInstall = pathname.match(/^\/api\/templates\/([a-z0-9-]+)\/install$/);
  if(tmplInstall && method==='POST'){
    const t = _findTemplate(tmplInstall[1]);
    if(!t) return jres(res,404,{error:'テンプレートが見つかりません'});
    const _gf = _isGrandfathered(user);
    const _planCap = _gf ? 1000 : user.plan==='free' ? 3 : user.plan==='pro' ? 20 : 1000;
    const _owned = (user.agents||[]).filter(a => !a.is_group).length;
    if(_owned >= _planCap){
      return jres(res,402,{error:`Agents は最大 ${_planCap} 体まで。アップグレードしてください。`, upgrade_required: user.plan==='free' ? 'pro' : 'business'});
    }
    const agent = {
      id: 'ag_'+crypto.randomUUID(),
      avatar: t.avatar || '🤖',
      name: t.title,
      skills: t.skills || ['chat'],
      persona: t.persona || '',
      chrome_enabled: !!t.chrome_enabled,
      sheets_enabled: false,
      extension_enabled: false,
      model: 'gemini-flash',
      history: [],
      created_at: new Date().toISOString(),
      from_template: t.id,
    };
    if(t.schedule){
      const sched = {
        id: genScheduleId(),
        prompt: t.schedule.prompt,
        kind: t.schedule.kind,
        hour: t.schedule.hour ?? 9,
        minute: t.schedule.minute ?? 0,
        tz_offset_min: 540,  // JST default; user can edit in UI
        deliver: t.schedule.deliver || 'chat',
        enabled: true,
        label: t.schedule.label || t.title,
        created_at: new Date().toISOString(),
        last_run: null,
        next_run: null,
      };
      sched.next_run = _scheduleNextRun(sched);
      agent.schedules = [sched];
    }
    user.agents = [...(user.agents||[]), agent];
    await DB.save(user);
    // Hint about integrations the user should set up.
    const wAlreadySet = user.outgoing_webhooks || {};
    const integrationHints = (t.suggestedIntegrations||[]).map(kind => ({
      kind,
      configured: !!wAlreadySet[kind],
      setup_url: '/app.html#/settings/integrations',
    }));
    return jres(res,201,{
      agent: { id:agent.id, name:agent.name, avatar:agent.avatar, skills:agent.skills, from_template:t.id },
      schedule: agent.schedules ? agent.schedules[0] : null,
      integration_hints: integrationHints,
    });
  }

  if(pathname==='/api/agents'&&method==='POST'){
    const{avatar,name,skills,persona,chrome_enabled,sheets_enabled,extension_enabled,model}=await readBody(req);
    if(!name?.trim())return jres(res,400,{error:'名前は必須です'});
    if(!skills?.length)return jres(res,400,{error:'スキルを選んでください'});
    // Per-plan agent caps. Grandfathered users keep the legacy 1000-cap.
    const _gf = _isGrandfathered(user);
    const _planCap = _gf ? 1000
                   : user.plan==='free' ? 3
                   : user.plan==='pro'  ? 20
                   : 1000;
    const _ownedCount = (user.agents||[]).filter(a => !a.is_group).length;
    if(_ownedCount >= _planCap){
      const upgrade = user.plan==='free' ? 'Pro にアップグレード' : 'Business にアップグレード';
      return jres(res,402,{
        error: `Agents は最大 ${_planCap} 体までです (現在のプラン: ${user.plan||'free'})。${upgrade} すると上限が増えます。`,
        upgrade_required: user.plan==='free' ? 'pro' : 'business',
      });
    }
    if((user.agents||[]).length>=1000)return jres(res,400,{error:'エージェントは最大1000個です'});
    let _av = String(avatar||'🤖').trim();
    if(_av.startsWith('data:image/')){
      if(_av.length > 500*1024) return jres(res,400,{error:'アバター画像は 500KB 以下にしてください'});
    } else if(_av.length > 8){
      _av = '🤖';
    }
    const agent={id:'ag_'+crypto.randomUUID(),avatar:_av,
      name:name.trim(),skills,persona:persona?.trim()||'',
      chrome_enabled:!!chrome_enabled,
      sheets_enabled:!!sheets_enabled,
      extension_enabled:!!extension_enabled,
      model: ['haiku','sonnet','opus'].includes(model) ? model : 'sonnet',
      history:[],created_at:new Date().toISOString()};
    user.agents=[...(user.agents||[]),agent];
    await DB.save(user);return jres(res,201,{agent});
  }


  // ── PATCH /api/agents/:id ──────────────────────────────────
  const pam=pathname.match(/^\/api\/agents\/([^/]+)$/);
  if(pam&&method==='PATCH'){
    const agId=pam[1];
    const body=await readBody(req);
    const{name,persona,chrome_enabled,sheets_enabled,extension_enabled,github_enabled,mcp_server_ids,avatar,model,skills,ai_auto_respond,team_goal}=body;
    const ag=(user.agents||[]).find(a=>a.id===agId);
    if(!ag)return jres(res,404,{error:'エージェントが見つかりません'});
    if(name)ag.name=name.trim();
    if(persona!==undefined)ag.persona=persona;
    if(team_goal!==undefined && ag.is_team){
      ag.team_goal = String(team_goal||'').trim().slice(0, 1200);
    }
    if(chrome_enabled!==undefined)ag.chrome_enabled=!!chrome_enabled;
    if(sheets_enabled!==undefined)ag.sheets_enabled=!!sheets_enabled;
    if(extension_enabled!==undefined)ag.extension_enabled=!!extension_enabled;
    if(github_enabled!==undefined)ag.github_enabled=!!github_enabled;
    if(Array.isArray(mcp_server_ids)) ag.mcp_server_ids = mcp_server_ids.filter(x => typeof x === 'string').slice(0, 30);
    if(model!==undefined && ['auto','haiku','sonnet','opus','gemini-flash','gemini-pro'].includes(model)) ag.model=model;
    if(Array.isArray(skills)) ag.skills = skills.filter(s => typeof s === 'string').slice(0, 16);
    if(ai_auto_respond !== undefined){
      // Group-only setting; treat null as "unset" (use size heuristic).
      if(ai_auto_respond === null) delete ag.ai_auto_respond;
      else ag.ai_auto_respond = !!ai_auto_respond;
    }
    if(avatar!==undefined){
      // Accept either a single emoji/short string or a data:image/* base64 URI (≤500KB)
      const a = String(avatar||'').trim();
      if(a.startsWith('data:image/')){
        if(a.length > 500*1024) return jres(res,400,{error:'アバター画像は 500KB 以下にしてください'});
        ag.avatar = a;
      } else if(a.length <= 8){
        ag.avatar = a || '🤖';
      } else {
        return jres(res,400,{error:'アバターの形式が不正です'});
      }
    }
    // Bump updated_at so OG image cache busts and SNS unfurls re-fetch.
    ag.updated_at = new Date().toISOString();
    await DB.save(user);
    return jres(res,200,{agent:ag});
  }

  // ── Notes (free-form memo pages) ───────────────────────────
  // User-level notebook. Distinct from AI memories (user.memories /
  // agent.memories) — these are plain documents the user writes themselves.
  // Shape: user.notes = [{id, title, content, created_at, updated_at}]
  if(pathname === '/api/me/notes' && method === 'GET'){
    const notes = (user.notes || []).map(n => ({
      id: n.id,
      title: n.title || '',
      snippet: String(n.content||'').slice(0, 120).replace(/\n+/g, ' '),
      updated_at: n.updated_at || n.created_at,
    }));
    notes.sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at));
    return jres(res, 200, { notes });
  }
  if(pathname === '/api/me/notes' && method === 'POST'){
    const b = await readBody(req);
    user.notes = Array.isArray(user.notes) ? user.notes : [];
    if(user.notes.length >= 200) return jres(res, 400, { error: 'too many notes (max 200)' });
    const now = new Date().toISOString();
    const note = {
      id: 'note_' + crypto.randomBytes(5).toString('hex'),
      title: String((b && b.title) || '').slice(0, 200),
      content: String((b && b.content) || '').slice(0, 100000),
      created_at: now,
      updated_at: now,
    };
    user.notes.push(note);
    await DB.save(user);
    return jres(res, 200, { note });
  }
  const _noteM = pathname.match(/^\/api\/me\/notes\/([a-z0-9_]+)$/);
  if(_noteM){
    const id = _noteM[1];
    user.notes = Array.isArray(user.notes) ? user.notes : [];
    const idx = user.notes.findIndex(n => n && n.id === id);
    if(idx < 0) return jres(res, 404, { error: 'note not found' });
    if(method === 'GET') return jres(res, 200, { note: user.notes[idx] });
    if(method === 'DELETE'){
      user.notes.splice(idx, 1);
      await DB.save(user);
      return jres(res, 200, { ok: true });
    }
    if(method === 'PATCH'){
      const b = await readBody(req);
      if(typeof b.title === 'string')   user.notes[idx].title   = b.title.slice(0, 200);
      if(typeof b.content === 'string') user.notes[idx].content = b.content.slice(0, 100000);
      user.notes[idx].updated_at = new Date().toISOString();
      await DB.save(user);
      return jres(res, 200, { note: user.notes[idx] });
    }
  }

  // ── Agent-scoped notes (shared in Teams / Groups) ──────────
  // Per-chat notebook. Lives on the agent record (ag.notes), so:
  //   ・ DM (solo agent): private to the owner — only that user can read/edit
  //   ・ Team (is_team): all collaborators with chat access see the same notes
  //   ・ Group (is_group with host_id): host + joined members share the notes
  // For joined groups the agent record lives on the host's user; we resolve
  // via group_memberships and save back to the host so edits propagate.
  // Shape: ag.notes = [{id, title, content, created_at, updated_at, author_id}]
  const _agNoteListM = pathname.match(/^\/api\/agents\/([^/]+)\/notes$/);
  if(_agNoteListM){
    const agId = _agNoteListM[1];
    // Resolve agent — owner first, then joined groups
    let ag = (user.agents||[]).find(a => a.id === agId);
    let ownerUser = user;
    if(!ag){
      const m = (user.group_memberships||[]).find(g => g.agent_id === agId);
      if(!m) return jres(res,404,{error:'agent not found'});
      const hostUser = await DB.findBy('id', m.host_id);
      if(!hostUser) return jres(res,404,{error:'host not found'});
      ag = (hostUser.agents||[]).find(a => a.id === agId);
      if(!ag) return jres(res,404,{error:'agent not found'});
      ownerUser = hostUser;
    }
    ag.notes = Array.isArray(ag.notes) ? ag.notes : [];
    if(method === 'GET'){
      const notes = ag.notes.map(n => ({
        id: n.id,
        title: n.title || '',
        snippet: String(n.content||'').slice(0, 120).replace(/\n+/g, ' '),
        updated_at: n.updated_at || n.created_at,
        author_id: n.author_id || null,
      }));
      notes.sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at));
      return jres(res, 200, {
        notes,
        shared: !!(ag.is_team || ag.is_group),
        is_team: !!ag.is_team,
        is_group: !!ag.is_group,
      });
    }
    if(method === 'POST'){
      if(ag.notes.length >= 200) return jres(res,400,{error:'too many notes (max 200)'});
      const b = await readBody(req);
      const now = new Date().toISOString();
      const note = {
        id: 'note_' + crypto.randomBytes(5).toString('hex'),
        title: String((b && b.title) || '').slice(0, 200),
        content: String((b && b.content) || '').slice(0, 100000),
        created_at: now,
        updated_at: now,
        author_id: user.id,
      };
      ag.notes.push(note);
      await DB.save(ownerUser);
      return jres(res, 200, { note });
    }
  }
  const _agNoteOneM = pathname.match(/^\/api\/agents\/([^/]+)\/notes\/([a-z0-9_]+)$/);
  if(_agNoteOneM){
    const agId = _agNoteOneM[1];
    const noteId = _agNoteOneM[2];
    let ag = (user.agents||[]).find(a => a.id === agId);
    let ownerUser = user;
    if(!ag){
      const m = (user.group_memberships||[]).find(g => g.agent_id === agId);
      if(!m) return jres(res,404,{error:'agent not found'});
      const hostUser = await DB.findBy('id', m.host_id);
      if(!hostUser) return jres(res,404,{error:'host not found'});
      ag = (hostUser.agents||[]).find(a => a.id === agId);
      if(!ag) return jres(res,404,{error:'agent not found'});
      ownerUser = hostUser;
    }
    ag.notes = Array.isArray(ag.notes) ? ag.notes : [];
    const idx = ag.notes.findIndex(n => n && n.id === noteId);
    if(idx < 0) return jres(res, 404, { error: 'note not found' });
    if(method === 'GET') return jres(res, 200, { note: ag.notes[idx] });
    if(method === 'DELETE'){
      ag.notes.splice(idx, 1);
      await DB.save(ownerUser);
      return jres(res, 200, { ok: true });
    }
    if(method === 'PATCH'){
      const b = await readBody(req);
      if(typeof b.title === 'string')   ag.notes[idx].title   = b.title.slice(0, 200);
      if(typeof b.content === 'string') ag.notes[idx].content = b.content.slice(0, 100000);
      ag.notes[idx].updated_at = new Date().toISOString();
      ag.notes[idx].last_editor_id = user.id;
      await DB.save(ownerUser);
      return jres(res, 200, { note: ag.notes[idx] });
    }
  }

  // ── MCP server management ──────────────────────────────────
  // GET     /api/me/mcp-servers              → list user's servers (sans auth)
  // POST    /api/me/mcp-servers              → register {name, url, auth?}
  // DELETE  /api/me/mcp-servers/:id          → remove
  // POST    /api/me/mcp-servers/:id/refresh  → invalidate tools cache + re-fetch
  // POST    /api/me/mcp-servers/:id/toggle   → flip enabled flag
  if(pathname === '/api/me/mcp-servers' && method === 'GET'){
    const servers = (user.mcp_servers || []).map(s => ({
      id: s.id, name: s.name, url: s.url, enabled: s.enabled !== false,
      added_at: s.added_at,
      tools_count: (_mcpToolsCache.get(s.id) || {}).tools ? _mcpToolsCache.get(s.id).tools.length : null,
      last_error: (_mcpToolsCache.get(s.id) || {}).error || null,
    }));
    return jres(res, 200, { servers });
  }
  if(pathname === '/api/me/mcp-servers' && method === 'POST'){
    const b = await readBody(req);
    const name = String((b && b.name) || '').trim().slice(0, 60);
    const url = String((b && b.url) || '').trim();
    const auth = (b && b.auth) ? String(b.auth).slice(0, 500) : '';
    if(!name) return jres(res, 400, { error: 'name required' });
    if(!/^https?:\/\//.test(url)) return jres(res, 400, { error: 'url must be http(s)://' });
    user.mcp_servers = Array.isArray(user.mcp_servers) ? user.mcp_servers : [];
    if(user.mcp_servers.length >= 20) return jres(res, 400, { error: 'too many MCP servers (max 20)' });
    const serverId = 'srv_' + crypto.randomBytes(4).toString('hex');
    const entry = {
      id: serverId, name, url,
      auth: auth || undefined,
      enabled: true,
      added_at: new Date().toISOString(),
    };
    user.mcp_servers.push(entry);
    await DB.save(user);
    // Eagerly probe so the user sees tool count immediately + we surface
    // connection errors instead of silent fail.
    let tools = [];
    try { tools = await _mcpListTools(entry, { force: true }); } catch(e){}
    return jres(res, 200, {
      server: { id: entry.id, name: entry.name, url: entry.url, enabled: true, added_at: entry.added_at },
      tools_count: tools.length,
      tools: tools.slice(0, 50).map(t => ({ name: t.name, description: (t.description||'').slice(0, 200) })),
      error: (_mcpToolsCache.get(serverId) || {}).error || null,
    });
  }
  const _mcpM = pathname.match(/^\/api\/me\/mcp-servers\/([^/]+)(?:\/(refresh|toggle))?$/);
  if(_mcpM){
    const serverId = _mcpM[1];
    const action = _mcpM[2];
    user.mcp_servers = Array.isArray(user.mcp_servers) ? user.mcp_servers : [];
    const idx = user.mcp_servers.findIndex(s => s && s.id === serverId);
    if(idx < 0) return jres(res, 404, { error: 'mcp server not found' });
    if(method === 'DELETE'){
      user.mcp_servers.splice(idx, 1);
      _mcpToolsCache.delete(serverId);
      await DB.save(user);
      return jres(res, 200, { ok: true });
    }
    if(method === 'POST' && action === 'refresh'){
      _mcpToolsCache.delete(serverId);
      let tools = [];
      try { tools = await _mcpListTools(user.mcp_servers[idx], { force: true }); } catch(e){}
      return jres(res, 200, {
        tools_count: tools.length,
        error: (_mcpToolsCache.get(serverId) || {}).error || null,
      });
    }
    if(method === 'POST' && action === 'toggle'){
      user.mcp_servers[idx].enabled = user.mcp_servers[idx].enabled === false;
      await DB.save(user);
      return jres(res, 200, { enabled: user.mcp_servers[idx].enabled });
    }
  }

  // ── /api/me/integrations/catalog ───────────────────────────
  // Unified integrations catalog (50 services). Returns each service's
  // definition along with the caller's per-service connection status, so
  // the UI can render cards + Connect/Manage buttons in a single round-trip.
  if(pathname === '/api/me/integrations/catalog' && method === 'GET'){
    const list = _integrationsCatalog().map(s => {
      const st = _getIntegrationStatus(user, s.id);
      return {
        id: s.id, name: s.name, logo: s.logo, group: s.group, desc: s.desc,
        flow: s.flow, fields: s.fields || null, oauth: s.oauth || null,
        priority: !!s.priority,
        status: st,
      };
    });
    const groups = {};
    list.forEach(s => { (groups[s.group] = groups[s.group] || []).push(s); });
    const connected = list.filter(s => s.status && s.status.connected).length;
    return jres(res, 200, {
      total: list.length,
      connected,
      services: list,
      groups,
    });
  }

  // PUT  /api/me/integrations/:id    → save credentials for a service
  // DELETE /api/me/integrations/:id  → remove credentials
  // The "form" flow accepts service-specific fields. OAuth services that
  // haven't been registered yet (no env var Client ID) return 503 so the UI
  // can show a "setup-pending" message.
  const _intGeneric = pathname.match(/^\/api\/me\/integrations\/([a-z0-9_-]+)$/);
  if(_intGeneric && (method === 'PUT' || method === 'DELETE') && _intGeneric[1] !== 'github'){
    const intId = _intGeneric[1];
    const service = _integrationsCatalog().find(s => s.id === intId);
    if(!service) return jres(res, 404, { error: 'unknown integration: ' + intId });
    user.integrations = user.integrations || {};
    if(method === 'DELETE'){
      delete user.integrations[intId];
      // Legacy fields cleanup
      if(intId === 'slack' && user.outgoing_webhooks) delete user.outgoing_webhooks.slack;
      if(intId === 'discord' && user.outgoing_webhooks) delete user.outgoing_webhooks.discord;
      await DB.save(user);
      return jres(res, 200, { ok: true, connected: false });
    }
    // PUT — validate per flow type
    const body = (await readBody(req)) || {};
    if(service.flow === 'oauth' && !service.has_backend){
      return jres(res, 503, {
        error: 'OAuth セットアップ準備中',
        message: 'このサービスは OAuth App の開発者登録が必要です。docs/oauth-setup.md を参照してください。',
        service: service.name,
      });
    }
    if(service.flow === 'form' || service.flow === 'webhook'){
      const out = {};
      for(const f of (service.fields || [])){
        const v = String((body[f.key]||'')).trim();
        if(f.required !== false && !v) return jres(res, 400, { error: `${f.label} は必須です` });
        if(f.pattern && v && !new RegExp(f.pattern).test(v)){
          return jres(res, 400, { error: `${f.label} の形式が不正です` });
        }
        if(v) out[f.key] = v;
      }
      // Legacy parallel-write for slack / discord webhooks so the existing
      // notify_slack / notify_discord tools keep working without changes.
      if(intId === 'slack' && out.webhookUrl){
        user.outgoing_webhooks = user.outgoing_webhooks || {};
        user.outgoing_webhooks.slack = out.webhookUrl;
      }
      if(intId === 'discord' && out.webhookUrl){
        user.outgoing_webhooks = user.outgoing_webhooks || {};
        user.outgoing_webhooks.discord = out.webhookUrl;
      }
      user.integrations[intId] = {
        ...out,
        connected_at: new Date().toISOString(),
        flow: service.flow,
      };
      await DB.save(user);
      return jres(res, 200, { ok: true, connected: true, integration: { id: intId, flow: service.flow } });
    }
    return jres(res, 400, { error: 'unsupported flow: ' + service.flow });
  }

  // ── PUT / DELETE /api/me/integrations/github  ──────────────
  // Stores the user's GitHub PAT (read-only scope is enough for MVP).
  // PAT lives on user.github_pat as a top-level field for simplicity.
  // The token is never returned to the client (only a boolean "connected").
  if(pathname === '/api/me/integrations/github' && method === 'PUT'){
    const b = await readBody(req);
    const pat = String((b && b.pat) || '').trim();
    if(!/^gh[pous]_[A-Za-z0-9_]{20,}$/i.test(pat) && !/^github_pat_[A-Za-z0-9_]{50,}$/i.test(pat)){
      return jres(res, 400, { error: 'invalid PAT format (expected ghp_… / github_pat_…)' });
    }
    user.github_pat = pat;
    await DB.save(user);
    // Probe /user to confirm the token is valid + return the GitHub username
    let login = '';
    try {
      const probe = await new Promise((resolve)=>{
        const req2 = https.request({
          hostname:'api.github.com', path:'/user', method:'GET',
          headers:{ Authorization:'Bearer '+pat, 'Accept':'application/vnd.github+json', 'User-Agent':'MY-AI-Agent' },
        }, (r)=>{
          let buf=''; r.on('data', c => buf+=c);
          r.on('end', ()=>{ try{ resolve({status:r.statusCode, data:JSON.parse(buf||'null')}); }catch(e){ resolve({status:r.statusCode, data:null}); } });
        });
        req2.on('error', e => resolve({status:0, error:e.message}));
        req2.end();
      });
      if(probe.status === 200 && probe.data && probe.data.login){
        login = probe.data.login;
      } else if(probe.status === 401){
        return jres(res, 401, { error: 'GitHub に拒否されました — トークンが無効か期限切れです' });
      }
    } catch(e){}
    return jres(res, 200, { ok: true, connected: true, login });
  }
  if(pathname === '/api/me/integrations/github' && method === 'DELETE'){
    delete user.github_pat;
    if(user.integrations && user.integrations.github) delete user.integrations.github;
    await DB.save(user);
    return jres(res, 200, { ok: true, connected: false });
  }

  // ── DELETE /api/agents/:id/messages/:idx ───────────────────
  // Slack/LINE-style: let the user remove an unwanted message from a chat.
  // For DMs: any message in their own agent's history.
  // For groups: only your own messages, or any message if you're the host.
  // (Server-side guard mirrors the UI's hover-only delete button.)
  const _delMsgM = pathname.match(/^\/api\/agents\/([^/]+)\/messages\/(\d+)$/);
  if(_delMsgM && method === 'DELETE'){
    const agId = _delMsgM[1];
    const idx  = parseInt(_delMsgM[2], 10);
    // v1: only agents in the user's own list (covers DMs + hosted groups).
    // Joined-group message deletion is out of scope until we add host-lookup.
    const ag = (user.agents||[]).find(a => a.id === agId);
    if(!ag) return jres(res,404,{error:'agent not found'});
    if(!Array.isArray(ag.history) || idx < 0 || idx >= ag.history.length){
      return jres(res,400,{error:'invalid index'});
    }
    const target = ag.history[idx];
    if(!target) return jres(res,404,{error:'message not found'});
    // Group permission: only sender or host can delete (host = the agent's owner = user here).
    if(ag.is_group){
      const isSender = target.user_id === user.id;
      // The agent lives in user.agents, so user is the host.
      const isHost = true;
      if(!isHost && !isSender){
        return jres(res,403,{error:'permission denied'});
      }
    }
    ag.history.splice(idx, 1);
    await DB.save(user);
    return jres(res, 200, { ok:true, idx });
  }

  // ── POST /api/agents/:id/stickers/generate ─────────────────
  // Pick 6 emoji that fit this agent's persona / skills. Cheap (Gemini Flash
  // single call ~$0.0003) but gives the agent a recognizable "sticker pack".
  const _stkM = pathname.match(/^\/api\/agents\/([^/]+)\/stickers\/generate$/);
  if(_stkM && method === 'POST'){
    const ag = (user.agents||[]).find(a => a.id === _stkM[1]);
    if(!ag) return jres(res,404,{error:'agent not found'});
    const prompt = `エージェント "${ag.name||'AI'}" のスキル: ${(ag.skills||[]).join(', ')||'(none)'}\nペルソナ: ${(ag.persona||'').slice(0,400)}\n\nこのエージェントの性格・専門が伝わる絵文字を 6 個選んで JSON 配列で返してください。Slack の "リアクション" 的に、チャットでサクッと押せるもの。\n出力例: ["🎨","🖌","✨","💅","📐","🌈"]\n\n注意: JSON 配列のみ。説明・前置き・コードブロックは禁止。重複なし、明らかに同義なものは選ばない。`;
    let raw = '';
    try {
      const info = _resolveModelInfo(GEMINI_KEY ? 'gemini-flash' : 'haiku');
      if(info.provider === 'gemini'){
        const r = await _callGemini([{role:'user', content: prompt}], '', info);
        raw = (r?.content?.[0]?.text || '').trim();
      } else if(ANTHROPIC){
        const r = await httpsReq('POST','api.anthropic.com','/v1/messages',
          {'Content-Type':'application/json','x-api-key':ANTHROPIC,'anthropic-version':'2023-06-01'},
          { model: info.modelId, max_tokens: 200, messages:[{role:'user', content: prompt}] },
          { timeout: 20000 });
        if(r.s===200) raw = (r.d.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('').trim();
      }
    } catch(e){ console.warn('[stickers] generate failed:', e.message); }
    raw = (raw||'').replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'').trim();
    let stickers;
    try { stickers = JSON.parse(raw); } catch(e){ stickers = null; }
    if(!Array.isArray(stickers) || stickers.length < 3){
      // Fallback emoji set based on first skill.
      const fb = {
        writing:['✍','📝','💡','📖','✨','📚'],
        research:['🔬','📊','🔍','📈','🧪','💭'],
        coding:['💻','🛠','⚡','🐛','🚀','⚙'],
        marketing:['📣','📈','🎯','🔥','💌','🚀'],
        planning:['📋','📅','🗂','✅','🧭','📌'],
        analysis:['📊','📈','🔍','🧮','💹','🎯'],
        translate:['🌐','🈯','🔄','📜','🗣','✅'],
        support:['💬','🙏','✅','💖','🎀','✨'],
        idea:['💡','✨','🌟','🚀','🎨','🧠'],
        teaching:['📚','🎓','✏','📐','💡','✅'],
        ceo:['🎩','📊','🚀','💼','💎','🔥'],
        coo:['⚙','📈','🗂','✅','📋','🤝'],
        secretary:['📅','📞','✉','📋','🗂','🌸'],
        designer:['🎨','🖌','💅','✨','📐','🌈'],
        sns:['📱','💬','🔥','✨','📸','🎯'],
      };
      const sk = (ag.skills||[])[0];
      stickers = fb[sk] || ['👍','❤','🔥','✨','🚀','💡'];
    }
    stickers = stickers.filter(s => typeof s === 'string' && s.length <= 8).slice(0, 6);
    ag.stickers = stickers;
    ag.stickers_updated_at = new Date().toISOString();
    await DB.save(user);
    return jres(res, 200, { stickers });
  }

  // ── AGENT INTELLIGENCE CRUD ────────────────────────────────
  // GET  /api/agents/:id/profile           → memories + kpis + playbook + open_tasks + routines
  // POST /api/agents/:id/memories          → add { text, pinned? }
  // PATCH /api/agents/:id/memories/:mid    → update { text?, pinned? }
  // DELETE /api/agents/:id/memories/:mid   → remove
  // POST /api/agents/:id/kpis              → add { name, target, current?, unit? }
  // PATCH /api/agents/:id/kpis/:kid        → update { current?, target?, name?, unit? }
  // DELETE /api/agents/:id/kpis/:kid       → remove
  // DELETE /api/agents/:id/playbook/:pid   → remove
  // PATCH /api/agents/:id/tasks/:tid       → update { title?, status?, progress_pct?, notes? }
  // DELETE /api/agents/:id/tasks/:tid      → remove
  const _profM = pathname.match(/^\/api\/agents\/([^/]+)\/profile$/);
  if(_profM && method === 'GET'){
    const ag = (user.agents||[]).find(a => a.id === _profM[1]);
    if(!ag) return jres(res,404,{error:'agent not found'});
    return jres(res, 200, {
      memories: ag.memories || [],
      kpis: ag.kpis || [],
      playbook: ag.playbook || [],
      open_tasks: ag.open_tasks || [],
      // Schedules are stored on user.schedules; filter to this agent.
      routines: (Array.isArray(user.schedules) ? user.schedules : []).filter(s => s && s.agent_id === _profM[1]),
    });
  }
  const _memCreate = pathname.match(/^\/api\/agents\/([^/]+)\/memories$/);
  if(_memCreate && method === 'POST'){
    const ag = (user.agents||[]).find(a => a.id === _memCreate[1]);
    if(!ag) return jres(res,404,{error:'agent not found'});
    const body = await readBody(req);
    const text = String(body && body.text || '').trim().slice(0, 240);
    if(text.length < 4) return jres(res,400,{error:'text too short'});
    ag.memories = Array.isArray(ag.memories) ? ag.memories : [];
    const entry = {
      id: 'mem_'+crypto.randomBytes(4).toString('hex'),
      text,
      source: 'manual',
      pinned: !!(body && body.pinned),
      created_at: new Date().toISOString(),
    };
    // Embed the new memory so vector retrieval picks it up. Failure is silent.
    if(OPENAI_KEY){
      try {
        const embs = await _openaiEmbeddings([text]);
        if(Array.isArray(embs) && embs[0]) entry.embedding = embs[0];
      } catch(e){}
    }
    ag.memories.push(entry);
    if(ag.memories.length > 200) ag.memories = ag.memories.slice(-200);
    await DB.save(user);
    return jres(res, 200, { memory: entry });
  }
  const _memUpd = pathname.match(/^\/api\/agents\/([^/]+)\/memories\/([^/]+)$/);
  if(_memUpd && (method === 'PATCH' || method === 'DELETE')){
    const ag = (user.agents||[]).find(a => a.id === _memUpd[1]);
    if(!ag) return jres(res,404,{error:'agent not found'});
    ag.memories = Array.isArray(ag.memories) ? ag.memories : [];
    const idx = ag.memories.findIndex(m => m && m.id === _memUpd[2]);
    if(idx < 0) return jres(res,404,{error:'memory not found'});
    if(method === 'DELETE'){
      ag.memories.splice(idx, 1);
    } else {
      const body = await readBody(req);
      if(typeof body.text === 'string') ag.memories[idx].text = body.text.trim().slice(0, 240);
      if(body.pinned !== undefined) ag.memories[idx].pinned = !!body.pinned;
      ag.memories[idx].updated_at = new Date().toISOString();
    }
    await DB.save(user);
    return jres(res, 200, { ok: true });
  }
  const _kpiCreate = pathname.match(/^\/api\/agents\/([^/]+)\/kpis$/);
  if(_kpiCreate && method === 'POST'){
    const ag = (user.agents||[]).find(a => a.id === _kpiCreate[1]);
    if(!ag) return jres(res,404,{error:'agent not found'});
    const body = await readBody(req);
    const name = String(body && body.name || '').trim().slice(0, 60);
    if(!name) return jres(res,400,{error:'name required'});
    const target = body.target != null ? parseFloat(body.target) : null;
    const current = body.current != null ? parseFloat(body.current) : 0;
    const unit = String(body && body.unit || '').slice(0, 16);
    ag.kpis = Array.isArray(ag.kpis) ? ag.kpis : [];
    if(ag.kpis.length >= 10) return jres(res,400,{error:'too many KPIs (max 10)'});
    const entry = {
      id: 'kpi_'+crypto.randomBytes(4).toString('hex'),
      name, target, current, unit,
      history: [{ at: new Date().toISOString(), value: current }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    ag.kpis.push(entry);
    await DB.save(user);
    return jres(res, 200, { kpi: entry });
  }
  const _kpiUpd = pathname.match(/^\/api\/agents\/([^/]+)\/kpis\/([^/]+)$/);
  if(_kpiUpd && (method === 'PATCH' || method === 'DELETE')){
    const ag = (user.agents||[]).find(a => a.id === _kpiUpd[1]);
    if(!ag) return jres(res,404,{error:'agent not found'});
    ag.kpis = Array.isArray(ag.kpis) ? ag.kpis : [];
    const idx = ag.kpis.findIndex(k => k && k.id === _kpiUpd[2]);
    if(idx < 0) return jres(res,404,{error:'kpi not found'});
    if(method === 'DELETE'){
      ag.kpis.splice(idx, 1);
    } else {
      const body = await readBody(req);
      const k = ag.kpis[idx];
      if(body.name !== undefined)   k.name   = String(body.name||'').trim().slice(0, 60);
      if(body.target !== undefined) k.target = parseFloat(body.target);
      if(body.unit !== undefined)   k.unit   = String(body.unit||'').slice(0, 16);
      if(body.current !== undefined){
        const v = parseFloat(body.current);
        if(isFinite(v)){
          k.current = v;
          k.history = Array.isArray(k.history) ? k.history : [];
          k.history.push({ at: new Date().toISOString(), value: v });
          if(k.history.length > 200) k.history = k.history.slice(-200);
        }
      }
      k.updated_at = new Date().toISOString();
    }
    await DB.save(user);
    return jres(res, 200, { ok: true });
  }
  const _pbDel = pathname.match(/^\/api\/agents\/([^/]+)\/playbook\/([^/]+)$/);
  if(_pbDel && method === 'DELETE'){
    const ag = (user.agents||[]).find(a => a.id === _pbDel[1]);
    if(!ag) return jres(res,404,{error:'agent not found'});
    ag.playbook = Array.isArray(ag.playbook) ? ag.playbook : [];
    const idx = ag.playbook.findIndex(p => p && p.id === _pbDel[2]);
    if(idx < 0) return jres(res,404,{error:'playbook entry not found'});
    ag.playbook.splice(idx, 1);
    await DB.save(user);
    return jres(res, 200, { ok: true });
  }
  const _taskUpd = pathname.match(/^\/api\/agents\/([^/]+)\/tasks\/([^/]+)$/);
  if(_taskUpd && (method === 'PATCH' || method === 'DELETE')){
    const ag = (user.agents||[]).find(a => a.id === _taskUpd[1]);
    if(!ag) return jres(res,404,{error:'agent not found'});
    ag.open_tasks = Array.isArray(ag.open_tasks) ? ag.open_tasks : [];
    const idx = ag.open_tasks.findIndex(t => t && t.id === _taskUpd[2]);
    if(idx < 0) return jres(res,404,{error:'task not found'});
    if(method === 'DELETE'){
      ag.open_tasks.splice(idx, 1);
    } else {
      const body = await readBody(req);
      const t = ag.open_tasks[idx];
      if(body.title !== undefined)        t.title        = String(body.title||'').trim().slice(0, 100);
      if(body.status !== undefined && ['started','progress','done'].includes(body.status)) t.status = body.status;
      if(body.progress_pct !== undefined) t.progress_pct = Math.max(0, Math.min(100, parseInt(body.progress_pct, 10) || 0));
      if(body.notes !== undefined)        t.notes        = String(body.notes||'').slice(0, 200);
      t.last_touched_at = new Date().toISOString();
    }
    await DB.save(user);
    return jres(res, 200, { ok: true });
  }
  const _taskCreate = pathname.match(/^\/api\/agents\/([^/]+)\/tasks$/);
  if(_taskCreate && method === 'POST'){
    const ag = (user.agents||[]).find(a => a.id === _taskCreate[1]);
    if(!ag) return jres(res,404,{error:'agent not found'});
    const body = await readBody(req);
    const title = String(body && body.title || '').trim().slice(0, 100);
    if(!title) return jres(res,400,{error:'title required'});
    ag.open_tasks = Array.isArray(ag.open_tasks) ? ag.open_tasks : [];
    if(ag.open_tasks.length >= 50) return jres(res,400,{error:'too many tasks'});
    const entry = {
      id: 'tsk_'+crypto.randomBytes(4).toString('hex'),
      title,
      status: 'progress',
      progress_pct: 0,
      notes: String(body && body.notes || '').slice(0, 200),
      started_at: new Date().toISOString(),
      last_touched_at: new Date().toISOString(),
    };
    ag.open_tasks.push(entry);
    await DB.save(user);
    return jres(res, 200, { task: entry });
  }

  // ── POST /api/agents/:id/nudges/:nudgeId/:action ───────────
  // action = "dismiss" | "act" — dismiss hides the card, act marks it as
  // sent so we don't re-show it after the user clicks "話を聞く".
  const _nm = pathname.match(/^\/api\/agents\/([^/]+)\/nudges\/([^/]+)\/(dismiss|act)$/);
  if(_nm && method === 'POST'){
    const agId = _nm[1], nudgeId = _nm[2], action = _nm[3];
    const ag = (user.agents||[]).find(a => a.id === agId);
    if(!ag) return jres(res,404,{error:'agent not found'});
    const nudges = Array.isArray(ag.proactive_nudges) ? ag.proactive_nudges : [];
    const n = nudges.find(x => x && x.id === nudgeId);
    if(!n) return jres(res,404,{error:'nudge not found'});
    if(action === 'dismiss') n.dismissed = true;
    else                     n.acted     = true;
    await DB.save(user);
    return jres(res,200,{ok:true});
  }

  // ── GET /api/agents/:id/history_archive ────────────────────
  // Returns the folded (archived) chat history for the "全履歴を見る" UI.
  // Sliced to a sane max so a very long-lived agent doesn't blow up the wire.
  const _ham = pathname.match(/^\/api\/agents\/([^/]+)\/history_archive$/);
  if(_ham && method==='GET'){
    const agId = _ham[1];
    const ag = (user.agents||[]).find(a => a.id === agId);
    if(!ag) return jres(res,404,{error:'agent not found'});
    const arch = Array.isArray(ag.history_archive) ? ag.history_archive : [];
    return jres(res, 200, {
      count: arch.length,
      items: arch.slice(-500),
      summary: (ag.history||[]).find(m => m && m._summary) || null,
    });
  }

  // ── POST /api/teams/activate ──────────────────────────────
  // body: {template_id}  — clones every member of the template into the
  // user's account, then creates a single group containing all of them.
  // The user can @-mention members in chat. Phase 2 will add workflow
  // execution; for now this is a curated multi-agent group.
  if(pathname==='/api/teams/activate' && method==='POST'){
    // Plan gate
    const _gate = _planTeamGate(user);
    if(_gate) return jres(res, 402, _gate);
    const body = await readBody(req);
    const lang = (body.lang === 'ja') ? 'ja' : 'en';
    const tpl = _findTeamTemplate(String(body.template_id||''));
    if(!tpl) return jres(res,404,{error:'テンプレートが見つかりません'});

    // Free templates only on Phase 1. Paid teams will require purchase
    // through the marketplace (price_jpy > 0 → reject for now with hint).
    if(tpl.price_jpy > 0){
      return jres(res,402,{error:'有料テンプレートは Marketplace から購入してください', price_jpy: tpl.price_jpy});
    }

    // Cap total agents at 20 (existing limit). If the template would push
    // the user over, refuse early so we don't half-create.
    const owned = (user.agents||[]).length;
    if(owned + tpl.agents.length > 1000){
      return jres(res,400,{error:`エージェントは最大 1000 個までです (現在 ${owned} / 追加 ${tpl.agents.length})`});
    }

    // Clone agents
    const now = new Date().toISOString();
    const groupId = 'ag_'+crypto.randomUUID();
    const cloned = tpl.agents.map((a) => ({
      id: 'ag_'+crypto.randomUUID(),
      avatar: a.avatar || '🤖',
      name: a.name,
      skills: Array.isArray(a.skills) ? a.skills : ['writing'],
      persona: a.persona || '',
      chrome_enabled: false,
      sheets_enabled: false,
      extension_enabled: false,
      model: 'gemini-flash',
      history: [],
      created_at: now,
      // team_origin marks an agent as belonging to a team — DM list filters
      // these out so they only appear inside the team workspace.
      team_origin: { team_id: groupId, template_id: tpl.id, template_name: tpl.name },
    }));

    // Create the group agent that hosts all of them. Reuse existing group
    // primitives so chat / mentions / settings just work.
    const group = {
      id: groupId,
      avatar: tpl.cover_emoji || '🎯',
      name: tpl.name,
      skills: ['planning'],
      persona: '',
      is_group: true,
      is_team: true,                       // distinguishes Team groups from human groups
      team_template_id: tpl.id,
      lang: lang,
      host_id: user.id,
      members: [
        // Host is always member (humans + AIs share the members array; the
        // existing chat handler picks AIs by their agent records). For
        // simplicity, keep humans only in this list and reference cloned
        // agents via team_member_agent_ids.
        { user_id: user.id, name: user.name||'You', email: user.email||'', joined_at: now, role: 'host', notify_pref: 'all' },
      ],
      team_member_agent_ids: cloned.map(a => a.id),
      ai_auto_respond: false,              // require @mention so the user picks which agent to invoke
      created_at: now,
      updated_at: now,
      history: [
        // Welcome system message
        { role:'system', content: lang === 'ja'
          ? `🎉 ${tpl.name} が起動しました。@${cloned[0].name.replace(/\s+/g,'')} のように特定エージェントを呼び出せます。`
          : `🎉 ${tpl.name} is up and running. Call a specific agent with @${cloned[0].name.replace(/\s+/g,'')}.`,
          time: new Date().toLocaleTimeString(lang==='ja'?'ja-JP':'en-US', {hour:'2-digit',minute:'2-digit'}) },
      ],
    };

    user.agents = [...(user.agents||[]), ...cloned, group];
    try {
      await DB.save(user);
    } catch(e) {
      console.error('[teams/activate] DB.save failed for user='+user.id+' tpl='+tpl.id+' err='+(e.message||e));
      return jres(res, 500, { error: 'チームの保存に失敗しました: ' + (e.message || 'unknown') });
    }
    console.log('[teams/activate] user='+user.id+' tpl='+tpl.id+' cloned='+cloned.length+' group='+groupId);

    return jres(res, 201, {
      ok: true,
      template_id: tpl.id,
      group_id: groupId,
      cloned_agent_ids: cloned.map(a => a.id),
      cloned_count: cloned.length,
    });
  }

  // ── POST /api/teams/generate ─────────────────────────────
  // body: {goal: string}
  // Calls Claude to design 3-6 agents that match the user's goal, then
  // creates them and a containing team. Returns the new group_id.
  if(pathname==='/api/teams/generate' && method==='POST'){
    const _gate = _planTeamGate(user);
    if(_gate) return jres(res, 402, _gate);
    const body = await readBody(req);
    const goal = String(body.goal||'').trim().slice(0, 1200);
    const lang = (body.lang === 'ja') ? 'ja' : 'en';   // EN by default — flipped from before
    if(goal.length < 6) return jres(res,400,{error: lang==='ja' ? '目的をもう少し詳しく書いてください' : 'Please describe your goal in a bit more detail'});
    if(!ANTHROPIC) return jres(res,500,{error: lang==='ja' ? 'AI が設定されていません' : 'AI is not configured'});
    if((user.agents||[]).length >= 994) return jres(res,400,{error: lang==='ja' ? 'エージェントは最大 1000 個までです' : 'Up to 1000 agents'});

    // Valid skill IDs (mirrors public/app.html SKILLS list).
    const VALID_SKILLS = ['writing','research','coding','marketing','planning','analysis','translate','support','idea','teaching','ceo','coo','secretary','designer','sns','other'];

    // Output language is driven by the user's app preference (?lang / saved
    // setting), not by the goal language. Without this, English-default users
    // were getting Japanese personas because the prompt hard-coded JA.
    const personaLang = lang === 'ja' ? 'in Japanese' : 'in English';
    const titleHint   = lang === 'ja' ? 'short name, 2-6 words, JA preferred' : 'short name, 2-6 words, in English';
    const personaSchema = lang === 'ja'
      ? '"persona":"採用目的: <why we hired this agent, JA>\\n業務内容: <what they do day-to-day, JA, concrete>"'
      : '"persona":"Hired for: <why we hired this agent>\\nDay-to-day: <what they do day-to-day, concrete>"';
    const sys = 'You are a senior product strategist who designs small AI-agent teams. '
      + 'Given a user goal, output a JSON object describing a focused team of 4-10 agents that, working together, can accomplish the goal. '
      + 'Pick the smallest team that genuinely covers the goal — pad to ~6 for broad goals, scale up to 10 only for end-to-end ones. '
      + 'Output ONLY valid JSON — no prose, no code fences. Schema: '
      + '{"team_name":"<' + titleHint + '>", "cover_emoji":"<single emoji>", "description":"<one-sentence summary, ' + personaLang + '>", '
      + '"agents":[{"avatar":"<single emoji>","name":"<short role name, 2-4 words, ' + personaLang + '>","skills":["<from the allowed set>"...],' + personaSchema + '}]}. '
      + 'Allowed skill IDs only: ' + VALID_SKILLS.join(', ') + '. '
      + 'Each agent: 1-3 skills max. ALL human-readable text (team_name, name, persona, description) MUST be ' + personaLang + '. '
      + 'Personas should be specific to the goal (mention concrete tools/steps where relevant). '
      + 'No duplicate roles. Pick agents that hand off naturally to each other.';
    const userMsg = lang === 'ja'
      ? `目的:\n${goal}\n\nこの目的に最適なチームを JSON で設計してください。`
      : `Goal:\n${goal}\n\nDesign the best team for this goal as JSON.`;
    let aiData;
    try {
      aiData = await callAI([{role:'user', content: userMsg}], sys, 'sonnet');
    } catch(e){
      console.error('[teams/generate] Anthropic failed:', e.message);
      return jres(res,500,{error:'AI 設計に失敗しました: ' + (e.message||'unknown')});
    }
    // Extract first text block
    let raw = '';
    if(Array.isArray(aiData?.content)){
      for(const blk of aiData.content){ if(blk.type==='text' && blk.text){ raw += blk.text; } }
    }
    raw = raw.trim();
    // Strip code fences if model added them
    raw = raw.replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'').trim();
    let spec;
    try { spec = JSON.parse(raw); }
    catch(e){
      console.error('[teams/generate] JSON parse failed. Raw:', raw.slice(0,400));
      return jres(res,500,{error:'AI 応答を解析できませんでした。もう一度試してください。'});
    }
    const teamName = String(spec.team_name||'New Team').slice(0,80);
    const coverEmoji = String(spec.cover_emoji||'🎯').slice(0,8) || '🎯';
    const proposed = Array.isArray(spec.agents) ? spec.agents : [];
    const filteredAgents = proposed
      .filter(a => a && typeof a.name==='string' && a.name.trim())
      .slice(0, 10)
      .map(a => {
        const skills = (Array.isArray(a.skills) ? a.skills : [])
          .filter(s => typeof s==='string' && VALID_SKILLS.includes(s.toLowerCase()))
          .map(s => s.toLowerCase());
        return {
          avatar: String(a.avatar||'🤖').slice(0,8) || '🤖',
          name: String(a.name).trim().slice(0,40),
          skills: skills.length ? skills.slice(0,3) : ['planning'],
          persona: String(a.persona||'').slice(0, 1200),
        };
      });
    if(filteredAgents.length < 2){
      return jres(res,500,{error:'チーム構成が不十分でした。もう一度試してください。'});
    }
    if((user.agents||[]).length + filteredAgents.length + 1 > 1000){
      return jres(res,400,{error:'エージェントが上限 (1000) を超えるためチームを作成できません'});
    }

    // Persist: clone agents tagged with team_origin, then create the team group.
    const now = new Date().toISOString();
    const groupId = 'ag_'+crypto.randomUUID();
    const cloned = filteredAgents.map(a => ({
      id: 'ag_'+crypto.randomUUID(),
      avatar: a.avatar,
      name: a.name,
      skills: a.skills,
      persona: a.persona,
      chrome_enabled: false,
      sheets_enabled: false,
      extension_enabled: false,
      model: 'gemini-flash',
      history: [],
      created_at: now,
      team_origin: { team_id: groupId, generated: true, goal: goal.slice(0,400) },
    }));
    const firstName = (cloned[0]?.name||'AI').replace(/\s+/g,'');
    const group = {
      id: groupId,
      avatar: coverEmoji,
      name: teamName,
      skills: ['planning'],
      persona: '',
      is_group: true,
      is_team: true,
      team_template_id: 'generated',
      team_goal: goal.slice(0,400),
      lang: lang,
      host_id: user.id,
      members: [
        { user_id: user.id, name: user.name||'You', email: user.email||'', joined_at: now, role: 'host', notify_pref: 'all' },
      ],
      team_member_agent_ids: cloned.map(a => a.id),
      ai_auto_respond: false,
      created_at: now,
      updated_at: now,
      history: [
        { role:'system', content: lang === 'ja'
          ? `🎉 ${teamName} を AI が設計しました。@${firstName} のように特定エージェントを呼べます。\n目的: ${goal.slice(0,200)}`
          : `🎉 AI assembled ${teamName} for you. Call a specific agent with @${firstName}.\nGoal: ${goal.slice(0,200)}`,
          time: new Date().toLocaleTimeString(lang==='ja'?'ja-JP':'en-US', {hour:'2-digit',minute:'2-digit'}) },
      ],
    };
    user.agents = [...(user.agents||[]), ...cloned, group];
    try { await DB.save(user); }
    catch(e){
      console.error('[teams/generate] DB.save failed for user='+user.id+' err='+(e.message||e));
      return jres(res,500,{error:'チームの保存に失敗しました: '+(e.message||'unknown')});
    }
    console.log('[teams/generate] user='+user.id+' goal="'+goal.slice(0,80)+'" agents='+cloned.length+' group='+groupId);
    return jres(res,201,{
      ok: true,
      group_id: groupId,
      member_count: cloned.length,
      team_name: teamName,
      cover_emoji: coverEmoji,
    });
  }

  // ── POST /api/teams/create ────────────────────────────────
  // body: {name, cover_emoji, member_ids[]}
  // Builds a team from the user's existing AI agents. The chosen agents
  // are flagged team_origin so they no longer show in the DM list.
  if(pathname==='/api/teams/create' && method==='POST'){
    const _gate = _planTeamGate(user);
    if(_gate) return jres(res, 402, _gate);
    const body = await readBody(req);
    const lang = (body.lang === 'ja') ? 'ja' : 'en';
    const name = String(body.name||'').trim().slice(0,80);
    const cover = String(body.cover_emoji||'🎯').trim().slice(0,8) || '🎯';
    const ids = Array.isArray(body.member_ids) ? body.member_ids.filter(x=>typeof x==='string') : [];
    if(!name) return jres(res,400,{error:'チーム名は必須です'});
    if(!ids.length) return jres(res,400,{error:'メンバーを 1 体以上選択してください'});
    const userAgents = user.agents || [];
    // Only allow agents that the user owns and are not already groups/teams
    // and not already members of another team.
    const eligible = ids.filter(id => {
      const a = userAgents.find(x => x.id===id);
      return a && !a.is_group && !a.team_origin;
    });
    if(!eligible.length) return jres(res,400,{error:'有効な AI が選択されていません'});
    if(userAgents.length >= 1000) return jres(res,400,{error:'エージェントは最大 1000 個までです'});

    const now = new Date().toISOString();
    const groupId = 'ag_'+crypto.randomUUID();
    // Look up agent names so the welcome message can reference one
    const firstName = (userAgents.find(a => a.id===eligible[0])||{}).name || 'AI';
    const group = {
      id: groupId,
      avatar: cover,
      name,
      skills: ['planning'],
      persona: '',
      is_group: true,
      is_team: true,
      team_template_id: 'custom',
      lang: lang,
      host_id: user.id,
      members: [
        { user_id: user.id, name: user.name||'You', email: user.email||'', joined_at: now, role: 'host', notify_pref: 'all' },
      ],
      team_member_agent_ids: eligible,
      ai_auto_respond: false,
      created_at: now,
      updated_at: now,
      history: [
        { role:'system', content: lang === 'ja'
          ? `🎉 ${name} を作成しました。@${firstName.replace(/\s+/g,'')} のように特定エージェントを呼び出せます。`
          : `🎉 ${name} is ready. Call a specific agent with @${firstName.replace(/\s+/g,'')}.`,
          time: new Date().toLocaleTimeString(lang==='ja'?'ja-JP':'en-US', {hour:'2-digit',minute:'2-digit'}) },
      ],
    };

    // Tag chosen agents so the DM list hides them
    for(const a of userAgents){
      if(eligible.includes(a.id)){
        a.team_origin = { team_id: groupId, custom: true };
      }
    }
    user.agents = [...userAgents, group];
    try {
      await DB.save(user);
    } catch(e){
      console.error('[teams/create] DB.save failed for user='+user.id+' err='+(e.message||e));
      return jres(res,500,{error:'チームの保存に失敗しました: '+(e.message||'unknown')});
    }
    console.log('[teams/create] user='+user.id+' name='+name+' members='+eligible.length+' group='+groupId);
    return jres(res,201,{ ok:true, group_id: groupId, member_count: eligible.length });
  }

  // ── POST /api/teams/:id/add-member ────────────────────────
  // body: {description: string, name?: string, avatar?: string, skills?: string[]}
  // If only `description` is provided, AI generates a single agent that fits.
  // If `name`/`skills` are provided, uses those directly (skips AI).
  // Returns the new agent. Caps team at 10 members.
  const tamMatch = pathname.match(/^\/api\/teams\/([^/]+)\/add-member$/);
  if(tamMatch && method==='POST'){
    const teamId = tamMatch[1];
    const team = (user.agents||[]).find(a => a.id===teamId);
    if(!team || !team.is_team) return jres(res,404,{error:'チームが見つかりません'});
    if(team.host_id !== user.id) return jres(res,403,{error:'ホストのみメンバーを追加できます'});
    const TEAM_MAX = 10;
    const currentCount = (team.team_member_agent_ids||[]).length;
    if(currentCount >= TEAM_MAX){
      return jres(res,400,{error:`チームのメンバーは最大 ${TEAM_MAX} 体までです (現在 ${currentCount} 体)`});
    }
    if((user.agents||[]).length >= 1000) return jres(res,400,{error:'エージェントは最大1000個です'});

    const body = await readBody(req);
    const lang = (body.lang === 'ja') ? 'ja' : 'en';
    const description = String(body.description||'').trim().slice(0, 800);

    const VALID_SKILLS = ['writing','research','coding','marketing','planning','analysis','translate','support','idea','teaching','ceo','coo','secretary','designer','sns','other'];

    let memberSpec = null;
    // Path 1: caller already provided concrete fields → use as-is
    if(body.name && typeof body.name==='string' && body.name.trim()){
      memberSpec = {
        avatar: String(body.avatar||'🤖').slice(0,8) || '🤖',
        name:   String(body.name).trim().slice(0,40),
        skills: (Array.isArray(body.skills) ? body.skills : ['planning'])
                  .filter(s => typeof s==='string' && VALID_SKILLS.includes(s.toLowerCase()))
                  .map(s => s.toLowerCase()).slice(0,3),
        persona: String(body.persona||description||'').trim().slice(0, 1200),
      };
      if(!memberSpec.skills.length) memberSpec.skills = ['planning'];
    }
    // Path 2: only description → ask Claude to design ONE agent that fits
    else {
      if(description.length < 4) return jres(res,400,{error: lang==='ja' ? '追加するメンバーの説明をもう少し詳しく書いてください' : 'Please describe the new member in a bit more detail'});
      if(!ANTHROPIC) return jres(res,500,{error: lang==='ja' ? 'AI が設定されていません' : 'AI is not configured'});

      const existingNames = ((team.team_member_agent_ids||[])
        .map(id => (user.agents||[]).find(a => a.id===id))
        .filter(Boolean)
        .map(a => a.name)).join(', ');
      const teamGoal = team.team_goal || '';
      const teamName = team.name || '';
      const personaLang = lang === 'ja' ? 'in Japanese' : 'in English';
      const personaSchema = lang === 'ja'
        ? '"persona":"採用目的: <why we hired this agent, JA>\\n業務内容: <what they do day-to-day, JA, concrete>"'
        : '"persona":"Hired for: <why we hired this agent>\\nDay-to-day: <what they do day-to-day, concrete>"';

      const sys = 'You are a senior product strategist who designs single AI agents. '
        + 'Given an existing AI Agent Team and a description of a NEW member to add, output a JSON object describing exactly one agent that complements the team. '
        + 'Output ONLY valid JSON — no prose, no code fences. Schema: '
        + '{"avatar":"<single emoji>","name":"<short role name, 2-4 words, ' + personaLang + '>","skills":["<from the allowed set>"...],' + personaSchema + '}. '
        + 'Allowed skill IDs only: ' + VALID_SKILLS.join(', ') + '. '
        + 'ALL human-readable text MUST be ' + personaLang + '. '
        + 'Pick 1-3 skills max. The new agent must not duplicate an existing role. '
        + 'Persona should be specific and actionable.';
      const userMsg =
        `Team name: ${teamName}\n`
        + (teamGoal ? `Team goal: ${teamGoal}\n` : '')
        + `Existing members: ${existingNames || '(none)'}\n`
        + `\nNew member request:\n${description}\n\nDesign exactly one agent in JSON.`;
      let aiData;
      try { aiData = await callAI([{role:'user', content: userMsg}], sys, 'sonnet'); }
      catch(e){
        console.error('[teams/add-member] Anthropic failed:', e.message);
        return jres(res,500,{error:'AI 生成に失敗しました: ' + (e.message||'unknown')});
      }
      let raw = '';
      if(Array.isArray(aiData?.content)){
        for(const blk of aiData.content){ if(blk.type==='text' && blk.text){ raw += blk.text; } }
      }
      raw = raw.trim().replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'').trim();
      try { memberSpec = JSON.parse(raw); }
      catch(e){
        console.error('[teams/add-member] JSON parse failed. Raw:', raw.slice(0,400));
        return jres(res,500,{error:'AI 応答を解析できませんでした。もう一度試してください。'});
      }
      const filteredSkills = (Array.isArray(memberSpec.skills) ? memberSpec.skills : [])
        .filter(s => typeof s==='string' && VALID_SKILLS.includes(s.toLowerCase()))
        .map(s => s.toLowerCase()).slice(0,3);
      memberSpec = {
        avatar: String(memberSpec.avatar||'🤖').slice(0,8) || '🤖',
        name:   String(memberSpec.name||'New Member').trim().slice(0,40),
        skills: filteredSkills.length ? filteredSkills : ['planning'],
        persona: String(memberSpec.persona||'').slice(0, 1200),
      };
    }

    const now = new Date().toISOString();
    const newAgent = {
      id: 'ag_'+crypto.randomUUID(),
      avatar: memberSpec.avatar,
      name: memberSpec.name,
      skills: memberSpec.skills,
      persona: memberSpec.persona,
      chrome_enabled: false,
      sheets_enabled: false,
      extension_enabled: false,
      model: 'gemini-flash',
      history: [],
      created_at: now,
      team_origin: { team_id: teamId, added_after: true },
    };
    user.agents = [...(user.agents||[]), newAgent];
    team.team_member_agent_ids = [...(team.team_member_agent_ids||[]), newAgent.id];
    team.updated_at = now;
    // Drop a system message into the team history so other tabs see the addition
    team.history = Array.isArray(team.history) ? team.history : [];
    team.history.push({
      role: 'system',
      content: lang === 'ja'
        ? `🆕 ${newAgent.name} がチームに加わりました。@${newAgent.name.replace(/\s+/g,'')} で呼び出せます。`
        : `🆕 ${newAgent.name} joined the team. Call them with @${newAgent.name.replace(/\s+/g,'')}.`,
      time: new Date().toLocaleTimeString('ja-JP', {hour:'2-digit',minute:'2-digit'}),
    });
    try { await DB.save(user); }
    catch(e){
      console.error('[teams/add-member] DB.save failed', e.message);
      return jres(res,500,{error:'保存に失敗しました: '+(e.message||'unknown')});
    }
    console.log('[teams/add-member] team='+teamId+' agent='+newAgent.id+' name="'+newAgent.name+'"');
    return jres(res,201,{ ok:true, agent: newAgent, member_count: team.team_member_agent_ids.length });
  }

  // ── DELETE /api/teams/:teamId/members/:agentId ─────────────
  // Remove an agent from a team. Query ?delete=1 also deletes the agent;
  // otherwise the agent stays in user.agents and resurfaces in the DM list
  // (team_origin cleared).
  const trmMatch = pathname.match(/^\/api\/teams\/([^/]+)\/members\/([^/]+)$/);
  if(trmMatch && method==='DELETE'){
    const teamId = trmMatch[1];
    const memId  = trmMatch[2];
    const team = (user.agents||[]).find(a => a.id===teamId);
    if(!team || !team.is_team) return jres(res,404,{error:'チームが見つかりません'});
    if(team.host_id !== user.id) return jres(res,403,{error:'ホストのみメンバーを外せます'});
    const ids = Array.isArray(team.team_member_agent_ids) ? team.team_member_agent_ids : [];
    if(!ids.includes(memId)) return jres(res,404,{error:'そのメンバーはこのチームに属していません'});
    if(ids.length <= 1) return jres(res,400,{error:'チームには最低 1 体のメンバーが必要です'});

    const qs = new url.URL(req.url, APP_URL).searchParams;
    const alsoDelete = qs.get('delete') === '1';
    const member = (user.agents||[]).find(a => a.id===memId);
    const memberName = (member && member.name) || 'メンバー';

    team.team_member_agent_ids = ids.filter(x => x !== memId);
    team.updated_at = new Date().toISOString();
    team.history = Array.isArray(team.history) ? team.history : [];
    team.history.push({
      role: 'system',
      content: alsoDelete
        ? `🗑 ${memberName} をチームから外し、削除しました。`
        : `👋 ${memberName} がチームから外れました (DM に戻しました)。`,
      time: new Date().toLocaleTimeString('ja-JP', {hour:'2-digit',minute:'2-digit'}),
    });
    if(alsoDelete){
      user.agents = (user.agents||[]).filter(a => a.id !== memId);
    } else if(member){
      // Drop team_origin so the agent reappears in the DM tab
      delete member.team_origin;
      member.updated_at = new Date().toISOString();
    }
    try { await DB.save(user); }
    catch(e){
      console.error('[teams/remove-member] DB.save failed', e.message);
      return jres(res,500,{error:'保存に失敗しました: '+(e.message||'unknown')});
    }
    console.log('[teams/remove-member] team='+teamId+' agent='+memId+' delete='+alsoDelete);
    return jres(res,200,{ ok:true, member_count: team.team_member_agent_ids.length, deleted: alsoDelete });
  }

  // ── DELETE /api/teams/:teamId ──────────────────────────────
  // Delete a whole team. Query ?keep_members=1 keeps the cloned agents
  // (clears team_origin so they appear in DM); otherwise deletes them too.
  const tdmMatch = pathname.match(/^\/api\/teams\/([^/]+)$/);
  if(tdmMatch && method==='DELETE'){
    const teamId = tdmMatch[1];
    const team = (user.agents||[]).find(a => a.id===teamId);
    if(!team || !team.is_team) return jres(res,404,{error:'チームが見つかりません'});
    if(team.host_id !== user.id) return jres(res,403,{error:'ホストのみチームを削除できます'});
    const qs = new url.URL(req.url, APP_URL).searchParams;
    const keepMembers = qs.get('keep_members') === '1';
    const memberIds = Array.isArray(team.team_member_agent_ids) ? team.team_member_agent_ids : [];
    if(keepMembers){
      // Restore each member to the DM list
      for(const a of (user.agents||[])){
        if(memberIds.includes(a.id) && a.team_origin && a.team_origin.team_id === teamId){
          delete a.team_origin;
          a.updated_at = new Date().toISOString();
        }
      }
      user.agents = (user.agents||[]).filter(a => a.id !== teamId);
    } else {
      // Delete the team and every member that was tagged as part of it
      user.agents = (user.agents||[]).filter(a =>
        a.id !== teamId && !(memberIds.includes(a.id) && a.team_origin && a.team_origin.team_id === teamId)
      );
    }
    try { await DB.save(user); }
    catch(e){
      console.error('[teams/delete] DB.save failed', e.message);
      return jres(res,500,{error:'削除に失敗しました: '+(e.message||'unknown')});
    }
    console.log('[teams/delete] team='+teamId+' keep_members='+keepMembers+' member_count='+memberIds.length);
    return jres(res,200,{ ok:true, kept_members: keepMembers ? memberIds.length : 0 });
  }

  // ── POST /api/agents/reorder ───────────────────────────────
  // body: {order: [agentId, ...]}  — preserves only known IDs, appends any missing
  if(pathname==='/api/agents/reorder' && method==='POST'){
    const body = await readBody(req);
    const ids = Array.isArray(body.order) ? body.order.filter(x=>typeof x==='string') : null;
    if(!ids) return jres(res,400,{error:'order 配列が必要です'});
    const cur = user.agents || [];
    const byId = new Map(cur.map(a=>[a.id, a]));
    const reordered = [];
    const seen = new Set();
    for(const id of ids){
      if(seen.has(id)) continue;
      const a = byId.get(id);
      if(a){ reordered.push(a); seen.add(id); }
    }
    // Append any agents not in the order list (preserve original relative order)
    for(const a of cur){
      if(!seen.has(a.id)) reordered.push(a);
    }
    user.agents = reordered;
    await DB.save(user);
    return jres(res,200,{ok:true});
  }

  // ── DELETE /api/agents/:id ─────────────────────────────────
  const dm=pathname.match(/^\/api\/agents\/([^/]+)$/);
  if(dm&&method==='DELETE'){
    const agId = dm[1];
    const ag = (user.agents||[]).find(a => a.id === agId);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    // If this is a group, clean up each non-host member's group_memberships
    // so it disappears from their sidebar.
    if(ag.is_group && Array.isArray(ag.members)){
      const others = ag.members.filter(m => m.user_id !== user.id);
      for(const m of others){
        try {
          const member = await DB.findBy('id', m.user_id);
          if(!member) continue;
          member.group_memberships = (member.group_memberships||[])
            .filter(g => g.agent_id !== agId);
          await DB.save(member);
        } catch(e){
          console.warn('[delete-group] cleanup membership failed for', m.user_id, e.message);
        }
      }
    }
    user.agents = (user.agents||[]).filter(a => a.id !== agId);
    await DB.save(user);
    return jres(res,200,{ok:true});
  }

  // ── GET /api/google/sheets/status ──────────────────────────
  if(pathname==='/api/google/sheets/status' && method==='GET'){
    const o=user.google_oauth;
    return jres(res,200,{
      connected: !!(o && o.refresh_token),
      email: (o && o.email) || null,
      scope: (o && o.scope) || null,
    });
  }

  // ── GET /api/google/sheets/auth-url ────────────────────────
  // Returns the Google OAuth URL to start the Sheets connection flow.
  // Frontend redirects the user to it (or opens a popup).
  if(pathname==='/api/google/sheets/auth-url' && method==='GET'){
    if(!GOOGLE_ID || !GOOGLE_SEC) return jres(res,503,{error:'Google OAuth が未設定です'});
    // Re-issue a short-lived JWT specifically for the OAuth state. This avoids passing
    // the user's full long-lived token through Google's redirect URL, where it would
    // appear in their browser history.
    const stateToken = JWT.sign({userId:user.id,email:user.email});
    return jres(res,200,{url: googleSheetsAuthURL(stateToken)});
  }

  // ── POST /api/google/sheets/disconnect ─────────────────────
  if(pathname==='/api/google/sheets/disconnect' && method==='POST'){
    user.google_oauth = null;
    // Also flip off any agents currently flagged as sheets_enabled so the AI doesn't
    // try to call sheets tools that will fail.
    (user.agents||[]).forEach(a=>{ if(a.sheets_enabled) a.sheets_enabled=false; });
    await DB.save(user);
    return jres(res,200,{ok:true});
  }

  // ── POST /api/extension/pair ───────────────────────────────
  // Generate a device token for the browser extension to use as bearer auth.
  // Token is random 32 bytes hex; rotates on every pair.
  // Stored as TOP-LEVEL columns so token lookup is fast (no JSONB scan).
  if(pathname==='/api/extension/pair' && method==='POST'){
    const device_id = 'dev_' + crypto.randomBytes(8).toString('hex');
    const device_token = crypto.randomBytes(32).toString('hex');
    user.extension_device_id = device_id;
    user.extension_device_token = device_token;
    user.extension_device_meta = {
      created_at: new Date().toISOString(),
      last_seen: null,
      ua: req.headers['user-agent'] || '',
    };
    await DB.save(user);
    return jres(res,200,{ device_id, device_token });
  }

  // ── POST /api/extension/unpair ─────────────────────────────
  if(pathname==='/api/extension/unpair' && method==='POST'){
    const t = user.extension_device_token;
    if(t && _extConnections.has(t)){
      try{ _extConnections.get(t).res.end(); }catch(e){}
      _extConnections.delete(t);
    }
    user.extension_device_id = null;
    user.extension_device_token = null;
    user.extension_device_meta = null;
    (user.agents||[]).forEach(a=>{ if(a.extension_enabled) a.extension_enabled=false; });
    await DB.save(user);
    return jres(res,200,{ok:true});
  }

  // ── GET /api/extension/status ──────────────────────────────
  if(pathname==='/api/extension/status' && method==='GET'){
    const tok = user.extension_device_token;
    const meta = user.extension_device_meta || {};
    const connected = !!(tok && _extConnections.has(tok));
    return jres(res,200,{
      paired: !!tok,
      connected,
      device_id: user.extension_device_id || null,
      last_seen: meta.last_seen || null,
      ua: meta.ua || null,
    });
  }

  // ── POST /api/mobile/register-device ───────────────────────
  // Body: { token: string, platform: 'ios'|'android', app_version?, locale? }
  // Stores the FCM/APNs token under user.mobile_devices (array, dedup by token).
  // Supports multi-device per user (phone + tablet).
  if(pathname==='/api/mobile/register-device' && method==='POST'){
    const b = await readBody(req);
    const tok = (b && b.token || '').toString().trim();
    const platform = (b && b.platform || '').toString().trim().toLowerCase();
    if(!tok) return jres(res,400,{error:'token is required'});
    if(platform !== 'ios' && platform !== 'android'){
      return jres(res,400,{error:"platform must be 'ios' or 'android'"});
    }
    const list = Array.isArray(user.mobile_devices) ? user.mobile_devices.slice() : [];
    // Dedup: drop any existing entry with the same token, then prepend fresh.
    const filtered = list.filter(d => d && d.token !== tok);
    filtered.unshift({
      token: tok,
      platform,
      app_version: (b.app_version || '').toString().slice(0, 32) || null,
      locale: (b.locale || '').toString().slice(0, 16) || null,
      ua: (req.headers['user-agent'] || '').toString().slice(0, 256),
      registered_at: new Date().toISOString(),
      last_seen: new Date().toISOString(),
    });
    // Cap at 10 devices per user
    user.mobile_devices = filtered.slice(0, 10);
    await DB.save(user);
    return jres(res,200,{ok:true, device_count: user.mobile_devices.length});
  }

  // ── POST /api/mobile/unregister-device ─────────────────────
  // Body: { token: string }
  if(pathname==='/api/mobile/unregister-device' && method==='POST'){
    const b = await readBody(req);
    const tok = (b && b.token || '').toString().trim();
    if(!tok) return jres(res,400,{error:'token is required'});
    const list = Array.isArray(user.mobile_devices) ? user.mobile_devices : [];
    user.mobile_devices = list.filter(d => d && d.token !== tok);
    await DB.save(user);
    return jres(res,200,{ok:true, device_count: user.mobile_devices.length});
  }

  // ── GET /api/mobile/devices ────────────────────────────────
  // Lists currently registered devices (without exposing full tokens).
  if(pathname==='/api/mobile/devices' && method==='GET'){
    const list = Array.isArray(user.mobile_devices) ? user.mobile_devices : [];
    const safe = list.map(d => ({
      platform: d.platform,
      app_version: d.app_version || null,
      locale: d.locale || null,
      registered_at: d.registered_at || null,
      last_seen: d.last_seen || null,
      token_preview: (d.token || '').slice(0, 12) + '...',
    }));
    return jres(res,200,{devices: safe});
  }

  // ── POST /api/parse/docx ───────────────────────────────────
  // Body: { b64: string, name?: string }
  // Extracts plain text from a .docx file so the AI can read it. Uses
  // `mammoth` (lazy-required so a fresh deploy without `npm install` still
  // boots — we just return a friendly error instead of crashing).
  if(pathname==='/api/parse/docx' && method==='POST'){
    const auth=getAuth(req); if(!auth) return jres(res,401,{error:'認証が必要です'});
    const body = (await readBody(req)) || {};
    const b64=(body.b64||'').toString();
    if(!b64) return jres(res,400,{error:'b64 が必要です'});
    let buf;
    try { buf = Buffer.from(b64, 'base64'); }
    catch { return jres(res,400,{error:'base64 デコードに失敗'}); }
    if(buf.length > 20*1024*1024) return jres(res,413,{error:'ファイルが大きすぎます (上限 20MB)'});
    let mammoth;
    try { mammoth = require('mammoth'); }
    catch(e){ return jres(res,500,{error:'mammoth 未インストール — npm install を実行してください'}); }
    try {
      const result = await mammoth.extractRawText({ buffer: buf });
      let text = (result && result.value || '').trim();
      let truncated = false;
      if(text.length > 80000){ text = text.slice(0,80000); truncated = true; }
      return jres(res,200,{ text, truncated, name: body.name||'document.docx', length: text.length });
    } catch(e){
      return jres(res,400,{ error:'DOCX 解析に失敗', detail: (e&&e.message||'').slice(0,200) });
    }
  }

  // ── POST /api/parse/pdf ────────────────────────────────────
  // Body: { b64: string, name?: string }
  // Extract plain text from a PDF for use in KB / chat context. Anthropic
  // already accepts PDFs as documents in chat — this is for the KB pipeline
  // (which needs text to chunk + retrieve).
  if(pathname==='/api/parse/pdf' && method==='POST'){
    const auth=getAuth(req); if(!auth) return jres(res,401,{error:'認証が必要です'});
    const body = (await readBody(req)) || {};
    const b64=(body.b64||'').toString();
    if(!b64) return jres(res,400,{error:'b64 が必要です'});
    let buf;
    try { buf = Buffer.from(b64, 'base64'); }
    catch { return jres(res,400,{error:'base64 デコードに失敗'}); }
    if(buf.length > 20*1024*1024) return jres(res,413,{error:'ファイルが大きすぎます (上限 20MB)'});
    let pdfParse;
    try { pdfParse = require('pdf-parse'); }
    catch(e){ return jres(res,500,{error:'pdf-parse 未インストール — npm install を実行してください'}); }
    try {
      const result = await pdfParse(buf, { max: 100 });  // cap at 100 pages
      let text = (result && result.text || '').trim();
      let truncated = false;
      if(text.length > 200000){ text = text.slice(0,200000); truncated = true; }
      return jres(res,200,{
        text, truncated,
        name: body.name||'document.pdf',
        length: text.length,
        pages: (result && result.numpages) || 0,
      });
    } catch(e){
      return jres(res,400,{ error:'PDF 解析に失敗', detail: (e&&e.message||'').slice(0,200) });
    }
  }

  // ── POST /api/fetch-url ────────────────────────────────────
  // Body: { url: string }
  // Fetches the URL server-side, strips HTML, returns extracted text so the
  // user can attach it to a chat message. Auth required (rate-shaped by usage).
  if(pathname==='/api/fetch-url' && method==='POST'){
    const b = await readBody(req);
    const target = (b && b.url || '').toString().trim();
    if(!target) return jres(res, 400, { error: 'url is required' });
    try {
      const out = await fetchUrlText(target, { timeout: 12000, maxBytes: 2 * 1024 * 1024 });
      return jres(res, 200, out);
    } catch (e) {
      return jres(res, 400, { error: 'fetch_failed', detail: (e && e.message) || String(e) });
    }
  }

  // ── Knowledge base ─────────────────────────────────────────
  // Per-agent KB: text-only documents (the client extracts text from PDF/DOCX/etc
  // before sending). Stored on the agent so it rides along in the JSONB column.
  //
  //   GET    /api/agents/:id/knowledge          → list (no chunk bodies)
  //   POST   /api/agents/:id/knowledge          → add { name, text }
  //   DELETE /api/agents/:id/knowledge/:docId   → remove
  const kbList = pathname.match(/^\/api\/agents\/([^/]+)\/knowledge$/);
  if(kbList && method==='GET'){
    const ag=(user.agents||[]).find(a=>a.id===kbList[1]);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    const docs = (ag.knowledge||[]).map(d => ({
      id:d.id, name:d.name, length:(d.text||'').length, chunks:(d.chunks||[]).length, created_at:d.created_at,
    }));
    return jres(res,200,{ docs, total: docs.length });
  }
  if(kbList && method==='POST'){
    const ag=(user.agents||[]).find(a=>a.id===kbList[1]);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    const body = (await readBody(req)) || {};
    const text = String(body.text||'').trim();
    if(!text) return jres(res,400,{error:'text が空です'});
    if(text.length > 500*1024) return jres(res,413,{error:'1 ドキュメント 500KB まで'});
    ag.knowledge = Array.isArray(ag.knowledge) ? ag.knowledge : [];
    if(ag.knowledge.length >= 50) return jres(res,400,{error:'ナレッジは 50 ドキュメントまでです'});
    // Total KB cap to keep retrieval fast and JSONB small.
    const totalBytes = ag.knowledge.reduce((n,d)=>n+(d.text||'').length,0) + text.length;
    if(totalBytes > 5*1024*1024) return jres(res,413,{error:'ナレッジ合計 5MB を超えました'});
    const chunks = _kbChunkText(text);
    const doc = {
      id: genKbDocId(),
      name: String(body.name||'document').slice(0,120),
      text,
      chunks,
      created_at: new Date().toISOString(),
    };
    // If OpenAI key is configured, embed chunks now so vector retrieval
    // works on this doc. Cheap (text-embedding-3-small ≈ $0.02 / 1M tokens)
    // and avoids users having to "rebuild index" later. Failure is silent —
    // doc still saves and is searchable via lexical scorer.
    if(OPENAI_KEY && chunks.length){
      try {
        const embs = await _openaiEmbeddings(chunks);
        if(Array.isArray(embs) && embs.length === chunks.length) doc.embeddings = embs;
      } catch(e){ console.warn('[kb-upload] embed failed:', e.message); }
    }
    ag.knowledge.push(doc);
    await DB.save(user);
    return jres(res,200,{ id:doc.id, name:doc.name, chunks:chunks.length, length:text.length, embedded:!!doc.embeddings });
  }
  const kbDel = pathname.match(/^\/api\/agents\/([^/]+)\/knowledge\/([a-z0-9_]+)$/);
  if(kbDel && method==='DELETE'){
    const ag=(user.agents||[]).find(a=>a.id===kbDel[1]);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    const i=(ag.knowledge||[]).findIndex(d=>d.id===kbDel[2]);
    if(i<0) return jres(res,404,{error:'ドキュメントが見つかりません'});
    ag.knowledge.splice(i,1);
    await DB.save(user);
    return jres(res,200,{ok:true});
  }

  // ── Scheduled runs ─────────────────────────────────────────
  //   GET    /api/agents/:id/schedules                    → list
  //   POST   /api/agents/:id/schedules                    → create
  //   PUT    /api/agents/:id/schedules/:sid               → update (toggle/edit)
  //   DELETE /api/agents/:id/schedules/:sid               → remove
  const schList = pathname.match(/^\/api\/agents\/([^/]+)\/schedules$/);
  if(schList && method==='GET'){
    const ag=(user.agents||[]).find(a=>a.id===schList[1]);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    return jres(res,200,{ schedules: ag.schedules || [] });
  }
  if(schList && method==='POST'){
    const ag=(user.agents||[]).find(a=>a.id===schList[1]);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    const body = (await readBody(req)) || {};
    const prompt = String(body.prompt||'').trim();
    if(!prompt) return jres(res,400,{error:'prompt が空です'});
    if(prompt.length > 1000) return jres(res,400,{error:'prompt は 1000 文字まで'});
    const kind = (body.kind === 'hourly') ? 'hourly' : 'daily';
    const sched = {
      id: genScheduleId(),
      prompt,
      kind,
      hour: Math.max(0, Math.min(23, Number(body.hour||9))),
      minute: Math.max(0, Math.min(59, Number(body.minute||0))),
      // Clamp to ±14h so out-of-range values can't corrupt the next_run math.
      tz_offset_min: Math.max(-840, Math.min(840, Number(body.tz_offset_min) || 0)),
      deliver: body.deliver === 'email' ? 'email' : 'chat',
      enabled: body.enabled === false ? false : true,
      label: String(body.label||'').slice(0,80),
      created_at: new Date().toISOString(),
      last_run: null,
      next_run: null,
    };
    sched.next_run = _scheduleNextRun(sched);
    ag.schedules = Array.isArray(ag.schedules) ? ag.schedules : [];
    if(ag.schedules.length >= 20) return jres(res,400,{error:'スケジュールは 20 件までです'});
    ag.schedules.push(sched);
    await DB.save(user);
    return jres(res,200,{ schedule: sched });
  }
  const schOne = pathname.match(/^\/api\/agents\/([^/]+)\/schedules\/([a-z0-9_]+)$/);
  if(schOne && method==='PUT'){
    const ag=(user.agents||[]).find(a=>a.id===schOne[1]);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    const s=(ag.schedules||[]).find(x=>x.id===schOne[2]);
    if(!s) return jres(res,404,{error:'スケジュールが見つかりません'});
    const body = (await readBody(req)) || {};
    if(typeof body.enabled === 'boolean') s.enabled = body.enabled;
    if(typeof body.prompt === 'string' && body.prompt.trim()){ s.prompt = body.prompt.trim().slice(0,1000); }
    if(body.kind === 'daily' || body.kind === 'hourly') s.kind = body.kind;
    if(typeof body.hour === 'number') s.hour = Math.max(0, Math.min(23, body.hour));
    if(typeof body.minute === 'number') s.minute = Math.max(0, Math.min(59, body.minute));
    if(typeof body.tz_offset_min === 'number') s.tz_offset_min = Math.max(-840, Math.min(840, body.tz_offset_min));
    if(body.deliver === 'email' || body.deliver === 'chat') s.deliver = body.deliver;
    if(typeof body.label === 'string') s.label = body.label.slice(0,80);
    s.next_run = _scheduleNextRun(s);
    await DB.save(user);
    return jres(res,200,{ schedule: s });
  }
  if(schOne && method==='DELETE'){
    const ag=(user.agents||[]).find(a=>a.id===schOne[1]);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    const i=(ag.schedules||[]).findIndex(x=>x.id===schOne[2]);
    if(i<0) return jres(res,404,{error:'スケジュールが見つかりません'});
    ag.schedules.splice(i,1);
    await DB.save(user);
    return jres(res,200,{ok:true});
  }

  // ── POST /api/agents/:id/schedules/:sid/run  (Run Now) ──────
  // Fires the schedule immediately as a smoke test. Does NOT reschedule the
  // next_run timestamp — the regular tick still owns that.
  const schRun = pathname.match(/^\/api\/agents\/([^/]+)\/schedules\/([a-z0-9_]+)\/run$/);
  if(schRun && method==='POST'){
    const ag=(user.agents||[]).find(a=>a.id===schRun[1]);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    const s=(ag.schedules||[]).find(x=>x.id===schRun[2]);
    if(!s) return jres(res,404,{error:'スケジュールが見つかりません'});
    if((user.balance_jpy||0) <= 0){
      return jres(res,402,{error:'残高がありません。チャージしてください。'});
    }
    const beforeNext = s.next_run;
    await _runOneSchedule(user, ag, s);
    // Preserve the original next_run — Run Now is for testing, not rescheduling.
    s.next_run = beforeNext;
    s.last_manual_run = new Date().toISOString();
    await DB.save(user);
    // Return last assistant entry that we just appended
    const last = (ag.history||[]).slice(-1)[0];
    return jres(res,200,{
      ok:true,
      reply: last && last.role==='assistant' ? last.content : '',
      error: s.last_error || null,
      next_run: s.next_run,
    });
  }

  // ── Outgoing Slack / Discord webhook URLs ──────────────────
  //   GET  /api/integrations              → current URLs (masked)
  //   POST /api/integrations              → save { slack, discord } (either field optional)
  if(pathname==='/api/integrations' && method==='GET'){
    const w = user.outgoing_webhooks || {};
    const mask = u => u ? (u.replace(/^(https?:\/\/[^/]+\/).+(.{4})$/, '$1…$2')) : '';
    return jres(res,200,{
      slack:   { configured: !!w.slack,   preview: mask(w.slack) },
      discord: { configured: !!w.discord, preview: mask(w.discord) },
    });
  }
  if(pathname==='/api/integrations' && method==='POST'){
    const body = (await readBody(req)) || {};
    user.outgoing_webhooks = user.outgoing_webhooks || {};
    if(body.slack !== undefined){
      const v = String(body.slack||'').trim();
      if(v && !/^https:\/\/hooks\.slack\.com\//.test(v)) return jres(res,400,{error:'Slack Webhook URL は https://hooks.slack.com/... の形式である必要があります'});
      if(v) user.outgoing_webhooks.slack = v; else delete user.outgoing_webhooks.slack;
    }
    if(body.discord !== undefined){
      const v = String(body.discord||'').trim();
      if(v && !/^https:\/\/(?:discord(?:app)?\.com)\/api\/webhooks\//.test(v)) return jres(res,400,{error:'Discord Webhook URL は https://discord.com/api/webhooks/... の形式である必要があります'});
      if(v) user.outgoing_webhooks.discord = v; else delete user.outgoing_webhooks.discord;
    }
    await DB.save(user);
    return jres(res,200,{ok:true});
  }

  // ── Webhook entry point ────────────────────────────────────
  //   GET  /api/agents/:id/webhook                  → current status
  //   POST /api/agents/:id/webhook { enabled, regenerate? } → create/rotate/disable
  const whMan = pathname.match(/^\/api\/agents\/([^/]+)\/webhook$/);
  if(whMan && method==='GET'){
    const ag=(user.agents||[]).find(a=>a.id===whMan[1]);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    return jres(res,200,{
      enabled: !!ag.webhook_token,
      token: ag.webhook_token || null,
      url: ag.webhook_token ? (APP_URL + '/w/' + ag.webhook_token) : null,
    });
  }
  if(whMan && method==='POST'){
    const ag=(user.agents||[]).find(a=>a.id===whMan[1]);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    const body = (await readBody(req)) || {};
    if(body.enabled === false){
      ag.webhook_token = null;
    } else if(body.regenerate || !ag.webhook_token){
      ag.webhook_token = genWebhookToken();
    }
    await DB.save(user);
    return jres(res,200,{
      enabled: !!ag.webhook_token,
      token: ag.webhook_token || null,
      url: ag.webhook_token ? (APP_URL + '/w/' + ag.webhook_token) : null,
    });
  }

  // ── POST /api/agents/:id/share ─────────────────────────────
  // body: {enabled:true|false, regenerate?:true} — toggle/create/regenerate share URL
  const sm=pathname.match(/^\/api\/agents\/([^/]+)\/share$/);
  if(sm&&method==='POST'){
    const agId=sm[1];
    const ag=(user.agents||[]).find(a=>a.id===agId);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    const{enabled,regenerate}=await readBody(req);
    const wasShareId = ag.share_id;
    if(enabled===false){ ag.share_id=null; }
    else if(regenerate || !ag.share_id){ ag.share_id=genShareId(); }
    await DB.save(user);
    // Pre-render the OG PNG so the first Twitter / FB scrape hits a warm
    // cache (~10ms) instead of doing a 3-second resvg render that often
    // exceeds Twitter's image-fetch budget. Fire-and-forget — failures
    // just leave the cache empty and the next request renders normally.
    if(ag.share_id && ag.share_id !== wasShareId){
      _prerenderShareOG(user, ag).catch(e => console.warn('[og/prerender] '+e.message));
    }
    return jres(res,200,{share_id:ag.share_id||null});
  }

  // ══ GROUPS ═════════════════════════════════════════════════
  // Convert an existing solo agent into a group + create/regenerate invite token.
  // body: {
  //   expires_in_days?: 7,
  //   max_members?: 50,
  //   require_approval?: bool,
  //   regenerate?: bool   // set true to rotate the token explicitly
  // }
  // When invoked on an existing group, only fields that are actually present
  // in the body are updated. Token is preserved unless regenerate=true OR
  // the agent has no token yet.
  const grpInvM = pathname.match(/^\/api\/agents\/([^/]+)\/invite$/);
  if(grpInvM && method==='POST'){
    const agId = grpInvM[1];
    const ag = (user.agents||[]).find(a => a.id === agId);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    const body = await readBody(req) || {};

    // Promote to a group on first call.
    ag.is_group = true;
    ag.host_id = user.id;
    if(!Array.isArray(ag.members) || ag.members.length === 0){
      ag.members = [{
        user_id: user.id,
        name: user.name || (user.email||'').split('@')[0] || 'ホスト',
        avatar: '',
        role: 'host',
        joined_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
      }];
    }
    // Only update settings that were actually sent (preserve existing for the rest)
    if(body.expires_in_days !== undefined){
      const days = Math.max(1, Math.min(90, parseInt(body.expires_in_days, 10) || 7));
      ag.invite_expires_at = new Date(Date.now() + days*24*60*60*1000).toISOString();
    } else if(!ag.invite_expires_at){
      ag.invite_expires_at = new Date(Date.now() + 7*24*60*60*1000).toISOString();
    }
    if(body.max_members !== undefined){
      ag.invite_max_members = Math.max(2, Math.min(200, parseInt(body.max_members, 10) || 50));
    } else if(!ag.invite_max_members){
      ag.invite_max_members = 50;
    }
    if(body.require_approval !== undefined){
      ag.invite_require_approval = !!body.require_approval;
    } // else preserve existing value (don't accidentally flip)

    // Regenerate token only when explicitly asked OR when none exists yet.
    if(!ag.invite_token || body.regenerate === true){
      ag.invite_token = genInviteToken();
    }

    await DB.save(user);
    return jres(res,200,{
      invite_token: ag.invite_token,
      invite_url: APP_URL + '/g/' + ag.invite_token,
      invite_expires_at: ag.invite_expires_at,
      invite_max_members: ag.invite_max_members,
      members: ag.members.map(_safeMember),
      is_group: true,
    });
  }

  // Disable invite (token nulled — existing members stay).
  if(grpInvM && method==='DELETE'){
    const agId = grpInvM[1];
    const ag = (user.agents||[]).find(a => a.id === agId);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    if(ag.host_id && ag.host_id !== user.id){
      return jres(res,403,{error:'ホストのみ操作できます'});
    }
    ag.invite_token = null;
    ag.invite_expires_at = null;
    await DB.save(user);
    return jres(res,200,{ok:true});
  }

  // GET members of a group (host or member can call)
  const grpMemM = pathname.match(/^\/api\/agents\/([^/]+)\/members$/);
  if(grpMemM && method==='GET'){
    const agId = grpMemM[1];
    let ag = (user.agents||[]).find(a => a.id === agId);
    let host = user;
    if(!ag){
      // User might be a member of a group hosted by someone else — look it up
      const m = (user.group_memberships||[]).find(g => g.agent_id === agId);
      if(!m) return jres(res,404,{error:'エージェントが見つかりません'});
      const hostUser = await DB.findBy('id', m.host_id);
      if(!hostUser) return jres(res,404,{error:'ホストが見つかりません'});
      host = hostUser;
      ag = (hostUser.agents||[]).find(a => a.id === agId);
      if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    }
    const isCallerHost = (ag.host_id===user.id || host.id===user.id);
    return jres(res,200,{
      agent_id: ag.id,
      is_group: !!ag.is_group,
      host_id: ag.host_id || host.id,
      members: (ag.members||[]).map(_safeMember),
      invite_token: isCallerHost ? (ag.invite_token||null) : null,
      invite_expires_at: ag.invite_expires_at || null,
      invite_max_members: ag.invite_max_members || 50,
      invite_require_approval: !!ag.invite_require_approval,
      // Pending join requests — host-only
      pending_requests: isCallerHost ? (ag.pending_requests||[]) : [],
      // Full chat history (last 200 entries) so members see prior conversation.
      name: ag.name,
      avatar: ag.avatar,
      skills: ag.skills || [],
      persona: ag.persona || '',
      ai_auto_respond: ag.ai_auto_respond,  // undefined → use size heuristic
      history: (ag.history || []).slice(-200),
    });
  }

  // ── POST /api/agents/:id/approve | /deny ──────────────────
  // body: { user_id }
  const apM = pathname.match(/^\/api\/agents\/([^/]+)\/(approve|deny)$/);
  if(apM && method === 'POST'){
    const agId = apM[1];
    const action = apM[2];
    const body = await readBody(req);
    const targetUid = (body && body.user_id || '').toString();
    const ag = (user.agents||[]).find(a => a.id === agId);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    if(ag.host_id !== user.id) return jres(res,403,{error:'ホストのみ操作できます'});
    const pending = (ag.pending_requests||[]).find(p => p.user_id === targetUid);
    if(!pending) return jres(res,404,{error:'リクエストが見つかりません'});
    ag.pending_requests = (ag.pending_requests||[]).filter(p => p.user_id !== targetUid);

    if(action === 'approve'){
      ag.members = [...(ag.members||[]), {
        user_id: pending.user_id,
        name: pending.name,
        avatar: pending.avatar || '',
        role: 'member',
        joined_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
      }];
      ag.history = [...(ag.history||[]), {
        role: 'system',
        type: 'join',
        user_id: pending.user_id,
        user_name: pending.name,
        time: new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}),
        content: pending.name + ' さんが参加しました',
      }];
      if(ag.history.length > 200) ag.history = ag.history.slice(-200);
      await DB.save(user);
      // Add membership on the approved user's record
      const approvedUser = await DB.findBy('id', pending.user_id);
      if(approvedUser){
        approvedUser.group_memberships = approvedUser.group_memberships || [];
        if(!approvedUser.group_memberships.find(g => g.agent_id === ag.id)){
          approvedUser.group_memberships.push({
            host_id: user.id,
            agent_id: ag.id,
            joined_at: new Date().toISOString(),
          });
        }
        await DB.save(approvedUser);
      }
      return jres(res,200,{ok:true, approved:true});
    } else {
      // deny — just drop from pending
      await DB.save(user);
      return jres(res,200,{ok:true, denied:true});
    }
  }

  // Host removes a member
  const grpRmM = pathname.match(/^\/api\/agents\/([^/]+)\/members\/([^/]+)$/);
  if(grpRmM && method==='DELETE'){
    const agId = grpRmM[1], targetUid = grpRmM[2];
    const ag = (user.agents||[]).find(a => a.id === agId);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    if(ag.host_id !== user.id) return jres(res,403,{error:'ホストのみ操作できます'});
    if(targetUid === user.id) return jres(res,400,{error:'ホストは退出ではなく所有権移譲を使ってください'});

    const before = (ag.members||[]).length;
    ag.members = (ag.members||[]).filter(m => m.user_id !== targetUid);
    const removed = before - ag.members.length;
    await DB.save(user);

    // Also clear the invitee's group_memberships entry
    if(removed > 0){
      const target = await DB.findBy('id', targetUid);
      if(target){
        target.group_memberships = (target.group_memberships||[])
          .filter(g => g.agent_id !== agId);
        await DB.save(target);
      }
    }
    return jres(res,200,{ok:true, removed});
  }

  // Self-leave (member or host who wants to abandon)
  const grpLeaveM = pathname.match(/^\/api\/agents\/([^/]+)\/leave$/);
  if(grpLeaveM && method==='POST'){
    const agId = grpLeaveM[1];
    // First check if user is the host (agent in their own list)
    const ownAg = (user.agents||[]).find(a => a.id === agId);
    if(ownAg && ownAg.is_group){
      if((ownAg.members||[]).length > 1){
        return jres(res,400,{error:'メンバーがいる間は退出できません。所有権を移譲するかメンバーを削除してください。'});
      }
      // Lone host leaving: just delete the agent
      user.agents = (user.agents||[]).filter(a => a.id !== agId);
      await DB.save(user);
      return jres(res,200,{ok:true, deleted:true});
    }
    // Otherwise look at memberships
    const m = (user.group_memberships||[]).find(g => g.agent_id === agId);
    if(!m) return jres(res,404,{error:'参加していないグループです'});
    user.group_memberships = (user.group_memberships||[]).filter(g => g.agent_id !== agId);
    await DB.save(user);
    // Drop from host's agent.members[]
    const host = await DB.findBy('id', m.host_id);
    if(host){
      const hag = (host.agents||[]).find(a => a.id === agId);
      if(hag){
        hag.members = (hag.members||[]).filter(mm => mm.user_id !== user.id);
        await DB.save(host);
      }
    }
    return jres(res,200,{ok:true});
  }

  // Transfer ownership: only current host can call. body:{new_host_id}
  const grpTrM = pathname.match(/^\/api\/agents\/([^/]+)\/transfer$/);
  if(grpTrM && method==='POST'){
    const agId = grpTrM[1];
    const ag = (user.agents||[]).find(a => a.id === agId);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    if(ag.host_id !== user.id) return jres(res,403,{error:'ホストのみ移譲できます'});
    const body = await readBody(req);
    const newId = (body.new_host_id||'').toString();
    const target = (ag.members||[]).find(m => m.user_id === newId && m.user_id !== user.id);
    if(!target) return jres(res,400,{error:'移譲先メンバーが見つかりません'});
    const newHost = await DB.findBy('id', newId);
    if(!newHost) return jres(res,404,{error:'ユーザーが見つかりません'});

    // Move the entire agent record to the new host's agents[].
    // Update ownership flags + adjust members[].role.
    const moved = JSON.parse(JSON.stringify(ag));
    moved.host_id = newHost.id;
    moved.members = (moved.members||[]).map(m => ({...m,
      role: m.user_id === newHost.id ? 'host' : (m.user_id === user.id ? 'member' : m.role)
    }));
    user.agents = (user.agents||[]).filter(a => a.id !== agId);
    // Old host now becomes a regular member with a memberships entry
    user.group_memberships = (user.group_memberships||[]);
    if(!user.group_memberships.find(g => g.agent_id === agId)){
      user.group_memberships.push({
        host_id: newHost.id, agent_id: agId, joined_at: new Date().toISOString(),
      });
    }
    await DB.save(user);

    newHost.agents = [...(newHost.agents||[]), moved];
    newHost.group_memberships = (newHost.group_memberships||[])
      .filter(g => g.agent_id !== agId); // remove old membership entry
    await DB.save(newHost);
    return jres(res,200,{ok:true, new_host_id: newHost.id});
  }

  // ── GET /api/groups ────────────────────────────────────────
  // List groups the user is a member of (both hosted and joined).
  // Includes per-user unread_count derived from agent.members[uid].last_read_idx.
  if(pathname === '/api/groups' && method === 'GET'){
    const out = [];
    (user.agents||[]).forEach(ag => {
      if(ag.is_group){
        out.push({
          id: ag.id,
          name: ag.name,
          avatar: ag.avatar,
          host_id: ag.host_id,
          is_host: true,
          member_count: (ag.members||[]).length,
          last_message: (ag.history||[]).slice(-1)[0]?.content || '',
          last_at: (ag.history||[]).slice(-1)[0]?.time || ag.created_at,
          unread_count: _unreadCountForUser(ag, user.id),
        });
      }
    });
    for(const m of (user.group_memberships||[])){
      const host = await DB.findBy('id', m.host_id);
      if(!host) continue;
      const ag = (host.agents||[]).find(a => a.id === m.agent_id);
      if(!ag) continue;
      out.push({
        id: ag.id,
        name: ag.name,
        avatar: ag.avatar,
        host_id: ag.host_id,
        is_host: false,
        member_count: (ag.members||[]).length,
        last_message: (ag.history||[]).slice(-1)[0]?.content || '',
        last_at: (ag.history||[]).slice(-1)[0]?.time || m.joined_at,
        unread_count: _unreadCountForUser(ag, user.id),
      });
    }
    return jres(res,200,{groups: out});
  }

  // ── POST /api/agents/:id/contribute ────────────────────────
  // LINE Pay-style split-pay: member sends money from their balance to the
  // host's balance so AI usage in the group can continue.
  // body: { amount_jpy: number }
  const contribM = pathname.match(/^\/api\/agents\/([^/]+)\/contribute$/);
  if(contribM && method === 'POST'){
    const agId = contribM[1];
    const body = await readBody(req);
    const amount = Math.round(parseFloat(body && body.amount_jpy) || 0);
    if(!amount || amount < 100) return jres(res,400,{error:'最低 100 円から送金できます'});
    if(amount > 50000) return jres(res,400,{error:'1 回の上限は 50,000 円です'});

    // Resolve agent + host
    let agent = (user.agents||[]).find(a => a.id === agId);
    let host = user;
    if(!agent){
      const ms = (user.group_memberships||[]).find(g => g.agent_id === agId);
      if(!ms) return jres(res,404,{error:'エージェントが見つかりません'});
      host = await DB.findBy('id', ms.host_id);
      if(!host) return jres(res,404,{error:'ホストが見つかりません'});
      agent = (host.agents||[]).find(a => a.id === agId);
    }
    if(!agent || !agent.is_group) return jres(res,400,{error:'グループ専用の機能です'});
    if(host.id === user.id) return jres(res,400,{error:'自分のグループへは送金できません'});
    if((user.balance_jpy||0) < amount) return jres(res,402,{error:'残高が不足しています'});

    // Capture pre-state so we can roll back on partial failure.
    const _oldUserBal = user.balance_jpy || 0;
    const _oldHostBal = host.balance_jpy || 0;

    // Mutate balances + side state in memory
    user.balance_jpy = Math.round(((user.balance_jpy||0) - amount)*1000)/1000;
    host.balance_jpy = Math.round(((host.balance_jpy||0) + amount)*1000)/1000;

    agent.contributions = agent.contributions || [];
    agent.contributions.push({
      user_id: user.id,
      name: user.name || (user.email||'').split('@')[0] || 'メンバー',
      amount_jpy: amount,
      at: new Date().toISOString(),
    });
    if(agent.contributions.length > 100) agent.contributions = agent.contributions.slice(-100);

    agent.history = agent.history || [];
    agent.history.push({
      role: 'system',
      type: 'contribute',
      user_id: user.id,
      user_name: user.name || 'メンバー',
      time: new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}),
      content: ((user.name||'メンバー') + ' さんがグループに ¥' + amount.toLocaleString() + ' 送金しました'),
    });
    if(agent.history.length > 200) agent.history = agent.history.slice(-200);

    user.billing_history = user.billing_history || [];
    user.billing_history.push({date:new Date().toISOString(),type:'contribute_out',agentId:agent.id,agentName:agent.name,host_user_id:host.id,amount_jpy:amount});
    if(user.billing_history.length>1000) user.billing_history = user.billing_history.slice(-1000);
    host.billing_history = host.billing_history || [];
    host.billing_history.push({date:new Date().toISOString(),type:'contribute_in',agentId:agent.id,agentName:agent.name,from_user_id:user.id,from_user_name:user.name,amount_jpy:amount});
    if(host.billing_history.length>1000) host.billing_history = host.billing_history.slice(-1000);

    // Persist sender FIRST. If this fails, nothing has been moved.
    try {
      await DB.save(user);
    } catch(e){
      user.balance_jpy = _oldUserBal;
      console.error('[contribute] sender save failed:', e.message);
      return jres(res,500,{error:'送金に失敗しました', detail: e.message});
    }
    // Then credit host. On failure, attempt rollback of sender to keep ledgers consistent.
    try {
      await DB.save(host);
    } catch(e){
      console.error('[contribute] host save failed, rolling back sender:', e.message);
      user.balance_jpy = _oldUserBal;
      try { await DB.save(user); } catch(_){}
      return jres(res,500,{error:'送金に失敗しました (ロールバック済)', detail: e.message});
    }

    return jres(res,200,{
      ok:true,
      sent_jpy: amount,
      new_balance_jpy: user.balance_jpy,
      host_balance_jpy: host.balance_jpy,
    });
  }

  // ── GET /api/me/login-history ──────────────────────────────
  if(pathname === '/api/me/login-history' && method === 'GET'){
    return jres(res,200,{ events: (user.login_history || []).slice(0, 30) });
  }

  // ── GET /api/me/referral ───────────────────────────────────
  if(pathname === '/api/me/referral' && method === 'GET'){
    const code = await ensureReferralCode(user);
    return jres(res, 200, {
      code,
      url: APP_URL + '/auth.html?ref=' + code,
      stats: user.referral_stats || { count:0, last_at:null, total_credit_jpy:0 },
      bonus_jpy: 500,
    });
  }

  // ── GET /api/me/data-export ────────────────────────────────
  // Full JSON dump of the user's own data (GDPR-style).
  if(pathname === '/api/me/data-export' && method === 'GET'){
    const dump = {
      exported_at: new Date().toISOString(),
      user: {
        id: user.id, name: user.name, email: user.email,
        plan: user.plan, balance_jpy: user.balance_jpy, usage_count: user.usage_count,
        verified: user.verified, created_at: user.created_at,
        referral_code: user.referral_code, referred_by: user.referred_by,
        referral_stats: user.referral_stats,
      },
      agents: user.agents || [],
      group_memberships: user.group_memberships || [],
      billing_history: user.billing_history || [],
      revenue_history: user.revenue_history || [],
      payout_history: user.payout_history || [],
      favorites: user.favorites || [],
      mobile_devices: (user.mobile_devices||[]).map(d => ({...d, token: (d.token||'').slice(0,12)+'…'})),
    };
    res.writeHead(200, {
      'Content-Type':'application/json; charset=utf-8',
      'Content-Disposition':'attachment; filename="myaiagent-data-'+user.id.slice(0,8)+'.json"',
      ...SEC,
    });
    return res.end(JSON.stringify(dump, null, 2));
  }

  // ── DELETE /api/me ─────────────────────────────────────────
  // Permanent account deletion. Removes the user record + cleans up
  // group memberships in groups they joined. Hosted groups are deleted
  // along with the user.
  if(pathname === '/api/me' && method === 'DELETE'){
    const body = await readBody(req).catch(()=>({}));
    if(body && body.confirm !== 'DELETE'){
      return jres(res,400,{error:'本当に削除する場合は body に {"confirm":"DELETE"} を含めてください'});
    }
    // Drop the user from all hosted-group member lists they're a member of.
    for(const m of (user.group_memberships||[])){
      try {
        const host = await DB.findBy('id', m.host_id);
        if(!host) continue;
        const ag = (host.agents||[]).find(a => a.id === m.agent_id);
        if(ag){
          ag.members = (ag.members||[]).filter(x => x.user_id !== user.id);
          await DB.save(host);
        }
      } catch(e){ console.warn('[delete] cleanup membership failed:', e.message); }
    }
    // Delete the user row itself
    try {
      if(USE_SUPA){
        await sbReq('DELETE','users','?id=eq.'+encodeURIComponent(user.id));
      } else {
        LDB.del(user.id);
      }
    } catch(e){
      console.error('[delete] user delete failed:', e.message);
      return jres(res,500,{error:'削除に失敗しました', detail: e.message});
    }
    return jres(res, 200, { ok:true, deleted: true });
  }

  // ── POST /api/agents/:id/pin ───────────────────────────────
  // body: { idx: number, on: bool } — pin/unpin a message in chat
  // Different from bookmark: pinned messages are surfaced at top of chat
  // for ALL members; bookmarks are per-user.
  const pinM = pathname.match(/^\/api\/agents\/([^/]+)\/pin$/);
  if(pinM && method === 'POST'){
    const agId = pinM[1];
    const body = await readBody(req) || {};
    const idx = parseInt(body.idx, 10);
    const on = !!body.on;
    let ag = (user.agents||[]).find(a => a.id === agId);
    let target = user;
    if(!ag){
      const ms = (user.group_memberships||[]).find(g => g.agent_id === agId);
      if(!ms) return jres(res,404,{error:'エージェントが見つかりません'});
      const host = await DB.findBy('id', ms.host_id);
      if(!host) return jres(res,404,{error:'ホストが見つかりません'});
      target = host;
      ag = (host.agents||[]).find(a => a.id === agId);
    }
    if(!ag || !Array.isArray(ag.history) || idx < 0 || idx >= ag.history.length){
      return jres(res,400,{error:'メッセージが見つかりません'});
    }
    // Group: only host or member can pin (already auth'd as member). Solo: only owner.
    // Cap to 5 pins so UI doesn't overflow
    ag.pinned_idxs = Array.isArray(ag.pinned_idxs) ? ag.pinned_idxs : [];
    if(on){
      if(!ag.pinned_idxs.includes(idx)) ag.pinned_idxs.push(idx);
      if(ag.pinned_idxs.length > 5){
        ag.pinned_idxs = ag.pinned_idxs.slice(-5);
      }
    } else {
      ag.pinned_idxs = ag.pinned_idxs.filter(i => i !== idx);
    }
    ag.history[idx].pinned = on;
    await DB.save(target);
    return jres(res,200,{ok:true, pinned: on, pinned_idxs: ag.pinned_idxs});
  }

  // ── POST /api/agents/:id/bookmark ──────────────────────────
  // body: { idx: number, on: bool }  — flag a message as bookmarked
  const bmM = pathname.match(/^\/api\/agents\/([^/]+)\/bookmark$/);
  if(bmM && method === 'POST'){
    const agId = bmM[1];
    const body = await readBody(req) || {};
    const idx = parseInt(body.idx, 10);
    const on = !!body.on;
    let ag = (user.agents||[]).find(a => a.id === agId);
    let target = user;
    if(!ag){
      const ms = (user.group_memberships||[]).find(g => g.agent_id === agId);
      if(!ms) return jres(res,404,{error:'エージェントが見つかりません'});
      const host = await DB.findBy('id', ms.host_id);
      if(!host) return jres(res,404,{error:'ホストが見つかりません'});
      target = host;
      ag = (host.agents||[]).find(a => a.id === agId);
    }
    if(!ag || !Array.isArray(ag.history) || idx < 0 || idx >= ag.history.length){
      return jres(res,400,{error:'メッセージが見つかりません'});
    }
    // bookmarks are stored per-user (different members can bookmark differently)
    const m = ag.history[idx];
    m.bookmarked_by = Array.isArray(m.bookmarked_by) ? m.bookmarked_by : [];
    if(on){
      if(!m.bookmarked_by.includes(user.id)) m.bookmarked_by.push(user.id);
    } else {
      m.bookmarked_by = m.bookmarked_by.filter(id => id !== user.id);
    }
    // For solo agents (caller is owner), also keep the legacy `bookmarked` flag
    if(target === user) m.bookmarked = on;
    ag.history[idx] = m;
    await DB.save(target);
    return jres(res,200,{ok:true, bookmarked: on});
  }

  // ── POST /api/agents/:id/messages/:idx/react ───────────────
  // body: { emoji: string, op: 'toggle'|'add'|'remove' (default toggle) }
  // Each user has at most one of each emoji per message.
  const reactM = pathname.match(/^\/api\/agents\/([^/]+)\/messages\/(\d+)\/react$/);
  if(reactM && method === 'POST'){
    const agId = reactM[1];
    const idx = parseInt(reactM[2], 10);
    const body = await readBody(req);
    const emoji = ((body && body.emoji) || '').toString().slice(0, 16);
    const op = ((body && body.op) || 'toggle').toString();
    if(!emoji) return jres(res,400,{error:'emoji is required'});

    // Resolve agent + host
    let ag = (user.agents||[]).find(a => a.id === agId);
    let target = user;
    if(!ag){
      const ms = (user.group_memberships||[]).find(g => g.agent_id === agId);
      if(!ms) return jres(res,404,{error:'エージェントが見つかりません'});
      const host = await DB.findBy('id', ms.host_id);
      if(!host) return jres(res,404,{error:'ホストが見つかりません'});
      target = host;
      ag = (host.agents||[]).find(a => a.id === agId);
    }
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    if(!Array.isArray(ag.history) || idx < 0 || idx >= ag.history.length){
      return jres(res,400,{error:'メッセージが見つかりません'});
    }

    const msg = ag.history[idx];
    msg.reactions = Array.isArray(msg.reactions) ? msg.reactions : [];
    const existing = msg.reactions.find(r => r.user_id === user.id && r.emoji === emoji);

    if(op === 'remove' || (op === 'toggle' && existing)){
      msg.reactions = msg.reactions.filter(r => !(r.user_id === user.id && r.emoji === emoji));
    } else if(!existing){
      msg.reactions.push({
        user_id: user.id,
        name: user.name || (user.email||'').split('@')[0] || 'メンバー',
        emoji,
        at: new Date().toISOString(),
      });
    }
    ag.history[idx] = msg;
    await DB.save(target);
    return jres(res,200,{ok:true, reactions: msg.reactions});
  }

  // ── POST /api/generate/image ───────────────────────────────
  // body: { prompt: string, agent_id?: string }
  // Generates an image via Replicate (env-gated). On success, returns
  // image URL(s) AND optionally pushes a system message into the agent's
  // history so the conversation reflects the generation.
  if(pathname === '/api/generate/image' && method === 'POST'){
    const body = await readBody(req) || {};
    const prompt = (body.prompt || '').toString().trim();
    if(!prompt) return jres(res,400,{error:'prompt is required'});
    if(prompt.length > 500) return jres(res,400,{error:'prompt が長すぎます (500文字以内)'});
    // Free-tier check: count this as 1 message
    if((user.usage_count||0) >= 10 && (user.balance_jpy||0) <= 0){
      return jres(res,402,{error:'残高が不足しています'});
    }
    try {
      const out = await generateImage(prompt);
      // Cost: ~$0.0035 per SDXL image ≈ ¥0.5; round up to ¥3 for buffer
      const cost = 3;
      user.balance_jpy = Math.round(((user.balance_jpy||0) - cost)*1000)/1000;
      user.usage_count = (user.usage_count||0) + 1;
      user.billing_history = user.billing_history || [];
      user.billing_history.push({date:new Date().toISOString(),type:'image_gen',prompt:prompt.slice(0,80),cost_jpy:cost});
      if(user.billing_history.length > 1000) user.billing_history = user.billing_history.slice(-1000);
      await DB.save(user);
      return jres(res,200,{ok:true, urls: out.urls, prompt, cost_jpy: cost});
    } catch(e){
      const msg = e.message || 'image generation failed';
      const isConfig = msg.includes('not_configured');
      return jres(res, isConfig ? 503 : 500, {
        error: isConfig ? '画像生成は現在準備中です (REPLICATE_API_TOKEN 未設定)' : msg,
        code: isConfig ? 'image_gen_not_configured' : 'image_gen_failed',
      });
    }
  }

  // ── POST /api/chat/:agent_id/suggest ───────────────────────
  // After an assistant reply lands, the UI fires this to get 3 short
  // follow-up prompts. Cheap (haiku, ~60 input / 30 output tokens).
  const sugm = pathname.match(/^\/api\/chat\/([^/]+)\/suggest$/);
  if(sugm && method === 'POST'){
    const ag = (user.agents||[]).find(a => a.id===sugm[1]);
    if(!ag) return jres(res,404,{error:'agent not found'});
    const hist = (ag.history||[]).slice(-4);
    const lastAssistant = [...hist].reverse().find(m => m.role==='assistant');
    if(!lastAssistant || !lastAssistant.content){
      return jres(res,200,{ suggestions: [] });
    }
    try {
      const sys = 'You produce short follow-up question suggestions for a chat UI. Given the assistant\'s most recent reply, write exactly 3 follow-up questions or requests the user might tap next. Constraints:\n- Each is one short sentence, ≤ 50 characters.\n- Use the same language as the assistant\'s reply (Japanese if Japanese, English if English).\n- No numbering, no quotes. Output ONLY the 3 lines separated by newlines.';
      const lastUser = [...hist].reverse().find(m => m.role==='user');
      const lines = [];
      if(lastUser && lastUser.content) lines.push('USER: ' + String(lastUser.content).slice(0,400));
      lines.push('ASSISTANT: ' + String(lastAssistant.content).slice(0,1200));
      const msgs = [{ role:'user', content: lines.join('\n\n') }];
      const r = await callAI(msgs, sys, 'haiku');
      const text = (r && r.content && r.content[0] && r.content[0].text) || '';
      const suggestions = text.split(/\r?\n/).map(s => s.replace(/^[\-\d\.\)\s•]+/, '').trim()).filter(Boolean).slice(0,3);
      return jres(res,200,{ suggestions });
    } catch(e){
      return jres(res,200,{ suggestions: [], error: (e&&e.message||'').slice(0,120) });
    }
  }

  // ── PUT /api/me/handle ─────────────────────────────────────
  // Sets or updates the user's public handle (used on /u/:handle).
  // 3-30 chars, [a-z0-9_]. Must be unique.
  if(pathname === '/api/me/handle' && method === 'PUT'){
    const body = (await readBody(req)) || {};
    const raw = String(body.handle||'').trim().toLowerCase();
    if(!/^[a-z0-9_]{3,30}$/.test(raw)){
      return jres(res,400,{error:'ハンドルは 3-30 文字の半角英数字/アンダースコアのみです'});
    }
    // Reserved names so users don't squat on routes.
    const reserved = new Set(['admin','api','app','auth','dashboard','help','home','login','signup','support','staff','team','user','users','www','agent','agents','store','marketplace']);
    if(reserved.has(raw)) return jres(res,400,{error:'予約済みのハンドルです'});
    // Already mine? No-op.
    if((user.handle||'').toLowerCase() === raw){
      return jres(res,200,{ handle: raw });
    }
    // Uniqueness check.
    try {
      if(USE_SUPA){
        const r = await sbReq('GET','users','?select=id,handle&handle=eq.'+encodeURIComponent(raw)+'&limit=1');
        if(Array.isArray(r.d) && r.d.length && r.d[0].id !== user.id){
          return jres(res,409,{error:'そのハンドルはすでに使われています'});
        }
      } else {
        const other = LDB.find(u => (u.handle||'').toLowerCase() === raw && u.id !== user.id);
        if(other) return jres(res,409,{error:'そのハンドルはすでに使われています'});
      }
    } catch(e){}
    user.handle = raw;
    await DB.save(user);
    return jres(res,200,{ handle: raw });
  }

  // ── POST /api/me/memories ──────────────────────────────────
  // Long-term memory: facts the user wants the AI to remember across
  // chats (preferences, name, role, project context).
  // GET — list. POST — add. DELETE /api/me/memories/:idx — remove.
  if(pathname === '/api/me/memories' && method === 'GET'){
    return jres(res, 200, { memories: user.memories || [] });
  }
  if(pathname === '/api/me/memories' && method === 'POST'){
    const body = await readBody(req) || {};
    const text = (body.text || '').toString().trim().slice(0, 500);
    if(!text) return jres(res,400,{error:'text is required'});
    user.memories = Array.isArray(user.memories) ? user.memories : [];
    user.memories.push({
      text,
      tag: (body.tag || '').toString().slice(0, 32),
      added_at: new Date().toISOString(),
    });
    if(user.memories.length > 50) user.memories = user.memories.slice(-50);
    await DB.save(user);
    return jres(res,200,{ok:true, memories: user.memories});
  }
  const memDelM = pathname.match(/^\/api\/me\/memories\/(\d+)$/);
  if(memDelM && method === 'DELETE'){
    const idx = parseInt(memDelM[1], 10);
    if(!Array.isArray(user.memories) || idx < 0 || idx >= user.memories.length){
      return jres(res,404,{error:'memory not found'});
    }
    user.memories.splice(idx, 1);
    await DB.save(user);
    return jres(res,200,{ok:true, memories: user.memories});
  }

  // ── Scheduled reminders (lightweight: stored on user, fired by cron) ─
  // POST: {at, text, agent_id?}  GET: list  DELETE/:id: remove
  if(pathname === '/api/me/reminders' && method === 'GET'){
    return jres(res,200,{reminders: user.reminders || []});
  }
  if(pathname === '/api/me/reminders' && method === 'POST'){
    const body = await readBody(req) || {};
    const at = (body.at || '').toString();
    const text = (body.text || '').toString().trim().slice(0, 200);
    const agent_id = (body.agent_id || '').toString();
    if(!at || !text) return jres(res,400,{error:'at + text required'});
    const t = new Date(at).getTime();
    if(!isFinite(t) || t <= Date.now()) return jres(res,400,{error:'at must be a future ISO timestamp'});
    user.reminders = Array.isArray(user.reminders) ? user.reminders : [];
    user.reminders.push({
      id: 'rem_' + crypto.randomBytes(4).toString('hex'),
      at, text, agent_id,
      created_at: new Date().toISOString(),
    });
    await DB.save(user);
    return jres(res,200,{ok:true, reminders: user.reminders});
  }
  const remDelM = pathname.match(/^\/api\/me\/reminders\/(rem_[a-f0-9]{8})$/);
  if(remDelM && method === 'DELETE'){
    const id = remDelM[1];
    user.reminders = (user.reminders||[]).filter(r => r.id !== id);
    await DB.save(user);
    return jres(res,200,{ok:true, reminders: user.reminders});
  }

  // ── POST /api/agents/:id/notify-pref ───────────────────────
  // Per-user notification preference for a group.
  // body: { pref: 'all' | 'mentions' | 'mute' }
  const npM = pathname.match(/^\/api\/agents\/([^/]+)\/notify-pref$/);
  if(npM && method === 'POST'){
    const agId = npM[1];
    const body = await readBody(req);
    const pref = ['all','mentions','mute'].includes(body && body.pref) ? body.pref : 'all';
    let ag = (user.agents||[]).find(a => a.id === agId);
    let target = user;
    if(!ag){
      const m = (user.group_memberships||[]).find(g => g.agent_id === agId);
      if(!m) return jres(res,404,{error:'エージェントが見つかりません'});
      const host = await DB.findBy('id', m.host_id);
      if(!host) return jres(res,404,{error:'ホストが見つかりません'});
      target = host;
      ag = (host.agents||[]).find(a => a.id === agId);
      if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    }
    ag.members = (ag.members || []).map(m =>
      m.user_id === user.id ? {...m, notify_pref: pref} : m
    );
    await DB.save(target);
    return jres(res,200,{ok:true, pref});
  }

  // ── POST /api/agents/:id/read ──────────────────────────────
  // Mark the chat as read up to current history length for the calling user.
  // Updates agent.members[uid].last_read_idx in the host's record.
  const readM = pathname.match(/^\/api\/agents\/([^/]+)\/read$/);
  if(readM && method === 'POST'){
    const agId = readM[1];
    let ag = (user.agents||[]).find(a => a.id === agId);
    let target = user;
    if(!ag){
      const m = (user.group_memberships||[]).find(g => g.agent_id === agId);
      if(!m) return jres(res,404,{error:'エージェントが見つかりません'});
      const host = await DB.findBy('id', m.host_id);
      if(!host) return jres(res,404,{error:'ホストが見つかりません'});
      target = host;
      ag = (host.agents||[]).find(a => a.id === agId);
      if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    }
    const len = (ag.history || []).length;
    ag.members = (ag.members || []).map(m =>
      m.user_id === user.id ? {...m, last_read_idx: len, last_seen: new Date().toISOString()} : m
    );
    // Persist target (host record for joined groups, self for owned)
    await DB.save(target);
    return jres(res,200,{ok:true, last_read_idx: len, unread_count: 0});
  }

  // ── GET /api/g/:token (PUBLIC, no auth) ────────────────────
  // Preview info for the invite landing page. Returns 410 if expired/full.
  // NOTE: this branch is matched BEFORE auth middleware in the dispatcher
  // (see early routing). Here we duplicate-handle it just in case auth
  // already resolved — works either way since user may be null/undefined.

  // ── POST /api/g/:token/join ───────────────────────────────
  const joinM = pathname.match(/^\/api\/g\/([a-zA-Z0-9]{4,16})\/join$/);
  if(joinM && method === 'POST'){
    const token = joinM[1];
    const found = await findGroupByToken(token);
    if(!found) return jres(res,404,{error:'招待が見つかりません'});
    if(!isInviteValid(found.agent)){
      return jres(res,410,{error:'招待の期限切れまたは満員です'});
    }
    // Already a member? idempotent return.
    if((found.agent.members||[]).find(m => m.user_id === user.id)){
      return jres(res,200,{ok:true, already:true, agent_id: found.agent.id, host_id: found.host.id});
    }
    // Already requested? Return pending state.
    if((found.agent.pending_requests||[]).find(p => p.user_id === user.id)){
      return jres(res,202,{ok:true, pending:true, agent_id: found.agent.id, host_id: found.host.id});
    }
    // Approval required? Add to pending_requests, notify host (in-app via system msg).
    if(found.agent.invite_require_approval){
      found.agent.pending_requests = [...(found.agent.pending_requests||[]), {
        user_id: user.id,
        name: user.name || (user.email||'').split('@')[0] || 'メンバー',
        avatar: '',
        requested_at: new Date().toISOString(),
      }];
      await DB.save(found.host);
      return jres(res,202,{
        ok:true, pending:true,
        agent_id: found.agent.id,
        host_id: found.host.id,
        group_name: found.agent.name,
        message: 'ホストの承認待ちです',
      });
    }
    // Add to host's agent.members[]
    found.agent.members = [...(found.agent.members||[]), {
      user_id: user.id,
      name: user.name || (user.email||'').split('@')[0] || 'メンバー',
      avatar: '',
      role: 'member',
      joined_at: new Date().toISOString(),
      last_seen: new Date().toISOString(),
    }];
    // Append a system join message into history
    found.agent.history = [...(found.agent.history||[]), {
      role: 'system',
      type: 'join',
      user_id: user.id,
      user_name: user.name || 'メンバー',
      time: new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}),
      content: ((user.name||'メンバー') + ' さんが参加しました'),
    }];
    if(found.agent.history.length > 200) found.agent.history = found.agent.history.slice(-200);
    await DB.save(found.host);

    // Add membership entry on the joining user's record (unless they ARE the host)
    if(found.host.id !== user.id){
      user.group_memberships = user.group_memberships || [];
      if(!user.group_memberships.find(g => g.agent_id === found.agent.id)){
        user.group_memberships.push({
          host_id: found.host.id,
          agent_id: found.agent.id,
          joined_at: new Date().toISOString(),
        });
      }
      await DB.save(user);
    }
    return jres(res,200,{
      ok:true,
      agent_id: found.agent.id,
      host_id: found.host.id,
      group_name: found.agent.name,
    });
  }

  // ══ MARKETPLACE ════════════════════════════════════════════
  // ── GET /api/marketplace ───────────────────────────────────
  // Public list. Supports ?category= ?q= ?sort= ?tags= ?favorites=1
  if(pathname==='/api/marketplace' && method==='GET'){
    const qs = new url.URL(req.url, APP_URL).searchParams;
    const cat = (qs.get('category')||'').trim();
    const q = (qs.get('q')||'').trim().toLowerCase();
    const sort = (qs.get('sort')||'popular').trim();
    const windowParam = (qs.get('window')||'all').trim();
    const tagsRaw = (qs.get('tags')||'').trim();
    const tagFilter = tagsRaw ? tagsRaw.split(',').map(s=>s.trim()).filter(Boolean) : [];
    const onlyFavs = qs.get('favorites')==='1';
    let listings = await listAllPublicListings();
    if(cat && cat!=='all') listings = listings.filter(l=>l.category===cat);
    if(tagFilter.length){
      // AND match: listing must contain all selected tags
      listings = listings.filter(l=>tagFilter.every(t=>(l.tags||[]).indexOf(t)>=0));
    }
    if(onlyFavs){
      const favs = new Set(user.favorites||[]);
      listings = listings.filter(l=>favs.has(l.listing_id));
    }
    if(q){
      listings = listings.filter(l=>{
        const hay = (l.title+' '+l.description+' '+l.category_label+' '+(l.creator.handle||'')+' '+(l.tag_labels||[]).join(' ')).toLowerCase();
        return hay.indexOf(q)>=0;
      });
    }
    // Sorting
    if(sort==='recent'){
      listings.sort((a,b)=>new Date(b.listed_at||0).getTime()-new Date(a.listed_at||0).getTime());
    } else if(sort==='top_rated'){
      // Bayesian-ish: rating × log(1+count) so well-reviewed beats single-5★
      const score = l => (l.rating||0) * Math.log(1+(l.rating_count||0));
      listings.sort((a,b)=>score(b)-score(a));
    } else if(sort==='trending'){
      const now = Date.now();
      const windowDays = windowParam==='day' ? 1
                       : windowParam==='week' ? 7
                       : windowParam==='month' ? 30
                       : 0;
      if(windowDays > 0){
        const cutoff = now - windowDays*86400000;
        listings = listings.filter(l => new Date(l.listed_at||0).getTime() >= cutoff);
        listings.sort((a,b) => (b.uses||0) - (a.uses||0));
      } else {
        const score = l => {
          const ageDays = Math.max(0, (now - new Date(l.listed_at||0).getTime()) / 86400000);
          const decay = Math.exp(-ageDays / 14);
          return (l.uses||0) * (0.4 + 0.6*decay) + (l.rating_count||0) * 2 * decay;
        };
        listings.sort((a,b)=>score(b)-score(a));
      }
    } else {
      // popular = uses, with hot ribbon first (default)
      listings.sort((a,b)=>{
        if(a.badge==='hot' && b.badge!=='hot') return -1;
        if(b.badge==='hot' && a.badge!=='hot') return 1;
        return (b.uses||0)-(a.uses||0);
      });
    }
    return jres(res,200,{
      listings,
      categories: MARKET_CATEGORIES.map(id=>({id, label:MARKET_CAT_LABEL[id]})),
      tags: MARKET_TAGS,
      sort,
      favorites: user.favorites||[],
    });
  }

  // ── Favorites ───────────────────────────────────────────────
  // GET /api/favorites — list my favorited listings (full detail)
  if(pathname==='/api/favorites' && method==='GET'){
    const favSet = new Set(user.favorites||[]);
    const all = await listAllPublicListings();
    const mine = all.filter(l=>favSet.has(l.listing_id));
    return jres(res,200,{favorites: user.favorites||[], listings: mine});
  }
  // POST /api/favorites/:listing_id — add
  const favAdd = pathname.match(/^\/api\/favorites\/(ls_[a-z0-9_-]+)$/);
  if(favAdd && method==='POST'){
    const id = favAdd[1];
    user.favorites = user.favorites || [];
    if(user.favorites.indexOf(id) < 0) user.favorites.push(id);
    if(user.favorites.length > 200) user.favorites = user.favorites.slice(-200);
    await DB.save(user);
    return jres(res,200,{ok:true, favorites: user.favorites});
  }
  // DELETE /api/favorites/:listing_id — remove
  if(favAdd && method==='DELETE'){
    user.favorites = (user.favorites||[]).filter(x=>x!==favAdd[1]);
    await DB.save(user);
    return jres(res,200,{ok:true, favorites: user.favorites});
  }

  // ── POST /api/admin/users/:user_id/verify ──────────────────
  // Admin: toggle is_verified flag on a creator
  const vfm = pathname.match(/^\/api\/admin\/users\/([^/]+)\/verify$/);
  if(vfm && method==='POST'){
    if(!user.is_admin) return jres(res,403,{error:'管理者権限が必要です'});
    const target = await DB.findBy('id', vfm[1]);
    if(!target) return jres(res,404,{error:'ユーザーが見つかりません'});
    const body = await readBody(req);
    target.is_verified = body && typeof body.is_verified === 'boolean' ? body.is_verified : !target.is_verified;
    await DB.save(target);
    return jres(res,200,{ok:true, user_id: target.id, is_verified: target.is_verified});
  }

  // ── POST /api/admin/notify-founders ────────────────────────
  // One-shot mailer for the 100 Founder users. Idempotent: each user gets
  // `founder_email_sent` set on success so re-runs only target new entries.
  // Admin only. Body: { dry_run?: bool, force?: bool, only_seat?: number }.
  if(pathname === '/api/admin/notify-founders' && method === 'POST'){
    if(!user.is_admin) return jres(res,403,{error:'管理者権限が必要です'});
    const body = (await readBody(req)) || {};
    const dryRun = !!body.dry_run;
    const force = !!body.force;
    const onlySeat = (typeof body.only_seat === 'number') ? body.only_seat : null;
    let allUsers = [];
    try {
      if(USE_SUPA){
        const r = await sbReq('GET','users','?select=*&is_founder=eq.true&order=founder_seat_no.asc&limit=200');
        allUsers = Array.isArray(r.d) ? r.d : [];
      } else {
        allUsers = LDB.all().filter(u => u.is_founder).sort((a,b)=>(a.founder_seat_no||0)-(b.founder_seat_no||0));
      }
    } catch(e){ return jres(res,502,{error:'fetch_failed: '+e.message}); }
    const targets = allUsers.filter(u => {
      if(!u.email) return false;
      if(onlySeat !== null && u.founder_seat_no !== onlySeat) return false;
      if(!force && u.founder_email_sent) return false;
      return true;
    });
    if(dryRun){
      return jres(res,200,{
        dry_run: true,
        would_send: targets.length,
        targets: targets.map(t => ({ seat: t.founder_seat_no, email: t.email, already_sent: !!t.founder_email_sent })),
      });
    }
    const results = [];
    for(const t of targets){
      const seat = t.founder_seat_no || '?';
      const trial = (t.business_trial_until||'').slice(0,10);
      const handle = t.handle || '';
      const profileUrl = handle ? (APP_URL + '/u/' + handle) : (APP_URL + '/app.html');
      const isJa = /[ぁ-んァ-ヶー一-龠]/.test((t.name||'') + (t.email||''));
      const subj = isJa
        ? `🎉 あなたは Founder #${seat} に認定されました — MY AI AGENT`
        : `🎉 You're Founder #${seat} on MY AI AGENT`;
      const tweetText = encodeURIComponent(
        `I'm Founder #${seat} on @myaiagents 🎉\n\nBuild, run, and share your own AI team — first 100 creators get permanent badge + 1 month BUSINESS free.\n\n${profileUrl}`
      );
      const html = isJa ? `
<div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#faf7f2;color:#1c1c1f;line-height:1.7">
  <div style="text-align:center;margin-bottom:20px">
    <div style="display:inline-block;background:linear-gradient(135deg,#fb923c,#ea580c);color:#fff;padding:10px 26px;border-radius:999px;font-weight:900;font-size:18px;box-shadow:0 8px 20px rgba(234,88,12,.32)">★ Founder #${seat}</div>
  </div>
  <h1 style="font-size:22px;margin:0 0 16px;letter-spacing:-.01em">MY AI AGENT 最初の 100 人として正式に認定されました</h1>
  <p style="font-size:14px;color:#52525b;margin:0 0 14px">${_xmlEscape(t.name||'')} 様、</p>
  <p style="font-size:14px;color:#52525b;margin:0 0 14px">最初期にご登録いただいた感謝として、あなたは Founder 100 の <b>席 #${seat}</b> を獲得しました。これは退会しない限り永久バッジとして公開プロフィールに表示されます。</p>
  <div style="background:#fff;border:1px solid #f5e1cd;border-radius:12px;padding:18px;margin:18px 0">
    <div style="font-weight:800;font-size:14.5px;margin-bottom:10px">特典</div>
    <ul style="margin:0;padding-left:18px;color:#52525b;font-size:13.5px">
      <li>★ Founder #${seat} バッジを公開プロフィール (/u/handle) に永久表示</li>
      <li>BUSINESS プラン 1 ヶ月無料 (期限: ${_xmlEscape(trial)})</li>
      <li>新機能の優先案内</li>
    </ul>
  </div>
  <p style="font-size:14px;color:#52525b;margin:0 0 14px"><b>次のステップ:</b></p>
  <ol style="font-size:14px;color:#52525b;margin:0 0 18px;padding-left:18px">
    <li style="margin-bottom:6px">アプリで <a href="${APP_URL}/app.html" style="color:#ea580c">設定 → アカウント</a> を開き、<b>公開ハンドル (/u/...)</b> を 30 秒で登録</li>
    <li style="margin-bottom:6px">Founder バッジを SNS でシェアして仲間に教える (ボタン下記)</li>
    <li>新しく追加された <a href="${APP_URL}/changelog" style="color:#ea580c">Automations / KB / Schedule / Webhook</a> を試す</li>
  </ol>
  <div style="text-align:center;margin:24px 0">
    <a href="https://twitter.com/intent/tweet?text=${tweetText}" style="display:inline-block;background:#000;color:#fff;padding:13px 22px;border-radius:10px;font-weight:800;text-decoration:none;font-size:14px">𝕏 Founder #${seat} を X でシェア</a>
  </div>
  <p style="font-size:11.5px;color:#a1a1aa;margin-top:24px;text-align:center">— MY AI AGENT chief steward</p>
</div>` : `
<div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#faf7f2;color:#1c1c1f;line-height:1.7">
  <div style="text-align:center;margin-bottom:20px">
    <div style="display:inline-block;background:linear-gradient(135deg,#fb923c,#ea580c);color:#fff;padding:10px 26px;border-radius:999px;font-weight:900;font-size:18px;box-shadow:0 8px 20px rgba(234,88,12,.32)">★ Founder #${seat}</div>
  </div>
  <h1 style="font-size:22px;margin:0 0 16px;letter-spacing:-.01em">You're officially one of the first 100 creators on MY AI AGENT</h1>
  <p style="font-size:14px;color:#52525b;margin:0 0 14px">Hi ${_xmlEscape(t.name||'')},</p>
  <p style="font-size:14px;color:#52525b;margin:0 0 14px">As thanks for being here from the start, we've granted you <b>Founder seat #${seat}</b>. The badge sits permanently on your profile.</p>
  <div style="background:#fff;border:1px solid #f5e1cd;border-radius:12px;padding:18px;margin:18px 0">
    <div style="font-weight:800;font-size:14.5px;margin-bottom:10px">What you get</div>
    <ul style="margin:0;padding-left:18px;color:#52525b;font-size:13.5px">
      <li>★ Founder #${seat} badge on your public profile (/u/handle), forever</li>
      <li>1 month of BUSINESS plan free (until ${_xmlEscape(trial)})</li>
      <li>Early access to new features</li>
    </ul>
  </div>
  <p style="font-size:14px;color:#52525b;margin:0 0 14px"><b>Next steps:</b></p>
  <ol style="font-size:14px;color:#52525b;margin:0 0 18px;padding-left:18px">
    <li style="margin-bottom:6px">Open <a href="${APP_URL}/app.html" style="color:#ea580c">Settings → Account</a> and claim your <b>@handle</b> (takes 30 seconds)</li>
    <li style="margin-bottom:6px">Tweet your badge — let your network know (button below)</li>
    <li>Try the new <a href="${APP_URL}/changelog" style="color:#ea580c">Automations / Knowledge Base / Schedule / Webhook</a> features</li>
  </ol>
  <div style="text-align:center;margin:24px 0">
    <a href="https://twitter.com/intent/tweet?text=${tweetText}" style="display:inline-block;background:#000;color:#fff;padding:13px 22px;border-radius:10px;font-weight:800;text-decoration:none;font-size:14px">𝕏 Share Founder #${seat} on X</a>
  </div>
  <p style="font-size:11.5px;color:#a1a1aa;margin-top:24px;text-align:center">— MY AI AGENT chief steward</p>
</div>`;
      try {
        await sendEmail(t.email, subj, html);
        t.founder_email_sent = new Date().toISOString();
        try { await DB.save(t); } catch(e){ console.warn('[notify-founders] save', t.email, e.message); }
        results.push({ seat, email: t.email, ok: true });
      } catch(e){
        results.push({ seat, email: t.email, ok: false, error: e.message });
      }
    }
    return jres(res,200,{ sent: results.filter(r=>r.ok).length, failed: results.filter(r=>!r.ok).length, results });
  }

  // ── GET /api/admin/stats ───────────────────────────────────
  // Returns aggregate metrics for the admin dashboard. Admin only.
  if(pathname === '/api/admin/stats' && method === 'GET'){
    if(!user.is_admin) return jres(res,403,{error:'管理者権限が必要です'});

    let allUsers = [];
    try{
      if(USE_SUPA){
        // Pull all users (could be paginated for large scale, but Supabase
        // returns up to 1000 per request which is plenty for now)
        const r = await sbReq('GET','users','?select=*&limit=10000');
        if(r.s >= 400){
          console.error('[admin/stats] Supabase fetch failed:', r.s, JSON.stringify(r.d).slice(0,200));
          return jres(res, 502, { error: 'Supabase fetch failed: ' + r.s });
        }
        allUsers = Array.isArray(r.d) ? r.d : [];
      } else {
        allUsers = LDB.all();
      }
    }catch(e){
      console.error('[admin/stats] fetch threw:', e.message);
      return jres(res, 502, { error: 'fetch_failed: ' + e.message });
    }

    // Wrap the whole aggregation in try/catch so one bad record doesn't
    // crash the whole endpoint.
    try{
    // Defensive: some legacy users may have agents/billing_history stored as
    // objects (not arrays) or null. Normalize before aggregation so .filter /
    // .reduce / .forEach won't throw.
    const _arr = (v) => Array.isArray(v) ? v : [];
    allUsers = allUsers.map(u => ({
      ...u,
      agents: _arr(u.agents),
      billing_history: _arr(u.billing_history),
      revenue_history: _arr(u.revenue_history),
      payout_history: _arr(u.payout_history),
      favorites: _arr(u.favorites),
    }));

    const now = Date.now();
    const day = 24*60*60*1000;
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);

    // ── User stats ─────────────────────────
    const totalUsers = allUsers.length;
    const verifiedUsers = allUsers.filter(u=>u.verified).length;
    const adminCount = allUsers.filter(u=>u.is_admin).length;
    const planCounts = { free:0, pro:0, business:0, payg:0 };
    allUsers.forEach(u=>{ const p=u.plan||'free'; planCounts[p] = (planCounts[p]||0)+1; });

    const newToday    = allUsers.filter(u=>u.created_at && new Date(u.created_at).getTime() >= todayStart.getTime()).length;
    const newThisWeek = allUsers.filter(u=>u.created_at && now - new Date(u.created_at).getTime() <= 7*day).length;
    const newThisMonth= allUsers.filter(u=>u.created_at && now - new Date(u.created_at).getTime() <= 30*day).length;

    // Daily signup chart for last 30 days
    const signupsByDay = new Array(30).fill(0);
    allUsers.forEach(u=>{
      if(!u.created_at) return;
      const t = new Date(u.created_at).getTime();
      const daysAgo = Math.floor((now - t) / day);
      if(daysAgo >= 0 && daysAgo < 30) signupsByDay[29 - daysAgo]++;
    });

    // ── Agent stats ────────────────────────
    const totalAgents = allUsers.reduce((s,u)=>s+(Array.isArray(u.agents)?u.agents.length:0), 0);
    const usersWithAgents = allUsers.filter(u=>Array.isArray(u.agents) && u.agents.length>0).length;
    const chromeAgents = allUsers.reduce((s,u)=>s+(u.agents||[]).filter(a=>a.chrome_enabled).length, 0);
    const sheetsAgents = allUsers.reduce((s,u)=>s+(u.agents||[]).filter(a=>a.sheets_enabled).length, 0);
    const extensionAgents = allUsers.reduce((s,u)=>s+(u.agents||[]).filter(a=>a.extension_enabled).length, 0);

    // ── Marketplace ────────────────────────
    let totalListings=0, totalListingUses=0;
    allUsers.forEach(u=>{
      (u.agents||[]).forEach(a=>{
        if(a.marketplace && a.marketplace.is_listed){
          totalListings++;
          totalListingUses += (a.marketplace.uses_count||0);
        }
      });
    });

    // ── Revenue & usage from billing_history ──
    let totalChatMessages=0, totalCostJpy=0, totalInputTokens=0, totalOutputTokens=0;
    let chargeRevenueJpy=0, subRevenueJpy=0;
    let messagesToday=0, messagesThisWeek=0, costToday=0, costThisWeek=0;
    const messagesByDay = new Array(30).fill(0);
    const revenueByDay  = new Array(30).fill(0);

    allUsers.forEach(u=>{
      (u.billing_history||[]).forEach(ev=>{
        const t = ev.date ? new Date(ev.date).getTime() : 0;
        const daysAgo = Math.floor((now - t) / day);
        if(ev.type === 'usage'){
          totalChatMessages++;
          totalCostJpy += (ev.cost_jpy||0);
          totalInputTokens += (ev.input_tokens||0);
          totalOutputTokens += (ev.output_tokens||0);
          if(t >= todayStart.getTime()) { messagesToday++; costToday += (ev.cost_jpy||0); }
          if(now - t <= 7*day)          { messagesThisWeek++; costThisWeek += (ev.cost_jpy||0); }
          if(daysAgo >= 0 && daysAgo < 30) messagesByDay[29 - daysAgo]++;
        } else if(ev.type === 'charge' || ev.type === 'topup'){
          chargeRevenueJpy += (ev.amount_jpy||0);
          if(daysAgo >= 0 && daysAgo < 30) revenueByDay[29 - daysAgo] += (ev.amount_jpy||0);
        } else if(ev.type === 'subscription' || ev.type === 'sub_payment'){
          subRevenueJpy += (ev.amount_jpy||0);
          if(daysAgo >= 0 && daysAgo < 30) revenueByDay[29 - daysAgo] += (ev.amount_jpy||0);
        }
      });
    });

    // MRR estimate: pro $12.99 + biz $32.99 in JPY (~150 yen rate)
    const mrr = (planCounts.pro||0) * 1950 + (planCounts.business||0) * 4950;

    // ── Top users / listings ────────────────
    const topUsersByMessages = allUsers
      .map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        plan: u.plan||'free',
        messages: (u.billing_history||[]).filter(e=>e.type==='usage').length,
        cost_jpy: (u.billing_history||[]).filter(e=>e.type==='usage').reduce((s,e)=>s+(e.cost_jpy||0),0),
        agents: (u.agents||[]).length,
        created_at: u.created_at,
      }))
      .sort((a,b)=>b.messages - a.messages)
      .slice(0,10);

    const recentSignups = allUsers
      .filter(u=>u.created_at)
      .sort((a,b)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0,10)
      .map(u=>({
        id:u.id, name:u.name, email:u.email, plan:u.plan||'free',
        verified:!!u.verified, google: !!u.google_id,
        created_at:u.created_at, agents: (u.agents||[]).length,
      }));

    const topListings = [];
    allUsers.forEach(u=>{
      (u.agents||[]).forEach(a=>{
        if(a.marketplace && a.marketplace.is_listed){
          topListings.push({
            listing_id: a.marketplace.listing_id,
            name: a.name,
            avatar: a.avatar,
            creator: u.name,
            uses_count: a.marketplace.uses_count||0,
            avg_rating: a.marketplace.avg_rating||null,
            review_count: (a.marketplace.reviews||[]).length,
            created_at: a.marketplace.listed_at,
          });
        }
      });
    });
    topListings.sort((a,b)=>b.uses_count - a.uses_count);

    // ── Extension pairings ─────────────────
    const extensionPaired = allUsers.filter(u=>u.extension_device_token).length;
    const extensionConnected = Array.from(_extConnections.keys()).length;

    // ── Sheets connections ─────────────────
    const sheetsConnected = allUsers.filter(u=>u.google_oauth && u.google_oauth.refresh_token).length;

    return jres(res,200,{
      generated_at: new Date().toISOString(),
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        admin: adminCount,
        by_plan: planCounts,
        new_today: newToday,
        new_this_week: newThisWeek,
        new_this_month: newThisMonth,
        signups_by_day: signupsByDay,
      },
      agents: {
        total: totalAgents,
        avg_per_user: usersWithAgents ? +(totalAgents/usersWithAgents).toFixed(2) : 0,
        with_chrome: chromeAgents,
        with_sheets: sheetsAgents,
        with_extension: extensionAgents,
      },
      marketplace: {
        total_listings: totalListings,
        total_uses: totalListingUses,
      },
      messages: {
        total: totalChatMessages,
        today: messagesToday,
        this_week: messagesThisWeek,
        by_day: messagesByDay,
      },
      tokens: {
        input_total: totalInputTokens,
        output_total: totalOutputTokens,
      },
      revenue: {
        total_cost_jpy: Math.round(totalCostJpy),
        cost_today: Math.round(costToday),
        cost_this_week: Math.round(costThisWeek),
        topup_revenue_jpy: Math.round(chargeRevenueJpy),
        sub_revenue_jpy: Math.round(subRevenueJpy),
        mrr_estimate_jpy: mrr,
        revenue_by_day: revenueByDay.map(v=>Math.round(v)),
      },
      integrations: {
        sheets_connected: sheetsConnected,
        extension_paired: extensionPaired,
        extension_online: extensionConnected,
      },
      top_users: topUsersByMessages,
      recent_signups: recentSignups,
      top_listings: topListings.slice(0,10),
    });
    }catch(e){
      console.error('[admin/stats] aggregation threw:', e.message, e.stack);
      return jres(res, 500, { error: 'aggregation_failed: ' + e.message });
    }
  }

  // ── GET /api/marketplace/:listing_id ───────────────────────
  // Single listing detail (full description, demo prompts, reviews, my-review flag)
  const dlmGet = pathname.match(/^\/api\/marketplace\/(ls_[a-z0-9_-]+)$/);
  if(dlmGet && method==='GET'){
    const found = await findAgentByListingId(dlmGet[1]);
    if(!found) return jres(res,404,{error:'出店が見つかりません'});
    if(!found.agent.marketplace.is_listed) return jres(res,404,{error:'この出店は公開されていません'});
    const detail = publicListing(found.user, found.agent);
    const reviews = (found.agent.marketplace.reviews||[]).slice().reverse(); // newest first
    const myReview = reviews.find(r=>r.user_id===user.id) || null;
    return jres(res,200,{
      ...detail,
      reviews: reviews.map(r=>({
        handle: r.handle,
        rating: r.rating,
        comment: r.comment||'',
        date: r.date,
        edited_at: r.edited_at||null,
        is_mine: r.user_id===user.id,
      })),
      my_review: myReview ? {rating: myReview.rating, comment: myReview.comment||''} : null,
      can_review: found.user.id !== user.id,                 // can't review own listing
      is_own: found.user.id === user.id,
    });
  }

  // ── POST /api/marketplace/:listing_id/review ───────────────
  // body: {rating: 1-5, comment?}
  const rvm = pathname.match(/^\/api\/marketplace\/(ls_[a-z0-9_-]+)\/review$/);
  if(rvm && method==='POST'){
    const body = await readBody(req);
    const rating = parseInt(body.rating, 10);
    const comment = String(body.comment||'').trim().slice(0,1000);
    if(!(rating>=1 && rating<=5)) return jres(res,400,{error:'評価は 1〜5 で入力してください'});
    const found = await findAgentByListingId(rvm[1]);
    if(!found) return jres(res,404,{error:'出店が見つかりません'});
    if(found.user.id === user.id) return jres(res,400,{error:'自分の出店には評価できません'});
    found.agent.marketplace.reviews = found.agent.marketplace.reviews || [];
    const reviews = found.agent.marketplace.reviews;
    const existingIdx = reviews.findIndex(r=>r.user_id===user.id);
    const handle = '@'+(user.email||'').split('@')[0];
    if(existingIdx>=0){
      reviews[existingIdx] = {
        ...reviews[existingIdx],
        rating, comment,
        edited_at: new Date().toISOString(),
      };
    } else {
      reviews.push({
        user_id: user.id,
        handle,
        rating, comment,
        date: new Date().toISOString(),
      });
    }
    recomputeRatings(found.agent.marketplace);
    await DB.save(found.user);
    return jres(res,200,{ok:true, rating: found.agent.marketplace.rating_avg, count: found.agent.marketplace.rating_count});
  }

  // ── DELETE /api/marketplace/:listing_id/review ─────────────
  const drvm = pathname.match(/^\/api\/marketplace\/(ls_[a-z0-9_-]+)\/review$/);
  if(drvm && method==='DELETE'){
    const found = await findAgentByListingId(drvm[1]);
    if(!found) return jres(res,404,{error:'出店が見つかりません'});
    const reviews = found.agent.marketplace.reviews || [];
    const before = reviews.length;
    found.agent.marketplace.reviews = reviews.filter(r=>r.user_id!==user.id);
    if(found.agent.marketplace.reviews.length === before){
      return jres(res,404,{error:'削除する評価がありません'});
    }
    recomputeRatings(found.agent.marketplace);
    await DB.save(found.user);
    return jres(res,200,{ok:true, rating: found.agent.marketplace.rating_avg, count: found.agent.marketplace.rating_count});
  }

  // ── GET /api/marketplace/listings/mine ─────────────────────
  if(pathname==='/api/marketplace/listings/mine' && method==='GET'){
    const mine = (user.agents||[]).filter(a=>a.marketplace).map(a=>({
      agent_id: a.id,
      agent_name: a.name,
      agent_avatar: a.avatar,
      ...a.marketplace,
    }));
    return jres(res,200,{listings: mine});
  }

  // ── GET /api/creator/earnings ──────────────────────────────
  // Returns: pending / available / total / daily timeline / per-agent (this month) / recent feed
  if(pathname==='/api/creator/earnings' && method==='GET'){
    const rh = user.revenue_history || [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Daily totals (last 30 days)
    const daily = [];
    for(let i=29; i>=0; i--){
      const d = new Date(today.getTime() - i*86400000);
      daily.push({
        date: d.toISOString().slice(0,10),
        share_jpy: 0,
        uses: 0,
      });
    }
    const dayIdx = {};
    daily.forEach((d,i)=>{ dayIdx[d.date]=i; });

    // Aggregations
    const byAgent = {};                      // {agent_name: {share, uses}}
    let total = 0, thisMonth = 0;

    for(const r of rh){
      const dt = new Date(r.date);
      const key = dt.toISOString().slice(0,10);
      total += r.share_jpy || 0;
      if(dt >= monthStart) thisMonth += r.share_jpy || 0;
      if(dayIdx[key] !== undefined){
        daily[dayIdx[key]].share_jpy = _r3(daily[dayIdx[key]].share_jpy + (r.share_jpy||0));
        daily[dayIdx[key]].uses += 1;
      }
      const an = r.agent_name || '(不明)';
      if(!byAgent[an]) byAgent[an] = {agent_name:an, share_jpy:0, uses:0, this_month_jpy:0, this_month_uses:0};
      byAgent[an].share_jpy = _r3(byAgent[an].share_jpy + (r.share_jpy||0));
      byAgent[an].uses += 1;
      if(dt >= monthStart){
        byAgent[an].this_month_jpy = _r3(byAgent[an].this_month_jpy + (r.share_jpy||0));
        byAgent[an].this_month_uses += 1;
      }
    }

    return jres(res,200,{
      balance_pending: _r3(user.balance_jpy_pending||0),
      balance_available: _r3(user.balance_jpy_available||0),
      total_earned: _r3(total),
      this_month: _r3(thisMonth),
      revenue_share_rate: USAGE_SHARE_RATE,
      purchase_share_rate: PURCHASE_SHARE_RATE,
      pending_days: PENDING_DAYS,
      daily,
      by_agent: Object.values(byAgent).sort((a,b)=>b.share_jpy-a.share_jpy),
      recent: rh.slice(-30).reverse(),
    });
  }

  // ── POST /api/payout/onboard ───────────────────────────────
  // Create Stripe Connect Express account if missing, return onboarding URL
  if(pathname==='/api/payout/onboard' && method==='POST'){
    if(!STRIPE_SK) return jres(res,503,{error:'Stripe が設定されていません'});
    try{
      let acctId = user.stripe_connect_id;
      if(!acctId){
        const acct = await stripeConnectCreateAccount(user.email);
        acctId = acct.id;
        user.stripe_connect_id = acctId;
        await DB.save(user);
      }
      const link = await stripeConnectOnboardingLink(
        acctId,
        APP_URL + '/app.html?payout=onboarded',
        APP_URL + '/app.html?payout=refresh',
      );
      return jres(res,200,{url: link.url, account_id: acctId});
    }catch(e){
      return jres(res,500,{error:'Stripe Connect エラー: '+e.message});
    }
  }

  // ── GET /api/payout/status ─────────────────────────────────
  // Refresh Connect account state from Stripe; cache key flags on user
  if(pathname==='/api/payout/status' && method==='GET'){
    if(!user.stripe_connect_id){
      return jres(res,200,{
        onboarded: false,
        payouts_enabled: false,
        balance_available: _r3(user.balance_jpy_available||0),
        balance_pending: _r3(user.balance_jpy_pending||0),
        min_jpy: PAYOUT_MIN_JPY,
        history: (user.payout_history||[]).slice(-30).reverse(),
      });
    }
    try{
      const acct = await stripeConnectGetAccount(user.stripe_connect_id);
      const payoutsEnabled = !!acct.payouts_enabled;
      user.stripe_connect_payouts_enabled = payoutsEnabled;
      user.stripe_connect_charges_enabled = !!acct.charges_enabled;
      user.stripe_connect_details_submitted = !!acct.details_submitted;
      await DB.save(user);
      return jres(res,200,{
        onboarded: !!acct.details_submitted,
        payouts_enabled: payoutsEnabled,
        charges_enabled: !!acct.charges_enabled,
        requirements: acct.requirements ? {
          currently_due: acct.requirements.currently_due||[],
          past_due: acct.requirements.past_due||[],
        } : null,
        balance_available: _r3(user.balance_jpy_available||0),
        balance_pending: _r3(user.balance_jpy_pending||0),
        min_jpy: PAYOUT_MIN_JPY,
        history: (user.payout_history||[]).slice(-30).reverse(),
      });
    }catch(e){
      return jres(res,500,{error:'Stripe ステータス取得失敗: '+e.message});
    }
  }

  // ── POST /api/payout/request ───────────────────────────────
  // body: {amount_jpy?: number}  default = full balance_available
  if(pathname==='/api/payout/request' && method==='POST'){
    if(!STRIPE_SK) return jres(res,503,{error:'Stripe が設定されていません'});
    if(!user.stripe_connect_id) return jres(res,400,{error:'先に銀行口座を登録してください'});
    if(!user.stripe_connect_payouts_enabled) return jres(res,400,{error:'銀行口座の確認が完了していません'});

    const body = await readBody(req);
    const available = _r3(user.balance_jpy_available||0);
    let amount = Number(body.amount_jpy);
    if(!amount || amount <= 0) amount = available;
    amount = Math.floor(amount); // JPY is integer
    if(amount < PAYOUT_MIN_JPY) return jres(res,400,{error:'最低出金額は ¥'+PAYOUT_MIN_JPY+' です'});
    if(amount > available) return jres(res,400,{error:'残高不足: 利用可能 ¥'+available.toLocaleString()});

    const entry = {
      date: new Date().toISOString(),
      amount_jpy: amount,
      method: 'stripe_connect',
      status: 'pending',
      stripe_transfer_id: null,
    };
    try{
      const tr = await stripeCreateTransfer(amount, user.stripe_connect_id, {
        user_id: user.id,
        purpose: 'creator_payout',
      });
      entry.stripe_transfer_id = tr.id;
      entry.status = 'paid';
      // Deduct from available balance
      user.balance_jpy_available = _r3(available - amount);
      user.payout_history = user.payout_history || [];
      user.payout_history.push(entry);
      if(user.payout_history.length>500) user.payout_history = user.payout_history.slice(-500);
      await DB.save(user);
      return jres(res,200,{ok:true, payout: entry, balance_available: user.balance_jpy_available});
    }catch(e){
      // Record failure for admin review; do NOT deduct balance
      entry.status = 'failed';
      entry.error = e.message;
      user.payout_history = user.payout_history || [];
      user.payout_history.push(entry);
      await DB.save(user);
      return jres(res,500,{error:'出金処理に失敗しました: '+e.message});
    }
  }

  // ── POST /api/marketplace/listings ─────────────────────────
  // body: {agent_id, title, description, category, demo_prompts[], visibility, price_jpy}
  if(pathname==='/api/marketplace/listings' && method==='POST'){
    const body = await readBody(req);
    const ag = (user.agents||[]).find(a=>a.id===body.agent_id);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    const title = (body.title||'').trim();
    const description = (body.description||'').trim();
    const category = MARKET_CATEGORIES.indexOf(body.category)>=0 ? body.category : 'other';
    const visibility = body.visibility==='unlisted' ? 'unlisted' : 'public';
    const demoPrompts = Array.isArray(body.demo_prompts)
      ? body.demo_prompts.map(s=>String(s||'').trim()).filter(Boolean).slice(0,3) : [];
    const tags = Array.isArray(body.tags)
      ? body.tags.map(t=>String(t||'').trim().toLowerCase()).filter(t=>t && MARKET_TAG_LABEL[t]).slice(0,5)
      : [];
    if(title.length<2 || title.length>60) return jres(res,400,{error:'タイトルは 2〜60 文字で入力してください'});
    if(description.length<20 || description.length>500) return jres(res,400,{error:'説明は 20〜500 文字で入力してください'});

    // Price validation: 0 = free, otherwise ¥100〜¥100,000
    let priceJpy = Math.floor(Number(body.price_jpy));
    if(!Number.isFinite(priceJpy) || priceJpy < 0) priceJpy = 0;
    if(priceJpy > 0 && priceJpy < MIN_PRICE_JPY){
      return jres(res,400,{error:`有料の場合、価格は ¥${MIN_PRICE_JPY} 以上に設定してください`});
    }
    if(priceJpy > MAX_PRICE_JPY){
      return jres(res,400,{error:`価格の上限は ¥${MAX_PRICE_JPY.toLocaleString()} です`});
    }

    const existing = ag.marketplace || {};
    ag.marketplace = {
      is_listed: true,
      listing_id: existing.listing_id || genListingId(),
      title, description, category, demo_prompts: demoPrompts, visibility, tags,
      price_jpy: priceJpy,
      status: 'live',                      // auto-approve for MVP
      listed_at: existing.listed_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      uses_count: existing.uses_count || 0,
      purchases_count: existing.purchases_count || 0,
      rating_avg: existing.rating_avg || 0,
      rating_count: existing.rating_count || 0,
      reviews: existing.reviews || [],
    };
    await DB.save(user);
    return jres(res,200,{listing: ag.marketplace, agent_id: ag.id});
  }

  // ── DELETE /api/marketplace/listings/:agent_id ─────────────
  // Soft unpublish — keep stats so re-listing preserves them
  const dlm = pathname.match(/^\/api\/marketplace\/listings\/([^/]+)$/);
  if(dlm && method==='DELETE'){
    const ag = (user.agents||[]).find(a=>a.id===dlm[1]);
    if(!ag || !ag.marketplace) return jres(res,404,{error:'出店が見つかりません'});
    ag.marketplace.is_listed = false;
    ag.marketplace.status = 'paused';
    ag.marketplace.updated_at = new Date().toISOString();
    await DB.save(user);
    return jres(res,200,{ok:true});
  }

  // ── POST /api/marketplace/:listing_id/report ───────────────
  // body: {reason, detail?}
  const rpm = pathname.match(/^\/api\/marketplace\/([a-z0-9_-]+)\/report$/);
  if(rpm && method==='POST'){
    const body = await readBody(req);
    const reason = String(body.reason||'').slice(0,40);
    const detail = String(body.detail||'').slice(0,500);
    if(!reason) return jres(res,400,{error:'通報理由を選んでください'});
    const found = await findAgentByListingId(rpm[1]);
    if(!found) return jres(res,404,{error:'出店が見つかりません'});
    if(found.user.id === user.id) return jres(res,400,{error:'自分の出店は通報できません'});
    found.agent.marketplace.reports = found.agent.marketplace.reports || [];
    // De-dup: one report per user per listing
    if(found.agent.marketplace.reports.some(r=>r.reporter_user_id===user.id)){
      return jres(res,200,{ok:true, deduped:true});
    }
    found.agent.marketplace.reports.push({
      date: new Date().toISOString(),
      reporter_user_id: user.id,
      reason, detail,
    });
    // Auto-takedown threshold: 3 distinct reports
    if(found.agent.marketplace.reports.length >= 3){
      found.agent.marketplace.is_listed = false;
      found.agent.marketplace.status = 'paused';
      found.agent.marketplace.takedown_reason = 'auto: report threshold';
    }
    await DB.save(found.user);
    return jres(res,200,{ok:true});
  }

  // ── Marketing autopilot (admin only) ───────────────────────
  // GET /api/admin/marketing/today → today's queue + metrics
  if(pathname==='/api/admin/marketing/today' && method==='GET'){
    if(!user.is_admin) return jres(res,403,{error:'管理者権限が必要です'});
    const queue   = marketing.getTodayQueue();
    const metrics = await marketing.getTodayMetrics({ DB, USE_SUPA, LDB });
    return jres(res,200,{ queue, metrics });
  }
  // POST /api/admin/marketing/generate → force-regen today's queue
  if(pathname==='/api/admin/marketing/generate' && method==='POST'){
    if(!user.is_admin) return jres(res,403,{error:'管理者権限が必要です'});
    try {
      const q = await marketing.generateDailyPosts({ callAI });
      marketing.setTodayQueue(q);
      return jres(res,200,{ ok:true, queue:q });
    } catch(e){
      return jres(res,500,{ error: e.message });
    }
  }
  // POST /api/admin/marketing/report → force-send the daily report now
  if(pathname==='/api/admin/marketing/report' && method==='POST'){
    if(!user.is_admin) return jres(res,403,{error:'管理者権限が必要です'});
    try {
      const r = await marketing.sendDailyReport({
        to: user.email, callAI, DB, USE_SUPA, LDB, sendEmail,
        yesterdayTotal: 0,
      });
      return jres(res,200,{ ok:true, ...r });
    } catch(e){
      return jres(res,500,{ error: e.message });
    }
  }
  // POST /api/admin/marketing/send-strategy → email the comprehensive 7-day
  // strategy doc (public/strategy-1000.html) to the requesting admin's address
  if(pathname==='/api/admin/marketing/send-strategy' && method==='POST'){
    if(!user.is_admin) return jres(res,403,{error:'管理者権限が必要です'});
    try {
      const strategyPath = path.join(PUBLIC_DIR, 'strategy-1000.html');
      const strategyHtml = fs.readFileSync(strategyPath, 'utf8');
      await sendEmail(user.email, '🚀 7日間で 1,000 ユーザー獲得戦略 — MY AI Agent', strategyHtml);
      return jres(res,200,{ok:true, to: user.email});
    } catch(e){
      return jres(res,500,{error: e.message});
    }
  }

  // ── GET /api/admin/reports ─────────────────────────────────
  // Admins only — surfaces every listing with reports
  if(pathname==='/api/admin/reports' && method==='GET'){
    if(!user.is_admin) return jres(res,403,{error:'管理者権限が必要です'});
    const all = [];
    const collect = (users) => {
      for(const u of users||[]){
        for(const ag of (u.agents||[])){
          const m = ag.marketplace;
          if(m && m.reports && m.reports.length){
            all.push({
              listing_id: m.listing_id,
              title: m.title,
              creator_user_id: u.id,
              creator_handle: '@'+(u.email||'').split('@')[0],
              status: m.status,
              is_listed: m.is_listed,
              reports: m.reports,
              report_count: m.reports.length,
            });
          }
        }
      }
    };
    if(USE_SUPA){
      const r = await sbReq('GET','users','?select=*&limit=2000');
      if(Array.isArray(r.d)) collect(r.d);
    } else {
      collect(LDB.data||[]);
    }
    all.sort((a,b)=>b.report_count - a.report_count);
    return jres(res,200,{reports: all});
  }

  // ── POST /api/admin/listings/:listing_id/takedown ──────────
  const tkm = pathname.match(/^\/api\/admin\/listings\/([a-z0-9_-]+)\/takedown$/);
  if(tkm && method==='POST'){
    if(!user.is_admin) return jres(res,403,{error:'管理者権限が必要です'});
    const found = await findAgentByListingId(tkm[1]);
    if(!found) return jres(res,404,{error:'出店が見つかりません'});
    const body = await readBody(req);
    found.agent.marketplace.is_listed = false;
    found.agent.marketplace.status = 'paused';
    found.agent.marketplace.takedown_reason = String(body.reason||'manual takedown').slice(0,200);
    found.agent.marketplace.takedown_at = new Date().toISOString();
    await DB.save(found.user);
    return jres(res,200,{ok:true});
  }

  // ── POST /api/admin/listings/:listing_id/restore ───────────
  const rsm = pathname.match(/^\/api\/admin\/listings\/([a-z0-9_-]+)\/restore$/);
  if(rsm && method==='POST'){
    if(!user.is_admin) return jres(res,403,{error:'管理者権限が必要です'});
    const found = await findAgentByListingId(rsm[1]);
    if(!found) return jres(res,404,{error:'出店が見つかりません'});
    found.agent.marketplace.is_listed = true;
    found.agent.marketplace.status = 'live';
    found.agent.marketplace.takedown_reason = null;
    found.agent.marketplace.reports = [];
    await DB.save(found.user);
    return jres(res,200,{ok:true});
  }

  // ── GET /api/creators/:handle ──────────────────────────────
  // Public creator profile: handle → user, returns their listed agents
  const chm = pathname.match(/^\/api\/creators\/(@?[a-z0-9_.-]+)$/i);
  if(chm && method==='GET'){
    const handleRaw = chm[1].replace(/^@/,'').toLowerCase();
    const matchUser = (users) => {
      for(const u of users||[]){
        const handle = (u.email||'').split('@')[0].toLowerCase();
        if(handle === handleRaw) return u;
      }
      return null;
    };
    let creator = null;
    try{
      if(USE_SUPA){
        const r = await sbReq('GET','users','?select=*&limit=500');
        if(Array.isArray(r.d)) creator = matchUser(r.d);
      } else {
        creator = matchUser(LDB.data||[]);
      }
    }catch(e){ console.warn('[creators] lookup failed:', e.message); }
    if(!creator) return jres(res,404,{error:'クリエイターが見つかりません'});
    const listings = (creator.agents||[])
      .filter(a => a.marketplace && a.marketplace.is_listed && a.marketplace.status==='live' && (a.marketplace.visibility||'public')==='public')
      .map(a => publicListing(creator, a));
    const totalUses = listings.reduce((s,l)=>s+(l.uses||0), 0);
    return jres(res,200,{
      creator: {
        handle: '@'+(creator.email||'').split('@')[0],
        name: creator.name || '',
        joined: creator.created_at || null,
        is_verified: !!creator.is_verified,
      },
      stats: { listings: listings.length, total_uses: totalUses },
      listings,
    });
  }

  // ── POST /api/marketplace/:listing_id/purchase ─────────────
  // Auth required. Charges buyer's wallet and credits creator (70/30 split).
  // Idempotent — re-purchase is a no-op for paid listings (free is auto-purchased on clone).
  const mpurm = pathname.match(/^\/api\/marketplace\/([a-z0-9_-]+)\/purchase$/);
  if(mpurm && method==='POST'){
    const found = await findAgentByListingId(mpurm[1]);
    if(!found || !found.agent.marketplace || !found.agent.marketplace.is_listed){
      return jres(res,404,{error:'出店エージェントが見つかりません'});
    }
    if(found.user.id === user.id) return jres(res,400,{error:'自分の出店は購入できません'});
    const m = found.agent.marketplace;
    const price = Number.isFinite(m.price_jpy) ? m.price_jpy : 0;
    if(price <= 0) return jres(res,400,{error:'この出店は無料です。購入は不要です'});

    // Idempotency: already purchased?
    user.purchases = user.purchases || [];
    if(user.purchases.some(p=>p.listing_id===m.listing_id)){
      return jres(res,200,{ok:true, already_purchased:true});
    }

    // Wallet balance check (use available + recent topups, conservatively)
    const balance = (user.balance_jpy||0);
    if(balance < price){
      return jres(res,402,{error:`残高不足です (必要: ¥${price.toLocaleString()} / 残高: ¥${Math.floor(balance).toLocaleString()})`, shortfall: price - balance});
    }

    // Atomic-ish: deduct buyer first, credit creator second. On creator-save failure, refund buyer.
    user.balance_jpy = _r3(balance - price);
    user.purchases.push({
      date: new Date().toISOString(),
      listing_id: m.listing_id,
      agent_name: m.title || found.agent.name,
      creator_user_id: found.user.id,
      price_jpy: price,
    });
    user.billing_history = user.billing_history || [];
    user.billing_history.push({
      date: new Date().toISOString(),
      type:'agent_purchase',
      listing_id: m.listing_id,
      agent_name: m.title || found.agent.name,
      cost_jpy: price,
    });
    try{ await DB.save(user); }
    catch(e){
      // Restore in-memory state for the user; don't half-commit
      user.balance_jpy = _r3(user.balance_jpy + price);
      user.purchases = user.purchases.filter(p=>p.listing_id!==m.listing_id);
      user.billing_history = user.billing_history.filter(b=>!(b.type==='agent_purchase' && b.listing_id===m.listing_id));
      console.error('[purchase] buyer save failed:', e.message);
      return jres(res,500,{error:'購入処理に失敗しました'});
    }

    // Credit creator. Founders get 100% (0% Store fee perk); BUSINESS gets
    // 80%; everyone else gets 70% (PURCHASE_SHARE_RATE).
    const _creatorRate = found.user.is_founder ? 1.0
                       : found.user.plan === 'business' ? 0.80
                       : PURCHASE_SHARE_RATE;
    const share = _r3(price * _creatorRate);
    found.user.balance_jpy_pending = _r3((found.user.balance_jpy_pending||0) + share);
    found.user.revenue_history = found.user.revenue_history || [];
    found.user.revenue_history.push({
      date: new Date().toISOString(),
      listing_id: m.listing_id,
      agent_name: m.title || found.agent.name,
      buyer_user_id: user.id,
      type:'purchase',
      cost_jpy: price,
      share_jpy: share,
      status:'pending',
      confirms_at: new Date(Date.now() + PENDING_DAYS*86400000).toISOString(),
    });
    if(found.user.revenue_history.length>2000) found.user.revenue_history = found.user.revenue_history.slice(-2000);
    m.purchases_count = (m.purchases_count||0) + 1;
    try{ await DB.save(found.user); }
    catch(e){
      // Best-effort: log; buyer already paid. Will be reconciled manually if needed.
      console.error('[purchase] creator credit save failed (buyer already charged):', e.message);
    }
    return jres(res,200,{ok:true, balance_jpy: user.balance_jpy, purchase: user.purchases[user.purchases.length-1]});
  }

  // ── POST /api/marketplace/:listing_id/clone ────────────────
  // Auth required. Clones a listed agent into the current user's account.
  // For paid listings, requires purchase first.
  const mcm = pathname.match(/^\/api\/marketplace\/([a-z0-9_-]+)\/clone$/);
  if(mcm && method==='POST'){
    if((user.agents||[]).length>=1000) return jres(res,400,{error:'エージェントは最大1000個です'});
    const found = await findAgentByListingId(mcm[1]);
    if(!found || !found.agent.marketplace || !found.agent.marketplace.is_listed){
      return jres(res,404,{error:'出店エージェントが見つかりません'});
    }
    if(found.user.id === user.id) return jres(res,400,{error:'自分の出店エージェントは複製できません'});
    const src = found.agent;
    const price = Number.isFinite(src.marketplace.price_jpy) ? src.marketplace.price_jpy : 0;
    // Paid listings: must have purchased first
    if(price > 0){
      const purchased = (user.purchases||[]).some(p=>p.listing_id===src.marketplace.listing_id);
      if(!purchased){
        return jres(res,402,{error:'この出店は有料です。先に購入してください', price_jpy: price, listing_id: src.marketplace.listing_id});
      }
    }
    const now = new Date().toISOString();
    // Team listing: clone all member agents alongside the team group so the
    // buyer gets a working multi-agent setup.
    if(src.is_team && Array.isArray(src.team_member_agent_ids) && src.team_member_agent_ids.length){
      const memberCount = src.team_member_agent_ids.length;
      // Cap check: 1 group + N members
      if((user.agents||[]).length + memberCount + 1 > 1000){
        return jres(res,400,{error:`エージェントが上限 1000 を超えるためチームを複製できません (現在 ${(user.agents||[]).length} / 追加 ${memberCount+1})`});
      }
      const newGroupId = 'ag_'+crypto.randomUUID();
      const sourceMembers = (found.user.agents||[]).filter(a => src.team_member_agent_ids.includes(a.id));
      const clonedMembers = sourceMembers.map(orig => ({
        id: 'ag_'+crypto.randomUUID(),
        avatar: orig.avatar || '🤖',
        name: orig.name,
        skills: Array.isArray(orig.skills) ? orig.skills : ['writing'],
        persona: orig.persona || '',
        chrome_enabled: false,
        sheets_enabled: false,
        extension_enabled: false,
        model: 'gemini-flash',
        history: [],
        created_at: now,
        team_origin: { team_id: newGroupId, source_team_id: src.id, marketplace_origin: { listing_id: src.marketplace.listing_id, creator_user_id: found.user.id } },
        marketplace_origin: { listing_id: src.marketplace.listing_id, creator_user_id: found.user.id, cloned_at: now },
      }));
      // Lang for the welcome system message: prefer the source team's stored
      // lang; fall back to the seller's lang; finally to English.
      const cloneLang = (src.lang === 'ja' || src.lang === 'en') ? src.lang
                      : (found.user.lang === 'ja' ? 'ja' : 'en');
      const firstMemTag = (clonedMembers[0]?.name||'AI').replace(/\s+/g,'');
      const cloneName = src.marketplace.title || src.name || 'Team';
      const groupClone = {
        id: newGroupId,
        avatar: src.avatar || '🎯',
        name: cloneName,
        skills: ['planning'],
        persona: '',
        is_group: true,
        is_team: true,
        team_template_id: 'cloned',
        team_goal: src.team_goal || '',
        lang: cloneLang,
        host_id: user.id,
        members: [
          { user_id: user.id, name: user.name||'You', email: user.email||'', joined_at: now, role: 'host', notify_pref: 'all' },
        ],
        team_member_agent_ids: clonedMembers.map(a => a.id),
        ai_auto_respond: false,
        created_at: now,
        updated_at: now,
        marketplace_origin: {
          listing_id: src.marketplace.listing_id,
          creator_user_id: found.user.id,
          cloned_at: now,
        },
        history: [
          { role:'system',
            content: cloneLang === 'ja'
              ? `🎉 ${cloneName} を Store から複製しました。@${firstMemTag} のように特定エージェントを呼べます。`
              : `🎉 Cloned ${cloneName} from the Store. Call a specific agent with @${firstMemTag}.`,
            time: new Date().toLocaleTimeString(cloneLang==='ja'?'ja-JP':'en-US',{hour:'2-digit',minute:'2-digit'}),
          },
        ],
      };
      user.agents = [...(user.agents||[]), ...clonedMembers, groupClone];
      src.marketplace.uses_count = (src.marketplace.uses_count||0) + 1;
      await DB.save(user);
      await DB.save(found.user);
      return jres(res,201,{ agent: groupClone, team: true, member_count: clonedMembers.length });
    }
    // Single-agent listing — original behaviour
    const clone = {
      id:'ag_'+crypto.randomUUID(),
      avatar: src.avatar||'🤖',
      name: src.marketplace.title || src.name || 'Agent',
      skills: Array.isArray(src.skills) ? src.skills : ['writing'],
      persona: src.persona || '',
      chrome_enabled: !!src.chrome_enabled,
      marketplace_origin: {
        listing_id: src.marketplace.listing_id,
        creator_user_id: found.user.id,
        cloned_at: now,
      },
      history: [],
      created_at: now,
    };
    user.agents = [...(user.agents||[]), clone];
    // Bump uses on the listing
    src.marketplace.uses_count = (src.marketplace.uses_count||0) + 1;
    await DB.save(user);
    await DB.save(found.user);
    return jres(res,201,{agent: clone});
  }

  // ── POST /api/share/:share_id/clone ────────────────────────
  // Auth required. Clones the shared agent (or team) into the current user's
  // account. For teams, every member is also cloned and re-linked, otherwise
  // the cloned team would have member ids pointing back to the source user.
  const cmShare=pathname.match(/^\/api\/share\/([a-z0-9-]+)\/clone$/);
  if(cmShare&&method==='POST'){
    const shareId=cmShare[1];
    if((user.agents||[]).length>=1000)return jres(res,400,{error:'エージェントは最大1000個です'});
    const found=await findAgentByShareId(shareId);
    if(!found) return jres(res,404,{error:'共有エージェントが見つかりません'});
    if(found.user.id === user.id) return jres(res,400,{error:'自分のエージェントは複製できません'});
    const src=found.agent;
    const now = new Date().toISOString();

    // ── Team share clone ──
    if(src.is_team && Array.isArray(src.team_member_agent_ids) && src.team_member_agent_ids.length){
      const memberCount = src.team_member_agent_ids.length;
      if((user.agents||[]).length + memberCount + 1 > 1000){
        return jres(res,400,{error:`エージェントが上限 1000 を超えるためチームを複製できません (現在 ${(user.agents||[]).length} / 追加 ${memberCount+1})`});
      }
      const newGroupId = 'ag_'+crypto.randomUUID();
      const sourceMembers = (found.user.agents||[]).filter(a => src.team_member_agent_ids.includes(a.id));
      const clonedMembers = sourceMembers.map(orig => ({
        id: 'ag_'+crypto.randomUUID(),
        avatar: orig.avatar || '🤖',
        name: orig.name,
        skills: Array.isArray(orig.skills) ? orig.skills : ['writing'],
        persona: orig.persona || '',
        chrome_enabled: false,
        sheets_enabled: false,
        extension_enabled: false,
        model: 'gemini-flash',
        history: [],
        created_at: now,
        team_origin: { team_id: newGroupId, source_team_id: src.id, source_share_id: src.share_id || null },
      }));
      const groupClone = {
        id: newGroupId,
        avatar: src.avatar || '🎯',
        name: src.name || 'Team',
        skills: ['planning'],
        persona: '',
        is_group: true,
        is_team: true,
        team_template_id: 'shared',
        team_goal: src.team_goal || '',
        lang: src.lang || 'en',
        host_id: user.id,
        members: [
          { user_id: user.id, name: user.name||'You', email: user.email||'', joined_at: now, role: 'host', notify_pref: 'all' },
        ],
        team_member_agent_ids: clonedMembers.map(a => a.id),
        ai_auto_respond: false,
        created_at: now,
        updated_at: now,
        history: [
          { role:'system',
            content: (src.lang === 'ja')
              ? `🎉 ${src.name} を共有 URL から複製しました。@${(clonedMembers[0]?.name||'AI').replace(/\s+/g,'')} のように特定エージェントを呼べます。`
              : `🎉 Cloned ${src.name} from a shared URL. Call a specific agent with @${(clonedMembers[0]?.name||'AI').replace(/\s+/g,'')}.`,
            time: new Date().toLocaleTimeString((src.lang==='ja')?'ja-JP':'en-US',{hour:'2-digit',minute:'2-digit'}),
          },
        ],
      };
      user.agents = [...(user.agents||[]), ...clonedMembers, groupClone];
      await DB.save(user);
      console.log('[share/clone] team='+src.id+' source_user='+found.user.id+' new_team='+newGroupId+' members='+clonedMembers.length);
      return jres(res, 201, { agent: groupClone, team: true, member_count: clonedMembers.length });
    }

    // ── Solo agent clone ──
    const clone={
      id:'ag_'+crypto.randomUUID(),
      avatar:src.avatar||'🤖',
      name:src.name||'Agent',
      skills:Array.isArray(src.skills)?src.skills:['writing'],
      persona:src.persona||'',
      chrome_enabled:!!src.chrome_enabled,
      model: src.model || 'sonnet',
      history:[],
      created_at: now,
      share_origin: { share_id: src.share_id || null, source_user_id: found.user.id },
    };
    user.agents=[...(user.agents||[]),clone];
    await DB.save(user);
    console.log('[share/clone] solo='+src.id+' source_user='+found.user.id+' new='+clone.id);
    return jres(res,201,{agent:clone});
  }

  // ── POST /api/chat/:agentId ────────────────────────────────
  const cm=pathname.match(/^\/api\/chat\/([^/]+)$/);
  if(cm&&method==='POST'){
    if(!ANTHROPIC)return jres(res,503,{error:'APIキーが設定されていません'});
    // ── Resolve agent: own first, then via group membership ──
    let agent = (user.agents||[]).find(a=>a.id===cm[1]);
    // payerUser = whose balance / quota gets charged. host of group, else self.
    let payerUser = user;
    let isGroupMember = false; // true when current user is a group invitee
    if(!agent){
      const mship = (user.group_memberships||[]).find(g => g.agent_id === cm[1]);
      if(mship){
        const hostUser = await DB.findBy('id', mship.host_id);
        if(hostUser){
          agent = (hostUser.agents||[]).find(a => a.id === cm[1]);
          payerUser = hostUser;
          isGroupMember = !!agent;
        }
      }
    }
    if(!agent) return jres(res,404,{error:'エージェントが見つかりません'});

    // ── Auto model routing ─────────────────────────────────
    // When agent.model === 'auto', derive an effective model per-turn from
    // the user's message. Light queries stay on Flash (cheap + fast),
    // complex queries escalate to Sonnet, /opus prefix bumps to Opus.
    if(agent.model === 'auto'){
      const auto = _autoPickModel(message || '', agent);
      console.log('[chat] auto-routed model:', auto);
      agent = { ...agent, model: auto };
    }
    // Plan-based model gating (charged-side payer drives this).
    //   Free → gemini-flash or haiku only (cheap tier)
    //   Pro  → no Opus
    //   Biz  → all
    // Grandfathered users keep whatever the agent's saved model says.
    if(!_isGrandfathered(payerUser)){
      const _plan = payerUser.plan || 'free';
      const _cheapTier = new Set(['gemini-flash', 'haiku']);
      if(_plan === 'free' && !_cheapTier.has(agent.model)){
        agent = { ...agent, model: 'gemini-flash' };
      } else if(_plan === 'pro' && agent.model === 'opus'){
        agent = { ...agent, model: 'sonnet' };
      }
    }

    const isGroup = !!agent.is_group;
    // Free-tier / balance gate runs against the PAYER (host for groups).
    // 10 was too tight — most users hit it before reaching their "aha"
    // moment (multi-agent team, first creator earning, first artifact).
    // 100 lets the user fully experience the product, then meter kicks in.
    var FREE_MSGS = 100;
    var usageCount = payerUser.usage_count || 0;
    var balance = payerUser.balance_jpy || 0;
    if(usageCount >= FREE_MSGS && balance <= 0){
      return jres(res,402,{
        error: isGroupMember ? 'ホストの残高が不足しています' : '残高が不足しています',
        detail: isGroupMember
          ? 'ホストにチャージを依頼してください'
          : '残高をチャージするか、プランをご確認ください',
        free_used: usageCount,
        free_limit: FREE_MSGS,
        balance: balance,
        upgrade: !isGroupMember,
        host_low_balance: isGroupMember,
      });
    }
    const body=await readBody(req);
    const regenerate=!!body.regenerate;
    const message=body.message||'';
    const images=body.images||[];
    // Text attachments: files (txt/md/csv/json/code) or fetched URLs.
    // Each: { kind: 'text'|'url', name, source?, text }
    const texts = Array.isArray(body.texts) ? body.texts.filter(t => t && typeof t.text === 'string') : [];
    // Cap total text bytes to keep prompt cost in check
    let _txtBytes = 0;
    const TXT_CAP = 200 * 1024; // 200 KB combined
    for (const t of texts) {
      _txtBytes += Buffer.byteLength(t.text || '', 'utf8');
      if (_txtBytes > TXT_CAP) {
        return jres(res, 400, { error: '添付テキストの合計が大きすぎます (上限 200KB)' });
      }
    }
    if(!regenerate && !message?.trim() && images.length===0 && texts.length===0) return jres(res,400,{error:'メッセージを入力してください'});
    // Cap at 50 KB so code paste + commentary fits. (Was 4000 chars which
    // broke even a small React component.) Anthropic input budget is ~200K
    // tokens so 50KB user message + history + tools is comfortable.
    const MSG_CAP = 50000;
    if(message.length > MSG_CAP){
      return jres(res,400,{
        error:`メッセージが長すぎます (${message.length.toLocaleString()} 文字 / 上限 ${MSG_CAP.toLocaleString()})。コードならファイル添付 (📎) でアップロードしてください — 添付なら ${(200*1024).toLocaleString()} 文字までいけます。`,
      });
    }

    // Edit: replace a past user message and resend.
    //   edit_index: 0-based index of the user message to overwrite.
    //   message:    the new text. Required (and not blank).
    //
    // Validated FIRST (before the regenerate pop) so an edit_index+regenerate
    // combo doesn't mutate history before being rejected.
    const editIndex = (typeof body.edit_index === 'number' && body.edit_index >= 0)
      ? Math.floor(body.edit_index) : -1;
    if(editIndex >= 0){
      if(regenerate){
        return jres(res,400,{error:'edit_index と regenerate は同時に指定できません'});
      }
      if(!message || !message.trim()){
        return jres(res,400,{error:'編集後のメッセージを入力してください'});
      }
      if(!agent.history || editIndex >= agent.history.length){
        return jres(res,400,{error:'編集対象のメッセージが見つかりません'});
      }
      const target = agent.history[editIndex];
      if(!target || target.role !== 'user'){
        return jres(res,400,{error:'編集できるのは自分のメッセージのみです'});
      }
      if(isGroup && target.user_id && target.user_id !== user.id){
        return jres(res,403,{error:'他のメンバーのメッセージは編集できません'});
      }
      target.content = message;
      target.edited = true;
      target.edited_at = new Date().toISOString();
      agent.history = agent.history.slice(0, editIndex + 1);
      body.__forceRegenerate = true;
    }

    // Regenerate: drop trailing assistant from history; resend without adding a new user message
    if(regenerate){
      while(agent.history.length>0 && agent.history[agent.history.length-1].role==='assistant'){
        agent.history.pop();
      }
      if(!agent.history.length || agent.history[agent.history.length-1].role!=='user'){
        return jres(res,400,{error:'再生成できる返答がありません'});
      }
    }
    const effectiveRegen = regenerate || !!body.__forceRegenerate;

    // Group chat AI invocation policy:
    //   - Small groups (≤3 humans incl. host): AI responds to every message
    //     by default — feels like a DM-with-friend.
    //   - Larger groups (4+ humans): require explicit @AI mention so the
    //     AI doesn't spam discussion threads.
    //   - Per-group setting `ai_auto_respond` (host-controlled) overrides:
    //       true  = always respond
    //       false = require @AI
    //       undefined = use the size heuristic above
    const speakerName = user.name || (user.email||'').split('@')[0] || 'メンバー';
    const speakerInitial = (speakerName || '?').charAt(0).toUpperCase();
    const aiMentioned = /(^|[\s　])(?:@AI|＠AI|@ai|＠ai)\b/.test(message);
    let aiShouldRespond = aiMentioned;
    // Team chat: route @MemberName mentions to that specific cloned agent's
    // persona. Without this, team groups fall back to the group's empty
    // persona and lose all the curated instructions.
    let teamMemberAgent = null;
    if(agent.is_team && Array.isArray(agent.team_member_agent_ids) && agent.team_member_agent_ids.length){
      // Try to match @<word> against any team member's name (case-insensitive,
      // ignoring whitespace in the name).
      const mtchs = message.match(/(?:^|[\s　])@(\S+)/g) || [];
      for(const m of mtchs){
        const token = m.replace(/^[\s　]*@/,'').toLowerCase().replace(/[^a-z0-9ぁ-んァ-ヶー一-龠]+/g,'');
        if(!token || token === 'ai') continue;
        const candidate = (payerUser.agents||[]).find(a =>
          agent.team_member_agent_ids.includes(a.id) &&
          a.name && a.name.toLowerCase().replace(/\s+/g,'').startsWith(token)
        );
        if(candidate){ teamMemberAgent = candidate; break; }
      }
      // No specific @member, no @AI either → still respond using the first
      // member as the team coordinator (so the team feels alive even with
      // bare messages).
      if(!teamMemberAgent && !aiMentioned){
        teamMemberAgent = (payerUser.agents||[]).find(a => a.id === agent.team_member_agent_ids[0]) || null;
      }
      if(teamMemberAgent) aiShouldRespond = true;
    }
    // Knowledge-base retrieval — runs against the responding agent's KB.
    // Empty/missing KB returns []; injected into every buildSystem call below.
    const _kbAgent = teamMemberAgent || agent;
    // Pre-compute the user-query embedding ONCE per turn so KB retrieval
    // and the agent-memory injector can share it. Costs ~$0.0001/turn and
    // ~200ms — but we eliminate the duplicate roundtrip the memory path
    // would otherwise add. Skip if no OpenAI key OR no vectorized data exists
    // anywhere on this agent (KB chunks or memories).
    const _kbAgentHasEmbed = _kbAgent && Array.isArray(_kbAgent.knowledge) && _kbAgent.knowledge.some(d => Array.isArray(d.embeddings) && d.embeddings.length > 0);
    const _agHasMemEmb     = agent && Array.isArray(agent.memories) && agent.memories.some(m => Array.isArray(m.embedding));
    let _queryEmbedding = null;
    if(OPENAI_KEY && message && (_kbAgentHasEmbed || _agHasMemEmb)){
      try {
        const r = await _openaiEmbeddings([String(message).slice(0, 2000)]);
        if(r && r[0]) _queryEmbedding = r[0];
      } catch(e){ /* fall back to non-vector path silently */ }
    }
    // KB retrieval: prefer vector when we have an embedding + the KB is
    // vectorized; fall back to lexical otherwise. We can re-use the
    // pre-computed query embedding here too via a small refactor; for now
    // _retrieveKbChunksVector embeds internally if not given.
    let _kbHits = [];
    if(_queryEmbedding && _kbAgentHasEmbed){
      // Score KB chunks directly with the shared embedding (saves another
      // OpenAI roundtrip vs. _retrieveKbChunksVector which would embed again).
      const scored = [];
      for(const doc of _kbAgent.knowledge){
        const chunks = Array.isArray(doc.chunks) ? doc.chunks : [];
        const embs = Array.isArray(doc.embeddings) ? doc.embeddings : [];
        for(let i = 0; i < chunks.length; i++){
          const e = embs[i]; if(!Array.isArray(e)) continue;
          const s = _cosine(_queryEmbedding, e);
          if(s > 0.20) scored.push({ score:s, doc_name:doc.name, text:chunks[i] });
        }
      }
      scored.sort((a,b) => b.score - a.score);
      _kbHits = scored.slice(0, 3);
    } else {
      _kbHits = await _retrieveKbChunksVector(_kbAgent, message || '', 3);
    }
    if(!_kbHits || !_kbHits.length){
      _kbHits = _retrieveKbChunks(_kbAgent, message || '', 3);
    }

    // Team context for buildSystem — pass team name + goal + sibling members
    // so the AI knows what team it belongs to and what handoffs to suggest.
    let _teamCtx = null;
    if(agent.is_team){
      const memberAgents = (Array.isArray(agent.team_member_agent_ids) ? agent.team_member_agent_ids : [])
        .map(id => (payerUser.agents||[]).find(a => a.id===id))
        .filter(Boolean);
      _teamCtx = {
        teamName: agent.name || '',
        teamGoal: agent.team_goal || '',
        teamMembers: memberAgents
          .filter(m => !teamMemberAgent || m.id !== teamMemberAgent.id)
          .map(m => ({ name: m.name||'AI' })),
      };
    }
    if(isGroup && !aiMentioned && !teamMemberAgent){
      const memberCount = Array.isArray(agent.members) ? agent.members.length : 1;
      if(typeof agent.ai_auto_respond === 'boolean'){
        aiShouldRespond = agent.ai_auto_respond;
      } else {
        aiShouldRespond = memberCount <= 3;
      }
    }
    if(isGroup && !effectiveRegen && !aiShouldRespond){
      const ts = new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
      agent.history = [...(agent.history||[]), {
        role: 'user',
        content: message,
        time: ts,
        user_id: user.id,
        user_name: speakerName,
        user_avatar: speakerInitial,
      }];
      if(agent.history.length > 200) agent.history = agent.history.slice(-200);
      const ai = (payerUser.agents||[]).findIndex(a=>a.id===agent.id);
      if(ai>=0) payerUser.agents[ai] = agent;
      await DB.save(payerUser);
      // Push notification: human-only message (no @AI), notify other members
      notifyGroupMembers(payerUser, agent, {
        sender_user_id: user.id,
        sender_name: speakerName,
        text: message,
        is_ai_reply: false,
        is_mention: false,
      }).catch(()=>{});
      return jres(res,200,{ok:true, ai_replied:false, reply:'', balance_jpy: payerUser.balance_jpy});
    }

    // ─────────────────────────────────────────────────────────
    // TEAM HUDDLE — multi-agent auto-dialogue
    // ─────────────────────────────────────────────────────────
    // When body.huddle === true on a team chat, instead of one AI replying,
    // every team member speaks in turn for up to MAX_ROUNDS rounds, then we
    // emit a synthesized summary. Streamed via SSE so the UI can render each
    // member's bubble live. Strictly text-only (no tools) to keep latency
    // manageable inside the Render edge budget.
    if(body.huddle === true && agent.is_team && Array.isArray(agent.team_member_agent_ids) && agent.team_member_agent_ids.length){
      const memberAgents = agent.team_member_agent_ids
        .map(id => (payerUser.agents||[]).find(a => a.id === id))
        .filter(Boolean)
        .slice(0, 6); // hard cap at 6 members
      if(memberAgents.length === 0){
        return jres(res,400,{error:'no team members'});
      }
      const MAX_ROUNDS = Math.max(1, Math.min(4, parseInt(body.huddle_rounds, 10) || 2));
      const BUDGET_MS  = 90 * 1000;
      const huddleStart = Date.now();
      res.writeHead(200, {
        'Content-Type':'text/event-stream; charset=utf-8',
        'Cache-Control':'no-cache, no-transform',
        'Connection':'keep-alive',
        'X-Accel-Buffering':'no',
        'Access-Control-Allow-Origin':APP_URL,
      });
      const sse = (ev, data)=>{ try{ res.write('event: '+ev+'\ndata: '+JSON.stringify(data)+'\n\n'); }catch(e){} };
      const sseKeep = setInterval(()=>{ try{ res.write(': keepalive\n\n'); }catch(e){} }, 15000);
      req.on('close', ()=>{ try{ clearInterval(sseKeep); }catch(e){} });
      // Persist the user message
      const ts0 = new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
      agent.history = [...(agent.history||[]), {
        role:'user', content:message, time:ts0,
        user_id:user.id, user_name:speakerName, user_avatar:speakerInitial,
      }];
      sse('huddle_start', {
        members: memberAgents.map(m => ({ id: m.id, name: m.name, avatar: m.avatar })),
        rounds: MAX_ROUNDS,
      });
      // Conversation accumulator — every member sees the same growing transcript.
      const transcript = [];
      transcript.push('USER (' + speakerName + '): ' + message);
      let totalIn = 0, totalOut = 0;
      let stopped = false;
      try {
        for(let round = 1; round <= MAX_ROUNDS && !stopped; round++){
          // Round-aware ordering: round 1 = persona order; later rounds = whoever
          // got @mentioned in the previous round first.
          let order = memberAgents.slice();
          if(round > 1){
            const lastChunk = transcript.slice(-memberAgents.length).join('\n');
            order.sort((a, b) => {
              const aMentioned = lastChunk.toLowerCase().includes('@' + (a.name||'').toLowerCase().replace(/\s+/g,'').slice(0,8));
              const bMentioned = lastChunk.toLowerCase().includes('@' + (b.name||'').toLowerCase().replace(/\s+/g,'').slice(0,8));
              return (bMentioned?1:0) - (aMentioned?1:0);
            });
          }
          for(const member of order){
            if(Date.now() - huddleStart > BUDGET_MS){ stopped = true; break; }
            sse('huddle_turn_start', {
              member_id: member.id,
              member_name: member.name,
              member_avatar: member.avatar,
              round,
            });
            const otherNames = memberAgents.filter(m => m.id !== member.id).map(m => m.name).join(', ');
            const huddleSys = `あなたは "${member.name}" として "${agent.name||'チーム'}" の議論に参加しています。\n性格・スキル: ${member.persona || ''}\nスキル: ${(member.skills||[]).join(', ')}\n他のメンバー: ${otherNames}\n\n【議論ルール (厳守)】\n- 1 発言 = 2-4 文 (200 字程度) で簡潔に\n- 他メンバーの発言があれば、その意見に対して同意/反論/補足する形で\n- 自分の専門領域に関する具体提案を 1 つ含める\n- 他メンバーに振りたい時は「@名前」で呼びかけてよい\n- 既に発言した内容を繰り返さない\n- 自分の番が終わったら短く締める (「以上です」等は不要)`;
            const huddleMsgs = [{
              role: 'user',
              content: 'チームへの相談:\n' + message + '\n\nここまでの議論:\n' + transcript.join('\n') + '\n\n上記を踏まえ、' + member.name + ' として次の発言をしてください。',
            }];
            let memberReply = '';
            try {
              const info = _resolveModelInfo(member.model || 'gemini-flash');
              const callOpts = {
                ...info,
                maxTokens: Math.min(600, info.maxTokens),
              };
              const r = await callAIStream(huddleMsgs, huddleSys,
                (delta) => {
                  memberReply += delta;
                  sse('delta', { text: delta, member_id: member.id });
                },
                callOpts.alias || member.model || 'gemini-flash',
                member);
              totalIn  += (r.inputTokens || 0);
              totalOut += (r.outputTokens || 0);
            } catch(e){
              sse('huddle_turn_error', { member_id: member.id, message: e.message });
              continue;
            }
            const cleaned = (memberReply || '').trim();
            if(cleaned){
              transcript.push((member.name||'AI') + ': ' + cleaned);
              const ts = new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
              agent.history.push({
                role: 'assistant', content: cleaned, time: ts,
                huddle_member_id: member.id,
                huddle_member_name: member.name,
                huddle_member_avatar: member.avatar,
                huddle_round: round,
              });
            }
            sse('huddle_turn_end', { member_id: member.id, round });
          }
          // Early stop: if the latest member explicitly says "結論" or "以上で" /
          // "no further input", break the loop early.
          const tail = transcript.slice(-1)[0] || '';
          if(/(結論|まとめると|以上|no further|that['']?s all|nothing else to add)/i.test(tail)){
            break;
          }
        }
        // Summary turn — synthesize a 4-6 sentence digest of the discussion.
        try {
          if(Date.now() - huddleStart < BUDGET_MS && transcript.length >= 2){
            sse('huddle_summary_start', {});
            const sumSys = 'あなたはチームファシリテーター。下記の議論を整理してください。';
            const sumPrompt = `元のユーザー依頼: ${message}\n\n議論:\n${transcript.join('\n')}\n\n以下の形式で簡潔に整理してください (合計 6-8 行):\n\n📋 **論点**: ...\n💡 **主な提案**: \n  - <発言者>: <提案>\n  - <発言者>: <提案>\n🎯 **次のアクション**: <ユーザーが取るべき次の 1 ステップ>\n\n出力は本文のみ。前置きや「以下に要約します」は禁止。`;
            const info = _resolveModelInfo(GEMINI_KEY ? 'gemini-flash' : 'haiku');
            let summary = '';
            await callAIStream([{role:'user', content: sumPrompt}], sumSys,
              (delta) => { summary += delta; sse('huddle_summary_delta', { text: delta }); },
              info.alias);
            const cleanedSum = (summary || '').trim();
            if(cleanedSum){
              const ts = new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
              agent.history.push({
                role: 'assistant', content: cleanedSum, time: ts,
                huddle_summary: true,
              });
            }
            sse('huddle_summary_end', {});
          }
        } catch(e){
          sse('huddle_summary_error', { message: e.message });
        }
        // Cost accounting
        const cost = calcCost(totalIn, totalOut);
        payerUser.balance_jpy = Math.round(((payerUser.balance_jpy||0) - cost.jpy)*1000)/1000;
        payerUser.usage_count = (payerUser.usage_count||0) + 1;
        payerUser.billing_history = payerUser.billing_history || [];
        payerUser.billing_history.push({
          date: new Date().toISOString(), type:'usage', agentId: agent.id, agentName: agent.name,
          input_tokens: cost.inputTok, output_tokens: cost.outputTok,
          cost_usd: cost.usd, cost_jpy: cost.jpy, mode: 'huddle',
        });
        if(payerUser.billing_history.length>1000) payerUser.billing_history = payerUser.billing_history.slice(-1000);
        if(agent.history.length > 200) agent.history = agent.history.slice(-200);
        const ai = (payerUser.agents||[]).findIndex(a=>a.id===agent.id);
        if(ai>=0) payerUser.agents[ai] = agent;
        await DB.save(payerUser);
        sse('done', {
          balance_jpy: payerUser.balance_jpy,
          cost: { jpy: cost.jpy, usd: cost.usd },
          rounds_run: Math.min(MAX_ROUNDS, Math.ceil(transcript.length / Math.max(1, memberAgents.length))),
        });
      } catch(e){
        sse('error', { message: e.message });
      }
      clearInterval(sseKeep);
      res.end();
      return;
    }

    // Rolling-summary aware history selection:
    // - Pin any leading `_summary:true` message so the AI never loses long-term
    //   context once we've archived old turns.
    // - Take the last 14 NON-summary entries as the recent window.
    const _summaryMsg = (agent.history||[]).find(m => m && m._summary);
    // 14 → 8: combined with the rolling-summary fold above, 8 recent turns is
    // enough for short-term flow while keeping input-token cost down.
    const _recentHist = (agent.history||[]).filter(m => !(m && m._summary)).slice(-8);
    const hist = _summaryMsg ? [_summaryMsg, ..._recentHist] : _recentHist;
    // ユーザーメッセージのcontentを構築（画像 + PDF + テキスト/URL添付対応）
    let userContent;
    if(images.length > 0 || texts.length > 0){
      userContent = [];
      // 1) Text attachments first (files / fetched URLs) so the model has the
      //    reference material when it reads the user's actual question.
      texts.forEach(t => {
        const kind = t.kind === 'url' ? 'url' : 'file';
        const name = (t.name || (kind === 'url' ? 'page' : 'attachment')).toString().slice(0, 200);
        const src  = (t.source || '').toString().slice(0, 500);
        const wrapper = kind === 'url'
          ? `<url src="${src}" title="${name.replace(/"/g, '&quot;')}">\n${t.text}\n</url>`
          : `<file name="${name.replace(/"/g, '&quot;')}">\n${t.text}\n</file>`;
        userContent.push({ type: 'text', text: wrapper });
      });
      // 2) Images / PDFs
      images.forEach(att => {
        var mt = att.type || 'image/jpeg';
        if(mt === 'application/pdf'){
          // Anthropic PDF document block (Claude 3.5 Sonnet+ supports this)
          userContent.push({
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: att.b64
            }
          });
        } else if(mt.startsWith('image/')){
          userContent.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: mt,
              data: att.b64
            }
          });
        }
      });
      // 3) The user's actual question last
      if(message.trim()) userContent.push({type:'text',text:message});
    } else {
      userContent = message;
    }
    // For groups, prefix every user-history message with [name]: so the AI
    // can attribute statements correctly. CRITICAL: Anthropic Messages API
    // only accepts 'user' and 'assistant' roles in messages[]; entries with
    // role:'system' (our join/leave UI markers) MUST be stripped here, or the
    // API returns "Unexpected role 'system'".
    const _histForAI = hist
      .filter(m => m && (m.role === 'user' || m.role === 'assistant'))
      .map(m => {
        if(m.role !== 'user') return {role: m.role, content: m.content};
        if(!isGroup) return {role:'user', content: m.content};
        const nm = m.user_name || 'メンバー';
        return typeof m.content === 'string'
          ? {role:'user', content: '[' + nm + '] ' + m.content}
          : {role:'user', content: m.content};
      });
    // Wrap the *current* outgoing user message with the speaker name when in group
    const _outboundUC = isGroup && typeof userContent === 'string'
      ? '[' + speakerName + '] ' + userContent
      : (isGroup && Array.isArray(userContent)
          ? (() => {
              const arr = userContent.slice();
              const lastTextIdx = (() => { for(let i=arr.length-1;i>=0;i--){ if(arr[i].type==='text') return i; } return -1; })();
              if(lastTextIdx >= 0){
                arr[lastTextIdx] = {...arr[lastTextIdx], text: '[' + speakerName + '] ' + arr[lastTextIdx].text};
              }
              return arr;
            })()
          : userContent);
    // For regenerate / edit: history already ends with the (possibly edited) user
    // msg; skip adding a new one.
    const baseMsgs = effectiveRegen
      ? _histForAI
      : [..._histForAI, {role:'user', content: _outboundUC}];
    let reply,cost;

    // Branch: Chrome 連携 ON or Sheets 連携 ON or Extension 連携 ON のエージェントは Tool Use ループを通す
    // Use the PAYER's connections (sheets/extension) since those tokens live
    // on the host's user record for groups.
    const sheetsConnected = !!(payerUser.google_oauth && payerUser.google_oauth.refresh_token);
    const sheetsActive = !!agent.sheets_enabled && sheetsConnected;
    const extensionPaired = !!payerUser.extension_device_token;
    const extensionActive = !!agent.extension_enabled && extensionPaired;
    // Image / video / media-utility / web-native tools are always available
    // — they have zero variable cost (local rendering + free public APIs +
    // local Playwright for public pages).
    const imageGenActive = true;
    const videoGenActive = true;
    const mediaUtilActive = true;
    const webNativeActive = true;   // server-side Playwright for public sites
    // GitHub: only ON when (a) agent has it toggled (b) the user registered a PAT.
    // Without a PAT every tool call returns the same error, so it's pointless
    // to even list the tools in those cases.
    const githubActive = !!(agent.github_enabled && payerUser && (payerUser.github_pat || (payerUser.integrations && payerUser.integrations.github && payerUser.integrations.github.pat)));
    const useTools = !!agent.chrome_enabled || sheetsActive || extensionActive
                   || imageGenActive || videoGenActive || mediaUtilActive
                   || webNativeActive || githubActive;
    // send_email auto-routes to the user's own address, but the AI doesn't
    // know what that address IS — so it sometimes asks the user for one
    // or refuses with "no recipient". Inject the email into the tool's
    // description per-request so the AI knows there's nothing to ask.
    const _mediaTools = MEDIA_UTIL_TOOLS.map(t => {
      if(t.name !== 'send_email') return t;
      const ownerEmail = (payerUser && payerUser.email) || (user && user.email) || '';
      if(!ownerEmail) return t; // fallback: leave generic
      return {
        ...t,
        description: 'メールを ' + ownerEmail + ' (この AI を呼んだユーザー本人のメールアドレス) に送信します。'
          + '宛先は ' + ownerEmail + ' に固定されているので「メールアドレスを教えて」と聞く必要はありません。'
          + '要約・レポート・リマインダー・調査結果の自分宛通知に使ってください。他人への送信は不可。',
      };
    });
    // MCP tools — list registered MCP servers, fetch their tool catalogs
    // (cached 30 min), and merge into the tools array. Routing back to the
    // correct server happens via `_mcpRouting` in the tool-dispatch switch.
    const _mcpCompose = await _composeMcpToolsForAgent(payerUser, agent);
    const _mcpRouting = _mcpCompose.routing;
    const tools = [
      // chrome_enabled now means "give the agent web access" — fulfilled
      // by Anthropic-hosted web_search / web_fetch (works on Render free).
      ...(agent.chrome_enabled ? WEB_TOOLS : []),
      ...(sheetsActive ? SHEETS_TOOLS : []),
      ...(extensionActive ? EXTENSION_TOOLS : []),
      ...(imageGenActive ? IMAGE_TOOLS : []),
      ...(videoGenActive ? VIDEO_TOOLS : []),
      ...(mediaUtilActive ? _mediaTools : []),
      ...(webNativeActive ? WEB_NATIVE_TOOLS : []),
      ...(githubActive ? GITHUB_TOOLS : []),
      ..._mcpCompose.tools,
    ];
    const wantStream = body.stream === true; // streaming is now supported on the tools path too
    const wantStreamPlain = wantStream && !useTools;
    const wantStreamTools = wantStream && useTools;
    let totalIn=0, totalOut=0;

    // ── /plan branch — Plan-Execute-Review orchestrator ─────────────
    // User explicitly opts in by prefixing their message with "/plan ". The
    // server then runs a 3-5 step multi-AI pipeline and streams progress
    // via SSE so the bubble updates in place.
    if(/^\/plan\b/i.test((message||'').trim())){
      if(wantStream){
        res.writeHead(200, {
          'Content-Type':'text/event-stream; charset=utf-8',
          'Cache-Control':'no-cache, no-transform',
          'Connection':'keep-alive',
          'X-Accel-Buffering':'no',
          'Access-Control-Allow-Origin':APP_URL,
        });
        const sse = (ev, data)=>{ try{ res.write('event: '+ev+'\ndata: '+JSON.stringify(data)+'\n\n'); }catch(e){} };
        const ka = setInterval(()=>{ try{ res.write(': keepalive\n\n'); }catch(e){} }, 15000);
        req.on('close', ()=>{ try{ clearInterval(ka); }catch(e){} });
        try {
          const planRes = await _runPlanExecuteReview(message, {
            agent,
            sse,
            modelAlias: (agent.model === 'auto' ? 'sonnet' : agent.model),
            baseSysFn: () => buildSystem(teamMemberAgent || agent, { sheetsActive, extensionActive, isGroup, speakerName, memories: (payerUser.memories || user.memories), kbHits: _kbHits, queryEmbedding: _queryEmbedding, recentHistory: (agent.history||[]).slice(-6), userQuery: message, ...(_teamCtx||{}) }),
          });
          totalIn += planRes.tokens.input;
          totalOut += planRes.tokens.output;
          const reply = planRes.reply;
          const cost = calcCost(totalIn, totalOut);
          const ts = new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
          const _newAid = 'a_'+crypto.randomBytes(4).toString('hex');
          const _newUid = 'u_'+crypto.randomBytes(4).toString('hex');
          agent.history = [...(agent.history||[]),
            { id:_newUid, role:'user', content:message, time:ts },
            { id:_newAid, role:'assistant', content:reply, time:ts, cost_jpy:cost.jpy, plan_mode:true }
          ];
          if(agent.history.length>200) agent.history = agent.history.slice(-200);
          payerUser.balance_jpy = Math.round(((payerUser.balance_jpy||0) - cost.jpy)*1000)/1000;
          payerUser.usage_count = (payerUser.usage_count||0) + 1;
          payerUser.billing_history = payerUser.billing_history || [];
          payerUser.billing_history.push({ date:new Date().toISOString(), type:'usage', agentId:agent.id, agentName:agent.name,
            input_tokens:cost.inputTok, output_tokens:cost.outputTok, cost_usd:cost.usd, cost_jpy:cost.jpy, mode:'plan' });
          const aiIdx = (payerUser.agents||[]).findIndex(a=>a.id===agent.id);
          if(aiIdx>=0) payerUser.agents[aiIdx] = agent;
          await DB.save(payerUser);
          sse('delta', { text: reply });
          sse('done', { reply, balance_jpy: payerUser.balance_jpy, cost:{jpy:cost.jpy, usd:cost.usd} });
        } catch(e){
          sse('error', { message: e.message });
        }
        clearInterval(ka);
        res.end();
        return;
      }
      // Non-streaming fallback for legacy clients
      try {
        const planRes = await _runPlanExecuteReview(message, {
          agent,
          modelAlias: (agent.model === 'auto' ? 'sonnet' : agent.model),
          baseSysFn: () => buildSystem(teamMemberAgent || agent, { sheetsActive, extensionActive, isGroup, speakerName, memories: (payerUser.memories || user.memories), kbHits: _kbHits, queryEmbedding: _queryEmbedding, recentHistory: (agent.history||[]).slice(-6), userQuery: message, ...(_teamCtx||{}) }),
        });
        const cost = calcCost(planRes.tokens.input, planRes.tokens.output);
        return jres(res, 200, { reply: planRes.reply, cost: { jpy: cost.jpy, usd: cost.usd } });
      } catch(e){
        return jres(res, 502, { error: 'plan failed: ' + e.message });
      }
    }

    // ── SSE streaming branch (no tools) ─────────────────────────
    if(wantStreamPlain){
      res.writeHead(200, {
        'Content-Type':'text/event-stream; charset=utf-8',
        'Cache-Control':'no-cache, no-transform',
        'Connection':'keep-alive',
        'X-Accel-Buffering':'no',
        'Access-Control-Allow-Origin':APP_URL,
      });
      const sse = (ev, data)=>{ res.write('event: '+ev+'\ndata: '+JSON.stringify(data)+'\n\n'); };
      let streamReply = '';
      try{
        const result = await callAIStream(baseMsgs, buildSystem(teamMemberAgent || agent, {sheetsActive, extensionActive, isGroup, speakerName, memories: (payerUser.memories || user.memories), kbHits: _kbHits, queryEmbedding: _queryEmbedding, recentHistory: (agent.history||[]).slice(-6), userQuery: message, ...(_teamCtx||{})}), (delta)=>{
          streamReply += delta;
          try{ sse('delta', {text: delta}); }catch(e){}
        }, agent.model, agent);
        const cost = calcCost(result.inputTokens, result.outputTokens);
        let reply = streamReply || result.text || 'エラー';
        // Critic pass — only fires when the reply is long enough or the user
        // explicitly asked with /improve. Re-streams the improved version
        // via SSE so the bubble updates in place.
        if(_shouldRunCritic(message, reply, agent)){
          try {
            sse('thinking', { iter: 'critic' });
            const improved = await _runCriticPass(reply, { userMsg: message, model: agent.model });
            if(improved && improved !== reply){
              reply = improved;
              // Tell the client the reply was rewritten so it can flash a
              // small "✨ 改善版" badge.
              sse('critic_replaced', { reply });
            }
          } catch(e){ console.warn('[critic-plain] failed:', e.message); }
        }
        const ts = new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
        // Stable id + optional thread parent for Slack-style threading.
        const _threadParent = body.thread_parent_id ? String(body.thread_parent_id).slice(0, 32) : null;
        const _newUid = 'u_'+crypto.randomBytes(4).toString('hex');
        const _newAid = 'a_'+crypto.randomBytes(4).toString('hex');
        const _userMsgEntry = isGroup
          ? {id:_newUid,role:'user',content:message,time:ts,user_id:user.id,user_name:speakerName,user_avatar:speakerInitial,thread_parent_id:_threadParent}
          : {id:_newUid,role:'user',content:message,time:ts,thread_parent_id:_threadParent};
        if(effectiveRegen){
          agent.history=[...(agent.history||[]),{id:_newAid,role:'assistant',content:reply,time:ts,cost_jpy:cost.jpy,thread_parent_id:_threadParent}];
        } else {
          agent.history=[...(agent.history||[]),
            _userMsgEntry,
            {id:_newAid,role:'assistant',content:reply,time:ts,cost_jpy:cost.jpy,thread_parent_id:_threadParent}];
        }
        if(agent.history.length>200) agent.history = agent.history.slice(-200);
        payerUser.balance_jpy = Math.round(((payerUser.balance_jpy||0) - cost.jpy)*1000)/1000;
        payerUser.usage_count = (payerUser.usage_count||0) + 1;
        payerUser.billing_history = payerUser.billing_history || [];
        payerUser.billing_history.push({date:new Date().toISOString(),type:'usage',agentId:agent.id,agentName:agent.name,
          input_tokens:cost.inputTok,output_tokens:cost.outputTok,cost_usd:cost.usd,cost_jpy:cost.jpy,
          ...(isGroupMember ? {via_member_user_id:user.id, via_member_name:speakerName} : {})});
        if(payerUser.billing_history.length>1000) payerUser.billing_history = payerUser.billing_history.slice(-1000);
        const ai = (payerUser.agents||[]).findIndex(a=>a.id===agent.id);
        if(ai>=0) payerUser.agents[ai] = agent;
        await DB.save(payerUser);
        // Rolling summary — fire-and-forget so the response isn't blocked.
        // Saves separately if it folded anything.
        _summarizeOldHistory(agent).then(folded => {
          if(folded){
            const ai2 = (payerUser.agents||[]).findIndex(a=>a.id===agent.id);
            if(ai2>=0) payerUser.agents[ai2] = agent;
            DB.save(payerUser).catch(()=>{});
          }
        }).catch(()=>{});
        // After-turn enrichment: extract memories / task updates / KPI signals
        // / playbook into the agent. Fire-and-forget, ~$0.001 per turn.
        _afterTurnExtract(agent, { userMsg: message, aiReply: reply }).then(dirty => {
          if(dirty){
            const ai2 = (payerUser.agents||[]).findIndex(a=>a.id===agent.id);
            if(ai2>=0) payerUser.agents[ai2] = agent;
            DB.save(payerUser).catch(()=>{});
          }
        }).catch(()=>{});
        if(agent.marketplace_origin && agent.marketplace_origin.creator_user_id && cost.jpy>0){
          creditCreatorRevenue(agent.marketplace_origin.creator_user_id, {
            listing_id: agent.marketplace_origin.listing_id,
            agent_name: agent.name,
            buyer_user_id: payerUser.id,
            cost_jpy: cost.jpy,
          }).catch(e=>console.warn('[revenue] credit failed:', e.message));
        }
        // Push notification: AI replied in a group → notify all members
        if(isGroup){
          notifyGroupMembers(payerUser, agent, {
            sender_user_id: user.id,
            sender_name: speakerName,
            text: reply,
            is_ai_reply: true,
            is_mention: aiMentioned,
          }).catch(()=>{});
        }
        // Surface stop_reason so the client can show a "▶ 続きを書く" button
        // when the model was cut off at max_tokens.
        const _stopReason = (result && result.stopReason) || null;
        const _truncated = _stopReason === 'max_tokens';
        sse('done', { reply, balance_jpy: payerUser.balance_jpy, cost: { jpy: cost.jpy, usd: cost.usd }, stop_reason: _stopReason, truncated: _truncated });
      }catch(e){
        try{ sse('error', { message: e.message }); }catch(_){}
      }
      res.end();
      return;
    }

    let toolLog = []; // visible browser-action log for the frontend
    // SSE setup (only if streaming was requested with tools enabled)
    let sse = null;
    let sseKeepalive = null;
    if(wantStreamTools){
      res.writeHead(200, {
        'Content-Type':'text/event-stream; charset=utf-8',
        'Cache-Control':'no-cache, no-transform',
        'Connection':'keep-alive',
        'X-Accel-Buffering':'no',
        'Access-Control-Allow-Origin':APP_URL,
      });
      sse = (ev, data)=>{ try{ res.write('event: '+ev+'\ndata: '+JSON.stringify(data)+'\n\n'); }catch(e){} };
      // Heartbeat every 15s — Playwright page loads or AI thinking can leave gaps
      // long enough for some intermediate proxies (Render edge) to close idle connections.
      // SSE comments (lines starting with `:`) are ignored by EventSource clients.
      sseKeepalive = setInterval(()=>{ try{ res.write(': keepalive\n\n'); }catch(e){} }, 15000);
      // Stop pinging when client disconnects.
      req.on('close', ()=>{ if(sseKeepalive){ clearInterval(sseKeepalive); sseKeepalive=null; } });
    }
    if(useTools){
      let session = null;
      const sheetsToolNames = new Set(SHEETS_TOOLS.map(t=>t.name));
      // ── Intent-routed forced tool_choice ─────────────────────
      // When the user UNAMBIGUOUSLY asks for a specific deliverable, force
      // the matching tool on the FIRST iteration. Past iterations of this
      // logic over-fired on "完成させた？" / followups → forced a random tool
      // and the API errored. Now we require BOTH (a) a clear build verb
      // AND (b) a specific deliverable noun in the SAME message. Pure
      // questions ("完成した？") and bare verbs ("作って" with no noun) fall
      // back to the system prompt rules, which are also strengthened.
      const _firstToolChoice = (() => {
        const raw = (message||'').trim();
        const m = raw.toLowerCase();
        // ── Slash commands (highest priority — explicit user intent) ─
        // The user explicitly typed the tool name as `/cmd …`, so we force
        // the matching tool without any question/verb gating.
        const slashMatch = raw.match(/^\/([a-z_-]+)\b/i);
        if(slashMatch){
          const cmd = slashMatch[1].toLowerCase();
          const slashMap = {
            'image':'generate_image','img':'generate_image','draw':'generate_image',
            'edit':'edit_image','edit-image':'edit_image',
            'video':'generate_video','movie':'generate_video',
            'audio':'generate_audio','tts':'generate_audio','voice':'generate_audio',
            'pdf':'generate_pdf',
            'chart':'generate_chart','graph':'generate_chart',
            'diagram':'generate_diagram','flow':'generate_diagram','mermaid':'generate_diagram',
            'qr':'generate_qr',
            'email':'send_email','mail':'send_email','sendmail':'send_email',
            'slack':'notify_slack','post-slack':'notify_slack',
            'discord':'notify_discord','post-discord':'notify_discord',
            'cal':'create_calendar_event','calendar':'create_calendar_event','meeting':'create_calendar_event',
            'lp':'create_artifact','mock':'create_artifact','site':'create_artifact','app':'create_artifact','dashboard':'create_artifact',
            'search':'web_search','web':'web_search',
            'fetch':'web_fetch','url':'web_fetch',
            'github-search':'github_search_code','code-search':'github_search_code',
            'github-issues':'github_list_issues','issues':'github_list_issues',
            'github-file':'github_get_file','readme':'github_get_file',
            'pr':'github_create_pr','create-pr':'github_create_pr',
            'issue':'github_create_issue','create-issue':'github_create_issue',
          };
          const toolName = slashMap[cmd];
          if(toolName){
            console.log('[chat] slash-command tool_choice:', cmd, '→', toolName);
            return { type:'tool', name: toolName };
          }
        }
        // Skip pure questions / followups — no forcing.
        const isQuestion = /[?？]\s*$|です(か|の|ね)[?？]?\s*$|した[?？]\s*$|ますか[?？]?\s*$|でしょうか[?？]?\s*$|did you|are you|どこ|なに|何|いつ|なぜ|どう|how|why|when|where|what/i.test(raw);
        if(isQuestion) return null;
        // Require a clear "make/build/send/show" verb.
        const hasBuildVerb = /(作って|作成して|作りたい|出して|用意して|生成して|描いて|デザインして|送って|送信して|投稿して|見せて|表示して|make|create|build|generate|send (?:me|this|it)?|show me|draw|design)/i.test(raw);
        if(!hasBuildVerb) return null;
        // Route ONLY when a specific deliverable noun is present.
        // Edit beats generate: "この画像を変えて" / "背景を白に" / "remove the person"
        const hasEditNoun = /(画像|写真|image|photo|picture)/i.test(raw);
        const hasEditVerb = /(編集|変えて|差し替え|削除|消して|追加して|背景を|スタイルを|edit|remove|change.*background|replace.*background|swap)/i.test(raw);
        if(hasEditNoun && hasEditVerb) return { type:'tool', name:'edit_image' };
        if(/(画像|イラスト|アイコン|ロゴ|illustration|icon|logo|picture|image)/i.test(raw)) return { type:'tool', name:'generate_image' };
        if(/(動画|movie|video)/i.test(raw) && !/エージェント|agent.*promo|プロモ/i.test(raw)) return { type:'tool', name:'generate_video' };
        if(/(音声|ボイス|読み上げ|tts|audio|voice|speech)/i.test(raw)) return { type:'tool', name:'generate_audio' };
        if(/(pdf|請求書|提案書|invoice)/i.test(m)) return { type:'tool', name:'generate_pdf' };
        if(/(グラフ|chart|棒グラフ|折れ線|円グラフ|barchart|piechart)/i.test(raw)) return { type:'tool', name:'generate_chart' };
        if(/(qrコード|qr code|qr)/i.test(m)) return { type:'tool', name:'generate_qr' };
        if(/(メール.*(送|送信)|send.*mail|email.*me|email.*to)/i.test(raw)) return { type:'tool', name:'send_email' };
        if(/(slack.*(投稿|送|post)|post.*slack|slack.*に)/i.test(m)) return { type:'tool', name:'notify_slack' };
        if(/(discord.*(投稿|送|post)|post.*discord)/i.test(m)) return { type:'tool', name:'notify_discord' };
        if(/(予定.*登録|スケジュール.*登録|カレンダー.*登録|meeting|appointment|calendar.*event)/i.test(raw)) return { type:'tool', name:'create_calendar_event' };
        // create_artifact: LP / mockup / dashboard / page / app etc.
        if(/(サイト|lp|モック|ダッシュ|ダッシュボード|ページ|アプリ|計算機|ui|画面|webサイト|ホームページ|landing|mockup|dashboard|page|app|calculator|prototype|landing.*page)/i.test(m)) {
          return { type:'tool', name:'create_artifact' };
        }
        // No specific noun → DON'T force. The system prompt's stall-nudge
        // handles "作って" with vague target by making the model ask one
        // clarifying question or pick the best fit on its own.
        return null;
      })();
      try{
        // Lazy-create the browser session only when Chrome tools are actually wired in.
        // Sheets-only agents don't need Playwright at all.
        if(agent.chrome_enabled){
          session = browser.newSession();
        }
        let convMsgs = baseMsgs.slice();
        let resp;
        let iters = 0;
        let streamedText = ''; // accumulator of everything emitted via SSE 'delta'
        // Hard cap on tool-use iterations. Spreadsheet/browser tasks routinely
        // chain 10-20 tool calls (read meta → read multiple ranges → analyze →
        // write → format), so 5 was way too tight. The real ceiling is BUDGET_MS
        // below — that's what stops runaway loops; this is a defense-in-depth limit.
        const MAX_ITERS = 30;
        const startedAt = Date.now();
        // Tool-loop budget. Was 95s (Render free tier edge cuts at ~100s),
        // but Render Starter + our 15s SSE keepalives let us stretch this
        // comfortably. 280s gives heavy tools (video render 60s, create_artifact
        // 30-60s, image gen + wrap-up 20-40s) plenty of headroom while still
        // protecting against runaway loops.
        const BUDGET_MS = 280 * 1000;
        while(true){
          if(sse) sse('thinking', { iter: iters });
          // Trim heavy data from older tool_result blocks before each call
          // (keeps input tokens under the org rate limit)
          _trimToolHistory(convMsgs);
          // Only force a tool on the FIRST iteration; subsequent iterations
          // are the model reacting to tool_result blocks and need to be free
          // to chat / call more tools / stop.
          const _tc = (iters === 0 && !effectiveRegen) ? _firstToolChoice : null;
          if(_tc){ console.log('[chat] tool_choice forced:', JSON.stringify(_tc)); }
          resp = await callAIWithTools(convMsgs, buildSystem(teamMemberAgent || agent, {sheetsActive, extensionActive, isGroup, speakerName, memories: (payerUser.memories || user.memories), kbHits: _kbHits, queryEmbedding: _queryEmbedding, recentHistory: (agent.history||[]).slice(-6), userQuery: message, ...(_teamCtx||{})}), tools, _tc, agent.model, agent);
          totalIn  += (resp.usage?.input_tokens)||0;
          totalOut += (resp.usage?.output_tokens)||0;

          if(resp.stop_reason !== 'tool_use') break;
          iters++;
          if(iters > MAX_ITERS){
            reply = '(ツール呼び出しの上限に達したため処理を中断しました)';
            break;
          }
          if(Date.now() - startedAt > BUDGET_MS){
            // Budget exhausted. Most heavy tools (image/video/artifact/pdf/etc.)
            // actually produced a result before timing out — only the wrap-up
            // commentary was incomplete. So if toolLog has a successful
            // final-artifact entry with a URL, lead with that instead of a
            // scary "上限に達した" message.
            const FINAL_ARTIFACT_TOOLS_TO = new Set([
              'generate_image','edit_image','generate_video','generate_audio','generate_pdf',
              'generate_chart','generate_diagram','generate_qr',
              'generate_agent_promo_video','create_artifact',
            ]);
            const successes = toolLog.filter(l => l && l.ok && FINAL_ARTIFACT_TOOLS_TO.has(l.name) && l.url);
            const partial = (resp.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('\n').trim();
            if(successes.length){
              const lines = successes.map(l => {
                // Same markdown-link policy as wrap-up skip — make all URLs
                // clickable / inline-rendered.
                if(l.name === 'create_artifact') return '🎨 [**' + (l.title || 'artifact') + '**](' + l.url + ')';
                if(l.name === 'generate_image')  return '🖼️ ![](' + l.url + ')';
                if(l.name === 'edit_image')      return '✂️ ![](' + l.url + ')';
                if(l.name === 'generate_video' || l.name === 'generate_agent_promo_video') return '🎬 ![](' + l.url + ')';
                if(l.name === 'generate_audio')  return '🎵 ![](' + l.url + ')';
                if(l.name === 'generate_pdf')    return '📄 [PDF を開く](' + l.url + ')';
                if(l.name === 'generate_chart')  return '📊 ![](' + l.url + ')';
                if(l.name === 'generate_diagram')return '📐 ![](' + l.url + ')';
                if(l.name === 'generate_qr')     return '🔗 ![](' + l.url + ')';
                return '[開く](' + l.url + ')';
              });
              reply = (partial ? partial + '\n\n' : '✅ 完成しました\n\n')
                + lines.join('\n')
                + '\n\n_(追加の説明が途中で時間切れになりました。詳細が必要なら「説明して」と送ってください)_';
            } else {
              reply = (partial ? partial + '\n\n' : '')
                + '（処理時間の上限（' + Math.round(BUDGET_MS/1000) + '秒）に達したのでここまでの結果をお伝えします。続けたい場合は「続けて」と送ってください）';
            }
            break;
          }

          // Append the assistant's tool_use turn
          convMsgs.push({role:'assistant', content: resp.content});

          // Stream any text the AI emitted alongside its tool calls so the user sees
          // its reasoning even before tools finish. Track in streamedText so the final
          // saved reply matches what the user actually saw on screen.
          if(sse){
            const reasonText = (resp.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('').trim();
            if(reasonText){
              streamedText += reasonText + '\n\n';
              sse('delta', { text: reasonText + '\n\n' });
            }
          }

          // Run each tool_use block. Browser ops must be serial (shared Playwright page);
          // sheets ops are independent but for simplicity we keep the same loop.
          const toolResultBlocks = [];
          for(const block of (resp.content||[])){
            if(block.type !== 'tool_use') continue;
            if(sse) sse('tool_call', { name: block.name, input: block.input||{} });
            let result;
            if(sheetsToolNames.has(block.name)){
              result = await executeSheetsTool(user, block.name, block.input||{});
            } else if(block.name === 'generate_image'){
              result = await executeImageTool(block.name, block.input||{});
            } else if(block.name === 'edit_image'){
              result = await executeImageEditTool(block.input||{});
            } else if(block.name === 'generate_video'){
              result = await executeVideoTool(block.name, block.input||{});
            } else if(block.name === 'generate_audio'){
              result = await executeAudioTool(block.input||{});
            } else if(block.name === 'generate_pdf'){
              result = await executePdfTool(block.input||{});
            } else if(block.name === 'generate_chart'){
              result = await executeChartTool(block.input||{});
            } else if(block.name === 'generate_diagram'){
              result = await executeDiagramTool(block.input||{});
            } else if(block.name === 'send_email'){
              result = await executeEmailTool(user, (teamMemberAgent || agent), block.input||{});
            } else if(block.name === 'generate_qr'){
              result = await executeQrTool(block.input||{});
            } else if(block.name === 'create_artifact'){
              result = await executeArtifactTool(block.input||{}, payerUser);
            } else if(block.name === 'notify_slack'){
              result = await executeNotifyTool('slack', payerUser, block.input||{});
            } else if(block.name === 'notify_discord'){
              result = await executeNotifyTool('discord', payerUser, block.input||{});
            } else if(block.name === 'generate_agent_promo_video'){
              const promoAgent = (block.input && block.input.tagline)
                ? { ...(teamMemberAgent || agent), persona: String(block.input.tagline).slice(0,140) }
                : (teamMemberAgent || agent);
              result = await executeAgentPromoVideo(promoAgent);
            } else if(block.name === 'web_screenshot'){
              result = await executeWebScreenshotTool(block.input||{});
            } else if(block.name === 'web_read_markdown'){
              result = await executeWebReadMdTool(block.input||{});
            } else if(block.name === 'web_extract'){
              result = await executeWebExtractTool(block.input||{});
            } else if(block.name && block.name.startsWith('github_')){
              result = await executeGitHubTool(payerUser, block.name, block.input||{});
            } else if(block.name && block.name.startsWith('mcp_') && _mcpRouting && _mcpRouting.has(block.name)){
              // Route back to the originating MCP server using the prefix map.
              const route = _mcpRouting.get(block.name);
              result = await _mcpCallTool(route.server, route.toolName, block.input || {});
            } else if(block.name && block.name.startsWith('ext_')){
              result = await executeExtensionTool(user, block.name, block.input||{});
            } else if(session){
              result = await executeBrowserTool(session, block.name, block.input||{}, { sheetsConnected, sheetsActive });
            } else {
              result = {error:'tool_unavailable: '+block.name+' (Chrome 連携が無効です)'};
            }
            const logEntry = {
              name: block.name,
              input: block.input||{},
              ok: !(result&&result.error),
              url: result&&result.url,
              title: result&&result.title,
              text: result&&result.text ? String(result.text).slice(0,400) : '',
              results: result&&result.results,
              count: result&&result.count,
              screenshot: result&&result.screenshot,
              error: result&&result.error,
            };
            toolResultBlocks.push(buildToolResult(block.id, block.name, result));
            toolLog.push(logEntry);
            if(sse) sse('tool_result', logEntry);
          }
          convMsgs.push({role:'user', content: toolResultBlocks});

          // ── Wrap-up turn skip ─────────────────────────────────
          // When the only tool calls were self-contained "produce a final
          // artifact" generators (image / video / audio / pdf / chart /
          // diagram / qr / artifact), the model's next turn is a polite
          // "Here's your X: <link>" — a full LLM round-trip we can synthesize
          // locally. Skipping it on the first iteration cuts perceived
          // latency for image/video gen by ~40–60%.
          const FINAL_ARTIFACT_TOOLS = new Set([
            'generate_image','edit_image','generate_video','generate_audio','generate_pdf',
            'generate_chart','generate_diagram','generate_qr',
            'generate_agent_promo_video','create_artifact',
          ]);
          const toolUseBlocks = (resp.content||[]).filter(b=>b.type==='tool_use');
          const allFinalArtifact = toolUseBlocks.length > 0
            && toolUseBlocks.every(b => FINAL_ARTIFACT_TOOLS.has(b.name));
          const anySuccess = toolLog.slice(-toolUseBlocks.length).some(l => l && l.ok);
          if(iters === 1 && allFinalArtifact && anySuccess){
            // NOTE: do NOT re-include the AI's preamble text here. By the time
            // we reach this point the iter-0 text has ALREADY been streamed to
            // the client via the reasonText path above. Including it again
            // here would cause the chunk-streaming loop after the main loop
            // to re-emit the same paragraph, which showed up as visible
            // duplication ("見えてます！…" appearing twice in the bubble).
            // Pull the successful tool results from this turn (last N entries).
            const turnResults = toolLog.slice(-toolUseBlocks.length).filter(l => l && l.ok);
            const lines = turnResults.map(l => {
              // Wrap URLs in markdown so the chat renderer turns them into
              // clickable links / inline images / video tags. Plain text URLs
              // were getting shown as text instead of being openable.
              if(l.name === 'create_artifact'){
                const t = l.title || l.text || 'artifact';
                return l.url ? '🎨 [**'+t+'**]('+l.url+')' : '🎨 '+t;
              }
              if(l.name === 'generate_image') return l.url ? '🖼️ ![]('+l.url+')' : '🖼️ 画像を生成しました';
              if(l.name === 'edit_image')     return l.url ? '✂️ ![]('+l.url+')' : '✂️ 画像を編集しました';
              if(l.name === 'generate_video') return l.url ? '🎬 ![]('+l.url+')' : '🎬 動画を生成しました';
              if(l.name === 'generate_audio') return l.url ? '🎵 ![]('+l.url+')' : '🎵 音声を生成しました';
              if(l.name === 'generate_pdf')   return l.url ? '📄 [PDF を開く]('+l.url+')' : '📄 PDF を生成しました';
              if(l.name === 'generate_chart') return l.url ? '📊 ![]('+l.url+')' : '📊 グラフを生成しました';
              if(l.name === 'generate_diagram')return l.url? '📐 ![]('+l.url+')' : '📐 図を生成しました';
              if(l.name === 'generate_qr')    return l.url ? '🔗 ![]('+l.url+')' : '🔗 QR を生成しました';
              if(l.name === 'generate_agent_promo_video') return l.url ? '🎬 ![]('+l.url+')' : '🎬 動画を生成しました';
              return l.url ? '[開く]('+l.url+')' : (l.text || '完了しました');
            });
            reply = lines.join('\n');
            // Track that we synthesized so the existing fallback below doesn't
            // overwrite reply with empty resp.content text.
            break;
          }
        }

        // Final reply (text from last assistant turn)
        if(!reply){
          reply = (resp.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('\n').trim()
            || '応答を生成できませんでした';
        }
        // Critic pass — long answer or /improve trigger. Skipped on artifact
        // wrap-up replies (the synthesized "🎨 [link]" string is short).
        if(_shouldRunCritic(message, reply, agent)){
          try {
            const improved = await _runCriticPass(reply, { userMsg: message, model: agent.model });
            if(improved && improved !== reply){
              reply = improved;
              if(sse) sse('critic_replaced', { reply });
            }
          } catch(e){ console.warn('[critic-tools] failed:', e.message); }
        }
        // Stream the final reply text in chunks so the user sees it appear, since
        // we use non-streaming Anthropic calls for the tool loop (true delta streams
        // would require parsing input_json_delta deltas — left for a future revamp).
        // Use Array.from() to iterate by code points (Unicode-aware), so emojis and
        // surrogate-pair characters never get split across chunk boundaries.
        if(sse && reply){
          // Faster pseudo-stream of the final reply. Was 25 chars + 8ms (≈ 1-2s
          // of artificial typewriter delay on long replies). Bumped to 200
          // chars + 0ms so the artifact / URL appears near-instantly once
          // the loop ends; the user still sees streaming-style growth instead
          // of a single dump because Anthropic's chunk arrival itself paces
          // delivery during iteration loops.
          const chars = Array.from(reply);
          const chunkSize = 200;
          for(let i=0; i<chars.length; i+=chunkSize){
            const chunk = chars.slice(i, i+chunkSize).join('');
            streamedText += chunk;
            sse('delta', { text: chunk });
          }
        }
        // Save the full streamed transcript (intermediate reasoning + final answer)
        // so the persisted history matches what the user saw on screen.
        if(sse && streamedText.trim()) reply = streamedText.trim();
      }catch(e){
        // Browser unavailable on this host — fall back to plain chat so user still gets an answer
        const msg = (e&&e.message)||'';
        if(/browser|playwright|launch_failed|not_installed/i.test(msg)){
          console.warn('[chat] Chrome unavailable, falling back to plain chat:', msg);
          try{
            const d=await callAI(baseMsgs, buildSystem(teamMemberAgent || agent, {sheetsActive, extensionActive, isGroup, speakerName, memories: (payerUser.memories || user.memories), kbHits: _kbHits, queryEmbedding: _queryEmbedding, recentHistory: (agent.history||[]).slice(-6), userQuery: message, ...(_teamCtx||{})}), agent.model, agent);
            reply = d.content?.find(b=>b.type==='text')?.text || 'エラー';
            totalIn  = d.usage?.input_tokens || 0;
            totalOut = d.usage?.output_tokens || 0;
          }catch(e2){
            return jres(res,502,{error:`AI応答エラー: ${e2.message}`});
          }
        } else if(/rate limit|429|input tokens per minute/i.test(msg)){
          if(sse){ sse('error', { message:'混雑のため一時的に応答できません。30秒ほど待ってから再送信してください。' }); if(sseKeepalive){clearInterval(sseKeepalive);} res.end(); return; }
          return jres(res,429,{error:'混雑のため一時的に応答できません。30秒ほど待ってから再送信してください。'});
        } else {
          if(sse){ sse('error', { message:`AI応答エラー: ${msg}` }); if(sseKeepalive){clearInterval(sseKeepalive);} res.end(); return; }
          return jres(res,502,{error:`AI応答エラー: ${msg}`});
        }
      } finally {
        if(session){ try{ await session.close(); }catch(e){} }
      }
      cost = calcCost(totalIn, totalOut);
    } else {
      // Existing path — no tools
      try{
        const d = await callAI(baseMsgs, buildSystem(teamMemberAgent || agent, {sheetsActive, extensionActive, isGroup, speakerName, memories: (payerUser.memories || user.memories), kbHits: _kbHits, queryEmbedding: _queryEmbedding, recentHistory: (agent.history||[]).slice(-6), userQuery: message, ...(_teamCtx||{})}), agent.model, agent);
        reply = d.content?.find(b=>b.type==='text')?.text || 'エラーが発生しました';
        const u = d.usage||{};
        cost = calcCost(u.input_tokens||0, u.output_tokens||0);
      }catch(e){return jres(res,502,{error:`AI応答エラー: ${e.message}`});}
    }
    const msgs = baseMsgs;
    const ts=new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
    const _threadParent2 = body.thread_parent_id ? String(body.thread_parent_id).slice(0, 32) : null;
    const _newUid2 = 'u_'+crypto.randomBytes(4).toString('hex');
    const _newAid2 = 'a_'+crypto.randomBytes(4).toString('hex');
    const _userMsgEntry2 = isGroup
      ? {id:_newUid2,role:'user',content:message,time:ts,user_id:user.id,user_name:speakerName,user_avatar:speakerInitial,thread_parent_id:_threadParent2}
      : {id:_newUid2,role:'user',content:message,time:ts,thread_parent_id:_threadParent2};
    if(effectiveRegen){
      agent.history=[...(agent.history||[]),{id:_newAid2,role:'assistant',content:reply,time:ts,cost_jpy:cost.jpy,thread_parent_id:_threadParent2}];
    } else {
      agent.history=[...(agent.history||[]),
        _userMsgEntry2,
        {id:_newAid2,role:'assistant',content:reply,time:ts,cost_jpy:cost.jpy,thread_parent_id:_threadParent2}];
    }
    if(agent.history.length>200)agent.history=agent.history.slice(-200);
    payerUser.balance_jpy=Math.round(((payerUser.balance_jpy||0)-cost.jpy)*1000)/1000;
    payerUser.usage_count=(payerUser.usage_count||0)+1;
    payerUser.billing_history=payerUser.billing_history||[];
    payerUser.billing_history.push({date:new Date().toISOString(),type:'usage',agentId:agent.id,agentName:agent.name,
      input_tokens:cost.inputTok,output_tokens:cost.outputTok,cost_usd:cost.usd,cost_jpy:cost.jpy,
      ...(isGroupMember ? {via_member_user_id:user.id, via_member_name:speakerName} : {})});
    if(payerUser.billing_history.length>1000)payerUser.billing_history=payerUser.billing_history.slice(-1000);
    const ai=(payerUser.agents||[]).findIndex(a=>a.id===agent.id);
    if(ai>=0)payerUser.agents[ai]=agent;
    await DB.save(payerUser);
    // Rolling summary — fire-and-forget. If it folds, re-save.
    _summarizeOldHistory(agent).then(folded => {
      if(folded){
        const ai2 = (payerUser.agents||[]).findIndex(a=>a.id===agent.id);
        if(ai2>=0) payerUser.agents[ai2] = agent;
        DB.save(payerUser).catch(()=>{});
      }
    }).catch(()=>{});
    // After-turn enrichment — memories / tasks / KPI / playbook.
    _afterTurnExtract(agent, { userMsg: message, aiReply: reply }).then(dirty => {
      if(dirty){
        const ai2 = (payerUser.agents||[]).findIndex(a=>a.id===agent.id);
        if(ai2>=0) payerUser.agents[ai2] = agent;
        DB.save(payerUser).catch(()=>{});
      }
    }).catch(()=>{});
    // Credit the marketplace creator (#5 revenue ledger) — fire-and-forget
    if(agent.marketplace_origin && agent.marketplace_origin.creator_user_id && cost.jpy>0){
      creditCreatorRevenue(agent.marketplace_origin.creator_user_id, {
        listing_id: agent.marketplace_origin.listing_id,
        agent_name: agent.name,
        buyer_user_id: payerUser.id,
        cost_jpy: cost.jpy,
      }).catch(e=>console.warn('[revenue] credit failed:', e.message));
    }
    // Push notification: AI replied in a group → notify all members
    if(isGroup){
      notifyGroupMembers(payerUser, agent, {
        sender_user_id: user.id,
        sender_name: speakerName,
        text: reply,
        is_ai_reply: true,
        is_mention: aiMentioned,
      }).catch(()=>{});
    }
    if(sse){
      // Surface stop_reason from the last tool-loop response so the client
      // can decide whether to show a "▶ 続きを書く" Continue button.
      const _stopReason = (resp && resp.stop_reason) || null;
      const _truncated = _stopReason === 'max_tokens';
      // Emit the (possibly already-streamed) reply once at the end so the client
      // can finalize the bubble. delta events were sent inside the loop.
      sse('done', { reply, balance_jpy: payerUser.balance_jpy, cost: { jpy: cost.jpy, usd: cost.usd }, tool_log: toolLog, stop_reason: _stopReason, truncated: _truncated });
      if(sseKeepalive){ clearInterval(sseKeepalive); sseKeepalive=null; }
      res.end();
      return;
    }
    return jres(res,200,{reply,balance_jpy:payerUser.balance_jpy,cost:{jpy:cost.jpy,usd:cost.usd},tool_log:toolLog||null});
  }


  // ── POST /api/search ───────────────────────────────────────
  // Lightweight web search for non-Chrome agents (slash-command).
  // body: {query: string} → {query, results, source}
  if(pathname==='/api/search' && method==='POST'){
    const body = await readBody(req);
    const query = String(body.query||'').trim().slice(0,200);
    if(!query) return jres(res,400,{error:'検索クエリを入力してください'});
    if(!rateLimit('search:'+user.id, 30, 60000)) return jres(res,429,{error:'検索回数が多すぎます。少し待ってから試してください'});
    let results = [];
    let source = 'ddg';
    if(BRAVE_KEY){
      try{ results = await braveSearch(query); source = 'brave'; }
      catch(e){ console.warn('[search] brave failed:', e.message); }
    }
    if(!results.length){ results = await ddgSearch(query); source = 'ddg'; }
    return jres(res,200,{query, results, source});
  }

  // ── PATCH /api/user/profile ─────────────────────────────────
  if(pathname==='/api/user/profile'&&method==='PATCH'){
    const body=await readBody(req);
    if(body.name) user.name=String(body.name).trim().substring(0,50);
    await DB.save(user);
    return jres(res,200,{user:safe(user)});
  }

  // ── PATCH /api/user/password ─────────────────────────────────
  if(pathname==='/api/user/password'&&method==='PATCH'){
    const body=await readBody(req);
    const{current_password,new_password}=body;
    if(!PW.check(current_password,user.password))return jres(res,400,{error:'現在のパスワードが正しくありません'});
    if(!new_password||new_password.length<8)return jres(res,400,{error:'パスワードは8文字以上にしてください'});
    user.password=PW.hash(new_password);
    await DB.save(user);
    return jres(res,200,{ok:true});
  }

  // ── DELETE /api/user/delete ──────────────────────────────────
  if(pathname==='/api/user/delete'&&method==='DELETE'){
    await DB.remove(user.id);
    return jres(res,200,{ok:true});
  }

  // ── POST /api/user/clear-chat-history ────────────────────────
  // body: {agent_id?: string} — if set, clears only that agent's history;
  // otherwise clears history of all agents. Agents/balance/usage_count preserved.
  if(pathname==='/api/user/clear-chat-history'&&method==='POST'){
    const{agent_id}=await readBody(req);
    let cleared=0;
    user.agents=(user.agents||[]).map(function(a){
      if(!agent_id || a.id===agent_id){ a.history=[]; cleared++; }
      return a;
    });
    await DB.save(user);
    return jres(res,200,{ok:true,cleared});
  }


  // ── POST /api/billing/setup-intent ────────────────────────
  // Modern flow: collect card via SetupIntent, then attach PM to subscription.
  // Replaces the older default_incomplete + latest_invoice.payment_intent flow.
  if(pathname==='/api/billing/setup-intent'&&method==='POST'){
    if(!STRIPE_SK) return jres(res,503,{error:'Stripe が設定されていません'});
    try{
      let customerId = user.stripe_customer_id;
      if(!customerId){
        customerId = await stripeCreateCustomer(user.email, user.name||user.email);
        user.stripe_customer_id = customerId;
        await DB.save(user);
      }
      const si = await stripeCreateSetupIntent(customerId);
      return jres(res,200,{client_secret: si.client_secret});
    }catch(e){
      console.error('[billing/setup-intent]', e.message);
      return jres(res,500,{error:'Stripe エラー: '+e.message});
    }
  }

  // ── POST /api/billing/subscribe ────────────────────────────
  // body: {plan, payment_method_id?}  — if payment_method_id is provided
  // (modern flow), creates a sub with default_payment_method (auto-charges).
  // If omitted, falls back to default_incomplete (legacy).
  if(pathname==='/api/billing/subscribe'&&method==='POST'){
    if(!STRIPE_SK) return jres(res,503,{error:'Stripe が設定されていません（管理者にお問い合わせください）'});
    const{plan, payment_method_id}=await readBody(req);
    if(!['pro','business'].includes(plan))return jres(res,400,{error:'プランが不正です'});
    const priceId = plan==='pro' ? STRIPE_PRO_PRICE : STRIPE_BIZ_PRICE;
    if(!priceId)return jres(res,503,{error:(plan==='pro'?'Pro':'Business')+' プランの価格 ID が設定されていません（STRIPE_'+(plan==='pro'?'PRO':'BIZ')+'_PRICE_ID）'});
    try{
      let customerId = user.stripe_customer_id;
      if(!customerId){
        customerId = await stripeCreateCustomer(user.email, user.name||user.email);
        user.stripe_customer_id = customerId;
      }
      const sub = await stripeCreateSubscription(customerId, priceId, payment_method_id);
      const clientSecret = sub.latest_invoice?.payment_intent?.client_secret;
      const piStatus = sub.latest_invoice?.payment_intent?.status;
      const liStatus = typeof sub.latest_invoice === 'string' ? '(unexpanded id)' : sub.latest_invoice?.status;
      console.log('[billing/subscribe] sub.status='+sub.status+' invoice.status='+liStatus+' pi.status='+piStatus+' has_client_secret='+!!clientSecret);
      user.plan = plan;
      user.subscription_id = sub.id;
      user.subscription_status = sub.status;
      // New tier (post-2026-05-10): credits are $15 / $45 instead of $20 / $60.
      // Existing pre-migration subscribers keep their original credit (we treat
      // any user without plan_v2 set as grandfathered).
      user.plan_v2 = true;
      await DB.save(user);
      return jres(res,200,{
        subscription_id: sub.id,
        client_secret: clientSecret,
        status: sub.status,
        plan,
        invoice_status: liStatus,
        pi_status: piStatus,
        latest_invoice_type: typeof sub.latest_invoice,
      });
    }catch(e){
      console.error('[billing/subscribe]', e.message);
      return jres(res,500,{error:'Stripe エラー: '+e.message});
    }
  }

  // ── POST /api/billing/sync ─────────────────────────────────
  // Recovery: fetch the user's active Stripe subscription and sync DB.
  // Used when DB save failed earlier but Stripe has the actual state.
  if(pathname==='/api/billing/sync'&&method==='POST'){
    if(!STRIPE_SK) return jres(res,503,{error:'Stripe が設定されていません'});
    if(!user.stripe_customer_id) return jres(res,200,{plan:'free', synced:false, reason:'no stripe customer'});
    try{
      const subs = await stripeListSubscriptions(user.stripe_customer_id);
      // Pick the latest active/trialing/past_due subscription
      const live = subs.find(s => ['active','trialing','past_due','unpaid'].includes(s.status));
      if(!live){
        user.plan = 'free';
        user.subscription_id = null;
        user.subscription_status = 'canceled';
        await DB.save(user);
        return jres(res,200,{plan:'free', synced:true, reason:'no active subscription'});
      }
      // Map price_id back to plan
      const priceId = live.items?.data?.[0]?.price?.id || '';
      let plan = 'free';
      if(priceId === STRIPE_PRO_PRICE) plan = 'pro';
      else if(priceId === STRIPE_BIZ_PRICE) plan = 'business';
      user.plan = plan;
      user.subscription_id = live.id;
      user.subscription_status = live.status;
      await DB.save(user);
      console.log('[billing/sync] user='+user.id+' plan='+plan+' sub='+live.id+' status='+live.status);
      return jres(res,200,{plan, synced:true, subscription_id: live.id, status: live.status});
    }catch(e){
      console.error('[billing/sync]', e.message);
      return jres(res,500,{error:'Stripe sync エラー: '+e.message});
    }
  }

  // ── POST /api/billing/cancel ───────────────────────────────
  if(pathname==='/api/billing/cancel'&&method==='POST'){
    if(!user.subscription_id)return jres(res,400,{error:'No active subscription'});
    try{
      await stripeCancelSubscription(user.subscription_id);
      user.plan = 'free';
      user.subscription_id = null;
      user.subscription_status = 'canceled';
      await DB.save(user);
      return jres(res,200,{message:'サブスクリプションをキャンセルしました'});
    }catch(e){ return jres(res,500,{error:e.message}); }
  }

  // ── POST /api/billing/charge ───────────────────────────────
  if(pathname==='/api/billing/charge'&&method==='POST'){
    // 注意: パラメータ名 amount_jpy は misnomer。実体は USDセント (例: 699 = $6.99)
    const{amount_jpy}=await readBody(req);
    if(!amount_jpy||amount_jpy<100)return jres(res,400,{error:'最低チャージ額は $1.00 です'});
    if(amount_jpy>100000)return jres(res,400,{error:'1回の上限は $1,000 です'});
    if(!STRIPE_SK){
      // Demo mode — USDセントを JPY 換算して残高に加算
      const creditJpy=Math.round(amount_jpy/100*USD_TO_JPY*1000)/1000;
      user.balance_jpy=Math.round(((user.balance_jpy||0)+creditJpy)*1000)/1000;
      await DB.save(user);
      return jres(res,200,{demo:true,balance_jpy:user.balance_jpy});
    }
    try{
      const pi=await stripeCreatePaymentIntent(amount_jpy,user.id,user.email);
      return jres(res,200,{client_secret:pi.client_secret,publishable_key:STRIPE_PK});
    }catch(e){
      console.error('[billing/charge]', e.message);
      return jres(res,500,{error:'Stripe エラー: '+e.message});
    }
  }

  // ── GET /api/usage ─────────────────────────────────────────
  if(pathname==='/api/usage'&&method==='GET'){
    return jres(res,200,{
      balance_jpy:user.balance_jpy||0,
      total_messages:user.usage_count||0,
      recent_history:(user.billing_history||[]).slice(-30).reverse(),
    });
  }

  // ── DELETE /api/account ────────────────────────────────────
  if(pathname==='/api/account'&&method==='DELETE'){
    // Mark account as deleted (soft delete)
    user.deleted=true;user.email=`deleted_${user.id}@deleted`;
    user.name='削除済みユーザー';user.agents=[];
    await DB.save(user);
    return jres(res,200,{ok:true});
  }

  return jres(res,404,{error:'Not found'});
}

// ── STRIPE WEBHOOK ────────────────────────────────────────────
async function handleWebhook(req,res){
  const sig=req.headers['stripe-signature'];
  if(!sig||!STRIPE_WH)return jres(res,400,{error:'No signature'});
  try{
    const raw=await readRaw(req);
    const event=await verifyStripeWebhook(raw,sig);

    // サブスクリプション更新（毎月クレジット付与）
    if(event.type==='invoice.payment_succeeded'){
      const invoice=event.data.object;
      const customerId=invoice.customer;
      const subId=invoice.subscription;
      if(subId){
        const u=await DB.findBy('stripe_customer_id',customerId);
        if(u){
          const plan=u.plan||'free';
          // Grandfathered (pre-migration registrants) keep $20 / $60.
          // Everyone else gets new $15 / $45 amounts.
          const _gf = _isGrandfathered(u);
          const credits = plan==='pro'   ? (_gf ? 3000 : 2250)
                        : plan==='business' ? (_gf ? 9000 : 6750)
                        : 0;
          if(credits>0){
            u.balance_jpy=(u.balance_jpy||0)+credits;
            u.subscription_status='active';
            u.billing_history=u.billing_history||[];
            u.billing_history.push({date:new Date().toISOString(),type:'subscription',plan,credit_jpy:credits});
            if(u.billing_history.length>1000)u.billing_history=u.billing_history.slice(-1000);
            await DB.save(u);
            console.log('Credits added:', credits, 'JPY to', u.email);
          }
        }
      }
    }
    // サブスクリプションキャンセル
    if(event.type==='customer.subscription.deleted'){
      const sub=event.data.object;
      const u=await DB.findBy('stripe_customer_id',sub.customer);
      if(u){
        u.plan='free';
        u.subscription_id=null;
        u.subscription_status='canceled';
        await DB.save(u);
      }
    }

    if(event.type==='payment_intent.succeeded'){
      const pi=event.data.object;
      const userId=pi.metadata?.userId;
      const amtCentsUsd=parseInt(pi.metadata?.amount_cents_usd||'0',10);
      if(userId&&amtCentsUsd>0){
        const user=await DB.findBy('id',userId);
        if(user){
          const creditJpy=Math.round(amtCentsUsd/100*USD_TO_JPY*1000)/1000;
          user.balance_jpy=Math.round(((user.balance_jpy||0)+creditJpy)*1000)/1000;
          user.billing_history=user.billing_history||[];
          user.billing_history.push({date:new Date().toISOString(),type:'topup',amount_cents_usd:amtCentsUsd,credit_jpy:creditJpy});
          if(user.billing_history.length>1000)user.billing_history=user.billing_history.slice(-1000);
          await DB.save(user);
          console.log('Credits added (PI):',creditJpy,'JPY to',user.email);
        }
      }
    }
    return jres(res,200,{received:true});
  }catch(e){return jres(res,400,{error:e.message});}
}

// ── STATIC FILES ──────────────────────────────────────────────
const MIME={'.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.json':'application/json','.png':'image/png','.ico':'image/x-icon',
  '.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp'};

// If a GA measurement ID is configured, inject the gtag.js snippet into the
// <head> of every served HTML page. Idempotent — skips if already present.
function _injectGA(html){
  let s = String(html);
  // Sentry DSN as a meta tag — picked up by frontend's _initSentry.
  // Gated on SENTRY_DSN env so dev/no-op stays clean.
  const sentryDsn = (process.env.SENTRY_DSN || '').trim();
  if(sentryDsn && !s.includes('name="sentry-dsn"')){
    s = s.replace(/<\/head>/i, '<meta name="sentry-dsn" content="' + sentryDsn.replace(/"/g,'&quot;') + '"></head>');
  }
  if(!GA_ID) return s;
  if(s.includes('googletagmanager.com/gtag/js')) return s; // already present
  const tag = '\n<!-- GA injected -->\n'
    + '<script async src="https://www.googletagmanager.com/gtag/js?id=' + GA_ID + '"></script>\n'
    + '<script>window._GA_ID="' + GA_ID + '";window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}'
    + 'gtag("js",new Date());'
    + '/* Respect cookie consent: only enable analytics on "all" */'
    + 'try{var _cc=localStorage.getItem("cookie:consent");if(_cc==="essential"){window["ga-disable-' + GA_ID + '"]=true;}}catch(e){}'
    + 'gtag("config","' + GA_ID + '",{anonymize_ip:true});</script>\n';
  return s.replace(/<\/head>/i, tag + '</head>');
}

function serveStatic(res,fp){
  const ext=path.extname(fp),mime=MIME[ext]||'application/octet-stream';
  // Files under /generated/ are user-rendered artifacts (mockup LP / videos
  // etc) that the chat embeds via <iframe>. Default SEC has X-Frame-Options:
  // DENY which makes "myaiagents.agency で接続が拒否されました" appear in
  // the iframe. Allow same-origin framing for these paths only.
  const isGenerated = fp.startsWith(GENERATED_DIR);
  const headerSEC = isGenerated
    ? { 'X-Content-Type-Options': SEC['X-Content-Type-Options'],
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': SEC['Referrer-Policy'] }
    : SEC;
  fs.readFile(fp,(err,data)=>{
    if(err){
      // Ephemeral-disk fallback: if a /generated/<file>.html got wiped by a
      // container restart, try to recover the HTML from the DB record. This
      // makes artifact URLs durable across Render redeploys.
      if(isGenerated && ext==='.html'){
        const filename = path.basename(fp);
        findArtifactByFilename(filename).then(a => {
          if(!a || !a.html){
            res.writeHead(404, {'Content-Type':'text/plain'});
            return res.end('artifact expired or not found');
          }
          // Best-effort: write the recovered HTML back to disk so subsequent
          // requests are served from the fast path.
          try { fs.writeFileSync(fp, a.html, 'utf8'); } catch(e){}
          const h={'Content-Type':'text/html; charset=utf-8',...headerSEC,
                   'Cache-Control':'no-cache, no-store, must-revalidate'};
          res.writeHead(200,h); res.end(a.html);
        }).catch(()=>{
          res.writeHead(404,{'Content-Type':'text/plain'}); res.end('Not found');
        });
        return;
      }
      fs.readFile(path.join(PUBLIC_DIR,'404.html'),(e2,d2)=>{
        if(e2){res.writeHead(404);res.end('Not found');}
        else{res.writeHead(404,{'Content-Type':'text/html',...SEC});res.end(d2);}
      });
    }else{
      const h={'Content-Type':mime,...headerSEC};
      if(ext==='.html'){
        h['Cache-Control']='no-cache, no-store, must-revalidate';h['Pragma']='no-cache';h['Expires']='0';
        const needInject = !isGenerated && (GA_ID || (process.env.SENTRY_DSN || '').trim());
        const body = needInject ? Buffer.from(_injectGA(data.toString('utf8')), 'utf8') : data;
        res.writeHead(200,h);res.end(body);
        return;
      }
      h['Cache-Control']='public,max-age=31536000';
      res.writeHead(200,h);res.end(data);
    }
  });
}

// ── MAIN ──────────────────────────────────────────────────────
const server=http.createServer(async(req,res)=>{
  const parsed=url.parse(req.url);
  const pathname=parsed.pathname;
  // Treat HEAD as GET — routes below match on method==='GET' explicitly, so
  // without this rewrite HEAD requests fall through to the auth gate and 401.
  // That breaks SNS unfurl scrapers (FB, LinkedIn, Slack) which often HEAD
  // a URL to validate before GET-ing. Node's http module auto-strips the
  // body on HEAD responses, so handlers can stay GET-shaped.
  const rawMethod = req.method.toUpperCase();
  const method = rawMethod === 'HEAD' ? 'GET' : rawMethod;
  const ip=getIP(req);

  if(method==='OPTIONS'){
    res.writeHead(204,{'Access-Control-Allow-Origin':APP_URL,
      'Access-Control-Allow-Methods':'GET,HEAD,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Max-Age':'86400'});
    return res.end();
  }

  if(pathname==='/api/webhook/stripe'&&method==='POST')return handleWebhook(req,res);

  if(pathname.startsWith('/api/')){
    try{await handleAPI(req,res,pathname,method,ip);}
    catch(e){
      console.error('[API]',e.message,e.stack ? e.stack.split('\n').slice(0,3).join(' | ') : '');
      // Surface specific known errors with a friendlier status + message
      if(e && e.statusCode === 413){
        return jres(res,413,{error:'ファイルが大きすぎます (上限 32MB)'});
      }
      if(e && /too large|payload|body/i.test(e.message||'')){
        return jres(res,413,{error:'リクエストが大きすぎます'});
      }
      if(e && /timeout/i.test(e.message||'')){
        return jres(res,504,{error:'タイムアウトしました。少し時間をおいて再試行してください'});
      }
      jres(res,500,{error:'Internal server error', detail: (e && e.message ? e.message.slice(0,200) : '')});
    }
    return;
  }

  // /a/:share_id → public agent landing page (with OG/Twitter card SSR)
  const aRoute=pathname.match(/^\/a\/([a-z0-9-]+)\/?$/);
  if(aRoute){
    return serveAgentSharePage(res, aRoute[1]);
  }

  // /c/:share_id → public read-only conversation snapshot
  const cRoute=pathname.match(/^\/c\/(c_[A-Za-z0-9_-]+)\/?$/);
  if(cRoute){
    return serveChatSharePage(res, cRoute[1], req);
  }

  // /u/:handle → public creator profile (SSR with OG card)
  const uRoute = pathname.match(/^\/u\/([a-z0-9_]{3,30})\/?$/);
  if(uRoute){
    return serveCreatorProfilePage(res, uRoute[1]);
  }

  // /trending → public agent store filtered to the trending sort.
  // Reuses store.html so we don't ship a second SPA shell; the store JS reads
  // `?sort=trending` off the URL and applies the filter.
  if(pathname === '/trending' || pathname === '/trending/'){
    res.writeHead(302, { Location: '/store?sort=trending' }); return res.end();
  }

  // /w/:token → public webhook entry point. POST a JSON body to trigger the
  // agent owner's agent. GET returns a docs stub so a curious visitor sees
  // something useful instead of 404. Token is the auth.
  const wRoute = pathname.match(/^\/w\/(wh_[A-Za-z0-9_-]+)\/?$/);
  if(wRoute){
    if(method === 'GET'){
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
      return res.end('<!doctype html><meta charset="utf-8"><title>MY AI AGENT — webhook</title><body style="font-family:ui-monospace,monospace;background:#0f1216;color:#e5e7eb;padding:32px;max-width:720px;margin:0 auto"><h1 style="font-size:18px;color:#fdba74">MY AI AGENT · webhook endpoint</h1><p>This is a private webhook entry for an AI agent.</p><pre style="background:#1a1f26;padding:14px;border-radius:8px;font-size:12.5px;overflow-x:auto">POST '+APP_URL+'/w/&lt;TOKEN&gt;\nContent-Type: application/json\n\n{ "message": "Hello agent" }</pre><p style="color:#9ca3af">The agent runs and returns its reply as JSON. No auth header needed — the URL token is the secret.</p></body>');
    }
    if(method !== 'POST'){
      res.writeHead(405,{'Allow':'GET, POST'}); return res.end();
    }
    // Per-token RL — leaked token = wallet drain risk. 60 hits/min is plenty
    // for a sensible automation; serious abuse trips this and the owner sees
    // a 429 in their integration logs instead of getting billed for it.
    if(!rateLimit('wh:'+wRoute[1], 60, 60000)){
      return jres(res, 429, { error: 'rate_limit', detail: 'too many requests on this webhook (60/min)' });
    }
    return (async () => {
      try {
        const found = await findAgentByWebhookToken(wRoute[1]);
        if(!found) return jres(res, 404, { error: 'webhook not found' });
        const { user: owner, agent } = found;
        const payload = (await readBody(req)) || {};
        // Accept either {message:"..."} or any object (stringify it).
        let message;
        if(typeof payload.message === 'string') message = payload.message;
        else if(typeof payload === 'string') message = payload;
        else message = JSON.stringify(payload, null, 2);
        if(!message || !message.trim()) return jres(res, 400, { error: 'message body required' });
        if(message.length > 8000) message = message.slice(0, 8000);
        // Per-owner daily spend cap — bounds the blast radius of a leaked
        // webhook URL. Sliding 24h window of JPY billed via webhook-origin
        // entries in billing_history. Default ¥1,000/day; agent-level override
        // honored via agent.webhook_daily_cap_jpy.
        const cap = (typeof agent.webhook_daily_cap_jpy === 'number' && agent.webhook_daily_cap_jpy > 0)
          ? agent.webhook_daily_cap_jpy : 1000;
        const since = Date.now() - 24*60*60*1000;
        const spentToday = (owner.billing_history||[]).reduce((sum,e)=>{
          if(!e || e.type !== 'usage' || e.via !== 'webhook') return sum;
          if(new Date(e.date||0).getTime() < since) return sum;
          return sum + (e.cost_jpy||0);
        }, 0);
        if(spentToday >= cap){
          return jres(res, 402, {
            error: 'webhook_daily_cap_reached',
            cap_jpy: cap, spent_jpy: Math.round(spentToday*100)/100,
            detail: 'This webhook has hit its 24h spend cap. Raise agent.webhook_daily_cap_jpy or wait for the rolling window to clear.',
          });
        }
        if((owner.balance_jpy||0) <= 0){
          return jres(res, 402, { error: 'owner balance is zero — please top up' });
        }
        const sys = buildSystem(agent, {
          memories: (owner.memories || []),
          kbHits: _retrieveKbChunks(agent, message, 3),
        });
        const msgs = [...(agent.history||[]).slice(-30), { role:'user', content: message }];
        const r = await callAI(msgs, sys, agent.model);
        const reply = (r && r.content && r.content[0] && r.content[0].text) || '';
        const cost = (r && r.usage)
          ? calcCost(r.usage.input_tokens||0, r.usage.output_tokens||0)
          : { jpy:0, usd:0 };
        const ts = new Date().toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit',hour12:false});
        agent.history = [
          ...(agent.history||[]),
          { role:'user', content: message, time: ts, via:'webhook' },
          { role:'assistant', content: reply, time: ts, cost_jpy: cost.jpy, via:'webhook' },
        ];
        if(agent.history.length > 200) agent.history = agent.history.slice(-200);
        owner.balance_jpy = Math.round(((owner.balance_jpy||0) - cost.jpy)*1000)/1000;
        // Record billing with via:'webhook' so the daily-cap counter above can
        // see it on the next request.
        owner.billing_history = owner.billing_history || [];
        owner.billing_history.push({
          date: new Date().toISOString(), type: 'usage', via: 'webhook',
          agentId: agent.id, agentName: agent.name,
          cost_jpy: cost.jpy,
        });
        if(owner.billing_history.length > 1000) owner.billing_history = owner.billing_history.slice(-1000);
        try { await DB.save(owner); } catch(e){ console.warn('[webhook] save failed:', e.message); }
        return jres(res, 200, { reply, agent: { name: agent.name, avatar: agent.avatar }, cost_jpy: cost.jpy });
      } catch(e){
        console.error('[webhook] error:', e.message);
        return jres(res, 500, { error: 'internal error', detail: (e&&e.message||'').slice(0,200) });
      }
    })();
  }

  // /g/:token and /i/:token → public group invite landing
  // (SSR with OG meta + redirect). /i/ is the friendlier alias the
  // marketing strategy refers to; both render the same page.
  const gRoute = pathname.match(/^\/(?:g|i)\/([a-zA-Z0-9]{4,16})\/?$/);
  if(gRoute){
    return serveGroupInvitePage(res, gRoute[1]);
  }

  // /l/:listing_id → public marketplace listing landing (with OG meta SSR)
  const lRoute=pathname.match(/^\/l\/(ls_[a-z0-9_-]+)\/?$/);
  if(lRoute){
    // English-default. Only flip to JA when ?lang=ja is explicit. The rest of
    // the product (LP, app, share page) is EN-default; matching that here.
    let lang = 'en';
    try{
      const qs = new url.URL(req.url, APP_URL).searchParams;
      const explicit = (qs.get('lang')||'').toLowerCase();
      if(explicit === 'en' || explicit === 'ja') lang = explicit;
    }catch(e){}
    return serveListingPage(res, lRoute[1], lang);
  }

  // /sitemap.xml → static + every live public listing (for SEO)
  if(pathname === '/sitemap.xml'){
    return serveSitemapXml(res);
  }
  // /robots.txt → allow crawlers + explicit allow for social-card bots
  if(pathname === '/robots.txt'){
    res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public, max-age=3600'});
    return res.end(
      // Social link-preview crawlers need full access to anything users share
      // (auth.html with ?ref= referrals, share.html, strategy-1000.html etc.).
      // They respect robots.txt, so put them first with explicit Allow rules.
      'User-agent: Twitterbot\nAllow: /\nDisallow: /api/\n\n' +
      'User-agent: facebookexternalhit\nAllow: /\nDisallow: /api/\n\n' +
      'User-agent: LinkedInBot\nAllow: /\nDisallow: /api/\n\n' +
      'User-agent: Slackbot-LinkExpanding\nAllow: /\nDisallow: /api/\n\n' +
      'User-agent: Slackbot\nAllow: /\nDisallow: /api/\n\n' +
      'User-agent: Discordbot\nAllow: /\nDisallow: /api/\n\n' +
      // Default crawlers: keep the /app.html restriction (it's a SPA shell
      // with no SEO value) but allow /auth.html (signup landing has OG now).
      'User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /app.html\n\n' +
      'Sitemap: ' + APP_URL + '/sitemap.xml\n'
    );
  }
  // index.html → redirect to lp
  // /store (no extension) → serve store.html (public Agent Store browse page)
  let resolved = pathname;
  if(resolved === '/') resolved = 'lp.html';
  else if(resolved === '/store' || resolved === '/store/') resolved = 'store.html';
  else if(resolved === '/changelog' || resolved === '/changelog/') resolved = 'changelog.html';
  let fp=path.join(PUBLIC_DIR, resolved);
  if(!fp.startsWith(PUBLIC_DIR)){res.writeHead(403);return res.end();}
  serveStatic(res,fp);
});

process.on('uncaughtException',err=>{if(err.code==='ECONNRESET'||err.message==='socket hang up')return;console.error('Uncaught:',err.message);});
process.on('unhandledRejection',err=>{console.error('Unhandled:',err?.message||err);});

// ── Auto-migrate Supabase schema on boot ─────────────────────
// Reads docs/SUPABASE_MIGRATION.sql and runs it via direct Postgres connection.
// Idempotent (every ALTER uses IF NOT EXISTS) so it's safe to run on every deploy.
// Requires DATABASE_URL env var (Supabase Project Settings → Database → Connection
// pooling → Transaction mode connection string with the password filled in).
async function autoMigrate(){
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if(!dbUrl){
    console.log('[migrate] skipped — DATABASE_URL not set (manual schema management)');
    return;
  }
  let pg;
  try{ pg = require('pg'); }
  catch(e){ console.warn('[migrate] pg lib not installed — npm install failed?', e.message); return; }
  const fs = require('fs');
  const path = require('path');
  const sqlPath = path.join(__dirname, '..', 'docs', 'SUPABASE_MIGRATION.sql');
  let sql;
  try{ sql = fs.readFileSync(sqlPath, 'utf8'); }
  catch(e){ console.warn('[migrate] could not read', sqlPath, '—', e.message); return; }
  const client = new pg.Client({
    connectionString: dbUrl,
    // Supabase requires SSL but doesn't always present a CA the system trusts.
    ssl: { rejectUnauthorized: false },
  });
  try{
    await client.connect();
    // Run the entire script as a single multi-statement query. All statements use
    // IF NOT EXISTS so re-running is a no-op.
    await client.query(sql);
    console.log('[migrate] ✅ schema applied (', sqlPath.split('/').slice(-2).join('/'), ')');
  }catch(e){
    console.error('[migrate] ❌ failed:', e.message);
  }finally{
    try{ await client.end(); }catch(e){}
  }
}

// ── Marketplace seed: 50 curated agents + 50 curated teams ──
// Owned by a single 'system' user so they appear publicly in the Store.
// Idempotent: only adds listings whose deterministic ls_seed_<slug> isn't
// already saved. Safe to run on every boot.
async function seedMarketplace(){
  let seed;
  try { seed = require('./seed_marketplace'); }
  catch(e){ console.warn('[seed] seed module not loaded:', e.message); return; }
  const SYS_ID = 'sys_marketplace_seed';
  const SYS_EMAIL = 'curated@myaiagents.agency';
  let sysUser = await DB.findBy('id', SYS_ID).catch(()=>null);
  if(!sysUser){
    sysUser = newUser({
      name: 'MY AI AGENT',
      email: SYS_EMAIL,
      password: PW.hash('seed-' + crypto.randomBytes(16).toString('hex')),
      verified: true,
    });
    sysUser.id = SYS_ID;          // pin the id so we can find it again
    sysUser.is_verified = true;   // verified-creator badge on cards
    sysUser.plan = 'business';    // host plan should never block listings
    sysUser.plan_v2_grandfathered = true;
    try {
      await DB.create(sysUser);
      console.log('[seed] created system curator user');
    } catch(e){
      console.error('[seed] failed to create system user:', e.message);
      return;
    }
  }
  // Existing listings (by listing_id) so we don't re-add
  const existingIds = new Set(
    (sysUser.agents||[])
      .map(a => a && a.marketplace && a.marketplace.listing_id)
      .filter(Boolean)
  );
  const toAdd = [];
  for(const spec of seed.SEED_AGENTS){
    const lid = 'ls_seed_' + spec.slug;
    if(existingIds.has(lid)) continue;
    toAdd.push(seed.buildSeedAgent(spec));
  }
  for(const spec of seed.SEED_TEAMS){
    const lid = 'ls_seed_' + spec.slug;
    if(existingIds.has(lid)) continue;
    const built = seed.buildSeedTeam(spec);
    toAdd.push(...built.members, built.group);
  }
  if(!toAdd.length){
    console.log('[seed] marketplace seeds already present (' + existingIds.size + ' listings)');
    return;
  }
  sysUser.agents = [...(sysUser.agents||[]), ...toAdd];
  try {
    await DB.save(sysUser);
    console.log('[seed] added ' + toAdd.length + ' records to the system curator (now ' + (sysUser.agents||[]).length + ' total)');
  } catch(e){
    console.error('[seed] DB.save failed:', e.message);
  }
}

// Boot side-effects (listen, migrate, keep-alive ping) run only when this file
// is executed directly. When required from a test, the test harness owns the
// listen lifecycle so suites can bind to an ephemeral port and tear down cleanly.
if(require.main === module){
  server.listen(PORT,'0.0.0.0', async ()=>{
    console.log(`\n🚀 MY AI Agent`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   Anthropic: ${ANTHROPIC?'✅':'❌ Missing ANTHROPIC_API_KEY'}`);
    console.log(`   SUPA_KEY:  ${SUPA_KEY.substring(0,20)}`);
    console.log(`   DB:        ${USE_SUPA?'✅ Supabase':'⚠️  Local JSON'}`);
    console.log(`   Stripe:    ${STRIPE_SK?'✅':'⚠️  Demo mode'}`);
    console.log(`   Google:    ${GOOGLE_ID?'✅':'⚠️  Not configured'}`);
    console.log(`   Email:     ${RESEND_KEY?'✅ Resend':'⚠️  Console only'}\n`);
    // Run schema migration AFTER server is listening so health checks pass even if
    // migration is slow. Failures are logged but don't crash the server.
    autoMigrate()
      .catch(e=>console.error('[migrate] crashed:', e.message))
      .finally(()=>{
        // Seed runs after migration so the schema is in place. Idempotent.
        seedMarketplace().catch(e=>console.error('[seed] crashed:', e.message));
      });
  });
  server.on('error',err=>{if(err.code==='EADDRINUSE'){console.error('Port in use:',PORT);process.exit(1);}else{console.error('Server error:',err.message);}});
  process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
  process.on('SIGINT', ()=>server.close(()=>process.exit(0)));

  // ── Keep-Alive: スリープ復帰後に自動稼働 ──────────────────────────────
  // Renderフリープランの非アクティブスリープを防ぐため14分ごとに自己ping
  const _SELF_URL = process.env.APP_URL || 'https://myaiagents.agency';
  setInterval(() => {
    https.get(_SELF_URL + '/api/health', (res) => {
      console.log('[keep-alive] ping ok:', res.statusCode);
    }).on('error', (e) => {
      console.warn('[keep-alive] ping failed:', e.message);
    });
  }, 14 * 60 * 1000);
  console.log('[keep-alive] started ->', _SELF_URL);

  // ── Marketing autopilot: 07:00 JST content gen + 23:00 JST daily report
  // Disabled by default — set MKT_AUTOPILOT=1 + MKT_ADMIN_EMAIL to enable.
  if(process.env.MKT_AUTOPILOT === '1' && process.env.MKT_ADMIN_EMAIL){
    marketing.startScheduler({
      callAI, DB, USE_SUPA, LDB, sendEmail,
      adminEmail: process.env.MKT_ADMIN_EMAIL,
    });
    console.log('[marketing] autopilot started — report → ' + process.env.MKT_ADMIN_EMAIL);
  } else {
    console.log('[marketing] autopilot OFF (set MKT_AUTOPILOT=1 + MKT_ADMIN_EMAIL to enable)');
  }

  // ── Per-agent schedule runner: 60s tick that fires due schedules.
  // Disabled in tests (LDB_PATH set => test mode).
  if(!process.env.LDB_PATH){
    _startAgentScheduler();
  }
}

module.exports = server;
