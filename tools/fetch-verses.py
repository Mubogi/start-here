#!/usr/bin/env python3
"""Fetch public-domain KJV verses and merge them into shared/verses.js.

Source: https://bible-api.com/?translation=kjv  (World English Bible project data,
        King James Version is public domain in the United States).

Run:  python3 tools/fetch-verses.py
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "shared/verses.js"

REFS = [
    # walking in love
    "matthew 22:37-39", "john 13:34-35", "john 15:12-13", "john 15:17",
    "1 corinthians 13:4-7", "1 corinthians 13:13", "1 corinthians 16:14",
    "1 corinthians 8:1", "galatians 5:13-14", "ephesians 4:2", "ephesians 4:32",
    "colossians 3:12-14", "1 peter 4:8", "1 john 3:16-18", "1 john 4:7-8",
    "1 john 4:11", "1 john 4:19-21", "romans 5:5", "romans 12:9-10",
    "proverbs 10:12", "luke 6:27-28", "luke 6:31", "matthew 5:43-44",
    # you are not alone
    "deuteronomy 31:6", "deuteronomy 31:8", "joshua 1:5", "psalm 27:10",
    "psalm 34:18", "psalm 68:5-6", "psalm 139:7-10", "psalm 9:9-10",
    "psalm 46:1", "isaiah 43:1-2", "john 14:18", "matthew 28:20",
    "matthew 11:28-30", "hebrews 13:5-6", "2 corinthians 1:3-4",
    # God will take care of you
    "matthew 6:25-26", "matthew 6:31-33", "matthew 10:29-31", "matthew 7:9-11",
    "luke 12:6-7", "1 peter 5:7", "psalm 55:22", "psalm 37:25",
    "psalm 145:15-16", "psalm 121:1-3", "2 corinthians 9:8", "isaiah 41:17",
    "genesis 22:8", "psalm 23:1-3", "philippians 4:19",
    # seeker course, the tired / not alone / Jesus-will-help-you-win angle
    "john 10:10", "matthew 9:36", "isaiah 61:1-3", "psalm 51:17", "john 6:37",
    "psalm 34:17-18", "matthew 11:28", "romans 8:32", "2 corinthians 5:21",
    "romans 4:5", "ephesians 2:4-5", "titus 3:4-5", "luke 15:20",
    "psalm 40:1-3", "isaiah 55:1", "matthew 5:3-4", "jeremiah 31:3",
    "psalm 147:3", "isaiah 40:29-31", "romans 15:13", "john 14:1-3",
    "1 corinthians 13:8", "genesis 16:13",
    # extra for the new courses
    "philippians 4:13", "psalm 46:10", "isaiah 26:3", "john 16:33", "romans 8:37-39",
    "psalm 18:2", "lamentations 3:22-23", "zephaniah 3:17", "1 peter 1:3-5", "jude 1:24",
    "psalm 16:11", "john 8:12", "matthew 5:14-16", "2 timothy 1:7", "joshua 1:9",
    "psalm 118:6", "isaiah 43:18-19", "revelation 21:4", "1 corinthians 15:57",
    "romans 8:31", "galatians 2:20", "philippians 3:13-14", "hebrews 12:1-2",
    "1 corinthians 9:24-25", "2 timothy 4:7-8", "psalm 103:8-12", "isaiah 1:18",
    "ephesians 1:7", "colossians 1:13-14", "1 john 2:1-2", "romans 8:33-34",
    "john 5:24", "ephesians 4:22-24", "colossians 3:9-10", "romans 6:4",
    "psalm 1:1-2", "joshua 1:8", "psalm 119:11", "2 timothy 2:15", "matthew 7:24-25",
    "psalm 42:1-2", "jeremiah 33:3", "matthew 6:6", "james 4:8", "1 thessalonians 5:16-18",
    "john 15:7", "romans 8:26-27", "ephesians 6:18", "acts 4:31", "1 john 5:14",
    "psalm 62:8", "matthew 18:19-20", "acts 2:42", "hebrews 10:25", "1 corinthians 12:27",
    "ephesians 4:15-16", "acts 2:38", "romans 6:3-4", "matthew 10:32-33",
    "1 peter 3:21", "acts 16:31", "mark 16:16", "psalm 91:1-2", "proverbs 18:10",
]


def fetch(ref):
    url = "https://bible-api.com/" + urllib.parse.quote(ref) + "?translation=kjv"
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                data = json.load(r)
            text = re.sub(r"\s+", " ", data.get("text", "")).strip()
            if text:
                return text
        except Exception as e:  # noqa: BLE001
            if attempt == 2:
                print(f"  ! {ref}: {e}")
            time.sleep(1.5)
    return None


def main():
    current = {}
    if OUT.exists():
        src = OUT.read_text(encoding="utf-8")
        for m in re.finditer(r'"([^"]+)":\s*"((?:[^"\\]|\\.)*)"', src):
            current[m.group(1)] = m.group(2).encode().decode("unicode_escape")

    added = 0
    for ref in REFS:
        key = ref.lower()
        if key in current:
            continue
        time.sleep(1.2)
        text = fetch(ref)
        if text:
            current[key] = text
            added += 1
            print(f"  + {key}")
        else:
            print(f"  MISS {key}")

    lines = [
        "/* Public-domain Scripture, King James Version.",
        "   Fetched from bible-api.com and stored offline.",
        "   Regenerate with: python3 tools/fetch-verses.py */",
        "var VERSES = {",
    ]
    for k in sorted(current):
        val = json.dumps(current[k], ensure_ascii=False)
        lines.append(f"  {json.dumps(k)}: {val},")
    lines.append("};")
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"total verses: {len(current)}  (added {added})")


if __name__ == "__main__":
    sys.exit(main())
