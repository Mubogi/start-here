# VERSIONS.md — Bible text: what we can ship, what we must licence

The game compares Bible versions side by side. **Only public-domain text can be bundled.**
Everything else needs written permission from the copyright holder. This file explains the
format and who to ask.

---

## 1. Shipped and working (public domain — safe to bundle, no permission needed)

| Code | Name | Status |
|---|---|---|
| `kjv` | King James Version | Public domain worldwide |
| `web` | World English Bible | Public domain (dedicated by Michael Paul Johnson) |
| `asv` | American Standard Version | Public domain |
| `heb` | Hebrew (Westminster Leningrad Codex / Masoretic) | Public domain |
| `grc` | Greek (Textus Receptus / SBLGNT) | Public domain |

These are what the app ships with, so it works out of the box with nothing else.

---

## 2. Import slots (copyrighted — your church supplies the licensed text)

| Code | Name | Rights holder to contact |
|---|---|---|
| `lbr` | Luganda Bible | **Bible Society of Uganda** — bsu@biblesocietyuganda.org |
| `lug` | Lumasaba / Lugisu | **Bible Society of Uganda** |
| `nkjv` | New King James Version | Thomas Nelson (HarperCollins Christian) |
| `niv` | New International Version | Biblica / Zondervan |
| `nlt` | New Living Translation | Tyndale House Publishers |
| `esv` | English Standard Version | Crossway |
| `ampc` | Amplified Bible, Classic Edition | Zondervan |
| `gnt` | Good News Translation | American Bible Society |

**What to ask for:** a *non-exclusive licence to display the text within a non-commercial
church application*. Many publishers grant this free for ministry use; some require a small
fee. Ask in writing and keep the reply.

---

## 3. How to add an imported version

1. Create a file named `versions/lbr.json` (one file per version).
2. Format:

```json
{
  "code": "lbr",
  "name": "Luganda Bible",
  "rights": "© Bible Society of Uganda. Used by permission.",
  "verses": {
    "John 6:35": "Nze mmere ey'obulamu...",
    "Exodus 16:15": "..."
  }
}
```

3. Put it in the `versions/` folder next to the game file.
4. The game reads it automatically and adds it to the comparison list.

**Notes:**
- Keys must match the reference format exactly: `Book Chapter:Verse` (e.g. `John 6:35`).
- Missing verses simply show as "— not loaded —" and never break the game.
- The Hebrew/Greek layer is independent and always available.

---

## 4. The honesty rule

Whatever the source, the app must **never invent or paraphrase Scripture**. If a version is
not loaded, it says so. Accurate quotation is part of the design (see MAP.md rule 5).

---

*Last updated: 2026-11-18*
