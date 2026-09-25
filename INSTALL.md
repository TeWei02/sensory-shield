# Installation guide

Sensory Shield ships as an **unpacked extension archive** (`sensory-shield-1.0.1.zip`). Chrome and Edge no longer
allow off-store installation of signed `.crx` files, so the zip is the supported delivery format for both manual use
and store submission.

| Item | Value |
| --- | --- |
| Package | `sensory-shield-1.0.1.zip` |
| Download | <https://tewei02.github.io/sensory-shield/downloads/sensory-shield-1.0.1.zip> |
| Also in repo | [`docs/downloads/sensory-shield-1.0.1.zip`](docs/downloads/sensory-shield-1.0.1.zip) |
| Browsers | Chrome 114+ / Edge 114+ (Manifest V3) |
| Toolchain | None. Python 3 is only needed to rebuild the package. |

---

## 1. Chrome (desktop)

1. Download `sensory-shield-1.0.1.zip`.
2. Unzip it. You should get a folder containing `manifest.json`, `background.js`, `content.js`, `popup.html` and
   `icons/`. **Keep this folder** — Chrome loads the extension from disk on every start, so deleting or moving it
   breaks the installation.
3. Open `chrome://extensions` in the address bar.
4. Turn on **Developer mode** (top-right toggle).
5. Click **Load unpacked** and select the folder from step 2 (select the folder itself, not a file inside it).
6. The card "Sensory Shield" appears. Click the puzzle-piece icon in the toolbar and pin **Sensory Shield**.
7. Open any article page, click the extension icon, then click **啟動感官煞車** (Activate Sensory Brake).

The neutralised text is rendered in a card at the top of the page.

## 2. Edge (desktop)

1. Unzip the archive as above.
2. Open `edge://extensions`.
3. Enable **Developer mode** in the left sidebar.
4. Click **Load unpacked** and choose the unzipped folder.
5. Pin the extension from the toolbar's extensions menu, then use it the same way as in Chrome.

## 3. Optional: enable remote rewrite

Remote rewrite is off by default and requires your own OpenAI-compatible credentials.

1. Click the extension icon.
2. Expand **AI 設定** (AI settings).
3. Fill in:
   - **API Key** — your own key, for example `sk-...`;
   - **Model** — for example `gpt-4o-mini`;
   - **API Base URL** — for example `https://api.openai.com`, a Groq/OpenRouter URL, or `http://localhost:11434`
     when running Ollama locally.
4. Click **儲存** (Save). The header switches to "雲端改寫模式".
5. Use **清除** (Clear) at any time to delete the stored key and fall back to the local rule engine.

The key is stored only in `chrome.storage.sync` on your machine (and in your browser profile's sync data if browser
sync is enabled). Nothing is sent anywhere until you activate the extension on a page.

## 4. Verify the package before installing (optional)

The release gate can be reproduced locally with the Python standard library only:

```bash
python3 scripts/verify_package.py
```

It checks the manifest fields, every referenced file, icon dimensions, forbidden placeholder strings, external CDN
references and the integrity of the zip in `dist/`. Rebuild the zip at any time with:

```bash
python3 scripts/build_zip.py
```

## 5. Updating

1. Download the newer zip and unzip it over (or next to) the previous folder.
2. Open `chrome://extensions` and click the **Reload** icon on the Sensory Shield card.
3. Reload any open article tab so the new content script is injected.

## 6. Uninstalling

1. Open `chrome://extensions` (or `edge://extensions`).
2. Click **Remove** on the Sensory Shield card.
3. Delete the unzipped folder.

Removing the extension also clears its stored settings. No files are written outside the extension folder.

## 7. Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| "無法與擴充功能背景程序通訊" error card | The content script was not injected (page loaded before install, or the tab was restored from cache). Reload the page, then run the extension again. The popup also retries by injecting the script automatically. |
| "This page cannot be accessed" style message | Browser-internal pages (`chrome://`, `edge://`, the Web Store, PDF viewer) block extensions by design. Use it on a regular web page. |
| Remote rewrite returns an error | Check the API key, the model name and the Base URL. The extension falls back to the local rule engine automatically; the card header then shows "本地規則模式". |
| Output text is short | Only the first 8,000 characters of page text are processed per run. |
| Some ads remain visible | Hiding rules use conservative token matching to avoid damaging page layout. Send the site's structure in an issue to extend the token list. |
| Icons are missing after unzip | Some archive tools flatten folders. Re-unzip preserving the directory structure so that `icons/icon128.png` exists. |

## 8. Publishing to a store

The same `docs/downloads/sensory-shield-1.0.1.zip` file is the upload artifact:

- **Chrome Web Store** — upload the zip in the developer dashboard; the manifest already carries a version, a
  ≤132-character description and 16/32/48/128 px icons.
- **Microsoft Edge Add-ons** — reuse the same zip; no manifest changes are needed.
- Store listings require screenshots (1280×800 or 640×400). Capture them from a live page rather than reusing mock
  imagery, and do not describe unmeasured effects.
