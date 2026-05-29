/**
 * Sensory Shield - background service worker (Manifest V3)
 *
 * Flow:
 * 1. Receive extracted article text from content.js
 * 2. If API key present → call LLM, else → heuristic fallback
 * 3. Return neutralized text back to content.js
 *
 * Messaging:
 * - Listens for: { type: 'SENSORY_SHIELD_EXTRACTED_TEXT', extractedText: string }
 * - Sends:       { type: 'SENSORY_SHIELD_RESULT', ok: boolean, neutralizedText?, error? }
 *
 * Storage keys (chrome.storage.sync):
 * - openaiApiKey       — required for LLM mode
 * - openaiModel        — default: gpt-4o-mini
 * - openaiApiBaseUrl   — default: https://api.openai.com
 */

const SYSTEM_PROMPT =
  '你是一個神經多樣性友善的閱讀助理。請將以下文章改寫為客觀、中立的語氣，' +
  '消除煽動性或強烈情緒化的字眼，並將長句拆解為短句，最後以條列式(Bullet points)輸出核心重點。';

const LLM_TIMEOUT_MS = 30_000;

// ─── Config ──────────────────────────────────────────────────────────────────

async function getApiConfig() {
  const stored = await chrome.storage.sync.get([
    'openaiApiKey',
    'openaiModel',
    'openaiApiBaseUrl',
  ]);
  return {
    openaiApiKey: stored.openaiApiKey ?? '',
    openaiModel: stored.openaiModel || 'gpt-4o-mini',
    openaiApiBaseUrl: stored.openaiApiBaseUrl || 'https://api.openai.com',
  };
}

// ─── LLM call ────────────────────────────────────────────────────────────────

async function callLLM({ inputText, model, apiBaseUrl, apiKey }) {
  const base = String(apiBaseUrl).replace(/\/+$/, '');
  const url = `${base}/v1/chat/completions`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: inputText },
        ],
        temperature: 0.4,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`LLM ${res.status} ${res.statusText} ${text}`.trim());
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error('LLM response missing expected content.');
    }
    return content.trim();
  } finally {
    clearTimeout(timer);
  }
}

// ─── Heuristic fallback ───────────────────────────────────────────────────────

const SENSATIONAL_PATTERNS = [
  /震驚|驚爆|獨家|史上最|破紀錄|你不知道的|必看|瘋傳|爆紅/g,
  /SHOCKING|EXPLOSIVE|BREAKING|MUST.?SEE|YOU WON'T BELIEVE|VIRAL|INCREDIBLE|UNBELIEVABLE/gi,
  /[！!]{2,}/g,
  /[？?]{2,}/g,
];

function heuristicNeutralize(text) {
  let cleaned = text;

  for (const pattern of SENSATIONAL_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Split into sentences, trim, deduplicate blanks
  const sentences = cleaned
    .split(/(?<=[。！？.!?])\s*|\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);

  // Keep up to 20 sentences; each becomes a bullet
  const bullets = sentences.slice(0, 20).map(s => `• ${s}`);

  if (bullets.length === 0) {
    return '（無法擷取有效內容）\n(No extractable content found.)';
  }

  return '【規則式簡化 / Rule-based summary】\n\n' + bullets.join('\n');
}

// ─── Message handler ──────────────────────────────────────────────────────────

async function handleMessage(message, sender) {
  const tabId = sender?.tab?.id;
  if (!tabId) return;

  const type = message?.type;
  if (
    type !== 'SENSORY_SHIELD_EXTRACTED_TEXT' &&
    type !== 'NEUTRALIZE_PAGE' &&
    type !== 'SENSORY_SHIELD_NEUTRALIZE_REQUEST'
  ) return;

  const inputText = String(
    message?.extractedText ?? message?.text ?? message?.articleText ?? ''
  ).trim();

  if (!inputText) {
    chrome.tabs.sendMessage(tabId, {
      type: 'SENSORY_SHIELD_RESULT',
      ok: false,
      error: '無法擷取頁面文字。(No text could be extracted from this page.)',
    });
    return;
  }

  try {
    const { openaiApiKey, openaiModel, openaiApiBaseUrl } = await getApiConfig();

    // No API key → use heuristic fallback
    if (!openaiApiKey) {
      const neutralizedText = heuristicNeutralize(inputText);
      chrome.tabs.sendMessage(tabId, {
        type: 'SENSORY_SHIELD_RESULT',
        ok: true,
        neutralizedText,
        usedFallback: true,
      }).catch(e => console.warn('Failed to send message to tab:', e));
      return;
    }

    const neutralizedText = await callLLM({
      inputText,
      model: openaiModel,
      apiBaseUrl: openaiApiBaseUrl,
      apiKey: openaiApiKey,
    });

    chrome.tabs.sendMessage(tabId, {
      type: 'SENSORY_SHIELD_RESULT',
      ok: true,
      neutralizedText,
    }).catch(e => console.warn('Failed to send message to tab:', e));
  } catch (err) {
    const isTimeout = err?.name === 'AbortError';
    const errorMsg = isTimeout
      ? 'API 請求逾時（30 秒）。請檢查網路連線或改用本地模型。\n(Request timed out after 30 s. Check your connection or use a local model.)'
      : err?.message ?? 'Unknown error.';

    chrome.tabs.sendMessage(tabId, {
      type: 'SENSORY_SHIELD_RESULT',
      ok: false,
      error: errorMsg,
    }).catch(e => console.warn('Failed to send error message to tab:', e));
  }
}

chrome.runtime.onMessage.addListener((message, sender) => {
  handleMessage(message, sender);
});
