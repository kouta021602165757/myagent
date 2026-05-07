// MY AI Agent — Browser Connector (background service worker)
//
// Responsibilities:
//   1. Maintain SSE connection to the server (downstream commands)
//   2. POST results back via HTTPS
//   3. Route commands to the right tab via content script messaging
//   4. Persist device token in chrome.storage.local
//
// The connection is one-way SSE (server → extension) plus REST POST (extension → server).
// We chose this over WebSocket because:
//   - SSE auto-reconnects via EventSource
//   - Simpler than WS frame management in MV3 service worker
//   - MV3 service workers get killed often; SSE recovers cleanly on restart

const SERVER_BASE = 'https://myaiagents.agency';

// ── Storage helpers ───────────────────────────────────────────
async function getToken() {
  const r = await chrome.storage.local.get(['device_token', 'device_id']);
  return r;
}
async function setToken(device_token, device_id) {
  await chrome.storage.local.set({ device_token, device_id });
}
async function clearToken() {
  await chrome.storage.local.remove(['device_token', 'device_id']);
}

// ── Status badge (extension icon) ─────────────────────────────
function setBadge(state) {
  // state: 'connected' (green dot) | 'idle' (gray) | 'error' (red) | 'busy' (orange)
  const map = {
    connected: { text: '●', color: '#10b981' },
    idle:      { text: '',  color: '#9a6a4a' },
    error:     { text: '!', color: '#ef4444' },
    busy:      { text: '⋯', color: '#fb923c' },
  };
  const m = map[state] || map.idle;
  try {
    chrome.action.setBadgeText({ text: m.text });
    chrome.action.setBadgeBackgroundColor({ color: m.color });
  } catch (e) {}
}

// ── SSE connection (server → us) ──────────────────────────────
let _es = null;
let _retryDelay = 1000;
async function connectSSE() {
  const { device_token } = await getToken();
  if (!device_token) {
    setBadge('idle');
    return;
  }
  if (_es) { try { _es.close(); } catch (e) {} _es = null; }
  // EventSource doesn't support custom headers, so we pass token in URL.
  const url = SERVER_BASE + '/api/extension/stream?token=' + encodeURIComponent(device_token);
  try {
    _es = new EventSource(url);
  } catch (e) {
    console.error('[ext] EventSource construct failed:', e);
    setBadge('error');
    return;
  }
  _es.addEventListener('open', () => {
    _retryDelay = 1000;
    setBadge('connected');
    console.log('[ext] SSE connected');
  });
  _es.addEventListener('error', (ev) => {
    setBadge('error');
    console.warn('[ext] SSE error, will reconnect in', _retryDelay, 'ms');
    if (_es) { try { _es.close(); } catch (e) {} _es = null; }
    setTimeout(connectSSE, _retryDelay);
    _retryDelay = Math.min(_retryDelay * 2, 30000);
  });
  _es.addEventListener('cmd', async (ev) => {
    try {
      const cmd = JSON.parse(ev.data);
      setBadge('busy');
      const result = await handleCommand(cmd);
      await postResult(cmd.id, result);
      setBadge('connected');
    } catch (e) {
      console.error('[ext] cmd handler failed:', e);
      setBadge('error');
    }
  });
  _es.addEventListener('ping', () => {
    // keepalive — nothing to do
  });
}

// ── Post result back to server ────────────────────────────────
async function postResult(commandId, result) {
  const { device_token } = await getToken();
  if (!device_token) return;
  try {
    await fetch(SERVER_BASE + '/api/extension/result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + device_token,
      },
      body: JSON.stringify({ command_id: commandId, result }),
    });
  } catch (e) {
    console.error('[ext] postResult failed:', e);
  }
}

// ── Command handlers (the actual browser actions) ────────────
async function handleCommand(cmd) {
  const start = Date.now();
  try {
    switch (cmd.name) {
      case 'open_url':         return await openUrl(cmd.input);
      case 'click':            return await runOnActiveTab('click', cmd.input);
      case 'type':             return await runOnActiveTab('type', cmd.input);
      case 'read_page':        return await runOnActiveTab('read_page', cmd.input);
      case 'wait':             return await new Promise(r => setTimeout(() => r({ ok:true, waited_ms: (cmd.input&&cmd.input.ms)||1000 }), Math.min((cmd.input&&cmd.input.ms)||1000, 10000)));
      case 'press_key':        return await runOnActiveTab('press_key', cmd.input);
      case 'screenshot':       return await captureScreenshot();
      case 'list_tabs':        return await listTabs();
      case 'switch_tab':       return await switchTab(cmd.input);
      case 'close_tab':        return await closeTab(cmd.input);
      default:
        return { error: 'unknown_command: ' + cmd.name };
    }
  } catch (e) {
    return { error: 'command_failed: ' + (e && e.message || String(e)) };
  } finally {
    console.log('[ext] cmd', cmd.name, 'took', (Date.now()-start)+'ms');
  }
}

async function openUrl({ url, in_active_tab }) {
  if (!url || !/^https?:\/\//i.test(url)) {
    return { error: 'url must start with https:// or http://' };
  }
  if (in_active_tab) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      await chrome.tabs.update(tab.id, { url });
      await waitForLoad(tab.id);
      return { ok: true, tab_id: tab.id, url };
    }
  }
  const tab = await chrome.tabs.create({ url, active: true });
  await waitForLoad(tab.id);
  return { ok: true, tab_id: tab.id, url };
}

function waitForLoad(tabId, timeout = 20000) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const listener = (id, info) => {
      if (id === tabId && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        // Wait an extra moment for SPA hydration
        setTimeout(resolve, 800);
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
    setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    }, timeout);
  });
}

async function runOnActiveTab(action, input) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return { error: 'no_active_tab' };
  return await new Promise((resolve) => {
    const timeout = setTimeout(() => resolve({ error: 'content_script_timeout' }), 15000);
    chrome.tabs.sendMessage(tab.id, { action, input }, (resp) => {
      clearTimeout(timeout);
      if (chrome.runtime.lastError) {
        // Content script may not be injected on this page (e.g. chrome:// urls).
        // Try to inject it ad-hoc.
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js'],
        }, () => {
          if (chrome.runtime.lastError) {
            resolve({ error: 'content_script_unavailable: ' + chrome.runtime.lastError.message });
            return;
          }
          chrome.tabs.sendMessage(tab.id, { action, input }, (resp2) => {
            if (chrome.runtime.lastError) {
              resolve({ error: 'content_script_error: ' + chrome.runtime.lastError.message });
            } else {
              resolve(resp2 || { error: 'no_response' });
            }
          });
        });
        return;
      }
      resolve(resp || { error: 'no_response' });
    });
  });
}

async function captureScreenshot() {
  return await new Promise((resolve) => {
    chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 70 }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        resolve({ error: 'screenshot_failed: ' + chrome.runtime.lastError.message });
      } else {
        // dataUrl is "data:image/jpeg;base64,..."
        const b64 = (dataUrl || '').split(',')[1] || '';
        resolve({ ok: true, screenshot: b64, mime: 'image/jpeg' });
      }
    });
  });
}

async function listTabs() {
  const tabs = await chrome.tabs.query({});
  return {
    ok: true,
    tabs: tabs.map(t => ({ id: t.id, title: t.title, url: t.url, active: t.active })).slice(0, 50),
  };
}
async function switchTab({ tab_id }) {
  await chrome.tabs.update(tab_id, { active: true });
  return { ok: true };
}
async function closeTab({ tab_id }) {
  await chrome.tabs.remove(tab_id);
  return { ok: true };
}

// ── External pairing message (from web page in MY AI Agent) ──
chrome.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
  // Only accept from our own origin (manifest's externally_connectable already enforces)
  if (msg && msg.type === 'pair' && msg.device_token && msg.device_id) {
    setToken(msg.device_token, msg.device_id).then(() => {
      connectSSE();
      sendResponse({ ok: true });
    });
    return true; // async
  }
  if (msg && msg.type === 'unpair') {
    clearToken().then(() => {
      if (_es) { try { _es.close(); } catch (e) {} _es = null; }
      setBadge('idle');
      sendResponse({ ok: true });
    });
    return true;
  }
  if (msg && msg.type === 'status') {
    getToken().then(({ device_token, device_id }) => {
      sendResponse({
        connected: !!device_token,
        device_id: device_id || null,
        sse_open: !!(_es && _es.readyState === 1),
      });
    });
    return true;
  }
  if (msg && msg.type === 'kill') {
    // user-initiated kill switch from web app
    if (_es) { try { _es.close(); } catch (e) {} _es = null; }
    setBadge('idle');
    sendResponse({ ok: true });
    return false;
  }
  sendResponse({ error: 'unknown_message_type' });
  return false;
});

// ── Lifecycle ─────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  setBadge('idle');
  // Open onboarding tab on first install.
  chrome.storage.local.get(['onboarded'], (r) => {
    if (!r.onboarded) {
      chrome.tabs.create({ url: SERVER_BASE + '/extension-installed.html' });
      chrome.storage.local.set({ onboarded: true });
    }
  });
});

chrome.runtime.onStartup.addListener(() => {
  connectSSE();
});

// Reconnect immediately on script load (service worker may have just woken up)
connectSSE();
