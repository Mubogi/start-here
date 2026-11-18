# Top-grossing "easy to build" games, and how they actually got there

Research note, 2026-11-18. Every number here is from a named source; nothing is invented.
The point is not to admire these games but to see **which growth mechanism** made each one
huge, because that mechanism — not the code — is what is hard to copy.

---

## 1. The short version

The games that made the most money from the simplest rules did **not** win on the code.
They won on one of these:

1. **A distribution deal** they did not have to build themselves (a platform, a franchise, an
   ad network).
2. **A format that forces sharing** (one puzzle a day, a result you can post).
3. **Streamers and short video** doing the marketing for free.
4. **Live-service money** (ads + in-app purchases) on top of a game you can learn in 10 seconds.

A game can be built in a weekend. **Being found is the hard part.** That is the real lesson.

---

## 2. The games, ranked by how simple they are to build

### Block Blast! (Hungry Studio) — the current king of downloads
- **What it is:** drag blocks onto an 8x8 grid; clear rows and columns. A blend of Tetris and
  1010!. There is no timer, no losing pressure, and it plays offline.
- **Built:** launched April 2022 (iOS), September 2022 (Android).
- **Scale:** the world's most downloaded game as of January 2026; ~300 million monthly active
  users by March 2026. Free to play, funded by ads.
- **How it got there:** the mechanic is trivial to clone, so the win was not the game — it was
  **ads and retention**. Hungry Studio bought a lot of cheap ad inventory, the game held players
  (no timer, offline, endless), and the ad revenue paid for more ads. A pure flywheel.
- **Lesson:** if the game is easy to build, the moat is *user acquisition and retention*, not code.

### Flappy Bird (Dong Nguyen) — built in a few days
- **What it is:** tap to keep a bird flying through pipes. One input.
- **Built:** 2013, "over a period of several days", reusing a bird from a cancelled game.
- **Scale:** ~50 million downloads at its peak; reportedly ~$50,000/day in ad revenue before the
  developer took it down at the height of the hype.
- **How it got there:** almost pure **luck plus frustration**. The difficulty made people rage and
  then share. It exploded through word of mouth and press, then the developer removed it, which
  made it a legend.
- **Lesson:** you cannot plan this. Frustration that people *talk about* is a growth engine.

### Wordle (Josh Wardle) — one puzzle a day
- **What it is:** guess a five-letter word in six tries. A web page, no app store, no account.
- **Built:** by one person, for his partner; released publicly in 2021.
- **Scale:** millions of daily players within months; bought by The New York Times in 2022 for a
  reported low seven figures.
- **How it got there:** two design choices did all the marketing: **one shared puzzle per day**
  (so everyone had the same thing to talk about) and **a spoiler-free result you could paste**
  (the green/yellow squares). Sharing was built into the game's output.
- **Lesson:** if the game produces something people want to post, sharing is free distribution.

### 2048 (Gabriele Cirulli) — a weekend project
- **What it is:** slide tiles to merge matching numbers. One rule.
- **Built:** "originally written in JavaScript and CSS over a weekend."
- **Scale:** tens of millions of plays within weeks; endless clones.
- **How it got there:** it was **open and copyable**, so hundreds of sites rehosted it, and every
  rehost spread the name. Also a genuinely "one more try" loop.
- **Lesson:** being easy to fork can be a distribution strategy, not just a risk.

### Suika Game / Watermelon Game (Aladdin X) — the streamer hit
- **What it is:** drop fruits into a container; two of the same merge into a bigger fruit. Physics
  puzzle. Concept from a 2021 Chinese browser game, *Merge Big Watermelon*.
- **Built:** 2021 for the company's projectors; on the Nintendo eShop December 2021.
- **Scale:** 4 million downloads by November 2023; over 11 million by October 2024; the most
  downloaded eShop game in Japan in both 2023 and 2024.
- **How it got there:** **VTubers and streamers** played it on camera in 2023. The game is fun to
  *watch* fail, so clips spread. The company then went global in October 2023 to catch the wave.
- **Lesson:** a game that is fun to watch is a marketing asset. Design for the clip.

### Vampire Survivors (poncle) — one developer, then a genre
- **What it is:** your character attacks by itself; you only move and choose upgrades, against
  endless waves. You can play it with one hand.
- **Built:** by Luca Galante while unemployed; early access December 2021.
- **Scale:** a surprise hit; spawned a whole "survivors-like" genre and many paid expansions.
- **How it got there:** a **novel feel** (auto-attacking, screen-filling chaos) that streamers and
  word of mouth could not stop talking about, plus a very low price.
- **Lesson:** a new *feeling* inside a simple loop beats a new feature list.

### Balatro (LocalThunk) — one developer, poker roguelike
- **What it is:** play poker hands for points; buy jokers that bend the rules. Deck-building.
- **Built:** by one solo developer ("LocalThunk"); released February 2024.
- **Scale:** a critical and commercial hit across every platform; ported to mobile in 2024 and
  Switch 2 in 2026.
- **How it got there:** **depth that rewards sharing** — wild combos people post, plus strong
  streamer coverage. The rules are simple; the combinations are endless.
- **Lesson:** simple rules + huge combination space = a game people keep talking about.

### Royal Match (Dream Games) — the polished money machine
- **What it is:** match-three puzzles that fund rebuilding a castle. Candy Crush's cousin.
- **Built:** launched 2021, on Unity.
- **Scale:** top-ten mobile game by monthly revenue since 2023; ~55 million monthly active users.
- **How it got there:** **aggressive, well-funded performance marketing** and a heavy live-ops
  team. Not a small project — but the *mechanic* is simple.
- **Lesson:** simple mechanic + serious ad budget + constant events = a revenue machine.

### Monopoly Go! (Scopely) — a brand on top of a simple loop
- **What it is:** roll dice, move around a board, collect stickers. Simple.
- **Built:** released April 2023.
- **Scale:** 150 million+ downloads; **$5 billion in revenue** since launch.
- **How it got there:** a **famous brand** (Monopoly) removed the "what is this game?" problem, and
  a large ad budget did the rest.
- **Lesson:** a known name is a distribution shortcut you cannot code your way to.

---

## 3. What the winners have in common

| Game | Built in | Real growth engine |
|---|---|---|
| Flappy Bird | days | frustration + word of mouth + luck |
| 2048 | a weekend | open source + endless rehosting |
| Wordle | a solo side project | daily shared puzzle + postable result |
| Suika | a side project | streamers / short video |
| Vampire Survivors | one dev, unemployed | novel feel + streamer word of mouth |
| Balatro | one dev | simple rules + shareable combos + streamers |
| Block Blast! | a small studio | paid ads + retention flywheel |
| Royal Match | a funded studio | performance marketing + live-ops |
| Monopoly Go! | a big studio | famous brand + big ad budget |

Three patterns cover almost all of them:

1. **Built-in virality** — the game makes something worth sharing (Wordle's grid, Balatro's
   combos, Suika's fails). Cost: a design choice. This is the only one a small builder controls.
2. **Free media** — streamers and short video (Suika, Vampire Survivors, Balatro). Cost: the game
   must be fun to *watch*.
3. **Paid acquisition** — ads, on top of retention (Block Blast!, Royal Match, Monopoly Go!).
   Cost: real money, and it only works if players stay.

---

## 4. What this means for a small, offline, no-budget builder

You will not outspend Scopely. But the first pattern — **built-in virality** — is free, and it is
exactly what the START HERE courses are shaped for:

- **One shareable artefact.** Wordle won because the *output* was shareable. Every START HERE page
  already ends with "Share this with a friend" and a prefilled WhatsApp message naming the course.
  The share is the distribution; keep it on every page.
- **A reason to send it to one specific person.** The strongest courses here are the emotional
  ones — *You Are Not Alone*, *God Will Take Care of You*. A reader does not share a puzzle; they
  share it with a friend who is going through something. That is a sharper trigger than any ad.
- **A daily / drip habit.** Wordle's one-a-day is the cheapest retention trick ever invented.
  The courses are already one-page-at-a-time; a gentle daily nudge ("today's page") would copy the
  habit loop without any server, using only the device.
- **Something to watch.** A Bible-reading course is not a clip, but a *testimony* is. A short
  "what this page did for me" share is the human version of the Suika clip.
- **A person, not a product.** The one thing these games cannot copy is the contact button. A real
  human who prays with you is the retention mechanic, the support line, and the referral engine at
  once.

**The honest conclusion:** the code is the easy part and always was. These games got huge because
of *how people found them and why they came back*. For a ministry tool, that means the work is
(a) make each page worth sending to one specific hurting person, and (b) have a real person ready
on the other end of the message.

---

## 5. Sources

- Block Blast! — Wikipedia, *Block Blast!* (downloads, MAU, developer, offline play).
- Flappy Bird — Wikipedia, *Flappy Bird* (development time, peak downloads/revenue).
- Wordle — Wikipedia, *Wordle* (creation, NYT acquisition, daily shared puzzle).
- 2048 — Wikipedia, *2048 (video game)* (weekend build, open distribution).
- Suika Game — Wikipedia, *Suika Game* (origin, streamer-driven growth, download counts).
- Vampire Survivors — Wikipedia, *Vampire Survivors* (solo origin, auto-attack design, genre).
- Balatro — Wikipedia, *Balatro* (solo developer, release, platform ports).
- Royal Match — Wikipedia, *Royal Match* (revenue ranking, MAU).
- Monopoly Go! — Wikipedia, *Monopoly Go!* (downloads, $5B revenue).

Revenue and download figures are the ones reported on those pages as of 2026-11-18; treat them as
order-of-magnitude, not audited accounts.
