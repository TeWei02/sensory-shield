# Sensory Shield

**Neutralize distracting web content for neurodiverse users.**

Sensory Shield is a browser extension that transforms overwhelming digital content into calm, accessible reading experiences. It uses AI to:

- ✨ Neutralize emotional language and sensationalism
- 📝 Convert complex text into bullet-pointed summaries  
- 🎨 Apply soothing visual styling
- 🔕 Hide distracting elements (ads, videos, animations)

## Features

- **Automatic content neutralization** using OpenAI's LLM API
- **Neurodiversity-friendly design** with accessible typography and colors
- **Customizable API settings** via browser storage
- **Privacy-first architecture** - your API key stays in your browser
- **Cross-platform support** - macOS (DMG), Windows (EXE), Linux

## Installation

### From Source

1. Clone this repository
2. Customize your API settings (see Configuration section)
3. Load the extension in your browser:
   - Chrome: `chrome://extensions/` → "Load unpacked" → Select folder
   - Edge: `edge://extensions/` → "Load unpacked" → Select folder

### From Pre-built Installers

- **macOS**: Download `.dmg` from releases
- **Windows**: Download `.exe` from releases  
- **Linux**: Download `.tar.gz` from releases

## Configuration

Before using Sensory Shield, you need to configure your OpenAI API key:

1. Open the extension options
2. Enter your OpenAI API key
3. (Optional) Configure custom model or API base URL

### API Key Setup

Visit [OpenAI API keys](https://platform.openai.com/api-keys) to create your API key.

**⚠️ Security Note**: Never share your API key. Keys are stored in browser's encrypted storage.

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

```bash
npm install
```

### Build

```bash
# Build extension package
npm run build

# Build all installers
npm run dist

# Build specific installer
npm run pack:dmg   # macOS DMG
npm run pack:exe   # Windows EXE
npm run pack:linux # Linux package
```

### File Structure

```
.
├── manifest.json        # Chrome extension manifest
├── background.js        # Service worker (LLM processing)
├── content.js           # Content script (page modification)
├── popup.html           # Extension UI
├── popup.js             # Popup script
├── popup.css            # Styling
├── package.json         # Project metadata
└── scripts/
    ├── build.js         # Build extension package
    ├── pack-dmg.js      # macOS DMG builder
    ├── pack-exe.js      # Windows EXE builder
    └── pack-linux.js    # Linux package builder
```

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Supported |
| Edge    | 90+     | ✅ Supported |
| Firefox | 109+    | ⚠️ Pending (needs manifest adaptation) |

## Usage

1. Navigate to any article or text-heavy webpage
2. Click the Sensory Shield icon in your browser toolbar
3. The page will transform with:
   - Removed distracting visual elements
   - Neutral, simplified text extracted
   - AI-processed summary in bullet points

## Privacy & Data

- ✅ No data is stored on extension servers
- ✅ Your API key is encrypted in browser storage
- ✅ Content processing happens on your LLM provider's servers
- ✅ No usage tracking or analytics

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT © 2024 Sensory Shield Team

## Support

For issues or questions:

- Open an issue on GitHub
- Check our documentation
- Email: <tewei.ko0418@gmail.com>

---

**Built with ❤️ for neurodiverse internet users**
