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

On top of the variant, every level also carries a **twist** from `TWISTS`
(cycled by `twistOf(ch,lv)`, offset by the decade so a chapter's twenty levels
each pair differently): The Open Path, Swift Water, Still Waters, The Crowd,
The Quiet Hour, The Firstfruits, The Gentle Wind, The Whirlwind, Keep Watch, The
Scribe. A twist nudges `mult` (pace), `spawn` (density), `need` (goal) or
`letters` (how soon letters fall). `levelBlurb(ch,lv)` joins the variant and
twist descriptions for the devotion screen and the level map.

**The Trial — read before you play.** Every level opens with one question drawn
from `TRIALS[ch]` (six questions per chapter, 60 total, rotated by
`trialFor(ch,lv)` so they rarely repeat). `beginWithTrial(ch,lv,opts)` runs the
chapter cutscene, then the trial, then `startLevel`. You get `CHANCES` (3) tries;
a wrong answer costs one, and losing all three **rests** the level until the next
dawn — `showRenewal` stores the date in the pilgrim's `rest` map and quotes
Lamentations 3:22-23. `chancesLeft`, `levelResting` and `renewalText` drive the
hearts row, the map's 🌅 resting mark and the countdown. A correct answer is
recorded in `pass` and opens the level. Free play (`PREFS.free`), daily
challenges (`opts.daily`) and the endless level skip the trial. State lives on
the pilgrim record as `tries`/`rest`/`pass`.

**Words that mean something.** The falling letters must be gathered **in order**
to spell the chapter's word (`WORDS`), shown live in the HUD strip and the
devotion scroll. The next letter glows; wrong letters still score but do not
advance the word. Completing it shows the meaning and a treasure card.

**Biblical backdrops.** `BACKS[mode]` is a procedural animated scene drawn every
frame — Eden, the fall, the flood, the altar, the desert, the temple, the veil,
the tomb, the upper room, the city — with sky, ground, glow, and moving light.

**A cinematic opening and chapter cutscenes.** `TITLES` drives `openIntro()` — a
canvas title sequence (starfield, glowing cross, flame, embers) with rune words
and captions, reachable from the menu ("The story so far") and played once on a
pilgrim's first PLAY via `maybeIntro(cb)`. The first time a chapter is entered,
`showCutscene(ch,next)` shows that chapter's title, reference, line and a
generated picture from `cutArt(kind)` (a canvas drawing per chapter), then calls
`next()` to start the level. Both are marked seen in the pilgrim record
(`intro`, `cuts`) so they do not repeat.

**Unlockable lamps (rewards).** `LAMPS` are milestones by levels cleared;
`lampState(u)` returns those earned and `newLamps(u,before)` those newly earned.
`startLevel` snapshots `lampsBefore`, and `showResults` renders any new ones into
`#resReward`. The Notebook shows the whole collection.

Each chapter has `LEVELS_PER_CH` (21) levels: 20 + an **endless** mode. Three
stars a level by hearts kept; eight stars of a chapter open the next. Progress
is per pilgrim in localStorage under `emmaus_v3` (add `daily`, `streak`).

Add a mode with `regMode({id, meter, init(A), update(A,dt), draw(A), tap(A,x,y),
move(A,x,y)})`, set `CH_MODE[chapter]=id`, and add `EXERCISE`, `DEVOTION`,
`WORD_MEANING`, `BACKS` entries. Use `A.obj.next`/`A.obj.wait` timers for
delayed steps — **never** `setTimeout` inside a mode.

Credits live in the About screen: **JD Hub (jdhu tech)**, built with the
OpenHands AI agent. Every screen keeps Call / WhatsApp / Telegram to the owner.

**The Android app.** `android/` is a WebView shell around the same file, and
`tools/build-apk.sh` builds and signs `dist/EMMAUS.apk` (aapt2 + javac + d8 +
apksigner). The APK carries no INTERNET permission and loads only
`assets/index.html`. Copy the built game into the app with
`cp emmaus/index.html android/assets/index.html` before building (the build
script does this), then publish the APK as a GitHub Release asset.

**Build with JDK 17, not 21.** d8 (build-tools 34.0.0, r8 8.2.2) crashes with
`NullPointerException: Cannot invoke "String.length()"` on javac 21 bytecode,
even at `-source/-target 8`. Install a JDK 17 (e.g. under `~/tools/`) and set
`JAVA_HOME` to it before running `tools/build-apk.sh`. Debian trixie's apt has
no JDK 17; download a tarball instead.

Verify with `node tools/test-emmaus.js`: it runs the real code against a minimal
DOM, checks the MAP rules, plays all ten modes through the actual
update()/tap()/move() loop, and checks backdrops, word meanings, exercises,
devotion, the fruit screen, level variants and boss rules, credits,
self-containment, themes, navigation, interactivity and scrolling.

**Usability (v1.2).** Every screen scrolls: `.scroller` is `flex:1 1 auto;
min-height:0; overflow-y:auto` and overlays scroll internally, so no content is
ever clipped. A persistent `#navbar` (Back · Home · Next) sits at the bottom of
every screen except play; `navSet(screen,nextFn,label)` is called at the end of
each opener to declare its Next action, and `showScreen` pushes the previous
screen onto `NAV.stack` so Back retraces the real path. Escape / ← / → and
horizontal swipes drive the same actions. Two themes ship: dark (default) and
light ("parchment & dawn") via `html[data-theme="light"]` and `setTheme()`;
`PREFS.theme` is saved and the menu has a quick ☀️/🌙 toggle. Study layers are
real `<button>` accordions (`.layer > .head.tappable` with a rotating `.chev`)
that announce `aria-expanded`; the first layer opens by default. Delight comes
from `ANGELS` chapter emblems, `cheer(emoji)` celebrations and `spawnFloaties()`
floating angels/doves (`body.reduced-motion` hides them).

**Colourblind-safe palette.** `PREFS.cb` adds `body.cb-safe`. Green→blue and
red→amber everywhere (`--green`, `--rose`), and — the part that matters most —
the three truth tags move to **blue / amber / violet** so a red-green viewer can
still tell "Text says", "Tradition holds" and "A reading" apart. The tags are
themed through `--tag1-*` / `--tag2-*` / `--tag3-*` tokens (never hard-coded
colours), with dark, light and `light + cb-safe` values all defined. When
changing a tag colour, edit the tokens, not `.tag.t-*`. Guarded by section 27 of
`tools/test-emmaus.js`, which also asserts `prefToggle("cb",…)` really adds and
removes the body class (the harness's `document.body.classList` is a working
`Set`, not a stub).

**The Cloud of Witnesses (v1.3).** A witness speaks after every level
(`witnessCard(ch,lv)` on the fruit screen) and the whole cloud is browsable from
the menu (`openWitnesses()` → `#witnesses`). `WITNESSES` is the single source of
truth; `quotableWitnesses()` returns only the entries that carry a `q`, and the
collection counter is measured against that, so the "N / M" total always matches
what is actually printed.

The honesty rule is the important part. Scripture voices (`scrip:true`) quote
exact KJV text copied from `shared/verses.js`, with the reference named. The
only preachers quoted are **John Wesley**, **David Oyedepo** and **Charles
Spurgeon**, each with a citation that could be checked. **Kathryn Kuhlman,
Kenneth Hagin, E. W. Kenyon and Myles Munroe** are named, described and honoured
but carry **no quote** — `note` explains why — because no reliable source could
be verified. Never invent words for them, and never "tidy up" a quote to make it
punchier; if you cannot cite it, leave `q` off and write a `note`. Section 32 of
`tools/test-emmaus.js` enforces this: every quoted entry must have `src`, every
unquoted one must have `note`.

**The Faith Step (v1.3).** Good play calls `gainFaith(4)` (25 for finishing the
chapter word); `A.faith` fills to `A.faithMax`. At full measure the 🕊 button
(`faithStep()`) sets `A.calm` for ~3.6s, spending all gathered faith. `calm`
slows every mode by passing `dt*0.32` into `M.update` — it is applied once in
`loop()`, so new modes inherit it for free and must not implement their own.
While calm, `speakWitness()` shows `#witnessVoice` with the current level's
witness. Guarded by section 33.

**The music (v1.3).** `TRACKS` holds four original gospel instrumentals —
*Yeshua*, *Amen*, *Hallelujah*, *Still Waters*. Each is written as data: a bass
note per bar, a chord voicing per bar, and a melody of `[eighth-step, midi,
length]`. `musicPump()` is a look-ahead scheduler (runs every 45 ms, queues
~220 ms ahead) that realises them with four voices — `mPad` (organ),
`mBass`, `mPluck` (inner arpeggio) and `mLead` (bell flute). Nothing is sampled
and nothing is fetched; the music is synthesised, so it costs the download
nothing and works offline.

This replaced a static four-oscillator drone that had no melody, no progression
and no rhythm. If you add a piece, keep it original — do not transcribe a
copyrighted recording. Put the harmony in `chords`, the melody in `melody`, and
keep every melody note between MIDI 55 and 88 so it stays singable. Section 34
enforces the shape of every track, that no two are identical, that the pieces
cycle, and — with a fake `AudioContext` that records what it is asked to play —
that the scheduler really emits many notes across many pitches with a bass line,
a melody and a sustained chord under them. That last part is what proves it is
music and not a drone; keep it.

`musicNext()` cycles the pieces and is bound to the ♪ button in the HUD and to
"Next piece" in Settings. `musicStop()` is called when the Music switch is
turned off, and `visibilitychange` parks the scheduler while the page is hidden
so a backgrounded game does not keep scheduling notes.

**Saving (v1.3).** `save()` writes the journey to `emmaus_v3` and keeps the
previous good value in `emmaus_v3_bak`. `load()` reads the live key and falls
back to the backup, so a corrupt or half-written entry can never cost a pilgrim
their road. `save()` refuses to run while `DB` is still undefined — without that
guard, a backup promoted during `load()` would have written the string
`"undefined"` over the real save. Do not remove the guard. Saves also fire on
`visibilitychange`, `pagehide` and `beforeunload`, because Android can kill a
WebView without warning. Section 35 covers all of this against a real
in-memory `localStorage`, including deliberately corrupting the live key.

**Shipping (v1.3).** `.github/workflows/release-apk.yml` runs the test suites,
builds with `tools/build-apk.sh`, and attaches `dist/EMMAUS.apk` to the GitHub
Release when a `v*` tag is pushed. It includes a staleness guard that compares
the game inside the APK against `emmaus/index.html` and fails if they differ or
if markers such as `Cloud of Witnesses`, `faithStep`, `TRACKS` and `LS_BAK` are
missing. That guard exists because v1.2.0 shipped an APK built from an older
game — the release looked fine but contained none of the new work. The old
`android.yml` was deleted: it built the *courses* page through Capacitor and
pointed at `android-app/www`, which does not exist.

**Building the APK (v1.3).** `tools/build-apk.sh` needs `platforms;android-34`,
`build-tools;34.0.0` and a JDK. Two traps have already cost a release:

*The SDK may be set to nothing.* The script ignores `ANDROID_HOME` and
`ANDROID_SDK_ROOT` when they are set but empty, then searches
`/usr/local/lib/android/sdk`, `~/Android/Sdk` and `~/tools/sdk`. Passing those
variables through from a missing CI variable silently blanked them and hid the
runner's real SDK.

*Never use an anonymous inner class in `android/src`.* d8 from build-tools
34.0.0 throws a `NullPointerException` on **any** anonymous inner class compiled
by a modern javac — this is a d8 bug, reproducible with a three-line test class,
not anything to do with this app. Named nested classes dex fine, which is why
`GameClient` is one. The script refuses anonymous inner classes up front with a
message naming the fix, so you get that instead of an R8 stack trace.

Always build locally with the variables unset (`env -u ANDROID_HOME -u
ANDROID_SDK_ROOT tools/build-apk.sh`) before trusting a green-looking change —
that is the configuration the runner actually uses.
