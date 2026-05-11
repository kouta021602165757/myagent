// MY AI Agent — Browser Connector (content script)
//
// Runs in the context of every page. Receives action requests from the background
// service worker and performs DOM operations: click, type, read_page, press_key.
//
// All selectors support both CSS selectors AND visible text. We try CSS first,
// then fall back to a "find element with this text" strategy.

(function () {
  if (window.__myagent_content_loaded) return;
  window.__myagent_content_loaded = true;

  function findByCssOrText(target) {
    if (!target) return null;
    // 1. Try CSS selector
    try {
      const el = document.querySelector(target);
      if (el) return el;
    } catch (e) {}
    // 2. Try text match — find any clickable/interactive element whose text contains target
    const lower = target.trim().toLowerCase();
    const candidates = document.querySelectorAll(
      'button, a, [role="button"], [role="link"], [role="tab"], input[type="submit"], [data-testid]'
    );
    let best = null;
    let bestScore = -1;
    for (const el of candidates) {
      const txt = (el.innerText || el.textContent || el.value || el.getAttribute('aria-label') || '').trim().toLowerCase();
      if (!txt) continue;
      if (txt === lower) return el; // exact match wins
      if (txt.includes(lower)) {
        // Prefer shorter (more specific) matches.
        const score = -Math.abs(txt.length - lower.length);
        if (score > bestScore) { bestScore = score; best = el; }
      }
    }
    return best;
  }

  function findInput(selectorOrPlaceholder) {
    if (!selectorOrPlaceholder) return null;
    // 1. Try CSS selector
    try {
      const el = document.querySelector(selectorOrPlaceholder);
      if (el && (el.matches('input,textarea,[contenteditable="true"]'))) return el;
    } catch (e) {}
    // 2. Try by placeholder / aria-label / name
    const lower = selectorOrPlaceholder.trim().toLowerCase();
    const inputs = document.querySelectorAll('input,textarea,[contenteditable="true"]');
    for (const el of inputs) {
      const ph = (el.placeholder || el.getAttribute('aria-label') || el.name || '').trim().toLowerCase();
      if (ph && ph.includes(lower)) return el;
    }
    // 3. Fallback: first visible textarea/input
    for (const el of inputs) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return el;
    }
    return null;
  }

  function setNativeValue(el, value) {
    // React, Vue, etc. wrap input setters. Use the native setter so framework
    // re-renders pick up the change.
    const proto = Object.getPrototypeOf(el);
    const setter = Object.getOwnPropertyDescriptor(proto, 'value');
    if (setter && setter.set) {
      setter.set.call(el, value);
    } else {
      el.value = value;
    }
  }

  async function typeText(el, text, opts) {
    el.focus();
    if (el.matches('[contenteditable="true"]')) {
      // For contenteditable (Twitter compose, Slack, etc.) — use execCommand
      // which dispatches the right input events.
      try {
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, text);
      } catch (e) {
        el.textContent = text;
        el.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: text, bubbles: true }));
      }
      return;
    }
    // Regular inputs
    setNativeValue(el, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Markdown conversion of the main content. Preserves h1-h6 / lists / links /
  // code blocks / blockquotes so the AI sees semantic structure, not flat text.
  function getMarkdown() {
    const root = document.querySelector('main, article, [role="main"]') || document.body;
    const out = [];
    function walk(node) {
      if (!node) return;
      if (node.nodeType === Node.TEXT_NODE) {
        const t = node.textContent.replace(/\s+/g, ' ');
        if (t.trim()) out.push(t);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const tag = node.tagName.toLowerCase();
      if (['script', 'style', 'noscript', 'svg', 'iframe', 'nav', 'footer'].includes(tag)) return;
      if (/^h[1-6]$/.test(tag)) {
        const level = parseInt(tag.slice(1));
        out.push('\n\n' + '#'.repeat(level) + ' ' + (node.innerText || '').trim() + '\n');
        return;
      }
      if (tag === 'p')          { out.push('\n\n'); for (const c of node.childNodes) walk(c); return; }
      if (tag === 'br')         { out.push('\n'); return; }
      if (tag === 'li')         { out.push('\n- ');  for (const c of node.childNodes) walk(c); return; }
      if (tag === 'blockquote') { out.push('\n> ');  for (const c of node.childNodes) walk(c); return; }
      if (tag === 'pre')        { out.push('\n\n```\n' + (node.innerText || '') + '\n```\n'); return; }
      if (tag === 'code')       { out.push('`' + (node.innerText || '') + '`'); return; }
      if (tag === 'a' && node.href) {
        const txt = (node.innerText || '').trim();
        if (txt) { out.push('[' + txt + '](' + node.href + ')'); return; }
      }
      if (tag === 'img' && node.src) {
        out.push('![' + (node.alt || '') + '](' + node.src + ')');
        return;
      }
      if (tag === 'strong' || tag === 'b') { out.push('**'); for (const c of node.childNodes) walk(c); out.push('**'); return; }
      if (tag === 'em' || tag === 'i')     { out.push('*');  for (const c of node.childNodes) walk(c); out.push('*'); return; }
      for (const c of node.childNodes) walk(c);
    }
    walk(root);
    return out.join('').replace(/\n{3,}/g, '\n\n').trim().slice(0, 12000);
  }

  // Compact structural overview — landmarks, forms, headings — so the AI can
  // plan "what to do next" without a full screenshot or 5KB of text.
  function getPageOutline() {
    function summary(el, n) {
      const r = el.getBoundingClientRect();
      const visible = r.width > 0 && r.height > 0;
      return { tag: el.tagName.toLowerCase(), text: ((el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, n || 80)), visible };
    }
    const out = {
      title: document.title,
      url: location.href,
      headings: Array.from(document.querySelectorAll('h1,h2,h3')).slice(0, 30).map(h => ({ level: h.tagName, text: (h.innerText || '').trim().slice(0, 120) })),
      forms: Array.from(document.querySelectorAll('form')).slice(0, 8).map((f, i) => ({
        idx: i,
        action: f.getAttribute('action') || null,
        method: (f.getAttribute('method') || 'GET').toUpperCase(),
        inputs: Array.from(f.querySelectorAll('input,textarea,select')).slice(0, 20).map(inp => ({
          type: inp.type || inp.tagName.toLowerCase(),
          name: inp.name || null,
          placeholder: inp.placeholder || null,
          aria: inp.getAttribute('aria-label') || null,
          required: !!inp.required,
        })),
      })),
      links: Array.from(document.querySelectorAll('a[href]')).slice(0, 40).map(a => ({
        text: (a.innerText || '').trim().slice(0, 80),
        href: a.href,
      })).filter(l => l.text),
      buttons: Array.from(document.querySelectorAll('button, [role="button"], input[type="submit"]')).slice(0, 30).map(b => summary(b, 60)),
    };
    return out;
  }

  // Best-effort JSON serialization of arbitrary eval results — drops functions,
  // shallow-walks DOM nodes, caps depth + length so we don't ship 50MB.
  function _safeJson(value, depth) {
    depth = depth || 0;
    if (depth > 4) return '...';
    if (value === null || value === undefined) return value;
    const t = typeof value;
    if (t === 'string') return value.slice(0, 5000);
    if (t === 'number' || t === 'boolean') return value;
    if (t === 'function') return 'function ' + (value.name || 'anonymous');
    if (value instanceof Element) return { tag: value.tagName.toLowerCase(), text: (value.innerText || '').slice(0, 200) };
    if (Array.isArray(value)) return value.slice(0, 200).map(v => _safeJson(v, depth + 1));
    if (t === 'object') {
      const out = {};
      let i = 0;
      for (const k of Object.keys(value)) {
        if (i++ > 50) break;
        try { out[k] = _safeJson(value[k], depth + 1); } catch (e) { out[k] = '<unreadable>'; }
      }
      return out;
    }
    return String(value);
  }

  function getPageText() {
    // Truncated body text — enough context for the AI without sending mountains.
    const t = (document.body && document.body.innerText || '').trim().slice(0, 5000);
    return t;
  }

  function getInteractiveSummary() {
    // List clickable elements and inputs, helps the AI know what's available without
    // a screenshot. Limit to 30 items.
    const items = [];
    const seen = new Set();
    const els = document.querySelectorAll('button, a, [role="button"], input, textarea, [contenteditable="true"], [data-testid]');
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      let label = '';
      if (el.matches('input,textarea')) {
        label = (el.placeholder || el.getAttribute('aria-label') || el.name || el.type || 'input').slice(0, 80);
      } else {
        label = ((el.innerText || el.textContent || el.getAttribute('aria-label') || '').trim()).slice(0, 80);
      }
      if (!label) continue;
      const sig = el.tagName + ':' + label;
      if (seen.has(sig)) continue;
      seen.add(sig);
      const tag = el.tagName.toLowerCase();
      const tid = el.getAttribute('data-testid');
      items.push({
        tag,
        text: label,
        ...(tid ? { testid: tid } : {}),
      });
      if (items.length >= 30) break;
    }
    return items;
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    (async () => {
      try {
        const { action, input = {} } = msg;
        if (action === 'click') {
          const el = findByCssOrText(input.target);
          if (!el) return sendResponse({ error: 'element_not_found: ' + input.target });
          el.scrollIntoView({ block: 'center', behavior: 'instant' });
          await new Promise(r => setTimeout(r, 150));
          el.click();
          return sendResponse({ ok: true, clicked: input.target });
        }
        if (action === 'type') {
          const el = findInput(input.selector);
          if (!el) return sendResponse({ error: 'input_not_found: ' + input.selector });
          el.scrollIntoView({ block: 'center', behavior: 'instant' });
          await typeText(el, input.text || '', input);
          return sendResponse({ ok: true, typed: (input.text || '').slice(0, 60) + ((input.text || '').length > 60 ? '...' : '') });
        }
        if (action === 'press_key') {
          const target = input.selector ? findByCssOrText(input.selector) : (document.activeElement || document.body);
          if (!target) return sendResponse({ error: 'target_not_found' });
          const key = input.key || 'Enter';
          // Dispatch keydown + keyup. Many sites also need beforeinput/input.
          const opts = { key, code: key, bubbles: true, cancelable: true };
          target.dispatchEvent(new KeyboardEvent('keydown', opts));
          target.dispatchEvent(new KeyboardEvent('keyup', opts));
          if (key === 'Enter' && target.tagName === 'TEXTAREA' && target.form) {
            // Many <form> on Enter via keydown; trigger submit too as a safety net.
            try { target.form.requestSubmit(); } catch (e) {}
          }
          return sendResponse({ ok: true, pressed: key });
        }
        if (action === 'read_page') {
          return sendResponse({
            ok: true,
            url: location.href,
            title: document.title,
            text: getPageText(),
            interactive: getInteractiveSummary(),
          });
        }
        // ── NEW: scroll page or to element ──────────────────────
        if (action === 'scroll') {
          const dir = (input.direction || 'down').toLowerCase();
          if (input.selector) {
            const el = findByCssOrText(input.selector);
            if (!el) return sendResponse({ error: 'element_not_found: ' + input.selector });
            el.scrollIntoView({ block: 'center', behavior: 'instant' });
          } else {
            const amount = Math.max(50, Math.min(20000, parseInt(input.amount) || 600));
            const dy = dir === 'up' ? -amount : amount;
            const dx = dir === 'left' ? -amount : (dir === 'right' ? amount : 0);
            window.scrollBy({ left: dx, top: dy, behavior: 'instant' });
          }
          await new Promise(r => setTimeout(r, 200));
          return sendResponse({ ok: true, scrollY: window.scrollY, max: document.body.scrollHeight });
        }
        // ── NEW: wait for an element or text to appear ─────────
        if (action === 'wait_for') {
          const sel = input.selector || '';
          const text = (input.text || '').trim();
          const timeoutMs = Math.max(200, Math.min(20000, parseInt(input.timeout_ms) || 5000));
          const t0 = Date.now();
          while (Date.now() - t0 < timeoutMs) {
            let found = null;
            if (sel) { try { found = document.querySelector(sel); } catch (e) {} }
            if (!found && text) found = findByCssOrText(text);
            if (found) {
              const r = found.getBoundingClientRect();
              if (r.width > 0 && r.height > 0) {
                return sendResponse({ ok: true, waited_ms: Date.now() - t0 });
              }
            }
            await new Promise(r => setTimeout(r, 150));
          }
          return sendResponse({ error: 'wait_for_timeout: ' + (sel || text), waited_ms: timeoutMs });
        }
        // ── NEW: hover an element (for dropdown menus) ─────────
        if (action === 'hover') {
          const el = findByCssOrText(input.target);
          if (!el) return sendResponse({ error: 'element_not_found: ' + input.target });
          el.scrollIntoView({ block: 'center', behavior: 'instant' });
          const r = el.getBoundingClientRect();
          const x = r.left + r.width / 2;
          const y = r.top + r.height / 2;
          ['mouseover', 'mouseenter', 'mousemove'].forEach(type => {
            el.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: x, clientY: y }));
          });
          await new Promise(r => setTimeout(r, 200));
          return sendResponse({ ok: true, hovered: input.target });
        }
        // ── NEW: batch-fill multiple form fields ───────────────
        if (action === 'fill_form') {
          const fields = Array.isArray(input.fields) ? input.fields : [];
          if (!fields.length) return sendResponse({ error: 'fields[] required' });
          const results = [];
          for (const f of fields) {
            const el = findInput(f.selector);
            if (!el) { results.push({ selector: f.selector, ok: false, error: 'not_found' }); continue; }
            await typeText(el, String(f.value == null ? '' : f.value), {});
            results.push({ selector: f.selector, ok: true });
            await new Promise(r => setTimeout(r, 80));
          }
          return sendResponse({ ok: true, filled: results.filter(r => r.ok).length, total: results.length, results });
        }
        // ── NEW: structured extraction with CSS selectors ──────
        // input.items: [{name, selector, attribute?}] — picks every matching
        // node, returns rows of {name: value} grouped by selector.
        if (action === 'extract') {
          const items = Array.isArray(input.items) ? input.items : [];
          if (!items.length) return sendResponse({ error: 'items[] required' });
          const out = {};
          for (const it of items) {
            try {
              const nodes = document.querySelectorAll(it.selector);
              out[it.name || it.selector] = Array.from(nodes).slice(0, 200).map(n => {
                if (it.attribute) return n.getAttribute(it.attribute) || '';
                return (n.innerText || n.textContent || '').trim().slice(0, 500);
              });
            } catch (e) {
              out[it.name || it.selector] = { error: 'bad_selector: ' + e.message };
            }
          }
          return sendResponse({ ok: true, url: location.href, data: out });
        }
        // ── NEW: page → markdown (preserves headings / lists / links) ─
        if (action === 'read_markdown') {
          return sendResponse({
            ok: true,
            url: location.href,
            title: document.title,
            markdown: getMarkdown(),
          });
        }
        // ── NEW: high-level page outline (semantic landmarks) ──
        if (action === 'page_outline') {
          return sendResponse({
            ok: true,
            url: location.href,
            title: document.title,
            outline: getPageOutline(),
          });
        }
        // ── NEW: run user-approved JS (powerful, server-gated) ─
        if (action === 'eval') {
          const code = String(input.code || '');
          if (!code) return sendResponse({ error: 'code required' });
          if (code.length > 5000) return sendResponse({ error: 'code too long' });
          try {
            // Indirect eval so we run in global scope, not content-script's IIFE
            const fn = new Function('return (async () => { ' + code + ' })()');
            const result = await fn();
            return sendResponse({ ok: true, result: _safeJson(result) });
          } catch (e) {
            return sendResponse({ error: 'eval_failed: ' + (e && e.message || String(e)) });
          }
        }
        // ── NEW: upload a file to a file input ─────────────────
        // input: {selector, data_url, filename}
        if (action === 'upload_file') {
          const el = findInput(input.selector);
          if (!el || el.type !== 'file') return sendResponse({ error: 'file_input_not_found: ' + input.selector });
          try {
            const m = String(input.data_url || '').match(/^data:([^;]+);base64,(.+)$/);
            if (!m) return sendResponse({ error: 'data_url must be data:<mime>;base64,...' });
            const mime = m[1];
            const bin = atob(m[2]);
            const buf = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
            const file = new File([buf], String(input.filename || 'upload.bin'), { type: mime });
            const dt = new DataTransfer();
            dt.items.add(file);
            el.files = dt.files;
            el.dispatchEvent(new Event('change', { bubbles: true }));
            return sendResponse({ ok: true, filename: file.name, size: file.size });
          } catch (e) {
            return sendResponse({ error: 'upload_failed: ' + (e && e.message || String(e)) });
          }
        }
        return sendResponse({ error: 'unknown_action: ' + action });
      } catch (e) {
        sendResponse({ error: 'content_exception: ' + (e && e.message || String(e)) });
      }
    })();
    return true; // async
  });
})();
