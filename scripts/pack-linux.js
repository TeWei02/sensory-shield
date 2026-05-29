#!/usr/bin/env node

/**
 * pack-linux.js - Create Linux installer/package
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const mkdirp = require('mkdirp');

const DIR = path.dirname(__dirname);
const DIST_DIR = path.join(DIR, 'dist');
const LINUX_DIR = path.join(DIST_DIR, 'linux');

async function createLinuxPackage() {
    try {
        await mkdirp(LINUX_DIR);

        const extZip = path.join(DIST_DIR, 'sensory-shield.zip');
        if (!fs.existsSync(extZip)) {
            console.error('❌ Build extension first: npm run build');
            process.exit(1);
        }

        // Create a Linux installation script
        const installScript = `#!/bin/bash

set -e

echo "=========================================="
echo "Sensory Shield - Linux Installation"
echo "=========================================="
echo ""

INSTALL_DIR="$HOME/.local/share/sensory-shield"
mkdir -p "$INSTALL_DIR"

echo "📦 Installing Sensory Shield to $INSTALL_DIR..."

# Extract extension
unzip -q sensory-shield-extension.zip -d "$INSTALL_DIR/ext"

echo "✓ Extension installed"
echo ""
echo "Next steps:"
echo "1. Open Chrome/Chromium and go to: chrome://extensions/"
echo "2. Enable 'Developer mode' (toggle in top-right)"
echo "3. Click 'Load unpacked' and select:"
echo "   $INSTALL_DIR/ext"
echo "4. Enter your OpenAI API key in extension options"
echo ""
echo "Installation location: $INSTALL_DIR"
echo ""
echo "For help: https://github.com/yourusername/sensory-shield"
`;

        fs.writeFileSync(path.join(LINUX_DIR, 'install.sh'), installScript);
        fs.chmodSync(path.join(LINUX_DIR, 'install.sh'), 0o755);

        // Create uninstall script
        const uninstallScript = `#!/bin/bash

set -e

INSTALL_DIR="$HOME/.local/share/sensory-shield"

if [ -d "$INSTALL_DIR" ]; then
    echo "Removing Sensory Shield from $INSTALL_DIR..."
    rm -rf "$INSTALL_DIR"
    echo "✓ Uninstalled successfully"
else
    echo "Sensory Shield not found in $INSTALL_DIR"
fi
`;

        fs.writeFileSync(path.join(LINUX_DIR, 'uninstall.sh'), uninstallScript);
        fs.chmodSync(path.join(LINUX_DIR, 'uninstall.sh'), 0o755);

        // Create README for Linux
        const readmeLinux = `# Sensory Shield - Linux Installation

## Requirements
- Linux distribution with shell support
- Google Chrome or Chromium browser
- unzip utility

## Installation

1. Make the install script executable (if needed):
   \`\`\`
   chmod +x install.sh
   \`\`\`

2. Run the installer:
   \`\`\`
   ./install.sh
   \`\`\`

3. Follow the on-screen instructions

## Manual Installation

If the script doesn't work:

1. Extract the ZIP file:
   \`\`\`
   mkdir -p ~/.local/share/sensory-shield/ext
   unzip sensory-shield-extension.zip -d ~/.local/share/sensory-shield/ext
   \`\`\`

2. Open Chrome/Chromium: \`chrome://extensions/\`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select: \`~/.local/share/sensory-shield/ext\`

## Configuration

1. Click the Sensory Shield icon
2. Enter your OpenAI API key
3. Start neutralizing pages!

## Uninstallation

Run:
\`\`\`
./uninstall.sh
\`\`\`

For more info: https://github.com/yourusername/sensory-shield
`;

        fs.writeFileSync(path.join(LINUX_DIR, 'README.txt'), readmeLinux);

        // Copy extension zip
        fs.copyFileSync(extZip, path.join(LINUX_DIR, 'sensory-shield-extension.zip'));

        // Create tar.gz archive
        console.log('📦 Creating Linux tar.gz package...');

        const output = fs.createWriteStream(path.join(DIST_DIR, 'sensory-shield-0.1.0-linux.tar.gz'));
        const archive = archiver('tar', { gzip: true });

        archive.pipe(output);

        // Add all files from linux directory
        archive.directory(LINUX_DIR, 'sensory-shield-linux');

        await archive.finalize();

        console.log('✅ Linux package created: dist/sensory-shield-0.1.0-linux.tar.gz');

    } catch (error) {
        console.error('❌ Linux packaging failed:', error.message);
        process.exit(1);
    }
}

createLinuxPackage();
