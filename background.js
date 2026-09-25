/**
 * Sensory Shield - background service worker (Manifest V3)
 *
 * Two processing paths, selected at runtime:
 *
 *   1) Remote path  - when an API key is stored in chrome.storage.sync, the
 *      extracted page text is rewritten by an OpenAI-compatible chat
 *      completions endpoint.
 *   2) Local path   - when no API key is configured (or the remote call
 *      fails), a deterministic rule-based rewriter runs entirely on-device.
 *      No network access, no key required.
 *
 * Message contract
 *   in : { type: 'SENSORY_SHIELD_EXTRACTED_TEXT', extractedText: string }
 *   out: { type: 'SENSORY_SHIELD_RESULT', ok: boolean, mode: 'remote'|'local',
 *          neutralizedText?: string, note?: string, error?: string }
 *
 * Storage keys (chrome.storage.sync)
 *   openaiApiKey       string  - optional
 *   openaiModel        string  - default 'gpt-4o-mini'
 *   openaiApiBaseUrl   string  - default 'https://api.openai.com'
 *
 * Privacy: the API key stays in chrome.storage.sync. Page text only leaves the
 * browser when the remote path is active, and it goes straight to the endpoint
 * the user configured - there is no intermediary server.
 */

const DEFAULT_CONFIG = {
  openaiApiKey: '',
  openaiModel: 'gpt-4o-mini',
  openaiApiBaseUrl: 'https://api.openai.com',
};

const REQUEST_TIMEOUT_MS = 45000;
const MAX_BULLETS = 5;
const MAX_BULLET_CHARS = 90;
const LONG_SENTENCE_CHARS = 55;

/** Mirrors MAX_INPUT_CHARS in content.js: the per-run page-text cap applied there. */
const MAX_INPUT_CHARS = 8000;

const SYSTEM_PROMPT = [
  '你是一個神經多樣性友善（neurodiversity-friendly）的閱讀助理。',
  '請將使用者提供的網頁文章改寫成客觀、中立的版本：',
  '1) 移除煽動性、情緒化與誇大用語；',
  '2) 將長句拆解為短句；',
  '3) 最後以條列式（- 開頭）輸出 3 到 5 點核心重點。',
  '不要新增原文沒有的資訊，不要加入評論。',
].join('\n');

/* ------------------------------------------------------------------ config */

async function getConfig() {
  let stored = {};
  try {
    stored = (await chrome.storage?.sync?.get(Object.keys(DEFAULT_CONFIG))) || {};
  } catch (err) {
    stored = {};
  }
  return {
    openaiApiKey: String(stored.openaiApiKey ?? DEFAULT_CONFIG.openaiApiKey).trim(),
    openaiModel: String(stored.openaiModel ?? DEFAULT_CONFIG.openaiModel).trim() ||
      DEFAULT_CONFIG.openaiModel,
    openaiApiBaseUrl: String(
      stored.openaiApiBaseUrl ?? DEFAULT_CONFIG.openaiApiBaseUrl
    ).trim() || DEFAULT_CONFIG.openaiApiBaseUrl,
  };
}

/* ----------------------------------------------------------- remote path */

function friendlyHttpError(status, body) {
  if (status === 401 || status === 403) {
    return 'API Key 無效或權限不足，請在擴充功能中重新設定。';
  }
  if (status === 404) {
    return 'API 端點或模型名稱不正確，請檢查 Base URL 與模型設定。';
  }
  if (status === 429) {
    return 'API 請求過於頻繁（429），請稍候再試。';
  }
  const snippet = String(body || '').slice(0, 160);
  return `API 回應錯誤（HTTP ${status}）${snippet ? '：' + snippet : ''}`;
}

async function callLLM({ inputText, model, apiBaseUrl, apiKey }) {
  const base = String(apiBaseUrl || '').replace(/\/+$/, '');
  if (!base) throw new Error('缺少 API Base URL。');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: inputText },
        ],
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error(`API 請求逾時（超過 ${REQUEST_TIMEOUT_MS / 1000} 秒），請稍後再試。`);
    }
    throw new Error('無法連線到 API 端點，請檢查網路連線與 Base URL 設定。');
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(friendlyHttpError(response.status, body));
  }

  const data = await response.json().catch(() => null);
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('API 回應格式不符預期，未取得改寫結果。');
  }
  return content.trim();
}

/* ------------------------------------------------------------ local path */

/** Words/phrases that carry hype or emotional loading in zh-Hant and English. */
const HYPE_PATTERNS = [
  /震驚/g, /驚呆/g, /驚人/g, /嚇壞/g, /太扯/g, /扯爆/g, /必看/g, /必買/g, /瘋傳/g,
  /保證/g, /無敵/g, /神效/g, /零失誤/g,
  /全網/g, /獨家爆料/g, /爆料/g, /怒/g, /氣炸/g, /痛哭/g, /哭哭/g, /跪了/g, /狂/g,
  /神級/g, /史上最[^\s，。]{0,6}/g, /絕對不能錯過/g, /千萬別錯過/g, /你還不看/g,
  /不看會後悔/g, /秒殺/g, /爆紅/g, /炸裂/g,
  /\bshocking\b/gi, /\bunbelievable\b/gi, /\bmust[- ](?:see|read|buy)\b/gi,
  /\binsane\b/gi, /\bcrazy\b/gi, /\bmind[- ]blowing\b/gi, /\bviral\b/gi,
  /\bguaranteed\b/gi, /\bexclusive\b/gi,
];

const INTENSIFIER_PATTERNS = [
  /！+/g, /!+/g, /〜+/g, /～+/g,
];

/** Sentences shorter than this are dropped as rewrite residue. */
const MIN_SENTENCE_CHARS = 4;

function splitSentences(text) {
  return String(text)
    .split(/(?<=[。！？!?；;\n])/)
    .map((s) => s.trim())
    .filter((s) => s && !/^[。，、．,；;：:！!？?\s]+$/.test(s));
}

function shortenSentence(sentence) {
  if (sentence.length <= LONG_SENTENCE_CHARS) return [sentence];
  const parts = sentence
    .split(/(?<=[，,、])/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out = [];
  let buffer = '';
  for (const part of parts) {
    if (buffer && (buffer + part).length > LONG_SENTENCE_CHARS) {
      out.push(buffer);
      buffer = part;
    } else {
      buffer += part;
    }
  }
  if (buffer) out.push(buffer);
  return out.length ? out : [sentence];
}

/**
 * Cleans up punctuation left behind after hype wording is removed, so a line
 * never keeps stray separators ("，，。" or "，！"), a space before a comma, or a
 * leading separator.
 */
function tidy(text) {
  let out = String(text)
    .replace(/[ \t]+/g, ' ')
    .replace(/\s+([,.;:!?，。；：！？、])/g, '$1');
  let previous;
  do {
    previous = out;
    out = out
      .replace(/([，,、；;：:])(?=\s*[。.！!？?])/g, '')
      .replace(/([，,。.！!？?；;：:、])(?:\s*\1)+/g, '$1');
  } while (out !== previous);
  return out.replace(/^[\s，,、．.；;：:！!？?]+/, '').trim();
}

/**
 * Deterministic, offline rewriter: strips hype/emotional wording, shortens long
 * sentences and emits a short bullet summary. Used when no API key is present.
 */
function localNeutralize(inputText) {
  const cleaned = tidy(
    INTENSIFIER_PATTERNS.reduce(
      (acc, pattern) => acc.replace(pattern, '。'),
      HYPE_PATTERNS.reduce((acc, pattern) => acc.replace(pattern, ''), String(inputText))
    )
  );

  const sentences = splitSentences(cleaned);
  const body = [];
  for (const sentence of sentences) {
    if (sentence.length < MIN_SENTENCE_CHARS) continue;
    for (const line of shortenSentence(sentence)) {
      const tidied = tidy(line).replace(/[，,、；;：:]+$/, '');
      if (tidied.length >= MIN_SENTENCE_CHARS) body.push(tidied);
    }
  }

  const bullets = sentences
    .map((s) => tidy(s).replace(/[。，,.；;]+$/, '').trim())
    .filter((s) => s.length >= 8)
    .slice(0, MAX_BULLETS)
    .map((s) => (s.length > MAX_BULLET_CHARS ? s.slice(0, MAX_BULLET_CHARS) + '…' : s));

  const sections = [];
  if (body.length) sections.push(body.join('\n'));
  if (bullets.length) {
    sections.push(bullets.map((b) => `- ${b}`).join('\n'));
  }

  return {
    // `structured` is false when no sentence structure could be used, in which
    // case the cleaned text is passed through unchanged. Both call sites report
    // that in the card note so the output is not mistaken for a rewrite.
    text: sections.join('\n\n') || cleaned,
    structured: sections.length > 0,
  };
}

/* ------------------------------------------------------------- messaging */

async function sendToTab(tabId, payload) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'SENSORY_SHIELD_RESULT', ...payload });
  } catch (err) {
    // The tab may have navigated away or the script may not be injected yet.
  }
}

async function handleMessage(message, sender) {
  const tabId = sender?.tab?.id;
  if (!tabId) return;

  if (message?.type !== 'SENSORY_SHIELD_EXTRACTED_TEXT') return;

  const inputText = String(message?.extractedText ?? '').trim();
  if (!inputText) {
    await sendToTab(tabId, { ok: false, error: '沒有擷取到可處理的頁面文字。' });
    return;
  }

  const wasTruncated = message?.truncated === true;
  const truncatedMsg = wasTruncated
    ? `頁面文字超過 ${MAX_INPUT_CHARS} 字元上限，僅處理前 ${MAX_INPUT_CHARS} 字元。`
    : '';

  const { openaiApiKey, openaiModel, openaiApiBaseUrl } = await getConfig();

  if (!openaiApiKey) {
    const { text, structured } = localNeutralize(inputText);
    await sendToTab(tabId, {
      ok: true,
      mode: 'local',
      neutralizedText: text,
      note:
        '未設定 API Key，已使用本地規則模式（離線、不連網）。' +
        (structured ? '' : '未偵測到句子結構，已保留清理後的原文。') +
        truncatedMsg,
    });
    return;
  }

  try {
    const neutralizedText = await callLLM({
      inputText,
      model: openaiModel,
      apiBaseUrl: openaiApiBaseUrl,
      apiKey: openaiApiKey,
    });
    await sendToTab(tabId, {
      ok: true,
      mode: 'remote',
      neutralizedText,
      note: `由 ${openaiModel} 改寫。頁面文字已傳送至你設定的 API 端點。${truncatedMsg}`,
    });
  } catch (err) {
    // Graceful degradation: fall back to the on-device rewriter instead of failing.
    const { text, structured } = localNeutralize(inputText);
    await sendToTab(tabId, {
      ok: true,
      mode: 'local',
      neutralizedText: text,
      note:
        `遠端 API 無法使用（${err?.message || '未知錯誤'}），已改用本地規則模式。` +
        (structured ? '' : '未偵測到句子結構，已保留清理後的原文。') +
        truncatedMsg,
    });
  }
}

chrome.runtime.onMessage.addListener((message, sender) => {
  handleMessage(message, sender);
});
