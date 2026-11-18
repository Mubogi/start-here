#!/usr/bin/env node
/* Build the START HERE courses into standalone single files.
 *
 *   node build.js
 *
 * Reads:  shared/  (engine, art, verses, css)
 *         courses/ (seeker.js, new-believer.js)
 * Writes: dist/start-here-seeker.html
 *         dist/start-here-new-believer.html
 *
 * Each output is fully self-contained: no external files, no network.
 * Open it directly, or wrap it in the Android app in android/.
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const engine = read("shared/course.js");
const art = read("shared/art.js");
const verses = read("shared/verses.js");
const css = read("shared/course.css");

function page(courseFile, title) {
  const content = read(courseFile);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0e1015">
<title>${title}</title>
<style>
${css}
</style>
</head>
<body>
<div class="topbar">
  <div class="in">
    <div class="row">
      <div class="brand"><span id="brandName">START HERE</span><small id="brandTag"></small></div>
      <div class="who"><span>Pilgrim</span><b id="whoName"></b></div>
    </div>
    <div class="track"><i id="prog"></i></div>
  </div>
</div>
<main class="wrap" id="view"></main>
<div class="navbar"><div class="in" id="navIn"></div></div>
<div class="toast" id="toast"></div>
<script>
/* ---- scripture (public domain, KJV) ---- */
${verses}
/* ---- artwork ---- */
${art}
/* ---- engine ---- */
${engine}
/* ---- course content ---- */
${content}
initCourse(COURSE);
</script>
</body>
</html>
`;
}

const OUT = path.join(ROOT, "dist");       // the single files you hand out / wrap in the APK
const PAGES = path.join(ROOT, "docs");     // what GitHub Pages serves
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PAGES, { recursive: true });

const targets = [
  ["courses/seeker.js", "START HERE — Knowing God", "start-here-seeker.html"],
  ["courses/new-believer.js", "START HERE — New Life in Christ", "start-here-new-believer.html"],
];

for (const [src, title, out] of targets) {
  const html = page(src, title);
  fs.writeFileSync(path.join(OUT, out), html);
  fs.writeFileSync(path.join(PAGES, out), html);
  const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
  console.log(`  ${out}  (${kb} KB)`);
}

/* landing page for GitHub Pages */
const landing = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0e1015">
<title>START HERE — Knowing God</title>
<link rel="stylesheet" href="course.css">
</head>
<body>
<main class="wrap" style="padding-top:34px">
  <div class="kicker">START HERE</div>
  <h1>Do you want to know God?</h1>
  <p class="lead">Two short courses that open the Word of God and walk you through it,
  one page at a time. They work with no internet and no sign-up.</p>

  <div class="box" style="margin-top:26px">
    <h3>If you are still asking questions</h3>
    <p><b>Knowing God</b> \u2014 15 pages. From \u201cis there really a God?\u201d to the
    promises, your purpose, prayer, and how to keep standing.</p>
    <p><a class="link" href="start-here-seeker.html" style="font-weight:700">Begin \u2014 Knowing God \u2192</a></p>
  </div>

  <div class="box" style="margin-top:16px">
    <h3>If you have just given your life to Jesus</h3>
    <p><b>New Life in Christ</b> \u2014 16 pages. What just happened to you, forgiveness,
    assurance, the Holy Spirit, how not to fall away, and the mission.</p>
    <p><a class="link" href="start-here-new-believer.html" style="font-weight:700">Begin \u2014 New Life in Christ \u2192</a></p>
  </div>

  <div class="box" style="margin-top:26px">
    <h3>About</h3>
    <p class="small">Both courses are single files. Send one by WhatsApp or Bluetooth and it
    opens offline. Scripture is the public-domain King James Version.</p>
    <p class="small muted">GitHub: <a class="link" href="https://github.com/Mubogi">github.com/Mubogi</a></p>
  </div>
</main>
</body>
</html>
`;
fs.writeFileSync(path.join(PAGES, "index.html"), landing);
fs.copyFileSync(path.join(ROOT, "shared/course.css"), path.join(PAGES, "course.css"));
console.log("  index.html  (landing page)");
console.log("  course.css");
console.log("Built to docs/ (GitHub Pages can serve this folder directly)");

