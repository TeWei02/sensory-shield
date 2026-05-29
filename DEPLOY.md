部署指引 — GitHub Pages / Vercel

快速說明：

- 你可以把本資料夾當作靜態網站來源，上傳到 GitHub 並使用 GitHub Pages，或直接使用 Vercel 部署。
- 將 `index.html` 中兩個按鈕的 `href` 換成實際的下載連結（Google Drive 或 GitHub Releases）。

1) 使用 GitHub Pages

- 建立 GitHub Repo（例如 `yourusername/sensory-shield`），把整個專案推上去（只需包含網站檔案或整個 repo）。

範例指令：

```bash
git init
git add .
git commit -m "init: sensory-shield site"
git remote add origin git@github.com:yourusername/sensory-shield.git
git push -u origin main
```

- 到 GitHub repo → Settings → Pages → 選擇 Branch `main`，資料夾 `/ (root)` → Save。數分鐘後網站會在 `https://yourusername.github.io/sensory-shield/` 可用。

1) 使用 Vercel（建議：更簡單，支援自動部署）

- 註冊並登入 Vercel，點選 "New Project" → 從 GitHub 匯入你的 repo → Deploy。
- Vercel 會自動辨識靜態專案並部署，完成後會得到一個公開 URL。

1) 託管下載檔案建議

- GitHub Releases：在 GitHub Release 中上傳 `.dmg` / `.zip` / `.exe`，取得 release asset 的直接下載連結，貼到 `index.html` 按鈕的 `href`。
- Google Drive：將檔案設為「任何有連結者皆可下載」，然後將分享連結轉為直接下載連結（注意 Drive 下載連結有流量限制）。

1) 檢查點

- 確認 `index.html` 的按鈕 `href` 已更新為最終連結。
- 瀏覽器打開部署後的 URL，點按鈕確認能直接下載。

若你要我：

- 幫你把目前專案推到 GitHub（我可以建立 Git repo 並提交），請提供 GitHub 倉庫 URL 或授權我用你的帳號（我無法自行登入）。
- 幫你把 release 檔上傳到 GitHub Releases，我可以產生 release 資訊與上傳步驟，但需你上傳二進位檔或提供授權。
