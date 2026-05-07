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
        return sendResponse({ error: 'unknown_action: ' + action });
      } catch (e) {
        sendResponse({ error: 'content_exception: ' + (e && e.message || String(e)) });
      }
    })();
    return true; // async
  });
})();
