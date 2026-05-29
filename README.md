# Sensory Shield

<p align="center">
  <a href="#繁體中文">
    <img alt="中文" src="https://img.shields.io/badge/語言-繁體中文-2563eb?style=for-the-badge" />
  </a>
  <a href="#english">
    <img alt="English" src="https://img.shields.io/badge/language-English-7c3aed?style=for-the-badge" />
  </a>
  <a href="#demo">
    <img alt="Demo" src="https://img.shields.io/badge/demo-live%20preview-f59e0b?style=for-the-badge" />
  </a>
</p>

<p align="center">
  <img alt="Manifest V3" src="https://img.shields.io/badge/Manifest%20V3-Chrome%20%2B%20Edge-0f172a?style=for-the-badge" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-10b981?style=for-the-badge" />
  <img alt="Version" src="https://img.shields.io/badge/version-0.1.0-2563eb?style=for-the-badge" />
</p>

---

## 繁體中文

> 讓網頁更安靜，保留意思，減少噪音。

Sensory Shield 是一個給容易被網頁資訊壓迫的人使用的瀏覽器擴充功能。
它把密集、吵雜、難閱讀的頁面，轉成比較清楚、比較有結構的內容。

### 我希望教授看到什麼

如果這是面試作品，我希望它能證明你有做到這幾件事：

- 找到真實的使用者問題
- 有明確的目標族群
- 做出看得見的 Demo
- 能說清楚架構與取捨
- 不是只有想法，而是真的做出來

### 這個專案的核心

| 面向 | 說明 |
| --- | --- |
| 使用者 | 神經多樣性使用者、閱讀長文的人、想降低刺激的人 |
| 問題 | 情緒化語言、視覺雜訊、資訊過載 |
| 解法 | Neutralize、Simplify、Reduce |
| 呈現 | 有 Demo、有包裝檔、有架構圖、有可切換語言的 README |

### 你可以直接看這些

<p>
  <a href="#demo">
    <img alt="Demo" src="https://img.shields.io/badge/前往-Demo-2563eb?style=for-the-badge" />
  </a>
  <a href="#installation">
    <img alt="Install" src="https://img.shields.io/badge/安裝-說明-7c3aed?style=for-the-badge" />
  </a>
  <a href="#development">
    <img alt="Build" src="https://img.shields.io/badge/開發-指令-10b981?style=for-the-badge" />
  </a>
</p>

### Demo

你可以打開這個頁面看互動效果：

<p>
  <a href="index.html">
    <img alt="Open demo" src="https://img.shields.io/badge/開啟-互動式Demo-f59e0b?style=for-the-badge" />
  </a>
  <a href="assets/overview.svg">
    <img alt="Overview" src="https://img.shields.io/badge/查看-架構圖-0f172a?style=for-the-badge" />
  </a>
</p>

<details open>
<summary><strong>Demo 會展示什麼</strong></summary>

| 狀態 | 意義 |
| --- | --- |
| Calm | 低刺激、易閱讀、較少干擾 |
| Overload | 高對比、較多雜訊、模擬壓迫感 |
| Reset | 回到預設狀態 |

</details>

### 技術故事

這個專案不是單純做一個擴充功能，而是把一個抽象的可及性問題，做成一個能被理解、能被展示的產品。

<details open>
<summary><strong>Runtime 模式</strong></summary>

| 模式 | 用途 |
| --- | --- |
| Remote LLM | 使用 OpenAI 相容 API 做雲端重寫 |
| Local runtime | 使用本機模型，適合隱私或離線場景 |
| Heuristic fallback | 沒有模型時仍可維持基本可用性 |

</details>

<details>
<summary><strong>為什麼這樣設計</strong></summary>

- UI 不會因為模型不可用而壞掉
- Demo 與內容轉換邏輯分開
- 可以在沒有雲端帳號的情況下測試
- 為未來 agent / multi-model 延伸保留空間

</details>

### 安裝

<a id="installation"></a>

1. Clone 這個 repo
2. 打開 Chrome 或 Edge
3. 前往 extensions 頁面
4. 開啟 developer mode
5. 選 **Load unpacked**，選這個資料夾

> 這個專案的產物是擴充功能套件，不是桌面 App。

### 開發

<a id="development"></a>

```bash
npm install
npm run build
npm run dist
npm run pack:dmg
npm run pack:exe
npm run pack:linux
```

### 專案結構

<details>
<summary><strong>展開檢視</strong></summary>

```text
.
├── background.js        # Service worker and runtime routing
├── content.js           # Page transformation and demo behavior
├── demo.js              # Public landing page interactions
├── index.html           # Visual public homepage / demo page
├── manifest.json        # Extension manifest
├── popup.html           # Extension popup UI
├── popup.js             # Popup interactions
├── popup.css            # Popup styling
├── styles.css           # Public site styling
└── scripts/
    ├── build.js         # Build extension package
    ├── pack-dmg.js      # macOS bundle builder
    ├── pack-exe.js      # Windows bundle builder
    └── pack-linux.js    # Linux bundle builder
```

</details>

### 參考資料

- [Chrome Extensions Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Microsoft Edge Extension docs](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI accessibility tutorials](https://www.w3.org/WAI/tutorials/)
- [Microsoft Inclusive Design](https://inclusive.microsoft.design/)

### 常見問題

<details>
<summary><strong>這是桌面 App 嗎？</strong></summary>

不是，是瀏覽器擴充功能。

</details>

<details>
<summary><strong>一定要 API key 嗎？</strong></summary>

不一定，Demo 也能看，還有 fallback 路徑可以維持基本可用。

</details>

---

## English

> Calm the web. Keep the meaning. Reduce the noise.

Sensory Shield is a browser extension for people who feel overwhelmed by dense web pages.
It turns noisy content into calmer, easier-to-scan output.

### What I would want to see in an interview

- A real user problem
- A clear target audience
- A visible demo
- A explainable architecture
- Something actually shipped

### What this project is about

| Area | Description |
| --- | --- |
| Users | Neurodiverse readers, long-form readers, people who want less stimulation |
| Problem | Sensational language, clutter, information overload |
| Approach | Neutralize, Simplify, Reduce |
| Proof | Demo, packaged builds, architecture diagram, language-switchable README |

### Quick links

<p>
  <a href="#demo">
    <img alt="Demo" src="https://img.shields.io/badge/go-to-Demo-2563eb?style=for-the-badge" />
  </a>
  <a href="#installation">
    <img alt="Install" src="https://img.shields.io/badge/Installation-steps-7c3aed?style=for-the-badge" />
  </a>
  <a href="#development">
    <img alt="Build" src="https://img.shields.io/badge/Development-commands-10b981?style=for-the-badge" />
  </a>
</p>

### Demo

Open the visual landing page and switch between calm and overload:

<p>
  <a href="index.html">
    <img alt="Open demo" src="https://img.shields.io/badge/Open-Interactive%20Demo-f59e0b?style=for-the-badge" />
  </a>
  <a href="assets/overview.svg">
    <img alt="Overview" src="https://img.shields.io/badge/View-Architecture%20Overview-0f172a?style=for-the-badge" />
  </a>
</p>

<details open>
<summary><strong>What the demo shows</strong></summary>

| State | Meaning |
| --- | --- |
| Calm | Cleaner typography, fewer distractions |
| Overload | Stronger contrast, more noise, more stimulation |
| Reset | Back to the default neutral state |

</details>

### Technical story

Sensory Shield is not only a UI demo.
It is a browser extension with a service worker, content script, popup UI, and packaging pipeline.

<details open>
<summary><strong>Runtime modes</strong></summary>

| Mode | Purpose |
| --- | --- |
| Remote LLM | OpenAI-compatible cloud rewriting |
| Local runtime | Localhost model usage for privacy or offline demos |
| Heuristic fallback | Rule-based fallback when no model is available |

</details>

<details>
<summary><strong>Why this architecture is useful</strong></summary>

- The UI still works if a model is unavailable
- Demo presentation is separated from transformation logic
- Local testing does not require a cloud account
- The architecture leaves room for future agent or multi-model workflows

</details>

### Installation

1. Clone this repository
2. Open Chrome or Edge
3. Go to the extensions page
4. Enable developer mode
5. Choose **Load unpacked** and select this folder

> This project ships extension bundles, not a desktop app.

### Development

```bash
npm install
npm run build
npm run dist
npm run pack:dmg
npm run pack:exe
npm run pack:linux
```

### Project layout

<details>
<summary><strong>Expand</strong></summary>

```text
.
├── background.js        # Service worker and runtime routing
├── content.js           # Page transformation and demo behavior
├── demo.js              # Public landing page interactions
├── index.html           # Visual public homepage / demo page
├── manifest.json        # Extension manifest
├── popup.html           # Extension popup UI
├── popup.js             # Popup interactions
├── popup.css            # Popup styling
├── styles.css           # Public site styling
└── scripts/
    ├── build.js         # Build extension package
    ├── pack-dmg.js      # macOS bundle builder
    ├── pack-exe.js      # Windows bundle builder
    └── pack-linux.js    # Linux bundle builder
```

</details>

### References

- [Chrome Extensions Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Microsoft Edge Extension docs](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI accessibility tutorials](https://www.w3.org/WAI/tutorials/)
- [Microsoft Inclusive Design](https://inclusive.microsoft.design/)

### FAQ

<details>
<summary><strong>Is this a desktop app?</strong></summary>

No. It is a browser extension with packaged installs for different platforms.

</details>

<details>
<summary><strong>Do I need an API key?</strong></summary>

Not for the demo. The extension has fallback paths, so it remains usable in local and offline-friendly setups.

</details>

---

## License

MIT © 2024 Sensory Shield Team
