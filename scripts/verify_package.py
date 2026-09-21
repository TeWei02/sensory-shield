#!/usr/bin/env python3
"""Static verification of the Sensory Shield extension release.

This is the release gate. It runs on the Python standard library only (no node,
no third-party packages) and checks:

  1. manifest.json is valid MV3 and satisfies the fields Chrome requires.
  2. Every file referenced by the manifest exists on disk.
  3. Icons are square PNGs at exactly the declared sizes.
  4. Shipped files contain no placeholder scaffolding, no authoring artefacts and
     no external CDN references.
  5. The published GitHub Pages tree (docs/) is byte-identical to the source tree.
  6. The built zip has manifest.json at its root, contains the expected payload
     and passes archive integrity checks.

Exit code 0 means the release is verifiable; any failure returns non-zero.
"""

import hashlib
import json
import os
import re
import struct
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FAILURES = []
CHECKS = 0

# Text files that are scanned for banned markers / CDN references.
SCAN_SUFFIXES = (".js", ".json", ".html", ".css", ".md", ".yml", ".yaml", ".py")
SCAN_SKIP_DIRS = {".git", "dist", "node_modules", "__pycache__", "downloads"}
SCAN_SKIP_FILES = {"verify_package.py", "build_zip.py", "make_icons.py"}

# Unresolved scaffolding and authoring artefacts that must never ship.
BANNED = [
    (r"\byour[-_]?username\b", "template repository placeholder"),
    (r"\byour[-_]?name\b", "template author placeholder"),
    (r"\bTODO\b", "unfinished marker"),
    (r"\bFIXME\b", "unfinished marker"),
    (r"\bDavin\b", "authoring artefact"),
    (r"\bCopilot\b", "authoring artefact"),
    (r"\bGenAI\b", "authoring artefact"),
    (r"生成式\s*AI", "authoring artefact"),
    (r"lorem ipsum", "filler text"),
    (r"example\.com/(your|repo)", "template URL"),
    (r"sk-[A-Za-z0-9]{24,}", "hard-coded API key"),
]

CDN_PATTERNS = r"(unpkg\.com|cdn\.jsdelivr|fonts\.googleapis|fonts\.gstatic|cdnjs\.cloudflare)"

REQUIRED_ZIP_ENTRIES = [
    "manifest.json",
    "background.js",
    "content.js",
    "popup.html",
    "popup.js",
    "popup.css",
    "icons/icon16.png",
    "icons/icon32.png",
    "icons/icon48.png",
    "icons/icon128.png",
]

# docs/<path> <- repo/<path>
SITE_MIRROR = ["index.html", "styles.css", "demo.js", "assets/overview.svg"]

PAGES_URL = "https://tewei02.github.io/sensory-shield/"


def check(name, ok, detail=""):
    global CHECKS
    CHECKS += 1
    print(f"[{'PASS' if ok else 'FAIL'}] {name}" + (f" -- {detail}" if detail else ""))
    if not ok:
        FAILURES.append(f"{name}: {detail}" if detail else name)


def sha256(path):
    digest = hashlib.sha256()
    with open(path, "rb") as fh:
        for block in iter(lambda: fh.read(65536), b""):
            digest.update(block)
    return digest.hexdigest()


def png_size(path):
    with open(path, "rb") as fh:
        head = fh.read(24)
    if head[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return struct.unpack(">II", head[16:24])


def iter_scan_files():
    for current, dirs, names in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SCAN_SKIP_DIRS]
        for name in sorted(names):
            if name in SCAN_SKIP_FILES or name.endswith(".bak"):
                continue
            if name.endswith(SCAN_SUFFIXES):
                yield os.path.join(current, name)


def main():
    manifest_path = os.path.join(ROOT, "manifest.json")
    check("manifest.json exists", os.path.isfile(manifest_path))
    with open(manifest_path, encoding="utf-8") as fh:
        manifest = json.load(fh)
    check("manifest.json parses as an object", isinstance(manifest, dict))

    check("manifest_version == 3", manifest.get("manifest_version") == 3)
    check("name is set", bool(manifest.get("name")))
    desc = manifest.get("description", "")
    check("description present and <= 132 chars", 0 < len(desc) <= 132, f"len={len(desc)}")
    version = str(manifest.get("version", ""))
    check("version is 1-4 dot-separated integers",
          bool(re.fullmatch(r"\d+(\.\d+){0,3}", version)), version)
    check("homepage_url points at the published site",
          manifest.get("homepage_url") == PAGES_URL, str(manifest.get("homepage_url")))
    check("minimum_chrome_version declared",
          bool(manifest.get("minimum_chrome_version")), str(manifest.get("minimum_chrome_version")))

    refs = []
    action = manifest.get("action", {})
    if action.get("default_popup"):
        refs.append(action["default_popup"])
        for rel in (action.get("default_icon") or {}).values():
            refs.append(rel)
    for rel in (manifest.get("icons") or {}).values():
        refs.append(rel)
    sw = manifest.get("background", {}).get("service_worker")
    if sw:
        refs.append(sw)
    for cs in manifest.get("content_scripts", []):
        refs.extend(cs.get("js", []))
        refs.extend(cs.get("css", []))
        check("content script match pattern present", bool(cs.get("matches")))

    for size, rel in (manifest.get("icons") or {}).items():
        path = os.path.join(ROOT, rel)
        ok = os.path.isfile(path) and png_size(path) == (int(size), int(size))
        check(f"icon {size}px is a square PNG of that size", ok, rel)

    for rel in sorted(set(refs)):
        check(f"manifest reference exists: {rel}", os.path.isfile(os.path.join(ROOT, rel)))

    check("all_urls declared for content scripts",
          any("<all_urls>" in cs.get("matches", []) for cs in manifest.get("content_scripts", [])))
    permissions = set(manifest.get("permissions", []))
    check("storage permission declared", "storage" in permissions)
    check("scripting permission declared", "scripting" in permissions)
    check("activeTab permission declared", "activeTab" in permissions)
    check("host permission declared for user-configured endpoints",
          "<all_urls>" in set(manifest.get("host_permissions", [])),
          str(manifest.get("host_permissions")))

    for path in iter_scan_files():
        rel = os.path.relpath(path, ROOT).replace(os.sep, "/")
        try:
            text = open(path, encoding="utf-8").read()
        except UnicodeDecodeError:
            continue
        for pattern, label in BANNED:
            hit = re.search(pattern, text, re.IGNORECASE)
            check(f"{rel} free of banned pattern ({label})", hit is None,
                  hit.group(0) if hit else "")
        if rel.endswith((".html", ".css")):
            cdn = re.search(CDN_PATTERNS, text)
            check(f"{rel} has no external CDN reference", cdn is None,
                  cdn.group(0) if cdn else "")

    for readme in ("README.md", "README.zh-TW.md"):
        path = os.path.join(ROOT, readme)
        if os.path.isfile(path):
            text = open(path, encoding="utf-8").read()
            check(f"{readme} links the published site", PAGES_URL in text)
            check(f"{readme} documents the license", "MIT" in text)

    check("INSTALL.md exists", os.path.isfile(os.path.join(ROOT, "INSTALL.md")))
    check("LICENSE exists", os.path.isfile(os.path.join(ROOT, "LICENSE")))

    # docs/ mirror must match the source tree
    for rel in SITE_MIRROR:
        src = os.path.join(ROOT, rel)
        dst = os.path.join(ROOT, "docs", rel)
        if not os.path.isfile(src) or not os.path.isfile(dst):
            check(f"docs mirror present: docs/{rel}", False)
            continue
        check(f"docs/{rel} is identical to {rel}", sha256(src) == sha256(dst))

    check("docs/.nojekyll present", os.path.isfile(os.path.join(ROOT, "docs", ".nojekyll")))

    # package
    zip_path = os.path.join(ROOT, "dist", f"sensory-shield-{version}.zip")
    check("dist zip exists", os.path.isfile(zip_path), zip_path)
    if os.path.isfile(zip_path):
        with zipfile.ZipFile(zip_path) as zf:
            names = zf.namelist()
            check("zip has manifest.json at its root", "manifest.json" in names)
            check("zip has no nested root folder",
                  not any(n.startswith(("sensory-shield/", "./")) for n in names))
            for entry in REQUIRED_ZIP_ENTRIES:
                check(f"zip contains {entry}", entry in names)
            check("zip excludes development files",
                  not any(n.startswith(("node_modules/", ".github/", "scripts/", "dist/", "docs/"))
                          for n in names))
            check("zip carries no README or docs payload",
                  not any(n.lower().endswith((".md", ".svg")) for n in names))
            bad = zf.testzip()
            check("zip integrity", bad is None, str(bad))
            try:
                packaged = json.loads(zf.read("manifest.json").decode("utf-8"))
                check("packaged manifest matches repository manifest",
                      packaged.get("version") == version and packaged.get("name") == manifest.get("name"))
            except Exception as exc:  # pragma: no cover - defensive
                check("packaged manifest readable", False, str(exc))

        served = os.path.join(ROOT, "docs", "downloads", f"sensory-shield-{version}.zip")
        check("published copy of the zip exists", os.path.isfile(served), served)
        if os.path.isfile(served):
            check("published zip is identical to dist zip",
                  sha256(served) == sha256(zip_path))

    print(f"\n{CHECKS - len(FAILURES)}/{CHECKS} checks passed")
    if FAILURES:
        print("FAILURES:")
        for failure in FAILURES:
            print(" -", failure)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
