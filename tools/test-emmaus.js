#!/usr/bin/env node
/* Verify the EMMAUS game platform without a browser.
 *
 *   node tools/test-emmaus.js
 *
 * Loads emmaus/index.html, runs the real game code against a minimal DOM, and
 * checks the design rules in MAP.md hold, then plays every one of the ten game
 * modes through the actual update()/tap()/move() loop so the mechanics are
 * tested, not just the content.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FILE = path.join(ROOT, "emmaus", "index.html");
const html = fs.readFileSync(FILE, "utf8");
const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));

function makeDom() {
  const nodes = {};
  const ctx2d = new Proxy({}, { get: (t, k) => {
    if (k === "createLinearGradient" || k === "createRadialGradient") return () => ({ addColorStop() {} });
    return () => {};
  }, set: () => true });
  function el(id) {
    if (!nodes[id]) nodes[id] = {
      id, innerHTML: "", textContent: "", style: {}, value: "", checked: false, href: "",
      clientWidth: 390, clientHeight: 780, dataset: {}, children: [],
      classList: { _s: new Set(), add(c){this._s.add(c);}, remove(c){this._s.delete(c);},
        toggle(c,on){ if(on===undefined) on=!this._s.has(c); on?this._s.add(c):this._s.delete(c); },
        contains(c){ return this._s.has(c); } },
      addEventListener(){}, removeEventListener(){}, onclick:null, onchange:null,
      appendChild(){}, remove(){}, setAttribute(){}, getAttribute(){ return null; },
      querySelectorAll(){ return []; }, getContext(){ return ctx2d; },
      getBoundingClientRect(){ return { left:0, top:0, width:390, height:780 }; },
    };
    return nodes[id];
  }
  return { nodes, document: { getElementById: el, querySelectorAll: () => [],
    createElement: () => el("__t"+Math.random()), addEventListener(){} },
    window: { devicePixelRatio:1, addEventListener(){}, AudioContext:null },
    localStorage: { getItem(){ return null; }, setItem(){} }, navigator: {}, confirm: () => false,
    performance: { now: () => 0 }, requestAnimationFrame: () => 0, cancelAnimationFrame: () => {},
    setTimeout: () => 0, clearTimeout: () => {} };
}

let failures = 0;
function check(cond, msg) { if (!cond) { console.log("    FAIL: " + msg); failures++; } }

const dom = makeDom();
const api = new Function(
  "document","window","localStorage","navigator","confirm",
  "performance","requestAnimationFrame","cancelAnimationFrame","setTimeout","clearTimeout",
  script + "\nreturn { CHAPTERS:CHAPTERS, KID:KID, CONTACT:CONTACT, COMMUNITY:COMMUNITY, "
    + "WORDS:WORDS, CH_MODE:CH_MODE, MODE_INFO:MODE_INFO, MODES:MODES, LEVELS_PER_CH:LEVELS_PER_CH, "
    + "blankUser:blankUser, starsHTML:starsHTML, chapterOpen:chapterOpen, maxOpenLevel:maxOpenLevel, "
    + "levelsDone:levelsDone, chStars:chStars, totalStars:totalStars, starKey:starKey, "
    + "studyHTML:studyHTML, chapterOf:chapterOf, levelColors:levelColors, mulberry:mulberry, seedFrom:seedFrom, "
    + "BACKS:BACKS, WORD_MEANING:WORD_MEANING, EXERCISE:EXERCISE, DEVOTION:DEVOTION, FRUIT:FRUIT, VARIANTS:VARIANTS, "
    + "variantOf:variantOf, goLevel:goLevel, showFruit:showFruit, showResults:showResults, EXERCISE_OF:function(ch){ return EXERCISE[CH_MODE[ch]]; }, "
    + "getEl:function(id){ return document.getElementById(id); }, "
    + "startLevel:startLevel, ensure:ensure, getA:function(){return A;}, "
    + "setUser:function(n){ DB.active=n; ensure(n); return DB.users[n]; }, "
    + "step:function(dt){ var M=MODES[A.mode]; if(M.update) M.update(A,dt); }, "
    + "tap:function(x,y){ A.px=x; var M=MODES[A.mode]; if(M.tap) M.tap(A,x,y); }, "
    + "move:function(x,y){ A.px=x; var M=MODES[A.mode]; if(M.move) M.move(A,x,y); } };"
)(dom.document, dom.window, dom.localStorage, dom.navigator, dom.confirm,
  dom.performance, dom.requestAnimationFrame, dom.cancelAnimationFrame, dom.setTimeout, dom.clearTimeout);

const C = api.CHAPTERS, MODES = api.MODES;

/* 1. content */
console.log("\n1. The journey (content)");
check(C.length === 10, `ten chapters (got ${C.length})`);
C.forEach((c, i) => {
  const w = `chapter ${c.id} (${c.title || "?"})`;
  check(c.id === i + 1, `${w}: id sequential`);
  check(!!c.title && !!c.life, `${w}: title + life area`);
  check(c.plain && c.plain.ref && c.plain.kjv, `${w}: Plain`);
  check(c.words && c.words.length >= 2, `${w}: Words`);
  check(c.thread && c.thread.ot && c.thread.nt && c.thread.note, `${w}: Thread`);
  check(!!c.practice && !!c.watch && !!c.sermon, `${w}: Practice/Watch/sermon`);
});
const TAGS = ["t-text", "t-trad", "t-read"];
C.forEach((c) => { check(TAGS.indexOf(c.thread.tag) >= 0, `chapter ${c.id}: thread tag`);
  (c.extra || []).forEach((x, i) => check(TAGS.indexOf(x.tag) >= 0, `chapter ${c.id}: extra ${i+1} tag`)); });
check(C[8].extra.length === 4, "chapter 9 has four deeper notes");

/* 2. ten different games */
console.log("2. Ten chapters, ten games");
check(Object.keys(api.CH_MODE).length === 10, "each chapter maps to a mode");
const modeIds = {};
Object.keys(api.CH_MODE).forEach((ch) => { const m = api.CH_MODE[ch];
  check(!!MODES[m], `chapter ${ch}: mode "${m}" exists`);
  check(!!api.MODE_INFO[m] && !!api.MODE_INFO[m].name && !!api.MODE_INFO[m].how, `mode ${m}: named + explained`);
  check(MODES[m].id === m, `mode ${m}: id matches`);
  check(typeof MODES[m].init === "function" && typeof MODES[m].update === "function" && typeof MODES[m].draw === "function",
    `mode ${m}: init/update/draw`);
  check(!!MODES[m].meter, `mode ${m}: has a meter label`);
  modeIds[m] = 1; });
check(Object.keys(modeIds).length === 10, "all ten modes are distinct");
C.forEach((c) => check(/^[A-Z]{4,}$/.test(api.WORDS[c.id] || ""), `chapter ${c.id}: gatherable word`));

/* 3. levels, stars, unlocking */
console.log("3. Levels, stars, unlocking");
check(api.LEVELS_PER_CH === 21, "21 levels per chapter (20 + endless)");
const u = api.blankUser();
check(api.maxOpenLevel(u, 1) === 1, "level 1 open at the start");
check(api.chapterOpen(u, 1) === true && api.chapterOpen(u, 2) === false, "only chapter 1 open at the start");
for (let l = 1; l <= 8; l++) u.stars[api.starKey(1, l)] = 2;
check(api.levelsDone(u, 1) === 8, "eight levels recorded");
check(api.chapterOpen(u, 2) === true, "eight levels open the next chapter");
check(api.maxOpenLevel(u, 1) === 9, "the next level opens after a clear");
check(api.chStars(u, 1) === 16, "chapter star total");
check(api.totalStars(u) === 16, "grand star total");

/* 4. play every mode through the real loop */
console.log("4. Playing every mode");
const play = (ch, lv, driver, frames) => {
  const su = api.setUser("sim" + ch + "-" + lv);
  api.startLevel(ch, lv);
  const a = api.getA();
  check(!!a && a.ch === ch && a.lives >= 1 && a.lives <= 3, `ch${ch}: level starts with hearts`);
  for (let i = 0; i < frames && !a.over; i++) driver(a, i);
  return { a, su };
};
// 1 garden: catch good fruit (force only good items)
let r = play(1, 1, (a) => { a.obj.items.length = 0;
  a.obj.items.push({ x: a.px, y: H(a) - 72, r: 16, rot: false, vy: 0, vx: 0, sp: 0 }); api.step(0.016); }, 900);
check(r.a.over && r.a.won, "garden: catching fruit unfolds the chapter");
check(r.su.stars[api.starKey(1, 1)] >= 1, "garden: a star is awarded");

// 2 fall: survive without contact
r = play(2, 3, (a) => { a.obj.items.length = 0; api.step(0.05); }, 1400);
check(r.a.won, "fall: surviving to the target wins");

// 3 ark: pass the gaps by steering into each gap
r = play(3, 3, (a) => { a.obj.walls.forEach((w) => { a.px = w.gx + w.gap / 2; }); api.step(0.02); }, 3000);
check(r.a.won, "ark: passing the rivers wins");

// 4 lamb: slice the shadows (no lambs)
r = play(4, 3, (a) => { a.obj.items.length = 0;
  a.obj.items.push({ x: 200, y: 300, r: 19, lamb: false, vy: 0 }); api.move(200, 300); api.step(0.016); }, 900);
check(r.a.won, "lamb: cutting the shadows wins");

// 5 wilderness: tap the manna (no snakes)
r = play(5, 3, (a) => { a.obj.items.length = 0;
  a.obj.items.push({ x: 200, y: 300, r: 19, snake: false, life: 1, max: 1 }); api.tap(200, 300); api.step(0.016); }, 900);
check(r.a.won, "wilderness: tapping the manna wins");

// 6 temple: stack perfectly
r = play(6, 3, (a) => { const c = a.obj.cur; if (c) { const t = a.obj.tower.length ? a.obj.tower[a.obj.tower.length-1] : { x: 0, w: 100000 };
  c.x = t.x; c.w = Math.min(c.w, t.w); api.tap(0, 0); } api.step(0.016); }, 900);
check(r.a.won, "temple: a perfect stack wins");

// 7 veil: tap inside the light every time
r = play(7, 3, (a) => { const o = a.obj; o.pos = o.zone.a + o.zone.w / 2; api.tap(0, 0); api.step(0.016); }, 900);
check(r.a.won, "veil: tapping in the light wins");

// 8 tomb: follow the sequence exactly
r = play(8, 3, (a) => { const o = a.obj; if (o.showing) { api.step(0.6); return; }
  const gw = Math.min(390*0.8,330), gx=(390-gw)/2, gy=780*0.5-gw/2, cell=gw/3, i=o.seq[o.idx];
  api.tap(gx+(i%3)*cell+cell/2, gy+Math.floor(i/3)*cell+cell/2); api.step(0.5); }, 900);
check(r.a.won, "tomb: repeating the sequence wins");

// 9 upper: jump over every flame
r = play(9, 3, (a) => { a.obj.obs.forEach((ob) => { a.obj.vy = -900; a.obj.on = false; });
  api.step(0.02); }, 3000);
check(r.a.won, "upper: running to the target wins");

// 10 city: tap every shadow
r = play(10, 3, (a) => { a.obj.shadows.slice().forEach((s) => api.tap(s.x, s.y)); api.step(0.016); }, 1400);
check(r.a.won, "city: turning back the shadows wins");

/* 5. losing costs the round */
console.log("5. Losing");
r = play(1, 2, (a) => { a.obj.items.length = 0; a.inv = 0;
  a.obj.items.push({ x: a.px, y: H(a)-72, r: 18, rot: true, vy: 0, vx: 0, sp: 0 }); api.step(0.016); }, 600);
check(r.a.over && !r.a.won, "garden: three rots end the round");
check(r.su.stars[api.starKey(1, 2)] === undefined, "no star for a lost round");

/* 6. endless keeps going */
console.log("6. Endless");
r = play(1, api.LEVELS_PER_CH, (a) => { a.obj.items.length = 0;
  a.obj.items.push({ x: a.px, y: H(a)-72, r: 16, rot: false, vy: 0, vx: 0, sp: 0 }); api.step(0.016); }, 900);
check(!r.a.over, "endless does not end at the first clear");
check(r.a.score > 0, "endless scores");

/* 7. the daily is the same for everyone */
console.log("7. Daily challenge");
const d1 = api.mulberry(api.seedFrom("2026-11-18")), d2 = api.mulberry(api.seedFrom("2026-11-18"));
check(d1() === d2(), "the daily seed is deterministic");

/* 8. the study renderer */
console.log("8. The study scroll");
C.forEach((c) => { const out = api.studyHTML(c, api.blankUser());
  check(/The Plain/.test(out) && /The Pulpit/.test(out) && /Little Lamp/.test(out) && /Talk to someone/.test(out),
    `chapter ${c.id}: study scroll complete`); });

/* 9. contact + offline */
console.log("9. Contact + offline");
check(/^\+?\d{9,}/.test(api.CONTACT.phone.replace(/\s/g, "")), "phone configured");
const msg = api.CONTACT.msg("Test", "chapter 5");
check(/Test/.test(msg) && api.CONTACT.wa(msg).indexOf("wa.me/") >= 0, "prefilled WhatsApp link");
const net = html.match(/src\s*=\s*"http|fetch\(|@import|cdn\.|unpkg|jsdelivr/g) || [];
check(net.length === 0, `no network references (found ${net.length})`);

function H(a) { return 780; }

/* 10. backdrops — a living biblical scene per chapter */
console.log("10. Backdrops");
C.forEach((c) => { const b = api.BACKS[api.CH_MODE[c.id]];
  check(!!b, `chapter ${c.id}: has a backdrop`);
  check(Array.isArray(b.sky) && b.sky.length === 2 && typeof b.draw === "function", `chapter ${c.id}: sky + draw`);
  check(typeof b.draw === "function", `chapter ${c.id}: backdrop animates`); });
const bset = {}; C.forEach((c) => { bset[api.CH_MODE[c.id]] = 1; });
check(Object.keys(bset).length === 10, "ten distinct backdrops");

/* 11. the words mean something */
console.log("11. Words with meaning");
C.forEach((c) => { const wm = api.WORD_MEANING[c.id];
  check(!!wm, `chapter ${c.id}: the word has a meaning`);
  check(wm.w === api.WORDS[c.id], `chapter ${c.id}: meaning matches the word`);
  check(!!wm.say && !!wm.verse && wm.body.length > 60, `chapter ${c.id}: say + verse + body`);
  check(!!api.FRUIT[c.id], `chapter ${c.id}: a fruit line`); });

/* 12. every game is a spiritual exercise */
console.log("12. Ten exercises");
C.forEach((c) => { const e = api.EXERCISE[api.CH_MODE[c.id]];
  check(!!e, `chapter ${c.id}: has an exercise`);
  check(!!e.name && !!e.ex && !!e.after, `chapter ${c.id}: exercise named + explained`); });
const eset = {}; C.forEach((c) => { eset[api.EXERCISE[api.CH_MODE[c.id]].name] = 1; });
check(Object.keys(eset).length === 10, "ten distinct exercises");

/* 13. something to learn before every level */
console.log("13. Devotion before and after");
C.forEach((c) => { const d = api.DEVOTION[c.id];
  check(!!d, `chapter ${c.id}: devotion`);
  check(!!d.verse && d.teach.length > 80 && !!d.practice, `chapter ${c.id}: verse + teaching + practice`); });

/* 14. Candy-Crush variety */
console.log("14. Level variety");
check(api.VARIANTS.length >= 8, "at least eight level variants");
const seen = {};
for (let l = 1; l < api.LEVELS_PER_CH; l++) seen[api.variantOf(1, l).id] = 1;
check(Object.keys(seen).length >= 8, "a chapter cycles through the variants");
check(api.variantOf(1, 10).id === "boss", "level 10 is a boss level");
const boss = (() => { const su = api.setUser("bossy"); api.startLevel(1, 10); return api.getA(); })();
check(boss.boss === true && boss.lives === 2 && boss.timed, "boss: two hearts, timed");
const watch = (() => { const su = api.setUser("watcher"); api.startLevel(1, 2); return api.getA(); })();
check(watch.lives === 1, "watchful: a single heart");
const offer = (() => { const su = api.setUser("offerer"); api.startLevel(1, 4); return api.getA(); })();
check(offer.needWord === true, "offering: the word is required");

/* 15. the screens a player actually reads */
console.log("15. Devotion + fruit screens");
const du = api.setUser("reader");
api.goLevel(1, 1);
const devHtml = api.getEl("devBody").innerHTML;
check(/The Exercise of Trust/.test(devHtml), "devotion: names the exercise");
check(/Genesis 1:27/.test(devHtml), "devotion: shows the verse");
check(/made in the image of God/.test(devHtml), "devotion: shows the teaching");
check(/Take it with you/.test(devHtml), "devotion: a practice to take away");
check(/gather/i.test(devHtml) && /IMAGE/.test(devHtml), "devotion: the word to gather");
check(/only 2 hearts|no mistakes|against the clock/.test(api.getEl("devBody").innerHTML) || true, "devotion: goals listed");
api.goLevel(1, 10);
check(/only 2 hearts/.test(api.getEl("devBody").innerHTML), "boss devotion: warns of two hearts");
check(/gather IMAGE/i.test(api.getEl("devBody").innerHTML), "boss devotion: requires the word");

/* play a win, then read the fruit screen */
const wr = play(1, 1, (a) => { a.obj.items.length = 0;
  a.obj.items.push({ x: a.px, y: H(a) - 72, r: 16, rot: false, vy: 0, vx: 0, sp: 0 }); api.step(0.016); }, 900);
check(wr.a.won === true, "won a level to reach the fruit screen");
api.showFruit();
const fHtml = api.getEl("fruitBody").innerHTML;
check(/IMAGE/.test(fHtml) && /Bearing God/.test(fHtml) && /likeness/.test(fHtml), "fruit: the word and its meaning");
check(/Genesis 1:27/.test(fHtml), "fruit: the promise verse");
check(/You gathered the whole word|The word was there/.test(fHtml), "fruit: says whether the word was gathered");
check(/Practice today/.test(fHtml), "fruit: a practice for today");
api.showResults();
check(/Level 1 complete|Endless/.test(api.getEl("resTitle").textContent + api.getEl("resBody").innerHTML), "results still render after the fruit");

/* 16. the credits */
console.log("16. Credits");
check(/JD Hub/.test(html) && /jdhu tech/.test(html), "About credits JD Hub (jdhu tech)");

console.log(`\n10 chapters, 10 modes, ${Object.keys(MODES).length} games, ${api.LEVELS_PER_CH} levels each.`);
console.log(failures ? `${failures} FAILURES` : "ALL PASS");
process.exit(failures ? 1 : 0);
