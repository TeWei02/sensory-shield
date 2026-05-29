/* demo.js — Sensory Shield interactive landing page */

/* ══════════════════════════════════════
   Scroll progress bar
══════════════════════════════════════ */
const progressBar = document.getElementById('progressBar');
window.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  const pct = scrollTop / (scrollHeight - clientHeight) * 100;
  progressBar.style.width = `${pct}%`;
});

/* ══════════════════════════════════════
   Fade-up on scroll (IntersectionObserver)
══════════════════════════════════════ */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

/* ══════════════════════════════════════
   Back-to-top button
══════════════════════════════════════ */
const backTop = document.getElementById('backTop');
window.addEventListener('scroll', () => {
  backTop.classList.toggle('visible', window.scrollY > 400);
});
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ══════════════════════════════════════
   Dark / Light theme toggle
══════════════════════════════════════ */
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('ss-theme') || 'light';
html.dataset.theme = savedTheme;
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
  const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
  html.dataset.theme = next;
  themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('ss-theme', next);
});

/* ══════════════════════════════════════
   Hero browser mockup — animated demo
══════════════════════════════════════ */
const mockupTrigger = document.getElementById('mockupTrigger');
const mockupTriggerText = document.getElementById('mockupTriggerText');
const heroBeforeState = document.getElementById('heroBeforeState');
const heroAfterState = document.getElementById('heroAfterState');

let mockupActive = false;

mockupTrigger.addEventListener('click', () => {
  if (mockupActive) {
    heroAfterState.classList.add('hidden');
    heroBeforeState.classList.remove('hidden');
    mockupTriggerText.textContent = '▶ 模擬啟動感官煞車';
    mockupTrigger.style.background = 'linear-gradient(135deg, var(--brand), var(--brand2))';
    mockupActive = false;
  } else {
    mockupTriggerText.textContent = '⏳ 處理中…';
    mockupTrigger.disabled = true;
    setTimeout(() => {
      heroBeforeState.classList.add('hidden');
      heroAfterState.classList.remove('hidden');
      mockupTriggerText.textContent = '↩ 還原原始頁面';
      mockupTrigger.style.background = 'linear-gradient(135deg, #16a34a, #15803d)';
      mockupTrigger.disabled = false;
      mockupActive = true;
    }, 1200);
  }
});

/* ══════════════════════════════════════
   Animated counters (stats section)
══════════════════════════════════════ */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1200;
  const start = performance.now();
  const step = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * ease);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.stat-num').forEach(animateCounter);
      statsObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });

const statsRow = document.getElementById('stats');
if (statsRow) statsObserver.observe(statsRow);

/* ══════════════════════════════════════
   Demo tabs — calm vs overload
══════════════════════════════════════ */
const demoTabs = document.querySelectorAll('.demo-tab');

demoTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const mode = tab.dataset.mode;
    demoTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.demo-pane').forEach(p => p.classList.remove('active'));
    const pane = document.getElementById(`pane${mode}`);
    if (pane) pane.classList.add('active');
  });
});

/* ══════════════════════════════════════
   Try It Live — in-browser heuristic
══════════════════════════════════════ */
const SENSATIONAL_ZH = [
  /震驚|驚爆|獨家|史上最|破紀錄|必看|瘋傳|爆紅|你不知道|絕對|立即|趕快|快點|不看後悔/g,
  /限時|限量|搶購|搶先|秒殺|超值|划算|便宜|優惠|折扣|免費領取|點擊領取/g,
  /恭喜|獲獎|中獎|大獎|抽獎/g,
];
const SENSATIONAL_EN = [
  /SHOCKING|EXPLOSIVE|BREAKING|MUST.?SEE|WON.T BELIEVE|VIRAL|INCREDIBLE|UNBELIEVABLE|SECRET/gi,
  /CLICK.?NOW|BUY.?NOW|LIMITED.?TIME|EXCLUSIVE|YOU.?NEED.?TO/gi,
];
const PUNC_PATTERNS = [
  /[！!]{2,}/g,
  /[？?]{2,}/g,
  /[…]{2,}/g,
];

const SAMPLE_TEXT = `震驚！科學家發現你絕對不知道的秘密！這是史上最重要的突破！！！
研究人員在實驗室環境中成功合成了一種新型材料，該材料在室溫條件下表現出超導特性。
這項研究由多個大學團隊共同完成，歷時三年。
實驗數據已通過三個獨立實驗室的驗證。
研究人員表示，商業化應用仍需進一步研究，預計需要三至五年時間。
此發現已發表於國際頂尖學術期刊。你不看後悔！！！立即分享給所有人！！！`;

function heuristicProcess(text) {
  let cleaned = text;
  let removedCount = 0;

  const countAndRemove = (pattern) => {
    const matches = cleaned.match(pattern);
    removedCount += matches ? matches.length : 0;
    cleaned = cleaned.replace(pattern, '');
  };

  [...SENSATIONAL_ZH, ...SENSATIONAL_EN, ...PUNC_PATTERNS].forEach(countAndRemove);

  // Normalize whitespace
  cleaned = cleaned.replace(/\s{3,}/g, '\n').trim();

  const sentences = cleaned
    .split(/(?<=[。！？.!?\n])\s*|\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 8);

  return { sentences: sentences.slice(0, 25), removedCount };
}

function renderTlResult(sentences, removedCount) {
  const output = document.getElementById('tlOutput');
  const meta = document.getElementById('tlMeta');
  const sentCount = document.getElementById('tlSentenceCount');
  const remCount = document.getElementById('tlRemovedCount');

  if (sentences.length === 0) {
    output.innerHTML = '<p style="color:var(--muted);padding:16px">無法擷取有效內容，請嘗試更長的文字。</p>';
    meta.hidden = true;
    return;
  }

  const ul = document.createElement('ul');
  sentences.forEach(s => {
    const li = document.createElement('li');
    li.textContent = s;
    ul.appendChild(li);
  });

  output.innerHTML = '';
  const badge = document.createElement('p');
  badge.style.cssText = 'font-size:0.75rem;color:var(--muted);margin-bottom:12px;font-weight:600;';
  badge.textContent = '⚡ 規則式中性化引擎 (離線) — Offline heuristic engine';
  output.appendChild(badge);
  output.appendChild(ul);

  sentCount.textContent = `📋 ${sentences.length} 個重點`;
  remCount.textContent = `🗑️ 移除 ${removedCount} 個煽動詞`;
  meta.hidden = false;
}

function showProcessing() {
  const output = document.getElementById('tlOutput');
  output.innerHTML = `
    <div class="tl-processing">
      <span>🛡️ 處理中</span>
      <div class="tl-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
}

document.getElementById('tlRunBtn').addEventListener('click', () => {
  const text = document.getElementById('tlInput').value.trim();
  if (!text) {
    document.getElementById('tlInput').focus();
    return;
  }
  showProcessing();
  // Small async delay so the processing animation is visible
  setTimeout(() => {
    const { sentences, removedCount } = heuristicProcess(text);
    renderTlResult(sentences, removedCount);
  }, 600);
});

document.getElementById('tlSampleBtn').addEventListener('click', () => {
  document.getElementById('tlInput').value = SAMPLE_TEXT;
});

document.getElementById('tlClearBtn').addEventListener('click', () => {
  document.getElementById('tlInput').value = '';
  const output = document.getElementById('tlOutput');
  output.innerHTML = `
    <div class="tl-placeholder">
      <span>🛡️</span>
      <p>結果將顯示在這裡</p>
    </div>
  `;
  document.getElementById('tlMeta').hidden = true;
});

// Allow Ctrl+Enter to run
document.getElementById('tlInput').addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    document.getElementById('tlRunBtn').click();
  }
});

/* ══════════════════════════════════════
   Runtime selector tabs
══════════════════════════════════════ */
document.querySelectorAll('.runtime-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.runtime-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.runtime-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById(`rt-${tab.dataset.rt}`);
    if (panel) panel.classList.add('active');
  });
});

/* ══════════════════════════════════════
   Before / After slider
══════════════════════════════════════ */
const baContainer = document.getElementById('baContainer');
const baHandle = document.getElementById('baHandle');
const baBefore = baContainer?.querySelector('.ba-before');
const baAfter = baContainer?.querySelector('.ba-after');

if (baContainer && baHandle) {
  let dragging = false;

  function setSliderPos(x) {
    const rect = baContainer.getBoundingClientRect();
    let pct = (x - rect.left) / rect.width * 100;
    pct = Math.max(5, Math.min(95, pct));

    baBefore.style.width = `${pct}%`;
    baAfter.style.width = `${100 - pct}%`;
    baHandle.style.left = `${pct}%`;
    baHandle.setAttribute('aria-valuenow', Math.round(pct));
  }

  baHandle.addEventListener('mousedown', (e) => { dragging = true; e.preventDefault(); });
  baHandle.addEventListener('touchstart', (e) => { dragging = true; e.preventDefault(); }, { passive: false });

  window.addEventListener('mousemove', (e) => { if (dragging) setSliderPos(e.clientX); });
  window.addEventListener('touchmove', (e) => {
    if (dragging) {
      setSliderPos(e.touches[0].clientX);
      e.preventDefault();
    }
  }, { passive: false });

  window.addEventListener('mouseup', () => { dragging = false; });
  window.addEventListener('touchend', () => { dragging = false; });

  // Keyboard accessibility
  baHandle.addEventListener('keydown', (e) => {
    const rect = baContainer.getBoundingClientRect();
    const currentPct = (parseFloat(baHandle.style.left) || 50);
    if (e.key === 'ArrowLeft') setSliderPos(rect.left + (currentPct - 2) / 100 * rect.width);
    if (e.key === 'ArrowRight') setSliderPos(rect.left + (currentPct + 2) / 100 * rect.width);
  });

  // Click anywhere on container to jump
  baContainer.addEventListener('click', (e) => {
    if (!dragging) setSliderPos(e.clientX);
  });
}
