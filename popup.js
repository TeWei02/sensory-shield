const neutralizeBtn = document.getElementById('neutralizeBtn');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const apiKeyInput = document.getElementById('apiKeyInput');
const statusText = document.getElementById('statusText');

function setStatus(message, type = 'info') {
  if (!statusText) return;
  statusText.textContent = message;
  statusText.style.color = type === 'error' ? '#b71c1c' : '#2b2b2b';
}

function setLoading(isLoading, loadingMessage = '處理中...') {
  if (!neutralizeBtn) return;
  neutralizeBtn.disabled = isLoading;
  neutralizeBtn.textContent = isLoading
    ? loadingMessage
    : '啟動感官煞車 (Neutralize Page)';
}

saveKeyBtn?.addEventListener('click', async () => {
  const key = apiKeyInput?.value?.trim();
  if (!key) {
    setStatus('請先輸入 API Key。', 'error');
    return;
  }

  try {
    await chrome.storage.sync.set({ openaiApiKey: key });
    setStatus('API Key 已儲存。');
  } catch (err) {
    setStatus(`儲存失敗：${err?.message || '未知錯誤'}`, 'error');
  }
});

neutralizeBtn?.addEventListener('click', async () => {
  setLoading(true);
  setStatus('正在啟動中...');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      throw new Error('找不到目前分頁。');
    }

    await chrome.tabs.sendMessage(tab.id, { type: 'SENSORY_SHIELD_START' });
    setStatus('已送出中和請求。');
  } catch (err) {
    setStatus(`啟動失敗：${err?.message || '未知錯誤'}`, 'error');
  } finally {
    setLoading(false);
  }
});
