# EMMAUS — The Unfolding
## Scope: how to make it look better and make it stronger

> A deep, grounded plan. Every item names the file, the function, and what "done" means.
> Nothing here is invented — the research sources are listed at the end.

---

## Part 0 — Where we are now (an honest audit)

I read the code, the build, the Android shell, and the tests before writing any of this.

**What is already strong**

| Area | State |
|---|---|
| One self-contained file | `emmaus/index.html`, ~146 KB, no CDN, no fetch, no external `src` |
| Ten games | `MODES` registry, one `regMode({id,meter,init,update,draw})` per chapter |
| Ten chapters of content | `CHAPTERS`, five study layers each (`plain/words/thread/practice/watch`) |
| Truth tags | `tagHTML()` — 🟢 Text says / 🟡 Tradition holds / 🔵 A reading |
| Learning loop | `goLevel` devotion scroll → play → `showFruit` → `showResults` |
| Presentation | `TITLES`/`openIntro` cinematic; `CUTSCENES`/`cutArt` per chapter; `LAMPS` rewards |
| Contact-first | `CONTACT` on every screen; `tel:`/`wa.me`/`tg:` links |
| Offline app | `android/` WebView shell, **no INTERNET permission**, signed APK on Releases |
| Tests | `tools/test-emmaus.js` (17 sections) plays all ten modes through the real loop |

**What is missing or weak** (these drive the scope)

- **No audio bed, no mute control.** `tone()` exists and `SFX` is decent, but there is **no music**, no volume setting, no mute button, and **no pause on background** (`visibilitychange` count = 0). Games that keep playing sound after you leave feel broken.
- **No first-run teaching.** `MODE_INFO` describes each game in text, but there is **no interactive tutorial** and no "how to play" demo. New players are dropped into a mechanic they have never seen.
- **Juice is thin.** There is `shake` and `burst()` and `flash`, but no hit-stop, no parallax, no screen-transition wipes, no combo escalation, no "death" animation.
- **Accessibility is almost absent.** `aria-*` = 2, `role=` = 0, `tabindex` = 0, **no `prefers-reduced-motion`**, no colorblind-safe mode, no text-size control, no remapping. Game Accessibility Guidelines call remapping, text size, colorblindness and subtitle presentation the four most-complained-about issues.
- **Persistence is fragile.** One `localStorage` key (`emmaus_v3`), no export/backup, no quota handling. Clear browser data and the whole journey is gone.
- **No share artifact.** There is a share button in the courses, but the game produces **nothing postable** — no result grid, no verse card. Wordle's entire growth was a postable result.
- **Distribution is web-only + a direct APK.** No Play Store listing, no install-from-link flow, no QR.

---

## Part 1 — What the research actually says (and how it applies)

I could not reach the search APIs (quota) or the engines (bot walls), so I went to primary
sources directly. Four findings matter for us:

**1. "Juice" is the cheapest quality win in games.** The canonical talk (Jonasson & Purho,
*Juice it or lose it*) and the *game-feel* literature agree: the same mechanic feels
dramatically better with layered feedback — squash-and-stretch, particles, screen shake,
hit-stop, sound pitch rising with combo, and camera motion. Our mechanics are already good;
they are just *quiet*. This is the highest ratio of "looks better" to "effort" available.

**2. Accessibility is a business case, not charity.** Game Accessibility Guidelines: **20% of
casual gamers are disabled**, 8% of males have red-green colour deficiency, 14% of adults read
below an 11-year-old level, and everyone has *situational* limits (bright sun, noisy room,
one hand). Their four most-complained-about issues are **remapping, text size, colourblindness,
subtitle presentation**. Our dark-gold palette is exactly the red/green trap.

**3. Built-in virality is the only growth engine a no-budget builder controls.** From our own
`research/top-grossing-easy-games.md`: Wordle won on *one shared daily puzzle + a postable
result*; Suika won on *being fun to watch*; 2048 won on *being forkable*. Paid acquisition and
brand (Royal Match, Monopoly Go) are out of reach. So: make the game **produce something worth
sending**, and make it **fun to watch**.

**4. WebView has real, specific pitfalls.** Android's own docs on loading local content warn
about: `file://` origin limits, `localStorage` under `file://`, mixing `file://` with
`asset://`, and the need for `setDomStorageEnabled` + a stable origin. Our shell already sets
`setDomStorageEnabled(true)` and disables Safe Browsing, but it **locks portrait** and gives no
way to tune text size, and `file://` origin is a persistence risk we should harden.

---

## Part 2 — The look (visual & UI polish)

Goal: when someone opens it, it should feel like a **finished, warm, illustrated product**, not
a dark web form.

### 2.1 Type and rhythm
- **A real type scale.** Today it is ad-hoc `rem` values. Introduce `--fs-1…--fs-7` and use them.
- **A display face for titles.** Ship one small WOFF2 (subset, ~15 KB) for chapter titles and the
  intro, or fall back to a tuned Georgia stack. Self-hosted = still offline.
- **Optical spacing on the serif** for verses: `letter-spacing`, `line-height: 1.7`, hanging
  punctuation. Verses should feel like a Bible page, not a paragraph.
- **Vertical rhythm** via a single `--space` unit so cards stop looking hand-placed.

### 2.2 Colour and depth
- **Add a second accent** (a warm rose/amber) so gold is not the only highlight; right now
  everything "important" is the same gold.
- **Layered shadows + inner highlight** on `.card`/`.sheet`/`.scroll` for a physical, printed feel.
- **A subtle paper/noise texture** (a tiny inline SVG data-URI) behind scrolls.
- **Gradient text** on chapter titles; **glow** on the active element only.
- **Colourblind-safe palette option** (deuteranopia/protanopia) — also Part 7.

### 2.3 The journey map (the biggest visual gap)
- Today the chapter list is a **grid of cards**. The design doc (MAP.md §4) promises a
  **journey map** from Garden to City. Build it: a winding path, ten nodes, the current node
  glowing, completed nodes showing lamps, locked nodes veiled. This single change does more for
  "looks like a real game" than anything else.

### 2.4 Illustration
- The `BACKS` scenes are procedural canvas — good, but flat. Add: **parallax layers** (far/mid/near),
  a **sun/moon with god-rays**, **silhouetted foreground detail**, and **per-chapter palette shifts**.
- The `cutArt` cutscene images are simple shapes. Either (a) up-render them with gradients,
  vignettes and grain, or (b) move to a small set of hand-drawn SVG illustrations per chapter.
- **Consistent icon set** for lamps, modes, hearts, stars (currently a mix of emoji and canvas).

### 2.5 Motion (UI-level)
- **Screen transitions:** a shared "page turn" or "scroll unroll" between screens instead of an
  instant `display` swap in `showScreen()`.
- **Staggered card reveals** (`animation-delay` by index) wherever lists appear.
- **The lamp lighting** should be a moment: a flare, a ring, a held beat.
- **Button feedback:** press-down scale, a soft tick, and a shine sweep on gold buttons.

### 2.6 The HUD
- Redesign the play HUD as a **cohesive top bar**: hearts, meter, word strip, pause — one visual
  system, consistent spacing, subtle translucent backdrop.

---

## Part 3 — The feel (game juice)

Goal: every tap should feel *expensive*. This is the cheapest, highest-impact work.

- **Hit-stop.** Freeze the world 40–80 ms on impact (a `hitstop` timer in `update()`).
- **Squash & stretch** on the player and on catch/slice objects.
- **Trauma-based screen shake** (already have `shake`; drive it from a decay curve, not a bool).
- **Particles everywhere:** dust on land, spark on slice, shards on break, a bloom on gather,
  a puff on death. `burst()` exists — call it far more, and add `drawParts` depth sorting.
- **Combo escalation:** pitch and volume of `SFX.good(c)` already rise with combo — extend that
  to visuals (bigger numbers, warmer colour, a screen-edge glow that intensifies).
- **Anticipation & follow-through:** a wind-up before a boss wave, a settle after a win.
- **Camera:** slight zoom-in on the player, a pan on level start, a pull-back on results.
- **Death and failure** need their own animation (a scatter, a fade, a slow-motion beat) — right
  now losing is abrupt, which feels like a bug.
- **Tutorial juice:** the first few seconds of each mode should *teach by showing* — a ghosted
  hand, an arrow, one scripted pickup.

**Per-mode notes** (grounded in the `MODES` code): `garden` needs catch-bloom + rot-splat;
`fall` needs a dodge whoosh and a near-miss slow-mo; `ark` needs water splash + drift;
`lamb` needs a clean slice trail; `wilderness` needs tap-ripples; `temple` needs stack-thud +
topple; `veil` needs a tear with light spill; `tomb` needs memory-flash; `upper` needs a wind
trail; `city` needs a wave swell.

---

## Part 4 — The strength (content & spiritual depth)

Goal: make it a thing teachers *recommend*. Honesty is already a feature (`tagHTML`) — deepen it.

- **Finish the two lamps.** MAP.md §7 promises **Little Lamp (kids)** and **Deep Lamp (adults)**
  and **Family Mode**. `littleHTML` exists but Family Mode is not built. Build it: parent and
  child on the same chapter, the child *sees* the parent unlock depth.
- **Manna — the daily engine.** `openDaily()` already runs one seeded challenge, "the same for the
  whole day", keyed by `dayKey()`/`seedFrom("day"+d)`. What MAP.md §6 adds and the code does not
  yet do: make it **Wordle-style one-a-day with no stockpiling**, give it a **postable result**, and
  tie it to **Marks that unlock chapters** (today `u.marks` is awarded in `recordResult` but never
  gates anything — chapters unlock by levels done). This is the retention spine.
- **The Pulpit is thin.** `pulpitCard` renders a 5-row table. Make it a real, printable sermon
  outline, plus **small-group mode** scored on fidelity to the text (MAP.md §8).
- **Version comparison.** `versionTable` shows KJV/WEB + import slots. Ship the Luganda NT fully
  (already CC0 in the courses) and make side-by-side comparison a first-class screen.
- **The five study layers** should unlock progressively as you play (depth = reward), and each
  layer should end with a **question to sit with**, not just text.
- **A "read the chapter" ending.** Design rule §11.3: the best session ends with the player
  *reading*. Add a short, beautiful, distraction-free reading mode for the chapter passage.
- **Notebook that grows into a journal** — dated entries, searchable, exportable.

---

## Part 5 — The habit (retention, without selling the reward)

Design rules forbid monetisation-style reward-selling and guilt (§11). So retention must be
intrinsic.

- **One shared daily puzzle** (Manna) + a **postable result** — the Wordle pattern, which is the
  single most-copied retention idea in casual games.
- **A streak that never shames.** On a miss, show grace: "Welcome back — today's manna is fresh."
  Never "you broke your streak" (§11.2).
- **A gentle daily nudge** using only the device (no server): a stored "next page" that the app
  offers on return, and (in the Android app) an optional local notification.
- **Progress that is visible:** the journey map, lamps, and a "road walked" summary.
- **Family Mode** as a weekly ritual: one chapter, together, Sunday evening.
- **A share artifact:** the game currently has **no share** (the three `share` hits are the
  multi-profile note, the shared-arena comment, and the community blurb). Add a generated verse
  card (canvas → PNG) with the word, the verse and the contact — shareable to WhatsApp. This is
  the growth engine *and* the ministry.

---

## Part 6 — Technical hardening

Goal: it should never break, never lose data, never feel slow.

- **Audio lifecycle.** Add a `visibilitychange` handler: mute/duck on background, resume on
  return. Add a **music bed** (a tiny procedural loop) with a **mute button** in the HUD and a
  volume slider in About. Honour a saved `sound` flag everywhere (it partly exists).
- **Save robustness.** Wrap `save()` for quota errors; add **export/import** (a JSON file or a
  share string) so a journey survives a new phone; version the schema and migrate.
- **WebView origin/persistence.** Follow Android's local-content guidance: keep one stable
  origin, verify `localStorage` survives app updates, and consider `WebViewAssetLoader` over raw
  `file://` for a proper `https://` origin.
- **Orientation.** Manifest locks `portrait`. Either support landscape (better for several modes)
  or make the lock a deliberate, documented choice with a landscape-friendly layout.
- **Performance.** Cap particle counts, pool objects, avoid per-frame allocation in `draw()`,
  and add a low-power mode (fewer particles, lower DPR).
- **Device coverage.** Test small (320×568) and large/tablet, notch/safe-area insets, and low-end
  GPUs. Use `viewport-fit=cover` + `env(safe-area-inset-*)` (partly present).
- **Crash safety.** A global `error`/`unhandledrejection` handler that shows a calm recovery
  screen instead of a blank canvas.
- **CI.** The existing workflow builds the *courses* Capacitor app, not EMMAUS. Add a workflow
  that runs `tools/test-emmaus.js`, builds `dist/EMMAUS.apk` with `tools/build-apk.sh`, and
  attaches it to a Release — so publishing is one click.

---

## Part 7 — Accessibility (the four most-complained-about first)

- **Text size control** (the #1 easy win): a scale slider (100–150%) that drives the type scale.
- **Colourblind-safe mode**: never rely on red/green alone; add shape/pattern and a palette swap.
- **Reduced motion**: honour `prefers-reduced-motion` — cut shake, parallax and long transitions.
- **Remapping / alternative input**: every action reachable by one input method; large, well-spaced
  touch targets (≥ 44 px); optional one-hand layout.
- **Subtitles/captions** for any spoken or sound-cued content; visual cue for audio-only feedback.
- **Screen-reader basics**: `role`, `aria-label` on interactive elements, focus order, `tabindex`
  on the menu. (Currently `role=` = 0.)
- **Simple language & formatting** — already good in the courses; mirror it in the game UI.
- **Contrast:** verify every text/background pair against WCAG AA (our `--dim` on `--panel` is the
  likely offender).

---

## Part 8 — Distribution (no GitHub links in the product)

Hard requirement: **no GitHub links anywhere in user-facing HTML.** Keep delivering via Releases
and Pages, and add friendlier doors:

- **A landing page** (`docs/index.html`) that offers "Play in browser" and "Download the app".
- **A QR code** (generated, not linked) on the landing page and in printed material that opens the
  game or the APK download.
- **An install-from-link flow**: a short, plain-language page — "Open this on your Android phone →
  allow install → tap Install" — with the APK served as a Release asset.
- **Keep the courses' WhatsApp/Bluetooth hand-out** as the primary channel; the game is the second door.
- **Optional: a Play Store listing** later (needs an account, a privacy policy, and a data-safety
  form — all easy because the app collects nothing and has no INTERNET permission).

---

## Part 9 — Prioritised roadmap

Effort: **S** ≈ a day, **M** ≈ a few days, **L** ≈ a week+. Impact: how much it moves "looks
better / stronger".

### P0 — Do first (biggest look-and-feel jump for least risk)
| # | Item | Effort | Impact |
|---|---|---|---|
| 1 | Juice pass: hit-stop, squash, particles, death animation, combo visuals | M | ★★★★★ |
| 2 | Music bed + mute/volume + pause on background | S | ★★★★☆ |
| 3 | First-run interactive tutorial per mode (teach by showing) | M | ★★★★☆ |
| 4 | Journey map screen (replace the chapter grid) | M | ★★★★★ |
| 5 | Text-size control + reduced-motion + colourblind-safe palette | S | ★★★★☆ |
| 6 | Save export/import + quota safety | S | ★★★★☆ |

### P1 — Strong next (depth and habit)
| # | Item | Effort | Impact |
|---|---|---|---|
| 7 | Manna daily puzzle: same for everyone, no stockpile, unlocks chapters | M | ★★★★★ |
| 8 | Shareable verse card (canvas → PNG → WhatsApp) | S | ★★★★★ |
| 9 | Family Mode (two lamps, one chapter) | L | ★★★★☆ |
| 10 | Pulpit → real printable outline + small-group mode | M | ★★★☆☆ |
| 11 | Landing page + QR + install-from-link flow | S | ★★★★☆ |
| 12 | Type system, card depth, illustration upgrade (parallax, god-rays) | M | ★★★★☆ |

### P2 — Later (polish and reach)
| # | Item | Effort | Impact |
|---|---|---|---|
| 13 | Full accessibility pass (roles, focus, contrast audit) | M | ★★★☆☆ |
| 14 | Landscape/tablet layouts, safe-area polish | M | ★★★☆☆ |
| 15 | Low-power mode, object pooling, perf budget | M | ★★★☆☆ |
| 16 | Version comparison screen (ship Luganda NT) | M | ★★★☆☆ |
| 17 | CI workflow that tests + builds + attaches the APK | S | ★★★☆☆ |
| 18 | Play Store listing (privacy policy, data-safety form) | M | ★★★★☆ |

---

## Part 10 — Definition of done (so we can prove it)

Every item above must ship with:
- a **headless test** in `tools/test-emmaus.js` (the harness already drives the real loop), and
- a **browser check** of the visible change, and
- an update to **`MAP.md`** (the single source of truth) and **`AGENTS.md`** (agent memory).

Concrete test hooks to add: `hitstop` decay, `SFX.good` pitch curve, tutorial step machine,
`prefers-reduced-motion` branch, `exportSave()`/`importSave()` round-trip, `shareCard()` returns
a data-URI, and the journey-map node states (`locked`/`current`/`done`).

---

## Sources

- Game Accessibility Guidelines — *Basic* and *Why and how* (four most-complained-about issues;
  20% of casual gamers disabled; 8% red-green; 14% low reading age). gameaccessibilityguidelines.com
- Android Developers — *Load in-app content* (local-content / WebView guidance, DOM storage,
  origin and `file://` caveats). developer.android.com
- *Juice it or lose it* — Martin Jonasson & Petri Purho (game feel: squash, particles, shake,
  hit-stop, pitch-with-combo). Classic GDC/Indie talk.
- Project's own research: `research/top-grossing-easy-games.md` (Wordle daily + postable result;
  Suika watchability; 2048 forkability; paid acquisition out of reach for no-budget builders).
- Project's own design doc: `MAP.md` (unbuilt promises: journey map §4, Manna §6, two lamps +
  Family Mode §7, Pulpit + small group §8, design rules §11).

*Written 2026-11-18. Effort/impact are my judgement, not measured.*
