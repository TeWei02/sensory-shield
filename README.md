```markdown
# Sensory Shield — 感官防護系統

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Language: Markdown](https://img.shields.io/badge/Language-Markdown-blue.svg)](https://daringfireball.net/projects/markdown/)
[![Platform: Linux](https://img.shields.io/badge/Platform-Linux-lightgrey.svg)](https://www.linux.org/)
[![Version: 1.0.0](https://img.shields.io/badge/Version-1.0.0-brightgreen.svg)]()

> **Sensory Shield** 是一套自動化知識產出與管理系統，專為高效整理、分類、生成結構化內容而設計。透過模板化流程與日期命名規範，幫助使用者抵禦資訊過載，專注於真正有價值的洞察。

---

## Features

- ✅ **自動日期命名** — 產出檔案自動標記日期（格式：`YYYYMMDD_主題.md`）
- ✅ **雙領域分類** — 支援 `tech`（技術）與 `biz`（商業）兩大類別，便於檢索與歸檔
- ✅ **模板驅動** — 每個類別使用專屬模板，確保結構一致、專業排版
- ✅ **跨平台相容** — 純文字 Markdown 格式，可在任何作業系統與編輯器中使用
- ✅ **輕量無依賴** — 無需安裝額外運行環境，僅需 Git 與文字編輯器

---

## Installation

1. 克隆此倉庫至本機：
   ```bash
   git clone https://github.com/your-username/sensory-shield.git
   ```
2. 進入專案目錄：
   ```bash
   cd sensory-shield
   ```
3. 確認目錄結構：
   ```bash
   tree
   ```
   預期輸出：
   ```
   .
   ├── README.md
   ├── LICENSE
   ├── tech/
   │   └── 20260617_Linux命令行技巧：提升效率的10個組.md
   └── biz/
       └── 20260617_訂閱制商業模式深度解析.md
   ```

---

## Usage

### 瀏覽既有產出
直接開啟 `tech/` 或 `biz/` 目錄下的 `.md` 檔案，使用任何 Markdown 閱讀器（如 Typora、VS Code、GitHub 網頁）即可查看。

### 新增內容
1. 根據主題選擇 `tech/` 或 `biz/` 目錄。
2. 複製對應類別的模板（位於 `templates/` 目錄，若尚未建立則可參考既有檔案）。
3. 將檔案命名為 `YYYYMMDD_主題.md`（例如 `20260618_機器學習入門指南.md`）。
4. 填寫內容，遵循模板格式。

### 自動化生成（進階）
若需透過腳本自動產生，可參考 `scripts/` 目錄（未來規劃），或自行串接 CI/CD 流程。

---

## License

本專案採用 **MIT License**。詳細條款請參閱 [LICENSE](LICENSE) 檔案。

---

*Automated by Davin Portfolio Engine*
```