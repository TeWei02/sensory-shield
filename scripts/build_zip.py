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

# Fixed timestamp so that two builds of the same sources produce byte-identical
# archives (source mtimes do not leak into the published zip). Must stay >= 1980.
ZIP_TIMESTAMP = (2026, 1, 1, 0, 0, 0)


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


def write_entry(zf, src, rel):
    """Write one payload file with a fixed timestamp (reproducible archive)."""
    with open(src, "rb") as fh:
        data = fh.read()
    info = zipfile.ZipInfo(rel, date_time=ZIP_TIMESTAMP)
    info.compress_type = zipfile.ZIP_DEFLATED
    info.external_attr = 0o644 << 16
    zf.writestr(info, data)


def warn_stale_archives(version):
    """Report leftover archives of other versions; they are never deleted here."""
    stale = []
    for folder in (DIST, DOCS_DOWNLOADS):
        if not os.path.isdir(folder):
            continue
        for name in sorted(os.listdir(folder)):
            if not name.startswith("sensory-shield-") or not name.endswith(".zip"):
                continue
            if name != f"sensory-shield-{version}.zip":
                stale.append(os.path.relpath(os.path.join(folder, name), ROOT))
    return stale


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
            write_entry(zf, src, rel)

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
        "stale_archives": warn_stale_archives(version),
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(build())
