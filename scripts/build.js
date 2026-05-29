#!/usr/bin/env node

/**
 * build.js - Package the Chrome extension
 * Creates a zip file containing the extension source
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const mkdirp = require('mkdirp');

const DIR = path.dirname(__dirname);
const DIST_DIR = path.join(DIR, 'dist');
const BUILD_DIR = path.join(DIR, 'build');

const FILES_TO_INCLUDE = [
    'manifest.json',
    'background.js',
    'content.js',
    'popup.html',
    'popup.js',
    'popup.css',
];

async function build() {
    try {
        // Create directories
        await mkdirp(DIST_DIR);
        await mkdirp(BUILD_DIR);

        const output = fs.createWriteStream(path.join(DIST_DIR, 'sensory-shield.zip'));
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.pipe(output);

        // Add files
        for (const file of FILES_TO_INCLUDE) {
            const filePath = path.join(DIR, file);
            if (fs.existsSync(filePath)) {
                archive.file(filePath, { name: file });
            }
        }

        await archive.finalize();

        console.log('✅ Extension packaged: dist/sensory-shield.zip');
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

build();
