# AGENTS.md — project knowledge

## What this repo is

Offline, single-file Bible tools. No server, no build toolchain beyond Node for bundling.
Two products:

1. **START HERE** — short courses that open the Word of God to seekers and new believers.
   This is the main product now.
2. **EMMAUS** — a discipleship *game* for people who already believe (`emmaus/`, `MAP.md`).

## Layout

```
build.js          bundles shared/ + courses/ into one HTML file (dist/ and docs/)
shared/
  course.js       the engine: renders a course object page by page; localStorage progress
  art.js          18 SVG illustrations (ART.sceneName() -> svg string). Swap for photos.
  verses.js       85 public-domain KJV verses (VERSES["john 3:16"] -> text)
  course.css      reading-first stylesheet (serif body, gold verse cards)
courses/
  seeker.js       15-page course for non-believers      (COURSE object)
  new-believer.js 16-page course for new believers      (COURSE object)
dist/            built single files - the things you hand out / wrap in the APK
docs/            same files + landing page, served by GitHub Pages
android-app/     Capacitor project + cloud build workflow
images/          drop real photos here to replace SVG scenes
```

## Course object shape

`var COURSE = { key, brand, tagline, contact, intro:{...}, lessons:[...], closing:{...}, community:[...] }`

Each lesson: `kicker, title, art, lead, verse, meaning, verses2[], prayer?, think, action, deeper?[]`.
Every field except `prayer`/`deeper` is required, or the page renders "undefined".

## Build / verify

```bash
node build.js                       # -> dist/*.html and docs/*.html
node --check courses/*.js shared/*.js
```

Self-containment check (must be 0 real hits; the one match is a comment):
```bash
grep -nE "src=|fetch\(|@import|cdn|unpkg|jsdelivr" dist/*.html
```

Headless test pattern: extract `<script>...</script>`, shim `document`/`localStorage`/`window`,
`new Function(js + ';return {COURSE, VERSES, ART, ART_GLYPH}')()`, then assert every lesson's
verse resolves, every art key exists, no required field is missing.

## Rules learned

- **Never invent Scripture.** Fetch public-domain text (bible-api.com, `?translation=kjv`),
  check it, and store it in `shared/verses.js`. See VERSIONS.md for licensing.
- **Keep it offline.** No CDNs, no external fonts, no fetch at runtime. Images must be local.
- The old `foundations/` single file was replaced by this engine; do not recreate it.
- `emmaus/index.html` is a separate product - leave it alone unless asked.

## GitHub

- Remote: `github.com/Mubogi/start-here` (Pages served from `docs/` on `master`).
- APK: `.github/workflows/android.yml` builds a debug APK in the cloud (Actions -> Run workflow).
