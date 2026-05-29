<div align="center">

# 🛡️ Sensory Shield

**平靜網頁，保留意義，減少雜訊。**

[![版本](https://img.shields.io/badge/版本-0.1.0-2563eb?style=for-the-badge)](package.json)
[![Manifest V3](https://img.shields.io/badge/manifest-V3-7c3aed?style=for-the-badge)](manifest.json)
[![平台](https://img.shields.io/badge/平台-Chrome%20%2B%20Edge-0f172a?style=for-the-badge)](manifest.json)
[![授權](https://img.shields.io/badge/授權-MIT-10b981?style=for-the-badge)](package.json)
[![展示](https://img.shields.io/badge/展示-線上預覽-f59e0b?style=for-the-badge)](index.html)

![Sensory Shield 系統概覽](assets/overview.svg)

**[English](README.md)**

</div>

---

## 📖 專案概述

**Sensory Shield** 是一個 Manifest V3 瀏覽器擴充功能，支援 Chrome 與 Edge。它專為神經多樣性使用者設計，透過 AI 改寫頁面文字、移除視覺雜訊，並在原頁面直接呈現平靜、易讀的版本。

### 適合誰使用？

- 神經多樣性使用者（ADHD、自閉症、感官處理差異）
- 被密集、高刺激網頁壓倒的讀者
- 任何希望獲得更平靜瀏覽體驗的人

---

## ✨ 功能特色

| 功能 | 說明 |
|------|------|
| 🧠 AI 改寫 | 透過 LLM 中和情緒化/煽動性語言 |
| 🙈 移除雜訊 | 隱藏圖片、廣告、影片、懸浮元素 |
| 🎨 平靜樣式 | 套用乾淨字型排版與降低對比 |
| 🔌 多重執行模式 | 支援雲端 LLM、本地模型或啟發式備援 |
| 🌐 展示模式 | 首頁提供平靜/超載即時切換預覽 |
| 📦 打包版本 | Chrome/Edge 可分發的 zip 安裝包 |

---

## 🤖 AI / LLM / Agent 支援

Sensory Shield 支援 **三種執行模式** 驅動 AI 改寫引擎。

### ☁️ 雲端模式（遠端 LLM）

支援任何 **OpenAI 相容的 API 端點**，以下是**免費或低成本**的推薦服務商：

| 服務商 | 免費方案 | 建議模型 | API Base URL |
|--------|---------|---------|--------------|
| [OpenAI](https://platform.openai.com) | $5 免費額度 | `gpt-4o-mini` | `https://api.openai.com` |
| [Groq](https://console.groq.com) | ✅ 完全免費（有速率限制） | `llama-3.3-70b-versatile` | `https://api.groq.com/openai` |
| [OpenRouter](https://openrouter.ai) | ✅ 有免費模型可用 | `mistralai/mistral-7b-instruct:free` | `https://openrouter.ai/api` |
| [Together AI](https://api.together.xyz) | $1 免費額度 | `mistralai/Mixtral-8x7B-Instruct-v0.1` | `https://api.together.xyz` |
| [Mistral AI](https://console.mistral.ai) | ✅ 免費 tier | `mistral-small-latest` | `https://api.mistral.ai` |
| [Cohere](https://dashboard.cohere.com) | ✅ 免費試用 | `command-r` | `https://api.cohere.ai/compatibility/v1` |

> **如何設定：** 在擴充功能彈出視窗輸入 API Key 與 Base URL。Key 儲存於 `chrome.storage.sync`，不會離開你的瀏覽器。

### 🏠 本地部署模式（離線 LLM）

使用 **Ollama** 或 **LM Studio** 在本地執行模型，完全保護隱私：

```bash
# 安裝 Ollama
brew install ollama                                   # macOS
winget install Ollama.Ollama                          # Windows
curl -fsSL https://ollama.com/install.sh | sh         # Linux

# 下載模型
ollama pull llama3.2
ollama pull mistral
ollama pull qwen2.5

# 啟動本地伺服器（預設：http://localhost:11434）
ollama serve
```

在擴充功能中設定 API Base URL：
- **Ollama：** `http://localhost:11434`
- **LM Studio：** `http://localhost:1234`

本地模式**不需要 API Key**，且完全離線運作。

### 🔧 啟發式備援模式

當沒有 LLM 可用時，Sensory Shield 會使用內建規則進行文字簡化——移除驚嘆號、縮短長句、過濾情緒化字詞。無需網路或 API Key。

---

## 🎮 線上展示

- 🌐 **[開啟線上展示](https://tewei02.github.io/sensory-shield/)** — GitHub Pages 公開網站
- 📐 **[查看架構概覽](assets/overview.svg)** — 系統架構圖

| 狀態 | 說明 |
|------|------|
| 😌 平靜 | 乾淨字型、減少雜訊、更容易閱讀 |
| 😵 超載 | 更強對比、更多視覺噪音、高度刺激 |
| 🔄 重置 | 回到預設中性呈現 |

---

## 🏗️ 系統架構

```
使用者點擊彈出視窗按鈕
        │
        ▼
   popup.js ──發送訊息──▶ content.js
                               │
                   ┌───────────┼───────────┐
                   │           │           │
            隱藏元素        擷取文字     修改樣式
           （廣告/媒體）
                               │
                               ▼
                      background.js（Service Worker）
                               │
                   ┌───────────┼───────────┐
                   │           │           │
            ☁️ 雲端 LLM   🏠 本地 LLM  🔧 啟發式備援
           （OpenAI 相容）  （Ollama /    （規則式
                           LM Studio）    離線）
                               │
                               ▼
                      content.js 渲染
                      改寫後的文字
```

### 檔案結構

```
sensory-shield/
├── manifest.json        # MV3 擴充功能設定
├── background.js        # Service Worker + LLM API 呼叫
├── content.js           # 頁面操作 + 文字擷取
├── popup.html/js/css    # 擴充功能彈出 UI
├── index.html           # 首頁 + 線上展示
├── demo.js              # 展示模式切換邏輯
├── styles.css           # 首頁樣式
├── assets/
│   └── overview.svg     # 架構圖
└── scripts/
    ├── build.js         # 打包擴充功能為 .zip
    ├── pack-dmg.js      # macOS 套件
    ├── pack-exe.js      # Windows 套件
    └── pack-linux.js    # Linux 套件
```

---

## 🚀 快速開始

### 從原始碼安裝

```bash
git clone https://github.com/TeWei02/sensory-shield.git
cd sensory-shield
npm install
npm run build
```

載入 Chrome/Edge：
1. 前往 `chrome://extensions`
2. 開啟**開發人員模式**
3. 點擊**載入未封裝項目** → 選擇此資料夾

### 打包下載

```bash
npm run pack:dmg    # macOS 套件
npm run pack:exe    # Windows 套件
npm run pack:linux  # Linux 套件
```

### 設定 AI

1. 從[上方服務商清單](#%EF%B8%8F-雲端模式遠端-llm)取得免費 API Key
2. 點擊瀏覽器工具列中的 🛡️ 擴充功能圖示
3. 輸入你的 **API Key**，以及（可選）自訂的 **API Base URL**
4. 點擊**儲存** — 僅存於本地的 `chrome.storage.sync`

---

## 🔒 隱私

| 項目 | 狀態 |
|------|------|
| 需要擴充功能伺服器 | ❌ 不需要 |
| 使用分析收集 | ❌ 不收集 |
| API Key 儲存位置 | ✅ 僅限本地 `chrome.storage.sync` |
| 內容處理位置 | ✅ 留在你選擇的執行環境 |
| 本地模式 | ✅ 完全離線運作 |

---

## 🌍 瀏覽器支援

| 瀏覽器 | 狀態 |
|--------|------|
| Chrome | ✅ 支援 |
| Edge | ✅ 支援 |
| Firefox | 🔜 規劃中 |
| Safari | 🔜 規劃中 |

---

## 🤝 貢獻

歡迎貢獻！

```bash
git checkout -b feat/你的功能名稱
git commit -m "feat: 描述你的變更"
git push origin feat/你的功能名稱
# 在 GitHub 開啟 Pull Request
```

---

## 📚 參考資料

- [Chrome Extensions Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Microsoft Edge Extension 文件](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI 無障礙設計教學](https://www.w3.org/WAI/tutorials/)
- [Microsoft 包容性設計](https://www.microsoft.com/design/inclusive/)
- [Ollama](https://ollama.com) — 本地 LLM 執行環境
- [OpenRouter](https://openrouter.ai) — 免費模型閘道

---

## 📄 授權

MIT © 2024 Sensory Shield Team
