#!/usr/bin/env node
/* Verify the EMMAUS game without a browser.
 *
 *   node tools/test-emmaus.js
 *
 * Loads emmaus/index.html, runs the real game code against a minimal DOM,
 * and checks the design rules in MAP.md hold:
 *   - ten chapters, each with all five layers
 *   - every layer has the fields the renderer needs
 *   - every truth tag is one of the three allowed tags
 *   - Chapter 9 carries its four deeper notes
 *   - every chapter has a Little Lamp (child) layer
 *   - the contact number is configured and reachable from every screen
 *   - the whole file is self-contained (no network)
 * It also checks the arcade layer: a catchable word per chapter, a canvas,
 * a game loop, sound, and that the renderer produces each screen's markup.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FILE = path.join(ROOT, "emmaus", "index.html");

const html = fs.readFileSync(FILE, "utf8");
const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));

/* a tiny DOM the game can talk to */
function makeDom() {
  const nodes = {};
  function el(id) {
    if (!nodes[id]) {
      nodes[id] = {
        id, innerHTML: "", textContent: "", style: {}, value: "", checked: false, href: "",
        clientWidth: 390, clientHeight: 780,
        dataset: {}, children: [],
        classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
          toggle(c, on) { if (on === undefined) on = !this._s.has(c); on ? this._s.add(c) : this._s.delete(c); },
          contains(c) { return this._s.has(c); } },
        addEventListener() {}, removeEventListener() {}, onclick: null, onchange: null,
        appendChild() {}, remove() {}, setAttribute() {}, getAttribute() { return null; },
        querySelectorAll() { return []; }, getContext() { return ctx2d; },
        getBoundingClientRect() { return { left: 0, top: 0, width: 390, height: 780 }; },
      };
    }
    return nodes[id];
  }
  // a no-op 2D context so draw() can run headless
  const ctx2d = new Proxy({}, { get: (t, k) => {
    if (k === "createLinearGradient" || k === "createRadialGradient")
      return () => ({ addColorStop() {} });
    if (k === "setTransform" || k === "canvas") return () => {};
    return () => {};
  }, set: () => true });
  return {
    nodes,
    document: {
      getElementById: el,
      querySelectorAll: () => [],
      createElement: () => el("__tmp" + Math.random()),
      addEventListener() {},
    },
    window: { devicePixelRatio: 1, addEventListener() {}, AudioContext: null },
    localStorage: { getItem() { return null; }, setItem() {} },
    navigator: {},
    confirm: () => false,
    performance: { now: () => 0 },
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => {},
    setTimeout: () => 0,
    clearTimeout: () => {},
  };
}

let failures = 0;
function check(cond, msg) {
  if (!cond) { console.log("    FAIL: " + msg); failures++; }
}

const dom = makeDom();
const api = new Function(
  "document", "window", "localStorage", "navigator", "confirm",
  "performance", "requestAnimationFrame", "cancelAnimationFrame", "setTimeout", "clearTimeout",
  script + "\nreturn { CHAPTERS: CHAPTERS, KID: KID, CONTACT: CONTACT, COMMUNITY: COMMUNITY, "
    + "WORDS: WORDS, blankUser: blankUser, starsHTML: starsHTML, unlocked: unlocked, "
    + "studyHTML: studyHTML, chapterOf: chapterOf, esc: esc, tagHTML: tagHTML, levelColors: levelColors, "
    + "totalStars: totalStars, startLevel: startLevel, ensure: ensure, "
    + "setUser: function(n){ DB.active=n; ensure(n); return DB.users[n]; }, "
    + "getG: function(){ return G; }, update: function(dt){ update(dt); } };"
)(dom.document, dom.window, dom.localStorage, dom.navigator, dom.confirm,
  dom.performance, dom.requestAnimationFrame, dom.cancelAnimationFrame, dom.setTimeout, dom.clearTimeout);

const C = api.CHAPTERS;

/* 1. ten chapters */
console.log("\n1. The journey");
check(C.length === 10, `ten chapters (got ${C.length})`);
C.forEach((c, i) => {
  const where = `chapter ${c.id} (${c.title || "?"})`;
  check(c.id === i + 1, `${where}: id is sequential`);
  check(!!c.title, `${where}: title`);
  check(!!c.life, `${where}: life area`);
});

/* 2. the five layers, with their required fields */
console.log("2. The five layers");
C.forEach((c) => {
  const where = `chapter ${c.id} (${c.title})`;
  check(c.plain && c.plain.ref && c.plain.kjv, `${where}: Plain has ref + KJV`);
  check(c.words && c.words.length >= 2, `${where}: Words has >= 2 word studies`);
  (c.words || []).forEach((w) => check(w.t && w.lang && w.m, `${where}: word "${w.t}" complete`));
  check(c.thread && c.thread.ot && c.thread.nt && c.thread.note, `${where}: Thread complete`);
  check(!!c.practice, `${where}: Practice`);
  check(!!c.watch, `${where}: Watch`);
  check(!!c.sermon, `${where}: sermon line`);
});

/* 3. truth tags are only the three allowed ones */
console.log("3. Truth tags (MAP \u00a73)");
const TAGS = ["t-text", "t-trad", "t-read"];
C.forEach((c) => {
  const where = `chapter ${c.id}`;
  check(TAGS.indexOf(c.thread.tag) >= 0, `${where}: thread tag "${c.thread.tag}" allowed`);
  (c.extra || []).forEach((x, i) => {
    check(TAGS.indexOf(x.tag) >= 0, `${where}: extra ${i + 1} tag "${x.tag}" allowed`);
    check(!!x.head && !!x.body, `${where}: extra ${i + 1} has head + body`);
  });
});

/* 4. chapter 9's deeper notes */
console.log("4. Chapter 9 (the deep-prayer chapter)");
const nine = C[8];
check(nine.extra && nine.extra.length === 4, "chapter 9 has four deeper notes");
check(/21/.test(JSON.stringify(nine)), "chapter 9 mentions Daniel's 21 days");
check(/tongue/i.test(JSON.stringify(nine)), "chapter 9 mentions tongues");

/* 5. the arcade layer */
console.log("5. The game");
check(/<canvas id="game"/.test(html), "there is a canvas to play on");
check(/requestAnimationFrame/.test(script), "there is a real game loop");
check(/function update\(dt\)/.test(script) && /function draw\(dt\)/.test(script), "update + draw each frame");
check(/function startLevel\(/.test(script), "levels start");
check(/AudioContext/.test(script) && /function tone\(/.test(script), "sound is synthesised offline");
check(/function burst\(/.test(script), "particle effects");
C.forEach((c) => check(/^[A-Z]{4,}$/.test(api.WORDS[c.id] || ""), `chapter ${c.id}: a gatherable word`));
const colors = api.levelColors(3);
check(colors && colors.sky && colors.accent, "each chapter has its own palette");

/* 6. stars, unlocking, saving */
console.log("6. Progress (stars, unlocking, marks)");
const u = api.blankUser();
check(u.marks === 0 && u.best === 0 && u.plays === 0, "a new pilgrim starts at zero");
check(u.stars && Object.keys(u.stars).length === 0, "no stars yet");
check(api.unlocked(u) === 1, "only chapter 1 is open at the start");
u.stars[1] = 3;
check(api.unlocked(u) === 2, "a star opens the next chapter");
check(api.totalStars(u) === 3, "stars total up");
check(/★★★/.test(api.starsHTML(3)) && /star-off/.test(api.starsHTML(1)), "stars render filled and empty");

/* 6b. an actual playthrough, driven through the real update() loop */
console.log("6b. A playthrough (the loop really plays)");
const su = api.setUser("Sim");
api.startLevel(1);
const G = api.getG();
check(!!G && G.ch === 1 && G.lives === 3, "level 1 starts with three lives");
check(!!G.word && G.word === api.WORDS[1], "the level knows its word");
// catch manna until the chapter unfolds
let frames = 0;
while (G && !G.won && !G.over && frames < 2000) {
  G.player.tx = 195; G.player.x = 195;
  G.items.length = 0;
  G.items.push({ type: "manna", x: 195, y: 780 - 70, r: 17, vy: 0, vx: 0, spin: 0, sp: 0 });
  api.update(0.016);
  frames++;
}
check(G && G.won, "catching manna unfolds the chapter");
check(G && G.score > 0, "score rises as you catch");
check(su.stars[1] >= 1 && su.stars[1] <= 3, "a star is awarded (1-3)");
check(su.marks > 0, "marks are added");
// gather the word and confirm the bonus fires
const su2 = api.setUser("Sim2");
api.startLevel(2);
const G2 = api.getG();
const w2 = G2.word;
for (let i = 0; i < w2.length; i++) {
  G2.items.length = 0;
  G2.items.push({ type: "letter", ch: w2[i], x: 195, y: 780 - 70, r: 18, vy: 0, vx: 0, spin: 0, sp: 0 });
  G2.player.x = 195;
  api.update(0.016);
}
check(G2.wordGot === "" && G2.score >= w2.length * 25, "gathering the word completes it and pays a bonus");
// shadows cost lives
const su3 = api.setUser("Sim3");
api.startLevel(3);
const G3 = api.getG();
let f3 = 0;
while (G3 && !G3.over && f3 < 400) {
  G3.player.x = 195; G3.player.tx = 195; G3.player.inv = 0;
  G3.items.length = 0;
  G3.items.push({ type: "shadow", x: 195, y: 780 - 70, r: 19, vy: 0, vx: 0, spin: 0, sp: 0 });
  api.update(0.016);
  f3++;
}
check(G3 && G3.over && !G3.won, "three shadow hits end the round");
check(su3.stars[3] === undefined, "no star for a lost round");

/* 7. the Little Lamp for every chapter */
console.log("7. Two lamps (MAP \u00a77)");
C.forEach((c) => {
  const k = api.KID[c.id];
  const where = `chapter ${c.id}`;
  check(!!k, `${where}: has a Little Lamp`);
  check(k && !!k.story && !!k.truth && !!k.do, `${where}: child story/truth/action`);
  check(k && k.quiz && k.quiz.q && k.quiz.o && k.quiz.o.length >= 2, `${where}: child quiz`);
  check(k && k.quiz && k.quiz.a >= 0 && k.quiz.a < k.quiz.o.length, `${where}: quiz answer index valid`);
});

/* 8. the study renderer produces real markup for every chapter */
console.log("8. The study scroll (MAP \u00a78)");
C.forEach((c) => {
  const out = api.studyHTML(c, api.blankUser());
  const where = `chapter ${c.id}`;
  check(/The Plain/.test(out) && /The Words/.test(out) && /The Thread/.test(out), `${where}: five layers present`);
  check(/The Pulpit/.test(out), `${where}: the Pulpit`);
  check(/Little Lamp/.test(out), `${where}: the Little Lamp`);
  check(/Talk to someone/.test(out), `${where}: contact card`);
});

/* 9. contact + community */
console.log("9. Contact (the point of the whole thing)");
check(/^\+?\d{9,}/.test(api.CONTACT.phone.replace(/\s/g, "")), "phone configured");
check(/^\d{9,}$/.test(api.CONTACT.whatsapp), "whatsapp digits configured");
check(/^\d{9,}$/.test(api.CONTACT.telegram), "telegram digits configured");
const msg = api.CONTACT.msg("Test", "chapter 5, The Wilderness");
check(/Test/.test(msg) && /The Wilderness/.test(msg), "prefilled message names the pilgrim and place");
check(api.CONTACT.wa(msg).indexOf("wa.me/") >= 0, "WhatsApp link built");
check(api.CONTACT.tel().indexOf("tel:") === 0, "call link built");

/* 10. self-contained */
console.log("10. Offline (MAP \u00a711)");
const net = html.match(/src\s*=\s*"http|fetch\(|@import|cdn\.|unpkg|jsdelivr/g) || [];
check(net.length === 0, `no network references (found ${net.length})`);

console.log(`\n${C.length} chapters checked.`);
console.log(failures ? `${failures} FAILURES` : "ALL PASS");
process.exit(failures ? 1 : 0);
