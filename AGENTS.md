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
  course.js       the engine: renders a course object page by page; localStorage progress;
                  contact box + share box on every page; exportCourse() writes a single file
  contact.js      CONTACT = {phone, whatsapp, telegram} and the tel:/wa.me/t.me link builders
  strings.js      UI words per language (en, lg). Scripture is never translated here.
  art.js          18 SVG illustrations (ART.sceneName() -> svg string). Swap for photos.
  verses.js       public-domain KJV verses (VERSES["john 3:16"] -> text)
  verses-lug.js   public-domain (CC0) Luganda New Testament (VERSES_LUG["yokaana 3:16"])
  course.css      reading-first stylesheet (serif body, gold verse cards, contact/share)
courses/
  seeker.js            16-page course for non-believers        (lang en, kjv)
  new-believer.js      16-page course for new believers        (lang en, kjv)
  walking-in-love.js   12 pages on loving people as Jesus does (lang en, kjv)
  not-alone.js         10 pages for the lonely / fatherless    (lang en, kjv)
  god-cares.js         10 pages on God's provision             (lang en, kjv)
  seeker-lg.js         16-page Luganda course                  (lang lg, lug)
dist/            built single files - the things you hand out / wrap in the APK
docs/            same files + landing page, served by GitHub Pages
sources/         raw public-domain source text (Luganda NT OCR)
tools/           regenerate Scripture: parse-luganda.py, fetch-verses.py
android-app/     Capacitor project + cloud build workflow
images/          drop real photos here to replace SVG scenes
```

## Course object shape

`var COURSE = { key, brand, tagline, lang, vers, intro:{...}, lessons:[...], closing:{...} }`

- `lang` picks the UI words from `shared/strings.js` (`"en"` or `"lg"`).
- `vers` picks the Scripture store: `"kjv"` -> `VERSES`, `"lug"` -> `VERSES_LUG`.

Each lesson: `kicker, title, art, lead, verse, meaning, verses2[], prayer?, think, action, deeper?[]`.
Every field except `prayer`/`deeper` is required, or the page renders "undefined".

Verse references may be a single verse (`"john 3:16"`) or a range (`"romans 8:37-39"`); the engine
joins the individual verses for a range. Keep reference keys lower-case.

## Contact

The whole point is that every page can reach a real person. Edit `shared/contact.js` once and
every course updates: the in-page "Talk to someone" box, the two floating buttons (call +
WhatsApp), and every prefilled message. Prefilled messages come from the `msg*` templates in
`shared/strings.js`, filled with `{name}`, `{where}` (course name) and `{topic}` (current page).

## Build / verify

```bash
node build.js                       # -> dist/*.html and docs/*.html
node --check courses/*.js shared/*.js
```

The builder inlines only the verses each course actually uses, so the output stays small enough
to send over WhatsApp (60-95 KB). A course's `vers` decides which store is embedded.

Self-containment check (must be 0 hits):
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
- **No GitHub link in the product.** The courses are handed out as files; do not point readers
  at a repo. Contact is by phone/WhatsApp/Telegram only.
- **Escape `</script`** in anything inlined into a page. `exportCourse()` does this; keep it.
- **Luganda is New Testament only.** The CC0 source (`sources/luganda-nt-cc0.txt`) has no Old
  Testament, so Luganda courses must use NT references only.
- The old `foundations/` single file was replaced by this engine; do not recreate it.
- `emmaus/index.html` is a separate product - leave it alone unless asked.

## GitHub

- Remote: `github.com/Mubogi/start-here` (Pages served from `docs/` on `master`).
- **Pushing:** the default git credential helper authenticates as the wrong account
  (`MAYI12333`, read-only) and gets a 403. Use the `GH_PAT` env var, which is the
  `Mubogi` owner token with `repo` + `workflow` scopes:
  `git push "https://${GH_PAT}@github.com/Mubogi/start-here.git" master`
- Live site: https://mubogi.github.io/start-here/ (Pages rebuilds a few minutes after push).
- APK: `.github/workflows/android.yml` builds a debug APK in the cloud (Actions -> Run workflow).

## EMMAUS game (`emmaus/index.html`)

One offline file. A canvas (2D) renders every frame through a
`requestAnimationFrame` loop with its own update/draw, physics, particles,
screen shake, and a small Web Audio synth (no sound files).

**Ten chapters, ten games, ten spiritual exercises.** `CH_MODE` maps a chapter
to a mode in the `MODES` registry; each mode is a different mechanic *and* a
different discipline (`EXERCISE[mode]` names it and explains it):

| # | Chapter | Mode | Play | Exercise |
|---|---------|------|------|----------|
| 1 | The Garden | `garden` | catch good fruit, avoid the rot | Trust |
| 2 | The Fall | `fall` | dodge the darkness | Watchfulness |
| 3 | The Ark | `ark` | slide the raft through gaps | Endurance |
| 4 | The Lamb | `lamb` | swipe shadows, spare the lambs | Discernment |
| 5 | The Wilderness | `wilderness` | tap the manna | Attention |
| 6 | The Temple | `temple` | drop each stone true | Order |
| 7 | The Veil | `veil` | tap when the light crosses | Faith |
| 8 | The Tomb | `tomb` | remember and match the stones | Memory |
| 9 | The Upper Room | `upper` | run and jump | Perseverance |
| 10 | The City | `city` | guard the city | Prayer |

**Something to learn before and after every level.** Tapping a level opens
`goLevel()` — a devotion Scroll: the exercise, the chapter verse, a teaching
(`DEVOTION`), a practice for the day, the level's goal, and the word to gather.
Winning or losing opens `showFruit()`: the word you gathered, its meaning
(`WORD_MEANING` — a plain-language paragraph and a promise verse), the fruit
line, and a practice. Then the results sheet.

**Candy-Crush variety.** Every level carries a variant from `VARIANTS`, cycled
by `variantOf(ch,lv)`: The Path, Watchful (one heart), Harvest (timed), The
Offering (gather the word), Trial (two hearts), The Race (faster), Stillness
(slow, one mistake), Storm (more, faster), Covenant (word required), and a
**Boss** every tenth level (two hearts, timed, word required). `startLevel`
applies the variant's hearts, timer (`A.timed`/`A.timeMax`), speed (`A.speedMul`)
and spawn density (`A.spawnMul`).

**Words that mean something.** The falling letters must be gathered **in order**
to spell the chapter's word (`WORDS`), shown live in the HUD strip and the
devotion scroll. The next letter glows; wrong letters still score but do not
advance the word. Completing it shows the meaning and a treasure card.

**Biblical backdrops.** `BACKS[mode]` is a procedural animated scene drawn every
frame — Eden, the fall, the flood, the altar, the desert, the temple, the veil,
the tomb, the upper room, the city — with sky, ground, glow, and moving light.

Each chapter has `LEVELS_PER_CH` (21) levels: 20 + an **endless** mode. Three
stars a level by hearts kept; eight stars of a chapter open the next. Progress
is per pilgrim in localStorage under `emmaus_v3` (add `daily`, `streak`).

Add a mode with `regMode({id, meter, init(A), update(A,dt), draw(A), tap(A,x,y),
move(A,x,y)})`, set `CH_MODE[chapter]=id`, and add `EXERCISE`, `DEVOTION`,
`WORD_MEANING`, `BACKS` entries. Use `A.obj.next`/`A.obj.wait` timers for
delayed steps — **never** `setTimeout` inside a mode.

Credits live in the About screen: **JD Hub (jdhu tech)**, built with the
OpenHands AI agent. Every screen keeps Call / WhatsApp / Telegram to the owner.

Verify with `node tools/test-emmaus.js`: it runs the real code against a minimal
DOM, checks the MAP rules, plays all ten modes through the actual
update()/tap()/move() loop, and checks backdrops, word meanings, exercises,
devotion, the fruit screen, level variants and boss rules, credits, and
self-containment.
