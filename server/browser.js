'use strict';
/**
 * Browser module — Playwright wrapper + per-chat session.
 * Used by Anthropic Tool Use to give AI agents real browser control.
 *
 * Loaded lazily so the rest of the server keeps working even if
 * Playwright/Chromium failed to install on the host.
 */

let _playwright = null;
let _browser = null;
let _initFailed = false;
let _initError = '';

function _loadPlaywright(){
  if(_playwright || _initFailed) return _playwright;
  try{
    _playwright = require('playwright');
    return _playwright;
  }catch(e){
    _initFailed = true;
    _initError = 'playwright_not_installed: '+e.message;
    console.error('[browser]', _initError);
    return null;
  }
}

async function getBrowser(){
  if(_browser) return _browser;
  if(_initFailed) throw new Error(_initError||'browser unavailable');
  const pw = _loadPlaywright();
  if(!pw) throw new Error(_initError||'playwright not installed');
  try{
    _browser = await pw.chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled',
      ]
    });
    // If browser exits unexpectedly, allow re-init
    _browser.on('disconnected', ()=>{ _browser = null; });
    return _browser;
  }catch(e){
    _initFailed = true;
    _initError = 'launch_failed: '+e.message;
    console.error('[browser] launch failed:', e.message);
    throw new Error(_initError);
  }
}

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

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
    page = await context.newPage();
    page.setDefaultTimeout(20000);
    return page;
  }

  async function _grabState(p, includeScreenshot){
    let title='', url='', text='', screenshot=null;
    try{ url = p.url(); }catch(e){}
    try{ title = await p.title(); }catch(e){}
    try{
      // Limit to ~5KB to keep tokens sane
      text = await p.evaluate(() => (document.body && document.body.innerText || '').slice(0, 5000));
    }catch(e){}
    if(includeScreenshot){
      try{
        const buf = await p.screenshot({type:'jpeg', quality:55, fullPage:false});
        screenshot = buf.toString('base64');
      }catch(e){}
    }
    return {url, title, text, screenshot};
  }

  return {
    /** Open a URL and capture page text + screenshot. */
    async browseUrl(url){
      if(!/^https?:\/\//i.test(url||'')) return {error:'URL は https:// または http:// で始めてください'};
      const p = await ensurePage();
      try{
        await p.goto(url, {waitUntil:'domcontentloaded', timeout:25000});
        // Allow a brief moment for SPA to render
        await p.waitForTimeout(500);
      }catch(e){
        return {error:'page_load_failed: '+e.message};
      }
      return await _grabState(p, true);
    },

    /** DuckDuckGo HTML search → top 10 results. */
    async searchWeb(query){
      if(!query) return {error:'クエリが空です'};
      const p = await ensurePage();
      const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
      try{
        await p.goto(url, {waitUntil:'domcontentloaded', timeout:25000});
      }catch(e){
        return {error:'search_failed: '+e.message};
      }
      const results = await p.evaluate(()=>{
        const items = [];
        document.querySelectorAll('.result__body, .web-result').forEach(el=>{
          if(items.length >= 10) return;
          const a = el.querySelector('.result__a, a.result__a');
          const snippet = el.querySelector('.result__snippet');
          if(a){
            items.push({
              title: (a.textContent||'').trim().slice(0,200),
              url: a.href,
              snippet: snippet ? (snippet.textContent||'').trim().slice(0,300) : ''
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
      // Try visible text first
      try{
        const loc = p.getByText(textOrSelector, {exact:false}).first();
        await loc.click({timeout:6000});
        await p.waitForTimeout(500);
        const state = await _grabState(p, true);
        return {ok:true, action:'click_by_text', target:textOrSelector, ...state};
      }catch(e1){
        // Fall back to CSS selector
        try{
          await p.click(textOrSelector, {timeout:6000});
          await p.waitForTimeout(500);
          const state = await _grabState(p, true);
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
        await p.waitForTimeout(500);
        const state = await _grabState(p, true);
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
