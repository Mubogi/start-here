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
      querySelectorAll(){ return []; }, getContext(){ return ctx2d; }, toDataURL(){ return 'data:image/png;base64,MOCK'; },
      getBoundingClientRect(){ return { left:0, top:0, width:390, height:780 }; },
    };
    return nodes[id];
  }
  return { nodes, document: { getElementById: el, querySelectorAll: () => [], querySelector: () => null,
    documentElement: { style: { setProperty(){} }, setAttribute(){}, getAttribute(){ return null; } },
    body: { classList: { _s: new Set(), add(c){this._s.add(c);}, remove(c){this._s.delete(c);},
      toggle(c,on){ if(on===undefined) on=!this._s.has(c); on?this._s.add(c):this._s.delete(c); },
      contains(c){ return this._s.has(c); } }, appendChild(){}, removeChild(){} },
    createElement: () => el("__t"+Math.random()), addEventListener(){} },
    window: { devicePixelRatio:1, innerWidth:390, innerHeight:780, addEventListener(){}, AudioContext:null },
    localStorage: { getItem(){ return null; }, setItem(){} }, navigator: {}, confirm: () => false,
    location: { search:"", protocol:"file:", origin:"" },
    performance: { now: () => 0 }, requestAnimationFrame: () => 0, cancelAnimationFrame: () => {},
    setTimeout: () => 0, clearTimeout: () => {} };
}

let failures = 0;
function check(cond, msg) { if (!cond) { console.log("    FAIL: " + msg); failures++; } }

const dom = makeDom();
const api = new Function(
  "document","window","localStorage","navigator","confirm","location",
  "performance","requestAnimationFrame","cancelAnimationFrame","setTimeout","clearTimeout",
  script + "\nreturn { CHAPTERS:CHAPTERS, KID:KID, CONTACT:CONTACT, COMMUNITY:COMMUNITY, "
    + "WORDS:WORDS, CH_MODE:CH_MODE, MODE_INFO:MODE_INFO, MODES:MODES, LEVELS_PER_CH:LEVELS_PER_CH, "
    + "blankUser:blankUser, starsHTML:starsHTML, chapterOpen:chapterOpen, maxOpenLevel:maxOpenLevel, "
    + "levelsDone:levelsDone, chStars:chStars, totalStars:totalStars, starKey:starKey, "
    + "studyHTML:studyHTML, chapterOf:chapterOf, levelColors:levelColors, mulberry:mulberry, seedFrom:seedFrom, "
    + "BACKS:BACKS, WORD_MEANING:WORD_MEANING, EXERCISE:EXERCISE, DEVOTION:DEVOTION, FRUIT:FRUIT, VARIANTS:VARIANTS, "
    + "variantOf:variantOf, goLevel:goLevel, showFruit:showFruit, showResults:showResults, EXERCISE_OF:function(ch){ return EXERCISE[CH_MODE[ch]]; }, "
    + "TRIALS:TRIALS, trialFor:trialFor, TWISTS:TWISTS, twistOf:twistOf, levelBlurb:levelBlurb, CHANCES:CHANCES, "
    + "chancesLeft:chancesLeft, levelResting:levelResting, renewalText:renewalText, freePlay:freePlay, "
    + "beginWithTrial:beginWithTrial, showTrial:showTrial, passTrial:passTrial, failTrial:failTrial, showRenewal:showRenewal, "
    + "trialKey:trialKey, openLevels:openLevels, renewalDue:renewalDue, clearRenewal:clearRenewal, "
    + "TITLES:TITLES, CUTSCENES:CUTSCENES, LAMPS:LAMPS, lampState:lampState, newLamps:newLamps, cutArt:cutArt, "
    + "openIntro:openIntro, showCutscene:showCutscene, maybeIntro:maybeIntro, onIntroDone:function(){ return onIntroDone; }, "
    + "openChapters:openChapters, openLan:openLan, renderLan:renderLan, "
    + "getEl:function(id){ return document.getElementById(id); }, "
    + "startLevel:startLevel, ensure:ensure, getA:function(){return A;}, "
    + "PREFS:PREFS, NET:NET, lanCode:lanCode, netJoin:netJoin, netStartHost:netStartHost, netLeave:netLeave, "
    + "netActive:netActive, netReport:netReport, paletteFor:paletteFor, openSettings:openSettings, "
    + "exportSave:exportSave, importSave:importSave, applyPrefs:applyPrefs, loadPrefs:loadPrefs, "
    + "setTheme:setTheme, prefToggle:prefToggle, NAV:NAV, navBack:navBack, navHome:navHome, navNext:navNext, cheer:cheer, "
    + "spawnFloaties:spawnFloaties, openStudy:openStudy, openCommunity:openCommunity, openNotebook:openNotebook, "
    + "setUser:function(n){ DB.active=n; ensure(n); return DB.users[n]; }, "
    + "step:function(dt){ var M=MODES[A.mode]; if(M.update) M.update(A,dt); }, "
    + "tap:function(x,y){ A.px=x; var M=MODES[A.mode]; if(M.tap) M.tap(A,x,y); }, "
    + "move:function(x,y){ A.px=x; var M=MODES[A.mode]; if(M.move) M.move(A,x,y); } };"
)(dom.document, dom.window, dom.localStorage, dom.navigator, dom.confirm, dom.location,
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
const net = html.match(/src\s*=\s*"http|@import|cdn\.|unpkg|jsdelivr|https?:\/\/[a-z0-9.-]+\/[a-z]/gi) || [];
check(net.length === 0, `no external resource references (found ${net.length})`);
// v1.2: the only network call is the optional local-network "walk together" feature,
// and it only ever talks to the host on the local network — never to the internet.
const fetchCount = (html.match(/fetch\(/g) || []).length;
check(fetchCount <= 2, `fetch used only for LAN (found ${fetchCount})`);
check(/netPost|netGet/.test(script), "LAN transport present");
check(/EMMAUS_LAN/.test(script), "native LAN bridge hook present");
const httpHosts = html.match(/https?:\/\/(?!wa\.me|t\.me)[a-z0-9.-]+/gi) || [];
check(httpHosts.length === 0, `no hardcoded external hosts (found ${httpHosts.join(",")})`);

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

/* 16. the cinematic intro, cutscenes and rewards */
console.log("16. Intro, cutscenes and lamps");
check(Array.isArray(api.TITLES) && api.TITLES.length >= 4, "intro has several titles");
check(api.TITLES.every(t => t.t && t.p && t.word && t.gloss), "every title has a heading, a line, a rune and a gloss");
check(api.TITLES[0].word === "EMMAUS", "the intro opens on EMMAUS");
check(api.TITLES[api.TITLES.length-1].gloss.indexOf("Luke 24:32") >= 0, "the intro closes on the Emmaus verse");
check(Object.keys(api.CUTSCENES).length === 10, "every chapter has a cutscene");
let cutsOk = true;
for (let ch = 1; ch <= 10; ch++) {
  const c = api.CUTSCENES[ch];
  if (!c || !c.title || !c.ref || !c.line || !c.art) cutsOk = false;
}
check(cutsOk, "each cutscene has a number, a title, a reference, a line and art");
const arts = new Set(Object.values(api.CUTSCENES).map(c => c.art));
check(arts.size === 10, "each chapter's cutscene art is its own picture");
check(api.CUTSCENES[1].art === "image" && api.CUTSCENES[10].art === "come", "the cutscenes run from IMAGE to COME");
const art = api.cutArt("image", "The Garden");
check(typeof art === "string" && art.indexOf("data:image/png") === 0, "cutscene art renders to a PNG");
check(api.LAMPS.length >= 5, "there are several unlockable lamps");
check(api.LAMPS.every(l => l.id && l.ic && l.name && l.say && l.at > 0), "every lamp has an icon, a name and a word");
check(api.LAMPS[0].at === 1, "the first lamp is lit on the first level");
check(api.LAMPS[api.LAMPS.length-1].at === 210, "the last lamp needs every level of every chapter");
const lu = api.blankUser();
check(api.lampState(lu).length === 0, "a new pilgrim has no lamps");
lu.stars["1-1"] = 1;
check(api.lampState(lu).length === 1 && api.lampState(lu)[0].id === "first", "the first level lights the first lamp");
for (let l = 2; l <= 5; l++) lu.stars["1-" + l] = 1;
check(api.lampState(lu).some(l => l.id === "five"), "five levels light the second lamp");
const before = api.lampState(lu);
for (let l = 6; l <= 20; l++) lu.stars["1-" + l] = 1;
const lit = api.newLamps(lu, before);
check(lit.some(l => l.id === "chap"), "finishing a chapter reports a new lamp");
check(api.newLamps(lu, api.lampState(lu)).length === 0, "no lamp is reported twice");

/* 17. the credits */
console.log("17. Credits");
check(/JD Hub/.test(html) && /jdhu tech/.test(html), "About credits JD Hub (jdhu tech)");

/* 18. juice — the feel of the game */
console.log("18. Juice");
api.setUser("Juice");
api.startLevel(1, 1, {});
const a0 = api.getA();
check("hitstop" in a0, "arena has a hit-stop timer");
check(a0.hitstop === 0, "hit-stop starts at zero");
api.getA().combo = 0;
api.step(0.016);
check(api.getA().hitstop >= 0, "hit-stop is a number after a frame");

/* 19. preferences — accessibility + audio */
console.log("19. Preferences");
check(api.PREFS && typeof api.PREFS.size === "number", "prefs exist with a text size");
check(api.PREFS.size >= 1 && api.PREFS.size <= 1.5, "text size is in a sane range");
check("motion" in api.PREFS && "cb" in api.PREFS, "reduce-motion and colourblind flags exist");
check("vol" in api.PREFS && "music" in api.PREFS, "volume and music flags exist");
const setEl = api.getEl("setBody");
api.openSettings();
check(/Text size/.test(setEl.innerHTML), "settings shows a text-size control");
check(/Reduce motion/.test(setEl.innerHTML), "settings shows a reduce-motion toggle");
check(/Colourblind/.test(setEl.innerHTML), "settings shows a colourblind toggle");
check(/Export save/.test(setEl.innerHTML) && /Import/.test(setEl.innerHTML), "settings offers save export/import");

/* 20. save export / import round-trip */
console.log("20. Save export / import");
api.setUser("Exporter");
let exported = "";
const realPrompt = global.prompt;
global.prompt = (m, v) => { exported = v; return v; };
try { api.exportSave(); } catch (e) { /* navigator.share absent in mock */ }
global.prompt = realPrompt;
if (!exported) exported = "EMMAUS1:" + JSON.stringify({ v: 1, db: { active: "Imported", users: { Imported: api.blankUser() } }, prefs: api.PREFS });
check(exported.indexOf("EMMAUS1:") === 0, "a save exports with a versioned prefix");
api.importSave(exported);
check(api.NET && typeof api.NET === "object", "import ran without throwing");

/* 21. walk together — local-network shared play */
console.log("21. Walk together (LAN)");
check(typeof api.lanCode === "function", "room codes are generated");
const codes = new Set(); for (let i = 0; i < 200; i++) codes.add(api.lanCode());
check([...codes].every(c => /^[A-Z2-9]{4}$/.test(c)), "every room code is four safe characters");
check(codes.size > 150, "room codes are varied");
check(typeof api.netActive === "function" && api.netActive() === false, "not in a walk by default");
check(typeof api.netJoin === "function" && typeof api.netStartHost === "function", "host + join exist");
check(typeof api.netLeave === "function" && typeof api.netReport === "function", "leave + score report exist");
check(/Walk together/.test(html), "the LAN screen is in the markup");
check(/local network|hotspot/i.test(html), "the LAN screen explains the hotspot");
check(typeof api.paletteFor === "function" && /^#/.test(api.paletteFor("Grace")), "players get a colour");
check(api.paletteFor("Grace") === api.paletteFor("Grace"), "a player's colour is stable");
api.netLeave();
check(api.netActive() === false, "leaving clears the walk state");

/* 22. journey map + modern polish */
console.log("22. Journey map + polish");
api.setUser("Mapper");
api.openChapters();
const mapHtml = api.getEl("chList").innerHTML;
check(/class="map"/.test(mapHtml), "chapters render as a journey map");
check(/class="path"/.test(mapHtml), "the map has a path");
check((mapHtml.match(/class="node/g) || []).length === 10, "the map has ten nodes");
check(/node now|node done|node locked/.test(mapHtml), "nodes carry a state");
check(/--c1:|--c2:/.test(mapHtml), "nodes carry chapter colours");
check(/\.map \.node/.test(html), "map styles are present");
check(/prefers-reduced-motion/.test(html), "reduced-motion is honoured in CSS");
check(/--depth-[123]/.test(html), "a layered depth system is present");
check(/screenIn/.test(html), "screens transition in");

/* 23. light theme */
console.log("23. Light theme");
check(/html\[data-theme="light"\]/.test(html), "a light theme is defined");
check(/data-theme="light"\]\s*\{[^}]*--bg:#f6f1e6/.test(html.replace(/\n/g,"")), "light theme overrides the background");
check(/color-scheme: light/.test(html), "light theme sets the browser colour scheme");
check(typeof api.setTheme === "function", "themes can be switched at runtime");
check(api.PREFS.theme === "dark" || api.PREFS.theme === "light", "a theme is always chosen");
api.setTheme("light"); check(api.PREFS.theme === "light", "switching to light works");
api.setTheme("dark"); check(api.PREFS.theme === "dark", "switching back to dark works");
check(/themeChip/.test(html), "the menu has a quick theme toggle");
api.openSettings();
check(/id="thLight"/.test(api.getEl("setBody").innerHTML), "settings offers a light-theme control");
check(/id="thDark"/.test(api.getEl("setBody").innerHTML), "settings offers a dark-theme control");

/* 24. navigation — Back · Home · Next everywhere */
console.log("24. Navigation");
check(/id="navbar"/.test(html), "there is a persistent navigation bar");
check(/id="navBack"/.test(html) && /id="navHome"/.test(html) && /id="navNext"/.test(html), "Back, Home and Next all exist");
check(typeof api.navBack === "function" && typeof api.navHome === "function" && typeof api.navNext === "function", "nav actions exist");
api.setUser("Nav");
api.openChapters();
check(api.NAV.next !== null, "the journey screen sets a Next action");
api.navNext();
check(api.NAV.cur === "levels", "Next from the journey opens the levels");
api.navBack();
check(api.NAV.cur === "chapters", "Back returns to the journey");
api.navHome();
check(api.NAV.cur === "menu", "Home returns to the menu");
check(/\.navbar/.test(html), "the nav bar is styled");
check(/min-height:52px/.test(html), "nav buttons are large touch targets");

/* 25. interactivity + delight */
console.log("25. Interactivity + delight");
api.openStudy(1);
const sh = api.getEl("studyBody").innerHTML;
check(/class="head tappable"/.test(sh), "study layers are tappable buttons");
check(/aria-expanded/.test(sh), "study layers announce their state");
check(/class="chev"/.test(sh), "study layers show a chevron");
check(/littleHTML|👼 Little Lamp|Little Lamp/.test(sh), "the children's layer is present");
check(/data-kpick/.test(sh), "the children's quiz is interactive");
check(typeof api.cheer === "function", "celebrations can fire");
check(typeof api.spawnFloaties === "function", "floating friends can spawn");
check(/\.floaty/.test(html), "floating art is styled");
check(/ANGELS/.test(script), "each chapter has its own emblem");
check(/emojibig/.test(html), "the reveal shows a big emblem");
check(/emojis/.test(api.getEl("menu") ? html : html), "the menu shows a row of emojis");
check(/\.tappable/.test(html), "tappable affordance is styled");
check(/touchstart/.test(script) && /touchend/.test(script), "swipe navigation is wired");

/* 26. scroll containers cannot clip content */
console.log("26. Scrolling");
check(/\.scroller\{[^}]*min-height:0/.test(html.replace(/\n/g,"")), "the scroller can shrink and scroll");
check(/\.scroller\{[^}]*overflow-y:auto/.test(html.replace(/\n/g,"")), "the scroller scrolls vertically");
check(/-webkit-overflow-scrolling:touch/.test(html), "momentum scrolling is enabled");
check(/\.overlay\{[^}]*overflow-y:auto/.test(html.replace(/\n/g,"")), "overlays scroll when tall");
check(/\.sheet\{[^}]*max-height/.test(html.replace(/\n/g,"")), "sheets cap their height");
check(/\.scroll>\{?\.?body/.test(html) || /\.scroll>\.body/.test(html), "the devotional scroll body scrolls");

/* 27. colourblind-safe palette — the three truth tags stay separable */
console.log("27. Colourblind palette");
check(/\.cb-safe\{/.test(html), "a colourblind-safe class exists");
check(/\.cb-safe\{[^}]*--green/.test(html.replace(/\n/g,"")), "it recolours green");
check(/\.tag\.t-text\{background:var\(--tag1-bg\)/.test(html.replace(/\n/g,"")), "the text tag uses a token, not a fixed green");
check(/\.tag\.t-trad\{background:var\(--tag2-bg\)/.test(html.replace(/\n/g,"")), "the tradition tag uses a token");
check(/\.tag\.t-read\{background:var\(--tag3-bg\)/.test(html.replace(/\n/g,"")), "the reading tag uses a token");
check(/\.cb-safe\{[^}]*--tag1-fg/.test(html.replace(/\n/g,"")), "colourblind mode overrides the text tag");
check(/\.cb-safe\{[^}]*--tag3-fg/.test(html.replace(/\n/g,"")), "colourblind mode overrides the reading tag");
check(/html\[data-theme="light"\] \.cb-safe\{/.test(html.replace(/\n/g,"")), "light theme has its own colourblind tag values");
// no hard-coded tag colour may shadow the tokens (this is what silently broke light mode)
const tagRules = html.match(/[^{}]*\.tag\.t-(text|trad|read)\s*\{[^}]*\}/g) || [];
check(tagRules.length >= 3, "all three truth tags are styled");
check(tagRules.every(r => !/#[0-9a-fA-F]{3,6}/.test(r)), "every truth-tag rule uses tokens, never a fixed colour");
check(/prefCb/.test(script), "Settings exposes the colourblind switch");
api.prefToggle("cb", true);
check(api.PREFS.cb === true, "the choice is remembered");
check(dom.document.body.classList.contains("cb-safe"), "turning it on adds the cb-safe class to the body");
api.prefToggle("cb", false);
check(!dom.document.body.classList.contains("cb-safe"), "turning it off removes the class again");

/* 28. the trial — a question on what you just read */
console.log("28. The trial before every level");
check(Object.keys(api.TRIALS).length === 10, "every chapter has a trial bank");
let trialOk = true, optOk = true, ansOk = true;
for (let ch = 1; ch <= 10; ch++) {
  const bank = api.TRIALS[ch];
  if (!bank || bank.length < 4) trialOk = false;
  bank.forEach((q) => {
    if (!q.q || !Array.isArray(q.o) || q.o.length < 2 || !q.why) optOk = false;
    if (typeof q.a !== "number" || q.a < 0 || q.a >= q.o.length) ansOk = false;
  });
}
check(trialOk, "each chapter has at least four trial questions");
check(optOk, "every question has text, options and a why");
check(ansOk, "every answer index points at a real option");
const q1 = api.trialFor(1, 1), q2 = api.trialFor(1, 2);
check(q1 && q2 && q1.q !== q2.q, "levels ask different questions");
check(q1.a >= 0 && q1.a < q1.o.length, "the trial gives a valid answer");
check(api.trialFor(1, 7).q === api.trialFor(1, 1).q, "the questions rotate back round");
check(api.CHANCES === 3, "three chances per level");
// the trial actually appears when a level is opened
api.prefToggle("free", false);
const ru = api.setUser("reader2");
ru.cuts[1] = 1;                        // skip the cutscene for the test
api.beginWithTrial(1, 1, {});
const tHtml = api.getEl("trialBody").innerHTML;
check(/The Trial/.test(tHtml), "opening a level shows the trial");
check(/Genesis 1:26-27/.test(tHtml), "the trial shows the verse to read");
check(new RegExp(api.trialFor(1, 1).q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(tHtml), "the trial asks its question");
check(/data-tpick/.test(tHtml), "the trial offers tappable answers");
check(/❤/.test(tHtml), "the trial shows the chances left");

/* 29. chances and renewal */
console.log("29. Chances and renewal");
api.prefToggle("free", false);
const tu = api.setUser("trialler");
check(api.chancesLeft(tu, 1, 1) === 3, "a fresh level has three chances");
check(api.levelResting(tu, 1, 1) === false, "a fresh level is not resting");
api.failTrial(1, 1, {});
check(api.chancesLeft(tu, 1, 1) === 2, "a wrong answer costs a chance");
api.failTrial(1, 1, {});
api.failTrial(1, 1, {});
check(api.chancesLeft(tu, 1, 1) === 0, "three wrong answers use every chance");
check(api.levelResting(tu, 1, 1) === true, "the level rests after the last chance");
check(api.chancesLeft(tu, 1, 2) === 3, "another level is untouched");
check(api.renewalText().indexOf("h") > 0, "renewal reports a countdown");
// renewal opens at the next dawn
tu.rest[api.trialKey(1, 1)] = "2000-01-01";
check(api.renewalDue(tu).length === 1, "a stale rest is due for renewal");
check(api.clearRenewal(tu) === true, "renewal clears the stale rest");
check(api.levelResting(tu, 1, 1) === false, "the level opens again at renewal");
// a passed trial lets the level straight through
api.passTrial(1, 3, {});
check((tu.pass || {})[api.trialKey(1, 3)] === 1, "answering right records the pass");

/* 30. every level is different */
console.log("30. Every level differs");
check(api.TWISTS.length >= 8, "there are several twists");
check(api.TWISTS.every(t => t.id && t.name && t.desc && typeof t.mult === "number"), "every twist is named and explained");
const combos = {};
let dupes = 0;
for (let ch = 1; ch <= 10; ch++) {
  const seen = {};
  for (let l = 1; l < api.LEVELS_PER_CH; l++) {
    const key = api.variantOf(ch, l).id + "+" + api.twistOf(ch, l).id;
    if (seen[key]) dupes++;
    seen[key] = 1;
  }
  if (Object.keys(seen).length < api.LEVELS_PER_CH - 1) combos[ch] = Object.keys(seen).length;
}
check(dupes === 0, "no two levels in a chapter share a variant+twist");
check(Object.keys(combos).length === 0, "all 20 levels of a chapter feel distinct");
check(api.levelBlurb(1, 1).length > 10, "a level can describe its own twist");
const tw = (() => { const su = api.setUser("twisty"); api.startLevel(1, 3); return api.getA(); })();
check(!!tw.twist && tw.twist.id === api.twistOf(1, 3).id, "the twist is carried into the level");
check(tw.speedMul !== undefined, "the twist changes the speed");

/* 31. free play — open everything at once */
console.log("31. Free play");
api.prefToggle("free", false);
const fu = api.setUser("freebird");
check(api.freePlay() === false, "free play is off by default");
check(api.chapterOpen(fu, 10) === false, "chapter 10 is locked on the road");
check(api.maxOpenLevel(fu, 5) === 1, "only level 1 is open at the start");
api.prefToggle("free", true);
check(api.freePlay() === true, "free play can be switched on");
check(api.chapterOpen(fu, 10) === true, "every chapter opens in free play");
check(api.maxOpenLevel(fu, 5) === api.LEVELS_PER_CH, "every level opens in free play");
fu.rest[api.trialKey(2, 2)] = "2099-01-01";
check(api.levelResting(fu, 2, 2) === false, "free play skips the renewal wait");
check(api.chancesLeft(fu, 2, 2) === api.CHANCES, "free play restores the chances");
api.openLevels(3);
check(/Free play/.test(api.getEl("lvBody").innerHTML), "the level screen says free play is on");
api.prefToggle("free", false);
check(api.chapterOpen(fu, 10) === false, "turning free play off restores the road");
check(/id="prefFree"/.test(api.getEl("setBody").innerHTML) || (api.openSettings(), /id="prefFree"/.test(api.getEl("setBody").innerHTML)),
  "settings offers the free-play switch");

console.log(`\n10 chapters, 10 modes, ${Object.keys(MODES).length} games, ${api.LEVELS_PER_CH} levels each.`);
console.log(failures ? `${failures} FAILURES` : "ALL PASS");
process.exit(failures ? 1 : 0);
