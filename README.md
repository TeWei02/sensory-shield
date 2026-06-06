<div align="center">

# 🛡️ Sensory Shield

**Calm the web. Keep the meaning. Reduce the noise.**

[![Version](https://img.shields.io/badge/version-0.1.0-2563eb?style=for-the-badge)](package.json)
[![Manifest V3](https://img.shields.io/badge/manifest-V3-7c3aed?style=for-the-badge)](manifest.json)
[![Platform](https://img.shields.io/badge/platform-Chrome%20%2B%20Edge-0f172a?style=for-the-badge)](manifest.json)
[![License](https://img.shields.io/badge/license-MIT-10b981?style=for-the-badge)](package.json)
[![Demo](https://img.shields.io/badge/demo-live%20preview-f59e0b?style=for-the-badge)](index.html)

![Sensory Shield overview](assets/overview.svg)

**[繁體中文](README.zh-TW.md)**

</div>

---

## 📖 Overview

**Sensory Shield** is a Manifest V3 browser extension for Chrome and Edge. It neutralizes emotionally overwhelming web content for neurodiverse users — rewriting page text via AI, stripping visual clutter, and rendering a calm, readable version in-place.

### Who is it for?

- Neurodiverse users (ADHD, autism, sensory processing differences)
- Readers overwhelmed by dense, high-stimulation pages
- Anyone who wants a calmer, lower-stimulation browsing experience

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧠 AI Rewrite | Neutralizes emotional/sensational language via LLM |
| 🙈 Clutter Removal | Hides images, ads, videos, and sticky elements |
| 🎨 Calm Styling | Applies clean typography and reduced contrast |
| 🔌 Multi-Runtime | Remote LLM, local model, or heuristic fallback |
| 🌐 Demo Mode | Live calm/overload preview on the landing page |
| 📦 Packaged Builds | Distributable zip for Chrome/Edge |

---

## 🤖 AI / LLM / Agent Support

Sensory Shield supports **three runtime modes** for its AI rewriting engine.

### ☁️ Cloud / Remote LLM

Uses any **OpenAI-compatible API endpoint**. Works with these **free or low-cost providers**:

| Provider | Free Tier | Suggested Model | API Base URL |
|----------|-----------|----------------|--------------|
| [OpenAI](https://platform.openai.com) | $5 free credit | `gpt-4o-mini` | `https://api.openai.com` |
| [Groq](https://console.groq.com) | ✅ Free (rate limited) | `llama-3.3-70b-versatile` | `https://api.groq.com/openai` |
| [OpenRouter](https://openrouter.ai) | ✅ Free models available | `mistralai/mistral-7b-instruct:free` | `https://openrouter.ai/api` |
| [Together AI](https://api.together.xyz) | $1 free credit | `mistralai/Mixtral-8x7B-Instruct-v0.1` | `https://api.together.xyz` |
| [Mistral AI](https://console.mistral.ai) | ✅ Free tier | `mistral-small-latest` | `https://api.mistral.ai` |
| [Cohere](https://dashboard.cohere.com) | ✅ Free trial | `command-r` | `https://api.cohere.ai/compatibility/v1` |

> **How to configure:** Enter your API Key and Base URL in the extension popup. Keys are stored in `chrome.storage.sync` and never leave your browser.

### 🏠 Local / On-device LLM

Run a local model with **Ollama** or **LM Studio** for full offline privacy:

```bash
# Install Ollama
brew install ollama                                   # macOS
winget install Ollama.Ollama                          # Windows
curl -fsSL https://ollama.com/install.sh | sh         # Linux

# Pull a model
ollama pull llama3.2
ollama pull mistral

# Start local server (default: http://localhost:11434)
ollama serve
```

Set the extension API Base URL to:
- **Ollama:** `http://localhost:11434`
- **LM Studio:** `http://localhost:1234`

No API key required for local mode.

### 🔧 Heuristic Fallback

When no LLM is available, Sensory Shield uses built-in rule-based simplification. No internet or API key required.

---

## 🎮 Demo

- 🌐 **[Open Live Demo](https://tewei02.github.io/sensory-shield/)** — GitHub Pages public site
- 📐 **[Architecture Overview](assets/overview.svg)** — system diagram

| State | Description |
|-------|-------------|
| 😌 Calm | Clean typography, reduced clutter, easier scanning |
| 😵 Overload | Stronger contrast, more visual noise, higher stimulation |
| 🔄 Reset | Back to the default neutral presentation |

---

## 🏗️ Architecture

```
User clicks popup
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
               (OpenAI-compat)  (Ollama /    (rule-based
                                LM Studio)   fallback)
                                  │
                                  ▼
                         content.js renders
                         neutralized text
```

### File Structure

```
sensory-shield/
├── manifest.json        # MV3 extension config
├── background.js        # Service worker + LLM API caller
├── content.js           # Page manipulation + text extraction
├── popup.html/js/css    # Extension popup UI
├── index.html           # Landing page + live demo
├── demo.js              # Demo mode toggle logic
├── styles.css           # Landing page styles
├── assets/
│   └── overview.svg     # Architecture diagram
└── scripts/
    └── build.js         # Package extension to .zip
```

---

## 🚀 Getting Started

### Install from Source

```bash
git clone https://github.com/TeWei02/sensory-shield.git
cd sensory-shield
npm install
npm run build
```

Load in Chrome/Edge:
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select this folder

### Configure AI

1. Get a free API key from any [provider listed above](#%EF%B8%8F-cloud--remote-llm)
2. Click the 🛡️ extension icon in your browser toolbar
3. Enter your **API Key** and optionally a custom **API Base URL**
4. Click **Save** — stored only in `chrome.storage.sync` locally

---

## 🔒 Privacy

| Item | Status |
|------|--------|
| Extension server required | ❌ None needed |
| Usage analytics | ❌ Not collected |
| API key storage | ✅ `chrome.storage.sync` only |
| Content processing | ✅ Stays in your chosen runtime |
| Local mode | ✅ Fully offline capable |

---

## 🌍 Browser Support

| Browser | Status |
|---------|--------|
| Chrome | ✅ Supported |
| Edge | ✅ Supported |
| Firefox | 🔜 Planned |
| Safari | 🔜 Planned |

---

## 🤝 Contributing

Built with the assistance of **[Claude](https://claude.ai)** by Anthropic.

```bash
git checkout -b feat/your-feature
git commit -m "feat: describe your change"
git push origin feat/your-feature
# Open a Pull Request on GitHub
```

---

## 📚 References

- [Chrome Extensions Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Microsoft Edge Extension docs](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI Accessibility Tutorials](https://www.w3.org/WAI/tutorials/)
- [Microsoft Inclusive Design](https://www.microsoft.com/design/inclusive/)
- [Ollama](https://ollama.com) — local LLM runtime
- [OpenRouter](https://openrouter.ai) — free model gateway
- [Claude](https://claude.ai) — AI assistant by Anthropic

---

## 📄 License

MIT © 2024 Sensory Shield Team
