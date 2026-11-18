# START HERE — offline Bible courses

Two short courses that open someone's mind to the Word of God and walk them all the way
from *"is there a God?"* to *"go and tell others."* Each one is a **single HTML file that
works with no internet, no server, and no sign-up.**

> Built by an AI agent (OpenHands) on behalf of the project owner.

---

## The two courses

| Course | For | Pages | File |
|---|---|---|---|
| **Knowing God** | someone who does not yet believe, or is asking questions | 15 | `dist/start-here-seeker.html` |
| **New Life in Christ** | someone who has just confessed Jesus as Lord | 16 | `dist/start-here-new-believer.html` |

Both are page-by-page: **Scripture → what it means → read also → think about it → do this today**,
with a notes box on every page and a progress bar. Nothing leaves the device.

---

## How to use it

**On a phone.** Send the HTML file by WhatsApp, Telegram, or Bluetooth. They open it in a
browser. It works offline.

**As an Android app.** See below.

**Printed.** The pages print cleanly.

If you are the one giving it out, read **[LEADERS.md](LEADERS.md)** first — it is short.

---

## Build the single files

```bash
node build.js        # writes dist/start-here-*.html
```

No dependencies. Node 18+.

---

## Android app (APK)

The `android-app/` folder is a ready **Capacitor** project. It cannot be compiled in this
container (no Android SDK here), but you have two easy paths:

**A. Let GitHub build it for you (no setup).**
Push this repo, then go to **Actions → Build Android APK → Run workflow**. When it finishes,
download the **start-here-apk** artifact. Install that APK on a phone.

**B. Build it on your own machine.**

```bash
cd android-app
npm install
npm run assets        # rebuilds the course page into www/index.html
npx cap add android
npx cap sync android
npm run apk           # -> android/app/build/outputs/apk/debug/app-debug.apk
```

Requires Node, Java 21, and the Android SDK (or Android Studio).

**Publishing to Google Play** needs a signed *release* build (a keystore), not the debug APK.
See `android-app/README.md` for that step.

---

## Adding real images

The course ships with hand-built SVG illustrations so it looks good with nothing installed.
To swap any of them for a real photo:

1. Put the photo in `images/`.
2. In `shared/art.js`, replace that scene's body with:

```js
myScene: function () {
  return '<img src="images/my-scene.jpg" alt="" style="width:100%;height:100%;object-fit:cover">';
}
```

3. Rebuild: `node build.js`.

Nothing else changes. The scene keys are listed at the top of `shared/art.js`.

---

## Repository layout

```
build.js                 bundles everything into one file
shared/                  the engine
  course.js              page-by-page renderer, progress, notes
  art.js                 18 SVG illustrations (swap for photos)
  verses.js              85 public-domain Scripture verses (KJV)
  course.css             reading-optimised stylesheet
courses/                 the course content (plain text, easy to edit)
  seeker.js              15 pages
  new-believer.js        16 pages
dist/                    built single-file courses (the things you hand out)
android-app/             Capacitor project + build notes
LEADERS.md               guide for whoever gives the course out
VERSIONS.md              Bible text licensing
MAP.md                   the EMMAUS discipleship game design (separate product)
emmaus/                  the EMMAUS game (separate product)
```

---

## Scripture and licensing

All bundled Scripture is **public domain (King James Version)**, fetched from
[bible-api.com](https://bible-api.com) and checked for accuracy. Do not paste in a
copyrighted translation (NIV, ESV, Luganda LBR, etc.) without permission — see
[VERSIONS.md](VERSIONS.md).

---

## Contact

GitHub: [github.com/Mubogi](https://github.com/Mubogi)
