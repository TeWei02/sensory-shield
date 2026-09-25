#!/usr/bin/env python3
"""Run the behavioural harness in headless Chrome and report every assertion.

Standard library only. The harness page drives content.js and background.js
against a stubbed chrome.* surface, so no browser profile, network access or
extension install is needed.

Exit code is 0 only when every assertion passes.
"""

import json
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HARNESS = os.path.join(ROOT, "tests", "harness.html")

CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser",
    "chrome",
]

FLAGS = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--allow-file-access-from-files",
    "--virtual-time-budget=20000",
    "--dump-dom",
]


def find_browser():
    for name in CANDIDATES:
        if os.path.isabs(name):
            if os.path.isfile(name) and os.access(name, os.X_OK):
                return name
        else:
            found = shutil.which(name)
            if found:
                return found
    return None


def run(browser):
    url = "file://" + HARNESS
    proc = subprocess.run(
        [browser] + FLAGS + [url],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=180,
    )
    dom = proc.stdout.decode("utf-8", "replace")
    match = re.search(r"SSJSON_START(.*?)SSJSON_END", dom, re.S)
    if not match:
        tail = proc.stderr.decode("utf-8", "replace").strip().splitlines()[-5:]
        print("harness did not report results", file=sys.stderr)
        for line in tail:
            print("  " + line, file=sys.stderr)
        return None
    return json.loads(match.group(1))


def main():
    browser = find_browser()
    if not browser:
        print("no Chrome/Chromium executable found; skipping behavioural harness")
        return 0
    try:
        results = run(browser)
    except subprocess.TimeoutExpired:
        print("timed out waiting for the harness", file=sys.stderr)
        return 1
    if results is None:
        return 1

    failed = [r for r in results if not r["ok"]]
    for r in results:
        mark = "PASS" if r["ok"] else "FAIL"
        detail = (" -- " + r["detail"]) if r["detail"] else ""
        print("[%s] %s%s" % (mark, r["name"], detail))
    print("\n%d/%d assertions passed" % (len(results) - len(failed), len(results)))
    if failed:
        print("FAILURES:")
        for r in failed:
            print(" - %s: %s" % (r["name"], r["detail"]))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
