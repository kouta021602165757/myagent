// Popup logic — query the background service worker for status, render accordingly.

const SERVER_BASE = 'https://myaiagents.agency';

async function refreshStatus() {
  const dot = document.getElementById('statusDot');
  const label = document.getElementById('statusLabel');
  const info = document.getElementById('statusInfo');
  const deviceId = document.getElementById('deviceId');
  const connectedActions = document.getElementById('connectedActions');
  const disconnectedActions = document.getElementById('disconnectedActions');

  // Ask the service worker via runtime.sendMessage with a special internal type.
  chrome.runtime.sendMessage({ __popup: 'status' }, (resp) => {
    // Fallback if SW didn't respond — read storage directly
    if (!resp) {
      chrome.storage.local.get(['device_token', 'device_id'], (s) => {
        renderStatus({ connected: !!s.device_token, device_id: s.device_id, sse_open: false });
      });
      return;
    }
    renderStatus(resp);
  });

  function renderStatus(s) {
    if (s.connected) {
      dot.className = 'dot ' + (s.sse_open ? 'green' : 'red');
      label.textContent = s.sse_open ? '接続中' : '接続待機中（再接続を試行中…）';
      info.style.display = '';
      deviceId.textContent = (s.device_id || '').slice(0, 16) + '…';
      connectedActions.style.display = '';
      disconnectedActions.style.display = 'none';
    } else {
      dot.className = 'dot gray';
      label.textContent = '未連携';
      info.style.display = 'none';
      connectedActions.style.display = 'none';
      disconnectedActions.style.display = '';
    }
  }
}

// Note: chrome.runtime.onMessage in the service worker only handles external messages.
// For popup ↔ background we'll just read storage directly; that's the source of truth.
async function statusFromStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['device_token', 'device_id'], (s) => {
      resolve({ connected: !!s.device_token, device_id: s.device_id });
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const s = await statusFromStorage();
  const dot = document.getElementById('statusDot');
  const label = document.getElementById('statusLabel');
  const info = document.getElementById('statusInfo');
  const deviceId = document.getElementById('deviceId');
  const connectedActions = document.getElementById('connectedActions');
  const disconnectedActions = document.getElementById('disconnectedActions');

  if (s.connected) {
    dot.className = 'dot green';
    label.textContent = '連携中';
    info.style.display = '';
    deviceId.textContent = (s.device_id || '').slice(0, 16) + '…';
    connectedActions.style.display = '';
  } else {
    dot.className = 'dot gray';
    label.textContent = '未連携';
    disconnectedActions.style.display = '';
  }

  document.getElementById('openAppBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: SERVER_BASE + '/app.html' });
  });
  document.getElementById('unpairBtn').addEventListener('click', () => {
    if (!confirm('この拡張機能を MY AI Agent から切断します。よろしいですか?')) return;
    chrome.storage.local.remove(['device_token', 'device_id'], () => {
      window.close();
      // Reload the popup to reflect new state — actually, just close it; user can reopen.
    });
  });
  const pairBtn = document.getElementById('pairBtn');
  if (pairBtn) {
    pairBtn.href = SERVER_BASE + '/app.html#extension-pair';
  }
});
