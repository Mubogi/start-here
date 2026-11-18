#!/usr/bin/env node
/* Build every course into one self-contained HTML file.
 *
 *   node build.js
 *
 * Reads:  shared/  (contact, strings, engine, art, scripture, css)
 *         courses/ (one file per course)
 * Writes: dist/<slug>.html   - the file you hand out / wrap in the app
 *         docs/<slug>.html   - the same file, served by GitHub Pages
 *         docs/index.html    - a landing page listing every course
 *
 * Each output opens offline by double-click. No server, no network.
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const exists = (p) => fs.existsSync(path.join(ROOT, p));

const css = read("shared/course.css");
const contact = read("shared/contact.js");
const strings = read("shared/strings.js");
const engine = read("shared/course.js");
const art = read("shared/art.js");

/* the courses, in the order they should appear on the landing page */
const COURSES = [
  { file: "courses/seeker.js", slug: "knowing-god", lang: "en" },
  { file: "courses/new-believer.js", slug: "new-life-in-christ", lang: "en" },
  { file: "courses/walking-in-love.js", slug: "walking-in-love", lang: "en" },
  { file: "courses/not-alone.js", slug: "you-are-not-alone", lang: "en" },
  { file: "courses/god-cares.js", slug: "god-will-take-care-of-you", lang: "en" },
  { file: "courses/seeker-lg.js", slug: "okumanya-katonda", lang: "lg" },
];

const OUT = path.join(ROOT, "dist");
const PAGES = path.join(ROOT, "docs");
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PAGES, { recursive: true });

/* load a course file in a tiny sandbox so we can read its metadata */
function loadCourse(file) {
  const src = read(file);
  const fn = new Function("var COURSE=null;" + src + ";return COURSE;");
  return fn();
}

/* every Scripture reference a course asks for, with ranges expanded */
function refsUsed(file) {
  const src = read(file);
  const refs = new Set();
  const re = /verses?2?\s*:\s*(\[[^\]]*\]|"[^"]*")/g;
  let m;
  while ((m = re.exec(src))) {
    const inner = m[1];
    const rre = /"([^"]+)"/g;
    let r;
    while ((r = rre.exec(inner))) {
      const ref = r[1].trim().toLowerCase();
      refs.add(ref);
      const range = ref.match(/^(.+?)\s+(\d+):(\d+)-(\d+)$/);
      if (range) {
        for (let i = +range[3]; i <= +range[4]; i++) refs.add(`${range[1]} ${range[2]}:${i}`);
      }
    }
  }
  return refs;
}

/* keep only the verses this course needs, so the file stays small enough to
   send over WhatsApp. Pass 0 to keep everything. */
function filterVerses(src, refs) {
  if (!src) return "";
  const name = src.match(/var\s+(\w+)\s*=/)[1];
  const body = src.slice(src.indexOf("{"), src.lastIndexOf("}") + 1);
  const all = new Function("return " + body)();
  const out = {};
  for (const k of Object.keys(all)) if (refs.has(k)) out[k] = all[k];
  return `var ${name} = ${JSON.stringify(out)};`;
}

/* pull exportCourse() out of the engine so we can call it from Node */
const exportCourse = new Function(
  "var window={},document={},navigator={},localStorage={getItem:function(){},setItem:function(){}};"
    + contact + "\n" + strings + "\n" + engine + "\nreturn exportCourse;"
)();

const built = [];
for (const c of COURSES) {
  if (!exists(c.file)) {
    console.log(`  skip ${c.slug} (no ${c.file})`);
    continue;
  }
  const COURSE = loadCourse(c.file);
  const needLug = (COURSE.vers || "kjv") === "lug";
  const refs = refsUsed(c.file);
  const html = exportCourse(COURSE, {
    css,
    contact,
    strings,
    art,
    engine,
    verses: needLug ? "" : filterVerses(read("shared/verses.js"), refs),
    versesLug: needLug ? filterVerses(read("shared/verses-lug.js"), refs) : "",
    course: read(c.file),
  });
  fs.writeFileSync(path.join(OUT, c.slug + ".html"), html);
  fs.writeFileSync(path.join(PAGES, c.slug + ".html"), html);
  const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
  built.push({ slug: c.slug, COURSE, kb });
  console.log(`  ${c.slug}.html  (${kb} KB)`);
}

/* landing page - lists everything, so the series keeps growing */
const cards = built
  .map((b) => {
    const i = b.COURSE.intro || {};
    const lang = b.COURSE.lang === "lg" ? ' <span class="tag">Luganda</span>' : "";
    return `  <a class="card" href="${b.slug}.html">
    <div class="card-k">${b.COURSE.brand}</div>
    <div class="card-t">${i.title || b.COURSE.tagline}${lang}</div>
    <div class="card-d">${i.lead || ""}</div>
    <div class="card-go">Read &rarr;</div>
  </a>`;
  })
  .join("\n");

/* the EMMAUS discipleship game, published alongside the courses */
const emmausSrc = path.join(ROOT, "emmaus", "index.html");
let emmausCard = "";
if (fs.existsSync(emmausSrc)) {
  const dir = path.join(PAGES, "emmaus");
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(emmausSrc, path.join(dir, "index.html"));
  emmausCard = `  <a class="card" href="emmaus/index.html">
    <div class="card-k">THE GAME</div>
    <div class="card-t">EMMAUS — The Unfolding <span class="tag">10 games</span></div>
    <div class="card-d">Ten chapters from the Garden to the City — and each chapter is its own arcade game: catch, dodge, slide, slice, tap, stack, time, remember, run, guard. 21 levels each (20 + an endless mode), three stars a level, a daily seeded challenge, streaks and a leaderboard. Beat a level and the verse unfolds into the deeper study. Works offline.</div>
    <div class="card-go">Play &rarr;</div>
  </a>`;
  console.log("  emmaus/index.html  (the game, published to docs/)");
}

const tel = (contact.match(/phone:\s*"([^"]+)"/) || [])[1] || "";
const wa = (contact.match(/whatsapp:\s*"([^"]+)"/) || [])[1] || "";

const landing = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0e1015">
<title>START HERE - read the Bible, one page at a time</title>
<link rel="stylesheet" href="course.css">
<style>
  .cards{display:grid; gap:14px; margin-top:22px}
  .card{display:block; text-decoration:none; color:inherit; background:var(--panel);
    border:1px solid var(--line); border-radius:14px; padding:18px 20px}
  .card:hover{border-color:#4a5b86}
  .card-k{font-size:.72rem; letter-spacing:.18em; text-transform:uppercase; color:var(--gold); font-weight:700}
  .card-t{font-family:var(--serif); font-size:1.35rem; margin:.3rem 0 .35rem; color:#fbfcff}
  .card-d{font-size:.95rem; color:var(--muted)}
  .card-go{margin-top:.6rem; font-weight:700; color:var(--blue)}
  .tag{font-size:.7rem; background:#243; color:#8fe0ab; border-radius:6px; padding:.1rem .45rem; vertical-align:middle}
</style>
</head>
<body>
<main class="wrap" style="padding-top:34px; padding-bottom:40px">
  <div class="kicker">START HERE</div>
  <h1>Read the Bible, one page at a time</h1>
  <p class="lead">Short guides that open the Word of God. Each one is a single file that works
  with no internet and no sign-up. Read it, then send it to someone who needs it.</p>

  <div class="cards">
${cards}
${emmausCard}
  </div>

  <div class="box talk" style="margin-top:26px">
    <h3>Talk to someone</h3>
    <p>Every page has a button to call or send a message. If you want prayer, or you want to
    give your life to Jesus, or you just have a question, reach out.</p>
    <div class="chips big">
      <a class="chip call" href="tel:${tel}">&#9742; Call</a>
      <a class="chip wa" href="https://wa.me/${wa}">WhatsApp</a>
    </div>
  </div>

  <p class="small muted" style="margin-top:26px">Scripture is from the public-domain King James
  Version, and for Luganda from a public-domain (CC0) Luganda New Testament.</p>
</main>
</body>
</html>
`;
fs.writeFileSync(path.join(PAGES, "index.html"), landing);
fs.copyFileSync(path.join(ROOT, "shared/course.css"), path.join(PAGES, "course.css"));
console.log(`  index.html  (landing page, ${built.length} courses)`);
console.log("Built to dist/ and docs/");
