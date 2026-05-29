/**
 * Sensory Shield - background service worker (Manifest V3)
 *
 * Responsibilities:
 * 1) Receive extracted article text from content.js
 * 2) Call an LLM API asynchronously to "neutralize" the text using a System Prompt
 * 3) Send the cleaned text back to content.js for graceful rendering
 *
 * Messaging:
 * - Expects content.js to send:
 *   { type: 'SENSORY_SHIELD_EXTRACTED_TEXT', extractedText: string }
 *
 * - Sends result back to content.js:
 *   { type: 'SENSORY_SHIELD_RESULT', ok: boolean, neutralizedText?: string, error?: string }
 *
 * Configuration:
 * - Reads from chrome.storage.sync:
 *   - openaiApiKey
 *   - openaiModel (default: gpt-4o-mini)
 *   - openaiApiBaseUrl (default: https://api.openai.com)
 *
 * Note:
 * - For security, API key should NOT be hardcoded into the extension UI code.
 * - This background script runs server-side-ish in extension context but still uses browser-side fetch.
 *   Use with caution for production; ideal is to proxy via your own server.
 */

const SYSTEM_PROMPT =
  '你是一個神經多樣性友善的閱讀助理。請將以下文章改寫為客觀、中立的語氣，消除煽動性或強烈情緒化的字眼，並將長句拆解為短句，最後以條列式(Bullet points)輸出核心重點。';

/**
 * Read API config from chrome.storage.sync
 */
async function getApiConfig() {
  const defaults = {
    openaiApiKey: '',
    openaiModel: 'gpt-4o-mini',
    openaiApiBaseUrl: 'https://api.openai.com',
  };

  const stored = await chrome.storage?.sync?.get(Object.keys(defaults));
  return {
    openaiApiKey: stored?.openaiApiKey ?? defaults.openaiApiKey,
    openaiModel: stored?.openaiModel ?? defaults.openaiModel,
    openaiApiBaseUrl: stored?.openaiApiBaseUrl ?? defaults.openaiApiBaseUrl,
  };
}

/**
 * Call an OpenAI-compatible Chat Completions endpoint.
 * This function is async and fully contains API call logic.
 */
async function callLLM({ inputText, model, apiBaseUrl, apiKey }) {
  const base = String(apiBaseUrl || '').replace(/\/+$/, '');
  if (!base) throw new Error('Missing LLM apiBaseUrl.');

  const url = `${base}/v1/chat/completions`;

  const payload = {
    model: model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: inputText },
    ],
    temperature: 0.4,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `LLM request failed: ${res.status} ${res.statusText} ${text}`.trim()
    );
  }

  const data = await res.json();

  // Expected OpenAI-compatible response:
  // data.choices[0].message.content
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('LLM response missing expected content.');
  }

  return content.trim();
}

/**
 * Handle messages from content.js.
 */
async function handleMessage(message, sender) {
  const tabId = sender?.tab?.id;
  try {
    if (!tabId) return;

    const sendResult = async (payload) =>
      chrome.tabs.sendMessage(tabId, {
        type: 'SENSORY_SHIELD_RESULT',
        ...payload,
      });

    // Support multiple possible message type names for flexibility.
    const type = message?.type;

    const isExtractedTextMessage =
      type === 'SENSORY_SHIELD_EXTRACTED_TEXT' ||
      type === 'NEUTRALIZE_PAGE' ||
      type === 'SENSORY_SHIELD_NEUTRALIZE_REQUEST';

    if (!isExtractedTextMessage) return;

    const extractedText =
      message?.extractedText ??
      message?.text ??
      message?.articleText ??
      '';

    const inputText = String(extractedText || '').trim();

    if (!inputText) {
      await sendResult({
        ok: false,
        error: 'Empty input text.',
      });
      return;
    }

    const { openaiApiKey, openaiModel, openaiApiBaseUrl } =
      await getApiConfig();

    if (!openaiApiKey) {
      await sendResult({
        ok: false,
        error:
          'Missing API key. Please set chrome.storage.sync.openaiApiKey and optionally openaiModel/openaiApiBaseUrl.',
      });
      return;
    }

    const neutralizedText = await callLLM({
      inputText,
      model: openaiModel,
      apiBaseUrl: openaiApiBaseUrl,
      apiKey: openaiApiKey,
    });

    await sendResult({
      ok: true,
      neutralizedText,
    });
  } catch (err) {
    if (!tabId) return;
    await chrome.tabs.sendMessage(tabId, {
      type: 'SENSORY_SHIELD_RESULT',
      ok: false,
      error: err?.message ? String(err.message) : 'Unknown error.',
    });
  }
}

/**
 * MV3: receive messages.
 */
chrome.runtime.onMessage.addListener((message, sender) => {
  // Fire and forget; no need to return a promise unless you want keep-alive semantics.
  handleMessage(message, sender);
});
