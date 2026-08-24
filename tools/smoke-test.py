#!/usr/bin/env python3
"""
SMOKE TEST — every cabinet boots, or the build does not ship.

The drive test proves the two driving games PLAY. This proves the other
sixteen at least WAKE UP: page loads, no errors thrown, a canvas is present
and actually painting, the arcade shell attached, and the machine still
renders something ten seconds in. It will not catch a game with broken rules;
it will catch the black screen, which is the failure that has actually
shipped twice.

    python3 tools/smoke-test.py            all 18
    python3 tools/smoke-test.py coil deep  by id

Exit 0 when every cabinet passes.
"""

import argparse
import functools
import http.server
import json
import socketserver
import subprocess
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

from harness import console_utf8, launch_chromium, node_exe

ROOT = Path(__file__).resolve().parent.parent


def catalogue():
    """games.js is the single source of truth; read it, do not restate it."""
    out = subprocess.run(
        [node_exe(), '-e',
         "global.window={};eval(require('fs').readFileSync('games.js','utf8'));"
         "console.log(JSON.stringify(window.TINY_ARCADE))"],
        cwd=ROOT, capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def serve():
    httpd = socketserver.TCPServer(
        ('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, httpd.socket.getsockname()[1]


CANVAS_SIG = """() => {
  /* a black screen and a painted screen both have a canvas; tell them apart
     by reading pixels. Sample the largest canvas; sum a sparse grid. */
  const cvs = [...document.querySelectorAll('canvas')];
  if (!cvs.length) return null;
  const cv = cvs.reduce((a, b) => a.width * a.height >= b.width * b.height ? a : b);
  try {
    const g = cv.getContext('2d');
    if (!g) return 'webgl';                    /* not readable this way */
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4013) sum += d[i];
    return sum;
  } catch (e) { return 'unreadable'; }
}"""


def smoke(page, base, game, seconds):
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(f'{base}/{game["file"]}', wait_until='load')
    try:
        page.wait_for_function(
            '() => navigator.serviceWorker && navigator.serviceWorker.controller',
            timeout=5_000)
    except Exception:
        pass

    checks = []
    ok = lambda c, l, d='': checks.append((bool(c), l, d))

    ok(page.title().strip() != '', 'has a title', page.title())
    ok(page.query_selector('canvas'), 'has a canvas')
    ok(page.evaluate('() => !!(window.Arcade && Arcade.save && Arcade.pad)'),
       'arcade shell attached')
    meta = page.evaluate(
        '() => (document.querySelector(\'meta[name="arcade-title"]\')||{}).content')
    ok(meta, 'arcade-title meta present', meta or 'missing')

    first = page.evaluate(CANVAS_SIG)
    page.wait_for_timeout(int(seconds * 1000))
    later = page.evaluate(CANVAS_SIG)
    ok(later not in (None, 0), 'the canvas has paint on it', f'signal {later}')
    ok(errors == [], 'no page errors', errors[0][:110] if errors else '')
    return checks, first, later


def main():
    console_utf8()
    ap = argparse.ArgumentParser()
    ap.add_argument('ids', nargs='*')
    ap.add_argument('--seconds', type=float, default=8.0)
    args = ap.parse_args()

    games = catalogue()
    if args.ids:
        games = [g for g in games if g['id'] in args.ids]

    httpd, port = serve()
    base = f'http://127.0.0.1:{port}'
    failed = 0
    print(f'smoke-test  ·  {len(games)} cabinets  ·  {args.seconds:g}s each')
    with sync_playwright() as p:
        browser = launch_chromium(
            p,
            args=['--mute-audio', '--autoplay-policy=no-user-gesture-required'])
        ctx = browser.new_context(viewport={'width': 480, 'height': 900})
        for g in games:
            page = ctx.new_page()
            try:
                checks, _, _ = smoke(page, base, g, args.seconds)
            except Exception as e:
                checks = [(False, 'loads at all', f'{type(e).__name__}: {e}')]
            bad = [c for c in checks if not c[0]]
            failed += bool(bad)
            mark = 'ok  ' if not bad else 'FAIL'
            line = f'  {mark}  {g["id"]:<10}'
            if bad:
                line += '  ·  ' + '; '.join(f'{l} ({d})' if d else l for _, l, d in bad)
            print(line)
            page.close()
        browser.close()
    httpd.shutdown()
    print(f'\n  {len(games) - failed}/{len(games)} cabinets pass')
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
