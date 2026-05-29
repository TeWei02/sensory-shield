/**
 * content.js - Sensory Shield content script
 *
 * 1. Hide sensory-stimulating elements (images, videos, ads, animations)
 * 2. Extract main article text
 * 3. Apply neutral page style
 * 4. Send text to background.js for LLM / heuristic processing
 * 5. Render the neutralized result back to the page
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SENSORY_SHIELD_START') {
    handleSensoryShield();
    sendResponse({ status: 'activated' });
    return true;
  }

  if (request.type === 'SENSORY_SHIELD_RESULT') {
    handleNeutralizationResult(request);
    return true;
  }
});

// ─── Orchestration ────────────────────────────────────────────────────────────

async function handleSensoryShield() {
  hideSensoryElements();
  const textContent = extractMainText();
  modifyPageStyle();
  showLoadingState();

  try {
    await chrome.runtime.sendMessage({
      type: 'SENSORY_SHIELD_EXTRACTED_TEXT',
      extractedText: textContent,
    });
  } catch (err) {
    console.error('Sensory Shield: failed to contact background worker.', err);
    removeLoadingState();
    renderError('無法連接背景程序。請重新載入擴充功能。\n(Cannot contact background worker. Try reloading the extension.)');
  }
}

function handleNeutralizationResult(result) {
  removeLoadingState();

  if (!result.ok) {
    renderError(result.error ?? 'Unknown error.');
    return;
  }

  renderNeutralizedContent(result.neutralizedText, result.usedFallback);
}

// ─── DOM manipulation ─────────────────────────────────────────────────────────

function hideSensoryElements() {
  const mediaSelectors = ['img', 'video', 'audio', 'iframe', 'canvas', 'svg'];
  for (const sel of mediaSelectors) {
    document.querySelectorAll(sel).forEach(el => { el.style.display = 'none'; });
  }

  // Hide fixed/sticky overlays (floating ads, cookie banners, etc.)
  document.querySelectorAll('*').forEach(el => {
    const pos = window.getComputedStyle(el).position;
    if (pos === 'fixed' || pos === 'sticky') {
      el.style.display = 'none';
    }
  });

  // Hide common ad / modal / sidebar patterns
  const adSelectors = [
    '[class*="ad-"]', '[class*="-ad"]', '[id*="ad-"]', '[id*="-ad"]',
    '[class*="advertisement"]', '[id*="advertisement"]',
    '[class*="popup"]', '[id*="popup"]',
    '[class*="modal"]', '[id*="modal"]',
    '[class*="overlay"]', '[id*="overlay"]',
    '[class*="banner"]', '[id*="banner"]',
    'aside',
  ];
  for (const sel of adSelectors) {
    try {
      document.querySelectorAll(sel).forEach(el => { el.style.display = 'none'; });
    } catch { /* ignore invalid selector */ }
  }
}

function extractMainText() {
  // Prefer semantic containers; fall back to body text
  for (const sel of ['article', 'main']) {
    const el = document.querySelector(sel);
    const text = el?.innerText?.trim();
    if (text && text.length > 100) return text;
  }

  // Collect all paragraph text
  const paragraphs = [...document.querySelectorAll('p')]
    .map(p => p.innerText?.trim())
    .filter(t => t && t.length > 20);

  if (paragraphs.length > 0) return paragraphs.join('\n');

  return document.body?.innerText?.trim() ?? '';
}

function modifyPageStyle() {
  Object.assign(document.body.style, {
    backgroundColor: '#FAFAFA',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    lineHeight: '1.8',
    color: '#2b2b2b',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  });

  // Kill animations so nothing flickers or distracts
  document.querySelectorAll('*').forEach(el => {
    if (el.style) {
      el.style.animation = 'none';
      el.style.transition = 'none';
    }
  });
}

// ─── Loading / Result rendering ───────────────────────────────────────────────

function showLoadingState() {
  const loader = document.createElement('div');
  loader.id = 'sensory-shield-loader';
  loader.setAttribute('role', 'status');
  loader.setAttribute('aria-live', 'polite');
  Object.assign(loader.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#E7E0D2',
    color: '#2b2b2b',
    padding: '20px 40px',
    borderRadius: '12px',
    fontSize: '16px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    zIndex: '2147483647',
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
  });
  loader.textContent = '🛡️ 處理中… (Processing…)';
  document.body.appendChild(loader);
}

function removeLoadingState() {
  document.getElementById('sensory-shield-loader')?.remove();
}

/**
 * Parse the LLM / heuristic output into proper HTML.
 * Lines starting with "•", "-", or "* " become <li> items.
 * Section headers (non-bullet lines) become <p> labels.
 */
function parseToHtml(text) {
  const lines = text.split('\n');
  const fragments = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (inList) { fragments.push('</ul>'); inList = false; }
      continue;
    }

    const bulletMatch = line.match(/^[•\-\*]\s+(.+)/);
    if (bulletMatch) {
      if (!inList) { fragments.push('<ul>'); inList = true; }
      fragments.push(`<li>${escapeHtml(bulletMatch[1])}</li>`);
    } else {
      if (inList) { fragments.push('</ul>'); inList = false; }
      fragments.push(`<p>${escapeHtml(line)}</p>`);
    }
  }

  if (inList) fragments.push('</ul>');
  return fragments.join('');
}

function renderNeutralizedContent(neutralizedText, usedFallback = false) {
  const container = document.createElement('div');
  container.id = 'sensory-shield-content';
  Object.assign(container.style, {
    background: '#FAFAFA',
    color: '#2b2b2b',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    lineHeight: '1.8',
    fontSize: '16px',
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  });

  const badge = usedFallback
    ? '<p style="font-size:12px;color:#888;margin-bottom:16px;">⚡ 規則式簡化（未設定 API Key）/ Rule-based fallback (no API key set)</p>'
    : '<p style="font-size:12px;color:#888;margin-bottom:16px;">🛡️ Sensory Shield — AI 中立化 / AI Neutralized</p>';

  container.innerHTML = badge + parseToHtml(neutralizedText);

  // Add some clean styling for the generated list
  const style = document.createElement('style');
  style.textContent = `
    #sensory-shield-content ul {
      padding-left: 1.4em;
      margin: 0.5em 0 1em;
    }
    #sensory-shield-content li {
      margin-bottom: 0.4em;
    }
    #sensory-shield-content p {
      margin: 0.6em 0;
    }
  `;
  document.head.appendChild(style);

  document.body.innerHTML = '';
  document.body.style.backgroundColor = '#FAFAFA';
  document.body.appendChild(container);
}

function renderError(errorMessage) {
  const div = document.createElement('div');
  Object.assign(div.style, {
    background: '#fff3f3',
    color: '#7a1a1a',
    border: '1px solid #f5c6c6',
    padding: '20px',
    borderRadius: '10px',
    margin: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '14px',
    lineHeight: '1.6',
    maxWidth: '760px',
  });

  const isApiKeyError = errorMessage.toLowerCase().includes('api key') ||
    errorMessage.toLowerCase().includes('missing') ||
    errorMessage.includes('401') || errorMessage.includes('403');

  const guidance = isApiKeyError
    ? '<br><br>💡 <strong>解決方式：</strong>點擊擴充功能圖示 → ⚙️ 設定，填入 API Key；或留空使用內建規則式簡化。<br>' +
      '<em>Tip: Click the extension icon → ⚙️ Settings, enter your API Key, or leave it blank to use offline rule-based simplification.</em>'
    : '';

  div.innerHTML = `<strong>⚠️ 錯誤 / Error</strong><br>${escapeHtml(errorMessage)}${guidance}`;
  document.body.appendChild(div);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
