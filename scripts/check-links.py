#!/usr/bin/env python3
"""
Post-build check for broken internal links. Run after `npm run build`, against
the `dist/` output. Scoped to internal links only (no network calls) — fast
and no flakiness from external sites rate-limiting or timing out in CI.
"""
import os
import re
import sys

DIST = 'dist'
HREF_RE = re.compile(r'href="(/[^"]*)"')

IGNORED_PREFIXES = (
    '/_astro/',  # build-hashed assets, always valid if referenced
)


def build_valid_routes() -> set[str]:
    routes: set[str] = set()
    for root, _dirs, files in os.walk(DIST):
        for name in files:
            full = os.path.join(root, name)
            rel = '/' + os.path.relpath(full, DIST).replace(os.sep, '/')
            routes.add(rel)
            if rel.endswith('/index.html'):
                routes.add(rel[: -len('index.html')])
                routes.add(rel[: -len('/index.html')])
    return routes


def normalize(href: str) -> str:
    href = href.split('#', 1)[0].split('?', 1)[0]
    if not href:
        return '/'
    return href


def main() -> int:
    if not os.path.isdir(DIST):
        print(f'No {DIST}/ directory found — run `npm run build` first.')
        return 1

    valid_routes = build_valid_routes()
    broken: dict[str, set[str]] = {}

    for root, _dirs, files in os.walk(DIST):
        for name in files:
            if not name.endswith('.html'):
                continue
            full = os.path.join(root, name)
            page = '/' + os.path.relpath(full, DIST).replace(os.sep, '/')
            with open(full, encoding='utf-8') as f:
                content = f.read()

            for m in HREF_RE.finditer(content):
                href = normalize(m.group(1))
                if any(href.startswith(p) for p in IGNORED_PREFIXES):
                    continue
                if href in valid_routes or (href + '/') in valid_routes or (href.rstrip('/')) in valid_routes:
                    continue
                broken.setdefault(href, set()).add(page)

    if broken:
        print(f'Found {len(broken)} broken internal link(s):\n')
        for href, pages in sorted(broken.items()):
            print(f'  {href}')
            for page in sorted(pages):
                print(f'      referenced from {page}')
        return 1

    print('Internal link check passed.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
