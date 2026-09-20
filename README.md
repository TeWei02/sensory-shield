# Sensory Shield — 感官防護系統

感官友善（neurodiversity-friendly）的 Chrome 擴充功能，協助使用者過濾資訊干擾、專注於真正重要的內容。

## 功能

- 內容過濾與排版調整
- 自動日期命名與歸檔
- 純文字 Markdown 格式，跨平台相容
- 輕量無依賴

## 安裝（開發模式）

1. 開啟 Chrome 的「擴充功能」頁面（chrome://extensions）
2. 開啟「開發人員模式」
3. 點選「載入未封裝項目」，選擇本倉庫目錄

## 專案結構

```
sensory-shield/
├── manifest.json     # 擴充功能設定
├── background.js     # 背景腳本
├── content.js        # 內容腳本
├── popup.html/js     # 彈出視窗
├── styles.css        # 樣式
└── README.md
```

## License

MIT
