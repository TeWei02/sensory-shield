#!/usr/bin/env python3
"""把 Sensory Shield 打包成 Firefox 版（MV3 事件頁）可載入的 zip。

與 Chrome 版的差異只有 manifest 一處：
  Chrome  "background": { "service_worker": "background.js" }
  Firefox "background": { "scripts": ["background.js"] }   ← Firefox 尚未支援
          MV3 service worker，改用事件頁
另外補上 browser_specific_settings.gecko（Firefox 需要擴充功能 ID），
並移除 Firefox 不認的 minimum_chrome_version。

輸出：
  dist/sensory-shield-<version>-firefox.zip      about:debugging 暫時載入 / AMO 簽署用
  dist/sensory-shield-<version>-firefox-src/     解開後的目錄，方便直接檢視

只用標準函式庫，不需要 node/npm。
"""
import json
import os
import shutil
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
PAYLOAD = ["background.js", "content.js", "popup.html", "popup.js", "popup.css"]
ASSET_DIRS = ["icons"]
ZIP_TIMESTAMP = (2026, 1, 1, 0, 0, 0)


def main():
    src = os.path.join(ROOT, "manifest.firefox.json")
    if not os.path.isfile(src):
        raise SystemExit("找不到 manifest.firefox.json")
    with open(src, encoding="utf-8") as fh:
        manifest = json.load(fh)
    version = manifest["version"]

    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, f"sensory-shield-{version}-firefox.zip")
    src_dir = os.path.join(DIST, f"sensory-shield-{version}-firefox-src")
    if os.path.isdir(src_dir):
        shutil.rmtree(src_dir)
    os.makedirs(src_dir)

    # 攤平目錄：manifest.json 必須在壓縮檔最上層
    with open(os.path.join(src_dir, "manifest.json"), "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, ensure_ascii=False, indent=2)
        fh.write("\n")

    entries = ["manifest.json"]
    for name in PAYLOAD:
        p = os.path.join(ROOT, name)
        if not os.path.isfile(p):
            raise SystemExit(f"缺少必要檔案：{name}")
        shutil.copy2(p, os.path.join(src_dir, name))
        entries.append(name)
    for d in ASSET_DIRS:
        s = os.path.join(ROOT, d)
        if os.path.isdir(s):
            shutil.copytree(s, os.path.join(src_dir, d))
            for f in sorted(os.listdir(s)):
                entries.append(f"{d}/{f}")

    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for rel in entries:
            info = zipfile.ZipInfo(rel, date_time=ZIP_TIMESTAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            with open(os.path.join(src_dir, rel), "rb") as fh:
                z.writestr(info, fh.read())

    print(json.dumps({
        "archive": os.path.relpath(out, ROOT),
        "unpacked_dir": os.path.relpath(src_dir, ROOT),
        "version": version,
        "size_kb": round(os.path.getsize(out) / 1024, 1),
        "entries": entries,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
