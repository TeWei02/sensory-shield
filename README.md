# Sensory Shield

> A Manifest V3 browser extension that turns overwhelming pages into a calm, low-stimulation reading view.

[![Version](https://img.shields.io/badge/version-1.0.0-2563eb.svg)](#)
[![Manifest V3](https://img.shields.io/badge/manifest-v3-7c3aed.svg)](#)
[![Platform](https://img.shields.io/badge/platform-Chrome%20%7C%20Edge-1f7a4d.svg)](#)
[![License](https://img.shields.io/badge/license-MIT-c2410c.svg)](LICENSE)
[![Live demo](https://img.shields.io/badge/live%20demo-GitHub%20Pages-2b7a78.svg)](https://tewei02.github.io/sensory-shield/)

**Live demo and download:** <https://tewei02.github.io/sensory-shield/>
**Installation guide:** [INSTALL.md](INSTALL.md) · [繁體中文說明](README.zh-TW.md)

---

## Overview

Sensory Shield is a reading-comfort tool for the browser. On a page you are already reading, it:

1. hides media and advertising or overlay containers with conservative, token-matched selectors;
2. extracts the main text (up to 8,000 characters per run);
3. returns a neutral, bullet-pointed version of that text and renders it in a card at the top of the page;
4. applies a low-stimulation reading style (single column, muted palette, no animation).

The extension is designed around **semantic computing** ideas: reducing perceptual load, detecting affective or
hyperbolic wording in page copy, and re-expressing the same information in quieter language.

## Processing modes

| Mode | Requires a key | Network | Behaviour |
| --- | --- | --- | --- |
| **Remote rewrite** | Yes | Yes | Page text is sent to the OpenAI-compatible endpoint you configure and returned as a neutral summary. |
| **Local rule engine** | No | No | A deterministic on-device rewriter removes hyperbolic wording, splits long sentences and emits bullet points. Used automatically when no key is set or a remote call fails. |
| **Local endpoints** | Optional | Localhost | Ollama, LM Studio or any local gateway can be set as the Base URL through the *AI 設定* panel (labelled "AI settings" in the popup). |

The extension ships with **no API key, no proxy and no telemetry**. Remote mode only activates with a key that you
enter yourself; it is stored in `chrome.storage.sync`.

## Install

### From the packaged release

1. Download [`sensory-shield-1.0.0.zip`](https://tewei02.github.io/sensory-shield/downloads/sensory-shield-1.0.0.zip)
   (also available in [`docs/downloads/`](docs/downloads/)).
2. Unzip it into a folder you intend to keep.
3. Open `chrome://extensions` (or `edge://extensions`) and turn on **Developer mode**.
4. Click **Load unpacked** and select the folder containing `manifest.json`.
5. Pin the extension, open an article page and click **啟動感官煞車**.

Full instructions, troubleshooting and removal steps are in [INSTALL.md](INSTALL.md).

### From source

```bash
git clone https://github.com/TeWei02/sensory-shield.git
cd sensory-shield
python3 scripts/build_zip.py     # writes dist/sensory-shield-1.0.0.zip
python3 scripts/verify_package.py
```

Then load the repository folder (or the unzipped `dist/` archive) as an unpacked extension.

## Build and verification

This repository deliberately avoids a Node toolchain: packaging and validation run on the Python standard library,
so the release can be reproduced on any machine with `python3`.

| Command | Purpose |
| --- | --- |
| `python3 scripts/build_zip.py` | Builds `dist/sensory-shield-<version>.zip`, refreshes `docs/downloads/`, and syncs the static landing page into `docs/`. |
| `python3 scripts/verify_package.py` | Static checks: manifest fields, referenced files, icon sizes, forbidden placeholder strings, CDN references and zip integrity. |
| `python3 scripts/make_icons.py` | Regenerates `icons/icon16/32/48/128.png`. |

`verify_package.py` is the release gate: it fails on unresolved placeholders, leftover scaffolding, external CDN
references and a missing or malformed package.

## Project structure

```
sensory-shield/
├── manifest.json            # MV3 manifest: permissions, action, background service worker
├── background.js            # Service worker: remote rewrite + local rule engine, timeouts, error handling
├── content.js               # Hiding rules, text extraction, in-page result card
├── popup.html / popup.js    # Popup UI and settings (API key, model, base URL)
├── popup.css                # Popup styles (self-contained)
├── index.html               # Static landing page / interactive mode demo
├── styles.css / demo.js     # Landing page styles and demo behaviour
├── icons/                   # 16 / 32 / 48 / 128 px extension icons
├── assets/                  # Overview illustration used by the landing page
├── scripts/
│   ├── build_zip.py         # Packaging (standard library only)
│   ├── verify_package.py    # Release verification gate
│   └── make_icons.py        # Icon generation
├── docs/                    # Published GitHub Pages site + downloadable zip
└── .github/workflows/ci.yml # Build and verify on every push
```

## Permissions

| Permission | Why it is needed |
| --- | --- |
| `activeTab` / `scripting` | Inject the content script into the page you explicitly activate the extension on. |
| `storage` | Store your API key, model name and endpoint locally in `chrome.storage.sync`. |
| `<all_urls>` | Read the text of the article page after you activate the extension. No background crawling is performed. |

## Scope and limitations

- Processed text is capped at **8,000 characters** per run; longer articles are truncated.
- Hiding rules use conservative token matching, so some ad or overlay containers on unusual sites stay visible.
- Remote rewrite requires **your own** API key and endpoint. Nothing works out of the box in that mode by design.
- Supported browsers: **Chrome and Edge (Manifest V3)**. Firefox and Safari are not supported yet (planned).
- No measurement data, participant counts or clinical outcomes are published. Sensory Shield is a reading-comfort
  tool, not a medical device.
- A signed `.crx` is not distributed: current Chrome builds block off-store CRX installs, so the unpacked zip is the
  supported delivery format.

## License

MIT © 2026 Te-Wei Ko. See [LICENSE](LICENSE).
