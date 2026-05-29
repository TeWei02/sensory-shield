const neutralizeBtn = document.getElementById('neutralizeBtn');

neutralizeBtn?.addEventListener('click', async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) return;

        // Send message to content script to start neutralization
        await chrome.tabs.sendMessage(tab.id, {
            type: 'SENSORY_SHIELD_START'
        });
    } catch (err) {
        console.error('Failed to send neutralize message:', err);
    }
});

