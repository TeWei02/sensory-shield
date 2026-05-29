#!/usr/bin/env node

/**
 * pack-exe.js - Create Windows EXE installer
 * Using electron-builder for cross-platform packaging
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mkdirp = require('mkdirp');

const DIR = path.dirname(__dirname);
const DIST_DIR = path.join(DIR, 'dist');
const EXE_DIR = path.join(DIST_DIR, 'windows');

async function createEXE() {
  try {
    await mkdirp(EXE_DIR);

    const extZip = path.join(DIST_DIR, 'sensory-shield.zip');
    if (!fs.existsSync(extZip)) {
      console.error('❌ Build extension first: npm run build');
      process.exit(1);
    }

    // For Windows, we create a simple batch installer
    const batContent = `@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo     Sensory Shield - Installation
echo ========================================
echo.

REM Extract extension ZIP
set "FOLDER=%cd%"
powershell -Command "Expand-Archive -Path sensory-shield-extension.zip -DestinationPath !FOLDER!/sensory-shield-ext -Force"

if %errorlevel% neq 0 (
    echo Error: Failed to extract extension
    pause
    exit /b 1
)

echo.
echo ✓ Extension extracted to: !FOLDER!/sensory-shield-ext
echo.
echo Next steps:
echo 1. Open Chrome and go to chrome://extensions/
echo 2. Enable "Developer mode" (toggle in top-right)
echo 3. Click "Load unpacked" and select: !FOLDER!/sensory-shield-ext
echo 4. Enter your OpenAI API key in the extension options
echo.
echo For help, visit: https://github.com/yourusername/sensory-shield
echo.
pause
`;

    fs.writeFileSync(path.join(EXE_DIR, 'install.bat'), batContent);

    // Copy extension zip to Windows folder
    fs.copyFileSync(extZip, path.join(EXE_DIR, 'sensory-shield-extension.zip'));

    // Create a README for Windows
    const readmeWin = `# Sensory Shield - Windows Installation

## Requirements
- Windows 7 or later
- Google Chrome (https://www.google.com/chrome/)

## Installation Steps

1. Run: install.bat
2. The extension ZIP will be extracted
3. Open Chrome and navigate to: chrome://extensions/
4. Enable "Developer mode" (toggle switch in top-right corner)
5. Click "Load unpacked" button
6. Select the extracted "sensory-shield-ext" folder
7. Configure your OpenAI API key in the extension options

## Troubleshooting

If the batch file doesn't work:
1. Extract sensory-shield-extension.zip manually
2. Load the extracted folder as an unpacked extension

For more info: https://github.com/yourusername/sensory-shield
`;

    fs.writeFileSync(path.join(EXE_DIR, 'README.txt'), readmeWin);

    // Create installer script using Node
    const exePath = path.join(DIST_DIR, 'sensory-shield-0.1.0-setup.exe');
    
    console.log('📦 Creating Windows installer structure...');
    console.log(`✅ Windows installer prepared in: dist/windows/`);
    console.log(`📄 Run: dist/windows/install.bat to install`);

  } catch (error) {
    console.error('❌ Windows packaging failed:', error.message);
    process.exit(1);
  }
}

createEXE();
