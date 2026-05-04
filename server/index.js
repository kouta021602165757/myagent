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
const STRIPE_WH    = process.env.STRIPE_WEBHOOK_SECRET||'';
const GOOGLE_ID    = process.env.GOOGLE_CLIENT_ID||'';
const GOOGLE_SEC   = process.env.GOOGLE_CLIENT_SECRET||'';
const RESEND_KEY   = process.env.RESEND_API_KEY||'';
const APP_URL      = process.env.APP_URL||`http://localhost:${PORT}`;
const FROM_EMAIL   = process.env.FROM_EMAIL||'noreply@myaiagent.jp';
const PUBLIC_DIR   = path.join(__dirname,'..','public');
const USE_SUPA     = !!(SUPA_URL&&SUPA_KEY);
const USD_TO_JPY   = parseFloat(process.env.USD_TO_JPY||'150');

// ── PRICING ───────────────────────────────────────────────────
const PRICING={ user:{ input:4.5, output:22.5 } };
const {createClient}=require('@supabase/supabase-js');
const supabase=USE_SUPA?createClient(SUPA_URL,SUPA_KEY):null;
function calcCost(inputTok,outputTok){
  const usd=(inputTok/1e6*PRICING.user.input)+(outputTok/1e6*PRICING.user.output);
  return{ usd, jpy:Math.ceil(usd*USD_TO_JPY*1000)/1000, inputTok, outputTok };
}

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
    const req=https.request({
      hostname:u.hostname,path:u.pathname+u.search,method,
      headers:{'apikey':SUPA_KEY,'Authorization':`Bearer ${SUPA_KEY}`,
        ...(pay?{'Content-Length':Buffer.byteLength(pay)}:{})}
    },r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{try{res({s:r.statusCode,d:JSON.parse(d||'[]')});}catch{res({s:r.statusCode,d});}});});
          
  });
}

function toSnake(obj){
        if(!obj||typeof obj!=='object')return obj;
        const res={};
        for(const[k,v]of Object.entries(obj)){
                  const snake=k.replace(/([A-Z])/g,m=>'_'+m.toLowerCase());
                  res[snake]=v;
        }
        return res;
}
function toCamel(obj){
        if(!obj||typeof obj!=='object')return obj;
        const res={};
        for(const[k,v]of Object.entries(obj)){
                  const camel=k.replace(/_([a-z])/g,(_,c)=>c.toUpperCase());
                  res[camel]=v;
        }
        return res;
}
// ── DB ABSTRACTION ────────────────────────────────────────────
const DB={
  async findBy(field,val){
    if(!USE_SUPA)return LDB.find(u=>u[field]===val)||null;
    const snakeField=toSnake({[field]:null});const sf=Object.keys(snakeField)[0];
    const{data,error}=await supabase.from('users').select('*').eq(sf,val).limit(1);
    if(error){console.error('Supabase findBy error:',error.message);return null;}
    return data?.[0]?toCamel(data[0]):null;
  },
  async create(user){
    if(!USE_SUPA){LDB.add(user);return user;}
    const snakeUser=toSnake(user);
    const{data,error}=await supabase.from('users').insert(snakeUser).select();
    if(error){console.error('Supabase create error:',error.message,error.details);}
    else{console.log('Supabase create OK, id:',data?.[0]?.id);}
    return data?.[0]?toCamel(data[0]):user;
  },
  async save(user){
    if(!USE_SUPA){LDB.upd(user);return;}
        const{error:se}=await supabase.from('users').update(toSnake(user)).eq('id',user.id);
            if(se)console.error('Supabase save error:',se.message);
  }
  async remove(id){
    if(!USE_SUPA){ LDB.data=LDB.data.filter(u=>u.id!==id); return true; }
    const{error}=await supabase.from('users').delete().eq('id',id);
    return !error;
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
function safe(u){const{password:_,verifyToken:__,resetToken:___,resetExpiry:____,...s}=u;return s;}
function newUser(base){
  return{id:crypto.randomUUID(),plan:'free',balance_jpy:0,usage_count:0,
    agents:[],billing_history:[],stripe_customer_id:null,
    verified:false,verifyToken:null,resetToken:null,resetExpiry:null,
    created_at:new Date().toISOString(),...base};
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
  const link=`${APP_URL}/api/auth/verify?token=${user.verifyToken}`;
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
                         {model:'claude-haiku-4-5-20251001',max_tokens:1024,system,messages});
  if(r.s!==200)throw new Error(r.d?.error?.message||`Anthropic ${r.s}`);
  return r.d;
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
async function stripeCreatePaymentIntent(amtJpy,userId,email){
  const r=await httpsReq('POST','api.stripe.com','/v1/payment_intents',
    {'Content-Type':'application/x-www-form-urlencoded','Authorization':`Bearer ${STRIPE_SK}`},
    new URLSearchParams({amount:String(amtJpy),currency:'jpy',
      'automatic_payment_methods[enabled]':'true',
      receipt_email:email,
      'metadata[userId]':userId,'metadata[amount_jpy]':String(amtJpy)}).toString());
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
};
function buildSystem(agent){
  return`あなたは「${agent.name}」というAIエージェントです。\n得意スキル：${(agent.skills||[]).map(s=>SKILL_MAP[s]||s).join(' / ')}\n${agent.persona?`性格・指示：${agent.persona}`:''}\nユーザーの専属スタッフとして、プロフェッショナルかつ親しみやすく対応してください。返答は実用的で簡潔にし、必要に応じてMarkdownを使ってください。`;
}

// ══════════════════════════════════════════════════════════════
// API ROUTER
// ══════════════════════════════════════════════════════════════
async function handleAPI(req,res,pathname,method,ip){
  if(!rateLimit(ip,150,60000))return jres(res,429,{error:'リクエストが多すぎます。しばらく待ってから試してください。'});

  // ── POST /api/auth/signup ──────────────────────────────────
  if(pathname==='/api/auth/signup'&&method==='POST'){
    const{name,email,password}=await readBody(req);
    if(!name?.trim()||!email?.trim()||!password)return jres(res,400,{error:'すべての項目を入力してください'});
    if(password.length<8)return jres(res,400,{error:'パスワードは8文字以上にしてください'});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return jres(res,400,{error:'メールアドレスの形式が正しくありません'});
    if(await DB.findBy('email',email.toLowerCase()))return jres(res,409,{error:'このメールアドレスはすでに登録されています'});
    const verifyToken=crypto.randomBytes(32).toString('hex');
    const user=newUser({name:name.trim(),email:email.toLowerCase(),password:PW.hash(password),verified:!RESEND_KEY,verifyToken});
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
    if(!code){res.writeHead(302,{Location:'/auth.html?error=google_failed'});res.end();return;}
    try{
      const tokens=await googleExchange(code);
      const gUser=await googleUserInfo(tokens.access_token);
      let user=await DB.findBy('email',gUser.email.toLowerCase());
      if(!user){
        user=newUser({name:gUser.name||gUser.email,email:gUser.email.toLowerCase(),password:'',verified:true,googleId:gUser.id});
        await DB.create(user);
      }else if(!user.googleId){
        user.googleId=gUser.id;user.verified=true;await DB.save(user);
      }
      const token=JWT.sign({userId:user.id,email:user.email});
      res.writeHead(302,{Location:`/app.html?token=${token}`});res.end();
    }catch(e){res.writeHead(302,{Location:'/auth.html?error=google_failed'});res.end();}
    return;
  }

  // ── GET /api/auth/verify ───────────────────────────────────
  if(pathname==='/api/auth/verify'&&method==='GET'){
    const token=new url.URL(req.url,APP_URL).searchParams.get('token');
    if(!token){res.writeHead(302,{Location:'/auth.html?error=invalid_token'});res.end();return;}
    const user=await DB.findBy('verifyToken',token);
    if(!user){res.writeHead(302,{Location:'/auth.html?error=invalid_token'});res.end();return;}
    user.verified=true;user.verifyToken=null;await DB.save(user);
    res.writeHead(302,{Location:'/app.html?verified=1'});res.end();return;
  }

  // ── POST /api/auth/resend-verify ──────────────────────────
  if(pathname==='/api/auth/resend-verify'&&method==='POST'){
    const claims=getAuth(req);if(!claims)return jres(res,401,{error:'認証が必要です'});
    const user=await DB.findBy('id',claims.userId);
    if(!user||user.verified)return jres(res,400,{error:'確認済みです'});
    user.verifyToken=crypto.randomBytes(32).toString('hex');
    await DB.save(user);await sendVerifyEmail(user);
    return jres(res,200,{ok:true});
  }

  // ── POST /api/auth/forgot-password ────────────────────────
  if(pathname==='/api/auth/forgot-password'&&method==='POST'){
    const{email}=await readBody(req);
    if(!email)return jres(res,400,{error:'メールアドレスを入力してください'});
    const user=await DB.findBy('email',email.toLowerCase());
    // Always return 200 to prevent email enumeration
    if(user&&!user.googleId){
      user.resetToken=crypto.randomBytes(32).toString('hex');
      user.resetExpiry=Date.now()+3600000; // 1 hour
      await DB.save(user);
      await sendResetEmail(user,user.resetToken);
    }
    return jres(res,200,{ok:true,message:'登録済みのメールアドレスであればリセットリンクを送信しました'});
  }

  // ── POST /api/auth/reset-password ─────────────────────────
  if(pathname==='/api/auth/reset-password'&&method==='POST'){
    const{token,password}=await readBody(req);
    if(!token||!password)return jres(res,400,{error:'入力してください'});
    if(password.length<8)return jres(res,400,{error:'パスワードは8文字以上にしてください'});
    const user=await DB.findBy('resetToken',token);
    if(!user||!user.resetExpiry||Date.now()>user.resetExpiry)
      return jres(res,400,{error:'リセットリンクの有効期限が切れています。もう一度お試しください'});
    user.password=PW.hash(password);user.resetToken=null;user.resetExpiry=null;
    await DB.save(user);
    return jres(res,200,{ok:true,message:'パスワードを変更しました。ログインしてください'});
  }

  // ── Auth required below ────────────────────────────────────
  const claims=getAuth(req);
  if(!claims)return jres(res,401,{error:'認証が必要です'});
  const user=await DB.findBy('id',claims.userId);
  if(!user)return jres(res,401,{error:'ユーザーが見つかりません'});

  // ── GET /api/me ────────────────────────────────────────────
  if(pathname==='/api/me'&&method==='GET')return jres(res,200,{user:safe(user)});

  // ── GET /api/agents ────────────────────────────────────────
  if(pathname==='/api/agents'&&method==='GET')return jres(res,200,{agents:user.agents||[]});

  // ── POST /api/agents ───────────────────────────────────────
  if(pathname==='/api/agents'&&method==='POST'){
    const{avatar,name,skills,persona}=await readBody(req);
    if(!name?.trim())return jres(res,400,{error:'名前は必須です'});
    if(!skills?.length)return jres(res,400,{error:'スキルを選んでください'});
    if((user.agents||[]).length>=20)return jres(res,400,{error:'エージェントは最大20個です'});
    const agent={id:'ag_'+crypto.randomUUID(),avatar:avatar||'🤖',
      name:name.trim(),skills,persona:persona?.trim()||'',
      history:[],created_at:new Date().toISOString()};
    user.agents=[...(user.agents||[]),agent];
    await DB.save(user);return jres(res,201,{agent});
  }

  // ── DELETE /api/agents/:id ─────────────────────────────────
  const dm=pathname.match(/^\/api\/agents\/([^/]+)$/);
  if(dm&&method==='DELETE'){
    user.agents=(user.agents||[]).filter(a=>a.id!==dm[1]);
    await DB.save(user);return jres(res,200,{ok:true});
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
    const{message}=await readBody(req);
    if(!message?.trim())return jres(res,400,{error:'メッセージを入力してください'});
    if(message.length>4000)return jres(res,400,{error:'メッセージが長すぎます'});
    const hist=(agent.history||[]).slice(-20);
    const msgs=[...hist.map(m=>({role:m.role,content:m.content})),{role:'user',content:message}];
    let reply,cost;
    try{
      const d=await callAI(msgs,buildSystem(agent));
      reply=d.content?.find(b=>b.type==='text')?.text||'エラーが発生しました';
      const u=d.usage||{};
      cost=calcCost(u.input_tokens||0,u.output_tokens||0);
    }catch(e){return jres(res,502,{error:`AI応答エラー: ${e.message}`});}
    const ts=new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
    agent.history=[...(agent.history||[]),
      {role:'user',content:message,time:ts},
      {role:'assistant',content:reply,time:ts}];
    if(agent.history.length>200)agent.history=agent.history.slice(-200);
    user.balance_jpy=Math.round(((user.balance_jpy||0)-cost.jpy)*1000)/1000;
  user.usage_count=(user.usage_count||0)+1;
    user.usage_count=(user.usage_count||0)+1;
    user.billing_history=user.billing_history||[];
    user.billing_history.push({date:new Date().toISOString(),agentId:agent.id,agentName:agent.name,
      input_tokens:cost.inputTok,output_tokens:cost.outputTok,cost_usd:cost.usd,cost_jpy:cost.jpy});
    if(user.billing_history.length>1000)user.billing_history=user.billing_history.slice(-1000);
    const ai=user.agents.findIndex(a=>a.id===agent.id);
    if(ai>=0)user.agents[ai]=agent;
    await DB.save(user);
    return jres(res,200,{reply,balance_jpy:user.balance_jpy,cost:{jpy:cost.jpy,usd:cost.usd}});
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

  // ── POST /api/billing/charge ───────────────────────────────
  if(pathname==='/api/billing/charge'&&method==='POST'){
    const{amount_jpy}=await readBody(req);
    if(!amount_jpy||amount_jpy<100)return jres(res,400,{error:'最低チャージ額は¥100です'});
    if(amount_jpy>100000)return jres(res,400,{error:'1回の上限は¥100,000です'});
    if(!STRIPE_SK){
      // Demo mode
      user.balance_jpy=(user.balance_jpy||0)+amount_jpy;
      await DB.save(user);
      return jres(res,200,{demo:true,balance_jpy:user.balance_jpy});
    }
    try{
      const pi=await stripeCreatePaymentIntent(amount_jpy,user.id,user.email);
      return jres(res,200,{client_secret:pi.client_secret,publishable_key:process.env.STRIPE_PUBLISHABLE_KEY||''});
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
    if(event.type==='payment_intent.succeeded'){
      const pi=event.data.object;
      const userId=pi.metadata?.userId;
      const amtJpy=parseInt(pi.metadata?.amount_jpy||'0',10);
      if(userId&&amtJpy>0){
        const user=await DB.findBy('id',userId);
        if(user){user.balance_jpy=(user.balance_jpy||0)+amtJpy;await DB.save(user);}
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

  // index.html → redirect to lp
  let fp=path.join(PUBLIC_DIR,pathname==='/'?'lp.html':pathname);
  if(!fp.startsWith(PUBLIC_DIR)){res.writeHead(403);return res.end();}
  serveStatic(res,fp);
});

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
server.on('error',err=>{console.error(err);process.exit(1);});
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
