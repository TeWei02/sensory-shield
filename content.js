/**
 * content.js - Sensory Shield content script
 *
 * 1. Applies a low-stimulation reading style to the page.
 * 2. Hides media and advertising/popup containers (conservative, token-matched
 *    selectors so that ordinary layout elements are not destroyed).
 * 3. Extracts the main text and hands it to background.js.
 * 4. Renders the returned neutral version as a card at the top of the page.
 */

const MAX_INPUT_CHARS = 8000;
const MEDIA_SELECTORS = ['img', 'picture', 'video', 'audio', 'iframe', 'canvas'];
const STYLE_ID = 'sensory-shield-style';
const RESULT_ID = 'sensory-shield-result';
const ERROR_ID = 'sensory-shield-error';
const LOADER_ID = 'sensory-shield-loader';

/**
 * Class/id fragments that reliably indicate ads, popups or overlays.
 * Matched per token (camelCase, kebab-case and snake_case are split first) so
 * that words such as "download", "header", "gradient" or "loading" are never
 * mistaken for ads.
 */
const NOISE_TOKENS = new Set([
  'ad',
  'ads',
  'adbox',
  'advert',
  'adverts',
  'advertisement',
  'adsense',
  'adslot',
  'adunit',
  'adsbygoogle',
  'sponsor',
  'sponsored',
  'promo',
  'banner',
  'popup',
  'modal',
  'overlay',
  'lightbox',
  'interstitial',
  'paywall',
  'socialshare',
  'sharebar',
  'stickyad',
]);

function tokenize(value) {
  return String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((token) => token.toLowerCase());
}

function isNoiseElement(element) {
  const tokens = [
    ...tokenize(element.className),
    ...tokenize(element.id),
    ...tokenize(element.getAttribute && element.getAttribute('data-testid')),
  ];
  return tokens.some((token) => NOISE_TOKENS.has(token));
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SENSORY_SHIELD_START') {
    handleSensoryShield();
    sendResponse({ status: 'Sensory Shield activated' });
    return true;
  }

  if (request.type === 'SENSORY_SHIELD_RESULT') {
    handleNeutralizationResult(request);
    return true;
  }

  return undefined;
});

function handleSensoryShield() {
  hideSensoryElements();
  modifyPageStyle();

  const extracted = extractMainText();
  if (!extracted) {
    renderError('沒有擷取到可處理的頁面文字。');
    return;
  }

  showLoadingState();

  try {
    chrome.runtime.sendMessage({
      type: 'SENSORY_SHIELD_EXTRACTED_TEXT',
      extractedText: extracted.text,
    });
  } catch (err) {
    removeLoadingState();
    renderError('無法與擴充功能背景程序通訊，請重新載入頁面後再試。');
  }
}

function handleNeutralizationResult(result) {
  removeLoadingState();

  if (!result || !result.ok) {
    renderError(result && result.error ? result.error : '處理失敗，請稍後再試。');
    return;
  }

  renderNeutralizedContent(result.neutralizedText, result.mode, result.note);
}

/* --------------------------------------------------------------- styling */

function hideSensoryElements() {
  const mediaSelector = MEDIA_SELECTORS.join(',');
  const nodes = document.querySelectorAll(`${mediaSelector}, [class], [id]`);
  nodes.forEach((element) => {
    const isMedia = element.matches(mediaSelector);
    if (isMedia || isNoiseElement(element)) {
      element.style.setProperty('display', 'none', 'important');
    }
  });
}

function modifyPageStyle() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    html {
      background: #FAFAFA !important;
    }
    body {
      background: #FAFAFA !important;
      color: #2b2b2b !important;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans TC", sans-serif !important;
      line-height: 1.8 !important;
      max-width: 800px !important;
      margin: 0 auto !important;
      padding: 20px !important;
    }
    body * {
      animation: none !important;
      transition: none !important;
      text-shadow: none !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

/* -------------------------------------------------------------- extraction */

function readText(node) {
  return (node.innerText || '').replace(/\s+\n/g, '\n').trim();
}

function extractMainText() {
  const primary = ['article', 'main', '[role="main"]'];
  for (const selector of primary) {
    const nodes = document.querySelectorAll(selector);
    if (!nodes.length) continue;
    const text = Array.from(nodes).map(readText).filter(Boolean).join('\n\n').trim();
    if (text.length > 40) {
      return truncate(text);
    }
  }

  const paragraphs = Array.from(document.querySelectorAll('p'))
    .map(readText)
    .filter((text) => text.length > 0);
  const joined = paragraphs.join('\n\n').trim();
  if (joined) return truncate(joined);

  const fallback = readText(document.body || document.documentElement);
  return fallback ? truncate(fallback) : null;
}

function truncate(text) {
  const trimmed = String(text).trim();
  if (trimmed.length <= MAX_INPUT_CHARS) {
    return { text: trimmed, truncated: false };
  }
  return { text: trimmed.slice(0, MAX_INPUT_CHARS), truncated: true };
}

/* --------------------------------------------------------------- rendering */

function showLoadingState() {
  removeLoadingState();
  const loader = document.createElement('div');
  loader.id = LOADER_ID;
  loader.textContent = '處理中…';
  loader.style.cssText = [
    'position:fixed',
    'top:50%',
    'left:50%',
    'transform:translate(-50%,-50%)',
    'background:#E7E0D2',
    'color:#2b2b2b',
    'padding:18px 36px',
    'border-radius:10px',
    'font:600 15px/1.4 system-ui,-apple-system,sans-serif',
    'z-index:2147483647',
    'box-shadow:0 6px 18px rgba(0,0,0,0.15)',
  ].join(';');
  (document.body || document.documentElement).appendChild(loader);
}

function removeLoadingState() {
  const loader = document.getElementById(LOADER_ID);
  if (loader) loader.remove();
}

function buildCardHeader(mode, note) {
  const header = document.createElement('div');
  header.style.cssText =
    'display:flex;align-items:center;justify-content:space-between;gap:12px;' +
    'padding-bottom:10px;margin-bottom:12px;border-bottom:1px solid #ececec';

  const title = document.createElement('div');
  title.textContent = mode === 'remote' ? 'Sensory Shield · 雲端改寫' : 'Sensory Shield · 本地規則模式';
  title.style.cssText = 'font-weight:700;font-size:14px;color:#2b7a78';

  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = '關閉';
  close.style.cssText =
    'border:1px solid #ddd;background:#fafafa;color:#2b2b2b;border-radius:8px;' +
    'padding:4px 10px;font:600 12px/1.2 system-ui,-apple-system,sans-serif;cursor:pointer';
  close.addEventListener('click', () => {
    const card = document.getElementById(RESULT_ID);
    if (card) card.remove();
  });

  header.appendChild(title);
  header.appendChild(close);

  if (note) {
    const noteLine = document.createElement('p');
    noteLine.textContent = note;
    noteLine.style.cssText = 'margin:0 0 12px;font-size:12px;line-height:1.6;color:#6b6b6b';
    const wrapper = document.createElement('div');
    wrapper.appendChild(header);
    wrapper.appendChild(noteLine);
    return wrapper;
  }

  return header;
}

function renderNeutralizedContent(neutralizedText, mode, note) {
  const existing = document.getElementById(RESULT_ID);
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = RESULT_ID;
  container.style.cssText = [
    'background:#fff',
    'color:#2b2b2b',
    'font-family:system-ui,-apple-system,"Noto Sans TC",sans-serif',
    'font-size:16px',
    'line-height:1.7',
    'padding:20px',
    'max-width:800px',
    'margin:12px auto',
    'border:1px solid #e2e2e2',
    'border-radius:10px',
    'box-shadow:0 2px 8px rgba(0,0,0,0.06)',
  ].join(';');

  container.appendChild(buildCardHeader(mode, note));

  const lines = String(neutralizedText || '').split('\n');
  const bulletItems = [];
  const plainLines = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const bulletMatch = line.match(/^(?:[-*•]\s*|\d+\.\s+)(.+)$/);
    if (bulletMatch) {
      bulletItems.push(bulletMatch[1]);
    } else if (line) {
      plainLines.push(line);
    }
  }

  if (plainLines.length) {
    const paragraph = document.createElement('p');
    paragraph.textContent = plainLines.join('\n');
    paragraph.style.whiteSpace = 'pre-wrap';
    paragraph.style.margin = '0 0 12px';
    container.appendChild(paragraph);
  }

  if (bulletItems.length) {
    const list = document.createElement('ul');
    list.style.margin = '0';
    list.style.paddingLeft = '20px';
    for (const itemText of bulletItems) {
      const item = document.createElement('li');
      item.textContent = itemText;
      list.appendChild(item);
    }
    container.appendChild(list);
  }

  if (!plainLines.length && !bulletItems.length) {
    const paragraph = document.createElement('p');
    paragraph.textContent = String(neutralizedText || '');
    container.appendChild(paragraph);
  }

  (document.body || document.documentElement).insertBefore(
    container,
    (document.body || document.documentElement).firstChild
  );
}

function renderError(errorMessage) {
  const existing = document.getElementById(ERROR_ID);
  if (existing) existing.remove();

  const errorDiv = document.createElement('div');
  errorDiv.id = ERROR_ID;
  errorDiv.style.cssText = [
    'background:#ffe6e6',
    'color:#d32f2f',
    'padding:12px 16px',
    'border-radius:8px',
    'margin:12px',
    'font:14px/1.6 system-ui,-apple-system,"Noto Sans TC",sans-serif',
    'border:1px solid #f5bcbc',
  ].join(';');

  const strong = document.createElement('strong');
  strong.textContent = 'Sensory Shield：';
  errorDiv.appendChild(strong);
  errorDiv.appendChild(document.createTextNode(String(errorMessage || '未知錯誤')));
  (document.body || document.documentElement).insertBefore(
    errorDiv,
    (document.body || document.documentElement).firstChild
  );
}
