# Sensory Shield — 感官防護系統

[![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-%23F7DF1E?logo=javascript)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Chrome](https://img.shields.io/badge/Chrome-Extension-%234285F4?logo=googlechrome)](https://developer.chrome.com/docs/extensions/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

感官友善（neurodiversity-friendly）的 Chrome 擴充功能，協助使用者**過濾資訊干擾、專注於真正重要的內容**，以更舒適的方式瀏覽網頁。

## 功能

- 網頁內容過濾：遮蔽或弱化分散注意力的頁面元素
- 排版調整：改善可讀性，降低視覺負擔
- 輕量無依賴：原生 JavaScript 實作，不需外部套件
- 內建展示頁（`index.html`）與示意圖（`assets/overview.svg`）

## 安裝（開發模式）

1. 開啟 Chrome 的「擴充功能」頁面（`chrome://extensions`）
2. 開啟「開發人員模式」
3. 點選「載入未封裝項目」，選擇本倉庫目錄

## 專案結構

```
sensory-shield/
├── manifest.json     # 擴充功能設定
├── background.js     # 背景腳本
├── content.js        # 內容腳本
├── popup.html / js   # 彈出視窗
├── styles.css        # 樣式
├── index.html        # 功能展示頁
└── assets/           # 示意圖
```

## License

MIT
