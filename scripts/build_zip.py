#!/usr/bin/env python3
"""Package Sensory Shield as a distributable Chrome/Edge extension zip.

Standard library only (no node/npm required).

Outputs:
  dist/sensory-shield-<version>.zip           - load-unpacked / Web Store upload archive
  docs/downloads/sensory-shield-<version>.zip - copy served by the GitHub Pages landing page

It also syncs the static landing page into docs/ so that the published site and
the repository copy cannot drift apart.
"""

import json
import os
import shutil
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
DOCS = os.path.join(ROOT, "docs")
DOCS_DOWNLOADS = os.path.join(DOCS, "downloads")

# Extension payload, in the order Chrome reads it. manifest.json must be first.
PAYLOAD = [
    "manifest.json",
    "background.js",
    "content.js",
    "popup.html",
    "popup.js",
    "popup.css",
]
ASSET_DIRS = ["icons"]

# Files copied into docs/ for GitHub Pages.
SITE_FILES = ["index.html", "styles.css", "demo.js"]
SITE_ASSETS = ["assets/overview.svg", "assets/icon128.png", "icons/icon128.png"]


def read_manifest():
    with open(os.path.join(ROOT, "manifest.json"), encoding="utf-8") as fh:
        return json.load(fh)


def collect_payload():
    files = []
    for name in PAYLOAD:
        path = os.path.join(ROOT, name)
        if not os.path.isfile(path):
            raise SystemExit(f"missing required extension file: {name}")
        files.append((path, name))
    for dirname in ASSET_DIRS:
        base = os.path.join(ROOT, dirname)
        if not os.path.isdir(base):
            continue
        for current, _dirs, names in os.walk(base):
            for name in sorted(names):
                if name.startswith("."):
                    continue
                full = os.path.join(current, name)
                rel = os.path.relpath(full, ROOT).replace(os.sep, "/")
                files.append((full, rel))
    return files


def sync_site():
    os.makedirs(DOCS, exist_ok=True)
    os.makedirs(os.path.join(DOCS, "assets"), exist_ok=True)
    os.makedirs(os.path.join(DOCS, "icons"), exist_ok=True)

    copied = []
    for rel in SITE_FILES:
        src = os.path.join(ROOT, rel)
        dst = os.path.join(DOCS, rel)
        shutil.copyfile(src, dst)
        copied.append(rel)
    for rel in SITE_ASSETS:
        src = os.path.join(ROOT, rel)
        if not os.path.isfile(src):
            continue
        dst = os.path.join(DOCS, rel)
        shutil.copyfile(src, dst)
        copied.append(rel)

    # Tell GitHub Pages not to run Jekyll over the published tree.
    with open(os.path.join(DOCS, ".nojekyll"), "w", encoding="utf-8") as fh:
        fh.write("")
    return copied


def build():
    manifest = read_manifest()
    version = manifest["version"]
    files = collect_payload()

    os.makedirs(DIST, exist_ok=True)
    os.makedirs(DOCS_DOWNLOADS, exist_ok=True)
    site_files = sync_site()

    out = os.path.join(DIST, f"sensory-shield-{version}.zip")
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for src, rel in files:
            zf.write(src, rel)

    served = os.path.join(DOCS_DOWNLOADS, os.path.basename(out))
    shutil.copyfile(out, served)

    print(json.dumps({
        "version": version,
        "zip": out,
        "served_copy": served,
        "bytes": os.path.getsize(out),
        "size_kb": round(os.path.getsize(out) / 1024, 1),
        "zip_entries": [rel for _src, rel in files],
        "site_files": site_files,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(build())
