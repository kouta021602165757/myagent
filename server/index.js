'use strict';
const http=require('http'),https=require('https'),fs=require('fs'),
      path=require('path'),crypto=require('crypto'),url=require('url');

// ── ENV ───────────────────────────────────────────────────────
function loadEnv(){
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
const APP_URL      = process.env.APP_URL||`http://localhost:${PORT}`;
const FROM_EMAIL   = process.env.FROM_EMAIL||'noreply@myaiagent.jp';
const PUBLIC_DIR   = path.join(__dirname,'..','public');
const USE_SUPA     = !!(SUPA_URL&&SUPA_KEY);
const USD_TO_JPY   = parseFloat(process.env.USD_TO_JPY||'150');
const CURRENCY = 'usd';

// ── PRICING ───────────────────────────────────────────────────
const PRICING={ user:{ input:4.5, output:22.5 } };
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
const DB_PATH=path.join(__dirname,'db.json');
const LDB=(()=>{
  let d={users:[]};
  if(fs.existsSync(DB_PATH)){try{d=JSON.parse(fs.readFileSync(DB_PATH,'utf8'));}catch{}}
  const save=()=>fs.writeFileSync(DB_PATH,JSON.stringify(d,null,2));
  return{
    find:fn=>d.users.find(fn),
    add(u){d.users.push(u);save();},
    upd(u){const i=d.users.findIndex(x=>x.id===u.id);if(i>=0){d.users[i]=u;save();}},
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
    },r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{try{res({s:r.statusCode,d:JSON.parse(d||'[]')});}catch{res({s:r.statusCode,d});}});});
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
    const r=await sbReq('POST','users','',user);
    if(r.s>=400){console.error('Supabase create error:',r.d);return user;}
    const arr=Array.isArray(r.d)?r.d:[r.d];
    return arr[0]||user;
  },
  async save(user){
    if(!USE_SUPA){LDB.upd(user);return;}
    const r=await sbReq('PATCH','users','?id=eq.'+user.id,user);
    if(r.s>=400)console.error('Supabase save error:',r.d);
  },
  async remove(id){
    if(!USE_SUPA){LDB.data=(LDB.data||[]).filter(u=>u.id!==id);return true;}
    const r=await sbReq('DELETE','users','?id=eq.'+id);
    return r.s<300;
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
function readBody(req,max=2e6){
  return new Promise((resolve,reject)=>{
    let b='',sz=0;
    req.on('data',c=>{sz+=c.length;if(sz>max)reject(new Error('Too large'));b+=c;});
    req.on('end',()=>{try{resolve(JSON.parse(b||'{}'));}catch{resolve({});}});
    req.on('error',reject);
  });
}
function readRaw(req){return new Promise((resolve,reject)=>{const c=[];req.on('data',d=>c.push(d));req.on('end',()=>resolve(Buffer.concat(c)));req.on('error',reject);});}
function getAuth(req){return JWT.verify((req.headers['authorization']||'').replace('Bearer ',''));}
function getIP(req){return(req.headers['x-forwarded-for']||req.socket.remoteAddress||'').split(',')[0].trim();}
function safe(u){const{password:_,verify_token:__,reset_token:___,reset_expiry:____,...s}=u;return s;}
function newUser(base){
  return{id:crypto.randomUUID(),plan:'free',balance_jpy:0,usage_count:0,
    agents:[],billing_history:[],stripe_customer_id:null,
    // Creator revenue ledger (#5)
    balance_jpy_pending:0,         // 7日経過前の未確定収益
    balance_jpy_available:0,       // 出金可能な確定収益
    revenue_history:[],            // {date, listing_id, agent_name, buyer_user_id, cost_jpy, share_jpy, status:'pending'|'confirmed', confirms_at}
    payout_history:[],             // {date, amount_jpy, method, status, stripe_payout_id}
    verified:false,verify_token:null,reset_token:null,reset_expiry:null,
    created_at:new Date().toISOString(),...base};
}

/* ── Creator revenue helpers (#5) ───────────────────────────── */
const REVENUE_SHARE_RATE = 0.10;   // 10% to creator
const PENDING_DAYS = 7;
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
function httpsReq(method,hostname,pathname,headers,body){
  return new Promise((resolve,reject)=>{
    const pay=body?(typeof body==='string'?body:JSON.stringify(body)):null;
    const h={...headers};
    if(pay)h['Content-Length']=Buffer.byteLength(pay);
    const req=https.request({hostname,path:pathname,method,headers:h},r=>{
      let d='';r.on('data',c=>d+=c);
      r.on('end',()=>{try{resolve({s:r.statusCode,d:JSON.parse(d)});}catch{resolve({s:r.statusCode,d});}});
    });
    req.on('error',reject);if(pay)req.write(pay);req.end();
  });
}

// ── EMAIL (Resend) ────────────────────────────────────────────
async function sendEmail(to,subject,html){
  if(!RESEND_KEY){console.log(`[DEV EMAIL] To:${to}\nSubject:${subject}\n${html.replace(/<[^>]+>/g,'')}\n`);return;}
  await httpsReq('POST','api.resend.com','/emails',
    {'Content-Type':'application/json','Authorization':`Bearer ${RESEND_KEY}`},
    {from:`MY AI Agent <${FROM_EMAIL}>`,to,subject,html});
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

// ── ANTHROPIC ─────────────────────────────────────────────────
async function callAI(messages,system){
  const r=await httpsReq('POST','api.anthropic.com','/v1/messages',
    {'Content-Type':'application/json','x-api-key':ANTHROPIC,'anthropic-version':'2023-06-01'},
                         {model:'claude-sonnet-4-6',max_tokens:1024,system,messages});
  if(r.s!==200)throw new Error(r.d?.error?.message||`Anthropic ${r.s}`);
  return r.d;
}

// Variant with tool definitions (for Google Chrome integration via Tool Use)
async function callAIWithTools(messages,system,tools){
  // Single retry on 429 with short backoff — Render edge times out around 60–100s
  // so we can't afford long waits. Surface the rate limit to the user instead.
  let attempt = 0;
  while(true){
    const r=await httpsReq('POST','api.anthropic.com','/v1/messages',
      {'Content-Type':'application/json','x-api-key':ANTHROPIC,'anthropic-version':'2023-06-01'},
                           {model:'claude-sonnet-4-6',max_tokens:2048,system,messages,tools});
    if(r.s===200) return r.d;
    if(r.s===429 && attempt < 1){
      console.warn('[chat] Anthropic 429 rate-limited, retrying once in 5s');
      await new Promise(res=>setTimeout(res, 5000));
      attempt++;
      continue;
    }
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

// ── BROWSER TOOLS (Google Chrome integration) ─────────────────
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
  }
];

async function executeBrowserTool(session, name, input){
  try{
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

// ── STRIPE ────────────────────────────────────────────────────

async function stripeCreateCustomer(email, name){
  const r=await httpsReq('POST','api.stripe.com','/v1/customers',
    {'Authorization':'Basic '+Buffer.from(STRIPE_SK+':').toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},
    new URLSearchParams({email, name}).toString());
  if(r.s!==200)throw new Error(r.d?.error?.message||'Stripe customer error');
  return r.d.id;
}

async function stripeCreateSubscription(customerId, priceId){
  const r=await httpsReq('POST','api.stripe.com','/v1/subscriptions',
    {'Authorization':'Basic '+Buffer.from(STRIPE_SK+':').toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},
    new URLSearchParams({
      customer: customerId,
      'items[0][price]': priceId,
      'payment_behavior': 'default_incomplete',
      'payment_settings[save_default_payment_method]': 'on_subscription',
      'expand[0]': 'latest_invoice.payment_intent'
    }).toString());
  if(r.s!==200)throw new Error(r.d?.error?.message||'Stripe subscription error');
  return r.d;
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
  return {
    listing_id: m.listing_id,
    agent: {
      avatar: ag.avatar||'🤖',
      skills: ag.skills||[],
      chrome_enabled: !!ag.chrome_enabled,
    },
    title: m.title || ag.name,
    description: m.description || ag.persona || '',
    category: m.category || 'other',
    category_label: MARKET_CAT_LABEL[m.category||'other']||'その他',
    demo_prompts: Array.isArray(m.demo_prompts) ? m.demo_prompts.slice(0,3) : [],
    creator: {
      handle: '@'+(user.email||'').split('@')[0],
      name: user.name || '',
    },
    rating: m.rating_avg || 0,
    rating_count: m.rating_count || 0,
    uses: m.uses_count || 0,
    badge: (m.uses_count||0) >= 100 ? 'hot' : (Date.now()-new Date(m.listed_at||0).getTime() < 14*86400000 ? 'new' : null),
    listed_at: m.listed_at,
  };
}
/** Scan all users and return live + public listings. */
async function listAllPublicListings(){
  const out = [];
  const collect = (users) => {
    for(const u of users||[]){
      for(const ag of (u.agents||[])){
        const m = ag.marketplace;
        if(m && m.is_listed && m.status==='live' && (m.visibility||'public')==='public'){
          out.push(publicListing(u, ag));
        }
      }
    }
  };
  if(USE_SUPA){
    const r = await sbReq('GET','users','?select=id,name,email,agents&limit=2000');
    if(Array.isArray(r.d)) collect(r.d);
  } else {
    collect(LDB.data||[]);
  }
  // Most recent first; 'hot' agents float up regardless
  out.sort((a,b)=>{
    if(a.badge==='hot' && b.badge!=='hot') return -1;
    if(b.badge==='hot' && a.badge!=='hot') return 1;
    return new Date(b.listed_at||0).getTime() - new Date(a.listed_at||0).getTime();
  });
  return out;
}
/** Find {user, agent} by listing_id (cross-user). */
async function findAgentByListingId(listingId){
  if(!listingId) return null;
  const match = (users) => {
    for(const u of users||[]){
      const ag=(u.agents||[]).find(a=>a.marketplace && a.marketplace.listing_id===listingId);
      if(ag) return {user:u, agent:ag};
    }
    return null;
  };
  if(USE_SUPA){
    const r=await sbReq('GET','users','?select=*&limit=2000');
    return Array.isArray(r.d) ? match(r.d) : null;
  }
  return match(LDB.data||[]);
}
async function findAgentByShareId(shareId){
  // Returns {user, agent} or null. Scans users (slow without index).
  if(!shareId) return null;
  if(USE_SUPA){
    // Supabase doesn't easily index nested jsonb fields without a separate column;
    // scan up to N users (acceptable for current scale).
    const r=await sbReq('GET','users','?select=id,name,email,agents&limit=2000');
    if(Array.isArray(r.d)){
      for(const u of r.d){
        const ag=(u.agents||[]).find(a=>a.share_id===shareId);
        if(ag) return {user:u, agent:ag};
      }
    }
  } else {
    const u=LDB.find(u=>(u.agents||[]).some(a=>a.share_id===shareId));
    if(u){ const ag=u.agents.find(a=>a.share_id===shareId); if(ag) return {user:u, agent:ag}; }
  }
  return null;
}

function buildSystem(agent){
  const chromeNote = agent.chrome_enabled
    ? `

【ツール: Google Chrome 連携】
このエージェントは Google Chrome を直接操作できます。情報を Web から取得したり、サイトの操作が必要な依頼が来たら、自分で次のツールを呼び出してください（ユーザーに「URL を教えてください」と聞かずに自分で検索する）：
- search_web(query): Web検索
- browse_url(url): URLにアクセスしてページ内容を取得
- click_element(target): ページ内の要素をクリック
- type_text(selector, text): フォームに入力
- press_key(key): Enter等のキー押下
- take_screenshot(): 現在のページのスクショ（重いので本当に視覚情報が必要な時だけ）
- read_page(): 現在のページのテキストを再取得

実行手順:
1. 必要なら先に search_web で情報を探す
2. browse_url で具体的なページを開く（テキストはこの時点で返るのでスクショ不要）
3. 必要に応じて click / type / press_key で操作
4. 結果を要約してユーザーに伝える

レイテンシ削減のコツ:
- ツール呼び出しは最小限に。同じ情報を何度も取り直さない
- take_screenshot は視覚的な確認が必須な時だけ呼ぶ。テキストで判断できる場合は呼ばない
- 必要な情報が揃ったら即座に最終回答に進む

【重要な制約】このブラウザは **ログインしていないクラウド上の Chromium** です。以下は不可能なので試さないでください:
- Google アカウントへのログインが必要なページ（Gmail / Google カレンダー / Google ドライブ等）
- Twitter/X、Facebook、LinkedIn 等のログイン必須ページ
- ユーザーの個人アカウントが必要な操作

ログイン必須ページに当たったら、ツール呼び出しを諦めて、ユーザーに「このページはログインが必要なので、現在の Chrome 連携では到達できません」と正直に伝え、代替案（公開情報を別ソースから取得 / ユーザーに直接実行を依頼 等）を提案してください。

ツールを連鎖して公開情報の問題を解決してください。情報が足りないと感じたら諦めず、追加でツールを呼び出して調べてください。`
    : '';
  return`あなたは「${agent.name}」というAIエージェントです。\n得意スキル：${(agent.skills||[]).map(s=>SKILL_MAP[s]||s).join(' / ')}\n${agent.persona?`性格・指示：${agent.persona}`:''}${chromeNote}\nユーザーの専属スタッフとして、プロフェッショナルかつ親しみやすく対応してください。返答は実用的で簡潔にし、必要に応じてMarkdownを使ってください。`;
}

// ══════════════════════════════════════════════════════════════
// API ROUTER
// ══════════════════════════════════════════════════════════════
async function handleAPI(req,res,pathname,method,ip){
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
    const{name,email,password}=await readBody(req);
    if(!name?.trim()||!email?.trim()||!password)return jres(res,400,{error:'すべての項目を入力してください'});
    if(password.length<8)return jres(res,400,{error:'パスワードは8文字以上にしてください'});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return jres(res,400,{error:'メールアドレスの形式が正しくありません'});
    if(await DB.findBy('email',email.toLowerCase()))return jres(res,409,{error:'このメールアドレスはすでに登録されています'});
    const verify_token=crypto.randomBytes(32).toString('hex');
    const user=newUser({name:name.trim(),email:email.toLowerCase(),password:PW.hash(password),verified:!RESEND_KEY,verify_token});
    await DB.create(user);
    if(RESEND_KEY)await sendVerifyEmail(user);
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
    return jres(res,200,{token:JWT.sign({userId:user.id,email:user.email}),user:safe(user)});
  }

  // ── GET /api/auth/google ───────────────────────────────────
  if(pathname==='/api/auth/google'&&method==='GET'){
    if(!GOOGLE_ID)return jres(res,503,{error:'Googleログインは設定されていません'});
    res.writeHead(302,{Location:googleAuthURL()});res.end();return;
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
        user.google_id=gUser.id;user.verified=true;await DB.save(user);
      }
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
  // Returns minimal agent info so the share landing page can render
  const psm=pathname.match(/^\/api\/share\/([a-z0-9-]+)$/);
  if(psm&&method==='GET'){
    const shareId=psm[1];
    const found=await findAgentByShareId(shareId);
    if(!found) return jres(res,404,{error:'共有エージェントが見つかりません'});
    return jres(res,200,{
      agent:{
        avatar:found.agent.avatar,
        name:found.agent.name,
        skills:found.agent.skills||[],
        persona:found.agent.persona||'',
        chrome_enabled:!!found.agent.chrome_enabled
      },
      owner:{ name: (found.user.name||(found.user.email||'').split('@')[0]||'ユーザー') }
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
  if(pathname==='/api/me'&&method==='GET')return jres(res,200,{user:safe(user)});

  // ── GET /api/agents ────────────────────────────────────────
  if(pathname==='/api/agents'&&method==='GET')return jres(res,200,{agents:user.agents||[]});

  // ── POST /api/agents ───────────────────────────────────────
  if(pathname==='/api/agents'&&method==='POST'){
    const{avatar,name,skills,persona,chrome_enabled}=await readBody(req);
    if(!name?.trim())return jres(res,400,{error:'名前は必須です'});
    if(!skills?.length)return jres(res,400,{error:'スキルを選んでください'});
    if((user.agents||[]).length>=20)return jres(res,400,{error:'エージェントは最大20個です'});
    const agent={id:'ag_'+crypto.randomUUID(),avatar:avatar||'🤖',
      name:name.trim(),skills,persona:persona?.trim()||'',
      chrome_enabled:!!chrome_enabled,
      history:[],created_at:new Date().toISOString()};
    user.agents=[...(user.agents||[]),agent];
    await DB.save(user);return jres(res,201,{agent});
  }


  // ── PATCH /api/agents/:id ──────────────────────────────────
  const pam=pathname.match(/^\/api\/agents\/([^/]+)$/);
  if(pam&&method==='PATCH'){
    const agId=pam[1];
    const{name,persona,chrome_enabled}=await readBody(req);
    const ag=(user.agents||[]).find(a=>a.id===agId);
    if(!ag)return jres(res,404,{error:'エージェントが見つかりません'});
    if(name)ag.name=name.trim();
    if(persona!==undefined)ag.persona=persona;
    if(chrome_enabled!==undefined)ag.chrome_enabled=!!chrome_enabled;
    await DB.save(user);
    return jres(res,200,{agent:ag});
  }
  // ── DELETE /api/agents/:id ─────────────────────────────────
  const dm=pathname.match(/^\/api\/agents\/([^/]+)$/);
  if(dm&&method==='DELETE'){
    user.agents=(user.agents||[]).filter(a=>a.id!==dm[1]);
    await DB.save(user);return jres(res,200,{ok:true});
  }

  // ── POST /api/agents/:id/share ─────────────────────────────
  // body: {enabled:true|false, regenerate?:true} — toggle/create/regenerate share URL
  const sm=pathname.match(/^\/api\/agents\/([^/]+)\/share$/);
  if(sm&&method==='POST'){
    const agId=sm[1];
    const ag=(user.agents||[]).find(a=>a.id===agId);
    if(!ag) return jres(res,404,{error:'エージェントが見つかりません'});
    const{enabled,regenerate}=await readBody(req);
    if(enabled===false){ ag.share_id=null; }
    else if(regenerate || !ag.share_id){ ag.share_id=genShareId(); }
    await DB.save(user);
    return jres(res,200,{share_id:ag.share_id||null});
  }

  // ══ MARKETPLACE ════════════════════════════════════════════
  // ── GET /api/marketplace ───────────────────────────────────
  // Public list (auth required so we can credit clones). Supports ?category= and ?q=.
  if(pathname==='/api/marketplace' && method==='GET'){
    const qs = new url.URL(req.url, APP_URL).searchParams;
    const cat = (qs.get('category')||'').trim();
    const q = (qs.get('q')||'').trim().toLowerCase();
    let listings = await listAllPublicListings();
    if(cat && cat!=='all') listings = listings.filter(l=>l.category===cat);
    if(q){
      listings = listings.filter(l=>{
        const hay = (l.title+' '+l.description+' '+l.category_label+' '+(l.creator.handle||'')).toLowerCase();
        return hay.indexOf(q)>=0;
      });
    }
    return jres(res,200,{listings, categories: MARKET_CATEGORIES.map(id=>({id, label:MARKET_CAT_LABEL[id]}))});
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
      revenue_share_rate: REVENUE_SHARE_RATE,
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
  // body: {agent_id, title, description, category, demo_prompts[], visibility}
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
    if(title.length<2 || title.length>60) return jres(res,400,{error:'タイトルは 2〜60 文字で入力してください'});
    if(description.length<20 || description.length>500) return jres(res,400,{error:'説明は 20〜500 文字で入力してください'});

    const existing = ag.marketplace || {};
    ag.marketplace = {
      is_listed: true,
      listing_id: existing.listing_id || genListingId(),
      title, description, category, demo_prompts: demoPrompts, visibility,
      status: 'live',                      // auto-approve for MVP
      listed_at: existing.listed_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      uses_count: existing.uses_count || 0,
      rating_avg: existing.rating_avg || 0,
      rating_count: existing.rating_count || 0,
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
    if(USE_SUPA){
      const r = await sbReq('GET','users','?select=id,name,email,agents&limit=2000');
      if(Array.isArray(r.d)) creator = matchUser(r.d);
    } else {
      creator = matchUser(LDB.data||[]);
    }
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
      },
      stats: { listings: listings.length, total_uses: totalUses },
      listings,
    });
  }

  // ── POST /api/marketplace/:listing_id/clone ────────────────
  // Auth required. Clones a listed agent into the current user's account.
  const mcm = pathname.match(/^\/api\/marketplace\/([a-z0-9_-]+)\/clone$/);
  if(mcm && method==='POST'){
    if((user.agents||[]).length>=20) return jres(res,400,{error:'エージェントは最大20個です'});
    const found = await findAgentByListingId(mcm[1]);
    if(!found || !found.agent.marketplace || !found.agent.marketplace.is_listed){
      return jres(res,404,{error:'出店エージェントが見つかりません'});
    }
    if(found.user.id === user.id) return jres(res,400,{error:'自分の出店エージェントは複製できません'});
    const src = found.agent;
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
        cloned_at: new Date().toISOString(),
      },
      history: [],
      created_at: new Date().toISOString(),
    };
    user.agents = [...(user.agents||[]), clone];
    // Bump uses on the listing
    src.marketplace.uses_count = (src.marketplace.uses_count||0) + 1;
    await DB.save(user);
    await DB.save(found.user);
    return jres(res,201,{agent: clone});
  }

  // ── POST /api/share/:share_id/clone ────────────────────────
  // Auth required. Clones the shared agent into the current user's account.
  const cmShare=pathname.match(/^\/api\/share\/([a-z0-9-]+)\/clone$/);
  if(cmShare&&method==='POST'){
    const shareId=cmShare[1];
    if((user.agents||[]).length>=20)return jres(res,400,{error:'エージェントは最大20個です'});
    const found=await findAgentByShareId(shareId);
    if(!found) return jres(res,404,{error:'共有エージェントが見つかりません'});
    const src=found.agent;
    const clone={
      id:'ag_'+crypto.randomUUID(),
      avatar:src.avatar||'🤖',
      name:src.name||'Agent',
      skills:Array.isArray(src.skills)?src.skills:['writing'],
      persona:src.persona||'',
      chrome_enabled:!!src.chrome_enabled,
      history:[],
      created_at:new Date().toISOString()
    };
    user.agents=[...(user.agents||[]),clone];
    await DB.save(user);
    return jres(res,201,{agent:clone});
  }

  // ── POST /api/chat/:agentId ────────────────────────────────
  const cm=pathname.match(/^\/api\/chat\/([^/]+)$/);
  if(cm&&method==='POST'){
    if(!ANTHROPIC)return jres(res,503,{error:'APIキーが設定されていません'});
    // 無料枠: 最初の10メッセージは無料
  var FREE_MSGS = 10;
  var usageCount = user.usage_count || 0;
  var balance = user.balance_jpy || 0;
  if(usageCount >= FREE_MSGS && balance <= 0){
    return jres(res,402,{
      error:'残高が不足しています',
      detail:'残高をチャージするか、プランをご確認ください',
      free_used: usageCount,
      free_limit: FREE_MSGS,
      balance: balance,
      upgrade:true
    });
  }
    const agent=(user.agents||[]).find(a=>a.id===cm[1]);
    if(!agent)return jres(res,404,{error:'エージェントが見つかりません'});
    const body=await readBody(req);
    const regenerate=!!body.regenerate;
    const message=body.message||'';
    const images=body.images||[];
    if(!regenerate && !message?.trim() && images.length===0) return jres(res,400,{error:'メッセージを入力してください'});
    if(message.length>4000)return jres(res,400,{error:'メッセージが長すぎます'});

    // Regenerate: drop trailing assistant from history; resend without adding a new user message
    if(regenerate){
      while(agent.history.length>0 && agent.history[agent.history.length-1].role==='assistant'){
        agent.history.pop();
      }
      if(!agent.history.length || agent.history[agent.history.length-1].role!=='user'){
        return jres(res,400,{error:'再生成できる返答がありません'});
      }
    }

    const hist=(agent.history||[]).slice(-20);
    // ユーザーメッセージのcontentを構築（画像 + PDF対応）
    let userContent;
    if(images.length > 0){
      userContent = [];
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
      if(message.trim()) userContent.push({type:'text',text:message});
    } else {
      userContent = message;
    }
    // For regenerate: history already ends with the user msg; skip adding a new one
    const baseMsgs = regenerate
      ? hist.map(m=>({role:m.role,content:m.content}))
      : [...hist.map(m=>({role:m.role,content:m.content})),{role:'user',content:userContent}];
    let reply,cost;

    // Branch: Chrome 連携 ON のエージェントは Tool Use ループを通す
    const useTools = !!agent.chrome_enabled;
    let totalIn=0, totalOut=0;

    let toolLog = []; // visible browser-action log for the frontend
    if(useTools){
      let session = null;
      try{
        session = browser.newSession();
        let convMsgs = baseMsgs.slice();
        let resp;
        let iters = 0;
        const MAX_ITERS = 5;
        const startedAt = Date.now();
        const BUDGET_MS = 60000; // Stay under Render edge timeout (~60–100s)
        while(true){
          // Trim heavy data from older tool_result blocks before each call
          // (keeps input tokens under the org rate limit)
          _trimToolHistory(convMsgs);
          resp = await callAIWithTools(convMsgs, buildSystem(agent), BROWSER_TOOLS);
          totalIn  += (resp.usage?.input_tokens)||0;
          totalOut += (resp.usage?.output_tokens)||0;

          if(resp.stop_reason !== 'tool_use') break;
          iters++;
          if(iters > MAX_ITERS){
            reply = '(ツール呼び出しの上限に達したため処理を中断しました)';
            break;
          }
          if(Date.now() - startedAt > BUDGET_MS){
            // Pull whatever text the AI produced this turn so user gets *something*
            const partial = (resp.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('\n').trim();
            reply = (partial ? partial + '\n\n' : '') + '(時間がかかりすぎたため、ここで処理を中断しました。もう一度お試しください)';
            break;
          }

          // Append the assistant's tool_use turn
          convMsgs.push({role:'assistant', content: resp.content});

          // Run each tool_use block, collect tool_result blocks + log
          const toolResultBlocks = [];
          for(const block of (resp.content||[])){
            if(block.type !== 'tool_use') continue;
            const result = await executeBrowserTool(session, block.name, block.input||{});
            toolResultBlocks.push(buildToolResult(block.id, block.name, result));
            toolLog.push({
              name: block.name,
              input: block.input||{},
              ok: !(result&&result.error),
              url: result&&result.url,
              title: result&&result.title,
              text: result&&result.text ? String(result.text).slice(0,400) : '',
              results: result&&result.results, // for search_web
              count: result&&result.count,
              screenshot: result&&result.screenshot, // base64 jpeg, only present when AI called take_screenshot
              error: result&&result.error,
            });
          }
          convMsgs.push({role:'user', content: toolResultBlocks});
        }

        // Final reply (text from last assistant turn)
        if(!reply){
          reply = (resp.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('\n').trim()
            || '応答を生成できませんでした';
        }
      }catch(e){
        // Browser unavailable on this host — fall back to plain chat so user still gets an answer
        const msg = (e&&e.message)||'';
        if(/browser|playwright|launch_failed|not_installed/i.test(msg)){
          console.warn('[chat] Chrome unavailable, falling back to plain chat:', msg);
          try{
            const d=await callAI(baseMsgs, buildSystem(agent));
            reply = d.content?.find(b=>b.type==='text')?.text || 'エラー';
            totalIn  = d.usage?.input_tokens || 0;
            totalOut = d.usage?.output_tokens || 0;
          }catch(e2){
            return jres(res,502,{error:`AI応答エラー: ${e2.message}`});
          }
        } else if(/rate limit|429|input tokens per minute/i.test(msg)){
          return jres(res,429,{error:'混雑のため一時的に応答できません。30秒ほど待ってから再送信してください。'});
        } else {
          return jres(res,502,{error:`AI応答エラー: ${msg}`});
        }
      } finally {
        if(session){ try{ await session.close(); }catch(e){} }
      }
      cost = calcCost(totalIn, totalOut);
    } else {
      // Existing path — no tools
      try{
        const d = await callAI(baseMsgs, buildSystem(agent));
        reply = d.content?.find(b=>b.type==='text')?.text || 'エラーが発生しました';
        const u = d.usage||{};
        cost = calcCost(u.input_tokens||0, u.output_tokens||0);
      }catch(e){return jres(res,502,{error:`AI応答エラー: ${e.message}`});}
    }
    const msgs = baseMsgs;
    const ts=new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
    if(regenerate){
      agent.history=[...(agent.history||[]),{role:'assistant',content:reply,time:ts}];
    } else {
      agent.history=[...(agent.history||[]),
        {role:'user',content:message,time:ts},
        {role:'assistant',content:reply,time:ts}];
    }
    if(agent.history.length>200)agent.history=agent.history.slice(-200);
    user.balance_jpy=Math.round(((user.balance_jpy||0)-cost.jpy)*1000)/1000;
    user.usage_count=(user.usage_count||0)+1;
    user.billing_history=user.billing_history||[];
    user.billing_history.push({date:new Date().toISOString(),type:'usage',agentId:agent.id,agentName:agent.name,
      input_tokens:cost.inputTok,output_tokens:cost.outputTok,cost_usd:cost.usd,cost_jpy:cost.jpy});
    if(user.billing_history.length>1000)user.billing_history=user.billing_history.slice(-1000);
    const ai=user.agents.findIndex(a=>a.id===agent.id);
    if(ai>=0)user.agents[ai]=agent;
    await DB.save(user);
    // Credit the marketplace creator (#5 revenue ledger) — fire-and-forget
    if(agent.marketplace_origin && agent.marketplace_origin.creator_user_id && cost.jpy>0){
      creditCreatorRevenue(agent.marketplace_origin.creator_user_id, {
        listing_id: agent.marketplace_origin.listing_id,
        agent_name: agent.name,
        buyer_user_id: user.id,
        cost_jpy: cost.jpy,
      }).catch(e=>console.warn('[revenue] credit failed:', e.message));
    }
    return jres(res,200,{reply,balance_jpy:user.balance_jpy,cost:{jpy:cost.jpy,usd:cost.usd},tool_log:toolLog||null});
  }


  // ── PATCH /api/user/profile ─────────────────────────────────
  if(pathname==='/api/user/profile'&&method==='PATCH'){
    const user=await auth(req);if(!user)return jres(res,401,{error:'Unauthorized'});
    const{name}=body;
    if(name)user.name=name.trim().substring(0,50);
    await DB.save(user);
    return jres(res,200,{user:safe(user)});
  }

  // ── PATCH /api/user/password ─────────────────────────────────
  if(pathname==='/api/user/password'&&method==='PATCH'){
    const user=await auth(req);if(!user)return jres(res,401,{error:'Unauthorized'});
    const{current_password,new_password}=body;
    if(!PW.verify(current_password,user.password))return jres(res,400,{error:'現在のパスワードが正しくありません'});
    if(!new_password||new_password.length<8)return jres(res,400,{error:'パスワードは8文字以上にしてください'});
    user.password=PW.hash(new_password);
    await DB.save(user);
    return jres(res,200,{ok:true});
  }

  // ── DELETE /api/user/delete ──────────────────────────────────
  if(pathname==='/api/user/delete'&&method==='DELETE'){
    const user=await auth(req);if(!user)return jres(res,401,{error:'Unauthorized'});
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


  // ── POST /api/billing/subscribe ────────────────────────────
  if(pathname==='/api/billing/subscribe'&&method==='POST'){
    const{plan}=await readBody(req);
    if(!['pro','business'].includes(plan))return jres(res,400,{error:'Invalid plan'});
    const priceId = plan==='pro' ? STRIPE_PRO_PRICE : STRIPE_BIZ_PRICE;
    if(!priceId)return jres(res,503,{error:'Plan not configured'});
    try{
      // Stripe顧客を作成または取得
      let customerId = user.stripe_customer_id;
      if(!customerId){
        customerId = await stripeCreateCustomer(user.email, user.name||user.email);
        user.stripe_customer_id = customerId;
      }
      // サブスクリプション作成
      const sub = await stripeCreateSubscription(customerId, priceId);
      const clientSecret = sub.latest_invoice?.payment_intent?.client_secret;
      user.plan = plan;
      user.subscription_id = sub.id;
      user.subscription_status = sub.status;
      await DB.save(user);
      return jres(res,200,{
        subscription_id: sub.id,
        client_secret: clientSecret,
        status: sub.status,
        plan
      });
    }catch(e){ return jres(res,500,{error:e.message}); }
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
    if(!amount_jpy||amount_jpy<100)return jres(res,400,{error:'最低チャージ額は$1.00です'});
    if(amount_jpy>100000)return jres(res,400,{error:'1回の上限は$1,000です'});
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
    }catch(e){return jres(res,500,{error:e.message});}
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
          const credits=plan==='pro'?3000:plan==='business'?9000:0;
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

function serveStatic(res,fp){
  const ext=path.extname(fp),mime=MIME[ext]||'application/octet-stream';
  fs.readFile(fp,(err,data)=>{
    if(err){
      // Try 404 page
      fs.readFile(path.join(PUBLIC_DIR,'404.html'),(e2,d2)=>{
        if(e2){res.writeHead(404);res.end('Not found');}
        else{res.writeHead(404,{'Content-Type':'text/html',...SEC});res.end(d2);}
      });
    }else{
      const h={'Content-Type':mime,...SEC};
      if(ext==='.html'){h['Cache-Control']='no-cache, no-store, must-revalidate';h['Pragma']='no-cache';h['Expires']='0';}else{h['Cache-Control']='public,max-age=31536000';}
      res.writeHead(200,h);res.end(data);
    }
  });
}

// ── MAIN ──────────────────────────────────────────────────────
const server=http.createServer(async(req,res)=>{
  const parsed=url.parse(req.url);
  const pathname=parsed.pathname;
  const method=req.method.toUpperCase();
  const ip=getIP(req);

  if(method==='OPTIONS'){
    res.writeHead(204,{'Access-Control-Allow-Origin':APP_URL,
      'Access-Control-Allow-Methods':'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Max-Age':'86400'});
    return res.end();
  }

  if(pathname==='/api/webhook/stripe'&&method==='POST')return handleWebhook(req,res);

  if(pathname.startsWith('/api/')){
    try{await handleAPI(req,res,pathname,method,ip);}
    catch(e){console.error('[API]',e.message);jres(res,500,{error:'Internal server error'});}
    return;
  }

  // /a/:share_id → public agent landing page
  const aRoute=pathname.match(/^\/a\/([a-z0-9-]+)\/?$/);
  if(aRoute){
    return serveStatic(res, path.join(PUBLIC_DIR,'share.html'));
  }
  // index.html → redirect to lp
  let fp=path.join(PUBLIC_DIR,pathname==='/'?'lp.html':pathname);
  if(!fp.startsWith(PUBLIC_DIR)){res.writeHead(403);return res.end();}
  serveStatic(res,fp);
});

process.on('uncaughtException',err=>{if(err.code==='ECONNRESET'||err.message==='socket hang up')return;console.error('Uncaught:',err.message);});
process.on('unhandledRejection',err=>{console.error('Unhandled:',err?.message||err);});
server.listen(PORT,'0.0.0.0',()=>{
  console.log(`\n🚀 MY AI Agent`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   Anthropic: ${ANTHROPIC?'✅':'❌ Missing ANTHROPIC_API_KEY'}`);
  console.log(`   SUPA_KEY:  ${SUPA_KEY.substring(0,20)}`);
  console.log(`   DB:        ${USE_SUPA?'✅ Supabase':'⚠️  Local JSON'}`);
  console.log(`   Stripe:    ${STRIPE_SK?'✅':'⚠️  Demo mode'}`);
  console.log(`   Google:    ${GOOGLE_ID?'✅':'⚠️  Not configured'}`);
  console.log(`   Email:     ${RESEND_KEY?'✅ Resend':'⚠️  Console only'}\n`);
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
