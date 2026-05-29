/**
 * content.js - Sensory Shield content script
 * 
 * Handles:
 * 1. Hide sensory stimulating elements (images, videos, ads)
 * 2. Extract main text content
 * 3. Modify page style for neutral reading experience
 * 4. Send extracted text to background.js for LLM processing
 * 5. Listen for neutralized text and render it back to page
 */

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SENSORY_SHIELD_START") {
    handleSensoryShield();
    sendResponse({ status: "Sensory Shield activated" });
    return true;
  }

  // Listen for neutralized text from background.js
  if (request.type === "SENSORY_SHIELD_RESULT") {
    handleNeutralizationResult(request);
    return true;
  }
});

async function handleSensoryShield() {
  // 1. Hide sensory stimulating elements
  hideSensoryElements();

  // 2. Extract main text content
  const textContent = extractMainText();

  // 3. Modify page style for reduced sensory input
  modifyPageStyle();

  // 4. Show loading state
  showLoadingState();

  // 5. Send extracted text to background for LLM processing
  try {
    chrome.runtime.sendMessage({
      type: "SENSORY_SHIELD_EXTRACTED_TEXT",
      extractedText: textContent
    });
  } catch (err) {
    console.error("Failed to send text to background:", err);
    removeLoadingState();
  }
}

function handleNeutralizationResult(result) {
  removeLoadingState();

  if (!result.ok) {
    console.error("Neutralization failed:", result.error);
    renderError(result.error || "Unknown error");
    return;
  }

  // Replace page content with neutralized text
  renderNeutralizedContent(result.neutralizedText);
}

function hideSensoryElements() {
  // Hide images, videos, audio, iframes
  const selectors = ['img', 'video', 'audio', 'iframe'];
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.style.display = 'none';
    });
  });

  // Hide fixed/sticky positioned elements (common for floating ads)
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.position === 'fixed' || style.position === 'sticky') {
      el.style.display = 'none';
    }
  });

  // Hide common ad/popup elements
  const adSelectors = [
    '[class*="ad"]',
    '[id*="ad"]',
    '[class*="popup"]',
    '[id*="popup"]',
    '[class*="modal"]',
    'aside'
  ];
  adSelectors.forEach(selector => {
    try {
      document.querySelectorAll(selector).forEach(el => {
        el.style.display = 'none';
      });
    } catch (e) {
      // Invalid selector
    }
  });
}

function extractMainText() {
  // Prioritize article, main, then p tags
  const mainSelectors = ['article', 'main', 'p'];

  for (const selector of mainSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      let text = '';
      elements.forEach(el => {
        text += el.innerText + '\n';
      });
      if (text.trim()) {
        return text.trim();
      }
    }
  }

  // Fallback to body text
  return (document.body?.innerText || '').trim().slice(0, 8000);
}

function modifyPageStyle() {
  // Apply neutral, accessible styling
  document.body.style.backgroundColor = '#FAFAFA';
  document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  document.body.style.lineHeight = '1.8';
  document.body.style.color = '#2b2b2b';
  document.body.style.maxWidth = '800px';
  document.body.style.margin = '0 auto';
  document.body.style.padding = '20px';

  // Remove excess styling that might be sensory overload
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    if (el.style) {
      el.style.animation = 'none';
      el.style.transition = 'none';
    }
  });
}

function showLoadingState() {
  removeLoadingState();
  const loader = document.createElement('div');
  loader.id = 'sensory-shield-loader';
  loader.textContent = '處理中...';
  loader.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #E7E0D2;
    padding: 20px 40px;
    border-radius: 8px;
    font-size: 16px;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;
  document.body.appendChild(loader);
}

function removeLoadingState() {
  const loader = document.getElementById('sensory-shield-loader');
  if (loader) {
    loader.remove();
  }
}

function renderNeutralizedContent(neutralizedText) {
  const existing = document.getElementById('sensory-shield-result');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'sensory-shield-result';
  container.style.cssText = `
    background: #fff;
    color: #2b2b2b;
    font-family: system-ui, -apple-system, sans-serif;
    line-height: 1.7;
    padding: 20px;
    max-width: 800px;
    margin: 12px auto;
    border: 1px solid #e2e2e2;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  `;

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
    container.appendChild(paragraph);
  }

  if (bulletItems.length) {
    const ul = document.createElement('ul');
    for (const itemText of bulletItems) {
      const li = document.createElement('li');
      li.textContent = itemText;
      ul.appendChild(li);
    }
    container.appendChild(ul);
  }

  if (!plainLines.length && !bulletItems.length) {
    const paragraph = document.createElement('p');
    paragraph.textContent = String(neutralizedText || '');
    container.appendChild(paragraph);
  }

  document.body.insertBefore(container, document.body.firstChild);
}

function renderError(errorMessage) {
  const existing = document.getElementById('sensory-shield-error');
  if (existing) existing.remove();

  const errorDiv = document.createElement('div');
  errorDiv.id = 'sensory-shield-error';
  errorDiv.style.cssText = `
    background: #ffe6e6;
    color: #d32f2f;
    padding: 12px 16px;
    border-radius: 8px;
    margin: 12px;
    font-family: system-ui, -apple-system, sans-serif;
    border: 1px solid #f5bcbc;
  `;
  errorDiv.innerHTML = `<strong>錯誤:</strong> ${escapeHtml(errorMessage)}`;
  document.body.insertBefore(errorDiv, document.body.firstChild);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
