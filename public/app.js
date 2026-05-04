var API='';
var AVATARS=['🤖','🦊','🐸','🐙','🦋','🐬','🦄','🐧','🦁','🐲','⭐','🌈','🦅','🐯','🦝','🐻','🧙','🤠','🥷','👾','🦸','🧚','🐼','🦜'];
var SKILLS=[
  {id:'writing',icon:'✍️',name:'ライティング',desc:'メール・記事・提案書'},
  {id:'research',icon:'🔍',name:'リサーチ',desc:'情報収集・分析'},
  {id:'coding',icon:'💻',name:'プログラミング',desc:'コード作成・デバッグ'},
  {id:'marketing',icon:'📣',name:'マーケティング',desc:'戦略・コピー'},
  {id:'planning',icon:'📋',name:'プランニング',desc:'企画・タスク整理'},
  {id:'analysis',icon:'📊',name:'データ分析',desc:'数値解析・レポート'},
  {id:'translate',icon:'🌏',name:'翻訳',desc:'日英・多言語'},
  {id:'support',icon:'🤝',name:'カスタマー対応',desc:'問い合わせ・FAQ'},
  {id:'idea',icon:'💡',name:'アイデア出し',desc:'ブレスト・発想'},
  {id:'teaching',icon:'🎓',name:'教育・解説',desc:'わかりやすく説明'},
  {id:'ceo',icon:'👑',name:'アシスタントCEO',desc:'経営戦略・意思決定'},
  {id:'coo',icon:'⚙️',name:'アシスタントCOO',desc:'業務最適化・オペレーション'},
  {id:'secretary',icon:'📋',name:'秘書',desc:'スケジュール・調整・連絡'},
  {id:'designer',icon:'🎨',name:'デザイナー',desc:'UI/UX・ビジュアル'},
  {id:'sns',icon:'📱',name:'SNS担当',desc:'投稿作成・分析・集客'},
];
var CHIPS={
  writing:['メールの下書き','キャッチコピー10個','ブログ記事を書いて'],
  research:['競合分析して','トレンドを調べて'],
  coding:['コードレビューして','バグを直して'],
  marketing:['SNS投稿文を作って','戦略を提案して'],
  planning:['タスクを整理して','スケジュールを作って'],
  analysis:['データを分析して','レポートにまとめて'],
  translate:['日本語に翻訳して','英語に翻訳して'],
  support:['FAQを作って','返信メールを書いて'],
  idea:['アイデアを10個出して','ブレストしよう'],
  teaching:['簡単に説明して','具体例を挙げて'],
};

var token=null,me=null,agents=[],activeId=null;
var NA={avatar:'🤖',name:'',skills:[],persona:''};
var chargeAmt=500;

// ── i18n ───────────────────────────────────────────────
var isJa = !navigator.language || navigator.language.startsWith('ja');
var T = {
      teamTitle:   isJa ? 'チームを作ろう'                              : 'Build Your Team',
      teamSub:     isJa ? '専門スキルを持つAIエージェントを作って、仕事を任せましょう。' : 'Create AI agents with specialized skills.',
      teamBtn:     isJa ? '最初のエージェントを作る →'                  : 'Create your first agent →',
      newAgent:    isJa ? '+ 新しいエージェント'                         : '+ New Agent',
      balance:     isJa ? '残高'                                        : 'Balance',
      charge:      isJa ? '+ 残高チャージ'                              : '+ Add Credits',
      logout:      isJa ? 'ログアウト'                                  : 'Logout',
      placeholder: isJa ? '何をお願いしますか？（Shift+Enter で改行）'  : 'What can I help you with? (Shift+Enter for newline)',
};
/* ── Boot ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',async()=>{
  // i18n apply
  const _applyI18n=()=>{
    [['i18n-teamTitle',T.teamTitle],['i18n-teamSub',T.teamSub],['i18n-teamBtn',T.teamBtn],
     ['i18n-newAgent',T.newAgent],['i18n-teamLabel',T.teamLabel],
     ['i18n-balance',T.balance],['i18n-charge',T.charge],['i18n-logout',T.logout]]
    .forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.textContent=v;});
    const inp=document.getElementById('msgInput');
    if(inp) inp.placeholder=T.placeholder;
    document.documentElement.lang=isJa?'ja':'en';
  };
  _applyI18n();
  buildAvGrid(); buildSkGrid();
  // Handle Google OAuth redirect token in URL
  const urlParams=new URLSearchParams(location.search);
  const urlToken=urlParams.get('token');
  if(urlToken){ localStorage.setItem('token',urlToken); history.replaceState({},'',location.pathname); }
  const tok=localStorage.getItem('token');
  if(!tok){ location.href='auth.html'; return; }
  try{
    const me=await apiFetch('/api/me');
    if(!me||me.error){ localStorage.removeItem('token'); location.href='auth.html'; return; }
    user=me;
    const ra=await apiFetch('/api/agents');
    agents=ra.agents||[];
    // Show email verify banner if not verified
    if(!me.verified) showVerifyBanner();
  }catch(e){ console.error('[init]',e&&e.message); }
  try{ renderAll(); }catch(re){ console.warn('renderAll:',re.message); }
  document.getElementById('loader').classList.add('gone');
});

function showVerifyBanner(){
  const banner=document.createElement('div');
  banner.id='verify-banner';
  banner.style.cssText='position:fixed;top:0;left:0;right:0;z-index:200;padding:10px 20px;background:#ffb547;color:#04040a;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:12px;';
  banner.innerHTML=`📧 メールアドレスの確認が完了していません。 <button onclick="resendVerify()" style="background:rgba(0,0,0,.15);border:none;padding:4px 12px;border-radius:6px;cursor:pointer;font-weight:700;font-family:inherit;">確認メールを再送</button> <button onclick="document.getElementById('verify-banner').remove()" style="background:none;border:none;cursor:pointer;font-size:16px;margin-left:8px;">×</button>`;
  document.body.prepend(banner);
}

async function resendVerify(){
  try{ await api('POST','/api/auth/resend-verify'); showToast('確認メールを送信しました','ok'); }
  catch(e){ showToast(e.message,'ng'); }
}

/* ── API ───────────────────────────────────────────── */
async function api(method,path,body){
  const opts={method,headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}};
  if(body)opts.body=JSON.stringify(body);
  const res=await fetch(API+path,opts);
  const data=await res.json();
  if(!res.ok)throw new Error(data.error||'エラーが発生しました');
  return data;
}

/* ── Render ────────────────────────────────────────── */
function renderAll(){
  document.getElementById('userName').textContent=me.name;
  document.getElementById('userAv').textContent=me.name.charAt(0).toUpperCase();
  updateBalance();
  renderAgList();
  if(agents.length>0) openAgent(activeId&&agents.find(a=>a.id===activeId)?activeId:agents[0].id);
  else{ document.getElementById('emptyWrap').style.display='flex'; document.getElementById('chatWrap').style.display='none'; }
}

function updateBalance(){
  const b=me.balance_jpy||0;
  const el=document.getElementById('balVal');
  el.textContent=(b>=0?'¥':'−¥')+Math.abs(b).toFixed(2);
  el.className='balance-val'+(b<0?' neg':b<200?' warn':' pos');
  document.getElementById('balSub').textContent=`${me.usage_count||0}メッセージ利用`;
}

function renderAgList(){
  document.getElementById('agList').innerHTML=agents.map(a=>`
    <div class="ag-item${a.id===activeId?' on':''}" id="ai-${a.id}" onclick="openAgent('${a.id}')">
      <div class="ag-icon">${a.avatar}</div>
      <div class="ag-meta">
        <div class="ag-name">${esc(a.name)}</div>
        <div class="ag-skill">${a.skills.map(s=>SKILLS.find(x=>x.id===s)?.name||s).join(' · ')}</div>
      </div>
      <div class="live-dot"></div>
    </div>`).join('');
}

/* ── Open agent / chat ─────────────────────────────── */
function openAgent(id){
  const ag=agents.find(a=>a.id===id); if(!ag)return;
  activeId=id;
  document.getElementById('emptyWrap').style.display='none';
  document.getElementById('chatWrap').style.display='flex';
  document.querySelectorAll('.ag-item').forEach(el=>el.classList.remove('on'));
  document.getElementById('ai-'+id)?.classList.add('on');

  const sns=ag.skills.map(s=>SKILLS.find(x=>x.id===s)?.name||s);
  document.getElementById('chatTop').innerHTML=`
    <div class="ct-icon">${ag.avatar}</div>
    <div>
      <div class="ct-name">${esc(ag.name)}</div>
      <div class="ct-pills">${sns.map(n=>`<span class="pill">${n}</span>`).join('')}</div>
    </div>
    <div class="top-actions">
      <button class="del-btn" onclick="delAgent('${id}')">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 3.5h10M4.5 3.5V2h4v1.5M5 6v3.5M8 6v3.5M2.5 3.5l.6 7h7.8l.6-7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>`;

  const allChips=ag.skills.flatMap(s=>(CHIPS[s]||[]).slice(0,2)).slice(0,5);
  document.getElementById('chips').innerHTML=ag.history?.length?'':allChips.map(c=>`<button class="chip" onclick="useChip('${esc(c)}')">${c}</button>`).join('');
  renderMsgs(ag);
}

function renderMsgs(ag){
  const el=document.getElementById('msgs');
  if(!ag.history||!ag.history.length){
    el.innerHTML=bubble('a',ag.avatar,`はじめまして！${esc(ag.name)}です 👋<br>なんでも気軽に話しかけてください！`,now(),'');
    return;
  }
  el.innerHTML=ag.history.map(m=>bubble(
    m.role==='user'?'u':'a',
    m.role==='user'?me.name.charAt(0):ag.avatar,
    fmt(m.content),m.time||'',
    '',
  )).join('');
  el.scrollTop=el.scrollHeight;
}

function bubble(type,av,content,time,cost){
  const isU=type==='u';
  return `<div class="msg ${isU?'u':'a'}">
    <div class="mav${isU?' ua':''}">${av}</div>
    <div class="mbod">
      <div class="mbub">${content}</div>
      <div style="display:flex;gap:6px;">
        <div class="mtime">${time}</div>
        </div>
    </div>
  </div>`;
}

function useChip(t){ document.getElementById('ci').value=t; document.getElementById('chips').innerHTML=''; sendMsg(); }

/* ── Send ──────────────────────────────────────────── */
async function sendMsg(){
  const ci=document.getElementById('ci');
  const text=ci.value.trim(); if(!text)return;
  const ag=agents.find(a=>a.id===activeId); if(!ag)return;
  if((me.balance_jpy||0)<-1500){ showToast('残高が不足しています','ng'); openCharge(); return; }
  ci.value=''; exTA(ci);
  document.getElementById('sndBtn').disabled=true;
  document.getElementById('chips').innerHTML='';
  if(!ag.history)ag.history=[];
  ag.history.push({role:'user',content:text,time:now()});
  renderMsgs(ag);
  const msgs=document.getElementById('msgs');
  const tEl=document.createElement('div');
  tEl.className='msg a'; tEl.id='thinking';
  tEl.innerHTML=`<div class="mav">${ag.avatar}</div><div class="mbod"><div class="mbub"><div class="tdots"><div class="td"></div><div class="td"></div><div class="td"></div></div></div></div>`;
  msgs.appendChild(tEl); msgs.scrollTop=msgs.scrollHeight;
  try{
    const r=await api('POST',`/api/chat/${activeId}`,{message:text});
    ag.history.push({role:'assistant',content:r.reply,time:now()});
    me.balance_jpy=r.balance_jpy;
    me.usage_count=(me.usage_count||0)+1;
    updateBalance();
  }catch(e){
    ag.history.push({role:'assistant',content:'エラー: '+e.message,time:now()});
    if(e.message.includes('クレジット')||e.message.includes('残高')){ openCharge(); }
  }
  document.getElementById('thinking')?.remove();
  renderMsgs(ag);
  document.getElementById('sndBtn').disabled=false;
  ci.focus();
}

async function delAgent(id){
  if(!confirm('このエージェントを削除しますか？'))return;
  try{ await api('DELETE',`/api/agents/${id}`); }catch{}
  agents=agents.filter(a=>a.id!==id); activeId=null;
  renderAgList();
  if(agents.length>0) openAgent(agents[0].id);
  else{ document.getElementById('emptyWrap').style.display='flex'; document.getElementById('chatWrap').style.display='none'; }
}

/* ── Wizard ────────────────────────────────────────── */
function openWizard(){
  NA={avatar:'🤖',name:'',skills:[],persona:''};
  document.getElementById('wName').value='';
  document.getElementById('wPer').value='';
  document.getElementById('avPrev').textContent='🤖';
  document.querySelectorAll('.av-cell').forEach((b,i)=>b.classList.toggle('sel',i===0));
  document.querySelectorAll('.sk-card').forEach(b=>b.classList.remove('sel'));
  wStep(1);
  document.getElementById('wizOverlay').classList.add('open');
}
function closeWizard(){ document.getElementById('wizOverlay').classList.remove('open'); }

function buildAvGrid(){
  document.getElementById('avGrid').innerHTML=AVATARS.map((e,i)=>
    `<button class="av-cell${i===0?' sel':''}" onclick="pickAv(this,'${e}')">${e}</button>`
  ).join('');
}
function pickAv(btn,e){
  document.querySelectorAll('.av-cell').forEach(b=>b.classList.remove('sel'));
  btn.classList.add('sel'); NA.avatar=e;
  document.getElementById('avPrev').textContent=e;
}

function buildSkGrid(){
  document.getElementById('skGrid').innerHTML=SKILLS.map(s=>`
    <button class="sk-card" onclick="togSk(this,'${s.id}')">
      <div class="sk-ic">${s.icon}</div>
      <div class="sk-nm">${s.name}</div>
      <div class="sk-ds">${s.desc}</div>
    </button>`).join('');
}
function togSk(btn,id){
  btn.classList.toggle('sel');
  const i=NA.skills.indexOf(id);
  if(i>=0)NA.skills.splice(i,1); else NA.skills.push(id);
}

function wStep(n){
  if(n===2){ NA.name=document.getElementById('wName').value.trim(); if(!NA.name){showToast('名前を入力してください','ng');return;} }
  if(n===3){ if(!NA.skills.length){showToast('スキルを選んでください','ng');return;} NA.persona=document.getElementById('wPer').value.trim(); buildConf(); }
  document.querySelectorAll('#wizOverlay [id^="ws"]').forEach(s=>s.style.display='none');
  document.getElementById('ws'+n).style.display='block';
  document.getElementById('wizFill').style.width=(n/3*100)+'%';
  document.getElementById('wizTitle').textContent=['','アイコンと名前','スキル','確認'][n];
}

function buildConf(){
  const sns=NA.skills.map(s=>SKILLS.find(x=>x.id===s)?.name||s);
  document.getElementById('confHero').innerHTML=`
    <div class="conf-ic">${NA.avatar}</div>
    <div><div class="conf-nm">${esc(NA.name)}</div>
    <div class="conf-pills">${sns.map(n=>`<span class="pill">${n}</span>`).join('')}</div></div>`;
  document.getElementById('confPer').innerHTML=NA.persona?`<div class="conf-per">${esc(NA.persona)}</div>`:'';
}

async function doCreate(){
  setBtnLoad('createBtn',true,'作成中...');
  try{
    const r=await api('POST','/api/agents',{avatar:NA.avatar,name:NA.name,skills:NA.skills,persona:NA.persona});
    agents.push(r.agent); activeId=r.agent.id;
    renderAgList();
    closeWizard();
    openAgent(r.agent.id);
    showToast(`${NA.name}を作成しました！`,'ok');
  }catch(e){ showToast(e.message,'ng'); }
  setBtnLoad('createBtn',false,'✨ 作成する');
}

/* ── Charge ────────────────────────────────────────── */
function openCharge(){ document.getElementById('chargeOverlay').classList.add('open'); }
function closeCharge(){ document.getElementById('chargeOverlay').classList.remove('open'); }
function selCharge(amt,btn){
  chargeAmt=amt;
  document.querySelectorAll('.plan-c').forEach(el=>el.classList.remove('sel'));
  if(btn)btn.classList.add('sel');
}
async function doCharge(){
  if(!chargeAmt||chargeAmt<100){ showToast('100円以上を入力してください','ng'); return; }
  setBtnLoad('chargeBtn',true,'処理中...');
  try{
    const r=await api('POST','/api/billing/charge',{amount_jpy:chargeAmt});
    if(r.demo){ me.balance_jpy=r.balance_jpy; me.usage_count=me.usage_count||0; updateBalance(); closeCharge(); showToast(`¥${chargeAmt}チャージしました！`,'ok'); }
    else{ showToast('Stripe決済を完了してください','ok'); }
  }catch(e){ showToast(e.message,'ng'); }
  setBtnLoad('chargeBtn',false,'チャージする');
}
function fmtCard(el){let v=el.value.replace(/\D/g,'').slice(0,16);el.value=v.replace(/(.{4})/g,'$1 ').trim();}
function fmtExp(el){let v=el.value.replace(/\D/g,'').slice(0,4);if(v.length>2)v=v.slice(0,2)+' / '+v.slice(2);el.value=v;}

/* ── Logout ────────────────────────────────────────── */
function doLogout(){
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  location.href='auth.html';
}

/* ── Utils ─────────────────────────────────────────── */
function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function fmt(t){return esc(t).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');}
function now(){return new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});}
function exTA(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,120)+'px';}
function taKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();}}
function setBtnLoad(id,on,txt){const b=document.getElementById(id);b.disabled=on;if(txt)b.textContent=txt;}
var toastT;
function showToast(msg,type='ok'){
  const t=document.getElementById('toast');
  document.getElementById('toastMsg').textContent=msg;
  t.className='toast '+type+' on';
  clearTimeout(toastT);
  toastT=setTimeout(()=>t.classList.remove('on'),3200);
});
