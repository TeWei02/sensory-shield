const STORAGE_KEYS = ['openaiApiKey', 'openaiModel', 'openaiApiBaseUrl'];

let saveTimeout;

async function loadSettings() {
    const stored = await chrome.storage.sync.get(STORAGE_KEYS);
    document.getElementById('apiKey').value = stored.openaiApiKey ?? '';
    document.getElementById('modelName').value = stored.openaiModel ?? '';
    document.getElementById('baseUrl').value = stored.openaiApiBaseUrl ?? '';
}

async function saveSettings() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const model = document.getElementById('modelName').value.trim();
    const baseUrl = document.getElementById('baseUrl').value.trim();

    await chrome.storage.sync.set({
        openaiApiKey: apiKey,
        openaiModel: model || 'gpt-4o-mini',
        openaiApiBaseUrl: baseUrl || 'https://api.openai.com',
    });

    const status = document.getElementById('saveStatus');
    status.textContent = '已儲存 ✓';
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => { status.textContent = ''; }, 2000);
}

document.getElementById('neutralizeBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    try {
        await chrome.tabs.sendMessage(tab.id, { type: 'SENSORY_SHIELD_START' });
        window.close();
    } catch (err) {
        console.error('Failed to send neutralize message:', err);
    }
});

document.getElementById('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveSettings();
});

loadSettings();
