# Project: EMMAUS — a Scripture-discovery journey game

## What this repo is
A church/Christian game project. The full design is in **MAP.md** (read it first — it is the
single source of truth for the 10-chapter design and all decisions).

## Structure
- `MAP.md` — the 10-chapter spec: themes, life areas, types of Christ, word studies, prayer
  focus, truth tags, Manna mechanic, kids/adults structure, the Pulpit (sermon layer).
- `VERSIONS.md` — Bible text licensing status, import format, publisher contacts.
- `emmaus/index.html` — the game. **Single offline HTML file.** No server, no build step.
- `offline-demo/index.html` — early proof that a game runs fully offline.

## Hard rules (do not break)
1. **Offline first.** The game must run from `file://` with no network. No CDNs, no `fetch`,
   no external scripts. Verify with `grep -nE "src=|fetch\(|@import|cdn" emmaus/index.html`.
2. **Quote Scripture accurately.** Only public-domain text is bundled (KJV, WEB, ASV).
   Never invent or paraphrase a verse. Missing text shows "— not loaded —".
3. **Truth tags on every reveal** — 🟢 Text says / 🟡 Tradition holds / 🔵 A reading.
   Honesty is the feature; it is what makes teachers recommend the game.
4. **Never sell the reward; never guilt** (no streaks that shame). See MAP.md §11.

## Build / verify
- No build step. Open `emmaus/index.html` in a browser.
- JS syntax check: extract the `<script>` block and run `node --check`.
- Logic test: run the script in Node with a small DOM shim (see git history for the pattern).
- For a *visual* check, a throwaway `python3 -m http.server` is fine — but it is only a
  preview convenience, never a dependency of the game.

## Licensing
LBR (Luganda) and Lumasaba are © Bible Society of Uganda; NKJV/NIV/NLT/ESV/AMPC/GNT are
copyrighted. They are **import slots**, not bundled. See VERSIONS.md.

## Contact
GitHub: https://github.com/MAYI12333
