'use strict';
/**
 * Browser module — Playwright wrapper + per-chat session.
 * Used by Anthropic Tool Use to give AI agents real browser control.
 *
 * Loaded lazily so the rest of the server keeps working even if
 * Playwright/Chromium failed to install on the host.
 */

const { spawn } = require('child_process');

let _playwright = null;
let _browser = null;
let _initFailed = false;
let _initError = '';
let _installPromise = null;

function _loadPlaywright(){
  if(_playwright) return _playwright;
  try{
    _playwright = require('playwright');
    return _playwright;
  }catch(e){
    _initError = 'playwright_not_installed: '+e.message;
    console.error('[browser]', _initError);
    return null;
  }
}

/**
 * Runtime install of Chromium binary. Used when postinstall failed silently
 * (Render Node env is fragile). One-shot per process lifetime.
 */
function _ensureChromiumInstalled(){
  if(_installPromise) return _installPromise;
  _installPromise = new Promise((resolve)=>{
    console.log('[browser] downloading Chromium at runtime…');
    const child = spawn('npx', ['--yes', 'playwright', 'install', 'chromium'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });
    let stderr = '';
    child.stdout.on('data', d => process.stdout.write('[browser:install] '+d));
    child.stderr.on('data', d => { stderr += d.toString(); process.stderr.write('[browser:install] '+d); });
    const t = setTimeout(()=>{ try{ child.kill('SIGKILL'); }catch(e){} resolve({ok:false, reason:'install timeout'}); }, 240000);
    child.on('error', (err)=>{ clearTimeout(t); resolve({ok:false, reason:err.message}); });
    child.on('exit', (code)=>{
      clearTimeout(t);
      if(code===0){ console.log('[browser] Chromium install OK'); resolve({ok:true}); }
      else resolve({ok:false, reason:`install exit ${code} ${stderr.slice(-400)}`});
    });
  });
  return _installPromise;
}

function _isExecutableMissing(err){
  const m = (err&&err.message)||'';
  return /Executable doesn'?t exist|browserType\.launch|please install/i.test(m);
}

function _isOsDepMissing(err){
  const m = (err&&err.message)||'';
  return /libnss3|libnspr4|libatk|libcups|libxkbcommon|host system is missing dependencies/i.test(m);
}

async function _launch(pw){
  return await pw.chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-blink-features=AutomationControlled',
    ]
  });
}

async function getBrowser(){
  if(_browser) return _browser;
  if(_initFailed) throw new Error(_initError||'browser unavailable');
  const pw = _loadPlaywright();
  if(!pw) throw new Error(_initError||'playwright not installed');
  try{
    _browser = await _launch(pw);
  }catch(e){
    if(_isExecutableMissing(e)){
      console.warn('[browser] Chromium missing — attempting runtime install');
      const r = await _ensureChromiumInstalled();
      if(!r.ok){
        _initFailed = true;
        _initError = 'chromium_install_failed: '+r.reason;
        console.error('[browser]', _initError);
        throw new Error(_initError);
      }
      try{
        _browser = await _launch(pw);
      }catch(e2){
        _initFailed = true;
        _initError = _isOsDepMissing(e2)
          ? 'os_deps_missing: Chromium が必要とする OS ライブラリがホストにありません。Render の Environment を Docker に切り替えてください。'
          : 'launch_failed: '+e2.message;
        console.error('[browser] post-install launch failed:', e2.message);
        throw new Error(_initError);
      }
    } else {
      _initFailed = true;
      _initError = _isOsDepMissing(e)
        ? 'os_deps_missing: Chromium が必要とする OS ライブラリがホストにありません。Render の Environment を Docker に切り替えてください。'
        : 'launch_failed: '+e.message;
      console.error('[browser] launch failed:', e.message);
      throw new Error(_initError);
    }
  }
  _browser.on('disconnected', ()=>{ _browser = null; _initFailed = false; });
  return _browser;
}

// Match Playwright 1.59's bundled Chromium (~141). An old UA (Chrome 120) gets us
// "your browser is unsupported" walls on Google Workspace pages.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

/** Per-chat-message session. Open one context, reuse the page across tool calls. */
function newSession(){
  let context = null;
  let page = null;

  async function ensurePage(){
    if(page) return page;
    const browser = await getBrowser();
    context = await browser.newContext({
      viewport: {width:1280, height:800},
      userAgent: UA,
      locale: 'ja-JP',
      timezoneId: 'Asia/Tokyo',
    });
    // Block heavy resources to cut page-load latency. We only need DOM text for the AI.
    // NOTE: stylesheets are NOT blocked — modern SPAs (Google Docs/Sheets, Notion, etc.)
    // depend on CSS for layout/visibility, and blocking it makes their navigation hang.
    await context.route('**/*', (route)=>{
      const t = route.request().resourceType();
      if(t==='image' || t==='media' || t==='font') return route.abort();
      return route.continue();
    });
    page = await context.newPage();
    page.setDefaultTimeout(20000);
    return page;
  }

  async function _grabState(p, includeScreenshot){
    let title='', url='', text='', screenshot=null;
    try{ url = p.url(); }catch(e){}
    try{ title = await p.title(); }catch(e){}
    try{
      // 2.5KB text cap — enough for AI context, much faster than 5KB
      text = await p.evaluate(() => (document.body && document.body.innerText || '').slice(0, 2500));
    }catch(e){}
    if(includeScreenshot){
      try{
        // Re-enable images briefly via a fresh screenshot pass — but we keep them off
        // by default for speed; AI must opt-in via take_screenshot.
        const buf = await p.screenshot({type:'jpeg', quality:40, fullPage:false});
        screenshot = buf.toString('base64');
      }catch(e){}
    }
    return {url, title, text, screenshot};
  }

  return {
    /** Open a URL and capture page text. (No auto-screenshot — call take_screenshot if visual needed.) */
    async browseUrl(url){
      if(!/^https?:\/\//i.test(url||'')) return {error:'URL は https:// または http:// で始めてください'};
      const p = await ensurePage();
      let timedOut = false;
      try{
        // 'commit' returns as soon as navigation is committed — the heaviest SPAs
        // (Google Docs/Sheets, Notion) never fire a stable domcontentloaded.
        // We then give the JS up to 4 more seconds to populate body text.
        await p.goto(url, {waitUntil:'commit', timeout:25000});
        try{ await p.waitForLoadState('domcontentloaded', {timeout:4000}); }catch(e){}
      }catch(e){
        timedOut = true;
        // Don't bail — if the page partially rendered, we can still grab text.
        // Tell the AI it was a partial load so it can decide whether to retry.
        const partial = await _grabState(p, false).catch(()=>({}));
        if(partial.text && partial.text.length > 50){
          return { ...partial, partial:true, warn:'page_load_timeout (' + (e.message||'').split('\n')[0] + ')' };
        }
        return {error:'page_load_failed: '+(e.message||'').split('\n')[0]};
      }
      const state = await _grabState(p, false);
      if(timedOut) state.partial = true;
      return state;
    },

    /** DuckDuckGo HTML search → top 8 results. */
    async searchWeb(query){
      if(!query) return {error:'クエリが空です'};
      const p = await ensurePage();
      const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
      try{
        await p.goto(url, {waitUntil:'domcontentloaded', timeout:20000});
      }catch(e){
        return {error:'search_failed: '+(e.message||'').split('\n')[0]};
      }
      const results = await p.evaluate(()=>{
        const items = [];
        document.querySelectorAll('.result__body, .web-result').forEach(el=>{
          if(items.length >= 8) return;
          const a = el.querySelector('.result__a, a.result__a');
          const snippet = el.querySelector('.result__snippet');
          if(a){
            items.push({
              title: (a.textContent||'').trim().slice(0,160),
              url: a.href,
              snippet: snippet ? (snippet.textContent||'').trim().slice(0,200) : ''
            });
          }
        });
        return items;
      }).catch(()=>[]);
      return {query, count:results.length, results};
    },

    /** Click an element by visible text (preferred) or CSS selector. */
    async clickElement(textOrSelector){
      const p = await ensurePage();
      try{
        const loc = p.getByText(textOrSelector, {exact:false}).first();
        await loc.click({timeout:5000});
        const state = await _grabState(p, false);
        return {ok:true, action:'click_by_text', target:textOrSelector, ...state};
      }catch(e1){
        try{
          await p.click(textOrSelector, {timeout:5000});
          const state = await _grabState(p, false);
          return {ok:true, action:'click_by_selector', target:textOrSelector, ...state};
        }catch(e2){
          return {ok:false, error:'click_failed: '+e2.message};
        }
      }
    },

    /** Fill a form field. */
    async typeText(selector, text){
      const p = await ensurePage();
      try{
        await p.fill(selector, String(text||''), {timeout:6000});
        return {ok:true, message:'typed into '+selector};
      }catch(e){
        // Try by label / placeholder if selector failed
        try{
          await p.getByPlaceholder(selector).first().fill(String(text||''));
          return {ok:true, message:'typed into placeholder='+selector};
        }catch(e2){
          return {ok:false, error:'type_failed: '+e2.message};
        }
      }
    },

    /** Press a key on the focused / target element. */
    async pressKey(key, selector){
      const p = await ensurePage();
      try{
        if(selector) await p.press(selector, key, {timeout:5000});
        else await p.keyboard.press(key);
        // Brief settle wait for navigation/rendering, but much shorter than before
        try{ await p.waitForLoadState('domcontentloaded', {timeout:3000}); }catch(e){}
        const state = await _grabState(p, false);
        return {ok:true, key, ...state};
      }catch(e){
        return {ok:false, error:'press_failed: '+e.message};
      }
    },

    /** Take a screenshot of the current page. */
    async takeScreenshot(){
      const p = await ensurePage();
      return await _grabState(p, true);
    },

    /** Read the visible text of the current page (without re-navigation). */
    async readPage(){
      if(!page) return {error:'まだページが開かれていません。先に browse_url か search_web を呼んでください。'};
      return await _grabState(page, false);
    },

    async close(){
      if(context){
        try{ await context.close(); }catch(e){}
      }
      context = null; page = null;
    }
  };
}

/** Light health check — true if browser can launch. */
async function isAvailable(){
  if(_initFailed) return false;
  try{ await getBrowser(); return true; }catch(e){ return false; }
}

module.exports = { getBrowser, newSession, isAvailable };
