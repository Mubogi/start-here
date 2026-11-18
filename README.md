# START HERE — offline Bible courses

Short courses that open someone's mind to the Word of God and walk them all the way from
*"is there a God?"* to *"go and tell others."* Each one is a **single HTML file that works with
no internet, no server, and no sign-up** — and every page has a button to call or message a real
person for prayer.

> Built by an AI agent (OpenHands) on behalf of the project owner.

## What is here

| Course | For | Pages | File | Language |
|---|---|---|---|---|
| **Knowing God** | someone who does not yet believe, or is tired and asking questions | 16 | `dist/knowing-god.html` | English |
| **New Life in Christ** | someone who has just confessed Jesus as Lord | 16 | `dist/new-life-in-christ.html` | English |
| **Walking in Love** | anyone learning to love people the way Jesus does | 12 | `dist/walking-in-love.html` | English |
| **You Are Not Alone** | the lonely, the abandoned, the fatherless | 10 | `dist/you-are-not-alone.html` | English |
| **God Will Take Care of You** | anyone worried about money, food, fees, tomorrow | 10 | `dist/god-will-take-care-of-you.html` | English |
| **Okumanya Katonda** | the same journey for Luganda readers | 16 | `dist/okumanya-katonda.html` | Luganda |

Each course is page-by-page: **Scripture → what it means → read also → think about it → do this
today**, with a notes box, a progress bar, a "Talk to someone" box, and a share button on every
page. Nothing leaves the device.

## Contact — the point of the whole thing

Every page connects the reader to a real person who can pray with them and lead them to Christ.
The contact number lives in **one place**: `shared/contact.js`.

```js
var CONTACT = {
  name: "",
  phone: "+256754687597",
  whatsapp: "256754687597",
  telegram: "256754687597"
};
```

Change it there and every course updates: the in-page contact box, the two floating buttons
(call + WhatsApp), and every prefilled message (which already names the course and the page the
reader is on). There is **no GitHub link anywhere in the product** — the courses are handed out
as files, and readers reach out by phone, WhatsApp, or Telegram.

## Build the single files

```bash
node build.js        # writes dist/*.html and docs/*.html
```

No dependencies. Node 18+. The builder inlines only the verses each course uses, so each file is
60–95 KB — small enough to send over WhatsApp.

## How to give it out

**On a phone.** Send the HTML file by WhatsApp, Telegram, or Bluetooth. It opens in the browser
and works offline.

**As an Android app.** See `android-app/` — a ready Capacitor project, with a cloud build in
`.github/workflows/android.yml`.

**Printed.** The pages print cleanly.

If you are the one giving it out, read **[LEADERS.md](LEADERS.md)** first — it is short.

## Adding real images

The courses ship with hand-built SVG illustrations so they look good with nothing installed.
To swap any of them for a real photo:

1. Put the photo in `images/`.
2. In `shared/art.js`, replace that scene's body with:

```js
myScene: function () {
  return '<img src="images/my-scene.jpg" alt="" style="width:100%;height:100%;object-fit:cover">';
}
```

3. Rebuild: `node build.js`.

## Adding a course

1. Copy an existing file in `courses/` and edit it (it is plain text — `kicker`, `title`, `lead`,
   `verse`, `meaning`, `think`, `action`, and optional `prayer`/`deeper`).
2. Set `lang` (`"en"` or `"lg"`) and `vers` (`"kjv"` or `"lug"`).
3. Add it to the `COURSES` list in `build.js`.
4. `node build.js`.

## Repository layout

```
build.js                 bundles everything into one file per course
shared/
  course.js              page-by-page engine; contact + share boxes; exportCourse()
  contact.js             the phone / WhatsApp / Telegram number (edit this)
  strings.js             UI words per language
  art.js                 18 SVG illustrations (swap for photos)
  verses.js              public-domain KJV verses
  verses-lug.js          public-domain (CC0) Luganda New Testament
  course.css             reading-optimised stylesheet
courses/                 the course content (plain text, easy to edit)
dist/                    built single-file courses (the things you hand out)
docs/                    same files + landing page
sources/                 raw public-domain source text
tools/                   scripts that regenerate the Scripture
android-app/             Capacitor project + build notes
LEADERS.md               guide for whoever gives the course out
VERSIONS.md              Bible text licensing
MAP.md                   the EMMAUS discipleship game design (separate product)
emmaus/                  the EMMAUS game (separate product)
```

## Scripture and licensing

Bundled Scripture is **public domain**: the King James Version (English), and a public-domain
(CC0) Luganda New Testament. Do not paste in a copyrighted translation (NIV, ESV, Luganda LBR,
Lumasaba, etc.) without permission — see [VERSIONS.md](VERSIONS.md).
