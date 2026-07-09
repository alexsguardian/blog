#!/usr/bin/env python3
"""
PR content gate for blog posts. Catches the class of bug that shipped silently
before: leftover placeholder stubs, a misplaced FTC disclaimer, and images
with no alt text. Stdlib only, no deps to install/pin.

Exit code 1 (and a summary of every finding) if anything is wrong.
"""
import glob
import re
import sys

POSTS_GLOB = 'src/data/posts/**/*.mdx'
DRAFTS_PREFIX = 'src/data/posts/drafts/'

PLACEHOLDER_PATTERNS = [
    r'\[previous [a-z ]*content[^\]]*\]',
    r'\[insert[^\]]*\]',
    r'\[add [a-z ]*here\]',
    r'\[placeholder[^\]]*\]',
    r'\[your content here\]',
    r'\btodo\b\s*:',
    r'\bfixme\b',
    r'\[tbd\]',
    r'lorem ipsum',
]
PLACEHOLDER_RE = re.compile('|'.join(PLACEHOLDER_PATTERNS), re.IGNORECASE)

# Astro <Image ... /> with no alt attr, or alt="" / alt='' (empty).
JSX_IMAGE_RE = re.compile(r'<Image\b(?![^>]*\balt=)[^>]*/?>', re.IGNORECASE)
JSX_IMAGE_EMPTY_ALT_RE = re.compile(r'<Image\b[^>]*\balt=["\']\s*["\'][^>]*/?>', re.IGNORECASE)
# Markdown ![]() with empty alt text.
MD_IMAGE_EMPTY_ALT_RE = re.compile(r'!\[\s*\]\([^)]+\)')


def strip_frontmatter(text: str) -> tuple[str, int]:
    """Returns (body, line_offset_of_body_start)."""
    if not text.startswith('---'):
        return text, 0
    end = text.find('\n---', 3)
    if end == -1:
        return text, 0
    body = text[end + 4:]
    offset = text[: end + 4].count('\n')
    return body, offset


def check_placeholders(path: str, body: str) -> list[str]:
    findings = []
    for m in PLACEHOLDER_RE.finditer(body):
        line = body[: m.start()].count('\n') + 1
        findings.append(f'{path}:{line}: placeholder marker left in content: {m.group(0)!r}')
    return findings


def check_image_alt(path: str, body: str) -> list[str]:
    findings = []
    for pattern, label in (
        (JSX_IMAGE_RE, 'no alt attribute'),
        (JSX_IMAGE_EMPTY_ALT_RE, 'empty alt text'),
        (MD_IMAGE_EMPTY_ALT_RE, 'empty alt text'),
    ):
        for m in pattern.finditer(body):
            line = body[: m.start()].count('\n') + 1
            findings.append(f'{path}:{line}: image with {label}')
    return findings


def check_ftc_position(path: str, body: str) -> list[str]:
    if '<FTCDisclaimer' not in body:
        return []

    lines = body.split('\n')
    disclaimer_line = next(i for i, l in enumerate(lines) if '<FTCDisclaimer' in l)

    last_import_line = -1
    for i, l in enumerate(lines):
        if l.strip().startswith('import '):
            last_import_line = i

    # Allow a little slack (blank lines, an <Aside> or two) but the disclaimer
    # should be one of the first things after the import block, not buried
    # after most of the post.
    gap = disclaimer_line - last_import_line
    if gap > 6:
        return [
            f'{path}: <FTCDisclaimer /> is on line {disclaimer_line + 1}, '
            f'{gap} lines after the last import (line {last_import_line + 1}). '
            'It belongs near the top of the post, not buried in the body/footer.'
        ]
    return []


def main() -> int:
    findings: list[str] = []

    for path in sorted(glob.glob(POSTS_GLOB, recursive=True)):
        if path.startswith(DRAFTS_PREFIX):
            continue
        with open(path, encoding='utf-8') as f:
            text = f.read()
        body, _ = strip_frontmatter(text)

        findings += check_placeholders(path, body)
        findings += check_image_alt(path, body)
        findings += check_ftc_position(path, body)

    if findings:
        print(f'Content lint failed with {len(findings)} finding(s):\n')
        for f in findings:
            print(f'  - {f}')
        return 1

    print('Content lint passed.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
