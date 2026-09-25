# Sensory Shield

> 把資訊過載的網頁轉換成冷靜、低刺激閱讀檢視的 Manifest V3 瀏覽器擴充功能。

[![版本](https://img.shields.io/badge/version-1.0.1-2563eb.svg)](#)
[![Manifest V3](https://img.shields.io/badge/manifest-v3-7c3aed.svg)](#)
[![平台](https://img.shields.io/badge/platform-Chrome%20%7C%20Edge-1f7a4d.svg)](#)
[![授權](https://img.shields.io/badge/license-MIT-c2410c.svg)](LICENSE)
[![線上展示](https://img.shields.io/badge/live%20demo-GitHub%20Pages-2b7a78.svg)](https://tewei02.github.io/sensory-shield/)

**線上展示與下載：** <https://tewei02.github.io/sensory-shield/>
**安裝說明：** [INSTALL.md](INSTALL.md) · [English README](README.md)

---

## 專案概述

Sensory Shield 是一套瀏覽器閱讀輔助工具。在你正在閱讀的頁面上，它會：

1. 以保守的 token 比對規則隱藏媒體、廣告與浮層容器；
2. 擷取頁面主要文字（單次上限 8,000 字元）；
3. 產生中性、條列化的版本，並以卡片形式顯示在頁面頂端；
4. 套用低刺激閱讀樣式（單欄、低彩度、關閉動畫）。

在設計取向上，本專案以**語意感知**與**情感運算**為核心概念：降低感知負荷、辨識頁面文案中的誇飾語氣，並以更平穩的語言重新表述同一份資訊。

## 適用對象與痛點

Sensory Shield 寫給已經決定要讀某篇內容、卻得先跟頁面搏鬥的人：

- 每天在螢幕上讀長文、技術文件或論壇討論串的人；
- 一再被自動播放影音、黏在側邊的分享列、訂閱彈窗與廣告版位打斷的讀者；
- 想把標題與文案的情緒音量調低的人；
- 偏好離線可用、不需帳號、不受追蹤的工具的使用者；
- 對多欄、帶動畫的版面難以久讀的 ADHD 或感官敏感讀者。

**它要解決的痛點。** 一般新聞或部落格頁面，會在你真正想讀的文字上方疊上三到五個搶注意力的元素：蓋版廣告、分享列、內嵌影片、電子報彈窗，以及「相關文章」推薦區。逐一關閉這類元素，是每開一頁、每進一次站都要重做的手動雜事。Sensory Shield 把它收斂成一個按鈕：清掉閱讀面上的干擾，並把文字以更平穩的形式還給你。

**它不是什麼。** 它不是廣告封鎖器（完全不碰網路請求與過濾清單），不是完整閱讀模式（不會重排整個網站版面），也不是醫療或療效產品。詳見[範圍與限制](#範圍與限制)。

## 處理模式

| 模式 | 需要金鑰 | 網路連線 | 行為 |
| --- | --- | --- | --- |
| **雲端改寫** | 是 | 是 | 將頁面文字送往你自行設定的 OpenAI 相容端點，回傳中性摘要。 |
| **本地規則模式** | 否 | 否 | 以裝置上的確定性改寫器移除誇飾詞、拆解長句並輸出條列。未設定金鑰或雲端失敗時自動使用。 |
| **本地端點** | 可選 | 本機 | 可於 *AI 設定* 面板將 Base URL 指向 Ollama、LM Studio 或任何本地閘道。 |

擴充功能**不內建任何 API Key、不經代理、不收集使用資料**。雲端模式僅在你自行輸入金鑰後啟用，金鑰儲存於 `chrome.storage.sync`。

## 實際效果

以下觀察來自維護者的離線測試頁：以 headless Chrome 載入 `content.js`、`background.js` 與 `popup.js`，並以 stub 取代 `chrome.*` API（52 項斷言，於 v1.0.1 全數通過）。該測試頁未收錄於本倉庫，但下列每一項行為都能用上面的安裝步驟重現。

隱藏行為（測試頁同時放入下列元素）：

| 頁面上的元素 | 結果 |
| --- | --- |
| class 含 `ad-banner` / `advertisement`，或 `data-testid="ad-slot"` 的容器 | 隱藏（`display: none`） |
| id 為 `socialShareBar`、或 class 含 `social-share-bar` 的容器 | 隱藏，含其內部圖片 |
| 文章內圖片 | 隱藏 |
| class 含 `download-area` 的容器 | **保持可見** |
| class 含 `header-gradient` 的頁首 | **保持可見** |
| class 含 `download-area` 而 id 為 `share` 的元素 | 保持可見——兩個 token 不會被交叉誤判 |

文字處理（同一次實測）：

- 擷取正文上限 **8,000 字元**，且卡片會明示只處理了前 8,000 字元；
- 長句會拆成每段約 55 字元以內；
- 條列輸出上限 5 點；
- 空輸入或無句子結構的輸入不會拋錯，會回報明確說明；
- 套用於頁面的閱讀樣式為單欄、正文寬度上限 **800 px**、關閉動畫。

本地規則模式的實際前後對照（原文照登）：

```
輸入：震驚！這款產品保證無敵，全網瘋傳，必買！
輸出：這款產品。
```

```
輸入：Shocking! This exclusive report is guaranteed to go viral, and it is a must-read for anyone …
輸出：This report is to go
      and it is a for anyone who follows the topic. Researchers spent three years interviewing …
      - This report is to go, and it is a for anyone who follows the topic. …
```

**請如實看待這兩筆樣本。** 本地規則模式是逐詞組移除誇飾字詞，不會重寫語法，因此留下的句子可能顯得斷裂或不完整——這是「離線、確定性、即時、零成本」必然的代價。若需要通順的改寫，請設定 API Key 使用雲端改寫模式。展示頁上的卡片是**模擬示範**，不是實際執行的擷取畫面。

## 設計原則

- **無遙測、無帳號、無代理。** 未設定端點時，擴充功能不會發出任何網路請求。
- **可重現的發佈流程。** `build_zip.py` 與 `verify_package.py` 只用 Python 標準庫；CI 在每次推送時建置並驗證。
- **自帶檔案。** 無 CDN、無外部字型、無執行期相依、無 Node 工具鏈。
- **限制透明。** 隱藏規則刻意保守，8,000 字元上限會顯示在介面上。
- **表面積小。** 三個權限，逐一說明於下；圖示由本倉庫的腳本產生。

## 安裝三步驟

1. **取得檔案。** 下載 [`sensory-shield-1.0.1.zip`](https://tewei02.github.io/sensory-shield/downloads/sensory-shield-1.0.1.zip)（亦鏡像於 [`docs/downloads/`](docs/downloads/)），解壓縮到一個你要長期保留的資料夾。
2. **載入擴充功能。** 開啟 `chrome://extensions`（或 `edge://extensions`），開啟右上角的**開發者模式**，點選**載入未封裝項目**，選擇含 `manifest.json` 的資料夾。
3. **開始使用。** 將擴充功能釘選到工具列，開啟任一文章或長文頁面，點選**啟動感官煞車**。中性版本的文字會以卡片顯示在頁面頂端。

完整步驟、疑難排解、權限理由與移除方式請見 [INSTALL.md](INSTALL.md)。

### 從原始碼建置

```bash
git clone https://github.com/TeWei02/sensory-shield.git
cd sensory-shield
python3 scripts/build_zip.py     # 產生 dist/sensory-shield-1.0.1.zip
python3 scripts/verify_package.py
```

接著把專案資料夾（或解壓後的 `dist/` 內容）以「載入未封裝項目」方式載入即可。

## 建置與驗證

本專案刻意不依賴 Node 工具鏈：打包與驗證僅使用 Python 標準庫，任何具備 `python3` 的環境都能複現正式版本。

| 指令 | 用途 |
| --- | --- |
| `python3 scripts/build_zip.py` | 產生 `dist/sensory-shield-<version>.zip`、更新 `docs/downloads/`，並將靜態展示頁同步到 `docs/`。 |
| `python3 scripts/verify_package.py` | 靜態檢查：manifest 欄位、參照檔案、圖示尺寸、禁用佔位字串、CDN 參照與 zip 完整性。 |
| `python3 scripts/make_icons.py` | 重新產生 `icons/icon16/32/48/128.png`。 |

`verify_package.py` 是發佈的守門檻：只要殘留未解析佔位符、樣板檔、外部 CDN 參照，或封裝檔缺漏、格式錯誤，都會直接失敗。

## 專案結構

```
sensory-shield/
├── manifest.json            # MV3 manifest：權限、action、背景服務 worker
├── background.js            # 服務 worker：雲端改寫與本地規則引擎、逾時與錯誤處理
├── content.js               # 隱藏規則、文字擷取、頁面內結果卡片
├── popup.html / popup.js    # 彈出視窗介面與設定（API Key、模型、Base URL）
├── popup.css                # 彈出視窗樣式（無外部相依）
├── index.html               # 靜態展示頁／互動模式示範
├── styles.css / demo.js     # 展示頁樣式與示範行為
├── icons/                   # 16 / 32 / 48 / 128 px 擴充功能圖示
├── assets/                  # 展示頁使用的示意圖
├── scripts/
│   ├── build_zip.py         # 打包（僅用標準庫）
│   ├── verify_package.py    # 發佈驗證守門檻
│   └── make_icons.py        # 圖示產生
├── docs/                    # 已發佈的 GitHub Pages 站台與可下載 zip
└── .github/workflows/ci.yml # 每次推送自動建置與驗證
```

## 權限說明

| 權限 | 用途 |
| --- | --- |
| `activeTab` / `scripting` | 僅在你主動啟動擴充功能時，將內容腳本注入當前頁面。 |
| `storage` | 於 `chrome.storage.sync` 儲存你自行輸入的 API Key、模型名稱與端點。 |
| `<all_urls>` | 在你啟動擴充功能後讀取文章頁文字。不會進行背景爬取。 |

## 範圍與限制

- 單次處理文字上限為 **8,000 字元**，超過部分會被截斷。
- 隱藏規則採保守 token 比對，特殊網站的廣告或浮層容器可能仍然可見。
- 雲端改寫模式必須由你自行提供 API Key 與端點，設計上不提供開箱即用的金鑰。
- 支援瀏覽器為 **Chrome 與 Edge（Manifest V3）**；Firefox 與 Safari 尚未支援（規劃中）。
- 本專案未發佈任何量測數據、受試者人數或臨床結果。Sensory Shield 是閱讀舒適度工具，並非醫療器材。
- 不發佈簽章 `.crx` 檔：目前 Chrome 會封鎖商店外 CRX 安裝，因此以未封裝 zip 為正式交付格式。

## 授權

MIT © 2026 Te-Wei Ko，詳見 [LICENSE](LICENSE)。
