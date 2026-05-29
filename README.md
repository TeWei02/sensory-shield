<div align="center">

# 🛡️ Sensory Shield

**Calm the web. Keep the meaning. Reduce the noise.**
**平靜網頁，保留意義，減少雜訊。**

[![Version](https://img.shields.io/badge/version-0.1.0-2563eb?style=for-the-badge)](package.json)
[![Manifest V3](https://img.shields.io/badge/manifest-V3-7c3aed?style=for-the-badge)](manifest.json)
[![Platform](https://img.shields.io/badge/platform-Chrome%20%2B%20Edge-0f172a?style=for-the-badge)](manifest.json)
[![License](https://img.shields.io/badge/license-MIT-10b981?style=for-the-badge)](package.json)
[![Demo](https://img.shields.io/badge/demo-live%20preview-f59e0b?style=for-the-badge)](index.html)

![Sensory Shield overview](assets/overview.svg)

</div>

---

## 🌐 Language / 語言

- [English](#-overview)
- [繁體中文](#-專案概述)

---

## 📖 Overview

**Sensory Shield** is a Manifest V3 browser extension for Chrome and Edge that neutralizes emotionally overwhelming web content for neurodiverse users. It rewrites page text using AI, strips visual clutter, and renders a calm, readable version in-place.

### Who is it for?
- Neurodiverse users (ADHD, autism, sensory processing differences)
- Readers overwhelmed by dense, high-stimulation pages
- Anyone who wants a calmer, lower-stimulation browsing experience

---

## 📖 專案概述

**Sensory Shield** 是一個 Manifest V3 瀏覽器擴充功能，支援 Chrome 與 Edge。它專為神經多樣性使用者設計，透過 AI 改寫頁面文字、移除視覺雜訊，並在原頁面呈現平靜、易讀的版本。

### 適合誰使用？
- 神經多樣性使用者（ADHD、自閉症、感官處理差異）
- 被密集、高刺激頁面壓倒的讀者
- 任何希望更平靜瀏覽體驗的人

---

## ✨ Features / 功能特色

| Feature | 功能 | Description |
|---------|------|-------------|
| 🧠 AI Rewrite | AI 改寫 | Neutralizes emotional/sensational language via LLM |
| 🙈 Clutter Removal | 移除雜訊 | Hides images, ads, videos, sticky elements |
| 🎨 Calm Styling | 平靜樣式 | Applies clean typography and reduced contrast |
| 🔌 Multi-Runtime | 多重執行模式 | Remote LLM, local model, or heuristic fallback |
| 🌐 Demo Mode | 展示模式 | Live calm/overload preview on landing page |
| 📦 Packaged Builds | 打包版本 | Distributable zip for Chrome/Edge |

---

## 🤖 AI / LLM / Agent Support

Sensory Shield supports **three runtime modes** for its AI rewriting engine.

### ☁️ Cloud / Remote LLM (雲端模式)

Uses any **OpenAI-compatible API endpoint**. Works with these **free or low-cost providers**:

| Provider | Free Tier | Suggested Model | API Base URL |
|----------|-----------|----------------|--------------|
| [OpenAI](https://platform.openai.com) | $5 free credit | `gpt-4o-mini` | `https://api.openai.com` |
| [Groq](https://console.groq.com) | ✅ Free (rate limited) | `llama-3.3-70b-versatile` | `https://api.groq.com/openai` |
| [OpenRouter](https://openrouter.ai) | ✅ Free models available | `mistralai/mistral-7b-instruct:free` | `https://openrouter.ai/api` |
| [Together AI](https://api.together.xyz) | $1 free credit | `mistralai/Mixtral-8x7B-Instruct-v0.1` | `https://api.together.xyz` |
| [Mistral AI](https://console.mistral.ai) | ✅ Free tier | `mistral-small-latest` | `https://api.mistral.ai` |
| [Cohere](https://dashboard.cohere.com) | ✅ Free trial | `command-r` | `https://api.cohere.ai/compatibility/v1` |

> **How to configure / 如何設定：** Enter your API Key and Base URL in the extension popup. Keys are stored in `chrome.storage.sync` and never leave your browser.

### 🏠 Local / On-device LLM (本地部署模式)

Run a local model with **Ollama** or **LM Studio** for full offline privacy:

```bash
# Install Ollama / 安裝 Ollama
brew install ollama            # macOS
winget install Ollama.Ollama   # Windows
curl -fsSL https://ollama.com/install.sh | sh  # Linux

# Pull a model / 下載模型
ollama pull llama3.2
ollama pull mistral
ollama pull qwen2.5

# Start local server (default: http://localhost:11434)
ollama serve
```

Set the extension API Base URL to:
- **Ollama:** `http://localhost:11434`
- **LM Studio:** `http://localhost:1234`

No API key required for local mode. / 本地模式不需要 API Key。

### 🔧 Heuristic Fallback (啟發式備援模式)

When no LLM is available, Sensory Shield uses built-in rule-based simplification — removes exclamation marks, shortens sentences, strips emotional keywords. No internet or API key required.

---

## 🎮 Demo / 線上展示

- 🌐 **[Open Live Demo](https://tewei02.github.io/sensory-shield/)** — GitHub Pages public site
- 📐 **[Architecture Overview](assets/overview.svg)** — system diagram

### Demo States / 展示狀態

| State | Emoji | Description |
|-------|-------|-------------|
| Calm 平靜 | 😌 | Clean typography, reduced clutter, easier scanning |
| Overload 超載 | 😵 | Stronger contrast, more visual noise, higher stimulation |
| Reset 重置 | 🔄 | Back to the default neutral presentation |

---

## 🏗️ Architecture / 系統架構

```
User clicks popup button
        │
        ▼
   popup.js ──sendMessage──▶ content.js
                                  │
                      ┌───────────┼───────────┐
                      │           │           │
               Hide elements   Extract    Modify styles
               (ads, media)     text
                                  │
                                  ▼
                         background.js (Service Worker)
                                  │
                      ┌───────────┼───────────┐
                      │           │           │
               ☁️ Remote LLM  🏠 Local LLM  🔧 Heuristic
               (any OpenAI-    (Ollama /     (rule-based
                compat API)    LM Studio)     fallback)
                                  │
                                  ▼
                         content.js renders
                         neutralized text
```

### File Structure / 檔案結構

```
sensory-shield/
├── manifest.json        # MV3 extension config / 擴充功能設定
├── background.js        # Service worker + LLM API caller
├── content.js           # Page manipulation + text extraction
├── popup.html           # Extension popup UI
├── popup.js             # Popup logic + API key config
├── popup.css            # Popup styles
├── index.html           # Landing page + live demo
├── demo.js              # Demo mode toggle logic
├── styles.css           # Landing page styles
├── assets/
│   └── overview.svg     # Architecture diagram
└── scripts/
    ├── build.js         # Package extension to .zip
    ├── pack-dmg.js      # macOS bundle
    ├── pack-exe.js      # Windows bundle
    └── pack-linux.js    # Linux bundle
```

---

## 🚀 Getting Started / 快速開始

### Install from Source / 從原始碼安裝

```bash
# 1. Clone the repo / 複製專案
git clone https://github.com/TeWei02/sensory-shield.git
cd sensory-shield

# 2. Install dependencies / 安裝依賴
npm install

# 3. Build extension zip / 打包擴充功能
npm run build
```

Load in Chrome/Edge / 載入瀏覽器：
1. Go to `chrome://extensions`
2. Enable **Developer mode** / 開啟開發人員模式
3. Click **Load unpacked** → select this folder / 選擇此資料夾

### Packaged Downloads / 打包下載

```bash
npm run pack:dmg    # macOS .dmg bundle
npm run pack:exe    # Windows .zip bundle
npm run pack:linux  # Linux .tar.gz bundle
```

### Configure AI / 設定 AI

1. Get a free API key from any [provider listed above](#%EF%B8%8F-cloud--remote-llm-%E9%9B%B2%E7%AB%AF%E6%A8%A1%E5%BC%8F)
2. Click the 🛡️ extension icon in your browser toolbar
3. Enter your **API Key** and (optionally) a custom **API Base URL**
4. Click **Save** — stored only in `chrome.storage.sync` locally

---

## 🔒 Privacy / 隱私

| Item | Status |
|------|--------|
| Extension server required | ❌ None needed |
| Usage analytics | ❌ Not collected |
| API key storage | ✅ Local `chrome.storage.sync` only |
| Content processing | ✅ Stays in your chosen runtime |
| Local mode availability | ✅ Fully offline capable |

---

## 🌍 Browser Support / 瀏覽器支援

| Browser | Status |
|---------|--------|
| Chrome | ✅ Supported |
| Edge | ✅ Supported |
| Firefox | 🔜 Planned |
| Safari | 🔜 Planned |

---

## 🤝 Contributing / 貢獻

Contributions are welcome! / 歡迎貢獻！

```bash
git fork https://github.com/TeWei02/sensory-shield
git checkout -b feat/your-feature
git commit -m "feat: describe your change"
git push origin feat/your-feature
# Open a Pull Request / 開 Pull Request
```

---

## 📚 References / 參考資料

- [Chrome Extensions Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Microsoft Edge Extension docs](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI Accessibility Tutorials](https://www.w3.org/WAI/tutorials/)
- [Microsoft Inclusive Design](https://www.microsoft.com/design/inclusive/)
- [Ollama](https://ollama.com) — local LLM runtime
- [OpenRouter](https://openrouter.ai) — free model gateway

---

## 📄 License / 授權

MIT © 2024 Sensory Shield Team
