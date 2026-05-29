# Sensory Shield

> Calm the web. Keep the meaning. Reduce the noise.

[![Version](https://img.shields.io/badge/version-0.1.0-2563eb?style=for-the-badge)](package.json)
[![Manifest V3](https://img.shields.io/badge/manifest-V3-7c3aed?style=for-the-badge)](manifest.json)
[![Platform](https://img.shields.io/badge/platform-Chrome%20%2B%20Edge-0f172a?style=for-the-badge)](manifest.json)
[![License](https://img.shields.io/badge/license-MIT-10b981?style=for-the-badge)](package.json)
[![Demo](https://img.shields.io/badge/demo-live%20preview-f59e0b?style=for-the-badge)](index.html)

![Sensory Shield overview](assets/overview.svg)

## 專案定位 / Project Positioning

Sensory Shield is a browser extension built for a simple but important problem:
many web pages are technically informative but psychologically exhausting.

If I were the interviewer, I would want to see whether this project proves that you can:

- identify a real user pain point
- design for a specific audience
- make difficult interactions feel simpler
- explain the architecture clearly
- ship a working demo, not only an idea

That is the standard this README is written for.

## Why this matters

This project is not just about a browser extension.
It is about showing that you can take an abstract accessibility problem and turn it into a tangible product.

### What I would want to hear in an interview

1. **Who is this for?**
   - neurodiverse users
   - readers who are overwhelmed by dense pages
   - people who want calmer, lower-stimulation interfaces

2. **What problem does it solve?**
   - emotional or sensational language
   - visual clutter
   - pages that are technically full of information but hard to process

3. **How do you know it works?**
   - there is a live demo
   - the extension has real packaging output
   - the runtime paths are separated and testable

## Interactive demo

Try the public landing page and switch between calm and overload:

- [Open the demo](index.html)
- [View the architecture overview](assets/overview.svg)

<details open>
<summary><strong>What the demo is showing</strong></summary>

| State | Meaning |
| --- | --- |
| Calm | Clean typography, reduced clutter, easier scanning |
| Overload | Stronger contrast, more visual noise, higher stimulation |
| Reset | Back to the default neutral presentation |

</details>

<details>
<summary><strong>Why I would like this in an interview</strong></summary>

- It demonstrates product thinking, not just code output.
- It gives a clear before/after story.
- It makes the accessibility goal visible within seconds.
- It helps the candidate explain design decisions without hand-waving.

</details>

## What the project demonstrates

Think of this as evidence of capability in four directions:

### 1. Product thinking

The project starts from a user need and converts it into a usable workflow.

### 2. Front-end execution

There is a public landing page, a demo mode, and a visual system that communicates the idea quickly.

### 3. Extension architecture

The extension is built as a Manifest V3 browser extension with a service worker, content script, popup, and packaging pipeline.

### 4. AI / runtime strategy

The runtime can be remote, local, or fallback-based, which shows awareness of real-world constraints.

<details open>
<summary><strong>Snapshot</strong></summary>

| Area | What you get |
| --- | --- |
| Demo | A live calm / overload preview on the public page |
| Extension | Manifest V3 browser extension for Chrome / Edge |
| AI | Remote, local, and heuristic runtime modes |
| Output | Simplified text, bullet summaries, and calmer visual styling |
| Bundles | Downloadable packages for macOS, Windows, and Linux |

</details>

## Technical story

Sensory Shield focuses on three core actions:

1. **Neutralize** emotional or sensational language
2. **Simplify** content into easier-to-scan structure
3. **Reduce** visual overload with calmer styling and fewer distractions

That is the story I would want a student to be able to explain clearly in an interview.

<details open>
<summary><strong>Runtime modes</strong></summary>

The extension supports multiple ways to run the rewrite flow:

| Mode | Purpose | Interview value |
| --- | --- | --- |
| Remote LLM | OpenAI-compatible cloud rewriting | Shows API integration and abstraction |
| Local runtime | localhost model usage | Shows privacy and offline awareness |
| Heuristic fallback | rule-based rewriting | Shows resilience when dependencies fail |

</details>

<details>
<summary><strong>Why this architecture is strong</strong></summary>

- It keeps the UI usable even if a model is unavailable.
- It separates demo presentation from page transformation logic.
- It makes local testing possible without a cloud account.
- It leaves room for future agentic or multi-model workflows.

</details>

## Evidence of execution

### Install from source

1. Clone this repository
2. Open Chrome or Edge
3. Go to the extensions page
4. Enable developer mode
5. Choose **Load unpacked** and select this folder

> This project ships extension packages, not desktop apps.

### Packaged downloads

If you want a distributable build, use the packaged outputs.

- macOS bundle
- Windows bundle
- Linux bundle

<details>
<summary><strong>Packaging note</strong></summary>

The build scripts produce browser-extension artifacts so you can test or distribute the project in a realistic way.

</details>

### Development commands

```bash
npm install
npm run build
npm run dist
npm run pack:dmg
npm run pack:exe
npm run pack:linux
```

## Project layout

<details>
<summary><strong>Open the structure</strong></summary>

```text
.
├── background.js        # Service worker and runtime routing
├── content.js           # Page transformation and demo behavior
├── demo.js              # Public landing page interactions
├── index.html           # Visual public homepage / demo page
├── manifest.json        # Extension manifest
├── popup.html           # Extension popup UI
├── popup.js             # Popup interactions
├── popup.css            # Popup styling
├── styles.css           # Public site styling
├── assets/
│   └── overview.svg     # Visual overview diagram
└── scripts/
    ├── build.js         # Build extension package
    ├── pack-dmg.js      # macOS bundle builder
    ├── pack-exe.js      # Windows bundle builder
    └── pack-linux.js    # Linux bundle builder
```

</details>

## What a professor would likely ask

<details>
<summary><strong>How did you decide the scope?</strong></summary>

The scope is intentionally focused: one clear pain point, one visible demo, and one workable extension workflow.

</details>

<details>
<summary><strong>What is the hardest technical part?</strong></summary>

Keeping the architecture flexible enough to support remote, local, and fallback runtime paths without making the UI confusing.

</details>

<details>
<summary><strong>What would you improve next?</strong></summary>

I would add stronger tests, richer screenshots, and a more complete evaluation of user experience for different reading contexts.

</details>

## Privacy

- No extension server is required
- No usage analytics are included
- Content processing stays inside the selected runtime path
- API keys remain in the browser environment

## Browser support

| Browser | Status |
| --- | --- |
| Chrome | Supported |
| Edge | Supported |
| Firefox | Not targeted yet |

## FAQ

<details>
<summary><strong>Is this a desktop app?</strong></summary>

No. It is a browser extension with packaged installs for different platforms.

</details>

<details>
<summary><strong>Do I need an API key?</strong></summary>

Not for the demo. The extension has fallback paths so the project remains usable in local and offline-friendly setups.

</details>

<details>
<summary><strong>Why keep the README interactive?</strong></summary>

Because the project itself is interactive. The README should behave like a guided project presentation, not only a static specification.

</details>

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a branch
3. Open a pull request

## References

These are the main sources that informed the project’s accessibility and extension design:

- [Chrome Extensions Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Microsoft Edge Extension docs](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI accessibility tutorials](https://www.w3.org/WAI/tutorials/)
- [Microsoft Inclusive Design](https://inclusive.microsoft.design/)

## License

MIT © 2024 Sensory Shield Team
