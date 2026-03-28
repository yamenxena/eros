"""
Extract Tables of Contents from PDF and EPUB books in _Archive/.
Outputs a combined index.md following the ontic_agent HARSANYI1 ToC format.

Usage:
  python extract-toc.py

Dependencies:
  pip install PyMuPDF

[AUTH: Antigravity | Eros | extract-toc:1.0.0 | 2026-03-28]
"""

from __future__ import annotations
import os
import zipfile
import xml.etree.ElementTree as ET
from typing import Optional
from pathlib import Path

# ── Try importing PyMuPDF ──────────────────────────────────────────
try:
    import fitz  # PyMuPDF
    HAS_FITZ = True
except ImportError:
    HAS_FITZ = False
    print("WARNING: PyMuPDF not installed. PDF outline extraction disabled.")
    print("  Install with: pip install PyMuPDF")

ARCHIVE_DIR = Path(__file__).resolve().parent
SKIP_EXTENSIONS = {'.webm', '.mp4', '.avi', '.mkv', '.mov', '.png', '.jpg'}


# ── PDF ToC extraction via PyMuPDF ─────────────────────────────────
def extract_pdf_toc(filepath: Path) -> list[dict]:
    """Extract ToC from a PDF using its embedded outline (bookmarks)."""
    if not HAS_FITZ:
        return []
    doc = fitz.open(str(filepath))
    toc = doc.get_toc(simple=True)  # [[level, title, page], ...]
    doc.close()
    if not toc:
        return []
    entries = []
    for level, title, page in toc:
        entries.append({
            'level': level,
            'title': title.strip(),
            'page': page if page > 0 else None,
        })
    return entries


# ── EPUB ToC extraction ────────────────────────────────────────────
def extract_epub_toc(filepath: Path) -> list[dict]:
    """Extract ToC from an EPUB by parsing toc.ncx (EPUB2) or nav.xhtml (EPUB3)."""
    entries = []
    try:
        with zipfile.ZipFile(str(filepath), 'r') as zf:
            names = zf.namelist()

            # Strategy 1: EPUB3 nav document
            nav_file = _find_epub3_nav(zf, names)
            if nav_file:
                entries = _parse_epub3_nav(zf, nav_file)
                if entries:
                    return entries

            # Strategy 2: EPUB2 toc.ncx
            ncx_file = _find_ncx(names)
            if ncx_file:
                entries = _parse_ncx(zf, ncx_file)
                if entries:
                    return entries

    except (zipfile.BadZipFile, Exception) as e:
        print(f"  ERROR reading EPUB: {e}")
    return entries


def _find_ncx(names: list[str]) -> Optional[str]:
    """Find toc.ncx in the EPUB archive."""
    for name in names:
        if name.lower().endswith('toc.ncx'):
            return name
    return None


def _find_epub3_nav(zf: zipfile.ZipFile, names: list[str]) -> Optional[str]:
    """Find the EPUB3 navigation document via content.opf."""
    for name in names:
        if name.lower().endswith('.opf'):
            try:
                opf_data = zf.read(name).decode('utf-8', errors='replace')
                root = ET.fromstring(opf_data)
                # Look for nav item in manifest
                ns = {'opf': 'http://www.idpf.org/2007/opf'}
                for item in root.iter():
                    if 'properties' in item.attrib and 'nav' in item.attrib['properties']:
                        href = item.attrib.get('href', '')
                        # Resolve relative to OPF location
                        opf_dir = '/'.join(name.split('/')[:-1])
                        nav_path = f"{opf_dir}/{href}" if opf_dir else href
                        if nav_path in names:
                            return nav_path
            except Exception:
                continue
    # Fallback: look for nav.xhtml directly
    for name in names:
        base = name.lower().split('/')[-1]
        if base in ('nav.xhtml', 'toc.xhtml', 'nav.html'):
            return name
    return None


def _parse_epub3_nav(zf: zipfile.ZipFile, nav_file: str) -> list[dict]:
    """Parse EPUB3 nav document (HTML with <nav epub:type='toc'>)."""
    entries = []
    try:
        data = zf.read(nav_file).decode('utf-8', errors='replace')
        root = ET.fromstring(data)
        # Find the <nav> element with toc type
        nav_el = None
        for el in root.iter():
            tag = el.tag.split('}')[-1] if '}' in el.tag else el.tag
            if tag == 'nav':
                attrs = ' '.join(el.attrib.values())
                if 'toc' in attrs:
                    nav_el = el
                    break
        if nav_el is None:
            # Fallback: first <nav> element
            for el in root.iter():
                tag = el.tag.split('}')[-1] if '}' in el.tag else el.tag
                if tag == 'nav':
                    nav_el = el
                    break
        if nav_el is not None:
            _walk_nav_ol(nav_el, entries, level=1)
    except Exception as e:
        print(f"  WARN: EPUB3 nav parse error: {e}")
    return entries


def _walk_nav_ol(parent, entries: list, level: int):
    """Recursively walk <ol>/<li>/<a> structure in EPUB3 nav."""
    for child in parent:
        tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
        if tag == 'ol':
            _walk_nav_ol(child, entries, level)
        elif tag == 'li':
            # Find <a> text
            for sub in child:
                stag = sub.tag.split('}')[-1] if '}' in sub.tag else sub.tag
                if stag == 'a':
                    text = ''.join(sub.itertext()).strip()
                    if text:
                        entries.append({'level': level, 'title': text, 'page': None})
                elif stag == 'span':
                    text = ''.join(sub.itertext()).strip()
                    if text:
                        entries.append({'level': level, 'title': text, 'page': None})
                elif stag == 'ol':
                    _walk_nav_ol(sub, entries, level + 1)
            # Check for nested <ol> directly under <li>
            for sub in child:
                stag = sub.tag.split('}')[-1] if '}' in sub.tag else sub.tag
                if stag == 'ol':
                    _walk_nav_ol(sub, entries, level + 1)


def _parse_ncx(zf: zipfile.ZipFile, ncx_file: str) -> list[dict]:
    """Parse EPUB2 toc.ncx file."""
    entries = []
    try:
        data = zf.read(ncx_file).decode('utf-8', errors='replace')
        root = ET.fromstring(data)
        # NCX namespace
        ns = ''
        if root.tag.startswith('{'):
            ns = root.tag.split('}')[0] + '}'
        nav_map = root.find(f'{ns}navMap')
        if nav_map is not None:
            _walk_ncx_points(nav_map, entries, level=1, ns=ns)
    except Exception as e:
        print(f"  WARN: NCX parse error: {e}")
    return entries


def _walk_ncx_points(parent, entries: list, level: int, ns: str):
    """Recursively walk navPoint elements in NCX."""
    for nav_point in parent.findall(f'{ns}navPoint'):
        label_el = nav_point.find(f'{ns}navLabel/{ns}text')
        text = label_el.text.strip() if label_el is not None and label_el.text else ''
        if text:
            entries.append({'level': level, 'title': text, 'page': None})
        # Recurse into child navPoints
        _walk_ncx_points(nav_point, entries, level + 1, ns=ns)


# ── Author extraction from filename ───────────────────────────────
def parse_book_info(filename: str) -> tuple[str, str]:
    """Extract title and author from filename pattern: 'Title (Author).ext'."""
    stem = Path(filename).stem
    # Try to split on last parentheses pair for author
    if '(' in stem and stem.endswith(')'):
        idx = stem.rfind('(')
        title = stem[:idx].strip()
        author = stem[idx+1:-1].strip()
    else:
        title = stem
        author = ''
    # Clean up title: remove trailing dashes, etc.
    title = title.rstrip(' -–—')
    return title, author


# ── Format ToC entries to markdown ─────────────────────────────────
def format_toc_entries(entries: list[dict]) -> str:
    """Convert ToC entries to markdown with indentation."""
    if not entries:
        return '*No table of contents found in file metadata.*\n'

    lines = []
    for entry in entries:
        indent = '  ' * (entry['level'] - 1)
        title = entry['title']
        page = entry.get('page')
        if page:
            lines.append(f"{indent}- {title} — p.{page}")
        else:
            lines.append(f"{indent}- {title}")
    return '\n'.join(lines) + '\n'


# ── Main ───────────────────────────────────────────────────────────
def main():
    books = []
    for f in sorted(ARCHIVE_DIR.iterdir()):
        if f.is_dir():
            continue
        ext = f.suffix.lower()
        if ext in SKIP_EXTENSIONS or f.name.startswith('.') or f.name == 'index.md' or f.name == 'extract-toc.py':
            continue
        books.append(f)

    if not books:
        print("No books found in _Archive/.")
        return

    print(f"Found {len(books)} books. Extracting ToCs...\n")

    sections = []
    for book in books:
        ext = book.suffix.lower()
        title, author = parse_book_info(book.name)
        print(f"  [{ext.upper()[1:]}] {title}")

        if ext == '.pdf':
            entries = extract_pdf_toc(book)
        elif ext == '.epub':
            entries = extract_epub_toc(book)
        else:
            entries = []
            print(f"    Skipped (unsupported format)")

        # Build section
        header = f"## {title}"
        if author:
            header += f"\n**Author:** {author}"
        header += f"\n**Format:** {ext.upper()[1:]} | **File:** `{book.name}`\n"
        toc_md = format_toc_entries(entries)
        sections.append(f"{header}\n{toc_md}")
        print(f"    → {len(entries)} ToC entries")

    # Write index.md
    output = ARCHIVE_DIR / 'index.md'
    with open(output, 'w', encoding='utf-8') as f:
        f.write("# Archive Index\n\n")
        f.write(f"**Books:** {len(books)} | **Generated:** {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n")
        f.write("---\n\n")
        f.write("\n---\n\n".join(sections))
        f.write("\n---\n")

    print(f"\n✓ Written to {output}")
    print(f"  {len(books)} books indexed.")


if __name__ == '__main__':
    main()
