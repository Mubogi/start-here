#!/usr/bin/env python3
"""Parse the public-domain (CC0) Luganda New Testament OCR text into verses.

Source: archive.org/details/luganda-the-new-testament  (CC0 / public domain mark)
Input : sources/luganda-nt-cc0.txt
Output: shared/verses-lug.js   (VERSES_LUG["yokaana 3:16"] = "...")

The OCR prints chapters as "ESSUULA <n>" (Luganda for "chapter") and verses as
a number followed by text. Book order follows the 27 NT books, so we map the
260 chapter markers onto the canonical chapter counts.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "sources/luganda-nt-cc0.txt"
OUT = ROOT / "shared/verses-lug.js"

# (english key, luganda display name, chapter count)
BOOKS = [
    ("matayo", "Matayo", 28), ("mark", "Makko", 16), ("luka", "Lukka", 24),
    ("yokaana", "Yokaana", 21), ("ebikolwa", "Ebikolwa", 28),
    ("abaruumi", "Abaruumi", 16), ("1 abakkolinso", "1 Abakkolinso", 16),
    ("2 abakkolinso", "2 Abakkolinso", 13), ("abaggalatiya", "Abaggalatiya", 6),
    ("abaefeso", "Abaefeso", 6), ("abafiripi", "Abafiripi", 4),
    ("abakkolosaayi", "Abakkolosaayi", 4), ("1 abasessaloniika", "1 Abasessaloniika", 5),
    ("2 abasessaloniika", "2 Abasessaloniika", 3), ("1 timoseewo", "1 Timoseewo", 6),
    ("2 timoseewo", "2 Timoseewo", 4), ("tito", "Tito", 3), ("filemoni", "Filemoni", 1),
    ("abebbulaniya", "Abebbulaniya", 13), ("yakobo", "Yakobo", 5),
    ("1 peetero", "1 Peetero", 5), ("2 peetero", "2 Peetero", 3),
    ("1 yokaana", "1 Yokaana", 5), ("2 yokaana", "2 Yokaana", 1),
    ("3 yokaana", "3 Yokaana", 1), ("yuda", "Yuda", 1),
    ("okubikkulirwa", "Okubikkulirwa", 22),
]


def chapters():
    for key, name, count in BOOKS:
        for n in range(1, count + 1):
            yield key, name, n


def split_verses(seg):
    seg = re.sub(r"^ESSUULA\s+\d+\s*", "", seg)
    # OCR puts each verse number at the start of a line.
    parts = re.split(r"(?m)^[ \t]*(\d{1,3})[ \t]+", seg)
    raw = {}
    for i in range(1, len(parts) - 1, 2):
        num = int(parts[i])
        text = re.sub(r"\s+", " ", parts[i + 1]).strip()
        # the OCR leaves manuscript footnote markers such as "( B )" in the text
        text = re.sub(r"\(\s*[A-Z]\s*\)", "", text).strip()
        if text and num not in raw:
            raw[num] = text
    # Page numbers in the OCR also sit at line starts. Walk the verse numbers in
    # order and drop any that jump far ahead of the sequence (a page number).
    out = {}
    expected = 1
    for num in sorted(raw):
        if num < expected:
            continue
        if num > expected + 2:
            continue
        out[num] = raw[num]
        expected = num + 1
    return out


def main():
    text = SRC.read_text(encoding="utf-8", errors="replace").replace("\r", "").replace("\u00a0", " ")
    marks = [(m.start(), int(m.group(1))) for m in re.finditer(r"ESSUULA\s+(\d+)", text)]
    segs = [
        text[pos : marks[i + 1][0] if i + 1 < len(marks) else len(text)]
        for i, (pos, _) in enumerate(marks)
    ]
    chaps = list(chapters())
    if len(segs) != len(chaps):
        sys.exit(f"expected {len(chaps)} chapters, found {len(segs)}")

    verses = {}
    problems = []
    for (key, name, num), seg in zip(chaps, segs):
        vs = split_verses(seg)
        if not vs:
            problems.append(f"{name} {num}: no verses")
            continue
        # sanity: verses should start at 1 and be mostly consecutive
        if 1 not in vs:
            problems.append(f"{name} {num}: no verse 1")
        expected = max(vs)
        missing = [i for i in range(1, expected + 1) if i not in vs]
        if len(missing) > expected * 0.15:
            problems.append(f"{name} {num}: {len(missing)}/{expected} missing")
        for vnum, txt in vs.items():
            verses[f"{key} {num}:{vnum}"] = txt

    OUT.write_text(
        "/* Luganda Scripture - public-domain text (CC0).\n"
        "   Source: archive.org/details/luganda-the-new-testament\n"
        "   Regenerate with: python3 tools/parse-luganda.py */\n"
        "var VERSES_LUG = " + json.dumps(verses, ensure_ascii=False, sort_keys=True, indent=0).replace("\n", "") + ";\n",
        encoding="utf-8",
    )
    print(f"verses: {len(verses)}")
    print(f"chapters with problems: {len(problems)}")
    for p in problems[:20]:
        print("  ", p)


if __name__ == "__main__":
    main()
