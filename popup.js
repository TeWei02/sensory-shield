const DEFAULTS = {
  openaiApiKey: '',
  openaiModel: 'gpt-4o-mini',
  openaiApiBaseUrl: 'https://api.openai.com',
};

const el = {
  neutralizeBtn: document.getElementById('neutralizeBtn'),
  saveKeyBtn: document.getElementById('saveKeyBtn'),
  clearKeyBtn: document.getElementById('clearKeyBtn'),
  apiKeyInput: document.getElementById('apiKeyInput'),
  modelInput: document.getElementById('modelInput'),
  baseUrlInput: document.getElementById('baseUrlInput'),
  statusText: document.getElementById('statusText'),
  modeText: document.getElementById('modeText'),
};

function setStatus(message, type = 'info') {
  if (!el.statusText) return;
  el.statusText.textContent = message;
  el.statusText.dataset.type = type;
}

function setModeLabel(hasKey) {
  if (!el.modeText) return;
  el.modeText.textContent = hasKey
    ? '雲端改寫模式（已設定 API Key）'
    : '本地規則模式（未設定 API Key，離線處理）';
}

function setLoading(isLoading) {
  if (!el.neutralizeBtn) return;
  el.neutralizeBtn.disabled = isLoading;
  el.neutralizeBtn.textContent = isLoading ? '處理中…' : '啟動感官煞車';
}

async function loadConfig() {
  const stored = (await chrome.storage.sync.get(Object.keys(DEFAULTS))) || {};
  const config = { ...DEFAULTS, ...stored };
  el.apiKeyInput.value = config.openaiApiKey || '';
  el.modelInput.value = config.openaiModel || DEFAULTS.openaiModel;
  el.baseUrlInput.value = config.openaiApiBaseUrl || DEFAULTS.openaiApiBaseUrl;
  el.modelInput.placeholder = DEFAULTS.openaiModel;
  el.baseUrlInput.placeholder = DEFAULTS.openaiApiBaseUrl;
  setModeLabel(Boolean(config.openaiApiKey));
  return config;
}

el.saveKeyBtn?.addEventListener('click', async () => {
  const apiKey = el.apiKeyInput.value.trim();
  const model = el.modelInput.value.trim() || DEFAULTS.openaiModel;
  const baseUrl = el.baseUrlInput.value.trim() || DEFAULTS.openaiApiBaseUrl;

  if (!apiKey) {
    setStatus('請先輸入 API Key（或直接使用本地規則模式）。', 'error');
    return;
  }
  if (!/^https?:\/\//i.test(baseUrl)) {
    setStatus('API Base URL 需以 http:// 或 https:// 開頭。', 'error');
    return;
  }

  try {
    await chrome.storage.sync.set({
      openaiApiKey: apiKey,
      openaiModel: model,
      openaiApiBaseUrl: baseUrl.replace(/\/+$/, ''),
    });
    setModeLabel(true);
    setStatus('設定已儲存。', 'ok');
  } catch (err) {
    setStatus(`儲存失敗：${err?.message || '未知錯誤'}`, 'error');
  }
});

el.clearKeyBtn?.addEventListener('click', async () => {
  try {
    await chrome.storage.sync.remove(Object.keys(DEFAULTS));
    el.apiKeyInput.value = '';
    el.modelInput.value = DEFAULTS.openaiModel;
    el.baseUrlInput.value = DEFAULTS.openaiApiBaseUrl;
    setModeLabel(false);
    setStatus('已清除設定，將使用本地規則模式。', 'ok');
  } catch (err) {
    setStatus(`清除失敗：${err?.message || '未知錯誤'}`, 'error');
  }
});

async function startOnTab(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'SENSORY_SHIELD_START' });
    return;
  } catch (err) {
    // Content script is not present yet (page loaded before install, or the
    // page was restored from cache). Inject it, then retry once.
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
    await chrome.tabs.sendMessage(tabId, { type: 'SENSORY_SHIELD_START' });
  }
}

el.neutralizeBtn?.addEventListener('click', async () => {
  setLoading(true);
  setStatus('正在處理目前頁面…');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('找不到目前分頁。');

    await startOnTab(tab.id);
    setStatus('已送出處理請求，結果會顯示在頁面頂端。', 'ok');
  } catch (err) {
    const message = err?.message || '未知錯誤';
    if (/chrome:\/\//.test(message) || /Cannot access/.test(message)) {
      setStatus('此頁面（瀏覽器內部頁面）不允許擴充功能存取。', 'error');
    } else {
      setStatus(`啟動失敗：${message}`, 'error');
    }
  } finally {
    setLoading(false);
  }
});

loadConfig().catch((err) => setStatus(`讀取設定失敗：${err?.message || '未知錯誤'}`, 'error'));
