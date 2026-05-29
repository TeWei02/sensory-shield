#!/usr/bin/env node

/**
 * pack-dmg.js - Create macOS DMG installer
 * Requires hdiutil (macOS built-in)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mkdirp = require('mkdirp');

const DIR = path.dirname(__dirname);
const DIST_DIR = path.join(DIR, 'dist');
const DMG_TEMP = path.join(DIST_DIR, '.dmg-temp');
const DMG_FILE = path.join(DIST_DIR, 'sensory-shield-0.1.0.dmg');

async function createDMG() {
    try {
        if (process.platform !== 'darwin') {
            console.warn('⚠️  DMG packaging only works on macOS');
            console.log('📦 Skipping DMG creation on', process.platform);
            return;
        }

        await mkdirp(DMG_TEMP);

        // Copy extension to DMG temp folder
        const extZip = path.join(DIST_DIR, 'sensory-shield.zip');
        if (!fs.existsSync(extZip)) {
            console.error('❌ Build extension first: npm run build');
            process.exit(1);
        }

        // Create a simple folder structure for DMG
        const appDir = path.join(DMG_TEMP, 'Sensory Shield');
        await mkdirp(appDir);

        fs.copyFileSync(extZip, path.join(appDir, 'sensory-shield-extension.zip'));

        // Create README for DMG
        const readmeContent = `# Sensory Shield - Chrome Extension

## Installation Instructions

1. Extract the sensory-shield-extension.zip file
2. Open Chrome and go to chrome://extensions/
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked" and select the extracted folder

## Configuration

1. Open the extension options
2. Enter your OpenAI API key
3. Start neutralizing pages!

For more info, visit: https://github.com/yourusername/sensory-shield
`;

        fs.writeFileSync(path.join(DMG_TEMP, 'README.txt'), readmeContent);

        // Remove old DMG if exists
        if (fs.existsSync(DMG_FILE)) {
            fs.unlinkSync(DMG_FILE);
        }

        // Create DMG using hdiutil
        console.log('📦 Creating macOS DMG...');
        execSync(`hdiutil create -volname "Sensory Shield" -srcfolder "${DMG_TEMP}" -ov -format UDBZ "${DMG_FILE}"`, {
            stdio: 'pipe',
        });

        // Clean up
        execSync(`rm -rf "${DMG_TEMP}"`);

        console.log(`✅ macOS DMG created: dist/sensory-shield-0.1.0.dmg`);
    } catch (error) {
        console.error('❌ DMG packaging failed:', error.message);
        process.exit(1);
    }
}

createDMG();
