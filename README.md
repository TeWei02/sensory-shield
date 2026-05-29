# Sensory Shield

> Calm the web. Keep the meaning. Reduce the noise.

![Sensory Shield overview](assets/overview.svg)

Sensory Shield is a browser extension for neurodiverse users and anyone who wants a calmer reading experience.
It turns dense, distracting pages into clearer, more structured content with a strong visual contrast between
**overload** and **calm**.

## Highlights

- **Visual demo** — a public landing page with a live calm / overload preview
- **Real extension workflow** — Chrome/Edge extension built for Manifest V3
- **AI-ready architecture** — supports remote, local, and heuristic runtime modes
- **Readable output** — simplified text, bullet summaries, and reduced visual distraction
- **Installer bundles** — downloadable packages for macOS, Windows, and Linux

## Demo

Open the landing page in this repo and try the contrast switcher:

- [Live demo page](index.html)
- [Architecture overview](assets/overview.svg)
- [Deployment notes](DEPLOY.md)

## What it does

Sensory Shield focuses on three things:

1. **Neutralize** emotional or sensational language
2. **Simplify** content into cleaner, easier-to-scan structure
3. **Reduce** visual overload with calmer styling and fewer distractions

It is designed to help users who prefer more deliberate, lower-stimulation interfaces.

## Runtime modes

The extension supports multiple ways to run the rewrite flow:

| Mode | Purpose |
| --- | --- |
| Remote LLM | Use an OpenAI-compatible API for cloud-based rewriting |
| Local runtime | Use a localhost model for private or offline demos |
| Heuristic fallback | Keep the demo working even without an API key |

## Installation

### Load from source

1. Clone this repository
2. Open Chrome or Edge
3. Go to the extensions page
4. Enable developer mode
5. Choose **Load unpacked** and select this folder

### Use the packaged downloads

This project also provides installer bundles for distribution and testing. These are extension packages, not desktop apps.

- macOS bundle
- Windows bundle
- Linux bundle

## Development

### Requirements

- Node.js 16+
- npm

### Install dependencies

```bash
npm install
```

### Build the extension

```bash
npm run build
```

### Create all distribution bundles

```bash
npm run dist
```

### Build individual bundles

```bash
npm run pack:dmg
npm run pack:exe
npm run pack:linux
```

## Project layout

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

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a branch
3. Open a pull request

## License

MIT © 2024 Sensory Shield Team
