# LEADER'S GUIDE — giving out START HERE

You are about to hand someone a short course that walks them from "is there a God?"
all the way to "go and tell others." This page is for you, the person giving it out.
It is short on purpose.

---

## 1. Which course do I give?

There are six, and each is one single file that works offline.

| The person | Give them | File |
|---|---|---|
| Has not yet believed, or is tired and asking questions | **Knowing God** (16 pages) | `dist/knowing-god.html` |
| Has just confessed Jesus as Lord | **New Life in Christ** (16 pages) | `dist/new-life-in-christ.html` |
| Feels alone, abandoned, or has no parents | **You Are Not Alone** (10 pages) | `dist/you-are-not-alone.html` |
| Is worried about money, food, or fees | **God Will Take Care of You** (10 pages) | `dist/god-will-take-care-of-you.html` |
| Is learning to love difficult people | **Walking in Love** (12 pages) | `dist/walking-in-love.html` |
| Reads Luganda | **Okumanya Katonda** (16 pages) | `dist/okumanya-katonda.html` |

If you are not sure, give the **Knowing God** one. Lesson 12 is where they can receive Christ,
and the closing page sends them on.

---

## 2. How to give it

**On a phone (easiest).** Send the file by WhatsApp, Telegram, Bluetooth, or copy it to
their phone. They open it in a browser. It works with no internet, no data, no sign-up.

**As an app.** Install the APK (see `README.md`). It appears as **START HERE** on their
phone and works offline forever.

**Printed.** The pages print cleanly. Give them the pages on paper if that suits them.

---

## 3. How to walk with them

The course is designed so that **you do not have to be a teacher.** But your presence
doubles its power. Here is a simple way:

1. **Give the file.** Say: *"This is 16 short pages about God. Read one a day. Nothing
   to sign, no cost. Tell me what you think."*
2. **Check in after 3 days.** Ask one question only: *"Which page stood out to you?"*
   Then listen. Do not preach.
3. **When they reach the salvation page,** be ready. Ask: *"Would you like to pray that
   prayer? I can pray with you."* If they say yes, pray with them right then.
4. **After they believe,** give them the **New Life** course and start the same rhythm.
5. **Connect them to a church** (New Life). Do not let them walk alone.

---

## 4. Questions they will ask

**"Which Bible should I read?"**
Any. If they have none, the free **YouVersion** app has many versions, including Luganda.
The English courses quote the public-domain King James text; the Luganda course quotes a
public-domain Luganda New Testament.

**"Do I have to join your church?"**
No. The course says find *a* Bible-believing church. Point them to the nearest faithful one,
not necessarily yours.

**"What if I sin again?"**
Turn to Knowing God, Lesson 15. The answer is confession and getting up, not hiding.

**"I don't feel anything."**
Feelings come and go. The course rests on God's promises, not feelings. Encourage
them to keep reading even when they feel nothing.

**"My family will oppose me."**
This is real and painful. Remind them of Matthew 5:10-12 and that Jesus warned of it.
Point them to the church family as their new support.

---

## 5. The honesty rule

The course teaches only what the Bible says, and it says so plainly. It does not use
pressure, guilt, or fear to get a decision. **You should not either.** Present the truth
warmly, then leave the person free. God does the drawing (John 6:44).

If someone says "not yet," bless them and stay their friend. Do not push.

---

## 6. Changing the content

Everything is plain text in `courses/`:

- `courses/seeker.js` — Knowing God (16 pages)
- `courses/new-believer.js` — New Life in Christ (16 pages)
- `courses/not-alone.js` — You Are Not Alone (10 pages)
- `courses/god-cares.js` — God Will Take Care of You (10 pages)
- `courses/walking-in-love.js` — Walking in Love (12 pages)
- `courses/seeker-lg.js` — Okumanya Katonda, in Luganda (16 pages)

Edit the text, then run `node build.js` to rebuild the single files.

**Your contact number** lives in one place: `shared/contact.js`. Change it there and every
course updates — the "Talk to someone" box, the floating call/WhatsApp buttons, and every
prefilled message. That number is how the reader reaches a real person, so keep it current.

**Do not change the Scripture text** unless you know the version you are using is licensed.
See `VERSIONS.md`.

---

*This guide was written by an AI agent (OpenHands) on behalf of the project owner.*
